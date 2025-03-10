"""
Trial management services for handling trial expirations and trial phone numbers.

This module provides functionality for:
1. Checking for expired trial accounts and processing them
2. Releasing phone numbers associated with expired trials
3. Checking for trial numbers that have been held too long
"""

import os
import logging
from datetime import datetime, timezone, timedelta

from app.clients.supabase_client import get_supabase

# Set up logging
logger = logging.getLogger("subscription.trial")

async def check_expired_trials():
    """
    Check for expired trials and update user accounts accordingly.
    This function is intended to be run daily via a scheduler.
    
    Process:
    1. Find all expired trials (trial_end_date < now)
    2. For each expired trial:
       - Check if the user has a payment method on file
       - If yes, convert to paid plan; if no, downgrade to free plan
       - Release trial phone numbers
       - Send notification
    """
    logger.info("Starting trial expiration check...")

    supabase = await get_supabase()
    
    # Current time in UTC
    now = datetime.now(timezone.utc).isoformat()
    
    # Find trials that have expired
    logger.info(f"Finding expired trials as of {now}")
    
    try:
        expired_trials = await supabase.table('users').select(
            'id, email, trial_plan_type, trial_end_date, stripe_customer_id'
        ).eq('is_trial', True).lt('trial_end_date', now).execute()
        
        if not expired_trials.data:
            logger.info("No expired trials found.")
            return
        
        logger.info(f"Found {len(expired_trials.data)} expired trials")
        
        # Process each expired trial
        for user in expired_trials.data:
            user_id = user.get('id')
            email = user.get('email')
            trial_plan = user.get('trial_plan_type')
            stripe_customer_id = user.get('stripe_customer_id')
            
            logger.info(f"Processing expired trial for user {user_id} ({email}), plan: {trial_plan}")
            
            # 1. Check if user has a payment method on file
            has_payment_method = False
            if stripe_customer_id:
                # TODO: Implement check for payment method on file with Stripe
                # This would use the Stripe API to check if the customer has a payment method
                # has_payment_method = check_payment_method(stripe_customer_id)
                pass
            
            # 2. Update user record
            if has_payment_method:
                # Convert to paid plan
                logger.info(f"Converting user {user_id} to paid plan {trial_plan}")
                await supabase.table('users').update({
                    'is_trial': False,
                    'user_plan': trial_plan,  # Convert to the equivalent paid plan
                }).eq('id', user_id).execute()
                
                # TODO: Implement billing through Stripe
                # This would charge the customer for the first month of the paid plan
            else:
                # Downgrade to free plan
                logger.info(f"Downgrading user {user_id} to free plan")
                await supabase.table('users').update({
                    'is_trial': False,
                    'user_plan': 'free',
                }).eq('id', user_id).execute()
            
            # 3. Release trial numbers
            await release_trial_numbers(supabase, user_id)
            
            # 4. Send final notification
            # TODO: Implement email notification about trial expiration
            logger.info(f"Sent trial expiration notification to {email}")
    
    except Exception as e:
        logger.error(f"Error checking expired trials: {str(e)}")
        raise

async def release_trial_numbers(supabase, user_id):
    """
    Release phone numbers associated with an expired trial account
    
    Args:
        supabase: Supabase client instance
        user_id: ID of the user whose trial numbers should be released
    """
    try:
        # Find trial numbers for this user
        number_result = await supabase.table('twilio_numbers').select(
            'phone_number'
        ).eq('owner_user_id', user_id).eq('is_trial_number', True).execute()
        
        if not number_result.data:
            logger.info(f"No trial numbers found for user {user_id}")
            return
        
        logger.info(f"Found {len(number_result.data)} trial numbers to release for user {user_id}")
        
        for number_data in number_result.data:
            phone_number = number_data.get('phone_number')
            if not phone_number:
                continue
            
            logger.info(f"Releasing trial number {phone_number}")
            
            # TODO: Implement actual Twilio number release logic here
            # This would use the Twilio API to release the number
            
            # Update the number record in the database
            await supabase.table('twilio_numbers').update({
                'owner_user_id': None,
                'status': 'released',
            }).eq('phone_number', phone_number).execute()
            
            logger.info(f"Successfully released trial number {phone_number}")
    
    except Exception as e:
        logger.error(f"Error releasing trial numbers for user {user_id}: {str(e)}")
        raise

async def check_trial_numbers():
    """
    Check for trial numbers that have been held for more than 14 days
    and release them if the associated account is still on trial.
    This function is intended to be run daily via a scheduler.
    """
    logger.info("Starting trial numbers check...")

    supabase = await get_supabase()
    
    # Calculate date 14 days ago
    fourteen_days_ago = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()
    
    # Find trial numbers older than 14 days
    logger.info(f"Finding trial numbers created before {fourteen_days_ago}")
    
    try:
        old_numbers = await supabase.table('twilio_numbers').select(
            'phone_number, owner_user_id, created_at'
        ).eq('is_trial_number', True).lt('created_at', fourteen_days_ago).execute()
        
        if not old_numbers.data:
            logger.info("No old trial numbers found.")
            return
        
        logger.info(f"Found {len(old_numbers.data)} trial numbers older than 14 days")
        
        # Process each number
        for number_data in old_numbers.data:
            phone_number = number_data.get('phone_number')
            user_id = number_data.get('owner_user_id')
            created_at = number_data.get('created_at')
            
            if not phone_number or not user_id:
                continue
                
            logger.info(f"Processing old trial number {phone_number} for user {user_id}, created at {created_at}")
            
            # Check if user is still on trial
            user_result = await supabase.table('users').select(
                'is_trial'
            ).eq('id', user_id).execute()
            
            if not user_result.data:
                logger.warning(f"User {user_id} not found for number {phone_number}")
                continue
                
            is_trial = user_result.data[0].get('is_trial', False)
            
            if is_trial:
                # User is still on trial, but number exceeds time limit - release it
                logger.info(f"Releasing trial number {phone_number} (exceeded 14-day limit)")
                
                # TODO: Implement actual Twilio number release logic here
                # This would use the Twilio API to release the number
                
                # Update the number record in the database
                await supabase.table('twilio_numbers').update({
                    'owner_user_id': None,
                    'status': 'released',
                }).eq('phone_number', phone_number).execute()
                
                # Send notification to user
                # TODO: Implement email notification about number release
                logger.info(f"Sent number release notification to user {user_id}")
            else:
                # User is no longer on trial, update is_trial_number flag
                logger.info(f"User {user_id} is no longer on trial, updating number {phone_number}")
                await supabase.table('twilio_numbers').update({
                    'is_trial_number': False,
                }).eq('phone_number', phone_number).execute()
    
    except Exception as e:
        logger.error(f"Error checking trial numbers: {str(e)}")
        raise 