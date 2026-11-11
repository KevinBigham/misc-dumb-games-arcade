import { readFile, writeFile, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const dist = resolve(root, "dist");
let html = await readFile(resolve(dist, "index.html"), "utf8");
const assetRefs = [...html.matchAll(/(?:src|href)="(\.\/)?(assets\/[^"]+)"/g)];
for (const match of assetRefs) {
  const file = match[2];
  const content = await readFile(resolve(dist, file), "utf8");
  if (file.endsWith(".js")) {
    const pattern = new RegExp(`<script([^>]+)src="(?:\\./)?${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"([^>]*)></script>`);
    html = html.replace(pattern, () => `<script type="module">${content.replace(/<\/script/gi, "<\\/script")}</script>`);
  } else if (file.endsWith(".css")) {
    const pattern = new RegExp(`<link([^>]+)href="(?:\\./)?${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"([^>]*)>`);
    html = html.replace(pattern, () => `<style>${content}</style>`);
  }
}
await writeFile(resolve(dist, "index.html"), html);
await rm(resolve(dist, "assets"), { recursive: true, force: true });
console.log("STAMP DUTY: standalone offline dist/index.html created");
