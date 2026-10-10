/* Detailed reference-led model kit. Coordinates: Y up, face towards +Z. No old model reuse. */
(()=>{
 const T=THREE,registry=new Map(),materials=new Map();
 function material(color,options={}){const key=JSON.stringify([color,options]);if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:.58,...options}));return materials.get(key);}
 function builder(id){
  const root=new T.Group();root.name=id+'-detailed-v2';let serial=0;
  const add=(geometry,color,p=[0,0,0],s=[1,1,1],rot=[0,0,0],name='part',options={})=>{const m=new T.Mesh(geometry,material(color,options));m.name=name+'-'+serial++;m.position.set(...p);m.scale.set(...s);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;};
  const ell=(c,p,s,rot=[0,0,0],name='form')=>add(new T.SphereGeometry(1,24,16),c,p,s,rot,name);
  const ball=(c,p,r,name='sphere')=>ell(c,p,[r,r,r],[0,0,0],name);
  const box=(c,p,s,rot=[0,0,0],name='plate')=>add(new T.BoxGeometry(...s),c,p,[1,1,1],rot,name);
  const cone=(c,p,r,h,rot=[0,0,0],name='horn')=>add(new T.ConeGeometry(r,h,16),c,p,[1,1,1],rot,name);
  const tube=(c,pts,r=.05,name='curve',tipRadius)=>{
   const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),g=new T.TubeGeometry(curve,Math.max(20,pts.length*6),r,10,false);
   if(tipRadius!==undefined){const a=g.attributes.position,n=g.attributes.normal,segments=g.parameters.tubularSegments,radial=10;for(let i=0;i<=segments;i++){const p=curve.getPointAt(i/segments),factor=1+(tipRadius/r-1)*i/segments;for(let j=0;j<=radial;j++){const k=i*(radial+1)+j;a.setXYZ(k,p.x+(a.getX(k)-p.x)*factor,p.y+(a.getY(k)-p.y)*factor,p.z+(a.getZ(k)-p.z)*factor);}}g.computeVertexNormals();}
   return add(g,c,[0,0,0],[1,1,1],[0,0,0],name);
  };
  const link=(c,a,b,r1,r2=r1,name='limb')=>{const aa=new T.Vector3(...a),bb=new T.Vector3(...b),d=bb.clone().sub(aa),m=add(new T.CylinderGeometry(r2,r1,d.length(),16),c,aa.clone().add(bb).multiplyScalar(.5).toArray(),[1,1,1],[0,0,0],name);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;};
  const leaf=(c,p,s,rot=[0,0,0],name='leaf')=>{
   const shape=new T.Shape();shape.moveTo(0,-.5);shape.bezierCurveTo(-.65,-.12,-.40,.26,0,.5);shape.bezierCurveTo(.4,.26,.65,-.12,0,-.5);const g=new T.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1,curveSegments:8});return add(g,c,p,s,rot,name);
  };
  const patch=(c,points,depth=.04,name='membrane')=>{const sh=new T.Shape();sh.moveTo(points[0][0],points[0][1]);points.slice(1).forEach(p=>sh.lineTo(p[0],p[1]));sh.closePath();return add(new T.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:2}),c,[0,0,0],[1,1,1],[0,0,0],name);};
  const eye=(p,s=[.11,.15,.06],iris=0x813d46,rot=[0,0,0])=>{
   const group=new T.Group();group.position.set(...p);group.rotation.set(...rot);root.add(group);
   const create=(c,pos,sz)=>{const m=new T.Mesh(new T.SphereGeometry(1,20,14),material(c,{roughness:.28}));m.position.set(...pos);m.scale.set(...sz);m.name='eye';group.add(m);return m;};
   create(0xfffcf4,[0,0,0],s);create(iris,[0,-s[1]*.03,s[2]*.78],[s[0]*.65,s[1]*.78,s[2]*.46]);create(0x15202c,[0,-s[1]*.06,s[2]*1.06],[s[0]*.28,s[1]*.58,s[2]*.20]);create(0xffffff,[-s[0]*.25,s[1]*.35,s[2]*1.23],[s[0]*.20,s[1]*.16,s[2]*.12]);return group;
  };
  const mouth=(pts,r=.016,c=0x45283e)=>tube(c,pts,r,'mouth');
  const flame=(p,s=1)=>{const [x,y,z]=p;tube(0xf45129,[[x,y-.2*s,z],[x-.12*s,y+.04*s,z],[x+.06*s,y+.33*s,z],[x-.05*s,y+.72*s,z]],.21*s,'outer-flame',.004);tube(0xffb92f,[[x,y-.22*s,z+.10*s],[x+.06*s,y,z+.12*s],[x-.01*s,y+.38*s,z+.12*s]],.12*s,'inner-flame',.002);};
  return {root,add,ell,ball,box,cone,tube,link,leaf,patch,eye,mouth,flame,material};
 }
 const register=(id,fn)=>{if(registry.has(id))throw Error('duplicate model '+id);registry.set(id,fn);};
 function build(id,raw=false){
  const fn=registry.get(id);if(!fn)throw Error('Missing detailed model '+id);const b=builder(id);fn(b,window.PalletRoster?.dex[id]);
  if(raw)return b.root;
  // The models are rigid sculptures with runtime motion on their root. Bake static parts
  // by material so detailed toes, feathers and eyes do not each cost a draw call.
  b.root.updateMatrixWorld(true);const batches=new Map(),parts=[];
  b.root.traverse(o=>{if(!o.isMesh)return;const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld);const key=o.material.uuid;if(!batches.has(key))batches.set(key,{material:o.material,geometries:[]});batches.get(key).geometries.push(g);parts.push(o.name);});
  b.root.clear();
  for(const {material,geometries} of batches.values()){
   const g=new T.BufferGeometry();for(const name of ['position','normal','uv']){const arrays=geometries.map(x=>x.attributes[name]).filter(Boolean);if(arrays.length!==geometries.length)continue;const data=new Float32Array(arrays.reduce((n,a)=>n+a.array.length,0));let offset=0;for(const a of arrays){data.set(a.array,offset);offset+=a.array.length;}g.setAttribute(name,new T.BufferAttribute(data,arrays[0].itemSize));}
   g.computeBoundingBox();const m=new T.Mesh(g,material);m.name='baked-detail';m.castShadow=true;m.receiveShadow=true;b.root.add(m);geometries.forEach(g=>g.dispose());
  }
  b.root.userData={species:id,source:'official-reference-remodel-v2',axis:'Y-up/Z-forward',authoredParts:parts};return b.root;
 }
 window.PalletModelsV2={register,build,ids:()=>[...registry.keys()],builder};
})();
