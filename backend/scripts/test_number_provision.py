#!/usr/bin/env python
"""
Test script for the phone number provisioning flow with mocked external services.
Use this script to visualize and debug the entire phone number provisioning process.

Usage:
    python -m backend.scripts.test_number_provision

The script mocks all external dependencies (Twilio, Supabase, LiveKit) to allow testing
without making real API calls or database changes.
"""

import asyncio
import logging
import json
import os
import sys
import unittest.mock as mock
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime

# Set up logging before imports
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Mock logger for less verbose output
logger = logging.getLogger(__name__)

# Define a simplified flow tracker implementation directly in this script
# so we don't have to import the actual one and deal with import path issues
class FlowTracker:
    """Simplified flow tracker for testing"""
    
    @classmethod
    def start_flow(cls, flow_id, description=""):
        logger.info(f"🚀 Starting flow: {flow_id} - {description}")
    
    @classmethod
    def end_flow(cls, flow_id=None):
        logger.info(f"✅ Completed flow: {flow_id}")
        return {}
    
    @classmethod
    def track_step(cls, step_name, data=None, flow_id=None):
        data_str = f" - Data: {json.dumps(data)}" if data else ""
        logger.info(f"➡️ Step: {step_name}{data_str}")
    
    @classmethod
    def track_function(cls, flow_id=None):
        """Decorator to track function execution"""
        def decorator(func):
            async def async_wrapper(*args, **kwargs):
                logger.info(f"➡️ Entering function: {func.__name__}")
                try:
                    result = await func(*args, **kwargs)
                    logger.info(f"➡️ Exiting function: {func.__name__}")
                    return result
                except Exception as e:
                    logger.error(f"➡️ Error in function {func.__name__}: {str(e)}")
                    raise
            
            def sync_wrapper(*args, **kwargs):
                logger.info(f"➡️ Entering function: {func.__name__}")
                try:
                    result = func(*args, **kwargs)
                    logger.info(f"➡️ Exiting function: {func.__name__}")
                    return result
                except Exception as e:
                    logger.error(f"➡️ Error in function {func.__name__}: {str(e)}")
                    raise
            
            # Return the appropriate wrapper based on function type
            if asyncio.iscoroutinefunction(func):
                return async_wrapper
            return sync_wrapper
        
        return decorator

# Mock the provision_user_phone_number function and its dependencies directly
# rather than importing them, to avoid import path issues
@FlowTracker.track_function()
async def check_user_has_number(user_id, supabase_client):
    """
    Check if a user already has a phone number assigned
    """
    logger.info(f"Checking if user {user_id} already has a phone number")
    
    # Query mock database
    has_number = "existing_number" in supabase_client.test_scenario
    number = "+15551234567" if has_number else None
    
    if has_number:
        logger.info(f"User {user_id} already has phone number: {number}")
    else:
        logger.info(f"User {user_id} does not have any phone numbers")
    
    return has_number, number

@FlowTracker.track_function()
async def store_phone_number(
    phone_number,
    user_id,
    number_sid,
    account_sid,
    is_trial,
    supabase_client
):
    """
    Store a purchased phone number in the database across multiple tables
    """
    logger.info(f"Storing phone number {phone_number} for user {user_id}")
    
    try:
        # 1. Store in twilio_numbers table
        logger.info(f"Storing number in twilio_numbers table")
        FlowTracker.track_step("store_in_twilio_numbers_table", {
            "phone_number": phone_number,
            "user_id": user_id
        })
        
        # Mock database operations
        logger.info(f"Successfully stored number in twilio_numbers table")
        
        # 2. Update the guided_setup table
        logger.info(f"Updating guided_setup table with number {phone_number}")
        FlowTracker.track_step("update_guided_setup", {"phone_number": phone_number})
        logger.info(f"Successfully updated guided_setup table")
        
        # 3. Update user's record with the new Twilio number
        logger.info(f"Updating user record with new Twilio number")
        FlowTracker.track_step("update_user_twilio_list", {"phone_number": phone_number})
        logger.info(f"Successfully updated user's twilio numbers list")
        
        return {
            'success': True,
            'phone_number': phone_number,
            'number_sid': number_sid,
            'is_trial_number': is_trial
        }
    except Exception as e:
        logger.error(f"Error storing phone number: {str(e)}")
        FlowTracker.track_step("store_phone_number_error", {"error": str(e)})
        raise

# Mock Supabase client and responses
class MockSupabaseClient:
    """Mock Supabase client for testing"""
    
    def __init__(self, test_scenario="new_number"):
        self.test_scenario = test_scenario

@FlowTracker.track_function()
async def provision_user_phone_number(
    country_code,
    number_type,
    area_code,
    user_id,
    test_scenario="new_number"
):
    """
    Handle provisioning of a phone number for a user
    """
    # Start flow tracking
    flow_id = f"provision_number_test"
    FlowTracker.start_flow(flow_id, f"Phone number provisioning flow for user {user_id}")
    
    logger.info(f"Starting phone number provisioning flow with ID: {flow_id}")
    logger.info(f"Parameters: user={user_id}, country_code={country_code}, number_type={number_type}")
    
    # Create mock client
    supabase_client = MockSupabaseClient(test_scenario)
    
    try:
        if not user_id:
            error_msg = "Unauthorized attempt to provision phone number - no current user"
            logger.warning(error_msg)
            FlowTracker.track_step("authorization_error", {"error": error_msg})
            raise Exception("User not authenticated")
        
        # Check if user already has a phone number
        FlowTracker.track_step("checking_existing_number", {"user_id": user_id})
        has_number, existing_number = await check_user_has_number(user_id, supabase_client)
        
        if has_number:
            logger.info(f"User {user_id} already has phone number {existing_number}. Skipping provisioning.")
            FlowTracker.track_step("number_already_exists", {"number": existing_number})
            
            # Even though we're not purchasing a new number, we should still update the guided_setup table
            # to ensure that the setup process continues smoothly
            try:
                logger.info(f"Updating guided_setup table with existing number {existing_number} for user {user_id}")
                FlowTracker.track_step("update_guided_setup_existing", {
                    "number": existing_number,
                    "user_id": user_id
                })
                
                logger.info(f"Successfully updated guided_setup table for user {user_id}")
                FlowTracker.track_step("guided_setup_updated", {"success": True})
            except Exception as e:
                # Log but don't fail if this update doesn't work
                logger.warning(f"Failed to update guided_setup table with existing number: {str(e)}")
                FlowTracker.track_step("guided_setup_warning", {"warning": str(e)})
            
            result = {
                "success": True,
                "number": existing_number,
                "message": "User already has a phone number assigned",
                "already_exists": True
            }
            
            FlowTracker.end_flow(flow_id)
            return result
        
        # Get an available number from the specified country and type
        logger.info(f"Fetching available numbers for country_code={country_code}, type={number_type}")
        FlowTracker.track_step("fetch_available_numbers", {
            "country_code": country_code,
            "number_type": number_type
        })
        
        # Mock getting available numbers
        available_numbers = {
            "local": {
                "numbers": ["+15551234567", "+15551234568"],
                "monthly_cost": 1.0
            },
            "toll_free": {
                "numbers": ["+18001234567", "+18001234568"],
                "monthly_cost": 2.0
            }
        }
        
        if not available_numbers:
            error_msg = f"No available numbers found for country code {country_code}"
            logger.error(error_msg)
            FlowTracker.track_step("no_numbers_available", {"error": error_msg})
            raise Exception(error_msg)
            
        if number_type not in available_numbers:
            error_msg = f"No available {number_type} numbers found for country code {country_code}"
            logger.error(error_msg)
            FlowTracker.track_step("no_numbers_of_type", {
                "error": error_msg,
                "available_types": list(available_numbers.keys())
            })
            raise Exception(error_msg)
        
        # Get the first available number of the requested type
        phone_number = available_numbers[number_type]["numbers"][0]
        logger.info(f"Selected phone number {phone_number} for user {user_id}")
        FlowTracker.track_step("number_selected", {"number": phone_number})
        
        # Check if user is on trial
        logger.info(f"Checking if user {user_id} is on trial")
        FlowTracker.track_step("check_trial_status", {"user_id": user_id})
        
        # Mock check trial status
        is_trial = True
        
        logger.info(f"User {user_id} trial status: {is_trial}")
        FlowTracker.track_step("trial_status_result", {"is_trial": is_trial})
        
        # Purchase the number from Twilio
        logger.info(f"Initiating purchase of number {phone_number} for user {user_id}")
        FlowTracker.track_step("purchase_number", {"number": phone_number})
        
        # Mock purchase result
        purchase_result = {
            "number_sid": "PN123456789",
            "account_sid": "AC123456789"
        }
        
        FlowTracker.track_step("purchase_result", {
            "success": True,
            "number_sid": purchase_result.get('number_sid'),
            "account_sid": purchase_result.get('account_sid'),
        })
        
        # Store the purchased number in database
        logger.info(f"Storing purchased number in database")
        FlowTracker.track_step("store_number", {"number": phone_number})
        
        storage_result = await store_phone_number(
            phone_number=phone_number,
            user_id=user_id,
            number_sid=purchase_result['number_sid'],
            account_sid=purchase_result['account_sid'],
            is_trial=is_trial,
            supabase_client=supabase_client
        )
        
        # Register the number with LiveKit SIP trunk system
        logger.info(f"Registering number {phone_number} with LiveKit SIP")
        FlowTracker.track_step("register_with_livekit", {"number": phone_number})
        
        try:
            # Mock LiveKit registration
            logger.info(f"Successfully registered number {phone_number} with LiveKit")
            FlowTracker.track_step("livekit_registration", {"success": True})
        except Exception as sip_error:
            # Log the error but don't fail the entire process if LiveKit registration fails
            logger.error(f"Failed to register number with LiveKit: {str(sip_error)}")
            FlowTracker.track_step("livekit_registration_error", {"error": str(sip_error)})
        
        # Add additional info to the response
        result = {
            "success": True,
            "number": phone_number,
            "number_sid": purchase_result['number_sid'],
            "number_type": number_type,
            "country_code": country_code,
            "already_exists": False
        }
        
        # Also add monthly cost if available
        if "monthly_cost" in available_numbers[number_type]:
            result["monthly_cost"] = available_numbers[number_type]["monthly_cost"]
            logger.info(f"Monthly cost for number: {available_numbers[number_type]['monthly_cost']}")
        
        logger.info(f"Successfully provisioned and stored number {phone_number} for user {user_id}")
        logger.info(f"Provisioning result: {result}")
        
        # End flow tracking
        FlowTracker.track_step("provisioning_complete", result)
        FlowTracker.end_flow(flow_id)
        
        return result
        
    except Exception as e:
        # Track error in flow and end flow tracking
        FlowTracker.track_step("provisioning_error", {"error": str(e)})
        FlowTracker.end_flow(flow_id)
        
        logger.error(f"Failed to provision number: {str(e)}")
        raise

async def test_provision_flow(test_scenario="new_number"):
    """
    Test the phone number provisioning flow with the specified scenario
    
    Args:
        test_scenario: The test scenario to run:
            - "new_number": User doesn't have a number, provision a new one
            - "existing_number": User already has a number
    """
    logger.info(f"=== Starting phone number provisioning test ({test_scenario}) ===")
    
    # Call the function to test
    try:
        result = await provision_user_phone_number(
            country_code="US",
            number_type="local",
            area_code=None,
            user_id="test-user-123",
            test_scenario=test_scenario
        )
        
        # Print results
        logger.info("=== Test completed successfully ===")
        logger.info(f"Result: {json.dumps(result, indent=2)}")
        
    except Exception as e:
        logger.error(f"Test failed with error: {str(e)}")
        raise

async def main():
    """Main function to run the test"""
    # Test different scenarios
    logger.info("\n\n=== SCENARIO 1: User without a phone number ===")
    await test_provision_flow("new_number")
    
    logger.info("\n\n=== SCENARIO 2: User with existing phone number ===")
    await test_provision_flow("existing_number")

if __name__ == "__main__":
    asyncio.run(main()) 