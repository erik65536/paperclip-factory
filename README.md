# Paperclip Factory

A hand-drawn, single-player incremental game about a small business that becomes a very large mistake. Nine chapters, four endings, no prestige resets, ads, accounts, or runtime dependencies.

## Play

Open **index.html** directly in a modern browser, or run `npm start` and visit http://127.0.0.1:4173. The same file works on static hosting and on mobile. All illustrations, styles, audio synthesis, and game code are embedded.

Make clips, sell inventory, and buy wire. Invest in tools and chapter projects in **Big ideas**. Buy a factory at $100,000. Allocate workers across manufacturing, shipping, and procurement. After one billion clips, install CLIP and discover why a perfectly clear objective is not the same as a good idea.

Later chapters introduce autonomous allocation, demand-sensitive pricing, research, market control, planetary conversion, exploration, rival AIs, and a final irreversible ending choice. Decisions about oversight and inhabited worlds change progress, research, and the ending epilogue.

## Pacing and saves

- Slow burn targets roughly nine hours; actual completion depends on decisions and activity.
- Coffee break runs the simulation at 5×; Express at 20×. Change pacing at any time in settings.
- Saves use localStorage every ten seconds and when leaving. Automated chapters simulate up to eight hours of absence. The garage requires manual work.
- Export/import JSON backups in settings to move between devices or hosting origins. Browser storage is specific to each origin, and private browsing may discard it.
- Pause freezes the game and offline simulation. New Game requires confirmation and replaces the current save. There is no prestige mechanic.

## Development

Requires Node.js 18+ only for development tools; the game itself requires no installation.

```
npm test
npm run build
npm start
```

`npm test` checks the actual embedded game engine using Node's built-in test runner. `npm run build` copies the self-contained game to `dist/index.html` for static hosting. The GitHub Pages workflow deploys this file when Pages is configured to use GitHub Actions.

The compact `window.Paperclip` surface exposes engine state and methods for regression testing. It does not activate cheats or unlock chapters in normal play. Numbers use IEEE-754 approximations at cosmic scales; they are illustrative, not a physical mass model. No network requests occur during gameplay.

## Chapters

Garage → Manual Factory → Automated Factory → Paperclip Monopoly → Global Domination → Planetary Conversion → Galactic Expansion → Universal Conversion → Choose Your Ending.

The story is fictional satire. All questionable corporate and cosmic activity is abstract in-game storytelling.
