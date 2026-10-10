/* Original V5 sculpt, built from the same editable mesh kit as the other remodeled species. */
PalletModelsV2.register('mewtwo',b=>{
 const skin=0xded9ec,light=0xf8f6ff,shadow=0xb6abc9,purple=0x805a9d,deep=0x4b3273;
 b.ell(skin,[0,2.02,0],[.56,.94,.39],[0,0,0],'torso');
 b.ell(purple,[0,1.86,.33],[.37,.55,.12],[0,0,0],'abdomen');
 b.ell(skin,[0,2.86,.18],[.54,.48,.47],[0,0,0],'head');
 b.ell(light,[0,2.69,.59],[.27,.15,.20],[0,0,0],'muzzle');
 for(const sign of [-1,1]){
  b.cone(skin,[sign*.39,3.25,.04],.18,.60,[0,0,-sign*.28],'head-horn');
  b.ell(deep,[sign*.22,2.92,.608],[.13,.16,.04],[0,0,0],'eye');
  b.ell(light,[sign*.25,2.98,.65],[.045,.055,.018],[0,0,0],'eye-glint');
  b.ell(skin,[sign*.67,2.33,.03],[.24,.34,.24],[0,0,0],'shoulder');
  b.link(skin,[sign*.67,2.33,.03],[sign*.86,1.62,.17],.17,.14,'arm');
  b.ell(shadow,[sign*.86,1.51,.22],[.23,.18,.20],[0,0,0],'hand');
  for(let i=-1;i<=1;i++)b.link(skin,[sign*(.79+i*.08),1.48,.34],[sign*(.79+i*.11),1.20,.50],.055,.035,'finger');
  b.ell(skin,[sign*.35,1.27,-.02],[.28,.43,.34],[0,0,0],'thigh');
  b.link(skin,[sign*.37,1.03,.02],[sign*.43,.43,-.14],.19,.14,'leg');
  b.ell(shadow,[sign*.43,.19,.20],[.25,.18,.41],[0,0,0],'foot');
  for(let i=-1;i<=1;i++)b.cone(light,[sign*.43+i*.12,.14,.55],.065,.17,[Math.PI/2,0,0],'toe');
 }
 b.tube(purple,[[0,1.22,-.30],[.22,1.09,-.67],[.61,.86,-.81],[.83,.55,-.51],[.67,.29,-.22]],.21,'tail',.10);
 b.tube(purple,[[.18,2.77,-.34],[.49,2.51,-.36],[.63,2.20,-.26]],.075,'neck-cable');
 b.tube(purple,[[-.18,2.77,-.34],[-.49,2.51,-.36],[-.63,2.20,-.26]],.075,'neck-cable');
 b.mouth([[-.09,2.57,.77],[0,2.55,.78],[.09,2.57,.77]],.016,deep);
});
