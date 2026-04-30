from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.inventory import Inventory
from app.models.brand import Brand
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
        db.add(model(**row))
    db.add(UploadedFile(file_name=file.filename, file_type=file_type, status="processed"))
    db.commit()
    return {"message": f"Imported {len(df)} {file_type} rows"}
