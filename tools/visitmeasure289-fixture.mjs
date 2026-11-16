// The driver appends verbatim public measurement/filter functions from src/main.js; no original measurement module.
import * as THREE from 'three';
import {VisitUnit} from '../src/visitunit.js';
import {updateInstanceLods} from '../src/lod.js';
const $=id=>document.getElementById(id),scene=new THREE.Scene(),root=new THREE.Group();scene.add(root);scene.background=new THREE.Color(0xe4ebe8);
const camera=new THREE.PerspectiveCamera(35,1.8,.05,100),renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(900,500);document.body.append(renderer.domElement);
const mat=new THREE.MeshStandardMaterial({color:0x809b85}),shell=new THREE.MeshStandardMaterial({color:0xcfd5d9});
const fitting=new THREE.Mesh(new THREE.BoxGeometry(2,2,1),mat);fitting.position.set(0,1.4,2);root.add(fitting);
const back=new THREE.Mesh(new THREE.BoxGeometry(6,4,.2),shell);back.position.set(0,2,5);root.add(back);
const outline=new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1,1.4,.7),new THREE.Vector3(1,1.4,.7)]),new THREE.LineBasicMaterial({color:0x284237}));root.add(outline);
const leaf={t:0,object:new THREE.Group()};root.add(leaf.object);
const unit=new VisitUnit({id:'fixture',ox:0,object:root,levels:[{floor:0,top:4,rect:{x0:-3,x1:3,z0:0,z1:6}}],built:[{segments:[],wallSegments:[]}],doors:[],lids:[leaf],roomMaps:[],stair:{},shell:[shell]});unit.buildMid();
const floor=new THREE.Mesh(new THREE.PlaneGeometry(16,24),new THREE.MeshStandardMaterial({color:0xd7c9ad}));floor.rotation.x=-Math.PI/2;floor.position.y=-.02;scene.add(floor);
scene.add(new THREE.HemisphereLight(0xffffff,0x778c8e,2));const light=new THREE.DirectionalLight(0xfff1d8,3);light.position.set(3,6,-7);scene.add(light);
const review=new THREE.PerspectiveCamera(40,1.8,.05,100);review.position.set(6,4,-8);review.lookAt(0,1.4,2.5);
const world={object:root},core={object:new THREE.Group()},garage={object:new THREE.Group()},points=new THREE.Group();scene.add(points);
let measuring=false,firstPoint=null;const ray=new THREE.Raycaster(),centre=new THREE.Vector2();
const mid=unit.mid.group.children.find(m=>m.isMesh),native=mid.raycast;
const at=(d,away=false)=>{camera.position.set(0,1.4,-d);camera.lookAt(0,1.4,2);camera.updateMatrixWorld(true);unit.cull(camera.position,away);updateInstanceLods(camera);root.updateMatrixWorld(true);};
const pick=x=>{const p=new THREE.Vector3(x,1.4,1.5).project(camera);measureAt({clientX:(p.x+1)*innerWidth/2,clientY:(1-p.y)*innerHeight/2});};
const render=()=>{renderer.info.reset();renderer.render(scene,review);return{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles}};
window.__vm={unit,mid,native,fitting,leaf,mode(before=false){mid.raycast=before?()=>{}:native;at(14);if(!measuring)setMeasure();else clearMeasurement();pick(-.5);pick(.5);$('title').textContent=before?'Före: publika mätpunkter på bakväggen bakom synlig inredning':'Efter: publika mätpunkter på den synliga inredningens framsida';return{points:points.children.filter(o=>o.isMesh).map(m=>m.position.toArray()),label:$('measurement').textContent,level:unit.shown,originalVisible:fitting.visible,...render()};},pickAt(d,away=false){at(d,away);clearMeasurement();pick(0);return{points:points.children.filter(o=>o.isMesh).map(m=>m.position.toArray()),level:unit.shown};},lines(){return unit.mid.group.children.filter(m=>m.isLineSegments).every(m=>m.raycast!==THREE.LineSegments.prototype.raycast)}};
// EXACT_PRODUCTION_FUNCTIONS are appended by the local browser driver's route, unmodified.
