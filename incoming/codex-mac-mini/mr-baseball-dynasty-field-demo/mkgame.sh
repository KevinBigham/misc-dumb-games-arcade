#!/bin/sh
# concat sections → the single-file game.js monolith (studio convention)
cd "$(dirname "$0")"
cat src/01_core.js src/02_data.js src/03_input.js src/04_sim_ball.js \
    src/05_sim_game.js src/06_sim_field.js src/07_sim_live.js \
    src/08_render.js src/09_audio.js src/10_shell.js > game.js
echo "game.js: $(wc -l < game.js) lines"
