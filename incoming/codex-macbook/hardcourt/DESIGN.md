# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-11-05
- Primary product surfaces: Hardcourt franchise management game.
- Evidence reviewed: Empty workspace; user requests the depth and feel of a 2005-era football franchise mode translated to basketball. All design choices below are assumptions made under the user's request for autonomous completion.

## Brand
- Personality: Competitive, tactile, confident; a premium front office after the arena lights go down.
- Trust signals: Transparent ratings, finances, transaction feedback, save status, explained simulation.
- Avoid: Real league branding, copied game assets, external dependencies, paywalls.

## Product goals
- Goals: A complete repeatable multi-season basketball management loop with meaningful roster, financial, staff, draft and game decisions.
- Non-goals: Direct player-controlled 3D basketball or licensed historical rosters.
- Success signals: User can start a career, run seasons, build a roster, win a title, export a save and continue indefinitely.

## Personas and jobs
- Primary personas: A solo sports management player.
- User jobs: Build a dynasty, scout prospects, negotiate contracts, manage ownership, watch pivotal games.
- Key contexts of use: Offline desktop; responsive laptop, tablet and phone support.

## Information architecture
- Primary navigation: Overview; Roster; Game plan; Schedule; League; Market; Scouting; Front office; History.
- Core routes/screens: Team selection, franchise dashboard, player detail, live game, playoff bracket, draft room, offseason.
- Content hierarchy: Season status and primary advancement first; roster and actionable decisions second; detailed context below.

## Design principles
- Clear consequences: Show cap, cash, ratings and effects before actions.
- The season is the spine: One phase-aware advance control; no hidden required progression.
- Tradeoffs: Simulation depth and responsive tables over 3D production cost.

## Visual language
- Color: Near-black ink, warm white, copper-orange action color, teal for positive signals.
- Typography: System sans-serif; condensed-weight headings; tabular numerals for stats.
- Spacing/layout rhythm: 8px units, roomy panels, compact statistical tables.
- Shape/radius/elevation: Crisp 12px panels, fine borders; restrained shadows.
- Motion: Short transitions; animated live game only; reduced motion supported.
- Imagery/iconography: Original CSS/SVG court, team monograms, no remote art.

## Components
- Existing components to reuse: None found.
- New/changed components: Sidebar, phase bar, cards, tables, player portrait monograms, team crests, court, modal, toast, action controls.
- Variants and states: Selected team accents, injury warning, disabled actions with explanations, phase-specific views.
- Token/component ownership: styles.css owns tokens and responsive rules.

## Accessibility
- Target standard: WCAG 2.1 AA patterns.
- Keyboard/focus behavior: Native buttons and form labels, visible focus, Escape closes dialogs, modal focus containment.
- Contrast/readability: High contrast; status includes text as well as color.
- Screen-reader semantics: Landmarks, table headers, labelled inputs, status announcements.
- Reduced motion and sensory considerations: No autoplay audio; honor prefers-reduced-motion.

## Responsive behavior
- Supported breakpoints/devices: Desktop 1440, laptop 1024, phone 390.
- Layout adaptations: Sidebar becomes horizontal navigation, grids stack, tables scroll within panels.
- Touch/hover differences: All actions work without hover and have touch targets.

## Interaction states
- Loading: Simulation busy state and visible progress.
- Empty: Explain absent stats, results, players and archived seasons.
- Error: Inline validation with precise reason.
- Success: Transaction notice and immediately updated state.
- Disabled: Phase-aware controls with explanation.
- Offline/slow network: Everything bundled; local browser save plus JSON export/import.

## Content voice
- Tone: Short sports desk prose.
- Terminology: Career, front office, cap room, rotation, lottery, draft board.
- Microcopy rules: Explain the cost and consequence; no technical jargon in game flow.

## Implementation constraints
- Framework/styling system: Plain JavaScript, CSS and SVG. Portable single HTML deliverable, native Mac WebKit app, editable source archive.
- Design-token constraints: Central CSS variables.
- Performance constraints: Simulate a complete 82-game league season in seconds, bounded history storage.
- Compatibility constraints: Recent Safari, Chrome, Edge and Firefox; no network requests.
- Test/screenshot expectations: Engine invariants across multiple seasons; browser playthrough, persistence, modal, desktop and phone inspection.

## Open questions
- None blocking. Fictional league and 2005 starting year chosen to provide an original standalone game.
