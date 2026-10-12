const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.join(__dirname,'../寶可夢3D-V5');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const npc=fs.readFileSync(path.join(base,'js/npc-system.js'),'utf8');
const mobile=fs.readFileSync(path.join(base,'mobile.css'),'utf8');
test('HUD displays only the four requested counters, keeping normal ball data updates intact',()=>{
 const hud=html.split('<div id="unified-hud"')[1]?.split('<div id="boss-hp-container"')[0];
 assert.ok(hud);
 const publicIds=['hud-capture-score','hud-berries','hud-greatballs','hud-masterballs'];
 for(const id of publicIds)assert.equal((hud.match(new RegExp('id="'+id+'"','g'))||[]).length,1);
 assert.equal((hud.match(/class="v5-status-chip/g)||[]).length,4);
 assert.match(hud,/id="hud-pokeball-container" hidden aria-hidden="true"/);
 assert.match(hud,/id="hud-pokeballs"/);
 assert.match(html,/getElementById\('hud-pokeballs'\)\.innerText/);
 assert.ok(hud.indexOf('hud-capture-score')<hud.indexOf('hud-berries'));
 assert.ok(hud.indexOf('hud-berries')<hud.indexOf('hud-greatballs'));
 assert.ok(hud.indexOf('hud-greatballs')<hud.indexOf('hud-masterballs'));
});
test('radar collapsing hides only the map and leaves both travel buttons usable',()=>{
 const nav=html.split('<div id="radar-controls"')[1]?.split('<div id="notification"')[0];
 assert.ok(nav);
 assert.match(nav,/id="radar-display"/);
 assert.match(nav,/id="btn-auto-nav"/);assert.match(nav,/id="btn-nav-trainer"/);
 assert.ok(nav.indexOf('id="radar-display"')<nav.indexOf('id="btn-auto-nav"'));
 assert.ok(nav.indexOf('</canvas>')<nav.indexOf('id="btn-auto-nav"'));
 assert.match(mobile,/#radar-display\[hidden\]\{display:none!important\}/);
 assert.match(mobile,/#radar-controls:has\(#radar-display\[hidden\]\) #radar-container\{padding-top:52px\}/);
});
test('radar button toggles actual visibility, accessibility and persistent preference',()=>{
 const anchor="const radarButton=document.getElementById('btn-toggle-radar');";
 const close="bindTouch('btn-toggle-radar',()=>setRadarExpanded(radarDisplay.hidden));";
 const start=html.indexOf(anchor),end=html.indexOf(close,start);
 assert.ok(start>=0&&end>start);
 const snippet=html.slice(start,end+close.length);
 function setup(old){
  const attrs={};const button={title:'',textContent:'',setAttribute(k,v){attrs[k]=v}};
  const radar={hidden:false};
  const storage=new Map(old===null?[]:[['pokemon3d_v5_radar_expanded',old]]);
  const store={getItem:key=>storage.get(key)||null,setItem:(k,v)=>storage.set(k,v)};
  let toggle=null;
  new Function('document','localStorage','bindTouch',snippet)(
   {getElementById:id=>id==='btn-toggle-radar'?button:id==='radar-display'?radar:null},
   store,(id,fn)=>{assert.equal(id,'btn-toggle-radar');toggle=fn});
  return {radar,attrs,button,storage,toggle};
 }
 let x=setup(null);
 assert.equal(x.radar.hidden,false);assert.equal(x.attrs['aria-expanded'],'true');
 x.toggle();assert.equal(x.radar.hidden,true);
 assert.equal(x.attrs['aria-expanded'],'false');assert.equal(x.attrs['aria-label'],'展開雷達');
 assert.equal(x.storage.get('pokemon3d_v5_radar_expanded'),'0');
 x.toggle();assert.equal(x.radar.hidden,false);assert.equal(x.button.textContent,'🧭');
 const restored=setup('0');
 assert.equal(restored.radar.hidden,true);
});
test('NPC challenge and continue use distinct columns and >=12px gap',()=>{
 assert.match(npc,/class="v5-dialogue-actions"/);
 assert.match(npc,/gap:12px;margin-top:20px/);
 assert.match(npc,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(npc,/min-height:52px/);
 assert.match(npc,/v5-card-menu" hidden>選擇隊伍／3D 挑戰<\/button><button class="v5-close-talk">繼續冒險/);
 assert.match(npc,/v5-reward-choice\{grid-column:1\/-1\}/);
 assert.match(npc,/v5-dialogue-actions button\[hidden\]\{display:none!important\}/);
});
test('all inline scripts and NPC JavaScript remain syntactically valid',()=>{
 const inline=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
 assert.ok(inline.length>40);
 for(const script of inline)new Function(script[1]);
 new Function(npc);
});
