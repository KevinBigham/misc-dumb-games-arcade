// node build.js -> snapthread.html (single self-contained file)
const fs = require('fs'), p = require('path');
const r = f => fs.readFileSync(p.join(__dirname, 'src', f), 'utf8');
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#271b16">
<title>Snapthread</title>
<style>
${r('style.css')}
</style></head>
<body><div id="app"><noscript>Snapthread needs JavaScript.</noscript></div>
<script id="st-core">
${r('core.js')}
</script>
<script id="st-art">
${r('art.js')}
</script>
<script id="st-ui">
${r('ui.js')}
</script>
</body></html>
`;
fs.writeFileSync(p.join(__dirname, 'snapthread.html'), html);
console.log('built', html.length, 'bytes');
