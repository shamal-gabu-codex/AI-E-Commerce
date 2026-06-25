from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.brands.brand_model import Brand
from app.modules.products.product_model import Product
from app.modules.brands.brand_schema import BrandCreate, BrandOut, BrandUpdate

router = APIRouter(prefix="/brands", tags=["Brands"])


@router.get("", response_model=list[BrandOut])
def list_brands(
    search: str | None = Query(default=None),
    status: str | None = Query(default=None, pattern="^(active|inactive)$"),
    db: Session = Depends(get_db),
):
    query = db.query(Brand)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Brand.name.ilike(like), Brand.description.ilike(like)))
    if status:
        query = query.filter(Brand.status == status)
    return query.order_by(Brand.name).all()


@router.get("/{brand_id}", response_model=BrandOut)
def get_brand(brand_id: int, db: Session = Depends(get_db)):
    brand = db.get(Brand, brand_id)
    if not brand:
        raise HTTPException(404, "Brand not found")
    return brand


@router.post("", response_model=BrandOut)
def create_brand(payload: BrandCreate, db: Session = Depends(get_db)):
    if db.query(Brand).filter(func.lower(Brand.name) == payload.name.lower()).first():
        raise HTTPException(409, "Brand name must be unique")
    brand = Brand(**payload.model_dump())
    db.add(brand)
    db.commit()
    db.refresh(brand)
    return brand


@router.put("/{brand_id}", response_model=BrandOut)
def update_brand(brand_id: int, payload: BrandUpdate, db: Session = Depends(get_db)):
    brand = get_brand(brand_id, db)
    duplicate = db.query(Brand).filter(func.lower(Brand.name) == payload.name.lower(), Brand.id != brand_id).first()
    if duplicate:
        raise HTTPException(409, "Brand name must be unique")
    for key, value in payload.model_dump().items():
        setattr(brand, key, value)
    db.commit()
    db.refresh(brand)
    return brand


@router.delete("/{brand_id}")
def delete_brand(brand_id: int, db: Session = Depends(get_db)):
    brand = get_brand(brand_id, db)
    mapped_count = db.query(Product).filter(Product.brand_id == brand.id).count()
    if mapped_count:
        raise HTTPException(409, "Cannot delete brand while mapped with products")
    db.delete(brand)
    db.commit()
    return {"message": "Brand deleted"}
