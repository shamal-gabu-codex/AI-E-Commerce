from pathlib import Path

import pandas as pd
from fastapi import HTTPException, UploadFile


def save_upload(file: UploadFile, folder: str = "uploads") -> Path:
    Path(folder).mkdir(parents=True, exist_ok=True)
    path = Path(folder) / file.filename
    with path.open("wb") as out:
        out.write(file.file.read())
    return path


def load_csv(path: Path, required_columns: list[str]) -> pd.DataFrame:
    df = pd.read_csv(path)
    missing = [col for col in required_columns if col not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing CSV columns: {', '.join(missing)}")
    return df
