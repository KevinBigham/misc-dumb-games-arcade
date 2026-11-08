// Loads the game's rules from the single HTML file (no DOM) for headless tests.
const fs=require('fs');const path=require('path');
module.exports=function(file){
  file=file||path.join(__dirname,'..','sporecrown.html');
  const html=fs.readFileSync(file,'utf8');
  const m=html.match(/<script>([\s\S]*)<\/script>/);
  const mod={exports:{}};
  new Function('module','window','document',m[1])(mod,undefined,undefined);
  return mod.exports;
};
