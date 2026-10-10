/* Pure data adapters: V4 save maps survive, new world flags are monotonic. */
((global)=>{
 const KEY='pokemon3d_v5',LEGACY=['pokemon3d_pallet_v1','pokemon3d_sinnoh_summer_v16','pokemon3d_gen3_v4_winter'];
 const clone=x=>JSON.parse(JSON.stringify(x));const count=x=>Number.isFinite(Number(x))?Math.max(0,Math.floor(Number(x))):0;
 function migrate(input={}){const s=clone(input&&typeof input==='object'?input:{});s.schemaVersion=5;s.items={...(s.items||{})};for(const k of Object.keys(s.items))s.items[k]=count(s.items[k]);s.worldFlags={...(s.worldFlags||{})};s.worldFlags.raichuSpawnUnlocked=!!(s.worldFlags.raichuSpawnUnlocked||s.raichuSpawnUnlocked||s.items.thunderStone>0);s.npcRewards={...(s.npcRewards||{})};s.quests={...(s.quests||{})};for(const k of ['pokedexUnlocks','captureCounts','hasReachedLimit','gymRewardCaptured','specialPokemonCaptured','legendarySpawned','equip','gyms'])s[k]={...(s[k]||{})};s.equip.mewCompanion=!!(s.equip.mewCompanion||s.equip.charizardWings);return s;}
 function load(storage,primary=KEY){for(const key of [primary,...LEGACY]){try{const raw=storage.getItem(key);if(raw){const s=migrate(JSON.parse(raw));s.migratedFrom=key;return s;}}catch{}}return migrate();}
 function award(state,id,amount=1){amount=count(amount);if(!amount)return false;state.items=state.items||{};state.worldFlags=state.worldFlags||{};state.items[id]=count(state.items[id])+amount;if(id==='thunderStone')state.worldFlags.raichuSpawnUnlocked=true;return true;}
 function use(state,id){if(!state.items||count(state.items[id])<1)return false;state.items[id]--;return true;}
 function eligible(state,id){if(id==='raichu')return !!state.worldFlags?.raichuSpawnUnlocked;if(id==='pikachu')return !!state.gyms?.gym_1?.cleared;return true;}
 const quests=[{id:'oak-first-research',speaker:'oak',requires:s=>Object.values(s.pokedexUnlocks||{}).filter(Boolean).length>=5,item:'thunderStone',amount:1,title:'初次生態研究',text:'記錄 5 種寶可夢後，回來領取雷之石。'},{id:'jenny-patrol',speaker:'jenny',requires:s=>!!s.gyms?.gym_1?.cleared,item:'revive',amount:1,title:'守護真新鎮',text:'通過皮卡丘道館後，回警察局報到。'}];
 function rewardQuest(state,speaker){state.quests=state.quests||{};const q=quests.find(q=>q.speaker===speaker&&!state.quests[q.id]&&q.requires(state));if(!q)return null;award(state,q.item,q.amount);state.quests[q.id]=true;return{id:q.id,item:q.item,amount:q.amount};}
 global.V5Progress={KEY,LEGACY,migrate,load,award,use,eligible,quests,rewardQuest};if(typeof module!=='undefined')module.exports=global.V5Progress;
})(typeof window!=='undefined'?window:globalThis);
