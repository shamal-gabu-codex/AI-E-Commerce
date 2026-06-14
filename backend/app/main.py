from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text
from sqlalchemy.exc import SQLAlchemyError

from app.api import ai, auth, brands, chat, dashboard, error_logs, inventory, notifications, products, reviews, sales, suppliers, uploads
from app.api.deps import get_current_user
from app.database import SessionLocal, engine, init_db
from app.config import settings
from app.services.error_log_service import write_error_log


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="AI E-Commerce Sales & Inventory Intelligence API",
    version="1.0.0",
    lifespan=lifespan,
)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#         "http://localhost:3001",
#         "http://127.0.0.1:3001",
#         "http://localhost:3002",
#         "http://127.0.0.1:3002",
#         "http://localhost:3003",
#         "http://127.0.0.1:3003",
#         "https://*.vercel.app",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def safe_write_error_log(db, request: Request, message: str, status_code: int, exc: Exception | None = None, level: str = "error") -> str | None:
    try:
        return write_error_log(db, request, message, status_code, exc, level)
    except Exception:
        return None


@app.get("/")
def root():
    return {"status": "running", "service": "backend"}

@app.middleware("http")
async def error_logging_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        db = SessionLocal()
        try:
            request_id = safe_write_error_log(db, request, str(exc), 500, exc)
        finally:
            db.close()
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "request_id": request_id},
        )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    if exc.status_code >= 400 and request.url.path not in ["/health", "/health/db"]:
        db = SessionLocal()
        try:
            safe_write_error_log(db, request, str(exc.detail), exc.status_code, None, "warning" if exc.status_code < 500 else "error")
        finally:
            db.close()
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    db = SessionLocal()
    try:
        safe_write_error_log(db, request, str(exc.errors()), 422, None, "warning")
    finally:
        db.close()
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/health/db")
def database_health():
    db = SessionLocal()
    try:
        db.execute(text("select 1")).scalar()
        inspector = inspect(engine)
        table_names = set(inspector.get_table_names())
        required_tables = {"brands", "products", "users", "inventory", "sales", "reviews"}
        missing_tables = sorted(required_tables - table_names)

        product_count = db.execute(text("select count(*) from products")).scalar() if "products" in table_names else None
        brand_count = db.execute(text("select count(*) from brands")).scalar() if "brands" in table_names else None

        database_kind = "sqlite" if settings.database_url.startswith("sqlite") else "postgresql"
        return {
            "status": "ok" if not missing_tables else "schema_incomplete",
            "database": database_kind,
            "missing_tables": missing_tables,
            "products": product_count,
            "brands": brand_count,
        }
    except SQLAlchemyError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "database": "sqlite" if settings.database_url.startswith("sqlite") else "postgresql",
                "detail": "Database connection failed. Check DATABASE_URL and database availability.",
                "error": str(exc.__class__.__name__),
            },
        )
    finally:
        db.close()


app.include_router(auth.router)
protected = [Depends(get_current_user)]
app.include_router(brands.router, dependencies=protected)
app.include_router(products.router, dependencies=protected)
app.include_router(suppliers.router, dependencies=protected)
app.include_router(inventory.router, dependencies=protected)
app.include_router(sales.router, dependencies=protected)
app.include_router(reviews.router, dependencies=protected)
app.include_router(dashboard.router, dependencies=protected)
app.include_router(ai.router, dependencies=protected)
app.include_router(chat.router, dependencies=protected)
app.include_router(notifications.router, dependencies=protected)
app.include_router(uploads.router, dependencies=protected)
app.include_router(error_logs.router, dependencies=protected)
