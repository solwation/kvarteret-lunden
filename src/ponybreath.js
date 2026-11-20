// Public #340: reviewed breath-only adaptation of original #2188 b0fb6260.
// No character, audio or weather dependencies; one bounded point pool for both scenery ponies.
import * as THREE from 'three';
import { PONY_BREATH as B, PADDOCK as P, PONY_SURFACE as S } from './config.js';

const clamp = x => Math.max(0, Math.min(1, Number(x) || 0));
const smooth = (a,b,x) => { const t=clamp((x-a)/(b-a)); return t*t*(3-2*t); };
export const breathCold = (temp=10, snow=false) => Math.max(1-smooth(B.cold,B.warm,temp),snow?B.snowMin:0);
export function stepPonyBreath(state,dt,pose,cold) {
  dt=Math.max(0,Math.min(B.maxDt,Number(dt)||0));
  if (!(cold>.02)) { state.t=0; return 0; }
  if (!dt) return 0;
  state.t=(state.t??0)-dt;
  if(state.t>0)return 0;
  state.k=((state.k??.37)*9301+.211)%1;
  state.t=(B.period[pose]??B.period.idle)*(.85+.3*state.k);
  return cold;
}

const base=new THREE.Vector3(...P.pony.neck), tip=base.clone().add(new THREE.Vector3(0,Math.cos(.66),Math.sin(.66)).multiplyScalar(.72));
const X=new THREE.Vector3(1,0,0),Y=new THREE.Vector3(0,1,0),hd=new THREE.Vector3(0,-Math.sin(.91),Math.cos(.91)),hu=new THREE.Vector3(0,Math.cos(.91),Math.sin(.91));
// Exact head/neck rotation order from public ponyMaterial.animate; nostrils from its own geometry.
export function ponyMuzzle(pony,matrix,side,to,dir) {
  const [along,up,across]=S.nostrils.at, neck=pony.neck, yaw=pony.headYaw;
  to.copy(hd).multiplyScalar(along).addScaledVector(hu,up);to.x+=side*across;
  to.applyAxisAngle(X,-neck*.55).applyAxisAngle(Y,yaw*.6).add(tip).sub(base)
    .applyAxisAngle(X,neck).applyAxisAngle(Y,yaw*.4).add(base).applyMatrix4(matrix);
  dir.copy(hd).applyAxisAngle(X,-neck*.55).applyAxisAngle(Y,yaw*.6)
    .applyAxisAngle(X,neck).applyAxisAngle(Y,yaw*.4).transformDirection(matrix);
  return to;
}

export class PonyBreath {
  constructor(parent) {
    this.list=[];this.n=0;
    const geometry=new THREE.BufferGeometry();
    this.pos=new THREE.BufferAttribute(new Float32Array(B.max*3),3).setUsage(THREE.DynamicDrawUsage);
    this.data=new THREE.BufferAttribute(new Float32Array(B.max*3),3).setUsage(THREE.DynamicDrawUsage);
    geometry.setAttribute('position',this.pos);geometry.setAttribute('puff',this.data);geometry.setDrawRange(0,0);
    const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:true,fog:true,
      uniforms:THREE.UniformsUtils.merge([THREE.UniformsLib.fog,{uViewH:{value:600},uColor:{value:new THREE.Color(...B.color)}}]),
      vertexShader:`attribute vec3 puff; uniform float uViewH; varying vec2 vPuff;
        #include <fog_pars_vertex>
        void main(){vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;
          gl_PointSize=puff.x*projectionMatrix[1][1]*uViewH*.5/max(-mvPosition.z,.05);vPuff=puff.yz;
          #include <fog_vertex>
        }`,
      fragmentShader:`uniform vec3 uColor;varying vec2 vPuff;
        #include <common>
        #include <fog_pars_fragment>
        void main(){vec2 c=gl_PointCoord*2.0-1.0;float r2=dot(c,c);if(r2>1.0)discard;
          float lump=.8+.2*sin(c.x*4.7+vPuff.y*6.28)*sin(c.y*3.9-vPuff.y*4.1);
          gl_FragColor=vec4(uColor,vPuff.x*exp(-r2*2.6)*(1.0-r2)*lump);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`});
    this.points=new THREE.Points(geometry,material);
    Object.assign(this.points,{name:'pony-breath',visible:false,frustumCulled:false,renderOrder:3});
    this.points.raycast=()=>{};this.points.userData.noDetail=true;
    const size=new THREE.Vector2();
    this.points.onBeforeRender=renderer=>{material.uniforms.uViewH.value=renderer.getRenderTarget()?.height??renderer.getDrawingBufferSize(size).y;};
    parent.add(this.points);
  }
  emit(at,dir,alpha,scale=1) {
    if(!(alpha>.002))return;
    if(this.list.length>=B.max)this.list.shift();
    this.list.push({x:at.x,y:at.y,z:at.z,vx:dir.x*B.speed,vy:dir.y*B.speed+B.rise,vz:dir.z*B.speed,
      age:0,life:B.life,size:B.size*scale,alpha,seed:Math.random()});
  }
  clear(){this.list.length=this.n=0;this.points.visible=false;this.points.geometry.setDrawRange(0,0);}
  update(dt,wind) {
    dt=Math.max(0,Math.min(B.maxDt,Number(dt)||0));
    const drag=Math.exp(-B.drag*dt),list=this.list;let n=0;
    for(const p of list){
      p.age+=dt;if(p.age>=p.life)continue;
      p.vx*=drag;p.vz*=drag;p.vy=p.vy*drag+B.buoyancy*dt;
      p.x+=(p.vx+(wind?.dir.x??0)*(wind?.power??0)*B.wind)*dt;
      p.z+=(p.vz+(wind?.dir.y??0)*(wind?.power??0)*B.wind)*dt;p.y+=p.vy*dt;
      list[n++]=p;
    }
    list.length=this.n=n;this.points.visible=n>0;this.points.geometry.setDrawRange(0,n);
    if(!n)return;
    for(let i=0;i<n;i++){
      const p=list[i],t=p.age/p.life;this.pos.setXYZ(i,p.x,p.y,p.z);
      this.data.setXYZ(i,p.size*(B.grow[0]+(B.grow[1]-B.grow[0])*Math.sqrt(t)),p.alpha*smooth(0,B.fadeIn,t)*Math.pow(1-t,1.2),p.seed);
    }
    this.pos.needsUpdate=this.data.needsUpdate=true;
    for(const a of [this.pos,this.data]){a.clearUpdateRanges();a.addUpdateRange(0,n*3);}
  }
  dispose(){this.points.removeFromParent();this.points.geometry.dispose();this.points.material.dispose();}
}
