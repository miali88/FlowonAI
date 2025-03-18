from typing import Any, Dict
import logging
import math

from app.services.vapi.calls import store_call_data
from app.services.user.usage import update_call_duration
from app.services.email_service import send_notification_email
from app.services.vapi.utils import get_user_notification_settings
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
        # Extract event type directly from the top level of the payload
        event_type = event_data.get("type", "unknown")
        
        logger.info(f"Processing VAPI webhook event: {event_type}")
          
        # Route the event to the appropriate handler based on type
        handlers = {
            "end-of-call-report": self.handle_end_of_call,
            "function-call": self.handle_function_call,
            "tool-calls": self.handle_tool_calls,
            "transfer-request": self.handle_transfer_request,
        }
        
        # Get the appropriate handler or use a default handler
        handler = handlers.get(event_type, self.handle_unknown_event)
    
        # Call the handler with the event data
        return await handler(event_data)
    
    async def handle_end_of_call(self, call_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle end-of-call-report events from VAPI.
        Saves call data to Supabase.
        
        Args:
            call_data: The end-of-call report data
            
        Returns:
            Dict containing the response to be sent back to VAPI
        """
        # Extract call ID from the correct location in the payload
        call_id = call_data.get("call", {}).get("id", "unknown")
        
        logger.info(f"Handling VAPI end-of-call report for call ID: {call_id}")
        
        try:
            # Extract important data for logging
            assistant_id = call_data.get("assistant", {}).get("id", "")
            duration_seconds = call_data.get("durationSeconds", 0)
            
            # Log detailed call info
            logger.info(f"Call {call_id} ended. Duration: {duration_seconds}s, Assistant: {assistant_id}")
            
            # Extract customer phone number for user lookup
            customer_number = call_data.get("customer", {}).get("number", "")
            
            # Store the summarized call data using the helper function
            # This will save to vapi_calls_summary table
            call_summary = await store_call_data(call_data)
            
            if call_summary and call_summary.get("user_id"):
                # Update the user's usage statistics
                user_id = call_summary.get("user_id")
                logger.info(f"Updating usage for user {user_id}, call duration: {duration_seconds}s")
                
                # Use the unified call duration update function with seconds
                await update_call_duration({
                    "user_id": user_id,
                    "duration_seconds": duration_seconds
                }, source="vapi")
                
                # Check if email notifications are enabled for this user and send email
                try:
                    # Get user notification settings
                    notification_settings = await get_user_notification_settings(user_id)
                    logger.debug(f"User notification settings: {notification_settings}")
                    
                    # Check if email notifications are enabled
                    email_settings = notification_settings.get("emailNotifications", {})
                    logger.debug(f"Email notification settings: {email_settings}")
                    
                    if email_settings.get("enabled", True):
                        # Get recipient email from the correct location in the structure
                        recipient_email = email_settings.get("email")
                        logger.debug(f"Recipient email from settings: {recipient_email}")
                        
                        if recipient_email:
                            # Create email content
                            subject = f"Flowon AI: New Call Summary - {call_id}"
                            
                            # Format the email body
                            customer_number = call_data.get("customer", {}).get("number", "Unknown")
                            call_date = call_data.get("endedAt", "Unknown")
                            call_duration = f"{duration_seconds} seconds"
                            summary = call_data.get("summary", "No summary available")
                            
                            body = f"""
                            <h2>Call Summary</h2>
                            <p><strong>Customer Number:</strong> {customer_number}</p>
                            <p><strong>End Time:</strong> {call_date}</p>
                            <p><strong>Duration:</strong> {call_duration}</p>
                            <h3>Call Summary:</h3>
                            <p>{summary}</p>
                            <p>View more details in your Flowon AI dashboard.</p>
                            """
                            
                            # Send the email
                            logger.info(f"Sending call summary email to {recipient_email}")
                            email_sent = await send_notification_email(subject, body, recipient_email)
                            
                            if email_sent:
                                logger.info(f"Email notification sent to {recipient_email} for call {call_id}")
                            else:
                                logger.warning(f"Failed to send email notification to {recipient_email} for call {call_id}")
                        else:
                            logger.warning(f"Email notifications enabled but no email address found for user {user_id}")
                    else:
                        logger.info(f"Email notifications not enabled for user {user_id}")
                
                except Exception as email_error:
                    logger.error(f"Error sending email notification: {str(email_error)}")
                    # Continue execution - email failure shouldn't stop the rest of the processing
            else:
                logger.warning(f"Could not update user usage: user_id not found in call summary for call {call_id}")
            
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
    
    async def handle_unknown_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Handle unknown event types from VAPI.
        
        Args:
            event_data: Unknown event data
            
        Returns:
            Response to be sent back to VAPI with an error message
        """
        # Extract message and type for accurate logging
        message = event_data.get("message", {})
        event_type = message.get("type", "unknown")
        
        logger.warning(f"Unknown event type: {event_type}")
        return {
            "status": "error",
            "message": f"Unknown event type: {event_type}"
        }

