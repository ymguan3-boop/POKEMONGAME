/* Generation I-IV legends and gym companions, hand-built from crawled Pokedex artwork. */
(()=>{
 const T=THREE;
 const R={register(id,fn){PalletModelsV2.register(id,b=>{fn(b);b.root.updateMatrixWorld(true);const floor=new T.Box3().setFromObject(b.root).min.y;if(Number.isFinite(floor))for(const part of b.root.children)part.position.y-=floor;});}};
 const C={white:0xf5f2e8,ink:0x202735,claw:0xf4eee0};
 function low(b,c,p,s,rot=[0,0,0],name='detail'){return b.add(new T.SphereGeometry(1,16,10),c,p,s,rot,name);}
 function gem(b,c,p,s,rot=[0,0,0],name='crystal'){return b.add(new T.OctahedronGeometry(1),c,p,s,rot,name);}
 function plate(b,c,pts,z,name='armor'){const m=b.patch(c,pts,.055,name);m.position.z=z;return m;}
 function claws(b,x,y,z,n=3,span=.22,size=.16){for(let i=0;i<n;i++)b.cone(C.claw,[x+(i-(n-1)/2)*span,y,z],size*.4,size,[Math.PI/2,0,0],'separate-claw');}
 function eyes(b,x,y,z,s=.09,iris=0x81364c){for(const k of [-1,1])b.eye([k*x,y,z],[s,s*1.15,s*.42],iris,[0,k*.13,0]);}
 function blackEyes(b,x,y,z,s=.08){for(const k of [-1,1]){low(b,C.ink,[k*x,y,z],[s,s*1.3,.035]);low(b,0xffffff,[k*x-.022,y+.035,z+.033],[.024,.028,.011]);}}
 function ear(b,c,x,y,z,s,rot=0,inner){b.ell(c,[x,y,z],[s*.25,s,s*.15],[0,0,rot],'ear');if(inner)b.ell(inner,[x,y,z+s*.13],[s*.135,s*.80,s*.045],[0,0,rot],'inner-ear');}
 function feather(b,c,a,v,w=.14){const mid=a.map((n,i)=>(n+v[i])/2),d=new T.Vector3(...v).sub(new T.Vector3(...a)),m=b.leaf(c,mid,[w,d.length(),.8],[0,0,0],'separate-flight-feather');m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return m;}
 function toeFeet(b,col,x,y,z){for(const s of [-1,1]){b.ell(col,[s*x,y+.48,z-.045],[.078,.245,.085],[0,0,0],'bird-thigh');b.link(col,[s*x,y+.58,z-.045],[s*x,y+.08,z],.062,.045,'bird-shin');for(let j=-1;j<=1;j++){const zz=z+.14+(j===0?.10:0);b.tube(col,[[s*x,y+.09,z],[s*x+j*.10,y+.055,zz]],.034,'bird-toe');b.cone(0x514e52,[s*x+j*.10,y+.05,zz+.05],.027,.1,[Math.PI/2,0,0],'talon');}}}
 R.register('articuno',b=>{
 const blue=0x5eb5df,dark=0x257698;
 b.ell(blue,[0,1.01,0],[.39,.63,.33]);b.ell(0xc8e8f0,[0,1.10,.265],[.30,.46,.11],[0,0,0],'pale-breast');
 b.tube(blue,[[0,1.26,0],[0,1.63,.03],[0,1.91,.13]],.20,'long-neck');b.ell(blue,[0,1.99,.15],[.245,.27,.24]);
 eyes(b,.135,2.015,.345,.062,0x8c3746);b.cone(0xa1a7ad,[0,1.90,.435],.076,.26,[Math.PI/2,0,0],'pointed-beak');
 for(let i=-1;i<=1;i++)gem(b,dark,[i*.14,2.29+(.12-Math.abs(i)*.1),.02],[.095,.39,.065],[0,0,-i*.45],'three-prong-crown');
 for(const s of [-1,1]){b.tube(blue,[[s*.25,1.43,0],[s*.80,1.71,-.015],[s*1.13,2.04,-.05]],.115,'wing-bone',.045);for(let j=0;j<9;j++){const t=j/8;feather(b,j%2?0x78c8e9:blue,[s*(.33+.8*t),1.39+.54*t,-.03],[s*(.62+1.05*t),1.01+1.45*t,-.11],.21);}}
 for(let i=-1;i<=1;i++)b.tube(i===0?dark:blue,[[i*.08,.76,-.23],[.50+i*.11,.65,-.81],[.78+i*.12,.88,-1.52],[.34+i*.11,.49,-1.82],[-.50+i*.07,.18,-1.41]],.10,'long-streamer-tail',.018);
 toeFeet(b,0x8f9094,.17,.015,.10);
 });
 R.register('zapdos',b=>{
 const yellow=0xf3cf35;b.ell(yellow,[0,1.12,0],[.34,.52,.27]);b.ell(yellow,[0,1.69,.08],[.24,.28,.23]);eyes(b,.125,1.71,.29,.055);b.cone(0xae8b44,[0,1.59,.53],.065,.55,[Math.PI/2,0,0],'needle-beak');
 for(const s of [-1,1]){const outline=[[s*.22,1.49],[s*.45,1.81],[s*1.55,2.08],[s*1.18,1.68],[s*1.76,1.62],[s*1.29,1.28],[s*1.70,1.11],[s*.85,.87],[s*.65,1.09],[s*.27,1.06]];plate(b,C.ink,outline,-.16,'black-zigzag-wing');plate(b,yellow,outline.map(([x,y])=>[x*.90,y+.05]),-.06,'gold-zigzag-wing');
 for(let i=0;i<3;i++)gem(b,yellow,[s*(.14+i*.11),1.89+i*.05,-.015],[.1,.33-i*.025,.07],[0,0,-s*(.25+i*.42)],'spiky-crown');}
 for(const side of [-1,1])for(let j=0;j<3;j++)b.tube(0xd7ad23,[[side*(.39+j*.15),1.41-j*.07,-.018],[side*(.80+j*.22),1.58-j*.15,-.018]],.014,'wing-feather-ridge');
 for(let i=-2;i<=2;i++)gem(b,i%2?C.ink:yellow,[i*.13,.64,-.18],[.12,.50,.08],[.22,0,i*.28],'spiky-tail');toeFeet(b,0x947442,.20,.015,.08);
 });
 R.register('moltres',b=>{
 const gold=0xe5ad36;b.ell(gold,[0,1.02,0],[.32,.44,.39],[.32,0,0]);b.tube(gold,[[0,1.12,.17],[0,1.46,.33],[0,1.75,.37]],.145,'swan-neck');b.ell(gold,[0,1.85,.4],[.21,.24,.21]);eyes(b,.113,1.88,.575,.055);b.cone(0xc79964,[0,1.76,.72],.065,.35,[Math.PI/2,0,0],'long-beak');b.flame([0,2.07,.29],.55);
 for(const s of [-1,1]){b.tube(gold,[[s*.23,1.13,0],[s*.82,1.38,-.04],[s*1.45,1.68,-.09]],.085,'wing-leading-edge',.025);for(let j=0;j<8;j++){const t=j/7;feather(b,gold,[s*(.31+.95*t),1.13+.44*t,-.04],[s*(.56+1.04*t),.88+.55*t,-.07],.18);b.flame([s*(.43+1.1*t),1.22+.5*t,-.12],.36+.13*t);}}
 b.tube(gold,[[0,.90,-.25],[.1,.83,-.66],[.28,1.0,-1.06]],.13,'tail-base',.05);for(let i=0;i<5;i++)b.flame([.10+i*.045,.91+i*.055,-.68-i*.13],.50);toeFeet(b,0x9f8168,.19,.015,.19);
 });
 // Three beasts share an anatomical limb constructor; their torsos, heads and emblems are species-specific.
 function beastLegs(b,col,{x=.30,front=.47,rear=-.48,y=.72,heavy=false}={}){for(const s of [-1,1])for(const z of [front,rear]){b.ell(col,[s*x,y,z],[heavy?.20:.13,.36,.15]);b.link(col,[s*x,y-.16,z],[s*(x+.035),.17,z+.08],heavy?.135:.09,heavy?.12:.065);b.ell(col,[s*(x+.035),.115,z+.18],[heavy?.20:.14,.105,.23]);claws(b,s*(x+.035),.095,z+.365,3,heavy?.105:.075,.14);}}
 function beastHead(b,col,y=1.32,z=.66){b.ell(col,[0,y,z],[.32,.34,.30]);b.ell(C.white,[0,y-.14,z+.255],[.255,.14,.15]);eyes(b,.178,y+.06,z+.25,.065,0xca5439);b.ell(C.ink,[0,y-.067,z+.375],[.115,.065,.055]);b.mouth([[-.17,y-.20,z+.34],[0,y-.24,z+.39],[.17,y-.20,z+.34]],.015);}
 R.register('raikou',b=>{
 const gold=0xe3b928;b.ell(gold,[0,.94,0],[.38,.38,.73]);beastLegs(b,gold,{x:.29,y:.70});beastHead(b,gold,1.32,.64);
 // Saber fangs, dark face mask and gray forehead plate.
 for(const s of [-1,1]){b.cone(C.white,[s*.17,1.02,1.01],.072,.43,[Math.PI,0,0],'saber-fang');ear(b,0x74716f,s*.23,1.63,.59,.20,-s*.35,0xe8d8c6);plate(b,0x443f3f,[[s*.04,1.48],[s*.16,1.67],[s*.32,1.58],[s*.31,1.39],[s*.14,1.37]],.875,'dark-face-mask');
 for(let i=0;i<3;i++){const z=.30-i*.38;const m=plate(b,C.ink,[[s*.03,.91],[s*.18,1.16],[s*.33,.94],[s*.23,.69],[s*.10,.80]],0,'tiger-stripe');m.rotation.y=s*Math.PI/2;m.position.set(s*.355,0,z);}
 b.tube(C.ink,[[s*.30,.53,.55],[s*.35,.42,.62],[s*.29,.33,.69]],.045,'leg-stripe');}
 plate(b,0x76b7c9,[[-.34,1.49],[-.12,1.42],[0,1.55],[.12,1.42],[.34,1.49],[.23,1.28],[0,1.37],[-.23,1.28]],.967,'blue-muzzle-guard');eyes(b,.17,1.475,1.012,.061,0xda552e);
 for(let i=0;i<5;i++)b.ell(0x9c779a,[Math.sin(i)*.19,1.36,-.13-i*.12],[.32,.19,.23],[0,0,0],'purple-thunder-cloud-mane');
 b.tube(0x9bb5c0,[[0,1.03,-.65],[.50,1.27,-.83],[.32,1.64,-.96],[.69,1.39,-1.04],[.61,1.91,-1.13]],.036,'lightning-tail');gem(b,0x9bb5c0,[.61,1.96,-1.13],[.08,.21,.035]);
 });
 R.register('entei',b=>{
 const brown=0x94552e;b.ell(brown,[0,.93,-.04],[.49,.47,.74]);beastLegs(b,brown,{x:.38,y:.75,heavy:true});b.ell(0x79422c,[0,1.15,.47],[.49,.59,.42]);beastHead(b,0x8b442b,1.57,.64);
 for(const s of [-1,1]){for(let i=0;i<5;i++)gem(b,i%2?0x73462d:0xb5793b,[s*(.30+i*.012),1.48-i*.15,.79],[.19,.24,.08],[0,0,s*.4],'shaggy-mane');for(const z of [.52,-.49])b.ell(0x443e3b,[s*.4,.32,z+.10],[.19,.095,.20]);
 plate(b,0xb73b2e,[[s*.04,1.71],[s*.20,1.91],[s*.47,1.69],[s*.28,1.59],[s*.35,1.33],[s*.15,1.41]],.91,'red-face-mask');gem(b,0xe9c649,[s*.23,1.94,.71],[.13,.44,.07],[0,0,-s*.9],'gold-crown');
 for(let i=0;i<3;i++)gem(b,0xaaaeb0,[s*(.39+.10*i),1.19+i*.1,-.29-i*.15],[.13,.46,.1],[.7,0,-s*.85],'back-steel-spike');}
 plate(b,0xdcd9c6,[[-.23,1.64],[-.08,1.67],[0,1.58],[.08,1.67],[.23,1.64],[.19,1.21],[.08,1.33],[0,1.16],[-.09,1.35],[-.19,1.21]],1.025,'ivory-muzzle-mask');eyes(b,.19,1.717,1.008,.062,0xcf5539);
 for(let i=0;i<7;i++)low(b,0xd4d5ce,[Math.sin(i*1.8)*.12,1.05+i*.052,-.65-i*.13],[.18,.16,.19],[0,0,0],'smoke-tail');
 });
 R.register('suicune',b=>{
 const blue=0x70becb;b.ell(blue,[0,.95,-.06],[.30,.33,.72]);beastLegs(b,blue,{x:.235,y:.75,front:.40,rear:-.49});b.tube(blue,[[0,1.02,.4],[0,1.35,.58],[0,1.57,.66]],.19,'upright-neck');beastHead(b,blue,1.57,.73);
 for(const s of [-1,1]){ear(b,C.white,s*.22,1.70,.65,.18,-s*.8,0x82c4cf);gem(b,C.white,[s*.293,1.03,-.03],[.035,.15,.13],[0,0,0],'white-diamond-mark');gem(b,C.white,[s*.283,1.0,-.39],[.034,.12,.105]);
 b.tube(0xf0f3e8,[[s*.10,1.5,.86],[s*.39,1.13,.58],[s*.54,.50,-.18],[s*.66,.79,-.73],[s*.37,1.03,-1.02],[s*.25,.55,-.47],[s*.50,.22,.12]],.043,'flowing-white-ribbon',.012);}
 for(let i=0;i<5;i++)b.tube(i%2?0x916995:0xa37ba8,[[0,1.62,.47],[.25*Math.sin(i),1.79-i*.05,-.07],[.20*Math.cos(i),1.64,-.60],[.28,1.70-i*.09,-1.0]],.16,'violet-wind-mane',.05);
 const outer=plate(b,0x3d9fac,[[-.26,1.88],[0,2.39],[.26,1.88],[0,1.72]],.73,'diamond-crown');plate(b,0x9ad9dd,[[-.14,1.92],[0,2.18],[.14,1.92],[0,1.81]],.80,'diamond-crown-inset');
 });
 R.register('kyogre',b=>{
 const blue=0x196ab5;b.ell(blue,[0,.53,0],[.55,.31,1.04]);b.ell(C.white,[0,.365,.24],[.48,.12,.82]);b.ell(blue,[0,.57,.69],[.50,.28,.57]);b.mouth([[-.43,.43,.99],[0,.375,1.225],[.43,.43,.99]],.018,0x993c46);
 for(const s of [-1,1]){b.eye([s*.43,.63,.90],[.076,.06,.029],0xdb6736,[0,s*.6,0]);low(b,C.white,[s*.26,.795,.75],[.145,.032,.25],[0,0,s*.2],'white-eye-mark');
 const fin=plate(b,blue,[[s*.35,.62],[s*.8,.76],[s*1.35,.74],[s*1.62,.54],[s*1.51,.36],[s*1.30,.30],[s*1.04,.34],[s*.63,.36]],.02,'broad-pectoral-fin');fin.rotation.x=-Math.PI/2;fin.position.set(0,.48,.16);
 for(let i=0;i<4;i++)b.ell(C.white,[s*(1.13+i*.12),.49,-.19-i*.055],[.12,.048,.10],[0,-s*.55,0],'fin-white-finger');
 b.tube(0xc83844,[[s*.42,.53,-.28],[s*.71,.53,-.40],[s*1.11,.53,-.46],[s*1.35,.53,-.39],[s*1.12,.53,-.23],[s*.75,.53,-.26],[s*.71,.53,-.40]],.018,'red-fin-circuit');b.tube(0xc83844,[[s*.34,.78,.70],[s*.37,.80,.2],[s*.25,.77,-.39],[s*.16,.65,-.74]],.018,'red-body-circuit');
 for(let i=0;i<3;i++){b.tube(blue,[[s*.17,.51,-.75],[s*(.38+i*.13),.48,-1.17-i*.1],[s*(.58+i*.17),.50,-1.55]],.08,'tail-streamer',.016);}}
 });
 R.register('groudon',b=>{
 const red=0xc54838,dark=0x4d4542;b.ell(dark,[0,.99,-.03],[.50,.72,.44]);b.ell(red,[0,1.51,.03],[.39,.37,.36]);b.ell(red,[0,1.51,.32],[.32,.24,.39]);b.ell(dark,[0,1.33,.48],[.27,.06,.25]);eyes(b,.215,1.59,.615,.057,0xe3b738);
 for(let i=0;i<5;i++)b.ell(0xb2a89b,[0,.57+i*.19,.386],[.37-i*.012,.082,.076],[0,0,0],'segmented-belly-plate');
 for(const s of [-1,1]){b.ell(red,[s*.48,.56,-.035],[.30,.40,.29]);b.ell(red,[s*.48,.14,.18],[.30,.13,.35]);claws(b,s*.48,.105,.49,3,.17,.32);b.link(red,[s*.4,1.29,.03],[s*.65,.96,.36],.20,.17);b.ell(red,[s*.69,.91,.44],[.20,.22,.22]);claws(b,s*.69,.82,.64,3,.11,.25);
 for(let i=0;i<4;i++)b.cone(C.white,[s*(.39+i*.015),1.25-i*.22,-.34],.115,.34,[0,0,-s*1.05],'side-armor-spike');for(let i=0;i<3;i++)b.box(dark,[s*.29,1.59+i*.11,.18-i*.10],[.024,.023,.57],[.2,0,0],'head-armor-seam');
 b.tube(dark,[[s*.38,.86,.19],[s*.55,.72,.19],[s*.59,.40,.2]],.025,'leg-seam');}
 for(let i=0;i<5;i++){const z=-.34-i*.21;b.ell(red,[0,.88-i*.13,z],[.34-i*.041,.21,.24],[0,0,0],'armored-tail-segment');b.box(dark,[0,1.01-i*.14,z],[.52-i*.065,.025,.03]);for(const s of [-1,1])b.cone(C.white,[s*(.31-i*.042),.87-i*.13,z],.08,.27,[0,0,-s*Math.PI/2]);}
 for(let i=0;i<4;i++)gem(b,red,[0,1.55-i*.20,-.40-i*.07],[.20,.20,.06],[.4,0,0],'back-crest');
 });
 R.register('rayquaza',b=>{
 const green=0x359c75,red=0xbe414c,yellow=0xe5c850;
 const pts=[[.55,.18,-.55],[.88,.50,-.15],[.65,.83,.48],[0,.96,.69],[-.62,1.13,.43],[-.75,1.44,-.1],[-.37,1.83,-.30],[.02,2.10,-.15],[0,2.45,.11]];
 b.tube(green,pts,.20,'long-coiled-serpentine-body',.16);b.ell(green,[0,2.52,.29],[.27,.19,.42]);b.ell(0x752d40,[0,2.395,.55],[.20,.06,.20]);b.ell(green,[0,2.34,.49],[.215,.04,.26]);eyes(b,.192,2.55,.53,.055,0xdfbd45);
 for(const s of [-1,1]){b.tube(yellow,[[s*.15,2.68,.48],[s*.18,2.64,.15],[s*.13,2.63,-.04]],.022,'gold-head-line');gem(b,green,[s*.34,2.72,-.03],[.095,.48,.09],[0,0,-s*.8],'long-head-horn');b.cone(C.white,[s*.13,2.37,.63],.035,.12,[Math.PI,0,0],'fang');
 b.tube(green,[[s*.16,2.14,.02],[s*.46,1.97,.15],[s*.47,1.90,.38]],.09,'small-arm',.065);for(let i=0;i<3;i++)b.cone(C.white,[s*.47+(i-1)*.06,1.86,.49],.03,.17,[Math.PI*.75,0,0],'finger-claw');}
 for(let i=1;i<pts.length-2;i++){const p=pts[i],g=new T.TorusGeometry(.217,.018,6,24),m=b.add(g,yellow,p,[1,1,1],[0,0,0],'gold-body-ring');const tangent=new T.Vector3(...pts[i+1]).sub(new T.Vector3(...pts[i-1])).normalize();m.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),tangent);}
 for(const i of [1,3,5]){const p=pts[i];for(const s of [-1,1]){const f=plate(b,red,[[s*.11,-.13],[s*.47,-.29],[s*.44,.09],[s*.12,.24]],0,'red-fin-border');f.position.set(p[0],p[1],p[2]-.10);const inner=plate(b,green,[[s*.14,-.09],[s*.40,-.20],[s*.38,.055],[s*.14,.18]],0,'green-fin');inner.position.set(p[0],p[1],p[2]-.063);}}
 b.tube(green,[[.55,.18,-.55],[.35,.14,-.90],[.18,.11,-1.15]],.14,'tapered-tail',.005);
 });
 R.register('dialga',b=>{
 const blue=0x2f597c,metal=0xaabdc7,light=0x76cbdc;b.ell(blue,[0,.94,-.15],[.40,.43,.78]);
 for(const s of [-1,1])for(const z of [.35,-.63]){b.ell(blue,[s*.30,.68,z],[.17,.29,.19]);b.link(blue,[s*.31,.65,z],[s*.38,.17,z+.09],.125,.08);gem(b,metal,[s*.38,.27,z+.11],[.14,.23,.14]);b.ell(blue,[s*.38,.09,z+.19],[.17,.08,.24]);claws(b,s*.38,.085,z+.36,3,.095,.23);}
 b.tube(blue,[[0,1.03,.35],[0,1.55,.37],[0,2.12,.43],[0,2.38,.50]],.205,'tall-dragon-neck',.14);b.ell(blue,[0,2.43,.64],[.225,.20,.32]);b.ell(blue,[0,2.36,.91],[.15,.10,.25]);eyes(b,.144,2.48,.86,.055,0xcc5f50);
 plate(b,metal,[[-.13,2.42],[-.31,2.73],[-.20,2.75],[0,2.53],[.20,2.75],[.31,2.73],[.13,2.42],[.1,2.16],[-.1,2.16]],.65,'steel-head-crown');
 for(let i=0;i<4;i++)plate(b,i%2?metal:light,[[-.17,1.26+i*.22],[0,1.18+i*.22],[.17,1.26+i*.22],[.13,1.37+i*.22],[0,1.31+i*.22],[-.13,1.37+i*.22]],.57,'neck-steel-rib');
 for(const s of [-1,1]){gem(b,metal,[s*.33,1.19,.38],[.29,.28,.14],[0,0,s*.30],'chest-armor');b.tube(light,[[s*.26,1.12,.48],[s*.24,.89,.54],[s*.35,.67,.47]],.031,'cyan-body-line');for(let i=0;i<5;i++)gem(b,metal,[s*(.16+i*.12),1.29+i*.075,-.40-i*.09],[.105,.43+i*.045,.045],[.43,0,-s*(.25+i*.17)],'back-fan-blade');}
 gem(b,light,[0,1.15,.575],[.13,.17,.06],[0,0,0],'diamond-chest');b.tube(blue,[[0,.92,-.78],[0,.69,-1.2],[.19,.62,-1.61],[.35,.75,-1.89]],.20,'long-tail',.018);b.tube(light,[[0,1.08,-.72],[0,.85,-1.15],[.19,.71,-1.60],[.35,.77,-1.86]],.024,'tail-line');
 });
 R.register('palkia',b=>{
 const pale=0xe9dce0,purple=0x855778;b.ell(pale,[0,1.02,-.02],[.38,.62,.31]);b.tube(pale,[[0,1.42,.0],[0,1.77,.04],[0,2.08,.25]],.20,'long-neck');b.ell(pale,[0,2.15,.37],[.225,.19,.34]);b.ell(pale,[0,2.08,.62],[.15,.105,.23]);eyes(b,.149,2.195,.58,.057,0xc54649);
 for(const s of [-1,1]){b.ell(pale,[s*.31,.45,-.02],[.28,.36,.27]);b.link(pale,[s*.35,.45,.02],[s*.40,.14,.18],.17,.13);b.ell(pale,[s*.4,.10,.28],[.20,.09,.28]);claws(b,s*.4,.08,.51,3,.12,.20);b.ell(pale,[s*.43,1.41,0],[.27,.28,.23]);b.link(pale,[s*.44,1.28,.03],[s*.65,1.01,.29],.13,.11);b.ell(purple,[s*.68,.94,.38],[.14,.16,.16]);claws(b,s*.68,.87,.51,3,.074,.15);
 // Pearl shoulders sit forward in a magenta rim; wings are rigid segmented fins.
 b.ell(purple,[s*.44,1.46,.193],[.205,.21,.065]);b.ell(0xf8eeee,[s*.44,1.46,.25],[.143,.15,.071]);low(b,0xffffff,[s*.41,1.51,.311],[.045,.049,.017]);
 plate(b,purple,[[s*.30,1.59],[s*.92,1.67],[s*1.30,1.46],[s*.92,1.13],[s*.39,1.22]],-.21,'wing-purple-edge');for(let i=0;i<3;i++)plate(b,pale,[[s*.38,1.53-i*.12],[s*(1.19-i*.13),1.46-i*.13],[s*(.94-i*.12),1.26-i*.11],[s*.39,1.29-i*.11]],-.14,'separate-wing-plate');
 b.tube(purple,[[s*.19,2.24,.44],[s*.24,1.99,.26],[s*.17,1.76,.18]],.03,'head-purple-line');b.tube(purple,[[s*.26,1.11,.24],[s*.31,.91,.24],[s*.24,.70,.26]],.038,'torso-purple-band');}
 for(let i=0;i<4;i++)b.box(purple,[0,1.24-i*.13,.303],[.50-i*.03,.024,.04]);b.tube(pale,[[0,.72,-.25],[.20,.41,-.62],[.45,.47,-1.02],[.58,.85,-1.34]],.19,'curving-dragon-tail',.013);b.tube(purple,[[0,.81,-.35],[.23,.53,-.66],[.48,.56,-1.0],[.58,.86,-1.31]],.028,'tail-magenta-stripe');
 });
 R.register('giratina',b=>{
 const gray=0x97958c,gold=0xd8b948,black=0x26272b,red=0xb9413b;b.ell(gray,[0,1.01,-.06],[.45,.64,.62]);b.tube(gray,[[0,1.23,.2],[0,1.58,.27],[0,1.92,.35]],.23,'upright-neck');b.ell(black,[0,1.99,.40],[.25,.27,.22]);
 for(let i=0;i<7;i++)b.ell(i%2?black:red,[0,.91+i*.155,.41],[.25-i*.01,.065,.075],[0,0,0],'red-black-neck-stripe');
 for(const s of [-1,1]){for(let i=0;i<3;i++){const z=.44-i*.47;b.link(gray,[s*.35,.76,z],[s*.54,.28,z+.08],.17,.12);b.ell(gray,[s*.57,.16,z+.19],[.21,.135,.25]);claws(b,s*.57,.09,z+.37,3,.10,.20);gem(b,gold,[s*.57,.16,z+.40],[.08,.16,.055]);}
 for(let i=0;i<3;i++)gem(b,gold,[s*.29,1.47+i*.19,.44],[.24,.08,.13],[0,0,-s*.32],'gold-neck-rib');gem(b,gold,[s*.29,2.16,.4],[.11,.43,.11],[0,0,-s*.67],'gold-crown-horn');
 plate(b,black,[[s*.34,1.29],[s*.62,1.76],[s*1.01,2.11],[s*1.32,2.01],[s*1.38,1.81],[s*1.73,1.55],[s*1.44,1.56],[s*1.45,1.27],[s*1.21,1.46],[s*1.12,1.06],[s*.93,1.38],[s*.70,.94],[s*.56,1.30]],-.23,'ragged-black-wing');for(let i=0;i<3;i++)gem(b,red,[s*(.78+i*.23),1.24+i*.08,-.14],[.085,.21,.045],[0,0,s*.55],'red-wing-claw');}
 plate(b,gold,[[-.19,2.18],[0,2.07],[.19,2.18],[.15,1.94],[0,1.82],[-.15,1.94]],.61,'gold-mask');eyes(b,.103,2.02,.659,.050,0xc64445);b.tube(gray,[[0,.78,-.56],[0,.42,-.93],[.23,.25,-1.19]],.20,'short-tail',.03);
 });
 R.register('pikachu',b=>{
 const yellow=0xf1ce45;b.ell(yellow,[0,.68,0],[.40,.51,.29]);b.ell(yellow,[0,1.22,.04],[.43,.38,.32]);
 for(const s of [-1,1]){ear(b,yellow,s*.29,1.75,.0,.49,-s*.32);b.ell(C.ink,[s*.40,2.07,-.004],[.080,.17,.06],[0,0,-s*.32],'black-ear-tip');b.ell(yellow,[s*.41,.76,.095],[.12,.27,.12],[0,0,-s*.65],'arm');b.ell(yellow,[s*.24,.105,.13],[.13,.10,.24]);for(let i=0;i<3;i++)b.mouth([[s*.24+(i-1)*.045,.12,.33],[s*.24+(i-1)*.045,.08,.35]],.007,0x886835);low(b,0xdc5141,[s*.317,1.12,.29],[.092,.09,.025],[0,s*.4,0],'red-cheek');}
 blackEyes(b,.185,1.30,.326,.072);low(b,0x423837,[0,1.19,.362],[.036,.023,.018]);b.mouth([[-.115,1.08,.339],[-.055,1.055,.353],[0,1.085,.36],[.055,1.055,.353],[.115,1.08,.339]],.013);
 for(const y of [.59,.79])b.ell(0x9f6a36,[0,y,-.278],[.29,.064,.024],[0,0,0],'brown-back-stripe');
 plate(b,0x926338,[[.19,.41],[.47,.48],[.43,.72],[.29,.62]],-.27,'brown-tail-root');plate(b,yellow,[[.40,.52],[.62,.66],[.53,.83],[.90,1.08],[.72,1.30],[1.11,1.62],[1.24,1.25],[.87,1.04],[1.02,.89],[.67,.68],[.70,.48],[.47,.34]],-.31,'lightning-bolt-tail');
 });
 R.register('mew',b=>{
 const pink=0xe8a9bf;b.ell(pink,[0,.79,0],[.245,.40,.19]);b.ell(pink,[0,1.29,.05],[.345,.30,.27]);
 for(const s of [-1,1]){const m=plate(b,pink,[[s*.19,1.48],[s*.33,1.72],[s*.37,1.39]],.02,'triangular-cat-ear');plate(b,0xcb82a0,[[s*.24,1.49],[s*.32,1.63],[s*.33,1.44]],.084,'inner-cat-ear');b.ell(pink,[s*.19,.37,.07],[.135,.29,.13],[0,0,s*.13],'long-hind-leg');b.ell(pink,[s*.21,.145,.24],[.125,.14,.32],[.22,0,0],'large-cat-foot');for(let i=0;i<3;i++)b.mouth([[s*.21+(i-1)*.045,.14,.527],[s*.21+(i-1)*.045,.08,.50]],.006,0xb57593);
 b.tube(pink,[[s*.20,1.0,.03],[s*.33,.95,.14],[s*.39,.94,.22]],.064,'small-arm',.046);for(let i=0;i<3;i++)low(b,pink,[s*.39+(i-1)*.031,.945,.25],[.025,.032,.04]);}
 eyes(b,.165,1.31,.292,.093,0x428da8);b.ell(pink,[0,1.18,.292],[.125,.06,.04]);b.mouth([[-.065,1.13,.311],[0,1.105,.325],[.065,1.13,.311]],.008,0x92566e);
 b.tube(pink,[[0,.62,-.14],[.46,.60,-.37],[.76,.93,-.37],[.63,1.33,-.52],[.12,1.66,-.65],[-.53,1.55,-.39],[-.70,1.11,-.18],[-.50,.90,.08]],.035,'long-thin-cat-tail',.042);b.ell(pink,[-.50,.9,.08],[.055,.068,.054],[0,0,0],'tail-tip');
 });
 R.register('wigglytuff',b=>{
 const pink=0xe6b1bc;b.ell(pink,[0,.77,0],[.53,.68,.35]);b.ell(0xf6edf0,[0,.62,.305],[.39,.45,.085],[0,0,0],'white-belly');
 for(const s of [-1,1]){ear(b,pink,s*.32,1.75,.005,.55,-s*.4,0x303337);b.ell(0xf8e9e8,[s*.455,1.925,.03],[.014,.27,.015],[0,0,-s*.4],'ear-rim');b.ell(pink,[s*.54,.77,.02],[.16,.095,.14],[0,0,s*.45],'small-arm');b.ell(pink,[s*.28,.105,.12],[.18,.1,.245],[0,s*.2,0]);}
 eyes(b,.235,1.22,.291,.143,0x2eabb9);b.tube(pink,[[.10,1.52,.26],[-.10,1.62,.26],[-.19,1.53,.32],[-.10,1.44,.36],[.04,1.46,.35],[.08,1.56,.32]],.105,'forehead-curl',.054);b.mouth([[-.09,1.00,.361],[0,.97,.381],[.09,1.00,.361]],.015);b.ell(0x924d63,[0,.982,.371],[.065,.028,.015]);
 });
 R.register('blissey',b=>{
 const pink=0xe4a3b7,bottom=0xb8d0c8;b.ell(pink,[0,.86,0],[.68,.70,.42]);b.ell(bottom,[0,.36,0],[.58,.28,.38],[0,0,0],'pale-lower-body');
 for(const s of [-1,1]){b.ell(pink,[s*.25,.105,.035],[.105,.19,.15]);b.ell(pink,[s*.69,.84,.09],[.19,.095,.13],[0,0,-s*.15],'short-arm');b.ell(pink,[s*.43,1.46,.0],[.24,.22,.20]);b.tube(pink,[[s*.42,1.38,.19],[s*.52,1.38,.25],[s*.55,1.27,.29],[s*.44,1.20,.34],[s*.34,1.25,.34],[s*.39,1.31,.33]],.07,'curly-side-lock');
 for(let i=0;i<5;i++){const y=.50+i*.14;feather(b,0xe3ebd6,[s*.53,y,0],[s*(.79-(i%2)*.04),y+.12,-.01],.18);}}
 blackEyes(b,.105,1.29,.395,.034);b.mouth([[-.034,1.16,.427],[0,1.10,.437],[.034,1.16,.427]],.009);b.ell(0xc7809d,[0,.60,.39],[.245,.18,.08],[0,0,0],'egg-pouch');b.ell(0xf2edce,[0,.68,.443],[.18,.235,.12],[0,0,0],'pouch-egg');b.tube(pink,[[-.25,.59,.425],[-.19,.45,.443],[0,.41,.465],[.19,.45,.443],[.25,.59,.425]],.06,'pouch-rim');
 });
})();
