window.UI = {
  // Original guide: round white head, dot eyes, stick body, headset earpiece. Returns parts for render.
  guide(kit, x, y, s) {
    const el = kit.h('<svg class="art" viewBox="0 0 1920 1080"><g class="gd">' +
      '<g class="gd-body"><path class="ink" fill="none" d="M0 70 L0 230 M0 230 L-50 330 M0 230 L50 330"/>' +
      '<path class="ink gd-armL" fill="none" d="M0 120 L-70 190"/><path class="ink gd-armR" fill="none" d="M0 120 L75 185"/></g>' +
      '<g class="gd-head"><circle class="ink paper" cx="0" cy="-30" r="110"/>' +
      '<path class="ink" fill="none" d="M-112 -40 Q-118 -150 0 -150 Q118 -150 112 -40"/>' +
      '<rect class="ink dark" x="-132" y="-62" width="34" height="58" rx="14"/>' +
      '<path class="ink" fill="none" d="M-115 -10 Q-100 50 -40 52"/><circle class="yel ink" cx="-36" cy="52" r="9" style="stroke-width:4"/>' +
      '<g class="gd-eyes"><circle cx="-26" cy="-10" r="13" fill="#232a26"/><circle cx="30" cy="-10" r="13" fill="#232a26"/></g>' +
      '<path class="gd-mouth ink" fill="none" style="stroke-width:6" d="M-6 28 Q4 36 14 28"/></g>' +
      '</g></svg>');
    const q = c => el.querySelector('.' + c);
    return { el, root: q('gd'), head: q('gd-head'), eyes: q('gd-eyes'), mouth: q('gd-mouth'), armL: q('gd-armL'), armR: q('gd-armR'), x, y, s };
  },
  pose(g, t, o) {
    o = o || {};
    const b = 1 + Math.sin(t * 2 * Math.PI / 3.1) * 0.012;
    const dx = o.dx || 0, dy = o.dy || 0, s = (o.s || 1) * g.s;
    g.root.setAttribute('transform', 'translate(' + (g.x + dx) + ' ' + (g.y + dy) + ') scale(' + s + ' ' + (s * b) + ')');
    g.head.setAttribute('transform', 'rotate(' + (o.tilt || 0) + ')');
    const blink = (t % 3.4) > 3.27 ? 0.15 : 1;
    g.eyes.setAttribute('transform', 'translate(' + (o.look || 0) + ' ' + (-10 * (1 - blink)) + ') scale(1 ' + blink + ')');
    g.armR.setAttribute('transform', 'rotate(' + (o.armR || 0) + ' 0 120)');
    g.armL.setAttribute('transform', 'rotate(' + (o.armL || 0) + ' 0 120)');
    g.mouth.setAttribute('d', o.wow ? 'M-6 30 Q4 50 14 30 Q4 22 -6 30' : 'M-6 28 Q4 36 14 28');
  },
  // Scene in/out: content eases up on entry and dips out before the cut. Desk stays put.
  frame(root, t, dur) {
    let c = root._c;
    if (!c) {
      c = root._c = document.createElement('div');
      c.style.cssText = 'position:absolute;inset:0';
      [...root.children].forEach(n => { if (!n.classList.contains('desk')) c.append(n); });
      root.append(c);
    }
    const cl = v => Math.min(1, Math.max(0, v));
    const i = 1 - Math.pow(1 - cl(t / 0.3), 3), o = Math.pow(cl((t - dur + 0.35) / 0.35), 2);
    c.style.opacity = i * (1 - o);
    c.style.transform = 'translateY(' + (1 - i) * 16 + 'px) scale(' + (1 - o * 0.03) + ')';
  },
  // Table: rows slide in one by one; o.hl = [row, col] turns yellow after the last row.
  table(kit, o) {
    const cols = 'grid-template-columns:' + (o.widths || o.head.map(() => '1fr')).join(' ');
    const row = (r, cls, bg, top) => '<div class="' + cls + '" style="display:grid;' + cols + ';background:' + bg + ';border-top:' + (top ? '4px solid #232a26' : '0') + '">' +
      r.map((v, i) => '<div style="padding:16px 26px' + (i ? ';border-left:4px solid #232a26' : '') + '">' + v + '</div>').join('') + '</div>';
    const el = kit.h('<div style="position:absolute;left:' + o.x + 'px;top:' + o.y + 'px;width:' + o.w + 'px;border:6px solid #232a26;border-radius:22px;overflow:hidden;background:var(--main);color:#232a26;font-size:' + (o.size || 40) + 'px;font-weight:700;line-height:1.3">' +
      row(o.head, 'tb-h', 'color-mix(in srgb, var(--second) 85%, var(--ground))', false) + o.rows.map(r => row(r, 'tb-r', 'var(--main)', true)).join('') + '</div>');
    const rows = [...el.querySelectorAll('.tb-r')];
    const hl = o.hl && rows[o.hl[0]].children[o.hl[1]];
    return { el, render(t, t0 = 0) {
      const { seg, eo, lerp } = kit, st = o.step || 0.35;
      el.style.opacity = eo(seg(t, t0, t0 + 0.3));
      rows.forEach((r, i) => { const p = eo(seg(t, t0 + 0.4 + i * st, t0 + 0.8 + i * st)); r.style.opacity = p; r.style.transform = 'translateX(' + lerp(-40, 0, p) + 'px)'; });
      if (hl) { const a = t0 + 0.6 + rows.length * st; hl.style.background = 'color-mix(in srgb, var(--accent) ' + Math.round(100 * eo(seg(t, a, a + 0.4))) + '%, var(--main))'; }
    } };
  },
  // Flow: boxes pop in left to right, arrows draw between them. cut = {i, at} crosses out arrow i and dims what follows.
  flow(kit, o) {
    const arrow = '<svg width="110" height="60" viewBox="0 0 110 60" style="flex:none;overflow:visible"><path class="fl-a" d="M8 30 H92 M78 16 L96 30 L78 44" fill="none" stroke="var(--second)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="140"/>' +
      '<path class="fl-x" d="M36 4 L74 56 M74 4 L36 56" fill="none" stroke="#e5484d" stroke-width="12" stroke-linecap="round" stroke-dasharray="130" opacity="0"/></svg>';
    const node = v => '<div class="fl-n" style="flex:none;background:var(--main);border:6px solid #232a26;border-radius:22px;padding:22px 30px;font-size:' + (o.size || 40) + 'px;font-weight:800;color:#232a26;white-space:nowrap">' + v + '</div>';
    const el = kit.h('<div style="position:absolute;left:' + o.x + 'px;top:' + o.y + 'px;display:flex;align-items:center;gap:6px">' + o.nodes.map(node).join(arrow) + '</div>');
    const ns = [...el.querySelectorAll('.fl-n')], as = [...el.querySelectorAll('.fl-a')], xs = [...el.querySelectorAll('.fl-x')];
    return { el, render(t, t0 = 0, cut) {
      const { seg, eo, eob, lerp } = kit, st = o.step || 0.6;
      const dim = cut ? lerp(1, 0.4, eo(seg(t, cut.at + 0.2, cut.at + 0.6))) : 1;
      ns.forEach((n, i) => { const a = t0 + i * st, p = eob(seg(t, a, a + 0.45), 1.5); n.style.opacity = seg(t, a, a + 0.1) * (cut && i > cut.i ? dim : 1); n.style.transform = 'scale(' + lerp(0.7, 1, p) + ')'; });
      as.forEach((a, i) => a.setAttribute('stroke-dashoffset', 140 * (1 - eo(seg(t, t0 + i * st + 0.3, t0 + (i + 1) * st)))));
      xs.forEach((x, i) => { const p = cut && cut.i === i ? eo(seg(t, cut.at, cut.at + 0.35)) : 0; x.setAttribute('opacity', p > 0 ? 1 : 0); x.setAttribute('stroke-dashoffset', 130 * (1 - p)); });
    } };
  },
};
