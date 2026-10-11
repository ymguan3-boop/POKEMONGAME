/* NPC role is per instance. Species IDs never determine capture eligibility. */
window.V5NpcData={
 actors:[
  {id:'joy',name:'喬伊小姐',asset:'npc-joy',home:[-3,8],radius:1.7,dialogue:'歡迎來到寶可夢中心！旅途中別忘了適時休息。',supply:{item:'potion',amount:1}},
  {id:'jenny',name:'君莎小姐',asset:'npc-jenny',home:[-27,40],radius:2.8,dialogue:'我和風速狗會巡視鎮上的道路。通過皮卡丘道館後，來向我報告吧！',supply:{item:'normal',amount:3}},
  {id:'oak',name:'大木博士',asset:'npc-oak',home:[26,-28],radius:2.2,dialogue:'請捕捉至少 1 隻皮卡丘再回來找我，我會協助你找到雷丘！',supply:{item:'berry',amount:2}},
  {id:'card-rival',name:'寶可夢對戰訓練家',asset:'npc-oak',home:[-14,24],radius:3,cardTrainer:true,battleTrainer:true,randomHome:true,dialogue:'組織三隻已捕捉寶可夢，一起前往 3D 擂台吧！'},
 ],
 companions:[{id:'center-chansey',species:'chansey',name:'吉利蛋',leader:'joy',offset:[2,0]},{id:'center-happiny',species:'happiny',name:'小福蛋',leader:'joy',offset:[-2,.5]},{id:'police-arcanine',species:'arcanine',name:'風速狗',leader:'jenny',offset:[2,1]}],
 itemNames:{normal:'寶貝球',berry:'樹果',potion:'傷藥',revive:'活力碎片',thunderStone:'雷之石',fireStone:'火之石',waterStone:'水之石'}
};
