const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.join(__dirname,'../寶可夢3D-V5');
const joySource=fs.readFileSync(path.join(base,'js/npc-data.js'),'utf8');
const uiSource=fs.readFileSync(path.join(base,'js/battle-ui.js'),'utf8');
const css=fs.readFileSync(path.join(base,'css/battle3d.css'),'utf8');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
test('Joy provides accurate Pikachu/Oak/Raichu quest and possible uncaught 3D encounter rewards',()=>{
 const root={};
 new Function('window',joySource)(root);
 const joy=root.V5NpcData.actors.find(a=>a.id==='joy');
 assert.ok(joy);
 for(const phrase of ['寶可夢中心','皮卡丘','大木博士','雷丘','3D 對戰訓練家','超夢','胖丁','未捕捉','非道館'])
  assert.ok(joy.dialogue.includes(phrase),'missing Joy hint: '+phrase);
 assert.match(joy.dialogue,/至少 1 隻皮卡丘/);
 assert.match(joy.dialogue,/獲勝後，有機會/);
});
function setup(winner,reducedMotion=false){
 let scheduled=[],cancelled=[],focused=0;
 const fakeRoot={V5BattleCore:{actor:(s,side)=>s.teams[side][s.active[side]],available:()=>[]},
  matchMedia:()=>({matches:reducedMotion})};
 const fakeDoc={};
 new Function('window','document','setTimeout','clearTimeout',uiSource)(
   fakeRoot,fakeDoc,(fn,ms)=>{const id=scheduled.length+1;scheduled.push({id,fn,ms});return id},
   id=>{cancelled.push(id)});
 const state={berryCount:1,greatBallCount:2,masterBallCount:3};
 const f=id=>({id,name:id,hp:70,maxHp:100,skills:[
  {element:'一般',name:'普通',damage:15},{element:'雷',name:'特殊',damage:40}
 ],specialWait:0,status:null});
 const session={status:'finished',winner,reason:'對戰已結束',round:4,history:['對戰已結束'],
  active:[0,0],teams:[[f('皮卡丘')],[f('超夢')]]};
 const controller={state,session,busy:false,active:true};
 const ui=new fakeRoot.V5BattleUI(controller);
 const actions={hidden:true,querySelector:()=>({focus:()=>{focused++}})};
 const layer={
  _html:'',set innerHTML(value){this._html=value;actions.hidden=value.includes('class="v5-battle-result-actions" hidden');},
  get innerHTML(){return this._html;},
  querySelector(selector){return selector==='.v5-battle-result-actions'?actions:null},
  remove(){this.removed=true}
 };
 ui.layer=layer;
 return {ui,session,layer,actions,scheduled,cancelled,focused:()=>focused};
}
test('winning reveals 獲 then 勝 separately; rematch/leave buttons unlock only after 1.9 seconds',()=>{
 const x=setup(0);
 x.ui.renderBattle();
 assert.match(x.layer.innerHTML,/class="v5-result-title" aria-label="獲勝"/);
 assert.match(x.layer.innerHTML,/--letter-delay:0ms" aria-hidden="true">獲<\/span>/);
 assert.match(x.layer.innerHTML,/--letter-delay:650ms" aria-hidden="true">勝<\/span>/);
 assert.match(x.layer.innerHTML,/再次挑戰/);assert.match(x.layer.innerHTML,/離開挑戰/);
 assert.equal(x.actions.hidden,true);
 assert.equal(x.scheduled.length,1);assert.equal(x.scheduled[0].ms,1900);
 x.ui.renderBattle();
 assert.equal(x.scheduled.length,1,'rerender must not restart the result animation');
 x.scheduled[0].fn();
 assert.equal(x.actions.hidden,false);assert.equal(x.focused(),1);
 x.ui.close();
 assert.equal(x.layer.removed,true);
});
test('losing reveals 失 then 敗, and tie renders 平手',()=>{
 for(const [winner,label,letters] of [[1,'失敗',['失','敗']],[null,'平手',['平','手']]]){
  const x=setup(winner);
  x.ui.renderBattle();
  assert.ok(x.layer.innerHTML.includes('aria-label="'+label+'"'));
  for(const c of letters)assert.ok(x.layer.innerHTML.includes('>'+c+'</span>'));
  assert.equal(x.actions.hidden,true);
  x.scheduled[0].fn();
  assert.equal(x.actions.hidden,false);
  x.ui.close();
 }
});
test('exiting while outcome animates cancels timer; stale callbacks cannot reveal another session',()=>{
 const x=setup(0);
 x.ui.renderBattle();const oldTimer=x.scheduled[0];
 x.ui.close();assert.deepEqual(x.cancelled,[1]);
 const other=setup(1);
 x.ui.layer=other.layer;x.ui.controller.session=other.session;
 oldTimer.fn();
 assert.equal(other.actions.hidden,true,'stale outcome may not unlock choices in another match');
 x.ui.renderBattle();
 assert.equal(x.scheduled.length,2);
});
test('reduced motion exposes controls immediately, while remaining keyboard-accessible',()=>{
 const x=setup(1,true);
 x.ui.renderBattle();
 assert.equal(x.scheduled[0].ms,0);
 x.scheduled[0].fn();
 assert.equal(x.actions.hidden,false);
 assert.equal(x.focused(),1);
});
test('battle animation CSS, hidden safety and asset cache keys are deployed together',()=>{
 assert.match(css,/\.v5-result-letter\{/);
 assert.match(css,/@keyframes v5-result-letter-enter/);
 assert.match(css,/\.v5-battle-result-actions\[hidden\]\{display:none!important\}/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 for(const id of ['npc-data.js?v=20261012-joy','battle-ui.js?v=20261012-outcome','battle3d.css?v=20261012-outcome']){
  assert.ok(html.includes(id),id);
 }
 for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new Function(m[1]);
 new Function(uiSource);new Function(joySource);
});
