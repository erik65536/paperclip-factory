const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function engine(){
  const elements=new Map();
  function element(){return {style:{},dataset:{},classList:{add(){},remove(){},toggle(){}},append(){},replaceChildren(){},querySelector(){return element()},contains(){return false},showModal(){this.open=true},close(){this.open=false},remove(){},click(){}};}
  const context={console,Intl,Date,Math,JSON,Number,String,Array,Object,Error,Blob,URL,setTimeout(){},clearTimeout(){},setInterval(){},localStorage:{getItem(){return null},setItem(){}},document:{getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id)},createElement:element,createTextNode:t=>t,addEventListener(){},querySelectorAll(){return []}},window:{addEventListener(){}},confirm:()=>true};
  vm.createContext(context);vm.runInContext(source,context);return context.window.Paperclip;
}
test('manual production consumes wire, respects cooldown and storage, and sells at correct price',()=>{
  const g=engine();g.make();assert.equal(g.state.total,1);assert.equal(g.state.wire,99);g.make();assert.equal(g.state.total,1);g.tick(5);g.make();assert.equal(g.state.total,2);g.sell();assert.equal(g.state.stock,0);assert.equal(g.state.money,24);g.state.stock=g.cap();g.tick(5);g.make();assert.equal(g.state.total,2);
});
test('upgrades charge once and cannot be bought without funds',()=>{
  const g=engine();g.buy('batch');assert.equal(g.state.money,8);assert.equal(g.batch(),3);g.buy('batch');assert.equal(g.state.levels.batch,1);
});
test('stranded factories can reclaim wire and recover without a loan',()=>{
  const g=engine();g.state.money=0;g.state.wire=0;g.buyWire();assert.equal(g.state.wire,25);g.make();g.sell();assert.equal(g.state.money,2);
});
test('cosmic directives spend research, respect cooldowns, and advance conversion',()=>{
  const g=engine();g.state.phase=6;g.state.insight=10000;g.make();assert.equal(g.state.progress,.35);assert.ok(g.state.insight<10000);g.make();assert.equal(g.state.progress,.35);
});
test('factory transition requires funds and grants a working crew',()=>{
  const g=engine();g.advance();assert.equal(g.state.phase,0);g.state.money=1e5;g.advance();assert.equal(g.state.phase,1);assert.equal(g.state.money,5000);assert.deepEqual(Array.from(g.state.workers),[1,1,1]);g.tick(1);assert.ok(g.state.total>0);assert.ok(g.state.money>5000);
});
test('chapter gates require both objectives and all chapter projects',()=>{
  const g=engine();for(let phase=1;phase<8;phase++){g.state=g.fresh();g.state.phase=phase;g.state.total=1e9;g.state.progress=100;assert.equal(g.canAdvance(),false);g.state.ideas=g.IDEAS[phase].map(i=>i[0]);assert.equal(g.canAdvance(),true);g.advance();assert.equal(g.state.phase,phase+1);}
});
test('production never creates debt or negative resources under bottlenecks',()=>{
  const g=engine();g.state.phase=2;g.state.money=0;g.state.wire=0;g.tick(100);assert.equal(g.state.total,0);assert.equal(g.state.money,0);g.state.wire=100;g.state.stock=g.cap();g.state.alloc=[100,0,0];g.tick(10);assert.equal(g.state.wire,100);assert.equal(g.state.stock,g.cap());
});
test('zero allocation stalls expansion; balanced allocation progresses; pause freezes everything',()=>{
  const g=engine();g.state.phase=6;g.state.alloc=[100,0,0];g.tick(60);assert.equal(g.state.progress,0);g.state.alloc=[50,25,25];g.tick(60);assert.ok(g.state.progress>0);g.state.paused=true;const before=JSON.stringify(g.state);g.tick(500);assert.equal(JSON.stringify(g.state),before);
});
test('import rejects invalid numeric state and allocations; accepts legitimate saves',()=>{
  const g=engine();assert.equal(g.validate(g.fresh()).phase,0);for(const mutate of [s=>s.money=Infinity,s=>s.phase=99,s=>s.alloc=[100,100,100],s=>s.levels.engine=-1,s=>s.workers=[1.5,0,0],s=>s.speed=10000]){const s=g.fresh();mutate(s);assert.throws(()=>g.validate(s));}
});
test('all late chapters can complete and pay for every project through normal simulation',()=>{
  const g=engine();g.state.phase=2;g.state.money=2e7;g.state.wire=1e8;g.state.insight=4000;
  for(let phase=2;phase<8;phase++){
    let elapsed=0;
    while(!g.canAdvance()&&elapsed<g.PHASES[phase].duration*3){
      g.tick(5);elapsed+=5;
      for(const idea of g.IDEAS[phase])if(!g.state.ideas.includes(idea[0])&&g.state.money>=idea[3]&&g.state.insight>=idea[4])g.buyIdea(idea[0]);
      // Conservatively invest only a small fraction of the available budget.
      for(const id of ['engine','efficiency','compute','storage'])if(g.state.levels[id]<8&&(phase<5?g.state.money:g.state.insight)>g.currencyCost(id)*12)g.buy(id);
    }
    assert.ok(g.canAdvance(),`Chapter ${phase+1} stalled at ${elapsed}s, research=${g.state.insight}`);
    for(const k of ['money','total','wire','insight','stock'])assert.ok(Number.isFinite(g.state[k])&&g.state[k]>=0,`${k} invalid`);
    g.advance();
  }
  assert.equal(g.state.phase,8);assert.equal(g.state.total,1e80);
});
