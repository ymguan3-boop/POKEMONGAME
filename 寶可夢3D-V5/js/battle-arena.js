/* A separate lightweight 3D stage sharing the one exploration WebGL renderer. */
(function(root){
 'use strict';
 const T=root.THREE;
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 class BattleArena {
  constructor(){
   // Deep indigo backdrop contrasts with the light neutral stage and both combatants.
   this.scene=new T.Scene();this.scene.background=new T.Color(0x11162e);
   this.camera=new T.PerspectiveCamera(47,1,.1,150);
   this.camera.position.set(8,10,16);this.camera.lookAt(0,-1.8,0); // Frame both models above the portrait action panel.
   this.fighters=[null,null];this.owned=[];this.fx=[];this.disposed=false;this.generation=0;
   this.makeStage();
  }
  makeStage(){
   const mat=(color,roughness=.86)=>{const m=new T.MeshStandardMaterial({color,roughness});this.owned.push(m);return m;};
   const geo=(ctor,...args)=>{const g=new ctor(...args);this.owned.push(g);return g;};
   const stage=new T.Mesh(geo(T.CylinderGeometry,7.8,8,0.36,64),mat(0xd7e6ea));stage.position.y=-.2;this.scene.add(stage);
   const edge=new T.Mesh(geo(T.TorusGeometry,7.1,.13,8,90),mat(0xf5b83b));edge.rotation.x=Math.PI/2;edge.position.y=.025;this.scene.add(edge);
   // Cool cyan player zone and warm coral opponent zone are readable at a glance.
   for(const [x,z,color] of [[-2.25,2,0x279db7],[2.25,-2,0xe97166]]){
    const zone=new T.Mesh(geo(T.CircleGeometry,1.55,48),mat(color));
    zone.rotation.x=-Math.PI/2;zone.position.set(x,.017,z);this.scene.add(zone);
   }
   const center=new T.Mesh(geo(T.RingGeometry,.72,.93,48),mat(0x27496a));center.rotation.x=-Math.PI/2;center.position.y=.025;this.scene.add(center);
   const seam=new T.Mesh(geo(T.PlaneGeometry,13,.07),mat(0x27496a));seam.rotation.x=-Math.PI/2;seam.position.y=.027;this.scene.add(seam);
   const disc=new T.Mesh(geo(T.CircleGeometry,.25,32),mat(0xf5b83b));disc.rotation.x=-Math.PI/2;disc.position.y=.03;this.scene.add(disc);
   this.scene.add(new T.HemisphereLight(0xffffff,0x526b8e,1.35));
   const sun=new T.DirectionalLight(0xffffff,1.75);sun.position.set(-5,12,8);this.scene.add(sun);
   const rail=new T.Mesh(geo(T.TorusGeometry,8,.035,6,80),mat(0xffffff));rail.rotation.x=Math.PI/2;rail.position.y=.22;this.scene.add(rail);
  }
  async setFighter(side,id){
   if(this.disposed)return;
   const generation=++this.generation;
   const asset=await root.V5ViewerAsset(id);
   if(this.disposed||generation!==this.generation)return;
   if(!asset || !asset.scene)throw new Error('V5 3D 模型無法讀取：'+id);
   this.removeFighter(side);
   const visual=root.V5ViewerClone(asset.scene);
   if(!visual)throw new Error('V5 模型複製失敗：'+id);
   const holder=new T.Group();holder.name='battle-'+id;
   holder.position.set(side===0?-2.25:2.25,0,side===0?2:-2);
   holder.add(visual);this.scene.add(holder);
   visual.rotation.y=side===0?Math.PI:0;
   visual.updateMatrixWorld(true);
   const bounds=new T.Box3().setFromObject(visual),size=bounds.getSize(new T.Vector3());
   const height=Math.max(.1,size.y);
   const target=(id==='mewtwo'||id==='rayquaza')?2.7:Math.min(2.3,Math.max(1.15,height));
   visual.scale.multiplyScalar(Math.min(3.3,target/height));
   visual.updateMatrixWorld(true);
   const repositioned=new T.Box3().setFromObject(visual);
   visual.position.y-=repositioned.min.y;
   const clips=Array.isArray(asset.animations)?asset.animations:[];
   let controller=null;
   if(clips.length&&root.V5AnimationController){
    controller=new root.V5AnimationController(visual,clips);
    controller.play('Idle');
   }
   this.fighters[side]={id,holder,visual,controller,baseY:holder.position.y};
  }
  removeFighter(side){
   const prev=this.fighters[side];if(!prev)return;
   if(prev.controller)prev.controller.dispose();
   this.scene.remove(prev.holder);
   // Model geometries/materials belong to V5's shared loader/cache: do not dispose them.
   this.fighters[side]=null;
  }
  async showBoth(playerId,opponentId){await this.setFighter(0,playerId);await this.setFighter(1,opponentId);}
  async play(event){
   if(this.disposed)return;
   const fighter=this.fighters[event.side];if(!fighter)return;
   if(event.type==='attack'){
    if(fighter.controller)fighter.controller.play('Attack',{once:true});
    const original=fighter.holder.position.z,dir=event.side===0?-1:1;
    fighter.holder.position.z+=dir*.28;
    await wait(220);
    if(this.disposed)return;
    fighter.holder.position.z=original;
    const opponent=this.fighters[1-event.side];
    if(opponent&&opponent.controller)opponent.controller.play('Hurt',{once:true});
    this.addPulse(opponent,event.special);
    await wait(330);
    if(fighter.controller)fighter.controller.play('Idle');
    if(opponent&&opponent.controller)opponent.controller.play('Idle');
   } else if(event.type==='faint'){
    const target=this.fighters[event.side];
    if(target){target.holder.visible=false;await wait(180);}
   }else if(event.type==='defend'){this.addPulse(fighter,false);await wait(180);}
  }
  addPulse(fighter,strong){
   if(!fighter)return;
   const geom=new T.SphereGeometry(strong?.55:.35,12,8);
   const material=new T.MeshBasicMaterial({color:strong?0xffc16a:0x8ce5df,transparent:true,opacity:.45,depthWrite:false});
   const pulse=new T.Mesh(geom,material);pulse.position.copy(fighter.holder.position);pulse.position.y=1.1;
   this.scene.add(pulse);this.fx.push({mesh:pulse,geometry:geom,material,time:0});
  }
  frame(dt){
   for(const f of this.fighters){if(f&&f.controller)f.controller.update(dt);}
   this.fx=this.fx.filter(f=>{f.time+=dt;f.mesh.scale.setScalar(1+f.time*3);f.material.opacity=Math.max(0,.5-f.time);
     if(f.time<.5)return true;this.scene.remove(f.mesh);f.geometry.dispose();f.material.dispose();return false;});
  }
  render(renderer){
   if(this.disposed)return;
   const width=Math.max(1,window.innerWidth),height=Math.max(1,window.innerHeight);
   const ratio=width/height;
   if(Math.abs(this.camera.aspect-ratio)>.001){this.camera.aspect=ratio;this.camera.fov=ratio<.8?52:47;this.camera.updateProjectionMatrix();}
   renderer.render(this.scene,this.camera);
  }
  dispose(){
   if(this.disposed)return;
   this.disposed=true;this.generation++;
   this.removeFighter(0);this.removeFighter(1);
   for(const f of this.fx){this.scene.remove(f.mesh);f.geometry.dispose();f.material.dispose();}
   this.fx=[];
   for(const item of this.owned)item.dispose();
   this.owned=[];
   this.scene.clear();
  }
 }
 root.V5BattleArena=BattleArena;
})(typeof window!=='undefined'?window:globalThis);
