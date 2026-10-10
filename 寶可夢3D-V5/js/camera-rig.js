/* Third-person elevated follow only. No pointer lock or first-person mode. */
(()=>{const T=THREE;class CameraRig{
 constructor(camera){this.camera=camera;this.target=new T.Vector3();this.desired=new T.Vector3();this.distance=11;this.min=8;this.max=18;this.initial=true;this.ray=new T.Raycaster();this.occluders=[];this.original=new Map();}
 setOccluders(objects){this.occluders=objects;}
 zoom(step){this.distance=T.MathUtils.clamp(this.distance+step,this.min,this.max);}
 update(player,angle,dt,{boss=null,obstacles=[],airborneHeight=0}={}){
  const lift=Math.min(2.7,Math.max(0,airborneHeight)*.45);
  const look=player.position.clone().add(new T.Vector3(0,1.05+lift,0));if(boss){look.lerp(boss.mesh.position.clone().add(new T.Vector3(0,1.4,0)),.25);}
  // Portrait: retain the elevated full-body view, but bring the camera closer.
  // No species/root scaling or collision/range changes are used to enlarge the view.
  const portrait=this.camera.aspect<.8;
  const fov=portrait?58:52;if(this.camera.fov!==fov){this.camera.fov=fov;this.camera.updateProjectionMatrix();}
  // Give a nearby airborne creature headroom without shrinking ground encounters.
  const airRoom=portrait?Math.min(3,Math.max(0,airborneHeight)*.5):0;
  const d=portrait?T.MathUtils.clamp(this.distance*.76+airRoom,7.2,15):this.distance;this.desired.set(player.position.x-Math.sin(angle)*d,player.position.y+d*.98+lift,player.position.z-Math.cos(angle)*d);
  // Keep the camera sphere outside gameplay collision proxies; never move Player Root.
  for(const o of obstacles){if(!Number.isFinite(o.radius)||o.radius<2)continue;const dx=this.desired.x-o.x,dz=this.desired.z-o.z,dist=Math.hypot(dx,dz),r=o.radius+.7;if(this.desired.y<9&&dist<r){const a=dist>.01?dx/dist:Math.sin(angle),b=dist>.01?dz/dist:Math.cos(angle);this.desired.x=o.x+a*r;this.desired.z=o.z+b*r;this.desired.y=Math.max(this.desired.y,9);}}
  this.desired.y=Math.max(4,this.desired.y);const alpha=1-Math.exp(-7*Math.min(dt,.1));if(this.initial){this.camera.position.copy(this.desired);this.target.copy(look);this.initial=false;}else{this.camera.position.lerp(this.desired,alpha);this.target.lerp(look,alpha);}this.camera.lookAt(this.target);
  const direction=this.camera.position.clone().sub(look),distance=direction.length();this.ray.set(look,direction.normalize());this.ray.far=distance;const blocked=new Set(this.ray.intersectObjects(this.occluders,false).map(h=>h.object));
  const groups=new Set([...blocked].map(o=>o.userData.occlusionGroup));
  for(const o of this.occluders){const mats=Array.isArray(o.material)?o.material:[o.material];for(const m of mats){if(!this.original.has(m))this.original.set(m,{opacity:m.opacity,transparent:m.transparent,depthWrite:m.depthWrite});const saved=this.original.get(m),target=groups.has(o.userData.occlusionGroup)?.22:saved.opacity;m.opacity=T.MathUtils.lerp(m.opacity,target,alpha);m.transparent=m.opacity<.99||saved.transparent;m.depthWrite=m.opacity>.9&&saved.depthWrite;}}
 }
}window.V5CameraRig=CameraRig;})();
