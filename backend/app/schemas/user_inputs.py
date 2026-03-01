from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from enum import Enum

class RiskTolerance(str, Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"

class UserProfileUpdate(BaseModel):
    model_config = {"extra": "forbid"}
    name: Optional[str] = Field(None, min_length=2, max_length=50, pattern=r"^[A-Za-z\s]+$", description="Full name of the user, letters and spaces only")
    risk_tolerance: Optional[RiskTolerance] = Field(None, description="User's accepted level of risk")
    income: Optional[float] = Field(None, ge=0, le=1000000000, description="User's annual income")
    goals: Optional[str] = Field(None, min_length=2, max_length=100, pattern=r"^[A-Za-z0-9\s,\.\'-]+$", description="User's financial goals")
    time_horizon: Optional[str] = Field(None, min_length=2, max_length=50, pattern=r"^[A-Za-z0-9\s\+\-<>]+$", description="Investment time horizon")

class TransactionType(str, Enum):
    BUY = "buy"
    SELL = "sell"

class TransactionCreate(BaseModel):
    model_config = {"extra": "forbid"}
    symbol: str = Field(..., min_length=1, max_length=10, pattern=r"^[A-Za-z0-9\.\-]+$", description="Ticker symbol of the asset")
    type: TransactionType = Field(..., description="Buy or sell operation")
    shares: float = Field(..., gt=0, le=1000000, description="Number of shares (must be positive)")
    price: float = Field(..., gt=0, le=1000000, description="Price per share (must be positive)")

class ChatRequest(BaseModel):
    model_config = {"extra": "forbid"}
    message: str = Field(..., min_length=1, max_length=1000, pattern=r"^[^<]*$", description="Message to the AI advisor (no HTML tags)")
