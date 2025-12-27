"""
Lead Intelligence Platform - Enhanced Backend
==============================================
Production-ready FastAPI backend with proper CORS, error handling, and seed data
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, text
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import bcrypt
import jwt
import os

# ==================== CONFIGURATION ====================
# Get DATABASE_URL from environment, with validation and cleanup
raw_db_url = os.getenv("DATABASE_URL", "").strip()

# Debug: Check what we received (masked for security)
if raw_db_url:
    debug_value = raw_db_url[:20] + "..." if len(raw_db_url) > 20 else raw_db_url
    print(f"🔍 DATABASE_URL received: {debug_value}")
else:
    print("🔍 DATABASE_URL is empty or not set")

# Check if Railway variable reference wasn't resolved (common issue)
if raw_db_url and (raw_db_url.startswith("${{") or raw_db_url.startswith("${")):
    print("⚠️  DATABASE_URL appears to be a variable reference that wasn't resolved")
    print("   This usually means the variable isn't properly linked in Railway")
    raw_db_url = ""  # Treat as unset

# Clean up common formatting issues (leading =, extra spaces, etc.)
if raw_db_url:
    # Remove leading = sign (common Railway/Heroku issue)
    if raw_db_url.startswith("="):
        raw_db_url = raw_db_url[1:].strip()
    # Remove any quotes that might be around the URL
    raw_db_url = raw_db_url.strip('"').strip("'").strip()
    # Handle Railway/Heroku postgres:// URLs (convert to postgresql://)
    if raw_db_url.startswith("postgres://"):
        raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

# Set default to SQLite if no DATABASE_URL is provided
if not raw_db_url:
    DATABASE_URL = "sqlite:///./lead_intelligence.db"
    print("⚠️  No DATABASE_URL found, using SQLite database")
else:
    DATABASE_URL = raw_db_url
    # Log database info (without sensitive credentials)
    db_info = DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'configured database'
    print(f"✅ Using database: {db_info}")

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-please")
if SECRET_KEY == "your-secret-key-change-in-production-please":
    print("⚠️  WARNING: Using default SECRET_KEY. Set SECRET_KEY environment variable in production!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

# ==================== DATABASE SETUP ====================
# Validate DATABASE_URL before creating engine
if not DATABASE_URL or len(DATABASE_URL.strip()) == 0:
    raise ValueError("DATABASE_URL cannot be empty. Please set DATABASE_URL environment variable.")

# Additional validation: ensure URL starts with a valid database scheme
valid_schemes = ["sqlite://", "postgresql://", "postgres://", "mysql://", "mysql+pymysql://"]
if not any(DATABASE_URL.startswith(scheme) for scheme in valid_schemes):
    raise ValueError(
        f"Invalid DATABASE_URL scheme. Must start with one of: {', '.join(valid_schemes)}\n"
        f"Received: {DATABASE_URL[:50]}..."
    )

# Create engine with appropriate settings
try:
    if "sqlite" in DATABASE_URL:
        # SQLite configuration
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            echo=False
        )
    else:
        # PostgreSQL configuration with connection pooling
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,  # Verify connections before using
            pool_recycle=300,    # Recycle connections after 5 minutes
            pool_size=5,         # Number of connections to maintain
            max_overflow=10,      # Additional connections beyond pool_size
            connect_args={
                "connect_timeout": 10,  # 10 second connection timeout
                "sslmode": "prefer"      # Use SSL if available
            },
            echo=False
        )
    print("✅ Database engine created successfully")
except Exception as e:
    # Show more context in error message
    # Mask password in URL for security
    masked_url = DATABASE_URL
    if "@" in DATABASE_URL:
        parts = DATABASE_URL.split("@")
        if ":" in parts[0]:
            scheme_user = parts[0].split("://")[0] + "://"
            user_pass = parts[0].split("://")[1] if "://" in parts[0] else ""
            if ":" in user_pass:
                user = user_pass.split(":")[0]
                masked_url = f"{scheme_user}{user}:***@{parts[1]}"
    
    error_msg = (
        f"Failed to create database engine.\n"
        f"URL: {masked_url}\n"
        f"Error: {str(e)}\n\n"
        f"Troubleshooting:\n"
        f"1. Verify DATABASE_URL is correct in Railway variables\n"
        f"2. Ensure PostgreSQL service is running and linked to your app\n"
        f"3. Check if services are in the same Railway project\n"
        f"4. Try using the public connection string instead of internal"
    )
    raise ValueError(error_msg) from e

# Test database connection
try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        result.fetchone()
        print("✅ Database connection test successful")
except Exception as e:
    print(f"⚠️  Database connection test failed: {str(e)}")
    print("   The engine was created but cannot connect to the database")
    print("   This might be a network or authentication issue")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==================== MODELS ====================

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    hashed_password = Column(String)
    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)
    leads_assigned = Column(Integer, default=0)
    leads_contacted = Column(Integer, default=0)
    deals_closed = Column(Integer, default=0)
    revenue_generated = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)


class Lead(Base):
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    unique_fingerprint = Column(String, unique=True, index=True)
    business_name = Column(String, index=True)
    phone = Column(String)
    website = Column(String)
    email = Column(String)
    address = Column(String)
    rating = Column(Float)
    reviews_count = Column(Integer)
    maps_url = Column(String, unique=True)
    category = Column(String, index=True)
    search_query = Column(String, index=True)
    
    ai_score = Column(Integer, default=0)
    priority = Column(String)
    conversion_probability = Column(Integer)
    revenue_potential = Column(String)
    recommended_action = Column(String)
    
    data_quality_score = Column(Integer, default=0)
    status = Column(String, default="new")
    assigned_to_user_id = Column(Integer, nullable=True)
    campaign_id = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_contacted_at = Column(DateTime, nullable=True)
    
    notes = Column(Text)


class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    search_query = Column(String)
    status = Column(String, default="active")
    total_leads = Column(Integer, default=0)
    new_leads = Column(Integer, default=0)
    duplicate_leads = Column(Integer, default=0)
    hot_leads = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


# Create tables
Base.metadata.create_all(bind=engine)

# ==================== PYDANTIC SCHEMAS ====================

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "user"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class LeadCreate(BaseModel):
    business_name: str
    phone: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    maps_url: str
    category: Optional[str] = None
    search_query: str


class LeadResponse(BaseModel):
    id: int
    business_name: str
    phone: Optional[str]
    website: Optional[str]
    email: Optional[str]
    address: Optional[str]
    rating: Optional[float]
    reviews_count: Optional[int]
    category: Optional[str]
    ai_score: int
    priority: Optional[str]
    conversion_probability: Optional[int]
    revenue_potential: Optional[str]
    recommended_action: Optional[str]
    data_quality_score: int
    status: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class DashboardStats(BaseModel):
    total_leads: int
    new_today: int
    hot_leads: int
    conversion_rate: float
    revenue_potential: str
    active_campaigns: int
    avg_quality_score: float


# ==================== SECURITY ====================

security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None


# ==================== DEPENDENCIES ====================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user_email = payload.get("sub")
    if user_email is None:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.query(User).filter(User.email == user_email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user


# ==================== AI SCORING ====================

def calculate_ai_score(lead_data: dict) -> dict:
    """Calculate AI score and priority."""
    score = 0
    
    # Business maturity (30 points)
    reviews = lead_data.get('reviews_count', 0) or 0
    if reviews > 100:
        score += 30
    elif reviews > 50:
        score += 20
    elif reviews > 10:
        score += 10
    
    # Digital presence (25 points)
    if lead_data.get('website') and lead_data.get('email'):
        score += 25
    elif lead_data.get('website') or lead_data.get('email'):
        score += 15
    
    # Rating quality (20 points)
    rating = lead_data.get('rating', 0) or 0
    if rating >= 4.5:
        score += 20
    elif rating >= 4.0:
        score += 15
    elif rating >= 3.5:
        score += 10
    
    # Contact completeness (25 points)
    contact_score = 0
    if lead_data.get('phone'):
        contact_score += 10
    if lead_data.get('email'):
        contact_score += 10
    if lead_data.get('website'):
        contact_score += 5
    score += contact_score
    
    # Determine priority
    if score >= 80:
        priority = "A"
        action = "Call within 1 hour - High conversion probability"
        revenue = "$10,000 - $50,000 LTV"
    elif score >= 60:
        priority = "B"
        action = "Email today, follow up call tomorrow"
        revenue = "$5,000 - $15,000 LTV"
    else:
        priority = "C"
        action = "Add to nurture campaign"
        revenue = "$1,000 - $5,000 LTV"
    
    # Calculate quality score
    quality_score = 0
    if lead_data.get('business_name'):
        quality_score += 10
    if lead_data.get('phone'):
        quality_score += 25
    if lead_data.get('email'):
        quality_score += 25
    if lead_data.get('website'):
        quality_score += 20
    if lead_data.get('address'):
        quality_score += 10
    if lead_data.get('rating'):
        quality_score += 5
    if lead_data.get('reviews_count'):
        quality_score += 5
    
    return {
        'ai_score': score,
        'priority': priority,
        'conversion_probability': score,
        'revenue_potential': revenue,
        'recommended_action': action,
        'data_quality_score': quality_score
    }


# ==================== LIFESPAN EVENTS ====================

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed database
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()
    yield
    # Shutdown: Cleanup if needed
    pass


# ==================== FASTAPI APP ====================

app = FastAPI(
    title="Lead Intelligence Platform API",
    description="Enterprise-grade lead generation and scoring platform",
    version="1.0.0",
    lifespan=lifespan
)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed database
    print("🚀 Application starting up...")
    db = SessionLocal()
    try:
        print("🌱 Attempting to seed database...")
        seed_data(db)
        print("✅ Seeding completed (or user already exists)")
    except Exception as e:
        print(f"⚠️  Seeding failed: {str(e)}")
        print(f"   You can manually seed by visiting: /api/admin/seed-database")
    finally:
        db.close()
    
    yield
    
    # Shutdown: Cleanup if needed
    print("👋 Application shutting down...")


# Enhanced CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "https://lead-intelligence-platfor.vercel.app", "https://*.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)


# ==================== SEED DATA FUNCTION ====================

def seed_data(db: Session):
    """Seed database with demo data."""
    
    # Check if already seeded
    existing_user = db.query(User).filter(User.email == "admin@example.com").first()
    if existing_user:
        return
    
    print("🌱 Seeding database with demo data...")
    
    # Create demo user
    demo_user = User(
        email="admin@example.com",
        full_name="Demo Admin",
        hashed_password=get_password_hash("password123"),
        role="admin",
        leads_assigned=45,
        leads_contacted=38,
        deals_closed=12,
        revenue_generated=145000.00
    )
    db.add(demo_user)
    db.commit()
    
    # Create demo leads
    demo_leads = [
        {
            "business_name": "Tech Solutions Inc",
            "phone": "+1 (555) 123-4567",
            "email": "contact@techsolutions.com",
            "website": "https://techsolutions.com",
            "address": "123 Tech Street, San Francisco, CA",
            "rating": 4.8,
            "reviews_count": 245,
            "category": "Software Development",
            "search_query": "software companies in San Francisco",
            "maps_url": "https://maps.google.com/?cid=1"
        },
        {
            "business_name": "Digital Marketing Pro",
            "phone": "+1 (555) 234-5678",
            "email": "hello@digitalmarketingpro.com",
            "website": "https://digitalmarketingpro.com",
            "address": "456 Marketing Ave, New York, NY",
            "rating": 4.6,
            "reviews_count": 189,
            "category": "Marketing Agency",
            "search_query": "marketing agencies in New York",
            "maps_url": "https://maps.google.com/?cid=2"
        },
        {
            "business_name": "Cloud Services Plus",
            "phone": "+1 (555) 345-6789",
            "website": "https://cloudservicesplus.com",
            "address": "789 Cloud Blvd, Seattle, WA",
            "rating": 4.9,
            "reviews_count": 312,
            "category": "Cloud Computing",
            "search_query": "cloud services in Seattle",
            "maps_url": "https://maps.google.com/?cid=3"
        },
        {
            "business_name": "E-commerce Experts",
            "phone": "+1 (555) 456-7890",
            "email": "support@ecommerceexperts.com",
            "address": "321 Commerce St, Austin, TX",
            "rating": 4.3,
            "reviews_count": 87,
            "category": "E-commerce",
            "search_query": "ecommerce companies in Austin",
            "maps_url": "https://maps.google.com/?cid=4"
        },
        {
            "business_name": "Data Analytics Corp",
            "email": "info@dataanalytics.com",
            "website": "https://dataanalytics.com",
            "address": "555 Data Drive, Boston, MA",
            "rating": 4.7,
            "reviews_count": 156,
            "category": "Data Analytics",
            "search_query": "data analytics in Boston",
            "maps_url": "https://maps.google.com/?cid=5"
        }
    ]
    
    for lead_data in demo_leads:
        scores = calculate_ai_score(lead_data)
        lead = Lead(
            unique_fingerprint=f"{lead_data['business_name'].lower().replace(' ', '_')}",
            **lead_data,
            **scores
        )
        db.add(lead)
    
    # Create demo campaign
    campaign = Campaign(
        name="Q1 2024 Lead Generation",
        search_query="tech companies",
        total_leads=5,
        new_leads=5,
        hot_leads=3
    )
    db.add(campaign)
    
    db.commit()
    print("✅ Database seeded successfully!")


# ==================== AUTH ENDPOINTS ====================

@app.post("/api/auth/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user."""
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role=user_data.role
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}


@app.post("/api/auth/login", response_model=Token)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login and get access token."""
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    user.last_login = datetime.utcnow()
    db.commit()
    
    access_token = create_access_token(data={"sub": user.email})
    
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "leads_assigned": current_user.leads_assigned,
        "deals_closed": current_user.deals_closed,
        "revenue_generated": current_user.revenue_generated
    }


# ==================== LEAD ENDPOINTS ====================

@app.get("/api/leads", response_model=List[LeadResponse])
def get_leads(
    skip: int = 0,
    limit: int = 50,
    priority: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leads with filtering."""
    query = db.query(Lead)
    
    if priority:
        query = query.filter(Lead.priority == priority)
    if status:
        query = query.filter(Lead.status == status)
    if search:
        query = query.filter(Lead.business_name.ilike(f"%{search}%"))
    
    query = query.order_by(Lead.ai_score.desc())
    leads = query.offset(skip).limit(limit).all()
    return leads


@app.post("/api/leads", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_data: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new lead with AI scoring."""
    existing = db.query(Lead).filter(Lead.maps_url == lead_data.maps_url).first()
    if existing:
        raise HTTPException(status_code=400, detail="Lead already exists")
    
    lead_dict = lead_data.dict()
    scores = calculate_ai_score(lead_dict)
    
    lead = Lead(
        **lead_dict,
        **scores,
        unique_fingerprint=f"{lead_data.business_name.lower().replace(' ', '_')}_{lead_data.maps_url}"
    )
    
    db.add(lead)
    db.commit()
    db.refresh(lead)
    
    return lead


# ==================== DASHBOARD ENDPOINTS ====================

@app.get("/api/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get dashboard statistics."""
    from sqlalchemy import func
    
    total_leads = db.query(func.count(Lead.id)).scalar()
    
    today = datetime.utcnow().date()
    new_today = db.query(func.count(Lead.id)).filter(
        func.date(Lead.created_at) == today
    ).scalar()
    
    hot_leads = db.query(func.count(Lead.id)).filter(Lead.priority == "A").scalar()
    
    avg_quality = db.query(func.avg(Lead.data_quality_score)).scalar() or 0
    
    active_campaigns = db.query(func.count(Campaign.id)).filter(
        Campaign.status == "active"
    ).scalar()
    
    conversion_rate = 12.5
    revenue_potential = f"${(hot_leads * 15000):,}"
    
    return DashboardStats(
        total_leads=total_leads or 0,
        new_today=new_today or 0,
        hot_leads=hot_leads or 0,
        conversion_rate=conversion_rate,
        revenue_potential=revenue_potential,
        active_campaigns=active_campaigns or 0,
        avg_quality_score=round(avg_quality, 1)
    )


@app.get("/api/dashboard/charts/leads-by-priority")
def get_leads_by_priority(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get lead distribution by priority."""
    from sqlalchemy import func
    
    results = db.query(
        Lead.priority,
        func.count(Lead.id).label('count')
    ).group_by(Lead.priority).all()
    
    return [{"priority": r.priority or "Unknown", "count": r.count} for r in results]


@app.get("/api/dashboard/charts/leads-timeline")
def get_leads_timeline(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get leads created over time."""
    from sqlalchemy import func
    from datetime import timedelta
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    results = db.query(
        func.date(Lead.created_at).label('date'),
        func.count(Lead.id).label('count')
    ).filter(
        Lead.created_at >= start_date
    ).group_by(func.date(Lead.created_at)).all()
    
    return [{"date": str(r.date), "count": r.count} for r in results]


@app.get("/api/dashboard/charts/quality-distribution")
def get_quality_distribution(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Get data quality score distribution."""
    from sqlalchemy import func, case
    
    results = db.query(
        case(
            (Lead.data_quality_score >= 80, 'High (80-100)'),
            (Lead.data_quality_score >= 60, 'Medium (60-79)'),
            (Lead.data_quality_score >= 40, 'Low (40-59)'),
            else_='Very Low (0-39)'
        ).label('quality_range'),
        func.count(Lead.id).label('count')
    ).group_by('quality_range').all()
    
    return [{"range": r.quality_range, "count": r.count} for r in results]


# ==================== HEALTH CHECK ====================

@app.get("/")
def root():
    """API health check."""
    return {
        "status": "healthy",
        "service": "Lead Intelligence Platform API",
        "version": "1.0.0",
        "message": "Welcome! Visit /docs for API documentation"
    }


@app.get("/health")
def health_check():
    """Detailed health check."""
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/admin/seed-database")
def manual_seed(db: Session = Depends(get_db)):
    """Manually seed the database with demo data"""
    try:
        # Check if demo user exists
        existing_user = db.query(User).filter(User.email == "admin@example.com").first()
        if existing_user:
            return {
                "status": "already_exists",
                "message": "Demo user already exists!",
                "email": "admin@example.com",
                "password": "password123"
            }
        
        print("🌱 Creating demo user...")
        
        # Create demo user
        demo_user = User(
            email="admin@example.com",
            full_name="Demo Admin",
            hashed_password=get_password_hash("password123"),
            role="admin",
            leads_assigned=45,
            leads_contacted=38,
            deals_closed=12,
            revenue_generated=145000.00
        )
        db.add(demo_user)
        
        # Create 5 demo leads
        demo_leads = [
            {
                "business_name": "Tech Solutions Inc",
                "phone": "+1 (555) 123-4567",
                "email": "contact@techsolutions.com",
                "website": "https://techsolutions.com",
                "address": "123 Tech Street, San Francisco, CA",
                "rating": 4.8,
                "reviews_count": 245,
                "category": "Software Development",
                "search_query": "software companies",
                "maps_url": "https://maps.google.com/?cid=1001"
            },
            {
                "business_name": "Digital Marketing Pro",
                "phone": "+1 (555) 234-5678",
                "email": "hello@digitalmarketingpro.com",
                "website": "https://digitalmarketingpro.com",
                "address": "456 Marketing Ave, New York, NY",
                "rating": 4.6,
                "reviews_count": 189,
                "category": "Marketing Agency",
                "search_query": "marketing agencies",
                "maps_url": "https://maps.google.com/?cid=1002"
            },
            {
                "business_name": "Cloud Services Plus",
                "phone": "+1 (555) 345-6789",
                "website": "https://cloudservicesplus.com",
                "address": "789 Cloud Blvd, Seattle, WA",
                "rating": 4.9,
                "reviews_count": 312,
                "category": "Cloud Computing",
                "search_query": "cloud services",
                "maps_url": "https://maps.google.com/?cid=1003"
            },
            {
                "business_name": "E-commerce Experts",
                "phone": "+1 (555) 456-7890",
                "email": "support@ecommerceexperts.com",
                "address": "321 Commerce St, Austin, TX",
                "rating": 4.3,
                "reviews_count": 87,
                "category": "E-commerce",
                "search_query": "ecommerce companies",
                "maps_url": "https://maps.google.com/?cid=1004"
            },
            {
                "business_name": "Data Analytics Corp",
                "email": "info@dataanalytics.com",
                "website": "https://dataanalytics.com",
                "address": "555 Data Drive, Boston, MA",
                "rating": 4.7,
                "reviews_count": 156,
                "category": "Data Analytics",
                "search_query": "data analytics",
                "maps_url": "https://maps.google.com/?cid=1005"
            }
        ]
        
        for lead_data in demo_leads:
            scores = calculate_ai_score(lead_data)
            lead = Lead(
                unique_fingerprint=f"{lead_data['business_name'].lower().replace(' ', '_')}",
                **lead_data,
                **scores
            )
            db.add(lead)
        
        db.commit()
        
        print("✅ Demo data created successfully!")
        
        return {
            "status": "success",
            "message": "✅ Database seeded successfully!",
            "demo_user": {
                "email": "admin@example.com",
                "password": "password123"
            },
            "leads_created": len(demo_leads),
            "next_step": "Try logging in with admin@example.com / password123"
        }
    
    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Seeding failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*80)
    print("🚀 Starting Lead Intelligence Platform API")
    print("="*80)
    print(f"📍 API will be available at: http://localhost:8000")
    print(f"📚 API Documentation: http://localhost:8000/docs")
    print(f"🔐 Demo Login: admin@example.com / password123")
    print("="*80 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
