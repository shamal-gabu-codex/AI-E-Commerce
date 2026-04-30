from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.review import Review
from app.models.uploaded_file import UploadedFile
from app.schemas.review_schema import ReviewCreate, ReviewOut
from app.services.ai.sentiment_analysis import analyze_review
from app.utils.csv_parser import load_csv, save_upload

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("", response_model=list[ReviewOut])
def list_reviews(db: Session = Depends(get_db)):
    return db.query(Review).order_by(Review.created_at.desc()).all()


@router.post("", response_model=ReviewOut)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db)):
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
