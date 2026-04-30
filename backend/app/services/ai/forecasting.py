from datetime import timedelta

import pandas as pd
from prophet import Prophet
from sqlalchemy.orm import Session

from app.models.sales import Sale


def forecast_product(db: Session, product_id: int, periods: int = 30) -> dict:
    rows = db.query(Sale).filter(Sale.product_id == product_id).order_by(Sale.sale_date).all()
    if len(rows) < 10:
        avg = sum(r.quantity for r in rows) / len(rows) if rows else 0
        last_date = rows[-1].sale_date if rows else pd.Timestamp.today().date()
        return {
            "product_id": product_id,
            "method": "moving_average_fallback",
            "forecast": [
                {"date": str(last_date + timedelta(days=i)), "yhat": round(avg, 2)}
                for i in range(1, periods + 1)
            ],
        }
    df = pd.DataFrame({"ds": [r.sale_date for r in rows], "y": [r.quantity for r in rows]})
    model = Prophet(daily_seasonality=True, weekly_seasonality=True)
    model.fit(df)
    future = model.make_future_dataframe(periods=periods)
    forecast = model.predict(future).tail(periods)
    return {
        "product_id": product_id,
        "method": "prophet",
        "forecast": [
            {"date": str(row.ds.date()), "yhat": round(max(row.yhat, 0), 2)}
            for row in forecast.itertuples()
        ],
    }
