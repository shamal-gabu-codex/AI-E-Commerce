$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..\backend")
$env:DATABASE_URL = "sqlite:///./ai_ecommerce.db"

& ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000
