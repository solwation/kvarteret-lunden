// Public #237: public trunks/crown metadata only. Adapted selection from original 578ecc09.
import {SQUIRRELS as C,SQUIRREL_CLIMB as K,TREE_FORM,PADDOCK,WALK} from './config.js';
import {riverAt,waterYAt} from './riverbridge.js';
import {onVehicle} from './roads.js';
import {treeSkeleton,trunkLayout} from './treeform.js';
import {climbFrame} from './squirrelclimb.js';
import {linkTrees} from './squirrelbrain.js';
import {lowMemory} from './lowmemory.js';
export const squirrelLand=(ground,x,z)=>!onVehicle(x,z,.5)&&ground(x,z)>waterYAt(x,z)+.3;
/** Public #328 (original #2132): the climbing frame of the tree at (x, z) as built (surroundings.js treeForms: its trunk instance ->
 * treeform.js skeleton with the main limbs and their second order -> squirrelclimb.js frame on the drawn bark), or null. */
export function climbFrameOf(forms,x,z,phone=lowMemory){
 const form=forms.find(m=>Math.abs(m.x-x)<.01&&Math.abs(m.z-z)<.01);
 return form?climbFrame(treeSkeleton(form.matrix,form.bark,{phone,orders:2}),{m:form.matrix,aspect:TREE_FORM.branch[form.bark].aspect,layout:trunkLayout(form.bark,phone)}):null;
}
export function squirrelTrees(feet,crowns,southFeet,ground,forms=[]){
 const trees=[];
 for(const f of [...feet,...southFeet]){
  const south=f.x>=C.south[0]&&f.x<=C.south[1]&&f.z>=C.south[2]&&f.z<=C.south[3];
  if(!south&&!(f.x>WALK.x0&&f.x<WALK.x1&&f.z>WALK.z0&&f.z<WALK.z1&&riverAt(f.x,f.z).distance<C.roam.valley)&&!PADDOCK.trees.some(([x,z])=>Math.hypot(x-f.x,z-f.z)<.01))continue;
  const c=crowns.find(c=>Math.hypot(c.x-f.x,c.z-f.z)<.05)??f;
  if(![f.x,f.z,c.y??f.y,c.r,c.cy??c.y].every(Number.isFinite)||!squirrelLand(ground,f.x,f.z))continue;
  // The whole spiral foot stays on dry, off-road ground.
  if(!Array.from({length:8},(_,i)=>squirrelLand(ground,f.x+.35*Math.cos(i*Math.PI/4),f.z+.35*Math.sin(i*Math.PI/4))).every(Boolean))continue;
  // #328: its skeleton to climb on, when the foot ring round the drawn trunk (r0 + cling) is dry, off-road ground too
  let cf=climbFrameOf(forms,f.x,f.z);const fr=cf?cf.r0+K.cling:0;
  if(cf&&fr>.35&&!Array.from({length:8},(_,i)=>squirrelLand(ground,f.x+fr*Math.cos(i*Math.PI/4),f.z+fr*Math.sin(i*Math.PI/4))).every(Boolean))cf=null;
  trees.push({x:f.x,z:f.z,y:ground(f.x,f.z),cy:c.cy??c.y,r:c.r,g:south?'south':'river',near:[],cf});
 }
 return linkTrees(trees); // (#328: leaps between framed crowns only where two branch points are within SQUIRREL_CLIMB.hop)
}
