/* Visual-only adapter: never writes Player Root position, speed, collision or inventory. */
(()=>{
 class PlayerVisual{
  constructor(root,clips,player){this.root=root;this.player=player;this.controller=new V5AnimationController(root,clips);this.previous=player.position.clone();this.time=0;this.busyUntil=0;this.wasCapture=false;this.wasMoving=false;this.lastYaw=player.rotation.y;this.suit='';this.pendingRelease=false;
   // GLTFLoader creates a Skeleton per primitive. Canonicalize shared joints once.
   let skeleton;root.traverse(o=>{if(!o.isSkinnedMesh)return;if(!skeleton)skeleton=o.skeleton;else if(o.skeleton.bones.every((b,i)=>b===skeleton.bones[i]))o.skeleton=skeleton;});
   this.hand=root.getObjectByName('HandR');this.controller.play('Idle');this.setSuit('trainer');
  }
  setSuit(id){if(this.suit===id)return;this.suit=id;this.root.traverse(o=>{if(o.userData.costume)o.visible=o.userData.costume===id});}
  action(name,markers=[]){const clip=this.controller.actions.get(name)?.getClip();if(!clip)return;this.controller.play(name,{once:true,markers});this.busyUntil=this.time+clip.duration;}
  throw(release){if(this.pendingRelease)return false;this.pendingRelease=true;this.busyUntil=this.time+.66;this.controller.play('Throw',{once:true,markers:[{at:.24,fire:()=>{this.pendingRelease=false;this.root.updateMatrixWorld(true);release(this.hand.getWorldPosition(new THREE.Vector3()));}}]});return true;}
  update(dt,state){this.time+=dt;const distance=this.previous.distanceTo(this.player.position),speed=distance/Math.max(dt,.001);this.previous.copy(this.player.position);
   if(state.isShowingCapture&&!this.wasCapture)this.action('CatchSuccess'+(1+Math.floor(Math.random()*3)));this.wasCapture=state.isShowingCapture;
   if(this.time>=this.busyUntil){const moving=speed>.15,turn=Math.atan2(Math.sin(this.player.rotation.y-this.lastYaw),Math.cos(this.player.rotation.y-this.lastYaw));let next='Idle';if(state.isCharging)next='Aim';else if(state.captureInProgress)next='CaptureWait';else if(moving)next=speed>6.8?'Run':'Walk';else if(this.wasMoving){this.action('Stop');next=null;}else if(Math.abs(turn)>.025){this.action(turn<0?'TurnLeft':'TurnRight');next=null;}if(next)this.controller.play(next);this.wasMoving=moving;}
   this.lastYaw=this.player.rotation.y;this.controller.update(dt);
   if(this.ballFactory&&(state.isCharging||this.pendingRelease)){if(this.heldType!==state.activeBallType){if(this.heldBall)this.hand.remove(this.heldBall);this.heldBall=this.ballFactory(state.activeBallType);if(this.heldBall){this.hand.add(this.heldBall);this.heldBall.position.set(0,-.035,.12);this.heldType=state.activeBallType;}}if(this.heldBall)this.heldBall.visible=true;}else if(this.heldBall)this.heldBall.visible=false;
  }
 }
 window.V5PlayerVisual=PlayerVisual;
})();
