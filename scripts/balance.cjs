const fs=require('node:fs');
const G=require('../src/engine.js');
const clone=s=>JSON.parse(JSON.stringify(s));
function economicRate(s){if(s.phase===0)return Math.min(G.batch(s),G.cap(s))/G.cooldown(s)*(G.price(s)-.1);const f=G.flows(s);return Math.min(f.make,f.sell,f.wire)*(G.price(s)-.1)-G.wage(s);}
function play({horizon=300,pace=1,react=2,actions=true}={}){
  const s=G.fresh();s.speed=pace;let wall=0,nextDecision=0,phaseStart=0,purchases=0;const rows=[];
  while(s.phase<8&&wall<86400){
    if(wall>=nextDecision){nextDecision=wall+react;
      if(s.pending)G.resolve(s,s.pending.choices[0][0]);
      if(s.phase===0){if(s.wire<G.batch(s))G.buyWire(s);G.make(s);G.sell(s);}
      if(s.phase>0&&actions)G.action(s);
      if(G.canAdvance(s)){rows.push({chapter:s.phase+1,name:G.chapters[s.phase].badge,seconds:Math.round(wall-phaseStart),purchases,engine:s.levels.engine,research:s.levels.compute});G.advance(s);phaseStart=wall;purchases=0;continue;}
      let purchased=false;
      for(let i=0;i<G.ideas[s.phase].length;i++)if(G.canProject(s,i)){G.project(s,i);purchases++;purchased=true;break;}
      if(!purchased){
        const ids=s.phase===0?['batch','speed','storage']:['engine','efficiency','compute','storage'];let candidates=[];
        for(const id of ids){if(s.levels[id]>=G.MAX_LEVEL||s[G.currency(s)]<G.cost(s,id))continue;const t=clone(s);G.buy(t,id);let benefit=0;
          if(s.phase===0)benefit=economicRate(t)-economicRate(s);
          else if(s.phase===1)benefit=id==='compute'?(G.researchRate(t)-G.researchRate(s))*1000:economicRate(t)-economicRate(s);
          else if(s.phase<5)benefit=id==='compute'?(G.researchRate(t)/G.researchRate(s)-1)*economicRate(s):economicRate(t)-economicRate(s);
          else benefit=id==='compute'?G.researchRate(t)-G.researchRate(s):(G.workRate(t)/G.workRate(s)-1)*G.researchRate(s);
          const payback=G.cost(s,id)/Math.max(.0001,benefit);
          if(payback<horizon)candidates.push({id,score:payback});
        }
        if(s.phase===1&&s.money>=G.hireCost(s))for(let role=0;role<3;role++){
          const t=clone(s);G.hire(t,role);const before=G.flows(s),after=G.flows(t);
          // Hire toward an efficient 2:1:1 crew, including the next bottleneck in a tied line.
          const weight=role===0?2:1,score=G.hireCost(s)/(G.baseRate(s)*.5)*(s.workers[role]/weight);
          if(s.workers[role]<24*weight&&score<horizon)candidates.push({role,score});
        }
        candidates.sort((a,b)=>a.score-b.score);
        if(candidates[0]){const c=candidates[0];if(c.id)G.buy(s,c.id);else G.hire(s,c.role);purchases++;}
      }
    }
    G.tick(s,pace);wall++;
  }
  return {horizon,pace,react,actions,completed:s.phase===8,totalMinutes:+(wall/60).toFixed(1),rows,state:s};
}
if(require.main===module){
  const runs=[120,300,600,1200].map(horizon=>play({horizon}));
  const best=runs.filter(r=>r.completed).sort((a,b)=>a.totalMinutes-b.totalMinutes)[0];
  if(!best){console.log(runs.map(r=>({h:r.horizon,phase:r.state.phase,progress:r.state.progress,money:r.state.money,insight:r.state.insight,levels:r.state.levels})));process.exit(1);}
  console.table(best.rows.map(r=>({...r,minutes:+(r.seconds/60).toFixed(1)})));
  console.log('Strategy comparison',runs.map(r=>({horizon:r.horizon,total:r.totalMinutes,completed:r.completed})));
  fs.mkdirSync('artifacts',{recursive:true});fs.writeFileSync('artifacts/balance.json',JSON.stringify({best:{...best,state:undefined},runs:runs.map(r=>({...r,state:undefined}))},null,2));
  const fast=play({horizon:600,pace:5}),express=play({horizon:600,pace:20}),relaxed=play({horizon:600,react:10,actions:false});
  const report=`# Beta 2 balance report\n\nGenerated with \`npm run balance\`, using the exact game engine shipped in index.html.\n\n## Method\n\nThe automated player starts with the normal $20 and wire, pays all costs, buys required projects in sequence, hires toward a 2:1:1 crew, and evaluates upgrade payback. Four investment horizons (120, 300, 600, and 1,200 simulated seconds) are compared. The best tested strategy approximates efficient play; it is not a proof of a global optimum. It uses balanced operating plans, chooses non-coercive story options, and reacts every two real seconds. It may make/sell/replenish wire in one decision cycle; human interaction and reading add time. No currency, completed projects, or progress is injected.\n\n## Measured wall-clock time\n\n| Chapter | Best tested standard run | Purchases / hires |\n|---|---:|---:|\n${best.rows.map(r=>`| ${r.chapter}. ${r.name} | ${(r.seconds/60).toFixed(1)} min | ${r.purchases} |`).join('\n')}\n| **Total** | **${best.totalMinutes} min** | |\n\n- 5× clock, two-second reactions: **${fast.totalMinutes} minutes**.\n- 20× clock, two-second reactions: **${express.totalMinutes} minutes**.\n- Standard clock, ten-second reactions, no optional directives: **${relaxed.totalMinutes} minutes**.\n- Four standard investment policies: ${runs.map(r=>r.totalMinutes+' min').join(', ')}. Poor investment can still be slower; there is no promise of an exact finish time.\n- Faster clocks cannot accelerate a player's tapping or reading. The manual garage occupies more of an Express run.\n\n## What changed\n\nThe old automation progress formula capped the combined upgrade benefit at 2× and otherwise advanced on a fixed chapter timer. Production could rise dramatically without moving the objective appreciably faster. Chapter work is now multiplicative: each machinery tier gives 1.35× work, each process tier 1.22×, and each computer tier 1.10×, with six clearly marked tiers. Projects multiply work by another 1.25×. Production and shipping execute concurrently; warehouse size no longer imposes an accidental per-tick throughput limit.\n\nProgress speed and remaining-time estimates use the actual operating plan, market throughput, support, oversight, and boosts. Project completion is a separate explicit requirement. A story decision pauses the clock and persists across saves.\n\n## Stage-by-stage gameplay review\n\n| Chapter | Main decision | Active opportunity | Reason to invest |\n|---|---|---|---|\n| Garage | Tools versus saving; wire and storage | Make and sell | Bigger batches, faster cooldowns, better prices |\n| Factory | Hire into the limiting department | Rally the crew | Machines scale all crews; training and freight remove constraints |\n| Automation | Production versus research; price versus sales | Optimize the network | Equipment directly speeds autonomy; oversight choices introduce CLIP |\n| Monopoly | Acquisition capacity versus influence | Negotiate an acquisition | Infrastructure and influence accelerate market control |\n| Global applications | Research versus rollout; voluntary versus mandatory adoption | Run a public pilot | Medicine and provision create demand; public trust matters |\n| Earth | Harvesters versus grid capacity | Stabilize the grid | Fusion improves support; orbital foundries enable the next chapter |\n| Galaxy | Replication versus surveying | Survey a sector | A surveyed frontier supports expansion; inhabited worlds require a choice |\n| Universe | Advance versus secure supply lines | Counter the rival fleet | Countermeasures improve security; the final projects resolve the war |\n\nOptional directives help without being required. They cost resources, last 35 game seconds, and have a 90-second cooldown. No prestige system is introduced.\n\n## Remaining beta uncertainty\n\nAutomated play cannot establish whether the story is enjoyable or every tradeoff feels right to a human. Fresh-player sessions should determine the next tuning pass. Narrative reading time, breaks, and individual upgrade choices are excluded from the numerical estimates.\n`;
  fs.writeFileSync('BALANCE.md',report);
}
module.exports={play,economicRate};
