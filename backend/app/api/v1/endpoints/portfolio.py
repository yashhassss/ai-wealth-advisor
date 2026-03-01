from fastapi import APIRouter, Depends, Request, HTTPException
from app.core.rate_limiter import limiter
from app.core.config import settings
from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client
from app.schemas.user_inputs import TransactionCreate
import logging
import traceback

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/portfolio")
@limiter.limit(settings.rate_limit_general)
def get_portfolio(
    request: Request,
    user=Depends(get_current_user)
):
    """
    Fetch the user's current exact holdings.
    """
    supabase = get_supabase_client(user.token)
    try:
        res = supabase.table("portfolios").select("*").eq("user_id", user.id).execute()
        return res.data
    except Exception as e:
        logger.error(f"Portfolio fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch portfolio.")

@router.post("/portfolio/transaction")
@limiter.limit("10/minute")
def add_transaction(
    request: Request,
    payload: TransactionCreate, # Strict Validation happens here
    user=Depends(get_current_user)
):
    """
    Add a new buy/sell transaction and update portfolio holdings.
    """
    print(f"DEBUG: Received transaction request: {payload}")
    supabase = get_supabase_client(user.token)
    try:
        # 1. Record the transaction
        print("DEBUG: Inserting transaction into DB...")
        supabase.table("transactions").insert({
            "user_id": user.id,
            "symbol": payload.symbol.upper(),
            "type": payload.type.value,
            "shares": float(payload.shares),
            "price": float(payload.price)
        }).execute()
        
        # 2. Update the portfolio (Naive implementation: read, modify, write)
        # In a real heavy-load scenario, this should be done in a PostgreSQL function (RPC)
        port_res = supabase.table("portfolios").select("*").eq("user_id", user.id).eq("symbol", payload.symbol.upper()).execute()
        
        if port_res.data:
            holding = port_res.data[0]
            current_qty = float(holding["quantity"])
            
            if payload.type.value == "buy":
                new_qty = current_qty + float(payload.shares)
                # Keep simplified avg cost calculation for demo
                new_cost = ((current_qty * float(holding["avg_cost"])) + (float(payload.shares) * float(payload.price))) / new_qty
            else: # sell
                new_qty = current_qty - float(payload.shares)
                new_cost = float(holding["avg_cost"])
                if new_qty < 0:
                     raise HTTPException(status_code=400, detail="Cannot sell more shares than you own.")
            
            if new_qty == 0:
                supabase.table("portfolios").delete().eq("id", holding["id"]).execute()
            else:
                supabase.table("portfolios").update({"quantity": new_qty, "avg_cost": new_cost}).eq("id", holding["id"]).execute()
                
        else:
            if payload.type.value == "sell":
                raise HTTPException(status_code=400, detail="Cannot sell a security you do not own.")
                
            # Insert new holding
            supabase.table("portfolios").insert({
               "user_id": user.id,
               "symbol": payload.symbol.upper(),
               "quantity": float(payload.shares),
               "avg_cost": float(payload.price)
            }).execute()
            
        return {"message": f"Successfully processed {payload.type.value} of {payload.symbol.upper()}"}

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"Transaction error: {e}")
        logger.debug(f"DEBUG EXCEPTION TRACEBACK:\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Failed to process transaction due to an internal error.")
