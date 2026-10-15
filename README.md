# Paperclip Factory — Beta 2

A hand-drawn, single-player incremental game about a small business that becomes a very large mistake. Nine chapters, four endings, no prestige resets, ads, accounts, or runtime dependencies.

## Play

Open **index.html** directly in a modern browser, or run `npm start` and visit http://127.0.0.1:4173. The same file works on static hosting and on mobile. All illustrations, styles, audio synthesis, and game code are embedded.

Make clips, sell inventory, and buy wire. Invest through the **Equipment** and **Chapter projects** tabs. Buy a factory at $100,000. The factory has clearly labeled **Hire** buttons for makers, shipping workers, and wire buyers. Aim for about two makers per shipper and buyer. After one billion clips and the three factory projects, install CLIP and discover why a perfectly clear objective is not the same as a good idea.

Later chapters introduce operating plans, demand-sensitive pricing, research, influence, public trust, energy, exploration, rival AIs, and a final ending choice. Read the chapter briefing for context and the live recommendation for a next step. Production details are collapsed by default. **Hide completed** removes finished projects and fully upgraded equipment. Optional directives provide temporary boosts; continuous clicking is not required after the garage.

## Pacing and saves

- Standard play takes about **117 minutes** for the best tested investment policy; a slower ten-second reaction strategy without directives takes about **156 minutes**. Human reading and breaks add time. See [BALANCE.md](BALANCE.md) for the assumptions and chapter breakdown.
- Fast runs at 5×; Express at 20×. Tested with two-second player reactions, these take about **29** and **13 minutes** respectively. Manual tapping limits acceleration in the garage. The current speed is always visible in the header.
- Saves use localStorage every ten seconds and when leaving. Automated chapters simulate up to eight hours of absence. The garage requires manual work.
- Export/import JSON backups in settings to move between devices or hosting origins. Browser storage is specific to each origin, and private browsing may discard it.
- Pause freezes the game and offline simulation. Unresolved story choices also pause and persist. New Game requires confirmation and replaces the current save. There is no prestige mechanic.
- First-pass saves migrate automatically without losing the current chapter, objective progress, money, or purchased upgrades. The original is retained under `paperclip-factory-v1.v1-backup` before migration. For old upgrade levels above six, the level is retained, but its production effect uses the beta's six-tier maximum.
- Another tab saving this game pauses the older tab to prevent conflicting writes. Reload it to use the latest save. Corrupt saves are not silently overwritten; the Export button can recover the original JSON.

## Development

Requires Node.js 18+ only for development tools; the game itself requires no installation.

```
npm test
npm run build
npm run balance
npm start
```

`npm test` checks the actual embedded game engine using Node's built-in test runner. `npm run build` copies the self-contained game to `dist/index.html` for static hosting. Every GitHub push runs validation. To deploy publicly on GitHub Pages, enable **Settings → Pages → GitHub Actions**, then manually run the workflow with **deploy** selected. This setup is optional; opening the HTML locally does not require hosting.

Maintain the game in `src/`: the DOM-free engine is shared by the browser, regression tests, and balance simulator. The build embeds the source, CSS, illustrations and UI into `index.html`, then copies it to `dist/index.html`. Commit the generated root HTML alongside source changes. The engine suite covers production flow, progression, pricing, upgrades, hiring, migration, decisions, endings, and complete simulated campaigns. `npm run balance` regenerates the balance report. `node scripts/fixtures.cjs` creates local-only test saves under ignored `artifacts/fixtures/` for browser QA through the normal import control.

Numbers use IEEE-754 approximations at cosmic scales; they are illustrative, not a physical mass model. No network requests occur during gameplay. The beta still benefits from fresh-player feedback; numerical simulation is not a substitute for human playtesting.

## Chapters

Garage → Manual Factory → Automated Factory → Paperclip Monopoly → Global Domination → Planetary Conversion → Galactic Expansion → Universal Conversion → Choose Your Ending.

The story is fictional satire. All questionable corporate and cosmic activity is abstract in-game storytelling.
