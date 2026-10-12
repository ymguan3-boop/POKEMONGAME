const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const base=path.join(__dirname,'../寶可夢3D-V5');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
const html=read('index.html'),npcSource=read('js/npc-system.js'),npcData=read('js/npc-data.js');
const core=require('../寶可夢3D-V5/js/battle-core.js');
const ids=['pikachu','raichu','jigglypuff','mewtwo','charmander','squirtle'];
const catalog=ids.map(id=>({id,name:id,element:'一般',types:['一般'],hp:150,
 skills:[{name:'普攻',damage:20,element:'一般'},{name:'技能',damage:30,element:'一般'}]}));
const party={playerParty:ids.slice(0,3),opponentParty:ids.slice(3),catalog};
test('Joy dialogue bolds each named Pokémon using strong DOM nodes, preserving other text',()=>{
 const root={};
 new Function('window',npcSource)(root);
 const data={};new Function('window',npcData)(data);
 const joy=data.V5NpcData.actors.find(x=>x.id==='joy');
 const children=[],p={replaceChildren(...nodes){children.splice(0,children.length,...nodes)}};
 const originalDocument=global.document;
 global.document={createTextNode:text=>({kind:'text',text}),createElement:tag=>({kind:tag,className:'',textContent:''})};
 try{
  const npc=Object.create(root.V5NpcSystem.prototype);
  npc.panel={querySelector:()=>p};
  npc.setJoyDialogue(joy.dialogue+'\n獲得 1 個樹果！');
  const names=children.filter(x=>x.kind==='strong').map(x=>x.textContent);
  assert.deepEqual(names,['雷丘','皮卡丘','雷丘','超夢','胖丁']);
  assert.ok(children.some(x=>x.kind==='text'&&x.text.includes('寶可夢中心')));
  assert.ok(children.some(x=>x.kind==='text'&&x.text.includes('獲得 1 個樹果')));
  assert.equal(children.filter(x=>x.kind==='strong').every(x=>x.className==='v5-dialogue-pokemon'),true);
  assert.match(npcSource,/npc.id==='joy'\)this.setJoyDialogue\(text\)/);
  assert.match(npcSource,/#v5-dialogue p strong\.v5-dialogue-pokemon\{font-weight:900/);
 }finally{global.document=originalDocument}
});
test('only the adventure outfit grants party-wide permanent 20% attack multiplier',()=>{
 const a=core.createBattle({...party,adventureBoost:true});
 const normal=core.createBattle({...party});
 assert.equal(a.adventureBoost,true);
 for(const f of a.teams[0])assert.equal(f.permanentAttackBonus,.2);
 for(const f of a.teams[1])assert.equal(f.permanentAttackBonus,undefined);
 assert.equal(core.damage(core.actor(a,0),core.actor(a,1),core.actor(a,0).skills[0]),24);
 assert.equal(core.damage(core.actor(normal,0),core.actor(normal,1),core.actor(normal,0).skills[0]),20);
 assert.equal(core.damage(core.actor(a,1),core.actor(a,0),core.actor(a,1).skills[0]),20);
});
test('permanent 20% buff remains after an attack and applies after switching teammates',()=>{
 const s=core.createBattle({...party,adventureBoost:true});
 core.applyAction(s,0,{type:'normal'});
 assert.equal(core.actor(s,1).hp,126);
 core.applyAction(s,1,{type:'defend'});
 core.applyAction(s,0,{type:'switch',index:1});
 assert.equal(core.actor(s,0).permanentAttackBonus,.2);
 core.applyAction(s,1,{type:'normal'});
 const target=core.actor(s,1);
 target.defending=false;
 assert.equal(core.damage(core.actor(s,0),target,core.actor(s,0).skills[0]),24);
});
test('master ball doubling stacks multiplicatively with the adventure passive and expires',()=>{
 const s=core.createBattle({...party,adventureBoost:true,itemStock:{master:1}});
 const me=core.actor(s,0),op=core.actor(s,1);
 assert.equal(core.applyAction(s,0,{type:'item',item:'master'}).ok,true);
 assert.equal(s.itemStock.master,0);
 assert.equal(core.damage(me,op,me.skills[0]),48);
 core.applyAction(s,1,{type:'defend'});
 const result=core.applyAction(s,0,{type:'normal'});
 const hit=result.events.find(e=>e.type==='attack');
 assert.equal(hit.boosted,true);assert.equal(hit.adventureBonus,true);
 assert.equal(hit.damage,24); // 20 × 1.2 × 2 × opponent defense 0.5
 assert.equal(me.attackBoost,0);
 assert.equal(core.damage(me,op,me.skills[0]),24);
});
test('battle controller recognizes equipped adventure preset but not mere unlock or other costumes',async()=>{
 class UI{loading(){}renderBattle(){}close(){}error(m){throw Error(m)}}
 class Arena{constructor(){this.fighters=[{},{}]}async showBoth(){}dispose(){}clearOpeningIcon(){}}
 const root={V5BattleUI:UI,V5BattleArena:Arena,V5BattleCore:core,V5BattleData:{
  normalizeParty:party=>party,npcParty:()=>ids.slice(3),catalog:()=>catalog
 }};
 const fakeDoc={body:{classList:{add(){},remove(){}}}};
 const code=read('js/battle-controller.js');
 new Function('window','document','console',code)(root,fakeDoc,{warn(){},error(){}});
 const vec={clone(){return this},copy(){return this}};
 for(const [activeSuit,mewCompanion,expected] of [
  ['none',true,true],['none',false,false],['trainer',true,false],['mew',true,false],
  ['wigglytuff',true,false],['blissey',true,false]
 ]){
  const state={currentMode:'world',camAngle:0,isCharging:false,autoNavigateCenter:false,interactionOpen:false,
   equip:{activeSuit,mewCompanion,wigglytuffSuit:true,blisseySuit:true},
   captureCounts:{pikachu:1,raichu:1,jigglypuff:1},battle3d:{
    party:ids.slice(0,3),stats:{wins:0,losses:0,draws:0,forfeits:0},rewards:{}}};
  const c=new root.V5BattleController({state,save(){},player:{position:vec},camera:{position:vec,quaternion:vec}});
  assert.equal(await c.start(),true,activeSuit);
  assert.equal(c.session.adventureBoost,expected,activeSuit);
  c.exit(true);
 }
});
test('selected showcased species is catchable and force-locked with priority above natural spawns',()=>{
 const start=html.indexOf('const spawnPrize='),end=html.indexOf('const syncPrizeEntities=',start);
 assert.ok(start>0&&end>start);
 const body=html.slice(start,end);
 const locked=[],added=[];
 class Pkmn{
  constructor(type,x,z){this.type=type;this.mesh={position:{x,z},parent:{}};this.lockPriority=0;}
 }
 const state={currentMode:'world',obstacles:[],pokemons:[]};
 const allowed=new Set(['pikachu']),dex={pikachu:{name:'皮卡丘'}};
 const spawn=new Function('gameState','V5_AVAILABLE_TYPES','POKEDEX_DATA','MAP_BOUNDARY','player','Pokemon','resolveCollision','scene','prioritizeLockTarget',
  body+'\nreturn spawnPrize;')(
  state,allowed,dex,100,{position:{x:0,z:0}},Pkmn,()=>{}, {add:m=>added.push(m)}, m=>locked.push(m)
 );
 const monster=spawn('pikachu',{showcase:true});
 assert.ok(monster);
 assert.equal(monster.isShowcase,true);
 assert.equal(monster.isCatchable,true);
 assert.equal(monster.isTargetable,true);
 assert.equal(monster.isBattleTarget,true);
 assert.equal(monster.lockPriority,500);
 assert.equal(locked[0],monster);
 assert.equal(state.pokemons.length,1);
 const runtime={PalletRoster:{special:[]}};
 new Function('window',read('js/game-runtime-state.js'))(runtime);
 assert.equal(runtime.PokemonGameRuntime.isLockTargetAvailable(monster),true);
 assert.equal(runtime.PokemonGameRuntime.getLockPriority(monster),500);
});
test('picker keeps one selected species, updates persisted choice, and describes real capture',()=>{
 assert.match(html,/gameState\.battle3d\.showcaseSpecies=id;saveGameData\(\);close\(\)/);
 assert.match(html,/gameState\.pokemons=gameState\.pokemons\.filter\(p=>!p\.isShowcase\)/);
 assert.match(html,/monster=spawnPrize\(id,\{showcase:true\}\)/);
 assert.match(html,/自動鎖定，讓你可以再次投球捕捉/);
 assert.ok(!html.includes('monster.isCatchable=false;monster.isTargetable=false'));
});
test('renamed outfit, visible backpack plus Mew, UI status and updated script cache',()=>{
 assert.match(html,/夢幻隨行與後背包裝備<\/strong>/);
 assert.match(html,/playerBackpack\.visible = !transformed && \(gymAccessoriesActive \|\| !gameState\.equip\.mewCompanion\)/);
 assert.match(html,/hasMewCompanion = \(\) => !!gameState\.equip\.mewCompanion/);
 for(const p of ['npc-system.js?v=20261013-joy-bold','battle-core.js?v=20261013-adventure20',
  'battle-ui.js?v=20261013-adventure20','battle-controller.js?v=20261013-adventure20'])
  assert.ok(html.includes(p),p);
 const ui=read('js/battle-ui.js');
 assert.match(ui,/session.adventureBoost/);
 assert.match(ui,/✧ 攻擊 \+20%/);
 for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new Function(m[1]);
});
