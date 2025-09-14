# backend/app/main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import psycopg2
import os
from app import profile, selfie, quiz   # import routers

app = FastAPI()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret-key-for-dev")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
auth_scheme = HTTPBearer()
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# include routers (quiz mounted under /api to match frontend)
app.include_router(profile.router, prefix="/api")
app.include_router(selfie.router, prefix="/api")
app.include_router(quiz.router, prefix="/api")

# ---------- Helpers ----------
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


class RegisterUser(BaseModel):
    email: EmailStr
    password: str


class LoginUser(BaseModel):
    email: EmailStr
    password: str


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def get_db_conn():
    db_url = os.getenv("DATABASE_URL", "postgresql://admin:admin123@db:5432/stylistdb")
    return psycopg2.connect(db_url)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(auth_scheme)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    conn = get_db_conn()
    cur = conn.cursor()
    cur.execute("SELECT email FROM users WHERE email=%s", (email,))
    row = cur.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="User not found")
    return {"email": email}


# ---------- Routes ----------
@app.post("/register")
def register(user: RegisterUser):
    conn = get_db_conn()
    cur = conn.cursor()
    # check duplicate
    cur.execute("SELECT user_id FROM users WHERE email=%s", (user.email,))
    if cur.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered")

    # Insert and return new user id
    cur.execute(
        "INSERT INTO users (email, password) VALUES (%s, %s) RETURNING user_id",
        (user.email, get_password_hash(user.password)),
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    conn.close()

    # create access token (include both sub and user_id claims)
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = create_access_token(
        data={"sub": user.email, "user_id": new_id},
        expires_delta=access_token_expires
    )

    return {
        "message": "User registered successfully",
        "user_id": new_id,
        "access_token": token,
        "token_type": "bearer",
        "email": user.email
    }


@app.post("/login")
def login(user: LoginUser):
    conn = get_db_conn()
    cur = conn.cursor()
    # fetch id and password hash
    cur.execute("SELECT user_id, password FROM users WHERE email=%s", (user.email,))
    record = cur.fetchone()
    conn.close()

    if not record or not pwd_context.verify(user.password, record[1]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = record[0]
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # include both sub (email) and user_id claim so frontend can parse either
    token = create_access_token(data={"sub": user.email, "user_id": user_id}, expires_delta=access_token_expires)
    return {"access_token": token, "token_type": "bearer", "user_id": user_id}


@app.get("/users/me")
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------- Middleware & Router ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "ok", "message": "AI Stylist backend running"}
