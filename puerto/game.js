// game.js — Defensa del Puerto: dos cañones contra oleadas de piratas.
// El anfitrión (o el modo solo) simula todo; el invitado manda sus disparos y dibuja lo que el anfitrión le envía.
'use strict';
const $ = id => document.getElementById(id);
const W = 400, H = 720, PORT_Y = 590, RELOAD = 0.85, RAPID = 0.3, BALL_SPEED = 520, BLAST = 32, LIVES = 5;
const CANNONS = [{ x: 92, y: 648, col: '#ffb627' }, { x: 308, y: 648, col: '#3fd0c9' }];
const TYPES = {
  s: { hp: 1, spd: 30, r: 17, pts: 10 },               // balandra
  z: { hp: 1, spd: 38, r: 16, pts: 20, zig: true },    // balandra que zigzaguea
  b: { hp: 2, spd: 22, r: 21, pts: 25 },               // bergantín
  g: { hp: 4, spd: 14, r: 28, pts: 60 },               // galeón
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r1 = v => Math.round(v * 10) / 10;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// ---------- simulación ----------
function newSim(ai) { return { T: 0, ph: 'ready', tm: 3, w: 1, lv: LIVES, sc: 0, k: [0, 0], rl: [0, 0], rf: 0, ships: [], balls: [], barrel: null, ev: [], evId: 0, nid: 1, toSpawn: [], spawnT: 0, waveT: 0, barrelAt: -1, ai: ai.slice(), aiT: [0.6, 0.9], am: [-2.0, -1.1] }; }
const mult = w => 1 + (w - 1) * 0.07;
function waveList(n) {
  const out = [], count = 4 + n * 2;
  for (let i = 0; i < count; i++) { const r = Math.random(); out.push(n >= 4 && r < 0.12 + n * 0.012 ? 'g' : n >= 2 && r < 0.42 ? 'b' : n >= 3 && r < 0.62 ? 'z' : 's'); }
  return out;
}
function emit(s, k, x, y, o) { s.ev.push([++s.evId, k, Math.round(x), Math.round(y), o]); if (s.ev.length > 16) s.ev.shift(); }
function startWave(s) { s.toSpawn = waveList(s.w); s.spawnT = 0.4; s.ph = 'wave'; s.waveT = 0; s.barrelAt = Math.random() < 0.65 ? 4 + Math.random() * 6 : -1; }
function shipPos(sh, T) { const age = T - sh.t0; return [sh.x0 + Math.sin(age * sh.f + sh.p) * sh.a, -30 + sh.vy * age]; }
function spawn(s) {
  const ty = s.toSpawn.shift(), t = TYPES[ty], a = t.zig ? 55 : 8 + Math.random() * 12, f = t.zig ? 1.5 : 0.5 + Math.random() * 0.4, m = a + t.r + 8;
  const x0 = m + Math.random() * (W - 2 * m);
  s.ships.push({ id: s.nid++, ty, hp: t.hp, t0: s.T, x0, a, f, p: Math.random() * 6.28, vy: t.spd * mult(s.w), x: x0, y: -30, hitT: 0 });
}
function fire(s, o, x, y) {
  if (s.ph === 'over' || s.rl[o] > 0) return false;
  x = clamp(x, 6, W - 6); y = clamp(y, 8, PORT_Y - 14);
  const c = CANNONS[o], d = Math.hypot(x - c.x, y - c.y), dur = clamp(d / BALL_SPEED, 0.3, 1.0);
  s.balls.push({ id: s.nid++, o, sx: c.x, sy: c.y - 14, tx: x, ty: y, p: 0, dur });
  s.rl[o] = s.rf > 0 ? RAPID : RELOAD; s.am[o] = Math.atan2(y - c.y, x - c.x); emit(s, 'fire', c.x, c.y, o);
  return true;
}
function land(s, b) {
  const at = { x: b.tx, y: b.ty }; let hit = false;
  for (const sh of s.ships) {
    if (dist(sh, at) > BLAST + TYPES[sh.ty].r) continue;
    hit = true; sh.hp--; sh.hitT = 0.25;
    if (sh.hp <= 0) { sh.dead = true; s.sc += Math.round(TYPES[sh.ty].pts * (1 + (s.w - 1) * 0.1)); s.k[b.o]++; emit(s, 'sink', sh.x, sh.y, b.o); }
    else emit(s, 'hit', sh.x, sh.y, b.o);
  }
  s.ships = s.ships.filter(x => !x.dead);
  if (s.barrel && dist(s.barrel, at) <= BLAST + 14) { s.rf = 6; s.rl = [0, 0]; s.barrel = null; hit = true; emit(s, 'barrel', b.tx, b.ty, b.o); }
  if (!hit) emit(s, 'splash', b.tx, b.ty, b.o);
}
function aiStep(s, o, dt) {
  s.aiT[o] -= dt; if (s.rl[o] > 0 || s.aiT[o] > 0) return;
  const c = CANNONS[o]; let best = null, bs = -1e9;
  for (const sh of s.ships) { if (sh.y < 20) continue; const v = sh.y + (Math.abs(sh.x - c.x) < 190 ? 50 : 0) + Math.random() * 40; if (v > bs) { bs = v; best = sh; } }
  if (!best) { if (s.barrel && s.barrel.x > 30 && Math.random() < 0.02) fire(s, o, s.barrel.x + 40, s.barrel.y); return; }
  let tx = best.x, ty = best.y;
  for (let i = 0; i < 3; i++) { const dur = clamp(Math.hypot(tx - c.x, ty - c.y) / BALL_SPEED, 0.3, 1); [tx, ty] = shipPos(best, s.T + dur); }
  const e = 6 + Math.random() * 24, a = Math.random() * 6.283;
  fire(s, o, tx + Math.cos(a) * e, ty + Math.sin(a) * e * 0.6); s.aiT[o] = 0.3 + Math.random() * 0.55;
}
function step(s, dt) {
  s.T += dt; s.rl = s.rl.map(v => Math.max(0, v - dt)); s.rf = Math.max(0, s.rf - dt);
  for (const sh of s.ships) { [sh.x, sh.y] = shipPos(sh, s.T); if (sh.hitT > 0) sh.hitT -= dt; }
  for (const b of s.balls) { b.p += dt / b.dur; if (b.p >= 1) land(s, b); }
  s.balls = s.balls.filter(b => b.p < 1);
  if (s.barrel) { s.barrel.x += s.barrel.vx * dt; if (s.barrel.x > W + 30) s.barrel = null; }
  if (s.ph === 'over') return;
  if (s.ph === 'ready' || s.ph === 'pause') { s.tm -= dt; if (s.tm <= 0) startWave(s); }
  if (s.ph === 'wave') {
    s.waveT += dt; s.spawnT -= dt;
    if (s.toSpawn.length && s.spawnT <= 0) { spawn(s); s.spawnT = Math.max(0.55, 2.1 - s.w * 0.13) * (0.7 + Math.random() * 0.6); }
    if (s.barrelAt > 0 && s.waveT >= s.barrelAt) { s.barrel = { x: -20, y: 170 + Math.random() * 170, vx: 42 }; s.barrelAt = -1; }
    if (!s.toSpawn.length && !s.ships.length) { s.sc += 30 * s.w; s.w++; s.ph = 'pause'; s.tm = 2.6; emit(s, 'wave', 0, 0, 0); }
  }
  for (let i = s.ships.length - 1; i >= 0; i--) if (s.ships[i].y >= PORT_Y - 6) {
    const sh = s.ships.splice(i, 1)[0]; s.lv--; emit(s, 'port', sh.x, PORT_Y, 0);
    if (s.lv <= 0) { s.lv = 0; s.ph = 'over'; emit(s, 'over', 0, 0, 0); break; }
  }
  for (const o of [0, 1]) if (s.ai[o] && s.ph !== 'over') aiStep(s, o, dt);
}
function snap(s) {
  return { e: G.epoch, ph: s.ph, tm: r1(s.tm), w: s.w, lv: s.lv, sc: s.sc, k: s.k.slice(), rl: s.rl.map(r1), rf: r1(s.rf), am: s.am.map(v => Math.round(v * 100) / 100), ai: s.ai.map(Number),
    sh: s.ships.map(x => [x.id, x.ty, r1(x.x), r1(x.y), x.hp, x.hitT > 0 ? 1 : 0]),
    bl: s.balls.map(b => [b.id, b.o, b.sx, b.sy, r1(b.tx), r1(b.ty), Math.round(b.p * 100) / 100, r1(b.dur)]),
    br: s.barrel ? [r1(s.barrel.x), r1(s.barrel.y)] : 0, ev: s.ev.slice() };
}

// ---------- estado del juego y vista ----------
const G = { mode: null, me: 0, sim: null, epoch: 0, view: null, lastEv: 0, overShown: false, localFire: 0, seq: 0, myShots: [], snapT: 0, hostGoneT: null, guestGone: false };
function viewFromSim(s) {
  return { ph: s.ph, tm: s.tm, w: s.w, lv: s.lv, sc: s.sc, k: s.k, rl: s.rl, rf: s.rf, am: s.am, ai: s.ai,
    ships: s.ships.map(x => ({ id: x.id, ty: x.ty, x: x.x, y: x.y, hp: x.hp, hit: x.hitT > 0 })), balls: s.balls, br: s.barrel, ev: s.ev };
}
// el invitado suaviza lo que llega por la red
function applySnap(st) {
  const v = G.view || { ships: [], balls: [] }, old = new Map(v.ships.map(x => [x.id, x]));
  const ships = st.sh.map(([id, ty, x, y, hp, hit]) => { const o = old.get(id); return o ? Object.assign(o, { tx: x, ty2: y, hp, hit: !!hit, ty }) : { id, ty, x, y, tx: x, ty2: y, hp, hit: !!hit }; });
  const ob = new Map(v.balls.map(b => [b.id, b]));
  const balls = st.bl.map(([id, o, sx, sy, tx, ty, p, dur]) => { const b = ob.get(id); if (b) { if (Math.abs(b.p - p) > 0.15) b.p = p; return b; } return { id, o, sx, sy, tx, ty, p, dur }; });
  G.view = { ph: st.ph, tm: st.tm, w: st.w, lv: st.lv, sc: st.sc, k: st.k, rl: st.rl, rf: st.rf, am: st.am, ai: st.ai, ships, balls, br: st.br ? { x: st.br[0], y: st.br[1] } : null, ev: st.ev };
}
function smoothView(dt) {
  const v = G.view; if (!v) return;
  const k = Math.min(1, dt * 12);
  for (const sh of v.ships) { if (sh.tx == null) continue; sh.x += (sh.tx - sh.x) * k; sh.y += (sh.ty2 - sh.y) * k; }
  for (const b of v.balls) b.p = Math.min(0.999, b.p + dt / b.dur);
  v.rl = v.rl.map(x => Math.max(0, x - dt)); if (v.tm > 0) v.tm = Math.max(0, v.tm - dt);
}

// ---------- sonido ----------
const SND = (() => {
  let ac = null, noise = null;
  const init = () => { if (ac) { if (ac.state === 'suspended') ac.resume(); return; } try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    const n = ac.sampleRate; noise = ac.createBuffer(1, n, n); const d = noise.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; };
  const env = (g, t, a, p, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(p, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  const nz = (dur, type, f, peak) => { if (!ac) return; const t = ac.currentTime, s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noise; fl.type = type; fl.frequency.value = f; env(g, t, 0.005, peak, dur); s.connect(fl).connect(g).connect(ac.destination); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.1); };
  const tone = (f0, f1, dur, type, peak, delay = 0) => { if (!ac) return; const t = ac.currentTime + delay, o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); env(g, t, 0.005, peak, dur); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.05); };
  return { init,
    fire: () => { tone(120, 40, 0.35, 'sine', 0.5); nz(0.3, 'lowpass', 800, 0.4); },
    splash: () => nz(0.4, 'bandpass', 1300, 0.18),
    hit: () => { nz(0.15, 'bandpass', 2000, 0.35); tone(220, 90, 0.15, 'square', 0.08); },
    sink: () => { nz(0.7, 'lowpass', 500, 0.5); tone(90, 40, 0.5, 'sawtooth', 0.12); },
    port: () => { tone(330, 220, 0.25, 'square', 0.12); tone(260, 170, 0.3, 'square', 0.12, 0.22); },
    wave: () => { tone(880, 880, 0.6, 'sine', 0.12); tone(1320, 1320, 0.6, 'sine', 0.05); },
    barrel: () => { for (let i = 0; i < 4; i++) tone(520 + i * 160, 700 + i * 160, 0.12, 'triangle', 0.12, i * 0.07); } };
})();
addEventListener('pointerdown', () => SND.init(), { capture: true });

// ---------- dibujo ----------
const cv = $('cv'), cx = cv.getContext('2d');
let SC = 1, OX = 0, OY = 0, DPR = 1;
function resize() { DPR = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * DPR; cv.height = innerHeight * DPR; SC = Math.min(innerWidth / W, innerHeight / H); OX = (innerWidth - W * SC) / 2; OY = (innerHeight - H * SC) / 2; }
addEventListener('resize', resize); resize();
const FX = [];
function addFx(k, x, y, o) {
  const col = o === 1 ? CANNONS[1].col : CANNONS[0].col;
  if (k === 'splash') FX.push({ k: 'ring', x, y, t: 0, d: 0.7, col: '255,255,255' });
  if (k === 'hit') { FX.push({ k: 'boom', x, y, t: 0, d: 0.45, s: 0.7 }); }
  if (k === 'sink') { FX.push({ k: 'boom', x, y, t: 0, d: 0.7, s: 1.2 }); FX.push({ k: 'ring', x, y, t: 0, d: 0.9, col: '255,255,255' }); FX.push({ k: 'txt', x, y, t: 0, d: 1, col }); }
  if (k === 'port') FX.push({ k: 'flash', t: 0, d: 0.5 });
  if (k === 'barrel') { FX.push({ k: 'boom', x, y, t: 0, d: 0.8, s: 1.6 }); }
  if (k === 'fire') FX.push({ k: 'muzzle', x, y: y - 16, t: 0, d: 0.25, o });
  if (SND[k]) SND[k]();
}
function processEvents(v) {
  if (!v || !v.ev) return;
  for (const [id, k, x, y, o] of v.ev) { if (id <= G.lastEv) continue; G.lastEv = id;
    if (k === 'fire' && o === G.me && G.mode === 'guest') continue; // ya lo dibujamos al tocar
    addFx(k, x, y, o); if (k === 'wave') toast(`¡Oleada ${v.w - 1} superada!`); if (k === 'barrel') toast('¡Fuego rápido para los dos cañones!'); }
}
function drawSea(T) {
  const g = cx.createLinearGradient(0, 0, 0, PORT_Y); g.addColorStop(0, '#0f5a72'); g.addColorStop(1, '#1f8fae');
  cx.fillStyle = g; cx.fillRect(0, 0, W, PORT_Y + 20);
  cx.strokeStyle = 'rgba(255,255,255,.16)'; cx.lineWidth = 2; cx.lineCap = 'round';
  for (let i = 0; i < 26; i++) { const y = ((i * 53.7) % PORT_Y), x = ((i * 97.3 + T * (8 + (i % 3) * 4)) % (W + 60)) - 30, w = 14 + (i % 4) * 6;
    cx.beginPath(); cx.moveTo(x, y + Math.sin(T * 1.3 + i) * 2); cx.quadraticCurveTo(x + w / 2, y - 4, x + w, y); cx.stroke(); }
}
function drawPort(v) {
  cx.fillStyle = '#b9a07a'; cx.fillRect(0, PORT_Y, W, H - PORT_Y);
  cx.fillStyle = '#8c7350'; for (let x = 0; x < W; x += 28) cx.fillRect(x + ((x / 28) % 2 ? 14 : 0), PORT_Y + 4, 26, 10);
  cx.fillStyle = '#6e5636'; cx.fillRect(0, PORT_Y, W, 5);
  const cols = ['#f2c14e', '#e76f51', '#2a9d8f', '#f4a261', '#e9c46a', '#d1495b'];
  for (let i = 0; i < 9; i++) { const x = 8 + i * 44, h = 34 + (i % 3) * 8, y = H - h - 6; cx.fillStyle = cols[i % cols.length]; cx.fillRect(x, y, 38, h); cx.fillStyle = '#9b3d2b'; cx.beginPath(); cx.moveTo(x - 3, y); cx.lineTo(x + 19, y - 14); cx.lineTo(x + 41, y); cx.fill(); cx.fillStyle = 'rgba(40,25,10,.55)'; cx.fillRect(x + 15, y + h - 14, 8, 14); }
  // banderas = vidas
  for (let i = 0; i < LIVES; i++) { const x = W / 2 - (LIVES - 1) * 13 + i * 26, y = PORT_Y + 30, on = i < v.lv;
    cx.strokeStyle = '#3a2311'; cx.lineWidth = 2.5; cx.beginPath(); cx.moveTo(x, y + 16); cx.lineTo(x, y - 8); cx.stroke();
    cx.fillStyle = on ? '#d8423a' : 'rgba(60,40,20,.35)'; cx.beginPath(); cx.moveTo(x, y - 8); cx.lineTo(x + 14, y - 3); cx.lineTo(x, y + 2); cx.fill(); }
}
function drawCannon(o, v) {
  const c = CANNONS[o], a = v.am ? v.am[o] : -Math.PI / 2, rl = v.rl ? v.rl[o] : 0, full = v.rf > 0 ? RAPID : RELOAD;
  cx.save(); cx.translate(c.x, c.y);
  cx.fillStyle = '#7d6a55'; cx.beginPath(); cx.arc(0, 0, 30, 0, 6.283); cx.fill();
  cx.lineWidth = 6; cx.strokeStyle = c.col; cx.beginPath(); cx.arc(0, 0, 33, 0, 6.283); cx.stroke();
  if (rl > 0) { cx.strokeStyle = 'rgba(0,0,0,.45)'; cx.beginPath(); cx.arc(0, 0, 33, -Math.PI / 2, -Math.PI / 2 + 6.283 * (rl / full)); cx.stroke(); }
  if (v.rf > 0) { cx.strokeStyle = 'rgba(255,240,150,.8)'; cx.lineWidth = 3; cx.beginPath(); cx.arc(0, 0, 40, 0, 6.283); cx.stroke(); }
  cx.rotate(a); cx.fillStyle = '#2b2b2b'; cx.fillRect(0, -8, 36, 16); cx.fillRect(30, -10, 8, 20);
  cx.rotate(-a); cx.fillStyle = '#3d2a17'; cx.beginPath(); cx.arc(0, 0, 13, 0, 6.283); cx.fill();
  cx.restore();
  const me = o === G.me, other = G.mode === 'solo' || (v.ai && v.ai[o]) ? 'Ayudante' : 'Amigo';
  cx.font = '900 13px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillStyle = '#2a1a0c'; cx.fillText(me ? 'TÚ' : other.toUpperCase(), c.x, c.y + 50);
}
function drawShip(sh, T) {
  const t = TYPES[sh.ty], r = t.r, bob = Math.sin(T * 2 + sh.id) * 1.2;
  cx.save(); cx.translate(sh.x, sh.y + bob);
  cx.fillStyle = 'rgba(255,255,255,.35)'; cx.beginPath(); cx.ellipse(0, -r * 1.25, r * 0.5, r * 0.35, 0, 0, 6.283); cx.fill();
  cx.fillStyle = sh.hit ? '#fff' : t.hp >= 4 ? '#4a2c17' : t.hp >= 2 ? '#6b3f20' : '#8a5a33';
  cx.beginPath(); cx.moveTo(0, r * 1.25); cx.quadraticCurveTo(r * 0.85, r * 0.4, r * 0.7, -r); cx.lineTo(-r * 0.7, -r); cx.quadraticCurveTo(-r * 0.85, r * 0.4, 0, r * 1.25); cx.fill();
  cx.strokeStyle = '#2a1a0c'; cx.lineWidth = 2; cx.stroke();
  const masts = t.hp >= 4 ? 3 : t.hp >= 2 ? 2 : 1;
  for (let m = 0; m < masts; m++) { const y = masts === 1 ? 0 : -r * 0.5 + m * (r * 0.9 / (masts - 1));
    cx.fillStyle = '#f4ecd8'; cx.fillRect(-r * 0.75, y - 3, r * 1.5, 6); cx.fillStyle = '#2a1a0c'; cx.fillRect(-1.5, y - 3, 3, 6); }
  cx.fillStyle = '#111'; cx.fillRect(-2, -r - 9, 9, 6);
  if (t.zig) { cx.fillStyle = '#d8423a'; cx.fillRect(-2, -r - 9, 9, 2); }
  cx.restore();
  if (t.hp > 1) for (let i = 0; i < t.hp; i++) { cx.fillStyle = i < sh.hp ? '#ff5a43' : 'rgba(0,0,0,.35)'; cx.fillRect(sh.x - t.hp * 4 + i * 8, sh.y - r - 18, 6, 4); }
}
function drawBall(b) {
  const p = clamp(b.p, 0, 1), x = b.sx + (b.tx - b.sx) * p, y = b.sy + (b.ty - b.sy) * p, h = Math.sin(Math.PI * p) * 50 * b.dur, col = CANNONS[b.o].col;
  cx.strokeStyle = col; cx.globalAlpha = 0.85; cx.setLineDash([5, 5]); cx.lineWidth = 2; cx.beginPath(); cx.arc(b.tx, b.ty, BLAST, 0, 6.283); cx.stroke(); cx.setLineDash([]); cx.globalAlpha = 1;
  cx.fillStyle = 'rgba(0,0,0,.25)'; cx.beginPath(); cx.ellipse(x, y, 5, 3, 0, 0, 6.283); cx.fill();
  cx.fillStyle = '#1b1b1b'; cx.beginPath(); cx.arc(x, y - h, 5 + Math.sin(Math.PI * p) * 2, 0, 6.283); cx.fill();
}
function drawBarrel(br, T) {
  cx.save(); cx.translate(br.x, br.y + Math.sin(T * 3) * 2); cx.rotate(Math.sin(T * 2) * 0.2);
  cx.fillStyle = '#9a5b2a'; cx.beginPath(); cx.ellipse(0, 0, 12, 15, 0, 0, 6.283); cx.fill(); cx.strokeStyle = '#3a2311'; cx.lineWidth = 2; cx.stroke();
  cx.fillStyle = '#3a2311'; cx.fillRect(-12, -6, 24, 2.5); cx.fillRect(-12, 4, 24, 2.5);
  cx.restore(); cx.font = '900 11px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillStyle = '#fff'; cx.fillText('PÓLVORA', br.x, br.y - 20);
}
function drawFx(dt) {
  for (const f of FX) { f.t += dt; const p = Math.min(1, f.t / f.d);
    if (f.k === 'ring') { cx.strokeStyle = `rgba(${f.col},${1 - p})`; cx.lineWidth = 3; cx.beginPath(); cx.arc(f.x, f.y, 6 + p * 34, 0, 6.283); cx.stroke(); }
    if (f.k === 'boom') { for (let i = 0; i < 8; i++) { const a = i * 0.785 + f.x, d = p * 26 * f.s; cx.fillStyle = `rgba(255,${150 + i * 10},60,${1 - p})`; cx.beginPath(); cx.arc(f.x + Math.cos(a) * d, f.y + Math.sin(a) * d, Math.max(0, (1 - p) * 8 * f.s), 0, 6.283); cx.fill(); } }
    if (f.k === 'txt') { cx.font = '900 16px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillStyle = f.col; cx.globalAlpha = 1 - p; cx.fillText('¡Hundido!', f.x, f.y - 20 - p * 24); cx.globalAlpha = 1; }
    if (f.k === 'muzzle') { const c = CANNONS[f.o]; cx.fillStyle = `rgba(255,220,120,${1 - p})`; cx.beginPath(); cx.arc(c.x, c.y - 10, 18 * (1 - p) + 6, 0, 6.283); cx.fill(); }
    if (f.k === 'flash') { cx.fillStyle = `rgba(216,66,58,${0.35 * (1 - p)})`; cx.fillRect(0, 0, W, H); }
  }
  for (let i = FX.length - 1; i >= 0; i--) if (FX[i].t >= FX[i].d) FX.splice(i, 1);
}
function drawHud(v) {
  cx.fillStyle = 'rgba(6,30,40,.55)'; cx.fillRect(0, 0, W, 40);
  cx.font = '400 22px "Lilita One", sans-serif'; cx.textAlign = 'left'; cx.fillStyle = '#fff'; cx.fillText(`Oleada ${v.w}`, 12, 28);
  cx.textAlign = 'right'; cx.fillText(`${v.sc} pts`, W - 72, 28);
  if (v.ph === 'ready' || v.ph === 'pause') {
    cx.textAlign = 'center'; cx.fillStyle = 'rgba(6,30,40,.6)'; cx.fillRect(40, 250, W - 80, 110);
    cx.fillStyle = '#ffb627'; cx.font = '400 44px "Lilita One", sans-serif'; cx.fillText(`Oleada ${v.w}`, W / 2, 302);
    cx.fillStyle = '#fff'; cx.font = '800 18px Nunito, sans-serif'; cx.fillText(v.ph === 'ready' ? 'Toca el mar para disparar' : '¡Prepárense!', W / 2, 336);
  }
  if (v.rf > 0) { cx.textAlign = 'center'; cx.fillStyle = '#ffe28a'; cx.font = '900 15px Nunito, sans-serif'; cx.fillText(`¡Fuego rápido! ${Math.ceil(v.rf)} s`, W / 2, 62); }
}
function draw(dt, T) {
  cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.fillStyle = '#0f5a72'; cx.fillRect(0, 0, innerWidth, innerHeight);
  cx.setTransform(DPR * SC, 0, 0, DPR * SC, DPR * OX, DPR * OY);
  cx.save(); cx.beginPath(); cx.rect(0, 0, W, H); cx.clip();
  drawSea(T);
  const v = G.view || { ph: 'menu', w: 1, lv: LIVES, sc: 0, ships: [], balls: [], am: [-2.0, -1.1], rl: [0, 0], rf: 0 };
  if (v.br) drawBarrel(v.br, T);
  for (const sh of v.ships) drawShip(sh, T);
  drawPort(v); drawCannon(0, v); drawCannon(1, v);
  for (const b of v.balls) drawBall(b);
  for (const s of G.myShots) { s.t += dt; } G.myShots = G.myShots.filter(s => s.t < 0.6);
  for (const s of G.myShots) { cx.strokeStyle = CANNONS[G.me].col; cx.lineWidth = 3; cx.globalAlpha = 1 - s.t / 0.6; cx.beginPath(); cx.arc(s.x, s.y, 10 + s.t * 20, 0, 6.283); cx.stroke(); cx.globalAlpha = 1; }
  drawFx(dt);
  if (G.mode) drawHud(v);
  cx.restore();
}

// ---------- toques ----------
cv.addEventListener('pointerdown', e => {
  if (!G.mode || !G.view || G.view.ph === 'over') return;
  const x = (e.clientX - OX) / SC, y = (e.clientY - OY) / SC; if (y > PORT_Y || y < 0 || x < 0 || x > W) return;
  if (G.mode === 'guest') {
    const now = performance.now() / 1000, full = G.view.rf > 0 ? RAPID : RELOAD;
    if (now - G.localFire < full * 0.95) return; G.localFire = now; G.seq++;
    G.inputs.push([G.seq, Math.round(x), Math.round(y)]); if (G.inputs.length > 8) G.inputs.shift();
    NET.room && NET.room.presence({ in: { e: G.epoch, q: G.inputs } }).catch(() => {});
    addFx('fire', CANNONS[1].x, CANNONS[1].y, 1); G.myShots.push({ x, y, t: 0 });
  } else if (fire(G.sim, 0, x, y)) G.myShots.push({ x, y, t: 0 });
});

// ---------- bucle ----------
let last = performance.now(), acc = 0, TT = 0;
function frame(now) {
  requestAnimationFrame(frame);
  try { tick(now); } catch (e) { console.error(e); }
}
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; TT += dt;
  if (G.sim && (G.mode === 'solo' || G.mode === 'host')) {
    acc += dt; while (acc >= 1 / 60) { step(G.sim, 1 / 60); acc -= 1 / 60; }
    G.view = viewFromSim(G.sim);
    if (G.mode === 'host' && NET.room) { G.snapT -= dt; if (G.snapT <= 0) { G.snapT = 1 / 15; NET.room.presence({ st: snap(G.sim), vs: NET.guest }).catch(() => {}); } }
  } else if (G.mode === 'guest') smoothView(dt);
  processEvents(G.view);
  if (G.view && G.view.ph === 'over' && G.mode && !G.overShown) { G.overShown = true; setTimeout(showOver, 1100); }
  draw(dt, TT);
}
requestAnimationFrame(frame);

// ---------- pantallas ----------
const OVS = ['menu', 'lobby', 'over'];
function show(id) { for (const o of OVS) $(o).hidden = o !== id; $('bQuit').hidden = !!id || !G.mode; }
let toastT = 0;
function toast(t) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, 2200); }
const BEST = 'puerto-best';
function best() { try { return +localStorage.getItem(BEST) || 0; } catch (e) { return 0; } }
function saveBest(v) { try { if (v > best()) localStorage.setItem(BEST, String(v)); } catch (e) {} }
function renderBest() { const b = best(); $('best').textContent = b ? `Tu mejor puntaje: ${b}` : ''; }
function startGame(mode) {
  G.mode = mode; G.me = mode === 'guest' ? 1 : 0; G.lastEv = 0; G.overShown = false; FX.length = 0; G.myShots = []; acc = 0;
  if (mode !== 'guest') { G.sim = newSim(mode === 'solo' ? [false, true] : [false, NET.guest ? false : true]); G.view = viewFromSim(G.sim); }
  else { G.sim = null; G.view = null; G.inputs = []; G.seq = 0; }
  show(null);
}
function showOver() {
  const v = G.view; if (!v) return; saveBest(v.sc);
  $('oWave').textContent = v.w; $('oScore').textContent = v.sc;
  $('oK0').textContent = v.k[G.me]; $('oK1').textContent = v.k[1 - G.me];
  $('oK0l').textContent = 'Hundiste tú'; $('oK1l').textContent = G.mode === 'solo' || (v.ai && v.ai[1 - G.me]) ? 'El ayudante' : 'Tu amigo';
  $('oText').textContent = v.w > 5 ? '¡Gran defensa! Llegaron hasta la oleada ' + v.w + '.' : 'Resistieron hasta la oleada ' + v.w + '.';
  $('bAgain').hidden = G.mode === 'guest'; $('bAgain').textContent = G.mode === 'host' ? 'Otra vez (juntos)' : 'Otra vez';
  $('oTitle').textContent = G.mode === 'guest' ? 'Los piratas tomaron el puerto' : 'Los piratas tomaron el puerto';
  if (G.mode === 'guest') $('oText').textContent += ' Si tu amigo toca "Otra vez", empiezan de nuevo.';
  show('over');
}
$('bSolo').onclick = () => { startGame('solo'); };
$('bAgain').onclick = () => { if (G.mode === 'host') hostStart(); else startGame('solo'); };
$('bExit').onclick = () => { leave(); };
$('bQuit').onclick = () => { leave(); };
function leave() { NET.leave(); G.mode = null; G.sim = null; G.view = null; FX.length = 0; renderBest(); show('menu'); }

// ---------- red ----------
const NET = { api: null, room: null, sub: null, code: null, role: null, guest: null, hostPeer: null, lastSeq: 0,
  async leave() { if (this.sub) this.sub(); this.sub = null; const r = this.room; this.room = null; this.guest = null; this.hostPeer = null; clearTimeout(G.hostGoneT); G.hostGoneT = null; if (r) try { await r.leave(); } catch (e) {} } };
(async () => {
  await null;
  try { NET.api = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('room') : null; } catch (e) { NET.api = null; }
  if (!NET.api && window.P2P_ROOM) NET.api = window.P2P_ROOM;
  if (!NET.api) { $('bCreate').disabled = $('bJoin').disabled = true; $('mMsg').textContent = 'El modo online no está disponible en esta página. Puedes jugar solo.'; }
  joinFromHash(); addEventListener('hashchange', joinFromHash);
})();
const CODE_AB = 'ACDEFGHJKMNPQRTUVWXY';
const newCode = () => Array.from({ length: 4 }, () => CODE_AB[Math.floor(Math.random() * CODE_AB.length)]).join('');
function joinFromHash() { const h = (location.hash || '').slice(1).toUpperCase(); if (!NET.api || !/^[A-Z]{4}$/.test(h) || NET.room || G.mode) return; $('iCode').value = h; enter(h, 'guest'); }
$('iCode').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); });
$('iCode').addEventListener('keydown', e => { if (e.key === 'Enter') $('bJoin').click(); });
$('bCreate').onclick = () => enter(newCode(), 'host');
$('bJoin').onclick = () => { const c = $('iCode').value.toUpperCase().replace(/[^A-Z]/g, ''); if (c.length !== 4) { $('mMsg').textContent = 'El código tiene 4 letras.'; return; } enter(c, 'guest'); };
$('bBack').onclick = () => leave();
$('bCopy').onclick = async () => { const i = $('lLink'); try { await navigator.clipboard.writeText(i.value); $('bCopy').textContent = 'Copiado'; } catch (e) { i.focus(); i.select(); } setTimeout(() => { $('bCopy').textContent = 'Copiar'; }, 1500); };
$('bStart').onclick = () => hostStart();
async function enter(code, role) {
  if (!NET.api) return;
  $('mMsg').textContent = role === 'guest' ? `Buscando la sala ${code}…` : 'Creando la sala…';
  await NET.leave(); let r = null;
  for (let tries = 0; ; tries++) {
    try { r = await NET.api.join('puerto-' + code.toLowerCase(), role); break; }
    catch (e) { const c = e && e.code; if (c === 'taken' && role === 'host' && tries < 4) { code = newCode(); continue; }
      $('mMsg').textContent = c === 'not_found' ? 'No encontré una sala con ese código. Revisa las letras o pide a tu amigo que la cree de nuevo.' : 'No se pudo conectar. Revisa tu internet y prueba de nuevo.'; return; }
  }
  Object.assign(NET, { room: r, code, role, guest: null, hostPeer: null, lastSeq: 0 }); G.epoch = 0;
  NET.sub = r.onPeers(onPeers, () => toast('Se cortó la conexión con la sala'));
  r.presence({ app: 'puerto1', role }).catch(() => {});
  $('mMsg').textContent = ''; renderLobby(); show('lobby');
}
const others = () => NET.room ? NET.room.peers().filter(p => !p.sameTab && p.presence && p.presence.app === 'puerto1') : [];
const myPeer = () => { const m = NET.room && NET.room.peers().find(p => p.sameTab); return m ? m.peer : null; };
function renderLobby() {
  $('lCode').textContent = NET.code || '----';
  const host = NET.role === 'host', o = others().find(p => p.presence.role === (host ? 'guest' : 'host'));
  $('lShare').hidden = !(host && NET.api && NET.api.p2p); if (host) $('lLink').value = location.href.split('#')[0] + '#' + NET.code;
  $('lStatus').textContent = host ? (o ? '¡Tu amigo está en la sala! Toca "¡A defender!" cuando estén listos.' : 'Pásale el código o el enlace a tu amigo y espera a que entre.') : (o ? 'Estás en la sala. Espera a que tu amigo empiece la partida.' : 'Esperando al anfitrión…');
  $('bStart').hidden = !host; $('bStart').disabled = !o;
}
function hostStart() {
  const o = others().find(p => p.presence.role === 'guest'); NET.guest = o ? o.peer : null; NET.lastSeq = 0;
  G.epoch = Date.now(); startGame('host');
  if (!o) toast('Tu amigo no está: la computadora maneja su cañón');
}
function onPeers() {
  const ps = others();
  if (NET.role === 'host') {
    const o = ps.find(p => p.presence.role === 'guest');
    if (G.mode === 'host' && G.sim) {
      const here = o && o.peer === NET.guest;
      if (here) { const inp = o.presence.in; if (inp && inp.e === G.epoch && Array.isArray(inp.q)) for (const [q, x, y] of inp.q) if (q > NET.lastSeq) { NET.lastSeq = q; fire(G.sim, 1, +x, +y); }
        if (G.sim.ai[1] && NET.guest) { G.sim.ai[1] = false; toast('Tu amigo volvió'); } }
      else if (NET.guest && !G.sim.ai[1]) { G.sim.ai[1] = true; toast('Tu amigo se desconectó: la computadora toma su cañón'); }
    }
    if (!$('lobby').hidden) renderLobby();
  } else if (NET.role === 'guest') {
    const h = ps.find(p => p.presence.role === 'host');
    if (h) {
      clearTimeout(G.hostGoneT); G.hostGoneT = null;
      const st = h.presence.st;
      if (st && st.e && st.e !== G.epoch && h.presence.vs === myPeer()) { G.epoch = st.e; startGame('guest'); }
      if (st && st.e === G.epoch && G.mode === 'guest') applySnap(st);
    } else if (G.mode === 'guest' && !G.hostGoneT) {
      toast('Se perdió la conexión con tu amigo…');
      G.hostGoneT = setTimeout(() => { if (G.mode === 'guest' && !others().length) { leave(); $('mMsg').textContent = 'Se perdió la conexión con el anfitrión.'; } }, 10000);
    }
    if (!$('lobby').hidden) renderLobby();
  }
}
renderBest();
