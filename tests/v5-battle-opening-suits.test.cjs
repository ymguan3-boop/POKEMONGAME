const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../寶可夢3D-V5/js/battle-core.js');
const catalog=['bulbasaur','charmander','squirtle','pikachu','butterfree','articuno'].map(id=>({
 id,name:id,element:id==='charmander'?'火':id==='squirtle'?'水':'草',types:['草'],hp:100,
 skills:[{name:'基本攻擊',element:'一般',damage:12},{name:'強力技能',element:'電',damage:30,ability:'paralysis',chance:1}]
}));
const make=suit=>C.createBattle({playerParty:['bulbasaur','charmander','squirtle'],opponentParty:['pikachu','butterfree','articuno'],catalog,openingSuit:suit});
test('only explicit opening suits gain advantages',()=>{
 const ordinary=make(),invalid=make('trainer'),sleep=make('wigglytuff'),shield=make('blissey');
 assert.equal(ordinary.openingSuit,null);assert.equal(invalid.openingSuit,null);
 assert.equal(sleep.openingSuit,'wigglytuff');assert.equal(shield.openingSuit,'blissey');
 assert.equal(C.actor(sleep,1).status.type,'sleep');
 assert.equal(C.actor(shield,1).status,null);
});
test('wigglytuff applies first-round sleep with icon status and consumes precisely one NPC turn',()=>{
 const s=make('wigglytuff');
 const first=C.applyAction(s,0,{type:'defend'});assert.equal(first.ok,true);
 const before=C.actor(s,0).hp,now=C.applyAction(s,1,{type:'special'},()=>0);
 assert.ok(now.events.some(e=>e.type==='statusSkip'&&e.status==='sleep'));
 assert.equal(now.events.some(e=>e.type==='attack'),false);
 assert.equal(C.actor(s,0).hp,before);
 assert.equal(s.round,2);assert.equal(C.actor(s,1).status,null);
 C.applyAction(s,0,{type:'defend'});
 const second=C.applyAction(s,1,{type:'normal'},()=>0);
 assert.ok(second.events.some(e=>e.type==='attack'));
});
test('wigglytuff sleep cannot be bypassed by NPC changing party on round one',()=>{
 const s=make('wigglytuff');
 C.applyAction(s,0,{type:'defend'});
 const res=C.applyAction(s,1,{type:'switch',index:1});
 assert.ok(res.events.some(e=>e.status==='sleep'));
 assert.equal(s.active[1],0);
 assert.equal(s.round,2);
});
test('wigglytuff opening spell still applies if NPC lead is knocked out before its turn',()=>{
 const s=make('wigglytuff');
 C.actor(s,1).hp=1;
 C.applyAction(s,0,{type:'normal'});
 assert.equal(s.active[1],1);
 const blocked=C.applyAction(s,1,{type:'normal'});
 assert.ok(blocked.events.some(e=>e.status==='sleep'));
 assert.equal(s.round,2);
 C.applyAction(s,0,{type:'defend'});
 assert.equal(C.applyAction(s,1,{type:'normal'}).events.some(e=>e.type==='attack'),true);
});
test('blissey blocks first NPC attack completely, including poison/paralysis abilities',()=>{
 const s=make('blissey');
 C.applyAction(s,0,{type:'normal'});
 const hp=C.actor(s,0).hp;
 const result=C.applyAction(s,1,{type:'special'},()=>0);
 const hit=result.events.find(e=>e.type==='attack');
 assert.ok(hit.immune);assert.equal(hit.damage,0);
 assert.equal(C.actor(s,0).hp,hp);
 assert.equal(C.actor(s,0).status,null);
 assert.equal(result.events.some(e=>e.type==='statusApply'),false);
 assert.equal(s.round,2);
 C.applyAction(s,0,{type:'defend'});
 const round2=C.applyAction(s,1,{type:'normal'},()=>0);
 assert.equal(round2.events.find(e=>e.type==='attack').immune,false);
});
test('blissey immunity never protects from NPC second-round attacks',()=>{
 const s=make('blissey');
 C.applyAction(s,0,{type:'defend'});
 C.applyAction(s,1,{type:'defend'});
 assert.equal(s.round,2);
 C.applyAction(s,0,{type:'normal'});
 const attack=C.applyAction(s,1,{type:'normal'}).events.find(e=>e.type==='attack');
 assert.ok(attack.damage>0);assert.equal(attack.immune,false);
});
test('neither outfit changes opening damage of player attacks',()=>{
 for(const suit of ['blissey','wigglytuff']){
  const s=make(suit);const hp=C.actor(s,1).hp;
  C.applyAction(s,0,{type:'normal'});
  assert.equal(C.actor(s,1).hp,hp-12);
 }
});
