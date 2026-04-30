from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sales import Sale
from app.models.uploaded_file import UploadedFile
from app.schemas.sales_schema import SaleCreate, SaleOut
from app.utils.csv_parser import load_csv, save_upload

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.get("", response_model=list[SaleOut])
def list_sales(db: Session = Depends(get_db)):
    return db.query(Sale).order_by(Sale.sale_date.desc()).limit(500).all()


@router.post("", response_model=SaleOut)
def create_sale(payload: SaleCreate, db: Session = Depends(get_db)):
    sale = Sale(**payload.model_dump())
    db.add(sale)
    db.commit()
    db.refresh(sale)
    return sale


@router.post("/upload-csv")
def upload_sales_csv(file: UploadFile, db: Session = Depends(get_db)):
    path = save_upload(file)
    df = load_csv(path, ["product_id", "sale_date", "quantity", "revenue"])
    for row in df.to_dict("records"):
        db.add(Sale(**row))
    db.add(UploadedFile(file_name=file.filename, file_type="sales", status="processed"))
    db.commit()
    return {"message": f"Imported {len(df)} sales rows"}
