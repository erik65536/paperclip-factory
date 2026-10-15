# Beta 2 balance report

Generated with `npm run balance`, using the exact game engine shipped in index.html.

## Method

The automated player starts with the normal $20 and wire, pays all costs, buys required projects in sequence, hires toward a 2:1:1 crew, and evaluates upgrade payback. Four investment horizons (120, 300, 600, and 1,200 simulated seconds) are compared. The best tested strategy approximates efficient play; it is not a proof of a global optimum. It uses balanced operating plans, chooses non-coercive story options, and reacts every two real seconds. It may make/sell/replenish wire in one decision cycle; human interaction and reading add time. No currency, completed projects, or progress is injected.

## Measured wall-clock time

| Chapter | Best tested standard run | Purchases / hires |
|---|---:|---:|
| 1. Garage operations | 8.2 min | 17 |
| 2. Manual factory | 11.0 min | 57 |
| 3. Automated factory | 14.1 min | 19 |
| 4. Paperclip monopoly | 15.8 min | 15 |
| 5. Global domination | 14.1 min | 17 |
| 6. Planetary conversion | 13.7 min | 15 |
| 7. Galactic expansion | 20.1 min | 15 |
| 8. Universal conversion | 20.0 min | 15 |
| **Total** | **117 min** | |

- 5× clock, two-second reactions: **28.6 minutes**.
- 20× clock, two-second reactions: **12.8 minutes**.
- Standard clock, ten-second reactions, no optional directives: **155.5 minutes**.
- Four standard investment policies: 283.9 min, 139.8 min, 117.4 min, 117 min. Poor investment can still be slower; there is no promise of an exact finish time.
- Faster clocks cannot accelerate a player's tapping or reading. The manual garage occupies more of an Express run.

## What changed

The old automation progress formula capped the combined upgrade benefit at 2× and otherwise advanced on a fixed chapter timer. Production could rise dramatically without moving the objective appreciably faster. Chapter work is now multiplicative: each machinery tier gives 1.35× work, each process tier 1.22×, and each computer tier 1.10×, with six clearly marked tiers. Projects multiply work by another 1.25×. Production and shipping execute concurrently; warehouse size no longer imposes an accidental per-tick throughput limit.

Progress speed and remaining-time estimates use the actual operating plan, market throughput, support, oversight, and boosts. Project completion is a separate explicit requirement. A story decision pauses the clock and persists across saves.

## Stage-by-stage gameplay review

| Chapter | Main decision | Active opportunity | Reason to invest |
|---|---|---|---|
| Garage | Tools versus saving; wire and storage | Make and sell | Bigger batches, faster cooldowns, better prices |
| Factory | Hire into the limiting department | Rally the crew | Machines scale all crews; training and freight remove constraints |
| Automation | Production versus research; price versus sales | Optimize the network | Equipment directly speeds autonomy; oversight choices introduce CLIP |
| Monopoly | Acquisition capacity versus influence | Negotiate an acquisition | Infrastructure and influence accelerate market control |
| Global applications | Research versus rollout; voluntary versus mandatory adoption | Run a public pilot | Medicine and provision create demand; public trust matters |
| Earth | Harvesters versus grid capacity | Stabilize the grid | Fusion improves support; orbital foundries enable the next chapter |
| Galaxy | Replication versus surveying | Survey a sector | A surveyed frontier supports expansion; inhabited worlds require a choice |
| Universe | Advance versus secure supply lines | Counter the rival fleet | Countermeasures improve security; the final projects resolve the war |

Optional directives help without being required. They cost resources, last 35 game seconds, and have a 90-second cooldown. No prestige system is introduced.

## Remaining beta uncertainty

Automated play cannot establish whether the story is enjoyable or every tradeoff feels right to a human. Fresh-player sessions should determine the next tuning pass. Narrative reading time, breaks, and individual upgrade choices are excluded from the numerical estimates.
