#!/bin/bash
# wraps the artifact body in a standalone page for local tests / saved source
D=$(dirname "$0")
{ echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'; cat "$D/game.html"; echo '</body></html>'; } > "$D/standalone.html"
