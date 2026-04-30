from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:password@localhost:5432/ai_ecommerce"
    secret_key: str = "change-me"
    access_token_expire_minutes: int = 60
    gemini_api_key: str | None = None
    gemini_model: str = "gemini-1.5-flash"
    redis_url: str = "redis://localhost:6379/0"
    sendgrid_api_key: str | None = None
    sendgrid_from_email: str = "alerts@example.com"
    twilio_account_sid: str | None = None
    twilio_auth_token: str | None = None
    twilio_from_number: str | None = None

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
