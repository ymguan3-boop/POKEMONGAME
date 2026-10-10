/* Offline authoring only. Four anatomical rigs, skinned geometry and named clips.
   Gameplay never depends on this generator; production consumes the exported GLBs. */
(()=>{
 const T=THREE;
 const profiles={
  piplup:{type:'biped',height:1.8,body:[0,.60,0],head:[0,1.03,.02],limbs:[['LegL',[-.15,.28,.02]],['LegR',[.15,.28,.02]],['WingL',[-.30,.70,0]],['WingR',[.30,.70,0]]]},
  bulbasaur:{type:'quadruped',height:2.15,body:[0,.56,0],head:[0,.83,.52],limbs:[['FrontL',[-.43,.43,.40]],['FrontR',[.43,.43,.40]],['BackL',[-.43,.43,-.52]],['BackR',[.43,.43,-.52]]]},
  moltres:{type:'flying',height:3.2,body:[0,1.02,0],head:[0,1.70,.37],limbs:[['LegL',[-.19,.48,.16]],['LegR',[.19,.48,.16]],['WingL',[-.23,1.13,0]],['WingR',[.23,1.13,0]],['Tail',[0,.90,-.25]]]},
  articuno:{type:'flying',height:3.1,body:[0,1.01,0],head:[0,1.62,.03],limbs:[['LegL',[-.18,.48,.1]],['LegR',[.18,.48,.1]],['WingL',[-.24,1.20,0]],['WingR',[.24,1.20,0]],['Tail',[0,.76,-.25]]]},
  zapdos:{type:'flying',height:2.9,body:[0,1.12,0],head:[0,1.50,.08],limbs:[['LegL',[-.20,.5,.08]],['LegR',[.20,.5,.08]],['WingL',[-.22,1.30,-.10]],['WingR',[.22,1.30,-.10]],['Tail',[0,.76,-.18]]]},
  kyogre:{type:'swimmer',length:7.0,body:[0,.53,0],head:[0,.57,.69],limbs:[['FinL',[-.36,.48,.16]],['FinR',[[.36,.48,.16]][0]],['Tail',[0,.51,-.75]]]}
 };
 function build(id){
  const p=profiles[id];if(!p)throw Error('Prototype profile missing '+id);
  const raw=PalletModelsV2.build(id,true);raw.updateMatrixWorld(true);
  const box=new T.Box3().setFromObject(raw),size=box.getSize(new T.Vector3()),scale=p.length?p.length/Math.max(size.x,size.y,size.z):p.height/size.y;
  const floor=box.min.y,centerZ=(box.min.z+box.max.z)/2;
  const transform=v=>[v[0]*scale,(v[1]-floor)*scale,(v[2]-centerZ)*scale];
  const root=new T.Group();root.name=id;const bones=[],named={};
  function bone(name,pos,parent){const b=new T.Bone();b.name=name;const world=new T.Vector3(...transform(pos));b.position.copy(world);if(parent)b.position.sub(parent.userData.restWorld);b.userData.restWorld=world;parent?parent.add(b):root.add(b);bones.push(b);named[name]=b;return b;}
  const body=bone('Body',p.body),head=bone('Head',p.head,body);p.limbs.forEach(([name,v])=>bone(name,v,body));
  // Eye groups retain their own deformation bones for coordinated eyelid-style blinking.
  const eyeGroups=raw.children.filter(o=>o.isGroup&&o.children.some(c=>c.name==='eye'));
  eyeGroups.forEach((g,i)=>{const pos=g.getWorldPosition(new T.Vector3());bone('Eye'+i,pos.toArray(),head);g.userData.bone='Eye'+i;});
  const choose=(o,c)=>{
   if(o.parent.userData.bone)return o.parent.userData.bone;
   const n=o.name,x=c.x,y=c.y,z=c.z,s=x<0?'L':'R';
   if(id==='piplup'){if(y<.39)return 'Leg'+s;if(/flipper/.test(n))return 'Wing'+s;if(y>.83)return 'Head';}
   if(id==='bulbasaur'){if(y<.55&&Math.abs(x)>.22)return(z>0?'Front':'Back')+s;if(z>.56&&y>.5&&!/bulb|leaf/.test(n))return 'Head';}
   if(p.type==='flying'){if(/tail/.test(n))return'Tail';if(/wing|feather/.test(n)||Math.abs(x)>.4&&y>.75&&!/crown/.test(n))return 'Wing'+s;if(/shin|thigh|toe|talon/.test(n))return 'Leg'+s;if(z<-.3)return'Tail';if(y>1.53)return'Head';}
   if(id==='kyogre'){if(/fin|finger/.test(n))return 'Fin'+s;if(/tail-streamer/.test(n))return'Tail';}
   return'Body';
  };
  const batches=new Map();raw.traverse(o=>{if(!o.isMesh)return;const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld);g.computeBoundingBox();const c=g.boundingBox.getCenter(new T.Vector3()),joint=choose(o,c),j=bones.indexOf(named[joint]);const a=g.attributes.position,indices=new Uint16Array(a.count*4),weights=new Float32Array(a.count*4);
   for(let i=0;i<a.count;i++){const pos=transform([a.getX(i),a.getY(i),a.getZ(i)]);a.setXYZ(i,...pos);indices[i*4]=j;weights[i*4]=1;}
   g.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
   const key=o.material.uuid;if(!batches.has(key))batches.set(key,{material:o.material,list:[]});batches.get(key).list.push(g);
  });
  root.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones);skeleton.calculateInverses();
  for(const {material,list} of batches.values()){
   const g=new T.BufferGeometry();for(const name of ['position','normal','uv','skinIndex','skinWeight']){if(!list.every(v=>v.attributes[name]))continue;const at=list[0].attributes[name],C=name==='skinIndex'?Uint16Array:Float32Array,data=new C(list.reduce((n,v)=>n+v.attributes[name].array.length,0));let offset=0;for(const v of list){data.set(v.attributes[name].array,offset);offset+=v.attributes[name].array.length;}g.setAttribute(name,new T.BufferAttribute(data,at.itemSize));}
   const mat=material.clone();mat.skinning=true;mat.roughness=.73;const m=new T.SkinnedMesh(g,mat);m.name=id+'-skin';m.bind(skeleton);m.castShadow=m.receiveShadow=true;m.frustumCulled=false;root.add(m);
  }
  const tracks=(duration,recipe)=>{const tracks=[],times=Array.from({length:25},(_,i)=>i*duration/24);
   for(const [name,fn]of Object.entries(recipe)){if(!named[name])continue;const values=times.flatMap(t=>new T.Quaternion().setFromEuler(new T.Euler(...fn(t/duration))).toArray());tracks.push(new T.QuaternionKeyframeTrack(name+'.quaternion',times,values));}return tracks;};
  const clips=[],wave=(t,a)=>Math.sin(t*Math.PI*2)*a;
  function clip(name,d,recipe){clips.push(new T.AnimationClip(name,d,tracks(d,recipe)));}
  const idle={Head:t=>[wave(t,.035),wave(t,.10),0]};
  if(p.type==='flying')Object.assign(idle,{WingL:t=>[0,0,wave(t,.04)],WingR:t=>[0,0,-wave(t,.04)],Tail:t=>[0,wave(t,.08),0]});
  if(p.type==='swimmer')Object.assign(idle,{FinL:t=>[wave(t,.10),0,0],FinR:t=>[-wave(t,.10),0,0],Tail:t=>[0,wave(t,.15),0]});
  clip('Idle',3.4,idle);
  const move={Head:t=>[wave(t,.035),0,0]};
  if(p.type==='biped')Object.assign(move,{LegL:t=>[wave(t,.38),0,0],LegR:t=>[-wave(t,.38),0,0],WingL:t=>[-wave(t,.16),0,.1],WingR:t=>[wave(t,.16),0,-.1],Body:t=>[0,0,wave(t,.055)]});
  if(p.type==='quadruped')Object.assign(move,{FrontL:t=>[wave(t,.34),0,0],FrontR:t=>[-wave(t,.34),0,0],BackL:t=>[-wave(t,.34),0,0],BackR:t=>[wave(t,.34),0,0],Body:t=>[wave(t,.025),0,wave(t,.025)]});
  if(p.type==='swimmer')Object.assign(move,{FinL:t=>[0,0,wave(t,.32)],FinR:t=>[0,0,-wave(t,.32)],Tail:t=>[0,wave(t,.32),0],Body:t=>[0,wave(t,.04),0]});
  if(p.type==='flying')Object.assign(move,{Body:()=>[1.35,0,0],WingL:t=>[0,0,wave(t,.56)],WingR:t=>[0,0,-wave(t,.56)],Head:()=>[-1.35,0,0],LegL:()=>[-.4,0,0],LegR:()=>[-.4,0,0],Tail:t=>[-1.35,wave(t,.1),0]});
  clip(p.type==='flying'?'Fly':p.type==='swimmer'?'Swim':'Walk',p.type==='flying'?1.05:.9,move);
  if(p.type==='flying'){
   clip('Glide',2.1,{Body:()=>[1.35,0,0],WingL:t=>[0,0,.1+wave(t,.04)],WingR:t=>[0,0,-.1-wave(t,.04)],Head:()=>[-1.35,0,0],Tail:()=>[-1.35,0,0],LegL:()=>[-.4,0,0],LegR:()=>[-.4,0,0]});
   clip('Land',1.2,{Body:t=>[1.35*(1-t),0,0],WingL:t=>[0,0,wave(t,.28)*(1-t)],WingR:t=>[0,0,-wave(t,.28)*(1-t)]});
   clip('Takeoff',1.2,{Body:t=>[1.35*t,0,0],WingL:t=>[0,0,wave(t,.7)],WingR:t=>[0,0,-wave(t,.7)]});
  }
  clip('LookAround',2,{Head:t=>[0,wave(t,.3),0]});clip('Hurt',.5,{Body:t=>[wave(t,.12),0,wave(t,.08)]});clip('Attack',.7,{Head:t=>[wave(t,.18),0,0],Body:t=>[wave(t,.12),0,0]});
  const blinkTimes=[0,2.7,2.76,2.84,2.92,3.4];for(const [name,b]of Object.entries(named))if(name.startsWith('Eye'))clips[0].tracks.push(new T.VectorKeyframeTrack(name+'.scale',blinkTimes,[1,1,1,1,1,1,1,.08,1,1,.08,1,1,1,1,1,1,1]));
  root.animations=clips;root.userData={speciesId:id,rigType:p.type,clips:clips.map(c=>c.name),source:'V5-offline-skinned-prototype',status:'NEEDS_VISUAL_QA'};
  return root;
 }
 window.V5RigPrototypes={build,profiles};
})();
