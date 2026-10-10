/* Deterministic state progression, bounded habitats, distance-based animation budget.
   This module owns visual wildlife locomotion only, never capture probability. */
((global)=>{
 const states=['Flying','Circling','Descending','Landing','GroundIdle','Takeoff'];
 const durations={Flying:9,Circling:6,Descending:3,Landing:1.2,GroundIdle:5,Takeoff:2};
 function advanceFlight(state,dt){let elapsed=state.elapsed+dt,phase=state.phase;while(elapsed>=durations[phase]){elapsed-=durations[phase];phase=states[(states.indexOf(phase)+1)%states.length];}return{phase,elapsed};}
 function lod(distance,quality='normal'){const low=quality==='low';return distance>70?{level:'sleep',interval:Infinity,shadow:false}:distance>40?{level:'far',interval:.25,shadow:false}:distance>22?{level:'mid',interval:low?.125:.067,shadow:false}:{level:'near',interval:low?.033:0,shadow:!low};}
 const zones={grass:{x:-20,z:24,rx:13,rz:17},forest:{x:-26,z:-29,rx:17,rz:17},shore:{x:22,z:52,rx:16,rz:3},water:{x:25,z:64,rx:25,rz:3},sky:{x:0,z:-29,rx:32,rz:16}};
 const profiles={articuno:{habitat:'sky',speed:2.6,height:5.5,radius:7,flight:true},zapdos:{habitat:'sky',speed:3.5,height:5.8,radius:6,flight:true},raichu:{habitat:'forest',speed:1.3},caterpie:{habitat:'forest',speed:.55},metapod:{habitat:'forest',speed:0,cocoon:true},butterfree:{habitat:'forest',speed:1.8,height:3.2,radius:4,flight:true},weedle:{habitat:'forest',speed:.5},kakuna:{habitat:'forest',speed:0,cocoon:true},beedrill:{habitat:'forest',speed:2.2,height:3.8,radius:5,flight:true},bulbasaur:{habitat:'grass',speed:1.2},piplup:{habitat:'shore',speed:.9},moltres:{habitat:'sky',speed:3,height:6,radius:6,flight:true},kyogre:{habitat:'water',speed:2,swim:true}};
 function point(zone,obstacles,random=Math.random){for(let i=0;i<40;i++){const p={x:zone.x+(random()*2-1)*zone.rx,z:zone.z+(random()*2-1)*zone.rz};if(!obstacles.some(o=>Math.hypot(p.x-o.x,p.z-o.z)<(o.radius||0)+2))return p;}return null;}
 class Ecology{
  constructor({state,player,quality='normal'}){this.state=state;this.player=player;this.quality=quality;this.instances=new WeakMap();this.metrics={active:0,sleeping:0};}
  tick(p,dt){const profile=profiles[p.type];if(!profile||!p.animation||p.isCaptured||p.isShrinking||this.state.currentMode!=='world')return false;
   let e=this.instances.get(p);if(!e){const zone=zones[profile.habitat],home=point(zone,this.state.obstacles)||{x:zone.x,z:zone.z};e={profile,home,zone,target:home,phase:'Flying',elapsed:0,angle:Math.random()*6.28,acc:0,idle:1,initialized:false};this.instances.set(p,e);p.habitat=profile.habitat;}
   const distance=p.mesh.position.distanceTo(this.player.position),budget=lod(distance,this.quality);p.v5LOD=budget.level;
   if(e.shadow!==budget.shadow){p.mesh.traverse(o=>{if(o.isMesh)o.castShadow=budget.shadow});e.shadow=budget.shadow;}
   // Sleeping models relinquish shadows as well as mixer work. Do not accumulate
   // minutes of deferred movement while the player is on the other side of town.
   if(budget.level==='sleep'){e.acc=0;return true;}e.acc+=dt;if(e.acc<budget.interval)return true;dt=Math.min(e.acc,.35);e.acc=0;
   // QA-frozen and captured specimens keep their current location. Natural
   // spawns are placed in habitat by the spawn adapter rather than teleported here.
   const frozen=p.freezeTimer>0||this.state.isTimeStopped;
   let clip='Idle';
   if(profile.flight){if(!frozen)Object.assign(e,advanceFlight(e,dt));const phase=e.phase,t=e.elapsed/durations[phase],ease=x=>x*x*(3-2*x);p.flightState=phase;
    let height=profile.height;if(phase==='Descending')height*=1-ease(t);if(phase==='Landing'||phase==='GroundIdle')height=0;if(phase==='Takeoff')height*=ease(t);
    if(!frozen){p.mesh.position.y=height;if(['Flying','Circling'].includes(phase)){e.angle+=dt*(phase==='Circling'?.38:.23);const x=e.home.x+Math.cos(e.angle)*profile.radius,z=e.home.z+Math.sin(e.angle)*profile.radius;const step=new THREE.Vector3(x,p.mesh.position.y,z).sub(p.mesh.position);step.y=0;if(step.length()>0){step.clampLength(0,profile.speed*dt);const next=p.mesh.position.clone().add(step);if(!this.state.obstacles.some(o=>Math.hypot(next.x-o.x,next.z-o.z)<o.radius+1.5)){p.mesh.position.copy(next);p.mesh.rotation.y=Math.atan2(step.x,step.z);}}}}
    clip=phase==='GroundIdle'?'Idle':phase==='Landing'?'Land':phase==='Takeoff'?'Takeoff':phase==='Circling'?'Glide':'Fly';
   }else{if(!frozen){e.idle-=dt;const target=new THREE.Vector3(e.target.x,0,e.target.z),dir=target.sub(p.mesh.position);dir.y=0;if(e.idle<=0){if(dir.length()<.4){e.target=point(e.zone,this.state.obstacles)||e.target;e.idle=1.5+Math.random()*3;}else{dir.normalize();const next=p.mesh.position.clone().addScaledVector(dir,profile.speed*dt);if(!this.state.obstacles.some(o=>Math.hypot(next.x-o.x,next.z-o.z)<o.radius+.6)){p.mesh.position.copy(next);p.mesh.rotation.y=Math.atan2(dir.x,dir.z);}clip=profile.swim?'Swim':'Walk';}}p.mesh.position.y=profile.swim?.10:0;}if(profile.swim)clip='Swim';if(profile.cocoon)clip='Idle';}
   if(p.animation.current!==clip)p.animation.play(clip,{once:clip==='Land'||clip==='Takeoff'});p.animation.update(this.state.isTimeStopped?0:dt);return true;
  }
  place(type){const p=profiles[type];return p?point(zones[p.habitat],this.state.obstacles):null;}
 }
 global.V5Ecology={Ecology,profiles,zones,lod,advanceFlight,point,durations};if(typeof module!=='undefined')module.exports=global.V5Ecology;
})(typeof window!=='undefined'?window:globalThis);
