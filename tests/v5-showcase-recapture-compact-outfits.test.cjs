const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=path.join(__dirname,'../寶可夢3D-V5');
const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
const policy=require('../寶可夢3D-V5/js/showcase-capture-policy.js');
const make=(showcase,ready=true)=>({type:'mewtwo',isShowcase:showcase,isCaptured:false,
 isCatchable:true,isTargetable:ready,isBattleTarget:true,mesh:{visible:ready,parent:{},position:{}}});
test('already-caught special species are removed only when NOT selected showcases',()=>{
 const special=id=>id==='mewtwo',caught=id=>id==='mewtwo';
 assert.equal(policy.shouldPurgeCaughtSpecial(make(true),special,caught),false);
 assert.equal(policy.shouldPurgeCaughtSpecial(make(false),special,caught),true);
 assert.equal(policy.shouldPurgeCaughtSpecial({...make(false),type:'pikachu'},special,caught),false);
 assert.ok(html.includes('V5ShowcaseCapture.shouldPurgeCaughtSpecial(pk,isSpecialPokemonType,hasCapturedSpecialPokemon)'));
});
test('showcase becomes catchable after model load; hidden/loading models are not phantom hit targets',()=>{
 assert.equal(policy.isWildCaptureTargetReady(make(true)),true);
 assert.equal(policy.isWildCaptureTargetReady(make(true,false)),false);
 for(const changed of [{isCatchable:false},{isTargetable:false},{isBattleTarget:false},
  {isCaptured:true},{captureCommitted:true},{mesh:{visible:false,parent:{}}},
  {mesh:{visible:true,parent:null}}]){
   assert.equal(policy.isWildCaptureTargetReady({...make(true),...changed}),false);
 }
 assert.ok(html.includes('V5ShowcaseCapture.isWildCaptureTargetReady(pk)'));
 assert.ok(html.includes('if(pokemon.isShowcase && gameState.currentMode'));
 assert.ok(html.includes('gameState.pokemons.includes(pokemon))prioritizeLockTarget(pokemon)'));
});
test('successful showcase recapture invokes the existing Pokédex capture card and saves immediately',()=>{
 const start=html.indexOf('const completeWildCapture = (pokemon, ball) => {');
 const end=html.indexOf('const failWildCapture = (pokemon, ball) => {',start);
 assert.ok(start>0&&end>start);
 const snippet=html.slice(start,end);
 const events=[],pokemon={
  type:'mewtwo',isShowcase:true,captureCommitted:false,isCaptured:true,
  spawnX:0,spawnZ:0,mesh:{visible:true,position:{clone(){return{x:1,y:0,z:2}}}}
 };
 const world={
  captureCounts:{mewtwo:1},pokedexUnlocks:{mewtwo:true},cardCollection:{},
  specialPokemonCaptured:{mewtwo:true},gymRewardCaptured:{},
  hasReachedLimit:{},battle3d:{showcaseSpecies:'mewtwo',pendingEncounters:[]},
  captureInProgress:true,captureStartedAt:20,worldFlags:{},
  pokemons:[pokemon],lockedTarget:pokemon,respawnQueue:[]
 };
 const functions={
  gameState:world,MAX_CAPTURE_LIMIT:3,GYM_BOSS_TYPES:[],
  getPokedexInfo:()=>({name:'超夢'}),
  resolveCaptureOutcome:()=>({nextCount:1,isSpecial:true,shouldRespawn:false}),
  showCapturedPokedexEntry:()=>{events.push('pokedex-popup');return true},
  resetEntityTransientState:()=>{},scene:{remove(){events.push('removed')}},
  removeActiveBall:()=>events.push('ball-removed'),purgeCapturedSpecialPokemon:()=>{},
  requestAnimationFrame:cb=>cb(),createSuccessSparks:()=>{},
  updatePokedexUI:()=>events.push('hud'),updateInventoryUI:()=>{},
  saveGameData:()=>events.push('save'),Sound:{playSuccess(){}},
  showNotification:()=>{},getNextSpawnType:()=> 'pikachu',
  clock:{getElapsedTime:()=>100},
  window:{V5CardById:{}},
 };
 const keys=Object.keys(functions),values=Object.values(functions);
 const finish=new Function(...keys,snippet+'\nreturn completeWildCapture;')(...values);
 assert.equal(finish(pokemon,{mesh:{position:{clone(){return{x:1,y:0,z:2}}}}}),true);
 assert.equal(events.filter(x=>x==='pokedex-popup').length,1);
 assert.ok(events.includes('save'));
 assert.equal(world.battle3d.showcaseSpecies,null,'must not re-spawn recaptured showcase');
 assert.equal(world.captureCounts.mewtwo,1);
 assert.equal(world.pokedexUnlocks.mewtwo,true);
 assert.equal(world.pokemons.length,0);
 assert.equal(world.lastThrowResult,'captured');
});
test('selected showcase spawns catchable, has high priority and sync does not duplicate after capture',()=>{
 assert.match(html,/monster\.isShowcase=true;/);
 assert.match(html,/monster\.isCatchable=true;/);
 assert.match(html,/monster\.isBattleTarget=true;/);
 assert.match(html,/monster\.lockPriority=500/);
 assert.match(html,/if\(!showcase \|\| isLockTargetAvailable\(monster\)\)prioritizeLockTarget\(monster\)/);
 assert.match(html,/if\(pokemon\.isShowcase && gameState\.battle3d\?\.showcaseSpecies===pokemon\.type\)/);
 assert.ok(!html.includes('monster.isTargetable=true;monster.isBattleTarget=true;'));
});
test('outfit option spacing is compact without hiding names or descriptions',()=>{
 const region=html.split('<div id="outfit-modal"')[1]?.split('<div id="instructions-modal"')[0];
 assert.ok(region);
 assert.ok(region.includes('class="outfit-options p-3 grid grid-cols-1 sm:grid-cols-2 gap-2"'));
 assert.equal((region.match(/class="outfit-choice /g)||[]).length,6);
 assert.match(html,/#outfit-modal \.outfit-choice\{[^}]*grid-template-columns:32px minmax\(0,1fr\)/);
 assert.match(html,/min-height:56px!important;height:auto!important/);
 assert.match(html,/#outfit-modal \.outfit-choice > strong\{[^}]*margin-top:0!important/);
 assert.match(html,/#outfit-modal \.outfit-choice > span:last-child:not\(:first-child\)\{[^}]*line-height:1\.25!important/);
});
test('V5 HTML inline scripts still parse, with capture policy script loaded before the scene',()=>{
 assert.ok(html.indexOf('src="js/showcase-capture-policy.js?v=20261013-recapture"')>0);
 assert.ok(html.indexOf('src="js/showcase-capture-policy.js?v=20261013-recapture"')<
  html.indexOf('const completeWildCapture'));
 let count=0;
 for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){new Function(m[1]);count++}
 assert.ok(count>=50);
});
