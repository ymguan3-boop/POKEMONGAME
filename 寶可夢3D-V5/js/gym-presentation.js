/* Four distinct arenas and attacks. Gameplay still owns damage, timing and radii. */
(()=>{const T=THREE,palettes={pikachu:[0x15374b,0xffd344],mew:[0x222348,0xbba0ff],wigglytuff:[0x45284e,0xff9bc8],blissey:[0x315955,0xffd9b0]};
function mesh(g,geometry,color,x,y,z,emissive=false){const m=new T.Mesh(geometry,emissive?new T.MeshBasicMaterial({color,transparent:true,opacity:.8,side:T.DoubleSide}):new T.MeshStandardMaterial({color,roughness:.65}));m.position.set(x,y,z);g.add(m);return m;}
function ring(g,r,color,y=.05,width=.08){const m=mesh(g,new T.RingGeometry(r-width,r,64),color,0,y,0,true);m.rotation.x=-Math.PI/2;return m;}
function build(scene){for(const [type,x,z,r]of [['pikachu',500,0,25],['mew',0,500,30],['wigglytuff',-500,0,27],['blissey',0,-500,30]]){const [base,accent]=palettes[type],g=new T.Group();g.name='v5-arena-'+type;g.position.set(x,0,z);scene.add(g);mesh(g,new T.CylinderGeometry(r,r,.4,64),base,0,-.20,0);ring(g,r-1,accent,.04,.15);ring(g,6,accent,.06,.09);ring(g,2.5,0xffffff,.07,.06);
for(let i=0;i<16;i++){const a=i*Math.PI/8,px=Math.sin(a)*(r-.6),pz=Math.cos(a)*(r-.6);mesh(g,new T.CylinderGeometry(.23,.32,1.4,8),base,px,.7,pz);mesh(g,new T.SphereGeometry(.24,10,8),accent,px,1.45,pz,true);const line=mesh(g,new T.BoxGeometry(.07,.03,r-7),accent,Math.sin(a)*(r+7)/2,.04,Math.cos(a)*(r+7)/2,true);line.rotation.y=a;}
if(type==='mew')for(const r of [10,16,22])ring(g,r,accent,.035,.04);
if(type==='pikachu')for(const side of [-1,1]){const pts=[[-2,4],[1,0],[-1,0],[2,-4]].map(([x,z])=>new T.Vector3(x+side*12,.06,z));const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:accent}));g.add(line);}
if(type==='wigglytuff')for(let i=0;i<10;i++){const a=i*Math.PI/5;ringAt(g,Math.sin(a)*16,Math.cos(a)*16,1.3,accent);}
if(type==='blissey')for(const side of [-1,1]){mesh(g,new T.BoxGeometry(4,.03,1),accent,side*14,.05,0);mesh(g,new T.BoxGeometry(1,.03,4),accent,side*14,.05,0);}
}}
function ringAt(g,x,z,r,c){const m=ring(g,r,c);m.position.x=x;m.position.z=z;}
// Layered but bounded gym VFX; collision radius and damage are controlled by GymBoss.
function attack(type,radius){
 const g=new T.Group(),c=palettes[type][1],layers={rings:[],motes:[],bolts:[],shells:[]};
 g.userData.attackType=type;
 function glow(geo,color,opacity=.8,x=0,y=.2,z=0){
  const m=mesh(g,geo,color,x,y,z,true);
  m.material.opacity=opacity;m.material.depthWrite=false;return m;
 }
 function diskRing(r,color,height,width=.09,opacity=.7){
  const m=glow(new T.RingGeometry(Math.max(.1,r-width),r,48),color,opacity,0,height,0);
  m.rotation.x=-Math.PI/2;layers.rings.push(m);return m;
 }
 // Three staggered telegraph rings: the original radius remains the real collision boundary.
 diskRing(radius,c,.085,.12,.88);
 diskRing(radius*.65,0xffffff,.105,.055,.28);
 diskRing(radius*.34,c,.12,.075,.58);
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4;
  const m=glow(new T.OctahedronGeometry(.12+(i%2)*.045,0),c,.75,Math.sin(a)*radius*.73,.26,Math.cos(a)*radius*.73);
  m.userData.angle=a;m.userData.distance=radius*.73;layers.motes.push(m);
 }
 if(type==='pikachu'){
  // Electrical forked lightning, bright center sparks and a second concentric wave.
  for(let i=0;i<7;i++){
   const angle=i*Math.PI*2/7,r=radius*(.35+(i%3)*.16);
   const pts=[[0,.18,0],[.23,.65,.10],[-.12,1.0,.15],[.36,1.56,.0],[-.10,2.10,-.18]]
    .map(([x,y,z])=>new T.Vector3(Math.cos(angle)*r+x,y,Math.sin(angle)*r+z));
   const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:i%2?0xfff5a1:c,transparent:true,opacity:.86}));
   g.add(line);layers.bolts.push(line);
  }
 }else if(type==='mew'){
  // Three multidirectional psychic energy hoops orbiting a pulsing core.
  for(let i=0;i<3;i++){
   const m=glow(new T.TorusGeometry(radius*(.3+i*.18),.065,7,42),i%2?0x8fe9ff:c,.63,0,.65+i*.42,0);
   m.rotation.x=Math.PI/2+i*.36;layers.shells.push(m);
  }
  const core=glow(new T.IcosahedronGeometry(.5,1),0xffe2ff,.85,0,1.4,0);layers.shells.push(core);
 }else if(type==='wigglytuff'){
  // Visible expanding song/sound-wave ribbons plus pink singing notes.
  for(let i=0;i<4;i++)diskRing(radius*(.27+i*.19),i%2?0xffd9f3:c,.24+i*.17,.075,.60);
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3;
   const stem=glow(new T.CylinderGeometry(.035,.035,.48,5),0xffe4fa,.79,Math.sin(a)*radius*.6,.55,Math.cos(a)*radius*.6);
   stem.userData.noteStem=true;layers.shells.push(stem);
   const note=glow(new T.SphereGeometry(.16,8,6),c,.88,stem.position.x-.09,.31,stem.position.z);
   layers.shells.push(note);
  }
 }else if(type==='blissey'){
  // Soft protective egg shields plus orbiting healing pearls, avoiding a flat single ring.
  for(let i=0;i<3;i++){
   const m=glow(new T.TorusGeometry(radius*(.24+i*.18),.055,8,36),i%2?0xffffff:c,.48,0,.6+i*.34,0);
   m.rotation.x=Math.PI/2+i*.25;layers.shells.push(m);
  }
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3;
   const egg=glow(new T.SphereGeometry(.20,10,8),i%2?0xfff2b4:0xffd4dd,.72,
    Math.cos(a)*radius*.52,1+Math.sin(a*2)*.25,Math.sin(a)*radius*.52);
   egg.scale.y=1.45;layers.shells.push(egg);
  }
 }
 layers.shells.forEach(m=>{m.userData.baseY=m.position.y;});
 g.userData.layers=layers;
 g.userData.animate=time=>{
  const t=Number.isFinite(time)?time:0;
  for(let i=0;i<layers.rings.length;i++){
   const m=layers.rings[i];
   const pulse=.94+Math.sin(t*4-i*.55)*.09;
   m.scale.setScalar(pulse);
   m.material.opacity=(i===0?.75:.43)+Math.sin(t*3+i*.7)*.09;
  }
  for(let i=0;i<layers.motes.length;i++){
   const m=layers.motes[i],a=m.userData.angle+t*(type==='pikachu'?2.1:.8),d=m.userData.distance;
   m.position.x=Math.sin(a)*d;m.position.z=Math.cos(a)*d;
   m.position.y=.4+Math.sin(t*6+i*.8)*.29;
   m.rotation.y=t*2+i;
  }
  for(let i=0;i<layers.bolts.length;i++){
   layers.bolts[i].material.opacity=.45+Math.abs(Math.sin(t*13+i*.85))*.48;
  }
  for(let i=0;i<layers.shells.length;i++){
   const m=layers.shells[i];
   if(m.geometry?.type==='TorusGeometry')m.rotation.z=t*(i%2?-.6:.6)+i*.2;
   else if(!m.userData.noteStem)m.position.y=m.userData.baseY+Math.sin(t*5+i)*.11;
   m.material.opacity=.48+Math.abs(Math.sin(t*3.5+i*.5))*.30;
  }
 };
 return g;
}
// Cast trail lasts <1 second; no gameplay changes and geometries are released by the particle manager.
function cast(scene,particles,type,start,end){
 if(!scene||!Array.isArray(particles)||!start||!end||!palettes[type])return;
 const g=new T.Group(),color=palettes[type][1],direction=end.clone().sub(start);
 const length=Math.max(.1,direction.length());
 const beam=new T.Mesh(new T.CylinderGeometry(type==='pikachu'?.13:.07,.05,length,7),
   new T.MeshBasicMaterial({color,transparent:true,opacity:.72,depthWrite:false}));
 beam.position.copy(start).add(end).multiplyScalar(.5);
 beam.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());
 g.add(beam);
 for(let i=0;i<6;i++){
  const t=(i+.5)/6,angle=i*Math.PI/3;
  const m=new T.Mesh(type==='wigglytuff'?new T.TorusGeometry(.20,.05,5,12):
    type==='mew'?new T.IcosahedronGeometry(.17,0):
    type==='blissey'?new T.SphereGeometry(.19,8,6):new T.OctahedronGeometry(.2,0),
    new T.MeshBasicMaterial({color:i%2?0xffffff:color,transparent:true,opacity:.88,depthWrite:false}));
  m.position.copy(start).lerp(end,t);
  m.position.x+=Math.cos(angle)*.37;m.position.y+=Math.sin(angle)*.34;
  if(type==='blissey')m.scale.y=1.5;
  g.add(m);
 }
 scene.add(g);
 particles.push({mesh:g,time:0,update(dt){
   this.time+=Math.max(0,dt);
   const k=Math.min(1,this.time/.70);
   g.children.forEach((child,i)=>{
    if(child.material)child.material.opacity=Math.max(0,(i===0?.65:.9)*(1-k));
    if(i>0){child.rotation.y+=dt*4;child.position.y+=dt*(type==='mew'?1.0:.6);}
   });
   if(k>=1){scene.remove(g);return false;}
   return true;
 }});
}
function hp(boss,camera){const el=document.getElementById('boss-hp-container');if(!boss||boss.isDead){el.style.visibility='hidden';return;}const pos=boss.mesh.position.clone().add(new T.Vector3(0,(boss.modelHeight||3.5)+.35,0)).project(camera);el.style.visibility=pos.z<1&&Math.abs(pos.x)<1&&Math.abs(pos.y)<1?'visible':'hidden';el.style.left=(pos.x+1)*innerWidth/2+'px';el.style.top=(1-pos.y)*innerHeight/2+'px';}
function radar(ctx,player,angle,npcs){const labels=[],project=(x,z)=>{const dx=x-player.position.x,dz=z-player.position.z,d=Math.hypot(dx,dz);if(d>50)return null;const a=Math.atan2(dx,dz)-angle;return [55+Math.sin(a)*d*.9,55-Math.cos(a)*d*.9];};ctx.save();ctx.font='7px sans-serif';ctx.textAlign='center';ctx.lineWidth=2;
for(const [name,x,z]of [['中心',0,0],['警局',-29,34],['研究所',26,-32]]){const p=project(x,z);if(!p)continue;ctx.fillStyle='#d4f7ff';ctx.fillRect(p[0]-2,p[1]-2,4,4);const ly=Math.max(12,Math.min(99,p[1]-5));labels.push([p[0],ly]);ctx.strokeStyle='#18352b';ctx.strokeText(name,p[0],ly);ctx.fillText(name,p[0],ly);}
for(const n of npcs?.actors||[]){const pos=n.mesh?.position||n.root?.position;if(!pos)continue;const p=project(pos.x,pos.z);if(!p)continue;ctx.fillStyle='#76eeff';ctx.beginPath();ctx.arc(...p,2,0,Math.PI*2);ctx.fill();const text=(n.name||'NPC').replace('小姐','').replace('博士','');const label=[8,-8,16,-16].map(d=>[Math.max(14,Math.min(96,p[0])),Math.max(10,Math.min(101,p[1]+d))]).find(([lx,ly])=>!labels.some(([x,y])=>Math.abs(x-lx)<20&&Math.abs(y-ly)<8));if(label){ctx.strokeStyle='#18352b';ctx.strokeText(text,...label);ctx.fillText(text,...label);labels.push(label);}}
ctx.restore();}
window.V5GymPresentation={build,attack,cast,hp,radar};})();
