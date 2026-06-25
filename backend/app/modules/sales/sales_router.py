from datetime import date
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import and_
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.products.product_model import Product
from app.modules.sales.sales_model import Sale
from app.modules.uploads.upload_model import UploadedFile
from app.modules.sales.sales_schema import SaleCreate, SaleOut
from app.modules.uploads.csv_parser import load_csv, save_upload

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.get("", response_model=list[SaleOut])
def list_sales(db: Session = Depends(get_db)):
    return db.query(Sale).order_by(Sale.sale_date.desc()).limit(500).all()


@router.post("", response_model=SaleOut)
def create_sale(payload: SaleCreate, db: Session = Depends(get_db)):
    product = db.get(Product, payload.product_id)
    if not product:
        raise HTTPException(400, "Selected product does not exist")
    duplicate = db.query(Sale).filter(
        and_(
            Sale.product_id == payload.product_id,
            Sale.sale_date == payload.sale_date,
            Sale.quantity == payload.quantity,
            Sale.revenue == payload.revenue,
        )
    ).first()
    if duplicate:
        raise HTTPException(409, "This sales entry already exists")
    sale = Sale(**payload.model_dump())
    db.add(sale)
    product.current_stock = max(product.current_stock - payload.quantity, 0)
    if product.inventory:
        product.inventory.stock = product.current_stock
    db.commit()
    db.refresh(sale)
    return sale


@router.post("/upload-csv")
def upload_sales_csv(file: UploadFile, db: Session = Depends(get_db)):
    path = save_upload(file)
    df = load_csv(path, ["product_id", "sale_date", "quantity", "revenue"])
    for row in df.to_dict("records"):
        product = db.get(Product, int(row["product_id"]))
        if not product:
            raise HTTPException(400, f"Product {row['product_id']} does not exist")
        quantity = int(row["quantity"])
        try:
            sale_date = date.fromisoformat(str(row["sale_date"]))
        except ValueError:
            raise HTTPException(400, f"Invalid sale_date {row['sale_date']}; expected YYYY-MM-DD")
        db.add(Sale(product_id=product.id, sale_date=sale_date, quantity=quantity, revenue=Decimal(str(row["revenue"]))))
        product.current_stock = max(product.current_stock - quantity, 0)
        if product.inventory:
            product.inventory.stock = product.current_stock
    db.add(UploadedFile(file_name=file.filename, file_type="sales", status="processed"))
    db.commit()
    return {"message": f"Imported {len(df)} sales rows"}
