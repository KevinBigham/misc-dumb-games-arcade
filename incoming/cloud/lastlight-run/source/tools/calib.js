const c=require('@sparticuz/chromium');const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:await c.executablePath(),args:c.args,headless:true});
const p=await (await b.newContext()).newPage();await p.goto('file://'+process.argv[2]);await p.waitForTimeout(300);
console.log(JSON.stringify(await p.evaluate(()=>__LL.BUILT.map((T,i)=>{const L=__LL;L.BUILT[i].startLight=999;const g=L.sim(i);const a=g.ghost;const out=[];let prevT=0;
 for(const gt of T.gates){let k=0;while(k*2<a.length&&a[k*2]<gt.z)k++;const t=k/10;out.push(+(t-prevT).toFixed(1));prevT=t;}return {time:+g.time.toFixed(1),splits:out};}))));await b.close();})();
