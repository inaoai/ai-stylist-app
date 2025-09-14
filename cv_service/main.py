from fastapi import FastAPI, UploadFile, File

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze/body")
async def analyze_body(file: UploadFile = File(...)):
    return {"status": "pending", "message": "Body detection not yet implemented"}

@app.post("/analyze/undertone")
async def analyze_undertone(file: UploadFile = File(...)):
    return {"undertone": "unknown", "confidence": 0.0}
