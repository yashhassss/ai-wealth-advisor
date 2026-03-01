import os
import sys

from app.core.config import settings
from supabase import create_client

print(f"URL: {settings.supabase_url}")
supabase = create_client(settings.supabase_url, settings.supabase_anon_key)
# We can't easily get the user token from here, but we can verify if the users table has RLS blocking update
print("Test complete.")
