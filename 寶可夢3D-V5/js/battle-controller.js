/* V5 3D battle coordinator: preserves the open world and its legacy progress. */
(function(root){
 'use strict';
 const defaultBattle=()=>({version:1,party:[],leader:null,
  stats:{wins:0,losses:0,draws:0,forfeits:0},rewards:{specialDuoUnlocked:false}});
 class BattleController{
  constructor(context){
   this.ctx=context;this.state=context.state;
   this.state.battle3d=this.state.battle3d || defaultBattle();
   this.ui=new root.V5BattleUI(this);this.session=null;this.arena=null;
   this.busy=false;this.active=false;this.sequence=0;this.recorded=false;
   this.snapshot=null;this.rewardAfterExit=false;this.loading=false;
  }
  data(){
   const state=this.state;
   if(!state.battle3d||typeof state.battle3d!=='object')state.battle3d=defaultBattle();
   const d=state.battle3d;
   if(!d.stats)d.stats=defaultBattle().stats;
   if(!d.rewards)d.rewards=defaultBattle().rewards;
   if(!Array.isArray(d.party))d.party=[];
   return d;
  }
  party(){return root.V5BattleData.normalizeParty(this.data().party,this.state);}
  toggleParty(id){
   if(this.active||!root.V5BattleCore.isCaught(id,this.state,root.V5BattleData.catalog()))return;
   const party=this.party();
   if(party.includes(id))party.splice(party.indexOf(id),1);
   else if(party.length<3)party.push(id);
   this.data().party=party;this.data().leader=party[0]||null;this.persist();
  }
  moveParty(index,direction){
   if(this.active)return;
   const party=this.party(),next=index+direction;
   if(!Number.isInteger(index)||next<0||next>=party.length)return;
   [party[index],party[next]]=[party[next],party[index]];
   this.data().party=party;this.data().leader=party[0]||null;this.persist();
  }
  persist(){this.ctx.save();}
  openTeam(challenge=false){
   if(this.active)return false;
   this.ui.showParty(challenge);
   this.state.interactionOpen=true;return true;
  }
  isInBattle(){return this.active;}
  frame(delta){
   if(!this.active)return;
   if(this.arena){this.arena.frame(delta);this.arena.render(this.ctx.renderer);}
  }
  async start(){
   if(this.active)return false;
   const allowed=root.V5BattleCore.validateParty(this.party(),this.state,root.V5BattleData.catalog());
   if(!allowed.ok){this.ui.renderParty();return false;}
   const id=++this.sequence;
   this.active=true;this.loading=true;this.busy=true;this.recorded=false;
   this.rewardAfterExit=false;this.session=null;
   const player=this.ctx.player,camera=this.ctx.camera;
   this.snapshot={mode:this.state.currentMode,position:player.position.clone(),camAngle:this.state.camAngle,
     cameraPosition:camera.position.clone(),cameraQuaternion:camera.quaternion.clone(),isCharging:this.state.isCharging,
     autoNavigateCenter:this.state.autoNavigateCenter};
   this.state.isCharging=false;this.state.autoNavigateCenter=false;
   this.state.currentMode='battle3d';
   this.state.interactionOpen=true;
   document.body.classList.add('v5-battle-active');
   this.ui.loading();
   try{
    this.session=root.V5BattleCore.createBattle({playerParty:allowed.party,
      opponentParty:root.V5BattleData.npcParty(),catalog:root.V5BattleData.catalog()});
    this.arena=new root.V5BattleArena();
    await this.arena.showBoth(root.V5BattleCore.actor(this.session,0).id,root.V5BattleCore.actor(this.session,1).id);
    if(id!==this.sequence||!this.active)return false;
    this.loading=false;this.busy=false;this.persist();
    this.ui.renderBattle('訓練家挑戰開始，請選擇招式！');
    return true;
   }catch(error){
    console.error('[v5-battle] start failed',error);
    if(id===this.sequence&&this.active){this.loading=false;this.busy=false;this.ui.error('部分寶可夢 3D 模型載入失敗：'+(error.message||'無法開始'));}
    return false;
   }
  }
  async runEvents(events,token){
   for(const event of events){
    if(token!==this.sequence||!this.active)return false;
    if(event.type==='switch'){
     const fighter=root.V5BattleCore.actor(this.session,event.side);
     await this.arena.setFighter(event.side,fighter.id);
    }else await this.arena.play(event);
   }
   return token===this.sequence&&this.active;
  }
  async action(input){
   const s=this.session,C=root.V5BattleCore;
   if(!this.active||this.loading||this.busy||!s||s.status!=='playing'||s.turn!==0)return false;
   const result=C.applyAction(s,0,input);
   if(!result.ok){this.ui.renderBattle(result.reason);return false;}
   const token=this.sequence;
   this.busy=true;this.ui.renderBattle();
   try{
    if(!await this.runEvents(result.events,token))return false;
    if(result.forced){this.busy=false;this.ui.renderBattle('已更換夥伴，可以選擇本回合招式。');return true;}
    if(s.status==='playing'&&s.turn===1){
     // Keep background tabs paused; do not resolve extra turns while hidden.
     while(document.hidden&&this.active&&token===this.sequence)await new Promise(r=>setTimeout(r,250));
     if(token!==this.sequence||!this.active)return false;
     await new Promise(r=>setTimeout(r,300));
     if(token!==this.sequence||!this.active)return false;
     const enemy=C.applyAction(s,1,C.pickAIAction(s));
     if(enemy.ok)await this.runEvents(enemy.events,token);
    }
    if(token!==this.sequence||!this.active)return false;
    if(s.status==='finished')this.recordOutcome();
    this.busy=false;this.ui.renderBattle();
    return true;
   }catch(error){
    console.error('[v5-battle] action failed:',error);
    this.ui.error('戰鬥動畫或模型發生錯誤，請返回探索以保護進度。');
    this.busy=false;return false;
   }
  }
  recordOutcome(forfeited=false){
   if(this.recorded||!this.session)return;
   const d=this.data(),out=root.V5BattleCore.getOutcome(this.session);
   if(!out.finished)return;
   this.recorded=true;
   if(forfeited){d.stats.forfeits=(d.stats.forfeits||0)+1;d.stats.losses=(d.stats.losses||0)+1;}
   else if(out.winner===0){
    d.stats.wins=(d.stats.wins||0)+1;
    if(!d.rewards.specialDuoUnlocked){
     d.rewards.specialDuoUnlocked=true;this.rewardAfterExit=true;
     this.state.worldFlags.mewtwoAwaiting=!this.state.specialPokemonCaptured.mewtwo;
     this.state.worldFlags.jigglypuffAwaiting=!this.state.specialPokemonCaptured.jigglypuff;
    }
   }else if(out.winner===null)d.stats.draws=(d.stats.draws||0)+1;
   else d.stats.losses=(d.stats.losses||0)+1;
   this.persist();
  }
  retry(){
   if(!this.session||this.session.status!=='finished')return;
   this.exit(true);this.openTeam(true);
  }
  exit(cancelled=false){
   if(!this.active){this.ui.close();return;}
   ++this.sequence;
   const inProgress=this.session?.status==='playing';
   // Count a completed victory even if the user closes the result during its final animation.
   if(this.session?.status==='finished'&&!this.recorded)this.recordOutcome();
   if(inProgress&&!cancelled){
    root.V5BattleCore.forfeit(this.session);
    this.recordOutcome(true);
   }
   const snapshot=this.snapshot,shouldReward=this.rewardAfterExit;
   this.active=false;this.loading=false;this.busy=false;this.session=null;
   try{this.arena?.dispose();}catch(error){console.warn('[v5-battle] arena disposal',error);}
   this.arena=null;this.ui.close();
   document.body.classList.remove('v5-battle-active');
   if(snapshot){
    this.state.currentMode=snapshot.mode;
    this.ctx.player.position.copy(snapshot.position);
    this.state.camAngle=snapshot.camAngle;
    this.ctx.camera.position.copy(snapshot.cameraPosition);
    this.ctx.camera.quaternion.copy(snapshot.cameraQuaternion);
    this.state.isCharging=false;
    this.state.autoNavigateCenter=false;
   }else this.state.currentMode='world';
   this.state.interactionOpen=false;this.snapshot=null;this.rewardAfterExit=false;
   if(shouldReward&&this.ctx.onFirstWin){
    try{this.ctx.onFirstWin();}catch(error){console.error('[v5-battle] reward spawn deferred',error);}
    this.persist();
   }
  }
 }
 root.V5BattleController=BattleController;
})(typeof window!=='undefined'?window:globalThis);
