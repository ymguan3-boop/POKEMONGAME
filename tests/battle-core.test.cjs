const test=require('node:test');
const assert=require('node:assert/strict');
const core=require('../寶可夢3D-V5/js/battle-core.js');
const names=['bulbasaur','charmander','squirtle','chikorita','cyndaquil','totodile'];
const elements=['草','火','水','草','火','水'];
const weaknesses=['火','水','電','火','水','電'];
const catalog=names.map((id,i)=>({id,name:id,element:elements[i],weakness:weaknesses[i],hp:70,
 skills:[{name:'撞擊',damage:15},{name:'屬性技能',damage:25}]}));
const party=[...names.slice(0,3)],npc=[...names.slice(3)];
const create=()=>core.createBattle({playerParty:party,opponentParty:npc,catalog});
function opponentTurn(s){assert.equal(s.turn,1);return core.applyAction(s,1,core.pickAIAction(s));}
test('免費卡牌不能解鎖未捕捉的 3D 戰鬥夥伴',()=>{
 const save={cardStarterReceived:true,cardCollection:{bulbasaur:200,charmander:200,squirtle:200}};
 assert.equal(core.validateParty(party,save,catalog).ok,false);
 assert.equal(core.isCaught('bulbasaur',save,catalog),false);
});
test('只准三種不同且已捕捉的 V5 名單物種',()=>{
 const save={captureCounts:{bulbasaur:1,charmander:3,squirtle:1},pokedexUnlocks:{}};
 assert.equal(core.validateParty(party,save,catalog).ok,true);
 assert.equal(core.validateParty(['bulbasaur','bulbasaur','squirtle'],save,catalog).ok,false);
 assert.equal(core.validateParty(['bulbasaur','charmander','old-model'],save,catalog).ok,false);
});
test('舊存檔圖鑑解鎖紀錄可視為已捕捉的歷史',()=>{
 assert.equal(core.isCaught('bulbasaur',{pokedexUnlocks:{bulbasaur:true}},catalog),true);
});
test('每個玩家回合只做一個行動，AI 再回應',()=>{
 const s=create();assert.equal(core.applyAction(s,0,{type:'normal'}).ok,true);
 assert.equal(s.turn,1);assert.equal(core.applyAction(s,0,{type:'normal'}).ok,false);
 opponentTurn(s);assert.equal(s.turn,0);assert.equal(s.round,2);
});
test('屬性加成採 1.5 倍且防禦只減半下一次傷害',()=>{
 const s=create(),a=core.actor(s,0),b=core.actor(s,1);
 a.element='火';b.weakness='火';
 assert.equal(core.damage(a,b,{damage:45}),68);
 b.defending=true;assert.equal(core.damage(a,b,{damage:45}),34);
 const defense=create();core.applyAction(defense,0,{type:'defend'});
 const hit=core.applyAction(defense,1,{type:'normal'});
 assert.equal(hit.events[0].damage,8);
 assert.equal(core.actor(defense,0).defending,false);
});
test('特殊招式後兩次自己的指令回合不可再用，第三次可用',()=>{
 const s=create();assert.equal(core.applyAction(s,0,{type:'special'}).ok,true);
 opponentTurn(s);assert.equal(core.applyAction(s,0,{type:'special'}).ok,false);
 core.applyAction(s,0,{type:'normal'});opponentTurn(s);
 assert.equal(core.applyAction(s,0,{type:'special'}).ok,false);
 core.applyAction(s,0,{type:'normal'});opponentTurn(s);
 assert.equal(core.applyAction(s,0,{type:'special'}).ok,true);
});
test('玩家被擊倒後必須免費強制換人，不會損失行動',()=>{
 const s=create();core.actor(s,0).hp=1;
 core.applyAction(s,0,{type:'normal'});
 const ko=core.applyAction(s,1,{type:'normal'});
 assert.equal(ko.needsSwitch,true);
 assert.equal(core.applyAction(s,0,{type:'normal'}).ok,false);
 const swap=core.applyAction(s,0,{type:'switch',index:1});
 assert.equal(swap.forced,true);assert.equal(s.turn,0);
 assert.equal(core.applyAction(s,0,{type:'normal'}).ok,true);
});
test('主動換人消耗行動且不能選擇失去戰鬥能力的成員',()=>{
 const s=create();s.teams[0][1].hp=0;
 assert.equal(core.applyAction(s,0,{type:'switch',index:1}).ok,false);
 assert.equal(core.applyAction(s,0,{type:'switch',index:2}).ok,true);
 assert.equal(s.turn,1);
});
test('敵方寶可夢倒下後會自動更換可戰鬥的候補',()=>{
 const s=create();s.teams[1][0].hp=1;
 core.applyAction(s,0,{type:'normal'});
 assert.equal(s.active[1],1);assert.equal(s.status,'playing');
});
test('三隻全部倒下則立即勝利且不得再次攻擊',()=>{
 const s=create();s.teams[1].forEach(x=>x.hp=0);s.teams[1][0].hp=1;
 core.applyAction(s,0,{type:'normal'});
 assert.equal(s.winner,0);assert.equal(s.status,'finished');
 assert.equal(core.applyAction(s,0,{type:'normal'}).ok,false);
});
test('放棄對戰為失敗且沒有勝利獎勵',()=>{
 const s=create();core.forfeit(s);assert.equal(s.winner,1);
 assert.match(s.reason,/放棄/);
});
test('沒有活著的換人對象不可切換',()=>{
 const s=create();s.teams[0][1].hp=0;s.teams[0][2].hp=0;
 assert.equal(core.available(s,0).length,0);
 assert.equal(core.applyAction(s,0,{type:'switch',index:1}).ok,false);
});
