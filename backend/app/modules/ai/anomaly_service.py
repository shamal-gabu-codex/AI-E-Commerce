from datetime import date, timedelta

import pandas as pd
from sqlalchemy.orm import Session

from app.modules.sales.sales_model import Sale


def sales_windows(db: Session) -> dict:
    today = date.today()
    rows = db.query(Sale).filter(Sale.sale_date >= today - timedelta(days=14)).all()
    df = pd.DataFrame([{"date": r.sale_date, "quantity": r.quantity, "revenue": float(r.revenue)} for r in rows])
    if df.empty:
        return {"last_7_revenue": 0, "previous_7_revenue": 0, "revenue_drop_pct": 0, "quantity_increase_pct": 0}
    last = df[df["date"] >= today - timedelta(days=7)]
    previous = df[df["date"] < today - timedelta(days=7)]
    last_rev, prev_rev = last["revenue"].sum(), previous["revenue"].sum()
    last_qty, prev_qty = last["quantity"].sum(), previous["quantity"].sum()
    drop_pct = ((prev_rev - last_rev) / prev_rev * 100) if prev_rev else 0
    inc_pct = ((last_qty - prev_qty) / prev_qty * 100) if prev_qty else 0
    return {
        "last_7_revenue": round(last_rev, 2),
        "previous_7_revenue": round(prev_rev, 2),
        "revenue_drop_pct": round(drop_pct, 2),
        "quantity_increase_pct": round(inc_pct, 2),
    }
