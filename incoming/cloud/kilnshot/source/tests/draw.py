# Renders the SVG subset viz.js writes (line, circle, polyline, rect, text) into a PNG with PIL.
import sys,re
from PIL import Image,ImageDraw
src=open(sys.argv[1]).read(); out=sys.argv[2]
img=Image.new('RGB',(1000,700),'#f6ead2'); d=ImageDraw.Draw(img,'RGBA')
def col(c):
    c=c.strip()
    m=re.match(r'rgba\((\d+),(\d+),(\d+),([\d.]+)\)',c)
    if m: return (int(m[1]),int(m[2]),int(m[3]),int(float(m[4])*255))
    if c=='none': return None
    if c.startswith('#'):
        c=c[1:]
        if len(c)==3: c=''.join(ch*2 for ch in c)
        return tuple(int(c[i:i+2],16) for i in (0,2,4))
    return {'orange':(255,165,0),'black':(0,0,0)}.get(c,(0,0,0))
def attrs(t): return dict(re.findall(r'([\w-]+)="([^"]*)"',t))
off=[0,0]
for m in re.finditer(r'<(g|/g|line|circle|polyline|rect|text)([^>]*)>([^<]*)',src):
    tag,at,txt=m[1],attrs(m[2]),m[3]
    if tag=='g':
        t=re.search(r'translate\(([-\d.]+),([-\d.]+)\)',at.get('transform',''))
        off=[float(t[1]),float(t[2])] if t else [0,0]; continue
    if tag=='/g': off=[0,0]; continue
    ox,oy=off
    f=lambda k,dflt=0: float(at.get(k,dflt))
    if tag=='line': d.line([(f('x1')+ox,f('y1')+oy),(f('x2')+ox,f('y2')+oy)],fill=col(at.get('stroke','#000')),width=int(f('stroke-width',1)))
    elif tag=='circle':
        x,y,r=f('cx')+ox,f('cy')+oy,f('r'); d.ellipse([x-r,y-r,x+r,y+r],fill=col(at.get('fill','#000')),outline=col(at.get('stroke','none')) if at.get('stroke') else None)
    elif tag=='polyline':
        pts=[tuple(float(v) for v in p.split(',')) for p in at['points'].split()]
        pts=[(x+ox,y+oy) for x,y in pts]
        if len(pts)>1: d.line(pts,fill=col(at.get('stroke')),width=max(1,int(float(at.get('stroke-width',1)))))
    elif tag=='rect':
        x,y=f('x')+ox,f('y')+oy; w,h=f('width'),f('height'); fc=col(at.get('fill','#000'))
        sc=col(at.get('stroke','none')) if at.get('stroke') else None
        d.rectangle([x,y,x+w,y+h],fill=fc,outline=sc)
    elif tag=='text': d.text((f('x')+ox,f('y')+oy-10),txt,fill=(0,0,0))
img.save(out)
