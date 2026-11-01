// engine.js — reglas de la batalla: tablero, barcos, fichas, resolución por fases y el capitán rival
'use strict';
const BW = 10, BH = 17;
const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];   // 0 norte, 1 este, 2 sur, 3 oeste
const MOVES = ['F', 'L', 'R'];

const SHIPS = {
  balandra: { name: 'Balandra', hp: 24, dmg: 2, guns: 1, sail: 4, load: 2, maxBalls: 6, maxTok: 10, crew: 6, masts: 1, len: .8, beam: .4, ports: 2, price: 0, pf: 1 },
  bergantin: { name: 'Bergantín', hp: 36, dmg: 3, guns: 1, sail: 4, load: 2, maxBalls: 7, maxTok: 11, crew: 8, masts: 2, len: .94, beam: .44, ports: 3, price: 900, pf: 1.6 },
  galeon: { name: 'Galeón', hp: 54, dmg: 3, guns: 2, sail: 3, load: 4, maxBalls: 12, maxTok: 10, crew: 10, masts: 3, len: 1.06, beam: .5, ports: 4, price: 2600, pf: 2.4 },
};
// munición: la bala hace daño; la cadena rompe velas (el rival recibe menos fichas); la metralla, de corto alcance, baja la tripulación
const AMMO = {
  N: { name: 'Bala', short: 'Bala', range: 3, dmgK: 1, col: '255,176,46' },
  C: { name: 'Cadena', short: 'Cadena', range: 3, dmgK: .4, torn: 1, col: '180,120,255' },
  G: { name: 'Metralla', short: 'Metralla', range: 2, dmgK: .4, crew: 1, col: '255,80,80' },
};
const ammoOf = v => v === true ? 'N' : v || null;
const UPGRADES = [
  { k: 'casco', name: 'Casco reforzado', desc: l => `Vida +${l * 15}%` },
  { k: 'canon', name: 'Cañones de bronce', desc: l => `Daño por bala +${(l * .5).toFixed(1)}` },
  { k: 'velas', name: 'Velas nuevas', desc: l => `+${Math.floor((l + 1) / 2)} fichas de movimiento por turno` },
  { k: 'artil', name: 'Artilleros', desc: l => `+${Math.floor((l + 1) / 2)} balas cargadas por turno` },
];
const UP_MAX = 5;
const upCost = (type, l) => Math.round(60 * Math.pow(1.7, l) * SHIPS[type].pf);
function statsOf(type, up = {}) {
  const b = SHIPS[type], u = k => up[k] || 0;
  return { hp: Math.round(b.hp * (1 + .15 * u('casco'))), dmg: b.dmg + .5 * u('canon'), guns: b.guns, sail: b.sail + Math.floor((u('velas') + 1) / 2),
    load: b.load + Math.floor((u('artil') + 1) / 2), maxBalls: b.maxBalls + u('artil'), maxTok: b.maxTok };
}
function makeShip(id, team, type, up, x, y, d, name) {
  const st = statsOf(type, up);
  return { id, team, type, name, ...st, maxHp: st.hp, x, y, d, F: 3, L: 2, R: 2, balls: Math.min(st.maxBalls, st.load + 2), sunk: false, crew: SHIPS[type].crew, crewMax: SHIPS[type].crew, torn: 0 };
}

// ---------- azar con semilla ----------
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- mapa: rocas altas y bajas, viento y remolinos ----------
const inB = (x, y) => x >= 0 && y >= 0 && x < BW && y < BH;
const isRock = (map, x, y) => { const t = map[y][x].t; return t === 'rockT' || t === 'rockS' || t === 'land'; };
const blocksShot = (map, x, y) => { const t = map[y][x].t; return t === 'rockT' || t === 'land'; };
const MAPS = { calmo: 'Mar abierto', archi: 'Archipiélago', niebla: 'Niebla', tormenta: 'Tormenta' };
function genMap(seed, kind = 'calmo') {
  const R = rng(seed), map = []; map.kind = kind;
  for (let y = 0; y < BH; y++) { const row = []; for (let x = 0; x < BW; x++) row.push({ t: 'sea', v: R() }); map.push(row); }
  const free = (x, y) => inB(x, y) && map[y][x].t === 'sea' && y > 2 && y < BH - 3;
  const ri = (a, b) => a + Math.floor(R() * (b - a + 1));
  const nW = ri(1, 2);
  for (let k = 0, n = 0; k < 40 && n < nW; k++) { const wx = ri(1, BW - 3), wy = ri(4, BH - 6);
    if ([[0, 0], [1, 0], [0, 1], [1, 1]].every(([a, b]) => free(wx + a, wy + b))) { const cw = R() < .5; for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) map[wy + b][wx + a] = { t: 'whirl', wx, wy, cw, v: R() }; n++; } }
  const nWind = ri(2, 3);
  for (let k = 0, n = 0; k < 60 && n < nWind; k++) { const x = ri(1, BW - 2), y = ri(3, BH - 4), d = ri(0, 3), len = 3; let ok = true;
    for (let i = 0; i < len; i++) if (!free(x + DX[d] * i, y + DY[d] * i)) ok = false;
    if (ok) { for (let i = 0; i < len; i++) map[y + DY[d] * i][x + DX[d] * i] = { t: 'wind', wd: d, v: R() }; n++; } }
  if (kind === 'archi') { // islas grandes que tapan el paso y las balas
    for (let k = 0, n = 0, want = ri(3, 4); k < 80 && n < want; k++) { const w = ri(2, 3), h = 2, x = ri(0, BW - w), y = ri(4, BH - 6); let ok = true;
      for (let j = -1; j <= h; j++) for (let i = -1; i <= w; i++) { const xx = x + i, yy = y + j; if (inB(xx, yy) && map[yy][xx].t !== 'sea') ok = false; if (yy < 3 || yy > BH - 4) ok = false; }
      if (ok) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) map[y + j][x + i] = { t: 'land', isl: n, ix: x, iy: y, iw: w, ih: h, v: R() }; n++; } } }
  const nT = kind === 'archi' ? ri(2, 3) : ri(5, 8), nS = kind === 'archi' ? ri(2, 4) : ri(4, 6);
  for (let k = 0, n = 0; k < 200 && n < nT + nS; k++) { const x = ri(0, BW - 1), y = ri(3, BH - 4);
    if (!free(x, y)) continue; let near = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (inB(x + dx, y + dy) && map[y + dy][x + dx].t === 'whirl') near++;
    if (near) continue; map[y][x] = { t: n < nT ? 'rockT' : 'rockS', v: R() }; n++; }
  return map;
}

// ---------- fichas ----------
// en la tormenta el viento cambia de dirección cada turno
function stormShift(map) { for (const row of map) for (const t of row) if (t.t === 'wind') t.wd = Math.floor(Math.random() * 4); }
const tokCaps = s => ({ F: Math.ceil(s.maxTok * .5), L: Math.ceil(s.maxTok * .35), R: Math.ceil(s.maxTok * .35) });
function refill(s, R = Math.random) {
  const sail = Math.max(1, s.sail - (s.torn || 0)); s.torn = Math.max(0, (s.torn || 0) - 1);
  // cada tipo tiene su propio tope (juntar avances no bloquea los giros) y las fichas nuevas van de preferencia al tipo que tienes más bajo
  const cap = tokCaps(s), base = { F: .5, L: .25, R: .25 };
  for (let i = 0; i < sail; i++) { const opts = MOVES.filter(m => s[m] < cap[m]); if (!opts.length) break;
    const w = opts.map(m => base[m] / (1 + s[m] * .6) * (s[m] === 0 ? 2.5 : 1)), tot = w.reduce((a, b) => a + b, 0); let r = R() * tot, k = 0; while (r > w[k] && k < opts.length - 1) { r -= w[k]; k++; } s[opts[k]]++; }
  const load = s.crew != null && s.crew <= s.crewMax * .4 ? Math.max(1, s.load - 1) : s.load; s.balls = Math.min(s.maxBalls, s.balls + load);
}
function legalPlans(s) {
  const out = [], opts = [null, 'F', 'L', 'R'];
  for (const a of opts) for (const b of opts) for (const c of opts) for (const d of opts) {
    const p = [a, b, c, d], n = { F: 0, L: 0, R: 0 }; for (const m of p) if (m) n[m]++;
    if (n.F <= s.F && n.L <= s.L && n.R <= s.R) out.push(p);
  }
  return out;
}
const cloneShips = ships => ships.map(s => ({ ...s }));
const cheb = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));

// ---------- resolución de una fase: movimiento, mar (viento y remolinos), cañones y abordaje ----------
function resolvePhase(map, ships, plans, p, opts = {}) {
  const ev = { moves: [], env: [], shots: [], dmg: {}, rams: [], board: null, sunk: [] };
  const live = ships.filter(s => !s.sunk);
  const hurt = (s, n) => { if (n > 0) ev.dmg[s.id] = (ev.dmg[s.id] || 0) + n; };
  const st = live.map(s => { const sl = plans[s.id] && plans[s.id][p], m = sl ? sl.m : null;
    return { s, sl, m, from: { x: s.x, y: s.y, d: s.d }, x: s.x, y: s.y, d: s.d, nd: m === 'L' ? (s.d + 3) % 4 : m === 'R' ? (s.d + 1) % 4 : s.d, via: null, bump: null, half: false }; });
  const step = (list, dirOf) => {
    for (const o of list) { const dd = dirOf(o); o.tx = o.x + DX[dd]; o.ty = o.y + DY[dd]; o.ok = true; o.why = null;
      if (!inB(o.tx, o.ty)) { o.ok = false; o.why = 'edge'; } else if (isRock(map, o.tx, o.ty)) { o.ok = false; o.why = 'rock'; } }
    for (let pass = 0; pass < 3; pass++) for (const o of list) { if (!o.ok) continue;
      for (const q of list) if (q !== o && q.ok && q.tx === o.tx && q.ty === o.ty) { o.ok = q.ok = false; o.why = q.why = 'ship'; }
      for (const q of list) if (q !== o && q.ok && q.tx === o.x && q.ty === o.y && o.tx === q.x && o.ty === q.y) { o.ok = q.ok = false; o.why = q.why = 'ship'; }
      if (o.ok) for (const q of st) { if (q === o || (list.includes(q) && q.ok)) continue; if (q.x === o.tx && q.y === o.ty) { o.ok = false; o.why = 'ship'; } }
    }
    for (const o of list) { if (o.ok) { o.x = o.tx; o.y = o.ty; } else { o.bump = { x: o.tx, y: o.ty, why: o.why }; if (o.why !== 'edge') { hurt(o.s, o.why === 'rock' ? 1.5 : 1); ev.rams.push({ id: o.s.id, x: o.tx, y: o.ty, why: o.why }); } } }
  };
  step(st.filter(o => o.m), o => o.d);
  for (const o of st) if (o.m === 'L' || o.m === 'R') { if (o.bump) { o.d = o.nd; o.half = true; } else o.via = { x: o.x, y: o.y }; }
  step(st.filter(o => (o.m === 'L' || o.m === 'R') && !o.half), o => o.nd);
  for (const o of st) { if (o.m === 'L' || o.m === 'R') o.d = o.nd; o.s.x = o.x; o.s.y = o.y; o.s.d = o.d;
    ev.moves.push({ id: o.s.id, m: o.m, from: o.from, via: o.via, to: { x: o.x, y: o.y, d: o.d }, bump: o.bump, half: o.half }); }
  // el mar: el viento empuja una casilla; el remolino te lleva en diagonal a su esquina opuesta y te gira un cuarto de vuelta
  const CYC = [[0, 0], [1, 0], [1, 1], [0, 1]];
  for (const o of st) { const t = map[o.y][o.x]; o.ex = o.x; o.ey = o.y; o.ed = o.d; o.kind = null;
    if (t.t === 'wind') { o.ex = o.x + DX[t.wd]; o.ey = o.y + DY[t.wd]; o.kind = 'wind'; }
    else if (t.t === 'whirl') { let i = CYC.findIndex(c => t.wx + c[0] === o.x && t.wy + c[1] === o.y); i = (i + 2) % 4; /* esquina opuesta, como en el original */ o.ex = t.wx + CYC[i][0]; o.ey = t.wy + CYC[i][1]; o.ed = (o.d + (t.cw ? 1 : 3)) % 4; o.kind = 'whirl'; } }
  for (const o of st) { if (!o.kind) continue; let ok = inB(o.ex, o.ey) && !isRock(map, o.ex, o.ey);
    if (!ok && inB(o.ex, o.ey)) { hurt(o.s, 1); ev.rams.push({ id: o.s.id, x: o.ex, y: o.ey, why: 'rock' }); }
    for (const q of st) if (q !== o) { const qx = q.kind ? q.ex : q.x, qy = q.kind ? q.ey : q.y; if (qx === o.ex && qy === o.ey) ok = false; }
    o.okE = ok; }
  for (const o of st) { if (!o.kind) continue; const from = { x: o.x, y: o.y, d: o.d }; if (o.okE) { o.x = o.ex; o.y = o.ey; } o.d = o.ed; o.s.x = o.x; o.s.y = o.y; o.s.d = o.d;
    if (from.x !== o.x || from.y !== o.y || from.d !== o.d) ev.env.push({ id: o.s.id, kind: o.kind, from, to: { x: o.x, y: o.y, d: o.d } }); }
  // cañones (todos disparan al mismo tiempo, desde donde quedaron)
  if (opts.shots !== false) for (const o of st) { const sl = o.sl; if (!sl) continue;
    for (const side of ['L', 'R']) { const am = ammoOf(side === 'L' ? sl.fl : sl.fr); if (!am) continue; const A = AMMO[am], s = o.s, n = s.guns; if (s.balls < n) continue; s.balls -= n;
      const sd = side === 'L' ? (s.d + 3) % 4 : (s.d + 1) % 4; let end = null, res = 'miss', hit = null;
      for (let i = 1; i <= A.range; i++) { const nx = s.x + DX[sd] * i, ny = s.y + DY[sd] * i; if (!inB(nx, ny)) break; end = { x: nx, y: ny };
        if (blocksShot(map, nx, ny)) { res = 'rock'; break; }
        const tg = live.find(q => q !== s && q.x === nx && q.y === ny); if (tg) { res = 'hit'; hit = tg; break; } }
      if (!end) end = { x: s.x + DX[sd] * .7, y: s.y + DY[sd] * .7 };
      const dmg = hit ? s.dmg * n * A.dmgK : 0;
      ev.shots.push({ id: s.id, side, n, am, from: { x: s.x, y: s.y, d: s.d }, to: end, res, target: hit && hit.id, dmg });
      if (hit) { hurt(hit, dmg); if (!opts.noDamage) { if (A.torn) hit.torn = Math.min(3, (hit.torn || 0) + A.torn * n); if (A.crew) hit.crew = Math.max(0, hit.crew - A.crew * n); } } } }
  for (const o of st) if (o.sl && o.sl.g && !ev.board) { const q = live.find(q => q.team !== o.s.team && cheb(q, o.s) <= 1); if (q) ev.board = { a: o.s.id, b: q.id }; }
  if (opts.noDamage) return ev;
  for (const id in ev.dmg) { const s = ships.find(q => q.id === id); s.hp -= ev.dmg[id]; if (s.hp <= 0 && !s.sunk) { s.hp = 0; s.sunk = true; ev.sunk.push(id); } }
  return ev;
}
// ¿el barco a tiene a b en la línea de alguno de sus costados (hasta 3 casillas, sin roca alta en medio)?
function lineInfo(map, a, b) {
  for (const side of ['L', 'R']) { const sd = side === 'L' ? (a.d + 3) % 4 : (a.d + 1) % 4;
    for (let i = 1; i <= 3; i++) { const nx = a.x + DX[sd] * i, ny = a.y + DY[sd] * i; if (!inB(nx, ny) || blocksShot(map, nx, ny)) break; if (nx === b.x && ny === b.y) return { side, dist: i }; } }
  return null;
}
function inLine(map, a, b, range = 3) { const i = lineInfo(map, a, b); return i && i.dist <= range ? i.side : null; }
const nearestFoe = (ships, me) => ships.filter(s => !s.sunk && s.team !== me.team).sort((a, b) => cheb(a, me) - cheb(b, me))[0] || null;
// recorrido de tu plan, suponiendo que el rival no se mueve (para la vista previa)
function previewPlan(map, ships, me, slots) {
  const sh = cloneShips(ships), plans = { [me.id]: slots }, out = [];
  for (let p = 0; p < 4; p++) { resolvePhase(map, sh, plans, p, { shots: false, noDamage: true }); const s = sh.find(q => q.id === me.id); out.push({ x: s.x, y: s.y, d: s.d }); }
  return out;
}

// ---------- el capitán rival ----------
const LEVELS = { facil: { name: 'Fácil', K: 0 }, medio: { name: 'Medio', K: 12 }, dificil: { name: 'Difícil', K: 48 } };
function aiPlan(map, ships, me, foe, level) {
  foe = foe && !foe.sunk ? foe : nearestFoe(ships, me); if (!foe) return [0, 1, 2, 3].map(() => ({ m: null, fl: false, fr: false, g: false }));
  const mine = legalPlans(me), theirs = legalPlans(foe), pick = a => a[Math.floor(Math.random() * a.length)];
  if (level === 'facil' || !foe || foe.sunk) {
    const mp = pick(mine.filter(p => p.filter(Boolean).length >= 2).concat(mine)); const slots = mp.map(m => ({ m, fl: false, fr: false, g: false }));
    const prev = previewPlan(map, ships, me, slots); let balls = me.balls;
    prev.forEach((pos, p) => { const side = inLine(map, pos, foe); if (side && balls >= me.guns && Math.random() < .7) { slots[p][side === 'L' ? 'fl' : 'fr'] = 'N'; balls -= me.guns; } });
    return slots;
  }
  const L = LEVELS[level], preds = [];
  const stay = theirs.find(p => p.every(m => !m)); if (stay) preds.push(stay);
  while (preds.length < L.K) preds.push(pick(theirs));
  const cand = mine.length > 220 ? Array.from({ length: 220 }, () => pick(mine)) : mine;
  const foeFire = Math.min(1, foe.balls / (foe.guns * 2)), meR = me.hp / me.maxHp, foeR = foe.hp / foe.maxHp;
  let best = null, bs = -1e9;
  for (const mp of cand) {
    let ram = 0, taken = 0, pos = 0; const line = [[0, 0], [0, 0], [0, 0], [0, 0]], near = [[0, 0], [0, 0], [0, 0], [0, 0]], adj = [0, 0, 0, 0];
    const mySlots = mp.map(m => ({ m }));
    for (const pp of preds) {
      const sh = cloneShips(ships), A = sh.find(s => s.id === me.id), B = sh.find(s => s.id === foe.id), plans = { [me.id]: mySlots, [foe.id]: pp.map(m => ({ m })) };
      for (let p = 0; p < 4; p++) { const ev = resolvePhase(map, sh, plans, p, { shots: false, noDamage: true }); ram += ev.dmg[me.id] || 0;
        const li = lineInfo(map, A, B); if (li) { line[p][li.side === 'L' ? 0 : 1]++; if (li.dist <= 2) near[p][li.side === 'L' ? 0 : 1]++; }
        if (inLine(map, B, A)) taken += foe.dmg * foe.guns * foeFire; if (cheb(A, B) <= 1) adj[p]++; }
      const dd = Math.abs(A.x - B.x) + Math.abs(A.y - B.y), edge = A.x === 0 || A.y === 0 || A.x === BW - 1 || A.y === BH - 1;
      pos += (dd >= 2 && dd <= 4 ? 1 : dd < 2 ? .2 : -.18 * (dd - 4)) - (edge ? .5 : 0);
    }
    const n = preds.length, fires = [[false, false], [false, false], [false, false], [false, false]], c = [];
    for (let p = 0; p < 4; p++) for (let s = 0; s < 2; s++) c.push({ p, s, f: line[p][s] / n });
    c.sort((a, b) => b.f - a.f); let balls = me.balls, dealt = 0;
    for (const q of c) { if (q.f < (level === 'dificil' ? .2 : .38) || balls < me.guns) break; fires[q.p][q.s] = q.p * 2 + q.s + 1; balls -= me.guns; dealt += q.f * me.dmg * me.guns; }
    const sc = dealt * 1.25 - taken / n * (level === 'dificil' ? 1.4 : .85) - ram / n * 1.6 + pos / n * (level === 'dificil' ? 1.6 : 1.3) + Math.random() * (level === 'medio' ? 1.4 : .15);
    if (sc > bs) { bs = sc; best = { mp, fires, near, n, adj: adj.map(a => a / n) }; }
  }
  // munición: metralla si va a abordar y está cerca; cadena a veces para quitarle movimiento; si no, bala
  const board = meR >= foeR + .2, foeTok = foe.F + foe.L + foe.R;
  const ammoFor = (p, s) => board && best.near[p][s] / best.n >= .5 ? 'G' : foeTok >= 5 && foeR > .4 && Math.random() < .25 ? 'C' : 'N';
  const slots = best.mp.map((m, p) => ({ m, fl: best.fires[p][0] ? ammoFor(p, 0) : false, fr: best.fires[p][1] ? ammoFor(p, 1) : false, g: false }));
  if (board) { const p = best.adj.findIndex(a => a >= .5); if (p >= 0) { slots[p].g = true; slots[p].fl = slots[p].fr = false; } }
  return slots;
}
