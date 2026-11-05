#!/usr/bin/env bash
# Join rendered beats into one film and lay the sound under it.
#   bash join.sh parts.txt clips.txt music.wav out_name
# parts.txt : one rendered beat per line, in order          (intro.mp4, network.mp4, ...)
# clips.txt : "<start seconds in the film> <clip.wav>" per line - the REAL audio each beat shows
# music.wav : a bed under everything; it is ducked to ~15% while any clip speaks
# Writes <out>_web.mp4 (fits ~15 MB upload limits) and <out>_master.mp4 (high quality, for X / YouTube).
set -euo pipefail
PARTS=$1; CLIPS=$2; MUSIC=$3; OUT=${4:-film}
P=(); while IFS= read -r l || [ -n "$l" ]; do [ -n "$l" ] && P+=("$l"); done < "$PARTS"   # bash 3.2 safe (macOS has no mapfile)
# 1) picture: concat filter re-encodes, so parts from different encoders join cleanly
IN=(); F=""; for i in "${!P[@]}"; do IN+=(-i "${P[$i]}"); F+="[$i:v]"; done
ffmpeg -y -v error "${IN[@]}" -filter_complex "${F}concat=n=${#P[@]}:v=1:a=0[v]" -map "[v]" -c:v libx264 -crf 12 -preset slow -pix_fmt yuv420p _picture.mp4
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 _picture.mp4)
echo "picture $DUR s from ${#P[@]} parts"
# 2) sound: clips at their offsets + music ducked under them (numpy, so the duck is exact)
python3 - "$CLIPS" "$MUSIC" "$DUR" <<'PY'
import sys, subprocess, wave, numpy as np                       # needs only numpy + ffmpeg (any input format)
clips, music, dur = sys.argv[1], sys.argv[2], float(sys.argv[3]); SR = 48000
def load(p):  # decode any audio file to mono float32 at SR
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).astype(np.float64)
n = int(dur * SR); voice = np.zeros(n); duck = np.ones(n)
for line in open(clips):
    if not line.strip(): continue
    t, p = line.split(None, 1); a = int(float(t) * SR); x = load(p.strip())[: max(0, n - a)]
    voice[a:a + len(x)] += x; duck[a:a + len(x)] = 0.15
k = int(0.25 * SR); duck = np.convolve(duck, np.ones(k) / k, mode='same')          # 250 ms ramps
m = load(music); m = np.tile(m, n // len(m) + 1)[:n] * 0.5
fade = np.minimum(1, np.arange(n) / SR / 1.0) * np.minimum(1, (n - np.arange(n)) / SR / 1.5)
mix = voice + m * duck * fade
mix *= 0.95 / max(1e-9, np.abs(mix).max())
pcm = (np.stack([mix, mix], 1) * 32767).astype('<i2')
with wave.open('_sound.wav', 'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('sound ok, peak normalised to 0.95')
PY
# 3) encodes
ffmpeg -y -v error -i _picture.mp4 -i _sound.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 28 -maxrate 2.7M -bufsize 5.4M \
  -pix_fmt yuv420p -c:a aac -b:a 160k -shortest -movflags +faststart "${OUT}_web.mp4"
ffmpeg -y -v error -i _picture.mp4 -i _sound.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 16 -tune film \
  -pix_fmt yuv420p -c:a aac -b:a 320k -shortest -movflags +faststart "${OUT}_master.mp4"
ls -lh "${OUT}_web.mp4" "${OUT}_master.mp4"
