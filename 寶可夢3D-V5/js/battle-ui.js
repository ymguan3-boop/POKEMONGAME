/* The mobile battle HUD is separate from the 3D scene. */
(function(root){
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 class BattleUI {
  constructor(controller){this.controller=controller;this.dialog=null;this.layer=null;this.challenge=false;this.swapping=false;}
  make(className){
   const div=document.createElement('section');div.className=className;div.setAttribute('role','dialog');
   div.setAttribute('aria-modal','true');document.body.appendChild(div);
   for(const name of ['pointerdown','pointerup','touchstart','touchend','click','keyup']){
    div.addEventListener(name,e=>e.stopPropagation());
   }
   return div;
  }
  showParty(challenge=false){
   this.close();this.challenge=challenge;
   this.dialog=this.make('v5-battle-party');
   this.dialog.setAttribute('aria-label','寶可夢隊伍管理');
   this.dialog.addEventListener('click',e=>{
    const btn=e.target.closest('[data-action]');if(!btn)return;
    const action=btn.dataset.action,id=btn.dataset.id;
    if(action==='close')this.close();
    if(action==='toggle'){this.controller.toggleParty(id);this.renderParty();}
    if(action==='move'){this.controller.moveParty(Number(btn.dataset.index),Number(btn.dataset.delta));this.renderParty();}
    if(action==='start')this.controller.start();
    if(action==='save'){this.controller.persist();this.close();}
   });
   this.renderParty();
  }
  renderParty(){
   if(!this.dialog)return;
   const state=this.controller.state,available=root.V5BattleData.caught(state);
   const chosen=this.controller.party();
   const names=Object.fromEntries(root.V5BattleData.catalog().map(c=>[c.id,c.name]));
   let grid=available.map(c=>{
    const selected=chosen.includes(c.id),index=chosen.indexOf(c.id);
    return '<button type="button" class="v5-battle-pokemon '+(selected?'picked':'')+'" data-action="toggle" data-id="'+esc(c.id)+'" aria-pressed="'+selected+'">'+
      '<img src="'+esc(c.art||'cards/model-thumbs/'+c.id+'.webp')+'" alt="">'+
      '<span>'+esc(c.name)+'</span><small>'+(selected?'上場 '+(index+1)+'/3':'選擇')+'</small></button>';
   }).join('');
   if(!grid)grid='<p class="v5-battle-empty">尚未捕捉任何 V5 寶可夢。請先在真新鎮探索。</p>';
   this.dialog.innerHTML='<div class="v5-battle-party-panel"><header><h2>⚔️ 寶可夢隊伍</h2><button data-action="close" aria-label="關閉">✕</button></header>'+
     '<p>請選擇三隻<strong>已捕捉</strong>、不同種類的寶可夢，可用箭頭調整出場順序。'+(this.challenge?' NPC 難度：一般；每次勝利獲得 1 隻未捕捉、非道館寶可夢的出現機會。':'')+'</p>'+
     '<div class="v5-battle-selected">'+[0,1,2].map(i=>'<div>'+(chosen[i]?(i+1)+'. '+esc(names[chosen[i]])+'<div class="v5-battle-order"><button data-action="move" data-index="'+i+'" data-delta="-1" '+(i===0?'disabled':'')+' aria-label="上移">↑</button><button data-action="move" data-index="'+i+'" data-delta="1" '+(i===chosen.length-1?'disabled':'')+' aria-label="下移">↓</button></div>':'＋ 等待選擇')+'</div>').join('')+'</div>'+
     '<p class="v5-battle-notice" aria-live="polite">'+(chosen.length<3?'目前已選 '+chosen.length+'/3 隻，請先捕捉更多不同寶可夢。':'已選 3/3 隻，可以開始挑戰。')+'</p>'+
     '<div class="v5-battle-grid">'+grid+'</div><footer>'+
     '<button data-action="close">返回探索</button>'+
     (this.challenge?'<button class="primary" data-action="start" '+(chosen.length===3?'':'disabled')+'>進入 3D 擂台</button>':
      '<button class="primary" data-action="save">完成編隊</button>')+'</footer></div>';
  }
  loading(){
   if(this.dialog){this.dialog.remove();this.dialog=null;}
   this.layer=this.make('v5-battle-overlay');
   this.layer.innerHTML='<div class="v5-battle-loading" role="status"><strong>正在準備 3D 對戰…</strong><p>沿用已捕捉的寶可夢 3D 模型</p><button type="button" data-action="abort">返回探索</button></div>';
   this.events();
  }
  events(){
   this.layer.onclick=e=>{
    const b=e.target.closest('[data-action]');if(!b)return;
    const a=b.dataset.action;
    if(a==='abort')return this.controller.exit(true);
    if(a==='exit'){
      if(this.controller.session?.status==='playing'&&!window.confirm('確定放棄這場 3D 對戰並返回真新鎮嗎？'))return;
      return this.controller.exit();
    }
    if(a==='retry')return this.controller.retry();
    if(a==='normal'||a==='special'||a==='defend')return this.controller.action({type:a});
    if(a==='switch-menu'){this.swapping=!this.swapping;return this.renderBattle();}
    if(a==='switch'){
     this.swapping=false;return this.controller.action({type:'switch',index:Number(b.dataset.index)});
    }
   };
   this.layer.onkeydown=e=>{
    if(e.key==='Escape'){
     e.preventDefault();
     if(this.controller.session?.status==='finished')this.controller.exit();
     else if(window.confirm('確定離開本場 3D 對戰嗎？這場會記為放棄。'))this.controller.exit();
    }
   };
  }
  renderBattle(message=''){
   if(!this.layer||!this.controller.session)return;
   const session=this.controller.session,C=root.V5BattleCore;
   const me=C.actor(session,0),enemy=C.actor(session,1);
   const loading=this.controller.busy;
   const turn=session.turn===0&&!loading;
   const forced=session.requiresSwitch;
   const hp=f=>Math.max(0,Math.round(f.hp/f.maxHp*100));
   const statusLabel={poison:'☠️ 中毒',freeze:'❄️ 冰凍',paralysis:'⚡ 麻痺',sleep:'💤 睡眠'};
   const firstRound=session.round===1 && session.status==='playing';
   const openingMessage=session.openingSuit==='wigglytuff'
     ?'💤 胖可丁套裝：首回合讓對手睡眠，NPC 本回合不能行動。'
     :session.openingSuit==='blissey'
       ?'🛡️ 幸福蛋套裝：首回合所有 NPC 攻擊無效。'
       :'';
   const hpBox=(f,side)=>{
     const outfitLabel=firstRound&&side==='enemy'&&session.openingSuit==='wigglytuff'
        ?'💤 睡眠 · 第1回合'
        :firstRound&&side==='player'&&session.openingSuit==='blissey'?'🛡️ 首回合免疫':'';
     const currentStatus=f.status ? (statusLabel[f.status.type]||'異常狀態')+' '+f.status.turns+'回合' : '';
     const stateText=outfitLabel||currentStatus;
     return '<div class="v5-battle-hp '+side+'"><div><strong>'+esc(f.name)+'</strong><span>HP '+f.hp+'/'+f.maxHp+'</span></div><div class="v5-battle-track"><i style="width:'+hp(f)+'%"></i></div>'+(stateText?'<small class="v5-battle-condition">'+esc(stateText)+'</small>':'')+'</div>';
   };
   const states=side=>session.teams[side].map((f,i)=>'<span title="'+esc(f.name)+'" class="'+(f.hp>0?'alive':'faint')+'">'+(i===session.active[side]?'●':'○')+'</span>').join('');
   const canAct=turn&&!forced;
   const available=C.available(session,0);
   const choices=forced||this.swapping?'<div class="v5-battle-switch"><strong>'+(forced?'請選擇還能戰鬥的夥伴':'選擇替換上場的夥伴')+'</strong>'+
     available.map(f=>'<button data-action="switch" data-index="'+f.i+'" '+(turn?'':'disabled')+'>'+esc(session.teams[0][f.i].name)+'　HP '+f.hp+'</button>').join('')+
     (forced?'':'<button data-action="switch-menu">取消</button>')+'</div>':'';
   const end=session.status==='finished';
   const summary=end?'<div class="v5-battle-result"><h2>'+(session.winner===0?'🏆 對戰勝利！':session.winner===null?'平手':'對戰結束')+'</h2><p>'+esc(session.reason)+'</p>'+
     '<p>'+(session.winner===0?'離開擂台後將出現 1 隻未捕捉、非道館寶可夢；全部收齊後可指定展示角色。':'')+'</p><button data-action="retry">再挑戰</button><button data-action="exit">返回真新鎮</button></div>':'';
   this.layer.innerHTML=
     '<header class="v5-battle-top"><strong>⚔️ 真新鎮 3D 對戰擂台</strong><span>回合 '+session.round+'</span><button data-action="exit" aria-label="離開對戰">離開</button></header>'+
     hpBox(enemy,'enemy')+'<div class="v5-battle-teamdots npc">'+states(1)+'</div>'+
     hpBox(me,'player')+'<div class="v5-battle-teamdots player">'+states(0)+'</div>'+
     '<div class="v5-battle-bottom"><div class="v5-battle-message" aria-live="polite">'+esc(firstRound&&openingMessage?openingMessage:message||session.history[session.history.length-1]||'')+'</div>'+
     (end?'':choices+'<div class="v5-battle-actions">'+
       '<button data-action="normal" '+(canAct?'':'disabled')+'>⚔️ 普通攻擊<small>〔'+esc(me.skills[0].element)+'〕 '+esc(me.skills[0].name)+' · '+me.skills[0].damage+'</small></button>'+
       '<button data-action="special" '+(canAct&&me.specialWait===0?'':'disabled')+'>✨ 特殊技能<small>〔'+esc(me.skills[1].element)+'〕 '+esc(me.skills[1].name)+(me.skills[1].ability&&me.skills[1].ability!=='none'?' · '+({poison:'中毒',freeze:'冰凍1回合',paralysis:'麻痺',heal:'吸血回復',shield:'護盾'}[me.skills[1].ability]||''):'')+(me.specialWait?' · 冷卻 '+me.specialWait:'')+'</small></button>'+
       '<button data-action="defend" '+(canAct?'':'disabled')+'>🛡️ 防禦<small>減少下次傷害 50%</small></button>'+
       '<button data-action="switch-menu" '+(canAct&&!forced&&available.length?'':'disabled')+'>🔄 更換夥伴<small>剩餘 '+available.length+' 隻可換</small></button>'+
       '</div>')+'</div>'+summary;
  }
  error(message){
   if(this.layer){this.layer.innerHTML='<div class="v5-battle-loading"><h2>無法開始 3D 對戰</h2><p>'+esc(message)+'</p><button data-action="abort">返回探索</button></div>';return;}
   window.alert(message);
  }
  close(){
   this.dialog?.remove();this.dialog=null;
   this.layer?.remove();this.layer=null;
   this.swapping=false;
   if(!this.controller.active)this.controller.state.interactionOpen=false;
  }
 }
 root.V5BattleUI=BattleUI;
})(typeof window!=='undefined'?window:globalThis);
