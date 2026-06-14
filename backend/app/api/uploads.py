from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.brand import Brand
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.supplier import Supplier
from app.models.uploaded_file import UploadedFile
from app.utils.csv_parser import load_csv, save_upload

router = APIRouter(prefix="/uploads", tags=["CSV Uploads"])


@router.post("/{file_type}")
def upload_csv(file_type: str, file: UploadFile, db: Session = Depends(get_db)):
    path = save_upload(file)
    handlers = {
        "brands": (["name", "description", "status"], Brand),
        "products": (["name", "sku", "category", "price", "current_stock", "reorder_level", "supplier_id"], Product),
        "inventory": (["product_id", "stock", "reorder_level"], Inventory),
        "suppliers": (["name", "contact_person", "email", "phone", "lead_time_days", "address", "status"], Supplier),
    }
    if file_type not in handlers:
        return {"message": "Use /sales/upload-csv, /reviews/upload-csv, or one of: products, inventory, suppliers"}
    columns, model = handlers[file_type]
    df = load_csv(path, columns)
    for row in df.to_dict("records"):
        if file_type == "products":
            sku = str(row["sku"])
            if db.query(Product).filter(func.lower(Product.sku) == sku.lower()).first():
                raise HTTPException(409, f"SKU {sku} already exists")
            supplier_id = int(row["supplier_id"]) if row.get("supplier_id") else None
            brand_id = int(row["brand_id"]) if row.get("brand_id") else None
            if supplier_id and not db.get(Supplier, supplier_id):
                raise HTTPException(400, f"Supplier {supplier_id} does not exist")
            if brand_id and not db.get(Brand, brand_id):
                raise HTTPException(400, f"Brand {brand_id} does not exist")
            product = Product(
                name=row["name"],
                sku=sku,
                category=row["category"],
                price=Decimal(str(row["price"])),
                current_stock=int(row["current_stock"]),
                reorder_level=int(row["reorder_level"]),
                supplier_id=supplier_id,
                brand_id=brand_id,
                status=row.get("status") or "active",
            )
            db.add(product)
            db.flush()
            db.add(Inventory(product_id=product.id, stock=product.current_stock, reorder_level=product.reorder_level))
        elif file_type == "inventory":
            product = db.get(Product, int(row["product_id"]))
            if not product:
                raise HTTPException(400, f"Product {row['product_id']} does not exist")
            item = db.query(Inventory).filter(Inventory.product_id == product.id).first()
            if item:
                item.stock = int(row["stock"])
                item.reorder_level = int(row["reorder_level"])
            else:
                item = Inventory(product_id=product.id, stock=int(row["stock"]), reorder_level=int(row["reorder_level"]))
                db.add(item)
            product.current_stock = int(row["stock"])
            product.reorder_level = int(row["reorder_level"])
        elif file_type == "brands":
            name = str(row["name"])
            if db.query(Brand).filter(func.lower(Brand.name) == name.lower()).first():
                raise HTTPException(409, f"Brand {name} already exists")
            db.add(Brand(name=name, description=row.get("description"), status=row.get("status") or "active"))
        else:
            db.add(model(**row))
    db.add(UploadedFile(file_name=file.filename, file_type=file_type, status="processed"))
    db.commit()
    return {"message": f"Imported {len(df)} {file_type} rows"}
