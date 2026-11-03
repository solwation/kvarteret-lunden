// Public #237: public trunks/crown metadata only. Adapted selection from original 578ecc09.
import {SQUIRRELS as C,PADDOCK,WALK} from './config.js';
import {riverAt,waterYAt} from './riverbridge.js';
import {onVehicle} from './roads.js';
export const squirrelLand=(ground,x,z)=>!onVehicle(x,z,.5)&&ground(x,z)>waterYAt(x,z)+.3;
export function squirrelTrees(feet,crowns,southFeet,ground){
 const trees=[];
 for(const f of [...feet,...southFeet]){
  const south=f.x>=C.south[0]&&f.x<=C.south[1]&&f.z>=C.south[2]&&f.z<=C.south[3];
  if(!south&&!(f.x>WALK.x0&&f.x<WALK.x1&&f.z>WALK.z0&&f.z<WALK.z1&&riverAt(f.x,f.z).distance<C.roam.valley)&&!PADDOCK.trees.some(([x,z])=>Math.hypot(x-f.x,z-f.z)<.01))continue;
  const c=crowns.find(c=>Math.hypot(c.x-f.x,c.z-f.z)<.05)??f;
  if(![f.x,f.z,c.y??f.y,c.r,c.cy??c.y].every(Number.isFinite)||!squirrelLand(ground,f.x,f.z))continue;
  // The whole spiral foot stays on dry, off-road ground.
  if(!Array.from({length:8},(_,i)=>squirrelLand(ground,f.x+.35*Math.cos(i*Math.PI/4),f.z+.35*Math.sin(i*Math.PI/4))).every(Boolean))continue;
  trees.push({x:f.x,z:f.z,y:ground(f.x,f.z),cy:c.cy??c.y,r:c.r,g:south?'south':'river',near:[]});
 }
 for(let i=0;i<trees.length;i++)for(let j=i+1;j<trees.length;j++)if(trees[i].g===trees[j].g&&Math.hypot(trees[i].x-trees[j].x,trees[i].z-trees[j].z)<=C.leapRange){trees[i].near.push(j);trees[j].near.push(i);}
 return trees;
}
