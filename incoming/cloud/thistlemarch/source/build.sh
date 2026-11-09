#!/bin/sh
# Builds the single-file game: thistlemarch.html
cd "$(dirname "$0")"
python3 - <<'PY'
t=open('src/template.html').read()
t=t.replace('/*STYLE*/',open('src/style.css').read()).replace('/*CORE*/',open('src/core.js').read()).replace('/*UI*/',open('src/ui.js').read())
open('thistlemarch.html','w').write(t)
print('built', len(t), 'bytes')
PY
