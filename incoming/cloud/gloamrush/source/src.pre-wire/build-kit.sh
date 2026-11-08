#!/bin/sh
# Gloamrush with GameKit inlined: shell + gamekit + core + app -> ../gloamrush.html
set -e
cd "$(dirname "$0")"
KIT=/mnt/project-files/games/kit/gamekit.js
{ cat shell.html; printf '<script id="gamekit">\n'; cat "$KIT"; printf '</script>\n<script id="core">\n'; cat core.js; printf '</script>\n<script id="app">\n'; cat app.js; printf '</script>\n'; } > ../gloamrush.html
node -e "
const s=require('fs').readFileSync('../gloamrush.html','utf8');
const vm=require('vm');const re=/<script id=\"(\w+)\">([\s\S]*?)<\/script>/g;let m;while((m=re.exec(s))){new vm.Script(m[2],{filename:m[1]});console.log('parsed',m[1],m[2].length)}
console.log('bytes',s.length)"
