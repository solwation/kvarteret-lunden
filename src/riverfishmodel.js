import * as THREE from 'three';
import {publicFishSurface} from './riverfishsurface.js';
import {RIVER_FISH as C,RIVER_FISH_SURFACE as F} from './config.js';

// Public #274, selective neutral forms from original 8743e7d07e6a2e6b743710f27bd06d6027bd287d.
// Instance matrices remain the only authority for final width, height and length.
export function riverFishNeutralGeometry(name=C.species[0].name){
 const g=publicFishSurface(name),size=g.boundingBox.getSize(new THREE.Vector3()),center=g.boundingBox.getCenter(new THREE.Vector3());
 g.translate(-center.x,-center.y,-center.z);g.scale(1/size.x,1/size.y,1/size.z);g.computeBoundingBox();g.computeBoundingSphere();return g;
}
const oct=n=>{
 const inv=1/(Math.abs(n.x)+Math.abs(n.y)+Math.abs(n.z)||1);let x=n.x*inv,y=n.y*inv;
 if(n.z<0){const old=x;x=(1-Math.abs(y))*Math.sign(old||1);y=(1-Math.abs(old))*Math.sign(y||1)}return[x,y];
};
export function riverFishGeometry(){
 // Only the base and five quantized targets survive construction; six full sources do not remain cached.
 const sources=C.species.map(s=>riverFishNeutralGeometry(s.name)),g=sources[0],count=g.attributes.position.count,v=new THREE.Vector3();
 const baseNormal=new Int8Array(count*2),grey=new Uint8Array(count*3),col=g.attributes.color;
 for(let i=0;i<count;i++){
  baseNormal.set(oct(v.fromBufferAttribute(g.attributes.normal,i)).map(x=>Math.round(x*127)),i*2);
  const lum=Math.min(1,Math.sqrt(col.getX(i)*.2126+col.getY(i)*.7152+col.getZ(i)*.0722));grey.fill(Math.round(lum*255),i*3,i*3+3);
 }
 g.setAttribute('fishOct',new THREE.Int8BufferAttribute(baseNormal,2,true));g.setAttribute('color',new THREE.Uint8BufferAttribute(grey,3,true));
 for(let kind=1;kind<C.species.length;kind++){
  const source=sources[kind],packed=new Uint16Array(count*4);
  if(source.attributes.position.count!==count||!source.index.array.every((x,i)=>x===g.index.array[i]))throw Error('Public fish topology mismatch');
  for(let i=0;i<count;i++){
   const p=v.fromBufferAttribute(source.attributes.position,i);packed.set(p.toArray().map(x=>Math.round((x+.5)*65535)),i*4);
   const n=oct(v.fromBufferAttribute(source.attributes.normal,i)).map(x=>Math.round((x*.5+.5)*255));packed[i*4+3]=n[0]+256*n[1];
  }
  g.setAttribute('fishForm'+kind,new THREE.Uint16BufferAttribute(packed,4));source.dispose();
 }
 g.deleteAttribute('normal');return g;
}
export const fishVisualPhase=t=>(t*F.flex.frequency)%(2*Math.PI);
/** Retains the public material/opacity/single-pass policy; only local form and its flex normal change. */
export function fishSpeciesMaterial(material){
 const time={value:0};material.userData.fishTime=time;
 material.onBeforeCompile=shader=>{
  shader.uniforms.publicFishTime=time;
  shader.vertexShader=`attribute vec2 fishKind,fishOct;
attribute vec4 fishForm1,fishForm2,fishForm3,fishForm4,fishForm5;
uniform float publicFishTime;
vec3 publicFishNormal(vec2 p){vec3 n=vec3(p,1.-abs(p.x)-abs(p.y));if(n.z<0.)n.xy=(1.-abs(n.yx))*sign(n.xy+vec2(.000001));return normalize(n);}
vec4 publicFishForm(){if(fishKind.x<1.5)return fishForm1;if(fishKind.x<2.5)return fishForm2;if(fishKind.x<3.5)return fishForm3;if(fishKind.x<4.5)return fishForm4;return fishForm5;}
`+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`vec4 selectedForm=publicFishForm();
float bits=floor(selectedForm.w+.5);
vec2 selectedOct=fishKind.x<.5?fishOct:vec2(mod(bits,256.),floor(bits/256.))/255.*2.-1.;
vec3 fishLocal=fishKind.x<.5?position:selectedForm.xyz/65535.-.5;
float tail=clamp(.5-fishLocal.z,0.,1.);
float amplitude=fishKind.x>4.5?${F.flex.eel.toFixed(8)}:${F.flex.amplitude.toFixed(8)};
float angle=publicFishTime+fishKind.y-tail*${F.flex.waves.toFixed(8)};
float slope=amplitude*(-2.*tail*sin(angle)+tail*tail*${F.flex.waves.toFixed(8)}*cos(angle));
vec3 objectNormal=publicFishNormal(selectedOct);objectNormal.z-=slope*objectNormal.x;`);
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`vec3 transformed=fishLocal;
transformed.x+=amplitude*tail*tail*sin(angle);`);
 };
 material.customProgramCacheKey=()=> 'public-fish-274';return material;
}
