const test=require('node:test'),assert=require('node:assert/strict');
const V=require('../寶可夢3D-V5/js/battle-visual-policy.js');
function material(){
 return {
  isMeshBasicMaterial:true,emissiveIntensity:1.8,metalness:.9,roughness:.1,
  color:{brightness:1,multiplyScalar(n){this.brightness*=n}},
  clone(){return {isMeshBasicMaterial:this.isMeshBasicMaterial,emissiveIntensity:this.emissiveIntensity,metalness:this.metalness,roughness:this.roughness,
   color:{brightness:this.color.brightness,multiplyScalar(n){this.brightness*=n}},dispose(){this.disposed=true}}}
 };
}
test('NPC scales to exactly 1.10x; yaw faces opponent with +15 degree oblique offset',()=>{
 assert.equal(V.NPC_SCALE,1.10);assert.equal(V.OBLIQUE_DEGREES,15);
 const yaw=V.facePlayer(-2.25,2,2.25,-2);
 const direct=Math.atan2(-4.5,4);
 assert.ok(Math.abs(yaw-direct-Math.PI/12)<1e-10);
 assert.notEqual(yaw,0);
});
test('battle-only cloned materials preserve original source geometry/textures and original colors',()=>{
 const original=material(),textured={isMesh:true,material:original},repeat={isMesh:true,material:[original]};
 const visual={traverse(callback){callback(textured);callback(repeat)}};
 const materials=V.cloneForBattle(visual);
 assert.equal(materials.length,1);
 assert.notEqual(textured.material,original);
 assert.equal(repeat.material[0],textured.material);
 assert.equal(original.color.brightness,1);
 assert.equal(textured.material.color.brightness,.8);
 assert.equal(textured.material.emissiveIntensity,.45);
 assert.equal(textured.material.metalness,.26);
 assert.equal(textured.material.roughness,.70);
 materials.forEach(m=>m.dispose());
 assert.equal(textured.material.disposed,true);
 assert.equal(original.disposed,undefined);
});
test('shader correction preserves multi-material arrays and ignores unsupported nodes',()=>{
 const standard=material();standard.isMeshBasicMaterial=false;
 const node={isMesh:true,material:[standard,standard]},notMesh={isMesh:false,material:standard};
 const materials=V.cloneForBattle({traverse(fn){fn(node);fn(notMesh)}});
 assert.equal(materials.length,1);assert.equal(node.material[0],node.material[1]);
 assert.equal(node.material[0].color.brightness,.91);
 assert.equal(standard.color.brightness,1);
 assert.equal(notMesh.material,standard);
 assert.deepEqual(V.cloneForBattle(null),[]);
});
