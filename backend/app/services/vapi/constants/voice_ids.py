alex_british_male = "oaGwHLz3csUaSnc2NBD4"
jess_american_female = "Ize3YDdGqJYYKQSDLORJ"

# Map country codes to voice IDs
COUNTRY_TO_VOICE = {
    # English-speaking countries
    "GB": alex_british_male,  # United Kingdom
    "IE": alex_british_male,  # Ireland
    "US": jess_american_female,  # United States
    "CA": jess_american_female,  # Canada
    "AU": jess_american_female,  # Australia
    "NZ": jess_american_female,  # New Zealand
}

# Default voice if country not found
DEFAULT_VOICE = jess_american_female

def get_voice_for_country(country_code: str) -> str:
    """Get the appropriate voice ID based on country code."""
    return COUNTRY_TO_VOICE.get(country_code, DEFAULT_VOICE)

# Legacy mapping - keep for backward compatibility
voice_ids = {
    "british_male": alex_british_male,
    "american_female": jess_american_female
}