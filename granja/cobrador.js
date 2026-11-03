// Sítio do Vento — Cobradores: até 3 ajudantes que cobram sozinhos a cada 5 min (1: construções do 🔨, 2: colônias nas ilhas, 3: caixa da 🏙️) e ficam com 2%.
(function () {
const COST = [15000, 50000, 120000], EVERY = 5 * 60000, FEE = 0.02, AREA = ['cb', 'mu', 'ci'], ICO = { cb: '🔨', mu: '🏝️', ci: '🏙️' };
const cobOf = S => { if (!S.cob || typeof S.cob !== 'object') S.cob = { n: 0, at: 0, tot: 0 }; return S.cob; };
function run(S, now) { const C = cobOf(S); if (!C.n) return 0; const c0 = S.coins, parts = {}, tryA = a => { try { const r = apply(S, a, now); return !!(r && r.ok); } catch (e) { return false; } };
  let b = S.coins; tryA({ a: 'cbAllCol' }); parts.cb = S.coins - b;
  if (C.n >= 2 && S.mu && S.mu.col) { b = S.coins; for (const id of Object.keys(S.mu.col)) tryA({ a: 'muCollect', id }); parts.mu = S.coins - b; }
  if (C.n >= 3 && S.ci) { b = S.coins; tryA({ a: 'ciCol' }); parts.ci = S.coins - b; }
  const got = S.coins - c0; if (got <= 0) return 0; const fee = Math.ceil(got * FEE); S.coins -= fee; C.tot = (C.tot || 0) + got - fee; C.last = { t: now, v: got - fee, fee, p: parts }; return got; }
EXT.tick.push((S, now) => { const C = S.cob; if (!C || !C.n || now - (C.at || 0) < EVERY) return false; C.at = now; run(S, now); return true; });
EXT.apply.unshift({ pre: 'cob', fn: (S, a, now, out, fail) => { const C = cobOf(S);
  if (a.a === 'cobHire') { if (C.n >= COST.length) return fail(''); const c = COST[C.n]; if (S.coins < c) return fail(L('noCoins')); S.coins -= c; C.n++; C.at = now - EVERY + 20000; out.fx.push(['coins', -c]); out.fx.push(['cobHired', C.n]); return true; }
  if (a.a === 'cobNow') { if (!C.n) return fail(''); C.at = now; const g = run(S, now); if (!g) return fail(L('cbNothing')); return true; }
  return null; } });
// ---------- cartão (no 🔨, na 🏙️ e nas colônias) ----------
function card(S) { const C = cobOf(S), nx = C.n < COST.length ? COST[C.n] : 0, l = C.last;
  return `<div class="card" style="border:2px solid #e6a92a;background:#fffbe8"><b>💼 ${L('cobT', C.n, COST.length)}</b><br><small>${L('cobSub')}</small>${AREA.map((a, i) => `<div style="font-size:14px;margin-top:3px">${i < C.n ? '✅' : '⬜'} ${L('cobA', i + 1)} ${ICO[a]} ${L('cobA_' + a)}</div>`).join('')}`
    + `${l ? `<small>🕐 ${L('cobLast', l.v, fmtT(Math.max(0, Math.round((Date.now() - l.t) / 1000))))} · ${L('cobTot', Math.round(C.tot || 0))}</small>` : ''}<div class="row" style="gap:6px;margin-top:6px">${nx ? `<button class="btn${S.coins >= nx ? '' : ' gray'}" type="button" data-cobhire="1" style="flex:1;font-size:14px">💼 ${L('cobHire', C.n + 1, nx)}</button>` : ''}${C.n ? `<button class="btn blue" type="button" data-cobnow="1" style="flex:1;font-size:14px">💰 ${L('cobNow')}</button>` : ''}</div></div>`; }
{ const f0 = EXT.sheet.construir; if (typeof f0 === 'function') EXT.sheet.construir = (S, t, a) => { const h = f0(S, t, a); return card(S) + h; }; }
if (typeof window.muSheet === 'function') { const m0 = window.muSheet; window.muSheet = (S, t) => { const h = m0(S, t); return (S.mu && Object.keys(S.mu.col || {}).length ? card(S) : '') + h; }; }
if (window.CI) CI.H.cards.unshift(card);
EXT.click.push(d => { if (d.cobhire) { act({ a: 'cobHire' }); return true; } if (d.cobnow) { act({ a: 'cobNow' }); return true; } return false; });
EXT.fx.push(f => { if (f[0] === 'cobHired') { toast(L('cobHiredT', f[1]), 4000); return true; } return false; });
{ let seen = null; setInterval(() => { const l = G.S && G.S.cob && G.S.cob.last; if (!l) return; if (seen === null) { seen = l.t; return; } if (l.t !== seen) { seen = l.t; if (Date.now() - l.t < 60000) toast(L('cobDone', l.v, l.fee), 3500); } }, 1500); }
// ---------- cobradores andando pelos bairros com a bolsa de moedas ----------
EXT.draw.push((g, S, T) => { const C = S && S.cob; if (!C || !C.n || CAM.z < 0.3 || typeof kid !== 'function') return; const pts = (S.cb || []).concat(S.ci && Array.isArray(S.ci.z) ? S.ci.z.filter(t => t.lv) : []); if (pts.length < 2) return;
  for (let k = 0; k < C.n; k++) { const tt = T / 6 + k * 3.7, i = Math.floor(tt) % pts.length, j = (i + 1 + k) % pts.length, u = tt % 1, a = pts[i], b = pts[j], x = a.x + (b.x - a.x) * u, y = a.y + 26 + (b.y - a.y) * u; if (Math.abs(x - CAM.x) > innerWidth / CAM.z / 2 + 60 || Math.abs(y - CAM.y) > innerHeight / CAM.z / 2 + 60) continue;
    g.save(); g.translate(x, y); g.scale(1.4, 1.4); kid(g, 0, 0, ['#3a4a5a', '#2f6e9e', '#6b3e1e'][k], T, k); g.fillStyle = '#c8955a'; g.beginPath(); g.arc(9, -8, 6, 0, 6.283); g.fill(); g.fillStyle = '#ffd23f'; g.font = '900 8px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('$', 9, -5); g.fillStyle = '#3a2412'; g.fillRect(-5, -31, 10, 3); g.fillRect(-3, -35, 6, 4); g.restore(); } });
// ---------- textos ----------
Object.assign(TX.pt, { cobT: (n, m) => `Cobradores (${n}/${m})`, cobSub: 'Passam a cada 5 minutos, cobram por você e ficam com 2%.', cobA: (i) => `Cobrador ${i}:`, cobA_cb: 'construções do 🔨', cobA_mu: 'colônias nas ilhas', cobA_ci: 'caixa da cidade', cobHire: (i, c) => `Contratar cobrador ${i}: ${c}`, cobNow: 'Cobrar agora', cobLast: (v, t) => `Última volta: +${v} (há ${t})`, cobTot: (v) => `Total: ${v}`, cobHiredT: (n) => `💼 Cobrador ${n} contratado! Ele passa a cada 5 minutos.`, cobDone: (v, f) => `💼 Os cobradores juntaram +${v} (ficaram com ${f}).`, n_cob: 'Cobradores, desenhos de longe e mais', n_cobD: 'Contrate até 3 cobradores (no 🔨, na 🏙️ ou no 🌍): cobram sozinhos as construções, as colônias das ilhas e a caixa da cidade a cada 5 minutos. E com o zoom longe tudo continua com o desenho de verdade.' });
Object.assign(TX.es, { cobT: (n, m) => `Cobradores (${n}/${m})`, cobSub: 'Pasan cada 5 minutos, cobran por ti y se quedan con el 2%.', cobA: (i) => `Cobrador ${i}:`, cobA_cb: 'construcciones del 🔨', cobA_mu: 'colonias en las islas', cobA_ci: 'caja de la ciudad', cobHire: (i, c) => `Contratar cobrador ${i}: ${c}`, cobNow: 'Cobrar ahora', cobLast: (v, t) => `Última vuelta: +${v} (hace ${t})`, cobTot: (v) => `Total: ${v}`, cobHiredT: (n) => `💼 ¡Cobrador ${n} contratado! Pasa cada 5 minutos.`, cobDone: (v, f) => `💼 Los cobradores juntaron +${v} (se quedaron con ${f}).`, n_cob: 'Cobradores, dibujos de lejos y más', n_cobD: 'Contrata hasta 3 cobradores (en 🔨, en 🏙️ o en 🌍): cobran solos las construcciones, las colonias de las islas y la caja de la ciudad cada 5 minutos. Y con el zoom lejos todo sigue con su dibujo de verdad.' });
if (typeof NEWS === 'object' && Array.isArray(NEWS) && !NEWS.some(n => n[0] === 'n_cob')) NEWS.unshift(['n_cob', 'construir']);
window.cobRun = run;
})();
