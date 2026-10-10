const {test}=require('node:test'),assert=require('node:assert/strict');
const E=require('../寶可夢3D-V5/js/ecology.js');
test('distant actor drops shadows and never banks deferred animation time',()=>{
 const mesh={castShadow:true,isMesh:true,position:{distanceTo:()=>100},traverse(fn){fn(this);}};
 const p={type:'piplup',animation:{},mesh};
 const ecology=new E.Ecology({state:{currentMode:'world',obstacles:[]},player:{position:{}}});
 assert.equal(ecology.tick(p,120),true);assert.equal(mesh.castShadow,false);assert.equal(p.v5LOD,'sleep');assert.equal(ecology.instances.get(p).acc,0);
});
