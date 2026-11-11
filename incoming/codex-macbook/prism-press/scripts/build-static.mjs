import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const out = path.join(root, "dist");
const modules = ["config", "storage", "model", "audio", "engine", "scene", "static-boot"];
fs.mkdirSync(path.join(out, "assets"), { recursive: true });

for (const name of modules) {
  const sourcePath = path.join(root, "src", "game", `${name}.ts`);
  const source = fs.readFileSync(sourcePath, "utf8");
  const result = ts.transpileModule(source, {
    fileName: sourcePath,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      isolatedModules: true,
      verbatimModuleSyntax: true,
    },
  });
  const errors = (result.diagnostics ?? []).filter((d) => d.category === ts.DiagnosticCategory.Error);
  if (errors.length) {
    for (const error of errors) console.error(ts.flattenDiagnosticMessageText(error.messageText, "\n"));
    process.exit(1);
  }
  fs.writeFileSync(path.join(out, "assets", `${name}.js`), result.outputText);
  console.log(`BUILD: transpiled src/game/${name}.ts`);
}

for (const file of ["three.module.js", "three.core.js"]) {
  const dest = path.join(out, "vendor", "three", "build", file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(root, "node_modules", "three", "build", file), dest);
}
const roundedDest = path.join(out, "vendor", "three", "examples", "jsm", "geometries", "RoundedBoxGeometry.js");
fs.mkdirSync(path.dirname(roundedDest), { recursive: true });
fs.copyFileSync(path.join(root, "node_modules", "three", "examples", "jsm", "geometries", "RoundedBoxGeometry.js"), roundedDest);
fs.copyFileSync(path.join(root, "src", "index.css"), path.join(out, "assets", "index.css"));
fs.copyFileSync(path.join(root, "src", "static.html"), path.join(out, "index.html"));
console.log(`BUILD: static game ready at ${out}`);
