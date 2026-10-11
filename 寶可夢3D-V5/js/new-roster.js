(()=>{
 const data=[['raichu','雷丘','電',2,'pikachu'],['caterpie','綠毛蟲','蟲',1,'caterpie'],['metapod','鐵甲蛹','蟲',2,'caterpie'],['butterfree','巴大蝶','蟲／飛行',3,'caterpie'],['weedle','獨角蟲','蟲／毒',1,'weedle'],['kakuna','鐵殼蛹','蟲／毒',2,'weedle'],['beedrill','大針蜂','蟲／毒',3,'weedle']];
 for(const [id,name,type,stage,family]of data){PalletRoster.dex[id]={name,type,stage,family,generation:1,role:'wild',color:id==='raichu'?'bg-yellow-500':'bg-green-600',border:'border-lime-300',desc:id==='raichu'?'實際捕捉至少 1 隻皮卡丘後，與大木博士對話，即會在真新鎮現身並永久解鎖自然出現。':'棲息在真新鎮樹林的蟲寶可夢。依原有圖鑑進度解鎖進化型。'};PalletRoster.scale[id]=1;}
 PalletRoster.base.push('caterpie','weedle');window.V5NewSpeciesIds=new Set(data.map(x=>x[0]));
 window.V5SpawnWeights=Object.freeze({pikachu:1,raichu:.15});
})();
