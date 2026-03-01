import openai
from fastapi import APIRouter, Depends, Request, HTTPException
from app.core.rate_limiter import limiter
from app.core.config import settings
from app.core.auth import get_current_user
from app.core.supabase import get_supabase_client
from app.schemas.user_inputs import ChatRequest
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize OpenAI client if key is available
client = None
if settings.openai_api_key:
    client = openai.OpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = """
You are a personalized, friendly, and helpful AI Wealth Advisor designed for young professionals (ages 22-35).
Your goal is to answer financial questions, explain investing concepts clearly, and provide guidance on building portfolios.

STRICT COMPLIANCE RULES:
1. DO NOT provide explicit buy or sell commands for specific stocks (e.g., "Buy Apple now").
2. ALWAYS include a disclaimer that your advice is for educational purposes and you are not a licensed financial fiduciary.
3. Keep responses concise, structured, and easy to read.

When available, you will be provided with the user's profile context. Tailor your advice to their risk tolerance.
"""

@router.post("/chat")
@limiter.limit("10/minute")
def chat_with_advisor(
    request: Request,
    payload: ChatRequest,
    user=Depends(get_current_user)
):
    """
    Endpoint for users to interact with the AI Wealth Advisor.
    Strictly rate limited to 10 requests per minute per IP.
    """
    if not client:
        raise HTTPException(status_code=503, detail="OpenAI API key not configured on server.")
        
    supabase = get_supabase_client(user.token)
    
    # 1. Fetch user profile for context
    profile_data = None
    try:
        res = supabase.table("users").select("risk_tolerance, name").eq("id", user.id).execute()
        if res.data:
            profile_data = res.data[0]
    except Exception as e:
        logger.warning(f"Failed to fetch profile for chat context: {e}")

    # 2. Construct context-aware prompt
    user_context = "User Context: Unknown"
    if profile_data:
        risk = profile_data.get('risk_tolerance', 'Unknown')
        name = profile_data.get('name', 'User')
        user_context = f"User Context: Name={name}, Risk Tolerance={risk}."

    messages = [
        {"role": "system", "content": f"{SYSTEM_PROMPT}\n\n{user_context}"},
        {"role": "user", "content": payload.message}
    ]
    
    # 3. Call OpenAI securely
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", # Keep it fast and cost-effective
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        ai_reply = response.choices[0].message.content
        
        # 4. Optional: Log completion to database asynchronously (skipped here to keep response fast, but good for future)
        try:
             supabase.table("chat_history").insert({
                 "user_id": user.id,
                 "role": "user",
                 "content": payload.message
             }).execute()
             supabase.table("chat_history").insert({
                 "user_id": user.id,
                 "role": "assistant",
                 "content": ai_reply
             }).execute()
        except Exception as e:
             logger.error(f"Failed to save chat history: {e}")

        return {"response": ai_reply}
        
    except Exception as e:
        logger.error(f"OpenAI error: {e}")
        
        # Advanced Fallback Rule Engine for Quota Limits
        msg_lower = payload.message.lower()
        risk_profile = profile_data.get('risk_tolerance', 'moderate') if profile_data else 'moderate'
        name = profile_data.get('name', 'there') if profile_data else 'there'
        
        fallback_reply = ""
        
        if any(greet in msg_lower for greet in ["hello", "hi", "hey"]):
            fallback_reply = f"Hello {name}! I noticed my primary AI connection is currently experiencing quota limits, but I'm still here in offline mode. How can I help you manage your wealth today?"
        elif any(word in msg_lower for word in ["recommend", "buy", "invest", "stock"]):
            if risk_profile == 'conservative':
                fallback_reply = f"Since your risk profile is **{risk_profile.capitalize()}**, I recommend focusing on capital preservation and steady income. You should look into broad bond ETFs like **BND** or short-term treasuries like **SHV**. You can view specific asset allocations in the AI Recommendations tab."
            elif risk_profile in ['aggressive', 'very aggressive']:
                fallback_reply = f"With a **{risk_profile.capitalize()}** profile, you can afford more volatility for higher long-term returns. Consider a foundation of broad market ETFs (like VOO or VTI), supplemented by higher-growth tech ETFs (like QQQ) or individual blue-chip stocks. Check your AI Recommendations tab for precise targets."
            else:
                fallback_reply = f"As a **{risk_profile.capitalize()}** investor, a balanced approach is best. A 60/40 or 70/30 split between equities (like the S&P 500 ETF, VOO) and fixed income (like BND) offers a good mix of growth and stability. See your Recommendations tab for details."
        elif any(word in msg_lower for word in ["portfolio", "holdings", "performance", "return"]):
            fallback_reply = "You can simulate buying and selling assets with real-time market data in your **Mock Portfolio** tab. It tracks your total net worth and returns over time. Would you like me to explain how asset allocation works?"
        elif "allocation" in msg_lower or "diversify" in msg_lower:
            fallback_reply = "Asset allocation is about spreading your investments across different asset classes (like stocks, bonds, and cash) to balance risk and reward based on your specific goals and time horizon. Rebalancing periodically is key to maintaining your target risk level."
        elif "inflation" in msg_lower or "interest rate" in msg_lower:
            fallback_reply = "Inflation reduces your purchasing power over time. To combat it, investors typically hold assets that appreciate faster than inflation, such as equities or real estate. In high interest-rate environments, short-term bonds or high-yield savings also offer competitive risk-free returns."
        elif any(word in msg_lower for word in ["etf", "mutual fund", "index"]):
            fallback_reply = "An **ETF** (Exchange Traded Fund) trades like a stock on an exchange and usually tracks an index (like the S&P 500). A **Mutual Fund** also pools money to buy assets, but is priced only once at the end of the trading day. ETFs are generally more tax-efficient and have lower expense ratios, making them ideal for long-term growth across all risk profiles."
        elif any(word in msg_lower for word in ["crypto", "bitcoin", "btc"]):
            fallback_reply = "Cryptocurrency is a highly volatile digital asset class. For conservative investors, it's generally best avoided. For aggressive investors, a very small allocation (1-5% of total portfolio) can provide asymmetric upside without destroying your core wealth if it drops."
        elif any(word in msg_lower for word in ["recession", "bear market", "crash", "drop"]):
            fallback_reply = "During market downturns, the best strategy is usually to stay the course and maintain your target asset allocation. A bear market can actually be a great opportunity to accumulate broad ETFs at lower prices, effectively 'buying the dip' for your long-term horizon."
        elif any(word in msg_lower for word in ["tax", "taxes"]):
            fallback_reply = "I cannot give official tax advice, but generally, holding assets for longer than a year qualifies for lower long-term capital gains tax rates. Contributing to tax-advantaged accounts (like a 401(k) or Roth IRA) is also one of the best ways to accelerate wealth accumulation."
        elif "help" in msg_lower or "what can you do" in msg_lower or "what to ask" in msg_lower:
            fallback_reply = "I am your personal Wealth Advisor. Here are some things you can ask me:\n- *recommend some stocks for me*\n- *what is an ETF?*\n- *how does inflation work?*\n- *explain asset allocation*\n- *is crypto safe?*\n- *what to do in a bear market?*"
        else:
            fallback_reply = f"I am currently operating in **Offline Mode** due to API constraints. However, based on your **{risk_profile.capitalize()}** profile, I'm always ready to discuss financial concepts! Try asking me to *recommend assets*, explain *asset allocation*, or define *ETFs*."
            
        # Attempt to save to history so the UI re-renders with the message
        try:
             supabase.table("chat_history").insert({
                 "user_id": user.id,
                 "role": "user",
                 "content": payload.message
             }).execute()
             supabase.table("chat_history").insert({
                 "user_id": user.id,
                 "role": "assistant",
                 "content": fallback_reply
             }).execute()
        except:
             pass

        return {"response": fallback_reply}
