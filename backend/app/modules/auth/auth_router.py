from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.database import get_db
from app.modules.auth.auth_model import User
from app.modules.auth.auth_schema import ChangePasswordRequest, LoginRequest, ProfileUpdateRequest, RegisterRequest, TokenOut, UserOut
from app.modules.auth.auth_service import login_user, register_user
from app.core.security import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenOut)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, payload)
    token, user = login_user(db, payload.email, payload.password)
    return TokenOut(access_token=token, user=user)


@router.post("/login", response_model=TokenOut)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    token, user = login_user(db, payload.email, payload.password)
    return TokenOut(access_token=token, user=user)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserOut)
def update_profile(payload: ProfileUpdateRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    duplicate = db.query(User).filter(User.email == payload.email, User.id != user.id).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Email is already used by another user")
    user.name = payload.name
    user.email = payload.email
    db.commit()
    db.refresh(user)
    return user


@router.post("/change-password")
def change_password(payload: ChangePasswordRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="New password and confirm password do not match")
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}
