#!/bin/sh
set -e
D=/mnt/project-files/games/overnight/prismwheel
cd $D/src
{ cat shell.html; printf '<script id="core">\n'; cat core.js; printf '</script>\n<script id="app">\n'; cat app.js; printf '</script>\n</body>\n</html>\n'; } > $D/prismwheel.html
node -e "
const s=require('fs').readFileSync('$D/prismwheel.html','utf8');
const vm=require('vm');const re=/<script id=\"(\w+)\">([\s\S]*?)<\/script>/g;let m;while((m=re.exec(s))){new vm.Script(m[2],{filename:m[1]});console.log('parsed',m[1],m[2].length)}
console.log('bytes',s.length)"
# artifact form: the publisher wraps the page in its own doctype/head/body skeleton
python3 - "$D" <<'PY'
import sys,re
d=sys.argv[1]; s=open(d+'/prismwheel.html').read()
for pat in [r'<!doctype html>\n', r'<html lang="en">\n', r'<head>\n', r'<meta charset="utf-8">\n', r'<meta name="viewport"[^>]*>\n', r'</head>\n', r'<body>\n', r'</body>\n', r'</html>\n']:
    s=re.sub(pat,'',s,count=1)
open(d+'/prismwheel.artifact.html','w').write(s)
print('artifact bytes',len(s), s[:80].replace('\n',' | '))
PY
