from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import logging

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from services.db.supabase_services import supabase_client
from app.core.config import settings
from twilio.rest import Client # type: ignore
from twilio.base.exceptions import TwilioRestException
from twilio.twiml.voice_response import VoiceResponse, Dial
from services.cache import in_memory_cache
from services import retellai

client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
logger = logging.getLogger(__name__)


class Event(BaseModel):
    name: str
    args: Optional[Dict[str, Any]] = None


def get_country_codes() -> List[str]:
    countries = client.available_phone_numbers.list()
    return [country.country_code for country in countries]


def get_available_numbers(client: Client, country_code: str) -> Dict[str, List[str]]:
    number_types = ['local', 'toll_free', 'mobile', 'national']
    available_numbers: Dict[str, List[str]] = {}

    for number_type in number_types:
        try:
            numbers = getattr(
                client.available_phone_numbers(country_code),
                number_type
            ).list(limit=5)
            numbers_list = [number.phone_number for number in numbers]

            if numbers_list:
                available_numbers[number_type] = numbers_list
        except Exception:
            continue

    return available_numbers


async def fetch_twilio_numbers(user_id: str) -> Any:
    numbers = supabase_client().table('twilio_numbers').select('*').eq(
        'owner_user_id',
        user_id
    ).execute()
    return numbers.data


async def call_admin(call_sid: str) -> None:
    try:
        print('\ncall admin function...')
        print("settings.BASE_URL", settings.BASE_URL)
        hold_url = f'{settings.BASE_URL}/twilio/add_to_conference'
        print('hold_url', hold_url)
        print('call_sid', call_sid)

        if not call_sid or not call_sid.startswith('CA'):
            raise ValueError(f"Invalid call SID format: {call_sid}")

        client.calls(call_sid).update(
            url=hold_url,
            method='POST'
        )

        print(f"Successfully updated call {call_sid} to URL {hold_url}")

    except TwilioRestException as e:
        print(f"Twilio error: {e.code} - {e.msg}")
        print(f"More error details: {e.details}")
        print(f"Full error: {vars(e)}")
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise


async def add_to_conference(request: Request) -> JSONResponse:
    try:
        form_data = await request.form()
        print(form_data)
        call_sid = form_data['CallSid']
        print('INITIAL CALL SID IS', call_sid)

        call_sid_str = str(call_sid)

        client.calls(call_sid_str).update(
            twiml='<Response><Dial><Conference startConferenceOnEnter="false" '
            'endConferenceOnExit="true">MyConferenceRoom</Conference></Dial></Response>'
        )

        admin_tel_no = "+447459264413"
        print('admin tel number is', admin_tel_no)
        await agent_outbound(
            settings.TWILIO_NUMBER,
            admin_tel_no,
            settings.AGENT_SECOND
        )

        return JSONResponse(
            content={'message': 'Call moved to conference and agent added'}
        )
    except Exception as e:
        print(f"Error in add_to_conference: {e}")
        raise HTTPException(status_code=500, detail=str(e))


async def agent_outbound(from_number: str, to_number: str, agent_id: str) -> None:
    try:
        print('calling 2nd agent')
        client.calls.create(
            url=f"{settings.BASE_URL}/twilio/twilio-voice-webhook/{agent_id}",
            to=to_number,
            from_=from_number
        )
        print(f"Call from: {from_number} to: {to_number}")
    except Exception as err:
        print(f"Error in agent_outbound: {err}")


async def admin_to_conf(event: Event, request: Request) -> None:
    twiml_url = "http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient"
    response = VoiceResponse()
    dial = Dial()

    dial.conference(
        'NoMusicNoBeepRoom',
        beep=False,
        wait_url=twiml_url,
        start_conference_on_enter=True,
        end_conference_on_exit=True
    )
    response.append(dial)

    client.calls(
        in_memory_cache.get("AGENT_FIRST.twilio_callsid")
    ).update(twiml=response)
    client.calls(
        in_memory_cache.get("AGENT_SECOND.twilio_callsid")
    ).update(twiml=response)

    print(response)


async def handle_twilio_logic(
    agent_id_path: str, data: Dict[str, Any]
) -> Optional[str]:
    """Handle Twilio-specific operations."""
    try:
        agent_type = retellai.get_agent_type(agent_id_path)
        if 'CallSid' in data:
            in_memory_cache.set(f"{agent_type}.twilio_callsid", data['CallSid'])
            print(in_memory_cache.get_all())
        return data.get('CallSid')
    except Exception as e:
        logging.error(f"Error in handle_twilio_logic: {str(e)}")
        raise ValueError(f"Failed to handle Twilio logic: {str(e)}")
