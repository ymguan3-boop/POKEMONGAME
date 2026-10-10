/* NPC role is per instance. Species IDs never determine capture eligibility. */
window.V5NpcData={
 actors:[
  {id:'joy',name:'喬伊小姐',asset:'npc-joy',home:[-3,8],radius:1.7,dialogue:'歡迎來到寶可夢中心！旅途中別忘了適時休息。',supply:{item:'potion',amount:1}},
  {id:'jenny',name:'君莎小姐',asset:'npc-jenny',home:[-27,40],radius:2.8,dialogue:'我和風速狗會巡視鎮上的道路。通過皮卡丘道館後，來向我報告吧！',supply:{item:'normal',amount:3}},
  {id:'oak',name:'大木博士',asset:'npc-oak',home:[26,-28],radius:2.2,dialogue:'捕捉並記錄 5 種寶可夢，回來領取研究獎勵：雷之石。',supply:{item:'berry',amount:2}},
 ],
 companions:[{id:'center-chansey',species:'chansey',name:'吉利蛋',leader:'joy',offset:[2,0]},{id:'center-happiny',species:'happiny',name:'小福蛋',leader:'joy',offset:[-2,.5]},{id:'police-arcanine',species:'arcanine',name:'風速狗',leader:'jenny',offset:[2,1]}],
 itemNames:{normal:'寶貝球',berry:'樹果',potion:'傷藥',revive:'活力碎片',thunderStone:'雷之石',fireStone:'火之石',waterStone:'水之石'}
};
