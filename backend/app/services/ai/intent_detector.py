INTENTS = {
    "SALES_ANALYSIS": ["sales", "revenue", "drop", "decline", "week"],
    "INVENTORY_CHECK": ["stock", "inventory", "low", "out of stock"],
    "SUPPLIER_RECOMMENDATION": ["supplier", "contact", "lead time", "restock"],
    "REVIEW_ANALYSIS": ["review", "negative", "sentiment", "packaging", "quality"],
    "DEMAND_FORECAST": ["forecast", "expected", "demand", "next 30"],
    "PRODUCT_PERFORMANCE": ["product", "focus", "top", "performance"],
}


def detect_intent(question: str) -> str:
    q = question.lower()
    scores = {intent: sum(1 for word in words if word in q) for intent, words in INTENTS.items()}
    best, score = max(scores.items(), key=lambda item: item[1])
    return best if score else "GENERAL_BUSINESS_SUMMARY"
