from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.rate_limiter import limiter
from app.schemas.user_inputs import ChatRequest

from app.api.v1.endpoints import profile
from app.api.v1.endpoints import chat
from app.api.v1.endpoints import portfolio
from app.api.v1.endpoints import market
from app.api.v1.endpoints import recommendations

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.rate_limiter import limiter
from app.schemas.user_inputs import ChatRequest

app = FastAPI(
    title=settings.project_name,
    description="Backend API for the AI-Powered Wealth Advisor project. Features strict rate limiting and schema validation.",
    version=settings.version
)

# Apply rate limiter to app and override default handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Set up CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@limiter.limit(settings.rate_limit_general)
def read_root(request: Request):
    return {"message": "Welcome to the AI Wealth Advisor API"}

@app.get("/health")
@limiter.limit(settings.rate_limit_general)
def health_check(request: Request):
    return {"status": "healthy"}

    return {"status": "healthy"}

app.include_router(profile.router, prefix="/api/v1", tags=["profile"])
app.include_router(chat.router, prefix="/api/v1", tags=["chat"])
app.include_router(portfolio.router, prefix="/api/v1", tags=["portfolio"])
app.include_router(market.router, prefix="/api/v1", tags=["market"])
app.include_router(recommendations.router, prefix="/api/v1", tags=["recommendations"])
