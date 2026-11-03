// Test scene: the colorfigures server turns round, opens in see-through and labels its parts.
const kit = window.kit, UI = window.UI;
const { seg, eo, eio, lerp } = kit;
const DUR = 12, FX = 780, FY = 140, FW = 980;
const TEXT = '서버를 한 바퀴 돌려 보면, 앞에는 서버 장비, 뒤에는 팬과 네트워크 포트가 있습니다. 케이스를 투명하게 하면 안이 보입니다. 업로드된 파일은 디스크에 저장되고, 웹 서버 프로세스는 그 파일을 실행할 수 있습니다.';

kit.scene('srv', {
  init(k) {
    this.k = k;
    const CF = this.CF = window.CF;
    this.s = FW / CF.vb[0];
    this.root = k.h('<div class="ground"><div class="desk"></div><div class="words" style="left:130px;top:110px;width:700px"><h2 class="line">서버 안을 들여다보면</h2></div></div>');
    k.stage.append(this.root);
    this.head = this.root.querySelector('.line');
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + CF.vb[0] + ' ' + CF.vb[1]);
    svg.setAttribute('style', 'position:absolute;left:' + FX + 'px;top:' + FY + 'px;width:' + FW + 'px;height:' + FW * CF.vb[1] / CF.vb[0] + 'px;overflow:visible');
    svg.innerHTML = '<defs>' + CF.defs + '</defs><g filter="url(#hand)"></g>';
    this.root.append(svg);
    this.art = svg.querySelector('g');
    this.lead = k.h('<svg class="art" viewBox="0 0 1920 1080"></svg>');
    this.root.append(this.lead);
    CF.draw({ xr: 1 }, 45);
    const order = CF.labels.map(l => ({ l, y: CF.at(l.at)[1] })).sort((a, b) => a.y - b.y).map(o => o.l);
    this.lab = order.map((l, i) => {
      const el = k.h('<div class="chip" style="left:0;top:0;font-size:34px">' + k.esc(l.text) + '</div>');
      this.root.append(el);
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#F5EEDC'); p.setAttribute('stroke-width', '4'); p.setAttribute('stroke-linecap', 'round');
      this.lead.append(p);
      return { l, el, p, cy: 300 + i * 115 };
    });
    this.cap = UI.subs(k, TEXT, DUR);
    this.root.append(this.cap.el);
  },
  render(t) {
    UI.frame(this.root, t, DUR);
    this.k.TextFx.fadeFromRight(this.head, t, 0.1);
    const yaw = 45 + 160 * eio(seg(t, 0.8, 3.6)) - 160 * eio(seg(t, 3.9, 6.4));
    const xr = eio(seg(t, 6.6, 7.6)), disk = t > 9.6 ? 1 : 0;
    const svg = this.CF.draw({ xr, disk }, yaw);
    if (svg !== this.last) { this.art.innerHTML = svg; this.last = svg; }
    this.lab.forEach((o, i) => {
      const a = 7.8 + i * 0.35, p = eo(seg(t, a, a + 0.35));
      const q = this.CF.at(o.l.at), X = FX + q[0] * this.s, Y = FY + q[1] * this.s;
      o.el.style.opacity = p;
      o.el.style.transform = 'translate(' + lerp(690, 720, p) + 'px,' + (o.cy - 36) + 'px) translateX(-100%)';
      o.el.style.background = o.l.key === 'disk' && disk ? 'var(--accent)' : '';
      o.p.setAttribute('d', 'M734 ' + o.cy + ' L' + lerp(734, X, p).toFixed(1) + ' ' + lerp(o.cy, Y, p).toFixed(1));
      o.p.style.opacity = p;
    });
    this.cap.render(t);
  },
});
