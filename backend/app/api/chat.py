import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.chat import ChatHistory
from app.models.user import User
from app.schemas.chat_schema import ChatRequest, ChatResponse
from app.services.ai.context_builder import build_context
from app.services.ai.gemini_client import ask_gemini
from app.services.ai.intent_detector import detect_intent

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    intent = detect_intent(payload.question)
    context = build_context(db, intent)
    response = ask_gemini(payload.question, context)
    db.add(ChatHistory(user_id=user.id, question=payload.question, intent=intent, response=json.dumps(response)))
    db.commit()
    return {"question": payload.question, "intent": intent, "response": response}


@router.get("/history")
def history(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(ChatHistory).filter(ChatHistory.user_id == user.id).order_by(ChatHistory.created_at.desc()).limit(50).all()
