/* Gen III/IV starters. Rebuilt from the downloaded official Pokedex artwork.
 * Geometry is original procedural work, not derived from previous game meshes.
 * Y up, +Z forward. Canonical dimensions are applied by the shared game loader.
 */
(()=>{
 'use strict';
 const register=(id,fn)=>window.PalletModelsV2.register(id,b=>{
  fn(b);
  b.root.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(b.root);
  for(const part of b.root.children)part.position.y-=bounds.min.y;
 });
 const C={ivory:0xffefbb,dark:0x253e48,claw:0xf6eed9,leaf:0x347c46,gold:0xf3c848};
 function shard(b,c,p,points,scale=[1,1,1],rot=[0,0,0],name='sculpted-fin'){
  const m=b.patch(c,points,.055,name);m.position.set(...p);m.scale.set(...scale);m.rotation.set(...rot);return m;
 }
 function toe(b,c,a,dz=.22,r=.055){b.tube(c,[a,[a[0],a[1]-.015,a[2]+dz*.55],[a[0],Math.max(r,a[1]-.035),a[2]+dz]],r,'articulated-toe',r*.6);}
 function claws(b,x,y,z,n=3,spread=.075,size=.045){for(let i=0;i<n;i++)b.cone(C.claw,[x+(i-(n-1)/2)*spread,y,z],size,size*3,[Math.PI/2,0,0],'toe-claw');}
 function eyePair(b,y,z,x,size=.105,iris=0x7c413d,tilt=0){for(const s of [-1,1])b.eye([s*x,y,z],[size,size*1.3,size*.45],iris,[0,s*.13,s*tilt]);}
 function smile(b,y,z,w=.17){b.mouth([[-w,y+.035,z],[0,y,z+.045],[w,y+.035,z]],.012);}
 function feather(b,c,a,tip,width=.1){const v=new THREE.Vector3(...tip).sub(new THREE.Vector3(...a)),m=b.leaf(c,new THREE.Vector3(...a).addScaledVector(v,.5).toArray(),[width,v.length(),.6]);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
 function disks(b,c,center,offsets,r=.04){for(const p of offsets)b.ball(c,[center[0]+p[0],center[1]+p[1],center[2]+p[2]],r,'toe-pad');}
 function gecko(stage){return b=>{
  const green=[0x9ccf5d,0x4b9a68,0x52a86b][stage],belly=stage===0?0xe87d87:0xd97875;
  if(stage===0){
   b.ell(green,[0,.9,0],[.29,.44,.22],undefined,'pear-shaped-torso');b.ell(belly,[0,.96,.212],[.195,.305,.045],undefined,'pink-throat-belly');
   b.ell(green,[0,1.56,.02],[.40,.45,.27],undefined,'tall-gecko-head');
   for(const s of [-1,1]){b.ell(0xb0d96d,[s*.24,1.82,.025],[.15,.37,.23],[0,0,s*-.11],'split-head-lobe');b.eye([s*.29,1.59,.245],[.12,.22,.046],0xd8b645,[0,s*.3,s*-.1]);b.link(green,[s*.22,1.08,0],[s*.50,1.11,.08],.085,.065,'upper-arm');b.link(green,[s*.50,1.11,.08],[s*.61,1.3,.12],.065,.055,'forearm');
    for(let i=0;i<3;i++){const a=[s*(.58+i*.065),1.31+(i===1?.035:0),.12],end=[s*(.57+i*.09),1.42+(i===1?.045:0),.15];b.link(green,a,end,.032,.027,'finger');b.ball(0xafdc72,end,.044,'round-finger-pad');}
    b.ell(green,[s*.185,.43,.015],[.115,.26,.12],[0,0,s*.17],'calf');b.ell(green,[s*.24,.12,.105],[.16,.10,.22],undefined,'webbed-foot');disks(b,0xb9df7b,[s*.24,.10,.265],[[-.105,0,0],[0,0,.035],[.105,0,0]],.069);
   }
   b.ell(0x568854,[.27,.49,-.51],[.29,.16,.65],[0,-.38,-.13],'large-leaf-shaped-tail');b.tube(0x6b9d5b,[[.12,.52,-.16],[.4,.55,-.7],[.43,.63,-1.02]],.14,'rounded-tail-tip',.045);
   b.ball(green,[-.09,1.41,.29],.025,'nostril-rim');b.ball(0x497445,[-.09,1.415,.311],.009,'nostril');smile(b,1.33,.27,.16);
  }else{
   const sc=stage===2;
   b.ell(green,[0,.90,0],[sc?.34:.24,sc?.47:.43,.23],[.16,0,0],'lean-torso');b.ell(belly,[0,1.14,.218],[sc?.21:.14,.37,.035],[.16,0,0],'red-throat');
   b.link(green,[0,1.24,.0],[0,1.60,.10],sc?.15:.115,sc?.13:.10,'long-neck');
   b.ell(green,[0,1.69,.18],[sc?.26:.23,.18,.34],[-.12,0,0],'pointed-reptile-head');b.ell(green,[0,1.66,.42],[.17,.085,.18],undefined,'long-muzzle');
   eyePair(b,1.73,.397,.164,.073,0xe2d04f,-.14);b.mouth([[-.16,1.585,.39],[0,1.57,.56],[.16,1.585,.39]],.012);
   if(sc){shard(b,green,[0,1.75,.04],[[-.19,0],[0,.43],[.19,0]],[1,1,1],[0,Math.PI/2,0],'head-crest');}
   else{feather(b,0x34774c,[0,1.78,-.04],[0,1.43,-.86],.33);b.tube(0x8cc381,[[0,1.79,-.02],[0,1.68,-.37],[0,1.45,-.88]],.017,'head-leaf-vein',.008);}
   for(const s of [-1,1]){
    b.ell(green,[s*.23,.52,0],[.19,.30,.19],[0,0,s*-.24],'muscular-thigh');b.link(green,[s*.29,.47,.03],[s*.35,.18,.14],.1,.065,'shin');b.ell(green,[s*.36,.09,.25],[.16,.07,.23],undefined,'long-foot');claws(b,s*.36,.065,.43,3,.083,.045);
    b.link(green,[s*.19,1.26,.02],[s*.43,1.02,.12],.09,.07,'upper-arm');b.link(green,[s*.43,1.02,.12],[s*.62,1.16,.28],.072,.055,'forearm');b.ell(green,[s*.65,1.18,.29],[.105,.08,.06],undefined,'palm');
    for(let i=0;i<3;i++)b.tube(green,[[s*(.61+i*.045),1.2,.30],[s*(.65+i*.055),1.27,.35],[s*(.7+i*.047),1.23,.41]],.022,'hook-finger',.011);
    for(let k=0;k<3;k++)feather(b,0x327f4f,[s*.44,1.065,.04],[s*(.63+k*.095),sc?1.12+k*.12:.69-k*.10,-.10-k*.07],sc?.145:.12);
   }
   if(sc){
    for(const s of [-1,1])for(let i=0;i<3;i++)b.ball(0xe6d271,[s*.215,1.31-i*.22,-.165-i*.022],.085,'yellow-back-seed');
    b.tube(green,[[0,.61,-.13],[0,.51,-.58],[0,.36,-1.31]],.18,'fern-tail-axis',.02);
    for(let i=0;i<6;i++)for(const s of [-1,1])feather(b,i%2?0x438959:0x337c4b,[0,.5-i*.023,-.44-i*.145],[s*(.45-i*.048),.57-i*.024,-.72-i*.13],.20-i*.014);
    b.ell(0x91c184,[0,.63,.235],[.22,.105,.038],undefined,'waist-band');
   }else{
    for(const s of [-1,1])feather(b,0x418c57,[s*.10,.64,-.11],[s*.29,.36,-.93],.30);
    b.ell(0xc3dfb7,[0,.72,.219],[.185,.055,.035],undefined,'belly-stripe');
   }
  }
 };}
 register('treecko',gecko(0));register('grovyle',gecko(1));register('sceptile',gecko(2));

 function chicken(stage){return b=>{
  const orange=0xed963c,cream=0xffdb7a,red=0xc54c40;
  if(stage===0){
   b.ell(orange,[0,.62,0],[.35,.40,.31],undefined,'round-chick-body');b.ell(orange,[0,1.18,.045],[.40,.39,.34],undefined,'chick-head');
   eyePair(b,1.24,.348,.20,.075,0x292d3f);b.ell(0xf4d45c,[0,1.10,.381],[.13,.065,.105],undefined,'small-beak');b.mouth([[-.09,1.09,.439],[0,1.077,.474],[.09,1.09,.439]],.008);
   for(const s of [-1,1]){
    for(let k=0;k<3;k++)feather(b,cream,[s*.29,.85,.09],[s*(.40+k*.037),.65-k*.054,.09],.11);
    b.link(cream,[s*.135,.43,0],[s*.135,.125,.06],.041,.036,'chick-leg');for(let i=0;i<3;i++)toe(b,cream,[s*.135+(i-1)*.06,.055,.10],.16,.03);
   }
   for(const [x,tx,ty] of [[-.10,-.17,1.88],[0,.10,2.04],[.1,.33,1.88]])feather(b,cream,[x,1.47,.03],[tx,ty,.04],.17);
   for(const s of [-1,0,1])feather(b,orange,[s*.10,.53,-.23],[s*.15,.77,-.48],.15);
  }else if(stage===1){
   b.ell(orange,[0,.73,0],[.36,.41,.28],undefined,'round-lower-body');b.ell(cream,[0,1.24,.02],[.255,.40,.235],undefined,'long-yellow-neck');b.ell(cream,[0,1.6,.04],[.245,.30,.25],undefined,'chicken-head');
   for(const s of [-1,1]){b.eye([s*.155,1.63,.238],[.062,.115,.038],0x993f3c,[0,s*.22,s*.20]);b.ell(orange,[s*.24,.47,.02],[.19,.28,.21],[0,0,s*.12],'powerful-thigh');b.link(0x8c8781,[s*.25,.28,.08],[s*.29,.12,.11],.065,.05,'gray-shin');for(let i=0;i<3;i++){toe(b,0x99968b,[s*.29+(i-1)*.07,.065,.14],.25,.036);b.cone(C.claw,[s*.29+(i-1)*.07,.06,.405],.027,.105,[Math.PI/2,0,0],'long-toe-claw');}
    b.link(cream,[s*.20,1.25,.02],[s*.54,1.23,.055],.095,.075,'wing-arm');b.link(cream,[s*.54,1.23,.055],[s*.71,1.39,.10],.075,.047,'wing-wrist');
    for(let i=0;i<3;i++)b.tube(C.claw,[[s*.70,1.4,.1],[s*(.81+i*.04),1.45-i*.055,.16],[s*(.86+i*.045),1.40-i*.05,.22]],.025,'hand-claw',.008);
    for(let k=0;k<3;k++)feather(b,cream,[s*(.21+k*.04),1.07,.1],[s*(.36+k*.055),.97-k*.07,.12],.115);
   }
   b.cone(0xf2c564,[0,1.52,.305],.105,.21,[Math.PI/2,0,0],'short-pointed-beak');
   for(const [x,tx,ty] of [[-.09,-.18,2.07],[0,.075,2.22],[.08,.33,2.11]])feather(b,0xdd7445,[x,1.83,.02],[tx,ty,.02],.17);
   for(const s of [-1,0,1])feather(b,orange,[s*.12,.64,-.22],[s*.2,.85,-.49],.2);
  }else{
   b.ell(red,[0,1.28,0],[.30,.36,.22],undefined,'athletic-red-torso');b.ell(cream,[0,1.48,.20],[.27,.17,.065],undefined,'cream-chest-ruff');
   for(const s of [-1,1]){
    b.link(red,[s*.19,1.15,0],[s*.33,.77,.04],.17,.115,'long-upper-leg');b.link(red,[s*.33,.78,.04],[s*.29,.32,.10],.125,.09,'long-red-shin');
    b.ell(cream,[s*.29,.28,.10],[.175,.28,.14],undefined,'flared-feather-ankle');for(let k=0;k<4;k++)feather(b,cream,[s*.29+(k-1.5)*.06,.35,.19],[s*.29+(k-1.5)*.09,.035,.21],.115);
    b.ell(0x807c73,[s*.29,.07,.21],[.105,.055,.20],undefined,'bird-foot');claws(b,s*.29,.047,.4,3,.075,.04);
    b.link(red,[s*.235,1.52,0],[s*.43,1.25,.05],.11,.075,'upper-arm');b.link(cream,[s*.43,1.25,.05],[s*.53,1.08,.18],.09,.06,'feather-forearm');b.ell(0x8a8580,[s*.54,1.025,.19],[.09,.115,.07],undefined,'gray-hand');
    for(let k=0;k<3;k++)b.tube(0xa6a095,[[s*(.49+k*.045),1.025,.21],[s*(.5+k*.05),.91,.26],[s*(.52+k*.054),.95,.32]],.025,'curved-hand-claw',.008);
    for(let k=0;k<3;k++)feather(b,cream,[s*.08,1.51,.20],[s*(.18+k*.08),1.29-k*.025,.24],.15);
   }
   b.link(red,[0,1.48,0],[0,1.75,.015],.13,.11,'neck');b.ell(red,[0,1.87,.045],[.21,.26,.195],undefined,'angular-head');
   eyePair(b,1.958,.258,.115,.045,0x499eab,-.25);shard(b,cream,[0,1.9,.207],[[-.11,0],[0,-.07],[.11,0],[0,.10]],[1,1,1],undefined,'beak-mask');
   for(const s of [-1,1]){
    feather(b,cream,[s*.12,2.02,0],[s*.52,1.68,-.18],.24);feather(b,cream,[s*.18,1.94,-.03],[s*.69,1.55,-.21],.27);feather(b,cream,[s*.20,1.88,-.07],[s*.62,1.42,-.23],.19);
    b.cone(red,[s*.12,2.18,.025],.055,.40,[0,0,s*-.18],'red-head-prong');
   }
   b.tube(red,[[0,1.15,-.19],[0,1.02,-.43],[0,1.03,-.60]],.12,'short-plume-tail',.015);
  }
 };}
 register('torchic',chicken(0));register('combusken',chicken(1));register('blaziken',chicken(2));

 function amphibian(stage){return b=>{
  const blue=[0x56b8dc,0x55babf,0x559ec8][stage],pale=0xbad6e4,fin=stage===0?0x52abd0:0x42576c,orange=0xeca26b;
  if(stage===0){
   b.ell(blue,[0,.43,-.14],[.34,.27,.52],undefined,'quadruped-body');b.ell(blue,[0,.71,.29],[.46,.36,.35],undefined,'broad-head');b.ell(pale,[0,.50,.484],[.355,.135,.13],undefined,'pale-chin');eyePair(b,.79,.598,.225,.062,0x302f38);smile(b,.587,.629,.18);
   for(const s of [-1,1]){for(const z of [-.4,.11])b.ell(blue,[s*.245,.20,z],[.105,.21,.135],undefined,'short-leg');for(const z of [-.31,.22])for(let k=0;k<3;k++)toe(b,blue,[s*.245+(k-1)*.04,.055,z],.07,.024);
    shard(b,orange,[s*.405,.61,.30],s===1?[[-.04,.15],[.16,.23],[.115,.05],[.24,-.01],[.10,-.08],[.11,-.23],[-.05,-.13]]:[[.04,.15],[-.16,.23],[-.115,.05],[-.24,-.01],[-.1,-.08],[-.11,-.23],[.05,-.13]],[1,1,1],[0,s*.25,0],'orange-cheek-gill');}
   b.leaf(fin,[0,1.14,.19],[.48,.95,1],[0,0,0],'large-upright-head-fin');b.tube(0x286f98,[[0,.74,.27],[0,1.18,.26],[0,1.55,.225]],.011,'head-fin-midline');
   b.leaf(pale,[0,.49,-.85],[.65,.86,.9],[.82,0,0],'paddle-tail');for(const x of [-.16,0,.16])b.tube(0x788d9e,[[x*.4,.37,-.53],[x,.55,-.90],[x*.5,.78,-1.15]],.009,'tail-fin-ray');
  }else if(stage===1){
   b.ell(blue,[0,.74,0],[.36,.45,.27],undefined,'upright-round-body');b.ell(orange,[0,.79,.255],[.235,.28,.045],undefined,'orange-belly');b.ell(blue,[0,1.32,.04],[.38,.29,.29],undefined,'flat-amphibian-head');
   eyePair(b,1.4,.297,.22,.053,0xd9a349);b.ell(0xb98594,[0,1.215,.31],[.2,.08,.035],undefined,'open-smile');b.ell(0xf0b6c0,[0,1.18,.342],[.125,.035,.014],undefined,'tongue');
   for(const s of [-1,1]){b.ell(blue,[s*.245,.31,.07],[.145,.29,.17],[0,0,s*-.17],'sturdy-leg');b.ell(blue,[s*.285,.075,.19],[.145,.065,.20],undefined,'webbed-foot');for(let k=0;k<3;k++)b.mouth([[s*.285+(k-1)*.06,.078,.34],[s*.285+(k-1)*.06,.075,.385]],.007,0x317b84);
    b.link(blue,[s*.26,1.01,.015],[s*.51,1.20,.05],.12,.09,'raised-arm');b.ell(blue,[s*.56,1.32,.055],[.145,.23,.08],[0,0,s*-.34],'webbed-hand');for(let k=0;k<3;k++)b.mouth([[s*(.5+k*.065),1.38,.134],[s*(.54+k*.055),1.47,.13]],.007,0x387f8d);
    b.ell(orange,[s*.365,1.24,.16],[.115,.21,.085],[0,0,s*-.2],'cheek-gill-base');for(let k=0;k<2;k++)b.cone(orange,[s*(.46+k*.025),1.24-k*.1,.17],.05,.22,[0,0,-s*Math.PI/2],'gill-spike');
    b.leaf(fin,[s*.28,.60,-.31],[.32,.78,1],[.6,0,s*-.4],'paired-tail-fin');}
   shard(b,fin,[0,1.47,-.04],[[-.12,0],[-.11,.4],[.04,.70],[.17,.72],[.12,0]],[1,1,1],[0,Math.PI/2,0],'single-head-fin');
   b.tube(0x728397,[[.03,1.50,.06],[.03,1.82,-.09],[.03,2.07,-.17]],.012,'fin-ray');
  }else{
   b.ell(blue,[0,.66,-.12],[.55,.40,.54],[.13,0,0],'wide-crouched-torso');b.ell(pale,[0,.59,.31],[.37,.28,.12],undefined,'pale-chest');b.ell(blue,[0,1.03,.36],[.41,.29,.31],undefined,'wide-low-head');b.ell(pale,[0,.89,.58],[.28,.10,.15],undefined,'heavy-jaw');eyePair(b,1.13,.602,.22,.051,0xd8974b,-.13);smile(b,.91,.696,.18);
   for(const s of [-1,1]){
    b.ell(blue,[s*.47,.46,-.33],[.25,.29,.24],[0,0,s*.28],'hind-haunch');b.link(blue,[s*.50,.4,-.36],[s*.63,.13,-.17],.14,.09,'hind-ankle');b.ell(blue,[s*.64,.07,-.04],[.20,.06,.27],undefined,'hind-webbed-foot');
    b.link(blue,[s*.38,.77,.16],[s*.64,.46,.35],.18,.14,'massive-upper-arm');b.link(blue,[s*.64,.46,.35],[s*.79,.12,.59],.16,.095,'long-forearm');b.ell(blue,[s*.80,.075,.65],[.22,.065,.21],undefined,'splayed-front-hand');
    for(let k=0;k<4;k++){toe(b,blue,[s*.8+(k-1.5)*.077,.055,.74],.17,.033);b.mouth([[s*.8+(k-1.5)*.077,.086,.71],[s*.8+(k-1.5)*.077,.073,.86]],.007,0x347197);}
    for(let k=0;k<3;k++)b.ell(orange,[s*.64,.53-k*.10,.46+k*.047],[.12,.055,.045],[0,0,s*.22],'orange-arm-pad');
    for(let k=0;k<3;k++)b.cone(orange,[s*(.44+k*.047),1.0-k*.07,.47],.064-k*.008,.25-k*.025,[0,0,-s*Math.PI/2],'cheek-gill-spike');
    b.leaf(fin,[s*.20,1.47,.24],[.38,.95,1],[.12,s*.08,s*-.23],'twin-tall-head-fin');b.tube(0x718394,[[s*.13,1.15,.30],[s*.20,1.52,.30],[s*.30,1.88,.20]],.012,'head-fin-ray');
   }
   b.leaf(fin,[0,.78,-.77],[.97,1.13,1],[.7,0,0],'large-dorsal-tail');for(const s of [-1,0,1])b.tube(0x6f8193,[[s*.1,.47,-.4],[s*.23,.89,-.83],[s*.13,1.26,-1.08]],.012,'dorsal-tail-ray');
  }
 };}
 register('mudkip',amphibian(0));register('marshtomp',amphibian(1));register('swampert',amphibian(2));

 function turtle(stage){return b=>{
  const skin=[0xb7cd71,0x779f51,0x71875b][stage],shell=[0x725132,0xcbb249,0x4d8950][stage];
  const large=stage===2,mid=stage===1,bodyW=large?.73:mid?.57:.34,bodyL=large?.82:mid?.65:.43,base=large?.67:mid?.58:.42;
  b.ell(skin,[0,base,-.08],[bodyW,.29,bodyL],undefined,'quadruped-turtle-body');b.ell(shell,[0,base+.17,-.13],[bodyW*1.09,large?.34:.27,bodyL*1.04],undefined,'domed-carapace');
  b.ell(large?0xd6d6bd:0xe0c35a,[0,base+.045,-.13],[bodyW*1.14,.095,bodyL*1.08],undefined,'continuous-shell-rim');
  for(const s of [-1,1])for(const z of [-bodyL*.66,bodyL*.55]){
   b.ell(large?0x99784b:skin,[s*bodyW*.72,base*.43,z],[large?.20:mid?.16:.105,base*.49,large?.22:mid?.19:.125],undefined,'weight-bearing-leg');
   b.ell(mid?0xc5a647:large?0x987647:0xdcc65c,[s*bodyW*.72,.11,z+.04],[large?.21:mid?.17:.11,.10,large?.21:mid?.18:.13],undefined,'foot-cuff');claws(b,s*bodyW*.72,.07,z+(large?.24:mid?.2:.15),3,large?.105:mid?.083:.052,large?.063:mid?.047:.031);
  }
  const hy=large?.70:mid?.67:.73,hz=bodyL*.85;
  b.ell(skin,[0,hy,hz],[large?.36:mid?.32:.33,large?.25:mid?.24:.32,large?.32:mid?.29:.28],[0,0,0],'turtle-head');b.ell(mid?0xc5a448:large?0x71934f:0xbacf73,[0,hy-.10,hz+.21],[large?.34:mid?.31:.27,.16,.20],undefined,'beaked-muzzle');
  for(const s of [-1,1]){
   b.eye([s*(large?.265:mid?.235:.225),hy+.045,hz+.225],[large?.064:mid?.067:.066,large?.085:mid?.09:.12,.039],large?0xa65837:0x7a6633,[0,s*.35,s*(mid?.15:0)]);
   b.ball(mid?0xc5a448:large?0xa7afa2:0xe8cc5b,[s*(large?.34:mid?.29:.28),hy-.065,hz+.10],large?.10:mid?.092:.095,'cheek');
  }
  b.mouth([[-.19,hy-.15,hz+.355],[0,hy-.18,hz+.402],[.19,hy-.15,hz+.355]],.013);
  b.tube(skin,[[0,base-.05,-bodyL*.80],[0,base-.07,-bodyL*1.30],[0,base+.04,-bodyL*1.49]],large?.13:mid?.08:.043,'pointed-tail',.007);
  if(stage===0){
   // The shell is brown with dark recesses, and the seedling sprouts from the head.
   for(const s of [-1,1])b.tube(0x403b29,[[s*.17,base+.39,.13],[s*.22,base+.39,-.15],[s*.17,base+.29,-.47]],.034,'shell-panel-seam');b.tube(0x403b29,[[-.29,base+.31,-.14],[0,base+.445,-.15],[.29,base+.31,-.14]],.034,'shell-cross-seam');
   shard(b,0xa08050,[0,hy+.275,hz+.12],[[-.21,0],[-.12,.08],[-.04,.02],[.04,.095],[.12,.02],[.2,.07],[.21,-.01]],undefined,undefined,'brown-head-seed-patch');
   b.tube(0x866744,[[0,hy+.28,hz],[.015,hy+.46,hz-.02],[0,hy+.63,hz]],.028,'seedling-stem');
   b.leaf(0x56a263,[-.12,hy+.61,hz+.01],[.27,.47,.7],[0,0,.48],'left-sprout-leaf');b.leaf(0x66b477,[.14,hy+.61,hz+.015],[.28,.43,.7],[0,0,-.63],'right-sprout-leaf');
  }else if(stage===1){
   // Two separate shrubs rise from the ochre shell; no trunk or stone mountains yet.
   for(const z of [-.43,.18]){
    b.ell(0x448650,[0,base+.46,z],[.42,.23,.35],undefined,'shell-shrub-core');
    for(let i=0;i<9;i++){const a=i*Math.PI*2/9;feather(b,i%2?0x4d985f:0x347847,[Math.cos(a)*.14,base+.46,z+Math.sin(a)*.12],[Math.cos(a)*.51,base+.62+(i%3)*.04,z+Math.sin(a)*.39],.17);}
   }
   b.ell(0xc7ac41,[0,hy+.18,hz-.03],[.35,.105,.34],undefined,'ochre-head-helmet');for(const s of [-1,1])b.tube(0x9c8139,[[s*.48,base+.28,.24],[s*.56,base+.18,-.13],[s*.45,base+.25,-.54]],.019,'shell-relief');
  }else{
   // Landscape shell: one asymmetric tree and three pale mountain peaks.
   b.ell(0x668e4e,[0,base+.39,-.12],[.66,.07,.71],undefined,'grassy-shell-island');
   b.tube(0x846242,[[.28,base+.39,-.28],[.30,1.41,-.29],[.17,1.69,-.34],[.22,1.92,-.38]],.12,'bent-tree-trunk',.058);
   b.tube(0x745438,[[.27,1.42,-.29],[.49,1.66,-.31],[.56,1.84,-.27]],.066,'tree-branch-right',.021);b.tube(0x87603a,[[.29,1.55,-.3],[-.03,1.74,-.33],[-.17,1.89,-.35]],.066,'tree-branch-left',.018);
   for(const [x,y,z,r] of [[.19,1.98,-.36,.37],[-.11,1.92,-.3,.28],[.48,1.96,-.29,.34],[.13,2.16,-.38,.28],[.40,2.13,-.32,.27]]){
    b.add(new THREE.IcosahedronGeometry(r,1),0x397644,[x,y,z],[1,.58,.83],undefined,'faceted-tree-canopy');
    for(let k=0;k<3;k++){const a=k*2.094;b.add(new THREE.IcosahedronGeometry(r*.42,1),0x49894c,[x+Math.cos(a)*r*.6,y+.05,z+Math.sin(a)*r*.55],[1,.7,1],undefined,'leafy-crown-edge');}
   }
   for(const [x,z,r,h] of [[-.36,-.40,.18,.48],[-.48,-.04,.18,.34],[-.30,.23,.20,.28]])b.add(new THREE.ConeGeometry(r,h,4),0xccd0c3,[x,base+.43+h*.43,z],[1,1,1],[0,.30,.07],'mountain-peak');
   for(const s of [-1,1]){b.cone(0xd5d8c6,[s*.36,hy+.17,hz+.04],.11,.33,[0,0,-s*1.05],'head-side-horn');b.cone(0xc9c9b6,[s*.68,base+.14,.05],.11,.27,[0,0,-s*1.28],'shell-side-spur');}
   for(const s of [-1,1])b.tube(0x9d9979,[[s*.55,base+.13,.36],[s*.70,base+.14,-.06],[s*.56,base+.13,-.64]],.013,'shell-rim-relief');
  }
 };}
 register('turtwig',turtle(0));register('grotle',turtle(1));register('torterra',turtle(2));

 function monkey(stage){return b=>{
  const skin=[0xeaaa42,0xd98c34,0xb9784c][stage],cream=0xf9e5ac,white=0xf6efdf,gold=0xe7c445;
  const adult=stage===2,mid=stage===1;
  const bodyY=adult?.90:mid?.77:.66,headY=adult?1.55:mid?1.38:1.30;
  b.ell(skin,[0,bodyY,0],[adult?.27:mid?.245:.21,adult?.38:.32,.19],undefined,'monkey-torso');b.ell(adult?white:cream,[0,bodyY,.181],[adult?.225:.16,.255,.04],undefined,'pale-chest-belly');
  b.ell(skin,[0,headY,.06],[adult?.26:mid?.28:.36,adult?.29:mid?.29:.37,.24],undefined,'monkey-head');
  for(const s of [-1,1]){
   b.ell(adult?skin:cream,[s*(adult?.26:mid?.29:.345),headY-.015,.02],[adult?.095:.12,adult?.13:.18,.065],[0,0,s*.10],'large-ear');b.ell(adult?0x9e5d48:0xb86f52,[s*(adult?.277:mid?.306:.364),headY-.015,.08],[adult?.057:.072,adult?.085:.125,.016],[0,0,s*.10],'ear-interior');
   b.ell(adult?white:cream,[s*(adult?.105:mid?.113:.14),headY-.01,.248],[adult?.145:mid?.154:.17,adult?.22:mid?.217:.27,.042],[0,0,s*-.15],'heart-shaped-face-lobe');
  }
  if(mid){for(const s of [-1,1])b.ell(0x3186ae,[s*.123,headY+.077,.281],[.14,.125,.025],[0,0,s*-.24],'blue-eye-mask');}
  if(adult){for(const s of [-1,1])shard(b,0xb64630,[s*.03,headY+.015,.296],s===1?[[0,.02],[.18,.12],[.2,.01],[.07,-.045]]:[[0,.02],[-.18,.12],[-.2,.01],[-.07,-.045]],undefined,undefined,'red-eye-mask');}
  eyePair(b,headY+.025,.301,adult?.12:mid?.128:.153,adult?.053:mid?.066:.079,0x494245,adult?-.15:0);
  b.ell(adult?skin:cream,[0,headY-.16,.29],[adult?.125:.16,.095,.075],undefined,'protruding-muzzle');for(const s of [-1,1])b.ball(0x8b6345,[s*.04,headY-.115,.363],.009,'nostril');smile(b,headY-.19,.361,.09);
  for(const s of [-1,1]){
   if(adult){
    b.link(skin,[s*.22,1.10,0],[s*.43,.87,.05],.098,.08,'upper-arm');b.link(skin,[s*.43,.87,.05],[s*.59,.49,.16],.086,.065,'long-forearm');b.ell(0x36566a,[s*.61,.405,.20],[.10,.125,.062],undefined,'blue-hand');
    b.link(white,[s*.16,.68,0],[s*.34,.46,.13],.12,.11,'white-thigh');b.link(white,[s*.34,.46,.13],[s*.38,.15,.18],.10,.065,'white-shin');b.ell(0x35556b,[s*.395,.075,.275],[.135,.058,.18],undefined,'blue-foot');
    b.ell(gold,[s*.26,1.1,.076],[.14,.15,.087],undefined,'gold-shoulder-armor');b.ell(gold,[s*.56,.60,.217],[.085,.14,.04],[0,0,s*-.16],'gold-wrist-armor');b.ell(gold,[s*.345,.465,.242],[.115,.12,.045],undefined,'gold-knee-armor');
    b.tube(0xb09235,[[s*.24,1.16,.162],[s*.30,1.14,.164],[s*.31,1.08,.161],[s*.25,1.055,.161],[s*.225,1.1,.161]],.010,'shoulder-engraving');
    for(let k=0;k<4;k++){toe(b,0x35556b,[s*.395+(k-1.5)*.059,.045,.39],.08,.025);b.link(0x35556b,[s*.61+(k-1.5)*.043,.375,.21],[s*.62+(k-1.5)*.05,.28,.24],.020,.017,'hand-finger');}
    feather(b,white,[s*.18,1.17,.14],[s*.31,1.31,.07],.12);feather(b,white,[s*.23,.8,.01],[s*.37,.72,-.07],.15);
   }else{
    b.link(skin,[s*.15,bodyY+.20,0],[s*(mid?.34:.27),bodyY-.05,.05],.068,.05,'upper-arm');b.link(skin,[s*(mid?.34:.27),bodyY-.05,.05],[s*(mid?.47:.35),mid?.51:.20,.13],.05,.042,'long-forearm');
    const hx=s*(mid?.49:.36),hy=mid?.465:.14;b.ell(cream,[hx,hy,.155],[.079,.085,.06],undefined,'pale-hand');for(let k=0;k<4;k++)b.tube(cream,[[hx+(k-1.5)*.033,hy,.19],[hx+(k-1.5)*.04,hy-.065,.22],[hx+(k-1.5)*.04,hy-.07,.27]],.018,'long-finger',.012);
    b.ell(skin,[s*.16,.34,.01],[.12,.21,.13],[0,0,s*-.22],'bent-thigh');b.link(skin,[s*.18,.29,.02],[s*.22,.10,.10],.063,.046,'shin');b.ell(cream,[s*.235,.063,.18],[.11,.05,.16],undefined,'pale-foot');for(let k=0;k<3;k++)toe(b,cream,[s*.235+(k-1)*.049,.04,.285],.07,.022);
   }
  }
  if(stage===0){
   b.tube(skin,[[0,headY+.30,.04],[-.035,headY+.43,.02],[.045,headY+.51,.01],[.04,headY+.61,.01]],.11,'curled-head-tuft',.004);b.tube(skin,[[0,.47,-.18],[.23,.43,-.44],[.33,.66,-.56]],.063,'short-curled-tail',.045);b.flame([.34,.71,-.55],.46);
  }else if(mid){
   feather(b,skin,[0,headY+.22,.02],[.1,headY+.57,.02],.32);b.tube(skin,[[0,.58,-.17],[.36,.55,-.47],[.57,.88,-.60],[.49,1.22,-.60]],.055,'long-monkey-tail',.035);b.flame([.49,1.27,-.60],.50);
   for(const s of [-1,1])for(let k=0;k<3;k++)feather(b,white,[s*.06,1.085,.12],[s*(.16+k*.05),.975-k*.025,.17],.095);
  }else{
   b.tube(skin,[[0,.72,-.17],[.26,.79,-.47],[.57,1.03,-.58],[.73,1.07,-.49]],.066,'long-bare-tail',.029);
   for(const s of [-1,0,1]){b.flame([s*.12,headY+.25,.035-Math.abs(s)*.045],s===0?.73:.54);}
   for(const s of [-1,1]){feather(b,white,[s*.04,headY+.16,.27],[s*.22,headY+.38,.17],.13);feather(b,white,[s*.20,headY-.11,.15],[s*.29,headY-.26,.09],.11);}
   b.ell(gold,[0,1.08,.221],[.095,.14,.038],undefined,'gold-chest-disk');b.tube(0xb09235,[[-.04,1.145,.260],[.045,1.12,.263],[.04,1.045,.262],[-.035,1.04,.26]],.009,'chest-engraving');
  }
 };}
 register('chimchar',monkey(0));register('monferno',monkey(1));register('infernape',monkey(2));

 function penguin(stage){return b=>{
  const blue=[0x4a98cc,0x3777ac,0x213b55][stage],light=0xb7dce1,gold=0xeac342;
  if(stage===0){
   b.ell(light,[0,.53,0],[.34,.39,.285],undefined,'round-penguin-body');b.ell(blue,[0,1.09,.025],[.42,.4,.34],undefined,'large-blue-head');
   for(const s of [-1,1])b.ell(0xf8fbf2,[s*.19,1.025,.29],[.185,.215,.06],[0,0,s*.11],'white-face-lobe');
   eyePair(b,1.08,.351,.17,.058,0x3c5e8d);b.ell(gold,[0,.972,.38],[.084,.075,.12],undefined,'small-gold-beak');
   for(const s of [-1,1]){b.ell(blue,[s*.13,.772,.225],[.20,.10,.07],[0,0,s*-.13],'blue-collar-lobe');b.ell(blue,[s*.335,.51,0],[.11,.265,.085],[0,0,s*.19],'short-flipper');b.link(blue,[s*.15,.28,.02],[s*.15,.07,.1],.068,.055,'connected-ankle');b.ell(gold,[s*.15,.06,.1],[.115,.047,.185],[0,s*-.13,0],'webbed-yellow-foot');b.ell(0xf8fbf2,[s*.12,.54,.277],[.056,.081,.023],undefined,'white-belly-button');}
   for(const s of [-1,0,1])feather(b,blue,[s*.1,.34,-.22],[s*.15,.52,-.52],.13);
  }else if(stage===1){
   b.ell(blue,[0,.81,0],[.37,.56,.30],undefined,'upright-penguin-body');b.ell(light,[0,.65,.252],[.29,.38,.075],undefined,'pale-belly');b.ell(blue,[0,1.48,.035],[.27,.35,.235],undefined,'long-penguin-head-neck');
   for(const s of [-1,1]){
    b.eye([s*.122,1.51,.246],[.069,.105,.037],0x659b9f,[0,s*.14,s*.1]);
    b.link(blue,[s*.21,.40,.015],[s*.21,.08,.1],.08,.055,'connected-ankle');b.ell(gold,[s*.21,.08,.1],[.13,.065,.22],undefined,'webbed-foot');for(let k=0;k<3;k++)toe(b,gold,[s*.21+(k-1)*.065,.04,.25],.13,.022);
    feather(b,blue,[s*.29,1.09,.01],[s*.78,.77,.075],.35);feather(b,light,[s*.54,.9,.087],[s*.79,.755,.105],.14);
    for(const y of [.52,.82])b.ell(0xf5f8ec,[s*.145,y,.31],[.051,.082,.027],undefined,'white-belly-button');
    b.tube(gold,[[s*.04,1.52,.28],[s*.12,1.87,.20],[s*.27,1.97,.13],[s*.24,1.70,.16]],.045,'arched-yellow-head-crest',.018);
   }
   b.cone(gold,[0,1.38,.332],.095,.20,[Math.PI/2,0,0],'golden-beak');for(const s of [-1,0,1])feather(b,blue,[s*.1,.52,-.23],[s*.17,.62,-.58],.18);
  }else{
   b.ell(blue,[0,.92,0],[.43,.65,.33],undefined,'emperor-torso');b.ell(0xe7eef0,[0,.91,.279],[.275,.50,.09],undefined,'white-shirt-belly');
   b.ell(blue,[0,1.70,.015],[.23,.31,.215],undefined,'emperor-head');b.link(blue,[0,1.37,0],[0,1.65,0],.17,.145,'upright-neck');
   for(const s of [-1,1]){
    b.ell(blue,[s*.24,.28,.02],[.16,.22,.18],undefined,'short-sturdy-leg');b.ell(gold,[s*.26,.067,.15],[.15,.058,.21],undefined,'gold-webbed-foot');for(let k=0;k<3;k++){toe(b,gold,[s*.26+(k-1)*.075,.045,.28],.10,.025);b.cone(C.claw,[s*.26+(k-1)*.075,.045,.405],.022,.08,[Math.PI/2,0,0],'foot-claw');}
    // Pointed tuxedo lapels and broad metal-edged wings are independent silhouettes.
    shard(b,0x273f52,[0,0,.34],[[s*.05,1.50],[s*.26,1.37],[s*.31,.66],[s*.13,.49]],[1,1,1],undefined,'black-tuxedo-lapel');
    shard(b,0x1c3348,[0,0,.015],[[s*.31,1.37],[s*.55,1.23],[s*.88,.47],[s*.71,.39],[s*.47,.75]],[1,1,1],undefined,'blade-flipper');
    b.tube(0x6b9ccb,[[s*.48,1.29,.105],[s*.70,.86,.10],[s*.89,.48,.10],[s*.72,.41,.10]],.031,'steel-blue-wing-edge');b.ell(0x6b9ccb,[s*.40,1.35,.03],[.14,.15,.11],[0,0,s*.35],'blue-shoulder-plate');
    for(let k=0;k<3;k++)b.ell(gold,[s*(.65+k*.05),.62-k*.045,.085],[.014,.031,.012],[0,0,s*-.25],'gold-flipper-dots');
    b.eye([s*.105,1.73,.214],[.052,.063,.031],0x86a2b6,[0,s*.16,s*-.20]);
    feather(b,0x6795bb,[s*.14,1.53,-.04],[s*.41,1.72,-.09],.18);
   }
   // One continuous golden trident surrounding the face, with three sharp tips.
   b.tube(gold,[[-.16,1.70,.275],[0,1.53,.285],[.16,1.70,.275]],.045,'trident-beak-base');
   b.tube(gold,[[0,1.55,.292],[0,1.88,.272],[.015,2.17,.20]],.039,'center-trident-shaft',.022);
   for(const s of [-1,1]){b.tube(gold,[[s*.135,1.66,.278],[s*.18,1.91,.24],[s*.22,2.055,.20]],.035,'side-trident-prong',.012);b.cone(gold,[s*.22,2.08,.20],.05,.16,[0,0,-s*.17],'outer-crown-tip');}
   b.cone(gold,[.015,2.21,.20],.057,.20,undefined,'central-crown-tip');
   for(let k=0;k<3;k++)b.ball(0x20384b,[k*.085-.085,.57+Math.abs(k-1)*.07,.353],.033,'shirt-button');
   for(const s of [-1,0,1])feather(b,blue,[s*.16,.59,-.25],[s*.28,.77,-.62],.23);
  }
 };}
 register('piplup',penguin(0));register('prinplup',penguin(1));register('empoleon',penguin(2));
})();
