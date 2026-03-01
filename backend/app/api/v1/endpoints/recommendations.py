from fastapi import APIRouter, Depends, Request
from app.core.rate_limiter import limiter
from app.core.config import settings
from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client
import logging
import openai
import json

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize OpenAI client if key is available
client = None
if settings.openai_api_key:
    client = openai.OpenAI(api_key=settings.openai_api_key)

@router.get("/recommendations")
@limiter.limit("5/minute")
def get_recommendations(
    request: Request,
    user=Depends(get_current_user)
):
    """
    Generates a mock recommendation list based on user's full profile (risk, income, goals, time horizon).
    """
    supabase = get_supabase_client(user.token)
    try:
        # 1. Get user profile
        risk_tolerance = "moderate"
        time_horizon = "10+ years"
        income = 50000
        profile = {}
        
        profile_res = supabase.table("users").select("*").eq("id", user.id).execute()
        if profile_res.data:
            profile = profile_res.data[0]
            risk_tolerance = profile.get("risk_tolerance") or "moderate"
            time_horizon = profile.get("time_horizon") or "10+ years"
            income = profile.get("income") or 50000

        # 2. Compile portfolio data if available
        holdings = []
        try:
            portfolio_res = supabase.table("portfolios").select("*").eq("user_id", user.id).execute()
            if portfolio_res.data:
                holdings = [{"symbol": h.get("symbol"), "qty": h.get("quantity"), "avg_cost": h.get("avg_cost")} for h in portfolio_res.data]
        except Exception as e:
            logger.error(f"Portfolio fetch failed in recs: {e}")

        # 3. Dynamic Asset Allocation Model matching PRD (Target)
        allocation = []
        if risk_tolerance.lower() == "conservative":
            allocation = [
                {"name": "Bonds (BND, SHV)", "value": 70, "color": "#8b5cf6"},
                {"name": "Broad ETFs (VTI)", "value": 30, "color": "#00D9FF"}
            ]
        elif risk_tolerance.lower() in ["aggressive", "very aggressive"]:
            allocation = [
                {"name": "Tech ETFs (QQQ)", "value": 50, "color": "#00D9FF"},
                {"name": "Blue-Chip Stocks", "value": 30, "color": "#10B981"},
                {"name": "Crypto (BTC)", "value": 20, "color": "#FF9F00"}
            ]
        else: # Moderate
            allocation = [
                {"name": "Index Funds (VOO)", "value": 60, "color": "#00D9FF"},
                {"name": "Bonds (BND)", "value": 30, "color": "#8b5cf6"},
                {"name": "Blue-Chip Stocks", "value": 10, "color": "#10B981"}
            ]

        # 4. Try OpenAI for highly accurate personalized recommendations
        recommendations = []
        
        goal_text = profile.get("goals") or "Wealth Accumulation"
        
        if settings.openai_api_key:
             prompt = f"""
             You are an expert AI financial advisor. The user has the following profile:
             Risk Tolerance: {risk_tolerance}
             Time Horizon: {time_horizon}
             Annual Income: ${income}
             Primary Goal: {goal_text}
             Current Holdings: {holdings if holdings else 'None'}
             
             Target Allocation Model: {allocation}
             
             Generate EXACTLY 3 actionable investment recommendations (buy/sell/hold individual specific tickers like NVDA, AAPL, SPY, TLT, etc.).
             Return the output ONLY as a raw JSON array of objects with the following keys:
             "id" (string), "asset" (string: the ticker symbol), "type" (string: "buy", "sell", or "hold"), "confidence" (integer 0-100), "reason" (string: 1-2 sentence detailed reason based on their explicit risk tolerance, income, primary goal "{goal_text}", and macroeconomic factors).
             Do not wrap in markdown tags like ```json.
             """
             try:
                 temp_client = openai.OpenAI(api_key=settings.openai_api_key)
                 response = temp_client.chat.completions.create(
                     model="gpt-4o-mini",
                     messages=[{"role": "user", "content": prompt}],
                     temperature=0.7,
                     max_tokens=600
                 )
                 result_text = response.choices[0].message.content.strip()
                 if result_text.startswith("```json"):
                     result_text = result_text.replace("```json", "").replace("```", "").strip()
                 parsed = json.loads(result_text)      
                 if isinstance(parsed, list) and len(parsed) >= 1:
                     recommendations = parsed
                 else:
                     raise ValueError("OpenAI didn't return a proper JSON list")   
             except Exception as ai_e:
                 logger.error(f"Failed OpenAI processing: {ai_e}")
                 # fallthrough to manual
                 
        if not recommendations or len(recommendations) == 0:
            # 5. Advanced Fallback Scoring Model - Deeply analyzes user constraints
            is_long_term = "10" in str(time_horizon) or "5-10" in str(time_horizon) 
            try:
                income_val = float(income)
            except (ValueError, TypeError):
                income_val = 50000
            
            risk_score = 1 if risk_tolerance.lower() == "conservative" else (3 if risk_tolerance.lower() in ["aggressive", "very aggressive"] else 2)
            goal_lower = str(goal_text).lower()

            asset_pool = [
                {"symbol": "VOO", "type": "buy", "risk": 2, "description": "S&P 500 core holding for balanced growth."},
                {"symbol": "VTI", "type": "buy", "risk": 2, "description": "Total market index for broad long-term exposure."},
                {"symbol": "QQQ", "type": "buy", "risk": 3, "description": "Tech-heavy ETF for accelerated growth matching high risk tolerance."},
                {"symbol": "NVDA", "type": "buy", "risk": 3, "description": "High-growth single stock maximizing upside for aggressive portfolios."},
                {"symbol": "BTC-USD", "type": "buy", "risk": 3, "description": "Small crypto allocation provides asymmetric upside for aggressive goals."},
                {"symbol": "ARKK", "type": "hold", "risk": 3, "description": "Innovation ETF with higher volatility, hold for aggressive growth."},
                {"symbol": "BND", "type": "buy", "risk": 1, "description": "Broad bond ETF providing steady income and capital protection."},
                {"symbol": "SGOV", "type": "buy", "risk": 1, "description": "Short-dated treasury ETF offering safe yield with near-zero duration risk."},
                {"symbol": "MUB", "type": "buy", "risk": 1, "description": "Tax-exempt municipal bonds, highly efficient for high income earners."},
                {"symbol": "GLD", "type": "hold", "risk": 1, "description": "Gold allocation serves as a conservative inflation hedge."},
                {"symbol": "VGT", "type": "buy", "risk": 2, "description": "Information tech exposure for moderate long-term retirement growth."},
                {"symbol": "VXUS", "type": "buy", "risk": 2, "description": "International diversification to balance domestic market exposure."}
            ]

            # Score each asset for the user
            scored_assets = []
            import random
            for idx, asset in enumerate(asset_pool):
                score = 50 # Base score
                if asset["risk"] == risk_score:
                    score += 30 # Heavy weight for risk match
                elif abs(asset["risk"] - risk_score) == 1:
                    score += 10 # Adjacent risk acceptable
                else:
                    score -= 20 # Mismatch penalized
                
                # Context modifiers
                if risk_score == 3 and is_long_term and asset["symbol"] in ["QQQ", "BTC-USD"]:
                    score += 15 # Aggressive long term
                if income_val > 100000 and asset["symbol"] == "MUB":
                    score += 20 # High income favors tax exempt
                if ('home' in goal_lower or 'short' in str(time_horizon).lower()) and asset["risk"] == 1:
                    score += 15 # Short term / home buying favors conservative
                if 'retirement' in goal_lower and asset["symbol"] in ["VOO", "VTI", "VGT"]:
                    score += 15 # Retirement favors broad market
                
                # Dynamic noise (0-5) to break ties and ensure variety across loads
                noise = random.uniform(0, 5)
                score += noise

                # Check current holdings to logically suggest HOLD if already heavily aligned
                is_held = any(h.get("symbol") == asset["symbol"] for h in holdings)
                rec_type = asset["type"]
                if is_held and score > 75:
                    rec_type = "hold"
                    asset["description"] = f"Maintain your position in {asset['symbol']} as it strongly aligns with your {risk_tolerance} trajectory."

                scored_assets.append({
                    "id": str(idx + 1),
                    "asset": asset["symbol"],
                    "type": rec_type,
                    "confidence": min(98, max(40, int(score))),
                    "reason": f"Analyzed for ${int(income_val):,} income & '{goal_text}' goal: {asset['description']}"
                })
            
            # Sort descending and take top 3
            scored_assets.sort(key=lambda x: x["confidence"], reverse=True)
            recommendations = scored_assets[:3]
                      
        return {"risk_tolerance": risk_tolerance, "allocation": allocation, "recommendations": recommendations[:3]}
        
    except Exception as e:
        from fastapi import HTTPException
        import traceback
        with open("recs_error.txt", "a") as f:
            f.write(traceback.format_exc() + "\n")
        logger.error(f"Recommendations error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations at this time.")
