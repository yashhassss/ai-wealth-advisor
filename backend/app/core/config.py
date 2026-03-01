import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    project_name: str = "AI Wealth Advisor API"
    version: str = "1.0.0"
    
    # Supabase config
    supabase_url: str
    supabase_anon_key: str
    
    # External APIs
    openai_api_key: str | None = None
    alpha_vantage_api_key: str | None = None
    
    # Rate limiting
    rate_limit_general: str = "100/minute"
    rate_limit_auth: str = "5/minute"
    
    # Load from .env
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
