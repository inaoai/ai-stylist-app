import cv2
import mediapipe as mp
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form
import os, uuid, shutil

app = FastAPI()
UPLOAD_DIR = "/tmp/cv_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- Health check route ---
@app.get("/health")
def health():
    return {"status": "ok"}

# mediapipe solutions
mp_face = mp.solutions.face_detection
mp_pose = mp.solutions.pose

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
    x1 = int(max(0, det.xmin * w))
    y1 = int(max(0, det.ymin * h))
    x2 = int(min(w, (det.xmin + det.width) * w))
    y2 = int(min(h, (det.ymin + det.height) * h))

    face_crop = img_rgb[y1:y2, x1:x2]

    if face_crop.size == 0:
        return {"status": "error", "message": "empty crop"}

    # Average color (in LAB color space for undertone)
    face_lab = cv2.cvtColor(face_crop, cv2.COLOR_RGB2LAB)
    avg_color = np.mean(face_lab.reshape(-1, 3), axis=0)

    L, A, B = avg_color.astype(float)

    # Simple heuristic: undertone classification
    if B > A + 5:
        undertone = "warm"
    elif A > B + 5:
        undertone = "cool"
    else:
        undertone = "neutral"

    confidence = float(abs(A - B) / (L + 1e-5))  # crude confidence score

    return {
        "status": "ok",
        "file": fname,
        "undertone": undertone,
        "confidence": confidence,
        "face_box": {"x": x1, "y": y1, "w": x2 - x1, "h": y2 - y1}
    }


@app.post("/wardrobe/add")
async def add_wardrobe_item(
    name: str = Form(...),
    category: str = Form(...),
    color: str = Form(...)
):
    return {
        "status": "ok",
        "item": {"name": name, "category": category, "color": color}
    }


@app.post("/wardrobe/recognize")
async def recognize_wardrobe(file: UploadFile = File(...)):
    fname = f"{uuid.uuid4()}_{file.filename}"
    path = os.path.join(UPLOAD_DIR, fname)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    img = cv2.imread(path)
    if img is None:
        return {"status": "error", "message": "invalid image"}

    # Compute dominant color (simple heuristic)
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    avg_color = np.mean(img_rgb.reshape(-1, 3), axis=0)
    avg_color = np.clip(avg_color, 0, 255).astype(int)
    dominant_hex = '#%02x%02x%02x' % tuple(avg_color)

    return {
        "status": "ok",
        "recognized_item": {
            "color": dominant_hex,
            "category": "unknown"  # placeholder until we add classifier
        }
    }
    

@app.post("/analyze/body")
async def analyze_body(file: UploadFile = File(...)):
    fname = f"{uuid.uuid4()}_{file.filename}"
    path = os.path.join(UPLOAD_DIR, fname)

    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        image = cv2.imread(path)
        if image is None:
            return {"status": "error", "message": "invalid image"}

        img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        with mp_pose.Pose(static_image_mode=True) as pose:
            results = pose.process(img_rgb)
            if not results.pose_landmarks:
                return {"status": "ok", "body_detected": False}

            # compute bounding box from landmarks
            h, w, _ = image.shape
            xs = [lm.x * w for lm in results.pose_landmarks.landmark]
            ys = [lm.y * h for lm in results.pose_landmarks.landmark]
            x_min = int(max(0, min(xs)))
            y_min = int(max(0, min(ys)))
            x_max = int(min(w, max(xs)))
            y_max = int(min(h, max(ys)))
            bbox = {"x": x_min, "y": y_min, "w": x_max - x_min, "h": y_max - y_min}

            return {
                "status": "ok",
                "body_detected": True,
                "landmarks": len(results.pose_landmarks.landmark),
                "body_box": bbox
            }
    except Exception as e:
        return {"status": "error", "message": str(e)}
