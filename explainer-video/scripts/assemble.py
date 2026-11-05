"""Frames + narration -> MP4 (1920x1080, 30 fps, H.264 + AAC).
usage: python3 -u assemble.py <rec dir> <tts dir> <site dir with a/> <out.mp4>
The audio track is built sample-exact: every narration clip and every played site clip is placed at its recorded time."""
import json, os, subprocess, sys, wave
import numpy as np
rec, tts, site, outp = [os.path.abspath(x) for x in sys.argv[1:5]]
SR = 48000
fr = json.load(open(os.path.join(rec, "frames.json")))
tl = json.load(open(os.path.join(rec, "timeline.json")))
T = tl["tEnd"]
print(f"ASSEMBLE start frames={len(fr)} secs={T:.1f}", flush=True)

# --- video: concat demuxer with per-frame durations, then constant 30 fps ---
fr = [x for x in fr if x["t"] <= T]
lst = os.path.join(rec, "concat.txt")
with open(lst, "w") as f:
    for i, x in enumerate(fr):
        t0 = max(0.0, x["t"]); t1 = fr[i + 1]["t"] if i + 1 < len(fr) else T
        if t1 <= 0: continue
        f.write(f"file 'frames/{x['f']}'\nduration {max(0.001, t1 - t0):.4f}\n")
    f.write(f"file 'frames/{fr[-1]['f']}'\n")
vid = os.path.join(rec, "video_only.mp4")
r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-vf", "fps=30,scale=1920:1080:flags=lanczos,format=yuv420p",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-tune", "stillimage", vid], cwd=rec)
assert r.returncode == 0, "video encode failed"

# --- audio: decode each clip to 48 kHz mono float, place at its time ---
def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
mix = np.zeros(int((T + 1) * SR), dtype=np.float32)
placed = 0
for s in tl["says"]:
    a = load(os.path.join(tts, s["id"] + ".wav")); i = int(s["t"] * SR)
    end = min(len(mix), i + len(a)); mix[i:end] += a[:end - i]; placed += 1
for p in tl.get("plays", []):
    a = load(os.path.join(site, p["file"])) * 0.9; i = int(p["t"] * SR)
    end = min(len(mix), i + len(a)); mix[i:end] += a[:end - i]; placed += 1
pk = float(np.max(np.abs(mix))) or 1.0
mix = mix * (0.89 / pk)  # peak about -1 dBFS
wav = os.path.join(rec, "mix.wav")
with wave.open(wav, "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", vid, "-i", wav, "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest",
                    "-movflags", "+faststart", outp])
assert r.returncode == 0, "mux failed"
mb = os.path.getsize(outp) / 1e6
print(f"ASSEMBLE_DONE {outp} {mb:.1f} MB, {placed} clips placed, {T:.1f} s", flush=True)
