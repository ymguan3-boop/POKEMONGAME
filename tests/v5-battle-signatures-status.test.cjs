const test=require('node:test'),assert=require('node:assert/strict');
const S=require('../寶可夢3D-V5/js/battle-signatures.js');
const C=require('../寶可夢3D-V5/js/battle-core.js');
const roster=['butterfree','articuno','raichu','pikachu','charmander','squirtle','blissey','metapod','weedle','beedrill'];
const elems={butterfree:'蟲',articuno:'冰',raichu:'電',pikachu:'電',charmander:'火',squirtle:'水',blissey:'一般',metapod:'蟲',weedle:'蟲',beedrill:'蟲'};
const catalog=roster.map(id=>{const element=elems[id],sig=S.signature(id,element,id);return{id,name:id,element,types:[element],hp:100,skills:[
 {name:'基本一擊',element:'一般',damage:10},
 {name:sig.name,element,damage:15,ability:sig.effect,chance:sig.chance,fxVariant:sig.fxVariant,fxSeed:sig.fxSeed}
]};});
const make=(player='butterfree',foe='pikachu')=>{
 const one=[player,...roster.filter(id=>id!==player&&id!==foe).slice(0,2)];
 const two=[foe,...roster.filter(id=>id!==player&&id!==foe).slice(2,4)];
 return C.createBattle({playerParty:one,opponentParty:two,catalog});
};
test('signature moves are distinct, seeded, finite and cover expected roster',()=>{
 const seen=new Set();
 for(const id of Object.keys(S.names)){
  const s=S.signature(id,'蟲',id);
  assert.ok(s.name&&s.fxVariant&&Number.isInteger(s.fxSeed));
  assert.equal(seen.has(s.name),false,'duplicate move '+id);
  seen.add(s.name);
 }
 assert.ok(seen.size>=58);
 assert.equal(S.signature('butterfree','蟲','巴大蝶').effect,'poison');
 assert.equal(S.signature('articuno','冰','急凍鳥').effect,'freeze');
 assert.equal(S.signature('raichu','電','雷丘').effect,'paralysis');
});
test('poison applies to opponent then chips 8% max HP on each of 3 own opportunities',()=>{
 const s=make(),hit=C.applyAction(s,0,{type:'special'},()=>0);
 assert.equal(hit.events.some(x=>x.type==='statusApply'&&x.status==='poison'),true);
 const target=C.actor(s,1);assert.equal(target.status.type,'poison');
 let previous=target.hp;
 for(let i=0;i<3;i++){
  const action=C.applyAction(s,1,{type:'normal'},()=>1);
  assert.equal(action.events.some(x=>x.type==='statusTick'&&x.damage===8),true);
  assert.equal(target.hp,previous-8);previous=target.hp;
  if(i<2)C.applyAction(s,0,{type:'defend'},()=>1);
 }
 assert.equal(target.status,null);
});
test('freeze lasts exactly one NPC action opportunity with no attack damage',()=>{
 const s=make('articuno','charmander'),hit=C.applyAction(s,0,{type:'special'},()=>0);
 assert.ok(hit.events.some(e=>e.type==='statusApply'&&e.status==='freeze'));
 const before=C.actor(s,0).hp;
 const blocked=C.applyAction(s,1,{type:'normal'},()=>0);
 assert.equal(blocked.events.some(e=>e.type==='statusSkip'&&e.status==='freeze'),true);
 assert.equal(C.actor(s,0).hp,before);
 assert.equal(C.actor(s,1).status,null);
 assert.equal(s.turn,0);
});
test('paralysis may skip but later releases; no extra paralysis on chance failure',()=>{
 const s=make('raichu','charmander');
 C.applyAction(s,0,{type:'special'},()=>0);
 const target=C.actor(s,1);assert.equal(target.status.type,'paralysis');
 const blocked=C.applyAction(s,1,{type:'normal'},()=>0);
 assert.ok(blocked.events.some(e=>e.type==='statusSkip'));
 C.applyAction(s,0,{type:'defend'},()=>1);
 const next=C.applyAction(s,1,{type:'normal'},()=>1);
 assert.equal(next.events.some(e=>e.type==='attack'),true);
 assert.equal(target.status,null);
 const s2=make('raichu','charmander');C.applyAction(s2,0,{type:'special'},()=>.99);
 assert.equal(C.actor(s2,1).status,null);
});
test('healing cannot exceed max HP and shield cuts next hit in half',()=>{
 const s=make('blissey','pikachu');const p=C.actor(s,0);p.hp=90;
 const special=C.applyAction(s,0,{type:'special'},()=>0);
 assert.ok(special.events.some(e=>e.type==='heal'));
 assert.ok(p.hp>90&&p.hp<=100);
 const other=make('metapod','pikachu');C.applyAction(other,0,{type:'special'},()=>0);
 assert.equal(C.actor(other,0).defending,true);
 const received=C.applyAction(other,1,{type:'normal'},()=>1);
 assert.equal(received.events.find(e=>e.type==='attack').damage,5);
});
test('status cannot be overwritten while active and switching out is allowed',()=>{
 const s=make();const target=C.actor(s,1);target.status={type:'freeze',turns:1};
 C.applyAction(s,0,{type:'special'},()=>0);
 assert.equal(target.status.type,'freeze');
 const switchAction=C.applyAction(s,1,{type:'switch',index:1},()=>0);
 assert.equal(switchAction.ok,true);
 assert.equal(target.status.type,'freeze');
});
test('poison KO gives correct winner and never produces negative health',()=>{
 const s=make('butterfree','charmander');
 C.applyAction(s,0,{type:'normal'});
 const enemy=C.actor(s,1);enemy.status={type:'poison',turns:1};enemy.hp=3;
 const result=C.applyAction(s,1,{type:'normal'});
 assert.ok(result.events.some(e=>e.type==='faint'&&e.side===1));
 assert.equal(enemy.hp,0);assert.equal(s.active[1],1);
});
