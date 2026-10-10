/* Offline character wardrobe authoring. Every costume binds to ONE skeleton.
   Units: metres, +Y up, +Z front; root never carries animation displacement. */
(()=>{
 const T=THREE,wardrobe=['trainer','none','pikachu','mew','wigglytuff','blissey'];
 function build(kind='trainer'){
  const root=new T.Group();root.name='PlayerVisual';const bones=[],named={};
  const floor=.097,scale=1.04;
  const world=p=>new T.Vector3(p[0]*scale,(p[1]-floor)*scale,p[2]*scale);
  function joint(name,p,parent){const b=new T.Bone();b.name=name;b.userData.rest=world(p);b.position.copy(b.userData.rest);if(parent)b.position.sub(named[parent].userData.rest);(parent?named[parent]:root).add(b);bones.push(b);named[name]=b;return b;}
  joint('Hips',[0,.86,0]);joint('Spine',[0,1.32,0],'Hips');joint('Head',[0,1.70,0],'Spine');
  for(const [s,x]of [['L',-1],['R',1]]){
   joint('Thigh'+s,[x*.155,.86,0],'Hips');joint('Knee'+s,[x*.155,.50,0],'Thigh'+s);joint('Foot'+s,[x*.155,.20,.04],'Knee'+s);
   joint('Arm'+s,[x*.286,1.52,0],'Spine');joint('Elbow'+s,[x*.32,1.24,.01],'Arm'+s);joint('Hand'+s,[x*.34,1.00,.03],'Elbow'+s);
   joint('Eye'+s,[x*.12,2.005,.28],'Head');
  }
  joint('Tail',[0,1,-.20],'Hips');
  root.updateMatrixWorld(true);const skeleton=new T.Skeleton(bones);skeleton.calculateInverses();
  const suits=kind==='trainer'?wardrobe:['trainer'];
  for(const suit of suits){
   const raw=PalletPeopleV5.build(kind,suit,true);raw.updateMatrixWorld(true);const batches=new Map();
   raw.traverse(o=>{
    if(!o.isMesh)return;const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld);g.computeBoundingBox();const c=g.boundingBox.getCenter(new T.Vector3()),n=o.name;
    let owner='Hips',blend=null;const side=c.x<0?'L':'R';
    if(/leg/.test(o.parent.name)){owner=/shorts/.test(n)?'Thigh'+side:/shoe|sneaker|sole|sock|toe cap/.test(n)?'Foot'+side:'Knee'+side;}
    else if(/arm/.test(o.parent.name)){owner=/sleeve/.test(n)?'Arm'+side:/hand|thumb|finger/.test(n)?'Hand'+side:'Elbow'+side;}
    else if(/tail|tail tip/i.test(n))owner='Tail';
    else if(/eye white|iris|pupil|eye highlight/.test(n))owner='Eye'+side;
    else if(c.y>1.71)owner='Head';else if(c.y>1.20)owner='Spine';
    const a=g.attributes.position,ix=new Uint16Array(a.count*4),wt=new Float32Array(a.count*4);
    for(let i=0;i<a.count;i++){
     const y=a.getY(i),p=world([a.getX(i),y,a.getZ(i)]);a.setXYZ(i,p.x,p.y,p.z);let b=owner,other=null,w=1;
     // Gradual joint weights across elbows/knees keep limbs continuous while bending.
     if(owner==='Knee'+side){other='Thigh'+side;w=T.MathUtils.clamp((.61-y)/.15,0,1);}
     if(owner==='Elbow'+side){other='Arm'+side;w=T.MathUtils.clamp((1.32-y)/.18,0,1);}
     if(owner==='Spine'&&y<1.44){other='Hips';w=T.MathUtils.clamp((y-1.05)/.39,0,1);}
     ix[i*4]=bones.indexOf(named[b]);wt[i*4]=w;if(other){ix[i*4+1]=bones.indexOf(named[other]);wt[i*4+1]=1-w;}
    }
    g.setAttribute('skinIndex',new T.Uint16BufferAttribute(ix,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(wt,4));const key=o.material.uuid;if(!batches.has(key))batches.set(key,{material:o.material,geometries:[]});batches.get(key).geometries.push(g);
   });
   for(const {material,geometries:gs}of batches.values()){
    const g=new T.BufferGeometry();for(const k of ['position','normal','skinIndex','skinWeight',...(gs[0].attributes.color?['color']:[])]){const at=gs[0].attributes[k],C=k==='skinIndex'?Uint16Array:Float32Array,arr=new C(gs.reduce((n,g)=>n+g.attributes[k].array.length,0));let offset=0;for(const a of gs){arr.set(a.attributes[k].array,offset);offset+=a.attributes[k].array.length;}g.setAttribute(k,new T.BufferAttribute(arr,at.itemSize));}
    // Weld only identical position/normal/weight tuples. Preserve hard normals and skin seams.
    const keys=new Map(),kept=[],index=[];const attrs=Object.values(g.attributes);
    for(let i=0;i<g.attributes.position.count;i++){const key=attrs.flatMap(a=>Array.from(a.array.subarray(i*a.itemSize,(i+1)*a.itemSize),v=>Math.round(v*1e6))).join(',');let j=keys.get(key);if(j===undefined){j=kept.length;keys.set(key,j);kept.push(i);}index.push(j);}
    for(const [name,a]of Object.entries(g.attributes)){const arr=new a.array.constructor(kept.length*a.itemSize);kept.forEach((i,j)=>arr.set(a.array.subarray(i*a.itemSize,(i+1)*a.itemSize),j*a.itemSize));g.setAttribute(name,new T.BufferAttribute(arr,a.itemSize));}g.setIndex(index);
    const mat=material.clone();mat.skinning=true;mat.roughness=.82;const m=new T.SkinnedMesh(g,mat);m.name='costume_'+suit+'_'+root.children.length;m.userData.costume=suit;m.bind(skeleton);m.castShadow=m.receiveShadow=true;m.frustumCulled=false;root.add(m);
   }
  }
  const clips=[],sin=(t,a)=>Math.sin(t*Math.PI*2)*a;
  function clip(name,d,recipe,bob=0){const ts=Array.from({length:33},(_,i)=>d*i/32),tracks=[];for(const [name,fn]of Object.entries(recipe)){tracks.push(new T.QuaternionKeyframeTrack(name+'.quaternion',ts,ts.flatMap(t=>new T.Quaternion().setFromEuler(new T.Euler(...fn(t/d))).toArray())));}
   if(bob){const p=named.Hips.position;tracks.push(new T.VectorKeyframeTrack('Hips.position',ts,ts.flatMap(t=>[p.x,p.y+Math.abs(Math.sin(t/d*Math.PI*2))*bob,p.z])));}
   clips.push(new T.AnimationClip(name,d,tracks));return clips[clips.length-1];}
  const idle={Spine:t=>[sin(t,.015),sin(t,.025),0],Head:t=>[0,sin(t,.035),0],ArmL:()=>[0,0,.06],ArmR:()=>[0,0,-.06],Tail:t=>[0,sin(t,.12),0]};
  const idleClip=clip('Idle',3.4,idle);
  for(const s of ['L','R'])idleClip.tracks.push(new T.VectorKeyframeTrack('Eye'+s+'.scale',[0,2.7,2.77,2.85,2.94,3.4],[1,1,1,1,1,1,1,.10,1,1,.10,1,1,1,1,1,1,1]));
  function gait(a){return {Hips:t=>[0,sin(t,.065),sin(t,.025)],Spine:t=>[.025,-sin(t,.10),0],Head:t=>[-.025,sin(t,.035),0],ThighL:t=>[sin(t,a),0,0],ThighR:t=>[-sin(t,a),0,0],KneeL:t=>[Math.max(0,-sin(t,a*.8)),0,0],KneeR:t=>[Math.max(0,sin(t,a*.8)),0,0],FootL:t=>[-Math.max(0,sin(t,a*.22)),0,0],FootR:t=>[-Math.max(0,-sin(t,a*.22)),0,0],ArmL:t=>[-sin(t,a*.8),0,.06],ArmR:t=>[sin(t,a*.8),0,-.06],ElbowL:t=>[-.14-Math.max(0,sin(t,.15)),0,0],ElbowR:t=>[-.14-Math.max(0,-sin(t,.15)),0,0],Tail:t=>[0,sin(t,.15),0]};}
  clip('Walk',.9,gait(.43),.025);clip('Run',.60,gait(.67),.06);
  clip('StartWalk',.3,{Spine:t=>[.06*Math.sin(t*Math.PI),0,0],ArmR:t=>[t*.15,0,-.06]});clip('Stop',.3,{Spine:t=>[-.06*Math.sin(t*Math.PI),0,0]});
  for(const sign of [-1,1])clip(sign<0?'TurnLeft':'TurnRight',.45,{Hips:t=>[0,sign*.1*Math.sin(t*Math.PI),0],Spine:t=>[0,sign*.18*Math.sin(t*Math.PI),0],Head:t=>[0,sign*.20*Math.sin(t*Math.PI),0]});
  clip('Aim',1.8,{Spine:()=>[0,-.18,0],ArmR:()=>[-.65,0,-.3],ElbowR:()=>[-1.2,0,0],Head:()=>[0,.16,0],ArmL:()=>[-.12,0,.1]});
  // Release marker at .24 seconds. Gameplay owns the ballistic formula.
  clip('Throw',.66,{Hips:t=>[0,Math.sin(t*Math.PI)*.16,0],Spine:t=>[Math.sin(t*Math.PI)*.14,-.20+.65*Math.sin(t*Math.PI),0],ArmR:t=>[t<.36?.7-2.9*t/.36:-2.2+2.2*(t-.36)/.64,0,-.2],ElbowR:t=>[-1.15*Math.max(0,1-t/.40),0,0],ArmL:t=>[-.25*Math.sin(t*Math.PI),0,.12],Head:t=>[0,.16*(1-t),0]});
  clip('CaptureWait',2,{Spine:t=>[.04,0,sin(t,.02)],ArmL:()=>[-.24,0,.12],ArmR:()=>[-.24,0,-.12],ElbowL:()=>[-.25,0,0],ElbowR:()=>[-.25,0,0]});
  clip('CatchFail',.9,{Head:t=>[.18*Math.sin(t*Math.PI),0,0],Spine:t=>[.09*Math.sin(t*Math.PI),0,0]});
  for(let i=1;i<=3;i++)clip('CatchSuccess'+i,1.25,{ArmL:t=>[-(i===2?2.5:1.8)*Math.sin(t*Math.PI),0,.20],ArmR:t=>[-(i===1?2.4:1.8)*Math.sin(t*Math.PI),0,-.20],ElbowL:t=>[-.55*Math.sin(t*Math.PI),0,0],ElbowR:t=>[-.55*Math.sin(t*Math.PI),0,0],Head:t=>[-.10*Math.sin(t*Math.PI),sin(t,.1),0]},i===3?.13:.04);
  clip('LookAtNPC',1.5,{Head:t=>[0,sin(t,.15),0]});clip('TalkIdle',2.4,{Head:t=>[sin(t,.055),sin(t,.09),0],ArmR:t=>[-.15+sin(t,.12),0,-.1]});
  clip('Nod',.7,{Head:t=>[.17*Math.sin(t*Math.PI*2),0,0]});clip('Wave',1.2,{ArmR:()=>[-2.1,0,-.4],ElbowR:t=>[-.25+sin(t,.25),0,0],HandR:t=>[0,0,sin(t,.25)]});
  for(const name of ['ReceiveItem','GiveItem'])clip(name,1.25,{ArmL:t=>[-.85*Math.sin(t*Math.PI),0,.1],ArmR:t=>[-.85*Math.sin(t*Math.PI),0,-.1],ElbowL:t=>[-.4*Math.sin(t*Math.PI),0,0],ElbowR:t=>[-.4*Math.sin(t*Math.PI),0,0],Head:t=>[.08*Math.sin(t*Math.PI),0,0]});
  root.animations=clips;root.userData={kind,wardrobe:suits,sharedSkeleton:true,releaseTime:.24,source:'V5 offline authoring',qa:'NEEDS_VISUAL_REVIEW'};return root;
 }
 window.V5PeopleRig={build,wardrobe};
})();
