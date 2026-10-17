// Own touch layout (#30; adapted from the original's src/touchlayout.js, upstream 1af9b39, the CoD Mobile model):
// from the help dialog a touch visitor drags the walking stick, the action pill and Mät avstånd, resizes them (pinch
// or the size slider), sets their opacity and can mirror the whole layout for left-handers. Stored per device in this
// project's own localStorage key; the default stays the #29 thumb arc (style.css body.touch) and writes no inline
// styles at all.
//
// A customised control keeps its CSS slot and its IDs/listeners: the layout only adds an offset (in units of the
// screen's short side, so it scales with the screen), `scale` and `opacity` as inline CSSOM styles. The offset is
// re-measured against the slot on every resize/rotation and whenever a control appears, and the final position is
// clamped inside the safe area, below the help button and place menu.

import { TOUCH_LAYOUT } from './config.js';

const KEY = 'kvarteret-lunden.touch-layout'; // independent of the original app's keys (AGENTS.md)
const STICK = 'joystick';
/** Customisable controls, in the order the editor lists them, with their Swedish names. */
export const TOUCH_CONTROLS = [['action', 'Öppna/Stäng'], ['measure', 'Mät avstånd'], [STICK, 'Spaken']];
const NAMES = new Map(TOUCH_CONTROLS);
const DEFAULT = () => ({ mirror: false, c: {} });
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const scaleRange = (id) => (id === STICK ? TOUCH_LAYOUT.stickScale : TOUCH_LAYOUT.buttonScale);

/** A clean layout from whatever was stored (unknown ids, NaN and out-of-range values are dropped or clamped). */
export function normalizeLayout(raw) {
  const out = DEFAULT();
  if (!raw || typeof raw !== 'object') return out;
  out.mirror = raw.mirror === true;
  for (const [id] of TOUCH_CONTROLS) {
    const e = raw.c?.[id];
    if (!e || typeof e !== 'object') continue;
    const num = (v, d) => (Number.isFinite(v) ? v : d);
    const [s0, s1] = scaleRange(id), [o0, o1] = TOUCH_LAYOUT.opacity, m = TOUCH_LAYOUT.maxOffset;
    const n = { x: clamp(num(e.x, 0), -m, m), y: clamp(num(e.y, 0), -m, m), s: clamp(num(e.s, 1), s0, s1), o: clamp(num(e.o, 1), o0, o1) };
    if (Math.abs(n.x) > 1e-4 || Math.abs(n.y) > 1e-4 || n.s !== 1 || n.o !== 1) out.c[id] = n;
  }
  return out;
}
function loadLayout() {
  try { return normalizeLayout(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch { return DEFAULT(); }
}
function storeLayout(layout) {
  try {
    if (!layout.mirror && !Object.keys(layout.c).length) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(layout));
    return true;
  } catch { return false; } // private window / blocked storage: the layout still holds for this visit
}

let saved = DEFAULT();
let draft = null; // the layout being edited (null outside the editor)
const shown = () => draft || saved;
const entry = (l, id) => l.c[id] || { x: 0, y: 0, s: 1, o: 1 };
const applied = new WeakMap(); // element → the translate (px) written last, so the slot centre can be recovered
const effective = {};          // id → the clamped offset actually shown, in stored (unmirrored, short-side) units

/** The safe area minus the top controls (help button, place menu), in CSS px. */
function region() {
  let probe = document.getElementById('touch-safe-probe');
  if (!probe) { // positioned by style.css: the viewport inset by env(safe-area-inset-*)
    probe = Object.assign(document.createElement('div'), { id: 'touch-safe-probe' });
    probe.setAttribute('aria-hidden', 'true');
    document.body.append(probe);
  }
  const r = probe.getBoundingClientRect(), m = TOUCH_LAYOUT.margin;
  let top = r.top + m;
  for (const id of ['help', 'place-toggle']) {
    const b = document.getElementById(id)?.getBoundingClientRect();
    if (b && b.height > 0) top = Math.max(top, b.bottom + m);
  }
  return { l: r.left + m, r: r.right - m, t: top, b: r.bottom - m, side: Math.min(r.width, r.height) || 1 };
}

/** Write the shown layout onto the controls (call after any change, resize or a control appearing). */
function applyTouchLayout() {
  const l = shown();
  const plain = !draft && !l.mirror && !Object.keys(l.c).length;
  const ids = [...TOUCH_CONTROLS.map(([id]) => id), 'measurement'];
  const els = ids.map((id) => [id, document.getElementById(id)]).filter(([, el]) => el);
  if (plain) { // the default #29 thumb arc: no inline styles at all
    for (const [, el] of els) { el.style.translate = el.style.scale = el.style.opacity = ''; applied.delete(el); }
    return;
  }
  const R = region();
  const writes = [];
  for (const [id, el] of els) {
    // the measurement status follows Mät avstånd's offset (not its size or opacity)
    const e = id === 'measurement' ? { ...entry(l, 'measure'), s: 1, o: 1 } : entry(l, id);
    if (!el.offsetWidth) { writes.push([el, null, 1, e.o]); continue; } // hidden controls are placed when they appear
    const prev = applied.get(el) || { x: 0, y: 0 }, b = el.getBoundingClientRect();
    const cx = (b.left + b.right) / 2 - prev.x, cy = (b.top + b.bottom) / 2 - prev.y; // the slot centre (scale keeps the centre)
    const hw = el.offsetWidth * e.s / 2, hh = el.offsetHeight * e.s / 2;
    let x = cx + e.x * R.side, y = cy + e.y * R.side;
    if (l.mirror) x = R.l + R.r - x;
    x = R.r - R.l < 2 * hw ? (R.l + R.r) / 2 : clamp(x, R.l + hw, R.r - hw);
    y = R.b - R.t < 2 * hh ? R.b - hh : clamp(y, R.t + hh, R.b - hh);
    if (id !== 'measurement') effective[id] = { x: ((l.mirror ? R.l + R.r - x : x) - cx) / R.side, y: (y - cy) / R.side };
    writes.push([el, { x: x - cx, y: y - cy }, e.s, e.o]);
  }
  for (const [el, t, s, o] of writes) { // all reads first, then all writes: one layout pass
    if (t) {
      applied.set(el, t);
      el.style.translate = Math.abs(t.x) < 0.01 && Math.abs(t.y) < 0.01 ? '' : `${t.x.toFixed(1)}px ${t.y.toFixed(1)}px`;
    }
    el.style.scale = s === 1 ? '' : String(+s.toFixed(3));
    el.style.opacity = o === 1 ? '' : String(+o.toFixed(3));
  }
}

/**
 * Install the own layout on a touch device (`enabled`); elsewhere nothing changes and the help entry stays hidden.
 * Returns the editor (also used by tools/touchcustom-check.mjs through window.lundenViewer).
 */
export function setupTouchLayout({ enabled }) {
  const openBtn = document.getElementById('touch-layout-open');
  if (!enabled) return { enabled: false, editing: false, open() {}, cancel() {}, save() {} };
  if (openBtn) openBtn.hidden = false;
  saved = loadLayout();
  const settle = () => { applyTouchLayout(); requestAnimationFrame(applyTouchLayout); setTimeout(applyTouchLayout, 450); };
  addEventListener('resize', settle);
  addEventListener('orientationchange', settle);
  // #action and #measurement appear and disappear: place them before the next paint. main.js sets the same `hidden`
  // value every frame, so only real changes count.
  const watch = new MutationObserver((recs) => {
    if (recs.some((r) => (r.oldValue === null) !== !r.target.hasAttribute(r.attributeName))) applyTouchLayout();
  });
  for (const id of ['action', 'measurement']) {
    const el = document.getElementById(id);
    if (el) watch.observe(el, { attributes: true, attributeFilter: ['hidden'], attributeOldValue: true });
  }
  applyTouchLayout();

  let ui = null, sel = 'action';
  const pointers = new Map(); // pointerId → {x, y}
  let drag = null;            // { id, pointerId, x0, y0, ex, ey, s0, dist0 }

  function build() {
    const root = document.createElement('div');
    root.id = 'touch-edit';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-label', 'Anpassa touchknappar');
    root.hidden = true;
    root.innerHTML = `
      <div class="te-bar">
        <button type="button" class="te-cancel" title="Avbryt utan att spara (Esc)">✕ Avbryt</button>
        <b class="te-name" aria-live="polite"></b>
        <label class="te-slider">Storlek <input type="range" class="te-size" min="0" max="100" step="1"></label>
        <label class="te-slider">Opacitet <input type="range" class="te-opacity" min="0" max="100" step="1"></label>
        <label class="te-mirror"><input type="checkbox" class="te-mirror-box"> Spegla för vänsterhänta</label>
        <button type="button" class="te-reset">Återställ standard</button>
        <button type="button" class="te-save">Spara</button>
      </div>
      <p class="te-help">Dra en knapp eller spaken för att flytta den · nyp med två fingrar eller använd reglaget för storlek</p>`;
    document.body.append(root);
    const q = (c) => root.querySelector(c);
    ui = { root, name: q('.te-name'), size: q('.te-size'), opacity: q('.te-opacity'), mirror: q('.te-mirror-box'), help: q('.te-help') };
    q('.te-cancel').addEventListener('click', () => close(false));
    q('.te-save').addEventListener('click', () => close(true));
    q('.te-reset').addEventListener('click', () => { draft = DEFAULT(); applyTouchLayout(); refresh(); });
    ui.mirror.addEventListener('change', () => { draft.mirror = ui.mirror.checked; applyTouchLayout(); });
    ui.size.addEventListener('input', () => { const [a, b] = scaleRange(sel); setEntry(sel, { s: a + (b - a) * ui.size.value / 100 }); });
    ui.opacity.addEventListener('input', () => { const [a, b] = TOUCH_LAYOUT.opacity; setEntry(sel, { o: a + (b - a) * ui.opacity.value / 100 }); });
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerup', up);
    root.addEventListener('pointercancel', up);
    root.addEventListener('lostpointercapture', up);
  }
  function setEntry(id, patch) {
    draft.c[id] = { ...entry(draft, id), ...patch };
    applyTouchLayout();
  }
  function refresh() {
    for (const [id] of TOUCH_CONTROLS) document.getElementById(id)?.classList.toggle('te-sel', id === sel);
    const e = entry(draft, sel), [a, b] = scaleRange(sel), [o0, o1] = TOUCH_LAYOUT.opacity;
    ui.name.textContent = NAMES.get(sel);
    ui.size.value = String(Math.round((e.s - a) / (b - a) * 100));
    ui.opacity.value = String(Math.round((e.o - o0) / (o1 - o0) * 100));
    ui.size.setAttribute('aria-label', `Storlek: ${NAMES.get(sel)}`);
    ui.opacity.setAttribute('aria-label', `Opacitet: ${NAMES.get(sel)}`);
    ui.mirror.checked = draft.mirror;
  }
  /** The control under a point: the smallest box containing it (buttons win over the larger stick). */
  function hit(x, y) {
    let best = null, area = Infinity;
    for (const [id] of TOUCH_CONTROLS) {
      const b = document.getElementById(id)?.getBoundingClientRect();
      if (!b || !b.width) continue;
      const pad = 6;
      if (x >= b.left - pad && x <= b.right + pad && y >= b.top - pad && y <= b.bottom + pad && b.width * b.height < area) { best = id; area = b.width * b.height; }
    }
    return best;
  }
  function down(e) {
    if (e.target.closest('.te-bar')) return;
    e.preventDefault();
    e.stopPropagation(); // never reaches the viewer's own listeners
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    try { ui.root.setPointerCapture(e.pointerId); } catch { /* synthetic pointer */ }
    if (drag && pointers.size === 2) { // second finger: pinch the selected control
      const [p, q] = [...pointers.values()];
      drag.s0 = entry(draft, drag.id).s; drag.dist0 = Math.hypot(p.x - q.x, p.y - q.y) || 1;
      return;
    }
    if (drag) return;
    const id = hit(e.clientX, e.clientY);
    if (!id) return;
    sel = id; refresh();
    const en = entry(draft, id);
    drag = { id, pointerId: e.pointerId, x0: e.clientX, y0: e.clientY, ex: en.x, ey: en.y, dist0: 0 };
    ui.root.classList.add('te-dragging');
  }
  function move(e) {
    if (!pointers.has(e.pointerId) || !drag) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size >= 2 && drag.dist0) {
      const [p, q] = [...pointers.values()], [a, b] = scaleRange(drag.id);
      setEntry(drag.id, { s: clamp(drag.s0 * Math.hypot(p.x - q.x, p.y - q.y) / drag.dist0, a, b) });
    } else if (e.pointerId === drag.pointerId) {
      const side = region().side, sign = draft.mirror ? -1 : 1;
      setEntry(drag.id, { x: drag.ex + sign * (e.clientX - drag.x0) / side, y: drag.ey + (e.clientY - drag.y0) / side });
    }
    refresh();
  }
  function up(e) {
    if (!pointers.delete(e.pointerId)) return;
    if (drag && pointers.size === 0) {
      const eff = effective[drag.id]; // drop any overshoot past the edge: the stored offset is what is shown
      if (eff) draft.c[drag.id] = { ...entry(draft, drag.id), x: eff.x, y: eff.y };
      drag = null;
      ui.root.classList.remove('te-dragging');
      ui.help.hidden = true;
      applyTouchLayout(); refresh();
    } else if (drag && e.pointerId === drag.pointerId) {
      drag = null; ui.root.classList.remove('te-dragging'); // the pinch finger stays down; a new touch starts over
    }
  }
  addEventListener('keydown', (e) => {
    if (!draft) return;
    if (e.code === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); close(false); return; }
    if (!e.target.closest?.('#touch-edit')) e.stopImmediatePropagation(); // no walking or place keys while editing
  }, true);
  // Keys on the editor's own controls (sliders, buttons) still work there, but stop before the view's document
  // listeners, which main.js registers after this one.
  document.addEventListener('keydown', (e) => { if (draft) e.stopImmediatePropagation(); });

  function close(keep) {
    if (!draft) return;
    if (keep) { saved = normalizeLayout(draft); storeLayout(saved); }
    draft = null; drag = null; pointers.clear();
    ui.root.hidden = true;
    document.body.classList.remove('touch-editing');
    for (const [id] of TOUCH_CONTROLS) document.getElementById(id)?.classList.remove('te-sel');
    applyTouchLayout();
    document.getElementById('help')?.focus({ preventScroll: true });
  }
  const editor = {
    enabled: true,
    get editing() { return !!draft; },
    get layout() { return normalizeLayout(shown()); },
    /** Open the editor over the view (body.touch-editing shows every control with an outline). */
    open() {
      if (draft) return;
      if (!ui) build();
      draft = normalizeLayout(saved);
      document.body.classList.add('touch-editing');
      ui.root.hidden = false; ui.help.hidden = false;
      sel = 'action'; refresh();
      applyTouchLayout();
      requestAnimationFrame(applyTouchLayout);
      ui.root.querySelector('.te-save').focus({ preventScroll: true });
    },
    cancel: () => close(false),
    save: () => close(true),
  };
  openBtn?.addEventListener('click', () => {
    document.getElementById('help-dialog')?.close();
    editor.open();
  });
  return editor;
}
