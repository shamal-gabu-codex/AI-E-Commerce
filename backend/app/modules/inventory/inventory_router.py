from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.inventory.inventory_model import Inventory
from app.modules.inventory.inventory_schema import InventoryOut, InventoryUpdate
from app.modules.ai.recommendation_service import product_days_left

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("", response_model=list[InventoryOut])
def list_inventory(db: Session = Depends(get_db)):
    return db.query(Inventory).order_by(Inventory.id).all()


@router.get("/low-stock")
def low_stock(db: Session = Depends(get_db)):
    rows = db.query(Inventory).all()
    return [
        {"id": r.id, "product_id": r.product_id, "product": r.product.name, "stock": r.stock, "reorder_level": r.reorder_level}
        for r in rows
        if r.stock <= r.reorder_level
    ]


@router.put("/{inventory_id}", response_model=InventoryOut)
def update_inventory(inventory_id: int, payload: InventoryUpdate, db: Session = Depends(get_db)):
    item = db.get(Inventory, inventory_id)
    if not item:
        raise HTTPException(404, "Inventory item not found")
    item.stock = payload.stock
    item.reorder_level = payload.reorder_level
    item.product.current_stock = payload.stock
    item.product.reorder_level = payload.reorder_level
    db.commit()
    db.refresh(item)
    return item


@router.get("/supplier-restock-suggestions")
def supplier_restock_suggestions(db: Session = Depends(get_db)):
    suggestions = []
    for item in db.query(Inventory).all():
        days_left = product_days_left(db, item.product)
        supplier = item.product.supplier
        if supplier and (item.stock <= item.reorder_level or (days_left is not None and days_left <= supplier.lead_time_days + 2)):
            suggestions.append({
                "product": item.product.name,
                "supplier": supplier.name,
                "lead_time_days": supplier.lead_time_days,
                "stock": item.stock,
                "days_left": days_left,
                "action": f"Contact {supplier.name} for {item.product.name}",
            })
    return suggestions
