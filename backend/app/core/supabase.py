from supabase import create_client, Client
from supabase.client import ClientOptions
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

def get_supabase_client(token: str = None) -> Client:
    """
    Returns a connected Supabase client.
    Note: Supabase client library handles connection pooling and JWT interactions automatically.
    """
    try:
        kwargs = {}
        if token:
            options = ClientOptions()
            options.headers.update({"Authorization": f"Bearer {token}"})
            kwargs["options"] = options
            
        supabase: Client = create_client(settings.supabase_url, settings.supabase_anon_key, **kwargs)
        return supabase
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")
        raise
