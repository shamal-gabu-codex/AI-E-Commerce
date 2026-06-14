from pathlib import Path
from uuid import uuid4

import pandas as pd
from fastapi import HTTPException, UploadFile


def save_upload(file: UploadFile, folder: str = "uploads") -> Path:
    Path(folder).mkdir(parents=True, exist_ok=True)
    original_name = Path(file.filename or "upload.csv").name
    if not original_name.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV uploads are supported")
    path = Path(folder) / f"{uuid4().hex}_{original_name}"
    with path.open("wb") as out:
        out.write(file.file.read())
    return path


def load_csv(path: Path, required_columns: list[str]) -> pd.DataFrame:
    df = pd.read_csv(path)
    df = df.where(pd.notna(df), None)
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing CSV columns: {', '.join(missing)}")
    return df
