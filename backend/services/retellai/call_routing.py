from fastapi import HTTPException, Request
from services import twilio
from services.db_queries import db_case_locator
from app.core.config import settings
from typing import Dict, Any, Tuple, Optional

class CallRouting:
    def __init__(self, in_memory_cache: Any):
        self.in_memory_cache = in_memory_cache

    async def caller_information(self, event: Dict[str, Any], request: Request) -> Dict[str, Any]:
        print('\n caller information function...')
        self.in_memory_cache.set("AGENT_FIRST.ic_info", event['args'])
        print('ic_info:', self.in_memory_cache.get("AGENT_FIRST.ic_info"))
        return {"function_result": {"name": "callerInformation"}, "result": f"info noted"}

    async def case_locator(self, event: Dict[str, Any], request: Request) -> Dict[str, Any]:
        print('\n case locator function...')
        case_name, admin_name = await db_case_locator(event)
        if case_name and admin_name:
            print('\n\n in_memory_cache', self.in_memory_cache.get_all())
            return {"function_result": {"name": "CaseLocator"}, "result": {"case-name": case_name, "administrator-name": admin_name}}
        else:
            return {"function_result": {"name": "CaseLocator"}, "result": {"error": "Case or administrator not found"}}

    async def call_admin(self, event: Dict[str, Any], request: Request) -> None:
        print('\ncall admin function...')
        hold_url = f'{settings.BASE_URL}/api/v1/twilio/add_to_conference'
        print('hold_url', hold_url)      
        print('twilio_callsid', self.in_memory_cache.get("AGENT_FIRST.twilio_callsid"))
        await twilio.update_call(self.in_memory_cache.get("AGENT_FIRST.twilio_callsid"), hold_url, 'hold')

    async def info_retrieve(self, event: Dict[str, Any], request: Request) -> Dict[str, Any]:
        print('\ninfo_retrieve function...')
        return {"function_result": {"name": "infoRetrieve"}, "result": \
                {"callersName": self.in_memory_cache.get("AGENT_FIRST.ic_info.callersName"), \
                 "caseName": self.in_memory_cache.get("AGENT_FIRST.case_locator.case"), \
                 "whereCallingFrom": self.in_memory_cache.get("AGENT_FIRST.ic_info.whereCallingFrom"), \
                "enquiry": self.in_memory_cache.get("AGENT_FIRST.ic_info.enquiry"),\
                "administratorName": self.in_memory_cache.get("AGENT_FIRST.case_locator.admin_name")}}

    async def admin_available(self, event: Dict[str, Any], request: Request) -> bool:
        print('\nadmin available function...')
        try:
            admin_available_bool: bool = event['args']['adminAvailable']
            if admin_available_bool == True:
                await twilio.admin_to_conf(event, request)
            return admin_available_bool
        except KeyError as ke:
            print(f"KeyError in admin_available: {ke}")
            raise HTTPException(status_code=400, detail=f"Missing key in event args: {str(ke)}")
        except Exception as e:
            print(f"Error in admin_available: {e}")
            raise HTTPException(status_code=500, detail=f"Error processing admin availability: {str(e)}")