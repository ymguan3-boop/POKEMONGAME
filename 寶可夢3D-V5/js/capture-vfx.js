/* Visual timeline only. V4 alone owns inventory, hit tests, rolls and catch result. */
(()=>{const T=THREE,profiles={normal:0xff8796,great:0x73caff,master:0xe8a0ff,ultra:0xffdc76};
 class CaptureVFX{
  constructor(){this.absorptions=[];this.releases=[];}
  glow(root,color,intensity){root.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){if(!m.emissive)continue;if(!m.userData.v5CaptureBase)m.userData.v5CaptureBase={color:m.emissive.getHex(),intensity:m.emissiveIntensity};m.emissive.setHex(color);m.emissiveIntensity=intensity;}});}
  restore(root){root.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){const b=m.userData.v5CaptureBase;if(b){m.emissive.setHex(b.color);m.emissiveIntensity=b.intensity;delete m.userData.v5CaptureBase;}}});}
  absorb(pokemon,ball){this.absorptions.push({pokemon,ball,age:0,start:pokemon.mesh.position.clone(),color:profiles[ball.mesh.userData.kind]||profiles.normal});ball.mesh.rotation.set(0,0,0);ball.mesh.userData.captureOpen=.45;}
  release(pokemon,ballPosition){const root=pokemon.loadedGLB||pokemon.mesh.children[0];if(!root)return;pokemon.mesh.updateMatrixWorld(true);const target=root.position.clone(),source=pokemon.mesh.worldToLocal(ballPosition.clone());this.releases.push({root,age:0,scale:root.scale.clone(),target,source});root.scale.multiplyScalar(.015);root.position.copy(source);this.glow(root,0xd5f5ff,1.4);}
  update(dt){for(let i=this.absorptions.length-1;i>=0;i--){const e=this.absorptions[i];e.age+=dt;const t=Math.min(1,e.age/.5),curve=t*t*(3-2*t);e.pokemon.mesh.position.lerpVectors(e.start,e.ball.mesh.position,curve);this.glow(e.pokemon.mesh,e.color,Math.sin(t*Math.PI)*1.5);if(t===1){this.restore(e.pokemon.mesh);this.absorptions.splice(i,1);}}
   for(let i=this.releases.length-1;i>=0;i--){const e=this.releases[i];e.age+=dt;const t=Math.min(1,e.age/.5),ease=t*t*(3-2*t);e.root.scale.copy(e.scale).multiplyScalar(Math.max(.015,ease));e.root.position.lerpVectors(e.source,e.target,ease);this.glow(e.root,0xd5f5ff,(1-t)*1.4);if(t===1){this.restore(e.root);this.releases.splice(i,1);}}
  }
 }
 window.V5CaptureVFX=CaptureVFX;
})();
