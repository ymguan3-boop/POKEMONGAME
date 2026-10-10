/* Hand-authored V5 people, based on the supplied three-view clothing reference.
   Reference photograph is deliberately not distributed. Y up, +Z front. */
(()=>{
 const T=THREE,cache=new Map(), skin=0xeab78d, hair=0x201b18;
 const mat=c=>{if(!cache.has(c))cache.set(c,new T.MeshStandardMaterial({color:c,roughness:.78}));return cache.get(c);};
 function build(kind='trainer',suit='trainer',raw=false){
  const root=new T.Group();root.name=`person-${kind}-${suit}`;
  const joy=kind==='joy',jenny=kind==='jenny',oak=kind==='oak',adult=joy||jenny||oak,costume=['pikachu','mew','wigglytuff','blissey'].includes(suit)&&!adult;
  const base=oak?0xf4f2e8:joy?0xee8ea8:jenny?0x496bbe:suit==='pikachu'?0xffd436:suit==='mew'?0xeab6cc:suit==='wigglytuff'?0xf2bbcc:suit==='blissey'?0xee9ebd:0x0878b6;
  const dark=joy?0xc65178:jenny?0x213c83:0x075b93, pale=0x62c8e9, white=0xfffdf5;
  function mesh(g,c,p=[0,0,0],s=[1,1,1],parent=root,name='detail'){let m=new T.Mesh(g,mat(c));m.position.set(...p);m.scale.set(...s);m.name=name;m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
  const ell=(c,p,s,par=root,name='rounded form')=>mesh(new T.SphereGeometry(1,24,18),c,p,s,par,name);
  const curve=(c,pts,r=.012,par=root,name='stitched seam')=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),Math.max(12,pts.length*5),r,6,false),c,[0,0,0],[1,1,1],par,name);
  function patch(c,pts,z,parent=root,name='tailored panel'){const sh=new T.Shape();sh.moveTo(...pts[0]);pts.slice(1).forEach(p=>sh.lineTo(...p));sh.closePath();return mesh(new T.ExtrudeGeometry(sh,{depth:.014,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:2}),c,[0,0,z],[1,1,1],parent,name);}
  function torso(c){
   const profile=[[.28,.80],[.30,.86],[.29,1.15],[.32,1.49],[.27,1.62],[.13,1.69]];
   const radius=y=>{let i=1;while(i<profile.length-1&&y>profile[i][1])i++;const [a,b]=[profile[i-1],profile[i]];return T.MathUtils.lerp(a[0],b[0],(y-a[1])/(b[1]-a[1]));};
   if(!adult&&!costume){
    // The two blue fabrics share one curved surface: no flat overlay can cut
    // through the chest when the spine bends or the phone camera looks down.
    const vertices=[],colors=[],light=new T.Color(pale),deep=new T.Color(c),segments=48;
    const point=(i,row)=>{const a=i/segments*Math.PI*2;const cut=1.23-.12*Math.sin(a);const y=row===0?.80:row===1?cut:row===2?1.49:row===3?1.62:1.69;const r=radius(y);return [Math.sin(a)*r,y,Math.cos(a)*r*.63];};
    for(let row=0;row<4;row++)for(let i=0;i<segments;i++){const q=[point(i,row),point(i+1,row),point(i+1,row+1),point(i,row+1)];for(const j of [0,1,2,0,2,3]){vertices.push(...q[j]);colors.push(...(row===0?deep:light).toArray());}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();const m=mesh(g,white,[0,0,0],[1,1,1],root,'tailored curved shirt');m.material=mat(white).clone();m.material.vertexColors=true;return m;
   }
   return mesh(new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),32),c,[0,0,0],[1,1,.63],root,'tailored curved shirt');
  }
  torso(base);ell(skin,[0,1.69,0],[.115,.17,.105]);
  // Rounded cheek and jaw contours avoid a block head and keep the child recognizable.
  ell(skin,[0,1.985,.015],[.319,.369,.278],root,'face');ell(skin,[0,1.837,.035],[.239,.176,.205],root,'chin');
  for(const s of [-1,1]){
   ell(skin,[s*.315,1.976,.01],[.069,.112,.067],root,'ear');ell(0xd99279,[s*.347,1.98,.039],[.025,.065,.025],root,'ear fold');
   ell(0xfff8e9,[s*.121,2.002,.257],[.068,.041,.024],root,'eye white');
   ell(0x442b1d,[s*.119,2.005,.28],[.029,.035,.013],root,'brown iris');ell(0x151417,[s*.118,2.005,.29],[.016,.026,.007],root,'pupil');ell(white,[s*.117-.009,2.017,.296],[.008,.009,.003],root,'eye highlight');
   curve(hair,[[s*.178,2.082,.248],[s*.12,2.099,.265],[s*.066,2.084,.26]],.013,root,'eyebrow');
   ell(0xeeb097,[s*.18,1.934,.25],[.058,.025,.007],root,'cheek');
  }
  ell(skin,[0,1.961,.286],[.039,.043,.043],root,'nose');
  ell(0x743e36,[0,1.883,.296],[.088,.042,.01],root,'smile');ell(white,[0,1.899,.307],[.066,.013,.004],root,'smiling teeth');
  curve(adult?0xc3757d:0xb16d5a,[[-.083,1.889,.303],[0,1.854,.309],[.083,1.889,.303]],.009,root,'lower lip');
  const hc=joy?0xe8789b:jenny?0x247b88:oak?0xa3a09a:hair;
  mesh(new T.SphereGeometry(1,32,20,0,Math.PI*2,0,1.36),hc,[0,2.029,-.006],[.338,.347,.31],root,'close cropped hair');
  // Individually swept locks provide a clear hairline and directional texture.
  for(let i=0;i<25;i++){let a=(i-12)*.108,x=Math.sin(a)*.292,z=Math.cos(a)*.259;curve(i%3===0?(adult?hc:0x393127):hc,[[x*.84,2.264,z*.64],[x,2.21,z*.92],[x*.98+.015,2.141+Math.abs(x)*.18,z]],.016,root,'swept hair strand');}
  for(const s of [-1,1])ell(hc,[s*.289,2.083,-.015],[.027,.14,.17],root,'temple hair');
  const legs=[],arms=[];
  for(const s of [-1,1]){
   const leg=new T.Group();leg.name=s<0?'left leg':'right leg';leg.position.set(s*.155,.86,0);root.add(leg);legs.push(leg);
   const trouser=costume?base:adult?(jenny?0x304d98:0xf9ecec):0x97918a;
   ell(trouser,[0,-.1,0],[.143,.24,.15],leg,'shorts');
   curve(costume?white:0xb7b0a8,[[-.112,-.255,.09],[0,-.265,.151],[.112,-.255,.09]],.009,leg,'shorts hem');
   ell(skin,[0,-.43,.007],[.097,.235,.10],leg,'calf');
   ell(white,[0,-.675,.072],[.122,.09,.202],leg,'sneaker');ell(0xe2ded5,[0,-.735,.083],[.123,.028,.207],leg,'rubber sole');
   ell(white,[0,-.6,.005],[.086,.083,.09],leg,'sock');
   for(let i=0;i<4;i++)curve(0xcac8c1,[[-.064,-.637-i*.012,.062+i*.027],[0,-.622-i*.014,.076+i*.027],[.064,-.637-i*.012,.062+i*.027]],.008,leg,'shoe lace');
   curve(0xd9d5cc,[[-.10,-.68,.17],[0,-.689,.259],[.10,-.68,.17]],.006,leg,'toe cap seam');
   const arm=new T.Group();arm.name=s<0?'left arm':'right arm';arm.position.set(s*.286,1.52,0);root.add(arm);arms.push(arm);arm.rotation.z=-s*.08;
   ell(base,[s*.04,-.10,0],[.137,.208,.148],arm,'sleeve');curve(costume?white:dark,[[s*.04-.10,-.23,.075],[s*.04,-.25,.134],[s*.04+.10,-.23,.075]],.01,arm,'sleeve cuff');
   ell(skin,[s*.07,-.375,.017],[.08,.204,.082],arm,'forearm');ell(skin,[s*.071,-.568,.03],[.087,.108,.067],arm,'hand');
   ell(skin,[s*.01,-.55,.073],[.036,.069,.035],arm,'thumb');for(let j=0;j<3;j++)curve(0xc99576,[[s*.072+(j-1)*.027,-.58,.088],[s*.072+(j-1)*.027,-.622,.073]],.0035,arm,'finger crease');
  }
  if(!adult&&!costume){
   for(const s of [-1,1])patch(dark,[[s*.025,1.667],[s*.145,1.657],[s*.20,1.534],[s*.10,1.493]],.191,root,'polo collar');
   patch(dark,[[-.027,1.64],[.027,1.64],[.027,1.33],[-.027,1.33]],.205,root,'button placket');
   for(let i=0;i<3;i++)ell(white,[0,1.57-i*.092,.232],[.014,.014,.008],root,'polo button');
   ell(white,[.172,1.442,.208],[.06,.068,.012],root,'round adventure badge');ell(0xf4bb47,[.172,1.46,.223],[.042,.032,.006]);curve(0x0878b6,[[.136,1.432,.226],[.153,1.45,.227],[.174,1.426,.227],[.19,1.439,.226],[.212,1.426,.226]],.008);
  }
  curve(adult?white:dark,[[-.25,.844,.09],[0,.823,.186],[.25,.844,.09]],.008,root,'shirt hem');
  if(costume){
   ell(suit==='pikachu'?0xffe46a:0xffe6ed,[0,1.235,.18],[.224,.30,.034],root,'costume belly');
   curve(white,[[0,1.55,.222],[0,1.3,.223],[0,.94,.212]],.008,root,'costume zipper');ell(0xcabdbb,[.014,1.49,.236],[.014,.027,.009],root,'zip pull');
   // Closed back shell with an open face; the same head remains inside every suit.
   mesh(new T.SphereGeometry(1,24,18,0,Math.PI),base,[0,2.025,-.025],[.36,.37,.30],root,'hood back shell').rotation.y=Math.PI;
   for(const sign of [-1,1]){ell(0x292e38,[sign*.12,2.272,.19],[.023,.032,.014],root,'hood character eye');ell(white,[sign*.126,2.283,.202],[.007,.008,.005],root,'hood eye highlight');}
   if(suit==='pikachu')for(const y of [1.15,1.35])patch(0x916234,[[-.21,y],[.21,y],[.21,y+.07],[-.21,y+.07]],-.199,root,'Pikachu back stripe');
   // Open hood: the face remains fully exposed.
   for(const s of [-1,1]){ell(base,[s*.302,1.997,-.029],[.071,.31,.224],root,'open hood rim');ell(base,[s*.221,2.258,-.04],[.14,.08,.20],root,'hood top');}
   if(suit==='pikachu'){
    for(const s of [-1,1]){const e=ell(base,[s*.275,2.477,-.06],[.074,.29,.052],root,'Pikachu hood ear');e.rotation.z=-s*.3;const tip=ell(0x34302d,[s*.345,2.667,-.06],[.057,.104,.051],root,'black ear tip');tip.rotation.z=-s*.3;ell(0xeb5747,[s*.32,1.884,.11],[.025,.062,.060],root,'red cheek on hood');}
    const tail=patch(base,[[.04,.98],[.29,1.16],[.19,1.26],[.47,1.43],[.48,1.20],[.34,1.24],[.44,1.08],[.13,.90]],-.26,root,'lightning tail');
   }else if(suit==='wigglytuff'){
    for(const s of [-1,1]){patch(base,[[s*.12,2.24],[s*.34,2.63],[s*.39,2.27]],-.10,root,'triangular hood ear');patch(0x62475e,[[s*.19,2.30],[s*.325,2.54],[s*.35,2.31]],-.067,root,'inner triangular ear');}
    curve(base,[[0,.97,-.17],[.25,1.00,-.4],[.31,1.23,-.43],[.12,1.32,-.43],[.03,1.16,-.43],[.15,1.09,-.43],[.19,1.18,-.43]],.060,root,'costume curl tail');
    curve(base,[[.07,2.31,.14],[-.085,2.36,.18],[-.095,2.26,.22],[.025,2.25,.22],[.055,2.31,.21]],.043,root,'curled forelock');
   }else if(suit==='blissey'){
    for(const s of [-1,1])for(let j=0;j<3;j++)ell(white,[s*(.29+j*.047),1.2+j*.068,.06],[.10,.044,.10],root,'wing ruffle');
    ell(0xfae0ce,[0,1.17,.249],[.10,.135,.044],root,'egg pouch');curve(white,[[-.12,1.15,.26],[0,1.08,.30],[.12,1.15,.26]],.022,root,'pouch trim');
    for(const s of [-1,1])curve(base,[[s*.28,2.12,-.06],[s*.41,2.17,-.05],[s*.42,2.05,.03]],.055,root,'curled hood ribbon');
   }else{
    for(const s of [-1,1]){const e=ell(base,[s*.255,2.304,-.06],[.10,.133,.07]);e.rotation.z=-s*.4;}
    curve(base,[[0,.92,-.18],[.22,.83,-.38],[.39,1.08,-.42],[.26,1.24,-.4]],.03,root,'Mew costume tail');ell(0xf5ccdb,[.26,1.24,-.4],[.054,.082,.051]);
   }
  }
  if(suit==='none'&&!adult){ell(0xeca74b,[0,1.32,-.25],[.245,.27,.10],root,'adventure backpack');for(const s of [-1,1])curve(0xe7b569,[[s*.2,1.60,-.16],[s*.21,1.51,.18],[s*.21,1.08,.18]],.028,root,'backpack strap');}
  if(oak){for(const s of [-1,1]){patch(0xdedbd1,[[s*.02,1.67],[s*.24,1.56],[s*.12,1.37]],.205,root,'lab coat lapel');patch(0xe8e5de,[[s*.13,1.21],[s*.25,1.21],[s*.25,1.06],[s*.13,1.06]],.21,root,'lab coat pocket');}ell(0x765944,[0,1.39,.21],[.045,.21,.02],root,'research shirt');}
  if(joy||jenny){
   mesh(new T.LatheGeometry([[.34,.70],[.34,.75],[.30,.95],[.27,1.18]].map(p=>new T.Vector2(...p)),32),joy?base:0x304d98,[0,0,0],[1,1,.7],root,'uniform skirt');
   for(const s of [-1,1])curve(hc,[[s*.185,2.028,.25],[s*.20,2.042,.235]],.009,root,'eyelash');
   if(joy){
    for(const s of [-1,1]){ell(hc,[s*.30,1.95,-.13],[.13,.14,.15],root,'Joy hair coil');curve(0xf5a5bf,[[s*.33,1.89,-.005],[s*.39,1.96,-.05],[s*.32,2.04,-.015],[s*.27,1.97,.00]],.021);}
    patch(white,[[-.22,1.56],[.22,1.56],[.235,.79],[-.235,.79]],.201,root,'nurse apron');curve(white,[[-.23,1.48,.16],[0,1.39,.235],[.23,1.48,.16]],.028,root,'apron shoulder straps');
    ell(white,[0,2.316,0],[.25,.088,.19],root,'nurse cap');patch(0xe45173,[[-.025,2.347],[.025,2.347],[.025,2.30],[.073,2.30],[.073,2.254],[.025,2.254],[.025,2.214],[-.025,2.214],[-.025,2.254],[-.073,2.254],[-.073,2.30],[-.025,2.30]],.164,root,'nurse cap cross');
   }else{
    ell(0x264b8d,[0,2.323,0],[.33,.10,.28],root,'police cap');ell(0x172d5a,[0,2.277,.23],[.29,.035,.185],root,'police visor');ell(0xedc65b,[0,2.326,.265],[.052,.058,.015],root,'police cap badge');
    for(const s of [-1,1])patch(0x1e3f80,[[s*.035,1.66],[s*.16,1.63],[s*.19,1.48],[s*.06,1.54]],.19,root,'uniform collar');
    curve(0xead36a,[[0,1.53,.213],[0,1.35,.211],[0,1.14,.205]],.009,root,'uniform fastening');ell(0xf2d677,[.17,1.44,.208],[.035,.049,.012],root,'police badge');
    curve(0x183157,[[-.27,1.01,.08],[0,.99,.192],[.27,1.01,.08]],.035,root,'utility belt');ell(0xe6c757,[0,.991,.23],[.039,.026,.007]);
   }
  }
  // Batch by material separately for the torso and each movable limb.
  function bake(group){group.updateMatrixWorld(true);const inv=new T.Matrix4().copy(group.matrixWorld).invert(),batches=new Map();for(const child of [...group.children]){if(!child.isMesh)continue;const g=child.geometry.toNonIndexed().applyMatrix4(new T.Matrix4().multiplyMatrices(inv,child.matrixWorld));const key=child.material.uuid;if(!batches.has(key))batches.set(key,{material:child.material,list:[]});batches.get(key).list.push(g);group.remove(child);child.geometry.dispose();}for(const {material,list} of batches.values()){const g=new T.BufferGeometry();for(const attr of ['position','normal']){const data=new Float32Array(list.reduce((n,v)=>n+v.attributes[attr].array.length,0));let o=0;for(const v of list){data.set(v.attributes[attr].array,o);o+=v.attributes[attr].array.length;}g.setAttribute(attr,new T.BufferAttribute(data,3));}g.computeBoundingBox();const m=new T.Mesh(g,material);m.castShadow=m.receiveShadow=true;group.add(m);list.forEach(g=>g.dispose());}}
  if(raw){root.updateMatrixWorld(true);return root;}
  [...legs,...arms,root].forEach(bake);
  const box=new T.Box3().setFromObject(root);const height=box.max.y-box.min.y,factor=2.35/height;root.scale.setScalar(factor);root.position.y=-box.min.y*factor;
  const wrapper=new T.Group();wrapper.name=root.name;wrapper.add(root);wrapper.userData={kind,suit,height:2.35,source:'hand-authored-reference-people-v5'};return wrapper;
 }
 function animate(root,time,speed=0){const swing=Math.sin(time*9)*Math.min(.45,Math.abs(speed)*.07);['left leg','right leg'].forEach((name,i)=>{const x=root.getObjectByName(name);if(x)x.rotation.x=swing*(i?-1:1);});['left arm','right arm'].forEach((name,i)=>{const x=root.getObjectByName(name);if(x)x.rotation.x=swing*(i?1:-1)*.75;});}
 window.PalletPeopleV5={build,animate};
})();
