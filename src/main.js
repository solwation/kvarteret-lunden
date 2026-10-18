import * as THREE from 'three';
import { buildWorldSliced } from './world.js';
import { loadingStep, loadingYield } from './loadingstep.js';
import { Navigation } from './navigation.js';
import { fetchStartupJSON } from './startup.js';
import { VERSION, takeResume, watchUpdates, saveResume, claimContextReload } from './updates.js';
import { reloadOnContextRestore } from './lowmemory.js';
import { installPlaceShortcuts } from './place-shortcuts.js';
import { Garage } from './garage.js';
import { Core } from './core.js';
import { CoreHouse } from './corehouse.js';
import { CORE_A, CORE_B, CORE_C, CORE, GARAGE, LEVELS, LIGHTING, STARTUP, TOUCH, VIEW_NEAR } from './config.js';
import { region, stickMirrored, setupTouchLayout } from './touchlayout.js';

const $ = id => document.getElementById(id);
const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
document.body.classList.toggle('touch', touch);
const touchLayout = setupTouchLayout({enabled: touch}); // own button/stick layout from the help dialog (#30, upstream 1af9b39)
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
/** Ease the pending touch drag (CSS px) into the view over TOUCH.look.smooth s; the handed-out deltas add up to the finger's travel. */
function easeLook(dt) {
  if (!pendingLook.x && !pendingLook.y) return;
  const tau = TOUCH.look.smooth, f = tau > 0 ? 1 - Math.exp(-dt / tau) : 1;
  let x = pendingLook.x * f, y = pendingLook.y * f;
  if (Math.abs(pendingLook.x - x) < .01 && Math.abs(pendingLook.y - y) < .01) { x = pendingLook.x; y = pendingLook.y; } // the last sliver at once
  pendingLook.x -= x; pendingLook.y -= y;
  if (x || y) look(x * TOUCH.look.sens, y * TOUCH.look.sens);
}
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
  await loadingStep('Startar 3D-grafiken', 0.1); // named steps on the card and for the startup guard in index.html (#37, #39)
  renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  $('viewer').append(renderer.domElement);
  // Phone (#38): a restored WebGL context re-uploads the geometry and canvases freed after upload as empty buffers, so the
  // page reloads instead, back at the same place and view. A second restore within 60 s asks for one tap instead (no loop).
  const glReload = () => { if (ready) saveResume(viewSnapshot()); location.reload(); };
  $('gl-lost-reload').addEventListener('click', glReload);
  reloadOnContextRestore(renderer.domElement, {allow: claimContextReload, reload: glReload, onSkip: () => { $('gl-lost').hidden = false; }});
  camera = new THREE.PerspectiveCamera(65, 1, .06, 700); camera.rotation.order = 'YXZ';
  scene = new THREE.Scene(); scene.background = new THREE.Color(0xcbd9dd); scene.fog = new THREE.Fog(0xcbd9dd, 200, 650);
  const S = LIGHTING.sky;
  scene.add(new THREE.HemisphereLight(S.hemi.sky, S.hemi.ground, S.hemi.intensity), new THREE.AmbientLight(S.ambient.color, S.ambient.intensity));
  const sunlight = new THREE.DirectionalLight(S.sun.color, S.sun.intensity); sunlight.position.set(...S.sun.pos); scene.add(sunlight);
  const fill = new THREE.DirectionalLight(S.fill.color, S.fill.intensity); fill.position.set(...S.fill.pos); scene.add(fill);
  fit();
  loadingStep('Hämtar planritningen', 0.15);
  const plan = await fetchStartupJSON(`./data/plan.json${VERSION ? '?v=' + VERSION : ''}`, { timeout: STARTUP.planTimeout });
  await loadingStep('Bygger huset', 0.2);
  // In parts, with the card's heartbeat painted between them (#39, from the original's 673b78d #1133).
  world = await buildWorldSliced(plan, (share) => loadingYield(0.2 + 0.6 * share)); scene.add(world.object);
  await loadingStep('Bygger trapphus och garage', 0.82);
  garage = world.garage = new Garage();
  for (const o of [garage.object, garage.blackout, garage.door?.object, garage.parkObject]) if (o) scene.add(o);
  await loadingYield(0.9);
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
  window.lundenViewer = {world, navigation, camera, renderer, scene, moveTo, locations, easeLook, touchLayout};
  window.kvarteretStartup?.finish();
  $('start').disabled = false; $('start').textContent = 'Börja utforska →';
  status('Dator och mobil · Ingen inloggning');
  renderer.setAnimationLoop(frame);
  watchUpdates({
    snapshot: viewSnapshot,
    busy: () => measuring || $('help-dialog').open || touchLayout.editing || document.querySelector('.locations').classList.contains('open') || navigation.keys.size > 0 || Math.abs(navigation.analog.x) + Math.abs(navigation.analog.y) > 0 || lookPointer !== null,
    notice: text => { $('update-status').hidden = false; $('update-status').textContent = text; },
  });
}
function viewSnapshot() {
  return {position:navigation.pos.toArray(), yaw:camera.rotation.y, pitch:camera.rotation.x, active, place:document.querySelector('[data-place].selected')?.dataset.place};
}
/** Near plane (VIEW_NEAR, from the original's #1276): finer depth on open ground, never more than the body radius allows. */
function updateCameraNear() {
  let near = VIEW_NEAR.min;
  if (navigation.outdoors && !navigation.aloft && !navigation.inCore && !navigation.below && !navigation.unit) {
    const t = Math.tan(camera.fov * Math.PI / 360), corner = Math.sqrt(1 + t * t * (1 + camera.aspect * camera.aspect));
    near = Math.max(VIEW_NEAR.min, Math.min(VIEW_NEAR.outdoor, VIEW_NEAR.bodyRadius / corner));
  }
  if (Math.abs(camera.near - near) > 1e-4) { camera.near = near; camera.updateProjectionMatrix(); }
}
function frame() {
  const dt = Math.min(clock.getDelta(), .05);
  if (active && !$('help-dialog').open) navigation.update(dt);
  if (touch) { if (active && !$('help-dialog').open) easeLook(dt); else pendingLook.x = pendingLook.y = 0; } // eased drag-to-look (#1088)
  // The public walkthrough has no time controls; the tower follows the visitor's local clock.
  const now = new Date(), hour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
  for (const clock of world.clocks) clock.update(hour);
  core.update(dt, navigation, camera);
  garage.update(dt, navigation, camera);
  updateCameraNear();
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
  // A mouse/pen keeps to its primary pointer. A touch finger may be a second one: the stick thumb is often already down,
  // so the look (or measuring) finger is tracked by id alongside it (#31; the original's stickId/lookId, src/touch.js).
  if (!active || $('help-dialog').open || e.button !== 0) return;
  if (e.isPrimary === false && (e.pointerType !== 'touch' || lookPointer !== null || down) && !inStickZone(e)) return;
  if (grabStick(e)) return; // a thumb on the stick side places the floating stick under it (#32)
  if (measuring) { down = {x:e.clientX,y:e.clientY,id:e.pointerId}; return; }
  if (!touch) {
    // Capturing the mouse never activates an object; subsequent primary clicks use the crosshair.
    if (document.pointerLockElement === renderer.domElement) use();
    else requestLook();
    return;
  }
  lookPointer=e.pointerId; previous={x:e.clientX,y:e.clientY}; e.target.setPointerCapture(e.pointerId);
});
// Drag-to-look is accumulated here and eased into the view per frame (easeLook; upstream 211e0e9, #1088).
const pendingLook = {x: 0, y: 0};
$('viewer').addEventListener('pointermove', e => { if(e.pointerId===lookPointer && previous){pendingLook.x+=e.clientX-previous.x;pendingLook.y+=e.clientY-previous.y;previous={x:e.clientX,y:e.clientY};if(!(TOUCH.look.smooth>0))easeLook(0);} });
$('viewer').addEventListener('pointerup', e => { if(down && e.pointerId===down.id){if(measuring && Math.hypot(e.clientX-down.x,e.clientY-down.y)<10) measureAt(e); down=null;} if(e.pointerId===lookPointer){lookPointer=null;previous=null;} });
$('viewer').addEventListener('pointercancel', e => { if(e.pointerId===lookPointer){lookPointer=null;previous=null;} if(down && e.pointerId===down.id) down=null; });
let joystickPointer = null;
const stick=$('joystick'), knob=stick.querySelector('span');
// Knob travel follows the stick's rendered size, which scales with the screen's short side (style.css; upstream e3d2873, #1087):
// as in the original, the base is 2 × travel + 12 px, so the knob reaches the rim (#31, upstream 82fde3f).
// Dead zone + response curve on the deflection, direction kept (upstream 211e0e9, #1088). The knob moves in the
// stick's own units, so an own layout's `scale` (#30) keeps it on the rim.
function stickResponse(r){const {deadZone,full,curve}=TOUCH.stick;return r<=deadZone?0:Math.min(1,(r-deadZone)/(full-deadZone))**curve;}
function steer(e){const r=stick.getBoundingClientRect(),sc=r.width/(stick.offsetWidth||r.width)||1,t=(r.width-12*sc)/2,dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,d=Math.hypot(dx,dy),n=Math.max(1,d/t),out=stickResponse(Math.min(d,t)/t),k=d>0?out/Math.min(d,t):0;navigation.analog.x=dx/n*k;navigation.analog.y=-dy/n*k;knob.style.transform=`translate(${dx/n/sc}px,${dy/n/sc}px)`;stick.style.setProperty('--joy-a',`${Math.atan2(dx,-dy)*180/Math.PI}deg`);stick.style.setProperty('--joy-m',(out*.75).toFixed(2));}
// Floating stick (#32, from the original's src/touch.js at 1af9b39/211e0e9): a touch on the stick side of the view,
// below the help button and place menu, places the base under the thumb (kept inside the safe area); with
// TOUCH.stick.follow the base glides after a thumb dragged past the rim. On release it returns to its resting place in
// the corner, which shows where to touch. One thumb owns the stick; a second finger on that side looks instead, and
// only the owner's release resets it (#31). While measuring, a short tap there still measures.
let stickStart = null;
function inStickZone(e) {
  if (!touch || e.pointerType !== 'touch' || joystickPointer !== null) return false;
  const R = region(), z = TOUCH.stick.zone, w = innerWidth;
  return e.clientY >= R.t && (stickMirrored() ? e.clientX > w * (1 - z) : e.clientX < w * z);
}
function placeStick(x, y) {
  const R = region(), h = stick.getBoundingClientRect().width / 2, fit = (v, a, b) => b - a < 2 * h ? (a + b) / 2 : Math.min(b - h, Math.max(a + h, v));
  stick.style.setProperty('--joy-x', `${fit(x, R.l, R.r)}px`);
  stick.style.setProperty('--joy-y', `${fit(y, R.t, R.b)}px`);
}
function grabStick(e) {
  if (!active || $('help-dialog').open || !inStickZone(e)) return false;
  joystickPointer = e.pointerId; stickStart = {x: e.clientX, y: e.clientY};
  placeStick(e.clientX, e.clientY); stick.classList.add('floating');
  try { stick.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
  steer(e); e.preventDefault();
  return true;
}
function followStick(e) {
  if (!TOUCH.stick.follow) return;
  const r = stick.getBoundingClientRect(), sc = r.width / (stick.offsetWidth || r.width) || 1, t = (r.width - 12 * sc) / 2;
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = e.clientX - cx, dy = e.clientY - cy, d = Math.hypot(dx, dy);
  if (d > t) placeStick(cx + dx * (1 - t / d), cy + dy * (1 - t / d));
}
function releaseStick(e) {
  if (e.pointerId !== joystickPointer) return;
  joystickPointer = null; if (navigation) navigation.analog.x = navigation.analog.y = 0;
  knob.style.transform = ''; stick.style.setProperty('--joy-m', '0'); stick.classList.remove('floating');
  if (e.type === 'pointerup' && measuring && stickStart && Math.hypot(e.clientX - stickStart.x, e.clientY - stickStart.y) < 10) measureAt(e);
  stickStart = null;
}
stick.addEventListener('pointerdown', e => { if (!grabStick(e) && joystickPointer === null && e.pointerType !== 'touch' && active) { joystickPointer = e.pointerId; stick.setPointerCapture(e.pointerId); steer(e); } });
stick.addEventListener('pointermove', e => { if (e.pointerId === joystickPointer) { followStick(e); steer(e); } });
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) stick.addEventListener(type, releaseStick);
// The guard in index.html shows the failed step, its cause and Försök igen (#37).
init().catch(error => { console.error(error); window.kvarteretStartup?.fail(error); });
