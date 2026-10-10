/* V5 3v3 turn battle. Pure logic: no browser or Three.js dependencies. */
(function (root) {
 'use strict';
 const max = (n, minimum, maximum) => Math.min(maximum, Math.max(minimum, n));
 const safeCount = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
 function isCaught(id, save, catalog) {
   if (!catalog.some(card => card.id === id)) return false;
   return Boolean(safeCount(save && save.captureCounts && save.captureCounts[id]) > 0
      || (save && save.pokedexUnlocks && save.pokedexUnlocks[id] === true)
      || (save && save.specialPokemonCaptured && save.specialPokemonCaptured[id] === true)
      || (save && save.gymRewardCaptured && save.gymRewardCaptured[id] === true));
 }
 function validateParty(ids, save, catalog) {
   const distinct = Array.isArray(ids) ? [...new Set(ids)] : [];
   const valid = distinct.filter(id => isCaught(id, save, catalog)).slice(0, 3);
   return {ok: Array.isArray(ids) && ids.length === 3 && distinct.length === 3 && valid.length === 3,
       party: valid, message: valid.length < 3 ? '目前已選 ' + valid.length + '/3 隻，請先捕捉更多不同寶可夢。' : '請選擇三隻不同且已捕捉的寶可夢。'};
 }
 function toFighter(id, catalog) {
   const card = catalog.find(c => c.id === id);
   if (!card) throw new Error('未知的 V5 物種：' + id);
   const normal = card.skills && card.skills[0] || {name:'普通攻擊',damage:Math.max(10,Math.round(card.damage / 2))};
   const special = card.skills && card.skills[1] || {name:card.attack || '特殊技能',damage:card.damage || 35};
   const hp = Math.max(1,Number(card.hp)||70);
   return {id:card.id,name:card.name,element:card.element || '一般',weakness:card.weakness || '一般',
     hp,maxHp:hp,skills:[{name:normal.name,damage:Math.max(1,Number(normal.damage)||15)},
     {name:special.name,damage:Math.max(1,Number(special.damage)||30)}],defending:false,specialWait:0};
 }
 function createBattle(config) {
   const {playerParty,opponentParty,catalog} = config || {};
   if (!Array.isArray(playerParty) || playerParty.length !== 3 || new Set(playerParty).size !== 3 ||
       !Array.isArray(opponentParty) || opponentParty.length !== 3) throw new Error('3v3 隊伍資料無效');
   return {teams:[playerParty.map(id=>toFighter(id,catalog)),opponentParty.map(id=>toFighter(id,catalog))],
     active:[0,0],turn:0,round:1,requiresSwitch:false,status:'playing',winner:null,reason:'',
     history:['3D 對戰開始！'],actions:0,nonce:0};
 }
 const actor = (battle,side) => battle.teams[side][battle.active[side]];
 const alive = (battle,side) => battle.teams[side].some(f => f.hp > 0);
 function available(battle,side) {
   return battle.teams[side].map((f,i)=>({i,id:f.id,hp:f.hp})).filter(a=>a.hp>0 && a.i!==battle.active[side]);
 }
 function damage(attacker,defender,skill) {
   const multiplier = attacker.element === defender.weakness ? 1.5 : 1;
   return Math.max(1,Math.round(skill.damage * multiplier * (defender.defending ? .5 : 1)));
 }
 function getOutcome(battle) {
   return {finished:battle.status==='finished',winner:battle.winner,reason:battle.reason};
 }
 function finish(battle,winner,reason) {
   battle.status='finished';battle.winner=winner;battle.reason=reason;
   battle.history.push(winner===null?'雙方平手':(winner===0?'你獲得勝利！':'NPC 獲得勝利！'));
 }
 function switchTo(battle,side,index) {
   if (!Number.isInteger(index)||!available(battle,side).some(f=>f.i===index)) return false;
   actor(battle,side).defending=false;
   battle.active[side]=index;
   battle.history.push((side===0?'我方 ':'NPC ')+actor(battle,side).name+' 上場！');
   return true;
 }
 function nextTurn(battle,side) {
   if (battle.status==='finished') return;
   battle.turn=1-side;
   if (side===1) {
     battle.round++;
     if (battle.round>40) {
       const ratio = team=>team.reduce((sum,f)=>sum + f.hp/f.maxHp,0);
       const diff=ratio(battle.teams[0])-ratio(battle.teams[1]);
       finish(battle,diff===0?null:diff>0?0:1,'40 回合結算');
     }
   }
 }
 function applyAction(battle,side,action) {
   if (!battle || battle.status!=='playing'||battle.turn!==side || !action || typeof action.type!=='string')
     return {ok:false,reason:'目前不能操作',events:[]};
   if (battle.requiresSwitch && (side!==0 || action.type!=='switch'))
     return {ok:false,reason:'請先更換尚能戰鬥的夥伴',events:[]};
   const me=actor(battle,side),op=actor(battle,1-side),events=[];
   if (action.type==='switch') {
     if (!switchTo(battle,side,action.index)) return {ok:false,reason:'無法選擇該夥伴',events:[]};
     events.push({type:'switch',side,id:actor(battle,side).id});
     if (battle.requiresSwitch) {battle.requiresSwitch=false;return {ok:true,events,forced:true};}
   } else if (action.type==='defend') {
     me.defending=true;
     battle.history.push(me.name+' 採取防禦姿勢。');
     events.push({type:'defend',side});
   } else if (action.type==='normal'||action.type==='special') {
     const special=action.type==='special';
     if (special && me.specialWait>0) return {ok:false,reason:'特殊技能尚在冷卻',events:[]};
     const skill=me.skills[special?1:0];
     const dealt=damage(me,op,skill);
     op.hp=max(op.hp-dealt,0,op.maxHp);
     const guarded=op.defending;op.defending=false;
     battle.history.push(me.name+' 使用 '+skill.name+'，造成 '+dealt+' 點傷害'+(guarded?'（防禦減傷）':'')+'。');
     events.push({type:'attack',side,skill:skill.name,damage:dealt,special,target:op.id});
     if (special) me.specialWait=3; // Current opportunity + two following own command opportunities.
     if (op.hp===0) {
       events.push({type:'faint',side:1-side,id:op.id});
       if (!alive(battle,1-side)) finish(battle,side,'對手全部三隻失去戰鬥能力');
       else if (side===0) {
         const next=available(battle,1)[0].i;
         switchTo(battle,1,next);events.push({type:'switch',side:1,id:actor(battle,1).id});
       } else battle.requiresSwitch=true;
     }
   } else return {ok:false,reason:'未知行動',events:[]};
   // Cooldowns tick at the end of that fighter's own opportunity.
   if (action.type!=='switch' || !battle.requiresSwitch) {
     const acting = action.type==='switch'?actor(battle,side):me;
     if (acting.specialWait>0) acting.specialWait--;
   }
   battle.actions++;battle.nonce++;
   if (battle.status==='playing') nextTurn(battle,side);
   battle.history=battle.history.slice(-8);
   return {ok:true,events,outcome:getOutcome(battle),needsSwitch:battle.requiresSwitch};
 }
 function pickAIAction(battle) {
   const me=actor(battle,1),target=actor(battle,0),reserve=available(battle,1);
   if(me.hp<me.maxHp*.3&&reserve.length){
     // Defensive switching is a deliberate AI turn, not a free replacement.
     const healthier=reserve.find(p=>battle.teams[1][p.i].hp>me.hp*2);
     if(healthier)return {type:'switch',index:healthier.i};
   }
   if(me.hp<me.maxHp*.5&&battle.round%4===0)return {type:'defend'};
   const options=[{type:'normal',d:damage(me,target,me.skills[0])}];
   if(me.specialWait===0)options.push({type:'special',d:damage(me,target,me.skills[1])});
   options.sort((a,b)=>b.d-a.d);
   return {type:options[0].type};
 }
 function forfeit(battle) {if(battle.status==='playing')finish(battle,1,'玩家放棄對戰');return getOutcome(battle)}
 root.V5BattleCore={isCaught,validateParty,createBattle,applyAction,nextTurn,getOutcome,pickAIAction,forfeit,damage,available,actor};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.V5BattleCore;
})(typeof window!=='undefined'?window:globalThis);
