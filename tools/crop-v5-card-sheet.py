"""Split a user-requested 2x2 generated sheet into four independent WebP artworks."""
import json
import sys
from pathlib import Path
from PIL import Image

group=int(sys.argv[1]);source=Path(sys.argv[2]);root=Path(__file__).resolve().parent.parent/'寶可夢3D-V5'/'cards'
rows=json.loads((root/'model-sources.json').read_text(encoding='utf-8'))
dest=root/'art';dest.mkdir(parents=True,exist_ok=True)
with Image.open(source) as image:
    width,height=image.size
    for quadrant,row in enumerate(rows[(group-1)*4:group*4]):
        x=quadrant%2;y=quadrant//2
        image.crop((x*width//2,y*height//2,(x+1)*width//2,(y+1)*height//2)).save(dest/(row['id']+'.webp'),'WEBP',quality=89)
print(f'group {group:02}: '+', '.join(r['id'] for r in rows[(group-1)*4:group*4]))
