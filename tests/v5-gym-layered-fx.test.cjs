const test=require('node:test'),assert=require('node:assert/strict');
class V3{
 constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}
 clone(){return new V3(this.x,this.y,this.z)}
 copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this}
 add(v){this.x+=v.x;this.y+=v.y;this.z+=v.z;return this}
 sub(v){this.x-=v.x;this.y-=v.y;this.z-=v.z;return this}
 multiplyScalar(n){this.x*=n;this.y*=n;this.z*=n;return this}
 length(){return Math.hypot(this.x,this.y,this.z)}
 normalize(){return this.multiplyScalar(1/(this.length()||1))}
 lerp(v,t){this.x+=(v.x-this.x)*t;this.y+=(v.y-this.y)*t;this.z+=(v.z-this.z)*t;return this}
 set(x,y,z){this.x=x;this.y=y;this.z=z;return this}
}
class Obj{
 constructor(geometry=null,material=null){
  this.geometry=geometry;this.material=material;this.children=[];this.userData={};this.position=new V3();
  this.rotation=new V3();this.scale=new V3(1,1,1);
  this.scale.setScalar=x=>this.scale.set(x,x,x);
  this.quaternion={setFromUnitVectors(){}};
 }
 add(v){this.children.push(v)}
}
const fake={Group:class extends Obj{},Mesh:class extends Obj{},Line:class extends Obj{},Vector3:V3};
for(const name of ['RingGeometry','TorusGeometry','CylinderGeometry','SphereGeometry','OctahedronGeometry','IcosahedronGeometry','BoxGeometry','BufferGeometry']){
 fake[name]=class{constructor(...args){this.type=name;this.args=args}setFromPoints(){return this}};
}
for(const name of ['MeshBasicMaterial','MeshStandardMaterial','LineBasicMaterial']){
 fake[name]=class{constructor(options){Object.assign(this,options)}};
}
fake.DoubleSide=2;
const window={};
const src=require('fs').readFileSync(require('path').join(__dirname,'../寶可夢3D-V5/js/gym-presentation.js'),'utf8');
require('vm').runInNewContext(src,{THREE:fake,window,document:{},innerWidth:500,innerHeight:900,Math});
const Gym=window.V5GymPresentation;
test('four gym bosses have layered attack rings plus unique signature geometry',()=>{
 const counts={};
 for(const type of ['pikachu','mew','wigglytuff','blissey']){
  const r=type==='pikachu'?3.5:3,group=Gym.attack(type,r);
  assert.equal(group.userData.attackType,type);
  assert.equal(group.userData.layers.rings[0].geometry.args[1],r);
  assert.ok(group.userData.layers.rings.length>=3);
  assert.ok(group.children.length<=36);
  assert.equal(typeof group.userData.animate,'function');
  group.userData.animate(1);
  counts[type]={
   lines:group.children.filter(x=>x.geometry?.type==='BufferGeometry').length,
   torus:group.children.filter(x=>x.geometry?.type==='TorusGeometry').length,
   stems:group.children.filter(x=>x.userData?.noteStem).length,
   spheres:group.children.filter(x=>x.geometry?.type==='SphereGeometry').length
  };
 }
 assert.ok(counts.pikachu.lines>=7);
 assert.ok(counts.mew.torus>=3);
 assert.ok(counts.wigglytuff.stems>=6);
 assert.ok(counts.blissey.spheres>=6);
});
test('animation remains bounded over long sessions instead of accumulating vertical drift',()=>{
 const attack=Gym.attack('blissey',3);
 const shell=attack.userData.layers.shells.find(x=>x.geometry.type==='SphereGeometry');
 attack.userData.animate(1);
 const first=shell.position.y;
 attack.userData.animate(1000);
 assert.ok(Math.abs(shell.position.y-first)<.3);
});
test('gym boss cast projectile has 7 bounded elements and finishes in <= .7s',()=>{
 for(const type of ['pikachu','mew','wigglytuff','blissey']){
  const pool=[],scene={added:[],removed:[],add(v){this.added.push(v)},remove(v){this.removed.push(v)}};
  Gym.cast(scene,pool,type,new V3(0,3,0),new V3(5,.8,2));
  assert.equal(pool.length,1);assert.equal(scene.added.length,1);
  assert.equal(pool[0].mesh.children.length,7);
  assert.equal(pool[0].update(.35),true);
  assert.equal(pool[0].update(.40),false);
  assert.equal(scene.removed.length,1);
 }
});
