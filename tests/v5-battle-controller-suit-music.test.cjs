const test=require('node:test'),assert=require('node:assert/strict');
const Core=require('../寶可夢3D-V5/js/battle-core.js');
const species=['bulbasaur','charmander','squirtle','pikachu','butterfree','articuno'];
const catalog=species.map(id=>({id,name:id,element:'草',types:['草'],hp:100,skills:[{name:'普攻',element:'一般',damage:12},{name:'特攻',element:'草',damage:25}]}));
class UI{
 constructor(){this.messages=[];}
 loading(){}
 renderBattle(message){this.messages.push(message||'');}
 renderParty(){}
 close(){}
 error(message){throw new Error(message);}
}
class Arena{
 constructor(){this.fighters=[{id:'bulbasaur'},{id:'pikachu'}];this.icons=[];}
 async showBoth(){}
 statusBurst(){}
 showOpeningIcon(side,kind){this.icons.push({side,kind});}
 clearOpeningIcon(){}
 dispose(){}
}
const root={V5BattleUI:UI,V5BattleCore:Core,V5BattleArena:Arena,
 V5BattleData:{catalog:()=>catalog,normalizeParty:party=>party,npcParty:()=>['pikachu','butterfree','articuno']}};
const ctxGlobal=globalThis;
const old={V5BattleUI:ctxGlobal.V5BattleUI,V5BattleCore:ctxGlobal.V5BattleCore,V5BattleArena:ctxGlobal.V5BattleArena,V5BattleData:ctxGlobal.V5BattleData,document:ctxGlobal.document,V5BattleController:ctxGlobal.V5BattleController};
Object.assign(ctxGlobal,root);
ctxGlobal.document={body:{classList:{add(){},remove(){}}}};
delete require.cache[require.resolve('../寶可夢3D-V5/js/battle-controller.js')];
require('../寶可夢3D-V5/js/battle-controller.js');
const Controller=ctxGlobal.V5BattleController;
const vector={clone(){return this;},copy(){return this;}};
const make=(activeSuit,unlocked=true)=>{
 const state={currentMode:'world',camAngle:0,isCharging:false,autoNavigateCenter:false,interactionOpen:false,
 equip:{activeSuit,wigglytuffSuit:unlocked,blisseySuit:unlocked},
 captureCounts:{bulbasaur:1,charmander:1,squirtle:1},
 battle3d:{party:['bulbasaur','charmander','squirtle'],stats:{wins:0,losses:0,draws:0,forfeits:0},rewards:{}}};
 const audio={start:0,stop:0},context={state,save(){},player:{position:vector},camera:{position:vector,quaternion:vector},
 onBattleMusicStart:()=>{audio.start++;},onBattleMusicStop:()=>{audio.stop++;}};
 return {state,controller:new Controller(context),audio};
};
test('Wigglytuff equipped at entry shows sleep notice and music starts/restores',async()=>{
 const {state,controller,audio}=make('wigglytuff');
 assert.equal(await controller.start(),true);
 assert.equal(state.currentMode,'battle3d');
 assert.equal(audio.start,1);assert.equal(controller.session.openingSuit,'wigglytuff');
 assert.ok(controller.ui.messages.at(-1).includes('睡眠'));
 assert.deepEqual(controller.arena.icons,[{side:1,kind:'sleep'}]);
 controller.exit(true);assert.equal(audio.stop,1);assert.equal(state.currentMode,'world');
});
test('Blissey equipped at entry displays immunity, other suits and locked suits do not activate',async()=>{
 const one=make('blissey');await one.controller.start();
 assert.equal(one.controller.session.openingSuit,'blissey');
 assert.ok(one.controller.ui.messages.at(-1).includes('攻擊完全無效'));
 one.controller.exit(true);
 for(const suit of ['trainer','wigglytuff']){
  const env=make(suit,false);await env.controller.start();
  assert.equal(env.controller.session.openingSuit,null);
  env.controller.exit(true);
 }
});
test('failed battle loading still restores BGM after player exits',async()=>{
 const previous=ctxGlobal.V5BattleArena;
 ctxGlobal.V5BattleArena=class extends Arena {async showBoth(){throw Error('asset fail')}};
 try{
  const env=make('blissey');
  // The failed-load UI has an error prompt; no battle reward is granted.
  env.controller.ui.error=()=>{};
  assert.equal(await env.controller.start(),false);
  env.controller.exit(true);
  assert.equal(env.audio.start,1);assert.equal(env.audio.stop,1);
 }finally{ctxGlobal.V5BattleArena=previous;}
});
test.after(()=>{Object.assign(ctxGlobal,old);});
