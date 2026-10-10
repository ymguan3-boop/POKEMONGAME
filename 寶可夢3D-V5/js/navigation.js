/* Four-neighbour A* on a small grid; cached while H-navigation is active. */
window.PalletNavigation=(()=>{
 let route=[],lastGoal='',lastPlan=0;
 const step=2.5,limit=25,key=(x,z)=>x+','+z;
 function waypoint(pos,goal,obstacles){
  const now=performance.now(),gkey=Math.round(goal.x)+','+Math.round(goal.z);
  if(!route.length||gkey!==lastGoal||now-lastPlan>4000){
   lastGoal=gkey;lastPlan=now;route=[];
   const sx=Math.round(pos.x/step),sz=Math.round(pos.z/step);
   const blocked=(x,z)=>obstacles.some(o=>Math.hypot(x*step-o.x,z*step-o.z)<o.radius+.9);
   const start={x:sx,z:sz,g:0,f:Math.hypot(pos.x-goal.x,pos.z-goal.z)/step,parent:null};
   const open=[start],costs=new Map([[key(sx,sz),0]]);let found=null,loops=0;
   while(open.length&&loops++<3000){open.sort((a,b)=>a.f-b.f);const n=open.shift();if(Math.hypot(n.x*step-goal.x,n.z*step-goal.z)<10.8){found=n;break;}
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=n.x+dx,z=n.z+dz,k=key(x,z),g=n.g+1;if(Math.abs(x)>limit||Math.abs(z)>limit||blocked(x,z)||g>=(costs.get(k)??Infinity))continue;costs.set(k,g);open.push({x,z,g,f:g+Math.max(0,Math.hypot(x*step-goal.x,z*step-goal.z)-10)/step,parent:n});}
   }
   while(found?.parent){route.unshift(new THREE.Vector3(found.x*step,0,found.z*step));found=found.parent;}
  }
  while(route.length&&Math.hypot(route[0].x-pos.x,route[0].z-pos.z)<1.0)route.shift();
  return route[0]||goal;
 }
 return {waypoint};
})();
