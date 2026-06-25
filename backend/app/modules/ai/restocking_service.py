from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.modules.ai.forecasting_service import forecast_product
from app.modules.products.product_model import Product
from app.modules.sales.sales_model import Sale


def smart_restocking(db: Session) -> list[dict]:
    start = date.today() - timedelta(days=30)
    rows = []
    for product in db.query(Product).order_by(Product.name).all():
        sold = int(db.query(func.coalesce(func.sum(Sale.quantity), 0)).filter(Sale.product_id == product.id, Sale.sale_date >= start).scalar() or 0)
        average_daily_sales = round(sold / 30, 2)
        forecast = forecast_product(db, product.id, 30)
        forecasted_demand = round(sum(item["yhat"] for item in forecast.get("forecast", [])), 2)
        lead_time = product.supplier.lead_time_days if product.supplier else 7
        lead_time_demand = max(average_daily_sales * lead_time, forecasted_demand * (lead_time / 30))
        safety_stock = max(product.reorder_level, average_daily_sales * 7)
        suggested_quantity = max(0, round(lead_time_demand + safety_stock - product.current_stock))
        days_left = round(product.current_stock / average_daily_sales, 1) if average_daily_sales else None
        stockout_date = str(date.today() + timedelta(days=int(days_left))) if days_left is not None else None
        urgency = "High" if suggested_quantity and (days_left is None or days_left <= lead_time + 2) else "Medium" if suggested_quantity else "Low"
        if suggested_quantity or product.current_stock <= product.reorder_level:
            rows.append({
                "product_id": product.id,
                "product": product.name,
                "sku": product.sku,
                "current_inventory": product.current_stock,
                "average_daily_sales": average_daily_sales,
                "forecasted_demand": forecasted_demand,
                "supplier": product.supplier.name if product.supplier else "No supplier",
                "supplier_lead_time": lead_time,
                "suggested_reorder_quantity": suggested_quantity,
                "expected_stockout_date": stockout_date,
                "urgency_level": urgency,
            })
    return sorted(rows, key=lambda item: {"High": 0, "Medium": 1, "Low": 2}[item["urgency_level"]])
