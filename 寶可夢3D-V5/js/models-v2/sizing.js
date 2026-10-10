/* One scale contract shared by game, evolution charts, thumbnails and QA. */
(()=>{
 const UNITS_PER_METRE=1.5;
 // Official "height" for these two horizontally elongated species is represented by total length.
 const lengthSpecies=new Set(['kyogre','rayquaza']);
 function measure(id){const m=PalletMeasurements[id]||(id==='mewtwo'?{heightM:2,reference:'V5 特別版超夢尺寸'}:null);if(!m)throw Error('Missing official size: '+id);const stage=PalletRoster.dex[id]?.stage||1;const min=id==='mew'?1.45:stage===1?1.8:stage===2?2.2:2.8;return {metres:m.heightM,world:Math.max(min,m.heightM*UNITS_PER_METRE),axis:lengthSpecies.has(id)?'longest':'height',source:m.reference};}
 function normalize(model,id){
  model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),spec=measure(id);
  const dimension=spec.axis==='longest'?Math.max(size.x,size.y,size.z):size.y;if(!Number.isFinite(dimension)||dimension<=0)throw Error('Invalid model size '+id);
  const scale=spec.world/dimension;
  const normalized=new THREE.Group();normalized.name=id+'-metre-scaled';normalized.add(model);model.scale.multiplyScalar(scale);
  model.position.y-=bounds.min.y*scale;
  model.position.x-=(bounds.min.x+bounds.max.x)/2*scale;
  model.position.z-=(bounds.min.z+bounds.max.z)/2*scale;
  normalized.userData={species:id,officialHeightM:spec.metres,worldTarget:spec.world,measurementAxis:spec.axis,source:'official-reference-remodel-v2'};
  return normalized;
 }
 window.PalletScale=Object.freeze({UNITS_PER_METRE,measure,normalize});
 window.PalletModels={build:id=>PalletModelsV2.build(id)};
})();
