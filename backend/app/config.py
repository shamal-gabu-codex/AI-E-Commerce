from pathlib import Path

from pydantic_settings import BaseSettings

BACKEND_DIR = Path(__file__).resolve().parents[1]


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:password@db.your-project-ref.supabase.co:5432/postgres?sslmode=require"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-1.5-flash"
    redis_url: str | None = None
    sendgrid_api_key: str | None = None
    sendgrid_from_email: str | None = None
    twilio_account_sid: str | None = None
    twilio_auth_token: str | None = None
    twilio_from_number: str | None = None

    class Config:
        env_file = str(BACKEND_DIR / ".env")
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()
