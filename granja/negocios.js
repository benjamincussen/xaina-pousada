// Sítio do Vento — Negócios: Banco, Mercado Grande, Escola de Ofícios e Chocolataria.
// Carregado depois de game.js e mundo.js; usa só os ganchos EXT (ver PLAN-EXT.md). Ações 'ng…' passam por apply(), então o co-op funciona igual.
(function () {
// ---------- dados ----------
// x,y = pé do prédio (centro da base), como em BUILD. Posições livres checadas com archRects (franja de baixo da Cidade Nova e Campos do Oeste).
const NG = {
  banco: { lvl: 12, cost: 3000, land: 'cidade', x: -1360, y: 3330, w: 140, h: 100, every: 600000 },
  mercado: { lvl: 13, cost: 4000, land: 'cidade', x: -575, y: 3330, w: 190, h: 90, every: 300000 },
  oficios: { lvl: 12, cost: 2500, land: 'oeste', x: -1200, y: 960, w: 180, h: 100, every: 600000 },
  choc: { lvl: 14, cost: 3500, land: 'oeste', x: -880, y: 960, w: 170, h: 100 },
};
window.ngDef = NG;
const NG_KEYS = Object.keys(NG), NG_Q = 3, NG_CV_EVERY = 600000;
const REC = { o: 'bombom', k: 1, i: { chocolate: 2, leite: 1, acucar: 1 }, t: 150, xp: 12 };
ITEMS.bombom = { n: 'Bombom', v: 210 };
Object.assign(NM.pt, { bombom: 'Bombom', ng_banco: 'Banco', ng_mercado: 'Mercado Grande', ng_oficios: 'Escola de Ofícios', ng_choc: 'Chocolataria' });
Object.assign(NM.es, { bombom: 'Bombón', ng_banco: 'Banco', ng_mercado: 'Mercado Grande', ng_oficios: 'Escuela de Oficios', ng_choc: 'Chocolatería' });
if (typeof ITEM_COL === 'object') ITEM_COL.bombom = '#ff8fb1';
const nn = k => N('ng_' + k);
const ngRect = k => { const B = NG[k]; return { x: B.x - B.w / 2 - 10, y: B.y - B.h - 50, w: B.w + 20, h: B.h + 56 }; };
function ngOf(S) { if (!S.ng || typeof S.ng !== 'object') S.ng = {}; for (const k of NG_KEYS) if (!S.ng[k] || typeof S.ng[k] !== 'object') S.ng[k] = { b: 0, tot: 0, at: 0, last: 0, lt: 0, n: 0 }; if (!Array.isArray(S.ng.choc.q)) S.ng.choc.q = []; return S.ng; }
const canBuild = (S, k) => S.lvl >= NG[k].lvl && !!S.land[NG[k].land];
const orderCost = () => Object.entries(REC.i).reduce((a, [k, q]) => a + ITEMS[k].v * q, 0);
const barnValue = S => Object.entries(S.inv || {}).reduce((a, [k, q]) => a + (ITEMS[k] ? ITEMS[k].v * q : 0), 0);
const unemp = S => { const j = jobsInfo(S); return Math.max(0, j.adults - j.emp); };
function ngLog(S, now, who, k, arg, v) { if (S.cv && typeof cvLog === 'function') cvLog(S, now, who, k, arg, v); }

// ---------- ícone do bombom (canvas próprio; entra no cache do jogo para img() e bubble()) ----------
function drawBombom(g, s) { g.save(); g.scale(s / 100, s / 100); g.lineJoin = 'round'; g.lineCap = 'round';
  g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.ellipse(50, 92, 30, 6, 0, 0, 6.283); g.fill();
  g.fillStyle = '#8a4b22'; g.beginPath(); g.moveTo(22, 58); g.lineTo(78, 58); g.lineTo(70, 90); g.lineTo(30, 90); g.closePath(); g.fill(); g.strokeStyle = '#5a2e14'; g.lineWidth = 3; g.stroke();
  g.strokeStyle = '#5a2e14'; g.lineWidth = 2; for (let i = 0; i < 6; i++) { const t = i / 5; g.beginPath(); g.moveTo(24 + t * 52, 60); g.lineTo(31 + t * 38, 88); g.stroke(); }
  g.fillStyle = '#6b3a1f'; g.beginPath(); g.moveTo(24, 60); g.quadraticCurveTo(26, 22, 50, 20); g.quadraticCurveTo(74, 22, 76, 60); g.closePath(); g.fill(); g.strokeStyle = '#4a2512'; g.lineWidth = 3; g.stroke();
  g.strokeStyle = '#ff8fb1'; g.lineWidth = 4; g.beginPath(); g.moveTo(30, 44); g.quadraticCurveTo(40, 30, 50, 44); g.quadraticCurveTo(60, 58, 70, 42); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.ellipse(40, 32, 7, 4, -0.5, 0, 6.283); g.fill();
  g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(56, 30, 3.2, 0, 6.283); g.fill(); g.restore(); }
if (typeof ICON_CV === 'object' && !ICON_CV.bombom) { const c = document.createElement('canvas'); c.width = c.height = 96; drawBombom(c.getContext('2d'), 96); ICON_CV.bombom = c; }

// ---------- ações (apply) ----------
EXT.apply.push({ pre: 'ng', fn: (S, a, now, out, fail) => { const M = ngOf(S);
  if (a.a === 'ngBuild') { const k = a.k, B = NG[k]; if (!B) return fail(''); const st = M[k]; if (st.b) return fail(''); if (B.lvl > S.lvl) return fail(L('unlockAt', B.lvl)); if (!S.land[B.land]) return fail(L('ngNeedLand', L('land_' + B.land))); if (S.coins < B.cost) return fail(L('noCoins'));
    S.coins -= B.cost; st.b = 1; st.at = now; st.by = a.by2 || 'you'; st.tot = 0; st.n = 0; if (!a.by2) ngLog(S, now, 'you', 'ngBuild', k, B.cost); out.fx.push(['ngBuilt', k]); return true; }
  if (a.a === 'ngMake') { const st = M.choc; if (!st.b) return fail(''); if (st.q.length >= NG_Q) return fail(L('queueFull')); if (!has(S, REC.i)) return fail(L('missingIng')); take(S, REC.i);
    const s = st.q.length ? Math.max(now, st.q[st.q.length - 1].e) : now; st.q.push({ s, e: s + REC.t * 1000 }); out.fx.push(['ngMake']); return true; }
  if (a.a === 'ngOrder') { const st = M.choc; if (!st.b) return fail(''); if (st.q.length >= NG_Q) return fail(L('queueFull')); const c = orderCost(); if (S.coins < c) return fail(L('noCoins')); S.coins -= c;
    const s = st.q.length ? Math.max(now, st.q[st.q.length - 1].e) : now; st.q.push({ s, e: s + REC.t * 1000, cv: 1 }); st.cvAt = now; return true; }
  if (a.a === 'ngCollect') { const st = M.choc; if (!st.b) return fail(''); let n = 0; while (st.q.length && st.q[0].e <= now) { if (invCount(S) + REC.k > S.cap) { if (!n) return fail(L('barnFull')); break; } give(S, REC.o, REC.k); addXp(S, REC.xp, out); st.q.shift(); st.n = (st.n || 0) + REC.k; st.tot = (st.tot || 0) + ITEMS.bombom.v; st.lt = now; n++; }
    if (!n) return fail(L('ngNothing')); out.fx.push(['ngGain', n]); return true; }
  return null; } });

// ---------- relógio (dentro do Conselho: também offline, com o tempo simulado) ----------
EXT.step.push((S, now) => { if (!S.cv) return false; const M = ngOf(S); let ch = false;
  const b = M.banco; if (b.b) { if (!b.at || b.at > now) b.at = now; if (now - b.at >= NG.banco.every) { b.at = now; const v = Math.min(2000, Math.round(S.cv.t * 0.02)); if (v > 0) { cvAdd(S, v, 'negocios'); b.tot += v; b.last = v; b.lt = now; b.n++; ngLog(S, now, 'comercio', 'ngBanco', 'banco', v); ch = true; } } }
  const m = M.mercado; if (m.b) { if (!m.at || m.at > now) m.at = now; if (now - m.at >= NG.mercado.every) { m.at = now; const v = Math.min(600, Math.round(barnValue(S) * 0.05)); if (v > 0) { S.coins += v; m.tot += v; m.last = v; m.lt = now; m.n++; ngLog(S, now, 'comercio', 'ngMercado', 'mercado', v); ch = true; } } }
  const o = M.oficios; if (o.b) { if (!o.at || o.at > now) o.at = now; if (now - o.at >= NG.oficios.every) { o.at = now; const u = unemp(S), v = Math.round(u * 0.25 * (NG.oficios.every / 60000)); o.u = u; if (v > 0) { cvAdd(S, v, 'negocios'); o.tot += v; o.last = v; o.lt = now; o.n++; ngLog(S, now, 'comercio', 'ngOficios', String(u), v); ch = true; } } }
  const c = M.choc; if (c.b && c.q.length && c.q[0].cv && c.q[0].e <= now) { // encomenda do Conselho pronta: vai direto para o celeiro, se couber
    if (invCount(S) + REC.k <= S.cap) { give(S, REC.o, REC.k); c.q.shift(); c.n = (c.n || 0) + REC.k; c.tot = (c.tot || 0) + ITEMS.bombom.v; c.lt = now; ngLog(S, now, 'comercio', 'ngChoc', 'bombom', ITEMS.bombom.v); ch = true; } }
  return ch; });

// ---------- opções do Conselho (Secretaria de Comércio) ----------
EXT.opts.push((S, now, r, o) => { if (r !== 'comercio') return; const M = ngOf(S);
  const bs = NG_KEYS.filter(k => !M[k].b && canBuild(S, k)).sort((a, b) => NG[a].cost - NG[b].cost); if (bs[0]) o.push([{ a: 'ngBuild', k: bs[0], by2: 'comercio' }, NG[bs[0]].cost]);
  const c = M.choc; if (c.b && c.q.length < NG_Q && now - (c.cvAt || 0) >= NG_CV_EVERY) o.push([{ a: 'ngOrder', k: 'bombom', by2: 'comercio' }, orderCost()]); });

// ---------- folha ----------
function ngSheet(S, t, arg) { const M = ngOf(S), now = nowS(); t.textContent = '🏪 ' + L('ngT');
  const ic = { banco: '🏦', mercado: '🛒', oficios: '🛠️', choc: '🍫' }, ago = ts => ts ? L('ngAgo', fmtT(Math.max(1, Math.round((now - ts) / 1000)))) : L('ngNever');
  let h = `<p class="sub">${L('ngSub')}</p>`;
  for (const k of NG_KEYS) { const B = NG[k], st = M[k], open = arg === k; let body = '';
    if (!st.b) { const ok = canBuild(S, k), why = B.lvl > S.lvl ? L('lvl', B.lvl) : !S.land[B.land] ? L('ngNeedLand', L('land_' + B.land)) : '';
      body = `<button class="btn${ok && S.coins >= B.cost ? '' : ' gray'}" type="button" data-ngbuild="${k}" ${ok && S.coins >= B.cost ? '' : 'disabled'} style="font-size:16px">🔨 ${L('ngBuy')} · ${img('coin')} ${B.cost}</button>${why ? `<small style="color:#a0522d">🔒 ${why}</small>` : ''}`; }
    else if (k === 'choc') { const ready = st.q.some(j => j.e <= now), slots = Array.from({ length: NG_Q }, (_, i) => { const j = st.q[i]; if (!j) return `<div class="slot">${L('empty')}</div>`; const r = j.e <= now; return `<div class="slot ${r ? 'ready' : ''}">${img('bombom')}<em>${r ? L('ready') : j.s <= now ? fmtT(Math.ceil((j.e - now) / 1000)) : L('queued')}</em>${j.cv ? '<small style="position:absolute;top:2px;right:4px">🏛️</small>' : ''}</div>`; }).join('');
      body = `<small>${L('ngChocTot', st.n || 0, st.tot || 0)} · ${L('ngBy_' + (st.by || 'you'))}</small><div class="row"><div class="q" style="flex:1">${slots}</div>${ready ? `<button class="btn" type="button" data-ngcollect="1">${L('collect')}</button>` : ''}</div>
        <div class="card" style="background:#fff7ef"><div class="row"><span style="width:44px;height:44px;display:grid;place-items:center">${img('bombom')}</span><div style="flex:1"><b>${N('bombom')}</b><br><small>${fmtT(REC.t)} · <img src="${icon('coin')}" alt="" style="width:18px;height:18px;vertical-align:-4px"> ${sellPrice('bombom')}</small></div><button class="btn${has(S, REC.i) && st.q.length < NG_Q ? '' : ' gray'}" type="button" data-ngmake="1" ${has(S, REC.i) && st.q.length < NG_Q ? '' : 'disabled'} style="font-size:16px">${L('ngMake')}</button></div>${needHtml(S, REC.i)}</div><small style="color:#7a6a55">${L('ngOrderNote', orderCost())}</small>`; }
    else { const extra = k === 'oficios' ? `<small>${L('ngUnemp', unemp(S), (unemp(S) * 0.25).toFixed(2))}</small>` : k === 'mercado' ? `<small>${L('ngBarnV', barnValue(S), Math.min(600, Math.round(barnValue(S) * 0.05)))}</small>` : k === 'banco' && S.cv ? `<small>${L('ngBankV', Math.round(S.cv.t), Math.min(2000, Math.round(S.cv.t * 0.02)))}</small>` : '';
      body = `<small>✅ ${L('ngBuilt')} · ${L('ngBy_' + (st.by || 'you'))}</small><b style="font-size:17px">${L(k === 'mercado' ? 'ngTotYou' : 'ngTotCv', (st.tot || 0).toLocaleString())}</b><small>${st.n ? L('ngLast', st.last || 0, ago(st.lt)) : L('ngSoon', fmtT(Math.round(B.every / 1000)))}</small>${extra}${!S.cv ? `<small style="color:#a0522d">${L('ngNeedCv')}</small>` : ''}`; }
    h += `<div class="card" style="${open ? 'border:2px solid #e6a92a;' : ''}gap:6px"><div class="row" style="gap:8px"><span style="font-size:28px">${ic[k]}</span><div style="flex:1;min-width:0"><b>${nn(k)}</b><br><small>${L('ngD_' + k)}</small></div></div>${body}</div>`; }
  return h; }
EXT.sheet.negocios = ngSheet; EXT.go.negocios = () => openSheet('negocios');
EXT.click.push(d => { if (d.ngbuild) { act({ a: 'ngBuild', k: d.ngbuild }); return true; } if (d.ngmake) { act({ a: 'ngMake' }); return true; } if (d.ngcollect) { act({ a: 'ngCollect' }); return true; } return false; });
EXT.fx.push(f => { if (f[0] === 'ngBuilt') { const B = NG[f[1]]; toast(L('ngBuiltT', nn(f[1])), 3500); if (typeof burst === 'function' && B) burst(B.x, B.y - 60, 'coin'); if (typeof SND !== 'undefined' && SND.lvl) SND.lvl(); return true; } if (f[0] === 'ngMake') { toast(L('ngMakeT'), 2000); return true; } if (f[0] === 'ngGain') { const B = NG.choc; if (typeof FLOAT !== 'undefined') FLOAT.push({ k: 'bombom', n: f[1], x: B.x, y: B.y - 60, t: 0 }); if (typeof SND !== 'undefined' && SND.pop) SND.pop(); if (typeof burst === 'function') burst(B.x, B.y - 60, 'bombom'); return true; } return false; });
EXT.migrate.push(S => { ngOf(S); });

// ---------- toque no mapa ----------
EXT.tap.push((p, S) => { const M = ngOf(S); for (const k of NG_KEYS) { const B = NG[k]; if (!S.land[B.land] || !inR(p, ngRect(k))) continue; if (!M[k].b && B.lvl > S.lvl) { toast(L('unlockName', nn(k), B.lvl)); return true; }
    if (k === 'choc' && M.choc.b && M.choc.q.some(j => j.e <= nowS())) act({ a: 'ngCollect' }, true); openSheet('negocios', k); return true; } return false; });

// ---------- desenho ----------
function plate(g, x, y, txt) { g.font = '900 12px Nunito, sans-serif'; g.textAlign = 'center'; const w = g.measureText(txt).width + 16; g.fillStyle = 'rgba(58,36,18,.85)'; rr(g, x - w / 2, y - 11, w, 22, 8); g.fill(); g.fillStyle = '#fff'; g.fillText(txt, x, y + 5); }
function ngSign(g, x, y, k, S) { const B = NG[k]; shadow(g, x, y, 90); g.fillStyle = '#7a4b25'; g.fillRect(x - 4, y - 50, 8, 50);
  g.fillStyle = '#c9905a'; rr(g, x - 76, y - 112, 152, 70, 8); g.fill(); g.strokeStyle = '#7a4b25'; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#fff'; g.font = '900 17px "Baloo 2", Nunito, sans-serif'; g.textAlign = 'center'; g.fillText(L('forSale'), x, y - 90);
  g.font = '900 12px Nunito, sans-serif'; g.fillText(nn(k), x, y - 73); if (B.lvl > S.lvl) g.fillText(L('lvl', B.lvl), x, y - 56); else { g.drawImage(iconCanvas('coin'), x - 28, y - 69, 18, 18); g.fillText(String(B.cost), x + 6, y - 55); } }
function drawBanco(g, B, T) { const { x, y, w, h } = B; shadow(g, x, y + 2, w + 30); house(g, x, y, w, h, '#f4efe3', '#4a6fa5', 24);
  g.fillStyle = '#e8e0cc'; g.fillRect(x - w / 2 - 6, y - 10, w + 12, 10); for (let i = 0; i < 4; i++) { const cxp = x - (w / 2 - 22) + i * ((w - 44) / 3); g.fillStyle = '#fbf8f0'; g.fillRect(cxp - 7, y - h + 8, 14, h - 18); g.fillStyle = '#d6cdb5'; g.fillRect(cxp + 4, y - h + 8, 3, h - 18); g.fillStyle = '#e8e0cc'; g.fillRect(cxp - 10, y - h + 4, 20, 6); g.fillRect(cxp - 10, y - 12, 20, 4); }
  g.fillStyle = '#5a3a1a'; g.fillRect(x - 12, y - 40, 24, 30);
  g.fillStyle = '#3f5f90'; g.beginPath(); g.moveTo(x - w / 2 - 10, y - h); g.lineTo(x, y - h - 30); g.lineTo(x + w / 2 + 10, y - h); g.closePath(); g.fill();
  const k = 0.5 + 0.5 * Math.sin(T * 3); g.save(); g.globalAlpha = 0.45 + 0.55 * k; g.fillStyle = `rgba(255,210,80,${0.35 * k})`; g.beginPath(); g.arc(x, y - h - 12, 22, 0, 6.283); g.fill(); g.fillStyle = '#ffc23a'; g.beginPath(); g.arc(x, y - h - 12, 13, 0, 6.283); g.fill(); g.strokeStyle = '#b8862a'; g.lineWidth = 2; g.stroke(); g.fillStyle = '#7a4b10'; g.font = '900 18px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('$', x, y - h - 6); g.restore(); }
function drawMercado(g, B, T) { const { x, y, w, h } = B; shadow(g, x, y + 2, w + 30); house(g, x, y, w, h, '#fff3c4', '#2f9e6e', 22);
  g.fillStyle = '#5a3a1a'; g.fillRect(x - 16, y - 44, 32, 34); win(g, x - w / 2 + 14, y - 62, 24, 18); win(g, x + w / 2 - 38, y - 62, 24, 18);
  for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#e0533d' : '#fff'; g.beginPath(); g.moveTo(x - w / 2 - 8 + i * ((w + 16) / 12), y - h + 18); g.lineTo(x - w / 2 - 8 + (i + 1) * ((w + 16) / 12), y - h + 18); g.lineTo(x - w / 2 - 8 + (i + 1) * ((w + 16) / 12), y - h + 34); g.lineTo(x - w / 2 - 8 + i * ((w + 16) / 12), y - h + 34); g.fill(); }
  g.fillStyle = '#e0533d'; g.beginPath(); for (let i = 0; i < 12; i++) { g.moveTo(x - w / 2 - 8 + i * ((w + 16) / 12), y - h + 34); g.arc(x - w / 2 - 8 + (i + 0.5) * ((w + 16) / 12), y - h + 34, (w + 16) / 24, 0, Math.PI); } g.fill();
  const cols = ['#ff9a1f', '#e0333d', '#7cc04b', '#ffd23f']; for (let i = 0; i < 4; i++) { const bx = i < 2 ? x - w / 2 + 6 + i * 32 : x + w / 2 - 38 + (i - 2) * 32, by = y - 2; g.fillStyle = '#a8743f'; rr(g, bx - 14, by - 16, 28, 16, 3); g.fill(); g.fillStyle = cols[i]; for (let j = 0; j < 5; j++) { g.beginPath(); g.arc(bx - 9 + (j % 3) * 9 + (j > 2 ? 4 : 0), by - 14 - (j > 2 ? 6 : 0), 4, 0, 6.283); g.fill(); } }
  const ph = (T * 0.25) % 1; g.save(); g.globalAlpha = ph < 0.1 ? ph * 10 : ph > 0.85 ? (1 - ph) / 0.15 : 1; kid(g, x + w / 2 - 30 - ph * (w / 2 + 10), y + 10, '#3d7fd6', T, 2); g.restore();
  g.fillStyle = '#fff'; g.font = '900 13px "Baloo 2", Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('MERCADO', x, y - h + 8); }
function drawOficios(g, B, T) { const { x, y, w, h } = B; shadow(g, x, y + 2, w + 30); house(g, x, y, w, h, '#f6e6d0', '#8a4b22', 30);
  win(g, x - 72, y - 68, 24, 20); win(g, x + 48, y - 68, 24, 20); g.fillStyle = '#5a3a1a'; g.fillRect(x - 14, y - 42, 28, 32);
  g.fillStyle = '#8a4b22'; g.fillRect(x - 12, y - h - 60, 24, 32); g.fillStyle = '#c0583e'; g.beginPath(); g.moveTo(x - 16, y - h - 60); g.lineTo(x, y - h - 76); g.lineTo(x + 16, y - h - 60); g.fill(); g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(x, y - h - 44, 6 + Math.sin(T * 2) * 0.5, 0, 6.283); g.fill();
  g.save(); g.translate(x + 60, y - h - 8); g.rotate(-0.6 + Math.sin(T * 2) * 0.12); g.fillStyle = '#7a4b25'; g.fillRect(-3, -4, 6, 30); g.fillStyle = '#8a8a8a'; rr(g, -12, -14, 24, 12, 3); g.fill(); g.restore();
  g.save(); g.translate(x - 60, y - h - 8); g.rotate(0.6); g.fillStyle = '#7a4b25'; g.fillRect(-3, -4, 6, 30); g.fillStyle = '#9a9a90'; g.beginPath(); g.moveTo(-10, -14); g.lineTo(10, -14); g.lineTo(10, -4); g.lineTo(-10, -4); g.fill(); g.restore();
  for (let i = 0; i < 3; i++) { const ph = (T * 0.12 + i / 3) % 1, kx = x - 120 + ph * 108, al = ph > 0.86 ? (1 - ph) / 0.14 : ph < 0.08 ? ph / 0.08 : 1; g.save(); g.globalAlpha = al; kid(g, kx, y + 8 + i * 3, ['#e0533d', '#2f9e6e', '#e6a92a'][i], T, i); g.restore(); } }
function drawChoc(g, B, T, busy) { const { x, y, w, h } = B; shadow(g, x, y + 2, w + 30); house(g, x, y, w, h, '#ffd9e4', '#6b3a1f', 28);
  win(g, x - 64, y - 62, 24, 18); win(g, x + 40, y - 62, 24, 18); g.fillStyle = '#5a2e14'; g.fillRect(x - 12, y - 40, 24, 30);
  g.fillStyle = '#8a8a8a'; g.fillRect(x + 44, y - h - 54, 14, 34); for (let s2 = 0; s2 < 3; s2++) { const ph = (T * (busy ? 0.8 : 0.3) + s2 / 3) % 1; g.fillStyle = `rgba(120,80,50,${0.45 * (1 - ph)})`; g.beginPath(); g.arc(x + 51 + Math.sin(ph * 6) * 4, y - h - 58 - ph * 30, 5 + ph * 6, 0, 6.283); g.fill(); }
  g.fillStyle = '#fff'; rr(g, x - 44, y - h - 26, 88, 22, 6); g.fill(); g.strokeStyle = '#6b3a1f'; g.lineWidth = 2; g.stroke(); g.drawImage(ICON_CV.bombom, x - 40, y - h - 26, 22, 22); g.drawImage(ICON_CV.bombom, x + 18, y - h - 26, 22, 22); g.fillStyle = '#6b3a1f'; g.font = '900 11px "Baloo 2", Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('BOMBOM', x, y - h - 11);
  if (busy) { const wob = Math.sin(T * 6) * 2; g.fillStyle = '#ff8fb1'; g.beginPath(); g.arc(x + 64, y - 44 + wob, 5, 0, 6.283); g.fill(); } }
let seenMerc = -1;
EXT.draw0.push((cx, S, T, dt, now) => { if (!S) return; const M = ngOf(S), hw = innerWidth / CAM.z / 2 + 260, hh = innerHeight / CAM.z / 2 + 260;
  for (const k of NG_KEYS) { const B = NG[k]; if (!S.land[B.land] || Math.abs(B.x - CAM.x) > hw || Math.abs(B.y - CAM.y) > hh) continue; const st = M[k];
    if (!st.b) { ngSign(cx, B.x, B.y, k, S); continue; }
    if (k === 'banco') drawBanco(cx, B, T); else if (k === 'mercado') drawMercado(cx, B, T); else if (k === 'oficios') drawOficios(cx, B, T); else drawChoc(cx, B, T, !!(st.q[0] && st.q[0].s <= now && st.q[0].e > now));
    if (CAM.z >= 0.45) plate(cx, B.x, B.y + 20, nn(k));
    if (k === 'choc' && st.q.length) { const j = st.q[0]; if (j.e <= now) bubble(cx, B.x, B.y - B.h - 70, 'bombom', T); else if (j.s <= now) progressBar(cx, B.x, B.y - B.h - 44, 70, (now - j.s) / (j.e - j.s)); } }
  // bônus do Mercado Grande: moedas e aviso quando o pagamento chega (só o anfitrião vê de perto)
  const m = M.mercado; if (seenMerc < 0) seenMerc = m.lt || 0; else if (m.lt && m.lt !== seenMerc && Date.now() - m.lt < 60000) { seenMerc = m.lt; if (typeof burst === 'function') burst(NG.mercado.x, NG.mercado.y - 60, 'coin'); toast(L('ngMercT', m.last), 3000); } else if (m.lt !== seenMerc) seenMerc = m.lt || 0; });

// ---------- botão 🏪 ----------
const b = document.createElement('button'); b.className = 'ib'; b.id = 'bNeg'; b.type = 'button'; b.textContent = '🏪'; b.setAttribute('aria-label', 'Negócios'); b.style.cssText = 'position:fixed;left:max(14px,env(safe-area-inset-left));bottom:calc(env(safe-area-inset-bottom) + 400px);z-index:3;width:58px;height:58px;border-radius:50%;font-size:28px;box-shadow:0 4px 0 rgba(0,0,0,.25),0 6px 16px rgba(0,0,0,.25);display:none'; b.onclick = () => { if (G.S) openSheet('negocios'); }; document.body.appendChild(b);
setInterval(() => { const S = G.S, on = !!(S && !$('hud').hidden && !SH && S.lvl >= 12); b.style.display = on ? '' : 'none'; }, 1000);

// ---------- textos ----------
Object.assign(TX.pt, { ngT: 'Negócios', ngSub: 'Prédios que rendem sozinhos para a cidade e para você. O Conselho (Comércio) também constrói e faz encomendas.', ngBuy: 'Construir', ngBuilt: 'Construído', ngBy_you: 'por você', ngBy_comercio: 'pelo Conselho', ngNeedLand: (n) => `precisa do terreno ${n}`, ngNeedCv: 'Rende quando a cidade tiver Prefeitura (Conselho).', ngNothing: 'Ainda não há bombons prontos.',
  ngD_banco: 'A cada 10 min paga ao tesouro 2% do que a cidade guarda (até 2000).', ngD_mercado: 'A cada 5 min paga a você um bônus de vendas: 5% do valor do celeiro (até 600).', ngD_oficios: 'Ensina ofícios novos: cada vizinho adulto sem emprego rende 0,25 moeda por minuto ao tesouro.', ngD_choc: 'Faz bombons com chocolate quente, leite e açúcar. O Conselho pode encomendar.',
  ngTotCv: (v) => `Rendeu ${v} ao tesouro`, ngTotYou: (v) => `Rendeu ${v} para você`, ngLast: (v, t) => `Último pagamento: +${v} (${t})`, ngAgo: (t) => `há ${t}`, ngNever: 'ainda não pagou', ngSoon: (t) => `Primeiro pagamento em ${t}.`, ngUnemp: (n, v) => `Vizinhos sem emprego agora: ${n} → ${v}/min`, ngBarnV: (v, b) => `Celeiro vale ${v} → próximo bônus ${b}`, ngBankV: (t, v) => `Tesouro ${t} → próximo pagamento ${v}`,
  ngChocTot: (n, v) => `Bombons feitos: ${n} (valor ${v})`, ngMake: 'Produzir', ngOrderNote: (c) => `🏛️ O Conselho encomenda bombons pagando os ingredientes (${c}); eles vão para o seu celeiro.`, ngBuiltT: (n) => `🏪 ${n} inaugurado!`, ngMakeT: '🍫 Bombons no forno!', ngMercT: (v) => `🛒 Mercado Grande: bônus de vendas +${v}`,
  ecoIn_negocios: 'Negócios (Banco e Escola)',
  cvL_ngBuild: (n, v) => `construiu ${N('ng_' + n)} (${v})`, cvL_ngOrder: (n, v) => `encomendou bombons na Chocolataria (${v})`, cvL_ngBanco: (n, v) => `o Banco rendeu +${v} ao tesouro`, cvL_ngMercado: (n, v) => `o Mercado Grande pagou +${v} de bônus para você`, cvL_ngOficios: (n, v) => `a Escola de Ofícios ensinou ofícios novos a ${n} vizinho(s): +${v} ao tesouro`, cvL_ngChoc: (n, v) => `a encomenda de bombons ficou pronta e foi para o celeiro`,
  cvS_ngBuild: (n) => `${n} negócio(s) novo(s)`, cvS_ngOrder: (n) => `${n} encomenda(s) de bombons`, cvS_ngBanco: (n) => `${n} pagamento(s) do Banco`, cvS_ngMercado: (n) => `${n} bônus do Mercado Grande`, cvS_ngOficios: (n) => `${n} turma(s) na Escola de Ofícios`, cvS_ngChoc: (n) => `${n} bombom(ns) entregue(s)` });
Object.assign(TX.es, { ngT: 'Negocios', ngSub: 'Edificios que rinden solos para la ciudad y para ti. El Concejo (Comercio) también construye y hace encargos.', ngBuy: 'Construir', ngBuilt: 'Construido', ngBy_you: 'por ti', ngBy_comercio: 'por el Concejo', ngNeedLand: (n) => `necesita el terreno ${n}`, ngNeedCv: 'Rinde cuando la ciudad tenga Alcaldía (Concejo).', ngNothing: 'Aún no hay bombones listos.',
  ngD_banco: 'Cada 10 min paga al tesoro el 2% de lo que guarda la ciudad (hasta 2000).', ngD_mercado: 'Cada 5 min te paga un bono de ventas: 5% del valor del granero (hasta 600).', ngD_oficios: 'Enseña oficios nuevos: cada vecino adulto sin empleo rinde 0,25 moneda por minuto al tesoro.', ngD_choc: 'Hace bombones con chocolate caliente, leche y azúcar. El Concejo puede encargar.',
  ngTotCv: (v) => `Rindió ${v} al tesoro`, ngTotYou: (v) => `Rindió ${v} para ti`, ngLast: (v, t) => `Último pago: +${v} (${t})`, ngAgo: (t) => `hace ${t}`, ngNever: 'aún no pagó', ngSoon: (t) => `Primer pago en ${t}.`, ngUnemp: (n, v) => `Vecinos sin empleo ahora: ${n} → ${v}/min`, ngBarnV: (v, b) => `El granero vale ${v} → próximo bono ${b}`, ngBankV: (t, v) => `Tesoro ${t} → próximo pago ${v}`,
  ngChocTot: (n, v) => `Bombones hechos: ${n} (valor ${v})`, ngMake: 'Producir', ngOrderNote: (c) => `🏛️ El Concejo encarga bombones pagando los ingredientes (${c}); van a tu granero.`, ngBuiltT: (n) => `🏪 ¡${n} inaugurado!`, ngMakeT: '🍫 ¡Bombones en el horno!', ngMercT: (v) => `🛒 Mercado Grande: bono de ventas +${v}`,
  ecoIn_negocios: 'Negocios (Banco y Escuela)',
  cvL_ngBuild: (n, v) => `construyó ${N('ng_' + n)} (${v})`, cvL_ngOrder: (n, v) => `encargó bombones en la Chocolatería (${v})`, cvL_ngBanco: (n, v) => `el Banco rindió +${v} al tesoro`, cvL_ngMercado: (n, v) => `el Mercado Grande te pagó +${v} de bono`, cvL_ngOficios: (n, v) => `la Escuela de Oficios enseñó oficios nuevos a ${n} vecino(s): +${v} al tesoro`, cvL_ngChoc: (n, v) => `el encargo de bombones quedó listo y fue al granero`,
  cvS_ngBuild: (n) => `${n} negocio(s) nuevo(s)`, cvS_ngOrder: (n) => `${n} encargo(s) de bombones`, cvS_ngBanco: (n) => `${n} pago(s) del Banco`, cvS_ngMercado: (n) => `${n} bono(s) del Mercado Grande`, cvS_ngOficios: (n) => `${n} grupo(s) en la Escuela de Oficios`, cvS_ngChoc: (n) => `${n} bombón(es) entregado(s)` });
})();
