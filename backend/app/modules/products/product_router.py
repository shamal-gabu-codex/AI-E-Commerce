from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.brands.brand_model import Brand
from app.modules.inventory.inventory_model import Inventory
from app.modules.products.product_model import Product
from app.modules.ai.recommendation_model import AIRecommendation
from app.modules.suppliers.supplier_model import Supplier
from app.modules.products.product_schema import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=list[ProductOut])
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).order_by(Product.id).all()


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return product


def validate_product_payload(db: Session, payload: ProductCreate | ProductUpdate, product_id: int | None = None) -> None:
    duplicate = db.query(Product).filter(func.lower(Product.sku) == payload.sku.lower())
    if product_id is not None:
        duplicate = duplicate.filter(Product.id != product_id)
    if duplicate.first():
        raise HTTPException(409, "SKU must be unique")
    if payload.brand_id and not db.get(Brand, payload.brand_id):
        raise HTTPException(400, "Selected brand does not exist")
    if payload.supplier_id and not db.get(Supplier, payload.supplier_id):
        raise HTTPException(400, "Selected supplier does not exist")


@router.post("", response_model=ProductOut)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    validate_product_payload(db, payload)
    product = Product(**payload.model_dump())
    db.add(product)
    db.flush()
    db.add(Inventory(product_id=product.id, stock=product.current_stock, reorder_level=product.reorder_level))
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = get_product(product_id, db)
    validate_product_payload(db, payload, product_id)
    for key, value in payload.model_dump().items():
        setattr(product, key, value)
    if product.inventory:
        product.inventory.stock = product.current_stock
        product.inventory.reorder_level = product.reorder_level
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = get_product(product_id, db)
    db.query(AIRecommendation).filter(AIRecommendation.product_id == product.id).delete()
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}
