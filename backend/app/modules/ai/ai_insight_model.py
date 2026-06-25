from datetime import datetime

from sqlalchemy import DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AIHealthScoreHistory(Base):
    __tablename__ = "ai_health_score_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    score: Mapped[int] = mapped_column(Integer)
    risk_level: Mapped[str] = mapped_column(String(20), index=True)
    payload: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AIExecutiveSummaryHistory(Base):
    __tablename__ = "ai_executive_summary_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    period: Mapped[str] = mapped_column(String(20), index=True)
    payload: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AISimulationHistory(Base):
    __tablename__ = "ai_simulation_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    scenario_type: Mapped[str] = mapped_column(String(80), index=True)
    payload: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
