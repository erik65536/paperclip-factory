const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const G=require('../src/engine.js');
const {play}=require('../scripts/balance.cjs');
const clone=s=>JSON.parse(JSON.stringify(s));
function chapter(phase){const s=G.fresh();s.phase=phase;s.money=1e20;s.insight=1e12;s.wire=1e20;s.workers=[2,1,1];return s;}
test('manual clips respect cooldown, wire, storage, and sale value',()=>{
 const s=G.fresh();assert.equal(G.make(s),1);assert.equal(G.make(s),false);assert.equal(s.wire,99);G.tick(s,5);G.make(s);G.sell(s);assert.equal(s.money,21.4);assert.equal(s.stock,0);s.stock=G.cap(s);G.tick(s,5);assert.equal(G.make(s),false);
});
test('wire pack size scales with pliers and bankruptcy is recoverable',()=>{
 const s=G.fresh();s.money=0;s.wire=0;assert.ok(G.buyWire(s));assert.equal(s.wire,25);G.make(s);G.sell(s);assert.equal(s.money,.7);s.levels.batch=6;assert.equal(G.wirePack(s),3645);
});
test('upgrade purchase cannot overspend or exceed final tier',()=>{
 const s=G.fresh();assert.ok(G.buy(s,'batch'));assert.equal(s.money,8);assert.equal(G.buy(s,'batch'),false);assert.equal(G.buy(s,'bogus'),false);s.money=1e9;s.levels.batch=6;assert.equal(G.buy(s,'batch'),false);
});
test('each automation equipment tier materially speeds actual progress',()=>{
 for(const [id,mult]of [['engine',1.35],['efficiency',1.22],['compute',1.1]])for(let n=0;n<6;n++){
   const s=chapter(2);s.levels[id]=n;const before=G.progressRate(s);G.buy(s,id);assert.ok(Math.abs(G.progressRate(s)/before-mult)<1e-10,id+' tier '+n);
 }
 const s=chapter(2),base=G.workRate(s);s.levels.engine=6;s.levels.efficiency=6;s.levels.compute=6;assert.ok(G.workRate(s)>base*30);
});
test('hiring charges the displayed fee and changes only the selected department',()=>{
 const s=chapter(1),fee=G.hireCost(s),money=s.money;G.hire(s,1);assert.deepEqual(s.workers,[2,2,1]);assert.equal(s.money,money-fee);assert.equal(G.hire(s,3),false);s.money=0;assert.equal(G.hire(s,0),false);
});
test('concurrent production and shipping are not capped to one warehouse per tick',()=>{
 const s=chapter(1);s.levels.engine=6;s.levels.efficiency=6;s.workers=[40,20,20];const before=s.total;G.tick(s,1);assert.ok(s.total-before>G.cap(s)*3);assert.ok(s.stock<=G.cap(s)+1e-6);
});
test('factory shortages cannot create debt or negative stock',()=>{
 const s=chapter(1);s.money=0;s.wire=0;s.stock=0;G.tick(s,100);assert.equal(s.total,0);assert.equal(s.money,0);for(const k of ['wire','stock','insight'])assert.ok(s[k]>=0);
});
test('an abandoned legacy factory can recover even with no staff and no cash',()=>{
 const s=chapter(1);s.workers=[0,0,0];s.money=0;s.wire=0;s.stock=0;assert.equal(G.hireCost(s,0),0);assert.ok(G.hire(s,0));assert.ok(G.buyWire(s));G.tick(s,1);assert.ok(s.stock>0);G.sell(s);assert.ok(s.money>0);
});
test('prices affect sales and automation progress',()=>{
 const low=chapter(2),high=clone(low);high.price=5;assert.ok(G.flows(high).sell<G.flows(low).sell/10);assert.ok(G.workRate(high)<G.workRate(low)/10);
});
test('operating plans conserve all capacity and recover old zero allocations',()=>{
 const s=chapter(2);s.alloc=[100,0,0];assert.equal(G.workRate(s),0);assert.ok(G.setMode(s,'balanced'));assert.equal(s.alloc.reduce((a,b)=>a+b),100);assert.ok(G.workRate(s)>0);assert.equal(G.setMode(s,'not-a-plan'),false);
});
test('chapter projects are sequenced and progress-gated, not silently available at once',()=>{
 const s=chapter(2);assert.equal(G.project(s,1),false);G.project(s,0);assert.equal(G.project(s,1),false);s.progress=20;assert.ok(G.project(s,1));assert.equal(s.pending.id,'network');
});
test('story choices pause time, survive a save round-trip, and resolve once',()=>{
 const s=chapter(2);s.progress=20;G.project(s,0);G.project(s,1);const saved=G.validate(clone(s)),before=clone(saved);G.tick(saved,300);assert.deepEqual(saved,before);assert.equal(G.resolve(saved,'made-up'),false);assert.ok(G.resolve(saved,'permit'));const insight=saved.insight;assert.equal(G.resolve(saved,'permit'),false);assert.equal(saved.insight,insight);
});
test('pause freezes upgrades, actions, hires, and simulation',()=>{
 const s=chapter(1);s.paused=true;const before=clone(s);G.tick(s,1000);assert.equal(G.buy(s,'engine'),false);assert.equal(G.action(s),false);assert.equal(G.hire(s,0),false);assert.deepEqual(s,before);
});
test('active directives have meaningful boosts and enforce costs and cooldowns',()=>{
 const s=chapter(5),before=G.workRate(s),insight=s.insight;assert.ok(G.action(s));assert.ok(G.workRate(s)>before*1.6);assert.ok(s.insight<insight);assert.equal(G.action(s),false);G.tick(s,90);assert.ok(G.action(s));
});
test('support mechanics distinguish planet, galaxy and universal war',()=>{
 for(const phase of [5,6,7]){const a=chapter(phase),b=clone(a);G.setMode(a,'research');G.setMode(b,'output');G.tick(a,120);G.tick(b,120);assert.ok(a.support>b.support+15);}
});
test('all transitions require objective and required projects',()=>{
 for(let phase=0;phase<8;phase++){const s=chapter(phase);s.money=1e5;s.total=1e9;s.progress=100;assert.equal(G.canAdvance(s),false);s.ideas=G.ideas[phase].map(i=>i[0]);assert.ok(G.canAdvance(s));assert.ok(G.advance(s));assert.equal(s.phase,phase+1);}
});
test('version-one migration preserves chapter, earnings, progress, upgrades and decisions',()=>{
 const s=chapter(2);s.version=1;s.money=123456789;s.progress=67.5;s.levels.engine=9;s.ideas=['prediction','network'];s.ethics=2;const migrated=G.validate(s);assert.equal(migrated.version,2);for(const k of ['phase','money','progress','ethics'])assert.equal(migrated[k],s[k]);assert.equal(migrated.levels.engine,9);assert.deepEqual(migrated.ideas,s.ideas);assert.ok(migrated.hideCompleted);
});
test('save validation rejects corruption and rebuilds choice text safely',()=>{
 for(const change of [s=>s.money=Infinity,s=>s.phase=9,s=>s.alloc=[50,50,50],s=>s.workers=[-.1,0,0],s=>s.levels.engine=-1,s=>s.speed=999,s=>s.pending={id:'evil'}]){const s=G.fresh();change(s);assert.throws(()=>G.validate(s));}
 const s=chapter(2);s.progress=30;G.project(s,0);G.project(s,1);s.pending.title='<script>evil</script>';assert.equal(G.validate(s).pending.title,'CLIP crossed a line.');
});
test('offline simulation and small steps agree without windfall or capacity loss',()=>{
 const a=chapter(6),b=clone(a);G.tick(a,3600);for(let i=0;i<14400;i++)G.tick(b,.25);assert.ok(Math.abs(a.total-b.total)/a.total<1e-9);assert.ok(Math.abs(a.progress-b.progress)<.01);
});
test('four endings are final and reject selection before the final chapter',()=>{
 for(const e of G.endings){const s=G.fresh();assert.equal(G.chooseEnding(s,e[0]),false);s.phase=8;assert.ok(G.chooseEnding(s,e[0]));assert.equal(G.chooseEnding(s,e[0]),false);const before=clone(s);G.tick(s,3600);assert.deepEqual(s,before);assert.equal(G.validate(s).ending,e[0]);}
});
test('emitted single-file game parses and embeds current engine, without external dependencies',()=>{
 const html=fs.readFileSync('index.html','utf8');new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);assert.ok(html.includes(fs.readFileSync('src/engine.js','utf8')));assert.equal(/<(script|link)[^>]+(?:src|href)=["']https?:/.test(html),false);
});
test('a practical investment strategy completes every chapter inside the pacing band',()=>{
 const r=play({horizon:600});assert.ok(r.completed);assert.ok(r.totalMinutes>90&&r.totalMinutes<145);assert.equal(r.rows.length,8);for(const row of r.rows)assert.ok(row.seconds>=300&&row.seconds<=1500,JSON.stringify(row));
});
test('fast and express play remain completable with realistic two-second player reactions',()=>{
 for(const pace of [5,20]){const r=play({horizon:600,pace});assert.ok(r.completed);assert.ok(r.totalMinutes<60);}
});
