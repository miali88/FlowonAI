from composio_openai import Action # type: ignore
from openai import OpenAI
from typing import Dict, Optional, List, Any
from datetime import datetime, timedelta
import logging
import pytz # type: ignore
from dotenv import load_dotenv
from composio import ComposioToolSet, Composio

load_dotenv()

# Initialize the Composio client
client = Composio()
logger = logging.getLogger(__name__)


async def get_calendar_slots(user_id: str, app: str) -> Any:
    print("Getting calendar slots..")
    entity_id = user_id
    openai_client = OpenAI()
    today = datetime.now().strftime("%Y-%m-%d")
    current_time = datetime.now().strftime("%H:%M")

    composio_toolset = ComposioToolSet(entity_id=entity_id)

    tools = composio_toolset.get_tools(actions=[Action.GOOGLECALENDAR_FIND_FREE_SLOTS])

    task = (
        f"Search for free slots for the next 14 days for id michael@flowon.ai. "
        f"Today's date is {today}. Current time is {current_time}."
    )

    response = openai_client.chat.completions.create(
        model="gpt-4o",
        tools=tools,
        messages=[
            {
                "role": "system",
                "content": (
                    f"You are a helpful assistant helping to manage "
                    f"the user's calendar. "
                    f"Today's date is {today}. Current time is {current_time}."
                )
            },
            {
                "role": "user",
                "content": task
            },
        ],
    )
    result = composio_toolset.handle_tool_calls(response)

    busy_slots = result[0]['data']['response_data']['calendars'][
        'michael@flowon.ai']['busy']

    free_slots = await find_free_slots(busy_slots)

    return free_slots


async def find_free_slots(calendar_data: Any, num_slots: int = 32, duration_minutes: int = 30) -> Dict[str, Any]:
    busy_slots = calendar_data

    # Convert to datetime objects and sort
    busy_slots = [(datetime.fromisoformat(slot['start'].replace('Z', '+00:00')),
                   datetime.fromisoformat(slot['end'].replace('Z', '+00:00')))
                  for slot in busy_slots]
    busy_slots.sort()

    # Start from current time
    current_time = datetime.now(pytz.UTC)
    # Round up to the next half hour
    current_time = current_time + timedelta(minutes=(30 - current_time.minute % 30))

    free_slots: List[Dict[str, Any]] = []
    formatted_slots: Dict[str, Any] = {}  # New dictionary to store slots by date
    # Look ahead for 5 business days
    days_to_check = 5
    current_day = current_time.date()

    while len(free_slots) < num_slots and days_to_check > 0:
        # Set day start to 9 AM
        day_start = datetime.combine(
            current_day,
            datetime.min.time().replace(hour=9),
            tzinfo=pytz.UTC
        )
        day_end = datetime.combine(
            current_day,
            datetime.min.time().replace(hour=17),
            tzinfo=pytz.UTC
        )

        # If it's today, start from current time
        if current_day == current_time.date():
            day_start = max(day_start, current_time)

        # Get busy slots for this day
        day_busy_slots = [
            slot for slot
            in busy_slots
            if slot[0].date() == current_day
        ]

        slot_start = day_start

        # Create formatted date string for this day
        date_str = current_day.strftime("%dth %A %B %Y")
        formatted_slots[date_str] = []  # Initialize empty list for this date

        # If there are busy slots on this day
        if day_busy_slots:
            for busy_start, busy_end in day_busy_slots:
                while (
                    slot_start + timedelta(minutes=duration_minutes) <= busy_start
                    and slot_start + timedelta(minutes=duration_minutes) <= day_end
                ):
                    slot_info = {
                        'start': slot_start.isoformat(),
                        'end': (
                            (
                                slot_start + timedelta(minutes=duration_minutes)
                            ).isoformat()
                        )
                    }
                    free_slots.append(slot_info)
                    # Format time without leading zeros and remove ":00" if present
                    time_str = slot_start.strftime("%I:%M %p").lstrip("0")
                    if time_str.endswith(":00 AM") or time_str.endswith(":00 PM"):
                        time_str = time_str.replace(":00", "")
                    formatted_slots[date_str].append(time_str)

                    slot_start += timedelta(minutes=duration_minutes)
                    if len(free_slots) >= num_slots:
                        return {"formatted": formatted_slots}
                        # return {"raw": free_slots, "formatted": formatted_slots}

                slot_start = max(slot_start, busy_end)

        # Check remaining time until end of business day
        while slot_start + timedelta(minutes=duration_minutes) <= day_end:
            slot_info = {
                'start': slot_start.isoformat(),
                'end': (slot_start + timedelta(minutes=duration_minutes)).isoformat()
            }
            free_slots.append(slot_info)
            # Format time without leading zeros and remove ":00" if present
            time_str = slot_start.strftime("%I:%M %p").lstrip("0")
            if time_str.endswith(":00 AM") or time_str.endswith(":00 PM"):
                time_str = time_str.replace(":00", "")
            formatted_slots[date_str].append(time_str)

            slot_start += timedelta(minutes=duration_minutes)
            if len(free_slots) >= num_slots:
                return {"formatted": formatted_slots}
        #        return {"raw": free_slots, "formatted": formatted_slots}

        # Move to next day
        current_day += timedelta(days=1)
        days_to_check -= 1

    # return {"raw": free_slots,"formatted": formatted_slots}
    return {"formatted": formatted_slots}


async def book_appointment_composio(appointment_details: str, user_id: str) -> Any:
    logger.info(f"Starting appointment booking for user_id: {user_id}")
    print("\n\n\n\n\nfunc book_appointment_composio: booking")

    entity_id = user_id
    openai_client = OpenAI()
    today = datetime.now().strftime("%Y-%m-%d")
    current_time = datetime.now().strftime("%H:%M")

    logger.debug(f"Initializing ComposioToolSet for entity_id: {entity_id}")
    composio_toolset = ComposioToolSet(entity_id=entity_id)

    logger.debug("Getting calendar tools")
    tools = composio_toolset.get_tools(actions=[Action.GOOGLECALENDAR_CREATE_EVENT])

    task = (
        f"Book an appointment on the user's calendar with the following details: "
        f"{appointment_details}. Today's date is {today}. "
        f"Current time is {current_time}."
    )
    logger.debug(f"Created task: {task}")

    try:
        logger.debug("Making OpenAI API call")
        response = openai_client.chat.completions.create(
            model="gpt-4o",
            tools=tools,
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are a helpful assistant helping to manage the "
                        f"user's calendar. "
                        f"Today's date is {today}. Current time is {current_time}."
                    )
                },
                {"role": "user", "content": task},
            ],
        )
        logger.debug("OpenAI API call successful")

        logger.debug("Handling tool calls")
        result = composio_toolset.handle_tool_calls(response)

        # # Add check for empty result
        # if not result:
        #     logger.error("No result returned from tool calls")
        #     return "Appointment booking failed: No response from calendar service"

        # if result[0].get('successfull') == True:
        # Note: also using .get() for safer access
        #     logger.info("Event created successfully")
        #     print("Event created successfully")
        #     return "Appointment booked successfully."
        # else:
        #     logger.error(f"Event creation failed: {result}")
        #     print("Event creation failed")
        #     return "Appointment booking failed."

        return result

    except Exception as e:
        logger.error(f"Unexpected error during appointment booking: {str(e)}")
        return "Appointment booking failed due to an unexpected error."


async def get_notion_database(database_name: str) -> Optional[Dict]:
    try:
        # Initialize clients
        openai_client = OpenAI()
        composio_toolset = ComposioToolSet(entity_id="Jessica")
        # You might want to make this dynamic

        # Search for the database
        tools = composio_toolset.get_tools(actions=[Action.NOTION_SEARCH_NOTION_PAGE])

        search_response = openai_client.chat.completions.create(
            model="gpt-4o",
            tools=tools,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant."
                },
                {
                    "role": "user",
                    "content": (
                        f"Search for a database called {database_name} in my "
                        "Notion workspace"
                    )
                },
            ],
        )
        search_result = composio_toolset.handle_tool_calls(search_response)

        # Extract database ID
        db_id = search_result[0]['data']['response_data']['results'][0]['id']

        # Query the database contents
        tools = composio_toolset.get_tools(actions=[Action.NOTION_QUERY_DATABASE])

        query_response = openai_client.chat.completions.create(
            model="gpt-4o",
            tools=tools,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant."
                },
                {
                    "role": "user",
                    "content": f"Get the contents of the database with ID {db_id}"
                },
            ],
        )
        query_result = composio_toolset.handle_tool_calls(query_response)

        return {
            "database_id": db_id,
            "contents": query_result
        }

    except Exception as e:
        logger.error(f"Error getting Notion database: {e}")
        return None
