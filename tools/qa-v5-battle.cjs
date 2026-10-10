/* Launch local server first: node tools/serve-v5.cjs */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
let playwright;
try{playwright=require('playwright');}
catch(error){
 const local=process.env.V5_PLAYWRIGHT_MODULE;
 if(!local)throw Error('Playwright unavailable; set V5_PLAYWRIGHT_MODULE to installed playwright path. '+error.message);
 playwright=require(local);
}
const out=path.resolve(__dirname,'../寶可夢3D-V5/qa');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await playwright.chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
 const checks=[],errors=[];
 try{
  for(const [width,height] of [[360,640],[390,844],[430,932]]){
   const context=await browser.newContext({viewport:{width,height},isMobile:true,hasTouch:true,deviceScaleFactor:1});
   const page=await context.newPage();
   page.on('pageerror',e=>errors.push(String(e)));
   await page.goto('http://127.0.0.1:4179/?qa=1');
   await page.waitForFunction(()=>window.V5Battle&&document.body.dataset.runtimeReady==='true',{timeout:30000});
   const selection=await page.evaluate(()=>{
    const b=window.V5Battle;
    const roster=['bulbasaur','charmander','squirtle'];
    b.state.captureCounts={...b.state.captureCounts,bulbasaur:0,charmander:0,squirtle:0};
    b.state.pokedexUnlocks={...b.state.pokedexUnlocks,bulbasaur:false,charmander:false,squirtle:false};
    b.state.cardCollection={...b.state.cardCollection,bulbasaur:99,charmander:99,squirtle:99};
    b.openTeam();
    const unlockByCard=!!b.ui.dialog.querySelector('[data-id="bulbasaur"]');
    roster.forEach(id=>{b.state.captureCounts[id]=1;});
    b.ui.renderParty();
    return {unlockByCard,available:b.ui.dialog.querySelectorAll('.v5-battle-pokemon').length};
   });
   assert.equal(selection.unlockByCard,false,'No free-card combatants');
   assert.ok(selection.available>=3);
   for(const id of ['bulbasaur','charmander','squirtle'])
    await page.locator('.v5-battle-party [data-action=toggle][data-id='+id+']').click();
   assert.equal(await page.evaluate(()=>window.V5Battle.party().length),3);
   await page.locator('[data-action=save]').click();
   await page.evaluate(()=>window.V5Battle.openTeam(true));
   await page.locator('[data-action=start]').click();
   await page.waitForFunction(()=>window.V5Battle?.session && !window.V5Battle.busy,{timeout:30000});
   const arena=await page.evaluate(()=>{
    const b=window.V5Battle;
    return {models:b.arena.fighters.map(x=>x?.id),mode:b.state.currentMode,
      canvasCount:document.querySelectorAll('canvas').length,
      actionButtons:[...document.querySelectorAll('.v5-battle-actions button')].map(x=>x.getBoundingClientRect().height),
      scrollWidth:document.documentElement.scrollWidth};
   });
   assert.deepEqual(arena.models,['bulbasaur','chikorita']);
   assert.equal(arena.mode,'battle3d');assert.equal(arena.scrollWidth,width);
   assert.ok(arena.actionButtons.length===4 && arena.actionButtons.every(x=>x>=48));
   await page.screenshot({path:path.join(out,'turn-battle-'+width+'x'+height+'.png')});
   await page.locator('.v5-battle-actions [data-action=normal]').click();
   await page.waitForFunction(()=>!window.V5Battle.busy,{timeout:30000});
   const round=await page.evaluate(()=>window.V5Battle.session.round);
   assert.ok(round>=2,'player+NPC turn progressed');
   await page.evaluate(()=>window.V5Battle.exit(true));
   assert.equal(await page.evaluate(()=>window.V5Battle.state.currentMode),'world');
   assert.equal(await page.evaluate(()=>document.body.classList.contains('v5-battle-active')),false);
   checks.push({viewport:width+'x'+height,selection,arena,round,worldRestored:true});
   await context.close();
  }
  assert.deepEqual(errors,[],'no browser runtime exceptions');
  const report={status:'PASS',note:'Chromium mobile emulation only, not physical Android/iPhone FPS testing',checks,errors};
  fs.writeFileSync(path.join(out,'turn-battle-qa.json'),JSON.stringify(report,null,2));
  console.log('PASS: battle QA on 3 portrait viewports');
 }finally{await browser.close();}
})().catch(error=>{console.error('FAIL: V5 battle QA',error);process.exitCode=1;});
