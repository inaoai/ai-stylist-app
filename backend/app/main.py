from fastapi import FastAPI
from app import profile, selfie, quiz

app = FastAPI(title="AI Stylist Backend")

# mount routers under explicit namespaces to avoid path collisions
app.include_router(profile.router, prefix="/api/profile")
app.include_router(selfie.router, prefix="/api/selfie")
app.include_router(quiz.router, prefix="/api/quiz")

# existing non-namespaced endpoints (if any) can stay at root
# e.g. login/register OR other health routes can be defined elsewhere
