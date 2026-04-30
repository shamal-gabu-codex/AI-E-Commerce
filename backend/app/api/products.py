from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.recommendation import AIRecommendation
from app.schemas.product_schema import ProductCreate, ProductOut, ProductUpdate

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


@router.post("", response_model=ProductOut)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
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
