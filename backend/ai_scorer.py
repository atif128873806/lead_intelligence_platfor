"""
AI Lead Scoring Algorithm
Intelligent scoring system for lead quality and priority
"""

from typing import Dict, Optional
import re


class LeadScorer:
    """
    AI-powered lead scoring system
    Scores leads based on data quality and business signals
    """
    
    @staticmethod
    def calculate_ai_score(lead_data: Dict) -> int:
        """
        Calculate AI score (0-100) based on lead data quality
        
        Args:
            lead_data: Dictionary containing lead information
            
        Returns:
            Score from 0-100
        """
        score = 0
        
        # Business Name (Required - 10 points)
        if lead_data.get('name'):
            score += 10
        
        # Phone Number (20 points)
        if lead_data.get('phone'):
            phone = str(lead_data.get('phone', ''))
            if LeadScorer._is_valid_phone(phone):
                score += 20
            else:
                score += 10  # Has phone but might be invalid
        
        # Website (20 points)
        if lead_data.get('website'):
            website = str(lead_data.get('website', ''))
            if LeadScorer._is_valid_website(website):
                score += 20
            else:
                score += 10
        
        # Address (15 points)
        if lead_data.get('address'):
            address = str(lead_data.get('address', ''))
            if len(address) > 20:  # Complete address
                score += 15
            else:
                score += 8  # Partial address
        
        # Rating (15 points)
        rating = lead_data.get('rating')
        if rating:
            try:
                rating_float = float(rating)
                if rating_float >= 4.5:
                    score += 15
                elif rating_float >= 4.0:
                    score += 12
                elif rating_float >= 3.5:
                    score += 8
                else:
                    score += 5
            except:
                pass
        
        # Review Count (15 points)
        reviews = lead_data.get('reviews_count')
        if reviews:
            try:
                reviews_int = int(reviews)
                if reviews_int >= 100:
                    score += 15
                elif reviews_int >= 50:
                    score += 12
                elif reviews_int >= 20:
                    score += 8
                else:
                    score += 5
            except:
                pass
        
        # Category (5 points)
        if lead_data.get('category'):
            score += 5
        
        # Ensure score is between 0 and 100
        return min(max(score, 0), 100)
    
    @staticmethod
    def assign_priority(ai_score: int) -> str:
        """
        Assign priority level (A, B, C) based on AI score
        
        Args:
            ai_score: AI score from 0-100
            
        Returns:
            Priority: 'A', 'B', or 'C'
        """
        if ai_score >= 80:
            return 'A'  # Hot lead
        elif ai_score >= 60:
            return 'B'  # Warm lead
        else:
            return 'C'  # Cold lead
    
    @staticmethod
    def calculate_conversion_probability(lead_data: Dict, ai_score: int) -> float:
        """
        Calculate conversion probability (0-100%)
        
        Args:
            lead_data: Lead information
            ai_score: Calculated AI score
            
        Returns:
            Conversion probability as percentage
        """
        # Base probability from AI score
        base_probability = ai_score * 0.6  # 60% weight to AI score
        
        # Bonus factors
        bonus = 0
        
        # High rating bonus
        rating = lead_data.get('rating')
        if rating:
            try:
                if float(rating) >= 4.5:
                    bonus += 10
                elif float(rating) >= 4.0:
                    bonus += 5
            except:
                pass
        
        # Many reviews bonus (social proof)
        reviews = lead_data.get('reviews_count')
        if reviews:
            try:
                if int(reviews) >= 100:
                    bonus += 10
                elif int(reviews) >= 50:
                    bonus += 5
            except:
                pass
        
        # Website bonus (shows professionalism)
        if lead_data.get('website'):
            bonus += 10
        
        # Email bonus
        if lead_data.get('email'):
            bonus += 10
        
        total = min(base_probability + bonus, 100)
        return round(total, 1)
    
    @staticmethod
    def calculate_data_quality_score(lead_data: Dict) -> int:
        """
        Calculate data quality score (0-100) based on completeness
        
        Args:
            lead_data: Lead information
            
        Returns:
            Data quality score
        """
        fields = [
            'name',
            'phone',
            'email',
            'website',
            'address',
            'rating',
            'reviews_count',
            'category',
            'maps_url'
        ]
        
        filled_fields = sum(1 for field in fields if lead_data.get(field))
        quality_score = int((filled_fields / len(fields)) * 100)
        
        return quality_score
    
    @staticmethod
    def determine_revenue_potential(lead_data: Dict, ai_score: int) -> str:
        """
        Estimate revenue potential category
        
        Args:
            lead_data: Lead information
            ai_score: Calculated AI score
            
        Returns:
            Revenue potential: 'High', 'Medium', or 'Low'
        """
        # High priority + good reviews = High potential
        if ai_score >= 80:
            reviews = lead_data.get('reviews_count', 0)
            try:
                if int(reviews) >= 50:
                    return 'High ($5000+)'
            except:
                pass
            return 'Medium ($2000-5000)'
        elif ai_score >= 60:
            return 'Medium ($2000-5000)'
        else:
            return 'Low ($500-2000)'
    
    @staticmethod
    def get_recommended_action(lead_data: Dict, priority: str) -> str:
        """
        Get recommended action based on lead quality
        
        Args:
            lead_data: Lead information
            priority: Lead priority (A, B, or C)
            
        Returns:
            Recommended action string
        """
        if priority == 'A':
            if lead_data.get('phone'):
                return 'Call immediately - High potential lead'
            elif lead_data.get('email'):
                return 'Send personalized email within 24 hours'
            else:
                return 'Research contact info and reach out ASAP'
        elif priority == 'B':
            if lead_data.get('phone') or lead_data.get('email'):
                return 'Follow up within 48 hours'
            else:
                return 'Add to nurture campaign'
        else:
            return 'Add to email drip campaign for future engagement'
    
    @staticmethod
    def _is_valid_phone(phone: str) -> bool:
        """Check if phone number looks valid"""
        if not phone:
            return False
        # Remove common formatting
        digits = re.sub(r'[^\d]', '', phone)
        # Most phone numbers are 10-15 digits
        return 10 <= len(digits) <= 15
    
    @staticmethod
    def _is_valid_website(website: str) -> bool:
        """Check if website URL looks valid"""
        if not website:
            return False
        # Basic URL validation
        return website.startswith(('http://', 'https://')) and '.' in website
    
    @staticmethod
    def score_lead(lead_data: Dict) -> Dict:
        """
        Complete lead scoring - calculates all metrics
        
        Args:
            lead_data: Raw lead data from scraper
            
        Returns:
            Dictionary with all scores and metrics
        """
        # Calculate AI score
        ai_score = LeadScorer.calculate_ai_score(lead_data)
        
        # Assign priority
        priority = LeadScorer.assign_priority(ai_score)
        
        # Calculate other metrics
        conversion_probability = LeadScorer.calculate_conversion_probability(lead_data, ai_score)
        data_quality_score = LeadScorer.calculate_data_quality_score(lead_data)
        revenue_potential = LeadScorer.determine_revenue_potential(lead_data, ai_score)
        recommended_action = LeadScorer.get_recommended_action(lead_data, priority)
        
        return {
            'ai_score': ai_score,
            'priority': priority,
            'conversion_probability': conversion_probability,
            'data_quality_score': data_quality_score,
            'revenue_potential': revenue_potential,
            'recommended_action': recommended_action
        }


# Convenience function
def score_lead(lead_data: Dict) -> Dict:
    """
    Score a lead and return all metrics
    
    Args:
        lead_data: Lead data dictionary
        
    Returns:
        Dictionary with scores and recommendations
    """
    return LeadScorer.score_lead(lead_data)


if __name__ == "__main__":
    # Example usage
    test_lead = {
        'name': 'Best Pizza Restaurant',
        'phone': '+1 (555) 123-4567',
        'email': 'contact@bestpizza.com',
        'website': 'https://bestpizza.com',
        'address': '123 Main St, New York, NY 10001',
        'rating': 4.8,
        'reviews_count': 250,
        'category': 'Italian Restaurant',
        'maps_url': 'https://maps.google.com/...'
    }
    
    scores = score_lead(test_lead)
    
    print("\n🎯 Lead Scoring Results:")
    print(f"AI Score: {scores['ai_score']}/100")
    print(f"Priority: {scores['priority']}")
    print(f"Conversion Probability: {scores['conversion_probability']}%")
    print(f"Data Quality: {scores['data_quality_score']}/100")
    print(f"Revenue Potential: {scores['revenue_potential']}")
    print(f"Recommended Action: {scores['recommended_action']}")
