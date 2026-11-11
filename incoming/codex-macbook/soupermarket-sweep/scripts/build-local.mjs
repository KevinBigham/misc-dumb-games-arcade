import { createRequire } from "node:module";
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync, statSync } from "node:fs";
import { join } from "node:path";
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = new URL("../", import.meta.url).pathname;
const sourceDir = join(root, "src/game");
const outDir = join(root, "dist");
mkdirSync(join(outDir, "assets/game"), { recursive: true });
mkdirSync(join(outDir, "vendor"), { recursive: true });
let errors = 0;
const files = readdirSync(sourceDir).filter((file) => file.endsWith(".ts"));
for (const file of files) {
  const source = readFileSync(join(sourceDir, file), "utf8");
  const result = ts.transpileModule(source, {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext, isolatedModules: true },
  });
  for (const diagnostic of result.diagnostics ?? []) {
    if (diagnostic.category !== ts.DiagnosticCategory.Error) continue;
    errors++;
    console.error(`${file}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`);
  }
  const code = result.outputText.replace(/(from\s+["'])(\.\.?\/[^"']+)(["'])/g, (_, start, specifier, end) => `${start}${specifier.endsWith(".js") ? specifier : `${specifier}.js`}${end}`);
  writeFileSync(join(outDir, "assets/game", file.replace(/\.ts$/, ".js")), code);
}
copyFileSync(join(root, "src/index.css"), join(outDir, "assets/index.css"));
copyFileSync(join(root, "index.html"), join(outDir, "index.html"));
copyFileSync(join(root, "node_modules/three/build/three.module.js"), join(outDir, "vendor/three.module.js"));
copyFileSync(join(root, "node_modules/three/build/three.core.js"), join(outDir, "vendor/three.core.js"));
if (errors) process.exit(1);
for (const file of ["index.html", "assets/index.css", "assets/game/static-main.js", "vendor/three.module.js", "vendor/three.core.js"]) {
  const path = join(outDir, file);
  if (!statSync(path).size) throw new Error(`Empty build output: ${file}`);
}
const entry = readFileSync(join(outDir, "assets/game/static-main.js"), "utf8");
if (!entry.includes('from "./boot.js"')) throw new Error("Entrypoint import rewriting failed");
console.log(`BUILD OK: ${files.length} game modules, local Three.js, static output in dist/`);
