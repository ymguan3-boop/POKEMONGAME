/* V5 world capture filtering for trainer-selected collectible showcase encounters.
   Captured special species normally disappear, but player-selected showcases must remain catchable. */
(function(root){
 'use strict';
 function shouldPurgeCaughtSpecial(pokemon,isSpecialPokemonType,hasCapturedSpecialPokemon){
  return Boolean(pokemon&&!pokemon.isShowcase&&
   isSpecialPokemonType(pokemon.type)&&hasCapturedSpecialPokemon(pokemon.type));
 }
 function isWildCaptureTargetReady(pokemon){
  return Boolean(pokemon&&!pokemon.isNPC&&!pokemon.isCaptured&&!pokemon.captureCommitted&&
   pokemon.isCatchable!==false&&pokemon.isTargetable!==false&&pokemon.isBattleTarget!==false&&
   pokemon.mesh&&pokemon.mesh.parent&&pokemon.mesh.visible!==false);
 }
 const policy=Object.freeze({shouldPurgeCaughtSpecial,isWildCaptureTargetReady});
 root.V5ShowcaseCapture=policy;
 if(typeof module!=='undefined'&&module.exports)module.exports=policy;
})(typeof window!=='undefined'?window:globalThis);
