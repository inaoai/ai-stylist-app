@router.post("/login")
def login(data: LoginRequest):
    user = authenticate_user(data.email, data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token({"sub": str(user.user_id), "user_id": user.user_id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.user_id,     # 👈 send userId
        "email": user.email     # optional, helpful on frontend
    }



@router.post("/register")
def register(data: RegisterRequest):
    user_id = create_user(data.email, data.password)
    if not user_id:
        raise HTTPException(status_code=400, detail="Registration failed")

    access_token = create_access_token({"sub": str(user_id)})
    return {
        "message": "Registered successfully",
        "user_id": user_id,
        "access_token": access_token,
        "token_type": "bearer"
    }
