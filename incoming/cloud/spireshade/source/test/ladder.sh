#!/bin/bash
# Final bot ladder and fairness run. Results in final_*.txt
cd "$(dirname "$0")"
rm -f final_*.txt
( OPEN=2 node bots.js self 0 0 300 41000 > final_1_pebble_self.txt; OPEN=2 node bots.js vs 1 0 120 42000 > final_2_cairn_vs_pebble.txt; OPEN=2 node bots.js self 1 1 200 43000 > final_3_cairn_self.txt ) &
( OPEN=2 node bots.js vs 2 1 120 44000 > final_4_spire_vs_cairn.txt; OPEN=2 node bots.js self 2 2 200 45000 > final_5_spire_self.txt ) &
( OPEN=2 node bots.js vs 3 2 40 46000 > final_6_summit_vs_spire.txt ) &
( OPEN=3 node bots.js self 3 3 40 47000 > final_7_summit_self.txt ) &
wait
cat final_*.txt
