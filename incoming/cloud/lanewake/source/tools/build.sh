#!/bin/bash
# Builds the Artifact body (no doctype/head, the Artifact wraps it) and a standalone page for local tests.
D=$(cd "$(dirname "$0")/.." && pwd)
{ cat "$D/src/shell.html"; echo '<script>'; cat "$D/src/rules.js"; echo '</script>'; echo '<script>'; cat "$D/src/game.js"; echo '</script>'; } > "$D/artifact-body.html"
{ echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'; cat "$D/artifact-body.html"; echo '</body></html>'; } > "$D/lanewake.html"
node --check "$D/src/rules.js" && node --check "$D/src/game.js" && wc -c "$D/artifact-body.html"
