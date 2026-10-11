/* Pure V5 save adapters: legacy progress survives, new quest gates are explicit. */
((global)=>{
 const KEY='pokemon3d_v5',LEGACY=['pokemon3d_pallet_v1','pokemon3d_sinnoh_summer_v16','pokemon3d_gen3_v4_winter'];
 const clone=x=>JSON.parse(JSON.stringify(x));
 const count=x=>Number.isFinite(Number(x))?Math.max(0,Math.floor(Number(x))):0;
 function migrate(input={}){
  const s=clone(input&&typeof input==='object'?input:{});
  s.schemaVersion=5;s.items={...(s.items||{})};
  for(const k of Object.keys(s.items))s.items[k]=count(s.items[k]);
  s.worldFlags={...(s.worldFlags||{})};s.npcRewards={...(s.npcRewards||{})};s.quests={...(s.quests||{})};
  for(const k of ['pokedexUnlocks','captureCounts','hasReachedLimit','gymRewardCaptured','specialPokemonCaptured','legendarySpawned','equip','gyms'])s[k]={...(s[k]||{})};
  // A legacy Thunder Stone is retained as an item, but does not auto-unlock Raichu.
  s.worldFlags.raichuSpawnUnlocked=!!s.quests['oak-raichu-study']&&count(s.captureCounts.pikachu)>=1;
  s.equip.mewCompanion=!!(s.equip.mewCompanion||s.equip.charizardWings);
  s.battle3d=normalizeBattle(s.battle3d,s);
  return s;
 }
 function normalizeBattle(input={},saved={}){
  const b=input&&typeof input==='object'?input:{};
  const positive=count;
  const legacyUnlocked=positive(saved.cardWins)>0||!!saved.worldFlags?.mewtwoAwaiting||
    !!saved.worldFlags?.jigglypuffAwaiting||!!saved.specialPokemonCaptured?.mewtwo||
    !!saved.specialPokemonCaptured?.jigglypuff||positive(saved.captureCounts?.mewtwo)>0||
    positive(saved.captureCounts?.jigglypuff)>0;
  const previous=b.stats&&typeof b.stats==='object'?b.stats:{};
  const rewards=b.rewards&&typeof b.rewards==='object'?b.rewards:{};
  const encounters=Array.isArray(b.pendingEncounters)?b.pendingEncounters.filter(x=>x&&
    typeof x.id==='string'&&x.id.length<60&&Number.isSafeInteger(x.token)&&x.token>0).slice(0,100):[];
  return {version:1,
   party:Array.isArray(b.party)?[...new Set(b.party.filter(id=>typeof id==='string'))].slice(0,3):[],
   leader:typeof b.leader==='string'?b.leader:null,
   stats:{wins:positive(previous.wins),losses:positive(previous.losses),draws:positive(previous.draws),forfeits:positive(previous.forfeits)},
   rewards:{specialDuoUnlocked:!!rewards.specialDuoUnlocked||legacyUnlocked},
   pendingWins:Math.min(100,positive(b.pendingWins)),
   pendingEncounters:encounters,
   rewardSerial:Math.max(positive(b.rewardSerial),...encounters.map(e=>e.token),0),
   showcaseSpecies:typeof b.showcaseSpecies==='string'?b.showcaseSpecies:null};
 }
 function load(storage,primary=KEY){for(const key of [primary,...LEGACY]){try{const raw=storage.getItem(key);if(raw){const s=migrate(JSON.parse(raw));s.migratedFrom=key;return s;}}catch{}}return migrate();}
 function award(state,id,amount=1){amount=count(amount);if(!amount)return false;state.items=state.items||{};state.worldFlags=state.worldFlags||{};state.items[id]=count(state.items[id])+amount;return true;}
 function use(state,id){if(!state.items||count(state.items[id])<1)return false;state.items[id]--;return true;}
 function eligible(state,id){
  if(id==='raichu')return count(state.captureCounts?.pikachu)>=1&&
    !!state.quests?.['oak-raichu-study']&&!!state.worldFlags?.raichuSpawnUnlocked;
  if(id==='pikachu')return !!state.gyms?.gym_1?.cleared;
  return true;
 }
 function oakRaichu(state){
  if(count(state.captureCounts?.pikachu)<1)return {status:'need-pikachu'};
  state.quests=state.quests||{};state.worldFlags=state.worldFlags||{};
  if(state.quests['oak-raichu-study']){
   state.worldFlags.raichuSpawnUnlocked=true;
   return {status:'already-unlocked'};
  }
  state.quests['oak-raichu-study']=true;
  state.worldFlags.raichuSpawnUnlocked=true;
  return {status:'unlocked'};
 }
 const quests=[
  {id:'jenny-patrol',speaker:'jenny',requires:s=>!!s.gyms?.gym_1?.cleared,item:'revive',amount:1,title:'守護真新鎮',text:'通過皮卡丘道館後，回警察局報到。'}
 ];
 function rewardQuest(state,speaker){state.quests=state.quests||{};const q=quests.find(q=>q.speaker===speaker&&!state.quests[q.id]&&q.requires(state));if(!q)return null;award(state,q.item,q.amount);state.quests[q.id]=true;return{id:q.id,item:q.item,amount:q.amount};}
 global.V5Progress={KEY,LEGACY,migrate,load,normalizeBattle,award,use,eligible,oakRaichu,quests,rewardQuest};
 if(typeof module!=='undefined')module.exports=global.V5Progress;
})(typeof window!=='undefined'?window:globalThis);
