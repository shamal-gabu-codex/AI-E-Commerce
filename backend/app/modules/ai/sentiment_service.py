ISSUE_KEYWORDS = {
    "packaging": ["package", "packaging", "box", "wrapped"],
    "delivery": ["delivery", "late", "shipping", "courier"],
    "quality": ["quality", "poor", "cheap", "defect"],
    "price": ["price", "expensive", "costly"],
    "product damage": ["damage", "broken", "cracked", "leak"],
}
NEGATIVE = {"bad", "poor", "terrible", "broken", "late", "damaged", "expensive", "worst", "defect"}
POSITIVE = {"good", "great", "excellent", "fast", "love", "perfect", "value", "nice"}


def analyze_review(text: str, rating: int) -> tuple[str, float, str | None]:
    words = {w.strip(".,!?;:").lower() for w in text.split()}
    score = (len(words & POSITIVE) - len(words & NEGATIVE)) / 5
    score += (rating - 3) / 2
    sentiment = "positive" if score > 0.25 else "negative" if score < -0.25 else "neutral"
    lowered = text.lower()
    issue = next((cat for cat, keys in ISSUE_KEYWORDS.items() if any(k in lowered for k in keys)), None)
    return sentiment, round(max(min(score, 1), -1), 2), issue
