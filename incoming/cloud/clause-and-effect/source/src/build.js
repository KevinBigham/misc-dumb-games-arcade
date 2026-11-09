const fs=require('fs');
const core=fs.readFileSync(__dirname+'/core.js','utf8').replace(/\ncomputePars\(\);\nif \(typeof module[^\n]*\n/,'\ncomputePars();\n');
const ui=fs.readFileSync(__dirname+'/ui.js','utf8');
const css=fs.readFileSync(__dirname+'/style.css','utf8');
const html=`<title>Clause &amp; Effect</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="A puzzle game about rewriting the rules. Pip edits the Registry's ledger to escape, and the Auditor seals every loophole.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Courier+Prime:wght@400;700&family=Stardos+Stencil:wght@400;700&display=swap">
<style>
${css}
</style>
<div id="app"></div>
<script>
"use strict";
// Clause & Effect — single-file build. Sections: CONFIG, DATA, RULES (pure), STORAGE, AUDIO, STATE, RENDERER, UI, INPUT, BOOT.
${core}
${ui}
</script>
`;
fs.mkdirSync(__dirname+'/dist',{recursive:true});
fs.writeFileSync(__dirname+'/dist/clause-and-effect.html',html);
console.log('built',html.length,'bytes');
