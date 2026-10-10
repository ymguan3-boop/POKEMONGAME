/* Original V5 Jigglypuff sculpt: connected ears, limbs and hair curl. */
PalletModelsV2.register('jigglypuff',b=>{
 const pink=0xf6a9c8,highlight=0xffd3df,inner=0x874c6a,blue=0x4daac1,deep=0x27394a;
 b.ell(pink,[0,.66,0],[.66,.62,.51],[0,0,0],'round-body');
 b.ell(highlight,[0,.60,.38],[.40,.35,.15],[0,0,0],'face');
 for(const s of [-1,1]){
  b.cone(pink,[s*.43,1.23,-.02],.25,.62,[0,0,-s*.25],'ear');
  b.cone(inner,[s*.43,1.28,.13],.12,.36,[0,0,-s*.25],'inner-ear');
  b.eye([s*.25,.79,.49],[.19,.25,.09],blue);
  b.ell(pink,[s*.55,.44,.17],[.23,.17,.24],[0,0,s*.28],'arm');
  b.ell(inner,[s*.33,.10,.20],[.24,.12,.28],[0,0,0],'foot');
 }
 b.tube(pink,[[0,1.21,.13],[.16,1.45,.17],[.30,1.43,.17],[.32,1.27,.20],[.19,1.22,.23]],.12,'forehead-curl',.07);
 b.ell(pink,[0,.60,.53],[.07,.05,.06],[0,0,0],'nose');
 b.mouth([[-.12,.47,.51],[0,.43,.53],[.12,.47,.51]],.015,deep);
});
