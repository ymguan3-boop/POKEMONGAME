(()=>{
 const role={isNPC:true,isCatchable:false,isTargetable:false,isBattleTarget:false};
 class NpcSystem{
  constructor(ctx){this.ctx=ctx;this.actors=[];this.companions=[];this.time=0;this.nearest=null;this.dialogue=null;this.buildUI();}
  async load(){const {scene,loader,clone}=this.ctx;await Promise.all(V5NpcData.actors.map(async data=>{try{const a=await loader.loadAsync('models/'+data.asset+'.glb'),root=clone(a.scene);root.position.set(...[data.home[0],0,data.home[1]]);root.userData={...root.userData,...role,npcId:data.id};root.scale.setScalar(1.13);scene.add(root);const actor={...data,...role,root,animation:new V5PlayerVisual(root,a.animations,root),timer:2,target:root.position.clone(),phase:this.actors.length*1.7};this.actors.push(actor);}catch(e){console.warn('NPC asset unavailable',data.id,e)}}));
   for(const data of V5NpcData.companions){try{const a=await loader.loadAsync('models/npc-'+data.species+'.glb'),root=clone(a.scene);root.userData={...root.userData,...role,npcId:data.id};const leader=this.actors.find(n=>n.id===data.leader);if(leader)root.position.copy(leader.root.position).add(new THREE.Vector3(data.offset[0],0,data.offset[1]));scene.add(root);const animation=new V5AnimationController(root,a.animations);animation.play('Idle');this.companions.push({...data,...role,root,animation});}catch(e){console.warn('NPC companion asset unavailable',data.species,e)}}
  }
  buildUI(){const style=document.createElement('style');style.textContent='#v5-talk{position:fixed;bottom:170px;left:50%;transform:translateX(-50%);padding:10px 18px;border:2px solid #fff3cb;border-radius:22px;background:#234d58;color:white;z-index:60;cursor:pointer}#v5-dialogue{position:fixed;bottom:110px;left:50%;transform:translateX(-50%);width:min(520px,90vw);padding:22px;border:3px solid #e5c485;border-radius:18px;background:#fff9eb;color:#23434e;z-index:80;box-shadow:0 8px 28px #0004}#v5-dialogue button{margin-top:14px;background:#24576b;color:white;border-radius:8px;padding:8px 18px}';document.head.append(style);
   this.button=document.createElement('button');this.button.id='v5-talk';this.button.hidden=true;this.button.addEventListener('click',()=>this.interact());document.body.append(this.button);
   this.panel=document.createElement('section');this.panel.id='v5-dialogue';this.panel.hidden=true;this.panel.setAttribute('role','dialog');this.panel.setAttribute('aria-label','NPC 對話');this.panel.innerHTML='<strong></strong><p style="margin-top:10px;line-height:1.7"></p><button>繼續冒險</button>';this.panel.querySelector('button').onclick=()=>this.close();document.body.append(this.panel);
   window.addEventListener('keydown',e=>{if(e.code==='KeyE'&&!e.repeat){e.preventDefault();if(this.dialogue)this.close();else this.interact();}if(e.code==='Escape'&&this.dialogue)this.close();});
  }
  close(){this.dialogue=null;this.panel.hidden=true;}
  interact(){const npc=this.nearest,{state,save,visual}=this.ctx;if(!npc||state.currentMode!=='world'||state.captureInProgress||state.isShowingCapture)return false;this.dialogue=npc;let text=npc.dialogue;const quest=V5Progress.rewardQuest(state,npc.id);let reward=quest;
   if(!reward){const now=Date.now(),next=state.npcRewards[npc.id]||0;if(now>=next){state.npcRewards[npc.id]=now+(120+Math.random()*180)*1000;if(Math.random()<.45)reward=npc.supply;}}
   if(reward){if(!quest)V5Progress.award(state,reward.item,reward.amount);if(reward.item==='normal'){state.pokeballs=Math.min(state.maxPokeballs,state.pokeballs+reward.amount);state.items.normal=0;}if(reward.item==='berry'){state.berryCount+=reward.amount;state.items.berry=0;}text+='\n獲得 '+reward.amount+' 個'+(V5NpcData.itemNames[reward.item]||reward.item)+'！';npc.animation.action('GiveItem');visual()?.action('ReceiveItem',[{at:.55,fire:()=>this.ctx.showItem?.(reward.item)}]);this.ctx.inventory();}else{npc.animation.action('Wave');visual()?.action('Nod');}save();
   this.panel.querySelector('strong').textContent=npc.name;this.panel.querySelector('p').textContent=text;this.panel.hidden=false;this.panel.querySelector('button').focus();return true;
  }
  update(dt){const {player,state,obstacles}=this.ctx;this.time+=dt;const active=state.currentMode==='world';let closest=null,dist=4.8;
   for(const n of this.actors){n.root.visible=active;if(!active)continue;const d=n.root.position.distanceTo(player.position);if(d<dist){closest=n;dist=d;}const talking=this.dialogue===n||d<2.8;n.timer-=dt;
    if(!talking){if(n.timer<=0){const a=Math.random()*Math.PI*2,r=Math.random()*n.radius;n.target.set(n.home[0]+Math.cos(a)*r,0,n.home[1]+Math.sin(a)*r);n.timer=3+Math.random()*4;}const dir=n.target.clone().sub(n.root.position);if(dir.length()>.15){dir.normalize();const next=n.root.position.clone().addScaledVector(dir,dt*.65);if(!obstacles.some(o=>Math.hypot(next.x-o.x,next.z-o.z)<o.radius+.45))n.root.position.copy(next);n.root.rotation.y=THREE.MathUtils.lerp(n.root.rotation.y,Math.atan2(dir.x,dir.z),Math.min(1,dt*5));}}
    else n.root.rotation.y=Math.atan2(player.position.x-n.root.position.x,player.position.z-n.root.position.z);n.animation.update(dt,{});
   }
   for(const n of this.companions){const leader=this.actors.find(x=>x.id===n.leader);n.root.visible=active&&!!leader;if(!leader)continue;const target=leader.root.position.clone().add(new THREE.Vector3(n.offset[0],0,n.offset[1])),moving=n.root.position.distanceTo(target)>.12;n.root.position.lerp(target,1-Math.exp(-dt*2));n.root.rotation.y=leader.root.rotation.y;if(active){n.animation.play(moving?'Walk':'Idle');n.animation.update(dt);}}
   this.nearest=closest;this.button.hidden=!closest||!!this.dialogue||!active;if(closest)this.button.textContent='E · 和'+closest.name+'對話';
  }
 }
 window.V5NpcSystem=NpcSystem;
})();
