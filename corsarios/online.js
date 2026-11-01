// online.js — duelo en línea entre dos celulares: sala con código, planes por presencia y la misma batalla calculada en los dos lados
// Cada teléfono simula la batalla completa. El invitado ve el mar girado 180° para que su barco siempre quede abajo;
// el orden de los barcos y el azar (fichas, tormenta) son los mismos en los dos lados, así que el resultado es idéntico.
'use strict';
OVS.push('online');
const NET = { room: null, sub: null, code: null, role: null, oppPeer: null, epoch: 0, plans: {}, duels: {}, waiters: [], lastStart: 0, goneT: null, myLast: null, avail: null };
let roomApi = null;
(async () => {
  await null; // siempre después de cargar todo el archivo
  try { roomApi = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('room') : null; } catch (e) { roomApi = null; }
  if (!roomApi && window.P2P_ROOM) roomApi = window.P2P_ROOM; // fuera de claude.ai: conexión directa, sin cuentas
  NET.avail = !!roomApi; updOnlineBtn();
  joinFromHash(); addEventListener('hashchange', joinFromHash);
})();

// ---------- interfaz: botón del menú y sala ----------
document.head.insertAdjacentHTML('beforeend', `<style>
.code{font-family:var(--display);font-size:60px;line-height:1;text-align:center;letter-spacing:.18em;color:var(--wood2);background:rgba(255,255,255,.4);border:2px dashed rgba(91,58,31,.45);border-radius:12px;padding:10px 0 6px;user-select:text;-webkit-user-select:text}
.ostack{display:flex;flex-direction:column;gap:10px}
.cn input.big{font-family:var(--display);font-size:30px;text-align:center;letter-spacing:.2em;text-transform:uppercase}
#oMsg{min-height:0;color:var(--blood);font-weight:800}
#oMsg:empty{display:none}
.link{font:600 14px var(--body);color:var(--ink);padding:8px 10px;border-radius:10px;border:2px solid rgba(91,58,31,.4);background:#fffaf0;min-width:0;width:100%;user-select:text;-webkit-user-select:text}
.or{display:flex;align-items:center;gap:8px;color:var(--muted);font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase}
.or::before,.or::after{content:"";flex:1;border-top:1px dashed rgba(91,58,31,.4)}
</style>`);
const bOn = document.createElement('button');
bOn.className = 'btn'; bOn.id = 'bOnline'; bOn.type = 'button';
bOn.innerHTML = 'Jugar online<small id="onSub">Contra un amigo, cada uno en su celular</small>';
$('bQuick').after(bOn);
function updOnlineBtn() { $('onSub').textContent = NET.avail === false ? 'Online no está disponible en esta página' : 'Contra un amigo, cada uno en su celular'; }

document.body.insertAdjacentHTML('beforeend', `<section class="ov" id="online" hidden>
  <div class="card">
    <h2>Jugar online</h2>
    <div id="oStart" class="ostack">
      <p class="lead">Cada uno abre Corsarios en su celular. Uno crea la sala y le pasa el código de 4 letras al otro.</p>
      <button class="btn" id="oCreate" type="button">Crear sala<small>Tú eliges el mar</small></button>
      <div class="or">o</div>
      <label class="cn">Código de la sala<input id="oCode" class="big" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD"></label>
      <button class="btn alt" id="oJoin" type="button">Unirme</button>
    </div>
    <div id="oLobby" class="ostack" hidden>
      <span class="lbl">Código de la sala</span>
      <div class="code" id="oCodeShow">----</div>
      <div id="oShare" class="ostack" hidden><span class="lbl">O mándale este enlace</span><div class="row"><input id="oLink" class="link" readonly aria-label="Enlace de la sala"><button class="btn alt" id="oCopy" type="button" style="flex:0 0 auto;width:auto;font-size:18px">Copiar</button></div></div>
      <p class="lead" id="oStatus"></p>
      <div id="oHostOpts" class="ostack"><span class="lbl">Mar</span><div class="opts" id="oSea"></div></div>
      <button class="btn" id="oGo" type="button">¡A la mar!</button>
    </div>
    <p class="lead" id="oMsg"></p>
    <button class="btn ghost" id="oBack" type="button">Volver</button>
  </div>
</section>`);
$('help').querySelector('.rules').insertAdjacentHTML('beforeend', '<li><b>Jugar online</b>: cada jugador abre el juego en su celular. Uno toca <b>Crear sala</b> y le pasa el código (o el enlace) al otro, que lo escribe en <b>Unirme</b>. Cada uno va con su barco y sus mejoras; los dos planifican a la vez y el turno corre cuando ambos zarpan.</li>');

// enlace de invitación: ...#KRAB abre la sala directamente
function joinFromHash() { const h = (location.hash || '').slice(1).toUpperCase(); if (!roomApi || !/^[A-Z]{4}$/.test(h) || (NET.room && NET.code === h) || inOnline()) return; openOnline(); $('oCode').value = h; enter(h, 'guest'); }
const oMsg = t => { $('oMsg').textContent = t || ''; };
const show0 = show;
show = function (id) { show0(id); if (id === 'online') { $('app').classList.add('inmenu'); resize(); } };

function openOnline() {
  B = null; NET.oppPeer = null; GFX.setScene({ menu: true }); show('online'); oMsg(''); renderLobby();
}
bOn.onclick = () => { SFX.tick(); openOnline(); };
$('oBack').onclick = async () => { await leaveRoom(); goMenu(); };
const CODE_AB = 'ACDEFGHJKMNPQRTUVWXY';
$('oCopy').onclick = async () => { const i = $('oLink'); try { await navigator.clipboard.writeText(i.value); $('oCopy').textContent = 'Copiado'; } catch (e) { i.focus(); i.select(); } setTimeout(() => { $('oCopy').textContent = 'Copiar'; }, 1500); };
const newCode = () => { let c = ''; for (let i = 0; i < 4; i++) c += CODE_AB[Math.floor(Math.random() * CODE_AB.length)]; return c; };
$('oCreate').onclick = () => enter(newCode(), 'host');
$('oJoin').onclick = () => { const c = $('oCode').value.toUpperCase().replace(/[^A-Z]/g, ''); if (c.length !== 4) { oMsg('El código tiene 4 letras.'); return; } enter(c, 'guest'); };
$('oCode').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') $('oJoin').click(); });
$('oCode').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); });
$('online').addEventListener('click', e => { const b = e.target.closest('[data-osea]'); if (!b) return; S.sea = b.dataset.osea; save(); SFX.tick(); renderLobby(); });

function renderLobby() {
  const inR = !!NET.room; $('oStart').hidden = inR; $('oLobby').hidden = !inR;
  if (!inR) return;
  $('oCodeShow').textContent = NET.code;
  const share = !!(roomApi && roomApi.p2p) && NET.role === 'host'; $('oShare').hidden = !share;
  if (share) $('oLink').value = location.href.split('#')[0] + '#' + NET.code;
  const o = findOpp(), host = NET.role === 'host';
  const on = o ? `${String(o.presence.name || 'Capitán').slice(0, 18)} (${(SHIPS[o.presence.ship] || SHIPS.balandra).name})` : '';
  $('oStatus').textContent = o ? `Rival en la sala: ${on}. ` + (host ? 'Elige el mar y zarpa.' : 'Espera a que el anfitrión zarpe.')
    : host ? 'Pásale este código a tu amigo y espera a que entre.' : 'Esperando al anfitrión de la sala…';
  $('oHostOpts').hidden = !host; $('oGo').hidden = !host; $('oGo').disabled = !o;
  if (host) $('oSea').innerHTML = Object.entries(MAPS).map(([k, n]) => `<button class="opt ${S.sea === k ? 'on' : ''}" data-osea="${k}" type="button">${n}</button>`).join('');
}

// ---------- red: sala con nombre, presencia de cada jugador ----------
const cleanUp = u => { const o = {}; for (const x of UPGRADES) { const v = u ? Number(u[x.k]) : 0; o[x.k] = Number.isFinite(v) ? Math.max(0, Math.min(UP_MAX, Math.floor(v))) : 0; } return o; };
const myInfo = () => ({ app: 'cors1', role: NET.role, name: ((S.custom && S.custom.name) || 'Capitán sin nombre').slice(0, 18), ship: S.active, up: cleanUp(S.up[S.active]) });
async function enter(code, role) {
  if (!roomApi) { oMsg(NET.avail === null ? 'Conectando… prueba otra vez en un segundo.' : 'El juego online no está disponible en esta página.'); return; }
  oMsg(role === 'guest' ? 'Buscando la sala ' + code + '…' : 'Creando la sala…');
  await leaveRoom();
  let r;
  for (let tries = 0; ; tries++) {
    try { r = await roomApi.join('corsarios-' + code.toLowerCase(), role); break; }
    catch (e) {
      const c = e && e.code;
      if (c === 'taken' && role === 'host' && tries < 4) { code = newCode(); continue; } // código ocupado: otro
      oMsg(c === 'not_permitted' ? 'Esta cuenta no puede entrar a salas en este juego.' : c === 'not_found' ? 'No encontré una sala con ese código. Revisa las letras o pide a tu amigo que la cree de nuevo.' : 'No se pudo conectar. Revisa tu internet y prueba de nuevo.');
      return;
    }
  }
  Object.assign(NET, { room: r, code, role, oppPeer: null, epoch: 0, plans: {}, duels: {}, lastStart: 0, myLast: null });
  NET.sub = r.onPeers(onPeers, () => { oMsg('Se cortó la conexión con la sala. Vuelve y entra de nuevo.'); });
  r.presence(myInfo()).catch(() => {});
  oMsg(''); renderLobby();
}
async function leaveRoom() {
  if (NET.sub) NET.sub(); NET.sub = null; const r = NET.room; NET.room = null; NET.oppPeer = null;
  clearTimeout(NET.goneT); NET.goneT = null;
  if (r) try { await r.leave(); } catch (e) {}
}
const isCors = p => p.presence && p.presence.app === 'cors1';
const peersNow = () => NET.room ? NET.room.peers() : [];
const myPeer = () => { const m = peersNow().find(p => p.sameTab); return m ? m.peer : null; };
function findOpp() {
  const ps = peersNow().filter(p => !p.sameTab && isCors(p));
  if (NET.oppPeer) return ps.find(p => p.peer === NET.oppPeer) || null;
  const want = NET.role === 'host' ? 'guest' : 'host';
  return ps.find(p => p.presence.role === want) || null;
}
const inOnline = () => B && B.cfg && B.cfg.online && !B.over;
function wake() { for (const w of NET.waiters.slice()) w(); }
function waitFor(cond) { return new Promise(res => { const chk = () => { if (cond()) { NET.waiters = NET.waiters.filter(w => w !== chk); res(); } }; NET.waiters.push(chk); chk(); }); }
function onPeers() {
  const o = findOpp();
  if (o) {
    const pr = o.presence;
    for (const k of ['plan', 'prev']) { const pl = pr[k]; if (pl && pl.e === NET.epoch && Number.isInteger(pl.t)) NET.plans[pl.t] = pl; }
    if (pr.duel && pr.duel.e === NET.epoch && Array.isArray(pr.duel.h)) NET.duels[pr.duel.k] = pr.duel.h;
    if (NET.role === 'guest' && pr.start && pr.start.e !== NET.lastStart && pr.start.vs === myPeer() && !inOnline()) { NET.lastStart = pr.start.e; beginOnline(pr.start, o); }
    if (inOnline() && pr.quit === NET.epoch) endBattle(true, 'quitfoe');
  }
  if (inOnline()) {
    if (!o) { if (!NET.goneT) { flashMsg('Tu rival perdió la conexión… esperando'); NET.goneT = setTimeout(() => { NET.goneT = null; if (inOnline() && !findOpp()) endBattle(true, 'left'); }, 45000); } }
    else if (NET.goneT) { clearTimeout(NET.goneT); NET.goneT = null; }
  }
  if (!$('online').hidden) renderLobby();
  wake();
}
$('oGo').onclick = () => {
  const o = findOpp(); if (!o || !NET.room) return;
  const st = { e: Date.now(), seed: Math.floor(Math.random() * 1e9), sea: S.sea, vs: o.peer };
  NET.room.presence({ start: st }).catch(() => {}); NET.lastStart = st.e; beginOnline(st, o);
};
function beginOnline(st, o) {
  Object.assign(NET, { epoch: st.e, plans: {}, duels: {}, oppPeer: o.peer, myLast: null }); clearTimeout(NET.goneT); NET.goneT = null;
  const op = o.presence;
  startBattle({ online: true, host: NET.role === 'host', seed: Number(st.seed) >>> 0, sea: MAPS[st.sea] ? st.sea : 'calmo', level: 'medio',
    foeType: SHIPS[op.ship] ? op.ship : 'balandra', foeUp: cleanUp(op.up), foeName: String(op.name || 'Rival').slice(0, 18), reward: 120 });
}

// ---------- batalla en línea ----------
// el mar del invitado: el mismo mapa girado 180° (girar no cambia las reglas, reflejar sí)
function rotMap(m) {
  const out = []; out.kind = m.kind;
  for (let y = 0; y < BH; y++) { const row = []; for (let x = 0; x < BW; x++) { const t = { ...m[BH - 1 - y][BW - 1 - x] };
    if (t.t === 'wind') t.wd = (t.wd + 2) % 4;
    if (t.t === 'whirl') { t.wx = BW - 2 - t.wx; t.wy = BH - 2 - t.wy; }
    if (t.t === 'land') { t.ix = BW - t.ix - t.iw; t.iy = BH - t.iy - t.ih; }
    row.push(t); } out.push(row); }
  return out;
}
const sb0 = startBattle;
startBattle = function (cfg) {
  if (!cfg.online) return sb0(cfg);
  let map = genMap(cfg.seed, cfg.sea); map[BH - 2][4] = { t: 'sea', v: .5 }; map[1][5] = { t: 'sea', v: .5 };
  if (!cfg.host) map = rotMap(map);
  const me = makeShip('me', 'p', S.active, cleanUp(S.up[S.active]), 4, BH - 2, 0, myName()), foe = makeShip('foe', 'e', cfg.foeType, cfg.foeUp, 5, 1, 2, cfg.foeName);
  const ships = cfg.host ? [me, foe] : [foe, me]; // mismo orden en los dos celulares: el del anfitrión primero
  B = { cfg, map, me, foe, ships, turn: 1, slots: null, ai: null, busy: false, time: 0, over: false, hist: [], replay: null, tut: null };
  show(null); GFX.setScene(sceneFor(ships)); $('coach').hidden = true;
  $('mName').textContent = me.name + ' · ' + SHIPS[me.type].name; $('fName').textContent = foe.name + ' · online';
  setTimeout(() => flashMsg(cfg.sea === 'calmo' ? `¡Duelo online contra ${foe.name}!` : { archi: 'Archipiélago: las islas tapan el paso y las balas', niebla: 'Niebla: solo ves cerca de tu barco', tormenta: 'Tormenta: el viento cambia cada turno' }[cfg.sea]), 300);
  newTurn();
};
const ai0 = aiPlans;
aiPlans = function () { return B && B.cfg.online ? {} : ai0(); };
const nt0 = newTurn;
newTurn = function () { nt0(); if (B && B.cfg.online) B.ballsStart = B.me.balls; };
function cleanPlan(s, ship) {
  const out = [], n = { F: 0, L: 0, R: 0 }, am = v => AMMO[v] ? v : false;
  for (let i = 0; i < 4; i++) { const q = (Array.isArray(s) && s[i]) || {}; let m = MOVES.includes(q.m) ? q.m : null;
    if (m) { if (n[m] + 1 > ship[m]) m = null; else n[m]++; }
    out.push({ m, fl: am(q.fl), fr: am(q.fr), g: !!q.g }); }
  return out;
}
function sendPlan(pl) { const prev = NET.myLast && NET.myLast.e === pl.e ? NET.myLast : null; NET.myLast = pl; if (NET.room) NET.room.presence({ plan: pl, prev }).catch(() => {}); }
function stormOnline(t) { // el mismo viento nuevo en los dos lados, contado sobre el mapa del anfitrión
  const R = rng((B.cfg.seed + t * 7919 + 17) >>> 0), host = B.cfg.host;
  for (let cy = 0; cy < BH; cy++) for (let cx = 0; cx < BW; cx++) { const lx = host ? cx : BW - 1 - cx, ly = host ? cy : BH - 1 - cy, tl = B.map[ly][lx];
    if (tl.t === 'wind') { const d = Math.floor(R() * 4); tl.wd = host ? d : (d + 2) % 4; } }
}
const go0 = go;
go = async function () {
  if (!B || !B.cfg.online) return go0();
  if (B.busy || B.over) return;
  B.busy = true; $('panel').classList.add('lock'); GFX.setScenePreview(null); GFX.setThreat(null);
  const t = B.turn, ep = NET.epoch, mine = cleanPlan(B.slots, B.me), bonus = B.me.balls > B.ballsStart ? 1 : 0;
  sendPlan({ e: ep, t, s: mine, b: bonus }); updHud();
  $('tPhase').textContent = 'Esperando al rival…'; $('goSub').textContent = 'listo';
  await waitFor(() => NET.plans[t] || !B || B.over || NET.epoch !== ep);
  if (!B || B.over || NET.epoch !== ep) return;
  const op = NET.plans[t];
  B.foe.balls = Math.min(B.foe.maxBalls, B.foe.balls + (op.b ? 1 : 0));
  const plans = { me: mine, foe: cleanPlan(op.s, B.foe) };
  for (const s of B.ships) if (!s.sunk && plans[s.id]) for (const q of plans[s.id]) if (q.m) s[q.m]--;
  B.replay = { start: B.ships.map(s => ({ ...s })), evs: [] }; updHud();
  for (let p = 0; p < 4; p++) {
    document.querySelectorAll('.slot').forEach((el, i) => el.classList.toggle('on', i === p)); $('tPhase').textContent = `Fase ${p + 1} de 4`;
    const ev = resolvePhase(B.map, B.ships, plans, p); B.replay.evs.push(ev);
    await GFX.playMoves(ev); await GFX.playEnv(ev); await GFX.playShots(ev); if (!B || B.over) return; updHud();
    if (!B.foe.sunk) B.hist.push({ id: 'foe', x: B.foe.x, y: B.foe.y }); B.hist = B.hist.slice(-8);
    for (const id of ev.sunk) await GFX.playSink(id);
    if (!B || B.over) return;
    if (B.me.sunk && B.foe.sunk) return endBattle(false, 'draw');
    if (B.me.sunk) return endBattle(false, 'sink');
    if (ev.board) { B.phase = p; const r = await boarding(ev.board); if (!B || B.over) return; if (r === 'lose') return endBattle(false, 'board'); }
    if (B.foe.sunk) return endBattle(true, ev.board ? 'board' : 'sink');
    await GFX.wait(140);
  }
  document.querySelectorAll('.slot').forEach(el => el.classList.remove('on'));
  B.ships.forEach((s, i) => { if (!s.sunk) refill(s, rng((B.cfg.seed + t * 7919 + i * 104729) >>> 0)); });
  if (B.map.kind === 'tormenta') { stormOnline(t); GFX.lightning(); SFX.cannon(.05); flashMsg('¡Rayo! El viento cambió de dirección'); }
  B.turn++; newTurn();
};

// ---------- abordaje en línea: los dos juegan el duelo y se comparan los golpes ronda a ronda ----------
const duel0 = duel;
duel = function () { return B && B.cfg.online ? duelOnline() : duel0(); };
function duelOnline() {
  return new Promise(res => {
    const me = B.me, foe = B.foe, ep = NET.epoch, key = B.turn + '.' + B.phase, adv = s => .6 * s.hp / s.maxHp + .4 * s.crew / s.crewMax, pr = adv(me), er = adv(foe);
    const w = Math.min(.5, Math.max(.1, .24 + (pr - er) * .35)), speed = 1.05, hits = [];
    let pts = [0, 0], round = 0, pos = 0, dir = 1, zone = 0, state = 'aim', t0 = 0, raf = 0, last = performance.now();
    $('dMe').textContent = 'Tú'; $('dFoe').textContent = foe.name; $('dMsg').textContent = ''; show('duel'); SFX.clang();
    const dots = () => { $('dMeDots').innerHTML = [0, 1].map(i => `<i class="${i < pts[0] ? 'on' : ''}"></i>`).join(''); $('dFoeDots').innerHTML = [0, 1].map(i => `<i class="${i < pts[1] ? 'on' : ''}"></i>`).join(''); };
    const newRound = () => { round++; zone = .1 + Math.random() * (.8 - w); $('dZone').style.left = zone * 100 + '%'; $('dZone').style.width = w * 100 + '%'; state = 'aim'; t0 = 0; $('dHit').disabled = false; $('dMsg').textContent = `Ronda ${round}`; dots(); };
    const finish = r => { cancelAnimationFrame(raf); $('dHit').onclick = null; setTimeout(() => { if (B && !B.over) show(null); res(r); }, 1100); };
    const strike = tapped => {
      if (state !== 'aim') return; state = 'wait'; $('dHit').disabled = true;
      const mine = tapped && pos >= zone && pos <= zone + w, i = hits.length; hits.push(mine);
      if (NET.room) NET.room.presence({ duel: { e: ep, k: key, h: hits.slice() } }).catch(() => {});
      $('dMsg').textContent = (mine ? '¡Buen golpe!' : 'Fallaste…') + ' Esperando a ' + foe.name;
      waitFor(() => (NET.duels[key] && NET.duels[key].length > i) || !B || B.over || NET.epoch !== ep).then(() => {
        if (!B || B.over || NET.epoch !== ep) { cancelAnimationFrame(raf); return res(true); }
        const theirs = !!NET.duels[key][i];
        SFX.clang(); $('dSw').classList.remove('hit'); void $('dSw').offsetWidth; $('dSw').classList.add('hit');
        if (mine && !theirs) pts[0]++; else if (theirs && !mine) pts[1]++;
        $('dMsg').textContent = mine && theirs ? 'Los dos acertaron: se bloquean' : mine ? '¡Tocado! Le ganaste el cruce' : theirs ? `${foe.name} te dio un golpe` : 'Los dos fallaron';
        dots();
        if (pts[0] >= 2) { $('dMsg').textContent = '¡Ganaste el abordaje!'; return finish(true); }
        if (pts[1] >= 2) { $('dMsg').textContent = 'Perdiste el abordaje'; return finish(false); }
        if (round >= 5) { const r = pts[0] > pts[1] || (pts[0] === pts[1] && (pr > er || (pr === er && B.cfg.host))); $('dMsg').textContent = r ? '¡Ganaste el abordaje!' : 'Perdiste el abordaje'; return finish(r); }
        setTimeout(newRound, 900);
      });
    };
    $('dHit').onclick = () => strike(true);
    const loop = now => { const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (state === 'aim') { pos += dir * speed * dt; if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } t0 += dt; if (t0 > 3.2) strike(false); }
      $('dNeedle').style.left = pos * 100 + '%'; raf = requestAnimationFrame(loop); };
    newRound(); raf = requestAnimationFrame(loop);
  });
}

// ---------- fin de la batalla, revancha y salida ----------
const eb0 = endBattle;
endBattle = function (win, how) {
  if (!B || !B.cfg || !B.cfg.online) return eb0(win, how);
  if (B.over) return;
  if (how === 'quit' && NET.room) NET.room.presence({ quit: NET.epoch }).catch(() => {});
  clearTimeout(NET.goneT); NET.goneT = null;
  eb0(win, how === 'left' || how === 'quitfoe' || how === 'draw' ? 'sink' : how);
  const fn = B.foe.name;
  if (how === 'left') $('rText').textContent = `${fn} se desconectó. La victoria es tuya.`;
  if (how === 'quitfoe') $('rText').textContent = `${fn} izó la bandera blanca. ¡Ganaste!`;
  if (how === 'draw') { $('rTitle').textContent = 'Empate'; $('rText').textContent = 'Los dos barcos se hundieron a la vez.'; }
  $('rAgain').textContent = 'Revancha';
  wake();
};
const rAgain0 = $('rAgain').onclick, rOk0 = $('rOk').onclick;
$('rAgain').onclick = () => { if (B && B.cfg.online) { openOnline(); if (NET.role === 'guest') oMsg(''); } else rAgain0(); };
$('rOk').onclick = () => { if (B && B.cfg.online) leaveRoom(); rOk0(); };
