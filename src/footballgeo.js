// Public #250: selective fixed footprints/transforms from original c10d16ad; no gameplay.
import {FOOTBALL_SITE as C} from './config.js';
export const footballLocal=(C,x,z)=>{const c=Math.cos(C.yaw),s=Math.sin(C.yaw),dx=x-C.at[0],dz=z-C.at[1];return[dx*c-dz*s,dx*s+dz*c];};
export const footballWorld=(C,u,v)=>{const c=Math.cos(C.yaw),s=Math.sin(C.yaw);return[C.at[0]+u*c+v*s,C.at[1]-u*s+v*c];};
export function onFootballSite(x,z){const[u,v]=footballLocal(C,x,z);return(Math.abs(u)<=C.width/2+C.runoff&&Math.abs(v)<=C.length/2+C.runoff)||(u>=C.width/2&&u<=C.width/2+C.apron&&v>=C.apronSpan[0]&&v<=C.apronSpan[1]);}
export function footballFootprints(){const out=[],rect=(kind,u,v,w,d)=>{const p=[[u-w/2,v-d/2],[u+w/2,v-d/2],[u+w/2,v+d/2],[u-w/2,v+d/2]].map(q=>footballWorld(C,...q));p.kind=kind;out.push(p);};for(const sign of[-1,1])for(const u of[-C.goalWidth/2,C.goalWidth/2])for(const v of[sign*C.length/2,sign*(C.length/2+C.goalDepth)])rect('goal-post',u,v,C.postR*2,C.postR*2);for(const v of C.bench.offsets)rect('bench',C.bench.side,v,C.bench.depth+.06,C.bench.length);rect('fountain',...C.fountain.at,C.fountain.base,C.fountain.base);return out;}
export const footballSegments=()=>footballFootprints().flatMap(p=>p.map((a,i)=>[...a,...p[(i+1)%p.length]]));
