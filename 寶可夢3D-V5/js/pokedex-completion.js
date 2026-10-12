/* V5 full-Pokédex celebration. Visual-only overlay, never deletes progress itself. */
(function(root){
 'use strict';
 const TITLE='全圖鑑完成！！';
 const REVEAL_MS=3600;
 class PokedexCompletion {
  constructor(config){
   this.config=config;
   this.completed=false;this.active=false;this.timer=null;this.dialog=null;this.choicesReady=false;
  }
  check(caught,total){
   // Trust the same caught/total used by the live Pokédex HUD (not victory-roster count).
   this.completed=Number.isInteger(caught)&&Number.isInteger(total)&&total>0&&caught>=total;
   return this.maybeShow();
  }
  maybeShow(){
   if(!this.completed||this.active||this.config.isAcknowledged()||this.config.isBusy())return false;
   this.show();
   return true;
  }
  show(){
   if(this.active)return;
   this.active=true;this.choicesReady=false;
   const panel=document.createElement('section');
   panel.className='v5-dex-complete';
   panel.setAttribute('role','dialog');
   panel.setAttribute('aria-modal','true');
   panel.setAttribute('aria-label',TITLE);
   const characters=Array.from(TITLE).map((char,i)=>
     '<span class="v5-dex-complete-letter" style="--letter-delay:'+(i*430)+'ms" aria-hidden="true">'+char+'</span>').join('');
   panel.innerHTML='<div class="v5-dex-complete-panel">'+
     '<div class="v5-dex-complete-sparkle" aria-hidden="true">✧ ✨ ✧</div>'+
     '<h2 aria-label="'+TITLE+'">'+characters+'</h2>'+
     '<p>恭喜你成功蒐集完整的寶可夢圖鑑！你可以繼續探索、挑戰訓練家，或自行選擇重新開始。</p>'+
     '<div class="v5-dex-complete-actions" hidden>'+
       '<button type="button" data-action="reset">🔄 重置遊戲</button>'+
       '<button type="button" data-action="continue">▶ 繼續遊戲</button>'+
     '</div></div>';
   panel.addEventListener('pointerdown',e=>e.stopPropagation());
   panel.addEventListener('touchstart',e=>e.stopPropagation(),{passive:true});
   panel.addEventListener('click',e=>{
     e.stopPropagation();
     const choice=e.target.closest('[data-action]');
     if(!choice||!this.choicesReady)return;
     if(choice.dataset.action==='continue'){
       this.config.onContinue();
       this.close();
     }else if(choice.dataset.action==='reset'){
       // Reuse existing two-confirmation reset. Cancellation leaves this screen open.
       this.config.onReset();
     }
   });
   this.dialog=panel;
   document.body.appendChild(panel);
   const reduceMotion=typeof root.matchMedia==='function'&&root.matchMedia('(prefers-reduced-motion: reduce)').matches;
   this.timer=setTimeout(()=>{
     this.timer=null;
     if(!this.active||this.dialog!==panel)return;
     this.choicesReady=true;
     const actions=panel.querySelector('.v5-dex-complete-actions');
     if(actions){
       actions.hidden=false;
       actions.querySelector('[data-action="continue"]')?.focus?.({preventScroll:true});
     }
   },reduceMotion?0:REVEAL_MS);
  }
  close(){
   if(this.timer!==null)clearTimeout(this.timer);
   this.timer=null;this.dialog?.remove();this.dialog=null;
   this.active=false;this.choicesReady=false;
  }
 }
 root.V5PokedexCompletion=PokedexCompletion;
 if(typeof module!=='undefined')module.exports={PokedexCompletion,TITLE,REVEAL_MS};
})(typeof window!=='undefined'?window:globalThis);
