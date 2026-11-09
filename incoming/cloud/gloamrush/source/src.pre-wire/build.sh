#!/bin/sh
set -e
cd /tmp/claude-0/gr
{ cat shell.html; printf '<script id="core">\n'; cat core.js; printf '</script>\n<script id="app">\n'; cat app.js; printf '</script>\n'; } > /mnt/project-files/gloamrush-2026-11-05/gloamrush.html
node -e "
const s=require('fs').readFileSync('/mnt/project-files/gloamrush-2026-11-05/gloamrush.html','utf8');
const vm=require('vm');const re=/<script id=\"(\w+)\">([\s\S]*?)<\/script>/g;let m;while((m=re.exec(s))){new vm.Script(m[2],{filename:m[1]});console.log('parsed',m[1],m[2].length)}
console.log('bytes',s.length)"
