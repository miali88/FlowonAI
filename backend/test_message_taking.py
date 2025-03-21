import asyncio
import json
import logging
from app.services.vapi.api_handlers import VapiService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_message_taking():
    """
    Test the message taking implementation using call_Data.json
    """
    try:
        # Load the call data from the JSON file
        with open('call_Data.json', 'r') as f:
            call_data = json.load(f)
        
        logger.info(f"Loaded call data from call_Data.json")
        
        # Extract message data from the call_data
        message = call_data.get("message", {})
        
        # Try to find a call ID in the message data
        # In a real VAPI webhook, this would be provided
        # For testing, we need to either:
        # 1. Use a known call ID from your database
        # 2. Create a test call record first
        
        # Option 1: Use a known call ID from your database
        # Replace this with an actual call ID from your vapi_calls table
        known_call_id = "YOUR_ACTUAL_CALL_ID_FROM_DATABASE"
        
        # Create a sample tool calls payload
        tool_calls_payload = {
            "type": "tool-calls",
            "callId": known_call_id,  # Use the known call ID
            "tools": [
                {
                    "name": "message_taking",
                    "arguments": {
                        "caller_name": "Jacob",
                        "caller_phone": "08000010066",
                        "are_you_looking_for_a_roof_repair_a_full_roof_replacement_or_a_new_installation": "New installation",
                        "what_type_of_roof_do_you_have_shingles_metal_flat_tile_etc": "Unknown, needs assessment",
                        "how_urgent_is_your_request_emergency_repair_within_a_week_or_just_exploring_options": "Needs quote",
                        "the_address_of_the_property": "Not provided"
                    }
                }
            ]
        }
        
        logger.info(f"Using call ID: {known_call_id} for testing")
        
        # Initialize the VAPI service
        vapi_service = VapiService()
        
        # Process the tool calls
        logger.info("Processing tool calls...")
        result = await vapi_service.process_webhook_event(tool_calls_payload)
        
        # Print the result
        logger.info(f"Result: {json.dumps(result, indent=2)}")
        
        logger.info("Test completed successfully")
        
    except Exception as e:
        logger.error(f"Error testing message taking: {str(e)}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(test_message_taking()) 