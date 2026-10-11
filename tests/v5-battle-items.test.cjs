const test=require('node:test'),assert=require('node:assert/strict');
const C=require('../寶可夢3D-V5/js/battle-core.js');
const ids=['bulbasaur','charmander','squirtle','pikachu','butterfree','articuno'];
const catalog=ids.map(id=>({id,name:id,element:'一般',types:['一般'],hp:100,skills:[
  {name:'普攻',element:'一般',damage:20},{name:'特攻',element:'一般',damage:30}]}));
const create=(counts={berry:2,great:2,master:2},openingSuit)=>C.createBattle({
 playerParty:ids.slice(0,3),opponentParty:ids.slice(3),catalog,itemStock:counts,openingSuit
});
const npc=(s,type='normal')=>C.applyAction(s,1,{type});
test('樹果消耗一次機會且使下一次 NPC 攻擊傷害減半',()=>{
 const s=create(),hero=C.actor(s,0);
 const item=C.applyAction(s,0,{type:'item',item:'berry'});
 assert.equal(item.ok,true);assert.equal(s.itemStock.berry,1);
 assert.equal(s.turn,1);assert.equal(hero.defending,true);
 const hit=npc(s).events.find(e=>e.type==='attack');
 assert.equal(hit.damage,10);assert.equal(hero.hp,90);assert.equal(hero.defending,false);
 C.applyAction(s,0,{type:'normal'});assert.equal(npc(s).events.find(e=>e.type==='attack').damage,20);
});
test('進階球回復 20% 最大血量、上限不溢出、滿血不得浪費道具',()=>{
 const s=create(),hero=C.actor(s,0);
 const full=C.applyAction(s,0,{type:'item',item:'great'});
 assert.equal(full.ok,false);assert.equal(s.turn,0);assert.equal(s.itemStock.great,2);
 hero.hp=85;
 assert.equal(C.applyAction(s,0,{type:'item',item:'great'}).events[0].amount,15);
 assert.equal(hero.hp,100);assert.equal(s.itemStock.great,1);
 npc(s);hero.hp=33;
 const heal=C.applyAction(s,0,{type:'item',item:'great'});
 assert.equal(heal.events[0].amount,20);assert.equal(hero.hp,53);
});
test('大師球消耗一回合，使下一次實際出招傷害 x2，結束後恢復',()=>{
 const s=create(),foe=C.actor(s,1);
 const item=C.applyAction(s,0,{type:'item',item:'master'});
 assert.equal(item.ok,true);assert.equal(s.itemStock.master,1);
 assert.equal(C.actor(s,0).attackBoost,1);assert.equal(s.turn,1);
 npc(s,'defend');
 const before=foe.hp;
 const next=C.applyAction(s,0,{type:'normal'});
 assert.equal(next.events.find(e=>e.type==='attack').boosted,true);
 assert.equal(foe.hp,before-20); // 20 normal damage × 2 and NPC shield × .5
 assert.equal(C.actor(s,0).attackBoost,0);
 npc(s,'defend');
 const follow=C.applyAction(s,0,{type:'normal'});
 assert.equal(follow.events.find(e=>e.type==='attack').damage,10);
});
test('道具使用已套用時不重複扣費，庫存不足不得消耗行動',()=>{
 const s=create({berry:1,great:0,master:1});
 assert.equal(C.applyAction(s,0,{type:'item',item:'great'}).ok,false);
 assert.equal(C.applyAction(s,0,{type:'item',item:'unknown'}).ok,false);
 assert.equal(C.applyAction(s,0,{type:'item',item:'berry'}).ok,true);
 npc(s,'defend');
 assert.equal(C.applyAction(s,0,{type:'item',item:'berry'}).ok,false);
 assert.equal(s.itemStock.berry,0);
 assert.equal(s.turn,0);
});
test('NPC 不得使用玩家道具，異常狀態阻止行動時不扣道具',()=>{
 const s=create();
 C.actor(s,0).status={type:'freeze',turns:1};
 const blocked=C.applyAction(s,0,{type:'item',item:'master'});
 assert.equal(blocked.ok,true);assert.equal(blocked.events.some(e=>e.type==='statusSkip'),true);
 assert.equal(s.itemStock.master,2);assert.equal(C.actor(s,0).attackBoost,0);
 assert.equal(C.applyAction(s,1,{type:'item',item:'master'}).ok,false);
});
test('被擊倒後強制換人不允許道具代替換人',()=>{
 const s=create();
 C.actor(s,0).hp=1;
 C.applyAction(s,0,{type:'normal'});
 npc(s);
 assert.equal(s.requiresSwitch,true);
 assert.equal(C.applyAction(s,0,{type:'item',item:'berry'}).ok,false);
 assert.equal(s.itemStock.berry,2);
});
test('原本胖可丁睡眠及幸福蛋首回合免疫不受道具破壞',()=>{
 const sleep=create(undefined,'wigglytuff');
 C.applyAction(sleep,0,{type:'item',item:'berry'});
 assert.equal(npc(sleep).events.some(e=>e.status==='sleep'),true);
 const immune=create(undefined,'blissey');
 C.applyAction(immune,0,{type:'item',item:'master'});
 const result=npc(immune).events.find(e=>e.type==='attack');
 assert.equal(result.immune,true);assert.equal(result.damage,0);
});
