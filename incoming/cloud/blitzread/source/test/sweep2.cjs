const C=require('../src/core.js');
eval(require('fs').readFileSync(__dirname+'/sweep.cjs','utf8').split('\nmeas(\'base\')')[0].replace("const C=require('../src/core.js');",''));
function apply(){C.CONFIG.TACKLE_R=1.3;for(const k of ['DL','LB','CB','S'])C.CONFIG.SPD[k]*=1.05;C.CONFIG.CLOSE_BOOST=1.2;C.CONFIG.CLOSE_R=4.5;}
apply(); C.CONFIG.SPD.RB=7.4; C.CONFIG.SPD.WR=7.9; C.CONFIG.SPD.SL=7.6; meas('3+slower carriers');
C.CONFIG.STUN=0.35; meas('+stun .35');
C.CONFIG.JUKE.max=1; meas('+1 juke');
