from fastapi import APIRouter, Depends, HTTPException, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.products.product_model import Product
from app.modules.reviews.review_model import Review
from app.modules.uploads.upload_model import UploadedFile
from app.modules.reviews.review_schema import ReviewCreate, ReviewOut
from app.modules.ai.sentiment_service import analyze_review
from app.modules.uploads.csv_parser import load_csv, save_upload

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("", response_model=list[ReviewOut])
def list_reviews(db: Session = Depends(get_db)):
    return db.query(Review).order_by(Review.created_at.desc()).all()


@router.post("", response_model=ReviewOut)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    if not db.get(Product, payload.product_id):
        raise HTTPException(400, "Selected product does not exist")
    duplicate = db.query(Review).filter(
        Review.product_id == payload.product_id,
        Review.rating == payload.rating,
        func.lower(Review.review_text) == payload.review_text.lower(),
    ).first()
    if duplicate:
        raise HTTPException(409, "This review entry already exists")
    sentiment, score, issue = analyze_review(payload.review_text, payload.rating)
    review = Review(**payload.model_dump(), sentiment=sentiment, sentiment_score=score, issue_category=issue)
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.post("/upload-csv")
def upload_reviews_csv(file: UploadFile, db: Session = Depends(get_db)):
    path = save_upload(file)
    df = load_csv(path, ["product_id", "rating", "review_text"])
    for row in df.to_dict("records"):
        if not db.get(Product, int(row["product_id"])):
            raise HTTPException(400, f"Product {row['product_id']} does not exist")
        sentiment, score, issue = analyze_review(row["review_text"], int(row["rating"]))
        db.add(Review(**row, sentiment=sentiment, sentiment_score=score, issue_category=issue))
    db.add(UploadedFile(file_name=file.filename, file_type="reviews", status="processed"))
    db.commit()
    return {"message": f"Imported {len(df)} reviews"}


@router.get("/analysis")
def review_analysis(db: Session = Depends(get_db)):
    by_sentiment = db.query(Review.sentiment, func.count(Review.id)).group_by(Review.sentiment).all()
    by_issue = db.query(Review.issue_category, func.count(Review.id)).filter(Review.issue_category.isnot(None)).group_by(Review.issue_category).all()
    return {
        "sentiment": [{"name": s, "count": c} for s, c in by_sentiment],
        "issues": [{"name": i, "count": c} for i, c in by_issue],
    }
