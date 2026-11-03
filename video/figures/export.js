// Motion bridge: frame the figure once, then draw any view as an SVG string (pure in its inputs).
window.CF = (() => {
  CAM_LIM = null;
  OX = OY = 0; RC = [srvW / 2, srvD / 2]; RCZ = srvH / 2; setCam(YAW0, PITCH0);
  const pts = []; for (const x of [0, srvW]) for (const y of [0, srvD]) for (const z of [0, srvH]) pts.push(P(x, y, z));
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
  const vbW = Math.max(bw / .74, bh / .88 / .75), vbH = vbW * .75;
  OX = (vbW - bw) / 2 - Math.min(...xs); OY = vbH * .06 - Math.min(...ys);
  INK_K = vbW / INK_REF_VB;
  const cache = new Map();
  return {
    vb: [vbW, vbH], defs: filterFor(INK_K), labels: srvLabels,
    // ponytail: memo by rounded view and state; unbounded, fine for one film's handful of poses
    draw(st, yaw, pitch) {
      const y = Math.round(yaw * 2) / 2, x = Math.round((st.xr || 0) * 50) / 50, key = y + '|' + x + '|' + (st.disk || 0) + '|' + (pitch ?? '');
      setCam(y, pitch == null ? PITCH0 : pitch);   // also for at() right after
      let s = cache.get(key);
      if (!s) { _clipN = 0; s = inkScale(srvScene({ ...st, xr: x }, PALS[st.pal || 'cobalt'])); cache.set(key, s); }
      return s;
    },
    at(p) { return P(p[0], p[1], p[2]); },
  };
})();
