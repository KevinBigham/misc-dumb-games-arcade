# HARDCOURT — Franchise Basketball

A standalone basketball franchise game built for Kevin. Take over an original professional team in 2005, run the front office, coach games, and build a dynasty across seasons.

## Play

**On this Mac:** Open **Hardcourt.app** in this folder. The app has its own window and menus. It runs offline and needs no installation or account.

**Portable version:** Open **Hardcourt.html** in Chrome, Safari, Edge, or Firefox. Keep the file wherever you want to play. All scripts, styles, icons and court graphics are included.

**Mac archive:** Hardcourt-Mac.zip contains the universal Mac app. Unzip it and open Hardcourt. The build targets macOS 13 or later on Apple silicon and Intel; the native playthrough was tested on Apple silicon.

## Your first five minutes

1. Choose a city, enter your manager name, and take the keys. Three independent career slots are available.
2. Open **Roster**. Click players to inspect skills, contracts, morale and career stats. Set playing time and normalize the rotation to 240 minutes. Player reports also let you set scoring priority.
3. Set your pace, offense, defense and training focus in **Game plan**.
4. Use **Market** for free agents and trades. You can trade multiple players and current or future picks. Review cap matching and the other team's evaluation before proposing a deal.
5. Choose **Play next game** to coach the live simulation, or **Simulate…** to advance one game, a week, to the deadline, or through the regular season.

## The complete franchise loop

- **Regular season:** 30 teams, 82 games per team, 41 home games and 41 road games. Games simulate possessions, shots, fouls, turnovers, assists, rebounds, steals and blocks. Your rotation, skills, morale, condition, coach and tactics affect results.
- **Live coaching:** Watch automatically, advance a possession, simulate a quarter, or finish the game. Change tactics during play. Box scores and play-by-play update throughout. A game in progress can be saved and resumed. Finish it before making roster transactions.
- **Team building:** Player-and-pick trades, AI acceptance evaluation, free agent negotiations, minimum contracts, returning-player rights, guaranteed buyouts and salary matching. CPU teams sign players, retain veterans, and make rebuilding or win-now trades.
- **Development:** Young players improve toward their potential. Weekly training, coaching and the development center affect growth. Older players decline and retire. Injuries and condition affect availability and performance.
- **Postseason:** The top eight teams per conference qualify. Four best-of-seven rounds determine the champion. Follow every series in the bracket or coach your own games.
- **Offseason:** Review awards, re-sign expiring contracts, enter the lottery, run a two-round draft, sign free agents, trim your roster, and begin another season. The game has no preset season limit.
- **Scouting:** Spend 15 points per visit. Three visits reveal exact overall and potential. Scouting points accrue during the season. The 14 non-playoff teams enter a weighted lottery for the first four selections.
- **Ownership:** Set ticket prices and marketing, hire a coaching specialist, and invest in your arena, development and sports medicine. Track cash, profit, fan support, win targets and owner confidence.
- **History:** Champions, MVP, defensive player, rookie honors, all-league teams, player career histories, transaction records and dynasty achievements persist across seasons.

The game uses original teams and players, an abstract game-day schedule, and simplified cap and lottery rules. Gameplay centers on franchise management and a possession-by-possession coaching viewer. Owner confidence measures your performance; it does not forcibly end a career.

## Save your career

The game autosaves after decisions. Use **Career → Export save** to keep a portable JSON backup. Use **Import career** to move it between the Mac app, browsers and computers. Importing into an occupied slot asks before replacing it.

The Mac app and each browser have separate local storage. Export/import transfers a career between them. Browser data clearing or private browsing can remove browser saves, so keep an exported backup. Avoid moving or replacing the app while it is running.

Mac shortcuts: **⌘S** save, **⌘E** export, **⌘O** import, **⌘N** career selection, **⌃⌘F** full screen.

## Difficulty

- **Relaxed:** More forgiving trade evaluation.
- **Standard:** Normal front office demands.
- **Ruthless:** Stronger trade returns and tighter salary demands.

Difficulty changes negotiation demands. The basketball simulation uses the same rules for every team.

## Files and source

- **Hardcourt.app:** Native Mac app with persistent storage and native file dialogs.
- **Hardcourt-Mac.zip:** App packaged for copying to another Mac.
- **Hardcourt.html:** Complete portable offline game.
- **Hardcourt-Source.zip:** Editable JavaScript/CSS/HTML, Swift app wrapper, build script and automated tests.
- **Hardcourt-Preview.png:** Game screenshot.

The source version requires no runtime dependencies. Open game/index.html to play it. Build the portable file with `python3 build.py`; add `--app` on a Mac with Apple Command Line Tools to build the universal app. The included developer README explains verification.
