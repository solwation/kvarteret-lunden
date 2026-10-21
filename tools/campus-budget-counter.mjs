// Full east-backdrop asset scope, including nested clock meshes and live instance counts.
// This is an asset regression counter, not a frame-time or device-performance estimate.
export function campusBudget(root) {
  if(!root?.traverse)throw new TypeError('campus root with traverse required');
  const meshes=[];
  root.traverse(object=>{
    if(!object.isMesh)return;
    const geometry=object.geometry,vertices=geometry.index?.count??geometry.attributes.position?.count;
    const instances=object.isInstancedMesh?object.count:1;
    if(!Number.isFinite(vertices)||!Number.isFinite(instances)||instances<0)throw new TypeError('invalid campus mesh count');
    meshes.push({name:object.name,triangles:vertices/3*instances,instances});
  });
  return {triangles:meshes.reduce((sum,m)=>sum+m.triangles,0),meshes};
}
