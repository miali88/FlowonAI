from typing import Any, Dict
import logging
import math

from app.services.vapi.calls import store_call_data
from app.services.user.usage import update_call_duration
from app.services.email_service import send_notification_email
from app.services.vapi.utils import get_user_notification_settings
from app.services.chat.chat import llm_response
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
                            <p><strong>End Time:</strong> {self.format_timestamp(call_date)}</p>
                            <p><strong>Duration:</strong> {call_duration}</p>
                            <h3>Call Summary:</h3>
                            <p>{summary}</p>
                            <p>View more details in your <a href="https://flowon.ai/dashboard/conversationlogs">Flowon AI dashboard</a>.</p>
                            <p><img src="https://flowon.ai/flowon.png" alt="Flowon AI Logo" style="max-width: 150px; height: auto;"></p>
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
            
            # Handle message taking tool
            if tool_name == "message_taking":
                try:
                    # Extract the tool arguments
                    args = tool.get("arguments", {})
                    call_id = tool_calls_data.get("callId")
                    
                    # Process message taking data
                    result = await self.process_message_taking(call_id, args)
                    
                    results.append({
                        "tool_name": tool_name,
                        "status": "success",
                        "data": result
                    })
                except Exception as e:
                    logger.error(f"Error processing message taking tool: {str(e)}")
                    results.append({
                        "tool_name": tool_name,
                        "status": "error",
                        "error": str(e)
                    })
            else:
                # Handle other tool types
                results.append({
                    "tool_name": tool_name,
                    "status": "success",
                    "data": {}  # Your tool response data
                })
        
        return {
            "status": "success",
            "results": results
        }
    
    async def process_message_taking(self, call_id: str, message_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process message taking data from a call and update the call summary.
        
        Args:
            call_id: The ID of the call
            message_data: The message taking data from the tool call
            
        Returns:
            Dict containing the processed message data
        """
        logger.info(f"Processing message taking data for call {call_id}")
        
        try:
            # Get the call data from Supabase
            supabase = await get_supabase()
            response = await supabase.table("vapi_calls").select("*").eq("call_id", call_id).execute()
            
            if not response.data:
                logger.warning(f"No call data found for call ID {call_id}")
                return {"status": "error", "message": "Call data not found"}
            
            call_data = response.data[0]
            user_id = call_data.get("user_id")
            
            if not user_id:
                logger.warning(f"No user ID found for call {call_id}")
                return {"status": "error", "message": "User ID not found"}
            
            # Get the user's message taking settings
            user_settings = await supabase.table("guided_setup").select("message_taking").eq("user_id", user_id).execute()
            
            if not user_settings.data:
                logger.warning(f"No message taking settings found for user {user_id}")
                return {"status": "success", "message": "No message taking settings found"}
            
            message_taking_settings = user_settings.data[0].get("message_taking", {})
            
            # Format the collected data based on the settings
            formatted_data = {}
            
            # Add caller name if it was collected
            if message_taking_settings.get("callerName", {}).get("required", False):
                formatted_data["Caller Name"] = message_data.get("caller_name", "Not provided")
            
            # Add caller phone number if it was collected
            if message_taking_settings.get("callerPhoneNumber", {}).get("required", False):
                formatted_data["Caller Phone Number"] = message_data.get("caller_phone", "Not provided")
            
            # Add specific questions and answers
            has_required_questions = False
            formatted_questions = {}
            specific_questions = message_taking_settings.get("specificQuestions", [])
            for question_setting in specific_questions:
                question = question_setting.get("question", "")
                if question and question_setting.get("required", False):
                    has_required_questions = True
                    # Find the answer in the message data
                    answer_key = question.lower().replace(" ", "_").replace("?", "")
                    answer = message_data.get(answer_key, "Not provided")
                    formatted_questions[question] = answer
            
            # Update the call summary with the formatted data
            call_summary = call_data.get("summary", "")
            call_transcript = call_data.get("transcript", "")

            logger.info(f"Call summary: {call_summary}")
            logger.info(f"Formatted data: {formatted_data}")
            
            # Skip LLM call if there are no specific questions or none are required
            enhanced_summary = call_summary
            if specific_questions and has_required_questions:
                # Use LLM to generate a structured summary with the collected data
                system_prompt = """
                You are a helpful assistant that formats answers to each question in the collected data.
                Create a professional, well-structured summary for each of the answers in the collected data.
                Format each question and its corresponding answer in a clean, organized way.
                
                IMPORTANT: Do not include markdown code block tags like ```html or ``` in your response.
                Just provide the clean HTML content directly.
                """
                
                user_prompt = f"""
                Call transcript:
                {call_transcript}
                
                Questions:
                {formatted_questions}
                
                Please provide comprehensive answers to all questions based on the call transcript.
                Format your response as an HTML unordered list where each question is followed by its answer.
                
                Use this exact format:
                <ul>
                <li><strong>Question:</strong> [Question text]</li>
                <li><strong>Answer:</strong> [Detailed answer]</li>
                <li><strong>Question:</strong> [Next question text]</li>
                <li><strong>Answer:</strong> [Next detailed answer]</li>
                </ul>
                
                Make sure each question and its corresponding answer are clearly paired together.
                And make sure you didn't change any of the questions, I want them to be exactly the same.
                
                IMPORTANT: Do not include markdown code block tags like ```html or ``` in your response.
                Just provide the clean HTML content directly.
                """
                
                # Call the LLM to generate the enhanced summary
                enhanced_summary = await llm_response(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    conversation_history=None,
                    model="claude",
                    token_size=500
                )
            
            # Check if email notifications are enabled and send an updated email
            notification_settings = await get_user_notification_settings(user_id)
            email_settings = notification_settings.get("emailNotifications", {})
            
            if email_settings.get("enabled", True):
                recipient_email = email_settings.get("email")
                
                if recipient_email:
                    # Create email content with the call summary
                    subject = f"Flowon AI: Call Summary - {call_id}"
                    
                    # Format the email body with the call summary and collected data
                    body = f"""
                    <h2>Call Summary</h2>
                    <p><strong>Customer Number:</strong> {call_data.get("customer_number", "Unknown")}</p>
                    <p><strong>End Time:</strong> {self.format_timestamp(call_data.get("ended_at", "Unknown"))}</p>
                    <p><strong>Duration:</strong> {call_data.get("duration_seconds", 0)} seconds</p>
                    
                    <h3>Notes from the call:</h3>
                    <p>{call_summary}</p>
                    """
                    
                    # Only add collected information section if there is any data
                    if formatted_data:
                        body += """
                        <h3>Collected Information:</h3>
                        <ul>
                        """
                        
                        # Add each piece of collected information
                        for key, value in formatted_data.items():
                            body += f"<li><strong>{key}:</strong> {value}</li>\n"
                        
                        body += "</ul>"
                    
                    if enhanced_summary:
                        body += f"<h3>Answers to specific questions:</h3><p>{enhanced_summary}</p>"
                    
                    body += """
                    <p>View more details in your <a href="https://flowon.ai/dashboard/conversationlogs">Flowon AI dashboard</a>.</p>
                    <p><img src="https://flowon.ai/flowon.png" alt="Flowon AI Logo" style="max-width: 50px; height: auto;"></p>
                    """
                    
                    # Send the email
                    logger.info(f"Sending call summary email to {recipient_email}")
                    await send_notification_email(subject, body, recipient_email)
            
            return {
                "status": "success",
                "message": "Message taking data processed successfully",
                "data": formatted_data
            }
            
        except Exception as e:
            logger.error(f"Error processing message taking data: {str(e)}")
            return {"status": "error", "message": str(e)}
    
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

    def format_timestamp(self, timestamp: str) -> str:
        """
        Format a timestamp into a human-readable date and time.
        
        Args:
            timestamp: ISO format timestamp string
            
        Returns:
            Human-readable date and time string
        """
        try:
            from datetime import datetime
            import pytz
            
            # Parse the ISO format timestamp
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            
            # Convert to local timezone (optional)
            local_tz = pytz.timezone('America/New_York')
            local_dt = dt.astimezone(local_tz)
            
            # Format the date and time in a readable format
            return local_dt.strftime("%B %d, %Y at %I:%M %p %Z")
        except Exception as e:
            logger.error(f"Error formatting timestamp: {str(e)}")
            return timestamp  
        

