import asyncio
from typing import List, Dict, Any, Optional

import httpx
from datetime import datetime, timezone, timedelta
import uuid

from app.core.logging_setup import logger
from app.core.config import settings
from app.utils.flow_tracker import FlowTracker
from app.clients.supabase_client import get_supabase
from app.services.vapi.business_hours import business_hours_service

class OutboundCallService:
    """Service for handling outbound calls using VAPI API"""
    
    VAPI_BASE_URL = "https://api.vapi.ai"
    MAX_CONCURRENT_CALLS = 10
    TEST_MODE = False  # Set to True for testing without making actual API calls
    
    @classmethod
    @FlowTracker.track_function()
    async def initiate_campaign_calls(
        cls, 
        campaign_id: str, 
        user_id: str,
        assistant_id: str,
        phone_number_id: str,
        max_calls: int = MAX_CONCURRENT_CALLS,
        force_outside_hours: bool = False
    ) -> Dict[str, Any]:
        """
        Initiate outbound calls for a campaign
        
        Args:
            campaign_id: ID of the campaign
            user_id: ID of the user who owns the campaign
            assistant_id: ID of the VAPI assistant to use for calls
            phone_number_id: ID of the phone number to use for calls
            max_calls: Maximum number of concurrent calls (default: 10)
            force_outside_hours: Whether to force calls outside business hours (default: False)
            
        Returns:
            Dictionary with results of the call initiation
        """
        # Ensure we have a valid flow ID
        flow_id = f"outbound_campaign_{campaign_id}"
        FlowTracker.start_flow(flow_id, f"Initiating outbound calls for campaign {campaign_id}")
        
        try:
            # Get campaign data
            supabase = await get_supabase()
            campaign_response = await supabase.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user_id).execute()
            
            if not campaign_response.data:
                logger.error(f"Campaign {campaign_id} not found for user {user_id}")
                return {"success": False, "error": "Campaign not found"}
            
            campaign = campaign_response.data[0]
            
            # Check business hours unless forced
            if not force_outside_hours:
                agent_details = campaign.get("agent_details", {})
                working_hours = agent_details.get("working_hours", {"start": "09:00", "end": "17:00"})
                timezone_str = "America/New_York"  # Default timezone
                
                if not business_hours_service.is_within_business_hours(working_hours, timezone_str):
                    # Get next business hours
                    next_open, next_day = business_hours_service.get_next_business_hours(working_hours, timezone_str)
                    
                    if next_open:
                        logger.info(f"Outside working hours. Next available time: {next_open} ({next_day})")
                        return {
                            "success": False, 
                            "error": "Outside working hours",
                            "next_available": next_open.isoformat(),
                            "next_day": next_day
                        }
                    else:
                        logger.warning(f"No working hours configured for campaign {campaign_id}")
                        return {"success": False, "error": "No working hours configured"}
            
            # Continue with the existing implementation
            clients = campaign.get("clients", [])
            agent_details = campaign.get("agent_details", {})
            
            # Get retry configuration
            max_retries = agent_details.get("number_of_retries", 3)  # Default to 3 retries
            cool_off_hours = agent_details.get("cool_off", 1)  # Default to 1 hour cool-off
            
            logger.info(f"Campaign retry config: max_retries={max_retries}, cool_off_hours={cool_off_hours}")
            
            if not clients:
                logger.warning(f"No clients found in campaign {campaign_id}")
                return {"success": False, "error": "No clients found in campaign"}
            
            # Current time for retry checks
            current_time = datetime.now(timezone.utc)
            
            # Filter clients that are eligible for calling:
            # 1. Status is 'queued' OR
            # 2. Status is 'retry' AND retry_at time has passed AND number_of_calls < max_retries
            eligible_clients = []
            for client in clients:
                status = client.get("status", {})
                status_value = status.get("status", "queued")
                number_of_calls = status.get("number_of_calls", 0)
                retry_at_str = status.get("retry_at")
                
                # Parse retry_at if it exists
                retry_at = None
                if retry_at_str:
                    try:
                        # Handle both string and datetime objects
                        if isinstance(retry_at_str, str):
                            retry_at = datetime.fromisoformat(retry_at_str.replace('Z', '+00:00'))
                        else:
                            retry_at = retry_at_str
                    except (ValueError, TypeError):
                        logger.warning(f"Invalid retry_at format: {retry_at_str}")
                
                # Check eligibility
                if status_value == "queued":
                    eligible_clients.append(client)
                elif status_value == "retry" and number_of_calls < max_retries:
                    if not retry_at or current_time >= retry_at:
                        eligible_clients.append(client)
            
            if not eligible_clients:
                logger.warning(f"No eligible clients found in campaign {campaign_id}")
                return {"success": False, "error": "No eligible clients found in campaign"}
            
            # Limit the number of calls
            clients_to_call = eligible_clients[:min(len(eligible_clients), max_calls)]
            logger.info(f"Initiating calls for {len(clients_to_call)} clients in campaign {campaign_id}")
            
            # Initiate calls
            results = await cls._batch_initiate_calls(
                clients_to_call, 
                campaign_id,
                assistant_id,
                phone_number_id
            )
            
            # Update campaign with call results
            updated_clients = cls._update_client_statuses(
                clients, 
                results, 
                max_retries=max_retries, 
                cool_off_hours=cool_off_hours
            )
            
            await supabase.table("campaigns").update({"clients": updated_clients}).eq("id", campaign_id).execute()
            
            # Return results
            success_count = sum(1 for r in results if r.get("success", False))
            failed_count = len(results) - success_count
            
            FlowTracker.track_step("campaign_calls_completed", {
                "flow_id": flow_id,
                "total_calls": len(results),
                "success_count": success_count,
                "failed_count": failed_count
            })
            
            return {
                "success": True,
                "total_calls": len(results),
                "success_count": success_count,
                "failed_count": failed_count,
                "call_details": results
            }
            
        except Exception as e:
            logger.error(f"Error initiating campaign calls: {str(e)}", exc_info=True)
            return {"success": False, "error": f"Failed to initiate calls: {str(e)}"}
        finally:
            # Always end the flow
            FlowTracker.end_flow(flow_id)
    
    @classmethod
    async def _batch_initiate_calls(
        cls,
        clients: List[Dict[str, Any]],
        campaign_id: str,
        assistant_id: str,
        phone_number_id: str
    ) -> List[Dict[str, Any]]:
        """
        Initiate calls for multiple clients in parallel
        
        Args:
            clients: List of client objects to call
            campaign_id: ID of the campaign
            assistant_id: ID of the VAPI assistant to use
            phone_number_id: ID of the phone number to use
            
        Returns:
            List of results for each call attempt
        """
        tasks = []
        for client in clients:
            task = cls._initiate_single_call(
                client=client,
                campaign_id=campaign_id,
                assistant_id=assistant_id,
                phone_number_id=phone_number_id
            )
            tasks.append(task)
        
        # Run calls in parallel with a semaphore to limit concurrency
        semaphore = asyncio.Semaphore(5)  # Limit to 5 concurrent API calls
        
        async def bounded_call(coro):
            async with semaphore:
                return await coro
        
        bounded_tasks = [bounded_call(task) for task in tasks]
        results = await asyncio.gather(*bounded_tasks, return_exceptions=True)
        
        # Process results, converting exceptions to error responses
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    "success": False,
                    "client_index": i,
                    "phone_number": clients[i].get("phone_number"),
                    "error": str(result)
                })
            else:
                processed_results.append(result)
        
        return processed_results
    
    @classmethod
    async def _initiate_single_call(
        cls,
        client: Dict[str, Any],
        campaign_id: str,
        assistant_id: str,
        phone_number_id: str
    ) -> Dict[str, Any]:
        """
        Initiate a call to a single client
        
        Args:
            client: Client object with contact information
            campaign_id: ID of the campaign
            assistant_id: ID of the VAPI assistant to use
            phone_number_id: ID of the phone number to use
            
        Returns:
            Dictionary with the result of the call initiation
        """
        client_name = client.get("name", "Unknown")
        phone_number = client.get("phone_number", "")
        
        if not phone_number:
            return {
                "success": False,
                "client_name": client_name,
                "error": "No phone number provided"
            }
        
        # Ensure phone number is in E.164 format (starts with +)
        if not phone_number.startswith("+"):
            phone_number = "+" + phone_number.lstrip("0")  # Remove leading zeros and add +
        
        # Prepare call metadata
        metadata = {
            "campaign_id": campaign_id,
            "client_name": client_name,
            "client_id": str(uuid.uuid4()),  # Generate a unique ID for this call
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        # Add any personal details as variables for the assistant
        personal_details = client.get("personal_details", {})
        variables = {
            "client_name": client_name,
            **personal_details
        }
        
        # Ensure the payload matches VAPI's expected format
        payload = {
            "assistantId": assistant_id,
            "phoneNumberId": phone_number_id,
            "customer": {
                "number": phone_number
            },
            "metadata": metadata
        }
        
        # Log the payload for debugging
        logger.debug(f"Call payload for {phone_number}: {payload}")
        
        if cls.TEST_MODE:
            # Simulate a successful API call
            logger.info(f"TEST MODE: Simulating successful call to {phone_number}")
            return {
                "success": True,
                "client_name": client_name,
                "phone_number": phone_number,
                "call_id": f"test-call-{uuid.uuid4()}",
                "status": "queued"
            }
        
        # Make the API call to VAPI
        try:
            async with httpx.AsyncClient(timeout=30.0) as http_client:
                # Debug the API key
                api_key = settings.VAPI_API_PRIVATE_KEY
                logger.info(f"API key format check: starts with 'vapi_private_': {api_key.startswith('vapi_private_')}")
                logger.debug(f"Using API key: {api_key[:5]}...{api_key[-5:] if api_key else 'None'}")
                
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                
                # Log the full request for debugging
                logger.debug(f"VAPI request URL: {cls.VAPI_BASE_URL}/call")
                logger.debug(f"VAPI request headers: {headers}")
                logger.debug(f"VAPI request payload: {payload}")
                
                response = await http_client.post(
                    f"{cls.VAPI_BASE_URL}/call",
                    json=payload,
                    headers=headers
                )
                
                response.raise_for_status()
                call_data = response.json()
                
                return {
                    "success": True,
                    "client_name": client_name,
                    "phone_number": phone_number,
                    "call_id": call_data.get("id"),
                    "status": call_data.get("status")
                }
                
        except httpx.HTTPStatusError as e:
            error_detail = ""
            try:
                error_detail = e.response.json()
            except:
                error_detail = e.response.text
            
            logger.error(f"HTTP error initiating call to {phone_number}: {str(e)}")
            logger.error(f"Error details: {error_detail}")
            return {
                "success": False,
                "client_name": client_name,
                "phone_number": phone_number,
                "error": f"HTTP error: {e.response.status_code} - {error_detail}"
            }
        except Exception as e:
            logger.error(f"Error initiating call to {phone_number}: {str(e)}")
            return {
                "success": False,
                "client_name": client_name,
                "phone_number": phone_number,
                "error": str(e)
            }
    
    @staticmethod
    def _update_client_statuses(
        all_clients: List[Dict[str, Any]],
        call_results: List[Dict[str, Any]],
        max_retries: int = 3,
        cool_off_hours: int = 1
    ) -> List[Dict[str, Any]]:
        """
        Update client statuses based on call results
        
        Args:
            all_clients: List of all clients in the campaign
            call_results: Results of the call attempts
            max_retries: Maximum number of retry attempts
            cool_off_hours: Hours to wait before retrying
            
        Returns:
            Updated list of clients with new statuses
        """
        # Create a mapping of phone numbers to call results
        result_map = {r.get("phone_number"): r for r in call_results if "phone_number" in r}
        
        # Current time for retry scheduling
        current_time = datetime.now(timezone.utc)
        
        # Update client statuses
        updated_clients = []
        for client in all_clients:
            phone_number = client.get("phone_number")
            if phone_number in result_map:
                result = result_map[phone_number]
                status = client.get("status", {})
                number_of_calls = status.get("number_of_calls", 0) + 1
                
                if result.get("success", False):
                    # Call was successfully initiated - mark as in_progress
                    status["status"] = "in_progress"
                    status["call_id"] = result.get("call_id")
                    status["last_call_time"] = current_time.isoformat()
                    status["number_of_calls"] = number_of_calls
                    status["retry_at"] = None  # Clear retry time
                else:
                    # Call failed to initiate
                    if number_of_calls >= max_retries:
                        # Exceeded max retries - mark as failed
                        status["status"] = "failed"
                        status["error"] = result.get("error")
                        status["last_call_time"] = current_time.isoformat()
                        status["number_of_calls"] = number_of_calls
                        status["retry_at"] = None  # Clear retry time
                    else:
                        # Schedule for retry
                        # Ensure cool_off_hours is a valid number
                        retry_hours = cool_off_hours if cool_off_hours is not None else 1
                        retry_time = current_time + timedelta(hours=retry_hours)
                        status["status"] = "retry"
                        status["error"] = result.get("error")
                        status["last_call_time"] = current_time.isoformat()
                        status["number_of_calls"] = number_of_calls
                        status["retry_at"] = retry_time.isoformat()
                        logger.info(f"Scheduled retry for {phone_number} at {retry_time.isoformat()}")
                
                client["status"] = status
            
            updated_clients.append(client)
        
        return updated_clients

    @classmethod
    @FlowTracker.track_function()
    async def schedule_campaign_calls(
        cls, 
        campaign_id: str, 
        user_id: str,
        assistant_id: str,
        phone_number_id: str,
        schedule_time: datetime,
        max_calls: int = MAX_CONCURRENT_CALLS
    ) -> Dict[str, Any]:
        """
        Schedule outbound calls for a campaign at a future time
        
        Args:
            campaign_id: ID of the campaign
            user_id: ID of the user who owns the campaign
            assistant_id: ID of the VAPI assistant to use for calls
            phone_number_id: ID of the phone number to use for calls
            schedule_time: When to schedule the calls (UTC)
            max_calls: Maximum number of concurrent calls (default: 10)
            
        Returns:
            Dictionary with results of the call scheduling
        """
        FlowTracker.start_flow(f"schedule_campaign_{campaign_id}", f"Scheduling outbound calls for campaign {campaign_id}")
        
        try:
            # Get campaign data
            supabase = await get_supabase()
            campaign_response = await supabase.table("campaigns").select("*").eq("id", campaign_id).eq("user_id", user_id).execute()
            
            if not campaign_response.data:
                logger.error(f"Campaign {campaign_id} not found for user {user_id}")
                return {"success": False, "error": "Campaign not found"}
            
            campaign = campaign_response.data[0]
            clients = campaign.get("clients", [])
            agent_details = campaign.get("agent_details", {})
            
            # Get retry configuration
            max_retries = agent_details.get("number_of_retries", 3)  # Default to 3 retries
            
            if not clients:
                logger.warning(f"No clients found in campaign {campaign_id}")
                return {"success": False, "error": "No clients found in campaign"}
            
            # Filter clients that are eligible for scheduling:
            # 1. Status is 'queued' OR
            # 2. Status is 'retry' AND number_of_calls < max_retries
            eligible_clients = []
            for client in clients:
                status = client.get("status", {})
                status_value = status.get("status", "queued")
                number_of_calls = status.get("number_of_calls", 0)
                
                if status_value == "queued" or (status_value == "retry" and number_of_calls < max_retries):
                    eligible_clients.append(client)
            
            if not eligible_clients:
                logger.warning(f"No eligible clients found in campaign {campaign_id}")
                return {"success": False, "error": "No eligible clients found in campaign"}
            
            # Limit the number of calls
            clients_to_call = eligible_clients[:min(len(eligible_clients), max_calls)]
            logger.info(f"Scheduling calls for {len(clients_to_call)} clients in campaign {campaign_id}")
            
            # Format schedule time for VAPI
            schedule_time_iso = schedule_time.astimezone(timezone.utc).isoformat()
            
            # Prepare batch call payload
            customers = []
            for client in clients_to_call:
                phone_number = client.get("phone_number")
                if phone_number:
                    customers.append({"number": phone_number})
            
            # Prepare metadata
            metadata = {
                "campaign_id": campaign_id,
                "user_id": user_id,
                "scheduled_time": schedule_time_iso,
                "client_count": len(customers)
            }
            
            # Prepare the request payload for batch scheduling
            payload = {
                "assistantId": assistant_id,
                "phoneNumberId": phone_number_id,
                "customers": customers,
                "metadata": metadata,
                "schedulePlan": {
                    "earliestAt": schedule_time_iso
                }
            }
            
            # Make the API call to VAPI
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    headers = {
                        "Authorization": f"Bearer {settings.VAPI_API_PRIVATE_KEY}",
                        "Content-Type": "application/json"
                    }
                    
                    response = await client.post(
                        f"{cls.VAPI_BASE_URL}/call",
                        json=payload,
                        headers=headers
                    )
                    
                    response.raise_for_status()
                    schedule_data = response.json()
                    
                    # Update campaign with scheduled status
                    for client in clients:
                        phone_number = client.get("phone_number")
                        if phone_number and any(c.get("number") == phone_number for c in customers):
                            status = client.get("status", {})
                            status["status"] = "scheduled"
                            status["scheduled_time"] = schedule_time_iso
                            client["status"] = status
                    
                    await supabase.table("campaigns").update({"clients": clients}).eq("id", campaign_id).execute()
                    
                    return {
                        "success": True,
                        "scheduled_time": schedule_time_iso,
                        "client_count": len(customers),
                        "call_id": schedule_data.get("id"),
                        "status": "scheduled"
                    }
                    
            except httpx.HTTPStatusError as e:
                logger.error(f"HTTP error scheduling calls: {str(e)}")
                return {
                    "success": False,
                    "error": f"HTTP error: {e.response.status_code} - {e.response.text}"
                }
            except Exception as e:
                logger.error(f"Error scheduling calls: {str(e)}")
                return {
                    "success": False,
                    "error": str(e)
                }
                
        except Exception as e:
            logger.error(f"Error scheduling campaign calls: {str(e)}", exc_info=True)
            return {"success": False, "error": f"Failed to schedule calls: {str(e)}"}
        finally:
            FlowTracker.end_flow(f"schedule_campaign_{campaign_id}")

    @classmethod
    async def update_call_status(
        cls,
        call_id: str,
        status: str,
        campaign_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Update the status of a call in the campaign based on webhook events
        
        Args:
            call_id: ID of the call
            status: New status (completed, failed, etc.)
            campaign_id: Optional campaign ID if known
            metadata: Optional metadata from the webhook
            
        Returns:
            Dictionary with the result of the update
        """
        try:
            # If campaign_id is not provided, try to get it from metadata
            if not campaign_id and metadata:
                campaign_id = metadata.get("campaign_id")
            
            if not campaign_id:
                logger.error(f"Cannot update call status: No campaign_id provided for call {call_id}")
                return {"success": False, "error": "No campaign_id provided"}
            
            # Get the campaign
            supabase = await get_supabase()
            campaign_response = await supabase.table("campaigns").select("*").eq("id", campaign_id).execute()
            
            if not campaign_response.data:
                logger.error(f"Campaign {campaign_id} not found")
                return {"success": False, "error": "Campaign not found"}
            
            campaign = campaign_response.data[0]
            clients = campaign.get("clients", [])
            
            # Find the client with this call_id
            updated = False
            for client in clients:
                client_status = client.get("status", {})
                if client_status.get("call_id") == call_id:
                    # Update the client status
                    if status == "completed":
                        client_status["status"] = "completed"
                        client_status["completion_time"] = datetime.now(timezone.utc).isoformat()
                    elif status == "failed":
                        # Handle based on retry configuration
                        agent_details = campaign.get("agent_details", {})
                        max_retries = agent_details.get("number_of_retries", 3)
                        cool_off_hours = agent_details.get("cool_off", 1)
                        
                        number_of_calls = client_status.get("number_of_calls", 0)
                        
                        if number_of_calls >= max_retries:
                            client_status["status"] = "failed"
                        else:
                            # Schedule for retry
                            retry_time = datetime.now(timezone.utc) + timedelta(hours=cool_off_hours)
                            client_status["status"] = "retry"
                            client_status["retry_at"] = retry_time.isoformat()
                    
                    client["status"] = client_status
                    updated = True
                    break
            
            if not updated:
                logger.warning(f"No client found with call_id {call_id} in campaign {campaign_id}")
                return {"success": False, "error": "No matching client found"}
            
            # Update the campaign
            await supabase.table("campaigns").update({"clients": clients}).eq("id", campaign_id).execute()
            
            return {
                "success": True,
                "message": f"Updated call status to {status}",
                "campaign_id": campaign_id
            }
            
        except Exception as e:
            logger.error(f"Error updating call status: {str(e)}", exc_info=True)
            return {"success": False, "error": f"Failed to update call status: {str(e)}"}

# Create a singleton instance
outbound_call_service = OutboundCallService() 