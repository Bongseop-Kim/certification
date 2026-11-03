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

  // Subtitles: one sentence at a time, timed by syllable share of the scene. Spoken spellings shown as written.
  SUBS: [['셸 점 피에이치피 점 제이피지', 'shell.php.jpg'], ['셸 점 피에이치피', 'shell.php'], ['점 제이피지', '.jpg'], ['퍼센트 피디에프', '%PDF'],
    ['물음표 씨엠디 이퀄', '?cmd='], ['씨엠디 이퀄', 'cmd='], ['씨엠디', 'cmd'], ['셸 익젝', 'shell_exec'], ['피에이치피 어드민 플래그 엔진 오프', 'php_admin_flag engine off'],
    ['피에이치피', 'PHP'], ['피디에프', 'PDF'], ['지아이에프', 'GIF'], ['마임 타입', 'MIME 타입'],
    ['에스에이치 하이픈 소문자 아이', 'sh -i'], ['슬래시 데브 슬래시 티씨피', '/dev/tcp'], ['하이픈 소문자 이', '-e'], ['넷캣', 'netcat'],
    ['파인드 슬래시 하이픈 펌 하이픈 사천 하이픈 타입 에프', 'find / -perm -4000 -type f'], ['하이픈 이천', '-2000'], ['시에이치모드 하이픈 에스', 'chmod -s'],
    ['셋 유아이디', 'SetUID'], ['셋 지아이디', 'SetGID'], ['스티키 비트', 'Sticky Bit'], ['슬래시 티엠피', '/tmp'], ['패스워드 명령', 'passwd 명령'],
    ['더블유티엠피', 'wtmp'], ['비티엠피', 'btmp'], ['라스트비', 'lastb'], ['라스트컴', 'lastcomm'], ['라스트 명령', 'last 명령'], ['피에이씨씨티', 'pacct'], ['액셉톤', 'accton'],
    ['점 배시 히스토리', '.bash_history'], ['유저애드', 'useradd'], ['유네임', 'uname'], ['액세스 로그', 'access_log'], ['에러 로그', 'error_log'], ['이그레스 필터링', 'Egress 필터링']],
  subs(kit, text, dur) {
    let w = text;
    for (const [a, b] of UI.SUBS) w = w.split(a).join(b);
    const ss = w.split(/(?<=[.?!])\s+/).filter(Boolean);
    const len = x => [...x].filter(c => c >= '가' && c <= '힣').length + 4;
    const tot = ss.reduce((a, x) => a + len(x), 0), span = Math.max(1, dur - 0.5);
    let acc = 0.25;
    const cues = ss.map(x => { const c = { a: acc, x }; acc += span * len(x) / tot; return c; });
    const el = kit.h('<div class="cap"></div>');
    let shown = -1;
    return { el, render(t) {
      let i = 0; while (i + 1 < cues.length && t >= cues[i + 1].a) i++;
      if (i !== shown) { el.textContent = cues[i].x; shown = i; }
      el.style.opacity = kit.eo(kit.seg(t, cues[0].a - 0.25, cues[0].a + 0.05));
    } };
  },
  // Terminal or log panel: lines appear one by one; hl lines get a yellow bar.
  code(kit, o) {
    const el = kit.h('<div class="mono" style="position:absolute;left:' + o.x + 'px;top:' + o.y + 'px;width:' + o.w + 'px;background:#14201a;border:6px solid #232a26;border-radius:22px;padding:26px 34px;box-sizing:border-box;color:#d8f5e3;font-size:' + (o.size || 34) + 'px;line-height:1.55">' +
      (o.title ? '<div style="color:color-mix(in srgb, var(--second) 60%, #14201a);font-size:26px;margin-bottom:10px">' + kit.esc(o.title) + '</div>' : '') +
      o.lines.map(l => '<div class="cd-l" style="white-space:pre;border-radius:8px;padding:0 10px;margin:0 -10px">' + kit.esc(l) + '</div>').join('') + '</div>');
    const ls = [...el.querySelectorAll('.cd-l')], hl = o.hl || [];
    return { el, render(t, t0 = 0) {
      const { seg, eo, lerp } = kit, st = o.step || 0.5;
      el.style.opacity = eo(seg(t, t0, t0 + 0.3));
      el.style.transform = 'translateY(' + lerp(24, 0, eo(seg(t, t0, t0 + 0.4))) + 'px)';
      ls.forEach((l, i) => { const a = t0 + 0.3 + i * st; l.style.opacity = eo(seg(t, a, a + 0.25)); });
      const h = eo(seg(t, t0 + 0.6 + ls.length * st, t0 + 1 + ls.length * st));
      hl.forEach(i => { ls[i].style.background = 'color-mix(in srgb, var(--accent) ' + Math.round(h * 32) + '%, transparent)'; ls[i].style.color = h > 0.5 ? '#FFE680' : ''; });
    } };
  },
  // Definition card: tag chip, big term, one-line meaning.
  term(kit, o) {
    const el = kit.h('<div style="position:absolute;left:' + o.x + 'px;top:' + o.y + 'px;width:' + o.w + 'px;background:var(--main);border:6px solid #232a26;border-radius:28px;padding:40px 48px;box-sizing:border-box;color:#232a26">' +
      '<div class="tm-tag" style="display:inline-block;background:var(--accent);border:5px solid #232a26;border-radius:40px;padding:4px 22px;font-size:32px;font-weight:800">' + kit.esc(o.tag || '정의') + '</div>' +
      '<div class="tm-term" style="font-size:' + (o.size || 76) + 'px;font-weight:800;margin:22px 0 16px;line-height:1.15">' + kit.esc(o.term) + '</div>' +
      '<div class="tm-def" style="font-size:40px;font-weight:600;line-height:1.4;color:color-mix(in srgb, #232a26 80%, var(--main))">' + kit.esc(o.def) + '</div></div>');
    const term = el.querySelector('.tm-term'), def = el.querySelector('.tm-def').style;
    return { el, render(t, t0 = 0) {
      const { seg, eo, eob, lerp } = kit;
      el.style.opacity = seg(t, t0, t0 + 0.12);
      el.style.transform = 'scale(' + lerp(0.85, 1, eob(seg(t, t0, t0 + 0.5), 1.5)) + ')';
      kit.TextFx.fadeFromRight(term, t, t0 + 0.3);
      def.opacity = eo(seg(t, t0 + 1.1, t0 + 1.6));
    } };
  },
  // Two cards side by side, left then right.
  compare(kit, o) {
    const card = (c, cls) => '<div class="' + cls + '" style="flex:1;background:var(--main);border:6px solid #232a26;border-radius:28px;padding:36px 40px;color:#232a26">' +
      '<div style="font-size:52px;font-weight:800;margin-bottom:18px">' + kit.esc(c.h) + '</div>' +
      c.lines.map(l => '<div style="font-size:38px;font-weight:600;line-height:1.45">' + kit.esc(l) + '</div>').join('') + '</div>';
    const el = kit.h('<div style="position:absolute;left:' + o.x + 'px;top:' + o.y + 'px;width:' + o.w + 'px;display:flex;gap:40px">' + card(o.left, 'cp-l') + card(o.right, 'cp-r') + '</div>');
    const cs = [el.querySelector('.cp-l').style, el.querySelector('.cp-r').style];
    return { el, render(t, t0 = 0) {
      const { seg, eo, lerp } = kit;
      cs.forEach((c, i) => { const p = eo(seg(t, t0 + i * (o.gap || 1.2), t0 + i * (o.gap || 1.2) + 0.5)); c.opacity = p; c.transform = 'translateY(' + lerp(40, 0, p) + 'px)'; });
    } };
  },
  // Numbered rows, one by one.
  list(kit, o) {
    const row = (txt, i) => '<div class="ls-r" style="display:flex;align-items:center;gap:28px"><span style="flex:none;width:76px;height:76px;border-radius:50%;background:var(--accent);border:6px solid #232a26;display:grid;place-items:center;font-size:44px;font-weight:800;color:#232a26">' + (i + 1) + '</span>' +
      '<span class="line" style="font-size:' + (o.size || 56) + 'px">' + kit.esc(txt) + '</span></div>';
    const el = kit.h('<div style="position:absolute;left:' + o.x + 'px;top:' + o.y + 'px;display:flex;flex-direction:column;gap:' + (o.gap || 30) + 'px">' + o.items.map(row).join('') + '</div>');
    const rs = [...el.querySelectorAll('.ls-r')];
    return { el, render(t, t0 = 0) {
      const { seg, eo, lerp } = kit, st = o.step || 0.6;
      rs.forEach((r, i) => { const p = eo(seg(t, t0 + i * st, t0 + i * st + 0.45)); r.style.opacity = p; r.style.transform = 'translateX(' + lerp(-50, 0, p) + 'px)'; });
    } };
  },
  // A whole scene from a spec: {id, dur, text, head, hl, main:{kind, t0, ...}, guide:{x,y,s,pose(t)}, bubble:{text,x,y,at}}.
  auto(spec) {
    return {
      init(kit) {
        this.k = kit;
        const root = kit.h('<div class="ground"><div class="desk"></div></div>');
        kit.stage.append(root);
        this.root = root;
        if (spec.head) { const w = kit.h('<div class="words" style="left:130px;top:' + (spec.headY || 110) + 'px;width:' + (spec.headW || 1500) + 'px"><h2 class="line' + (spec.hl ? ' hl' : '') + '"' + (spec.headSize ? ' style="font-size:' + spec.headSize + 'px"' : '') + '>' + kit.esc(spec.head) + '</h2>' + (spec.sub ? '<p class="sub">' + kit.esc(spec.sub) + '</p>' : '') + '</div>'); root.append(w); this.head = w.querySelector('.line'); this.sub = w.querySelector('.sub'); }
        if (spec.main) { const m = spec.main; this.main = UI[m.kind](kit, m); root.append(this.main.el); }
        if (spec.bubble) { this.bub = kit.h('<div class="bubble" style="left:' + spec.bubble.x + 'px;top:' + spec.bubble.y + 'px;font-size:' + (spec.bubble.size || 48) + 'px">' + kit.esc(spec.bubble.text) + '</div>'); root.append(this.bub); }
        if (spec.guide) { const g = spec.guide; this.g = UI.guide(kit, g.x, g.y, g.s || 0.9); root.append(this.g.el); }
        this.cap = UI.subs(kit, spec.text, spec.dur); root.append(this.cap.el);
      },
      render(t) {
        const kit = this.k, { seg, eo, eob, lerp } = kit;
        UI.frame(this.root, t, spec.dur);
        if (this.head) kit.TextFx.fadeFromRight(this.head, t, spec.headT ?? 0.15);
        if (this.sub) this.sub.style.opacity = eo(seg(t, 0.9, 1.3));
        if (this.main) { const m = spec.main; this.main.render(t, m.t0 ?? 0.6, m.cut); }
        if (this.bub) { const a = spec.bubble.at; this.bub.style.opacity = seg(t, a, a + 0.12); this.bub.style.transform = 'scale(' + lerp(0.5, 1, eob(seg(t, a, a + 0.5), 1.8)) + ')'; }
        if (this.g) UI.pose(this.g, t, spec.guide.pose ? spec.guide.pose(t, kit) : { look: -10 });
        this.cap.render(t);
      },
    };
  },
};
