/* V5 3D battle uses the verified model/catalog registry, never starter card ownership. */
(function(root){
 'use strict';
 function catalog(){return root.V5CardCatalog || []}
 function caught(save){return catalog().filter(c=>root.V5BattleCore.isCaught(c.id,save,catalog()))}
 function npcParty(){
  const entries=catalog(), ids=['chikorita','cyndaquil','totodile'];
  const found=ids.filter(id=>entries.some(c=>c.id===id));
  if(found.length!==3)throw new Error('NPC 的三隻 V5 模型尚未準備完成');
  return found;
 }
 function normalizeParty(party,save) {
  const chosen=[];
  for(const id of Array.isArray(party)?party:[]){
   if(chosen.length>=3)break;
   if(!chosen.includes(id)&&root.V5BattleCore.isCaught(id,save,catalog()))chosen.push(id);
  }
  return chosen;
 }
 root.V5BattleData={catalog,caught,npcParty,normalizeParty};
})(typeof window!=='undefined'?window:globalThis);
