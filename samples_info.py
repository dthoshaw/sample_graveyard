from pydub import AudioSegment
import os
import json
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from typing import List

def get_significant_duration(file_path: str, silence_thresh: float = -40.0, chunk_size: int = 10) -> float:
    """
    Returns the duration (in seconds) of the audio with significant volume (not silence).
    """
    audio = AudioSegment.from_file(file_path)
    non_silence = [
        chunk for chunk in audio[::chunk_size]
        if chunk.dBFS > silence_thresh
    ]
    return len(non_silence) * chunk_size / 1000.0

def get_samples_info(upload_dir: str) -> List[dict]:
    info = []
    for fname in os.listdir(upload_dir):
        if fname.endswith(('.wav', '.mp3')):
            path = os.path.join(upload_dir, fname)
            try:
                dur = get_significant_duration(path)
                info.append({"file": fname, "significant_duration": dur})
            except Exception:
                info.append({"file": fname, "significant_duration": 0})
    return info

def samples_info_endpoint(upload_dir: str):
    def endpoint():
        return JSONResponse(get_samples_info(upload_dir))
    return endpoint
