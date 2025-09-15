import os
import requests

CV_SERVICE_URL = os.getenv("CV_SERVICE_URL", "http://cv_service:8000")

def analyze_body(image_path: str):
    with open(image_path, "rb") as f:
        resp = requests.post(f"{CV_SERVICE_URL}/analyze/body", files={"file": f})
    return resp.json()

def analyze_undertone(image_path: str):
    with open(image_path, "rb") as f:
        resp = requests.post(f"{CV_SERVICE_URL}/analyze/undertone", files={"file": f})
    return resp.json()
