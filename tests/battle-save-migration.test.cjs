const test=require('node:test');
const assert=require('node:assert/strict');
const progress=require('../寶可夢3D-V5/js/progress.js');
test('V5 legacy capture, gym, card decks and flags survive migration',()=>{
 const saved={cardWins:2,cardStarterReceived:true,cardDeck:['bulbasaur','charmander'],
  captureCounts:{bulbasaur:2,mewtwo:1},pokedexUnlocks:{charmander:true},
  cardCollection:{bulbasaur:9},gyms:{gym_1:{cleared:true}},
  specialPokemonCaptured:{mewtwo:true},worldFlags:{mewtwoAwaiting:true}};
 const got=progress.migrate(saved);
 assert.equal(got.schemaVersion,5);
 assert.deepEqual(got.cardDeck,saved.cardDeck);
 assert.deepEqual(got.captureCounts,saved.captureCounts);
 assert.deepEqual(got.gyms,saved.gyms);
 assert.equal(got.cardWins,2);
 assert.equal(got.battle3d.rewards.specialDuoUnlocked,true);
});
test('New battle3d stats are sanitized and duplicates removed',()=>{
 const got=progress.migrate({battle3d:{party:['bulbasaur','bulbasaur','charmander','squirtle','totodile'],
 stats:{wins:-100,losses:Infinity,draws:3,forfeits:'2'},leader:'bulbasaur'}});
 assert.deepEqual(got.battle3d.party,['bulbasaur','charmander','squirtle']);
 assert.equal(got.battle3d.stats.wins,0);
 assert.equal(got.battle3d.stats.losses,0);
 assert.equal(got.battle3d.stats.draws,3);
 assert.equal(got.battle3d.stats.forfeits,2);
});
test('No battle3d in old saves generates safe 3v3 defaults',()=>{
 const got=progress.migrate({captureCounts:{squirtle:1}});
 assert.deepEqual(got.battle3d.party,[]);
 assert.equal(got.battle3d.stats.wins,0);
 assert.equal(got.battle3d.rewards.specialDuoUnlocked,false);
});
test('Prior pending special rewards preserve unlock status',()=>{
 for(const flags of [{mewtwoAwaiting:true},{jigglypuffAwaiting:true}]){
  const got=progress.migrate({worldFlags:flags});
  assert.equal(got.battle3d.rewards.specialDuoUnlocked,true);
 }
});
test('A freshly reset V5 marker is not replaced by unrelated V4 legacy progress',()=>{
 const reads=[];
 const fake={getItem(key){
  reads.push(key);
  if(key==='pokemon3d_v5_preview')return JSON.stringify({schemaVersion:5,worldFlags:{},
     captureCounts:{},battle3d:{version:1,party:[]}});
  if(key==='pokemon3d_sinnoh_summer_v16')return JSON.stringify({captureCounts:{pikachu:99}});
  return null;
 }};
 const got=progress.load(fake,'pokemon3d_v5_preview');
 assert.deepEqual(got.captureCounts,{});
 assert.equal(reads.length,1);
});
