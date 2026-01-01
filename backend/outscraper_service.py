"""
Outscraper Google Maps Scraping Service - Updated for v6.0.0
Fast, reliable lead generation using Outscraper API
"""

import os
from typing import List, Dict, Optional
from outscraper import ApiClient
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class OutscraperService:
    """Service for scraping Google Maps using Outscraper API"""
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize Outscraper service
        
        Args:
            api_key: Outscraper API key (or uses OUTSCRAPER_API_KEY env var)
        """
        self.api_key = api_key or os.getenv('OUTSCRAPER_API_KEY')
        
        if not self.api_key:
            raise ValueError("Outscraper API key is required. Set OUTSCRAPER_API_KEY environment variable.")
        
        self.client = ApiClient(api_key=self.api_key)
        logger.info("Outscraper service initialized")
    
    def scrape_google_maps(
        self,
        query: str,
        location: str = "",
        max_results: int = 20
    ) -> List[Dict]:
        """
        Scrape Google Maps using Outscraper API
        
        Args:
            query: Search query (e.g., "restaurants")
            location: Location (e.g., "New York")
            max_results: Maximum number of results
            
        Returns:
            List of business dictionaries with standardized fields
        """
        try:
            # Construct search query
            search_query = f"{query} {location}".strip() if location else query
            logger.info(f"Scraping Outscraper for: {search_query}")
            
            # Call Outscraper API (v6 syntax)
            results = self.client.google_maps_search_v3(
                query=[search_query],
                limit=max_results,
                language='en',
                region='us',
                skip=0
            )
            
            # Process and standardize results
            businesses = []
            
            # Results come as list of lists
            if results and len(results) > 0:
                for result in results[0]:  # First query results
                    business_data = self._standardize_result(result)
                    if business_data:
                        businesses.append(business_data)
            
            logger.info(f"Successfully scraped {len(businesses)} businesses from Outscraper")
            return businesses
            
        except Exception as e:
            logger.error(f"Outscraper error: {str(e)}")
            raise Exception(f"Failed to scrape with Outscraper: {str(e)}")
    
    def _standardize_result(self, result: Dict) -> Optional[Dict]:
        """
        Convert Outscraper result to our standard format
        
        Args:
            result: Raw Outscraper result
            
        Returns:
            Standardized business dictionary
        """
        try:
            # Extract and standardize fields (v6 field names)
            business_data = {
                'name': result.get('name'),
                'phone': result.get('phone'),
                'website': result.get('site') or result.get('domain'),
                'address': result.get('full_address') or result.get('address'),
                'rating': result.get('rating'),
                'reviews_count': result.get('reviews') or result.get('reviews_count'),
                'category': result.get('type') or result.get('category') or result.get('categories'),
                'maps_url': result.get('google_id') and f"https://www.google.com/maps/place/?q=place_id:{result.get('google_id')}" or result.get('url'),
                
                # Additional Outscraper fields
                'latitude': result.get('latitude'),
                'longitude': result.get('longitude'),
                'business_status': result.get('business_status'),
                'price_level': result.get('price_level'),
                'working_hours': result.get('working_hours'),
            }
            
            return business_data
            
        except Exception as e:
            logger.warning(f"Error standardizing result: {str(e)}")
            return None


# Convenience function
def scrape_google_maps_outscraper(
    query: str,
    location: str = "",
    max_results: int = 20,
    api_key: Optional[str] = None
) -> List[Dict]:
    """
    Convenience function to scrape Google Maps with Outscraper
    
    Args:
        query: Search query
        location: Location
        max_results: Maximum results
        api_key: Outscraper API key (optional)
        
    Returns:
        List of business dictionaries
    """
    service = OutscraperService(api_key=api_key)
    return service.scrape_google_maps(query, location, max_results)


if __name__ == "__main__":
    # Example usage (requires OUTSCRAPER_API_KEY environment variable)
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python outscraper_service.py <query> [location] [max_results]")
        sys.exit(1)
    
    query = sys.argv[1]
    location = sys.argv[2] if len(sys.argv) > 2 else ""
    max_results = int(sys.argv[3]) if len(sys.argv) > 3 else 10
    
    results = scrape_google_maps_outscraper(query, location, max_results)
    
    print(f"\n✅ Scraped {len(results)} businesses:")
    for idx, business in enumerate(results, 1):
        print(f"\n{idx}. {business.get('name')}")
        print(f"   Rating: {business.get('rating')} ({business.get('reviews_count')} reviews)")
        print(f"   Phone: {business.get('phone')}")
        print(f"   Website: {business.get('website')}")
        print(f"   Address: {business.get('address')}")
