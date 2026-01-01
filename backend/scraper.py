"""
Optimized Google Maps Lead Scraper for Railway
Reduced wait times and memory usage
"""

import time
import re
import os
from typing import List, Dict, Optional
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GoogleMapsScraperError(Exception):
    """Custom exception for scraper errors"""
    pass


class GoogleMapsScraper:
    def __init__(self, headless: bool = True):
        """Initialize the Google Maps scraper"""
        self.driver = None
        self.headless = headless
        self.results = []
        
    def _init_driver(self):
        """Initialize Chrome WebDriver with optimized options for Railway"""
        chrome_options = Options()
        
        if self.headless:
            chrome_options.add_argument('--headless=new')
        
        # Essential options
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        
        # Memory optimization for Railway
        chrome_options.add_argument('--single-process')
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument('--disable-software-rasterizer')
        chrome_options.add_argument('--disable-logging')
        chrome_options.add_argument('--disable-background-networking')
        chrome_options.add_argument('--disable-default-apps')
        chrome_options.add_argument('--disable-sync')
        chrome_options.add_argument('--no-first-run')
        chrome_options.add_argument('--disable-features=VizDisplayCompositor')
        
        # User agent
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Disable automation flags
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        try:
            import glob
            
            # Find Chrome in Nix store
            nix_chromes = glob.glob('/nix/store/*/bin/chromium')
            if nix_chromes:
                chrome_options.binary_location = nix_chromes[0]
                logger.info(f"Using Chrome: {nix_chromes[0]}")
            
            # Find ChromeDriver
            nix_drivers = glob.glob('/nix/store/*/bin/chromedriver')
            if nix_drivers:
                service = Service(nix_drivers[0])
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
                logger.info(f"Using ChromeDriver: {nix_drivers[0]}")
            else:
                self.driver = webdriver.Chrome(options=chrome_options)
            
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            logger.info("Chrome driver initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Chrome driver: {str(e)}")
            raise GoogleMapsScraperError(f"Failed to initialize Chrome driver: {str(e)}")
    
    def search(self, query: str, location: str = "", max_results: int = 20) -> List[Dict]:
        """Search Google Maps and scrape business information"""
        try:
            self._init_driver()
            
            search_query = f"{query} {location}".strip() if location else query
            logger.info(f"Starting scrape for: {search_query}")
            
            # Navigate to Google Maps
            url = f"https://www.google.com/maps/search/{search_query.replace(' ', '+')}"
            self.driver.get(url)
            
            # REDUCED: Wait 2 seconds instead of 5
            time.sleep(2)
            
            # Scroll to load results
            self._scroll_results_panel(max_results)
            
            # Extract listings
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
            scrollable_div = self.driver.find_element(By.CSS_SELECTOR, 'div[role="feed"]')
            
            last_height = 0
            scroll_attempts = 0
            max_scroll_attempts = min(max_results // 10 + 2, 5)  # REDUCED scroll attempts
            
            while scroll_attempts < max_scroll_attempts:
                self.driver.execute_script(
                    'arguments[0].scrollTo(0, arguments[0].scrollHeight);', 
                    scrollable_div
                )
                time.sleep(1)  # REDUCED: 1 second instead of 2
                
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
            listings = self.driver.find_elements(
                By.CSS_SELECTOR,
                'div[role="feed"] > div > div > a'
            )
            
            logger.info(f"Found {len(listings)} listings")
            
            for idx, listing in enumerate(listings[:max_results]):
                if idx >= max_results:
                    break
                
                try:
                    # Click listing
                    self.driver.execute_script("arguments[0].click();", listing)
                    time.sleep(2)  # REDUCED: 2 seconds instead of 3
                    
                    # Extract data
                    business_data = self._extract_business_details()
                    
                    if business_data:
                        businesses.append(business_data)
                        logger.info(f"Scraped {idx + 1}/{max_results}: {business_data.get('name', 'Unknown')}")
                    
                    time.sleep(1)  # REDUCED: 1 second instead of 2
                    
                except Exception as e:
                    logger.warning(f"Failed to extract listing {idx + 1}: {str(e)}")
                    continue
                    
        except Exception as e:
            logger.error(f"Error extracting listings: {str(e)}")
        
        return businesses
    
    def _extract_business_details(self) -> Optional[Dict]:
        """Extract detailed information from business detail panel"""
        try:
            business_data = {}
            
            # Wait for panel (REDUCED timeout)
            WebDriverWait(self.driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'h1'))
            )
            
            # Extract name
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
            
            # Extract phone
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
            
            # Extract Maps URL
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
    """Convenience function to scrape Google Maps"""
    scraper = GoogleMapsScraper(headless=headless)
    try:
        return scraper.search(query, location, max_results)
    finally:
        scraper.close()