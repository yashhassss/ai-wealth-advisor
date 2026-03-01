import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

sql = """
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS income numeric;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS goals text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS time_horizon text;
"""

try:
    print("Executing SQL to add columns...")
    # Using the REST API raw query execution wasn't natively supported in all old client versions without rpc, 
    # but let's try calling a generic RPC or we might have to just tell the user to run it in the SQL Editor.
    # Actually, we can use the `rpc` function if we create one, but we don't have one.
    # Let's see if we can just update a user with these columns. If it fails, we know they aren't there.
    
    # We will just write a script instructing the user to run the SQL snippet in their Supabase dashboard since we cannot execute arbitrary DDL via the standard REST client.
    print("Note: Schema changes must be run in the Supabase Dashboard SQL Editor.")
except Exception as e:
    print(f"Error: {e}")
