import {chromium} from 'playwright';
import assert from 'node:assert/strict';

// Check the source modules against the actual rendered scene; the static bundle is checked separately.
const base=process.argv[2]??'http://localhost:8157';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true,args:['--no-sandbox','--enable-unsafe-swiftshader']});
try {
  const page=await browser.newPage({viewport:{width:1053,height:513}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);
  await page.waitForFunction(()=>window.lundenViewer?.renderer.info.render.frame>0,null,{timeout:120000});
  const result=await page.evaluate(async()=>{
    const T=await import('three');
    const {SITE}=await import('/src/config.js');
    const {renderedTerrainY,groundY}=await import('/src/surroundings.js');
    const {parkRampFill,parkRampEnds,parkFillAt}=await import('/src/riverpark.js');
    const a=window.lundenViewer,terrain=a.scene.getObjectByName('site-terrain');
    const old=parkRampFill(),closed=parkRampFill(renderedTerrainY),topCount=old.attributes.position.count;
    const topExact=['position','normal'].every(name=>old.attributes[name].array.every((value,i)=>value===closed.attributes[name].array[i]));
    const p=closed.attributes.position;let seam=0,sideVertices=0;
    for(let i=topCount;i<p.count;i+=6){
      sideVertices+=6;
      const x0=p.getX(i+1),z0=p.getZ(i+1),x1=p.getX(i+5),z1=p.getZ(i+5);
      for(const [x,y,z] of [[x0,p.getY(i+1),z0],[x1,p.getY(i+5),z1],[(x0+x1)/2,(p.getY(i+1)+p.getY(i+5))/2,(z0+z1)/2]])
        seam=Math.max(seam,Math.abs(y-renderedTerrainY(x,z)));
    }
    a.scene.updateMatrixWorld(true);
    const ends=parkRampEnds(),r=SITE.riverPark.woodBridge.ramp;
    let exposed=0,hitCount=0;
    for(const e of ends)for(const s of [0,2])for(const sign of [-1,1]){
      const x=e.x+e.dx*s-e.dz*sign*r.reach,z=e.z+e.dz*s+e.dx*sign*r.reach;
      const top=parkFillAt(x,z)-.01,bottom=renderedTerrainY(x,z);
      if(top-bottom<.15)continue;
      exposed++;
      const origin=new T.Vector3(x-e.dz*sign*.3,(top+bottom)/2,z+e.dx*sign*.3),direction=new T.Vector3(e.dz*sign,0,-e.dx*sign);
      const hit=new T.Raycaster(origin,direction,.01,.6).intersectObject(terrain)[0];
      if(hit&&Math.abs(hit.distance-.3)<.04)hitCount++;
    }
    const b=SITE.riverPark.woodBridge,[[ax,az],[bx,bz]]=b.ends,x=(ax+bx)/2,z=(az+bz)/2;
    const hit=new T.Raycaster(new T.Vector3(x,b.deckY-.4,z),new T.Vector3(0,-1,0),.01,10).intersectObjects(a.scene.children,true).find(h=>h.object.isMesh&&!h.object.material.transparent);
    const budget={terrainTriangles:terrain.geometry.index.count/3,terrainMeshes:a.scene.getObjectsByProperty('name','site-terrain').length,terrainMaterials:Array.isArray(terrain.material)?terrain.material.length:1,sideTriangles:sideVertices/3,indexType:terrain.geometry.index.array.constructor.name};
    old.dispose();closed.dispose();
    return {topExact,seam,exposed,hitCount,water:hit?.object.name,deckGround:groundY(x,z),deckY:b.deckY,budget};
  });
  console.log(JSON.stringify({result,errors},null,2));
  assert.deepEqual(errors,[]);
  assert(result.topExact&&result.budget.sideTriangles>0,'top positions and normals must be unchanged');
  assert(result.seam<.0001,`ramp lower edge follows rendered triangles: ${result.seam}`);
  assert(result.exposed===8&&result.hitCount===result.exposed,'both outward bank sides must catch actual mesh rays');
  assert.equal(result.water,'bridges-water');
  assert.equal(result.deckGround,result.deckY);
  assert.equal(result.budget.terrainMeshes,1);
  assert.equal(result.budget.terrainMaterials,1);
} finally { await browser.close(); }
