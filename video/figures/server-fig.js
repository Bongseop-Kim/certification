/* Web server cabinet (test figure for the video).
   How it works: a request comes in through the network port on the back -> the NIC on the main board -> the CPU runs
   the web server -> uploaded files are written to the disks at the front -> the power supply feeds everything.
   Parts: case (rounded steel cabinet, 4 server units in front, LEDs, fans and ports on the back, vents on top, feet);
   inside: power supply, main board, CPU heatsink, 3 RAM sticks, NIC with port, 2 disks, power and data cables.
   Coordinates: x depth 0..60 (front at x = 60), y width 0..60, z up 0..112. */
const srvW = 60, srvD = 60, srvH = 112, srvZ0 = 4;
const srvProf = rrUV(0, srvZ0, srvD, srvH, 3);
const srvGreen = matOf('#3f8f5a'), srvPsu = matOf('#74797d'), srvYel = matOf('#f4c430');

function srvFront(m){
  if (!facing([1, 0, 0])) return '';
  let s = '';
  for (const [i, z0] of [16, 40, 64, 88].entries()){
    s += box(srvW, 6, z0, srvW + 2, srvD - 6, z0 + 18, METAL, tone, .9);
    for (let k = 0; k < 4; k++) s += line([[srvW + 2, 20 + k*7, z0 + 4], [srvW + 2, 20 + k*7, z0 + 14]], .8);
    s += box(srvW + 2, 10, z0 + 7, srvW + 2.6, 13, z0 + 10, matOf(i === 1 ? '#f4c430' : '#43c25c'), toneI, .5);
  }
  return s;
}
function srvBack(){
  if (!facing([-1, 0, 0])) return '';
  let s = '';
  for (const z of [80, 50]) s += cylX(-1.5, 0, 22, z, 9, DARK, toneI, 1) + cylX(-1.5, 0, 42, z, 9, DARK, toneI, 1);
  for (let k = 0; k < 3; k++) s += box(-1.2, 8 + k*7, 96, 0, 13 + k*7, 101, srvGreen, toneI, .7);
  return s;
}
function srvTop(){
  let s = '';
  for (let k = 0; k < 6; k++) s += line([[10 + k*8, 12, srvH], [10 + k*8, srvD - 12, srvH]], .8);
  return s;
}
function srvFeet(){
  let s = '';
  for (const x of [6, srvW - 6]) for (const y of [6, srvD - 6]) s += cyl(x, y, 0, srvZ0, 3, DARK, toneI, .9, 14);
  return s;
}
function srvBody(m){
  const A = on(PX(0), srvProf), B = on(PX(srvW), srvProf);
  let s = loft(A, B, n => tone(n, m));
  if (facing([1, 0, 0])) s += fill(pd(B), tone([1, 0, 0], m));
  if (facing([-1, 0, 0])) s += fill(pd(A), tone([-1, 0, 0], m));
  return s + srvFront(m) + srvBack() + srvTop();
}
// the working parts, each sorted by its box
function srvMech(st){
  const hot = st.disk || 0;
  const parts = [
    { box: [[6, 8, 6], [40, 30, 20]], svg: box(6, 8, 6, 40, 30, 20, srvPsu) },
    { box: [[30, 8, 22], [58, 28, 32]], svg: box(30, 8, 22, 58, 28, 32, hot ? srvYel : METAL) },
    { box: [[30, 32, 22], [58, 52, 32]], svg: box(30, 32, 22, 58, 52, 32, hot ? srvYel : METAL) },
    { box: [[6, 6, 60], [54, 54, 62]], svg: box(6, 6, 60, 54, 54, 62, srvGreen) },
    { box: [[24, 18, 62], [40, 36, 72]], svg: box(24, 18, 62, 40, 36, 72, METAL) + [0, 1, 2, 3].map(k => line([[24, 20 + k*4.5, 72], [40, 20 + k*4.5, 72]], .7)).join('') },
    { box: [[14, 40, 62], [46, 41.5, 69]], svg: box(14, 40, 62, 46, 41.5, 69, DARK) },
    { box: [[14, 44, 62], [46, 45.5, 69]], svg: box(14, 44, 62, 46, 45.5, 69, DARK) },
    { box: [[14, 48, 62], [46, 49.5, 69]], svg: box(14, 48, 62, 46, 49.5, 69, DARK) },
    { box: [[0, 6, 62], [10, 26, 70]], svg: box(0, 6, 62, 10, 26, 70, srvGreen) },
    { box: [[34, 26, 20], [36, 28, 60]], svg: rod([35, 27, 20], [35, 27, 60], .9, DARK) },
    { box: [[40, 30, 27], [46, 32, 60]], svg: rod([44, 30, 32], [44, 30, 60], .8, srvYel) },
  ];
  return byDepth(parts);
}
// st.xr: see-through 0..1, st.disk: disks lit
function srvScene(st, m){
  const k = ease(Math.max(0, Math.min(1, st.xr || 0)));
  const corners = []; for (const x of [0, srvW]) for (const y of [0, srvD]) for (const z of [srvZ0, srvH]) corners.push([x, y, z]);
  let s = castShadow(corners, 0) + srvFeet();
  const body = srvBody(m);
  if (k > 0) s += xrGhost(body, `<g opacity="${f(k)}">${srvMech(st)}</g>`, k, srvProf, 0, srvW, m) + `<g opacity="${f(1 - .8*k)}">${hullInk(corners, 2.8)}</g>`;
  else s += body + hullInk(corners, 2.8);
  return s;
}
const srvLabels = [
  { key: 'cpu', at: [32, 27, 72], text: '웹 서버 프로세스' },
  { key: 'disk', at: [58, 30, 30], text: '업로드 폴더(디스크)' },
  { key: 'nic', at: [0, 16, 66], text: '네트워크 포트' },
  { key: 'psu', at: [23, 8, 13], text: '전원 공급 장치' },
];
