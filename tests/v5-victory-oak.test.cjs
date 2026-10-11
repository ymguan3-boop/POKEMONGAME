const test=require('node:test'),assert=require('node:assert/strict');
const R=require('../寶可夢3D-V5/js/victory-rewards.js');
const P=require('../寶可夢3D-V5/js/progress.js');
const names={pikachu:{},mew:{},wigglytuff:{},blissey:{},raichu:{},bulbasaur:{},mewtwo:{}};
const all=R.roster(names,['pikachu','mew','wigglytuff','blissey']);
test('trainer rewards exclude all gym species, prefer uncaught and respect Oak gate',()=>{
 assert.deepEqual(all,['raichu','bulbasaur','mewtwo']);
 const state={captureCounts:{bulbasaur:1},quests:{},worldFlags:{}};
 const choose=R.awardType(state,all,id=>P.eligible(state,id),[],[],()=>0);
 assert.equal(choose.id,'mewtwo');assert.deepEqual(choose.locked,['raichu']);assert.equal(choose.allCollected,false);
});
test('reward never considers owned species, even when only locked species remains',()=>{
 const s={captureCounts:{raichu:0,bulbasaur:1,mewtwo:1},quests:{},worldFlags:{}};
 const r=R.awardType(s,all,id=>P.eligible(s,id));
 assert.equal(r.id,null);assert.equal(r.allCollected,false);assert.deepEqual(r.locked,['raichu']);
});
test('all collected allows manual selection including non-gym mythicals',()=>{
 const s={captureCounts:{raichu:1,bulbasaur:1,mewtwo:1},pokedexUnlocks:{}};
 const r=R.awardType(s,all,()=>true);assert.equal(r.allCollected,true);assert.equal(r.id,null);
});
test('random victory avoids already-present uncaught species where possible',()=>{
 const s={captureCounts:{},quests:{'oak-raichu-study':true},worldFlags:{raichuSpawnUnlocked:true}};
 s.captureCounts.pikachu=1;
 const r=R.awardType(s,all,id=>P.eligible(s,id),['raichu'],['bulbasaur'],()=>0);
 assert.equal(r.id,'mewtwo');
});
test('Oak blocks without a captured Pikachu, then permanently unlocks after conversation',()=>{
 const s={captureCounts:{pikachu:0},worldFlags:{},quests:{}};
 assert.equal(P.oakRaichu(s).status,'need-pikachu');
 assert.equal(P.eligible(s,'raichu'),false);
 s.captureCounts.pikachu=1;
 assert.equal(P.eligible(s,'raichu'),false);
 assert.equal(P.oakRaichu(s).status,'unlocked');
 assert.equal(P.eligible(s,'raichu'),true);
 assert.equal(P.oakRaichu(s).status,'already-unlocked');
});
test('legacy Thunder Stone does not bypass Oak conversation',()=>{
 const s=P.migrate({items:{thunderStone:2},captureCounts:{pikachu:0},worldFlags:{raichuSpawnUnlocked:true}});
 assert.equal(P.eligible(s,'raichu'),false);
});

test('3D trainer records one pending prize per win, none for a loss, and survives saves',()=>{
 const originalUI=globalThis.V5BattleUI,originalCore=globalThis.V5BattleCore;
 const existingController=globalThis.V5BattleController;
 try{
  globalThis.V5BattleUI=class {constructor(){}};
  globalThis.V5BattleCore={getOutcome:session=>({finished:true,winner:session.winner})};
  // Module initialization only attaches the controller class; it does not start a scene.
  delete require.cache[require.resolve('../寶可夢3D-V5/js/battle-controller.js')];
  require('../寶可夢3D-V5/js/battle-controller.js');
  const s={worldFlags:{},specialPokemonCaptured:{},captureCounts:{},
   battle3d:P.normalizeBattle({})},saved=[];
  const controller=new globalThis.V5BattleController({state:s,save:()=>saved.push(P.normalizeBattle(s.battle3d,s))});
  controller.session={winner:0};controller.recordOutcome();controller.recordOutcome();
  assert.equal(s.battle3d.stats.wins,1);assert.equal(s.battle3d.pendingWins,1);
  assert.equal(controller.rewardAfterExit,true);assert.equal(!!s.worldFlags.mewtwoAwaiting,false);
  controller.recorded=false;controller.session={winner:1};controller.recordOutcome();
  assert.equal(s.battle3d.stats.losses,1);assert.equal(s.battle3d.pendingWins,1);
  assert.equal(P.migrate({battle3d:s.battle3d}).battle3d.pendingWins,1);
  assert.equal(saved.length,2);
 }finally{
  globalThis.V5BattleUI=originalUI;globalThis.V5BattleCore=originalCore;
  globalThis.V5BattleController=existingController;
 }
});
