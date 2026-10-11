const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../寶可夢3D-V5/js/battle-core.js');
const policy=require('../寶可夢3D-V5/js/victory-rewards.js');
const progress=require('../寶可夢3D-V5/js/progress.js');
const root={
 V5BattleCore:core,V5VictoryRewards:policy,V5Progress:progress,
 PalletRoster:{dex:{bulbasaur:{},charmander:{},squirtle:{},mewtwo:{},raichu:{},pikachu:{},mew:{},wigglytuff:{},blissey:{}},
 bosses:['pikachu','mew','wigglytuff','blissey']},
 V5CardCatalog:['bulbasaur','charmander','squirtle','mewtwo','raichu','pikachu','mew','wigglytuff','blissey'].map(id=>({id,name:id,element:'草',hp:70,skills:[{name:'普通',damage:15},{name:'特殊',damage:25}]}))
};
const Module={exports:{}};
require('vm').runInNewContext(
 require('fs').readFileSync(require('path').join(__dirname,'../寶可夢3D-V5/js/battle-data.js'),'utf8'),
 {window:root,module:Module,globalThis:root,Math}
);
const D=Module.exports;
test('NPC 3D opponent lineup contains the uncaught species slated for victory',()=>{
 const state={captureCounts:{bulbasaur:1},worldFlags:{},quests:{}};
 const team=D.npcParty(state,()=>.25);
 assert.equal(team.length,3);assert.equal(new Set(team).size,3);
 assert.ok(team.includes(team.rewardId));
 assert.equal(policy.caught(state,team.rewardId),false);
 for(const id of team)assert.equal(root.PalletRoster.bosses.includes(id),false);
 const battle=core.createBattle({playerParty:['bulbasaur','charmander','squirtle'],opponentParty:team,catalog:root.V5CardCatalog});
 assert.deepEqual(Array.from(battle.teams[1].map(c=>c.id)),Array.from(team));
});
test('Raichu cannot appear in NPC party before talking to Oak, but can later',()=>{
 const save={captureCounts:{pikachu:1},worldFlags:{},quests:{}};
 for(let k=0;k<8;k++)assert.equal(D.npcParty(save,()=>k/8).includes('raichu'),false);
 progress.oakRaichu(save);
 let found=false;
 for(let k=0;k<10;k++)if(D.npcParty(save,()=>k/10).includes('raichu'))found=true;
 assert.equal(found,true);
});
test('Once all non-gym species are collected NPC remains battleable, with no duplicate prize',()=>{
 const save={captureCounts:{bulbasaur:1,charmander:1,squirtle:1,mewtwo:1,raichu:1},worldFlags:{raichuSpawnUnlocked:true},quests:{'oak-raichu-study':true}};
 const team=D.npcParty(save,()=>.4);
 assert.equal(team.length,3);assert.equal(team.rewardId,null);
 assert.equal(policy.status(save,policy.roster(root.PalletRoster.dex,root.PalletRoster.bosses),()=>true).allCollected,true);
});
