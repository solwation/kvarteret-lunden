// #135: immutable, local outdoor support from the actual emitted Float32 faces.
// No render objects or scene rays are retained/read during walking.
export class WalkSupport {
  constructor(core, grid) {
    this.core = core;
    const below=(a,v)=>a.filter(x=>x<v).at(-1)??v, above=(a,v)=>a.find(x=>x>v)??v;
    this.outer={x0:below(grid.X,core.x0),x1:above(grid.X,core.x1),z0:below(grid.Z,core.z0),z1:above(grid.Z,core.z1)};
    // Bucket spacing comes from the existing emitted terrain cells, including
    // their actual local subdivisions; wall-collision buckets are too coarse.
    const X=new Set([this.outer.x0,this.outer.x1]),Z=new Set([this.outer.z0,this.outer.z1]);
    for(let j=0;j<grid.Z.length-1;j++)for(let i=0;i<grid.X.length-1;i++){
      if(grid.X[i+1]<this.outer.x0||grid.X[i]>this.outer.x1||grid.Z[j+1]<this.outer.z0||grid.Z[j]>this.outer.z1)continue;
      const n=grid.refined?.(i,j)??1;
      for(let k=0;k<=n;k++){X.add(grid.X[i]+(grid.X[i+1]-grid.X[i])*k/n);Z.add(grid.Z[j]+(grid.Z[j+1]-grid.Z[j])*k/n);}
    }
    this.X=[...X].sort((a,b)=>a-b);this.Z=[...Z].sort((a,b)=>a-b);
    this.buckets=new Map();this.triangles=0;
  }
  cell(axis,value) {let lo=0,hi=axis.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(axis[m]<=value)lo=m;else hi=m;}return lo;}
  add(geometry, accept=()=>true) {
    const p=geometry.attributes.position,index=geometry.index;
    for(let k=0;k<(index?.count??p.count);k+=3){
      const ids=[0,1,2].map(i=>index?index.getX(k+i):k+i);if(!accept(ids[0]))continue;
      const [a,b,c]=ids.map(i=>[p.getX(i),p.getY(i),p.getZ(i)]),dx=b[0]-a[0],dz=b[2]-a[2],ex=c[0]-a[0],ez=c[2]-a[2],det=dx*ez-ex*dz;
      if(det>=-1e-12)continue; // only upward-facing support, never walls or box undersides
      const x0=Math.min(a[0],b[0],c[0]),x1=Math.max(a[0],b[0],c[0]),z0=Math.min(a[2],b[2],c[2]),z1=Math.max(a[2],b[2],c[2]),o=this.outer;
      if(x1<o.x0||x0>o.x1||z1<o.z0||z0>o.z1)continue;
      const face={a,dx,dz,ex,ez,det,dy:b[1]-a[1],ey:c[1]-a[1],x0,x1,z0,z1};this.triangles++;
      for(let z=this.cell(this.Z,Math.max(z0,o.z0));z<=this.cell(this.Z,Math.min(z1,o.z1));z++)for(let x=this.cell(this.X,Math.max(x0,o.x0));x<=this.cell(this.X,Math.min(x1,o.x1));x++){
        const key=`${x},${z}`;if(!this.buckets.has(key))this.buckets.set(key,[]);this.buckets.get(key).push(face);
      }
    }
    return this;
  }
  weight(x,z) {
    const c=this.core,o=this.outer,smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
    return smooth((x-o.x0)/(c.x0-o.x0))*smooth((o.x1-x)/(o.x1-c.x1))*smooth((z-o.z0)/(c.z0-o.z0))*smooth((o.z1-z)/(o.z1-c.z1));
  }
  top(x,z,gradient=false) {
    if(!this.weight(x,z))return null;
    let top=-Infinity,slope=null;
    for(const f of this.buckets.get(`${this.cell(this.X,x)},${this.cell(this.Z,z)}`)??[]){
      if(x<f.x0-1e-9||x>f.x1+1e-9||z<f.z0-1e-9||z>f.z1+1e-9)continue;
      const dx=x-f.a[0],dz=z-f.a[2],u=(dx*f.ez-dz*f.ex)/f.det,v=(f.dx*dz-f.dz*dx)/f.det;
      if(u>=-1e-9&&v>=-1e-9&&u+v<=1+1e-9){
        const y=f.a[1]+u*f.dy+v*f.ey;
        if(y>top){top=y;slope=Math.hypot((f.dy*f.ez-f.ey*f.dz)/f.det,(f.dx*f.ey-f.ex*f.dy)/f.det);}
      }
    }
    return Number.isFinite(top)?gradient?slope:top:null;
  }
  height(x,z,original) {
    const top=this.top(x,z);return top===null?original:original+(top-original)*this.weight(x,z);
  }
}
