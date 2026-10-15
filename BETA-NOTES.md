# Beta 2 release notes

## Player-facing changes

- Automation upgrades now accelerate chapter work multiplicatively. The former 2× progress-speed ceiling is gone.
- A single chapter objective, three resource readouts, and two main columns replace the crowded first-pass dashboard. The journal and production details open only when needed.
- Factory hiring uses explicit department names, current staff counts, throughput, and **Hire** buttons with prices. A bankrupt legacy factory can recover with an owner-worked shift.
- **Hide completed** hides finished projects and fully upgraded equipment. Repeatable equipment has six visible tiers, concrete before/after effects, and a completion state.
- Operating plans replace percentage fiddling. Prices remain available in Production details. The current game speed is visible in the header.
- Each chapter has a replayable briefing, a live next-step suggestion, and new journal milestones. CLIP's authority, the CEO takeover, the end of money, and the final choice are explained as they happen.
- Later chapters have distinct support systems: influence, trust, energy, surveyed territory, and fleet security. Optional directives offer useful short boosts without requiring continuous clicking.
- Story decisions pause simulation and survive reloads. Endings are final, persist correctly, and do not restart the game.
- The first-pass save key is preserved; version-one saves migrate and are backed up. Import/export, corrupt-save recovery, and conflicting-tab protection are included.

## Validation performed

- 23 automated regression tests, including full campaigns at 1×, 5×, and 20×.
- Four investment policies, plus slower reactions and no-directive play; measured results and limitations are in [BALANCE.md](BALANCE.md).
- Browser checks through actual controls: save import, hiring, completed-project filtering, stage-three upgrade speed, story decisions, pending-choice reload, operating plans, directives, and ending persistence.
- In a migrated stage-three test, an efficiency purchase increased actual chapter speed from **3.56% to 4.35% per minute**.
- Narrow mobile and desktop layouts checked; no horizontal page overflow or browser JavaScript errors observed in those checks.

## Beta scope

This is ready for a focused beta playtest. The simulation establishes reachability and pacing, not subjective fun or long-term retention. Real-player reading time and preferences will guide further tuning. First-pass levels above six remain recorded but use the beta's six-tier effective maximum. Existing progress and currency are retained.
