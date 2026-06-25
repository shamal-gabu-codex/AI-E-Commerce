from datetime import date, timedelta
from decimal import Decimal

from app.database import SessionLocal, init_db
from app.modules.notifications.notification_model import Alert
from app.modules.brands.brand_model import Brand
from app.modules.chat.chat_model import ChatHistory
from app.modules.inventory.inventory_model import Inventory
from app.modules.products.product_model import Product
from app.modules.ai.recommendation_model import AIRecommendation
from app.modules.reviews.review_model import Review
from app.modules.sales.sales_model import Sale
from app.modules.suppliers.supplier_model import Supplier
from app.modules.uploads.upload_model import UploadedFile
from app.modules.auth.auth_model import User
from app.modules.ai.recommendation_service import run_recommendations
from app.modules.ai.sentiment_service import analyze_review
from app.core.security import hash_password


def seed():
    init_db()
    db = SessionLocal()
    try:
        db.query(Alert).delete()
        db.query(ChatHistory).delete()
        db.query(UploadedFile).delete()
        db.query(AIRecommendation).delete()
        db.query(Review).delete()
        db.query(Sale).delete()
        db.query(Inventory).delete()
        db.query(Product).delete()
        db.query(Brand).delete()
        db.query(Supplier).delete()
        db.query(User).delete()
        db.commit()

        users = [
            User(name="Admin User", email="admin@example.com", password_hash=hash_password("password123")),
            User(name="Business Analyst", email="analyst@example.com", password_hash=hash_password("password123")),
        ]
        db.add_all(users)

        suppliers = [
            Supplier(name="Swift Supply Co", contact_person="Maya Rao", email="maya@swift.example", phone="+1555001", lead_time_days=5, address="Austin, TX", status="active"),
            Supplier(name="Northstar Wholesale", contact_person="Leo Chen", email="leo@northstar.example", phone="+1555002", lead_time_days=9, address="Seattle, WA", status="active"),
            Supplier(name="Prime Pack Traders", contact_person="Nina Patel", email="nina@primepack.example", phone="+1555003", lead_time_days=4, address="Chicago, IL", status="active"),
            Supplier(name="EcoGoods Direct", contact_person="Amir Khan", email="amir@eco.example", phone="+1555004", lead_time_days=12, address="Denver, CO", status="active"),
            Supplier(name="Urban Retail Source", contact_person="Sara Lee", email="sara@urban.example", phone="+1555005", lead_time_days=7, address="New York, NY", status="active"),
        ]
        db.add_all(suppliers)
        db.flush()

        brands = [
            Brand(name="AeroHome", description="Modern kitchen and home utility products", status="active"),
            Brand(name="EcoNest", description="Sustainable lifestyle and wellness products", status="active"),
            Brand(name="UrbanFit", description="Fitness and travel essentials", status="active"),
            Brand(name="NorthPulse", description="Consumer electronics and smart accessories", status="active"),
            Brand(name="ClearPack", description="Packaging-led travel organization products", status="inactive"),
        ]
        db.add_all(brands)
        db.flush()

        product_specs = [
            ("Aero Bottle", "BOT-AERO", "Kitchen", 24.99, 18, 25, 1, 1),
            ("Bamboo Lunch Box", "BOX-BAM", "Kitchen", 34.99, 9, 20, 4, 2),
            ("Noise Filter Earbuds", "EAR-NF", "Electronics", 79.99, 45, 30, 2, 4),
            ("Cotton Travel Pouch", "POU-COT", "Travel", 14.99, 7, 18, 3, 5),
            ("LED Desk Lamp", "LMP-LED", "Home", 49.99, 70, 25, 5, 1),
            ("Yoga Grip Mat", "MAT-YOGA", "Fitness", 39.99, 12, 22, 1, 3),
            ("Ceramic Mug Set", "MUG-CER", "Kitchen", 29.99, 55, 20, 3, 1),
            ("Smart Scale", "SCL-SMT", "Fitness", 59.99, 16, 15, 2, 4),
            ("Packing Cubes", "CUB-PACK", "Travel", 19.99, 6, 16, 3, 5),
            ("Organic Towel", "TWL-ORG", "Home", 22.99, 80, 25, 4, 2),
        ]
        products = []
        for name, sku, category, price, stock, reorder, supplier_idx, brand_idx in product_specs:
            p = Product(
                name=name,
                sku=sku,
                category=category,
                price=Decimal(str(price)),
                current_stock=stock,
                reorder_level=reorder,
                supplier_id=suppliers[supplier_idx - 1].id,
                brand_id=brands[brand_idx - 1].id,
                status="active",
            )
            db.add(p)
            products.append(p)
        db.flush()
        for p in products:
            db.add(Inventory(product_id=p.id, stock=p.current_stock, reorder_level=p.reorder_level))

        today = date.today()
        for day_offset in range(60, 0, -1):
            sale_day = today - timedelta(days=day_offset)
            for idx, p in enumerate(products):
                base_qty = (idx % 4) + 2
                if p.sku == "BOT-AERO" and day_offset <= 7:
                    qty = 2
                elif p.sku == "BOX-BAM" and day_offset <= 7:
                    qty = 12
                else:
                    qty = base_qty + (day_offset % 3)
                db.add(Sale(product_id=p.id, sale_date=sale_day, quantity=qty, revenue=Decimal(str(qty * float(p.price)))))

        review_texts = [
            (1, 2, "Bottle is good but packaging was damaged and the box was crushed"),
            (2, 1, "Delivery was late and quality feels poor"),
            (3, 5, "Excellent sound and fast delivery"),
            (4, 2, "Product damage on arrival and poor packaging"),
            (5, 4, "Great value for the price"),
            (6, 2, "Grip is nice but delivery was late"),
        ]
        for i in range(30):
            product_idx, rating, text = review_texts[i % len(review_texts)]
            sentiment, score, issue = analyze_review(text, rating)
            db.add(
                Review(
                    product_id=products[product_idx - 1].id,
                    rating=rating,
                    review_text=text,
                    sentiment=sentiment,
                    sentiment_score=score,
                    issue_category=issue,
                )
            )

        db.commit()
        created = run_recommendations(db)
        print(f"Seed complete. Users: admin@example.com / password123. Recommendations: {len(created)}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
