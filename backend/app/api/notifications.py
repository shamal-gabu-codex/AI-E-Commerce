from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert
from app.services.notification_service import send_email, send_sms

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class EmailPayload(BaseModel):
    to_email: EmailStr
    subject: str
    message: str


class SmsPayload(BaseModel):
    to_number: str
    message: str


@router.post("/send-email")
def email(payload: EmailPayload, db: Session = Depends(get_db)):
    return send_email(db, payload.to_email, payload.subject, payload.message)


@router.post("/send-sms")
def sms(payload: SmsPayload, db: Session = Depends(get_db)):
    return send_sms(db, payload.to_number, payload.message)


@router.get("/history")
def history(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.created_at.desc()).limit(100).all()
