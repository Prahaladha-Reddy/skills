"""Backgrounds for the film, pure numpy.
  python make_grounds.py   -> assets/ground_prism.png (pitch black + soft rainbow arc), assets/ground_bloom.png (cream + blue/orange blooms)
Tune the bloom centres so no data ever sits on a saturated bloom (numbers on blue read poorly)."""
import os
import numpy as np
from PIL import Image

W, H = 1920, 1080
os.makedirs('assets', exist_ok=True)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
rng = np.random.default_rng(1)

# 1. pitch black with a prism arc (bands from the outside in: cream, peach, coral, mauve, periwinkle, teal)
r = np.hypot(xx - 960, yy - 1400)
A = np.zeros((H, W, 3), np.float32)
for rad, c in [(560, (58, 143, 122)), (640, (130, 162, 215)), (720, (156, 72, 107)), (800, (231, 93, 104)), (880, (238, 167, 101)), (980, (239, 203, 148))]:
    w = np.exp(-((r - rad) / 70) ** 2)[..., None]
    A = A * (1 - 0.85 * w) + (np.array(c) / 255) * 0.85 * w
A = A * (0.55 + 0.45 * np.clip(1 - (r - 980) / 900, 0, 1))[..., None]
light = A.max(2, keepdims=True)                      # grain only where there is light, so black stays black
A = np.clip(A + rng.standard_normal((H, W, 1)) * 0.035 * np.clip(light * 4, 0, 1), 0, 1)
Image.fromarray((A * 255).astype(np.uint8)).save('assets/ground_prism.png')

# 2. cream with blooms
B = np.ones((H, W, 3), np.float32) * np.array([253, 241, 232]) / 255
def bloom(cx, cy, sx, sy, col, a):
    g = np.exp(-(((xx - cx) / sx) ** 2 + ((yy - cy) / sy) ** 2))
    n = np.asarray(Image.fromarray(rng.standard_normal((H // 32, W // 32)).astype(np.float32)).resize((W, H), Image.BICUBIC))  # soft cloud
    return (np.clip(g * (1 + 0.35 * n), 0, 1) * a)[..., None] * (np.array(col) / 255 - B)
B = B + bloom(1480, 110, 540, 230, (42, 68, 200), 0.95)      # blue, top right (kept above the data)
B = B + bloom(1960, 1080, 330, 200, (60, 90, 215), 0.7)      # blue, far corner
B = B + bloom(900, 620, 380, 330, (240, 120, 40), 0.55)      # warm centre
B = B + bloom(250, 950, 500, 250, (250, 198, 181), 0.6)      # peach, bottom left
Image.fromarray((np.clip(B, 0, 1) * 255).astype(np.uint8)).save('assets/ground_bloom.png')
print('wrote assets/ground_prism.png, assets/ground_bloom.png')
