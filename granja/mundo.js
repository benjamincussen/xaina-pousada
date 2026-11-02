// Sítio do Vento — o Mundo: mapa do mundo, cidades vizinhas, colônias e conquistas.
// Carregado depois de game.js; usa as funções e o estado de lá. Tudo passa por apply() (ações 'mu...'), então o co-op funciona igual.
(function () {
const MU_SITES = [
  { id: 'brisa', k: 'nb', name: 'Porto Brisa', x: 0.82, y: 0.30, col: '#1fa6a0', pers: 'com' },
  { id: 'c1', k: 'col', name: 'Nova Esperança', x: 0.14, y: 0.22 },
  { id: 'pedra', k: 'nb', name: 'Vila Pedra', x: 0.16, y: 0.80, col: '#7d6a55', pers: 'war' },
  { id: 'c2', k: 'col', name: 'Baía Serena', x: 0.44, y: 0.17 },
  { id: 'sol', k: 'nb', name: 'Monte Sol', x: 0.60, y: 0.10, col: '#e6a92a', pers: 'agro' },
  { id: 'c3', k: 'col', name: 'Ilha do Farol', x: 0.90, y: 0.62 },
  { id: 'c4', k: 'col', name: 'Vale Dourado', x: 0.36, y: 0.88 },
  { id: 'c5', k: 'col', name: 'Ponta Norte', x: 0.30, y: 0.06 },
  { id: 'c6', k: 'col', name: 'Recanto Verde', x: 0.06, y: 0.52 },
];
const MU_HOME = { x: 0.36, y: 0.48 }, MU_AUR = { x: 0.64, y: 0.76, col: '#ff8a1f' };
const COL_T = { turismo: '🏨', comercio: '🏪', agro: '🌾', mina: '⛏️', militar: '🛡️' };
const muExpCost = n => 2000 + n * 3000, MU_FOUND = 40000, muUpCost = lv => Math.round(12000 * Math.pow(lv, 1.35)), MU_MAX = 10;
const site = id => MU_SITES.find(s => s.id === id);
function muOf(S) { if (!S.mu || typeof S.mu !== 'object') S.mu = { disc: 0, col: {}, nbx: {} }; if (!S.mu.col || typeof S.mu.col !== 'object') S.mu.col = {}; if (!S.mu.nbx || typeof S.mu.nbx !== 'object') S.mu.nbx = {}; return S.mu; }
const known = (S, id) => MU_SITES.findIndex(s => s.id === id) < muOf(S).disc;
const nbxOf = (S, id) => { const M = muOf(S); if (!M.nbx[id]) M.nbx[id] = { pop: 40, sol: 6, wall: 0, rel: site(id).pers === 'war' ? -5 : site(id).pers === 'com' ? 30 : 15, next: 0, wins: 0 }; return M.nbx[id]; };
const lvlOf = nb => Math.min(10, 1 + Math.floor(nb.pop / 60));
const nbxDef = nb => Math.round(nb.sol * 0.6 + nb.wall * 15);
window.muDef = S => { const M = S.mu; if (!M || !M.col) return 0; let d = 0; for (const c of Object.values(M.col)) if (c && c.type === 'militar') d += c.lv * 12; return d; };
function colYield(c) { const L2 = c.lv; return { coins: c.type === 'turismo' ? 300 * L2 : c.type === 'agro' ? 100 * L2 : 60 * L2, treas: c.type === 'comercio' ? 400 * L2 : c.type === 'agro' ? 250 * L2 : 80 * L2 }; }
const colCoins = (c, now) => Math.floor(Math.min(4, Math.max(0, (now - (c.at || now)) / 3600000)) * colYield(c).coins);
function muLog(S, now, who, k, arg, v) { if (S.cv && typeof cvLog === 'function') cvLog(S, now, who, k, arg, v); }
const WHO_NB = id => 'nbx:' + id;

// ---------- ações (chamadas por apply) ----------
window.muApply = function (S, a, now, out, fail) {
  const M = muOf(S);
  if (a.a === 'muExplore') { if (M.disc >= MU_SITES.length) return fail(''); const c = muExpCost(M.disc); if (S.coins < c) return fail(L('noCoins')); S.coins -= c; const s = MU_SITES[M.disc]; M.disc++; if (s.k === 'nb') nbxOf(S, s.id); muLog(S, now, a.by2 || 'you', 'muDisc', s.name); out.fx.push(['muDisc', s.id]); return true; }
  if (a.a === 'muFound') { const s = site(a.id); if (!s || s.k !== 'col' || !known(S, a.id) || M.col[a.id]) return fail(''); if (!COL_T[a.t]) return fail(''); if (S.coins < MU_FOUND) return fail(L('noCoins')); S.coins -= MU_FOUND; M.col[a.id] = { lv: 1, type: a.t, at: now, nm: s.name }; muLog(S, now, a.by2 || 'you', 'muFound', s.name); out.fx.push(['muFound', a.id]); return true; }
  if (a.a === 'muUp') { const c = M.col[a.id]; if (!c || c.lv >= MU_MAX) return fail(''); const k = muUpCost(c.lv); if (S.coins < k) return fail(L('noCoins')); S.coins -= k; c.lv++; muLog(S, now, a.by2 || 'you', 'muUp', (c.nm || a.id) + ' ' + c.lv); out.fx.push(['muUp', a.id, c.lv]); return true; }
  if (a.a === 'muCollect') { const c = M.col[a.id]; if (!c) return fail(''); const v = colCoins(c, now); if (v < 1) return fail(L('muNothing')); c.at = now; S.coins += v; out.fx.push(['coins', v]); return true; }
  if (a.a === 'muGift') { const s = site(a.id); if (!s || s.k !== 'nb' || !known(S, a.id)) return fail(''); const n = a.n === 5000 ? 5000 : 500; if (S.coins < n) return fail(L('noCoins')); S.coins -= n; const nb = nbxOf(S, a.id); nb.rel = Math.min(100, nb.rel + (n === 5000 ? 30 : 8)); out.fx.push(['coins', -n]); out.fx.push(['muGift', a.id]); return true; }
  if (a.a === 'muAttack') { const s = site(a.id); if (!s || s.k !== 'nb' || !known(S, a.id) || !S.land.porto2) return fail(''); const m = milOf(S), nb = nbxOf(S, a.id); if (m.sol < 10) return fail(L('milFew')); if (now - (m.atk || 0) < ATK_CD) return fail(L('milWait', fmtT(Math.ceil((ATK_CD - (now - m.atk)) / 1000))));
    const pw = milAtk(S) * (0.8 + Math.random() * 0.4), dv = Math.max(1, nbxDef(nb)) * (0.8 + Math.random() * 0.4), win = pw > dv; m.atk = now;
    if (win) { const loot = Math.round(500 + nb.pop * 20); S.coins += loot; nb.sol = Math.floor(nb.sol * 0.5); nb.wall = Math.max(0, nb.wall - 1); m.sol = Math.floor(m.sol * 0.8); nb.rel = Math.max(-100, nb.rel - 35); nb.wins = (nb.wins || 0) + 1; m.last = [now, 1, loot]; out.fx.push(['coins', loot]); out.fx.push(['battle', 1, loot]); muLog(S, now, 'you', 'muWin', s.name, loot);
      if (nb.wins >= 3) { delete M.nbx[a.id]; M.conq = M.conq || {}; M.conq[a.id] = 1; M.col[a.id] = { lv: 3, type: 'militar', at: now, nm: s.name }; muLog(S, now, 'you', 'muConq', s.name); out.fx.push(['muConq', a.id]); } }
    else { m.sol = Math.floor(m.sol * 0.5); nb.rel = Math.max(-100, nb.rel - 20); m.last = [now, 0, 0]; out.fx.push(['battle', 0, 0]); muLog(S, now, 'you', 'muLose', s.name); }
    return true; }
  if (a.a === 'muType') { const c = M.col[a.id]; if (!c || !COL_T[a.t]) return fail(''); c.type = a.t; return true; }
  return null;
};

// ---------- relógio (só o anfitrião, dentro do Conselho) ----------
window.muTick = function (S, now) { const M = muOf(S); let ch = false; const h = 20 / 3600;
  for (const c of Object.values(M.col)) { if (!c) continue; const y = colYield(c); if (S.cv) cvAdd(S, y.treas * h); if (c.type === 'mina') { const mn = minOf(S); mn.pedra = Math.min(5000, (mn.pedra || 0) + 20 * c.lv * h); mn.ferro = Math.min(5000, (mn.ferro || 0) + 10 * c.lv * h); mn.ouro = Math.min(500, (mn.ouro || 0) + 2 * c.lv * h); }
    if (c.type === 'militar') { const m = milOf(S); if (m.sol < MIL_MAX + 50 * c.lv && Math.random() < c.lv * h * 2) m.sol++; } }
  const us = 30 + S.homes.length * 4 + S.lvl * 3;
  for (const s of MU_SITES) { if (s.k !== 'nb' || !known(S, s.id) || (M.conq && M.conq[s.id])) continue; const nb = nbxOf(S, s.id), war = s.pers === 'war';
    nb.pop = Math.min(us * (war ? 1.0 : 1.2) + 30, nb.pop + 0.4 + lvlOf(nb) * 0.12); const solT = nb.pop * (war ? 0.4 : 0.2) + Math.max(0, -nb.rel) * 0.3; if (nb.sol < solT) nb.sol = Math.min(solT, nb.sol + 0.3 + lvlOf(nb) * 0.1);
    if (nb.wall < Math.floor(lvlOf(nb) / 2) && Math.random() < 0.03) nb.wall++; const tgt = s.pers === 'com' ? 30 : war ? -10 : 15; nb.rel += (tgt - nb.rel) * 0.004; nb.rel = clamp(nb.rel, -100, 100);
    if (now < (nb.next || 0)) continue; nb.next = now + (10 + Math.random() * 10) * 60000; if (!nb.seen) { nb.seen = 1; continue; } ch = true; const who = WHO_NB(s.id);
    if (nb.rel > 40) { const c = 250 + lvlOf(nb) * 90; if (S.cv) cvAdd(S, c); nb.rel += 2; muLog(S, now, who, 'nbTrade', c); }
    else if (nb.rel >= 0) { if (Math.random() < 0.5) { nb.rel += 5; muLog(S, now, who, 'nbFest', ''); } else { nb.rel -= 10; muLog(S, now, who, 'nbBorder', ''); } }
    else if (nb.rel < -50 && S.land.porto2 && S.cv) { if (nb.sol > milDef(S)) { const loss = cvTake(S, Math.round(Math.min(S.cv.t * 0.2, 1200 + lvlOf(nb) * 300))); m2(S).sol = Math.floor(m2(S).sol * 0.85); nb.rel = -25; muLog(S, now, who, 'nbRaid', loss); } else { nb.sol = Math.floor(nb.sol * 0.7); nb.rel -= 5; muLog(S, now, who, 'nbDef', ''); } }
    else { const q = Math.random(); if (q < 0.5) { nb.rel -= 5; muLog(S, now, who, 'nbThreat', ''); } else { nb.rel += 10; muLog(S, now, who, 'nbPeace', ''); } } }
  return ch; };
const m2 = S => milOf(S);

// ---------- opções do Conselho (vão no fim: só quando o resto está feito) ----------
window.muOpts = function (S, now, r, o) { const M = muOf(S); const cols = Object.entries(M.col).filter(([, c]) => c && c.lv < MU_MAX).sort((a, b) => a[1].lv - b[1].lv);
  if (r === 'pref') { const free = MU_SITES.filter(s => s.k === 'col' && known(S, s.id) && !M.col[s.id]); if (free.length) { const types = Object.values(M.col).map(c => c && c.type), pick = ['comercio', 'turismo', 'mina', 'agro', 'militar'].find(t => !types.includes(t)) || 'comercio'; o.push([{ a: 'muFound', id: free[0].id, t: (S.nb && S.nb.rel < 0) ? 'militar' : pick, by2: 'pref' }, MU_FOUND]); } else if (M.disc < MU_SITES.length) o.push([{ a: 'muExplore', by2: 'pref' }, muExpCost(M.disc)]); }
  if (r === 'obras' && cols[0]) o.push([{ a: 'muUp', id: cols[0][0], by2: 'obras' }, muUpCost(cols[0][1].lv)]);
  if (r === 'comercio') { const c = cols.find(([, c]) => c.type === 'comercio' || c.type === 'turismo' || c.type === 'mina'); if (c) o.push([{ a: 'muUp', id: c[0], by2: 'comercio' }, muUpCost(c[1].lv)]); }
  if (r === 'agro') { const c = cols.find(([, c]) => c.type === 'agro'); if (c) o.push([{ a: 'muUp', id: c[0], by2: 'agro' }, muUpCost(c[1].lv)]); }
  if (r === 'defesa') { const c = cols.find(([, c]) => c.type === 'militar'); if (c) o.push([{ a: 'muUp', id: c[0], by2: 'defesa' }, muUpCost(c[1].lv)]); } };
window.muWho = function (r) { if (!r || r.slice(0, 4) !== 'nbx:') return null; const s = site(r.slice(4)); return s ? '🏰 ' + s.name : null; };

// ---------- folhas ----------
const pos = (S, s) => s.id === 'home' ? MU_HOME : s.id === 'aurora' ? MU_AUR : s;
function nodes(S) { const M = muOf(S), out = [{ id: 'home', k: 'home', name: S.cityName || L('city'), x: MU_HOME.x, y: MU_HOME.y, col: '#3d7fd6' }, { id: 'aurora', k: 'aur', name: L('nbName'), x: MU_AUR.x, y: MU_AUR.y, col: MU_AUR.col }];
  MU_SITES.forEach((s, i) => out.push(Object.assign({}, s, { known: i < M.disc, mine: !!M.col[s.id] }))); return out; }
window.muSheet = function (S, t) { const M = muOf(S), now = Date.now();
  if (SH.type === 'urbe') return urbeSheet(S, t, SH.arg);
  t.textContent = '🌍 ' + L('muT'); const next = MU_SITES[M.disc];
  setTimeout(muPaint, 0);
  let h = `<p class="sub">${L('muSub')}</p><canvas id="muMap" width="640" height="480" style="display:block;width:100%;height:auto;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.2);background:#3d8fd6;cursor:pointer"></canvas>`;
  h += next ? `<button class="btn" type="button" data-mu="muExplore" style="font-size:16px;margin-top:8px">🧭 ${L('muExplore')} · ${muExpCost(M.disc)}</button>` : `<p class="sub">${L('muAllKnown')}</p>`;
  const cols = Object.entries(M.col); h += `<span class="lbl">🏳️ ${L('muCols')} (${cols.length})</span>` + (cols.length ? cols.map(([id, c]) => `<div class="card" style="padding:8px 10px"><div class="row" style="gap:8px"><span style="font-size:26px">${COL_T[c.type]}</span><div style="flex:1;min-width:0"><b>${esc(c.nm || id)}</b> · ${L('lvl', c.lv)}<br><small>${L('colT_' + c.type)} · ${L('colY', colYield(c).coins, colYield(c).treas)}</small></div><button class="btn blue" type="button" data-muv="${id}" style="font-size:14px;padding:6px 10px">${L('muVisit')}</button></div></div>`).join('') : `<small>${L('muNoCols')}</small>`);
  const nbs = MU_SITES.filter(s => s.k === 'nb' && known(S, s.id) && !(M.conq && M.conq[s.id]));
  h += `<span class="lbl">🏰 ${L('muNbs')}</span>` + [{ id: 'aurora', name: L('nbName') }].concat(nbs).map(s => { const nb = s.id === 'aurora' ? nbOf(S) : nbxOf(S, s.id); return `<div class="card" style="padding:8px 10px"><div class="row" style="gap:8px"><span style="font-size:26px">${nb.rel > 30 ? '😊' : nb.rel >= 0 ? '😐' : '😠'}</span><div style="flex:1;min-width:0"><b>${esc(s.name)}</b><br><small>👪 ${Math.floor(nb.pop)} · ⚔️ ${Math.floor(nb.sol)} · ${L('nbRel')} ${Math.round(nb.rel)}${s.pers ? ' · ' + L('pers_' + s.pers) : ''}</small></div><button class="btn blue" type="button" data-muv="${s.id}" style="font-size:14px;padding:6px 10px">${L('muVisit')}</button></div></div>`; }).join('');
  return h; };
function urbeSheet(S, t, id) { const M = muOf(S), now = Date.now(), m = milOf(S); setTimeout(muPaint, 0); let h = '';
  const back = `<button class="btn gray" type="button" data-muback="1" style="font-size:15px">⬅️ ${L('muT')}</button>`;
  if (id === 'aurora' || (site(id) && site(id).k === 'nb' && !M.col[id])) { const s = id === 'aurora' ? { name: L('nbName'), col: MU_AUR.col } : site(id), nb = id === 'aurora' ? nbOf(S) : nbxOf(S, id), def = id === 'aurora' ? nbDef(nb) : nbxDef(nb), armed = G.atkArm && now - G.atkArm < 6000;
    t.textContent = '🏰 ' + s.name;
    h = `<canvas id="muUrbe" width="640" height="420" style="display:block;width:100%;height:auto;border-radius:12px"></canvas><div class="card"><b>👪 ${Math.floor(nb.pop)} · ⭐${lvlOf(nb)} · ⚔️ ${Math.floor(nb.sol)} · 🧱 ${nb.wall}</b><br><small>${L('nbRel')}: ${Math.round(nb.rel)} · ${L('nbDefN', def)}${s.pers ? ' · ' + L('pers_' + s.pers) : ''}${nb.wins ? ' · ' + L('muWins', nb.wins) : ''}</small><br><small>${L('milPow', milAtk(S), milDef(S))}</small>
      <div class="row" style="gap:6px;margin-top:6px"><button class="btn blue" type="button" ${id === 'aurora' ? 'data-nbgift="1"' : `data-mugift="${id},500"`} style="flex:1;font-size:14px;padding:6px 4px">🎁 500</button>${id !== 'aurora' ? `<button class="btn blue" type="button" data-mugift="${id},5000" style="flex:1;font-size:14px;padding:6px 4px">🎁 5000</button>` : ''}${S.land.porto2 ? `<button class="btn" type="button" ${id === 'aurora' ? 'data-nbatk="1"' : `data-muatk="${id}"`} style="flex:1;font-size:14px;padding:6px 4px;background:${armed ? '#c0392b' : '#e0533d'}">⚔️ ${armed ? L('nbAtkSure') : L('nbAtk')}</button>` : ''}</div><small style="display:block;margin-top:4px;color:#7a6a55">${id === 'aurora' ? L('nbAtkNote') : L('muConqNote')}</small></div>`; }
  else if (M.col[id]) { const c = M.col[id], y = colYield(c), v = colCoins(c, now); t.textContent = COL_T[c.type] + ' ' + (c.nm || id);
    h = `<canvas id="muUrbe" width="640" height="420" style="display:block;width:100%;height:auto;border-radius:12px"></canvas><div class="card"><b>${L('lvl', c.lv)}/${MU_MAX} · ${L('colT_' + c.type)}</b><br><small>${L('colY', y.coins, y.treas)}</small><br><small>${L('colD_' + c.type)}</small>
      <div class="row" style="gap:6px;margin-top:6px"><button class="btn${v >= 1 ? '' : ' gray'}" type="button" data-mucol="${id}" ${v >= 1 ? '' : 'disabled'} style="flex:1;font-size:14px;padding:6px 4px">🪙 ${L('muCollect')} ${v}</button>${c.lv < MU_MAX ? `<button class="btn${S.coins >= muUpCost(c.lv) ? '' : ' gray'}" type="button" data-muup="${id}" style="flex:1;font-size:14px;padding:6px 4px">⬆️ ${L('muUpB')}<br><small>${muUpCost(c.lv)}</small></button>` : ''}</div>
      <small style="display:block;margin-top:6px"><b>${L('muChType')}</b></small><div class="row" style="gap:4px;flex-wrap:wrap">${Object.keys(COL_T).map(k => `<button class="btn${c.type === k ? '' : ' gray'}" type="button" data-mutype="${id},${k}" style="flex:1;font-size:18px;padding:4px">${COL_T[k]}</button>`).join('')}</div></div>`; }
  else if (site(id) && site(id).k === 'col' && known(S, id)) { const s = site(id); t.textContent = '🏝️ ' + s.name;
    h = `<canvas id="muUrbe" width="640" height="420" style="display:block;width:100%;height:auto;border-radius:12px"></canvas><div class="card"><b>${L('muFreeT')}</b><br><small>${L('muFreeSub', MU_FOUND)}</small><div class="row" style="gap:4px;flex-wrap:wrap;margin-top:6px">${Object.keys(COL_T).map(k => `<button class="btn${S.coins >= MU_FOUND ? '' : ' gray'}" type="button" data-mufound="${id},${k}" style="flex:1;min-width:30%;font-size:14px;padding:6px 4px">${COL_T[k]} ${L('colT_' + k)}</button>`).join('')}</div></div>`; }
  else { t.textContent = '❔'; h = `<p class="sub">${L('muUnknown')}</p>`; }
  return back + h; }

// ---------- desenho ----------
function muPaint() { const S = G.S; if (!S) return; const c = document.getElementById('muMap'); if (c) paintWorld(c, S); const u = document.getElementById('muUrbe'); if (u && SH) paintUrbe(u, S, SH.arg); }
function isle(g, x, y, rx, ry, seed) { g.fillStyle = '#e6d3a3'; g.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * 6.283, r = 1 + 0.12 * Math.sin(a * 3 + seed) + 0.08 * Math.cos(a * 5 + seed * 2); g.lineTo(x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r); } g.fill(); g.fillStyle = '#8cc46a'; g.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * 6.283, r = 0.86 + 0.12 * Math.sin(a * 3 + seed) + 0.08 * Math.cos(a * 5 + seed * 2); g.lineTo(x + Math.cos(a) * rx * r, y + Math.sin(a) * ry * r); } g.fill(); }
function miniTown(g, x, y, n, col, castle) { for (let i = 0; i < n; i++) { const hx = x - 26 + (i % 4) * 17, hy = y - 4 + Math.floor(i / 4) * 12; g.fillStyle = '#f5ecd8'; g.fillRect(hx - 5, hy - 5, 10, 6); g.fillStyle = col; g.beginPath(); g.moveTo(hx - 7, hy - 5); g.lineTo(hx, hy - 11); g.lineTo(hx + 7, hy - 5); g.closePath(); g.fill(); } if (castle) { g.fillStyle = '#b9a98f'; g.fillRect(x - 8, y - 30, 16, 22); g.fillStyle = col; g.beginPath(); g.moveTo(x, y - 42); g.lineTo(x + 12, y - 37); g.lineTo(x, y - 32); g.fill(); g.strokeStyle = '#5a4a3a'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y - 30); g.lineTo(x, y - 42); g.stroke(); } }
function paintWorld(c, S) { const g = c.getContext('2d'), W = c.width, H = c.height, T = Date.now() / 1000, M = muOf(S); g.fillStyle = '#3d8fd6'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { const x = (i * 97) % W, y = (i * 53) % H + Math.sin(T + i) * 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8, y - 4, x + 16, y); g.stroke(); }
  const ns = nodes(S); g.setLineDash([6, 6]); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2; for (const n of ns) if (n.id !== 'home' && (n.known !== false)) { g.beginPath(); g.moveTo(MU_HOME.x * W, MU_HOME.y * H); g.lineTo(n.x * W, n.y * H); g.stroke(); } g.setLineDash([]);
  ns.forEach((n, i) => { const x = n.x * W, y = n.y * H; if (n.known === false) { g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.arc(x, y, 34, 0, 6.283); g.fill(); g.fillStyle = 'rgba(255,255,255,.75)'; g.font = '900 26px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', x, y); g.textBaseline = 'alphabetic'; return; }
    const big = n.id === 'home' ? 1.5 : 1; isle(g, x, y, 56 * big, 38 * big, i + 1);
    if (n.id === 'home') miniTown(g, x, y + 4, 12, '#e0533d', true); else if (n.k === 'aur') miniTown(g, x, y + 4, Math.min(12, 4 + Math.floor(nbOf(S).pop / 30)), n.col, true); else if (n.k === 'nb' && !M.col[n.id]) miniTown(g, x, y + 4, Math.min(12, 4 + Math.floor(nbxOf(S, n.id).pop / 30)), n.col, true);
    else if (M.col[n.id]) { const cc = M.col[n.id]; miniTown(g, x, y + 4, Math.min(12, 2 + cc.lv), '#3d7fd6', false); g.font = '20px sans-serif'; g.textAlign = 'center'; g.fillText(COL_T[cc.type], x, y - 16); g.fillStyle = '#3d7fd6'; g.fillRect(x + 20, y - 34, 2, 24); g.beginPath(); g.moveTo(x + 22, y - 34); g.lineTo(x + 36, y - 29); g.lineTo(x + 22, y - 24); g.fill(); }
    else { g.font = '22px sans-serif'; g.textAlign = 'center'; g.fillText('🏝️', x, y + 8); }
    g.font = '900 15px Nunito, sans-serif'; g.textAlign = 'center'; const lb = n.name + (M.col[n.id] ? ' · ' + M.col[n.id].lv : ''), w = g.measureText(lb).width + 14; g.fillStyle = n.id === 'home' ? '#3d7fd6' : M.col[n.id] ? '#2f6e9e' : n.k === 'col' ? 'rgba(58,36,18,.7)' : 'rgba(58,36,18,.88)'; rr(g, x - w / 2, y + 30 * big, w, 22, 8); g.fill(); g.fillStyle = '#fff'; g.fillText(lb, x, y + 30 * big + 16); });
  const sh = (T * 0.05) % 1; g.font = '18px sans-serif'; g.fillText('⛵', (MU_HOME.x + (MU_AUR.x - MU_HOME.x) * sh) * W, (MU_HOME.y + (MU_AUR.y - MU_HOME.y) * sh) * H);
  c.onclick = ev => { const r = c.getBoundingClientRect(), px = (ev.clientX - r.left) / r.width, py = (ev.clientY - r.top) / r.height; let best = null, bd = 0.09; for (const n of nodes(S)) { const d = Math.hypot(px - n.x, (py - n.y) * 0.75); if (d < bd) { bd = d; best = n; } } if (!best) return; if (best.id === 'home') { closeSheet(); return; } if (best.known === false) return; openSheet('urbe', best.id); }; }
function paintUrbe(c, S, id) { const g = c.getContext('2d'), W = c.width, H = c.height, T = Date.now() / 1000, M = muOf(S); const col = M.col[id], s = id === 'aurora' ? { col: MU_AUR.col } : site(id) || {};
  const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#9fd8ff'); sky.addColorStop(1, '#d8f0ff'); g.fillStyle = sky; g.fillRect(0, 0, W, H); g.fillStyle = '#3d8fd6'; g.fillRect(0, H * 0.82, W, H * 0.18);
  g.fillStyle = col && col.type === 'mina' ? '#b5a98f' : '#8cc46a'; g.beginPath(); g.ellipse(W / 2, H * 0.8, W * 0.55, H * 0.42, 0, Math.PI, 0); g.fill(); g.fillStyle = '#e6d3a3'; g.fillRect(0, H * 0.79, W, 8);
  if (col && col.type === 'mina') { g.fillStyle = '#8c8577'; g.beginPath(); g.moveTo(W * 0.62, H * 0.6); g.lineTo(W * 0.78, H * 0.22); g.lineTo(W * 0.95, H * 0.6); g.fill(); g.fillStyle = '#3a2a1a'; g.beginPath(); g.arc(W * 0.78, H * 0.58, 22, Math.PI, 0); g.fill(); }
  const n = col ? Math.min(40, 6 + col.lv * 4) : Math.min(40, Math.floor((id === 'aurora' ? nbOf(S) : nbxOf(S, id)).pop / 8)), roof = col ? '#3d7fd6' : s.col || '#c96a4a';
  for (let i = 0; i < n; i++) { const r = Math.floor(i / 10), x = 60 + (i % 10) * 54 + (r % 2) * 24, y = H * 0.74 - r * 34; if (col && col.type === 'mina' && x > W * 0.6) continue; g.fillStyle = ['#f5ecd8', '#f2e4c8', '#e8d6b5'][i % 3]; g.fillRect(x - 16, y - 18, 32, 18); g.fillStyle = roof; g.beginPath(); g.moveTo(x - 20, y - 18); g.lineTo(x, y - 32); g.lineTo(x + 20, y - 18); g.closePath(); g.fill(); g.fillStyle = '#7fc8e6'; g.fillRect(x - 10, y - 13, 7, 6); g.fillRect(x + 3, y - 13, 7, 6); }
  if (col) { if (col.type === 'turismo') { for (let k = 0; k < Math.min(4, Math.ceil(col.lv / 2.5)); k++) { const x = 110 + k * 140, h2 = 80 + col.lv * 9; g.fillStyle = '#e8ecf2'; g.fillRect(x - 24, H * 0.62 - h2, 48, h2); g.fillStyle = '#7fc8e6'; for (let j = 0; j < h2 / 14 - 1; j++) g.fillRect(x - 18, H * 0.62 - h2 + 8 + j * 14, 36, 7); } }
    if (col.type === 'comercio') { for (let k = 0; k < Math.min(5, col.lv); k++) { const x = 90 + k * 110; g.fillStyle = ['#e0533d', '#3d7fd6', '#2f9e6e', '#e6a92a', '#9b5de5'][k]; g.fillRect(x - 30, H * 0.58, 60, 10); g.fillStyle = '#fff'; g.fillRect(x - 26, H * 0.6, 52, 24); } for (let k = 0; k < Math.min(4, col.lv); k++) { const x = (T * 30 + k * 160) % (W + 80) - 40; g.font = '28px sans-serif'; g.fillText('🚢', x, H * 0.93); } }
    if (col.type === 'agro') { for (let k = 0; k < Math.min(8, col.lv + 2); k++) { g.fillStyle = k % 2 ? '#e6c35a' : '#6fae4a'; g.fillRect(40 + k * 70, H * 0.66, 60, 26); } }
    if (col.type === 'militar') { g.fillStyle = '#9aa0aa'; g.fillRect(W * 0.35, H * 0.4, W * 0.3, H * 0.2); for (let k = 0; k < 5; k++) g.fillRect(W * 0.35 + k * W * 0.066, H * 0.37, W * 0.04, 12); for (let k = 0; k < Math.min(30, col.lv * 3); k++) soldier(g, 120 + (k % 15) * 28, H * 0.7 + Math.floor(k / 15) * 22, '#3d7fd6', T, k); }
    g.fillStyle = '#3d7fd6'; g.fillRect(W - 60, 30, 3, 60); g.beginPath(); g.moveTo(W - 57, 30); g.lineTo(W - 20 + Math.sin(T * 3) * 3, 40); g.lineTo(W - 57, 52); g.fill(); }
  else if (site(id) && site(id).k === 'col' && !col) { g.font = '60px sans-serif'; g.textAlign = 'center'; g.fillText('🏝️', W / 2, H * 0.62); }
  else { const nb = id === 'aurora' ? nbOf(S) : nbxOf(S, id), lv = lvlOf(nb), kh = 60 + lv * 10; g.fillStyle = '#b9a98f'; g.fillRect(W / 2 - 50, H * 0.55 - kh, 100, kh); for (let k = 0; k < 4; k++) g.fillRect(W / 2 - 50 + k * 30, H * 0.55 - kh - 12, 18, 12); g.fillStyle = s.col || '#ff8a1f'; g.beginPath(); g.moveTo(W / 2, H * 0.55 - kh - 50); g.lineTo(W / 2 + 34 + Math.sin(T * 3) * 4, H * 0.55 - kh - 40); g.lineTo(W / 2, H * 0.55 - kh - 30); g.fill(); g.strokeStyle = '#5a4a3a'; g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2, H * 0.55 - kh); g.lineTo(W / 2, H * 0.55 - kh - 50); g.stroke();
    if (nb.wall) { g.strokeStyle = '#9c8c74'; g.lineWidth = 4 + nb.wall * 2; g.beginPath(); g.moveTo(20, H * 0.78); g.lineTo(W - 20, H * 0.78); g.stroke(); } for (let k = 0; k < Math.min(30, Math.ceil(nb.sol / 5)); k++) soldier(g, 100 + (k % 15) * 30, H * 0.77 - Math.floor(k / 15) * 20, s.col || '#ff8a1f', T, k); } }

// ---------- cliques ----------
window.muClick = function (d) { if (d.muback) { openSheet('mundo'); return true; } if (d.muv) { openSheet('urbe', d.muv); return true; }
  if (d.mu === 'muExplore') { act({ a: 'muExplore' }); return true; } if (d.mufound) { const [id, t] = d.mufound.split(','); act({ a: 'muFound', id, t }); return true; }
  if (d.muup) { act({ a: 'muUp', id: d.muup }); return true; } if (d.mucol) { act({ a: 'muCollect', id: d.mucol }); return true; } if (d.mutype) { const [id, t] = d.mutype.split(','); act({ a: 'muType', id, t }); return true; }
  if (d.mugift) { const [id, n] = d.mugift.split(','); act({ a: 'muGift', id, n: +n }); return true; }
  if (d.muatk) { if (G.atkArm && Date.now() - G.atkArm < 6000) { G.atkArm = 0; act({ a: 'muAttack', id: d.muatk }); } else { G.atkArm = Date.now(); $('sBody').dataset.sig = ''; renderSheet(); } return true; } return false; };
window.muFx = function (f) { if (f[0] === 'muDisc') { const s = site(f[1]); toast(L('muDiscT', s ? s.name : ''), 3500); return true; } if (f[0] === 'muFound') { toast(L('muFoundT', (site(f[1]) || {}).name || ''), 3500); return true; } if (f[0] === 'muUp') { toast(L('muUpT', (site(f[1]) || {}).name || '', f[2]), 3000); return true; } if (f[0] === 'muGift') { toast(L('nbGiftT'), 2500); return true; } if (f[0] === 'muConq') { toast(L('muConqT', (site(f[1]) || {}).name || ''), 5000); return true; } return false; };

// ---------- botão 🌍 ----------
const b = document.createElement('button'); b.className = 'ib'; b.id = 'bMundo'; b.type = 'button'; b.textContent = '🌍'; b.setAttribute('aria-label', 'Mundo'); b.style.cssText = 'position:fixed;left:max(14px,env(safe-area-inset-left));bottom:calc(env(safe-area-inset-bottom) + 298px);z-index:3;width:58px;height:58px;border-radius:50%;font-size:28px;box-shadow:0 4px 0 rgba(0,0,0,.25),0 6px 16px rgba(0,0,0,.25);display:none'; b.onclick = () => { if (G.S) openSheet('mundo'); }; document.body.appendChild(b);
setInterval(() => { const S = G.S, on = !!(S && !$('hud').hidden && !SH && S.lvl >= 14); b.style.display = on ? '' : 'none'; if (SH && (SH.type === 'mundo' || SH.type === 'urbe')) muPaint(); }, 1000);

// ---------- textos ----------
Object.assign(TX.pt, { muT: 'Mapa do Mundo', muSub: 'Explore o mar, conheça as cidades vizinhas e funde colônias. Toque numa ilha para visitar.', muExplore: 'Explorar o próximo lugar', muAllKnown: 'Todo o mundo conhecido já foi explorado.', muCols: 'Nossas colônias', muNoCols: 'Ainda não temos colônias: explore e funde uma numa ilha livre.', muNbs: 'Cidades vizinhas', muVisit: 'Visitar',
  colT_turismo: 'Turismo', colT_comercio: 'Comércio', colT_agro: 'Agrícola', colT_mina: 'Mineira', colT_militar: 'Militar', colY: (a, b2) => `Por hora: ${a} para você · ${b2} para o tesouro`,
  colD_turismo: 'Hotéis e turistas: rende moedas para você.', colD_comercio: 'Porto e navios mercantes: enche o tesouro da cidade.', colD_agro: 'Campos: rende para você e para o tesouro.', colD_mina: 'Mina: manda pedra, ferro e ouro para o nosso estoque.', colD_militar: 'Quartel: treina soldados sozinho e aumenta a defesa.',
  muCollect: 'Coletar', muUpB: 'Melhorar', muChType: 'Mudar especialidade:', muFreeT: 'Ilha livre', muFreeSub: (c) => `Funde uma colônia aqui por ${c} moedas e escolha a especialidade:`, muUnknown: 'Lugar ainda não explorado.', muNothing: 'Ainda não há moedas para coletar.', muWins: (n) => `vitórias: ${n}/3`, muConqNote: 'Só você decide atacar. Com 3 vitórias, a cidade vira nossa colônia.', pers_com: 'comerciante', pers_war: 'guerreira', pers_agro: 'agricultora',
  muDiscT: (n) => `🧭 Descobrimos ${n}!`, muFoundT: (n) => `🏳️ Colônia fundada em ${n}!`, muUpT: (n, l) => `⬆️ ${n} subiu para o nível ${l}`, muConqT: (n) => `🏳️ ${n} agora é nossa colônia!`,
  cvL_muDisc: (n) => `explorou o mar e descobriu ${n}`, cvL_muFound: (n) => `fundou a colônia ${n}`, cvL_muUp: (n) => `melhorou a colônia ${n}`, cvL_muWin: (n, v) => `atacou ${n} e venceu (+${v})`, cvL_muLose: (n) => `atacou ${n} e perdeu`, cvL_muConq: (n) => `conquistou ${n}: agora é nossa colônia!`,
  cvS_muDisc: (n) => `${n} exploração(ões)`, cvS_muFound: (n) => `${n} colônia(s) fundada(s)`, cvS_muUp: (n) => `${n} melhoria(s) em colônias`,
  n_mundo: 'O Mundo: cidades vizinhas e colônias', n_mundoD: 'Toque em 🌍 para abrir o mapa do mundo: explore o mar, visite Porto Brisa, Vila Pedra e Monte Sol, funde colônias (turismo, comércio, agrícola, mineira, militar) que rendem para você e para o tesouro, e suba cada uma até o nível 10. O Conselho também explora, funda e melhora colônias sozinho quando a cidade já está completa. Com 3 vitórias, uma cidade vizinha vira colônia.' });
Object.assign(TX.es, { muT: 'Mapa del Mundo', muSub: 'Explora el mar, conoce las ciudades vecinas y funda colonias. Toca una isla para visitarla.', muExplore: 'Explorar el siguiente lugar', muAllKnown: 'Todo el mundo conocido ya fue explorado.', muCols: 'Nuestras colonias', muNoCols: 'Aún no tenemos colonias: explora y funda una en una isla libre.', muNbs: 'Ciudades vecinas', muVisit: 'Visitar',
  colT_turismo: 'Turismo', colT_comercio: 'Comercio', colT_agro: 'Agrícola', colT_mina: 'Minera', colT_militar: 'Militar', colY: (a, b2) => `Por hora: ${a} para ti · ${b2} para el tesoro`,
  colD_turismo: 'Hoteles y turistas: te da monedas a ti.', colD_comercio: 'Puerto y barcos mercantes: llena el tesoro de la ciudad.', colD_agro: 'Campos: rinde para ti y para el tesoro.', colD_mina: 'Mina: manda piedra, hierro y oro a nuestro depósito.', colD_militar: 'Cuartel: entrena soldados solo y sube la defensa.',
  muCollect: 'Cobrar', muUpB: 'Mejorar', muChType: 'Cambiar especialidad:', muFreeT: 'Isla libre', muFreeSub: (c) => `Funda una colonia aquí por ${c} monedas y elige la especialidad:`, muUnknown: 'Lugar aún sin explorar.', muNothing: 'Aún no hay monedas para cobrar.', muWins: (n) => `victorias: ${n}/3`, muConqNote: 'Solo tú decides atacar. Con 3 victorias, la ciudad pasa a ser nuestra colonia.', pers_com: 'comerciante', pers_war: 'guerrera', pers_agro: 'agricultora',
  muDiscT: (n) => `🧭 ¡Descubrimos ${n}!`, muFoundT: (n) => `🏳️ ¡Colonia fundada en ${n}!`, muUpT: (n, l) => `⬆️ ${n} subió al nivel ${l}`, muConqT: (n) => `🏳️ ¡${n} ahora es nuestra colonia!`,
  cvL_muDisc: (n) => `exploró el mar y descubrió ${n}`, cvL_muFound: (n) => `fundó la colonia ${n}`, cvL_muUp: (n) => `mejoró la colonia ${n}`, cvL_muWin: (n, v) => `atacó ${n} y ganó (+${v})`, cvL_muLose: (n) => `atacó ${n} y perdió`, cvL_muConq: (n) => `conquistó ${n}: ¡ahora es nuestra colonia!`,
  cvS_muDisc: (n) => `${n} exploración(es)`, cvS_muFound: (n) => `${n} colonia(s) fundada(s)`, cvS_muUp: (n) => `${n} mejora(s) en colonias`,
  n_mundo: 'El Mundo: ciudades vecinas y colonias', n_mundoD: 'Toca 🌍 para abrir el mapa del mundo: explora el mar, visita Porto Brisa, Vila Pedra y Monte Sol, funda colonias (turismo, comercio, agrícola, minera, militar) que rinden para ti y para el tesoro, y sube cada una hasta el nivel 10. El Concejo también explora, funda y mejora colonias solo cuando la ciudad ya está completa. Con 3 victorias, una ciudad vecina pasa a ser colonia.' });
})();
