/* 真新鎮的可維護場景組裝：中央中心、住宅、研究所、草地、水岸。 */
window.buildPalletTown = (scene, state, renderer) => {
 const T=THREE, town=new T.Group();town.name='Pallet Town';scene.add(town);
 const materials=new Map(),mat=c=>{if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.85}));return materials.get(c);};
 const mesh=(parent,geo,c,x,y,z,rx=0,ry=0,rz=0)=>{const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=renderer.shadowMap.enabled;m.receiveShadow=true;parent.add(m);return m;};
 const box=(p,c,x,y,z,w,h,d,rx=0,ry=0,rz=0)=>mesh(p,new T.BoxGeometry(w,h,d),c,x,y,z,rx,ry,rz);
 const sphere=(p,c,x,y,z,sx,sy=sx,sz=sx)=>{const m=mesh(p,new T.SphereGeometry(1,12,8),c,x,y,z);m.scale.set(sx,sy,sz);return m;};
 const disc=(p,c,x,z,r,y=.04)=>mesh(p,new T.CircleGeometry(r,48),c,x,y,z,-Math.PI/2);
 function label(parent,text,x,y,z,width=5,bg='#fff9e9',fg='#31545a'){
  const c=document.createElement('canvas');c.width=768;c.height=144;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,768,144);ctx.strokeStyle=fg;ctx.lineWidth=7;ctx.strokeRect(9,9,750,126);ctx.fillStyle=fg;ctx.font='bold 58px "Microsoft JhengHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,77);
  const m=new T.Mesh(new T.PlaneGeometry(width,width*144/768),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),side:T.DoubleSide}));m.position.set(x,y,z);parent.add(m);return m;
 }
 function roof(p,w,d,y,c){
  const h=2.8,shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(0,h);shape.lineTo(w/2,0);shape.closePath();
  const g=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,steps:1});mesh(p,g,c,0,y,-d/2);
  const slope=Math.atan2(h,w/2),sideLength=Math.hypot(w/2,h);
  for(const s of [-1,1])for(let row=0;row<4;row++)for(let col=0;col<Math.ceil(d/.9);col++){
   const t=(row+.5)/4;box(p,row%2?c:0xc36557,s*w/2*t,y+h*(1-t)+.035,-d/2+.45+col*.9,sideLength/4+.06,.10,.84,0,0,-s*slope);
  }
  box(p,0xe7ad84,0,y+h+.06,0,.22,.20,d+.25);
 }
 function house(name,x,z,color,lab=false){
  const p=new T.Group();p.name=name;p.position.set(x,0,z);town.add(p);const w=lab?14:9,d=lab?9:7,h=lab?5.4:5;
  box(p,0xd2c3aa,0,.22,0,w+.6,.44,d+.6);box(p,0xfff3d9,0,h/2+.35,0,w,h,d);box(p,0xe6b58e,0,.7,d/2+.04,w,.85,.08);roof(p,w+1.3,d+1.4,h+.35,color);
  box(p,0x7f6c5a,0,1.65,d/2+.12,1.65,2.75,.20);box(p,0x8ecbc6,0,2.10,d/2+.24,1.2,1.4,.02);sphere(p,0xf0d17f,.54,1.33,d/2+.30,.06);
  box(p,0xd8c2a2,0,.18,d/2+.60,2.5,.36,1.2);
  for(const s of [-1,1]){box(p,0x597f84,s*w*.31,2.8,d/2+.1,2.12,2.1,.20);box(p,0xa6d7de,s*w*.31,2.8,d/2+.23,1.82,1.8,.05);box(p,0xffffff,s*w*.31,2.8,d/2+.29,.08,1.9,.08);box(p,0xffffff,s*w*.31,2.8,d/2+.29,1.9,.08,.08);box(p,0xae7151,s*w*.31,1.62,d/2+.34,2.2,.32,.48);for(let i=0;i<5;i++)sphere(p,[0xf6959f,0xffd75c,0xb799d7][i%3],s*w*.31-.8+i*.4,1.91,d/2+.4,.17);}
  label(p,name,0,h-.25,d/2+.25,lab?6.6:4.6);
  if(lab){box(p,0x719899,4,6.6,-1,2,.2,2);mesh(p,new T.CylinderGeometry(.1,.1,2,8),0x59747b,4,7.5,-1);const dish=mesh(p,new T.SphereGeometry(1.2,16,8,0,Math.PI*2,0,Math.PI/2),0xdfebe3,4,8.6,-1,0,0,.4);dish.scale.y=.32;label(p,'OAK LAB',0,7.1,.1,4);}
  state.obstacles.push({x,z,radius:lab?7.1:5.4});return p;
 }
 function fence(x,z,w,rotation=0){const p=new T.Group();p.position.set(x,0,z);p.rotation.y=rotation;town.add(p);for(let i=0;i<=w;i+=1.3){box(p,0xfff7dd,i-w/2,.72,0,.17,1.42,.18);mesh(p,new T.ConeGeometry(.14,.20,4),0xfff7dd,i-w/2,1.49,0,0,Math.PI/4);}for(const y of [.43,1.1])box(p,0xfff7dd,0,y,0,w,.15,.14);}
 function path(x,z,w,d){box(town,0xd1b78b,x,.015,z,w,.06,d);for(const s of [-1,1])box(town,0xf4e1b7,x+s*(w/2+.13),.06,z,.20,.13,d);}
 // Central square and a navigable cross of sand paths.
 path(0,24,8,79);path(0,-37,7,55);path(-32,15,56,6);path(32,15,56,6);
 disc(town,0xe7d4ad,0,0,17,.11);disc(town,0xf7e8c9,0,0,15,.125);
 for(let i=0;i<32;i++){const a=i*Math.PI/16;box(town,0xd8bd94,Math.cos(a)*15.9,.10,Math.sin(a)*15.9,.9,.17,1.1,0,-a);}
 const center=new T.Group();center.name='中央寶可夢中心';town.add(center);
 box(center,0xa99e8d,0,.3,0,13.7,.60,8.6);box(center,0xfffaeb,0,2.8,0,13,5,8);box(center,0xeaa591,0,.8,4.08,13,.9,.12);
 // Red curved canopy with visible roof seams.
 const canopy=mesh(center,new T.CylinderGeometry(4.7,4.7,14.2,32,1,false,0,Math.PI),0xc94d50,0,5.20,0,0,0,Math.PI/2);
 canopy.scale.set(.45,.98,.90);
 box(center,0xc94d50,0,5.15,0,14.3,.3,8.8);
 box(center,0x436c79,0,1.9,4.17,3,3.2,.25);for(const s of [-1,1]){box(center,0x9cd5d9,s*.73,1.88,4.32,1.35,2.95,.04);box(center,0x4b7d88,s*4.28,2.55,4.13,3.8,2.2,.20);box(center,0xaddbe1,s*4.28,2.55,4.27,3.53,1.92,.05);box(center,0xfff8dd,s*4.28,2.55,4.32,.12,1.95,.03);}
 box(center,0xf6dfba,0,.15,5.1,4.5,.28,2);box(center,0xb84549,0,4.4,4.7,8.2,.45,2);
 label(center,'寶 可 夢 中 心',0,4.94,4.72,7.4,'#fff5dc','#b33e48');
 const badge=new T.Group();badge.position.set(0,7.1,3.0);center.add(badge);
 mesh(badge,new T.SphereGeometry(.92,24,16),0xfff3df,0,0,0);mesh(badge,new T.SphereGeometry(.93,24,12,0,Math.PI*2,0,Math.PI/2),0xe36560,0,0,0);box(badge,0x45636a,0,0,.88,1.78,.13,.06);mesh(badge,new T.CircleGeometry(.27,24),0x45636a,0,0,.95);mesh(badge,new T.CircleGeometry(.17,24),0xfff6e4,0,0,.96);
 center.userData={isCenter:true,healRadius:18,x:0,z:0};state.obstacles.push({x:0,z:0,radius:7.2});
 for(const s of [-1,1]){
  box(town,0xbb8765,s*10,.35,7,4.4,.7,1.8);box(town,0x658956,s*10,.71,7,4.1,.05,1.55);for(let i=0;i<7;i++)sphere(town,i%2?0xffd276:0xea89a5,s*10-1.7+i*.55,1,7,.19);
  box(town,0xa76a49,s*10,.85,11,3.3,.2,.85);box(town,0xb77a51,s*10,1.35,11.35,3.3,.8,.13);for(const dx of [-1.25,1.25])box(town,0x4b6b69,s*10+dx,.45,11,.12,.8,.65);
  mesh(town,new T.CylinderGeometry(.09,.13,4.2,8),0x496a68,s*14,2.1,10);sphere(town,0xffde8f,s*14,4.4,10,.38);
 }
 house('小智的家',-27,-8,0xb7524e);house('勁敵的家',27,-8,0xb46a4c);house('大木博士研究所',26,-35,0xb6524d,true);house('真新鎮警察局',-29,34,0x3b6eaa);
 path(-27,6,4,13);path(27,6,4,13);path(26,-19,4,18);path(-29,23,4,15);
 for(const s of [-1,1]){fence(s*27,-17,19);fence(s*37,-7,20,Math.PI/2);fence(s*22,1.5,6);}
 fence(-29,40,17);fence(-39,32,15,Math.PI/2);
 // Research garden, starter habitats, and southern Route 21 waterfront.
 for(let row=0;row<3;row++)for(let col=0;col<8;col++){
  const x=17+col*2.2,z=-48-row*2.5;box(town,0x987d50,x,.06,z,1.7,.10,1.7);sphere(town,0x67a462,x,.36,z,.40,.31,.4);sphere(town,0xeccc70,x,.55,z,.17);
 }
 label(town,'真新鎮 · PALLET TOWN',-9,2.4,29,7,'#f8eed0','#376565');for(const s of [-1,1])box(town,0x715b43,-9+s*3,1.2,28.95,.18,2.4,.18);
 label(town,'北 ↑ 1號道路',0,2.4,-48,4.8);box(town,0x806e51,0,1.2,-48,.14,2.4,.14);
 box(town,0xe5d3a6,0,.045,57,128,.06,13);box(town,0x69b9c6,0,.07,64,132,.08,10);
 for(let i=0;i<25;i++)box(town,0xa8dfd7,-61+i*5,.13,61+(i%3)*2.1,2.5,.025,.15);
 box(town,0xb0875e,0,.33,59,4,.35,11);for(let i=0;i<15;i++)box(town,0xe0bf8a,0,.53,54+i*.68,4,.05,.035);
 label(town,'南側水岸 · 21號水道',12,2.4,51,7);box(town,0x806e51,12,1.2,51,.14,2.4,.14);
 state.obstacles.push({x:0,z:68,radius:3});
 // Shared geometry + InstancedMesh keeps the tree ring inexpensive.
 const trees=[];for(let i=0;i<38;i++){const a=i*Math.PI*2/38;const x=Math.cos(a)*60,z=Math.sin(a)*55;if(z>46||Math.abs(x)<7&&z<0)continue;trees.push([x,z,1+(i%4)*.11]);}
 trees.push([-45,-30,1.2],[-39,-38,1.1],[-46,13,1.2],[44,34,1.1],[48,-24,1.3],[42,5,1.1],[-44,41,1.1]);
 const trunks=new T.InstancedMesh(new T.CylinderGeometry(.34,.50,2.6,8),mat(0x87624b),trees.length);
 const crowns=new T.InstancedMesh(new T.SphereGeometry(1,10,8),mat(0x55955c),trees.length*3);const dummy=new T.Object3D();
 trees.forEach(([x,z,s],i)=>{dummy.position.set(x,1.3*s,z);dummy.scale.set(s,s,s);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);for(let j=0;j<3;j++){dummy.position.set(x+(j-1)*1.0*s,(3.6+(j===1?1:0))*s,z+(j%2)*.2);dummy.scale.set(1.9*s,2.15*s,1.8*s);dummy.updateMatrix();crowns.setMatrixAt(i*3+j,dummy.matrix);}state.obstacles.push({x,z,radius:.65*s});});
 town.add(trunks,crowns);trunks.castShadow=renderer.shadowMap.enabled;crowns.castShadow=renderer.shadowMap.enabled;
 for(let i=0;i<14;i++){const a=i*Math.PI*2/14;sphere(town,i%2?0x80ad75:0x95bb85,Math.cos(a)*98,-2,Math.sin(a)*90,24,10+i%4*3,22);}
 // Deterministic meadow tufts outside roads/buildings.
 const tufts=new T.InstancedMesh(new T.ConeGeometry(.16,.65,3),mat(0x78aa59),180);let n=0;
 for(let i=0;i<500&&n<180;i++){const x=((i*37)%113)-56,z=((i*23)%95)-47;if(Math.abs(x)<8||Math.abs(z-15)<5||state.obstacles.some(o=>Math.hypot(x-o.x,z-o.z)<o.radius+3))continue;dummy.position.set(x,.29,z);dummy.scale.set(1,1,1);dummy.updateMatrix();tufts.setMatrixAt(n++,dummy.matrix);}tufts.count=n;town.add(tufts);
 // Keep original four arenas and boundaries, with a psychic palette for Mew.
 V5GymPresentation.build(scene);
 // Bake static mesh transforms and merge by material (sign textures and instancing stay separate).
 town.updateMatrixWorld(true);const batches=new Map(),sources=[];
 town.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||Array.isArray(o.material)||o.material.map)return;const g=(o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone()).applyMatrix4(o.matrixWorld);let owner=o;while(owner.parent&&owner.parent!==town)owner=owner.parent;const building=owner.isGroup&&owner.name?owner.name:'';const key=o.material.uuid+'|'+building;if(!batches.has(key))batches.set(key,{material:building?o.material.clone():o.material,geometries:[],building});batches.get(key).geometries.push(g);sources.push(o);});
 for(const o of sources)o.parent.remove(o);
 for(const {material,geometries,building} of batches.values()){
  const g=new T.BufferGeometry();for(const name of ['position','normal','uv']){const arrays=geometries.map(x=>x.attributes[name]).filter(Boolean);if(arrays.length!==geometries.length)continue;const data=new Float32Array(arrays.reduce((n,a)=>n+a.array.length,0));let offset=0;for(const a of arrays){data.set(a.array,offset);offset+=a.array.length;}g.setAttribute(name,new T.BufferAttribute(data,arrays[0].itemSize));}
  const m=new T.Mesh(g,material);if(building)m.userData.occlusionGroup=building;m.castShadow=renderer.shadowMap.enabled;m.receiveShadow=true;town.add(m);geometries.forEach(g=>g.dispose());
 }
 window.__palletTown={center:[0,0,0],landmarks:town.children.filter(c=>c.name).map(c=>({name:c.name,x:c.position.x,z:c.position.z})),treeCount:trees.length};
 return center;
};
