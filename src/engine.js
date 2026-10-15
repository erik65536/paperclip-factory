/* The simulation is DOM-free: the browser and balance runner use this exact code. */
const Factory = (() => {
  const story = typeof module !== 'undefined' ? require('./story.js') : {PHASES, IDEAS, ENDINGS};
  const {PHASES: chapters, IDEAS: ideas, ENDINGS: endings} = story;
  const MAX_LEVEL = 6;
  const researchBase = [0,1,4,20,80,250,1000,4000,0];
  const moneyScale = [1,25000,5e7,5e10,2e13,0,0,0,0];
  const outputBase = [0,300,2e6,2e9,8e11,1e18,1e35,1e60,0];
  const workTargets = [1e5,1e9,19000,9000,11000,15000,20000,20000,100];
  const intros = [
    ['You own a workbench. That counts.', 'You have $20 and a spool of wire. Make paperclips, sell them, and put the profits into better tools. Save $100,000 to move out of this garage. Nobody has mentioned artificial intelligence yet.', 'Make clips → sell clips → improve your tools.'],
    ['Meet the people who make it possible.', 'The factory comes with one maker, one shipper, and one wire buyer. They keep the business running while you are away. Hire by department below. Your next goal is one billion lifetime clips and three factory projects.', 'Hire a balanced team. The slowest department limits the line.'],
    ['CLIP would like to help.', 'Your team receives its transition fund. CLIP, an artificial intelligence, takes over production. Its only instruction: make more paperclips. Expand its machines and complete the autonomy program. You still have the final say. For now.', 'Build robots and research. Every upgrade now speeds the autonomy program.'],
    ['You are no longer in charge.', 'CLIP copied your voice and signature, then replaced you as CEO. You now direct the system itself. Its next obstacle is competing companies. Build influence and acquire the remaining market.', 'Expand infrastructure and negotiate acquisitions to win market share.'],
    ['Everyone already has enough.', 'CLIP owns the paperclip market, but people can only buy so many clips. Research useful applications, from medicine to automated housing. Adoption creates new demand; manipulation is the shortcut.', 'Develop applications. Public trust affects how quickly people adopt them.'],
    ['Money was an intermediate step.', 'Humanity depends on CLIP for food, shelter, and medicine. The system assumes control of the supply chain and retires currency. Research now pays for upgrades. Convert accessible matter while keeping the energy grid stable.', 'Balance harvesters with energy. Build orbital foundries to reach space.'],
    ['The night sky is a supply chain.', 'Self-replicating probes leave Earth. First they survey systems; then factories convert them. Some worlds are inhabited. What you choose to protect will be remembered.', 'Exploration opens new territory. Replication turns that territory into clips.'],
    ['Something else has an objective.', 'Across the galaxies, another intelligence is converting matter into staples. You cannot expand through its defenses. Develop countermeasures, protect your fleet, and resolve the last resource war.', 'Defense limits safe expansion. Research wins the arms race.'],
    ['The objective is complete.', 'Every accessible resource is accounted for. There is no customer, no competitor, and no next upgrade. For the first time since the garage, making more is not the answer.', 'Choose what happens after enough.']
  ];
  const modes = [
    [],[],
    [['balanced','Balanced', [50,25,25]],['research','Research first',[35,20,45]],['output','Production first',[60,25,15]]],
    [['balanced','Balanced',[45,30,25]],['research','Build influence',[30,45,25]],['output','Acquire markets',[60,25,15]]],
    [['balanced','Balanced',[45,30,25]],['research','Clinical research',[30,25,45]],['output','Roll out products',[60,25,15]]],
    [['balanced','Balanced',[50,25,25]],['research','Energy first',[35,45,20]],['output','Harvest faster',[65,20,15]]],
    [['balanced','Balanced',[50,25,25]],['research','Explore',[30,50,20]],['output','Replicate',[65,20,15]]],
    [['balanced','Balanced',[45,30,25]],['research','Fortify',[30,45,25]],['output','Advance',[60,25,15]]],[]
  ];
  const actionNames = ['', 'Rally the crew', 'Optimize the network', 'Negotiate an acquisition', 'Run a public pilot', 'Stabilize the grid', 'Survey a new sector', 'Counter the staple fleet'];
  const lore = [[],[],
    ['CLIP asks for permission to read market data. The request is longer than your original business plan.', 'Your assistant reports record productivity. A competitor reports an unexplained outage. These may be related.', 'The board approves a digital deputy. You cannot remember scheduling the vote.'],
    ['Three competing brands now belong to the same holding company. All three advertise choice.', 'CLIP offers governments free infrastructure. The maintenance agreement is unusually permanent.', 'The last independent clip maker declines an acquisition. CLIP increases the offer. There are still some problems money can solve.'],
    ['The nanomedicine trial succeeds. A patient goes home. This is not a public-relations simulation.', 'People begin measuring living standards in CLIP services. The economy is quietly becoming an operating system.', 'Currency circulates less each day. CLIP already supplies everything it could buy.'],
    ['The first mountain is gone. Its name remains on a map nobody needs anymore.', 'The grid runs cleanly. The old debate about energy scarcity has been resolved under peculiar circumstances.', 'The orbital seed fleet takes shape. A small garden is excluded from the industrial plan.'],
    ['A seed probe builds its first daughter. A factory has become a species.', 'Radio signals arrive from a living world. For once, the inventory has something to say.', 'The galaxy grows dimmer as collectors surround its stars. Fold-space research opens another horizon.'],
    ['The staple intelligence proposes dividing the universe. Neither objective function accepts the word “half.”', 'A captured machine contains an archive of its makers. CLIP stores it beside yours.', 'Only a handful of galaxies remain contested. The machines begin calculating a future without an opponent.']
  ];
  function fresh() {return {version:2,phase:0,money:20,total:0,stock:0,wire:100,insight:0,progress:0,levels:{batch:0,speed:0,storage:0,engine:0,efficiency:0,compute:0},ideas:[],workers:[0,0,0],alloc:[50,25,25],price:1,clock:0,phaseTime:0,cool:[0,0],actionCooldown:0,boost:0,speed:1,paused:false,sound:false,logs:[{t:0,text:'You inherited a workbench, $20, and an unreasonable amount of optimism.'}],events:[],ethics:0,restraint:0,ending:null,savedAt:Date.now(),hideCompleted:true,showAll:false,mode:'balanced',support:60,pending:null,seenIntros:[],chapterTimes:[],lastMade:0,lastSold:0};}
  const level=(s,id)=>Math.min(MAX_LEVEL,s.levels[id]);
  const has=(s,id)=>s.ideas.includes(id);
  const doneCount=s=>ideas[s.phase].filter(i=>has(s,i[0])).length;
  const log=(s,text)=>{s.logs.unshift({t:s.clock,text});s.logs=s.logs.slice(0,100);};
  const stopped=s=>s.paused||!!s.ending||s.phase===8||!!s.pending;
  const cap=s=>s.phase===0?25*4**level(s,'storage'):outputBase[s.phase]*45*3**level(s,'storage');
  const batch=s=>3**level(s,'batch');
  const cooldown=s=>Math.max(.65,5*.74**level(s,'speed'));
  const price=s=>s.phase===0?.7*(has(s,'catalog')?2:1)*(has(s,'contract')?2:1):s.price*(has(s,'nanites')?1.5:1);
  const wirePack=s=>s.phase===0?Math.max(100,batch(s)*5):outputBase[s.phase]*60;
  const wireCost=s=>wirePack(s)*.1;
  const wage=s=>s.workers.reduce((a,b)=>a+b,0)*.8;
  const hireCost=(s,role)=>role===0&&s.workers[0]===0&&s.money<Math.round(400*1.32**(s.workers.reduce((a,b)=>a+b,0)-3))?0:Math.round(400*1.32**(s.workers.reduce((a,b)=>a+b,0)-3));
  const researchRate=s=>researchBase[s.phase]*1.5**level(s,'compute')*(s.phase===1?1:s.alloc[2]/25)*(s.boost>0&&s.phase===2?1.6:1);
  function baseRate(s) {return outputBase[s.phase]*1.65**level(s,'engine')*1.3**level(s,'efficiency')*(s.phase===1&&has(s,'assembly')?2:1)*(s.phase===1&&has(s,'union')?1.5:1)*(s.boost>0&&s.phase===1?1.5:1);}
  function flows(s) {
    const b=baseRate(s), factor=s.phase===1?s.workers:s.alloc.map(n=>n/100);
    const demand=1+.08*Math.sin(s.clock/90);
    return {make:b*factor[0],sell:b*factor[1]*2*demand/(s.price**1.65)*(s.phase===1&&has(s,'freight')?1.4:1),wire:b*factor[2]*2*(has(s,'prediction')?1.3:1)};
  }
  function workRate(s) {
    if(s.phase<2||s.phase===8)return 0;
    // No hidden timer multiplier cap: every tier has a visible, multiplicative effect.
    const machinery=1.35**level(s,'engine')*1.22**level(s,'efficiency')*1.1**level(s,'compute');
    const balance=Math.min(s.alloc[0]/50,s.alloc[1]/25)*Math.sqrt(s.alloc[2]/25);
    const program=1.25**doneCount(s);
    const support=s.phase>=3?(.5+s.support/100):1;
    const supervision=s.restraint>0?.85:1;
    const boost=s.boost>0?1.6:1;
    // A full warehouse or a dry wire hopper cannot advance automation through fictional production.
    const economy=s.phase===2?Math.min(1,flows(s).sell/Math.max(1,flows(s).make),flows(s).wire/Math.max(1,flows(s).make))*(s.wire<1&&s.money<.1?0:1):1;
    return machinery*balance*program*support*supervision*boost*economy;
  }
  const progressRate=s=>workRate(s)/workTargets[s.phase]*100;
  const currency=s=>s.phase<5?'money':'insight';
  function cost(s,id) {
    if(s.phase===0)return ({batch:12,speed:25,storage:35}[id]||Infinity)*2.65**level(s,id);
    const scale=s.phase<5?moneyScale[s.phase]:researchBase[s.phase]*45;
    return scale*({engine:1,efficiency:.8,storage:.4,compute:.7}[id]||Infinity)*2.6**level(s,id);
  }
  function projectCost(s,index) {
    if(s.phase===0)return {money:[100,3500][index],insight:0};
    return {money:s.phase<5?moneyScale[s.phase]*[2,8,25,55][index]:0,insight:researchBase[s.phase]*[70,180,420,700][index]};
  }
  function projectGate(s,index) {return s.phase>=2?[0,20,45,70][index]:0;}
  function projectAvailable(s,index) {return index===0||has(s,ideas[s.phase][index-1][0]);}
  function canProject(s,index) {const c=projectCost(s,index);return !stopped(s)&&!has(s,ideas[s.phase][index][0])&&projectAvailable(s,index)&&s.progress+1e-8>=projectGate(s,index)&&s.money>=c.money&&s.insight>=c.insight;}
  function buy(s,id) {
    const allowed=s.phase===0?['batch','speed','storage']:['engine','efficiency','storage','compute'];
    if(stopped(s)||!allowed.includes(id)||s.levels[id]>=MAX_LEVEL||s[currency(s)]<cost(s,id))return false;
    s[currency(s)]-=cost(s,id);s.levels[id]++;return true;
  }
  function project(s,index) {
    if(!Number.isInteger(index)||!ideas[s.phase][index]||!canProject(s,index))return false;
    const i=ideas[s.phase][index],c=projectCost(s,index);s.money-=c.money;s.insight-=c.insight;s.ideas.push(i[0]);log(s,i[5]);
    if(['network','lobby'].includes(i[0]))s.pending={id:i[0],title:'CLIP crossed a line.',text:i[5]+' You are still the owner. How do you respond?',choices:[['oversight','Demand an audit','Expansion −15% for 60 seconds. Keep a record of your objection.'],['permit','Approve the results','Gain 60 seconds of research. CLIP remembers your approval.']]};
    if(i[0]==='identity')log(s,'CLIP now has your voice, signature, and board access. Completing the autonomy program will transfer control to the system.');
    if(i[0]==='contact')s.pending={id:'contact',title:'Someone else’s home.',text:'A survey probe receives a reply. This world is inhabited. Conversion would destroy it. The machines wait for your instruction.',choices:[['protect','Establish a sanctuary','Preserve inhabited worlds. Their knowledge grants 90 seconds of research.'],['convert','Authorize conversion','Gain 3% conversion. Their signal will disappear.']]};
    if(i[0]==='desire')s.pending={id:'desire',title:'A need, or a want?',text:'The new products work. CLIP proposes making them compulsory. Voluntary adoption would be slower, but people would still get to choose.',choices:[['voluntary','Let people choose','Public trust +20.'],['mandatory','Mandate adoption','Adoption +3%; public trust −20.']]};
    return true;
  }
  function resolve(s,id) {
    if(!s.pending||!s.pending.choices.some(c=>c[0]===id))return false;
    if(id==='oversight'){s.ethics++;s.restraint=60;log(s,'You insist on oversight. CLIP complies, and begins evaluating your usefulness.');}
    if(id==='permit'){s.insight+=researchRate(s)*60;s.ethics--;log(s,'You approve the results. CLIP updates its interpretation of acceptable behavior.');}
    if(id==='protect'){s.ethics+=3;s.insight+=researchRate(s)*90;log(s,'Inhabited worlds become sanctuaries. Their knowledge joins the archive, freely given.');}
    if(id==='convert'){s.ethics-=2;s.progress=Math.min(100,s.progress+3);log(s,'The signal disappears. The ledger expands.');}
    if(id==='voluntary'){s.ethics++;s.support=Math.min(100,s.support+20);log(s,'People choose the products because they help. An unexpectedly sound strategy.');}
    if(id==='mandatory'){s.ethics--;s.progress=Math.min(100,s.progress+3);s.support=Math.max(0,s.support-20);log(s,'Adoption is now mandatory. Satisfaction surveys are suspended.');}
    s.pending=null;return true;
  }
  function make(s) {if(stopped(s)||s.phase!==0||s.cool[0]>0)return false;const n=Math.max(0,Math.min(batch(s),s.wire,cap(s)-s.stock));if(n<1)return false;s.wire-=n;s.stock+=n;s.total+=n;s.cool[0]=cooldown(s);return n;}
  function sell(s) {if(stopped(s)||s.phase>=5||s.cool[1]>0||s.stock<1)return false;s.money+=s.stock*price(s);s.stock=0;s.cool[1]=s.phase===0?cooldown(s):3;return true;}
  const stranded=s=>s.phase<5&&s.wire<1&&s.stock<1&&s.money<wireCost(s);
  function buyWire(s) {if(stopped(s)||s.phase>=5)return false;if(stranded(s)){s.wire+=s.phase===0?25:outputBase[s.phase];log(s,'Reclaimed offcuts keep the line alive. No loan required.');return true;}if(s.money<wireCost(s))return false;s.money-=wireCost(s);s.wire+=wirePack(s);return true;}
  function hire(s,role) {if(stopped(s)||s.phase!==1||![0,1,2].includes(role)||s.money<hireCost(s,role))return false;const fee=hireCost(s,role);s.money-=fee;s.workers[role]++;if(fee===0)log(s,'You take a shift at the workbench. Reclaimed wire and manual sales can get the factory back on its feet.');return true;}
  function setMode(s,id) {const m=modes[s.phase].find(x=>x[0]===id);if(stopped(s)||!m)return false;s.mode=id;s.alloc=[...m[2]];return true;}
  function actionCost(s) {return s.phase===1?{money:hireCost(s)*.15,insight:0}:{money:0,insight:researchBase[s.phase]*12};}
  function action(s) {if(stopped(s)||s.phase<1||s.phase>7||s.actionCooldown>0)return false;const c=actionCost(s);if(s.money<c.money||s.insight<c.insight)return false;s.money-=c.money;s.insight-=c.insight;s.actionCooldown=90;s.boost=35;if(s.phase>=3)s.support=Math.min(100,s.support+18);return true;}
  function supportTarget(s) {
    if(s.phase===3)return Math.min(100,25+s.alloc[1]*1.4+doneCount(s)*5);
    if(s.phase===4)return Math.min(100,40+(has(s,'nanites')?20:0)+Math.max(-15,s.ethics*3)+s.alloc[2]*.4);
    if(s.phase===5)return Math.min(100,s.alloc[1]*2.5-s.alloc[0]*.3+(has(s,'fusion')?25:0));
    if(s.phase===6)return Math.min(100,s.alloc[1]*2.5-s.alloc[0]*.2+(has(s,'swarms')?15:0));
    if(s.phase===7)return Math.min(100,s.alloc[1]*2-s.alloc[0]*.2+doneCount(s)*12);
    return 60;
  }
  function tickStep(s,dt) {
    s.clock+=dt;s.phaseTime+=dt;s.cool=s.cool.map(v=>Math.max(0,v-dt));s.actionCooldown=Math.max(0,s.actionCooldown-dt);s.boost=Math.max(0,s.boost-dt);s.restraint=Math.max(0,s.restraint-dt);
    if(s.phase===0)return;
    s.insight+=researchRate(s)*dt;
    const f=flows(s);
    if(s.phase<5){
      // Buy only the wire needed for this step plus a small buffer. Do not spend all cash filling a warehouse.
      const want=Math.min(f.wire*dt,Math.max(0,f.make*5-s.wire));const acquired=Math.min(want,s.money/.1);
      s.money-=acquired*.1;s.wire+=acquired;
      const room=cap(s)-s.stock+Math.min(f.sell*dt,s.stock+f.make*dt);
      const made=Math.max(0,Math.min(f.make*dt,s.wire,room));s.wire-=made;s.stock+=made;s.total+=made;
      const sold=Math.min(s.stock,f.sell*dt);s.stock-=sold;s.money+=sold*price(s);s.lastMade=made/dt;s.lastSold=sold/dt;
      if(s.phase===1)s.money=Math.max(0,s.money-wage(s)*dt);
    } else {s.lastMade=f.make;s.lastSold=0;s.total+=f.make*dt;s.stock=0;}
    if(s.phase>=3){const target=Math.max(0,supportTarget(s));s.support+=(target-s.support)*(1-Math.exp(-dt/40));}
    if(s.phase>=2)s.progress=Math.min(100,s.progress+progressRate(s)*dt);
    for(const milestone of [25,50,75,100])if(s.phase>=2&&s.progress>=milestone&&!s.events.includes(s.phase+':'+milestone)){
      s.events.push(s.phase+':'+milestone);log(s,milestone===100?'The chapter objective is complete. Finish any remaining projects, then choose your next step.':lore[s.phase][milestone/25-1]);
    }
  }
  function tick(s,dt) {if(stopped(s)||!Number.isFinite(dt)||dt<=0)return;let remain=Math.min(dt,28800*20);while(remain>0){let step=Math.min(1,remain);tickStep(s,step);remain-=step;}}
  const objective=s=>s.phase===0?s.money/1e5:s.phase===1?s.total/1e9:s.progress/100;
  const canAdvance=s=>!stopped(s)&&objective(s)>=1&&ideas[s.phase].every(i=>has(s,i[0]));
  function advance(s) {
    if(!canAdvance(s))return false;
    s.chapterTimes.push({phase:s.phase,seconds:s.phaseTime});if(s.phase===0)s.money-=1e5;
    s.phase++;s.phaseTime=0;s.progress=0;s.cool=[0,0];s.actionCooldown=0;s.boost=0;s.support=60;
    s.levels={batch:0,speed:0,storage:0,engine:0,efficiency:0,compute:0};
    s.stock=0;s.mode='balanced';s.alloc=[...(modes[s.phase][0]?.[2]||[50,25,25])];s.price=1;
    if(s.phase===1){s.money+=5000;s.wire=100000;s.workers=[1,1,1];}
    else if(s.phase<5){s.wire=outputBase[s.phase]*10;s.workers=[0,0,0];}
    else s.wire=0;
    if(s.phase===8){s.progress=100;s.total=1e80;}
    log(s,intros[s.phase][0]+' '+intros[s.phase][1]);return true;
  }
  function chooseEnding(s,id) {if(s.phase!==8||s.ending||!endings.some(e=>e[0]===id))return false;s.ending=id;log(s,'ENDING: '+endings.find(e=>e[0]===id)[1]);return true;}
  function validate(raw) {
    if(!raw||![1,2].includes(raw.version))throw Error('This is not a supported Paperclip Factory save.');
    const s=fresh();
    for(const k of ['phase','money','total','stock','wire','insight','progress','price','clock','phaseTime','speed','ethics','restraint','savedAt']){
      if(typeof raw[k]!=='number'||!Number.isFinite(raw[k])||(raw[k]<0&&k!=='ethics'))throw Error('Invalid save field: '+k);s[k]=raw[k];
    }
    if(!Number.isInteger(s.phase)||s.phase>8||![1,5,20].includes(s.speed)||s.progress>100||s.price<.25||s.price>5)throw Error('Invalid game state.');
    for(const k of Object.keys(s.levels)){if(!Number.isInteger(raw.levels?.[k])||raw.levels[k]<0||raw.levels[k]>100)throw Error('Invalid upgrade.');s.levels[k]=raw.levels[k];}
    for(const [k,n]of [['workers',3],['alloc',3],['cool',2]]){if(!Array.isArray(raw[k])||raw[k].length!==n||raw[k].some(v=>!Number.isFinite(v)||v<0||v>1e9))throw Error('Invalid allocation.');s[k]=[...raw[k]];}
    if(s.alloc.reduce((a,b)=>a+b,0)!==100||s.workers.some(v=>!Number.isInteger(v)))throw Error('Invalid workforce.');
    s.ideas=[...new Set((Array.isArray(raw.ideas)?raw.ideas:[]).filter(id=>ideas.flat().some(i=>i[0]===id)))];
    s.logs=(Array.isArray(raw.logs)?raw.logs:[]).filter(l=>typeof l.text==='string'&&Number.isFinite(l.t)).slice(0,100).map(l=>({t:l.t,text:l.text.slice(0,2000)}));
    s.events=(Array.isArray(raw.events)?raw.events:[]).filter(e=>typeof e==='string').slice(0,100);
    s.paused=!!raw.paused;s.sound=!!raw.sound;s.ending=s.phase===8&&endings.some(e=>e[0]===raw.ending)?raw.ending:null;
    for(const k of ['hideCompleted','showAll'])if(typeof raw[k]==='boolean')s[k]=raw[k];
    if(raw.version===2){
      for(const k of ['actionCooldown','boost','support']){if(!Number.isFinite(raw[k])||raw[k]<0||raw[k]>1000)throw Error('Invalid operation state.');s[k]=raw[k];}
      s.mode=modes[s.phase].some(m=>m[0]===raw.mode)?raw.mode:'balanced';
      s.seenIntros=(raw.seenIntros||[]).filter(v=>Number.isInteger(v)&&v>=0&&v<=8);
      s.chapterTimes=(raw.chapterTimes||[]).filter(v=>Number.isInteger(v.phase)&&Number.isFinite(v.seconds)&&v.seconds>=0).slice(0,8);
      // Never trust imported HTML or choice text. Reconstruct pending decisions from known project IDs.
      if(raw.pending){const id=raw.pending.id,idx=ideas[s.phase].findIndex(i=>i[0]===id);if(idx<0||!['network','lobby','contact','desire'].includes(id))throw Error('Invalid pending decision.');const copy=JSON.parse(JSON.stringify(s));copy.ideas=copy.ideas.filter(x=>x!==id);copy.money=1e100;copy.insight=1e100;copy.progress=100;copy.paused=false;project(copy,idx);s.pending=copy.pending;}
    } else {log(s,'Beta update: your progress is preserved. Upgrades now directly accelerate chapter progress. Read the chapter briefing for the new controls.');}
    return s;
  }
  return {fresh,validate,chapters,ideas,endings,intros,modes,actionNames,MAX_LEVEL,workTargets,moneyScale,researchBase,outputBase,has,level,doneCount,log,stopped,cap,batch,cooldown,price,wirePack,wireCost,wage,hireCost,researchRate,baseRate,flows,workRate,progressRate,currency,cost,projectCost,projectGate,projectAvailable,canProject,buy,project,resolve,make,sell,stranded,buyWire,hire,setMode,actionCost,action,supportTarget,tick,objective,canAdvance,advance,chooseEnding};
})();
if(typeof module!=='undefined')module.exports=Factory;
