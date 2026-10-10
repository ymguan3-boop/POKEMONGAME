/* Test controls are exposed only on the explicitly requested local QA route. */
if(new URLSearchParams(location.search).get('qa')==='1' && ['localhost','127.0.0.1'].includes(location.hostname)){
 window.PalletQA={
  get state(){return gameState;},get scene(){return scene;},get player(){return player;},get camera(){return camera;},get renderer(){return renderer;},get companion(){return mewCompanionGroup;},
  asset:getGLBAsset,clone:cloneRuntimeGLBScene,enter:enterGym,exit:exitGym,save:saveGameData,
  setSuit(s){if(!isSuitUnlocked(s))throw Error('locked suit');gameState.equip.activeSuit=s;updateOutfitUI();updateInventoryUI();saveGameData();},
  snapshot(){return {mode:gameState.currentMode,position:player.position.toArray(),roster:Object.keys(POKEDEX_DATA),base:BASE_SPAWN_TYPES,legends:LEGENDARY_TYPES,special:SPECIAL_POKEMON_TYPES,active:gameState.pokemons.map(p=>p.type),suit:gameState.equip.activeSuit,companion:!!mewCompanionGroup?.visible,trainerVisible:playerModel.visible,fps:gameState.performanceFps,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};},
  showCapture:showCapturedPokedexEntry,closeCapture:closeCapturedPokedexEntry,capture:completeWildCapture,
  spawn(t,x=0,z=18){const p=new Pokemon(t,x,z);scene.add(p.mesh);gameState.pokemons.push(p);return p;},
  refresh(){updatePokedexUI();updateInventoryUI();},nextSpawn:getNextSpawnType,legendCheck:checkLegendarySpawns,initSpawns,
  navigate:toggleAutoNavigation,lock:handleLock,berry:useBerry,
 };
}
