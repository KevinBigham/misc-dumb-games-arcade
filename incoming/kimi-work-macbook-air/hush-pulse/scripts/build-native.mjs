import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const esbuild = join(root, "node_modules/@esbuild/darwin-arm64/bin/esbuild");
const out = join(root, "dist");
mkdirSync(join(out, "src/game"), { recursive: true });
mkdirSync(join(out, "vendor"), { recursive: true });
mkdirSync(join(out, "assets"), { recursive: true });

const files = readdirSync(join(root, "src/game")).filter((f) => f.endsWith(".ts"));
for (const file of [...files.map((f) => `src/game/${f}`), "src/standalone.ts"]) {
  const destination = file === "src/standalone.ts" ? "dist/standalone.js" : `dist/${file.replace(/\.ts$/, ".js")}`;
  const result = spawnSync(esbuild, [file, "--format=esm", "--target=es2022", `--outfile=${destination}`], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
}

for (const file of readdirSync(join(out, "src/game")).filter((f) => f.endsWith(".js"))) {
  const path = join(out, "src/game", file);
  let source = readFileSync(path, "utf8");
  source = source.replace(/(from\s*["'])(\.{1,2}\/[^"']+?)(["'])/g, (_all, before, specifier, after) => `${before}${specifier.endsWith(".js") ? specifier : `${specifier}.js`}${after}`);
  writeFileSync(path, source);
}
let standalone = readFileSync(join(out, "standalone.js"), "utf8");
standalone = standalone.replace(/(from\s*["'])\.\/game\//g, "$1./src/game/");
standalone = standalone.replace(/(from\s*["'])(\.{1,2}\/[^"']+?)(["'])/g, (_all, before, specifier, after) => `${before}${specifier.endsWith(".js") ? specifier : `${specifier}.js`}${after}`);
writeFileSync(join(out, "standalone.js"), standalone);
copyFileSync(join(root, "node_modules/three/build/three.module.js"), join(out, "vendor/three.module.js"));
copyFileSync(join(root, "node_modules/three/build/three.core.js"), join(out, "vendor/three.core.js"));
copyFileSync(join(root, "src/index.css"), join(out, "assets/index.css"));
copyFileSync(join(root, "assets/fonts.css"), join(out, "assets/fonts.css"));
mkdirSync(join(out, "assets/fonts"), { recursive: true });
for (const file of readdirSync(join(root, "assets/fonts"))) copyFileSync(join(root, "assets/fonts", file), join(out, "assets/fonts", file));

writeFileSync(join(out, "index.html"), `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><meta name="theme-color" content="#03040a"><link rel="icon" href="data:,"><title>HUSH//PULSE — Sound Is Sight</title><link rel="stylesheet" href="./assets/index.css"><script type="importmap">{"imports":{"three":"./vendor/three.module.js"}}</script></head><body><main id="game-root"><canvas id="game-canvas" aria-label="HUSH PULSE game arena"></canvas><div id="ui-overlay"></div></main><script type="module" src="./standalone.js"></script></body></html>`);
console.log(`HUSH//PULSE built: ${files.length + 1} ES modules → dist/`);
