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

## Deploy Backend To Vercel

Create a separate Vercel project for the backend and select this `backend` folder as the project root.

Vercel settings:

- Framework Preset: `Other`
- Root Directory: `backend`
- Build Command: leave empty
- Output Directory: leave empty
- Install Command: leave empty, or use `pip install -r requirements.txt`

Required environment variables in the backend Vercel project:

```env
DATABASE_URL=postgresql://...
SECRET_KEY=your-production-secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=your-verified-sender@example.com
BREVO_FROM_NAME=AI E-Commerce Alerts
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_NUMBER=+15551234567
```

Use a hosted PostgreSQL database for `DATABASE_URL`. Do not use the local SQLite database file on Vercel because serverless file storage is temporary.

After deployment, test:

```text
https://your-backend.vercel.app/health
https://your-backend.vercel.app/health/db
```

Then update the frontend Vercel project environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.vercel.app
```

Redeploy the frontend after changing `NEXT_PUBLIC_API_BASE_URL`.
