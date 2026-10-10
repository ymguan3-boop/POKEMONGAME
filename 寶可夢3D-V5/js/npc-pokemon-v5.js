/* Authored from Taiwanese official Pokédex reference art. Y up, +Z forward.
 * Display heights: Chansey 1.8, Happiny 1.0, Arcanine 2.7 game units. */
(function(global){'use strict';const T=global.THREE;
 function build(id){const g=new T.Group();g.name='npc-'+id;const materials=new Map();
 function add(geo,c,x=0,y=0,z=0,name='detail'){if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.78}));const m=new T.Mesh(geo,materials.get(c));m.position.set(x,y,z);m.name=name;m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 function e(c,x,y,z,sx,sy,sz,name){const m=add(new T.SphereGeometry(1,24,16),c,x,y,z,name);m.scale.set(sx,sy,sz);return m;}
 function line(c,pts,r,name){return add(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p))),20,r,8,false),c,0,0,0,name);}
 function spike(c,a,b,r,name){const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);const m=add(new T.ConeGeometry(r,d.length(),7),c,...av.clone().add(bv).multiplyScalar(.5).toArray(),name);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
 function eyes(x,y,z,s=.07){for(const q of [-1,1]){e(0x161e27,q*x,y,z,s*.63,s,s*.38,'eye');e(0xffffff,q*x-.012,y+.025,z+s*.35,s*.21,s*.24,s*.1,'eye-glint');}}
 const pink=0xf3aac2,deep=0xce7093,cream=0xffe5b3,orange=0xe9903e,dark=0x2a303b;
 if(id==='chansey'){
  e(pink,0,.85,0,.66,.83,.47,'egg-body');
  for(const s of [-1,1]){e(deep,s*.36,.12,.075,.22,.12,.24,'foot');for(let i=0;i<3;i++)line(pink,[[s*.48,1.3-i*.09,0],[s*.75,1.2-i*.10,.04],[s*(.97-i*.045),1.26-i*.13,.06]],.075,'side-fringe');
  const arm=e(pink,s*.38,.79,.40,.15,.25,.14,'arm');arm.rotation.z=-s*.4;}
  e(deep,0,.55,.43,.32,.28,.16,'egg-pouch');e(0xfff8e4,0,.69,.51,.255,.3,.17,'egg');
  line(pink,[[-.3,.55,.52],[0,.42,.58],[.3,.55,.52]],.045,'pouch-rim');
  eyes(.15,1.24,.421,.062);line(0x6f3b52,[[-.11,1.08,.473],[0,1.05,.491],[.11,1.08,.473]],.012,'smile');
  line(pink,[[0,.4,-.32],[.24,.33,-.7],[.41,.43,-.76]],.10,'tail');
 }else if(id==='happiny'){
  e(deep,0,.37,0,.37,.34,.27,'lower-body');e(0xfff5e8,0,.39,.035,.355,.25,.275,'white-waistband');e(pink,0,.63,.03,.34,.36,.265,'head');
  for(const s of [-1,1]){e(deep,s*.18,.08,.035,.09,.11,.12,'foot');e(pink,s*.29,.43,.18,.075,.14,.065,'arm');e(0xe787a2,s*.22,.63,.256,.051,.073,.016,'cheek');}
  e(deep,0,.96,0,.125,.065,.11,'hair-tie');line(pink,[[0,.96,0],[.02,1.12,0],[.18,1.18,0],[.23,1.08,0],[.18,1.03,0]],.075,'top-curl');
  for(let i=-1;i<=1;i++)e(pink,i*.115,.865,.19,.08,.09,.075,'forehead-curl');
  e(0xfff9e8,.07,.4,.29,.13,.15,.065,'egg-stone');line(pink,[[-.17,.43,.287],[-.05,.36,.31],[.055,.38,.326]],.038,'holding-arm');
  eyes(.1,.69,.281,.046);e(0x873c51,0,.584,.294,.055,.055,.014,'happy-mouth');e(0xf18c9c,0,.56,.31,.033,.022,.008,'tongue');
 }else if(id==='arcanine'){
  e(orange,0,1.18,-.12,.54,.62,1.0,'body');e(orange,0,1.83,.72,.49,.5,.48,'head');
  for(const s of [-1,1])for(const z of [-.68,.55]){e(orange,s*.37,.62,z,.20,.57,.22,'leg');e(orange,s*.39,.16,z+.09,.235,.17,.30,'paw');for(let i=-1;i<=1;i++)line(0x996333,[[s*.39+i*.12,.15,z+.36],[s*.39+i*.12,.08,z+.37]],.013,'toe');}
  // Layered pointed cream mane follows head and chest, with a broad fluffy tail.
  e(cream,0,1.44,.65,.61,.67,.48,'mane');
  for(let i=0;i<18;i++){let a=i/18*Math.PI*2;let x=Math.cos(a),y=Math.sin(a);spike(cream,[x*.42,1.49+y*.49,.70],[x*.72,1.49+y*.84,.74],.145,'mane-lock');}
  e(orange,0,1.95,.91,.41,.36,.33,'face');e(cream,0,1.77,1.14,.29,.19,.26,'muzzle');e(dark,0,1.87,1.385,.10,.065,.053,'nose');
  for(const s of [-1,1]){spike(orange,[s*.31,2.06,.77],[s*.51,2.5,.76],.24,'ear');spike(dark,[s*.32,2.13,.87],[s*.47,2.4,.86],.14,'ear-inner');
   e(0xfffdf3,s*.19,2.01,1.203,.115,.078,.022,'eye-white');e(dark,s*.19,2.005,1.23,.037,.06,.02,'eye');
   line(dark,[[s*.08,2.09,1.18],[s*.2,2.10,1.18],[s*.32,2.15,1.09]],.028,'brow');
   for(let i=0;i<3;i++)line(dark,[[s*.45,1.6,-.75+i*.50],[s*.55,1.23,-.55+i*.5],[s*.50,1.0,-.72+i*.5]],.065,'tiger-stripe');
   for(const z of [-.68,.55]){line(dark,[[s*.53,.86,z-.08],[s*.55,.73,z+.1],[s*.53,.63,z-.05]],.04,'leg-stripe');for(let i=0;i<4;i++)spike(cream,[s*.37,.39,z],[s*.37+(i-1.5)*.1,.61,z-.3],.095,'ankle-fur');}}
  line(dark,[[-.15,1.68,1.34],[0,1.65,1.37],[.15,1.68,1.34]],.015,'mouth');
  line(cream,[[0,1.24,-.94],[.05,1.52,-1.28],[.12,1.94,-1.42],[.18,2.13,-1.25]],.30,'tail-plume');
  for(let i=0;i<9;i++)spike(cream,[(i%3-1)*.14,1.6+(i%3)*.12,-1.32],[(i%3-1)*.30,2.03+(i%4)*.12,-1.52-i*.025],.19,'tail-tuft');
  for(let i=0;i<7;i++)spike(cream,[(i-3)*.075,2.16,.76],[(i-3)*.11,2.52+(.14-Math.abs(i-3)*.025),.64],.12,'forehead-mane');
 }else throw new Error('Unknown NPC Pokémon: '+id);
 g.updateMatrixWorld(true);const box=new T.Box3().setFromObject(g),scale={chansey:1.8,happiny:1,arcanine:2.7}[id]/(box.max.y-box.min.y);g.scale.setScalar(scale);g.position.y=-box.min.y*scale;
 const root=new T.Group();root.add(g);root.name='npc-'+id;root.userData={species:id,source:'official-pokedex-authored-v5',height:{chansey:1.8,happiny:1,arcanine:2.7}[id]};return root;}
 global.PalletNpcPokemonV5={build};
})(window);
