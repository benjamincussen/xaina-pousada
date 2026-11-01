// main.js — pantallas, plan del turno, resolución animada, duelo de abordaje, campaña, astillero y guardado
'use strict';
const $ = id => document.getElementById(id);
const SAVE = 'corsarios-v1';
function load() {
  const d = { gold: 150, owned: ['balandra'], active: 'balandra', up: { balandra: {}, bergantin: {}, galeon: {} }, camp: 0, level: 'medio', foeType: 'balandra', sound: true, music: false, wins: 0, losses: 0, v2: 1, sea: 'calmo', mode: 1, tut: 0, custom: { hull: 0, sail: 0, flag: 0, name: '' }, daily: {} };
  let s = null; try { s = JSON.parse(localStorage.getItem(SAVE)); } catch (e) {}
  if (!s) return d; for (const k in d) if (s[k] == null) s[k] = d[k];
  if (!s.v2) { s.v2 = 1; s.music = false; } // la música nueva parte apagada
  return s;
}
let S = load();
const save = () => { try { localStorage.setItem(SAVE, JSON.stringify(S)); } catch (e) {} };

const CAMPAIGN = [
  { name: 'Pescador Pendenciero', type: 'balandra', level: 'facil', up: 0, gold: 120, sea: 'calmo' },
  { name: 'Bucanero Tuerto', type: 'balandra', level: 'facil', up: 1, gold: 160, sea: 'archi' },
  { name: 'La Viuda Roja', type: 'balandra', level: 'medio', up: 1, gold: 230, sea: 'niebla' },
  { name: 'Capitán Garfio de Plata', type: 'bergantin', level: 'medio', up: 1, gold: 330, sea: 'tormenta' },
  { name: 'Hermanos Cuervo', type: 'balandra', level: 'medio', up: 1, gold: 420, sea: 'calmo', fleet: true },
  { name: 'Marea Negra', type: 'bergantin', level: 'dificil', up: 2, gold: 540, sea: 'archi' },
  { name: 'Almirante Sinsal', type: 'bergantin', level: 'medio', up: 2, gold: 720, sea: 'tormenta', fleet: true },
  { name: 'La Serpiente', type: 'galeon', level: 'dificil', up: 3, gold: 950, sea: 'niebla' },
  { name: 'Barbanegra', type: 'galeon', level: 'dificil', up: 3, gold: 1300, sea: 'archi', fleet: true },
  { name: 'El Kraken, rey pirata', type: 'galeon', level: 'dificil', up: 5, gold: 2000, sea: 'tormenta', fleet: true },
];
const QUICK_GOLD = { facil: 60, medio: 110, dificil: 190 };
const TURN_TIME = { facil: 45, medio: 35, dificil: 25 };
const FOE_NAMES = ['Capitán Morgana', 'El Sardina', 'Doña Pólvora', 'Ojo de Halcón', 'Patapalo', 'La Gaviota Negra', 'Rata de Muelle'];
const ICON = {
  F: '<svg viewBox="0 0 24 24"><path d="M12 2.5l6.5 7.5H14v11h-4V10H5.5z" fill="currentColor"/></svg>',
  L: '<svg viewBox="0 0 24 24"><path d="M17.5 21.5V14a5 5 0 0 0-5-5H9V4.5L2.5 10.5 9 16.5v-4h3.5a1.5 1.5 0 0 1 1.5 1.5v7.5z" fill="currentColor"/></svg>',
  R: '<svg viewBox="0 0 24 24" style="transform:scaleX(-1)"><path d="M17.5 21.5V14a5 5 0 0 0-5-5H9V4.5L2.5 10.5 9 16.5v-4h3.5a1.5 1.5 0 0 1 1.5 1.5v7.5z" fill="currentColor"/></svg>',
  hook: '<svg viewBox="0 0 24 24"><path d="M12 2v12a5 5 0 1 1-5-5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M8 4h8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  gun: '<svg viewBox="0 0 24 24"><rect x="5" y="8" width="14" height="7" rx="3.5" fill="currentColor"/><rect x="18" y="9" width="4" height="5" rx="1" fill="currentColor"/><circle cx="8" cy="17" r="3.4" fill="currentColor"/></svg>',
};

// ---------- pantallas ----------
const OVS = ['menu', 'pick', 'yard', 'help', 'result', 'quit', 'duel'];
function show(id) { for (const o of OVS) $(o).hidden = o !== id; $('app').classList.toggle('inmenu', id === 'menu' || id === 'pick' || id === 'yard' || id === 'help'); resize(); }
const insetsNow = () => $('app').classList.contains('inmenu') ? { top: 0, bottom: 0 } : { top: $('hud').offsetHeight, bottom: $('panel').offsetHeight };
function resize() { GFX.resize($('cv'), $('stage'), insetsNow()); }
addEventListener('resize', resize);
let audioReady = false;
addEventListener('pointerdown', () => { if (!audioReady) { audioReady = true; SFX.init(); SFX.setSound(S.sound); SFX.setMusic(S.music); } }, { capture: true });

function goMenu() {
  B = null; GFX.setScene({ menu: true }); show('menu'); $('mGold').textContent = S.gold.toLocaleString('es-CL');
  const c = CAMPAIGN[Math.min(S.camp, CAMPAIGN.length - 1)];
  $('campSub').textContent = S.camp >= CAMPAIGN.length ? `Campaña ganada · revancha contra ${c.name}` : `Batalla ${S.camp + 1} de ${CAMPAIGN.length}: ${c.name} (${SHIPS[c.type].name})`;
  $('bSnd').textContent = 'Sonido: ' + (S.sound ? 'sí' : 'no'); $('bMus').textContent = 'Música: ' + (S.music ? 'sí' : 'no');
}
$('bSnd').onclick = () => { S.sound = !S.sound; SFX.setSound(S.sound); save(); goMenu(); };
$('bMus').onclick = () => { S.music = !S.music; SFX.setMusic(S.music); save(); goMenu(); };
$('bHelp').onclick = () => show('help'); $('hBack').onclick = () => B ? show(null) : goMenu();
$('bCamp').onclick = () => { const i = Math.min(S.camp, CAMPAIGN.length - 1), c = CAMPAIGN[i];
  startBattle({ foeType: c.type, foeUp: { casco: c.up, canon: c.up, velas: Math.min(5, c.up), artil: Math.max(0, c.up - 1) }, level: c.level, foeName: c.name, reward: c.gold, camp: i, sea: c.sea, fleet: !!c.fleet, seed: 1000 + i * 77 + Math.floor(Math.random() * 1000) }); };
// batalla rápida
function renderPick() {
  $('pLevel').innerHTML = Object.entries(LEVELS).map(([k, l]) => `<button class="opt ${S.level === k ? 'on' : ''}" data-l="${k}" type="button">${l.name}<small>${TURN_TIME[k]} s por turno</small></button>`).join('');
  $('pSea').innerHTML = Object.entries(MAPS).map(([k, n]) => `<button class="opt ${S.sea === k ? 'on' : ''}" data-sea="${k}" type="button">${n}</button>`).join('');
  $('pMode').innerHTML = [['1', 'Duelo', '1 contra 1'], ['2', 'Flotas', '2 contra 2']].map(([k, n, d]) => `<button class="opt ${String(S.mode) === k ? 'on' : ''}" data-mode="${k}" type="button">${n}<small>${d}</small></button>`).join('');
  $('pShip').innerHTML = Object.entries(SHIPS).map(([k, s]) => `<button class="opt ${S.foeType === k ? 'on' : ''}" data-s="${k}" type="button">${s.name}<small>${s.hp} de vida</small></button>`).join('');
  const g = Math.round(QUICK_GOLD[S.level] * SHIPS[S.foeType].pf);
  $('pInfo').textContent = `Vas en tu ${SHIPS[S.active].name.toLowerCase()}. Si ganas te llevas ${g} doblones.`;
}
$('bQuick').onclick = () => { renderPick(); show('pick'); };
$('pick').onclick = e => { const b = e.target.closest('.opt'); if (!b) return; SFX.tick(); if (b.dataset.l) S.level = b.dataset.l; if (b.dataset.s) S.foeType = b.dataset.s; if (b.dataset.sea) S.sea = b.dataset.sea; if (b.dataset.mode) S.mode = +b.dataset.mode; save(); renderPick(); };
$('pBack').onclick = goMenu;
$('pGo').onclick = () => startBattle({ foeType: S.foeType, foeUp: {}, level: S.level, sea: S.sea, fleet: S.mode === 2, foeName: FOE_NAMES[Math.floor(Math.random() * FOE_NAMES.length)], reward: Math.round(QUICK_GOLD[S.level] * SHIPS[S.foeType].pf), seed: Math.floor(Math.random() * 1e9) });
// astillero
function shipThumb(c, type) { const g = c.getContext('2d'), dpr = 2; c.width = 84 * dpr; c.height = 56 * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = '#0f4f63'; g.fillRect(0, 0, 84, 56); GFX.drawShip(g, type, 'p', 42, 30, 0, 52, { custom: customColors() }); }
function renderYard() {
  $('yGold').textContent = S.gold.toLocaleString('es-CL');
  $('yShips').innerHTML = Object.entries(SHIPS).map(([k, s]) => { const own = S.owned.includes(k), act = S.active === k, st = statsOf(k, S.up[k]);
    const right = act ? '<span class="tag">En uso</span>' : own ? `<button class="b2 use" data-use="${k}" type="button">Usar</button>` : `<button class="b2" data-buy="${k}" type="button" ${S.gold < s.price ? 'disabled' : ''}>Comprar ${s.price}</button>`;
    return `<div class="ship"><canvas data-th="${k}"></canvas><div class="info"><b>${s.name}</b><small>Vida ${st.hp} · daño ${st.dmg}${s.guns > 1 ? ' x2' : ''} · ${st.sail} fichas/turno · ${st.load} balas/turno</small></div>${right}</div>`; }).join('');
  document.querySelectorAll('canvas[data-th]').forEach(c => shipThumb(c, c.dataset.th));
  $('yUpT').textContent = 'Mejoras de tu ' + SHIPS[S.active].name.toLowerCase();
  $('yUps').innerHTML = UPGRADES.map(u => { const l = S.up[S.active][u.k] || 0, c = upCost(S.active, l);
    return `<div class="up"><div class="info"><b>${u.name}</b><small>${u.desc(l)}</small><div class="pips">${Array.from({ length: UP_MAX }, (_, i) => `<i class="${i < l ? 'on' : ''}"></i>`).join('')}</div></div>${l >= UP_MAX ? '<span class="tag">Al máximo</span>' : `<button class="b2" data-up="${u.k}" type="button" ${S.gold < c ? 'disabled' : ''}>${c}</button>`}</div>`; }).join('');
}
$('bYard').onclick = () => { renderYard(); show('yard'); };
$('yBack').onclick = goMenu;
$('yard').onclick = e => { const b = e.target.closest('button'); if (!b || b.disabled) return;
  if (b.dataset.use) { S.active = b.dataset.use; SFX.tick(); }
  if (b.dataset.buy) { const k = b.dataset.buy; if (S.gold >= SHIPS[k].price) { S.gold -= SHIPS[k].price; S.owned.push(k); S.active = k; SFX.fanfare(true); } }
  if (b.dataset.up) { const l = S.up[S.active][b.dataset.up] || 0, c = upCost(S.active, l); if (S.gold >= c && l < UP_MAX) { S.gold -= c; S.up[S.active][b.dataset.up] = l + 1; SFX.bell(); } }
  save(); renderYard(); };

// ---------- batalla ----------
let B = null;
function startBattle(cfg) {
  const sea = cfg.sea || 'calmo', map = genMap(cfg.seed, sea), fleet = !!cfg.fleet;
  const me = makeShip('me', 'p', S.active, S.up[S.active], fleet ? 2 : 4, BH - 2, 0, myName()), foe = makeShip('foe', 'e', cfg.foeType, cfg.foeUp, fleet ? 2 : 5, 1, 2, cfg.foeName), ships = [me, foe];
  if (fleet) { ships.push(makeShip('ally', 'p', S.active === 'galeon' ? 'bergantin' : 'balandra', {}, 7, BH - 2, 0, 'Aliado'), makeShip('foe2', 'e', cfg.foeType === 'galeon' ? 'bergantin' : 'balandra', cfg.foeUp, 7, 1, 2, cfg.foeName + ' (escolta)')); }
  for (const s of ships) map[s.y][s.x] = { t: 'sea', v: .5 };
  B = { cfg, map, me, foe, ships, turn: 1, slots: null, ai: null, busy: false, time: 0, over: false, hist: [], replay: null };
  show(null); GFX.setScene(sceneFor(ships));
  $('mName').textContent = me.name + ' · ' + SHIPS[me.type].name; $('fName').textContent = fleet ? cfg.foeName + ' + escolta' : foe.name;
  if (sea !== 'calmo') setTimeout(() => flashMsg({ archi: 'Archipiélago: las islas tapan el paso y las balas', niebla: 'Niebla: solo ves cerca de tu barco', tormenta: 'Tormenta: el viento cambia cada turno' }[sea]), 300);
  newTurn();
}
const emptySlots = () => Array.from({ length: 4 }, () => ({ m: null, fl: false, fr: false, g: false }));
function newTurn() {
  B.slots = emptySlots(); sel = -1; B.busy = false; B.ai = null; B.time = TURN_TIME[B.cfg.level]; $('panel').classList.remove('lock');
  $('tTurn').textContent = 'Turno ' + B.turn; $('tPhase').textContent = 'Planifica tu turno'; SFX.bell();
  setTimeout(() => { if (B && !B.busy) aiPlans(); }, 40); GFX.setHist(fogged() ? [] : B.hist.filter(h => !B.ships.find(s => s.id === h.id).sunk));
  renderPanel(); updHud(); resize();
}
// planes de todos los barcos que maneja el computador (rivales y tu aliado)
function aiPlans() {
  if (B.ai && B.ai.turn === B.turn) return B.ai.plans;
  const plans = {}; for (const s of B.ships) if (!s.sunk && s.id !== 'me') plans[s.id] = aiPlan(B.map, B.ships, s, nearestFoe(B.ships, s), s.team === 'p' ? 'medio' : B.cfg.level);
  B.ai = { turn: B.turn, plans }; return plans;
}
const sceneFor = ships => ({ map: B.map, ships, preview: null, fog: B.map.kind === 'niebla', storm: B.map.kind === 'tormenta', custom: customColors() });
// repetir el último turno con la misma animación
async function replayTurn() {
  if (!B || B.busy || !B.replay || B.over) return; B.busy = true; $('panel').classList.add('lock'); updHud();
  const clones = B.replay.start.map(s => ({ ...s })); GFX.setScene(sceneFor(clones)); $('tPhase').textContent = 'Repetición del turno';
  for (const [p, ev] of B.replay.evs.entries()) { document.querySelectorAll('.slot').forEach((el, i) => el.classList.toggle('on', i === p));
    await GFX.playMoves(ev); await GFX.playEnv(ev); await GFX.playShots(ev);
    for (const id in ev.dmg) { const s = clones.find(q => q.id === id); if (s) s.hp = Math.max(0, s.hp - ev.dmg[id]); }
    for (const id of ev.sunk) { const s = clones.find(q => q.id === id); if (s) s.sunk = true; await GFX.playSink(id); } }
  await GFX.wait(400); document.querySelectorAll('.slot').forEach(el => el.classList.remove('on'));
  if (!B || B.over) return; GFX.setScene(sceneFor(B.ships)); B.busy = false; $('panel').classList.remove('lock'); $('tPhase').textContent = 'Planifica tu turno'; renderPanel(); GFX.setHist(fogged() ? [] : B.hist.filter(h => !B.ships.find(s => s.id === h.id).sunk));
}
$('bReplay').onclick = replayTurn;
function myName() { return (S.custom && S.custom.name) || 'Tú'; }
const HULLS = ['#8a4f25', '#5b3a26', '#2f5d50', '#7a2e2e'], TRIMS = ['#f2c14e', '#e8e8e8', '#f2c14e', '#111111'], SAILS = [['#e9dfc8', '#ffffff'], ['#f3d3a8', '#fff1d6'], ['#cfe2f3', '#f4fbff'], ['#2d2d33', '#55555e']], STRIPES = ['#2f74c0', '#2e9e6b', '#c0392b', '#d9a441'], FLAGS = ['#2f74c0', '#2e9e6b', '#c0392b', '#111111'];
function customColors() { const c = S.custom || {}; return { hull: HULLS[c.hull || 0], trim: TRIMS[c.hull || 0], sail: SAILS[c.sail || 0], stripe: STRIPES[c.flag || 0], flag: FLAGS[c.flag || 0] }; }
const used = () => { const n = { F: 0, L: 0, R: 0 }; for (const s of B.slots) if (s.m) n[s.m]++; return n; };
const ballsUsed = () => B.slots.reduce((a, s) => a + (s.fl ? B.me.guns : 0) + (s.fr ? B.me.guns : 0), 0);
const AM_ORDER = [false, 'N', 'C', 'G'];
const gunBtn = (s, side, i) => { const v = s[side], A = v && AMMO[v]; return `<button class="gun ${side === 'fl' ? 'l' : 'r'} ${v ? 'on am' + v : ''}" data-a="${side}" type="button" aria-label="Cañones a ${side === 'fl' ? 'babor' : 'estribor'} en la fase ${i + 1}: ${A ? A.name : 'sin disparo'}">${ICON.gun}${A ? `<em>${A.short[0]}</em>` : ''}</button>`; };
function renderPanel() {
  const u = used();
  $('slots').innerHTML = B.slots.map((s, i) => `<div class="slot ${sel === i ? 'sel' : ''}" data-i="${i}"><span class="n">${i + 1}</span>
    ${gunBtn(s, 'fl', i)}
    <button class="mv ${s.m ? 'f' : ''}" data-a="mv" type="button" aria-label="Movimiento de la fase ${i + 1}">${s.m ? ICON[s.m] : ''}</button>
    ${gunBtn(s, 'fr', i)}
    <button class="hook ${s.g ? 'on' : ''}" data-a="g" type="button" aria-label="Gancho de abordaje en la fase ${i + 1}">${ICON.hook}</button></div>`).join('');
  document.querySelectorAll('.tok').forEach(b => { const m = b.dataset.m, left = B.me[m] - u[m]; b.innerHTML = `${ICON[m]}<span>${left}</span>`; b.disabled = left <= 0; });
  updPreview(); updThreat(); updHud();
}
// casillas que el rival alcanza con sus cañones desde donde está ahora
const fogged = () => B && B.map.kind === 'niebla';
function updThreat() {
  const out = [];
  for (const f of B.ships) { if (f.team !== 'e' || f.sunk || (fogged() && cheb(f, B.me) > 4)) continue;
    for (const sd of [(f.d + 3) % 4, (f.d + 1) % 4]) for (let i = 1; i <= 3; i++) { const x = f.x + DX[sd] * i, y = f.y + DY[sd] * i; if (!inB(x, y) || blocksShot(B.map, x, y)) break; out.push({ x, y }); } }
  GFX.setThreat(out);
}
function updPreview() {
  const any = B.slots.some(s => s.m || s.fl || s.fr);
  GFX.setScenePreview(any ? { ghosts: previewPlan(B.map, B.ships, B.me, B.slots), fires: B.slots.map(s => ({ L: s.fl, R: s.fr })), team: 'p', type: B.me.type, from: { x: B.me.x, y: B.me.y } } : null);
}
function updHud() {
  const m = B.me, f = B.foe, bl = m.balls - (B.busy ? 0 : ballsUsed());
  $('mHp').style.width = Math.max(0, m.hp / m.maxHp * 100) + '%'; $('fHp').style.width = Math.max(0, f.hp / f.maxHp * 100) + '%';
  const tag = s => `trip. ${s.crew}/${s.crewMax}` + (s.torn ? ' · velas rotas' : '');
  $('mMeta').textContent = `Vida ${Math.ceil(m.hp)} · balas ${bl} · ${tag(m)}`;
  const foes = B.ships.filter(s => s.team === 'e'), alive = foes.filter(s => !s.sunk);
  $('fMeta').textContent = foes.length > 1 ? `${alive.length} de ${foes.length} a flote · balas ${alive.reduce((a, s) => a + s.balls, 0)}` : `${SHIPS[f.type].name} · vida ${Math.ceil(f.hp)} · balas ${f.balls} · ${tag(f)}`;
  $('fHp').style.width = Math.max(0, foes.reduce((a, s) => a + s.hp, 0) / foes.reduce((a, s) => a + s.maxHp, 0) * 100) + '%';
  $('bReplay').hidden = !B.replay || B.busy; if (typeof updLoadBtn === 'function') updLoadBtn();
}
// fichas: tocar llena la casilla elegida (o la primera libre); arrastrar la deja en la casilla que quieras. Las casillas pueden quedar vacías.
let sel = -1, drag = null, lastDrag = 0;
const recentDrag = () => performance.now() - lastDrag < 350;
function placeMove(i, m) { const u = used(), cur = B.slots[i].m; if (B.me[m] - u[m] + (cur === m ? 1 : 0) <= 0) { flashMsg('No te quedan fichas de ese tipo'); return false; } B.slots[i].m = m; return true; }
$('tray').addEventListener('click', e => { const b = e.target.closest('.tok'); if (!b || b.disabled || !B || B.busy || recentDrag()) return; addMove(b.dataset.m); });
function addMove(m) { let i = sel >= 0 && !B.slots[sel].m ? sel : B.slots.findIndex(s => !s.m); if (i < 0) { flashMsg('Arrastra la ficha sobre una casilla para cambiarla'); return; } if (placeMove(i, m)) { sel = -1; SFX.tick(); renderPanel(); } }
const ghost = document.createElement('div'); ghost.id = 'dragGhost'; ghost.hidden = true; document.body.appendChild(ghost);
function slotAt(x, y) { const el = document.elementFromPoint(x, y), s = el && el.closest('.slot'); return s ? +s.dataset.i : -1; }
$('panel').addEventListener('pointerdown', e => {
  if (!B || B.busy) return; const tok = e.target.closest('.tok'), mv = e.target.closest('.mv');
  if (tok && !tok.disabled) drag = { kind: 'tok', m: tok.dataset.m };
  else if (mv) { const i = +mv.closest('.slot').dataset.i; if (B.slots[i].m) drag = { kind: 'slot', i, m: B.slots[i].m }; }
  if (!drag) return; Object.assign(drag, { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false }); try { e.target.setPointerCapture(e.pointerId); } catch (_) {} });
addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return;
  if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 8) { drag.moved = true; ghost.innerHTML = ICON[drag.m]; ghost.hidden = false; SFX.tick(); }
  if (!drag.moved) return; ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; const i = slotAt(e.clientX, e.clientY);
  document.querySelectorAll('.slot').forEach((el, k) => el.classList.toggle('drop', k === i)); });
const endDrag = e => { if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; ghost.hidden = true; document.querySelectorAll('.slot').forEach(el => el.classList.remove('drop'));
  if (!d.moved || !B || B.busy) return; lastDrag = performance.now(); const i = e.type === 'pointercancel' ? -1 : slotAt(e.clientX, e.clientY);
  if (d.kind === 'tok') { if (i >= 0) placeMove(i, d.m); }
  else if (i < 0) B.slots[d.i].m = null;
  else if (i !== d.i) { const t = B.slots[i].m; B.slots[i].m = d.m; B.slots[d.i].m = t; }
  sel = -1; SFX.tick(); renderPanel(); };
addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
$('slots').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || !B || B.busy || recentDrag()) return; const i = +b.closest('.slot').dataset.i, s = B.slots[i], a = b.dataset.a;
  if (a === 'mv') { if (s.m) s.m = null; else sel = sel === i ? -1 : i; }
  if (a === 'fl' || a === 'fr') { const nx = AM_ORDER[(AM_ORDER.indexOf(s[a]) + 1) % AM_ORDER.length];
    if (nx && !s[a] && B.me.balls - ballsUsed() < B.me.guns) { flashMsg('No te quedan balas cargadas'); return; }
    s[a] = nx; if (nx) { s.g = false; flashMsg(AMMO[nx].name + ': ' + { N: 'daño completo, hasta 3 casillas', C: 'rompe velas: el rival recibe menos fichas', G: 'baja su tripulación, solo 2 casillas' }[nx]); } }
  if (a === 'g') { s.g = !s.g; if (s.g) { s.fl = s.fr = false; } }
  SFX.tick(); renderPanel(); });
function flashMsg(t) { $('tPhase').textContent = t; setTimeout(() => { if (B && !B.busy) $('tPhase').textContent = 'Planifica tu turno'; }, 1500); }
$('go').onclick = () => go();
addEventListener('keydown', e => { if (!B || B.busy || !$('duel').hidden) return; const k = e.key;
  if (k === 'ArrowUp') addMove('F'); else if (k === 'ArrowLeft') addMove('L'); else if (k === 'ArrowRight') addMove('R');
  else if (k === 'Backspace') { for (let i = 3; i >= 0; i--) if (B.slots[i].m) { B.slots[i].m = null; break; } renderPanel(); } else if (k === 'Enter') go(); });
GFX.onFrame = dt => {
  if (!B || B.busy || B.over || !$('quit').hidden) return; B.time -= dt; const full = TURN_TIME[B.cfg.level];
  $('goBar').style.width = Math.max(0, B.time / full * 100) + '%'; $('goSub').textContent = Math.max(0, Math.ceil(B.time)) + ' s';
  if (B.time <= 0) go();
};
async function go() {
  if (!B || B.busy) return; B.busy = true; $('panel').classList.add('lock'); GFX.setScenePreview(null); GFX.setThreat(null);
  const plans = aiPlans(); plans.me = B.slots;
  for (const s of B.ships) if (!s.sunk && plans[s.id]) for (const q of plans[s.id]) if (q.m) s[q.m]--;
  B.replay = { start: B.ships.map(s => ({ ...s })), evs: [] }; updHud();
  for (let p = 0; p < 4; p++) {
    document.querySelectorAll('.slot').forEach((el, i) => el.classList.toggle('on', i === p)); $('tPhase').textContent = `Fase ${p + 1} de 4`;
    const ev = resolvePhase(B.map, B.ships, plans, p); B.replay.evs.push(ev);
    await GFX.playMoves(ev); await GFX.playEnv(ev); await GFX.playShots(ev); updHud();
    const foes = B.ships.filter(s => s.team === 'e');
    for (const s of foes) if (!s.sunk) { B.hist.push({ id: s.id, x: s.x, y: s.y }); }
    B.hist = B.hist.slice(-8 * foes.length);
    for (const id of ev.sunk) await GFX.playSink(id);
    if (B.me.sunk) return endBattle(false, 'sink');
    if (ev.board) { const r = await boarding(ev.board); if (r === 'lose') return endBattle(false, 'board'); }
    if (foes.every(s => s.sunk)) return endBattle(true, ev.board ? 'board' : 'sink');
    await GFX.wait(140);
  }
  document.querySelectorAll('.slot').forEach(el => el.classList.remove('on'));
  for (const s of B.ships) if (!s.sunk) refill(s);
  if (B.map.kind === 'tormenta') { stormShift(B.map); GFX.lightning(); SFX.cannon(.05); flashMsg('¡Rayo! El viento cambió de dirección'); }
  B.turn++; newTurn();
}
function endBattle(win, how) {
  if (!B || B.over) return; B.over = true; const c = B.cfg;
  let gold = 0;
  if (win) { gold = Math.round(c.reward * (how === 'board' ? 1.25 : 1) * (1 + .3 * B.me.hp / B.me.maxHp)); S.wins++; if (c.camp != null && c.camp === S.camp && S.camp < CAMPAIGN.length) S.camp++; }
  else { gold = 20; S.losses++; }
  S.gold += gold; save(); SFX.fanfare(win);
  $('rTitle').textContent = win ? '¡Victoria!' : 'Derrota';
  $('rText').textContent = win ? (how === 'board' ? `Abordaste a ${B.foe.name} y te quedaste con su botín.` : `Hundiste a ${B.foe.name} en ${B.turn} turnos.`)
    : (how === 'board' ? `${B.foe.name} te ganó el abordaje.` : how === 'quit' ? 'Izaste la bandera blanca.' : `${B.foe.name} hundió tu barco.`) + ' La tripulación te deja unas monedas para reparar.';
  $('rGold').lastElementChild.textContent = '+' + gold + ' doblones';
  setTimeout(() => show('result'), win ? 300 : 600);
}
$('rOk').onclick = goMenu;
$('rAgain').onclick = () => { const c = B.cfg; startBattle({ ...c, seed: Math.floor(Math.random() * 1e9) }); };
$('bQuit').onclick = () => { if (B && !B.over) show('quit'); };
$('qNo').onclick = () => show(null);
$('qYes').onclick = () => { show(null); endBattle(false, 'quit'); };

// ---------- duelo de abordaje ----------
// abordajes: si estás tú, se decide en el duelo; si no, gana el barco con más vida y tripulación
async function boarding(bd) {
  const a = B.ships.find(s => s.id === bd.a), b = B.ships.find(s => s.id === bd.b);
  if (a.id === 'me' || b.id === 'me') { B.duelFoe = a.id === 'me' ? b : a; const win = await duel(); const loser = win ? B.duelFoe : B.me; loser.sunk = true; loser.hp = 0; if (!win) return 'lose'; await GFX.playSink(loser.id); return 'win'; }
  const pw = s => (.6 * s.hp / s.maxHp + .4 * s.crew / s.crewMax) * (.8 + Math.random() * .4), loser = pw(a) >= pw(b) ? b : a;
  loser.sunk = true; loser.hp = 0; flashMsg(`${loser.name} fue abordado y capturado`); await GFX.playSink(loser.id); updHud(); return 'auto';
}
function duel() {
  return new Promise(res => {
    const me = B.me, foe = B.duelFoe || B.foe, pr = .6 * me.hp / me.maxHp + .4 * me.crew / me.crewMax, er = .6 * foe.hp / foe.maxHp + .4 * foe.crew / foe.crewMax, lvl = B.cfg.level;
    const w = Math.min(.5, Math.max(.1, .24 + (pr - er) * .35)), aiP = Math.min(.85, Math.max(.12, .45 + (er - pr) * .5 + { facil: -.15, medio: 0, dificil: .12 }[lvl]));
    const speed = { facil: .8, medio: 1.05, dificil: 1.3 }[lvl];
    let pts = [0, 0], round = 0, pos = 0, dir = 1, zone = 0, state = 'aim', t0 = 0, raf = 0, last = performance.now();
    $('dMe').textContent = 'Tú'; $('dFoe').textContent = foe.name; $('dMsg').textContent = ''; show('duel'); SFX.clang();
    const dots = () => { $('dMeDots').innerHTML = [0, 1].map(i => `<i class="${i < pts[0] ? 'on' : ''}"></i>`).join(''); $('dFoeDots').innerHTML = [0, 1].map(i => `<i class="${i < pts[1] ? 'on' : ''}"></i>`).join(''); };
    const newRound = () => { round++; zone = .1 + Math.random() * (.8 - w); $('dZone').style.left = zone * 100 + '%'; $('dZone').style.width = w * 100 + '%'; state = 'aim'; t0 = 0; $('dHit').disabled = false; dots(); };
    const finish = r => { cancelAnimationFrame(raf); $('dHit').onclick = null; setTimeout(() => { show(null); res(r); }, 900); };
    const strike = tapped => { if (state !== 'aim') return; state = 'wait'; $('dHit').disabled = true;
      const mine = tapped && pos >= zone && pos <= zone + w, theirs = Math.random() < aiP; SFX.clang(); $('dSw').classList.remove('hit'); void $('dSw').offsetWidth; $('dSw').classList.add('hit');
      if (mine && !theirs) pts[0]++; else if (theirs && !mine) pts[1]++;
      $('dMsg').textContent = mine && theirs ? 'Los dos acertaron: se bloquean' : mine ? '¡Tocado! Le ganaste el cruce' : theirs ? `${foe.name} te dio un golpe` : 'Los dos fallaron';
      dots();
      if (pts[0] >= 2) { $('dMsg').textContent = '¡Ganaste el abordaje!'; return finish(true); }
      if (pts[1] >= 2) { $('dMsg').textContent = 'Perdiste el abordaje'; return finish(false); }
      if (round >= 5) { const r = pts[0] > pts[1] || (pts[0] === pts[1] && pr >= er); $('dMsg').textContent = r ? '¡Ganaste el abordaje!' : 'Perdiste el abordaje'; return finish(r); }
      setTimeout(newRound, 900); };
    $('dHit').onclick = () => strike(true);
    const loop = now => { const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (state === 'aim') { pos += dir * speed * dt; if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } t0 += dt; if (t0 > 3.2) strike(false); }
      $('dNeedle').style.left = pos * 100 + '%'; raf = requestAnimationFrame(loop); };
    newRound(); raf = requestAnimationFrame(loop);
  });
}

// ---------- arranque ----------
GFX.start($('cv'), $('stage'), insetsNow());
goMenu();
