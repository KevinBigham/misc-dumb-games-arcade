const fs=require('fs');
module.exports=function(file){
  const html=fs.readFileSync(file,'utf8');
  const m=html.match(/<script>([\s\S]*)<\/script>/);
  const mod={exports:{}};
  new Function('module','window','document',m[1])(mod,undefined,undefined);
  return mod.exports;
};
