import traceback
from uuid import uuid4

from fastapi import Request
from sqlalchemy.orm import Session

from app.modules.error_logs.error_log_model import ErrorLog
from app.modules.auth.auth_model import User
from app.core.security import decode_token


def resolve_user_id_from_request(db: Session, request: Request) -> int | None:
    authorization = request.headers.get("authorization")
    if not authorization or not authorization.lower().startswith("bearer "):
        return None
    subject = decode_token(authorization.split(" ", 1)[1])
    if not subject:
        return None
    if subject.startswith("user:"):
        try:
            user = db.get(User, int(subject.split(":", 1)[1]))
        except ValueError:
            user = None
    else:
        user = db.query(User).filter(User.email == subject).first()
    return user.id if user else None


def write_error_log(
    db: Session,
    request: Request,
    message: str,
    status_code: int = 500,
    exc: Exception | None = None,
    level: str = "error",
) -> str:
    request_id = request.headers.get("x-request-id") or str(uuid4())
    log = ErrorLog(
        level=level,
        source="api",
        path=str(request.url.path),
        method=request.method,
        status_code=status_code,
        message=message[:4000],
        stack_trace="".join(traceback.format_exception(type(exc), exc, exc.__traceback__)) if exc else None,
        user_id=resolve_user_id_from_request(db, request),
        request_id=request_id,
    )
    db.add(log)
    db.commit()
    return request_id
