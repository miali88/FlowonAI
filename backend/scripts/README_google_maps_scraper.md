# Google Maps Business Scraper

This script scrapes business information for roofers (or other businesses) from Google Maps.

## Features

- Extracts comprehensive business information:
  - Business name
  - Address
  - Phone number
  - Website URL
  - Ratings and review count
  - Business hours
  - Categories/services
  - Business description (when available)
- Saves progress periodically to prevent data loss
- Detailed logging for tracking progress
- Configurable parameters for search terms and number of results

## Requirements

- Python 3.8+
- Playwright (for browser automation)
- BeautifulSoup4 (for HTML parsing)

## Installation

The required packages should already be installed in the project's environment. If not, install them using:

```bash
pip install playwright bs4
playwright install  # Install browser binaries
```

## Usage

1. Make sure you're in the backend directory:
   ```bash
   cd backend
   ```

2. Run the script:
   ```bash
   python scripts/google_maps_scraper.py
   ```

3. The script will:
   - Open a browser window (visible by default for debugging)
   - Navigate to Google Maps with the search query "Roofers"
   - Scroll through results to load more businesses
   - Extract detailed information for up to 50 businesses
   - Save the results to a JSON file in `backend/data/roofers/`

## Customization

You can modify the following constants in the script to customize its behavior:

- `GOOGLE_MAPS_URL`: Change the Google Maps URL to search for different businesses or locations
- `MAX_BUSINESSES`: Change the maximum number of businesses to scrape
- `WAIT_BETWEEN_ACTIONS`: Adjust the time between browser actions
- `OUTPUT_DIR`: Change the directory where results are saved

## Output

The script outputs a JSON file with the following structure for each business:

```json
[
  {
    "url": "https://www.google.com/maps/place/...",
    "scraped_at": "2023-10-15T12:34:56.789012",
    "name": "ABC Roofing",
    "address": "123 Main St, El Paso, TX 79901",
    "phone": "(555) 123-4567",
    "website": "https://www.abcroofing.com",
    "rating": 4.7,
    "reviews_count": 125,
    "hours": "Monday: 8 AM - 5 PM...",
    "categories": ["Roofing Contractor", "General Contractor"],
    "description": "Family-owned roofing business serving El Paso since 1995..."
  },
  // More businesses...
]
```

## Notes

- Google Maps may detect automated browsing activity and temporarily block access. If this happens, try:
  - Reducing the scraping speed (increase `WAIT_BETWEEN_ACTIONS`)
  - Using a different IP address or proxy
  - Running in headless mode with stealth plugins
  
- Web scraping should be done responsibly:
  - Respect robots.txt
  - Don't overload the server with requests
  - Be aware of Google's Terms of Service

## Troubleshooting

- If the script can't find elements, the Google Maps interface may have changed. Update the selectors in the code.
- If you get blocked, try running with `headless=True` and adding stealth plugins. 