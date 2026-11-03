#!/usr/bin/env python3
"""Pack assets/zombie/zombie_albedo.png, zombie_albedo_camo.png (soldier outfit), zombie_normal.png, zombie_rm.png into js/data/rzombie-tex.js (base64 WebP).
Browsers refuse WebGL textures loaded from file:// pages, so the game reads them from this script instead.
Usage (from the MiniFortZombie folder):  python3 tools/zombie/pack_zombie_tex.py      (needs Pillow: pip install pillow)
Repaint zombie_albedo.png (paint over assets/zombie/zombie_uv_template.png to see where each part's UVs land), then run this."""
import base64, io, os
from PIL import Image
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def enc(name, q):
    im = Image.open(os.path.join(root, 'assets', 'zombie', name)).convert('RGB'); b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
js = ('/* Mini Fort Zombie zombie atlas (albedo / normal / roughness-metalness), packed by tools/zombie/pack_zombie_tex.py. Do not edit by hand. */\n'
      'window.RZTEX={map:"%s",camo:"%s",normal:"%s",rm:"%s"};\n') % (enc('zombie_albedo.png', 82), enc('zombie_albedo_camo.png', 80), enc('zombie_normal.png', 85), enc('zombie_rm.png', 90))
open(os.path.join(root, 'js', 'data', 'rzombie-tex.js'), 'w').write(js)
print('wrote js/data/rzombie-tex.js', len(js) // 1024, 'KB')
