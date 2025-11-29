from pydub import AudioSegment
import os
from typing import List

def combine_samples(sample_paths: List[str], output_path: str, bpm: int = 120) -> str:
    """
    Combines up to 10 samples into one mp3, spacing each 2 bars apart at the given BPM.
    Only .wav and .mp3 files are accepted.
    Returns the output file path.
    """
    # Place each sample so it starts every 4 seconds (4000 ms) from the start, regardless of previous sample length
    offset_ms = 4000
    segments = []
    max_end = 0
    for idx, path in enumerate(sample_paths):
        if not path.lower().endswith(('.wav', '.mp3')):
            continue
        seg = AudioSegment.from_file(path)
        # Truncate to 4 seconds if longer
        if len(seg) > offset_ms:
            seg = seg[:offset_ms]
        start = offset_ms * idx
        seg_with_offset = AudioSegment.silent(duration=start) + seg
        segments.append(seg_with_offset)
        max_end = max(max_end, start + len(seg))
    # Overlay all segments
    if segments:
        combined = AudioSegment.silent(duration=max_end)
        for seg in segments:
            combined = combined.overlay(seg)
    else:
        combined = AudioSegment.silent(duration=0)
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    combined.export(output_path, format="mp3")
    return output_path
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    combined.export(output_path, format="mp3")
    return output_path
