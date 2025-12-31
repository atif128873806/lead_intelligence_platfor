"""
Google Maps Lead Scraper
Complete scraper for extracting business information from Google Maps
"""

import time
import re
from typing import List, Dict, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
# from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GoogleMapsScraperError(Exception):
    """Custom exception for scraper errors"""
    pass


class GoogleMapsScraper:
    def __init__(self, headless: bool = True):
        """
        Initialize the Google Maps scraper
        
        Args:
            headless: Run browser in headless mode (no GUI)
        """
        self.driver = None
        self.headless = headless
        self.results = []
        
    def _init_driver(self):
        """Initialize Chrome WebDriver with options"""
        chrome_options = Options()
        
        if self.headless:
            chrome_options.add_argument('--headless')
        
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-blink-features=AutomationControlled')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Disable automation flags
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        try:
            # service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            logger.info("Chrome driver initialized successfully")
        except Exception as e:
            raise GoogleMapsScraperError(f"Failed to initialize Chrome driver: {str(e)}")
    
    def search(self, query: str, location: str = "", max_results: int = 20) -> List[Dict]:
        """
        Search Google Maps and scrape business information
        
        Args:
            query: Search query (e.g., "restaurants")
            location: Location (e.g., "New York")
            max_results: Maximum number of results to scrape
            
        Returns:
            List of dictionaries containing business information
        """
        try:
            self._init_driver()
            
            # Construct search query
            search_query = f"{query} {location}".strip() if location else query
            logger.info(f"Starting scrape for: {search_query}")
            
            # Navigate to Google Maps
            url = f"https://www.google.com/maps/search/{search_query.replace(' ', '+')}"
            self.driver.get(url)
            
            # Wait for results to load
            time.sleep(5)
            
            # Scroll to load more results
            self._scroll_results_panel(max_results)
            
            # Get all business listings
            self.results = self._extract_listings(max_results)
            
            logger.info(f"Successfully scraped {len(self.results)} businesses")
            return self.results
            
        except Exception as e:
            logger.error(f"Scraping error: {str(e)}")
            raise GoogleMapsScraperError(f"Scraping failed: {str(e)}")
        finally:
            self.close()
    
    def _scroll_results_panel(self, max_results: int):
        """Scroll the results panel to load more businesses"""
        try:
            # Find the scrollable results panel
            scrollable_div = self.driver.find_element(
                By.CSS_SELECTOR, 
                'div[role="feed"]'
            )
            
            last_height = 0
            scroll_attempts = 0
            max_scroll_attempts = max_results // 10 + 5
            
            while scroll_attempts < max_scroll_attempts:
                # Scroll down
                self.driver.execute_script(
                    'arguments[0].scrollTo(0, arguments[0].scrollHeight);', 
                    scrollable_div
                )
                time.sleep(2)
                
                # Check if we've reached the bottom
                new_height = self.driver.execute_script(
                    'return arguments[0].scrollHeight', 
                    scrollable_div
                )
                
                if new_height == last_height:
                    logger.info("Reached end of results")
                    break
                    
                last_height = new_height
                scroll_attempts += 1
                
                logger.info(f"Scrolling... attempt {scroll_attempts}")
                
        except Exception as e:
            logger.warning(f"Scroll error (continuing anyway): {str(e)}")
    
    def _extract_listings(self, max_results: int) -> List[Dict]:
        """Extract business information from all listings"""
        businesses = []
        
        try:
            # Find all business listing elements
            listings = self.driver.find_elements(
                By.CSS_SELECTOR,
                'div[role="feed"] > div > div > a'
            )
            
            logger.info(f"Found {len(listings)} listings")
            
            for idx, listing in enumerate(listings[:max_results]):
                if idx >= max_results:
                    break
                
                try:
                    # Click on the listing to open details
                    self.driver.execute_script("arguments[0].click();", listing)
                    time.sleep(3)  # Wait for details to load
                    
                    # Extract business data
                    business_data = self._extract_business_details()
                    
                    if business_data:
                        businesses.append(business_data)
                        logger.info(f"Scraped {idx + 1}/{max_results}: {business_data.get('name', 'Unknown')}")
                    
                    # Small delay to avoid rate limiting
                    time.sleep(2)
                    
                except Exception as e:
                    logger.warning(f"Failed to extract listing {idx + 1}: {str(e)}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error extracting listings: {str(e)}")
        
        return businesses
    
    def _extract_business_details(self) -> Optional[Dict]:
        """Extract detailed information from the business detail panel"""
        try:
            business_data = {}
            
            # Wait for detail panel to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'h1'))
            )
            
            # Extract business name
            try:
                name = self.driver.find_element(By.CSS_SELECTOR, 'h1').text
                business_data['name'] = name
            except:
                business_data['name'] = None
            
            # Extract rating
            try:
                rating_element = self.driver.find_element(
                    By.CSS_SELECTOR, 
                    'div[role="img"][aria-label*="star"]'
                )
                rating_text = rating_element.get_attribute('aria-label')
                rating = float(re.findall(r'(\d+\.?\d*)', rating_text)[0])
                business_data['rating'] = rating
            except:
                business_data['rating'] = None
            
            # Extract review count
            try:
                reviews_element = self.driver.find_element(
                    By.CSS_SELECTOR,
                    'button[aria-label*="reviews"]'
                )
                reviews_text = reviews_element.get_attribute('aria-label')
                reviews = int(re.findall(r'(\d+)', reviews_text.replace(',', ''))[0])
                business_data['reviews_count'] = reviews
            except:
                business_data['reviews_count'] = None
            
            # Extract category
            try:
                category = self.driver.find_element(
                    By.CSS_SELECTOR,
                    'button[jsaction*="category"]'
                ).text
                business_data['category'] = category
            except:
                business_data['category'] = None
            
            # Extract address
            try:
                address_button = self.driver.find_element(
                    By.CSS_SELECTOR,
                    'button[data-item-id="address"]'
                )
                address = address_button.get_attribute('aria-label').replace('Address: ', '')
                business_data['address'] = address
            except:
                business_data['address'] = None
            
            # Extract phone number
            try:
                phone_button = self.driver.find_element(
                    By.CSS_SELECTOR,
                    'button[data-item-id*="phone"]'
                )
                phone = phone_button.get_attribute('aria-label').replace('Phone: ', '')
                business_data['phone'] = phone
            except:
                business_data['phone'] = None
            
            # Extract website
            try:
                website_link = self.driver.find_element(
                    By.CSS_SELECTOR,
                    'a[data-item-id="authority"]'
                )
                website = website_link.get_attribute('href')
                business_data['website'] = website
            except:
                business_data['website'] = None
            
            # Extract Google Maps URL
            try:
                maps_url = self.driver.current_url
                business_data['maps_url'] = maps_url
            except:
                business_data['maps_url'] = None
            
            return business_data
            
        except Exception as e:
            logger.warning(f"Error extracting business details: {str(e)}")
            return None
    
    def close(self):
        """Close the browser and cleanup"""
        if self.driver:
            try:
                self.driver.quit()
                logger.info("Browser closed")
            except:
                pass


def scrape_google_maps(
    query: str,
    location: str = "",
    max_results: int = 20,
    headless: bool = True
) -> List[Dict]:
    """
    Convenience function to scrape Google Maps
    
    Args:
        query: Search query
        location: Location
        max_results: Maximum results
        headless: Run in headless mode
        
    Returns:
        List of business data dictionaries
    """
    scraper = GoogleMapsScraper(headless=headless)
    try:
        return scraper.search(query, location, max_results)
    finally:
        scraper.close()


if __name__ == "__main__":
    # Example usage
    results = scrape_google_maps(
        query="restaurants",
        location="New York",
        max_results=10,
        headless=False
    )
    
    print(f"\n✅ Scraped {len(results)} businesses:")
    for idx, business in enumerate(results, 1):
        print(f"\n{idx}. {business.get('name')}")
        print(f"   Rating: {business.get('rating')} ({business.get('reviews_count')} reviews)")
        print(f"   Phone: {business.get('phone')}")
        print(f"   Website: {business.get('website')}")
        print(f"   Address: {business.get('address')}")
