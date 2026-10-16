import * as THREE from 'three';
import { buildWorld } from './world.js';
import { Navigation } from './navigation.js';
import { fetchStartupJSON } from './startup.js';
import { VERSION, takeResume, watchUpdates } from './updates.js';
import { installPlaceShortcuts } from './place-shortcuts.js';
import { Garage } from './garage.js';
import { Core } from './core.js';
import { CoreHouse } from './corehouse.js';
import { CORE_A, CORE_B, CORE_C, CORE, GARAGE, LEVELS } from './config.js';

const $ = id => document.getElementById(id);
const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
document.body.classList.toggle('touch', touch);
let renderer, camera, scene, world, navigation, core, garage;
let active = false, ready = false, focus = null, measuring = false, firstPoint = null;
const ray = new THREE.Raycaster(), centre = new THREE.Vector2();
const points = new THREE.Group();
const clock = new THREE.Clock();
const locations = {
  area: { name: 'Området', x: 2.875, y: 0, z: -12, yaw: Math.PI },
  home: { name: 'L1007 · Entréplan', x: 2.8, y: 0, z: 1.4, yaw: Math.PI },
  courtyard: { name: 'Innergården', x: 9, y: 0, z: 21, yaw: .8 },
  core: { name: 'Trapphuset', x: (CORE.x0 + CORE.x1) / 2, y: 0, z: CORE.south[1] - 1, yaw: 0 },
  garage: { name: 'Garaget', x: 0, y: GARAGE.floor, z: 0, yaw: Math.PI },
};

// Destinations removed from the menu, mapped to their replacement for a resumed older view.
const LEGACY_PLACES = {l1202: 'l1201'};

function status(text) { $('load-status').textContent = text; }
function look(dx, dy) {
  camera.rotation.y -= dx * .0026;
  camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - dy * .0026, -1.35, 1.35);
}
function moveTo(name) {
  const p = locations[name];
  if (!p || !navigation) return;
  navigation.keys.clear(); navigation.analog.x = navigation.analog.y = 0;
  navigation.teleport(p.x, p.y, p.z);
  camera.rotation.set(0, p.yaw, 0, 'YXZ');
  $('place').textContent = p.name;
  const label = placeLabels.get(name) ?? p.name;
  $('place-current').textContent = label;
  $('place-toggle').setAttribute('aria-label', `Välj område: ${label}`);
  closePlaceMenu(document.querySelector('.locations').classList.contains('open'));
  document.querySelectorAll('[data-place]').forEach(b => {
    b.classList.toggle('selected', b.dataset.place === name);
    if (b.dataset.place === name) b.scrollIntoView({block:'nearest', inline:'nearest'});
  });
}
function release() {
  navigation?.keys.clear();
  if (navigation) navigation.analog.x = navigation.analog.y = 0;
  if (document.pointerLockElement) document.exitPointerLock();
}
function requestLook() {
  if (!touch && active && !$('help-dialog').open) renderer.domElement.requestPointerLock?.();
}
function visible(object) {
  for (let p = object.parent; p; p = p.parent) if (!p.visible) return false;
  return true;
}
function aimed() {
  ray.setFromCamera(centre, camera);
  ray.far = 3;
  const targets = [...world.doors, ...world.lids, ...world.units.flatMap(u => u.targets ?? []), ...(core.targets ?? []), ...(garage.targets ?? [])];
  const hit = ray.intersectObjects(targets.map(t => t.pickable).filter(Boolean), true).find(h => visible(h.object));
  if (!hit) return null;
  // Reject a target hidden behind the first architectural surface.
  const obstruction = ray.intersectObject(world.object, true).find(h => visible(h.object) && h.object.visible && !h.object.isLineSegments && h.object.material?.opacity !== 0);
  if (obstruction && obstruction.distance < hit.distance - .15) return null;
  let p = hit.object;
  while (p) { if (p.userData.door) return p.userData.door; p = p.parent; }
  return targets.find(t => t.pickable === hit.object || t.pickable?.getObjectById(hit.object.id));
}
function use() {
  focus = aimed();
  if (focus?.toggle) focus.toggle();
  else if (focus?.use) focus.use(navigation);
  else if (focus?.press) focus.press();
}
function clearMeasurement() {
  for (const child of [...points.children]) { child.geometry?.dispose(); child.material?.dispose(); points.remove(child); }
  firstPoint = null;
}
function measureAt(event) {
  if (!measuring) return;
  if (event && document.pointerLockElement !== renderer.domElement) {
    centre.set(event.clientX / innerWidth * 2 - 1, 1 - event.clientY / innerHeight * 2);
  } else centre.set(0, 0);
  ray.setFromCamera(centre, camera); ray.far = 100;
  const hit = ray.intersectObjects([world.object, core.object, garage.object], true).find(h => h.object.isMesh && h.object.visible && visible(h.object) && h.object.material?.opacity !== 0);
  centre.set(0, 0);
  if (!hit) return;
  if (points.children.length > 2) clearMeasurement();
  const p = hit.point.clone();
  const marker = new THREE.Mesh(new THREE.SphereGeometry(.035, 10, 8), new THREE.MeshBasicMaterial({color: 0xd6783b, depthTest: false}));
  marker.position.copy(p); marker.renderOrder = 100; points.add(marker);
  if (!firstPoint) { firstPoint = p; $('measurement').textContent = 'Välj den andra punkten på en yta.'; }
  else {
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([firstPoint,p]), new THREE.LineBasicMaterial({color: 0xd6783b, depthTest: false}));
    line.renderOrder = 100; points.add(line);
    $('measurement').textContent = `${firstPoint.distanceTo(p).toLocaleString('sv-SE', {maximumFractionDigits: 2})} m · Ungefärligt modellmått. Välj två nya punkter för att mäta igen.`;
  }
}
function setMeasure() {
  measuring = !measuring; clearMeasurement(); $('measure').setAttribute('aria-pressed', String(measuring));
  $('measurement').hidden = !measuring;
  $('measurement').textContent = 'Välj två punkter på ytor i bilden.';
}
function fit() {
  if (!renderer) return;
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
}

async function init() {
  renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  $('viewer').append(renderer.domElement);
  camera = new THREE.PerspectiveCamera(65, 1, .06, 700); camera.rotation.order = 'YXZ';
  scene = new THREE.Scene(); scene.background = new THREE.Color(0xcbd9dd); scene.fog = new THREE.Fog(0xcbd9dd, 200, 650);
  scene.add(new THREE.HemisphereLight(0xf1f7ff, 0xabb69a, 2.6), new THREE.AmbientLight(0xfff5e7, 1.3));
  const sunlight = new THREE.DirectionalLight(0xffefd8, 2.6); sunlight.position.set(-20,50,25); scene.add(sunlight);
  const fill = new THREE.DirectionalLight(0xe2edff, .8); fill.position.set(10,15,-20); scene.add(fill);
  fit();
  await new Promise(requestAnimationFrame);
  const plan = await fetchStartupJSON(`./data/plan.json${VERSION ? '?v=' + VERSION : ''}`, { timeout: 15000 });
  status('Förbereder byggnader och rum…');
  await new Promise(requestAnimationFrame);
  world = buildWorld(plan); scene.add(world.object);
  status('Förbereder trapphus och garage…');
  await new Promise(requestAnimationFrame);
  garage = world.garage = new Garage();
  for (const o of [garage.object, garage.blackout, garage.door?.object, garage.parkObject]) if (o) scene.add(o);
  core = world.core = new Core();
  world.coreHouses = [CORE_A, CORE_B, CORE_C].map(c => core.attach(new CoreHouse(c)));
  scene.add(core.object, points);
  const lobby = GARAGE.rects.find(r => r.id === 'hallE');
  if (lobby && lobby.x0 !== undefined) Object.assign(locations.garage, {x:(lobby.x0+lobby.x1)/2,z:(lobby.z0+lobby.z1)/2});
  else Object.assign(locations.garage,{x:(CORE.x0+CORE.x1)/2,z:CORE.south[0]-1});
  // Use each modeled apartment's own placement rather than a duplicate global offset.
  const l1004 = world.units.find(unit => unit.id === 'L1004');
  if (l1004) locations.l1004 = {name:'L1004 · Entréplan', x:l1004.ox + 2.8, y:l1004.bottom, z:l1004.oz + 1.4, yaw:Math.PI};
  // L1201 has a modeled interior entered from the loftgång; start free in its entrance hall, inside the front door,
  // looking south-east past the hall towards the kitchen.
  const l1201 = world.units.find(unit => unit.id === 'L1201');
  if (l1201) locations.l1201 = {name:'L1201 · Entréplan', x:l1201.ox + 1.5, y:l1201.bottom, z:l1201.oz + 1.0, yaw:Math.PI + .6};
  navigation = new Navigation(world, camera);
  moveTo('area');
  const resumed = takeResume();
  if (resumed) {
    // An older version's L1202 entrance destination was replaced by L1201: resume at L1201's entrance hall instead.
    const legacy = LEGACY_PLACES[resumed.place];
    if (legacy && locations[legacy]) moveTo(legacy);
    else {
      if (locations[resumed.place]) moveTo(resumed.place);
      navigation.teleport(...resumed.position);
      camera.rotation.set(resumed.pitch, resumed.yaw, 0, 'YXZ');
    }
    active = resumed.active === true;
    $('intro').hidden = active;
    $('resume').hidden = !active || touch;
  }
  world.windowLights?.update(12, 0, true);
  ready = true;
  $('place-toggle').disabled = false;
  // Keep model access local for diagnostics, without a service connection.
  window.lundenViewer = {world, navigation, camera, renderer, scene, moveTo, locations};
  $('start').disabled = false; $('start').textContent = 'Börja utforska →';
  status('Dator och mobil · Ingen inloggning');
  renderer.setAnimationLoop(frame);
  watchUpdates({
    snapshot: () => ({position:navigation.pos.toArray(), yaw:camera.rotation.y, pitch:camera.rotation.x, active, place:document.querySelector('[data-place].selected')?.dataset.place}),
    busy: () => measuring || $('help-dialog').open || document.querySelector('.locations').classList.contains('open') || navigation.keys.size > 0 || Math.abs(navigation.analog.x) + Math.abs(navigation.analog.y) > 0 || lookPointer !== null,
    notice: text => { $('update-status').hidden = false; $('update-status').textContent = text; },
  });
}
function frame() {
  const dt = Math.min(clock.getDelta(), .05);
  if (active && !$('help-dialog').open) navigation.update(dt);
  // The public walkthrough has no time controls; the tower follows the visitor's local clock.
  const now = new Date(), hour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  for (const clock of world.clocks) clock.update(hour);
  core.update(dt, navigation, camera);
  garage.update(dt, navigation, camera);
  scene.updateMatrixWorld();
  if (active) {
    focus = aimed();
    const label = focus ? `${focus.press ? (focus.verb ?? 'Tryck på') : focus.isOpen ? 'Stäng' : 'Öppna'} ${focus.name ?? 'dörren'}` : '';
    $('prompt').textContent = touch || measuring ? '' : label ? `Klicka eller E · ${label}` : '';
    $('action').hidden = !touch || !focus || measuring;
    $('action').textContent = label;
    const visited = world.unitAt(navigation.pos.x, navigation.pos.z, navigation.pos.y);
    if (visited) {
      const level = visited.levelAt(navigation.pos.y);
      $('place').textContent = `${visited.id} · ${visited.roomAt(level, navigation.pos.x, navigation.pos.z) ?? visited.levels[level].name}`;
    }
    const own = navigation.pos.x > 0 && navigation.pos.x < world.size.x && navigation.pos.z > 0 && navigation.pos.z < world.size.z;
    if (own) {
      const lv = navigation.pos.y > LEVELS[1].floor - .3 ? 1 : 0;
      $('place').textContent = `L1007 · ${world.roomAt(lv,navigation.pos.x,navigation.pos.z) ?? (lv ? 'Övre plan':'Entréplan')}`;
    }
  }
  renderer.render(scene,camera);
}
$('start').addEventListener('click', () => {
  if (!ready) return;
  $('intro').hidden = true; active = true; requestLook();
});
$('help').addEventListener('click', () => { release(); $('help-dialog').showModal(); });
$('close-help').addEventListener('click', () => $('help-dialog').close());
$('resume').addEventListener('click', requestLook);
$('measure').addEventListener('click', setMeasure);
$('action').addEventListener('click', use);
document.querySelectorAll('[data-place]').forEach(b => b.addEventListener('click', () => { if (ready) moveTo(b.dataset.place); }));
// The compact disclosure and desktop row share the same destination buttons.
const placeButtons = [...document.querySelectorAll('[data-place]')];
const placeLabels = new Map(placeButtons.map(button => [button.dataset.place, button.textContent.trim()]));
const placeNav = document.querySelector('.locations');
const compactPlaces = matchMedia('(max-width:960px)');
function closePlaceMenu(focus = false) {
  placeNav.classList.remove('open');
  $('place-toggle').setAttribute('aria-expanded', 'false');
  if (focus && compactPlaces.matches) $('place-toggle').focus({preventScroll:true});
}
function openPlaceMenu() {
  if (!ready || !compactPlaces.matches) return;
  release();
  placeNav.classList.add('open');
  $('place-toggle').setAttribute('aria-expanded', 'true');
}
$('place-toggle').addEventListener('click', () => {
  if (placeNav.classList.contains('open')) closePlaceMenu(); else openPlaceMenu();
});
placeNav.addEventListener('keydown', event => {
  if (!compactPlaces.matches || !['ArrowDown','ArrowUp','Home','End'].includes(event.code)) return;
  event.preventDefault(); event.stopPropagation();
  openPlaceMenu();
  const current = placeButtons.indexOf(document.activeElement);
  const index = event.code === 'Home' ? 0 : event.code === 'End' ? placeButtons.length - 1
    : event.code === 'ArrowUp' ? (current < 0 ? placeButtons.length - 1 : (current - 1 + placeButtons.length) % placeButtons.length)
    : (current + 1) % placeButtons.length;
  placeButtons[index].focus({preventScroll:true});
});
document.addEventListener('keydown', event => {
  if (event.code === 'Escape' && placeNav.classList.contains('open')) {
    event.preventDefault(); event.stopImmediatePropagation(); closePlaceMenu(true);
  }
}, true);
document.addEventListener('pointerdown', event => {
  if (!placeNav.classList.contains('open') || placeNav.contains(event.target)) return;
  // Dismissing over the scene must not also interact with or measure the model.
  const overScene = $('viewer').contains(event.target);
  closePlaceMenu(overScene);
  if (overScene) { event.preventDefault(); event.stopPropagation(); }
}, true);
placeNav.addEventListener('focusout', event => {
  if (event.relatedTarget && !placeNav.contains(event.relatedTarget)) closePlaceMenu();
});
compactPlaces.addEventListener('change', () => closePlaceMenu());
installPlaceShortcuts({buttons:placeButtons, canNavigate:() => ready && active, moveTo});
addEventListener('resize', () => { fit(); closePlaceMenu(); });
addEventListener('blur', release);
document.addEventListener('visibilitychange', () => { if (document.hidden) release(); });
document.addEventListener('pointerlockchange', () => {
  navigation?.keys.clear(); $('resume').hidden = !active || touch || document.pointerLockElement === renderer?.domElement || $('help-dialog').open;
});
document.addEventListener('mousemove', e => { if (active && document.pointerLockElement === renderer?.domElement) look(e.movementX, e.movementY); });
document.addEventListener('keydown', e => {
  if (!active || $('help-dialog').open || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  if (['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)) { e.preventDefault(); navigation.keys.add(e.code); }
  if (!e.repeat && e.code === 'KeyE') use();
  if (!e.repeat && e.code === 'KeyQ') { if (!measuring) setMeasure(); else measureAt(); }
});
document.addEventListener('keyup', e => navigation?.keys.delete(e.code));
let lookPointer = null, previous = null, down = null;
$('viewer').addEventListener('pointerdown', e => {
  if (!active || $('help-dialog').open || e.button !== 0 || e.isPrimary === false) return;
  if (measuring) { down = {x:e.clientX,y:e.clientY}; return; }
  if (!touch) {
    // Capturing the mouse never activates an object; subsequent primary clicks use the crosshair.
    if (document.pointerLockElement === renderer.domElement) use();
    else requestLook();
    return;
  }
  lookPointer=e.pointerId; previous={x:e.clientX,y:e.clientY}; e.target.setPointerCapture(e.pointerId);
});
$('viewer').addEventListener('pointermove', e => { if(e.pointerId===lookPointer && previous){look((e.clientX-previous.x)*1.3,(e.clientY-previous.y)*1.3);previous={x:e.clientX,y:e.clientY};} });
$('viewer').addEventListener('pointerup', e => { if(measuring && down && Math.hypot(e.clientX-down.x,e.clientY-down.y)<10) measureAt(e); down=null; if(e.pointerId===lookPointer){lookPointer=null;previous=null;} });
$('viewer').addEventListener('pointercancel', () => {lookPointer=null;previous=null;down=null;});
let joystickPointer = null;
const stick=$('joystick'), knob=stick.querySelector('span');
function steer(e){const r=stick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,n=Math.max(1,Math.hypot(dx,dy)/36);navigation.analog.x=dx/n/36;navigation.analog.y=-dy/n/36;knob.style.transform=`translate(${dx/n}px,${dy/n}px)`;}
stick.addEventListener('pointerdown',e=>{if(!active)return;joystickPointer=e.pointerId;stick.setPointerCapture(e.pointerId);steer(e);});
stick.addEventListener('pointermove',e=>{if(e.pointerId===joystickPointer)steer(e);});
for(const type of ['pointerup','pointercancel','lostpointercapture'])stick.addEventListener(type,()=>{joystickPointer=null;if(navigation)navigation.analog.x=navigation.analog.y=0;knob.style.transform='';});
init().catch(error=>{console.error(error);status(`Visningen kunde inte startas: ${error.message}`);$('start').disabled=false;$('start').textContent='Försök igen';$('start').addEventListener('click',()=>location.reload(),{once:true});});
