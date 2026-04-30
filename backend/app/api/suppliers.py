from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.product import Product
from app.models.supplier import Supplier
from app.schemas.supplier_schema import SupplierCreate, SupplierOut, SupplierUpdate

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.get("", response_model=list[SupplierOut])
def list_suppliers(db: Session = Depends(get_db)):
    return db.query(Supplier).order_by(Supplier.id).all()


@router.get("/{supplier_id}", response_model=SupplierOut)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(404, "Supplier not found")
    return supplier


@router.post("", response_model=SupplierOut)
def create_supplier(payload: SupplierCreate, db: Session = Depends(get_db)):
    supplier = Supplier(**payload.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


@router.put("/{supplier_id}", response_model=SupplierOut)
def update_supplier(supplier_id: int, payload: SupplierUpdate, db: Session = Depends(get_db)):
    supplier = get_supplier(supplier_id, db)
    for key, value in payload.model_dump().items():
        setattr(supplier, key, value)
    db.commit()
    db.refresh(supplier)
    return supplier


@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = get_supplier(supplier_id, db)
    mapped_count = db.query(Product).filter(Product.supplier_id == supplier.id).count()
    if mapped_count:
        raise HTTPException(409, "Cannot delete supplier while mapped with products")
    db.delete(supplier)
    db.commit()
    return {"message": "Supplier deleted"}
