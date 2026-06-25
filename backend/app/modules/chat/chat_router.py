import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.database import get_db
from app.modules.chat.chat_model import ChatHistory
from app.modules.auth.auth_model import User
from app.modules.chat.chat_schema import ChatRequest, ChatResponse
from app.modules.chat.context_builder import build_context
from app.modules.ai.gemini_client import ask_gemini
from app.modules.chat.intent_detector import detect_intent

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
