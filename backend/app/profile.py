from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor, Json

router = APIRouter()

class ProfileBaseModel(BaseModel):
    name: str
    age: int
    gender: str
    preferences: dict = {}

DB_CONN = dict(dbname="stylistdb", user="admin", password="admin123", host="db")

@router.post('/profile/{user_id}')
def create_profile(user_id: int, profile: ProfileBaseModel):
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONN)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            """INSERT INTO profiles (user_id, name, age, gender, preferences)
               VALUES (%s, %s, %s, %s, %s)
               ON CONFLICT (user_id) DO UPDATE SET
               name = EXCLUDED.name,
               age = EXCLUDED.age,
               gender = EXCLUDED.gender,
               preferences = EXCLUDED.preferences
               RETURNING user_id, name, age, gender, preferences""",
            (user_id, profile.name, profile.age, profile.gender, Json(profile.preferences))
        )
        saved = cur.fetchone()
        conn.commit()
        return saved
    except Exception as e:
        # include error detail for debugging (remove or sanitize in production)
        raise HTTPException(status_code=400, detail=f"Profile insert failed: {e}")
    finally:
        if conn:
            conn.close()

@router.get('/profile/{user_id}')
def get_profile(user_id: int):
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONN)
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute(
            "SELECT user_id, name, age, gender, preferences FROM profiles WHERE user_id = %s",
            (user_id,)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Profile not found")
        return row
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile query failed: {e}")
    finally:
        if conn:
            conn.close()
