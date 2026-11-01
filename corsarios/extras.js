// extras.js — minijuego de carga de cañones, tutorial guiado, personalización del barco y desafío del día
'use strict';
OVS.push('load');

// ---------- carga de cañones: 3 aciertos seguidos = 1 bala extra (una vez por turno; el reloj sigue corriendo) ----------
function openLoad() {
  if (!B || B.busy || B.over || B.loaded) return; if (B.me.balls >= B.me.maxBalls) { flashMsg('Tus cañones ya están llenos'); return; }
  B.loaded = true; updLoadBtn(); show('load'); SFX.tick();
  let hits = 0, tries = 0, pos = 0, dir = 1, raf = 0, last = performance.now(), state = 'aim', zone = 0;
  const w = .2, speed = [1.1, 1.45, 1.8];
  const pips = () => { $('lPips').innerHTML = [0, 1, 2].map(i => `<i class="${i < hits ? 'on' : i < tries ? 'miss' : ''}"></i>`).join(''); };
  const round = () => { zone = .15 + Math.random() * (.7 - w); $('lZone').style.left = zone * 100 + '%'; $('lZone').style.width = w * 100 + '%'; state = 'aim'; $('lHit').disabled = false; pips(); };
  const finish = () => { cancelAnimationFrame(raf); $('lHit').onclick = null;
    if (hits === 3) { B.me.balls = Math.min(B.me.maxBalls, B.me.balls + 1); $('lMsg').textContent = '¡Bala extra cargada!'; SFX.bell(); } else $('lMsg').textContent = 'No alcanzó: la pólvora se mojó';
    setTimeout(() => { show(null); renderPanel(); }, 900); };
  $('lHit').onclick = () => { if (state !== 'aim') return; state = 'wait'; $('lHit').disabled = true; tries++; const ok = pos >= zone && pos <= zone + w;
    if (ok) { hits++; SFX.tick(); $('lMsg').textContent = ['¡Pólvora!', '¡Taco!', '¡Bala!'][hits - 1]; } else { $('lMsg').textContent = 'Fallaste'; SFX.rock(); }
    pips(); if (!ok || hits === 3) return finish(); setTimeout(round, 350); };
  const loop = now => { const dt = Math.min(.05, (now - last) / 1000); last = now; if (state === 'aim') { pos += dir * speed[Math.min(2, tries)] * dt; if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } }
    $('lNeedle').style.left = pos * 100 + '%'; raf = requestAnimationFrame(loop); };
  $('lMsg').textContent = 'Pólvora, taco y bala: acierta las 3'; round(); raf = requestAnimationFrame(loop);
}
const updLoadBtn = () => { const b = $('bLoad'); if (!b || !B) return; b.hidden = B.busy || B.over; b.disabled = !!B.loaded; b.textContent = B.loaded ? 'Ya cargaste' : '+1 bala'; };
$('bLoad').onclick = openLoad;

// ---------- tutorial guiado en la primera batalla de la campaña ----------
const TUT = [
  { t: '¡Bienvenido, capitán! Tu barco es el de velas blancas, abajo. El rival está arriba. Cada turno planificas 4 fases y después los dos barcos se mueven al mismo tiempo.', next: true },
  { t: 'Arrastra la flecha de avanzar (la del medio) hasta la casilla 1.', target: () => document.querySelector('.tok[data-m="F"]'), done: () => B.slots.some(s => s.m) },
  { t: 'Puedes dejar casillas vacías: en esa fase tu barco no hace nada. Las casillas rojas del mar son donde dispara el rival: no te quedes ahí de costado.', next: true },
  { t: 'Toca el cañón de la derecha de la casilla 2 para disparar a estribor. Tócalo otra vez para cambiar a cadena o metralla.', target: () => document.querySelectorAll('.slot')[1] && document.querySelectorAll('.slot')[1].querySelector('.gun.r'), done: () => B.slots.some(s => s.fl || s.fr) },
  { t: 'La línea de color muestra hasta dónde llega el disparo desde donde estará tu barco. Ahora toca ¡Zarpar!', target: () => $('go'), done: () => B.busy },
  { t: '¡Bien! Cada turno recibes fichas nuevas y solo 2 balas. Con "+1 bala" puedes cargar una extra si aciertas el minijuego. ¡A hundir al rival!', next: true, after: true },
];
function tutStep() {
  const c = $('coach'); document.querySelectorAll('.hl').forEach(e => e.classList.remove('hl'));
  if (!B || B.tut == null || B.tut >= TUT.length) { c.hidden = true; return; }
  const st = TUT[B.tut]; if (st.after && B.turn < 2) { c.hidden = true; return; }
  if (st.after && B.busy) { c.hidden = true; return; }
  c.hidden = false; $('cText').textContent = st.t; $('cNext').hidden = !st.next; $('cNext').textContent = B.tut === TUT.length - 1 ? '¡Vamos!' : 'Siguiente';
  const tg = st.target && st.target(); if (tg) tg.classList.add('hl');
}
function tutTick() { if (!B || B.tut == null || B.tut >= TUT.length) return; const st = TUT[B.tut];
  if (st.done && st.done()) { B.tut++; tutStep(); return; }
  if (st.after && $('coach').hidden && B.turn >= 2 && !B.busy) tutStep();
  const tg = st.target && st.target(); if (tg && !tg.classList.contains('hl') && !$('coach').hidden) tg.classList.add('hl'); }
$('cNext').onclick = () => { if (!B) return; B.tut++; if (B.tut >= TUT.length) { S.tut = 1; save(); } tutStep(); SFX.tick(); };

// ---------- personalización del barco ----------
const CUSTOM_NAMES = { hull: ['Roble', 'Nogal', 'Verde mar', 'Granate'], sail: ['Lino', 'Arena', 'Celeste', 'Negras'], flag: ['Azul', 'Verde', 'Roja', 'Negra'] };
function renderCustom() {
  const c = S.custom; const opts = (k, cols) => cols.map((col, i) => `<button class="sw ${c[k] === i ? 'on' : ''}" data-ck="${k}" data-cv="${i}" type="button" style="--sw:${Array.isArray(col) ? col[0] : col}" aria-label="${CUSTOM_NAMES[k][i]}"></button>`).join('');
  $('yCustom').innerHTML = `<canvas id="cPrev" width="300" height="140" aria-label="Tu barco"></canvas>
    <label class="cn">Nombre del barco<input id="cName" maxlength="18" placeholder="Ej.: La Perla de Fortaleza" value="${(c.name || '').replace(/"/g, '&quot;')}"></label>
    <div class="cr"><span>Casco</span>${opts('hull', HULLS)}</div><div class="cr"><span>Velas</span>${opts('sail', SAILS)}</div><div class="cr"><span>Bandera y franja</span>${opts('flag', FLAGS)}</div>`;
  const cv = $('cPrev'), g = cv.getContext('2d'); g.fillStyle = '#2a9fd0'; g.fillRect(0, 0, 300, 140); GFX.drawShip(g, S.active, 'p', 150, 72, 0, 150, { custom: customColors(), moving: true });
  $('cName').oninput = e => { S.custom.name = e.target.value.trim().slice(0, 18); save(); };
}
const _renderYard = renderYard;
renderYard = function () { _renderYard(); renderCustom(); };
$('yard').addEventListener('click', e => { const b = e.target.closest('.sw'); if (!b) return; S.custom[b.dataset.ck] = +b.dataset.cv; save(); renderCustom(); SFX.tick(); });

// ---------- desafío del día: mismo mapa y rival para todos los días, con récord de turnos ----------
function dailyCfg() {
  const d = new Date(), key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(), R = rng(key);
  const seas = Object.keys(MAPS), types = Object.keys(SHIPS), levels = ['medio', 'dificil'];
  return { key, seed: key, sea: seas[Math.floor(R() * seas.length)], foeType: types[Math.floor(R() * types.length)], level: levels[Math.floor(R() * 2)], fleet: R() < .3,
    foeName: FOE_NAMES[Math.floor(R() * FOE_NAMES.length)], foeUp: { casco: 1, canon: 1 }, reward: 400, daily: true };
}
function dailyLabel() { const c = dailyCfg(), rec = S.daily && S.daily.key === c.key ? S.daily : null;
  $('dailySub').textContent = `${MAPS[c.sea]} · ${SHIPS[c.foeType].name}${c.fleet ? ' + escolta' : ''} · ${LEVELS[c.level].name}` + (rec && rec.best ? ` · tu récord: ${rec.best} turnos` : ' · premio 400 doblones'); }
$('bDaily').onclick = () => { const c = dailyCfg(), done = S.daily && S.daily.key === c.key && S.daily.won; startBattle({ ...c, reward: done ? 60 : 400 }); };
const _goMenu = goMenu;
goMenu = function () { _goMenu(); dailyLabel(); };
const _endBattle = endBattle;
endBattle = function (win, how) {
  const c = B && B.cfg, turns = B && B.turn; _endBattle(win, how);
  if (c && c.daily && win) { if (!S.daily || S.daily.key !== c.key) S.daily = { key: c.key }; S.daily.won = true; if (!S.daily.best || turns < S.daily.best) { S.daily.best = turns; $('rText').textContent += ` Nuevo récord del día: ${turns} turnos.`; } save(); }
};

// ---------- enganches con el turno ----------
const _newTurn = newTurn;
newTurn = function () { _newTurn(); if (B) { B.loaded = false; updLoadBtn(); tutStep(); } };
const _startBattle = startBattle;
startBattle = function (cfg) { _startBattle(cfg); if (B) { B.tut = cfg.camp === 0 && !S.tut ? 0 : null; tutStep(); updLoadBtn(); } };
const _onFrame = GFX.onFrame;
GFX.onFrame = dt => { if (B && B.tut != null && B.tut < TUT.length && !B.busy) { tutTick(); if (B.tut < TUT.length) return; } _onFrame(dt); };
$('bTut').onclick = () => { S.tut = 0; save(); const c = CAMPAIGN[0]; startBattle({ foeType: c.type, foeUp: {}, level: 'facil', foeName: c.name, reward: 40, camp: 0, sea: 'calmo', seed: 4242 }); };
dailyLabel();
