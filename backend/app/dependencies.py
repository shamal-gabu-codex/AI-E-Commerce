from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.auth.auth_model import User
from app.core.security import decode_token


def get_current_user(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    subject = decode_token(authorization.split(" ", 1)[1])
    if subject and subject.startswith("user:"):
        try:
            user = db.get(User, int(subject.split(":", 1)[1]))
        except ValueError:
            user = None
    else:
        # Compatibility with tokens issued before user IDs became the stable subject.
        user = db.query(User).filter(User.email == subject).first() if subject else None
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user
