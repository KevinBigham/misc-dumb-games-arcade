import { chromium } from 'playwright';
import http from 'node:http';
import { readFile,mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'dist'),out=path.resolve(root,'../../evidence/m2');await mkdir(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css'};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://local'),rel=url.pathname==='/'?'index.html':url.pathname.slice(1),file=path.join(root,rel),data=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end();}});await new Promise(r=>server.listen(4188,'127.0.0.1',r));
const browser=await chromium.launch({headless:true}),started=Date.now(),errors=[],failed=[],checks=[];
const wire=p=>{p.setDefaultTimeout(60000);p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});};
const shot=(p,n)=>p.screenshot({path:path.join(out,n)});const probe=async(p,label)=>{const v=await p.evaluate(()=>window.__gameProbe());checks.push({label,...v});console.log(label,JSON.stringify(v));return v;};
async function reachHub(p,team='miami'){await p.goto('http://127.0.0.1:4188/',{waitUntil:'networkidle'});await p.waitForFunction(()=>window.__SCENE_READY__);await p.locator('[data-action="new-game"]').click();await p.locator(`[data-team="${team}"]`).click();await p.locator('[data-action="confirm-team"]').click();await p.waitForTimeout(500);}
try{
 const c=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1}),p=await c.newPage();wire(p);await reachHub(p);
 await p.locator('[data-action="start-sim"]').click();await p.waitForTimeout(1800);await probe(p,'simcast started');
 await p.locator('[data-focus="outside"]').click();await p.locator('#pace-input').evaluate(el=>{el.value=78;el.dispatchEvent(new Event('input',{bubbles:true}));});await p.locator('#defense-input').evaluate(el=>{el.value=68;el.dispatchEvent(new Event('input',{bubbles:true}));});await p.locator('[data-action="timeout"]').click();
 await p.locator('[data-speed="2"]').click();await p.waitForTimeout(1800);await shot(p,'01-simcast-desktop.png');await probe(p,'coaching and 2x speed');
 await p.locator('[data-action="pause-sim"]').click();const paused=await probe(p,'paused');await p.waitForTimeout(700);const pausedAfter=await probe(p,'paused after wait');checks.push({label:'pause freezes clock',passed:paused.game.clock===pausedAfter.game.clock});
 await p.locator('[data-speed="8"]').click();await p.locator('[data-action="pause-sim"]').click();await p.waitForTimeout(2200);await shot(p,'02-simcast-busy-desktop.png');
 if(!await p.locator('.result-card').isVisible())await p.locator('[data-action="sim-end"]').click();await p.waitForTimeout(400);checks.push({label:'final result visible',visible:await p.locator('.result-card').isVisible()});await shot(p,'03-final-desktop.png');const finalProbe=await probe(p,'final result');
 await p.locator('[data-action="box-score"]').click();checks.push({label:'ten box score player rows',count:await p.locator('.box-row:not(.box-head)').count()});await shot(p,'04-box-score-desktop.png');await p.locator('.box-modal [data-action="close-box"]').last().click();await p.locator('[data-action="return-hub"]').click();
 checks.push({label:'result persisted',passed:await p.evaluate(()=>!!JSON.parse(localStorage.getItem('bscfd-legendary-gm-v1')).lastResult)});
 // Identical default decisions must produce the same checksum at 1x and 8x.
 await p.locator('[data-action="start-sim"]').click();await p.locator('[data-action="sim-end"]').click();const one=await p.evaluate(()=>window.__gameProbe().game.checksum);await p.locator('[data-action="return-hub"]').click();
 await p.locator('[data-action="start-sim"]').click();await p.locator('[data-speed="8"]').click();await p.locator('[data-action="sim-end"]').click();const eight=await p.evaluate(()=>window.__gameProbe().game.checksum);checks.push({label:'1x and 8x deterministic result',passed:one===eight,one,eight});await p.locator('[data-action="return-hub"]').click();await c.close();
 const mc=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true}),mp=await mc.newPage();wire(mp);await reachHub(mp,'seattle');await mp.locator('[data-action="start-sim"]').click();await mp.waitForTimeout(1600);await shot(mp,'05-simcast-mobile.png');
 await mp.locator('.mobile-coach-button').click();await mp.waitForTimeout(250);await shot(mp,'06-coach-mobile.png');await mp.locator('[data-focus="inside"]').click();await mp.locator('.coach-heading [data-action="coach-toggle"]').click();await mp.locator('[data-speed="4"]').click();await mp.waitForTimeout(1200);await probe(mp,'mobile coaching and 4x');
 if(!await mp.locator('.result-card').isVisible())await mp.locator('[data-action="sim-end"]').click();await mp.waitForTimeout(300);await shot(mp,'07-final-mobile.png');checks.push({label:'mobile final visible',visible:await mp.locator('.result-card').isVisible()});await mc.close();
 const elapsed=Date.now()-started;if(elapsed<20000)await new Promise(r=>setTimeout(r,20000-elapsed));
 const report={durationSeconds:(Date.now()-started)/1000,checks,errors,failedRequests:failed};console.log('REPORT',JSON.stringify(report,null,2));
 if(errors.length||failed.length||checks.some(c=>c.passed===false||c.visible===false||c.count===0))process.exitCode=1;
}finally{await browser.close();await new Promise(r=>server.close(r));}
