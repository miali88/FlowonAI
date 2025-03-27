from typing import Any, Dict
from app.core.logging_setup import logger
import math

from app.services.vapi.calls import store_call_data
from app.services.user.usage import update_call_duration
from app.services.email_service import send_notification_email
from app.services.vapi.utils import get_user_notification_settings

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
        # Extract event type from the message object
        message = event_data.get("message", {})
        event_type = message.get("type", "unknown")
        
        logger.info(f"[SERVICE] process_webhook_event: Processing VAPI event type: {event_type}")
          
        # Route the event to the appropriate handler based on type
        handlers = {
            "end-of-call-report": self.handle_end_of_call,
            "function-call": self.handle_function_call,
            "tool-calls": self.handle_tool_calls,
            "transfer-request": self.handle_transfer_request,
        }
        
        # Get the appropriate handler or use a default handler
        handler = handlers.get(event_type, self.handle_unknown_event)
        logger.debug(f"[SERVICE] process_webhook_event: Selected handler for event type: {event_type}")
    
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
        # The actual data is in the message field
        message = call_data.get("message", {})
        call_id = message.get("call", {}).get("id", "unknown")
        
        logger.info(f"[SERVICE] handle_end_of_call: Processing call ID: {call_id}")
        
        try:
            # Extract important data for logging
            assistant_id = message.get("assistant", {}).get("id", "")
            duration_seconds = message.get("durationSeconds", 0)
            
            logger.debug(f"[SERVICE] handle_end_of_call: Call details - Duration: {duration_seconds}s, Assistant: {assistant_id}")
            
            # Store the summarized call data using the helper function
            logger.debug(f"[SERVICE] handle_end_of_call: Storing call data for call ID {call_id}")
            call_summary = await store_call_data(call_data)
            
            if call_summary and call_summary.get("user_id"):
                user_id = call_summary.get("user_id")
                logger.info(f"[SERVICE] handle_end_of_call: Updating usage for user {user_id}")
                
                # Update the user's usage statistics
                await update_call_duration({
                    "user_id": user_id,
                    "duration_seconds": duration_seconds
                }, source="vapi")
                
                # Check if email notifications are enabled for this user and send email
                try:
                    logger.debug(f"[SERVICE] handle_end_of_call: Checking notification settings for user {user_id}")
                    notification_settings = await get_user_notification_settings(user_id)
                    
                    email_settings = notification_settings.get("emailNotifications", {})
                    if email_settings.get("enabled", False):
                        recipient_email = email_settings.get("email")
                        if recipient_email:
                            logger.debug(f"[SERVICE] handle_end_of_call: Preparing email for {recipient_email}")
                            
                            # Create email content
                            subject = "Flowon AI: New Call"
                            customer_number = message.get("customer", {}).get("number", "Unknown")
                            call_date = message.get("endedAt", "Unknown")
                            call_duration = f"{duration_seconds} seconds"
                            summary = message.get("summary", "No summary available")
                            
                            body = f"""
                            <h2>Call Summary</h2>
                            <p><strong>Customer Number:</strong> {customer_number}</p>
                            <p><strong>End Time:</strong> {call_date}</p>
                            <p><strong>Duration:</strong> {call_duration}</p>
                            <h3>Call Summary:</h3>
                            <p>{summary}</p>
                            <p>View more details in your Flowon AI dashboard.</p>
                            """
                            
                            logger.info(f"[SERVICE] handle_end_of_call: Sending email to {recipient_email}")
                            email_sent = await send_notification_email(subject, body, recipient_email)
                            
                            if email_sent:
                                logger.info(f"[SERVICE] handle_end_of_call: Email sent successfully to {recipient_email}")
                            else:
                                logger.warning(f"[SERVICE] handle_end_of_call: Failed to send email to {recipient_email}")
                        else:
                            logger.warning(f"[SERVICE] handle_end_of_call: No email address found for user {user_id}")
                    else:
                        logger.debug(f"[SERVICE] handle_end_of_call: Email notifications not enabled for user {user_id}")
                
                except Exception as email_error:
                    logger.error(f"[SERVICE] handle_end_of_call: Email notification error: {str(email_error)}")
            else:
                logger.warning(f"[SERVICE] handle_end_of_call: No user_id found in call summary for call {call_id}")
            
            logger.info(f"[SERVICE] handle_end_of_call: Successfully processed call {call_id}")
            return {"status": "success", "message": "Call data saved successfully"}
        
        except Exception as e:
            logger.error(f"[SERVICE] handle_end_of_call: Error processing call {call_id}: {str(e)}")
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
        logger.info(f"[SERVICE] handle_function_call: Processing function: {function_name}")
        
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
            logger.debug(f"[SERVICE] handle_function_call: Executing handler for {function_name}")
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
            logger.warning(f"[SERVICE] handle_function_call: Unknown function: {function_name}")
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
        logger.info("[SERVICE] handle_tool_calls: Processing tool calls")
        
        # Process each tool call
        tools = tool_calls_data.get("tools", [])
        results = []
        
        for tool in tools:
            tool_name = tool.get("name", "unknown")
            logger.debug(f"[SERVICE] handle_tool_calls: Processing tool: {tool_name}")
            
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
        logger.info(f"[SERVICE] handle_transfer_request: Processing transfer for call ID: {call_id}")
        
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
        
        logger.warning(f"[SERVICE] handle_unknown_event: Received unknown event type: {event_type}")
        return {
            "status": "error",
            "message": f"Unknown event type: {event_type}"
        }

