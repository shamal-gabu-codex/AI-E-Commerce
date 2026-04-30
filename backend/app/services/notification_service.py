from sqlalchemy.orm import Session

from app.config import settings
from app.models.alert import Alert


def send_email(db: Session, to_email: str, subject: str, message: str) -> Alert:
    status = "mock_sent" if not settings.sendgrid_api_key else "queued"
    alert = Alert(type="email", channel="email", message=f"{subject}: {message} -> {to_email}", status=status)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def send_sms(db: Session, to_number: str, message: str) -> Alert:
    status = "mock_sent" if not (settings.twilio_account_sid and settings.twilio_auth_token) else "queued"
    alert = Alert(type="sms", channel="sms", message=f"{message} -> {to_number}", status=status)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
