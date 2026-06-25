from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.auth.auth_model import User
from app.modules.auth.auth_schema import RegisterRequest
from app.core.security import create_access_token, hash_password, verify_password


def register_user(db: Session, payload: RegisterRequest) -> User:
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(name=payload.name, email=payload.email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, email: str, password: str) -> tuple[str, User]:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return create_access_token(f"user:{user.id}"), user
