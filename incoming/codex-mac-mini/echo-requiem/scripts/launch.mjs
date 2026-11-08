import { spawn } from 'node:child_process';
import { createStaticServer } from './serve.mjs';

const url = 'http://localhost:4173';
const noOpen = process.argv.includes('--no-open');
function openGame() {
  console.log(`SIDELINE is ready: ${url}`);
  if (noOpen) return;
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer.exe' : 'xdg-open';
  const child = spawn(command, [url], { detached: true, stdio: 'ignore' });
  child.on('error', () => console.log(`Open ${url} in your browser.`));
  child.unref();
}
let running = false;
try {
  const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
  running = response.ok && (await response.text()).includes('<title>SIDELINE');
} catch { /* No game server yet. Start the local one below. */ }
if (running) openGame();
else {
  const server = createStaticServer();
  server.on('error', error => {
    console.error(error.code === 'EADDRINUSE' ? 'Port 4173 is in use by another app. Run: npm run dev -- --port 4174' : error.message);
    process.exitCode = 1;
  });
  server.listen(4173, '127.0.0.1', () => {
    openGame();
    console.log('Keep this window open while playing. Control-C stops the game server.');
  });
}
