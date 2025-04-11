from datetime import datetime, time, timedelta
from typing import Dict, Any, Optional, Tuple
import pytz
from app.core.logging_setup import logger

class BusinessHoursService:
    """Service for handling business hours logic for outbound calls"""
    
    @staticmethod
    def is_within_business_hours(
        business_information: Dict[str, Any], 
        timezone_name: str = "Europe/London"
    ) -> bool:
        """
        Check if current time is within business hours for the current day
        
        Args:
            business_information: Dictionary containing business information including hours
            timezone_name: Timezone to use for checking hours (default: Europe/London)
            
        Returns:
            Boolean indicating whether current time is within business hours
        """
        try:
            # Get current time in the specified timezone
            tz = pytz.timezone(timezone_name)
            current_time = datetime.now(tz)
            current_day = current_time.strftime("%A")  # Monday, Tuesday, etc.
            
            # Extract business hours from the business information
            business_hours = business_information.get("businessHours", {})
            day_hours = business_hours.get(current_day, {})
            
            # If no hours specified for this day, assume closed
            if not day_hours or not day_hours.get("open") or not day_hours.get("close"):
                logger.info(f"No business hours specified for {current_day}, assuming closed")
                return False
            
            # Parse open and close times
            open_time_str = day_hours.get("open", "")
            close_time_str = day_hours.get("close", "")
            
            # If either time is missing, assume closed
            if not open_time_str or not close_time_str:
                logger.info(f"Incomplete business hours for {current_day}, assuming closed")
                return False
            
            # Parse time strings into time objects
            open_time = BusinessHoursService._parse_time(open_time_str)
            close_time = BusinessHoursService._parse_time(close_time_str)
            
            if not open_time or not close_time:
                logger.warning(f"Invalid business hours format for {current_day}: open={open_time_str}, close={close_time_str}")
                return False
            
            # Convert current datetime to time for comparison
            current_time_obj = current_time.time()
            
            # Check if current time is within business hours
            is_open = open_time <= current_time_obj < close_time
            
            if not is_open:
                logger.info(f"Current time {current_time_obj} is outside business hours ({open_time}-{close_time}) for {current_day}")
            
            return is_open
            
        except Exception as e:
            logger.error(f"Error checking business hours: {str(e)}")
            # Default to closed if there's an error
            return False
    
    @staticmethod
    def _parse_time(time_str: str) -> Optional[time]:
        """
        Parse a time string in format "HH:MM" to a time object
        
        Args:
            time_str: Time string in format "HH:MM"
            
        Returns:
            time object or None if parsing fails
        """
        try:
            if not time_str:
                return None
                
            # Handle 24-hour format
            hours, minutes = map(int, time_str.split(":"))
            return time(hours, minutes)
        except Exception as e:
            logger.error(f"Error parsing time string '{time_str}': {str(e)}")
            return None
    
    @staticmethod
    def get_next_business_hours(
        business_information: Dict[str, Any], 
        timezone_name: str = "Europe/London"
    ) -> Tuple[Optional[datetime], Optional[str]]:
        """
        Get the next available business hours
        
        Args:
            business_information: Dictionary containing business information including hours
            timezone_name: Timezone to use for checking hours (default: Europe/London)
            
        Returns:
            Tuple of (next_open_datetime, day_name) or (None, None) if not found
        """
        try:
            # Get current time in the specified timezone
            tz = pytz.timezone(timezone_name)
            current_time = datetime.now(tz)
            
            # Days of the week starting from today
            days_of_week = [
                "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
            ]
            current_day_idx = current_time.weekday()  # 0 = Monday, 6 = Sunday
            
            # Reorder days to start from current day
            ordered_days = days_of_week[current_day_idx:] + days_of_week[:current_day_idx]
            
            # Extract business hours
            business_hours = business_information.get("businessHours", {})
            
            # Check today first
            today = ordered_days[0]
            today_hours = business_hours.get(today, {})
            
            if today_hours and today_hours.get("open") and today_hours.get("close"):
                open_time = BusinessHoursService._parse_time(today_hours.get("open"))
                close_time = BusinessHoursService._parse_time(today_hours.get("close"))
                
                if open_time and close_time:
                    # If current time is before opening time today
                    if current_time.time() < open_time:
                        next_open = datetime.combine(current_time.date(), open_time)
                        next_open = tz.localize(next_open) if next_open.tzinfo is None else next_open
                        return next_open, today
                    
                    # If current time is after closing time, look for next day
                    if current_time.time() >= close_time:
                        # Continue to check next days
                        pass
                    else:
                        # We're within business hours
                        return current_time, today
            
            # Check future days
            for day_offset, day_name in enumerate(ordered_days[1:], 1):
                day_hours = business_hours.get(day_name, {})
                
                if day_hours and day_hours.get("open") and day_hours.get("close"):
                    open_time = BusinessHoursService._parse_time(day_hours.get("open"))
                    
                    if open_time:
                        # Calculate the date for this future day
                        future_date = current_time.date() + timedelta(days=day_offset)
                        next_open = datetime.combine(future_date, open_time)
                        next_open = tz.localize(next_open) if next_open.tzinfo is None else next_open
                        return next_open, day_name
            
            # If no business hours found for any day
            return None, None
            
        except Exception as e:
            logger.error(f"Error getting next business hours: {str(e)}")
            return None, None

# Create a singleton instance
business_hours_service = BusinessHoursService() 