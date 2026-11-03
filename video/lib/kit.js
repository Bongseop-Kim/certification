// Stand-in for the Claude Motion kit: just what our scenes use. Every scene renders from t alone.
// Scenes call kit.scene(id, {init, render}); the episode file lists ids and durations; HyperFrames seeks
// through the 'hf-seek' event and we show the one scene that owns that moment.
(() => {
  const clamp01 = x => Math.min(1, Math.max(0, x));
  const seg = (t, a, b) => clamp01((t - a) / (b - a));
  const lerp = (a, b, p) => a + (b - a) * p;
  const eo = x => 1 - Math.pow(1 - x, 3);
  const ei = x => x * x * x;
  const eio = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const eob = (x, k = 1.4) => 1 + (k + 1) * Math.pow(x - 1, 3) + k * Math.pow(x - 1, 2);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const h = html => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };

  const TextFx = {
    // word by word from the right; splits once and caches the spans on the element
    fadeFromRight(el, t, t0, o = {}) {
      const st = o.stagger ?? .11, dur = o.dur ?? .5, dx = o.dx ?? 26;
      if (!el._words) {
        const words = el.textContent.split(' ');
        el.textContent = '';
        el._words = words.map((w, i) => {
          const s = document.createElement('span');
          s.style.display = 'inline-block';
          s.textContent = w;
          el.append(s);
          if (i < words.length - 1) el.append(' ');
          return s;
        });
      }
      el._words.forEach((s, i) => { const p = eo(seg(t, t0 + i * st, t0 + i * st + dur)); s.style.opacity = p; s.style.transform = 'translateX(' + (1 - p) * dx + 'px)'; });
      return t0 + (el._words.length - 1) * st + dur;
    },
  };

  // typed text at cps characters per second, with a fixed small jitter
  const typist = (text, t0, cps) => {
    const times = [...text].map((_, i) => t0 + i / cps + ((i * 7919) % 5) * .012);
    return { times, end: times[times.length - 1] ?? t0, at: t => text.slice(0, times.filter(x => x <= t).length) };
  };

  const defs = {};
  const kit = { clamp01, seg, lerp, eo, ei, eio, eob, esc, h, TextFx, typist, scene(id, def) { defs[id] = def; } };
  window.kit = kit;

  // play(list, root): list = [{id, dur}]; builds every scene once, then answers seeks
  window.play = (list, root) => {
    let at = 0;
    const scenes = list.map(s => {
      const def = defs[s.id];
      if (!def) throw new Error('scene not loaded: ' + s.id);
      const stage = document.createElement('div');
      stage.className = 'scene';
      stage.style.cssText = 'position:absolute;inset:0;overflow:hidden;visibility:hidden';
      root.append(stage);
      const k = Object.assign(Object.create(kit), { stage, dur: s.dur, start: at });
      const obj = Object.create(def);
      if (obj.init) obj.init(k);
      const sc = { ...s, start: at, stage, obj, k };
      at += s.dur;
      return sc;
    });
    let shown = null;
    const seek = t => {
      const sc = scenes.find(s => t < s.start + s.dur) || scenes[scenes.length - 1];
      if (sc !== shown) { if (shown) shown.stage.style.visibility = 'hidden'; sc.stage.style.visibility = 'visible'; shown = sc; }
      sc.obj.render(t - sc.start, sc.k);
    };
    window.addEventListener('hf-seek', e => seek(e.detail.time));
    seek(0);
    return at;
  };
})();
