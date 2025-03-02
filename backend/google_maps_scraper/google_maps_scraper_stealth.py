#!/usr/bin/env python
"""
Google Maps Business Scraper with Stealth Mode

This script scrapes business information for roofers from Google Maps using stealth techniques.
It uses Playwright with stealth plugins to avoid detection and BeautifulSoup for HTML parsing.
"""

import os
import json
import time
import random
import logging
import asyncio
import csv
from typing import List, Dict, Any, Optional
from datetime import datetime
from pathlib import Path

from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Page, BrowserContext

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger('google_maps_scraper_stealth')

# Constants
GOOGLE_MAPS_URL = "https://www.google.com/maps/search/Roofers/@31.863223,-106.5993968,33655m/data=!3m1!1e3?entry=ttu&g_ep=EgoyMDI1MDIyMy4xIKXMDSoASAFQAw%3D%3D"
OUTPUT_DIR = Path("../data/roofers")
OUTPUT_FILE = OUTPUT_DIR / f"roofers_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
OUTPUT_CSV_FILE = OUTPUT_DIR / f"roofers_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
MAX_BUSINESSES = 50  # maximum number of businesses to scrape

# User agents to rotate
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
]


async def setup_browser():
    """Initialize and return a playwright browser instance with stealth mode."""
    logger.info("Setting up browser with stealth mode...")
    playwright = await async_playwright().start()
    
    # Launch browser with stealth settings
    browser = await playwright.chromium.launch(
        headless=False,  # Set to True for production
        args=[
            '--disable-blink-features=AutomationControlled',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials',
        ]
    )
    
    # Set up context with stealth settings
    context = await browser.new_context(
        viewport={"width": 1280, "height": 800},
        user_agent=random.choice(USER_AGENTS),
        locale="en-US",
        timezone_id="America/Los_Angeles",
        geolocation={"latitude": 31.8, "longitude": -106.6},  # Near El Paso
        permissions=["geolocation"],
        is_mobile=False,
    )
    
    # Apply stealth settings to context
    await context.add_init_script("""
        // Overwrite the 'webdriver' property to prevent detection
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
        
        // Overwrite 'plugins' property
        Object.defineProperty(navigator, 'plugins', {
            get: () => [1, 2, 3, 4, 5],
        });
        
        // Overwrite languages
        Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
        });
        
        // Prevent detection via webRTC
        const getParameter = WebGLRenderingContext.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
            if (parameter === 37445) {
                return 'Intel Inc.';
            }
            if (parameter === 37446) {
                return 'Intel Iris OpenGL Engine';
            }
            return getParameter.apply(this, [parameter]);
        };
    """)
    
    page = await context.new_page()
    
    # Add page scripts for additional stealth
    await page.add_init_script("""
        // Mask that we're using Playwright/Puppeteer
        delete Object.getPrototypeOf(navigator).webdriver;
    """)
    
    return playwright, browser, context, page


async def humanize_actions():
    """Add random delays to simulate human behavior."""
    delay = random.uniform(1.0, 3.5)
    logger.debug(f"Waiting for {delay:.2f} seconds...")
    await asyncio.sleep(delay)


async def random_mouse_movements(page: Page):
    """Perform random mouse movements to appear more human-like."""
    logger.debug("Performing random mouse movements")
    
    viewport_size = await page.evaluate("""
        () => {
            return {
                width: window.innerWidth, 
                height: window.innerHeight
            }
        }
    """)
    
    width = viewport_size["width"]
    height = viewport_size["height"]
    
    # Make 2-5 random mouse movements
    for _ in range(random.randint(2, 5)):
        x = random.randint(0, width)
        y = random.randint(0, height)
        
        await page.mouse.move(x, y)
        await asyncio.sleep(random.uniform(0.1, 0.5))


async def navigate_to_maps(page: Page) -> None:
    """Navigate to Google Maps and wait for the results to load."""
    logger.info(f"Navigating to Google Maps: {GOOGLE_MAPS_URL}")
    
    # Go to Google first, then navigate to Maps
    await page.goto("https://www.google.com")
    await humanize_actions()
    
    await page.goto(GOOGLE_MAPS_URL)
    logger.info("Waiting for search results to load...")
    
    try:
        await page.wait_for_selector('div[role="feed"]', timeout=30000)
    except Exception as e:
        logger.warning(f"Error waiting for results feed: {e}")
        # Try an alternative selector
        await page.wait_for_selector('div[aria-label*="Results for"]', timeout=30000)
    
    await humanize_actions()
    
    # Check for and handle any potential captchas
    if await check_for_captcha(page):
        logger.warning("Captcha detected! Please solve it manually in the browser window.")
        await page.wait_for_selector('div[role="feed"]', timeout=300000)  # 5 minute timeout for manual solving
    
    await random_mouse_movements(page)


async def check_for_captcha(page: Page) -> bool:
    """Check if a CAPTCHA is present on the page."""
    captcha_selectors = [
        'iframe[src*="recaptcha"]',
        'iframe[src*="captcha"]',
        'div.g-recaptcha',
        'div[data-sitekey]',
        'form#captcha-form'
    ]
    
    for selector in captcha_selectors:
        if await page.query_selector(selector):
            return True
    
    return False


async def scroll_results(page: Page, max_scrolls: int = 10) -> None:
    """Scroll through the results to load more businesses."""
    results_container = await page.query_selector('div[role="feed"]')
    if not results_container:
        logger.warning("Could not find results container for scrolling")
        results_container = await page.query_selector('div[aria-label*="Results for"]')
        if not results_container:
            logger.error("Failed to find any results container")
            return
    
    logger.info(f"Scrolling through results (max {max_scrolls} scrolls)...")
    for i in range(max_scrolls):
        logger.info(f"Scroll {i+1}/{max_scrolls}")
        
        # Different scrolling methods
        if i % 3 == 0:
            # Method 1: Use JavaScript to scroll
            await results_container.evaluate('(element) => { element.scrollTop += 300; }')
        elif i % 3 == 1:
            # Method 2: Use mouse wheel
            await page.mouse.wheel(0, random.randint(200, 400))
        else:
            # Method 3: Press Page Down key
            await page.keyboard.press('PageDown')
        
        # Random delay between scrolls
        await humanize_actions()
        
        # Sometimes perform random mouse movements
        if random.random() < 0.3:
            await random_mouse_movements(page)


async def get_business_links(page: Page) -> List[str]:
    """Extract links to business profiles from the search results."""
    logger.info("Extracting business links...")
    
    # Find all business result elements - try different selector patterns
    selectors = [
        'div[role="feed"] > div a[href^="https://www.google.com/maps/place"]',
        'a[href^="https://www.google.com/maps/place"]',
        'div[jsaction*="placeCard.main"]',
        'a[data-item-id^="place"]'
    ]
    
    links = []
    for selector in selectors:
        elements = await page.query_selector_all(selector)
        if elements:
            logger.info(f"Found {len(elements)} elements with selector: {selector}")
            
            # Extract href attributes
            for element in elements:
                try:
                    href = await element.get_attribute('href')
                    if href and href not in links and 'maps/place' in href:
                        links.append(href)
                except Exception as e:
                    logger.debug(f"Error extracting href: {e}")
            
            if links:
                break
    
    logger.info(f"Found {len(links)} business links")
    return links[:MAX_BUSINESSES]  # Limit to MAX_BUSINESSES


async def extract_business_info(page: Page, url: str) -> Dict[str, Any]:
    """Visit a business profile page and extract all relevant information."""
    logger.info(f"Extracting info from: {url}")
    
    # Navigate to business page
    await page.goto(url)
    await humanize_actions()
    
    # Sometimes perform random mouse movements
    if random.random() < 0.5:
        await random_mouse_movements(page)
    
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
    
    # Try different selectors for address
    address_selectors = [
        'button[data-item-id="address"]',
        'button[aria-label*="Address"]',
        'button[jsan*="address"]',
        'div[jsan*="address"]'
    ]
    
    for selector in address_selectors:
        address_element = await page.query_selector(selector)
        if address_element:
            business_info["address"] = await address_element.inner_text()
            break
    
    # Try different selectors for phone
    phone_selectors = [
        'button[data-item-id^="phone:tel"]',
        'button[aria-label*="Phone"]',
        'button[jsan*="phone"]',
        'div[jsan*="phone"]',
        'a[href^="tel:"]'
    ]
    
    for selector in phone_selectors:
        phone_element = await page.query_selector(selector)
        if phone_element:
            business_info["phone"] = await phone_element.inner_text()
            break
    
    # Try different selectors for website
    website_selectors = [
        'a[data-item-id^="authority"]',
        'a[aria-label*="website"]',
        'a[href^="https://"][data-item-id]',
        'a[jsaction*="website"]'
    ]
    
    for selector in website_selectors:
        website_element = await page.query_selector(selector)
        if website_element:
            business_info["website"] = await website_element.get_attribute('href')
            break
    
    # Try different selectors for ratings
    rating_selectors = [
        'div.fontBodyMedium span[aria-hidden="true"]',
        'span.fontBodyMedium',
        'span[aria-hidden="true"][role="text"]',
        'div[jsaction*="pane.rating.moreReviews"]',
        'span[jstcache*="rating"]'
    ]
    
    for selector in rating_selectors:
        rating_element = await page.query_selector(selector)
        if rating_element:
            rating_text = await rating_element.inner_text()
            try:
                # Extract rating (typically in format like "4.5")
                for word in rating_text.split():
                    if word[0].isdigit() and '.' in word and len(word) <= 3:
                        business_info["rating"] = float(word)
                        break
                        
                # Extract reviews count (typically in format like "(123)")
                if "(" in rating_text and ")" in rating_text:
                    reviews_text = rating_text.split("(")[1].split(")")[0]
                    if reviews_text.replace(",", "").isdigit():
                        business_info["reviews_count"] = int(reviews_text.replace(",", ""))
            except (IndexError, ValueError) as e:
                logger.warning(f"Error parsing rating: {e}")
            
            if "rating" in business_info:
                break
    
    # Extract business hours
    hours_selectors = [
        'div[aria-label^="Hours"]',
        'div[aria-label*="opening hours"]',
        'div[data-item-id*="oh"]',
        'table[class*="hour"]'
    ]
    
    for selector in hours_selectors:
        hours_element = await page.query_selector(selector)
        if hours_element:
            hours_text = await hours_element.inner_text()
            business_info["hours"] = hours_text
            break
    
    # Extract services/categories
    categories = []
    category_selectors = [
        'button[jsaction="pane.rating.category"]',
        'button[jsan*="category"]',
        'span[jstcache*="category"]'
    ]
    
    for selector in category_selectors:
        category_elements = await page.query_selector_all(selector)
        for element in category_elements:
            category = await element.inner_text()
            categories.append(category)
        
        if categories:
            break
    
    if categories:
        business_info["categories"] = categories
    
    # Extract description if available
    description_selectors = [
        'div[data-attrid="kc:/local:merchant content"]',
        'div[data-attrid*="description"]',
        'div[aria-label*="description"]'
    ]
    
    for selector in description_selectors:
        description_element = await page.query_selector(selector)
        if description_element:
            business_info["description"] = await description_element.inner_text()
            break
    
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
                
                # Save progress after each business
                if all_businesses and i % 5 == 0:
                    save_results(all_businesses)
                
                # Random delay between businesses
                await humanize_actions()
                
            except Exception as e:
                logger.error(f"Error processing business {link}: {e}")
        
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
    logger.info("Starting Google Maps roofer business scraper with stealth mode...")
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