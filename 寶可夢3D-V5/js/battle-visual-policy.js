/* V5 3D arena appearance policy; no persistent source GLB materials are changed. */
(function(root){
 'use strict';
 const NPC_SCALE=1.10,OBLIQUE_DEGREES=15;
 function facePlayer(playerX,playerZ,npcX,npcZ,offsetDeg=OBLIQUE_DEGREES){
   return Math.atan2(playerX-npcX,playerZ-npcZ)+offsetDeg*Math.PI/180;
 }
 function cloneForBattle(visual){
   const cloned=[],map=new Map();
   if(!visual||typeof visual.traverse!=='function')return cloned;
   visual.traverse(node=>{
     if(!node.isMesh || !node.material)return;
     const soften=original=>{
       if(!original||typeof original.clone!=='function')return original;
       if(map.has(original))return map.get(original);
       const material=original.clone();
       // Preserve original patterns, textures, transparencies, and color relationships.
       // Reduce flat/unlit brightness more strongly than physically shaded materials.
       material.color?.multiplyScalar?.(material.isMeshBasicMaterial?.80:.91);
       if(typeof material.emissiveIntensity==='number')material.emissiveIntensity*=.25;
       if(typeof material.metalness==='number')material.metalness=Math.min(material.metalness,.26);
       if(typeof material.roughness==='number')material.roughness=Math.max(material.roughness,.70);
       map.set(original,material);cloned.push(material);
       return material;
     };
     node.material=Array.isArray(node.material)?node.material.map(soften):soften(node.material);
   });
   return cloned;
 }
 const api=Object.freeze({NPC_SCALE,OBLIQUE_DEGREES,facePlayer,cloneForBattle});
 root.V5BattleVisual=api;
 if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
