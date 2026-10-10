/* Named clips, crossfades and event markers; no animation setTimeout calls. */
(()=>{class AnimationController{
 constructor(root,clips){this.root=root;this.mixer=new THREE.AnimationMixer(root);this.actions=new Map(clips.map(c=>[c.name,this.mixer.clipAction(c)]));this.current=null;this.markers=[];this.elapsed=0;this.fired=new Set();}
 play(name,{fade=.18,once=false,markers=[]}={}){if(this.current===name&&!once)return false;const a=this.actions.get(name)||this.actions.get('Idle');if(!a)return false;const old=this.actions.get(this.current);a.reset();a.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,once?1:Infinity);a.clampWhenFinished=once;a.enabled=true;a.setEffectiveWeight(1).play();if(old&&old!==a)old.crossFadeTo(a,fade,false);else a.fadeIn(fade);this.current=name;this.elapsed=0;this.markers=markers;this.fired.clear();return true;}
 update(dt){this.elapsed+=dt;this.mixer.update(dt);for(let i=0;i<this.markers.length;i++){const e=this.markers[i];if(!this.fired.has(i)&&this.elapsed>=e.at){this.fired.add(i);e.fire();}}}
 dispose(){this.mixer.stopAllAction();this.mixer.uncacheRoot(this.root);}
}window.V5AnimationController=AnimationController;})();
