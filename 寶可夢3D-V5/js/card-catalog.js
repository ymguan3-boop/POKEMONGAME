/* V5 card data shares the verified new-model registry with the playable world. */
(()=>{
 const starters=new Set(PalletRoster.base),legend=new Set(PalletRoster.legends);
 const shipped=new Set(['bulbasaur','piplup','articuno','zapdos','moltres','kyogre',...V5NewSpeciesIds]);
 const modelSource=id=>shipped.has(id)?`models/${id}.glb`:['mewtwo','jigglypuff'].includes(id)?`js/models-v2/${id}.js`:PalletRoster.dex[id]?.role==='starter'?(PalletRoster.dex[id].generation<=2?'js/models-v2/gen12.js':'js/models-v2/gen34.js'):'js/models-v2/special.js';
 const attacks={草:'藤葉突進',火:'火花衝擊',水:'泡泡急流',電:'電光跳躍',冰:'冰羽旋風',蟲:'疾速突刺',超能力:'念力光球',一般:'活力衝撞',地面:'岩地震擊',龍:'龍息風暴',幽靈:'幻影突襲',鋼:'金屬光刃'};
 const elementOf=info=>(info.type||'一般').split('／')[0],weakness={草:'火',火:'水',水:'電',電:'地面',冰:'火',蟲:'火',地面:'水',超能力:'幽靈',鋼:'火',龍:'冰',幽靈:'超能力',一般:'格鬥'};
 const ids=[...new Set([...PalletModelsV2.ids(),...V5NewSpeciesIds])].filter(id=>!V5LegacySpecies.has(id));
 const entries=ids.map((id,index)=>{
  const info=PalletRoster.dex[id];if(!info)throw Error('New model missing Pokédex data: '+id);
  const legendary=legend.has(id)||id==='mewtwo';const stage=legendary||info.role==='gym'?1:info.stage||1;
  const family=info.family||id;const chain=PalletRoster.families.find(row=>row.slice(2).some(p=>p[0]===id));
  const evolvesFrom=chain&&stage>1?chain[stage][0]:id==='raichu'?'pikachu':id==='metapod'?'caterpie':id==='butterfree'?'metapod':id==='kakuna'?'weedle':id==='beedrill'?'kakuna':null;
  const element=elementOf(info),hp=legendary?170:stage===3?140:stage===2?100:70,energy=stage===3||legendary?3:stage===2?2:1,damage=legendary?80:stage===3?65:stage===2?45:25,attack=attacks[element]||'閃耀衝擊';
  return Object.freeze({id,speciesId:id,name:info.name,nameZh:info.name,element,stage,evolvesFrom,family,legendary,hp,energy,attack,damage,skills:Object.freeze([{name:'靈巧一擊',energy:1,damage:Math.max(15,Math.round(damage*.55/5)*5),effect:'輕快出招'},{name:attack,energy,damage,effect:'完成主要屬性攻勢'}]),weakness:weakness[element]||'一般',retreatCost:legendary?2:1,description:info.desc||`${info.name}在真新鎮展開冒險。`,art:V5CardArt?.[id]||null,modelPath:modelSource(id),modelVersion:'V5',cardNumber:index+1});
 });
 window.V5CardCatalog=Object.freeze(entries);
 window.V5CardById=Object.freeze(Object.fromEntries(entries.map(c=>[c.id,c])));
 function render(state,list){
  list.replaceChildren();
  const frag=document.createDocumentFragment();
  let caught=0;
  for(const c of entries){
   const count=Math.max(0,Number(state.captureCounts?.[c.id])||0);
   // Legacy saves may record a successful catch in pokedexUnlocks only.
   const discovered=count>0||state.pokedexUnlocks?.[c.id]===true;
   if(discovered)caught++;
   const card=document.createElement('article');
   card.className='v5-dex-card'+(c.art?'':' v5-model-card')+(discovered?'':' is-unseen');
   card.dataset.species=c.id;
   if(discovered){
    card.tabIndex=0;
    card.setAttribute('aria-label',`查看${c.name}圖鑑詳情`);
    card.onclick=e=>{if(!e.target.closest('button'))window.V5CardDetails.open(c,count)};
    card.onkeydown=e=>{if(e.key==='Enter'&&e.target===card)window.V5CardDetails.open(c,count)};
   }else{
    card.setAttribute('aria-label',`尚未捕捉的圖鑑項目 #${String(c.cardNumber).padStart(3,'0')}`);
   }
   const art=document.createElement('div');art.className='v5-dex-art';
   if(discovered){
    const img=document.createElement('img');img.loading='lazy';img.decoding='async';
    img.alt=`${c.name}的${c.art?'Q 版卡牌插畫':'新 3D 模型預覽圖'}`;
    img.src=c.art||`cards/model-thumbs/${c.id}.webp`;
    img.onerror=()=>{img.onerror=null;img.style.display='none';art.append(Object.assign(document.createElement('span'),{textContent:'模型縮圖製作中'}));};
    art.append(img);
   }else{
    // 不載入未捕捉物種的圖片，避免從輪廓、亮度或網路請求辨識真身。
    art.classList.add('v5-unknown-art');
    const lock=document.createElement('span');lock.className='v5-unknown-lock';
    lock.textContent='🔒';lock.setAttribute('aria-hidden','true');art.append(lock);
   }
   card.append(art);
   const title=document.createElement('div');title.className='v5-dex-title';
   title.innerHTML='<strong></strong><span></span>';
   title.querySelector('strong').textContent=discovered?c.name:'？？？';
   title.querySelector('span').textContent=discovered?`HP ${c.hp}`:'待解鎖';
   card.append(title);
   const detail=document.createElement('p');detail.className='v5-dex-detail';
   detail.textContent=discovered?`${c.element} · ${c.legendary?'傳說':c.stage===1?'基礎型':c.stage===2?'一階進化':'二階進化'} · ${c.attack} ${c.damage}`:'尚未捕捉 · 等待解鎖';
   card.append(detail);
   const desc=document.createElement('p');desc.className='v5-dex-desc';
   desc.textContent=discovered?c.description:'成功捕捉後，才會顯示完整的圖鑑資訊。';
   card.append(desc);
   const footer=document.createElement('div');footer.className='v5-dex-footer';
   const status=document.createElement('small');
   status.textContent=discovered?`${count>0?'已捕捉 '+count+' 次':'已捕捉'} · ${c.art?'Q 版卡圖':'3D 模型動感卡面'}`:'🔒 尚未捕捉';
   footer.append(status);
   if(discovered){
    const btn=document.createElement('button');btn.type='button';btn.textContent='查看 3D 模型';
    btn.onclick=()=>window.V5ModelViewer?.open(c);footer.append(btn);
   }
   card.append(footer);frag.append(card);
  }
  list.append(frag);return {caught,total:entries.length};
 }
 window.renderV5Pokedex=render;
 window.V5CardDetails={open(c,count){this.close();const root=document.createElement('section');root.id='v5-card-detail';if(!c.art)root.classList.add('v5-model-detail');root.role='dialog';root.setAttribute('aria-modal','true');root.innerHTML='<div class="inner"><button class="close">關閉</button><h2></h2><img><p class="stats"></p><div class="skills"></div><p class="description"></p><p class="source"></p><button class="model">查看 3D 模型</button></div>';root.querySelector('h2').textContent=c.name+' · HP '+c.hp;root.querySelector('img').src=c.art||`cards/model-thumbs/${c.id}.webp`;root.querySelector('img').alt=c.art?c.name+'Q 版卡牌插畫':c.name+'V5 3D 模型動感卡面';root.querySelector('.stats').textContent=`${c.element}｜${c.legendary?'傳說':c.evolvesFrom?'進化型':'基礎型'}｜弱點 ${c.weakness}｜撤退 ${c.retreatCost}`;for(const skill of c.skills){const p=document.createElement('p');p.className='skill';p.textContent=`✦ ${skill.energy} 能量　${skill.name}　${skill.damage} 傷害｜${skill.effect}`;root.querySelector('.skills').append(p)}root.querySelector('.description').textContent=c.description;root.querySelector('.source').textContent=`V5 #${String(c.cardNumber).padStart(3,'0')} · 新製模型 · ${count?'已捕捉 '+count+' 次':'尚未捕捉'} · ${c.art?'Q 版卡圖':'3D 模型動感卡面'}`;root.querySelector('.close').onclick=()=>this.close();root.querySelector('.model').onclick=()=>window.V5ModelViewer?.open(c);document.body.append(root);this.root=root;},close(){this.root?.remove();this.root=null;}};
})();
