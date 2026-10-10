/* Load one V5 model only on request; the cardbook never loads sixty WebGL scenes. */
(()=>{let root=null,renderer=null,frame=0,model=null;
 function close(){cancelAnimationFrame(frame);root?.remove();root=null;renderer?.dispose();renderer=null;model=null;}
 async function open(card){close();root=document.createElement('section');root.id='v5-model-viewer';root.role='dialog';root.setAttribute('aria-modal','true');root.innerHTML='<div><h2></h2><p>V5 新製 3D 模型</p><div class="canvas-host"></div><button type="button">返回卡牌</button></div>';root.querySelector('h2').textContent=card.name;root.querySelector('button').onclick=close;document.body.append(root);
  try{const asset=await window.PalletQA?.asset?.(card.id)||await window.V5ViewerAsset?.(card.id);if(!root)return;
   const clone=window.V5ViewerClone?window.V5ViewerClone(asset.scene):asset.scene.clone(true);
   const scene=new THREE.Scene();scene.background=new THREE.Color(0xdceadf);scene.add(new THREE.AmbientLight(0xffffff,1.15));const light=new THREE.DirectionalLight(0xffffff,1.3);light.position.set(4,8,7);scene.add(light);model=clone;scene.add(model);model.updateMatrixWorld(true);
   const box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());const camera=new THREE.PerspectiveCamera(42,1,.01,1000);camera.position.copy(center).add(new THREE.Vector3(1,.48,1.4).normalize().multiplyScalar(Math.max(size.x,size.y,size.z)*2.2));camera.lookAt(center);
   renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(360,360);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));root.querySelector('.canvas-host').append(renderer.domElement);const draw=()=>{if(!root)return;model.rotation.y+=.006;renderer.render(scene,camera);frame=requestAnimationFrame(draw)};draw();
  }catch(e){root.querySelector('.canvas-host').textContent='3D 模型暫時無法載入';console.warn(e);}
 }
 window.V5ModelViewer={open,close};
})();
