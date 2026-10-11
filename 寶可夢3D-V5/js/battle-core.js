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
   const types=Array.isArray(card.types)&&card.types.length?card.types:[card.element||'一般'];
   return {id:card.id,name:card.name,element:card.element || '一般',types,weakness:card.weakness || '一般',
     hp,maxHp:hp,skills:[{name:normal.name,element:normal.element||'一般',damage:Math.max(1,Number(normal.damage)||15)},
     {name:special.name,element:special.element||card.element||'一般',damage:Math.max(1,Number(special.damage)||30),ability:special.ability||'none',chance:Number(special.chance)||0,fxVariant:special.fxVariant||'burst',fxSeed:special.fxSeed||0}],defending:false,specialWait:0,status:null};
 }
 function createBattle(config) {
   const {playerParty,opponentParty,catalog,openingSuit} = config || {};
   if (!Array.isArray(playerParty) || playerParty.length !== 3 || new Set(playerParty).size !== 3 ||
       !Array.isArray(opponentParty) || opponentParty.length !== 3) throw new Error('3v3 隊伍資料無效');
   const battle={teams:[playerParty.map(id=>toFighter(id,catalog)),opponentParty.map(id=>toFighter(id,catalog))],
     active:[0,0],turn:0,round:1,requiresSwitch:false,status:'playing',winner:null,reason:'',
     history:['3D 對戰開始！'],actions:0,nonce:0,
     openingSuit:['wigglytuff','blissey'].includes(openingSuit)?openingSuit:null,openingResolved:false};
   if(battle.openingSuit==='wigglytuff')battle.teams[1][0].status={type:'sleep',turns:1,source:'suit'};
   return battle;
 }
 const actor = (battle,side) => battle.teams[side][battle.active[side]];
 const alive = (battle,side) => battle.teams[side].some(f => f.hp > 0);
 function available(battle,side) {
   return battle.teams[side].map((f,i)=>({i,id:f.id,hp:f.hp})).filter(a=>a.hp>0 && a.i!==battle.active[side]);
 }
 // V5 uses move-versus-defender type effectiveness, NOT same-type attack bonuses.
 // One advantage always yields ×1.5, one resistance ×0.75. Dual-type targets
 // get only the strongest applicable match; defending halves the result.
 const TYPE_ADVANTAGES=Object.freeze({
   '一般':[],'火':['草','冰','蟲','鋼'],'水':['火','地面','岩石'],
   '草':['水','地面','岩石'],'電':['水','飛行'],
   '冰':['草','地面','飛行','龍'],'格鬥':['一般','冰','岩石','惡','鋼'],
   '毒':['草','妖精'],'地面':['火','電','毒','岩石','鋼'],
   '飛行':['草','格鬥','蟲'],'超能力':['格鬥','毒'],
   '蟲':['草','超能力','惡'],'岩石':['火','冰','飛行','蟲'],
   '幽靈':['超能力','幽靈'],'龍':['龍'],'惡':['超能力','幽靈'],
   '鋼':['冰','岩石','妖精'],'妖精':['格鬥','龍','惡']
 });
 function typeMatch(attackType,defender){
   const defendingTypes=Array.isArray(defender.types)&&defender.types.length
     ?defender.types:[defender.element||'一般'];
   if(defendingTypes.some(type=>TYPE_ADVANTAGES[attackType]?.includes(type)))return {effective:true,resisted:false,ratio:1.5};
   if(defendingTypes.some(type=>TYPE_ADVANTAGES[type]?.includes(attackType)))return {effective:false,resisted:true,ratio:.75};
   return {effective:false,resisted:false,ratio:1};
 }
 function damageDetails(attacker,defender,skill) {
   const element=skill.element||'一般';
   const match=typeMatch(element,defender);
   const defended=Boolean(defender.defending);
   const multiplier=match.ratio*(defended?.5:1);
   return {amount:Math.max(1,Math.round(skill.damage*multiplier)),element,
     effective:match.effective,resisted:match.resisted,defended,multiplier};
 }
 function damage(attacker,defender,skill){return damageDetails(attacker,defender,skill).amount;}
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
 function applyAction(battle,side,action,random=Math.random) {
   if (!battle || battle.status!=='playing'||battle.turn!==side || !action || typeof action.type!=='string')
     return {ok:false,reason:'目前不能操作',events:[]};
   if (battle.requiresSwitch && (side!==0 || action.type!=='switch'))
     return {ok:false,reason:'請先更換尚能戰鬥的夥伴',events:[]};
   const me=actor(battle,side),op=actor(battle,1-side),events=[];
   // Wigglytuff suit is a battle-wide opening spell: even a forced NPC replacement
   // cannot avoid the first-turn sleep. It applies once, never on round two.
   if(side===1 && battle.round===1 && battle.openingSuit==='wigglytuff' && !battle.openingResolved){
     battle.openingResolved=true;
     for(const member of battle.teams[1])if(member.status?.source==='suit')member.status=null;
     me.defending=false;
     if(me.specialWait>0)me.specialWait--;
     events.push({type:'statusSkip',side:1,id:me.id,status:'sleep',source:'wigglytuffSuit'});
     battle.history.push('💤 胖可丁套裝：NPC 首回合睡眠，無法行動！第二回合恢復正常。');
     battle.actions++;battle.nonce++;nextTurn(battle,side);
     battle.history=battle.history.slice(-8);
     return {ok:true,events,outcome:getOutcome(battle),needsSwitch:battle.requiresSwitch};
   }
   if(!['switch','defend','normal','special'].includes(action.type))return {ok:false,reason:'未知行動',events:[]};
   if(action.type==='special'&&me.specialWait>0)return {ok:false,reason:'特殊技能尚在冷卻',events:[]};
   if(action.type==='switch'&&!available(battle,side).some(f=>f.i===action.index))return {ok:false,reason:'無法選擇該夥伴',events:[]};
   // Status conditions trigger only when the affected fighter receives an action opportunity.
   // Forced replacement always takes priority over a condition on the fallen fighter.
   let skip=false;
   if(me.status && action.type!=='switch'){
     const effect=me.status.type;
     if(effect==='poison'){
       const loss=Math.max(1,Math.ceil(me.maxHp*.08));
       me.hp=Math.max(0,me.hp-loss);events.push({type:'statusTick',side,id:me.id,status:'poison',damage:loss});
     }else if(effect==='freeze'||effect==='sleep'){
       skip=true;events.push({type:'statusSkip',side,id:me.id,status:effect});
     }else if(effect==='paralysis'&&random()<.45){
       skip=true;events.push({type:'statusSkip',side,id:me.id,status:'paralysis'});
     }
     me.status.turns--;
     if(me.status.turns<=0)me.status=null;
     if(me.hp<=0){
       events.push({type:'faint',side,id:me.id});me.status=null;
       if(!alive(battle,side))finish(battle,1-side,'狀態傷害擊倒最後一隻寶可夢');
       else if(side===0)battle.requiresSwitch=true;
       else {const next=available(battle,1)[0];switchTo(battle,1,next.i);events.push({type:'switch',side:1,id:actor(battle,1).id});}
       battle.actions++;battle.nonce++;
       if(battle.status==='playing'&&!battle.requiresSwitch)nextTurn(battle,side);
       battle.history.push(me.name+' 因中毒而失去戰鬥能力。');
       battle.history=battle.history.slice(-8);
       return {ok:true,events,outcome:getOutcome(battle),needsSwitch:battle.requiresSwitch};
     }
     if(skip){
       me.defending=false;
       if(me.specialWait>0)me.specialWait--;
       battle.history.push(me.name+(effect==='freeze'?' 被冰凍，這回合無法行動。':effect==='sleep'?' 陷入睡眠，這回合無法行動。':' 麻痺發作，這回合無法行動。'));
       battle.actions++;battle.nonce++;nextTurn(battle,side);
       battle.history=battle.history.slice(-8);
       return {ok:true,events,outcome:getOutcome(battle),needsSwitch:battle.requiresSwitch};
     }
   }
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
     const detail=damageDetails(me,op,skill);
     const suitImmune=side===1 && battle.round===1 && battle.openingSuit==='blissey';
     const dealt=suitImmune?0:detail.amount;
     op.hp=max(op.hp-dealt,0,op.maxHp);
     op.defending=false;
     const messages=[detail.effective?'屬性剋制！':detail.resisted?'屬性抵抗！':'',detail.defended?'防禦減傷':''].filter(Boolean);
     battle.history.push(suitImmune?'🛡️ 幸福蛋套裝：NPC 首回合攻擊無效，傷害 0！':me.name+' 使用 '+skill.name+'，造成 '+dealt+' 點傷害'+(messages.length?'（'+messages.join('、')+'）':'')+'。');
     events.push({type:'attack',side,source:me.id,skill:skill.name,damage:dealt,special,target:op.id,element:detail.element,effective:detail.effective,resisted:detail.resisted,defended:detail.defended,immune:suitImmune,fxVariant:skill.fxVariant,fxSeed:skill.fxSeed});
     if(special){
       me.specialWait=3;
       const ability=skill.ability||'none';
       if(!suitImmune&&(ability==='poison'||ability==='freeze'||ability==='paralysis')&&op.hp>0&&!op.status&&random()<(skill.chance||0)){
         const turns=ability==='poison'?3:ability==='freeze'?1:2;
         op.status={type:ability,turns};
         events.push({type:'statusApply',side:1-side,id:op.id,status:ability});
         battle.history.push(op.name+' 陷入'+({poison:'中毒',freeze:'冰凍',paralysis:'麻痺'}[ability])+'狀態！');
       }else if(!suitImmune&&ability==='heal'){
         const restored=Math.min(me.maxHp-me.hp,Math.max(1,Math.ceil(dealt*.3)));
         if(restored>0){me.hp+=restored;events.push({type:'heal',side,id:me.id,amount:restored});}
       }else if(!suitImmune&&ability==='shield'){
         me.defending=true;events.push({type:'shield',side,id:me.id});
       }
     } // Current opportunity + two following own command opportunities.
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
 root.V5BattleCore={isCaught,validateParty,createBattle,applyAction,nextTurn,getOutcome,pickAIAction,forfeit,damage,damageDetails,typeMatch,TYPE_ADVANTAGES,available,actor};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.V5BattleCore;
})(typeof window!=='undefined'?window:globalThis);
