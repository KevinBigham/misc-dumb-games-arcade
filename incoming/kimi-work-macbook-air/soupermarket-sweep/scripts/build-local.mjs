import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;
const outDir = join(root, "dist");
const assetsDir = join(outDir, "assets");
const bundler = join(root, "node_modules/@esbuild/darwin-arm64/bin/esbuild");
const entry = join(root, "src/game/static-main.ts");
const output = join(assetsDir, "soupermarket.js");

mkdirSync(assetsDir, { recursive: true });

// Use the native esbuild executable directly. Besides being fast, this avoids
// relying on Node to load multi-megabyte compiler modules on network-mounted
// workspaces, which can otherwise stall before a build produces any output.
execFileSync(bundler, [
  entry,
  "--bundle",
  "--minify",
  "--sourcemap",
  "--format=esm",
  "--target=es2022",
  `--outfile=${output}`,
], { cwd: root, stdio: "inherit" });

copyFileSync(join(root, "src/index.css"), join(assetsDir, "index.css"));
copyFileSync(join(root, "index.html"), join(outDir, "index.html"));

for (const file of ["index.html", "assets/index.css", "assets/soupermarket.js"]) {
  if (!statSync(join(outDir, file)).size) throw new Error(`Empty build output: ${file}`);
}
const html = readFileSync(join(outDir, "index.html"), "utf8");
if (!html.includes('./assets/soupermarket.js')) throw new Error("Entrypoint is missing from built HTML");
console.log("BUILD OK: self-contained Three.js game in dist/");
