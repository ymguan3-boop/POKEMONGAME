/* Signature V5 moves: one distinct move/VFX seed per available Pokédex species. */
(function(root){
 'use strict';
 const names={
 bulbasaur:'藤蔓鞭旋',ivysaur:'花苞飛葉',venusaur:'巨花日光炮',
 charmander:'火尾流星',charmeleon:'烈爪火輪',charizard:'龍翼烈焰',
 squirtle:'泡泡連彈',wartortle:'旋尾水砲',blastoise:'雙砲海嘯',
 chikorita:'翠葉微風',bayleef:'月桂藤槍',meganium:'花海護盾',
 cyndaquil:'背火衝刺',quilava:'火山疾焰',typhlosion:'爆焰轟擊',
 totodile:'咬咬水花',croconaw:'激流亂咬',feraligatr:'巨顎海潮',
 treecko:'葉刃旋斬',grovyle:'森林連刃',sceptile:'翡翠疾風',
 torchic:'火羽跳踢',combusken:'焰拳旋擊',blaziken:'鳳凰烈踢',
 mudkip:'泥水小浪',marshtomp:'沼澤水旋',swampert:'泥海巨浪',
 turtwig:'種子彈雨',grotle:'森林甲盾',torterra:'大地花林',
 chimchar:'靈猴火星',monferno:'烽火連拳',infernape:'烈焰神拳',
 piplup:'泡沫星雨',prinplup:'寒流水刃',empoleon:'帝王冰槍',
 articuno:'極光冰羽',zapdos:'雷鳴羽暴',moltres:'鳳焰流星',
 raikou:'雷獸奔霆',entei:'熔岩怒吼',suicune:'聖泉冰晶',
 kyogre:'深海暴潮',groudon:'裂地熔震',rayquaza:'蒼穹龍卷',
 dialga:'鋼時衝波',palkia:'空間潮刃',giratina:'冥界影翼',
 pikachu:'十萬伏特連閃',raichu:'雷尾旋風',mew:'夢幻星塵',
 wigglytuff:'甜甜音波',blissey:'幸福虹光',mewtwo:'超能紫晶',
 caterpie:'黏黏絲線',metapod:'銀繭屏障',butterfree:'蝶舞毒粉',
 weedle:'毒針連發',kakuna:'毒殼尖刺',beedrill:'雙針毒舞',
 jigglypuff:'催眠星歌'
 };
 const overrides={
 butterfree:'poison',beedrill:'poison',weedle:'poison',kakuna:'poison',
 articuno:'freeze',suicune:'freeze',piplup:'freeze',prinplup:'freeze',
 pikachu:'paralysis',raichu:'paralysis',zapdos:'paralysis',raikou:'paralysis',
 meganium:'shield',grotle:'shield',torterra:'shield',metapod:'shield',
 blissey:'heal',wigglytuff:'heal',mew:'heal',suicune:'freeze'
 };
 const elementEffect={毒:'poison',蟲:'poison',冰:'freeze',電:'paralysis',草:'heal',一般:'shield'};
 const chances={poison:.55,freeze:.4,paralysis:.55,heal:1,shield:1};
 const variants=['spiral','burst','star','wave','shards','rings','lance','petals','comet','flurry'];
 function hash(id){let value=17;for(const c of String(id))value=(value*31+c.charCodeAt(0))>>>0;return value;}
 function signature(id,element,name){
  const effect=overrides[id]||elementEffect[element]||'none';
  const fxSeed=hash(id);
  return Object.freeze({id,name:names[id]||((name||id)+'・'+(element||'一般')+'之舞'),
    effect,chance:chances[effect]||0,fxVariant:variants[fxSeed%variants.length],
    fxSeed,element:element||'一般'});
 }
 root.V5BattleSignatures=Object.freeze({signature,names,variants});
 if(typeof module!=='undefined')module.exports=root.V5BattleSignatures;
})(typeof window!=='undefined'?window:globalThis);
