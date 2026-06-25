from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.products.product_model import Product
from app.modules.suppliers.supplier_model import Supplier
from app.modules.suppliers.supplier_schema import SupplierCreate, SupplierOut, SupplierUpdate

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


def validate_supplier_payload(db: Session, payload: SupplierCreate | SupplierUpdate, supplier_id: int | None = None) -> None:
    filters = [func.lower(Supplier.name) == payload.name.lower()]
    if payload.email:
        filters.append(func.lower(Supplier.email) == payload.email.lower())
    duplicate = db.query(Supplier).filter(or_(*filters))
    if supplier_id is not None:
        duplicate = duplicate.filter(Supplier.id != supplier_id)
    if duplicate.first():
        raise HTTPException(409, "Supplier name or email already exists")


@router.post("", response_model=SupplierOut)
def create_supplier(payload: SupplierCreate, db: Session = Depends(get_db)):
    validate_supplier_payload(db, payload)
    supplier = Supplier(**payload.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


@router.put("/{supplier_id}", response_model=SupplierOut)
def update_supplier(supplier_id: int, payload: SupplierUpdate, db: Session = Depends(get_db)):
    supplier = get_supplier(supplier_id, db)
    validate_supplier_payload(db, payload, supplier_id)
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
