# backend/app/quiz.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Any, Dict
import psycopg2
import psycopg2.extras
import os

router = APIRouter()

# Pydantic model for request body
class QuizPayload(BaseModel):
    answers: Dict[str, Any]

def get_db_conn():
    """
    Small helper to create a DB connection using environment vars.
    For production consider pooling (psycopg2.pool) or async drivers.
    """
    # read DB connection info from environment (matching docker-compose)
    dbname = os.getenv("POSTGRES_DB", "stylistdb")
    user = os.getenv("POSTGRES_USER", "admin")
    password = os.getenv("POSTGRES_PASSWORD", "admin123")
    host = os.getenv("POSTGRES_HOST", "db")
    port = os.getenv("POSTGRES_PORT", "5432")

    return psycopg2.connect(dbname=dbname, user=user, password=password, host=host, port=port)

@router.post("/quiz/{user_id}", status_code=201)
def submit_quiz(user_id: int, payload: QuizPayload):
    """
    Save quiz answers as JSON in the quizzes table.
    Expects body: { "answers": { ... } }
    """
    try:
        conn = get_db_conn()
        cur = conn.cursor()
        # use psycopg2.extras.Json to adapt Python dict to JSONB safely
        cur.execute(
            "INSERT INTO quizzes (user_id, answers) VALUES (%s, %s) RETURNING user_id",
            (user_id, psycopg2.extras.Json(payload.answers))
        )
        inserted_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return {"message": "Quiz saved", "user_id": inserted_id}
    except psycopg2.Error as e:
        # log exception server-side (consider using logging module)
        # return friendly error to client
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Database error saving quiz.")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail="Unexpected server error.")
