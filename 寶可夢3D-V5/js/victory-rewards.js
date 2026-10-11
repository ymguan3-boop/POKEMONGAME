/* V5 trainer-victory encounter policy. Pure rules for safe use in the world adapter. */
(function(root){
 'use strict';
 const caught=(state,id)=>Number(state?.captureCounts?.[id])>0||
   state?.pokedexUnlocks?.[id]===true||state?.specialPokemonCaptured?.[id]===true;
 function roster(dex={},gymBossIds=[],available=null){
  const bosses=new Set(gymBossIds);
  return Object.keys(dex).filter(id=>!bosses.has(id)&&(!available||available.has(id)));
 }
 function status(state,ids=[],isEligible=()=>true){
  const remaining=ids.filter(id=>!caught(state,id));
  return {allCollected:remaining.length===0,remaining,
   eligible:remaining.filter(id=>isEligible(id)),
   locked:remaining.filter(id=>!isEligible(id))};
 }
 function choose(ids=[],random=Math.random){
  if(!ids.length)return null;
  const n=Number(random());
  const index=Math.min(ids.length-1,Math.floor((Number.isFinite(n)?Math.max(0,n):0)*ids.length));
  return ids[index];
 }
 function awardType(state,ids,eligible,pending=[],present=[],random=Math.random){
  const result=status(state,ids,eligible),occupied=new Set([...pending,...present]);
  const candidates=result.eligible.filter(id=>!occupied.has(id));
  return { ...result, id:choose(candidates.length?candidates:result.eligible,random) };
 }
 const api=Object.freeze({caught,roster,status,choose,awardType});
 root.V5VictoryRewards=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
