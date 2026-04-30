from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.security import decode_token


def get_current_user(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    email = decode_token(authorization.split(" ", 1)[1])
    user = db.query(User).filter(User.email == email).first() if email else None
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user
