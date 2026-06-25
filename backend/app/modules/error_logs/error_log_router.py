from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.error_logs.error_log_model import ErrorLog
from app.modules.error_logs.error_log_schema import ErrorLogOut

router = APIRouter(prefix="/error-logs", tags=["Error Logs"])


@router.get("", response_model=list[ErrorLogOut])
def list_error_logs(
    status_code: int | None = Query(default=None),
    path: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(ErrorLog)
    if status_code:
        query = query.filter(ErrorLog.status_code == status_code)
    if path:
        query = query.filter(ErrorLog.path.ilike(f"%{path}%"))
    return query.order_by(ErrorLog.created_at.desc()).limit(200).all()
