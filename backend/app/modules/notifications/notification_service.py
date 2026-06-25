import base64
import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.modules.notifications.notification_model import Alert


def _configured(value: str | None) -> bool:
    return bool(value and not value.lower().startswith(("your-", "change-me")))


def _save_alert(db: Session, alert_type: str, message: str, status: str) -> Alert:
    alert = Alert(type=alert_type, channel=alert_type, message=message, status=status)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def notification_status() -> dict:
    email_ready = _configured(settings.brevo_api_key) and _configured(settings.brevo_from_email)
    sms_ready = all(_configured(value) for value in (
        settings.twilio_account_sid,
        settings.twilio_auth_token,
        settings.twilio_from_number,
    ))
    return {
        "email": {"provider": "brevo", "mode": "live" if email_ready else "mock", "ready": email_ready},
        "sms": {"provider": "twilio", "mode": "live" if sms_ready else "mock", "ready": sms_ready},
    }


def _brevo_request(path: str, payload: dict) -> None:
    request = Request(
        f"https://api.brevo.com/v3/{path}",
        data=json.dumps(payload).encode(),
        method="POST",
        headers={
            "accept": "application/json",
            "api-key": settings.brevo_api_key or "",
            "content-type": "application/json",
        },
    )
    with urlopen(request, timeout=15) as response:
        if response.status not in (200, 201, 202):
            raise HTTPError(request.full_url, response.status, "Unexpected Brevo response", response.headers, None)


def send_email(db: Session, to_email: str, subject: str, message: str) -> Alert:
    summary = f"{subject}: {message} -> {to_email}"
    if notification_status()["email"]["mode"] == "mock":
        return _save_alert(db, "email", summary, "mock_sent")

    try:
        _brevo_request("smtp/email", {
            "sender": {"name": settings.brevo_from_name, "email": settings.brevo_from_email},
            "to": [{"email": to_email}],
            "subject": subject,
            "textContent": message,
        })
    except (HTTPError, URLError, TimeoutError):
        _save_alert(db, "email", summary, "failed")
        raise HTTPException(status_code=502, detail="Email delivery failed")
    return _save_alert(db, "email", summary, "sent")


def send_sms(db: Session, to_number: str, message: str) -> Alert:
    summary = f"{message} -> {to_number}"
    if notification_status()["sms"]["mode"] == "mock":
        return _save_alert(db, "sms", summary, "mock_sent")

    body = urlencode({
        "To": to_number,
        "From": settings.twilio_from_number,
        "Body": message,
    }).encode()
    credentials = base64.b64encode(
        f"{settings.twilio_account_sid}:{settings.twilio_auth_token}".encode()
    ).decode()
    request = Request(
        f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json",
        data=body,
        method="POST",
        headers={
            "Authorization": f"Basic {credentials}",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    try:
        with urlopen(request, timeout=15) as response:
            if response.status not in (200, 201):
                raise HTTPError(request.full_url, response.status, "Unexpected Twilio response", response.headers, None)
    except (HTTPError, URLError, TimeoutError):
        _save_alert(db, "sms", summary, "failed")
        raise HTTPException(status_code=502, detail="SMS delivery failed")
    return _save_alert(db, "sms", summary, "queued")
