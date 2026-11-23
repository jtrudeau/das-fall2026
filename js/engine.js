/* Deck engine. No dependencies, no build step, nothing advances on its own.

   A scene is { id, act, title, steps, dur, html, setup(el, api) -> { render(step, p, t), enter(), leave() }, live }.
   - `steps` is the number of states. Forward moves to the next state and animates p from 0 to 1.
     Back shows the previous state finished. Pressing forward during an animation finishes it.
   - Elements with data-at="k" show from state k on; data-to="m" hides them after state m.
   - render(step, p, t) draws canvases as a pure function of (state, progress, seconds in scene),
     so replay, jumps, the speaker view and the static export all agree.
*/
(function () {
  const scenes = [];
  const byId = {};
  const Q = new URLSearchParams(location.search);
  const STATIC = Q.has('static');
  const state = { i: 0, step: 0, p: 1, t0: 0, animStart: 0, animating: false, started: null };
  let stage, raf = null, speaker = null, palCache = null, typed = '';

  const Deck = (window.Deck = {
    scenes, state, STATIC,
    add(def) { def.steps = def.steps || 1; scenes.push(def); byId[def.id] = def; return def; },
    pal() {
      if (palCache) return palCache;
      const cs = getComputedStyle(document.documentElement), g = (n) => cs.getPropertyValue(n).trim();
      palCache = { bg: g('--bg'), bg2: g('--bg2'), ink: g('--ink'), dim: g('--dim'), faint: g('--faint'), rule: g('--rule'),
        amber: g('--amber'), blue: g('--blue'), red: g('--red'), stoneB: g('--stone-b'), stoneBEdge: g('--stone-b-edge'), stoneW: g('--stone-w'),
        light: document.documentElement.dataset.theme === 'light' };
      return palCache;
    },
    go, next, prev, replay,
  });

  /* ---------- drawing helpers shared by scenes ---------- */
  const U = (window.U = {
    clamp: (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
    lerp: (a, b, t) => a + (b - a) * t,
    io: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: (t) => 1 - Math.pow(1 - t, 3),
    in: (t) => t * t * t,
    /* progress of a sub-interval [a, b] of p */
    seg: (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a))),
    rgb(c) {
      if (c[0] === '#') { const h = c.slice(1); const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
      return c.match(/[\d.]+/g).slice(0, 3).map(Number);
    },
    rgba(c, a) { const v = U.rgb(c); return `rgba(${v[0]},${v[1]},${v[2]},${a})`; },
    mix(c1, c2, t) { const a = U.rgb(c1), b = U.rgb(c2); const c = a.map((v, i) => Math.round(v + (b[i] - v) * t)); return `rgb(${c[0]},${c[1]},${c[2]})`; },
    int: (n) => Math.round(n).toLocaleString('en-CA').replace(/ | /g, ','),
    canvas(el, cls) {
      const c = document.createElement('canvas'); const s = Q.get('q') ? +Q.get('q') : 2;
      c.width = 1920 * s; c.height = 1080 * s; if (cls) c.className = cls;
      el.appendChild(c); const ctx = c.getContext('2d'); ctx.scale(s, s); ctx.S = s;
      return ctx;
    },
    clear(ctx) { ctx.clearRect(0, 0, 1920, 1080); },
    text(ctx, s, x, y, o = {}) {
      ctx.font = `${o.style || ''} ${o.w || 400} ${o.size || 30}px ${o.serif ? 'Newsreader' : o.mono ? 'JetBrains Mono' : 'Inter'}`;
      ctx.fillStyle = o.color || Deck.pal().ink; ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'alphabetic';
      if (o.alpha != null) ctx.globalAlpha = o.alpha;
      if (o.ls) { try { ctx.letterSpacing = o.ls; } catch (e) {} }
      ctx.fillText(s, x, y); ctx.globalAlpha = 1; try { ctx.letterSpacing = '0px'; } catch (e) {}
    },
    /* seeded random numbers, so every drawing is the same on every run */
    rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); },
  });

  /* ---------- scene lifecycle ---------- */
  function build(sc) {
    if (sc.el) return;
    const el = document.createElement('section'); el.className = 'scene'; el.id = 'sc-' + sc.id;
    el.innerHTML = sc.html || '';
    stage.appendChild(el); sc.el = el;
    sc.inst = (sc.setup && sc.setup(el, Deck)) || {};
    sc.reveals = [...el.querySelectorAll('[data-at]')];
  }
  function applyReveals(sc, step) {
    for (const n of sc.reveals) {
      const at = +n.dataset.at, to = n.dataset.to == null ? 1e9 : +n.dataset.to;
      n.classList.toggle('on', step >= at && step <= to);
    }
  }
  function draw() {
    const sc = scenes[state.i]; if (!sc || !sc.inst.render) return;
    const t = STATIC ? (sc.posterT || 0) : (performance.now() - state.t0) / 1000;
    sc.inst.render(state.step, state.p, t);
  }
  function loop() {
    raf = null;
    const sc = scenes[state.i];
    if (state.animating) {
      const d = stepDur(sc, state.step);
      state.p = d <= 0 ? 1 : Math.min(1, (performance.now() - state.animStart) / d);
      if (state.p >= 1) state.animating = false;
    }
    draw();
    if (state.animating || (sc.live && !STATIC)) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }
  function stepDur(sc, k) { const d = sc.dur; return d == null ? 900 : typeof d === 'number' ? d : d[k] == null ? 900 : d[k]; }

  function go(i, step, opt = {}) {
    i = Math.max(0, Math.min(scenes.length - 1, i));
    const sc = scenes[i]; build(sc);
    step = Math.max(0, Math.min(sc.steps - 1, step == null ? 0 : step));
    const changed = i !== state.i || !sc.el.classList.contains('active');
    if (changed) {
      const old = scenes[state.i];
      if (old && old.el && old !== sc) { old.el.classList.remove('active'); old.inst.leave && old.inst.leave(); }
      sc.el.classList.add('active'); state.t0 = performance.now();
      sc.inst.enter && sc.inst.enter();
    }
    state.i = i; state.step = step;
    const animate = opt.animate && !STATIC;
    state.p = animate ? 0 : 1; state.animating = !!animate; state.animStart = performance.now();
    applyReveals(sc, step);
    sc.inst.onStep && sc.inst.onStep(step, !!animate);
    draw(); kick(); sync();
  }
  function next() {
    const sc = scenes[state.i];
    if (state.started == null) state.started = Date.now();
    if (state.animating) { state.animating = false; state.p = 1; draw(); return; }
    if (state.step < sc.steps - 1) go(state.i, state.step + 1, { animate: true });
    else if (state.i < scenes.length - 1 && (sc.appendix || !scenes[state.i + 1].appendix)) go(state.i + 1, 0, { animate: true });
    else if (!sc.appendix) toast(scenes.some((s) => s.appendix) ? 'End of the talk. Appendix scenes are in the scene list (O).' : 'Last slide.');
  }
  function prev() {
    if (state.animating) { state.animating = false; state.p = 1; }
    if (state.step > 0) go(state.i, state.step - 1);
    else if (state.i > 0) { const j = state.i - 1; build(scenes[j]); go(j, scenes[j].steps - 1); }
  }
  function replay() { go(state.i, state.step, { animate: true }); }

  /* ---------- speaker view, notes, hash ---------- */
  function notesFor(i, step) {
    const sc = scenes[i]; const s = (window.SCRIPT || {})[sc.id]; if (!s) return null;
    return (s.steps || [])[step] || null;
  }
  function sync() {
    const sc = scenes[state.i];
    if (!STATIC) history.replaceState(null, '', '#/' + sc.id + '/' + state.step);
    const cur = notesFor(state.i, state.step);
    let ni = state.i, ns = state.step + 1; if (ns >= sc.steps) { ni++; ns = 0; }
    const nxt = ni < scenes.length ? notesFor(ni, ns) : null;
    const msg = { type: 'deck-state', i: state.i, n: scenes.length, id: sc.id, title: sc.title, act: sc.act, step: state.step, steps: sc.steps,
      cur, nxt, nextTitle: ni < scenes.length ? scenes[ni].title : 'End', nextId: ni < scenes.length ? scenes[ni].id : null, nextStep: ns, started: state.started };
    if (speaker && !speaker.closed) speaker.postMessage(msg, '*');
    const nb = document.getElementById('notes');
    if (nb && nb.style.display === 'block') { const para = (t) => (t || '').split(/\n\n+/).map((x) => '<p style="margin:.4em 0">' + x + '</p>').join('');
      nb.innerHTML = `<div class="cue">${sc.title} · ${state.step + 1}/${sc.steps}${cur && cur.cue ? ' · ' + cur.cue : ''}</div>${cur ? para(cur.say) : ''}${cur && cur.after ? '<div style="color:#7fc6ea">' + para(cur.after) + '</div>' : ''}`; }
  }
  function toast(s) { const t = document.getElementById('toast'); t.textContent = s; t.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('on'), 1400); }

  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transformOrigin = '0 0';
    stage.style.left = (innerWidth - 1920 * s) / 2 + 'px';
    stage.style.top = (innerHeight - 1080 * s) / 2 + 'px';
    stage.style.transform = `scale(${s})`;
  }

  function toggle(id) { const e = document.getElementById(id); const on = e.style.display !== 'block'; e.style.display = on ? 'block' : 'none'; return on; }
  function overview() {
    const o = document.getElementById('overview');
    if (toggle('overview')) {
      o.innerHTML = '<h2>Scenes — type a number then Enter, or click</h2><ol>' + scenes.map((s, k) => `<li data-k="${k}" class="${k === state.i ? 'cur' : ''}">${s.title}<span class="act">${s.appendix ? 'appendix' : s.act || ''}</span></li>`).join('') + '</ol>';
      o.querySelectorAll('li').forEach((li) => (li.onclick = () => { o.style.display = 'none'; go(+li.dataset.k, 0); }));
    }
  }
  function key(e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) { typed += k; toast('go to scene ' + typed + ' ⏎'); return; }
    if (k === 'Enter' && typed) { const n = +typed; typed = ''; document.getElementById('overview').style.display = 'none'; go(n - 1, 0); return; }
    typed = '';
    switch (k) {
      case 'ArrowRight': case ' ': case 'PageDown': case 'Enter': e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'PageUp': case 'Backspace': e.preventDefault(); prev(); break;
      case 'ArrowDown': e.preventDefault(); go(state.i + 1, 0); break;
      case 'ArrowUp': e.preventDefault(); go(state.i - 1, 0); break;
      case 'Home': go(0, 0); break;
      case 'End': go(scenes.length - 1, 0); break;
      case 'r': case 'R': replay(); break;
      case 'o': case 'O': case 'Escape': if (k === 'Escape') { ['overview', 'help'].forEach((x) => (document.getElementById(x).style.display = 'none')); } else overview(); break;
      case 'h': case 'H': case '?': toggle('help'); break;
      case 'n': case 'N': toggle('notes'); sync(); break;
      case 'b': case 'B': case '.': toggle('blackout'); break;
      case 'f': case 'F': document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); break;
      case 'c': case 'C': document.body.classList.toggle('nocursor'); break;
      case 't': case 'T': setTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); break;
      case 's': case 'S': speaker = window.open('speaker.html', 'deck-speaker', 'width=1100,height=760'); setTimeout(sync, 600); break;
      case 'z': case 'Z': state.started = null; sync(); toast('timer reset'); break;
    }
  }
  function setTheme(t) {
    document.documentElement.dataset.theme = t; palCache = null;
    try { localStorage.setItem('deck-theme', t); } catch (e) {}
    for (const sc of scenes) if (sc.inst && sc.inst.theme) sc.inst.theme();
    draw(); toast(t + ' palette');
  }

  window.addEventListener('message', (e) => {
    const d = e.data || {};
    if (d.type === 'deck-key') key({ key: d.key, preventDefault() {} });
    if (d.type === 'deck-hello') { speaker = e.source; sync(); }
  });

  window.addEventListener('DOMContentLoaded', async () => {
    stage = document.getElementById('stage');
    { const main = scenes.filter((s) => !s.appendix), app = scenes.filter((s) => s.appendix); scenes.length = 0; scenes.push(...main, ...app); }   /* appendix scenes go after the end */
    const th = Q.get('theme') || (function () { try { return localStorage.getItem('deck-theme'); } catch (e) { return null; } })();
    if (th) document.documentElement.dataset.theme = th;
    if (STATIC) document.body.classList.add('static');
    fit(); addEventListener('resize', fit);
    try { await document.fonts.load('400 30px Newsreader'); await document.fonts.load('italic 400 30px Newsreader'); await document.fonts.load('400 30px Inter'); await document.fonts.load('400 30px "JetBrains Mono"'); await document.fonts.ready; } catch (e) {}
    let i = 0, step = 0;
    const m = location.hash.match(/^#\/([^/]+)(?:\/(\d+))?/);
    if (m && byId[m[1]]) { i = scenes.indexOf(byId[m[1]]); step = +(m[2] || 0); }
    for (const sc of scenes) { const s = (window.SCRIPT || {})[sc.id]; if (!s) console.warn('no script for scene', sc.id); else if ((s.steps || []).length !== sc.steps) console.warn('script/scene step mismatch', sc.id, (s.steps || []).length, sc.steps); }
    go(i, step);
    document.addEventListener('keydown', key);
    stage.addEventListener('click', (e) => { if (!e.target.closest('.nonav, iframe, a, button')) next(); });
    document.body.classList.add('ready');
  });
})();
