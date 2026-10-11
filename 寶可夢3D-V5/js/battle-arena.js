/* Readable mobile-friendly 3D arena with bounded projectiles, hit reactions and combat feedback. */
(function(root){
 'use strict';
 const T=root.THREE;
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const TYPE_COLORS={火:0xff713f,水:0x4fb5ff,草:0x75d870,電:0xffda4e,冰:0xa0efff,
  蟲:0xb3df67,超能力:0xe78af2,地面:0xca9358,鋼:0xb2c6d9,龍:0xac83f6,
  幽靈:0x9579e4,飛行:0x92d8fb,毒:0xc48afb,格鬥:0xe5967b,一般:0xfff2ce};
 class BattleArena{
  constructor(){
   this.scene=new T.Scene();this.scene.background=new T.Color(0x0e1526);
   this.camera=new T.PerspectiveCamera(48,1,.1,150);
   this.camera.position.set(0,8.5,24);this.camera.lookAt(0,-2.1,0);
   this.fighters=[null,null];this.owned=[];this.fx=[];this.hitLabels=[];this.openingIcon=null;this.disposed=false;this.elapsed=0;
   this.generation=[0,0];this.makeStage();
  }
  makeStage(){
   const mat=(color,roughness=.84)=>{const m=new T.MeshStandardMaterial({color,roughness,metalness:.05});this.owned.push(m);return m;};
   const geo=(ctor,...args)=>{const g=new ctor(...args);this.owned.push(g);return g;};
   // Deep slate is deliberately darker than all bright Pokémon and skill particles.
   const stage=new T.Mesh(geo(T.CylinderGeometry,7.8,8,.36,64),mat(0x1d2a40));stage.position.y=-.2;this.scene.add(stage);
   const edge=new T.Mesh(geo(T.TorusGeometry,7.1,.095,8,90),mat(0xc1af79));
   edge.rotation.x=Math.PI/2;edge.position.y=.025;this.scene.add(edge);
   for(const [x,z,color] of [[-2.25,2,0x174957],[2.25,-2,0x522d48]]){
    const zone=new T.Mesh(geo(T.CircleGeometry,1.62,48),mat(color));
    zone.rotation.x=-Math.PI/2;zone.position.set(x,.017,z);this.scene.add(zone);
   }
   const center=new T.Mesh(geo(T.RingGeometry,.68,.93,48),mat(0x789bb3));
   center.rotation.x=-Math.PI/2;center.position.y=.026;this.scene.add(center);
   const seam=new T.Mesh(geo(T.PlaneGeometry,13,.065),mat(0x8faabd));
   seam.rotation.x=-Math.PI/2;seam.position.y=.025;this.scene.add(seam);
   // Three low-intensity lights preserve authentic model colors without yellow/white clipping.
   const sun=new T.DirectionalLight(0xfff6e7,.83);sun.position.set(-5,10,9);this.scene.add(sun);
   this.scene.add(new T.HemisphereLight(0xe0efff,0x28344f,.64));
   const rim=new T.DirectionalLight(0x94d9ff,.32);rim.position.set(2,7,-7);this.scene.add(rim);
  }
  async setFighter(side,id){
   if(this.disposed)return;
   const generation=++this.generation[side];
   const asset=await root.V5ViewerAsset(id);
   if(this.disposed||generation!==this.generation[side])return;
   if(!asset||!asset.scene)throw new Error('V5 3D 模型無法讀取：'+id);
   this.removeFighter(side);
   const visual=root.V5ViewerClone(asset.scene);
   if(!visual)throw new Error('V5 模型複製失敗：'+id);
   // Materials must be cloned per battle participant; cached world/gym GLBs stay untouched.
   const battleMaterials=root.V5BattleVisual.cloneForBattle(visual);
   const holder=new T.Group();holder.name='battle-'+id;
   holder.position.set(side===0?-2.25:2.25,0,side===0?2:-2);
   holder.add(visual);this.scene.add(holder);
   // NPC faces the player's location in an oblique 15° stance instead of the camera.
   visual.rotation.y=side===0?Math.PI:root.V5BattleVisual.facePlayer(-2.25,2,2.25,-2);
   visual.updateMatrixWorld(true);
   const bounds=new T.Box3().setFromObject(visual),height=Math.max(.1,bounds.getSize(new T.Vector3()).y);
   // Larger silhouettes and narrower camera framing keep small Pokémon visible on phones.
   const target=(id==='mewtwo'||id==='rayquaza')?3.1:Math.min(3,Math.max(1.75,height*1.65));
   visual.scale.multiplyScalar(Math.min(4,target/height)*(side===1?root.V5BattleVisual.NPC_SCALE:1));
   visual.updateMatrixWorld(true);
   visual.position.y-=new T.Box3().setFromObject(visual).min.y;
   const clips=Array.isArray(asset.animations)?asset.animations:[];
   let controller=null;
   const idleClip=clips.find(c=>/idle|hover|fly|flap|walk|float/i.test(c.name))?.name||null;
   if(clips.length&&root.V5AnimationController){
    controller=new root.V5AnimationController(visual,clips);
    if(idleClip)controller.play(idleClip);
   }
   const flying=/butterfree|beedrill|articuno|zapdos|moltres|rayquaza|pidge|wing|dragonite/i.test(id);
   const wings=[];
   // Procedural fallback on models with no usable idle clip; animated GLBs retain their own tracks.
   if(!idleClip&&flying){
     visual.traverse(node=>{
       if(wings.length<6&&node!==visual&&/(^|[-_ ])wing([-_ ]|$)/i.test(node.name||'')){
         wings.push({node,angle:node.rotation.z,side:node.position.x<0?-1:1});
       }
     });
   }
   this.fighters[side]={id,holder,visual,controller,idleClip,battleMaterials,baseX:holder.position.x,baseZ:holder.position.z,hurt:0,flying,wings};
   this.fitCombatants();
  }
  // Portrait view: fit the full silhouettes horizontally instead of cropping both fighters.
  fitCombatants(){
   const active=this.fighters.filter(Boolean);
   if(!active.length)return;
   const bounds=new T.Box3();
   for(const f of active){f.holder.updateMatrixWorld(true);bounds.expandByObject(f.holder);}
   const width=Math.max(8,bounds.max.x-bounds.min.x+2.1);
   const ratio=Math.max(.35,this.camera.aspect||window.innerWidth/Math.max(1,window.innerHeight));
   const field=Math.tan(this.camera.fov*Math.PI/360)*ratio;
   const distance=Math.max(20,Math.min(38,width/(2*field)+4));
   const center=Math.max(-.8,Math.min(.8,(bounds.min.x+bounds.max.x)/2));
   this.camera.position.set(center,Math.max(8.5,distance*.35),distance);
   this.camera.lookAt(center,-2.1,0);
  }
  removeFighter(side){
   const prev=this.fighters[side];if(!prev)return;
   root.PokemonGameRuntime?.restoreTransientEmissive?.(prev.visual);
   if(prev.controller)prev.controller.dispose();
   this.scene.remove(prev.holder);
   // Dispose only new material instances, not geometries or textures shared with the world.
   for(const material of prev.battleMaterials||[])material.dispose();
   this.fighters[side]=null;
   // Shared cached model geometry and material resources must never be disposed here.
  }
  async showBoth(playerId,opponentId){await this.setFighter(0,playerId);await this.setFighter(1,opponentId);}
  addEffect(mesh,duration=.6,kind='burst',from=null,to=null){
   this.scene.add(mesh);this.fx.push({mesh,duration,time:0,kind,from,to});
  }
  burst(position,color,power=1){
   for(let i=0;i<7;i++){
    const phi=i*2*Math.PI/7,point=position.clone().add(new T.Vector3(Math.cos(phi)*.5,.25+Math.sin(phi*2)*.24,Math.sin(phi)*.25));
    const mesh=new T.Mesh(new T.SphereGeometry(.11*power,8,6),new T.MeshBasicMaterial({color,transparent:true,opacity:.93,depthWrite:false}));
    mesh.position.copy(point);this.addEffect(mesh,.6,'burst');
   }
   const circle=new T.Mesh(new T.RingGeometry(.58,.76,36),
    new T.MeshBasicMaterial({color,side:T.DoubleSide,transparent:true,opacity:.92,depthWrite:false}));
   circle.position.copy(position);circle.lookAt(this.camera.position);
   this.addEffect(circle,.65,'ring');
  }
  projectile(from,to,color,special){
   const ball=new T.Mesh(new T.SphereGeometry(special?.36:.24,12,10),
     new T.MeshBasicMaterial({color,transparent:true,opacity:.98,depthWrite:false}));
   ball.position.copy(from);this.addEffect(ball,.39,'projectile',from,to);
   for(let i=1;i<=3;i++){
    const tail=new T.Mesh(new T.SphereGeometry((special?.20:.13)*(1-i*.14),8,6),
      new T.MeshBasicMaterial({color,transparent:true,opacity:.7,depthWrite:false}));
    tail.position.copy(from);this.addEffect(tail,.4,'trail',from,to);this.fx[this.fx.length-1].offset=i*.14;
   }
  }
  signatureVolley(event,from,to,color){
   if(!event.special)return;
   const seed=(event.fxSeed||37)>>>0,variant=event.fxVariant||'burst';
   // Distinct seeded formations, shape and timing per species: bounded to eight particles.
   const shape=seed%4;
   for(let i=0;i<8;i++){
    const t=i/8,theta=t*Math.PI*2+seed*.01;
    let geometry;
    if(shape===0)geometry=new T.OctahedronGeometry(.13,0);
    else if(shape===1)geometry=new T.TetrahedronGeometry(.15,0);
    else if(shape===2)geometry=new T.TorusGeometry(.12,.046,5,10);
    else geometry=new T.ConeGeometry(.13,.3,6);
    const material=new T.MeshBasicMaterial({color,transparent:true,opacity:.84,side:T.DoubleSide,depthWrite:false});
    const sparkle=new T.Mesh(geometry,material);
    const width=/spiral|rings|wave/.test(variant)?1.1:.62;
    // Each named formation traces a recognizably different attack silhouette.
    const offset={
     spiral:()=>new T.Vector3(Math.cos(theta)*width,Math.sin(theta*2)*.44,Math.sin(theta)*.52),
     burst:()=>new T.Vector3(Math.cos(theta)*.9,Math.sin(theta)*.7,Math.sin(theta*1.8)*.7),
     star:()=>new T.Vector3(Math.cos(theta)*(i%2?.38:1.1),Math.sin(theta)*(i%2?.38:1.1),0),
     wave:()=>new T.Vector3((i-3.5)*.22,Math.sin(i*1.4)*.5,Math.cos(i*.75)*.36),
     shards:()=>new T.Vector3(Math.cos(theta)*1.1,Math.cos(theta*3)*.58,Math.sin(theta)*.8),
     rings:()=>new T.Vector3(Math.cos(theta)*.95,Math.sin(theta)*.95,Math.sin(theta*3)*.14),
     lance:()=>new T.Vector3((i-3.5)*.12,(i-3.5)*.16,Math.sin(theta)*.16),
     petals:()=>new T.Vector3(Math.cos(theta)*.75,Math.sin(theta)*.44,Math.cos(theta*2)*.55),
     comet:()=>new T.Vector3(-i*.21,Math.sin(theta)*.25,i*.10),
     flurry:()=>new T.Vector3(Math.cos(theta*3)*.9,Math.sin(theta*2)*.6,Math.cos(theta)*.75)
    }[variant]||(()=>new T.Vector3(Math.cos(theta)*width,Math.sin(theta)*.34,0));
    sparkle.position.copy(from).add(offset());
    sparkle.rotation.set(theta,theta*.6,theta*.8);
    this.addEffect(sparkle,.32+(.02*i),'signature',sparkle.position.clone(),to.clone().add(new T.Vector3(Math.sin(theta)*.45,Math.cos(theta)*.45,0)));
   }
  }
  statusBurst(target,status){
   if(!target)return;
   const color=({poison:0x9ae85e,freeze:0x8fe8ff,paralysis:0xffe25a,heal:0x83f5a4,shield:0x98ddfa,sleep:0xffb5e9})[status]||0xffffff;
   this.burst(target.holder.position.clone().add(new T.Vector3(0,1.35,0)),color,1.1);
  }
  showImmune(target){
   const el=document.createElement('div');
   el.textContent='🛡️ 攻擊無效 · 0';
   el.className='v5-hit-float';
   el.style.cssText='position:fixed;z-index:10001;pointer-events:none;color:#eafaff;background:#285a7eee;border:2px solid #a7f3ff;border-radius:9px;padding:5px 9px;font-weight:900;transform:translate(-50%,-50%)';
   document.body.append(el);
   this.hitLabels.push({element:el,target,time:0,duration:1.1});
  }
  showOpeningIcon(side,kind){
   this.clearOpeningIcon();
   const el=document.createElement('div');
   el.textContent=kind==='sleep'?'💤':'🛡️';
   el.setAttribute('aria-hidden','true');
   el.style.cssText='position:fixed;z-index:10001;pointer-events:none;font-size:clamp(22px,6vw,36px);filter:drop-shadow(0 2px 5px #000);transform:translate(-50%,-50%)';
   document.body.append(el);
   this.openingIcon={side,element:el,kind};
  }
  clearOpeningIcon(){this.openingIcon?.element.remove();this.openingIcon=null;}
  showHit(target,event){
   if(!target)return;
   target.hurt=.6;
   root.PokemonGameRuntime?.applyTransientEmissive?.(target.visual,0xff244f,1.1);
   const text=document.createElement('div');
   const label=event.effective?'屬性剋制！':event.resisted?'屬性抵抗！':event.defended?'防禦減傷':'受到攻擊！';
   text.textContent='−'+event.damage+'  '+label;
   text.className='v5-hit-float';
   text.style.cssText='position:fixed;z-index:10001;pointer-events:none;padding:7px 10px;border-radius:10px;font-weight:900;font-size:clamp(14px,4vw,21px);letter-spacing:.02em;white-space:nowrap;color:#fff;background:#77233add;border:2px solid #ffb47f;text-shadow:0 2px 3px #000;box-shadow:0 4px 16px #000a;transform:translate(-50%,-50%)';
   document.body.appendChild(text);this.hitLabels.push({element:text,target,time:0,duration:1.15});
  }
  async play(event){
   if(this.disposed)return;
   const fighter=this.fighters[event.side];if(!fighter)return;
   if(event.type==='attack'){
    if(fighter.controller)fighter.controller.play('Attack',{once:true});
    const opponent=this.fighters[1-event.side];
    const direction=event.side===0?-1:1;
    fighter.holder.position.z=fighter.baseZ+direction*.45;
    const from=fighter.holder.position.clone().add(new T.Vector3(0,1.3,0));
    const to=(opponent?opponent.holder.position:fighter.holder.position).clone().add(new T.Vector3(0,1.25,0));
    const color=TYPE_COLORS[event.element]||TYPE_COLORS.一般;
    this.projectile(from,to,color,event.special);
    this.signatureVolley(event,from,to,color);await wait(410);
    if(this.disposed)return;
    fighter.holder.position.z=fighter.baseZ;
    if(opponent){
     if(event.immune){
       this.statusBurst(opponent,'shield');
       this.showImmune(opponent);
     }else{
       if(opponent.controller)opponent.controller.play('Hurt',{once:true});
       this.burst(to,color,event.special?1.3:1);
       this.showHit(opponent,event);
     }
    }
    await wait(560);
    if(this.disposed)return;
    for(const unit of [fighter,opponent]){
     if(!unit?.controller)continue;
     if(unit.idleClip)unit.controller.play(unit.idleClip);
     else unit.controller.mixer?.stopAllAction();
    }
   }else if(event.type==='statusApply'||event.type==='statusTick'||event.type==='statusSkip'
      ||event.type==='heal'||event.type==='shield'){
    const target=this.fighters[event.side];
    if(target)this.statusBurst(target,event.status||(event.type==='heal'?'heal':event.type==='shield'?'shield':'poison'));
    await wait(170);
   }else if(event.type==='faint'){
    const target=this.fighters[event.side];
    if(target){root.PokemonGameRuntime?.restoreTransientEmissive?.(target.visual);target.holder.visible=false;await wait(230);}
   }else if(event.type==='defend'){
    this.burst(fighter.holder.position.clone().add(new T.Vector3(0,1.2,0)),0x7ae8ff,.7);await wait(240);
   }
  }
  frame(dt){
   if(this.disposed)return;
   const delta=Math.max(0,Math.min(.07,Number(dt)||0));this.elapsed+=delta;
   for(const f of this.fighters){
    if(!f)continue;
    if(f.controller)f.controller.update(delta);
    // Keep natural breathing/flight motion active for BOTH player and NPC between turns.
    const idle= f.flying?.14:.045;
    f.holder.position.y=Math.sin(this.elapsed*(f.flying?9:2.8)+(f.id.length%7)) * idle;
    if(f.wings.length)for(const w of f.wings)w.node.rotation.z=w.angle+Math.sin(this.elapsed*19)*.32*w.side;
    if(f.hurt>0){
     f.hurt=Math.max(0,f.hurt-delta);
     const intensity=f.hurt/.6;f.holder.position.x=f.baseX+Math.sin(f.hurt*75)*.16*intensity;
     if(f.hurt===0){f.holder.position.x=f.baseX;root.PokemonGameRuntime?.restoreTransientEmissive?.(f.visual);}
    }
   }
   this.fx=this.fx.filter(f=>{
    f.time+=delta;const progress=Math.min(1,f.time/f.duration);
    if(f.kind==='projectile'||f.kind==='trail'||f.kind==='signature'){
     const t=Math.max(0,Math.min(1,progress-(f.offset||0)));
     f.mesh.position.copy(f.from).lerp(f.to,t);
    }else{
     f.mesh.scale.setScalar(1+progress*(f.kind==='ring'?2.2:4));
    }
    f.mesh.material.opacity=Math.max(0,(f.kind==='trail'?.7:.95)*(1-progress));
    if(progress<1)return true;
    this.scene.remove(f.mesh);f.mesh.geometry.dispose();f.mesh.material.dispose();return false;
   });
   if(this.openingIcon){
    const target=this.fighters[this.openingIcon.side];
    if(target){
     const loc=target.holder.position.clone().add(new T.Vector3(0,3.35+Math.sin(this.elapsed*3)*.12,0)).project(this.camera);
     this.openingIcon.element.style.left=((loc.x+1)*window.innerWidth/2)+'px';
     this.openingIcon.element.style.top=((1-loc.y)*window.innerHeight/2)+'px';
    }
   }
   this.hitLabels=this.hitLabels.filter(label=>{
    label.time+=delta;
    const pt=label.target.holder.position.clone().add(new T.Vector3(0,2.6+label.time*1.1,0)).project(this.camera);
    label.element.style.left=((pt.x+1)*window.innerWidth/2)+'px';
    label.element.style.top=((1-pt.y)*window.innerHeight/2)+'px';
    label.element.style.opacity=String(Math.max(0,1-label.time/label.duration));
    if(label.time<label.duration)return true;
    label.element.remove();return false;
   });
  }
  render(renderer){
   if(this.disposed)return;
   const width=Math.max(1,window.innerWidth),height=Math.max(1,window.innerHeight),ratio=width/height;
   if(Math.abs(this.camera.aspect-ratio)>.001){this.camera.aspect=ratio;this.camera.fov=ratio<.8?50:44;this.camera.updateProjectionMatrix();this.fitCombatants();}
   renderer.render(this.scene,this.camera);
  }
  dispose(){
   if(this.disposed)return;
   this.disposed=true;this.generation=this.generation.map(n=>n+1);
   this.removeFighter(0);this.removeFighter(1);
   this.hitLabels.forEach(x=>x.element.remove());this.hitLabels=[];this.clearOpeningIcon();
   for(const f of this.fx){this.scene.remove(f.mesh);f.mesh.geometry.dispose();f.mesh.material.dispose();}
   this.fx=[];for(const o of this.owned)o.dispose();this.owned=[];this.scene.clear();
  }
 }
 root.V5BattleArena=BattleArena;
})(typeof window!=='undefined'?window:globalThis);
