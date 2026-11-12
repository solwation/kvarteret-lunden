import * as THREE from 'three';

// Public #267: only the neutral roach loft/fins/eye recipe from original
// e76603a7f42c255b90020799ccfdd4258854d1ad (caughtfish.js/config.js), normalized
// as riverfishmodel.js in e300a2bd5136a43434d7042771651a3f5b17284c.
// Shape values are visual assumptions. One generic geometry, no species/game state.
const shape = {depth:.27,width:.12,peak:.6,ped:.3,top:.55,head:.23,tail:.17,fork:.55,spread:.11};
const back = new THREE.Color(0x34463f), side = new THREE.Color(0xc4c9c3), belly = new THREE.Color(0xf0efe8);
const smooth = (a,b,x) => {const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
const color = hex => new THREE.Color(hex);

/** Generic fish along +z, centred and exactly 1×1×1; instance matrices apply size once. */
export function riverFishGeometry() {
  const {depth,width,peak,ped,top,head,tail,fork,spread}=shape, around=12;
  const zt=-.5+tail,len=.5-zt;
  const swell=(u,p) => u<=peak ? p+(1-p)*Math.sin(u/peak*Math.PI/2) : Math.sqrt(Math.max(0,1-((u-peak)/(1-peak))**2));
  const rt=u=>depth*top*swell(u,ped),rb=u=>depth*(1-top)*swell(u,ped),hw=u=>width/2*swell(u,ped*.75),z=u=>zt+u*len;
  const at=(u,a)=>new THREE.Vector3(hw(u)*Math.cos(a),Math.sin(a)*(Math.sin(a)>=0?rt(u):rb(u)),z(u));
  const gill=1-head, gap=.45/15;
  const sections=[...Array.from({length:16},(_,k)=>k/15).filter(u=>u===0||u===1||Math.abs(gill-u)>gap),gill].sort((a,b)=>a-b);
  const positions=[],normals=[],colors=[],indices=[];
  const vert=(p,n,c)=>{const i=positions.length/3;positions.push(p.x,p.y,p.z);normals.push(n.x,n.y,n.z);colors.push(c.r,c.g,c.b);return i;};
  const flat=(pts,cols,tris)=>{
    const [a,b,c]=tris[0].map(i=>pts[i]),n=b.clone().sub(a).cross(c.clone().sub(a)).normalize(),base=positions.length/3;
    pts.forEach((p,i)=>vert(p,n,cols[i]));for(const t of tris)indices.push(...t.map(i=>base+i));
  };
  const body=[],bodyColors=[];
  for(const u of sections){if(u===1)continue;for(let j=0;j<around;j++){
    const a=j/around*Math.PI*2,sn=Math.sin(a),c=side.clone().lerp(back,smooth(.2,.85,sn)).lerp(belly,smooth(-.2,-.75,sn));
    if(Math.abs(u-gill)<1e-6&&sn>-.75&&sn<.85)c.multiplyScalar(.62);
    body.push(at(u,a));bodyColors.push(c);
  }}
  const rows=sections.length-1,nose=body.length,tailCentre=nose+1;
  body.push(new THREE.Vector3(0,0,.5),new THREE.Vector3(0,0,zt));bodyColors.push(color(0x2a2018),bodyColors[around/2].clone());
  const bodyIndex=[];
  for(let k=0;k<rows-1;k++)for(let j=0;j<around;j++){
    const a=k*around+j,b=k*around+(j+1)%around,c=a+around,d=b+around;bodyIndex.push(a,b,c,b,d,c);
  }
  for(let j=0;j<around;j++)bodyIndex.push((rows-1)*around+j,(rows-1)*around+(j+1)%around,nose,(j+1)%around,j,tailCentre);
  const bodyGeometry=new THREE.BufferGeometry().setFromPoints(body);bodyGeometry.setIndex(bodyIndex);bodyGeometry.computeVertexNormals();
  body.forEach((p,i)=>vert(p,new THREE.Vector3().fromBufferAttribute(bodyGeometry.attributes.normal,i),bodyColors[i]));indices.push(...bodyIndex);bodyGeometry.dispose();
  const mix=(hex,t)=>back.clone().lerp(color(hex),t);
  const strip=([u0,u1,h1,h0],up,hex)=>{
    const pts=[],cols=[],tris=[];
    for(let i=0;i<=2;i++){
      const u=u1+(u0-u1)*i/2,h=h1+(h0-h1)*i/2,b=new THREE.Vector3(0,(up>0?rt(u):-rb(u))*.9,z(u));
      pts.push(b,b.clone().add(new THREE.Vector3(0,up*h,-h*.35)));cols.push(mix(hex,.55),color(hex).multiplyScalar(.85));
      if(i)tris.push([2*i-2,2*i,2*i-1],[2*i,2*i+1,2*i-1]);
    }flat(pts,cols,tris);
  };
  const tailColor=color(0x8c5a48);
  flat([new THREE.Vector3(0,rt(0)*.95,zt+.012),new THREE.Vector3(0,spread,-.5),new THREE.Vector3(0,0,-.5+tail*fork),new THREE.Vector3(0,-rb(0)*.95,zt+.012),new THREE.Vector3(0,-spread,-.5)],
    [mix(0x8c5a48,.5),tailColor.clone().multiplyScalar(.8),tailColor,mix(0x8c5a48,.5),tailColor.clone().multiplyScalar(.8)],[[0,2,1],[0,3,2],[3,4,2]]);
  strip([.5,.64,.13,.04],1,0x7a5a4c);strip([.22,.34,.08,.03],-1,0xc8462a);
  const paired=(u,size,a,dir,along)=>{for(const sx of [1,-1]){
    const ang=sx>0?a:Math.PI-a,du=size*.22/len,da=.35*sx;
    const pf=along?at(u+du,ang):at(u,ang+da),pb=along?at(u-du,ang):at(u,ang-da);
    const d=new THREE.Vector3(dir[0]*sx,dir[1],dir[2]).normalize().multiplyScalar(size);pf.x*=.94;pb.x*=.94;
    flat([pf,pb,pb.clone().add(d),pf.clone().addScaledVector(d,.75)],[mix(0xc8462a,.6),mix(0xc8462a,.6),color(0xc8462a),color(0xc8462a)],[[0,1,2],[0,2,3]]);
  }};
  paired(.74,.08,-.4,[.3,-.2,-1],false);paired(.5,.07,-1.35,[.15,-.7,-1],true);
  // Eyes lie on the head surface; iris rings/pupils are geometry, no textures.
  for(const sx of [1,-1]){
    const a=sx>0?.4:Math.PI-.4,p=at(.9,a),du=at(.91,a).sub(at(.89,a)),da=at(.9,a+.05).sub(at(.9,a-.05)),n=da.cross(du).normalize();
    if(n.dot(new THREE.Vector3(p.x,p.y,0))<0)n.negate();p.addScaledVector(n,.003);
    const e1=new THREE.Vector3(0,0,1).addScaledVector(n,-n.z).normalize(),e2=new THREE.Vector3().crossVectors(n,e1),pts=[p],tris=[];
    for(const r of [.016,.032])for(let i=0;i<5;i++){const t=i/5*Math.PI*2;pts.push(p.clone().addScaledVector(e1,Math.cos(t)*r).addScaledVector(e2,Math.sin(t)*r));}
    for(let i=0;i<5;i++){const a0=1+i,a1=1+(i+1)%5;tris.push([0,a0,a1],[a0,a0+5,a1+5],[a0,a1+5,a1]);}
    flat(pts,pts.map((_,i)=>color(i<=5?0x0c0c0c:0xd0261a)),tris);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setIndex(indices);
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors.map((_,i)=>{const k=i-i%3;return Math.min(1,Math.sqrt(colors[k]*.2126+colors[k+1]*.7152+colors[k+2]*.0722));}),3));
  geometry.computeBoundingBox();const size=geometry.boundingBox.getSize(new THREE.Vector3()),center=geometry.boundingBox.getCenter(new THREE.Vector3());
  geometry.translate(-center.x,-center.y,-center.z);geometry.scale(1/size.x,1/size.y,1/size.z);
  geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}
