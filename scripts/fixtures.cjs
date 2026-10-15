// Local QA fixtures. These are not shipped with the game or used during normal play.
const fs=require('node:fs'),G=require('../src/engine.js');
fs.mkdirSync('artifacts/fixtures',{recursive:true});
for(const phase of [0,1,2,3,4,5,6,7,8]){
 const s=G.fresh();s.phase=phase;s.money=phase===0?1000:phase<5?G.moneyScale[phase]*6:0;s.total=phase?1e9:20;s.wire=phase?G.outputBase[phase]*20:100;s.insight=G.researchBase[phase]*600;s.progress=phase>=2?22:0;s.workers=phase===1?[2,1,1]:[0,0,0];s.speed=1;s.seenIntros=[];s.ideas=G.ideas.slice(0,phase).flat().map(i=>i[0]);if(phase===2)s.ideas.push('prediction');if(phase===8){s.total=1e80;s.progress=100;}fs.writeFileSync(`artifacts/fixtures/chapter-${phase+1}.json`,JSON.stringify(s));
}
const old=G.fresh();old.version=1;old.phase=2;old.progress=67;old.money=2e9;old.total=2e9;old.wire=1e8;old.insight=4000;old.levels.engine=5;old.levels.compute=5;old.ideas=['catalog','contract','assembly','freight','union','prediction','network'];fs.writeFileSync('artifacts/fixtures/legacy-stage3.json',JSON.stringify(old));
