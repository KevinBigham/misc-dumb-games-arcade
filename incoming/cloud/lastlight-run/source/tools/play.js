const c=require('@sparticuz/chromium');const {chromium}=require('/opt/node-tools/node_modules/playwright');
const FILE=process.argv[2], OUT=__dirname+'/shots/', TAG=process.argv[3]||'';
(async()=>{const b=await chromium.launch({executablePath:await c.executablePath(),args:c.args.filter(a=>!/use-gl|use-angle|enable-unsafe-swiftshader/.test(a)).concat(['--disable-gpu','--disable-accelerated-2d-canvas']),headless:true});
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE '+m.text())});
const cdp=await ctx.newCDPSession(p);
const touch=async(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:q[2]??i}))});
const st=()=>p.evaluate(()=>{const s=__LL.state();return {mode:__LL.mode(),phase:s.phase,x:+s.x.toFixed(3),sp:+(s.speed/12000).toFixed(3),embers:s.embers,boostT:+s.boostT.toFixed(2),light:+s.light.toFixed(1),t:+s.t.toFixed(1),prog:+s.prog.toFixed(3)}});
const perf=async()=>p.evaluate(()=>{const P=__LL.perf();const h=P.hist.slice().sort((a,b)=>a-b);return {frames:P.frames,avgFrame:+(P.dtSum/P.frames*1000).toFixed(1),p95:+h[Math.floor(h.length*0.95)].toFixed(1),avgDraw:+(P.renderSum/P.frames).toFixed(2),maxDraw:+P.renderMax.toFixed(1),q:P.q}});
const resetPerf=()=>p.evaluate(()=>{const P=__LL.perf();P.frames=0;P.dtSum=0;P.dtMax=0;P.renderSum=0;P.renderMax=0;P.hist.length=0;});
// baseline: what does an empty rAF loop cost in this headless box?
const bp=await ctx.newPage(); await bp.setContent('<canvas id=c style="width:100vw;height:100vh"></canvas><script>const c=document.getElementById("c");c.width=585;c.height=1266;const g=c.getContext("2d");let n=0,t0=0,last=0,sum=0;function f(t){if(last){sum+=t-last;n++}last=t;g.fillStyle="hsl("+(t%360)+",50%,50%)";g.fillRect(0,0,585,1266);requestAnimationFrame(f)}requestAnimationFrame(f);setTimeout(()=>document.title=(sum/n).toFixed(1),3000)</script>');
await bp.waitForTimeout(3300); console.log('BASELINE full-canvas fill frame ms (this headless box):',await bp.title()); await bp.close();
await p.goto('file://'+FILE); await p.waitForTimeout(1500);
await p.screenshot({path:OUT+TAG+'01-title.png'});
console.log('scroll',await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth})));
await p.tap('#bRace'); await p.waitForTimeout(3000); console.log('after countdown',await st());
await p.screenshot({path:OUT+TAG+'02-race-start.png'});
await p.evaluate(()=>__LL.setLight(40));
const x0=(await st()).x; await touch('touchStart',[[330,700,1]]); await p.waitForTimeout(500); const x1=(await st()).x; await touch('touchEnd',[]);
console.log('hold right: x',x0,'->',x1);
await touch('touchStart',[[60,700,2]]); await p.waitForTimeout(500); const x2=(await st()).x; await touch('touchEnd',[]); console.log('hold left: ->',x2);
await p.waitForTimeout(1000);
const s0=(await st()).sp; await touch('touchStart',[[60,700,3],[330,700,4]]); await p.waitForTimeout(600); const s1=(await st()).sp; await touch('touchEnd',[]); console.log('both held: speed',s0,'->',s1);
// swipe up via in-page pointer events (CDP touch is ~400ms/event here, too slow for a real flick)
await p.evaluate(()=>__LL.giveEmber());
const sw=await p.evaluate(async()=>{const L=document.getElementById('touch');const ev=(t,y)=>L.dispatchEvent(new PointerEvent(t,{pointerId:77,pointerType:'touch',clientX:200,clientY:y,bubbles:true,cancelable:true}));ev('pointerdown',760);for(let k=1;k<=5;k++){await new Promise(r=>setTimeout(r,16));ev('pointermove',760-k*14);}ev('pointerup',690);await new Promise(r=>setTimeout(r,120));const s=__LL.state();return {embers:s.embers,boostT:s.boostT};});
console.log('swipe-up boost',sw);
await p.evaluate(()=>{__LL.giveEmber();document.getElementById('bBoost').hidden=false});await p.waitForTimeout(2000);
await p.tap('#bBoost'); await p.waitForTimeout(100); console.log('boost button',await st());
// drag steering mode
await p.evaluate(()=>{__LL.input.mode='drag'}); const dx0=(await st()).x; await touch('touchStart',[[200,700,9]]); await touch('touchMove',[[260,700,9]]); await p.waitForTimeout(500); const dx1=(await st()).x; await touch('touchEnd',[]); await p.evaluate(()=>{__LL.input.mode='zones'}); console.log('drag right: x',dx0,'->',dx1);
// bot drives, measure
await p.evaluate(()=>{__LL.setBot(true);__LL.setLight(40)}); await resetPerf(); await p.waitForTimeout(6000);
await p.screenshot({path:OUT+TAG+'03-race-mid.png'}); console.log('perf day',await perf(), await st());
await p.evaluate(()=>__LL.setLight(9)); await p.waitForTimeout(1500); await p.screenshot({path:OUT+TAG+'04-dusk.png'});
await p.evaluate(()=>__LL.setLight(5.5)); await p.waitForTimeout(1500); await p.screenshot({path:OUT+TAG+'05-night.png'}); console.log('perf night',await perf());
await p.waitForTimeout(6000); console.log('after dark',await st()); await p.waitForTimeout(1500); await p.screenshot({path:OUT+TAG+'06-dark-result.png'});
await p.tap('#rAgain'); await p.waitForTimeout(2800); await p.evaluate(()=>{__LL.setBot(true);__LL.jumpTo(0.95);__LL.setLight(20)});
await p.waitForTimeout(5000); console.log('finish?',await st()); await p.waitForTimeout(1200); await p.screenshot({path:OUT+TAG+'07-win-result.png'});
console.log('store',await p.evaluate(()=>{const d=__LL.store();return {unlocked:d.unlocked,best:Object.fromEntries(Object.entries(d.best).map(([k,v])=>[k,{time:+v.time.toFixed(2),ghostLen:v.ghost.length}]))}}));
await p.reload(); await p.waitForTimeout(1200);
console.log('after reload',await p.evaluate(()=>{const d=__LL.store();return {unlocked:d.unlocked,best:Object.keys(d.best)}}));
await p.screenshot({path:OUT+TAG+'08-title-after.png'});
// 375 wide + landscape keyboard
await p.setViewportSize({width:375,height:667}); await p.waitForTimeout(500); console.log('375 scroll',await p.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth})));
await p.screenshot({path:OUT+TAG+'09-375.png'});
console.log('ERRORS',errs); await b.close();})().catch(e=>{console.error(e);process.exit(1)});
