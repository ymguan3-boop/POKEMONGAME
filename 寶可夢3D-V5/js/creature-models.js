/* 手工撰寫的 Three.js 造型。每族依輪廓、配色、器官與進化特徵建模；Y 向上、Z 朝前。 */
(() => {
 const T=THREE, mats=new Map();
 const mat=c=>{if(!mats.has(c))mats.set(c,new T.MeshStandardMaterial({color:c,roughness:.68}));return mats.get(c);};
 const white=0xfff5df, black=0x182735;
 function build(id){
  const root=new T.Group(); root.name=id+'-authored';
  const add=(geo,c,p=[0,0,0],s=[1,1,1],r=[0,0,0])=>{const m=new T.Mesh(geo,mat(c));m.position.set(...p);m.scale.set(...s);m.rotation.set(...r);m.castShadow=true;m.receiveShadow=true;root.add(m);return m;};
  const orb=(c,x,y,z,sx,sy=sx,sz=sx)=>add(new T.SphereGeometry(1,16,12),c,[x,y,z],[sx,sy,sz]);
  const cone=(c,x,y,z,rad,h,rx=0,rz=0)=>add(new T.ConeGeometry(rad,h,10),c,[x,y,z],[1,1,1],[rx,0,rz]);
  const box=(c,x,y,z,w,h,d,rx=0,rz=0)=>add(new T.BoxGeometry(w,h,d),c,[x,y,z],[1,1,1],[rx,0,rz]);
  const tube=(c,pts,r=.07)=>add(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),24,r,7,false),c);
  const leaf=(c,x,y,z,s,rz=0)=>{const m=orb(c,x,y,z,.18*s,.55*s,.065*s);m.rotation.z=rz;return m;};
  const eyes=(y,z,x=.24,c=0xb52636,sz=.11)=>{for(const side of [-1,1]){orb(white,side*x,y,z,sz*1.15,sz*1.4,sz*.4);orb(c,side*x,y,z+sz*.35,sz*.66,sz,sz*.25);orb(black,side*x,y,z+sz*.55,sz*.28,sz*.65,sz*.18);orb(0xffffff,side*x-.018,y+.038,z+sz*.7,.025);}};
  const feet=(c,x=.36,y=.17,z=.17)=>{for(const side of [-1,1])orb(c,side*x,y,z,.22,.17,.34);};
  const arms=(c,y=.85,x=.46)=>{for(const side of [-1,1]){const m=orb(c,side*x,y,.13,.16,.32,.19);m.rotation.z=side*.35;}};
  const claws=(x,y,z)=>{for(const side of [-1,1])for(let i=0;i<3;i++)cone(white,side*x+(i-1)*.1,y,z,.045,.16,Math.PI/2);};
  const flame=(x,y,z,s=1)=>{cone(0xf44823,x,y,z,.22*s,.75*s,0,-.1);cone(0xffb528,x,y-.10*s,z+.03,.14*s,.50*s,0,.1);cone(0xffee81,x,y-.17*s,z+.07,.075*s,.30*s);};
  const wings=(c,y=1.2,spread=1.5,spiky=false)=>{for(const side of [-1,1]){for(let j=0;j<5;j++){const m=orb(c,side*(.6+j*.19)*spread,y+.28-j*.12,-.12-j*.09,.18,.62-j*.045,.07);m.rotation.z=-side*(.75+j*.05);if(spiky)cone(black,side*(1.03+j*.13)*spread,y-.04-j*.15,-.18,.09,.5,0,-side*.8);}}};
  const info=PalletRoster.dex[id], family=info?.family, stage=info?.stage||1;
  if(family==='bulbasaur'){
    const c=stage===3?0x388f8d:0x73bfa0;
    orb(c,0,.62,-.1,.62,.43,.74);orb(c,0,.81,.55,.60,.46,.46);
    for(const x of [-.43,.43])for(const z of [-.49,.48]){orb(c,x,.29,z,.21,.29,.23);for(let j=0;j<3;j++)cone(white,x+(j-1)*.09,.13,z+.2,.042,.14,Math.PI/2);}
    cone(c,-.4,1.19,.51,.15,.30,0,-.2);cone(c,.4,1.19,.51,.15,.30,0,.2);eyes(.92,.944,.29,0xc0354a,.13);
    for(const [x,y,z] of [[-.31,.77,.94],[.36,.64,.91],[-.57,.7,.18],[.55,.79,-.3]])orb(0x276f65,x,y,z,.085,.10,.02);
    orb(0x328449,0,1.18,-.27,.48,.50,.44);
    for(let i=0;i<6;i++){const a=i*Math.PI/3;const l=leaf(0x2d9258,Math.cos(a)*.42,1.10,-.27+Math.sin(a)*.36,1.2);l.rotation.x=Math.sin(a)*1.2;l.rotation.z=Math.cos(a)*1.2;}
    if(stage===2)orb(0xe7648a,0,1.60,-.27,.27,.42,.27);
    if(stage===3){box(0x8c5b3d,0,1.57,-.27,.21,.8,.21);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const p=orb(0xe76d8b,Math.cos(a)*.58,1.94,-.27+Math.sin(a)*.58,.43,.14,.31);p.rotation.y=-a;orb(white,Math.cos(a)*.66,2.06,-.27+Math.sin(a)*.66,.055,.015,.055);}orb(0xf7c45b,0,2.03,-.27,.32,.19,.32);}
  }else if(family==='charmander'){
    const c=stage===1?0xf6a447:0xd75642;orb(c,0,.74,0,.42,.6,.37);orb(0xffdf9b,0,.71,.30,.3,.46,.1);orb(c,0,1.42,.09,.43,.41,.37);orb(c,0,1.3,.37,.31,.16,.26);eyes(1.52,.411,.23,0x285d6f,.105);feet(c);arms(c,1.0);tube(c,[[0,.4,-.2],[.15,.22,-.7],[.5,.44,-.93],[.6,.79,-.8]],.13);flame(.6,1,-.8,.7);claws(.35,.13,.48);if(stage===2)cone(c,0,1.85,-.07,.17,.42,-.2);
  }else if(family==='squirtle'){
    const c=stage===3?0x527cb0:0x79c2e4;orb(0x946342,0,.80,-.13,.61,.65,.38);orb(white,0,.79,.1,.60,.61,.23);orb(0xe7cb8d,0,.8,.23,.48,.54,.16);
    for(const y of [.58,.83,1.05])tube(0xb39965,[[-.4,y,.32],[0,y-.05,.405],[.4,y,.32]],.016);
    orb(c,0,1.5,.13,.44,.39,.40);eyes(1.57,.493,.23,0x71404a,.11);feet(c,.43);arms(c,1,.59);
    if(stage===1)tube(c,[[0,.45,-.35],[.52,.5,-.56],[.62,.8,-.53],[.42,.85,-.53]],.12);
    if(stage===2){for(const side of [-1,1]){leaf(0xc3e5f4,side*.4,1.88,.02,.85,-side*.55);}tube(0xc3e5f4,[[0,.35,-.4],[.55,.45,-.66],[.73,.98,-.66],[.38,1.03,-.66],[.39,.77,-.66]],.17);}
    if(stage===3){for(const side of [-1,1]){const cannon=add(new T.CylinderGeometry(.13,.18,.80,12),0xc5d4de,[side*.48,1.37,-.11],[1,1,1],[.9,0,0]);add(new T.CylinderGeometry(.098,.098,.012,12),black,[side*.48,1.622,.21],[1,1,1],[.9,0,0]);cone(c,side*.34,1.87,.05,.13,.22);}}
  }else if(family==='chikorita'){
    const c=stage===2?0xe0cf75:0xb5d97b;orb(c,0,.55,0,.52,.44,.67);for(const x of [-.35,.35])for(const z of [-.36,.38])orb(c,x,.22,z,.16,.24,.18);
    const neck=stage===3?.65:stage===2?.4:.15;orb(c,0,.91+neck,.35,.36,.37,.36);orb(c,0,.73,.30,.3,.50+neck,.30);eyes(1.0+neck,.676,.19,0xb3444e,.09);
    if(stage<3){const l=leaf(0x488644,.07,1.59+neck,.19,1.4,-.35);l.rotation.x=-.35;if(stage===2)box(c,-.12,1.91,.16,.13,.1,.2);}
    for(let i=0;i<(stage===3?8:6);i++){let a=i*Math.PI*2/(stage===3?8:6);if(stage===3){const p=orb(0xf17a9d,Math.cos(a)*.46,.92,.25+Math.sin(a)*.40,.26,.09,.35);p.rotation.y=-a;}else orb(0x538b41,Math.cos(a)*.30,.72+neck,.32+Math.sin(a)*.3,.10,.14,.1);}
    if(stage===3)for(const side of [-1,1])tube(0xeabf54,[[side*.16,1.90,.29],[side*.18,2.18,.34],[side*.28,2.25,.4]],.055);
    tube(c,[[0,.45,-.45],[.1,.4,-.80],[.15,.65,-.96]],.095);
  }else if(family==='cyndaquil'){
    const upright=stage===3,c=0x294855;orb(c,0,upright?.92:.65,-.12,.42,upright?.80:.43,.58);orb(0xf4d396,0,upright?.91:.55,.23,.34,upright?.67:.34,.29);
    orb(c,0,upright?1.72:.91,.34,.36,.33,.4);orb(0xf4d396,0,upright?1.59:.80,.62,.26,.20,.39);eyes(upright?1.78:.98,.62,.22,0xb64635,.085);feet(0xf4d396);arms(0xf4d396,upright?1.18:.5);
    for(let i=0;i<7;i++){const a=i/6*Math.PI;flame(Math.cos(a)*.43,upright?1.66:1.02,-.29-Math.sin(a)*.25,.7+(i%2)*.4);}if(stage===2)for(let i=0;i<3;i++)flame((i-1)*.15,.87,-.7,.65);
  }else if(family==='totodile'){
    const c=0x559dcc;orb(c,0,.77,0,.48,.62,.39);orb(0xf5daa0,0,.76,.31,.34,.42,.12);orb(c,0,1.4,.18,.46,.38,.43);box(c,0,1.27,.62,.66,.26,.47);box(0x843e4e,0,1.22,.82,.55,.035,.10);eyes(1.56,.535,.26,0xb73c42,.12);feet(c,.43);arms(c,1.05,.53);claws(.43,.13,.47);
    for(const x of [-.23,.23])for(const z of [.62,.84])cone(white,x,1.16,z,.06,.13,Math.PI);
    tube(c,[[0,.35,-.25],[0,.3,-.69],[0,.45,-1.01]],.19);for(let i=0;i<4;i++)cone(0xdd5e51,0,.68+i*.24,-.48,.16,.30,-.55);
    if(stage===2){for(let i=0;i<5;i++)orb(0x5288aa,(i%2?-.2:.2),.53+i*.1,.43,.07,.06,.02);}if(stage===3){for(const side of [-1,1])cone(0xdd5e51,side*.37,1.84,.10,.18,.5,0,-side*.3);}
  }else if(family==='treecko'){
    const c=stage===1?0x75b879:0x449e67;orb(c,0,.85,0,.31,.49,.27);orb(0xd77663,0,.84,.239,.20,.30,.04);orb(c,0,1.45,.08,.46,.31,.35);eyes(1.48,.393,.27,0xe4ba42,.13);feet(c,.25);arms(c,1.01,.4);
    if(stage===1){orb(0x4b8f61,0,.48,-.43,.22,.50,.22);orb(0x4b8f61,.1,.31,-.69,.22,.40,.20);}else{
      tube(c,[[0,.53,-.2],[0,.45,-.7],[.05,.9,-1.0]],.14);
      for(const side of [-1,1])for(let i=0;i<3;i++)leaf(0x246f4b,side*(.48+i*.07),.95+i*.12,.06,.7,-side*.65);
      leaf(0x287d48,0,1.98,-.10,1.3,-.15);
      if(stage===3){for(let i=0;i<6;i++){const a=i*Math.PI/3;leaf(0x2b794b,Math.cos(a)*.29,.57,-.76+Math.sin(a)*.23,1.6,a);}for(const side of [-1,1])for(let i=0;i<3;i++)orb(0xf0cf58,side*.2,1.06-i*.22,-.21,.09);}
    }
  }else if(family==='torchic'){
    const c=stage===3?0xc85b4f:0xeea343;
    if(stage===1){orb(c,0,.53,0,.41,.42,.38);orb(c,0,1.0,.05,.42,.4,.37);eyes(1.09,.39,.20,black,.09);cone(0xf9cd66,0,.95,.47,.13,.27,Math.PI/2);feet(0xd09b4c,.24,.12,.10);arms(0xffd565,.61,.4);for(let i=0;i<3;i++)leaf(0xf4b74a,(i-1)*.1,1.51,0,.53,(i-1)*.2);}
    else{orb(c,0,1.02,0,.36,.49,.28);for(const side of [-1,1]){orb(stage===3?0xebbc77:0xeed692,side*.25,.46,.03,.22,.43,.23);feet(c,.26,.12,.13);const a=orb(c,side*.46,1.04,.08,.14,.37,.15);a.rotation.z=side*.3;}orb(stage===3?0xf0dec0:0xeed692,0,1.65,.04,.32,.38,.28);eyes(1.7,.29,.18,0x578bac,.09);cone(0xe6b45b,0,1.57,.35,.11,.22,Math.PI/2);if(stage===3){for(const side of [-1,1]){const l=leaf(0xf0dec0,side*.30,1.59,-.05,1.2,side*.55);flame(side*.44,.89,.08,.35);}box(0xf4d795,0,1.25,.26,.15,.34,.05);}else for(let i=0;i<3;i++)cone(0xde7747,(i-1)*.12,2.05,.01,.09,.30);}
  }else if(family==='mudkip'){
    const c=0x68b6df;orb(c,0,.64,0,.46,.43,.49);orb(0xb8d7e5,0,.57,.32,.33,.28,.22);orb(c,0,1.08,.28,.48,.36,.36);eyes(1.19,.588,.23,black,.09);
    for(const side of [-1,1]){orb(c,side*.38,.27,.06,.2,.29,.24);if(stage===3)orb(c,side*.61,.62,.29,.22,.44,.23);else orb(c,side*.46,.61,.33,.14,.19,.22);for(let i=0;i<3;i++)cone(0xf2a455,side*(.53+i*.04),1.04+(i-1)*.13,.24,.085,.37,0,-side*Math.PI/2);}
    for(let i=0;i<(stage===3?2:1);i++){const fin=leaf(stage===1?0x467fac:0x344d6b,(i?-.18:.18)*(stage===3?1:0),1.60,.06,1.1,0);fin.rotation.y=Math.PI/2;}
    const tail=leaf(stage===3?0x344d6b:0x91cce3,0,.72,-.68,1.35);tail.rotation.x=-.4;tail.rotation.y=Math.PI/2;
  }else if(['articuno','zapdos','moltres'].includes(id)){
    const c=id==='articuno'?0x7fc4ea:id==='zapdos'?0xf4cc48:0xf1b766;orb(c,0,.9,0,.35,.58,.34);orb(c,0,1.59,.12,.3,.32,.28);eyes(1.66,.363,.16,0xa54148,.075);cone(0xd1a16d,0,1.49,.51,.10,.46,Math.PI/2);wings(c,1.21,1.05,id==='zapdos');feet(0xb49a75,.22,.13,.18);
    if(id==='articuno'){for(let i=-1;i<=1;i++)cone(0x4282b8,i*.14,1.96,.05,.085,.34,0,-i*.3);for(let i=-1;i<=1;i++)tube(0x68b4df,[[i*.1,.60,-.2],[i*.2,.22,-.8],[i*.2,.32,-1.55],[i*.3,.78,-1.85]],.085);}
    if(id==='zapdos'){for(let i=-2;i<=2;i++)cone(c,i*.15,1.92-Math.abs(i)*.06,-.05,.12,.51,0,-i*.3);for(let i=-1;i<=1;i++)cone(black,i*.2,.58,-.67,.14,.83,-Math.PI/2);}
    if(id==='moltres'){for(let i=-2;i<=2;i++){flame(i*.37,1.5-Math.abs(i)*.1,-.23,.7);flame(i*.14,.37,-.7,.6);}flame(0,1.99,.03,.7);}
  }else if(['raikou','entei','suicune'].includes(id)){
    const c=id==='raikou'?0xe8bd4e:id==='entei'?0x95664c:0x74b8d4;
    orb(c,0,.85,-.15,.46,.47,.80);for(const x of [-.34,.34])for(const z of [-.58,.45]){orb(c,x,.42,z,.14,.4,.17);orb(white,x,.15,z+.08,.16,.14,.22);}orb(c,0,1.28,.61,.43,.43,.36);orb(white,0,1.12,.9,.29,.19,.18);eyes(1.40,.92,.24,0xb34351,.09);
    if(id==='raikou'){for(let i=0;i<5;i++){box(black,-.454,.85,-.65+i*.25,.025,.49,.09,-.3);box(black,.454,.85,-.65+i*.25,.025,.49,.09,.3);}orb(0x9282b5,0,1.32,-.2,.56,.26,.81);for(const s of [-1,1]){cone(white,s*.19,.88,.97,.07,.38,Math.PI);cone(0xd6c4a3,s*.29,1.73,.6,.13,.29);}tube(0x77bed7,[[0,.90,-.85],[.1,1.45,-1.03],[.38,1.44,-1.05],[.17,1.8,-1.05]],.055);}
    if(id==='entei'){for(let i=0;i<9;i++){const a=i*Math.PI*2/9;cone(0xab9e8f,Math.cos(a)*.43,1.3+Math.sin(a)*.43,.48,.16,.5,0,-a);}box(0xc05243,0,1.51,.96,.37,.13,.035);for(const s of [-1,1])cone(0xeac85d,s*.18,1.65,.85,.13,.42,0,-s*.8);for(let i=0;i<6;i++)orb(0xe5dfd5,(i%2-.5)*.3,1.35+i*.05,-.3-i*.15,.26,.15,.30);}
    if(id==='suicune'){orb(0x7270aa,0,1.31,-.20,.44,.23,.90);for(const s of [-1,1])tube(white,[[s*.3,1.2,.3],[s*.76,1.05,-.5],[s*.80,.74,-1.2],[s*.50,.63,-1.53]],.045);const crystal=add(new T.OctahedronGeometry(.38),0x72cee0,[0,1.96,.62],[.75,1.15,.4]);for(const s of [-1,1])for(let i=0;i<3;i++)add(new T.OctahedronGeometry(.11),white,[s*.44,.86,-.6+i*.3],[.2,1,1]);}
  }else if(id==='kyogre'){
    orb(0x316cab,0,.82,0,.72,.35,1.05);orb(white,0,.62,.17,.62,.17,.9);orb(0x316cab,0,.84,.68,.67,.30,.55);eyes(.98,1.143,.35,0xe9cd65,.08);
    for(const s of [-1,1]){const fin=orb(0x316cab,s*1.02,.79,0,.69,.11,.48);fin.rotation.y=s*.35;for(let i=0;i<3;i++)orb(white,s*(1.35+i*.1),.78,.12-i*.23,.2,.06,.10);tube(0xe86154,[[s*.57,.94,.40],[s*.85,.91,.05],[s*1.35,.88,-.13]],.032);}
    tube(0x316cab,[[0,.82,-.65],[0,.84,-1.23],[0,.8,-1.61]],.14);for(const s of [-1,1])orb(0x316cab,s*.34,.80,-1.6,.43,.09,.28);
  }else if(id==='groudon'){
    const c=0xc9554c;orb(c,0,.95,0,.58,.74,.45);orb(0xe3d9ca,0,.87,.34,.40,.54,.16);orb(c,0,1.66,.20,.48,.36,.44);box(c,0,1.56,.61,.59,.20,.38);eyes(1.72,.607,.25,0xf7d764,.09);feet(c,.44);arms(c,1.18,.66);claws(.44,.13,.48);claws(.64,.95,.29);
    for(let i=0;i<5;i++){const y=.44+i*.22;tube(0x4b4550,[[-.37,y,.4],[0,y-.04,.5],[.37,y,.4]],.022);for(const s of [-1,1])cone(white,s*.56,.59+i*.21,-.10,.13,.32,0,-s*Math.PI/2);}tube(c,[[0,.45,-.3],[0,.31,-.8],[0,.24,-1.31]],.23);for(let i=0;i<4;i++)cone(white,0,.55,-.50-i*.23,.09,.26);
  }else if(id==='rayquaza'){
    const c=0x398964,points=[];for(let i=0;i<22;i++){let t=i/21;points.push([Math.sin(t*Math.PI*2)*.62,2.3-t*1.95,-.10-t*.7]);}tube(c,points,.20);orb(c,0,2.33,.14,.30,.25,.40);box(c,0,2.23,.48,.37,.14,.34);eyes(2.43,.405,.21,0xe8c44f,.08);
    for(const s of [-1,1]){cone(c,s*.27,2.58,-.05,.11,.66,-.6,-s*.35);cone(0xebc45d,s*.31,2.38,-.24,.09,.63,-1.1,-s*.4);tube(c,[[s*.18,2.0,-.2],[s*.50,1.91,.12],[s*.59,2.09,.28]],.09);claws(.57,2.11,.38);}
    for(let i=2;i<20;i+=3){const p=points[i];add(new T.TorusGeometry(.211,.025,6,14),0xe8c65c,p,[1,1,1],[Math.PI/2,0,0]);for(const s of [-1,1])cone(0xc8574c,p[0]+s*.27,p[1],p[2],.10,.32,0,-s*Math.PI/2);}
  }else if(id==='mew'){
    const c=0xefb8cf;orb(c,0,.69,0,.27,.39,.26);orb(c,0,1.22,.07,.37,.31,.32);cone(c,-.25,1.54,.02,.135,.29,0,-.23);cone(c,.25,1.54,.02,.135,.29,0,.23);eyes(1.23,.363,.205,0x579ebd,.115);arms(c,.85,.30);for(const s of [-1,1])orb(c,s*.23,.35,.20,.145,.16,.31);tube(c,[[0,.54,-.18],[-.55,.56,-.48],[-.91,1.08,-.40],[-.60,1.65,-.33],[.12,1.75,-.34]],.048);orb(c,.13,1.75,-.34,.10,.12,.10);
  }else{throw new Error('No authored model: '+id);}
  root.userData={species:id,source:'hand-authored-threejs',axis:'Y-up/Z-forward'};
  return root;
 }
 window.PalletModels={build};
})();
