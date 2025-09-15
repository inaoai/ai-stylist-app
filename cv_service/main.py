import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, UploadFile, File
import os, uuid, shutil

app = FastAPI()
UPLOAD_DIR = "/tmp/cv_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Health check route ---
@app.get("/health")
def health():
    return {"status": "ok"}


mp_face = mp.solutions.face_detection

@app.post("/analyze/undertone")
async def analyze_undertone(file: UploadFile = File(...)):
    fname = f"{uuid.uuid4()}_{file.filename}"
    path = os.path.join(UPLOAD_DIR, fname)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Load image
    img = cv2.imread(path)
    if img is None:
        return {"status": "error", "message": "invalid image"}
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Detect face
    with mp_face.FaceDetection(model_selection=1, min_detection_confidence=0.5) as face_detection:
        results = face_detection.process(img_rgb)

    if not results.detections:
        return {"status": "no face detected"}

    # Get first face bounding box
    h, w, _ = img.shape
    det = results.detections[0].location_data.relative_bounding_box
    x1, y1 = int(det.xmin * w), int(det.ymin * h)
    x2, y2 = int((det.xmin + det.width) * w), int((det.ymin + det.height) * h)

    face_crop = img_rgb[max(0, y1):y2, max(0, x1):x2]

    if face_crop.size == 0:
        return {"status": "error", "message": "empty crop"}

    # Average color (in LAB color space for undertone)
    face_lab = cv2.cvtColor(face_crop, cv2.COLOR_RGB2LAB)
    avg_color = np.mean(face_lab.reshape(-1, 3), axis=0)

    L, A, B = avg_color

    # Simple heuristic: undertone classification
    if B > A + 5:
        undertone = "warm"
    elif A > B + 5:
        undertone = "cool"
    else:
        undertone = "neutral"

    return {
        "status": "ok",
        "file": fname,
        "undertone": undertone,
        "confidence": float(abs(A - B) / (L + 1e-5))  # crude confidence score
    }
