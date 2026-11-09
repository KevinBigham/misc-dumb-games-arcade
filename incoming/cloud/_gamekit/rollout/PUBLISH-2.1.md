# Publishing queued GameKit 2.1 games (helper brief)

You publish already-finished game pages to their existing claude.ai artifact URLs. You change no game file.

Rules
- Use only the rows of /mnt/project-files/games/kit/rollout/publish-queue-2.1.tsv that your prompt names (columns: id, url, kit_publish, pre_wire).
- Publish only to that row's exact url. Never create a new artifact, never publish any other file, never touch Dual Meet, Loopskate, or the Stormglass at AFspzaC6rF8BXmLYf4cURk.
- Do not edit kit-publish or pre-wire files. Do not install or download anything. Do not message anyone; you have no user to talk to. Do not call any mcp__hearthbot tool.
- One Artifact publish per turn (parallel publishes are refused).
- If any publish says 429 / daily limit, stop at once, publish nothing more, and report which games are done.

Per game, in order
1. Artifact publish: url = row url, file_path = row kit_publish, label "GameKit 2.1 features".
   - Usually refused because the live version was not viewed; the refusal saves the live source to a path it names.
   - Run: node /mnt/project-files/games/kit/rollout/livecmp.js <saved live path> <pre_wire>
   - Must print SAME. If not, the live page changed: do NOT publish that game; note it and go to the next game.
   - If the first publish went straight through, skip the livecmp in this step.
2. Publish the same file again. If refused as "identical content already refused", send it once more unchanged; it then goes through.
3. Artifact read: url, path "index.html", out_dir /tmp/claude-0/-home-user/675d63ea-d574-55a8-9f25-fd0338219a39/scratchpad/pub/<id>
4. node /mnt/project-files/games/kit/rollout/livecmp.js <that saved index.html> <kit_publish>  -> must print SAME.

You do not need to Read the saved live pages; the livecmp check is enough. Keep tool output small.

Report (final message): one line per game: `<id>: live 2.1 (version id) read-back SAME` or `<id>: NOT published — <reason>`.
