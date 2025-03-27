from app.core.logging_setup import logger
from typing import Tuple

# Map country codes to language codes
COUNTRY_TO_LANGUAGE = {
    # English-speaking countries with specific dialects
    "GB": "en-GB",  # United Kingdom (ISO code)
    "UK": "en-GB",  # United Kingdom (common code)
    "IE": "en-GB",  # Ireland uses British English
    "US": "en-US",  # United States
    "CA": "en-US",  # Canada uses American English
    "AU": "en-US",  # Australia defaults to US English for now
    "NZ": "en-US",  # New Zealand defaults to US English for now
}

# Map common country codes to ISO codes
COUNTRY_CODE_ALIASES = {
    "UK": "GB",  # Map UK to the ISO standard GB
}

# Default language if country not found
DEFAULT_LANGUAGE = "en-US"

def normalize_country_code(code: str) -> str:
    """
    Normalize country codes to their ISO standard form.
    For example, converts 'UK' to 'GB'.
    """
    return COUNTRY_CODE_ALIASES.get(code, code)

def extract_country_and_language(address: str | None) -> Tuple[str, str]:
    """
    Extract country code from address and determine the appropriate language.
    
    Args:
        address: The full address string, can be None
        
    Returns:
        Tuple of (country_code, language_code)
    """
    # Default to US if no address provided
    country_code = "US"
    
    if address:
        # Try to extract country code from the last part of the address
        address_parts = address.split(',')
        if len(address_parts) > 0:
            last_part = address_parts[-1].strip().upper()
            # Check if it's a valid 2-letter country code
            if len(last_part) == 2 and last_part.isalpha():
                country_code = last_part
                normalized_code = normalize_country_code(country_code)
                if normalized_code != country_code:
                    logger.info(f"Normalized country code from {country_code} to {normalized_code}")
                    country_code = normalized_code
                logger.info(f"Extracted country code from address: {country_code}")
    
    # Get language based on country code
    language_code = COUNTRY_TO_LANGUAGE.get(country_code, DEFAULT_LANGUAGE)
    logger.info(f"Setting agent language to {language_code} based on country code {country_code}")
    
    return country_code, language_code 