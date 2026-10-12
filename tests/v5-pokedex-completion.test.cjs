const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const rootDir=path.join(__dirname,'../寶可夢3D-V5');
const source=fs.readFileSync(path.join(rootDir,'js/pokedex-completion.js'),'utf8');
const html=fs.readFileSync(path.join(rootDir,'index.html'),'utf8');
const battleCss=fs.readFileSync(path.join(rootDir,'css/battle3d.css'),'utf8');
const completionCss=fs.readFileSync(path.join(rootDir,'css/pokedex-completion.css'),'utf8');
function scenario(reducedMotion=false){
 const timers=[],cancelled=[],children=[];
 let acknowledged=false,busy=false,continued=0,resets=0,focusCount=0;
 const actions={hidden:true,querySelector(sel){return sel.includes('continue')?{focus(){focusCount++}}:null}};
 const panel=()=>({
  _html:'',className:'',attributes:{},listeners:{},removed:false,
  setAttribute(key,value){this.attributes[key]=value},
  set innerHTML(value){this._html=value;actions.hidden=true},
  get innerHTML(){return this._html},
  addEventListener(key,fn){this.listeners[key]=fn},
  querySelector(sel){return sel==='.v5-dex-complete-actions'?actions:null},
  remove(){this.removed=true}
 });
 const document={createElement(){return panel()},body:{appendChild(x){children.push(x)}}};
 const win={matchMedia(){return{matches:reducedMotion}}};
 const mod={exports:{}};
 new Function('window','module','document','setTimeout','clearTimeout',source)(
  win,mod,document,(fn,ms)=>{const id=timers.length+1;timers.push({id,fn,ms});return id},
  id=>cancelled.push(id)
 );
 const V=mod.exports.PokedexCompletion;
 const api=new V({
  isAcknowledged:()=>acknowledged,isBusy:()=>busy,
  onContinue:()=>{acknowledged=true;continued++},
  onReset:()=>{resets++}
 });
 function tap(action){
  api.dialog.listeners.click({stopPropagation(){},target:{closest(){
   return {dataset:{action}}
  }}});
 }
 return{api,timers,cancelled,children,actions,tap,
   setBusy(value){busy=value},get acknowledged(){return acknowledged},
   get continued(){return continued},get resets(){return resets},get focusCount(){return focusCount}};
}
test('not full: never show even when nearly done',()=>{
 const x=scenario();
 assert.equal(x.api.check(60,61),false);
 assert.equal(x.api.check(0,61),false);
 assert.equal(x.api.check(0,0),false);
 assert.equal(x.children.length,0);
});
test('final capture waits for capture card to close, then opens celebration once',()=>{
 const x=scenario();
 x.setBusy(true);
 assert.equal(x.api.check(61,61),false);
 assert.equal(x.children.length,0);
 x.setBusy(false);
 assert.equal(x.api.maybeShow(),true);
 assert.equal(x.children.length,1);
 assert.equal(x.api.maybeShow(),false);
 assert.equal(x.children[0].attributes['aria-modal'],'true');
 assert.equal(x.children[0].attributes['aria-label'],'全圖鑑完成！！');
 assert.match(x.children[0].innerHTML,/全圖鑑完成！！/);
 assert.equal(x.actions.hidden,true);
 assert.equal(x.timers.length,1);assert.equal(x.timers[0].ms,3600);
});
test('button choices remain locked until gradual text finishes, then continue acknowledges and retains progress',()=>{
 const x=scenario();x.api.check(61,61);
 x.tap('reset');x.tap('continue');
 assert.equal(x.resets,0);assert.equal(x.continued,0);
 x.timers[0].fn();
 assert.equal(x.actions.hidden,false);assert.equal(x.focusCount,1);
 x.tap('continue');
 assert.equal(x.continued,1);assert.equal(x.acknowledged,true);
 assert.equal(x.api.active,false);
 assert.equal(x.api.check(61,61),false,'continue must suppress future repeated celebration');
});
test('reset delegates to two-confirmation existing handler; no automatic deletion',()=>{
 const x=scenario();x.api.check(61,61);x.timers[0].fn();
 x.tap('reset');
 assert.equal(x.resets,1);
 assert.equal(x.acknowledged,false);
 assert.equal(x.api.active,true,'canceling the actual reset confirmations should leave choice open');
 assert.match(html,/bindTouch\('btn-reset', async \(\) => \{/);
 assert.match(html,/第一次確認（1\/2）/);
 assert.match(html,/最後確認（2\/2）/);
 assert.match(html,/dexCompletion\.maybeShow\(\)/);
});
test('closing early cancels delayed result; reopening does not leak timers or old buttons',()=>{
 const x=scenario();x.api.check(61,61);
 x.api.close();assert.deepEqual(x.cancelled,[1]);
 const first=x.timers[0];first.fn();
 assert.equal(x.actions.hidden,true);
 x.api.check(61,61);
 assert.equal(x.timers.length,2);
 assert.equal(x.children.length,2);
});
test('reduced motion unlocks choices promptly',()=>{
 const x=scenario(true);
 x.api.check(61,61);
 assert.equal(x.timers[0].ms,0);
 x.timers[0].fn();
 assert.equal(x.actions.hidden,false);
});
test('cinematic letters, transparent victory/defeat and asset cache keys',()=>{
 assert.match(completionCss,/v5-dex-letter-in/);
 assert.match(completionCss,/prefers-reduced-motion/);
 assert.match(completionCss,/\.v5-dex-complete-actions\[hidden\]\{display:none!important\}/);
 assert.match(battleCss,/\.v5-battle-result\{[^}]*background:rgba\(16,39,61,\.58\)/);
 assert.match(html,/pokedex-completion\.css\?v=20261012/);
 assert.match(html,/pokedex-completion\.js\?v=20261012/);
 assert.match(html,/battle3d\.css\?v=20261012-translucent/);
 assert.match(html,/dexCompletion\.check\(caught,total\)/);
 assert.match(html,/pokedexCompletionAcknowledged=true/);
 for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new Function(m[1]);
});
