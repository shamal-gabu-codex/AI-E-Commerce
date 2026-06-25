import json

from app.config import settings


def ask_gemini(question: str, context: dict) -> dict:
    prompt = f"""
System:
You are an AI business analyst for an e-commerce sales and inventory intelligence system.
Use only the provided business data. Do not hallucinate. If data is missing, clearly say data is not available.
Give answer in simple business language. Always include main reason, supporting data, and recommended action.

User Question:
{question}

Business Context:
{json.dumps(context, default=str)}

Return JSON:
{{"summary":"","reasons":[],"recommended_actions":[],"priority":"low | medium | high"}}
"""
    if not settings.gemini_api_key or settings.gemini_api_key.startswith("your-"):
        return _mock_response(context)
    try:
        import google.generativeai as genai
    except ImportError:
        return _mock_response(context)

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel(settings.gemini_model)
        text = model.generate_content(prompt).text.strip().strip("`")
    except Exception:
        return _mock_response(context)
    if text.startswith("json"):
        text = text[4:].strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"summary": text, "reasons": [], "recommended_actions": ["Review source metrics"], "priority": "medium"}


def _mock_response(context: dict) -> dict:
    low_stock = context.get("low_stock", [])
    sales = context.get("sales_windows", {})
    actions = [f"Contact supplier for {item['product']}" for item in low_stock[:3]]
    return {
        "summary": "Gemini mock mode: analysis generated from available business data.",
        "reasons": [
            f"Revenue change over last 7 days is {sales.get('revenue_drop_pct', 0)}%.",
            f"{len(low_stock)} products are at or below reorder level.",
        ],
        "recommended_actions": actions or ["Upload more sales and inventory data for stronger recommendations."],
        "priority": "high" if low_stock else "medium",
    }
