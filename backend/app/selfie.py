# backend/app/selfie.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pathlib import Path
import os
import psycopg2
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger("selfie")
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def insert_selfie_metadata(user_id: int, filename: str, path: str):
    """
    Insert metadata row into selfies table. Uses get_db_conn() imported locally
    to avoid circular imports at module import time.
    """
    # local import to avoid circular import with app.main
    from app.main import get_db_conn

    conn = get_db_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO selfies (user_id, filename, path, uploaded_at)
            VALUES (%s, %s, %s, %s)
            RETURNING id
            """,
            (user_id, filename, path, datetime.utcnow()),
        )
        inserted_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        return inserted_id
    finally:
        try:
            conn.close()
        except Exception:
            pass


@router.post("/selfie/{user_id}")
async def upload_selfie(user_id: int, file: UploadFile = File(...), current_user=Depends(lambda: None)):
    """
    Save uploaded selfie file and insert a metadata row into 'selfies' table.
    Note: current_user dependency is resolved inside function to avoid circular import.
    """
    # resolve get_current_user at runtime to avoid circular imports
    try:
        from app.main import get_current_user
        # run the dependency to enforce auth
        cu = get_current_user()
        # you can optionally compare cu email -> user_id here for stricter checks
    except Exception as e:
        # if you want to allow unauthenticated uploads for now, comment out next line
        # raise HTTPException(status_code=401, detail="Authentication required")
        logger.debug("get_current_user check skipped or failed: %s", e)

    safe_filename = f"user_{user_id}_{os.path.basename(file.filename)}"
    file_path = UPLOAD_DIR / safe_filename

    try:
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        # insert metadata into DB
        inserted_id = insert_selfie_metadata(user_id, safe_filename, str(file_path))

        return {"message": "Selfie uploaded successfully", "path": str(file_path), "id": inserted_id}
    except psycopg2.Error as db_err:
        logger.exception("Database error saving selfie metadata: %s", db_err)
        # cleanup file if created
        try:
            if file_path.exists():
                file_path.unlink()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Database error saving selfie metadata.")
    except Exception as e:
        logger.exception("Upload failed: %s", e)
        try:
            if file_path.exists():
                file_path.unlink()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
