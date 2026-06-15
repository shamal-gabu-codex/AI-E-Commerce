# Backend

FastAPI backend for AI E-Commerce Sales & Inventory Intelligence.

## Run

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python seed.py
uvicorn app.main:app --reload
```

The app creates tables on startup. For production, replace this with Alembic migrations.

## Notes

- Missing Gemini credentials enable mock response mode.
- Missing provider credentials enable mock alert mode.
- Transactional email uses Brevo. Configure `BREVO_API_KEY`, `BREVO_FROM_EMAIL`, and optionally `BREVO_FROM_NAME`.
- Transactional SMS uses Twilio. Configure `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_FROM_NUMBER`.
- Twilio trial accounts can send only to recipient phone numbers verified in the Twilio Console.
- Celery task entrypoint: `app.tasks.analysis_tasks.run_scheduled_analysis`.
