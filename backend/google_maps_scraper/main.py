#!/usr/bin/env python
"""
Google Maps Business Scraper

This script scrapes business information for roofers from Google Maps.
It uses Playwright for browser automation and BeautifulSoup for HTML parsing.
"""

import os
import json
import time
import sys
from pathlib import Path

# Add the parent directory to Python path so we can import the logging setup
sys.path.append(str(Path(__file__).parent.parent))
from app.core.logging_setup import logger

import asyncio
import csv
from typing import List, Dict, Any
from datetime import datetime

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Page

# Constants
GOOGLE_MAPS_URL = "https://www.google.com/maps/search/hvac/@32.971775,-117.1325458,11z?entry=ttu&g_ep=EgoyMDI1MDMzMS4wIKXMDSoJLDEwMjExNDU1SAFQAw%3D%3D"
OUTPUT_DIR = Path("../data/roofers")
OUTPUT_FILE = OUTPUT_DIR / f"roofers_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
OUTPUT_CSV_FILE = OUTPUT_DIR / f"roofers_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
WAIT_BETWEEN_ACTIONS = 1  # seconds
MAX_BUSINESSES = 200  # maximum number of businesses to scrape


async def setup_browser():
    """Initialize and return a playwright browser instance."""
    logger.info("Setting up browser...")
    playwright = await async_playwright().start()
    browser = await playwright.chromium.launch(
        headless=False,  # Set to False for debugging
        args=['--disable-blink-features=AutomationControlled']  # Hide automation
    )
    context = await browser.new_context(
        viewport={"width": 1280, "height": 800},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        permissions=['geolocation'],
        geolocation={'latitude': 32.9652723, 'longitude': -117.1325451},
    )
    
    # Add stealth scripts
    await context.add_init_script("""
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined
        });
    """)
    
    page = await context.new_page()
    logger.info("Browser setup complete")
    return playwright, browser, context, page


async def navigate_to_maps(page: Page) -> None:
    """Navigate to Google Maps and wait for the results to load."""
    try:
        logger.info(f"Navigating to Google Maps: {GOOGLE_MAPS_URL}")
        await page.goto(GOOGLE_MAPS_URL, wait_until='networkidle')
        logger.info("Page loaded, waiting for search results...")
        
        # Wait for either the feed or the consent dialog
        result = await page.wait_for_selector('div[role="feed"], button[aria-label*="Accept"]', timeout=30000)
        
        # Check if we need to handle consent
        if result and 'Accept' in (await result.get_attribute('aria-label') or ''):
            logger.info("Detected consent dialog, accepting...")
            await result.click()
            await page.wait_for_selector('div[role="feed"]', timeout=30000)
        
        logger.info("Search results loaded successfully")
        await asyncio.sleep(WAIT_BETWEEN_ACTIONS * 2)  # Give extra time for dynamic content
        
    except Exception as e:
        logger.error(f"Error during navigation: {str(e)}")
        # Save screenshot for debugging
        await page.screenshot(path='error_screenshot.png')
        raise


async def scroll_results(page: Page, max_scrolls: int = 60) -> None:
    """Scroll through the results to load more businesses."""
    results_container = await page.query_selector('div[role="feed"]')
    if not results_container:
        logger.warning("Could not find results container for scrolling")
        return

    logger.info(f"Scrolling through results (max {max_scrolls} scrolls)...")
    for i in range(max_scrolls):
        logger.info(f"Scroll {i+1}/{max_scrolls}")
        await results_container.evaluate('(element) => { element.scrollTop = element.scrollHeight; }')
        await asyncio.sleep(WAIT_BETWEEN_ACTIONS)


async def get_business_links(page: Page) -> List[str]:
    """Extract links to business profiles from the search results."""
    logger.info("Extracting business links...")
    # Find all business result elements
    elements = await page.query_selector_all('div[role="feed"] > div a[href^="https://www.google.com/maps/place"]')
    
    # Extract href attributes
    links = []
    for element in elements:
        href = await element.get_attribute('href')
        if href and href not in links:
            links.append(href)
    
    logger.info(f"Found {len(links)} business links")
    return links[:MAX_BUSINESSES]  # Limit to MAX_BUSINESSES


async def extract_business_info(page: Page, url: str) -> Dict[str, Any]:
    """Visit a business profile page and extract all relevant information."""
    logger.info(f"Extracting info from: {url}")
    await page.goto(url)
    await asyncio.sleep(WAIT_BETWEEN_ACTIONS * 2)  # Give more time for the business page to load
    
    # Get the page HTML for parsing with BeautifulSoup
    html_content = await page.content()
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Extract business information
    business_info = {
        "url": url,
        "scraped_at": datetime.now().isoformat(),
    }
    
    # Business name is usually in an h1 element
    name_element = await page.query_selector('h1')
    if name_element:
        business_info["name"] = await name_element.inner_text()
        logger.info(f"Found business: {business_info['name']}")
    
    # Extract address
    address_element = await page.query_selector('button[data-item-id="address"]')
    if address_element:
        business_info["address"] = await address_element.inner_text()
    
    # Extract phone
    phone_element = await page.query_selector('button[data-item-id^="phone:tel"]')
    if phone_element:
        business_info["phone"] = await phone_element.inner_text()
    
    # Extract website
    website_element = await page.query_selector('a[data-item-id^="authority"]')
    if website_element:
        business_info["website"] = await website_element.get_attribute('href')
    
    # Extract rating and reviews
    rating_element = await page.query_selector('div.fontBodyMedium span[aria-hidden="true"]')
    if rating_element:
        rating_text = await rating_element.inner_text()
        try:
            business_info["rating"] = float(rating_text.split()[0])
            reviews_text = rating_text.split("(")[1].split(")")[0] if "(" in rating_text else ""
            if reviews_text:
                business_info["reviews_count"] = int(reviews_text.replace(",", ""))
        except (IndexError, ValueError) as e:
            logger.warning(f"Error parsing rating: {e}")
    
    # Extract business hours
    hours_element = await page.query_selector('div[aria-label^="Hours"]')
    if hours_element:
        hours_text = await hours_element.inner_text()
        business_info["hours"] = hours_text
    
    # Extract services/categories
    categories = []
    category_elements = await page.query_selector_all('button[jsaction="pane.rating.category"]')
    for element in category_elements:
        category = await element.inner_text()
        categories.append(category)
    
    if categories:
        business_info["categories"] = categories
    
    # Extract description if available
    description_element = await page.query_selector('div[data-attrid="kc:/local:merchant content"]')
    if description_element:
        business_info["description"] = await description_element.inner_text()
    
    return business_info


async def scrape_businesses() -> List[Dict[str, Any]]:
    """Main function to scrape businesses from Google Maps."""
    playwright, browser, context, page = await setup_browser()
    
    try:
        await navigate_to_maps(page)
        await scroll_results(page)
        business_links = await get_business_links(page)
        
        all_businesses = []
        for i, link in enumerate(business_links):
            logger.info(f"Processing business {i+1}/{len(business_links)}")
            try:
                business_info = await extract_business_info(page, link)
                all_businesses.append(business_info)
            except Exception as e:
                logger.error(f"Error processing business {link}: {e}")
                
            # Save progress after each business
            if all_businesses and i % 5 == 0:
                save_results(all_businesses)
        
        return all_businesses
    
    finally:
        logger.info("Closing browser...")
        await browser.close()
        await playwright.stop()


def save_results(businesses: List[Dict[str, Any]]) -> None:
    """Save the scraped data to JSON and CSV files."""
    # Create output directory if it doesn't exist
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save to JSON
    logger.info(f"Saving {len(businesses)} businesses to {OUTPUT_FILE}")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(businesses, f, indent=2, ensure_ascii=False)
    
    # Save to CSV
    logger.info(f"Saving {len(businesses)} businesses to {OUTPUT_CSV_FILE}")
    
    # Get all possible field names from all businesses
    fieldnames = set()
    for business in businesses:
        fieldnames.update(business.keys())
    
    # Sort fieldnames for consistent column order, with common fields first
    priority_fields = ['name', 'address', 'phone', 'website', 'rating', 'reviews_count', 'categories', 'hours', 'description', 'url', 'scraped_at']
    sorted_fieldnames = [field for field in priority_fields if field in fieldnames]
    sorted_fieldnames.extend(sorted([field for field in fieldnames if field not in priority_fields]))
    
    with open(OUTPUT_CSV_FILE, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=sorted_fieldnames)
        writer.writeheader()
        
        for business in businesses:
            # Handle special fields that might need formatting
            row = business.copy()
            
            # Convert categories list to string if present
            if 'categories' in row and isinstance(row['categories'], list):
                row['categories'] = ', '.join(row['categories'])
                
            writer.writerow(row)
    
    logger.info(f"CSV export completed to {OUTPUT_CSV_FILE}")


async def main():
    """Main entry point."""
    logger.info("Starting Google Maps roofer business scraper...")
    start_time = time.time()
    
    try:
        businesses = await scrape_businesses()
        save_results(businesses)
        
        elapsed_time = time.time() - start_time
        logger.info(f"Scraping completed in {elapsed_time:.2f} seconds")
        logger.info(f"Scraped {len(businesses)} businesses")
        logger.info(f"Results saved to {OUTPUT_FILE} and {OUTPUT_CSV_FILE}")
    
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise


if __name__ == "__main__":
    # Create data directory if it doesn't exist
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Run the scraper
    asyncio.run(main()) 