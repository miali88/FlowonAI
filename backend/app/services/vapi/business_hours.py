from datetime import datetime, time, timedelta
from typing import Dict, Any, Optional, Tuple
import pytz
from app.core.logging_setup import logger

class BusinessHoursService:
    """Service for handling working hours logic for outbound calls"""
    
    @staticmethod
    def is_within_business_hours(
        working_hours: Dict[str, Any], 
        timezone_name: str = "Europe/London"
    ) -> bool:
        """
        Check if current time is within working hours for the current day
        
        Args:
            working_hours: Dictionary containing working hours (start and end times)
            timezone_name: Timezone to use for checking hours (default: Europe/London)
            
        Returns:
            Boolean indicating whether current time is within working hours
        """
        try:
            # Get current time in the specified timezone
            tz = pytz.timezone(timezone_name)
            current_time = datetime.now(tz)
            
            # Extract working hours with defaults
            start_time_str = working_hours.get("start", "09:00")
            end_time_str = working_hours.get("end", "17:00")
            
            # Parse time strings into time objects
            start_time = BusinessHoursService._parse_time(start_time_str)
            end_time = BusinessHoursService._parse_time(end_time_str)
            
            if not start_time or not end_time:
                logger.warning(f"Invalid working hours format: start={start_time_str}, end={end_time_str}")
                return False
            
            # Convert current datetime to time for comparison
            current_time_obj = current_time.time()
            
            # Check if current time is within working hours
            is_open = start_time <= current_time_obj < end_time
            
            if not is_open:
                logger.info(f"Current time {current_time_obj} is outside working hours ({start_time}-{end_time})")
            
            return is_open
            
        except Exception as e:
            logger.error(f"Error checking working hours: {str(e)}")
            # Default to closed if there's an error
            return False
    
    @staticmethod
    def get_next_business_hours(
        working_hours: Dict[str, Any], 
        timezone_name: str = "Europe/London"
    ) -> Tuple[Optional[datetime], Optional[str]]:
        """
        Get the next available working hours
        
        Args:
            working_hours: Dictionary containing working hours (start and end times)
            timezone_name: Timezone to use for checking hours (default: Europe/London)
            
        Returns:
            Tuple of (next_open_datetime, day_name) or (None, None) if not found
        """
        try:
            # Get current time in the specified timezone
            tz = pytz.timezone(timezone_name)
            current_time = datetime.now(tz)
            
            # Extract working hours with defaults
            start_time_str = working_hours.get("start", "09:00")
            start_time = BusinessHoursService._parse_time(start_time_str)
            
            if not start_time:
                logger.warning(f"Invalid working hours format: start={start_time_str}")
                return None, None
            
            # If current time is before start time today
            if current_time.time() < start_time:
                next_open = datetime.combine(current_time.date(), start_time)
                next_open = tz.localize(next_open) if next_open.tzinfo is None else next_open
                return next_open, current_time.strftime("%A")
            
            # If current time is after start time, next opening is tomorrow
            next_date = current_time.date() + timedelta(days=1)
            next_open = datetime.combine(next_date, start_time)
            next_open = tz.localize(next_open) if next_open.tzinfo is None else next_open
            return next_open, next_date.strftime("%A")
            
        except Exception as e:
            logger.error(f"Error getting next working hours: {str(e)}")
            return None, None
    
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

# Create a singleton instance
business_hours_service = BusinessHoursService() 