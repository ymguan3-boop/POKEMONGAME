/* V5 3D opponents are drawn from the same non-gym collection as victory encounters. */
(function(root){
 'use strict';
 function catalog(){return root.V5CardCatalog||[]}
 function caught(save){return catalog().filter(c=>root.V5BattleCore.isCaught(c.id,save,catalog()))}
 const shuffle=(items,random)=>{
  const arr=items.slice();for(let i=arr.length-1;i>0;i--){const r=Number(random());const n=Number.isFinite(r)?Math.max(0,Math.min(1-Number.EPSILON,r)):0;const j=Math.floor(n*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;
 };
 function npcParty(save={},random=Math.random){
  const entries=catalog(),validIds=new Set(entries.map(c=>c.id));
  const dex=root.PalletRoster?.dex||Object.fromEntries(entries.map(c=>[c.id,c]));
  const gyms=root.PalletRoster?.bosses||[];
  const roster=root.V5VictoryRewards.roster(dex,gyms,validIds);
  const eligible=id=>!root.V5Progress?.eligible||root.V5Progress.eligible(save,id);
  const options=roster.filter(eligible);
  const remaining=options.filter(id=>!root.V5VictoryRewards.caught(save,id));
  const target=remaining.length?shuffle(remaining,random)[0]:null;
  const picked=[];
  if(target)picked.push(target);
  for(const id of shuffle(remaining.filter(id=>id!==target),random)){if(picked.length>=3)break;picked.push(id);}
  for(const id of shuffle(options.filter(id=>!picked.includes(id)),random)){if(picked.length>=3)break;picked.push(id);}
  if(picked.length<3)throw new Error('NPC 的三隻 V5 模型尚未準備完成');
  const party=picked.slice(0,3);
  // This chosen foe is the preferred post-win encounter; never award unrelated species.
  party.rewardId=target;
  return party;
 }
 function normalizeParty(party,save){
  const chosen=[];
  for(const id of Array.isArray(party)?party:[]){
   if(chosen.length>=3)break;
   if(!chosen.includes(id)&&root.V5BattleCore.isCaught(id,save,catalog()))chosen.push(id);
  }
  return chosen;
 }
 root.V5BattleData={catalog,caught,npcParty,normalizeParty};
 if(typeof module!=='undefined')module.exports=root.V5BattleData;
})(typeof window!=='undefined'?window:globalThis);
