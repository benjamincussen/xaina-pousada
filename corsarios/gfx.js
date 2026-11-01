// gfx.js — todo lo que se ve: mar turquesa animado, rocas, viento, remolinos, barcos, cañonazos, humo, fuego y salpicaduras
'use strict';
const GFX = (() => {
  let cv, ctx, W = 0, H = 0, DPR = 1, tile = 32, ox = 0, oy = 0, T = 0, shake = 0, flashScr = 0;
  const parts = [], projs = [], floats = [], rings = [], tweens = [];
  let scene = null;
  const ease = p => p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const angOf = d => d * Math.PI / 2 - Math.PI / 2;
  const cx = x => ox + (x + .5) * tile, cy = y => oy + (y + .5) * tile;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const SHIP_K = 1.5;   // los barcos se dibujan un poco más grandes que su casilla

  // ---------- tamaño: el tablero ocupa todo el ancho y el alto libre entre la barra de arriba y el panel ----------
  let insets = { top: 0, bottom: 0 };
  function resize(canvas, stage, ins) {
    cv = canvas; ctx = cv.getContext('2d'); DPR = Math.min(2, window.devicePixelRatio || 1); if (ins) insets = ins;
    const r = stage.getBoundingClientRect(); W = r.width; H = r.height; cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR); cv.style.width = W + 'px'; cv.style.height = H + 'px';
    const availH = H - insets.top - insets.bottom;
    tile = Math.max(18, Math.min(72, Math.min(W / BW, availH / BH))); ox = (W - tile * BW) / 2; oy = insets.top + (availH - tile * BH) / 2;
  }

  // ---------- mar ----------
  function drawSea(x0, y0, w, h, grid) {
    const g = ctx.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, '#36b4dc'); g.addColorStop(1, '#1a7fbd'); ctx.fillStyle = g; ctx.fillRect(x0, y0, w, h);
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, w, h); ctx.clip();
    if (grid) { for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) if ((x + y) % 2) { ctx.fillStyle = 'rgba(255,255,255,.035)'; ctx.fillRect(ox + x * tile, oy + y * tile, tile, tile); } }
    for (let i = 0; i < 7; i++) { const px = x0 + ((i * 0.37 + T * .015) % 1) * w, py = y0 + ((i * .61) % 1) * h, r = Math.max(w, h) * .25;
      const rg = ctx.createRadialGradient(px, py, 0, px, py, r); rg.addColorStop(0, 'rgba(160,235,255,.12)'); rg.addColorStop(1, 'rgba(160,235,255,0)'); ctx.fillStyle = rg; ctx.fillRect(px - r, py - r, r * 2, r * 2); }
    ctx.lineCap = 'round'; const n = Math.floor(w * h / 1800);
    for (let i = 0; i < n; i++) { const sx = (i * 97.13) % 1, sy = (i * 61.71) % 1, x = x0 + ((sx * w + T * (8 + (i % 4) * 3)) % w), y = y0 + sy * h + Math.sin(T + i) * 3;
      const a = .14 + .16 * (.5 + .5 * Math.sin(T * 1.6 + i * 1.7)), len = 5 + (i % 3) * 3;
      ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - len, y + 1); ctx.quadraticCurveTo(x - len / 2, y - 3, x, y); ctx.quadraticCurveTo(x + len / 2, y + 3, x + len, y - 1); ctx.stroke(); }
    if (grid) { ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i <= BW; i++) { ctx.moveTo(ox + i * tile, oy); ctx.lineTo(ox + i * tile, oy + BH * tile); }
      for (let j = 0; j <= BH; j++) { ctx.moveTo(ox, oy + j * tile); ctx.lineTo(ox + BW * tile, oy + j * tile); } ctx.stroke(); }
    ctx.restore();
  }

  // ---------- elementos del mapa ----------
  const OL = '#1d2c36';
  function drawRock(x, y, tall, v) {
    const px = cx(x), py = cy(y), s = tile, R = n => Math.sin(v * 99 + n * 13.7) * .5 + .5;
    ctx.save(); ctx.translate(px, py);
    const fo = 1 + Math.sin(T * 2.2 + v * 9) * .06;
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.ellipse(0, s * .1, s * .47 * fo, s * .36 * fo, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(30,110,150,.6)'; ctx.beginPath(); ctx.ellipse(0, s * .1, s * .41, s * .3, 0, 0, 7); ctx.fill();
    if (tall) {
      const lumps = [[-.12, .02, .27], [.13, .06, .22], [0, -.1, .24]];
      lumps.forEach(([lx, ly, r], k) => { const X = lx * s, Y = ly * s, rr = r * s * (.9 + R(k) * .2), h = s * (.18 + R(k + 3) * .1);
        ctx.fillStyle = OL; ctx.beginPath(); ctx.moveTo(X - rr, Y + rr * .45); ctx.lineTo(X - rr * .7, Y - h); ctx.lineTo(X - rr * .1, Y - h - rr * .55); ctx.lineTo(X + rr * .6, Y - h * .8); ctx.lineTo(X + rr, Y + rr * .45); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#7f8a8f'; ctx.beginPath(); ctx.moveTo(X - rr * .86, Y + rr * .35); ctx.lineTo(X - rr * .6, Y - h * .9); ctx.lineTo(X - rr * .08, Y - h - rr * .42); ctx.lineTo(X + rr * .52, Y - h * .72); ctx.lineTo(X + rr * .86, Y + rr * .35); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#b9c3c4'; ctx.beginPath(); ctx.moveTo(X - rr * .6, Y - h * .9); ctx.lineTo(X - rr * .08, Y - h - rr * .42); ctx.lineTo(X + rr * .05, Y - h * .2); ctx.lineTo(X - rr * .45, Y); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#5b666c'; ctx.beginPath(); ctx.moveTo(X + rr * .05, Y - h * .2); ctx.lineTo(X + rr * .52, Y - h * .72); ctx.lineTo(X + rr * .86, Y + rr * .35); ctx.lineTo(X + rr * .1, Y + rr * .35); ctx.closePath(); ctx.fill(); });
    } else {
      for (const [lx, ly, r] of [[-.13, .08, .2], [.14, .1, .16], [0, -.02, .15]]) { ctx.fillStyle = OL; ctx.beginPath(); ctx.ellipse(lx * s, ly * s, r * s + 1.5, r * s * .62 + 1.5, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#7a6a4f'; ctx.beginPath(); ctx.ellipse(lx * s, ly * s, r * s, r * s * .62, 0, 0, 7); ctx.fill();
        ctx.fillStyle = '#5f8f4e'; ctx.beginPath(); ctx.ellipse(lx * s - r * s * .2, ly * s - r * s * .2, r * s * .55, r * s * .3, 0, 0, 7); ctx.fill(); }
      ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, s * .12, s * .38 * fo, s * .2 * fo, 0, .2, Math.PI - .2); ctx.stroke();
    }
    ctx.restore();
  }
  function drawWind(x, y, d) {
    const px = cx(x), py = cy(y), s = tile; ctx.save(); ctx.translate(px, py); ctx.rotate(angOf(d) + Math.PI / 2);
    ctx.fillStyle = 'rgba(220,250,255,.2)'; ctx.fillRect(-s / 2 + 1, -s / 2 + 1, s - 2, s - 2);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (let k = 0; k < 2; k++) { const ph = (T * .8 + k / 2) % 1, yy = s * .42 - ph * s * .84, a = Math.sin(ph * Math.PI);
      ctx.globalAlpha = a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = Math.max(2, s * .09); ctx.beginPath(); ctx.moveTo(-s * .24, yy + s * .15); ctx.lineTo(0, yy); ctx.lineTo(s * .24, yy + s * .15); ctx.stroke(); }
    ctx.restore();
  }
  function drawWhirl(wx, wy, cw) {
    const px = ox + (wx + 1) * tile, py = oy + (wy + 1) * tile, R = tile * .98; ctx.save(); ctx.translate(px, py);
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, R); g.addColorStop(0, '#062c48'); g.addColorStop(.55, 'rgba(12,80,130,.8)'); g.addColorStop(1, 'rgba(30,130,190,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
    ctx.rotate((cw ? 1 : -1) * T * 1.6); ctx.lineCap = 'round';
    for (let k = 0; k < 4; k++) { ctx.strokeStyle = `rgba(255,255,255,${.35 + k * .12})`; ctx.lineWidth = 2 + k * .5; ctx.beginPath();
      for (let i = 0; i <= 26; i++) { const a = k * Math.PI / 2 + i * .14 * (cw ? 1 : -1), r = R * (.96 - i / 26 * .82); i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke(); }
    ctx.restore();
  }

  // ---------- barcos (dibujo con contorno, colores vivos) ----------
  function drawShip(c, type, team, px, py, ang, size, o = {}) {
    const S = SHIPS[type], L = S.len * size, B = S.beam * size, en = team === 'e', lw = Math.max(1.4, size * .035), cu = !en && o.custom ? o.custom : null;
    c.save(); c.translate(px, py); if (o.scale) c.scale(o.scale, o.scale); c.rotate(ang + (o.tilt || 0)); c.globalAlpha = o.alpha == null ? 1 : o.alpha;
    c.fillStyle = 'rgba(0,30,60,.3)'; c.beginPath(); c.ellipse(size * .04, size * .08, L * .56, B * .7, 0, 0, 7); c.fill();
    if (o.wake) { c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = Math.max(1.5, size * .04); c.lineCap = 'round'; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(-L * .4, sd * B * .32); c.quadraticCurveTo(-L * .7, sd * B * .55, -L * 1.05, sd * B * 1); c.stroke(); } }
    const hull = (k = 1) => { c.beginPath(); c.moveTo(L * .54 * k, 0); c.bezierCurveTo(L * .38 * k, -B * .55 * k, L * .02 * k, -B * .58 * k, -L * .32 * k, -B * .5 * k); c.quadraticCurveTo(-L * .5 * k, -B * .45 * k, -L * .5 * k, 0);
      c.quadraticCurveTo(-L * .5 * k, B * .45 * k, -L * .32 * k, B * .5 * k); c.bezierCurveTo(L * .02 * k, B * .58 * k, L * .38 * k, B * .55 * k, L * .54 * k, 0); c.closePath(); };
    c.fillStyle = '#26282b'; c.strokeStyle = OL; c.lineWidth = 1;
    for (let i = 0; i < S.ports; i++) { const x = -L * .26 + i * (L * .46 / Math.max(1, S.ports - 1)); for (const sd of [-1, 1]) { c.beginPath(); c.rect(x - size * .035, sd > 0 ? B * .38 : -B * .38 - size * .11, size * .07, size * .11); c.fill(); c.stroke(); } }
    hull(); c.fillStyle = en ? '#3d2418' : cu ? cu.hull : '#8a4f25'; c.fill(); c.lineWidth = lw; c.strokeStyle = OL; c.stroke();
    hull(.92); c.lineWidth = Math.max(1.5, size * .045); c.strokeStyle = en ? '#c0392b' : cu ? cu.trim : '#f2c14e'; c.stroke();
    hull(.82); c.fillStyle = en ? '#7a5238' : '#e0b07a'; c.fill();
    c.save(); hull(.82); c.clip(); c.strokeStyle = en ? 'rgba(40,20,10,.35)' : 'rgba(120,70,30,.35)'; c.lineWidth = 1; for (let k = -3; k <= 3; k++) { c.beginPath(); c.moveTo(-L / 2, k * B * .1); c.lineTo(L / 2, k * B * .1); c.stroke(); }
    c.fillStyle = en ? '#5a3a26' : '#c48a50'; c.fillRect(-L * .42, -B * .3, L * .12, B * .6); c.restore();
    c.strokeStyle = OL; c.lineWidth = Math.max(2, size * .04); c.beginPath(); c.moveTo(L * .45, 0); c.lineTo(L * .74, 0); c.stroke();
    const bel = size * (o.moving ? .27 : .22);
    for (let m = 0; m < S.masts; m++) { const mx = S.masts === 1 ? L * .04 : L * .24 - m * (L * .5 / (S.masts - 1)), sw = B * (S.masts > 1 && m === 0 ? .82 : .98);
      c.beginPath(); c.moveTo(mx - size * .03, -sw); c.quadraticCurveTo(mx + bel, 0, mx - size * .03, sw); c.lineTo(mx - size * .06, sw * .9); c.quadraticCurveTo(mx + bel * .25, 0, mx - size * .06, -sw * .9); c.closePath();
      const sg = c.createLinearGradient(mx - size * .06, 0, mx + bel, 0); sg.addColorStop(0, en ? '#1d1d21' : cu ? cu.sail[0] : '#e9dfc8'); sg.addColorStop(1, en ? '#45454c' : cu ? cu.sail[1] : '#ffffff'); c.fillStyle = sg; c.fill(); c.lineWidth = lw; c.strokeStyle = OL; c.stroke();
      c.save(); c.clip(); c.fillStyle = en ? '#c0392b' : cu ? cu.stripe : '#2f74c0'; c.fillRect(mx - size, -sw * .22, size * 2, sw * .44);
      if (o.torn) { c.strokeStyle = '#1a1a1a'; c.lineWidth = Math.max(1.2, size * .03); for (let k = 0; k < o.torn * 2; k++) { const yy = -sw * .7 + k * sw * .45; c.beginPath(); c.moveTo(mx, yy); c.lineTo(mx + bel * .5, yy + sw * .12); c.lineTo(mx + bel * .2, yy + sw * .22); c.stroke(); } }
      c.restore();
      if (en && m === Math.floor(S.masts / 2)) { const kx = mx + bel * .45; c.fillStyle = '#f2ead8'; c.beginPath(); c.arc(kx, 0, size * .06, 0, 7); c.fill(); c.fillStyle = '#1b1b1b'; c.beginPath(); c.arc(kx - size * .02, -size * .02, size * .014, 0, 7); c.arc(kx - size * .02, size * .02, size * .014, 0, 7); c.fill(); }
      c.fillStyle = '#5a3415'; c.strokeStyle = OL; c.lineWidth = 1; c.beginPath(); c.arc(mx, 0, size * .045, 0, 7); c.fill(); c.stroke(); }
    const fl = Math.sin(T * 7 + px * .05) * size * .04; c.fillStyle = en ? '#141416' : cu ? cu.flag : '#2f74c0'; c.strokeStyle = OL; c.lineWidth = 1; c.beginPath(); c.moveTo(-L * .48, -size * .02);
    c.quadraticCurveTo(-L * .48 - size * .12, -size * .08 + fl, -L * .48 - size * .26, -size * .02 + fl); c.lineTo(-L * .48 - size * .26, size * .09 + fl); c.quadraticCurveTo(-L * .48 - size * .12, size * .03 + fl, -L * .48, size * .09); c.closePath(); c.fill(); c.stroke();
    if (o.flash > 0) { hull(); c.fillStyle = `rgba(255,60,30,${o.flash * .6})`; c.fill(); }
    c.restore();
  }
  const RS = {};
  function syncShip(s) { RS[s.id] = { x: s.x, y: s.y, a: angOf(s.d), sink: s.sunk ? 1 : 0, moving: false, bob: Math.random() * 6, flash: 0, rec: 0, recA: 0 }; }

  // ---------- partículas ----------
  function puff(x, y, n, o) { for (let i = 0; i < n; i++) { const a = o.dir != null ? o.dir + rnd(-o.spread, o.spread) : rnd(0, Math.PI * 2), v = rnd(o.sp * .3, o.sp);
    parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up || 0), z: 0, vz: o.vz ? rnd(o.vz * .5, o.vz) : 0, life: rnd(o.life * .6, o.life), max: o.life, r: rnd(o.r * .6, o.r), grow: o.grow || 0, col: o.col, kind: o.kind || 'dot', rot: rnd(0, 6), vr: rnd(-9, 9), drag: o.drag || .94 }); } }
  const smoke = (x, y, n, k = 1, dir, spread = 3.2) => puff(x, y, n, { sp: tile * .9 * k, life: 2.2, r: tile * .2 * k, grow: tile * .45 * k, col: '235,235,235', kind: 'smoke', up: tile * .15, dir, spread, drag: .9 });
  function muzzle(x, y, dir) {
    puff(x, y, 1, { sp: 0, life: .18, r: tile * .9, col: '255,240,180', kind: 'glow' });
    puff(x, y, 14, { sp: tile * 4, life: .22, r: tile * .1, col: '255,200,90', kind: 'dot', dir, spread: .35 });
    smoke(x, y, 9, 1, dir, .7); flashScr = Math.max(flashScr, .08);
  }
  function splashFx(x, y) { puff(x, y, 26, { sp: tile * .9, life: 1, r: tile * .07, col: '255,255,255', kind: 'drop', vz: tile * 7 }); rings.push({ x, y, t: 0, max: 1.2, r: tile * .7 }); rings.push({ x, y, t: -.15, max: 1.2, r: tile * .45 }); }
  function boom(x, y, big = 1) { puff(x, y, 1, { sp: 0, life: .35, r: tile * 1.4 * big, col: '255,190,90', kind: 'glow' }); puff(x, y, 1, { sp: 0, life: .2, r: tile * .7 * big, col: '255,255,220', kind: 'glow' });
    puff(x, y, 24, { sp: tile * 3, life: .6, r: tile * .11, col: '255,140,40', kind: 'dot' }); puff(x, y, 14, { sp: tile * 2.2, life: 1.2, r: tile * .07, col: '110,64,30', kind: 'wood', vz: tile * 5 });
    smoke(x, y, 10, 1.1); puff(x, y, 6, { sp: tile * .4, life: 1.5, r: tile * .2, grow: tile * .3, col: '60,55,55', kind: 'smoke', up: tile * .3 }); shake = Math.max(shake, tile * .35 * big); flashScr = Math.max(flashScr, .18); }
  function dust(x, y) { puff(x, y, 14, { sp: tile * 1.6, life: .8, r: tile * .08, col: '160,160,150', kind: 'dot' }); puff(x, y, 8, { sp: tile * 3, life: .25, r: tile * .04, col: '255,230,160', kind: 'dot' }); shake = Math.max(shake, tile * .12); }
  function floatTxt(x, y, txt, col, big = 1) { floats.push({ x, y, txt, col, t: 0, big }); }

  // ---------- animaciones ----------
  function tween(dur, fn) { return new Promise(res => tweens.push({ t: 0, dur, fn, res })); }
  const wait = ms => tween(ms / 1000, () => {});
  function playMoves(ev) {
    const ps = [];
    for (const m of ev.moves) { const r = RS[m.id]; if (!r || !m.m) continue; const a0 = angOf(m.from.d); let a1 = angOf(m.to.d); while (a1 - a0 > Math.PI) a1 -= Math.PI * 2; while (a1 - a0 < -Math.PI) a1 += Math.PI * 2; r.moving = true;
      if (m.via) ps.push(tween(.8, p => { const e = ease(p), u = 1 - e; r.x = u * u * m.from.x + 2 * u * e * m.via.x + e * e * m.to.x; r.y = u * u * m.from.y + 2 * u * e * m.via.y + e * e * m.to.y; r.a = a0 + (a1 - a0) * e; }));
      else if (m.bump) { const stay = m.to.x === m.from.x && m.to.y === m.from.y, bx = m.bump.x - m.to.x, by = m.bump.y - m.to.y, kk = stay ? 1 : .5;
        ps.push(tween(.7, p => { const e = ease(p), k = Math.sin(p * Math.PI) * .32 * kk; r.x = m.from.x + (m.to.x - m.from.x) * e + bx * k; r.y = m.from.y + (m.to.y - m.from.y) * e + by * k; r.a = a0 + (a1 - a0) * e; })); }
      else ps.push(tween(.65, p => { const e = ease(p); r.x = m.from.x + (m.to.x - m.from.x) * e; r.y = m.from.y + (m.to.y - m.from.y) * e; r.a = a0 + (a1 - a0) * e; })); }
    if (ev.moves.some(m => m.m)) SFX.creak();
    for (const k of ev.rams) setTimeout(() => { const r = RS[k.id]; if (!r) return; const x = (cx(k.x) + cx(r.x)) / 2, y = (cy(k.y) + cy(r.y)) / 2; dust(x, y); r.flash = 1;
      if (k.why === 'ship') puff(x, y, 10, { sp: tile * 1.5, life: .9, r: tile * .06, col: '110,64,30', kind: 'wood', vz: tile * 3 }); floatTxt(x, y - tile * .3, k.why === 'rock' ? '¡Choque!' : '¡Embestida!', '#ffd38a', .8); SFX.rock(); }, 300);
    return Promise.all(ps).then(() => { for (const m of ev.moves) { const r = RS[m.id]; if (r) { r.x = m.to.x; r.y = m.to.y; r.a = angOf(m.to.d); r.moving = false; } } });
  }
  function playEnv(ev) {
    if (!ev.env.length) return Promise.resolve(); const ps = []; SFX.swoosh();
    for (const e of ev.env) { const r = RS[e.id], a0 = r.a; let a1 = angOf(e.to.d); while (a1 - a0 > Math.PI) a1 -= Math.PI * 2; while (a1 - a0 < -Math.PI) a1 += Math.PI * 2;
      if (e.kind === 'wind') ps.push(tween(.55, p => { const q = ease(p); r.x = e.from.x + (e.to.x - e.from.x) * q; r.y = e.from.y + (e.to.y - e.from.y) * q; }));
      else { const t0 = scene.map[e.from.y][e.from.x], c = { x: t0.wx + .5, y: t0.wy + .5 }, sx = e.from.x - c.x, sy = e.from.y - c.y, turn = (t0.cw ? 1 : -1) * Math.PI, still = e.to.x === e.from.x && e.to.y === e.from.y;
        ps.push(tween(.85, p => { const q = ease(p), th = turn * q; r.x = still ? e.from.x : c.x + sx * Math.cos(th) - sy * Math.sin(th); r.y = still ? e.from.y : c.y + sx * Math.sin(th) + sy * Math.cos(th); r.a = a0 + (a1 - a0) * q; })); } }
    return Promise.all(ps).then(() => { for (const e of ev.env) { const r = RS[e.id]; r.x = e.to.x; r.y = e.to.y; r.a = angOf(e.to.d); } });
  }
  // cañonazos: fogonazo, retroceso, bala con estela en arco, y un impacto que se nota
  function playShots(ev) {
    if (!ev.shots.length) return Promise.resolve(); const ps = [];
    const byShip = {}; for (const s of ev.shots) (byShip[s.id] = byShip[s.id] || []).push(s);
    Object.values(byShip).forEach((list, si) => list.forEach((s, li) => { for (let k = 0; k < s.n; k++) {
      const delay = si * .45 + li * .3 + k * .16, sd = s.side === 'L' ? (s.from.d + 3) % 4 : (s.from.d + 1) % 4, fwd = s.from.d, off = (k - (s.n - 1) / 2) * .28;
      const x0 = s.from.x + DX[sd] * .42 + DX[fwd] * off, y0 = s.from.y + DY[sd] * .42 + DY[fwd] * off, x1 = s.to.x + DX[fwd] * off * .3, y1 = s.to.y + DY[fwd] * off * .3;
      ps.push(wait(delay * 1000).then(() => { const fx = cx(x0), fy = cy(y0), dir = Math.atan2(DY[sd], DX[sd]); muzzle(fx, fy, dir); SFX.cannon();
        const r = RS[s.id]; if (r) { r.recA = Math.atan2(-DY[sd], -DX[sd]); r.rec = 1; }
        return new Promise(res => projs.push({ x0: fx, y0: fy, x1: cx(x1), y1: cy(y1), am: s.am, t: 0, dur: .55 + Math.hypot(x1 - x0, y1 - y0) * .07, trail: [], res: () => {
          const ex = cx(x1), ey = cy(y1);
          if (s.res === 'hit') { boom(ex, ey, s.n > 1 ? 1.2 : 1); SFX.hit(); const tr = RS[s.target]; if (tr) tr.flash = 1; if (k === s.n - 1) { floatTxt(ex, ey - tile * .5, '-' + (Math.round(s.dmg * 10) / 10), '#ff6b4a', 1.3); if (s.am === 'C') floatTxt(ex, ey + tile * .2, 'Velas rotas', '#c9a8ff', .8); if (s.am === 'G') floatTxt(ex, ey + tile * .2, 'Tripulación -' + s.n, '#ff9a8a', .8); } }
          else if (s.res === 'rock') { dust(ex, ey); SFX.rock(); if (k === s.n - 1) floatTxt(ex, ey - tile * .4, 'Roca', '#e6e6e6', .8); }
          else { splashFx(ex, ey); SFX.splash(); if (k === s.n - 1) floatTxt(ex, ey - tile * .4, 'Agua', '#dff6ff', .8); }
          res(); } })); })); } }));
    return Promise.all(ps).then(() => wait(450));
  }
  function playSink(id) { const r = RS[id]; SFX.splash(); return tween(2.4, p => { r.sink = p; if (Math.random() < .6) puff(cx(r.x) + rnd(-tile * .4, tile * .4), cy(r.y) + rnd(-tile * .2, tile * .2), 1, { sp: tile * .15, life: 1.3, r: tile * .06, col: '230,250,255', kind: 'bubble', up: tile * .5 }); if (Math.random() < .2) smoke(cx(r.x), cy(r.y), 1, .8); }); }

  // ---------- cuadro ----------
  let last = performance.now(), onFrame = null;
  function frame(now) {
    const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = Math.max(last, now); T += dt;
    for (let i = tweens.length - 1; i >= 0; i--) { const w = tweens[i]; w.t += dt; const p = Math.min(1, w.t / w.dur); w.fn(p); if (p >= 1) { tweens.splice(i, 1); w.res(); } }
    for (let i = projs.length - 1; i >= 0; i--) { const b = projs[i]; b.t += dt; if (b.t >= b.dur) { projs.splice(i, 1); b.res(); } }
    for (const p of parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.pow(p.drag, dt * 60); p.vy *= Math.pow(p.drag, dt * 60); p.r += p.grow * dt; p.grow *= Math.pow(.97, dt * 60); p.rot += p.vr * dt;
      if (p.vz || p.z) { p.z += p.vz * dt; p.vz -= tile * 16 * dt; if (p.z < 0) { p.z = 0; p.vz = 0; if (p.kind === 'drop') p.life = Math.min(p.life, .05); } } }
    for (let i = parts.length - 1; i >= 0; i--) if (parts[i].life <= 0) parts.splice(i, 1);
    for (const r of rings) r.t += dt; for (let i = rings.length - 1; i >= 0; i--) if (rings[i].t > rings[i].max) rings.splice(i, 1);
    for (const f of floats) f.t += dt; for (let i = floats.length - 1; i >= 0; i--) if (floats[i].t > 1.5) floats.splice(i, 1);
    for (const k in RS) { const r = RS[k]; r.flash = Math.max(0, r.flash - dt * 2.5); r.rec = Math.max(0, r.rec - dt * 4); }
    shake *= Math.pow(.015, dt); flashScr = Math.max(0, flashScr - dt * 1.5);
    draw(dt); if (onFrame) onFrame(dt);
    if (!stepping) requestAnimationFrame(frame);
  }
  let stepping = false;
  // avanza cuadros a mano (sirve para probar cuando la pestaña no está visible)
  function step(n) { stepping = true; for (let i = 0; i < n; i++) frame(last + 1000 / 60); stepping = false; }
  function draw(dt) {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = '#0b3550'; ctx.fillRect(0, 0, W, H);
    if (!scene) return;
    ctx.save(); ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
    if (scene.menu) { drawMenuScene(dt); ctx.restore(); return; }
    const bw = BW * tile, bh = BH * tile;
    drawSea(0, 0, W, H, false); ctx.fillStyle = 'rgba(0,30,60,.35)'; ctx.fillRect(0, 0, W, H);
    drawSea(ox, oy, bw, bh, true); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.strokeRect(ox, oy, bw, bh);
    const map = scene.map, whirls = new Set();
    for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) { const t = map[y][x];
      if (t.t === 'wind') drawWind(x, y, t.wd); else if (t.t === 'whirl') { const k = t.wx + ',' + t.wy; if (!whirls.has(k)) { whirls.add(k); drawWhirl(t.wx, t.wy, t.cw); } } }
    for (const r of rings) { if (r.t < 0) continue; const p = r.t / r.max; ctx.strokeStyle = `rgba(255,255,255,${(1 - p) * .8})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(r.x, r.y, r.r * (.3 + p), r.r * (.3 + p) * .7, 0, 0, 7); ctx.stroke(); }
    drawIslands(); drawHist();
    if (scene.preview || scene.threat) drawPlanning();
    for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) { const t = map[y][x]; if (t.t === 'rockT' || t.t === 'rockS') drawRock(x, y, t.t === 'rockT', t.v); }
    for (const s of scene.ships) { const r = RS[s.id]; if (!r || r.sink >= 1) continue;
      if (r.moving && Math.random() < .7) { const px = cx(r.x) - Math.cos(r.a) * tile * .55, py = cy(r.y) - Math.sin(r.a) * tile * .55; puff(px, py, 1, { sp: tile * .1, life: 1.1, r: tile * .07, grow: tile * .14, col: '255,255,255', kind: 'foam' }); }
      const hr = s.hp / s.maxHp; if (!s.sunk && hr < .5 && Math.random() < (hr < .25 ? .4 : .18)) { const px = cx(r.x) + rnd(-tile * .25, tile * .25), py = cy(r.y) + rnd(-tile * .12, tile * .12); puff(px, py, 1, { sp: tile * .2, life: 1.6, r: tile * .1, grow: tile * .25, col: '70,65,65', kind: 'smoke', up: tile * .4 });
        if (hr < .25) puff(px, py, 1, { sp: tile * .3, life: .45, r: tile * .09, col: '255,140,40', kind: 'dot', up: tile * .6 }); } }
    drawParts(false);
    for (const s of scene.ships) { const r = RS[s.id]; if (!r || r.sink >= 1 || hidden(s)) continue; const bob = Math.sin(T * 2 + r.bob) * .025, rk = r.rec * tile * .12;
      drawShip(ctx, s.type, s.team, cx(r.x) + Math.cos(r.recA) * rk, cy(r.y) + Math.sin(r.recA) * rk, r.a + bob, tile * SHIP_K, { moving: r.moving, wake: r.moving, alpha: 1 - r.sink * .9, scale: 1 - r.sink * .35, tilt: r.sink * .8, flash: r.flash, torn: s.torn, custom: s.team === 'p' && s.id === 'me' ? scene.custom : null }); }
    for (const b of projs) { const p = b.t / b.dur, x = b.x0 + (b.x1 - b.x0) * p, y = b.y0 + (b.y1 - b.y0) * p, h = Math.sin(p * Math.PI) * tile * .9;
      b.trail.push({ x, y: y - h }); if (b.trail.length > 10) b.trail.shift();
      ctx.fillStyle = 'rgba(0,20,40,.35)'; ctx.beginPath(); ctx.ellipse(x, y, tile * .13, tile * .07, 0, 0, 7); ctx.fill();
      b.trail.forEach((q, i) => { ctx.fillStyle = `rgba(255,255,255,${i / b.trail.length * .5})`; ctx.beginPath(); ctx.arc(q.x, q.y, tile * .09 * i / b.trail.length, 0, 7); ctx.fill(); });
      if (b.am === 'C') { const a = T * 18, dx = Math.cos(a) * tile * .2, dy = Math.sin(a) * tile * .2; ctx.strokeStyle = '#b48cff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - dx, y - h - dy); ctx.lineTo(x + dx, y - h + dy); ctx.stroke();
        for (const k of [-1, 1]) { ctx.fillStyle = '#111'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(x + dx * k, y - h + dy * k, tile * .1, 0, 7); ctx.fill(); ctx.stroke(); } }
      else if (b.am === 'G') { for (let k = 0; k < 6; k++) { const a = k * 1.05 + p * 2, rr2 = tile * .05 + p * tile * .22; ctx.fillStyle = '#222'; ctx.strokeStyle = '#ff9a8a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x + Math.cos(a) * rr2, y - h + Math.sin(a) * rr2, tile * .06, 0, 7); ctx.fill(); ctx.stroke(); } }
      else { ctx.fillStyle = '#111'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y - h, tile * .14, 0, 7); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(x - tile * .04, y - h - tile * .04, tile * .045, 0, 7); ctx.fill(); } }
    drawParts(true);
    for (const s of scene.ships) { const r = RS[s.id]; if (!r || s.sunk || hidden(s)) continue; const w = tile * .9, x = cx(r.x) - w / 2, y = cy(r.y) + tile * .62;
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(x - 1, y - 1, w + 2, 6); ctx.fillStyle = s.team === 'p' ? '#5be39b' : '#ff5a43'; ctx.fillRect(x, y, w * Math.max(0, s.hp / s.maxHp), 4); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const f of floats) { const a = Math.min(1, (1.5 - f.t) * 2), sc = f.t < .15 ? .6 + f.t / .15 * .6 : 1.2 - Math.min(.2, (f.t - .15)); ctx.globalAlpha = a;
      ctx.font = `${Math.round(tile * .62 * f.big * sc)}px "Pirata One", serif`; ctx.lineWidth = 5; ctx.strokeStyle = '#1a0a02'; ctx.strokeText(f.txt, f.x, f.y - f.t * tile * .9); ctx.fillStyle = f.col; ctx.fillText(f.txt, f.x, f.y - f.t * tile * .9); }
    ctx.globalAlpha = 1; drawFog(); drawRain(); ctx.restore();
    if (flashScr > 0) { ctx.fillStyle = `rgba(255,240,210,${flashScr})`; ctx.fillRect(0, 0, W, H); }
  }
  function drawParts(above) {
    for (const p of parts) { const isAbove = p.kind === 'smoke' || p.kind === 'glow' || p.kind === 'drop' || p.kind === 'wood' || p.kind === 'dot'; if (above !== isAbove) continue;
      const a = Math.max(0, p.life / p.max);
      if (p.kind === 'glow') { const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); g.addColorStop(0, `rgba(${p.col},${a})`); g.addColorStop(1, `rgba(${p.col},0)`); ctx.fillStyle = g; ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2); continue; }
      if (p.kind === 'wood') { ctx.save(); ctx.translate(p.x, p.y - p.z); ctx.rotate(p.rot); ctx.fillStyle = `rgba(${p.col},${a})`; ctx.fillRect(-p.r * 1.8, -p.r * .5, p.r * 3.6, p.r); ctx.restore(); continue; }
      if (p.kind === 'smoke') { ctx.fillStyle = `rgba(${p.col},${a * .6})`; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(.5, p.r), 0, 7); ctx.fill(); ctx.fillStyle = `rgba(255,255,255,${a * .15})`; ctx.beginPath(); ctx.arc(p.x - p.r * .3, p.y - p.r * .3, p.r * .5, 0, 7); ctx.fill(); continue; }
      ctx.fillStyle = `rgba(${p.col},${p.kind === 'foam' ? a * .6 : a})`; ctx.beginPath(); ctx.arc(p.x, p.y - (p.z || 0), Math.max(.5, p.r), 0, 7); ctx.fill(); }
  }
  // islas del archipiélago: arena, pasto y palmeras
  function drawIslands() {
    const seen = new Set();
    for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) { const t = scene.map[y][x]; if (t.t !== 'land' || seen.has(t.isl)) continue; seen.add(t.isl);
      const X = ox + t.ix * tile, Y = oy + t.iy * tile, w = t.iw * tile, h = t.ih * tile;
      ctx.fillStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.roundRect(X - 5, Y - 4, w + 10, h + 10, tile * .45); ctx.fill();
      ctx.fillStyle = '#f2d98d'; ctx.strokeStyle = OL; ctx.lineWidth = 2; ctx.beginPath(); ctx.roundRect(X + 2, Y + 2, w - 4, h - 4, tile * .4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#58a84a'; ctx.beginPath(); ctx.roundRect(X + tile * .3, Y + tile * .25, w - tile * .6, h - tile * .6, tile * .3); ctx.fill();
      for (let k = 0; k < t.iw; k++) { const px = X + tile * (.5 + k), py = Y + tile * (.8 + (k % 2) * .4), sw = Math.sin(T * 1.5 + k) * .1;
        ctx.strokeStyle = '#7a5230'; ctx.lineWidth = Math.max(2, tile * .07); ctx.beginPath(); ctx.moveTo(px, py + tile * .2); ctx.quadraticCurveTo(px + tile * .1, py, px + tile * .05, py - tile * .25); ctx.stroke();
        ctx.fillStyle = '#2d8a4a'; for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + sw; ctx.beginPath(); ctx.ellipse(px + tile * .05 + Math.cos(a) * tile * .16, py - tile * .25 + Math.sin(a) * tile * .08, tile * .18, tile * .05, a, 0, 7); ctx.fill(); } } }
  }
  // rastro del rival: dónde estuvo en las últimas fases
  function drawHist() { const h = scene.hist; if (!h || !h.length) return; ctx.save();
    h.forEach((q, i) => { const a = .15 + .45 * (i + 1) / h.length; ctx.fillStyle = `rgba(255,80,60,${a})`; ctx.beginPath(); ctx.arc(cx(q.x), cy(q.y), tile * .12, 0, 7); ctx.fill();
      if (i > 0) { const p = h[i - 1]; ctx.strokeStyle = `rgba(255,80,60,${a * .8})`; ctx.lineWidth = 2; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(cx(p.x), cy(p.y)); ctx.lineTo(cx(q.x), cy(q.y)); ctx.stroke(); ctx.setLineDash([]); } });
    ctx.restore(); }
  // niebla: solo ves alrededor de tu barco
  const hidden = s => { if (!scene.fog || s.team === 'p') return false; const me = scene.ships.find(q => q.id === 'me'); if (!me) return false; const r = RS[s.id], m = RS.me; return Math.hypot(r.x - m.x, r.y - m.y) > 4.2; };
  function drawFog() { if (!scene.fog) return; const m = RS.me; if (!m) return; const px = cx(m.x), py = cy(m.y), R = tile * 4.4;
    const g = ctx.createRadialGradient(px, py, R * .75, px, py, R * 1.25); g.addColorStop(0, 'rgba(210,222,230,0)'); g.addColorStop(1, 'rgba(210,222,230,.88)');
    ctx.fillStyle = g; ctx.fillRect(ox, oy, BW * tile, BH * tile);
    for (let i = 0; i < 8; i++) { const fx = ox + ((i * .37 + T * .01) % 1) * BW * tile, fy = oy + ((i * .61) % 1) * BH * tile, r = tile * 2.5; const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, r); fg.addColorStop(0, 'rgba(235,240,245,.25)'); fg.addColorStop(1, 'rgba(235,240,245,0)'); ctx.fillStyle = fg; ctx.fillRect(fx - r, fy - r, r * 2, r * 2); } }
  function drawRain() { if (!scene.storm) return; ctx.fillStyle = 'rgba(20,40,70,.18)'; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = 'rgba(220,235,255,.55)'; ctx.lineWidth = 1.3; ctx.beginPath();
    for (let i = 0; i < 160; i++) { const x = ((i * 137.7 + T * 90) % (W + 60)) - 30, y = ((i * 59.3 + T * 900) % (H + 60)) - 30; ctx.moveTo(x, y); ctx.lineTo(x - 6, y + 18); } ctx.stroke(); }
  // planificación: alcance del rival en rojo, tu recorrido y tus disparos en naranja
  function drawPlanning() {
    const th = scene.threat;
    if (th) { ctx.save(); for (const c of th) { const pulse = .18 + .08 * Math.sin(T * 4); ctx.fillStyle = `rgba(255,60,40,${pulse})`; ctx.fillRect(ox + c.x * tile + 2, oy + c.y * tile + 2, tile - 4, tile - 4);
      ctx.strokeStyle = 'rgba(255,90,60,.6)'; ctx.lineWidth = 1.5; ctx.strokeRect(ox + c.x * tile + 2.5, oy + c.y * tile + 2.5, tile - 5, tile - 5); } ctx.restore(); }
    const pv = scene.preview; if (!pv) return;
    const { ghosts, fires, team, type, from } = pv; ctx.save(); ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx(from.x), cy(from.y));
    for (const g of ghosts) ctx.lineTo(cx(g.x), cy(g.y)); ctx.stroke(); ctx.setLineDash([]);
    ghosts.forEach((g, i) => { const same = i > 0 && g.x === ghosts[i - 1].x && g.y === ghosts[i - 1].y && g.d === ghosts[i - 1].d; if (!same) drawShip(ctx, type, team, cx(g.x), cy(g.y), angOf(g.d), tile * SHIP_K, { alpha: .35 });
      for (const side of ['L', 'R']) if (fires[i] && fires[i][side]) { const sd = side === 'L' ? (g.d + 3) % 4 : (g.d + 1) % 4;
        const A = AMMO[ammoOf(fires[i][side])]; let reach = 0;
        for (let k = 1; k <= A.range; k++) { const tx = g.x + DX[sd] * k, ty = g.y + DY[sd] * k; if (tx < 0 || ty < 0 || tx >= BW || ty >= BH) break; reach = k; ctx.fillStyle = `rgba(${A.col},.32)`; ctx.fillRect(ox + tx * tile + 3, oy + ty * tile + 3, tile - 6, tile - 6);
          if (blocksShot(scene.map, tx, ty)) break; }
        ctx.strokeStyle = `rgb(${A.col})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx(g.x) + DX[sd] * tile * .45, cy(g.y) + DY[sd] * tile * .45); ctx.lineTo(cx(g.x) + DX[sd] * tile * (reach + .2), cy(g.y) + DY[sd] * tile * (reach + .2)); ctx.stroke(); }
      ctx.fillStyle = '#1a0a02'; ctx.beginPath(); ctx.arc(cx(g.x) + tile * .36, cy(g.y) - tile * .36, tile * .2, 0, 7); ctx.fill(); ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = '#ffe9a8'; ctx.font = `${Math.round(tile * .3)}px "Pirata One", serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), cx(g.x) + tile * .36, cy(g.y) - tile * .34); });
    ctx.restore();
  }
  // menú: dos barcos que se persiguen y se cañonean sobre el mar
  let menuT = 0, menuFire = 1.5;
  function drawMenuScene(dt) {
    drawSea(0, 0, W, H, false); menuT += dt; const big = Math.min(150, Math.max(80, Math.min(W, H) / 4.2)), keep = tile; tile = big / 1.6;
    const path = t => ({ x: W / 2 + Math.cos(t) * W * .28, y: H * .5 + Math.sin(t * 2) * H * .1 });
    const tA = menuT * .22, tB = tA + 1.25, pos = [];
    for (const tt of [tA, tB]) { const p = path(tt), q = path(tt + .01), a = Math.atan2(q.y - p.y, q.x - p.x); pos.push({ p, a });
      if (Math.random() < .6) puff(p.x - Math.cos(a) * big * .55, p.y - Math.sin(a) * big * .55, 1, { sp: 8, life: 1.4, r: big * .05, grow: big * .1, col: '255,255,255', kind: 'foam' }); }
    drawParts(false); pos.forEach(({ p, a }, i) => drawShip(ctx, i ? 'bergantin' : 'galeon', i ? 'e' : 'p', p.x, p.y, a, big, { moving: true, wake: true }));
    for (const b of projs) { const p = b.t / b.dur, x = b.x0 + (b.x1 - b.x0) * p, y = b.y0 + (b.y1 - b.y0) * p - Math.sin(p * Math.PI) * big * .4; ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x, y, big * .05, 0, 7); ctx.fill(); }
    menuFire -= dt; if (menuFire <= 0) { menuFire = rnd(1.8, 3.2); const { p, a } = pos[1], side = a + Math.PI / 2, sx = p.x + Math.cos(side) * big * .3, sy = p.y + Math.sin(side) * big * .3, ex = sx + Math.cos(side) * big * 1.5, ey = sy + Math.sin(side) * big * 1.5;
      muzzle(sx, sy, side); projs.push({ x0: sx, y0: sy, x1: ex, y1: ey, t: 0, dur: .6, trail: [], res: () => splashFx(ex, ey) }); }
    drawParts(true); tile = keep;
  }
  return {
    resize, start(canvas, stage, ins) { cv = canvas; resize(canvas, stage, ins); requestAnimationFrame(frame); },
    setScene(s) { scene = s; parts.length = 0; projs.length = 0; floats.length = 0; rings.length = 0; if (s && s.ships) s.ships.forEach(syncShip); },
    setScenePreview(pv) { if (scene) scene.preview = pv; }, setThreat(t) { if (scene) scene.threat = t; }, setHist(h) { if (scene) scene.hist = h; },
    lightning() { flashScr = .55; shake = Math.max(shake, tile * .15); },
    step, syncShip, playMoves, playEnv, playShots, playSink, wait, drawShip, angOf, get tile() { return tile; }, set onFrame(f) { onFrame = f; }, get onFrame() { return onFrame; },
  };
})();
