from fastapi import HTTPException, Request
from services import twilio
from services.db_queries import db_case_locator
from app.core.config import settings
from typing import Dict, Any, Tuple, Optional
import requests

from app.core.config import settings

event_id = "954138"

class AppBooking:
    def __init__(self, in_memory_cache: Any):
        self.in_memory_cache = in_memory_cache

    async def check_availability(self, event, request):
        """ For custom cal.com: GET LLM TO DESIGN THIS LOGIC. 
            PRESENT BOTH FUNCTION CALL JSON FROM RETELL,
            AND DETERMINE AVAILABILITY FROM CAL API. 
            1. check pref """

        # API endpoint for fetching all bookings
        url = 'https://api.cal.com/v1/availability'

        # Set up the headers with your API key
        params = {
            'apiKey': settings.CAL_API_KEY,
            'dateFrom': "08/05/2024",
            'dateTo': "08/06/2024",
            'username': "michael-ali-0nkdtt",
            'eventID': '954138'
        }

        # Make the GET request to fetch all bookings
        response = requests.get(url, params=params)

        # Check if the request was successful
        if response.status_code == 200:
            bookings = response.json()
            print(bookings)
        else:
            print(f"Failed to fetch bookings. Status code: {response.status_code}")
            print(response.json())

    async def cal_webhook(self, event, request):
        print('\n cal webhook function')
        """ alert to be used in retellai's built in cal.com.
            since retellai coms directly with cal.com, we have to
            manually alert our server.
             
            To consider whether we should check_avail ourselves too,
            or to leave it entirely in retellai's hands """

if __name__ == "__main__":
    app_booking = AppBooking(None)  # Passing None for in_memory_cache
    import asyncio
    asyncio.run(app_booking.check_availability(None, None))  # Passing None for event and request