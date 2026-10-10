/* Locally authored V5 props. THREE only; no network or font dependency.
 * ball(): centre origin, radius .24, +Z button. item(): floor y=0, height .6. */
(function(global){'use strict';
 const T=global.THREE;
 function mat(c){return new T.MeshStandardMaterial({color:c,roughness:.36,metalness:.06});}
 function part(g,geo,c,x=0,y=0,z=0){const m=new T.Mesh(geo,mat(c));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
 function ell(g,c,x,y,z,sx,sy,sz){const m=part(g,new T.SphereGeometry(1,24,16),c,x,y,z);m.scale.set(sx,sy,sz);return m;}
 function tube(g,c,points,r){return part(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),24,r,8,false),c);}
 function ball(type='normal'){
  const g=new T.Group(),r=.24;g.name='v5-'+type+'-ball';
  part(g,new T.SphereGeometry(r,32,20,0,Math.PI*2,0,Math.PI/2),{normal:0xe82e35,great:0x176bd4,master:0x7030b8}[type]||0xe82e35);
  part(g,new T.SphereGeometry(r,32,20,0,Math.PI*2,Math.PI/2,Math.PI/2),0xf8f6f1);
  part(g,new T.CylinderGeometry(r+.001,r+.001,.024,40),0x171e2c);
  const b=part(g,new T.CylinderGeometry(.067,.067,.022,32),0x171e2c,0,0,.236);b.rotation.x=Math.PI/2;
  const w=part(g,new T.CylinderGeometry(.049,.049,.025,32),0xfafafa,0,0,.25);w.rotation.x=Math.PI/2;
  const inset=part(g,new T.CylinderGeometry(.029,.029,.006,24),0xd7e0e7,0,0,.265);inset.rotation.x=Math.PI/2;
  if(type==='great')for(const s of [-1,1]){const pts=[];for(let i=0;i<=12;i++){const a=.30+i*.065;pts.push([s*.138,Math.sin(a)*.199,Math.cos(a)*.199]);}tube(g,0xe83c43,pts,.028);}
  if(type==='master'){
   for(const s of [-1,1]){const m=ell(g,0xdd5da6,s*.145,.145,.09,.066,.088,.046);m.rotation.z=-s*.45;}
   // Raised M made from four bars, not a downloaded label or font.
   tube(g,0xffffff,[[-.055,.052,.23],[-.035,.117,.21],[0,.067,.231],[.035,.117,.21],[.055,.052,.23]],.008);
  }
  g.userData={kind:type,radius:r,source:'authored-v5-game-reference'};return g;
 }
 function berry(){const g=new T.Group();g.name='v5-razz-berry';
  for(let row=0;row<4;row++){let count=6-row;let rad=.14-row*.027;for(let k=0;k<count;k++){let a=k/count*Math.PI*2;ell(g,k%2?0xe45b82:0xc83262,Math.cos(a)*rad,.35-row*.073,Math.sin(a)*rad,.084,.085,.083);}}
  ell(g,0xc93262,0,.31,0,.15,.16,.15);
  for(let k=0;k<5;k++){let a=k*Math.PI*2/5;let leaf=ell(g,0x51953e,Math.cos(a)*.092,.436,Math.sin(a)*.092,.053,.016,.14);leaf.rotation.y=-a+Math.PI/2;leaf.rotation.z=.16;}
  tube(g,0x6a863a,[[0,.42,0],[.008,.49,0],[.04,.53,.005]],.022);return g;
 }
 function supply(){const g=new T.Group();g.name='v5-supply-case';
  part(g,new T.BoxGeometry(.62,.37,.43),0xf1eee3,0,.22,0);part(g,new T.BoxGeometry(.64,.095,.45),0xcf3640,0,.445,0);
  for(const s of [-1,1])part(g,new T.BoxGeometry(.048,.37,.438),0x26455c,s*.22,.22,0);
  tube(g,0x233a50,[[-.11,.5,0],[-.11,.585,0],[.11,.585,0],[.11,.5,0]],.025);
  const emblem=ball();emblem.scale.setScalar(.37);emblem.position.set(0,.24,.212);g.add(emblem);return g;
 }
 function item(kind='berry'){let g;if(['normal','great','master'].includes(kind)){g=ball(kind);g.position.y=.24;const wrap=new T.Group();wrap.add(g);g=wrap;}else g=kind==='berry'?berry():supply();
  const bounds=new T.Box3().setFromObject(g),h=bounds.max.y-bounds.min.y;g.scale.multiplyScalar(.6/h);g.position.y-=bounds.min.y*.6/h;g.userData.kind=kind;return g;}
 global.PalletPropsV5={ball,item};
})(window);
