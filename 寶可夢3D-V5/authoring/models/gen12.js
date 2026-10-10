/* Gen I–II: 18 independently sculpted procedural models, reviewed against the
 * downloaded official Pokédex artwork in references/gen12-contact.png.
 * Common anatomical helpers only; no legacy mesh/model import. */
(()=>{
 'use strict';
 const R=PalletModelsV2.register,T=THREE,WHITE=0xfff3da,DARK=0x263342;
 const orb=(b,c,p,s,rot=[0,0,0],name='anatomy')=>b.add(new T.SphereGeometry(1,18,12),c,p,s,rot,name);
 const dot=(b,c,p,s,rot=[0,0,0],name='surface-detail')=>b.add(new T.SphereGeometry(1,12,8),c,p,s,rot,name);
 const tooth=(b,p,r=.035,h=.11,rot=[Math.PI,0,0])=>b.cone(WHITE,p,r,h,rot,'tooth');
 function claws(b,p,count=3,spacing=.095,size=.045){for(let i=0;i<count;i++)orb(b,WHITE,[p[0]+(i-(count-1)/2)*spacing,p[1],p[2]],[size,size*.65,size*2.15],[.25,0,0],'toe-claw');}
 function eyes(b,x,y,z,s=.12,iris=0xb54657,angle=.2){for(const side of [-1,1])b.eye([side*x,y,z],[s,s*1.32,s*.46],iris,[0,side*angle,0]);}
 function line(b,c,pts,r=.012,name='anatomical-line'){return b.tube(c,pts,r,name);}
 function petal(b,c,p,s,rot=[0,0,0],name='petal'){return orb(b,c,p,s,rot,name);}
 function leafy(b,c,p,scale,angle=0,serrated=false){
  const points=serrated?[[0,-.55],[-.25,-.32],[-.15,-.25],[-.39,-.12],[-.25,-.08],[-.45,.12],[-.28,.10],[-.32,.30],[-.15,.24],[0,.60],[.15,.24],[.32,.30],[.28,.10],[.45,.12],[.25,-.08],[.39,-.12],[.15,-.25],[.25,-.32]]:[[0,-.55],[-.23,-.30],[-.30,.06],[-.21,.34],[0,.63],[.21,.34],[.30,.06],[.23,-.30]];
  const m=b.patch(c,points,.04,'botanical-leaf');m.position.set(...p);m.scale.set(scale[0],scale[1],scale[2]||1);m.rotation.set(-Math.PI/2,0,angle);
  const dir=[Math.sin(angle),0,-Math.cos(angle)];const len=scale[1]*.48;
  line(b,0x49834b,[[p[0]-dir[0]*len,p[1]+.04,p[2]-dir[2]*len],[p[0],p[1]+.06,p[2]],[p[0]+dir[0]*len,p[1]+.04,p[2]+dir[2]*len]],.018,'leaf-midrib');
 }
 function frogLeg(b,c,x,z,size){orb(b,c,[x,.32,z],[size,.35,size*.98]);orb(b,c,[x,.15,z+.13],[size*1.05,.15,size*1.14]);claws(b,[x,.075,z+size+.13],3,size*.60,size*.20);}
 function frogFace(b,c,large=false){
  const y=large?.73:.85,z=large?.90:.65,w=large?.73:.56;
  orb(b,c,[0,y,z],[w,.49,large?.58:.48]);orb(b,c,[0,y-.19,z+.24],[w*.91,.26,.40]);
  for(const side of [-1,1]){b.cone(c,[side*w*.67,y+.39,z-.06],large?.20:.16,large?.34:.30,[0,0,side*-.18],'pointed-ear');const m=b.patch(0x527777,[[-.11,-.10],[0,.13],[.11,-.10]],.012,'inner-ear');m.position.set(side*w*.67,y+.41,z+.078);}
  eyes(b,w*.58,y+.10,z+.405,large?.12:.13,0xb9445c,.30);
  for(const side of [-1,1])dot(b,0x255d61,[side*.135,y-.055,z+.659],[.026,.020,.01]);
  line(b,0x36525a,[[-w*.66,y-.21,z+.53],[0,y-.30,z+.64],[w*.66,y-.21,z+.53]],.016,'smile');
  if(large){orb(b,0x583b51,[0,y-.29,z+.59],[.48,.18,.027]);orb(b,0xe29fb3,[0,y-.34,z+.62],[.34,.06,.023]);for(const side of [-1,1])tooth(b,[side*.37,y-.22,z+.64],.055,.16);}
  else for(const side of [-1,1])tooth(b,[side*.30,y-.22,z+.58],.033,.09);
 }
 function frogSpots(b,c,large=false){const z=large?.90:.65,y=large?.73:.85;
  for(const side of [-1,1]){for(const p of [[.40,y+.34,z+.20],[.56,y-.11,z+.27],[.37,.40,.52],[.47,.40,-.45]]){const m=b.patch(c,[[-.08,-.07],[.095,-.055],[.055,.10],[-.035,.12]],.012,'skin-marking');m.position.set(side*p[0],p[1],p[2]+.16);m.rotation.z=side*.35;}}
  dot(b,c,[0,y+.40,z+.34],[.14,.08,.025]);
 }
 R('bulbasaur',b=>{const c=0x77c5ad;orb(b,c,[0,.56,-.08],[.64,.44,.78]);for(const x of [-.43,.43])for(const z of [-.52,.40])frogLeg(b,c,x,z,.21);frogFace(b,c);frogSpots(b,0x398a78);
  orb(b,0x65a960,[0,1.01,-.34],[.58,.58,.57]);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;petal(b,i%2?0x7db76d:0x6dab60,[Math.sin(a)*.29,1.11,-.34+Math.cos(a)*.29],[.27,.55,.28],[0,a,Math.sin(a)*-.2],'bulb-lobe');}b.cone(0x518954,[.05,1.60,-.38],.16,.28,[0,0,-.22],'bulb-tip');
 });
 R('ivysaur',b=>{const c=0x67b9c2;orb(b,c,[0,.61,-.14],[.69,.47,.89]);for(const x of [-.49,.49])for(const z of [-.60,.43])frogLeg(b,c,x,z,.24);frogFace(b,c);frogSpots(b,0x278b9b);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;leafy(b,0x448f65,[Math.sin(a)*.50,1.10,-.27+Math.cos(a)*.49],[.95,1.35,1],a,true);}
  orb(b,0xcc658b,[0,1.55,-.32],[.42,.59,.39]);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;petal(b,i%2?0xe88ba9:0xd57794,[Math.sin(a)*.22,1.60,-.32+Math.cos(a)*.22],[.23,.53,.23],[0,a,-Math.sin(a)*.14],'closed-bud-petal');}b.cone(0xe79ab1,[0,2.09,-.32],.09,.18,[0,0,.12],'bud-point');
 });
 R('venusaur',b=>{const c=0x57a8a4;orb(b,c,[0,.64,-.12],[1.03,.57,1.13]);for(const x of [-.75,.75])for(const z of [-.75,.63])frogLeg(b,c,x,z,.31);frogFace(b,c,true);frogSpots(b,0x387f86,true);
  for(let i=0;i<14;i++){const a=i*2.4;dot(b,0x64b5af,[Math.sin(a)*.95,.69+(i%3)*.11,Math.cos(a)*.94-.12],[.045,.048,.040]);}
  b.link(0x947455,[0,1.00,-.27],[0,2.03,-.27],.32,.25,'flower-trunk');for(let i=0;i<5;i++)b.cone(0x5e7261,[Math.sin(i*1.26)*.26,1.70,-.27+Math.cos(i*1.26)*.26],.10,.25,[0,0,.6],'trunk-scale');
  for(let i=0;i<8;i++){const a=i*Math.PI/4;leafy(b,0x3d9464,[Math.sin(a)*.75,1.23,-.25+Math.cos(a)*.75],[1.05,1.54,1],a,true);}
  for(let i=0;i<6;i++){const a=i*Math.PI/3;const px=Math.sin(a)*.65,pz=-.27+Math.cos(a)*.65;petal(b,i%2?0xe97f9f:0xdd6b8d,[px,2.01,pz],[.49,.16,.89],[0,a,.03],'broad-flower-petal');for(let j=0;j<2;j++)dot(b,0xffc0cc,[Math.sin(a)*(.69+j*.31),2.16,-.27+Math.cos(a)*(.69+j*.31)],[.13,.027,.095],[0,a,0],'petal-mottle');}
  orb(b,0xc9b66e,[0,2.09,-.27],[.36,.17,.35]);for(let i=0;i<7;i++)b.cone(0xe2cb78,[Math.sin(i*.9)*.24,2.28,-.27+Math.cos(i*.9)*.24],.095,.27,[0,0,Math.sin(i)*.25],'flower-stamen');
 });
 function lizard(b,c,stage){
  const big=stage===2,h=big?1.38:stage===1?1.02:.82;orb(b,c,[0,h,0],[big?.62:.40,big?.83:.59,big?.49:.34]);orb(b,0xf6dfaa,[0,h-.06,big?.405:.29],[big?.48:.29,big?.67:.48,.08]);
  for(const s of [-1,1]){orb(b,c,[s*(big?.49:.31),.40,.05],[big?.34:.23,.42,.29],[0,0,s*-.2]);orb(b,c,[s*(big?.53:.33),.15,.29],[big?.26:.20,.16,.38]);claws(b,[s*(big?.53:.33),.08,.62],3,big?.14:.10,big?.07:.05);
   const sy=big?1.65:1.16;orb(b,c,[s*(big?.68:.47),sy,.02],[.18,big?.38:.26,.19],[0,0,s*.52]);orb(b,c,[s*(big?.81:.61),sy-.26,.15],[.17,.20,.18]);for(let i=0;i<3;i++){orb(b,c,[s*(big?.83:.63)+(i-1)*.09,sy-.33,.22],[.052,.13,.055],[.35,0,0],'finger');if(stage)tooth(b,[s*(big?.83:.63)+(i-1)*.09,sy-.43,.27],.033,.12);}}
  const hy=big?2.38:stage===1?1.77:1.57,hz=big?.18:.04; if(big)b.link(c,[0,1.85,0],[0,2.34,.11],.25,.20,'long-neck');
  orb(b,c,[0,hy,hz],[big?.32:.38,big?.44:.39,big?.40:.34]);orb(b,c,[0,hy-.15,hz+.28],[big?.33:.35,.19,.31]);
  eyes(b,big?.205:.22,hy+.08,hz+.285,big?.082:.105,stage?0x579399:0x338cab,.32);for(const s of [-1,1]){dot(b,0x855946,[s*.13,hy-.05,hz+.545],[.019,.018,.011]);if(stage)b.cone(c,[s*(big?.22:.14),hy+.43,hz-.18],big?.12:.095,big?.42:.25,[.35,0,s*-.17],'head-horn');}
  line(b,0x785248,[[-.25,hy-.22,hz+.45],[0,hy-.28,hz+.57],[.25,hy-.22,hz+.45]],.014,'smile');if(stage)for(const s of [-1,1])tooth(b,[s*.23,hy-.245,hz+.48],.035,.10);
  const end=big?[-.88,1.13,-1.60]:stage?[.78,.93,-1.03]:[.67,.79,-.78];b.tube(c,[[0,.53,-.23],[.22,.32,-.68],[end[0]*.85,.47,end[2]-.08],end],big?.24:.17,'tapered-tail',.048);b.flame([end[0],end[1]+.13,end[2]],big?.90:stage?.72:.63);
 }
 R('charmander',b=>lizard(b,0xeaa05c,0));
 R('charmeleon',b=>{lizard(b,0xcc6357,1);for(const s of [-1,1])orb(b,0xc95950,[s*.22,1.92,.27],[.16,.055,.07],[0,0,s*.2],'frowning-brow');});
 R('charizard',b=>{lizard(b,0xe3944c,2);for(const s of [-1,1]){
  const pts=[[s*.32,1.71],[s*.70,2.30],[s*1.40,3.02],[s*1.89,2.09],[s*1.85,1.31],[s*1.57,1.57],[s*1.30,1.61],[s*1.08,1.26],[s*.89,1.66],[s*.61,1.49]];const m=b.patch(0x398f9b,pts,.055,'scalloped-wing-membrane');m.position.z=-.36;
  b.tube(0xdf9650,[[s*.32,1.72,-.29],[s*.72,2.30,-.35],[s*1.40,3.02,-.36],[s*1.90,2.09,-.36],[s*1.85,1.31,-.36]],.067,'wing-leading-bone',.03);
  for(const p of [[1.08,1.27],[1.57,1.58]])b.link(0x2f7886,[s*1.40,3.00,-.32],[s*p[0],p[1],-.32],.037,.018,'wing-rib');b.cone(WHITE,[s*1.40,3.12,-.36],.055,.25,[0,0,-s*.25],'wing-tip');}
 });
 function shell(b,stage){const y=stage===2?1.11:.85,rx=stage===2?.77:.49,ry=stage===2?.93:.65;
  orb(b,0xf1e5c5,[0,y,-.12],[rx*1.10,ry*1.05,.44]);orb(b,stage===2?0x826c51:0xa67a52,[0,y,-.28],[rx,ry,.48]);orb(b,0xe9d6a0,[0,y,.24],[rx*.90,ry*.92,.15]);
  for(const dy of [-.30,.07,.40])line(b,0x9f8866,[[-rx*.76,y+dy,.33],[0,y+dy-.03,.40],[rx*.76,y+dy,.33]],.018,'plastron-seam');line(b,0x9f8866,[[0,y-ry*.89,.31],[0,y,.403],[0,y+ry*.86,.31]],.016,'plastron-midline');
  const center=[0,y,-.755];for(let i=0;i<6;i++){const a=i*Math.PI/3,a2=(i+1)*Math.PI/3;line(b,0x554a40,[[Math.sin(a)*rx*.48,y+Math.cos(a)*ry*.49,-.74],[Math.sin(a2)*rx*.48,y+Math.cos(a2)*ry*.49,-.74]],.018,'shell-hexagon');line(b,0x554a40,[[Math.sin(a)*rx*.48,y+Math.cos(a)*ry*.49,-.73],[Math.sin(a)*rx*.93,y+Math.cos(a)*ry*.94,-.48]],.018,'shell-scutum');}
 }
 function turtle(b,c,stage){shell(b,stage);const big=stage===2,hy=big?2.00:1.55;for(const s of [-1,1]){
  orb(b,c,[s*(big?.57:.36),.31,.06],[big?.34:.22,.32,.26]);orb(b,c,[s*(big?.60:.40),.13,.25],[big?.30:.22,.14,.32]);claws(b,[s*(big?.60:.40),.08,.53],3,big?.16:.10,big?.065:.043);
  orb(b,c,[s*(big?.79:.56),big?1.23:1.06,.10],[big?.31:.26,big?.39:.18,.24],[0,0,-s*.55]);orb(b,c,[s*(big?.91:.72),big?1.00:1.01,.23],[big?.23:.15,.17,.20]);for(let i=0;i<3;i++)orb(b,big?WHITE:c,[s*(big?.94:.75)+(i-1)*.085,big?.95:.97,.39],[.039,.048,.082],[0,0,0],'hand-digit');}
  orb(b,c,[0,hy,.10],[big?.46:.43,big?.39:.44,big?.43:.38]);orb(b,big?0xdaccab:c,[0,hy-.19,.31],[big?.40:.36,.17,.27]);eyes(b,big?.26:.245,hy+.08,.39,big?.09:.115,stage?0x684d4d:0x823b56,.25);
  line(b,0x405e6c,[[-.29,hy-.19,.48],[0,hy-.24,.57],[.29,hy-.19,.48]],.014,'turtle-smile');for(const s of [-1,1])dot(b,0x4c6a75,[s*.10,hy-.09,.60],[.013,.012,.008]);
 }
 R('squirtle',b=>{turtle(b,0x7ebed0,0);b.tube(0x73afc2,[[0,.51,-.39],[.48,.40,-.66],[.79,.53,-.67],[.77,.80,-.69],[.56,.83,-.70],[.48,.65,-.72],[.62,.58,-.75]],.16,'spiral-tail',.08);});
 R('wartortle',b=>{turtle(b,0x819dc9,1);for(const s of [-1,1]){const m=b.patch(0xc2e3eb,[[-.11,-.25],[-.15,.14],[-.03,.57],[.12,.78],[.19,.37],[.14,-.15]],.065,'feather-ear');m.position.set(s*.37,1.85,.01);m.rotation.z=-s*.40;line(b,0x8cbcc9,[[s*.36,1.70,.12],[s*.48,2.06,.10],[s*.63,2.37,.08]],.016,'ear-vein');orb(b,0x718fbd,[s*.245,1.70,.385],[.15,.044,.07],[0,0,s*.18],'sharp-brow');tooth(b,[s*.22,1.32,.54],.027,.08);}
  b.tube(0xc1e4eb,[[0,.45,-.50],[.55,.52,-.76],[.85,.89,-.80],[.87,1.19,-.81],[.63,1.26,-.83],[.50,1.08,-.86],[.63,.96,-.87]],.19,'cloud-tail-main',.11);b.tube(0xd1edf0,[[.51,.71,-.81],[1.04,.69,-.84],[1.17,.91,-.85],[1.01,1.08,-.86],[.91,.93,-.86]],.13,'cloud-tail-curl',.075);
 });
 R('blastoise',b=>{turtle(b,0x537faa,2);for(const s of [-1,1]){orb(b,0x40688e,[s*.27,2.16,.40],[.17,.065,.065],[0,0,s*.13],'heavy-brow');b.cone(0x527aa3,[s*.32,2.32,.01],.14,.25,[0,0,-s*.15],'head-ear');
  b.link(0xc8ced0,[s*.62,1.51,-.37],[s*.67,2.02,-.31],.18,.18,'cannon-base');b.link(0xd6dbd8,[s*.68,1.97,-.33],[s*.70,2.04,.36],.16,.16,'water-cannon');b.add(new T.TorusGeometry(.148,.034,10,24),0xebeee8,[s*.70,2.04,.385],[1,1,1],[0,0,0],'cannon-lip');b.add(new T.CircleGeometry(.125,24),0x283f4a,[s*.70,2.04,.389],[1,1,1],[0,0,0],'deep-cannon-bore');}
  b.tube(0x567da3,[[0,.52,-.46],[.13,.25,-.89],[.30,.30,-1.18]],.20,'stout-tail',.025);
 });
 function dinosaurLegs(b,c,stage){const wide=stage===2?.50:.34,long=stage===2?.65:.40;for(const x of [-wide,wide])for(const z of [-long,long]){orb(b,c,[x,stage===2?.35:.26,z],[stage===2?.24:.19,stage===2?.36:.26,.22]);orb(b,c,[x,.13,z+.035],[stage===2?.25:.19,.13,.25]);if(stage===2)claws(b,[x,.07,z+.25],3,.11,.04);}}
 R('chikorita',b=>{const c=0xb9d588;orb(b,c,[0,.56,-.07],[.48,.40,.64]);dinosaurLegs(b,c,0);orb(b,c,[0,1.04,.47],[.43,.58,.40]);eyes(b,.215,1.17,.80,.105,0x9c4b58,.20);line(b,0x556d4b,[[-.13,.92,.854],[0,.88,.879],[.13,.92,.854]],.012);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;dot(b,0x739d5a,[Math.sin(a)*.39,.62,.37+Math.cos(a)*.32],[.065,.065,.055]);}
  b.tube(0x75a052,[[0,1.55,.40],[.12,1.75,.31],[.24,1.90,.20]],.04,'leaf-stem',.025);const m=b.patch(0x78b958,[[0,0],[-.37,.25],[-.40,.65],[-.10,.84],[.39,.83],[.83,1.08],[.66,.55],[.42,.15]],.038,'head-leaf');m.position.set(.16,1.71,.24);m.rotation.set(-.72,0,-.40);line(b,0x5c984c,[[.15,1.71,.29],[.42,1.97,-.02],[.79,2.33,-.22]],.018,'leaf-midrib');
  b.cone(c,[0,.59,-.76],.14,.35,[-Math.PI/2,0,0],'small-tail');
 });
 R('bayleef',b=>{const c=0xe1d188;orb(b,c,[0,.62,-.16],[.53,.47,.74]);dinosaurLegs(b,c,1);orb(b,c,[0,1.22,.42],[.27,.70,.28],[-.14,0,0],'long-neck');orb(b,c,[0,1.78,.59],[.34,.34,.36]);orb(b,c,[0,1.62,.79],[.29,.16,.26]);eyes(b,.205,1.82,.86,.095,0xa2543e,.22);line(b,0x776e43,[[-.15,1.58,.986],[0,1.55,1.017],[.15,1.58,.986]],.012);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;petal(b,0x7ea653,[Math.sin(a)*.40,1.04,.36+Math.cos(a)*.32],[.14,.12,.34],[.10,a,0],'neck-leaf-bud');}
  const m=b.patch(0x88ad59,[[-.19,0],[-.19,.44],[.00,.81],[.35,1.23],[.69,1.55],[.48,1.10],[.30,1.03],[.19,.90],[.20,.76],[.39,.78],[.29,.58],[.05,.30]],.04,'notched-head-leaf');m.position.set(-.07,2.04,.55);m.rotation.z=-.18;
  line(b,0x607d40,[[0,2.10,.60],[.19,2.64,.60],[.64,3.21,.60]],.018,'leaf-spine');b.tube(c,[[0,.67,-.72],[0,.81,-1.04],[0,1.01,-1.19]],.16,'raised-tail',.008);
 });
 R('meganium',b=>{const c=0x90bc70;orb(b,c,[0,.77,-.23],[.72,.62,.94]);dinosaurLegs(b,c,2);b.tube(c,[[0,.79,.35],[0,1.42,.52],[0,2.09,.55],[0,2.62,.60]],.31,'sauropod-neck',.25);orb(b,c,[0,2.68,.69],[.37,.42,.41]);orb(b,0xa7c984,[0,2.48,.95],[.32,.19,.25]);eyes(b,.22,2.77,1.01,.104,0xa17438,.3);line(b,0x5d754c,[[-.18,2.48,1.17],[0,2.43,1.19],[.18,2.48,1.17]],.012);
  for(const s of [-1,1]){b.tube(0xd0bd65,[[s*.16,3.02,.61],[s*.23,3.42,.61],[s*.45,3.74,.59]],.033,'antenna',.024);orb(b,0xe0c966,[s*.46,3.75,.59],[.055,.11,.05],[0,0,-s*.35]);}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;petal(b,0xf6dcde,[Math.sin(a)*.56,1.38,.46+Math.cos(a)*.56],[.37,.12,.60],[.03,a,0],'flower-white-frill');petal(b,i%2?0xde819f:0xe995ac,[Math.sin(a)*.54,1.42,.46+Math.cos(a)*.54],[.32,.10,.54],[.03,a,0],'flower-petal');}for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const m=b.patch(0xdfd779,[[0,0],[-.10,.25],[0,.13],[.10,.25]],.025,'flower-center');m.position.set(Math.sin(a)*.25,1.50,.48+Math.cos(a)*.25);m.rotation.x=-Math.PI/2;m.rotation.z=a;}
  b.tube(c,[[0,.77,-.84],[0,.58,-1.35],[.14,.44,-1.76]],.26,'sauropod-tail',.035);
 });
 function fireSpike(b,p,vec,size){const [x,y,z]=p,[dx,dy,dz]=vec;b.tube(0xeb7730,[[x,y,z],[x+dx*size*.50,y+dy*size*.45,z+dz*size*.50],[x+dx*size,y+dy*size,z+dz*size]],.20*size,'fire-ray',.008);b.tube(0xffd34d,[[x,y,z+.025],[x+dx*size*.35,y+dy*size*.35,z+dz*size*.35+.025],[x+dx*size*.67,y+dy*size*.66,z+dz*size*.67]],.115*size,'fire-core',.005);}
 R('cyndaquil',b=>{const cream=0xeee0a3,blue=0x365b61;orb(b,cream,[0,.56,0],[.40,.53,.43]);orb(b,blue,[0,.72,-.22],[.40,.43,.33]);for(const s of [-1,1]){orb(b,cream,[s*.29,.25,-.04],[.20,.26,.23]);orb(b,0xc3b58d,[s*.29,.09,.12],[.18,.10,.24]);orb(b,cream,[s*.35,.65,.28],[.11,.22,.13],[0,0,s*.2]);}
  orb(b,cream,[0,1.04,.22],[.34,.36,.40]);orb(b,blue,[0,1.23,.06],[.34,.26,.34]);orb(b,cream,[0,.97,.62],[.25,.16,.43],[-.12,0,0],'long-pointed-snout');orb(b,blue,[0,1.055,.62],[.24,.085,.40],[-.10,0,0],'snout-mask');dot(b,DARK,[0,.97,1.021],[.047,.026,.015]);for(const s of [-1,1])line(b,0x474d42,[[s*.16,1.10,.54],[s*.19,1.15,.55],[s*.23,1.16,.52],[s*.27,1.10,.48]],.018,'closed-eye');
  for(let i=0;i<7;i++){const a=(i-3)*.31;fireSpike(b,[Math.sin(a)*.20,.85,-.39],[Math.sin(a)*.9,.9,-.85],.82+(i%3)*.12);}
 });
 R('quilava',b=>{const c=0xf0df9d,blue=0x3e6671;orb(b,c,[0,.95,.02],[.38,.88,.34]);orb(b,blue,[0,1.05,-.21],[.37,.83,.22]);for(const s of [-1,1]){orb(b,c,[s*.30,.28,.01],[.23,.29,.28]);orb(b,c,[s*.31,.10,.18],[.21,.11,.27]);claws(b,[s*.31,.06,.40],3,.08,.028);orb(b,c,[s*.33,1.02,.24],[.11,.46,.11],[0,0,s*.05]);dot(b,c,[s*.34,.60,.25],[.12,.12,.12]);}
  orb(b,blue,[0,1.89,.12],[.32,.40,.35]);orb(b,c,[0,1.67,.32],[.28,.23,.28]);orb(b,blue,[0,1.79,.43],[.25,.13,.28]);eyes(b,.19,1.91,.38,.080,0xa34e51,.35);dot(b,0x38434b,[0,1.80,.709],[.044,.035,.021]);for(const s of [-1,1]){orb(b,blue,[s*.245,2.13,.03],[.095,.15,.08]);dot(b,0x914552,[s*.246,2.13,.104],[.058,.088,.021]);}
  for(let i=0;i<5;i++)fireSpike(b,[(i-2)*.10,2.16,-.025],[(i-2)*.24,1,-.26],.56+(i%2)*.21);for(let i=0;i<5;i++)fireSpike(b,[(i-2)*.09,.50,-.30],[(i-2)*.29,.8,-.70],.70+(i%2)*.20);
 });
 R('typhlosion',b=>{const c=0xf3e4af,blue=0x364956;orb(b,c,[0,1.12,0],[.72,1.06,.54]);orb(b,blue,[0,1.22,-.32],[.70,.94,.27]);orb(b,c,[0,2.04,.10],[.35,.69,.36],[-.12,0,0]);orb(b,blue,[0,2.20,-.10],[.34,.56,.21]);for(const s of [-1,1]){orb(b,c,[s*.53,.34,.10],[.32,.36,.33]);orb(b,c,[s*.56,.13,.30],[.31,.14,.40]);claws(b,[s*.56,.07,.66],3,.14,.043);orb(b,c,[s*.72,1.48,.09],[.24,.47,.21],[0,0,s*-.49]);orb(b,c,[s*.89,1.12,.22],[.17,.20,.16]);claws(b,[s*.90,1.03,.36],3,.08,.034);}
  orb(b,c,[0,2.55,.21],[.38,.37,.39]);orb(b,blue,[0,2.72,.03],[.37,.25,.34]);orb(b,c,[0,2.45,.49],[.34,.17,.30]);orb(b,blue,[0,2.57,.43],[.32,.11,.30]);eyes(b,.225,2.67,.43,.087,0x8a513f,.32);dot(b,DARK,[0,2.56,.744],[.071,.037,.022]);line(b,0x645344,[[-.26,2.42,.62],[0,2.37,.73],[.26,2.42,.62]],.016);for(const s of [-1,1])tooth(b,[s*.20,2.40,.672],.035,.11);
  for(let i=0;i<9;i++){const a=(i-4)*.28;fireSpike(b,[Math.sin(a)*.39,2.18,-.24-Math.cos(a)*.08],[Math.sin(a)*1.25,.70+Math.cos(a)*.22,-.32],.78+(i%3)*.13);}b.tube(blue,[[0,.60,-.40],[0,.41,-.87],[.14,.40,-1.14]],.22,'tapered-tail',.02);
 });
 function croc(b,stage){const c=stage===2?0x5fadc4:stage===1?0x67b4c4:0x73bdc8,cream=0xe8d589,red=0xca6376,big=stage===2,hy=big?2.16:stage===1?1.63:1.50;
  orb(b,c,[0,big?1.11:.80,0],[big?.70:stage===1?.59:.39,big?.81:.59,big?.48:.33]);orb(b,cream,[0,big?.83:.69,big?.398:.30],[big?.49:stage===1?.50:.25,big?.39:stage===1?.47:.33,.085]);
  for(const s of [-1,1]){orb(b,c,[s*(big?.60:.37),.38,.04],[big?.40:.25,.41,.31]);orb(b,c,[s*(big?.64:.38),.13,.28],[big?.30:.24,.14,.38]);claws(b,[s*(big?.64:.38),.07,.61],3,big?.15:.10,big?.075:.04);
   orb(b,c,[s*(big?.81:.47),big?1.50:1.00,.04],[big?.29:.18,big?.37:.27,.24],[0,0,-s*.55]);orb(b,c,[s*(big?1.01:.63),big?1.20:.86,.20],[big?.26:.19,.20,.20]);for(let i=0;i<3;i++){orb(b,c,[s*(big?1.06:.67)+(i-1)*.10,big?1.11:.81,.33],[.062,.13,.07],[.20,0,0]);tooth(b,[s*(big?1.06:.67)+(i-1)*.10,big?1.01:.72,.38],.029,.10);}}
  orb(b,c,[0,hy,.13],[big?.51:stage===1?.43:.38,big?.50:.41,.42]);orb(b,c,[0,hy-.09,.49],[big?.56:stage===1?.45:.38,.24,big?.48:.39]);orb(b,0x553d4a,[0,hy-.29,.69],[big?.45:.32,.14,.24]);orb(b,stage?cream:c,[0,hy-.42,.50],[big?.52:.40,.18,big?.45:.37]);orb(b,0xd9909e,[0,hy-.35,.76],[big?.32:.24,.04,.15]);
  eyes(b,big?.32:.245,hy+.18,.435,big?.125:.108,stage===2?0xb57946:0xb04956,.30);for(const s of [-1,1]){dot(b,0x3e7c8d,[s*(big?.20:.15),hy+.025,big?.931:.85],[.028,.02,.015]);for(let i=0;i<(big?3:2);i++)tooth(b,[s*(big?.36:.26),hy-.24,.48+i*.16],big?.052:.037,big?.17:.12);tooth(b,[s*(big?.38:.28),hy-.34,.69],big?.043:.03,big?.13:.10,[0,0,0]);}
  const tailEnd=big?-1.68:stage===1?-1.32:-1.09;b.tube(c,[[0,.51,-.29],[.21,.34,-.70],[.31,.46,tailEnd]],big?.31:.21,'crocodile-tail',.025);
  const spikes=big?[[2.58,.0,.54],[2.18,-.37,.48],[1.73,-.44,.43],[1.25,-.49,.36],[.79,-.74,.34],[.62,-1.14,.30]]:stage===1?[[2.02,.04,.58],[1.55,-.35,.28],[1.05,-.37,.24],[.62,-.85,.37]]:[[1.35,-.31,.28],[.90,-.34,.27],[.60,-.79,.34]];
  for(const [y,z,h]of spikes){const m=b.patch(red,[[0,0],[-h*.60,h*.65],[0,h],[h*.38,h*.42],[h*.31,0]],.09,'red-dorsal-spine');m.rotation.y=Math.PI/2;m.position.set(-.045,y,z);}
  if(stage===1){for(const p of [[-.29,.93,.371],[.26,.61,.389],[-.16,.35,.31],[.04,.73,.408]])dot(b,c,p,[.10,.16,.03],[0,0,.50],'belly-spot');}
  if(big){for(const s of [-1,1]){for(let i=0;i<3;i++){orb(b,0x73b9cb,[s*(.66+i*.13),1.78-i*.13,.13],[.19,.10,.22],[0,0,-s*.45],'arm-armor-scale');}orb(b,0x4b96ac,[s*.36,2.44,.40],[.18,.07,.12],[0,0,s*.16],'predator-brow');orb(b,0x72bace,[s*.59,.54,.31],[.30,.11,.28],[.10,0,0],'knee-armor');}}
 }
 R('totodile',b=>croc(b,0));R('croconaw',b=>croc(b,1));R('feraligatr',b=>croc(b,2));
})();
