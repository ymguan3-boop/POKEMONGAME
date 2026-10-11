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
