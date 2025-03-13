from typing import Any, Dict, List, Optional, Union
import logging
from fastapi import HTTPException
from app.clients.supabase_client import get_supabase

# Configure logging
logger = logging.getLogger(__name__)

class VapiService:
    """Service class to handle VAPI webhook events."""
    
    async def process_webhook_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process incoming VAPI webhook events and delegate to appropriate handlers.
        
        Args:
            event_data: The webhook payload from VAPI
            
        Returns:
            Dict containing the response to be sent back to VAPI
        """
        # Log the event type
        event_type = event_data.get("type", "unknown")
        logger.info(f"Processing VAPI webhook event: {event_type}")
        
        # Check if this is a messageResponse type event
        if "messageResponse" in event_data:
            return await self.handle_message_response(event_data["messageResponse"])
        
        # Route the event to the appropriate handler based on type
        handlers = {
            "end-of-call-report": self.handle_end_of_call,
            "function-call": self.handle_function_call,
            "tool-calls": self.handle_tool_calls,
            "conversation-update": self.handle_conversation_update,
            "status-update": self.handle_status_update,
            "hang": self.handle_hang_up,
            "transfer-destination-request": self.handle_transfer_request,
            "user-interrupted": self.handle_user_interrupted
        }
        
        # Get the appropriate handler or use a default handler
        handler = handlers.get(event_type, self.handle_unknown_event)
        
        # Call the handler with the event data
        return await handler(event_data)
    
    async def handle_message_response(self, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a message response from VAPI.
        
        Args:
            message_data: The message response data
            
        Returns:
            Dict containing the response to be sent back to VAPI
        """
        logger.info(f"Handling VAPI message response with assistant ID: {message_data.get('assistantId', 'unknown')}")
        
        # Extract relevant data
        assistant_id = message_data.get("assistantId")
        destination = message_data.get("destination")
        
        # Here you would implement business logic based on the message type
        # For example, storing conversations, triggering actions, etc.
        
        # Default response for most message types
        return {"status": "success"}
    
    async def handle_end_of_call(self, call_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle end-of-call-report events from VAPI.
        Saves call data to Supabase.
        
        Args:
            call_data: The end-of-call report data
            
        Returns:
            Dict containing the response to be sent back to VAPI
        """
        logger.info(f"Handling VAPI end-of-call report for call ID: {call_data.get('callId', 'unknown')}")
        
        try:
            # Extract important call data
            call_id = call_data.get("callId")
            assistant_id = call_data.get("assistantId")
            start_time = call_data.get("startTime")
            end_time = call_data.get("endTime")
            duration = call_data.get("durationSeconds")
            transcript = call_data.get("transcript", [])
            
            # Get metrics if available
            metrics = call_data.get("metrics", {})
            
            # Log detailed call info
            logger.info(f"Call {call_id} ended. Duration: {duration}s, Assistant: {assistant_id}")
            
            # Prepare data for Supabase
            call_record = {
                "call_id": call_id,
                "assistant_id": assistant_id,
                "start_time": start_time,
                "end_time": end_time,
                "duration_seconds": duration,
                "transcript": transcript,
                "metrics": metrics,
                "raw_data": call_data  # Store the complete raw data
            }
            
            # Initialize Supabase client
            supabase = await get_supabase()
            
            # Save to Supabase
            result = await supabase.table("vapi_calls").insert(call_record).execute()
            
            logger.info(f"Saved call {call_id} to Supabase successfully")
            
            return {"status": "success", "message": "Call data saved successfully"}
        
        except Exception as e:
            logger.error(f"Error saving call data to Supabase: {str(e)}")
            # We return a success response to VAPI even if there's an error saving to Supabase
            # This prevents VAPI from retrying the webhook, which could lead to duplicate data
            return {"status": "success", "error": str(e)}
    
    async def handle_function_call(self, function_call_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle function call events from VAPI.
        
        Args:
            function_call_data: Function call data from VAPI
            
        Returns:
            Response to be sent back to VAPI with function results
        """
        function_name = function_call_data.get("name", "unknown")
        logger.info(f"Handling VAPI function call: {function_name}")
        
        # Map function names to handlers
        function_handlers = {
            # Add your function handlers here
            # "get_user_info": self.get_user_info,
            # "check_appointment": self.check_appointment,
            # etc.
        }
        
        # Get the function handler or use a default
        handler = function_handlers.get(function_name)
        
        if handler:
            # Call the specific function handler
            args = function_call_data.get("arguments", {})
            result = await handler(args)
            return {
                "status": "success",
                "result": {
                    "name": function_name,
                    "data": result
                }
            }
        else:
            # Log unknown function call
            logger.warning(f"Unknown function call: {function_name}")
            return {
                "status": "error",
                "result": {
                    "name": function_name,
                    "error": f"Unknown function: {function_name}"
                }
            }
    
    async def handle_tool_calls(self, tool_calls_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle tool calls events from VAPI.
        
        Args:
            tool_calls_data: Tool calls data from VAPI
            
        Returns:
            Response to be sent back to VAPI with tool results
        """
        logger.info(f"Handling VAPI tool calls")
        
        # Process each tool call
        tools = tool_calls_data.get("tools", [])
        results = []
        
        for tool in tools:
            tool_name = tool.get("name", "unknown")
            logger.info(f"Processing tool call: {tool_name}")
            
            # Add your tool call implementation here
            # This is similar to function calls but follows the OpenAI tools format
            
            results.append({
                "tool_name": tool_name,
                "status": "success",
                "data": {}  # Your tool response data
            })
        
        return {
            "status": "success",
            "results": results
        }
    
    async def handle_conversation_update(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle conversation update events from VAPI.
        
        Args:
            event_data: Conversation update data
            
        Returns:
            Response to be sent back to VAPI
        """
        logger.info(f"Handling VAPI conversation update for call ID: {event_data.get('callId', 'unknown')}")
        
        # Implement your conversation update logic here
        # This could include storing conversation state, updating UI, etc.
        
        return {"status": "success"}
    
    async def handle_status_update(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle status update events from VAPI.
        
        Args:
            event_data: Status update data
            
        Returns:
            Response to be sent back to VAPI
        """
        status = event_data.get("status", "unknown")
        call_id = event_data.get("callId", "unknown")
        logger.info(f"Handling VAPI status update: {status} for call ID: {call_id}")
        
        # Implement your status update logic here
        # This could include updating call status in your database, notifying users, etc.
        
        return {"status": "success"}
    
    async def handle_hang_up(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle hang up events from VAPI.
        
        Args:
            event_data: Hang up event data
            
        Returns:
            Response to be sent back to VAPI
        """
        call_id = event_data.get("callId", "unknown")
        reason = event_data.get("reason", "unknown")
        logger.info(f"Handling VAPI hang up for call ID: {call_id}, reason: {reason}")
        
        # Implement your hang up logic here
        # This could include updating call status, cleanup tasks, etc.
        
        return {"status": "success"}
    
    async def handle_transfer_request(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle transfer destination request events from VAPI.
        
        Args:
            event_data: Transfer request data
            
        Returns:
            Response to be sent back to VAPI with transfer destination
        """
        call_id = event_data.get("callId", "unknown")
        logger.info(f"Handling VAPI transfer request for call ID: {call_id}")
        
        # Implement your transfer logic here
        # Return a destination based on your business rules
        
        # Example transfer response
        return {
            "status": "success",
            "destination": {
                "type": "number",
                "number": "+1234567890",  # Replace with actual number
                "message": "Transferring you to a human agent."
            }
        }
    
    async def handle_user_interrupted(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle user interrupted events from VAPI.
        
        Args:
            event_data: User interrupted event data
            
        Returns:
            Response to be sent back to VAPI
        """
        call_id = event_data.get("callId", "unknown")
        logger.info(f"Handling VAPI user interrupted for call ID: {call_id}")
        
        # Implement your user interrupted logic here
        # This could include updating conversation state, etc.
        
        return {"status": "success"}
    
    async def handle_unknown_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle unknown event types from VAPI.
        
        Args:
            event_data: Unknown event data
            
        Returns:
            Response to be sent back to VAPI
        """
        event_type = event_data.get("type", "unknown")
        logger.warning(f"Received unknown VAPI event type: {event_type}")
        
        # Log the full event data for debugging
        logger.debug(f"Unknown event data: {event_data}")
        
        # Return a success response to acknowledge receipt
        return {"status": "success"}
