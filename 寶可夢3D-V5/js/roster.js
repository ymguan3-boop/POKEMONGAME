/* 真新鎮版本的唯一名單來源。每條進化鏈三階，每代三條，共 36 種。 */
(() => {
  const families = [
    [1,'grass',['bulbasaur','妙蛙種子','草／毒'],['ivysaur','妙蛙草','草／毒'],['venusaur','妙蛙花','草／毒']],
    [1,'fire',['charmander','小火龍','火'],['charmeleon','火恐龍','火'],['charizard','噴火龍','火／飛行']],
    [1,'water',['squirtle','傑尼龜','水'],['wartortle','卡咪龜','水'],['blastoise','水箭龜','水']],
    [2,'grass',['chikorita','菊草葉','草'],['bayleef','月桂葉','草'],['meganium','大竺葵','草']],
    [2,'fire',['cyndaquil','火球鼠','火'],['quilava','火岩鼠','火'],['typhlosion','火爆獸','火']],
    [2,'water',['totodile','小鋸鱷','水'],['croconaw','藍鱷','水'],['feraligatr','大力鱷','水']],
    [3,'grass',['treecko','木守宮','草'],['grovyle','森林蜥蜴','草'],['sceptile','蜥蜴王','草']],
    [3,'fire',['torchic','火稚雞','火'],['combusken','力壯雞','火／格鬥'],['blaziken','火焰雞','火／格鬥']],
    [3,'water',['mudkip','水躍魚','水'],['marshtomp','沼躍魚','水／地面'],['swampert','巨沼怪','水／地面']],
    [4,'grass',['turtwig','草苗龜','草'],['grotle','樹林龜','草'],['torterra','土台龜','草／地面']],
    [4,'fire',['chimchar','小火焰猴','火'],['monferno','猛火猴','火／格鬥'],['infernape','烈焰猴','火／格鬥']],
    [4,'water',['piplup','波加曼','水'],['prinplup','波皇子','水'],['empoleon','帝王拿波','水／鋼']],
  ];
  const legends = [
    [1,'articuno','急凍鳥','冰／飛行'],[1,'zapdos','閃電鳥','電／飛行'],[1,'moltres','火焰鳥','火／飛行'],
    [2,'raikou','雷公','電'],[2,'entei','炎帝','火'],[2,'suicune','水君','水'],
    [3,'kyogre','蓋歐卡','水'],[3,'groudon','固拉多','地面'],[3,'rayquaza','烈空坐','龍／飛行'],
    [4,'dialga','帝牙盧卡','鋼／龍'],[4,'palkia','帕路奇亞','水／龍'],[4,'giratina','騎拉帝納','幽靈／龍'],
  ];
  const dex = {}, base = [], scale = {};
  const colors = {grass:['bg-green-600','border-green-400'],fire:['bg-orange-600','border-orange-400'],water:['bg-blue-600','border-blue-400']};
  families.forEach(([generation,element,...chain]) => chain.forEach(([id,name,type],i) => {
    dex[id] = {name,type,color:colors[element][0],border:colors[element][1],generation,stage:i+1,element,family:chain[0][0],role:'starter',desc:`第 ${generation} 代${{grass:'草',fire:'火',water:'水'}[element]}系御三家，第 ${i+1} 階。進化鏈：${chain.map(x=>x[1]).join(' → ')}。`};
    scale[id] = [.78,1.02,1.3][i]; if (i===0) base.push(id);
  }));
  legends.forEach(([generation,id,name,type],i)=>{
    dex[id]={name,type,generation,stage:3,role:'legendary',color:'bg-purple-700',border:'border-yellow-400',desc:`第 ${generation} 代傳說寶可夢。圖鑑收集達 ${[25,50,75][i%3]}% 時甦醒，每種僅能捕捉一次。`};
    scale[id]=['rayquaza','giratina','kyogre'].includes(id)?1.85:1.65;
  });
  [['pikachu','皮卡丘','電'],['mew','夢幻','超能力'],['wigglytuff','胖可丁','一般／妖精'],['blissey','幸福蛋','一般']].forEach(([id,name,type])=>{
    dex[id]={name,type,generation:id==='blissey'?2:1,stage:1,role:'gym',color:'bg-pink-600',border:'border-pink-300',desc:`擊敗${name}道館即可解鎖完整變裝，並在野外捕捉${name}一次。`}; scale[id]=id==='mew'?.88:1.05;
  });
  const bosses=['pikachu','mew','wigglytuff','blissey'];
  window.PalletRoster=Object.freeze({dex,base,scale,families,legends:legends.map(x=>x[1]),bosses,special:[...legends.map(x=>x[1]),...bosses]});
})();
