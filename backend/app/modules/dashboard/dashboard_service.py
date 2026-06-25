from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.notifications.notification_model import Alert
from app.modules.products.product_model import Product
from app.modules.ai.recommendation_model import AIRecommendation
from app.modules.sales.sales_model import Sale
from app.modules.ai.anomaly_service import sales_windows


def dashboard(db: Session) -> dict:
    revenue = db.query(func.coalesce(func.sum(Sale.revenue), 0)).scalar()
    quantity = db.query(func.coalesce(func.sum(Sale.quantity), 0)).scalar()
    low_stock = db.query(Product).filter(Product.current_stock <= Product.reorder_level).all()
    trend_rows = db.query(Sale.sale_date, func.sum(Sale.revenue), func.sum(Sale.quantity)).group_by(Sale.sale_date).order_by(Sale.sale_date).all()
    top_rows = db.query(Product.name, func.sum(Sale.revenue).label("revenue")).join(Sale).group_by(Product.name).order_by(func.sum(Sale.revenue).desc()).limit(5).all()
    return {
        "summary": {
            "total_revenue": float(revenue or 0),
            "total_quantity": int(quantity or 0),
            "product_count": db.query(Product).count(),
            "low_stock_count": len(low_stock),
            **sales_windows(db),
        },
        "sales_trend": [{"date": str(d), "revenue": float(r), "quantity": int(q)} for d, r, q in trend_rows[-30:]],
        "top_products": [{"name": n, "revenue": float(r)} for n, r in top_rows],
        "low_stock_products": [{"id": p.id, "name": p.name, "stock": p.current_stock, "reorder_level": p.reorder_level} for p in low_stock],
        "alerts": [{"id": a.id, "type": a.type, "message": a.message, "status": a.status} for a in db.query(Alert).order_by(Alert.created_at.desc()).limit(10)],
        "action_cards": [{"id": r.id, "type": r.type, "message": r.message, "priority": r.priority} for r in db.query(AIRecommendation).order_by(AIRecommendation.created_at.desc()).limit(6)],
    }
