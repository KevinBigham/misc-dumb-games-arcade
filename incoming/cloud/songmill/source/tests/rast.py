import re,sys
from PIL import Image, ImageDraw, ImageFont, ImageColor
src,dst,S=sys.argv[1],sys.argv[2],int(sys.argv[3]) if len(sys.argv)>3 else 3
svg=open(src).read()
W=float(re.search(r'width="([\d.]+)"',svg).group(1)); H=float(re.search(r'height="([\d.]+)"',svg).group(1))
img=Image.new('RGBA',(int(W*S),int(H*S)),(14,27,26,255))
def rgba(c,a):
    c=c.strip()
    if c.startswith('rgba'):
        v=[float(x) for x in re.findall(r'[\d.]+',c)]; return (int(v[0]),int(v[1]),int(v[2]),int(255*v[3]*a))
    try: r,g,b=ImageColor.getrgb(c)[:3]
    except Exception: r,g,b=(255,0,255)
    return (r,g,b,int(255*a))
for m in re.finditer(r'<(path|text)([^>]*)>(?:([^<]*)</text>)?',svg):
    tag,attrs,txt=m.groups(); A=dict(re.findall(r'([\w-]+)="([^"]*)"',attrs))
    lay=Image.new('RGBA',img.size,(0,0,0,0)); d=ImageDraw.Draw(lay)
    if tag=='path':
        subs=[]; cur=[]
        for cmd,x,y in re.findall(r'([MLZ])\s*([-\d.]*)\s*([-\d.]*)',A['d']):
            if cmd=='M':
                if cur: subs.append((cur,False))
                cur=[(float(x)*S,float(y)*S)]
            elif cmd=='L': cur.append((float(x)*S,float(y)*S))
            elif cmd=='Z':
                if cur: subs.append((cur,True)); cur=[]
        if cur: subs.append((cur,False))
        if A.get('fill','none')!='none':
            col=rgba(A['fill'],float(A.get('fill-opacity',1)))
            for pts,_ in subs:
                if len(pts)>=3: d.polygon(pts,fill=col)
        if 'stroke' in A:
            col=rgba(A['stroke'],float(A.get('stroke-opacity',1))); w=max(1,int(round(float(A['stroke-width'])*S)))
            for pts,cl in subs:
                if cl: pts=pts+[pts[0]]
                if len(pts)>=2: d.line(pts,fill=col,width=w,joint='curve')
    else:
        fs=float(A['font-size'])*S
        try: f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',int(fs))
        except Exception: f=ImageFont.load_default()
        x=float(A['x'])*S; y=float(A['y'])*S; anc={'middle':'ms','end':'rs'}.get(A.get('text-anchor'),'ls')
        d.text((x,y),txt.replace('&amp;','&').replace('&lt;','<'),fill=rgba(A['fill'],float(A.get('fill-opacity',1))),font=f,anchor=anc)
    img=Image.alpha_composite(img,lay)
img.save(dst)
print('saved',dst,img.size)
