""" this hard codes each action and its parameters, 

but composio lets you use natural language to describe the action and its parameters.

"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, validator
import requests

class ValueModel(BaseModel):
    amount: Optional[int] = Field(None, alias="value__amount")
    currency: Optional[str] = Field(None, alias="value__currency")

class PipedriveAddLeadRequest(BaseModel):
    title: str
    owner_id: Optional[int] = None
    label_ids: Optional[List[str]] = None
    person_id: Optional[int] = None
    organization_id: Optional[int] = None
    value__amount: Optional[int] = None
    value__currency: Optional[str] = None
    expected_close_date: Optional[str] = None
    was_seen: Optional[bool] = None

    @validator('expected_close_date')
    def validate_date_format(cls, v):
        if v is not None:
            try:
                datetime.strptime(v, '%Y-%m-%d')
            except ValueError:
                raise ValueError('expected_close_date must be in YYYY-MM-DD format')
        return v

    @validator('person_id', 'organization_id')
    def validate_contact_info(cls, v, values, field):
        if field.name == 'organization_id' and v is None and values.get('person_id') is None:
            raise ValueError('Either person_id or organization_id must be provided')
        return v

def execute_pipedrive_add_lead(
    api_key: str,
    connected_account_id: str,
    lead_data: dict
) -> dict:
    """
    Execute the Pipedrive Add Lead action with validation.
    
    Args:
        api_key: The API key for authentication
        connected_account_id: The connected account ID
        lead_data: Dictionary containing lead information
    
    Returns:
        dict: The response from the API
    """
    # Validate input data
    validated_data = PipedriveAddLeadRequest(**lead_data)
    
    url = "https://backend.composio.dev/api/v2/actions/PIPEDRIVE_ADD_A_LEAD/execute"
    
    payload = {
        "connectedAccountId": connected_account_id,
        "input": validated_data.dict(exclude_none=True),
        "sessionInfo": {
            "sessionId": "",
            "metadata": {}
        }
    }
    
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

# Example usage
if __name__ == "__main__":
    # Example lead data
    lead_data = {
        "title": "New Lead Example",
        "person_id": 123,  # Optional if organization_id is provided
        "expected_close_date": "2024-12-31",  # Optional
        "value__amount": 1000,  # Optional
        "value__currency": "USD"  # Optional
    }
    
    try:
        result = execute_pipedrive_add_lead(
            api_key="your_api_key",
            connected_account_id="your_connected_account_id",
            lead_data=lead_data
        )
        print(result)
    except ValueError as e:
        print(f"Validation error: {e}")
    except Exception as e:
        print(f"Error: {e}")
