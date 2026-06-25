INTENTS = {
    "SALES_ANALYSIS": ["sales", "revenue", "drop", "decline", "week"],
    "INVENTORY_CHECK": ["stock", "inventory", "low", "out of stock"],
    "SUPPLIER_RECOMMENDATION": ["supplier", "contact", "lead time", "restock"],
    "REVIEW_ANALYSIS": ["review", "negative", "sentiment", "packaging", "quality"],
    "DEMAND_FORECAST": ["forecast", "expected", "demand", "next 30"],
    "PRODUCT_PERFORMANCE": ["product", "focus", "top", "performance"],
    "BUSINESS_HEALTH": ["health score", "business health", "score low", "improve my score"],
    "SMART_RESTOCKING": ["reorder today", "purchase", "how much stock", "smart restock"],
    "EXECUTIVE_SUMMARY": ["summary", "summarize my business", "weekly summary", "monthly summary"],
    "WHAT_IF_SIMULATION": ["what happens if", "increase price", "supplier delay", "simulate", "what-if"],
    "BUSINESS_ADVISOR": ["advisor", "recommendations", "what should i do", "proactive"],
}


def detect_intent(question: str) -> str:
    q = question.lower()
    scores = {intent: sum(1 for word in words if word in q) for intent, words in INTENTS.items()}
    best, score = max(scores.items(), key=lambda item: item[1])
    return best if score else "GENERAL_BUSINESS_SUMMARY"
