from fastapi import APIRouter, Depends, Request, HTTPException
from supabase.lib.client_options import ClientOptions
from app.core.rate_limiter import limiter
from app.core.config import settings
from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client
from app.schemas.user_inputs import UserProfileUpdate

router = APIRouter()

@router.get("/profile")
@limiter.limit(settings.rate_limit_auth)
def get_user_profile(
    request: Request,
    user=Depends(get_current_user)
):
    """
    Get the authenticated user's profile information from Supabase DB.
    """
    supabase = get_supabase_client(user.token)
    try:
        # User ID is guaranteed to exist because of get_current_user dependency
        profile = supabase.table("users").select("*").eq("id", user.id).execute()
        
        # If the user doesn't exist in the 'users' table (custom data table), we could return 404
        # But for this endpoint, maybe we return what we know from auth
        if not profile.data:
            return {"id": user.id, "email": user.email, "message": "Profile not yet completed"}
            
        return profile.data[0]
    except Exception as e:
        import logging
        logging.error(f"Profile fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail="An internal server error occurred while fetching the profile.")

@router.patch("/profile")
@limiter.limit(settings.rate_limit_auth)
def update_user_profile(
    request: Request,
    payload: UserProfileUpdate,
    user=Depends(get_current_user)
):
    """
    Updates the user's profile data safely using Strict validation.
    """
    supabase = get_supabase_client(user.token)
    
    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return {"message": "No fields to update"}
        
    try:
        existing = supabase.table("users").select("id").eq("id", user.id).execute()
        if existing.data:
            res = supabase.table("users").update(update_data).eq("id", user.id).execute()
        else:
            update_data["id"] = user.id
            update_data["email"] = user.email
            res = supabase.table("users").insert(update_data).execute()
            
        return res.data[0] if res.data else {"message": "User updated"}
    except Exception as e:
        import traceback
        import logging
        logging.error(f"Profile update error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="An internal server error occurred while updating the profile.")
