# Significant duration info endpoint
from samples_info import get_samples_info

from fastapi import Request
import re
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from graveyard import combine_samples
import os
import json
import shutil
from typing import List
from typing import List

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
COMPLETED_DIR = "completed"

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(COMPLETED_DIR, exist_ok=True)


def sanitize_filename(filename):
    # Remove directory traversal and replace problematic characters
    filename = os.path.basename(filename)
    filename = re.sub(r'[\\/:*?"<>|]', '_', filename)
    return filename

@app.get("/samples_info/")
def samples_info():
    return get_samples_info(UPLOAD_DIR)

# Endpoint to clear uploads folder
@app.post("/clear_uploads/")
def clear_uploads():
    for f in os.listdir(UPLOAD_DIR):
        file_path = os.path.join(UPLOAD_DIR, f)
        if os.path.isfile(file_path):
            try:
                os.remove(file_path)
            except PermissionError:
                # File is in use, skip it
                pass
            except Exception:
                pass
    return {"cleared": True}

@app.post("/upload/")
def upload_files(files: List[UploadFile] = File(...)):
    saved_files = []
    for file in files:
        if file.filename.endswith(('.wav', '.mp3')):
            safe_name = sanitize_filename(file.filename)
            file_path = os.path.join(UPLOAD_DIR, safe_name)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            saved_files.append(safe_name)
    return {"uploaded": saved_files}

@app.get("/list_samples/")
def list_samples():
    files = [f for f in os.listdir(UPLOAD_DIR) if f.endswith(('.wav', '.mp3'))]
    return {"samples": files}

# Serve completed mp3 for download
@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = os.path.join(COMPLETED_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type='audio/mpeg', filename=filename)
    return JSONResponse(status_code=404, content={"error": "File not found"})


@app.post("/graveyard/")
def graveyard(selected: List[str] = Form(...), name: str = Form(...)):
    # Accept 2-10 samples, name is required
    import hashlib, time
    if not (2 <= len(selected) <= 10):
        return JSONResponse(status_code=400, content={"error": "Select between 2 and 10 samples."})
    if not name or not name.strip():
        return JSONResponse(status_code=400, content={"error": "Name is required."})
    sample_paths = [os.path.join(UPLOAD_DIR, fname) for fname in selected]
    safe_name = sanitize_filename(name.strip())
    if not safe_name.lower().endswith('.mp3'):
        safe_name += '.mp3'
    out_name = safe_name
    out_path = os.path.join(COMPLETED_DIR, out_name)
    combine_samples(sample_paths, out_path, bpm=120)
    # Save the list of samples used for this completed file
    meta_path = os.path.join(COMPLETED_DIR, out_name + ".json")
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump({"samples": selected}, f)
    return {"completed": out_name}
# Endpoint to get the list of samples for a completed file
@app.get("/completed_samples/{filename}")
def completed_samples(filename: str):
    meta_path = os.path.join(COMPLETED_DIR, filename + ".json")
    if os.path.exists(meta_path):
        with open(meta_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    return {"samples": []}

@app.get("/completed/")
def completed():
    files = [f for f in os.listdir(COMPLETED_DIR) if f.endswith('.mp3')]
    return {"completed": files}


# Serve uploaded samples for waveform preview
@app.get("/sample/{filename}")
def get_sample(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        if filename.lower().endswith('.mp3'):
            media_type = 'audio/mpeg'
        elif filename.lower().endswith('.wav'):
            media_type = 'audio/wav'
        else:
            media_type = 'application/octet-stream'
        return FileResponse(file_path, media_type=media_type, filename=filename)
    return JSONResponse(status_code=404, content={"error": "File not found"})
