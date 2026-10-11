const test=require('node:test'),assert=require('node:assert/strict');
const core=require('../寶可夢3D-V5/js/battle-core.js');
const ids=['bulbasaur','charmander','squirtle','pikachu','butterfree','articuno'];
const catalog=ids.map(id=>({id,name:id,element:'一般',types:['一般'],hp:100,
 skills:[{name:'攻擊',element:'一般',damage:12},{name:'技能',element:'一般',damage:25}]}));
class UI{constructor(){this.messages=[];}loading(){}renderBattle(msg){this.messages.push(msg||'');}
renderParty(){}close(){}error(msg){throw Error(msg)}}
class Arena{constructor(){this.fighters=[{id:'bulbasaur'},{id:'pikachu'}];}async showBoth(){}async play(){}
frame(){}render(){}clearOpeningIcon(){}dispose(){}}
const root={V5BattleUI:UI,V5BattleArena:Arena,V5BattleCore:core,V5BattleData:{
 normalizeParty:party=>party,catalog:()=>catalog,npcParty:()=>ids.slice(3)}};
const doc={hidden:false,body:{classList:{add(){},remove(){}}}};
const src=require('fs').readFileSync(require('path').join(__dirname,'../寶可夢3D-V5/js/battle-controller.js'),'utf8');
new Function('window','document','setTimeout','console',src)(root,doc,fn=>{fn();return 0},console);
const Controller=root.V5BattleController;
const vec={clone(){return this;},copy(){return this;}};
function make(berry=2,great=2,master=2){
 const state={currentMode:'world',camAngle:0,isCharging:false,autoNavigateCenter:false,
  equip:{activeSuit:'none'},interactionOpen:false,berryCount:berry,greatBallCount:great,masterBallCount:master,
  captureCounts:Object.fromEntries(ids.slice(0,3).map(id=>[id,1])),
  battle3d:{party:ids.slice(0,3),stats:{wins:0,losses:0,draws:0,forfeits:0},rewards:{}}};
 const calls={saved:0,refresh:0},ctx={state,save(){calls.saved++},
  refreshInventory(){calls.refresh++},player:{position:vec},camera:{position:vec,quaternion:vec}};
 return{controller:new Controller(ctx),state,calls};
}
test('successful item decrements overworld inventory exactly once and persists before enemy turn',async()=>{
 const e=make(2),c=e.controller;
 assert.equal(await c.start(),true);
 const initialSaves=e.calls.saved;
 assert.equal(await c.action({type:'item',item:'berry'}),true);
 assert.equal(e.state.berryCount,1);
 assert.equal(c.session.itemStock.berry,1);
 assert.equal(e.calls.saved,initialSaves+1);
 assert.equal(e.calls.refresh,1);
 assert.equal(c.session.round,2);
 c.exit(true);
});
test('zero and invalid items are rejected without turn advancement or save changes',async()=>{
 const e=make(0,0,0),c=e.controller;await c.start();
 const old=e.calls.saved;
 assert.equal(await c.action({type:'item',item:'berry'}),false);
 assert.equal(await c.action({type:'item',item:'master'}),false);
 assert.equal(await c.action({type:'item',item:'great'}),false);
 assert.equal(c.session.turn,0);assert.equal(e.calls.saved,old);assert.equal(e.calls.refresh,0);
 c.exit(true);
});
test('invalid full HP heal does not spend a great ball or consume player turn',async()=>{
 const e=make(),c=e.controller;await c.start();
 const old=e.calls.saved;
 assert.equal(await c.action({type:'item',item:'great'}),false);
 assert.equal(e.state.greatBallCount,2);assert.equal(c.session.turn,0);
 assert.equal(e.calls.saved,old);
 c.exit(true);
});
test('menu renders HP+team groups, item count, three choices and red NPC style hooks',()=>{
 const e=make(2,3,1);
 const uiRoot={V5BattleCore:core};
 const uiSource=require('fs').readFileSync(require('path').join(__dirname,'../寶可夢3D-V5/js/battle-ui.js'),'utf8');
 new Function('window','document',uiSource)(uiRoot,{});
 const c=e.controller;
 c.session=core.createBattle({playerParty:ids.slice(0,3),opponentParty:ids.slice(3),catalog,
  itemStock:{berry:2,great:3,master:1}});
 c.active=true;c.busy=false;
 const ui=new uiRoot.V5BattleUI(c);ui.layer={innerHTML:''};
 ui.renderBattle();
 assert.match(ui.layer.innerHTML,/v5-battle-side enemy/);
 assert.match(ui.layer.innerHTML,/v5-battle-side player/);
 assert.match(ui.layer.innerHTML,/data-action="items-menu"/);
 assert.doesNotMatch(ui.layer.innerHTML,/data-action="defend"/);
 ui.itemMenu=true;ui.renderBattle();
 assert.match(ui.layer.innerHTML,/樹果/);
 assert.match(ui.layer.innerHTML,/進階球/);
 assert.match(ui.layer.innerHTML,/大師球/);
 assert.match(ui.layer.innerHTML,/×2/);
 assert.match(ui.layer.innerHTML,/×3/);
 assert.match(ui.layer.innerHTML,/×1/);
});
