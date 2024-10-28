import requests
from typing import List, Dict, Any

NYLAS_API_BASE_URL = "https://api.us.nylas.com/v3"
NYLAS_API_KEY = "YOUR_API_KEY"  # Replace with your actual Nylas API key

def get_calendar_events(grant_id: str, calendar_id: str = "primary", limit: int = 5) -> List[Dict[Any, Any]]:
    """
    Fetch calendar events for a given grant (email) from Nylas API.
    
    :param grant_id: The Nylas grant ID associated with the email account
    :param calendar_id: The calendar ID (default is "primary")
    :param limit: The maximum number of events to retrieve (default is 5)
    :return: A list of calendar events
    """
    url = f"{NYLAS_API_BASE_URL}/grants/{grant_id}/events"
    
    headers = {
        "Accept": "application/json",
        "Authorization": f"Bearer {NYLAS_API_KEY}",
        "Content-Type": "application/json"
    }
    
    params = {
        "calendar_id": calendar_id,
        "limit": limit
    }
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()  # Raise an exception for HTTP errors
    
    return response.json()

# ... existing code ...

