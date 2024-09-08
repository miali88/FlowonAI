from typing import Any, Dict
from app.core.config import settings
from supabase import create_client, Client
from datetime import datetime
import json
import logging
from postgrest.exceptions import APIError

logger = logging.getLogger(__name__)

class SupabaseOps:
    def __init__(self) -> None:
        self.supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

        if not self.supabase:
            raise ValueError("Failed to create Supabase client")
        
        self.retell = self.Retell(self)
        self.twilio = self.Twilio(self)
        self.vapi = self.VAPI(self)

    class PipeCat_Pipeline:
        def __init__(self, parent: 'SupabaseOps') -> None:
            self.parent = parent

    class Retell:
        def __init__(self, parent: 'SupabaseOps') -> None:
            self.parent = parent

        async def create(self, data: Dict[str, Any], retell_wh: str) -> Any:
            try:
                if retell_wh == "retell_ai_calls":
                    event_id = data["data"]["call_id"]
                elif retell_wh == "retell_ai_events":
                    event_id = data["name"]
                else:
                    raise ValueError("Unknown Retell AI payload type")

                insert_data = {
                    "event_id": event_id,
                    "payload": json.dumps(data),
                    "timestamp": datetime.utcnow().isoformat()
                }
                result = self.parent.supabase.table(retell_wh).insert(insert_data).execute()

                if result.data:
                    logger.info(f"Retell data saved successfully to {retell_wh}: {event_id}")
                else:
                    logger.error(f"Error saving Retell data to {retell_wh}") #: {result.error}")

                return result.data
            except Exception as e:
                logger.exception(f"Error saving Retell data to Supabase: {e}")
                raise

    class Twilio:
        def __init__(self, parent: 'SupabaseOps') -> None:
            self.parent = parent

        async def create(self, call_sid: str, payload: Dict[str, Any]) -> Any:
            try:
                if not self.parent.check_connection():
                    raise ConnectionError("Failed to connect to Supabase")

                insert_data = {
                    "event_id": call_sid,
                    "payload": json.dumps(payload),
                    "timestamp": datetime.utcnow().isoformat()
                }
                logging.info(f"Attempting to insert data: {insert_data}")
                result = self.parent.supabase.table("twilio_events").insert(insert_data).execute()
                logging.info(f"Insert successful. Result: {result}")
                if result.data:
                    logger.info(f"Twilio data saved successfully: {call_sid}")
                else:
                    logger.error(f"Error saving Twilio data:")
                    raise APIError(result.error)
                return result.data
            except APIError as e:
                logger.error(f"Supabase API Error: {str(e)}")
                logger.error(f"Error details: {e.args}")
                logger.error(f"Error response: {e.response.text if hasattr(e, 'response') else 'No response'}")
                raise
            except Exception as e:
                logger.error(f"Unexpected error: {str(e)}")
                logger.error(f"Error type: {type(e)}")
                raise

    class VAPI:
        def __init__(self, parent: 'SupabaseOps') -> None:
            self.parent = parent

        async def create(self, payload: Dict[str, Any]) -> Dict[str, Any]:
            try:
                message = payload.get("message", {})
                event_type = message.get("type")
                call_info = message.get("call", {})

                logger.info(f"Received VAPI event type: {event_type}")

                if event_type == "status-update":
                    insert_data = {
                        "call_id": call_info.get("id"),
                        "agent_id": call_info.get("assistantId"),
                        "status": message.get("status"),
                    }
                    result = self.parent.supabase.table("vapi_status_update").insert(insert_data).execute()
                    log_message = "VAPI status update"
                elif event_type == "end-of-call-report":
                    insert_data = {
                        "call_id": call_info.get("id"),
                        "agent_id": call_info.get("assistantId"),
                    }
                    logger.info(f"Attempting to insert EoC report: {insert_data}")
                    result = self.parent.supabase.table("vapi_eoc_report").insert(insert_data).execute()
                    log_message = "VAPI end-of-call report"
                elif event_type == "tool-calls":
                    tool_calls = message.get("toolCalls", [])
                    if tool_calls:
                        tool_call = tool_calls[0]
                        insert_data = {
                            "call_id": call_info.get("id"),
                            "tool_call_id": tool_call.get("id"),
                            "function_name": tool_call.get("function", {}).get("name"),
                            "arguments": json.dumps(tool_call.get("function", {}).get("arguments")),
                            "assistant_id": call_info.get("assistantId"),
                            "created_at": call_info.get("createdAt"),
                            "payload": json.dumps(payload)
                        }
                        logger.info(f"Attempting to insert tool-calls data: {insert_data}")
                        
                        # Add more detailed error handling
                        try:
                            result = self.parent.supabase.table("vapi_tool_calls").insert(insert_data).execute()
                            logger.info(f"Insert result: {result}")
                        except Exception as insert_error:
                            logger.exception(f"Error during insert operation: {str(insert_error)}")
                            return {"success": False, "message": "Error during insert operation", "error": str(insert_error)}
                        
                        log_message = "VAPI tool-calls data inserted successfully"
                    else:
                        logger.warning("No tool calls found in the payload")
                        return {"success": False, "message": "No tool calls found in the payload"}
                else:
                    logger.info(f"Unhandled event type: {event_type}")
                    return {"success": True, "message": f"Unhandled event type: {event_type}"}

                logger.debug(f"Supabase result: {result}")
                logger.debug(f"Supabase result data: {result.data}")

                if result.data:
                    logger.info(f"{log_message} saved successfully: {insert_data['call_id']}")
                    return {"success": True, "message": f"{log_message} saved successfully", "data": result.data}
                else:
                    logger.warning(f"{log_message} saved, but no data returned: {insert_data['call_id']}")
                    return {"success": True, "message": f"{log_message} saved, but no data returned"}

            except Exception as e:
                logger.exception(f"Error saving VAPI data to Supabase: {str(e)}")
                return {"success": False, "message": "Error saving VAPI data", "error": str(e)}

    def check_connection(self):
        try:
            result = self.supabase.table("twilio_events").select("id").limit(1).execute()
            logging.info("Supabase connection successful")
            return True
        except Exception as e:
            logging.error(f"Supabase connection failed: {str(e)}")
            return False

supabase_ops: SupabaseOps = SupabaseOps()