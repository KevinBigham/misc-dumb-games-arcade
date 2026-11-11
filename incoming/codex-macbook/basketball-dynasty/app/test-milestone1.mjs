import { chromium } from 'playwright';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'dist');
const out=path.resolve(root,'../../evidence/m1');
await mkdir(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'};
const server=http.createServer(async(req,res)=>{
  try{const url=new URL(req.url,'http://local');const rel=url.pathname==='/'?'index.html':url.pathname.slice(1);const file=path.join(root,rel);const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);}catch{res.writeHead(404);res.end('not found');}
});
await new Promise(r=>server.listen(4187,'127.0.0.1',r));
const browser=await chromium.launch({headless:true});
const started=Date.now();
const errors=[]; const failed=[]; const checks=[];
async function wire(page){page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});}
async function shot(page,name){await page.screenshot({path:path.join(out,name),fullPage:false});}
async function probe(page,label){const p=await page.evaluate(()=>window.__gameProbe());checks.push({label,...p});console.log(label,JSON.stringify(p));}
try{
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const page=await context.newPage();await wire(page);
  await page.goto('http://127.0.0.1:4187/',{waitUntil:'networkidle'});await page.waitForFunction(()=>window.__SCENE_READY__===true);await page.waitForTimeout(1200);await shot(page,'01-title-desktop.png');
  await page.getByRole('button',{name:'START NEW DYNASTY'}).click();await page.waitForTimeout(800);await shot(page,'02-team-select-desktop.png');
  checks.push({label:'30 selectable teams',count:await page.locator('.franchise-card').count()});
  await page.locator('[data-team="miami"]').click();await page.waitForTimeout(500);await shot(page,'03-team-sheet-desktop.png');
  await page.locator('#seed-input').fill('CRITIC-2027');
  await page.locator('[data-action="confirm-team"]').click();await page.waitForTimeout(1400);await shot(page,'04-hub-desktop.png');await probe(page,'desktop hub');
  await page.locator('.side-nav [data-tab="roster"]').click();await page.waitForTimeout(500);checks.push({label:'12 generated players',count:await page.locator('.roster-row:not(.roster-head)').count()});
  await page.locator('.roster-row:not(.roster-head)').first().click();await page.waitForTimeout(400);await shot(page,'05-player-desktop.png');
  await page.locator('.player-modal [data-action="close-modal"]').last().click();
  await page.locator('.side-nav [data-tab="league"]').click();await page.waitForTimeout(500);checks.push({label:'30 league rows',count:await page.locator('.standing-row').count()});
  await page.locator('.side-nav [data-tab="overview"]').click();await page.locator('.hub-top [data-action="owner"]').click();await page.waitForTimeout(300);checks.push({label:'owner brief visible',visible:await page.locator('.owner-modal').isVisible()});await shot(page,'05b-owner-desktop.png');await page.locator('[data-stance="contender"]').click();checks.push({label:'owner choice saved',saved:await page.evaluate(()=>JSON.parse(localStorage.getItem('bscfd-legendary-gm-v1')).stance==='contender')});
  await page.reload({waitUntil:'networkidle'});await page.locator('[data-action="continue"]').click();await page.waitForTimeout(500);await probe(page,'continued save');
  await page.waitForTimeout(2200);await probe(page,'desktop rendering after play');
  await context.close();

  const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const mp=await mobile.newPage();await wire(mp);
  await mp.goto('http://127.0.0.1:4187/',{waitUntil:'networkidle'});await mp.waitForFunction(()=>window.__SCENE_READY__===true);await mp.waitForTimeout(700);await shot(mp,'06-title-mobile.png');
  await mp.locator('[data-action="new-game"]').click();await mp.waitForTimeout(500);await shot(mp,'07-team-select-mobile.png');
  await mp.locator('[data-team="seattle"]').click();await mp.locator('#seed-input').fill('MOBILE-2027');await mp.locator('[data-action="confirm-team"]').click();await mp.waitForTimeout(1400);await shot(mp,'08-hub-mobile.png');
  await mp.locator('.bottom-nav [data-tab="roster"]').click();await mp.waitForTimeout(500);await shot(mp,'09-roster-mobile.png');
  await mp.locator('.roster-row:not(.roster-head)').first().click();await mp.waitForTimeout(300);checks.push({label:'mobile player modal visible',visible:await mp.locator('.player-modal').isVisible()});await mp.locator('.player-modal [data-action="close-modal"]').last().click();
  await mp.locator('.bottom-nav [data-tab="league"]').click();await mp.waitForTimeout(400);await shot(mp,'10-league-mobile.png');
  await mp.setViewportSize({width:844,height:390});await mp.waitForTimeout(500);await probe(mp,'mobile landscape');await shot(mp,'11-league-landscape.png');
  await mobile.close();
  const elapsed=Date.now()-started;if(elapsed<20000)await new Promise(r=>setTimeout(r,20000-elapsed));
  const report={durationSeconds:(Date.now()-started)/1000,checks,errors,failedRequests:failed};
  console.log('REPORT',JSON.stringify(report,null,2));
  if(errors.length||failed.length||checks.find(c=>c.count===0||c.visible===false))process.exitCode=1;
}finally{await browser.close();await new Promise(r=>server.close(r));}
