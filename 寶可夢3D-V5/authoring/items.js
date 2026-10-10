/* Offline authored props; no extracted game meshes or textures. */
(()=>{const T=THREE;
 function build(id){if(['normal','great','master','berry','supply'].includes(id))return PalletPropsV5.item(id);const g=new T.Group();g.name='item-'+id;
  const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.48});function mesh(geo,c,p,scale=[1,1,1]){const m=new T.Mesh(geo,mat(c));m.position.set(...p);m.scale.set(...scale);g.add(m);return m;}const box=(c,p,s)=>mesh(new T.BoxGeometry(...s),c,p),ell=(c,p,s)=>mesh(new T.SphereGeometry(1,20,14),c,p,s);
  if(id==='ultra'){const b=PalletPropsV5.ball('normal');b.traverse(o=>{if(o.isMesh&&o.material.color.getHex()===0xe82e35)o.material.color.setHex(0x252938)});g.add(b);for(const x of [-.105,.105]){const pts=[];for(let i=0;i<=14;i++){const a=.18+i*.105;pts.push(new T.Vector3(x,Math.sin(a)*.217,Math.cos(a)*.217));}mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),20,.022,6,false),0xf7cc38,[0,0,0]);}}
  else if(id==='potion'){ell(0x9765bf,[0,.24,0],[.18,.22,.12]);box(0xba96dc,[0,.42,0],[.21,.08,.17]);box(0xe6e4df,[0,.49,0],[.06,.09,.06]);box(0xd34f98,[.055,.55,0],[.23,.075,.12]);box(0x6d408f,[.16,.53,0],[.07,.05,.075]);ell(0xf6e2fb,[0,.27,.116],[.09,.115,.012]);box(0xbc5aa3,[0,.28,.135],[.024,.13,.012]);box(0xbc5aa3,[0,.28,.135],[.10,.024,.012]);}
  else if(id==='revive'){const c=mesh(new T.OctahedronGeometry(.25,0),0xf8d367,[0,.29,0],[.7,1.15,.65]);c.rotation.z=.13;mesh(new T.OctahedronGeometry(.15,0),0xffeb94,[0,.34,.04],[.6,1.1,.65]);}
  else{const color={thunderStone:0x78aa68,fireStone:0xea9955,waterStone:0x61b9cc}[id];if(!color)throw Error('unknown item '+id);const stone=mesh(new T.IcosahedronGeometry(.24,1),color,[0,.26,0],[.8,1.1,.7]);stone.rotation.z=.14;
   if(id==='thunderStone'){const sh=new T.Shape();sh.moveTo(.03,.44);sh.lineTo(-.075,.27);sh.lineTo(-.01,.27);sh.lineTo(-.05,.11);sh.lineTo(.09,.31);sh.lineTo(.025,.31);sh.closePath();mesh(new T.ExtrudeGeometry(sh,{depth:.014,bevelEnabled:false}),0xf9e565,[0,0,.164]);}
   else if(id==='fireStone'){ell(0xfad065,[0,.28,.17],[.07,.13,.015]);ell(0xec6d43,[.013,.27,.187],[.036,.078,.008]);}
   else{ell(0xd1f3ef,[0,.26,.17],[.07,.10,.012]);const drop=mesh(new T.ConeGeometry(.067,.10,16),0xd1f3ef,[0,.365,.17],[1,1,.23]);}}
  g.updateMatrixWorld(true);const b=new T.Box3().setFromObject(g),scale=.6/(b.max.y-b.min.y);g.scale.setScalar(scale);g.position.y=-b.min.y*scale;const root=new T.Group();root.add(g);root.userData={kind:id,height:.6,source:'V5 offline authored item'};return root;
 }
 function companion(id){const root=PalletNpcPokemonV5.build(id);root.updateMatrixWorld(true);const meshes=[];root.traverse(o=>{if(o.isMesh)meshes.push(o)});const groups={};
  const joint=(name,p)=>{const a=new T.Group();a.name=name;a.position.set(...p);root.add(a);groups[name]=a;};
  if(id==='arcanine'){for(const s of [-1,1])for(const f of [-1,1])joint((f>0?'Front':'Back')+(s<0?'L':'R'),[s*.38,.9,f>0?.55:-.70]);joint('Tail',[0,1.4,-1]);joint('Head',[0,1.5,.7]);}
  else{joint('LegL',[-.3,.23,0]);joint('LegR',[.3,.23,0]);joint('ArmL',[-.35,.75,.2]);joint('ArmR',[.35,.75,.2]);}
  for(const m of meshes){const c=m.getWorldPosition(new T.Vector3()),n=m.name;let name;
   if(id==='arcanine'){if(/leg|paw|toe|ankle/.test(n))name=(c.z>0?'Front':'Back')+(c.x<0?'L':'R');else if(/tail/.test(n))name='Tail';else if(/head|face|muzzle|nose|ear|eye|brow|mouth|forehead/.test(n))name='Head';}
   else if(n==='foot')name='Leg'+(c.x<0?'L':'R');else if(n==='arm')name='Arm'+(c.x<0?'L':'R');
   if(name)groups[name].attach(m);
  }
  const clips=[];function clip(name,d,amp){const times=Array.from({length:25},(_,i)=>i*d/24),tracks=[];for(const [name,g]of Object.entries(groups)){const axis=name==='Head'||name==='Tail'?new T.Vector3(0,1,0):new T.Vector3(1,0,0);const phase=/FrontL|BackR|LegL|ArmR/.test(name)?1:-1;tracks.push(new T.QuaternionKeyframeTrack(name+'.quaternion',times,times.flatMap(t=>new T.Quaternion().setFromAxisAngle(axis,Math.sin(t/d*Math.PI*2)*amp*phase).toArray())));}clips.push(new T.AnimationClip(name,d,tracks));}clip('Idle',3.4,.035);clip('Walk',.8,.32);clip('Rest',4,.018);root.animations=clips;return root;
 }
 window.V5ItemAuthoring={build,companion};
})();
