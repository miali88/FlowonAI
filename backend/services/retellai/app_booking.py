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


    """ GET LLM TO DESIGN THIS LOGIC. PRESENT BOTH FUNCTION CALL JSON FROM RETELL,
        AND DETERMINE AVAILABILITY FROM CAL API. 
        1. check pref """
    async def check_availability():

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


if __name__ == "__main__":
    AppBooking.check_availability()