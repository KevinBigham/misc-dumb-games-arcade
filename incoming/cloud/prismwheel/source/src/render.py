# Rasterize a recorded canvas op list (from test-app.js) to PNG with Pillow, plus a sketch of the DOM controls.
import json, re, sys, colorsys
from PIL import Image, ImageDraw, ImageFont

src, dst = sys.argv[1], sys.argv[2]
J = json.load(open(src))
W, H = J['w'], J['h']
img = Image.new('RGBA', (W, H), (5, 6, 15, 255))

def font(size, bold):
    for p in (['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if bold else []) + ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        try: return ImageFont.truetype(p, max(6, int(size)))
        except Exception: pass
    return ImageFont.load_default()

def parse_color(c):
    c = (c or '#000').strip()
    if c.startswith('#'):
        h = c[1:]
        if len(h) == 3: h = ''.join(x * 2 for x in h)
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (1.0,)
    m = re.match(r'rgba?\(([^)]*)\)', c)
    if m:
        p = [float(x) for x in m.group(1).split(',')]
        return (int(p[0]), int(p[1]), int(p[2]), p[3] if len(p) > 3 else 1.0)
    m = re.match(r'hsla?\(([^)]*)\)', c)
    if m:
        p = [x.strip().rstrip('%') for x in m.group(1).split(',')]
        r, g, b = colorsys.hls_to_rgb(float(p[0]) % 360 / 360, float(p[2]) / 100, float(p[1]) / 100)
        return (int(r * 255), int(g * 255), int(b * 255), float(p[3]) if len(p) > 3 else 1.0)
    return (200, 200, 200, 1.0)

def subpaths(d):
    out, cur = [], []
    for cmd, x, y in re.findall(r'([MLZ])\s*(-?[\d.]+)?\s*(-?[\d.]+)?', d):
        if cmd == 'M':
            if cur: out.append(cur)
            cur = [(float(x), float(y))]
        elif cmd == 'L': cur.append((float(x), float(y)))
        elif cmd == 'Z':
            if cur: out.append(cur + [cur[0]]); cur = []
    if cur: out.append(cur)
    return out

def layer_draw(fn, alpha):
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    fn(ImageDraw.Draw(lay))
    if alpha < 1:
        a = lay.getchannel('A').point(lambda v: int(v * alpha)); lay.putalpha(a)
    img.alpha_composite(lay)

# batch consecutive ops into one layer when alpha is 1 for speed
base = ImageDraw.Draw(img)
for op in J['ops']:
    r, g, b, ca = parse_color(op.get('c'))
    a = max(0.0, min(1.0, op.get('a', 1) * ca))
    if a <= 0.01: continue
    col = (r, g, b, 255)
    if op['t'] == 'f':
        polys = [p for p in subpaths(op['d']) if len(p) >= 3]
        def f(d, polys=polys, col=col):
            for p in polys: d.polygon(p, fill=col)
        layer_draw(f, a)
    elif op['t'] == 's':
        polys = subpaths(op['d']); w = max(1, int(round(op.get('w', 1))))
        def f(d, polys=polys, col=col, w=w, dash=op.get('dash')):
            for p in polys:
                if dash:
                    on, off = dash[0], dash[1] if len(dash) > 1 else dash[0]
                    for (x0, y0), (x1, y1) in zip(p, p[1:]):
                        L = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** .5 or 1; t = 0
                        while t < L:
                            t1 = min(L, t + on); d.line([(x0 + (x1 - x0) * t / L, y0 + (y1 - y0) * t / L), (x0 + (x1 - x0) * t1 / L, y0 + (y1 - y0) * t1 / L)], fill=col, width=w); t = t1 + off
                else: d.line(p, fill=col, width=w, joint='curve')
        layer_draw(f, a)
    elif op['t'] == 'x':
        fnt = font(op['size'], op.get('bold'))
        anchor = {'middle': 'ms', 'end': 'rs'}.get(op['anchor'], 'ls')
        def f(d, op=op, fnt=fnt, anchor=anchor, col=col):
            if op['paint'] == 's': d.text((op['x'], op['y']), op['s'], font=fnt, anchor=anchor, fill=(0, 0, 0, 0), stroke_width=max(1, int(op.get('w', 2) / 2)), stroke_fill=col)
            else: d.text((op['x'], op['y']), op['s'], font=fnt, anchor=anchor, fill=col)
        layer_draw(f, a)

# DOM sketch (CSS px * 3)
S = W / 390; dom = J.get('dom', {})
def dl(fn, alpha=1.0): layer_draw(fn, alpha)
def ctrls(d):
    d.rounded_rectangle([12 * S, 746 * S, 143 * S, 830 * S], radius=22 * S, outline=(160, 170, 255, 90), width=int(S), fill=(255, 255, 255, 14))
    d.rounded_rectangle([247 * S, 746 * S, 378 * S, 830 * S], radius=22 * S, outline=(160, 170, 255, 90), width=int(S), fill=(255, 255, 255, 14))
    fnt = font(30 * S, True)
    d.text((77 * S, 800 * S), '<', font=fnt, anchor='ms', fill=(238, 240, 255, 255)); d.text((312 * S, 800 * S), '>', font=fnt, anchor='ms', fill=(238, 240, 255, 255))
    for i, x in enumerate((282, 334)): d.rounded_rectangle([x * S, 10 * S, (x + 44) * S, 54 * S], radius=14 * S, outline=(160, 170, 255, 90), width=int(S))
    if dom.get('flare') is not None:
        fr = dom['flare']; cx, cy, rr = 195 * S, 788 * S, 38 * S
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=(255, 255, 255, 30))
        d.pieslice([cx - rr, cy - rr, cx + rr, cy + rr], -90, -90 + 360 * fr, fill=(255, 255, 255, 255))
        ri = rr - 5 * S; d.ellipse([cx - ri, cy - ri, cx + ri, cy + ri], fill=(255, 140, 120, 255) if fr >= 1 else (20, 22, 58, 255))
        d.text((cx, cy + 5 * S), 'FLARE', font=font(12 * S, True), anchor='ms', fill=(255, 255, 255, 255))
dl(ctrls)
if dom.get('toast'):
    def t(d):
        d.rounded_rectangle([16 * S, 90 * S, 374 * S, 134 * S], radius=14 * S, fill=(18, 20, 48, 235), outline=(160, 170, 255, 90), width=int(S))
        d.text((195 * S, 118 * S), dom['toast'][:58], font=font(12 * S, False), anchor='ms', fill=(238, 240, 255, 255))
    dl(t)
for name in ('title', 'pause', 'over'):
    if dom.get(name):
        def o(d, name=name):
            d.rectangle([0, 0, W, H], fill=(5, 6, 18, 160))
            d.rounded_rectangle([16 * S, 190 * S, 374 * S, 660 * S], radius=26 * S, fill=(18, 20, 48, 225), outline=(160, 170, 255, 90), width=int(S))
            label = {'title': 'PRISMWHEEL', 'pause': 'PAUSED', 'over': 'A FACE BROKE  ' + dom.get('oscore', '')}[name]
            d.text((195 * S, 250 * S), label, font=font(30 * S, True), anchor='ms', fill=(255, 200, 120, 255))
            if name == 'over': d.text((195 * S, 300 * S), (dom.get('otip') or '')[:48], font=font(11 * S, False), anchor='ms', fill=(214, 219, 255, 255))
        dl(o)
img.convert('RGB').resize((W // 2, H // 2), Image.LANCZOS).save(dst)
