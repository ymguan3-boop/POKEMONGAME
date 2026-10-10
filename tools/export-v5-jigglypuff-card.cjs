/* Render the authored V5 model directly into a compact card thumbnail. */
const {chromium}=require('C:/Users/ymguan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Users/ymguan/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe',headless:true,args:['--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:900,height:800}});
  await page.goto('http://127.0.0.1:4179/?qa=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.PalletQA&&document.body.dataset.runtimeReady==='true',{timeout:60000});
  const image=await page.evaluate(async()=>{
   const asset=await PalletQA.asset('jigglypuff'),model=PalletQA.clone(asset.scene),renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true,alpha:true});
   renderer.setSize(512,512);renderer.setPixelRatio(1);const scene=new THREE.Scene();scene.background=new THREE.Color(0xb3d8ea);scene.add(new THREE.AmbientLight(0xffffff,.55));const light=new THREE.DirectionalLight(0xffffff,.9);light.position.set(4,7,6);scene.add(light);scene.add(model);
   const box=new THREE.Box3().setFromObject(model),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3()),camera=new THREE.PerspectiveCamera(36,1,.01,200);
   const distance=Math.max(size.x,size.y,size.z)/(2*Math.tan(18*Math.PI/180))*1.35;camera.position.copy(center).add(new THREE.Vector3(.4,.2,1).normalize().multiplyScalar(distance));camera.lookAt(center);renderer.render(scene,camera);const url=renderer.domElement.toDataURL('image/webp',.88);renderer.dispose();return url;
  });
  const root=path.resolve(__dirname,'../寶可夢3D-V5'),assetPath=path.join(root,'cards/model-thumbs/jigglypuff.webp');fs.writeFileSync(assetPath,Buffer.from(image.split(',')[1],'base64'));
  const modelPath='js/models-v2/jigglypuff.js',source=fs.readFileSync(path.join(root,modelPath)),manifestPath=path.join(root,'cards/model-sources.json'),manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  if(!manifest.some(x=>x.id==='jigglypuff'))manifest.push({id:'jigglypuff',name:'胖丁',modelPath,modelValidated:true,animationClips:['Idle','Walk','Attack','Hurt'],cardArt:null,cardArtStatus:'model-based-action-card',modelSha256:crypto.createHash('sha256').update(source).digest('hex')});
  fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');console.log('Jigglypuff model card exported',fs.statSync(assetPath).size,'bytes; roster',manifest.length);
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
