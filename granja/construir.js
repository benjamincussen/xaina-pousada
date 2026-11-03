// Sítio do Vento — Construir livre: casas, negócios e produção onde o jogador quiser (em terrenos próprios e livres).
(function () {
const CAT = {
  casa: { g: 'casa', c: 800, y: 50, w: 96, h: 70, wall: '#f5ecd8', roof: '#e0533d', ic: '🏠' },
  sobrado: { g: 'casa', c: 2000, y: 120, w: 110, h: 96, wall: '#f2e4c8', roof: '#3d7fd6', ic: '🏡' },
  predio: { g: 'casa', c: 5000, y: 300, w: 110, h: 150, wall: '#dfe6ee', roof: '#9fb6cc', ic: '🏢' },
  cafe: { g: 'neg', c: 2500, y: 160, w: 110, h: 80, wall: '#fff1d6', roof: '#8a5a2b', ic: '☕' },
  loja: { g: 'neg', c: 4000, y: 240, w: 120, h: 84, wall: '#ffe4ee', roof: '#ff7aa8', ic: '🛍️' },
  pizzaria: { g: 'neg', c: 6000, y: 360, w: 120, h: 86, wall: '#fff4d6', roof: '#d9483b', ic: '🍕' },
  cinema: { g: 'neg', c: 10000, y: 600, w: 140, h: 100, wall: '#2b2b44', roof: '#ffd23f', ic: '🎬' },
  banco: { g: 'neg', c: 15000, y: 900, w: 140, h: 104, wall: '#e8ecf2', roof: '#7d828c', ic: '🏦' },
  horta: { g: 'prod', c: 1500, y: 100, w: 130, h: 60, wall: '#8a5a2b', roof: '#5fa83c', ic: '🥬' },
  granja: { g: 'prod', c: 3500, y: 220, w: 140, h: 90, wall: '#c0392b', roof: '#7a2a20', ic: '🐔' },
  fabrica: { g: 'prod', c: 8000, y: 500, w: 150, h: 110, wall: '#c9ced6', roof: '#6b6f78', ic: '🏭' },
};
const MAXB = 300, CAPH = 4, LVMAX = 5;
const POP = { casa: 4, sobrado: 8, predio: 20 }, JOB = { cafe: 3, loja: 4, pizzaria: 6, cinema: 10, banco: 15, horta: 2, granja: 4, fabrica: 12 };
window.cbPop = S => (Array.isArray(S.cb) ? S.cb : []).reduce((a, b) => a + (POP[b.k] || 0) * (b.lv || 1), 0);
window.cbJobs = S => (Array.isArray(S.cb) ? S.cb : []).reduce((a, b) => a + (JOB[b.k] || 0) * (b.lv || 1), 0);
// bairros temáticos: 3+ construções do mesmo grupo a menos de 450 de distância → bônus
const ZB = { casa: 0.2, neg: 0.25, prod: 0.25 }; let ZC = { n: -1, m: new Map() };
function zoneOf(S, b) { const L0 = S.cb || []; if (ZC.n !== L0.length || ZC.s !== S) { ZC = { n: L0.length, s: S, m: new Map() }; for (const x of L0) { const g = CAT[x.k] && CAT[x.k].g, near = L0.filter(y => CAT[y.k] && CAT[y.k].g === g && Math.hypot(y.x - x.x, y.y - x.y) < 450).length; ZC.m.set(x, near >= 3 ? g : null); } } return ZC.m.get(b) || null; }
const cbOf = S => { if (!Array.isArray(S.cb)) S.cb = []; return S.cb; };
const yieldOf = b => { const z = G.S ? zoneOf(G.S, b) : null; return Math.round(CAT[b.k].y * (1 + 0.5 * ((b.lv || 1) - 1)) * (1 + (z ? ZB[z] : 0))); };
const upCostOf = b => Math.round(CAT[b.k].c * 0.8 * (b.lv || 1));
const pend = (b, now) => Math.floor(Math.min(CAPH, Math.max(0, (now - (b.at || now)) / 3600000)) * yieldOf(b));
const priceOf = (S, k) => Math.round(CAT[k].c * (1 + 0.04 * cbOf(S).filter(b => b.k === k).length));
function ownedAt(S, x, y) { if (x > 20 && x < 1480 && y > 120 && y < 1000) return true; for (const [k, Ld] of Object.entries(LANDS)) { const r = Ld.r; if (S.land[k] && x > r.x + 20 && x < r.x + r.w - 20 && y > r.y + 60 && y < r.y + r.h - 10) return true; } return false; }
function freeAt(S, k, x, y) { const C = CAT[k]; if (!ownedAt(S, x - C.w / 2, y) || !ownedAt(S, x + C.w / 2, y) || !ownedAt(S, x, y - C.h)) return false; const box = { x: x - C.w / 2 - 6, y: y - C.h - 30, w: C.w + 12, h: C.h + 36 }, hit = r => box.x < r.x + r.w && box.x + box.w > r.x && box.y < r.y + r.h && box.y + box.h > r.y;
  let rs = []; try { rs = archRects(S); } catch (e) {} if (rs.some(hit)) return false; for (const b of cbOf(S)) { const B = CAT[b.k]; if (hit({ x: b.x - B.w / 2 - 6, y: b.y - B.h - 30, w: B.w + 12, h: B.h + 36 })) return false; }
  try { if (x > 0 && x < WW && typeof roadOk === 'function' && !roadOk(S, Math.floor(x / RD), Math.floor(y / RD))) return false; } catch (e) {} return true; }
window.cbFree = freeAt;
// ---------- ações ----------
EXT.apply.push({ pre: 'cb', fn: (S, a, now, out, fail) => { const L0 = cbOf(S);
  if (a.a === 'cbPut') { const C = CAT[a.k]; if (!C) return fail(''); if (L0.length >= MAXB) return fail(L('cbMax')); const x = Math.round(+a.x), y = Math.round(+a.y); if (!isFinite(x) || !isFinite(y) || !freeAt(S, a.k, x, y)) return fail(L('cbNoSpot')); const c = priceOf(S, a.k); if (S.coins < c) return fail(L('noCoins')); S.coins -= c; L0.push({ k: a.k, x, y, at: now, lv: 1, t: now }); addXp(S, Math.max(5, Math.round(c / 120)), out); out.fx.push(['coins', -c]); out.fx.push(['cbBuilt', a.k]); return true; }
  const i = a.i | 0, b = L0[i]; if (!b) return fail('');
  if (a.a === 'cbCol') { const v = pend(b, now); if (v < 1) return fail(L('cbNothing')); b.at = now; S.coins += v; addXp(S, 1, out); out.fx.push(['coins', v]); return true; }
  if (a.a === 'cbUp') { if ((b.lv || 1) >= LVMAX) return fail(''); const c = upCostOf(b); if (S.coins < c) return fail(L('noCoins')); S.coins -= c; const v = pend(b, now); S.coins += v; b.at = now; b.lv = (b.lv || 1) + 1; b.t = now; addXp(S, Math.max(5, Math.round(c / 100)), out); out.fx.push(['coins', -c]); out.fx.push(['cbUp', b.lv]); return true; }
  if (a.a === 'cbDel') { const r = Math.round(CAT[b.k].c * 0.5); S.coins += r + pend(b, now); L0.splice(i, 1); out.fx.push(['coins', r]); return true; }
  return null; } });
// cobrar tudo
EXT.apply.unshift({ pre: 'cbAllCol', fn: (S, a, now, out, fail) => { let v = 0; for (const b of cbOf(S)) { const p = pend(b, now); if (p >= 1) { v += p; b.at = now; } } if (v < 1) return fail(L('cbNothing')); S.coins += v; addXp(S, Math.min(50, Math.ceil(v / 500)), out); out.fx.push(['coins', v]); return true; } });
// ---------- desenho ----------
EXT.draw0.push((g, S, T, dt, now) => { if (!S || !Array.isArray(S.cb) || !S.cb.length) return; const hw = innerWidth / CAM.z / 2 + 200, hh = innerHeight / CAM.z / 2 + 260, far = CAM.z < 0.3;
  S.cb.forEach((b, i) => { if (Math.abs(b.x - CAM.x) > hw || Math.abs(b.y - CAM.y) > hh) return; const C = CAT[b.k]; if (!C) return; const lv = b.lv || 1;
    if (far) { g.fillStyle = C.roof; g.fillRect(b.x - C.w / 2, b.y - C.h, C.w, C.h); return; }
    if (C.g === 'prod' && b.k === 'horta') { g.fillStyle = '#8a5a2b'; g.fillRect(b.x - C.w / 2, b.y - C.h, C.w, C.h); for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#5fa83c' : '#7cc46a'; g.fillRect(b.x - C.w / 2 + 6, b.y - C.h + 6 + k * 13, C.w - 12, 8); } }
    else house(g, b.x, b.y, C.w, C.h + (lv - 1) * 10, C.wall, C.roof, 30);
    g.font = '30px sans-serif'; g.textAlign = 'center'; g.fillText(C.ic, b.x, b.y - C.h - (lv - 1) * 10 - 34);
    if (lv > 1) { g.fillStyle = 'rgba(58,36,18,.85)'; rr(g, b.x + C.w / 2 - 34, b.y - 22, 30, 20, 6); g.fill(); g.fillStyle = '#fff'; g.font = '900 12px Nunito, sans-serif'; g.fillText('★' + lv, b.x + C.w / 2 - 19, b.y - 8); }
    if (pend(b, now) >= yieldOf(b) && typeof bubble === 'function') bubble(g, b.x, b.y - C.h - 70, 'coin', T); });
  if (!far) { const done = []; for (const b of S.cb) { const z = zoneOf(S, b); if (!z || done.some(d => d.g === z && Math.hypot(d.x - b.x, d.y - b.y) < 600)) continue; done.push({ g: z, x: b.x, y: b.y }); if (Math.abs(b.x - CAM.x) > hw || Math.abs(b.y - CAM.y) > hh) continue; g.fillStyle = 'rgba(47,110,158,.88)'; g.font = '900 14px Nunito, sans-serif'; g.textAlign = 'center'; const txt = L('zone_' + z) + ' +' + Math.round(ZB[z] * 100) + '%', w = g.measureText(txt).width + 18; rr(g, b.x - w / 2, b.y + 14, w, 24, 8); g.fill(); g.fillStyle = '#fff'; g.fillText(txt, b.x, b.y + 31); } }
  const P = G.cbPlace; if (P && G.cbHover) { const { x, y } = G.cbHover, C = CAT[P], ok = freeAt(S, P, x, y); g.globalAlpha = 0.6; g.fillStyle = ok ? '#2f9e6e' : '#e0533d'; g.fillRect(x - C.w / 2, y - C.h, C.w, C.h); g.globalAlpha = 1; } });
// ---------- toque ----------
EXT.tap.push((p, S) => { if (!S) return false; if (G.cbPlace) { const k = G.cbPlace; G.cbHover = { x: p.x, y: p.y }; if (freeAt(S, k, p.x, p.y)) { const r = act({ a: 'cbPut', k, x: p.x, y: p.y }); if (r && r.ok && !G.cbKeep) G.cbPlace = null; } else toast(L('cbNoSpot'), 2000); return true; }
  const L0 = cbOf(S); for (let i = L0.length - 1; i >= 0; i--) { const b = L0[i], C = CAT[b.k]; if (C && Math.abs(p.x - b.x) < C.w / 2 + 8 && p.y > b.y - C.h - 40 && p.y < b.y + 10) { if (pend(b, Date.now()) >= 1) act({ a: 'cbCol', i }); else openSheet('cbOne', i); return true; } } return false; });
// ---------- folhas ----------
EXT.sheet.construir = (S, t) => { t.textContent = '🔨 ' + L('cbT'); const L0 = cbOf(S), now = Date.now(), tot = L0.reduce((a, b) => a + yieldOf(b), 0), pv = L0.reduce((a, b) => a + pend(b, now), 0);
  let h = `<p class="sub">${L('cbSub')}</p><div class="card"><b>🏗️ ${L0.length} · 🪙 +${tot}/h</b><br><small>${L('cbPopJ', cbPop(S), cbJobs(S))}</small><br><small>${L('cbCap')}</small><br><small>${L('cbZones')}</small><button class="btn${pv >= 1 ? '' : ' gray'}" type="button" data-cbcolall="1" ${pv >= 1 ? '' : 'disabled'} style="margin-top:6px;font-size:16px">🪙 ${L('cbColAll')} ${pv}</button></div>`;
  for (const grp of ['casa', 'neg', 'prod']) { h += `<span class="lbl">${L('cbG_' + grp)}</span><div class="grid">` + Object.entries(CAT).filter(([, C]) => C.g === grp).map(([k, C]) => { const c = priceOf(S, k); return `<button class="tile" type="button" data-cbpick="${k}" ${S.coins >= c ? '' : 'style="opacity:.55"'}><span style="font-size:30px">${C.ic}</span><b>${L('cb_' + k)}</b><small>🪙 ${c} · +${C.y}/h</small></button>`; }).join('') + `</div>`; }
  return h; };
EXT.sheet.cbOne = (S, t, i) => { const b = cbOf(S)[i]; if (!b) { t.textContent = '🔨'; return ''; } const C = CAT[b.k], now = Date.now(), lv = b.lv || 1; t.textContent = C.ic + ' ' + L('cb_' + b.k) + ' ★' + lv;
  return `<div class="card"><b>🪙 +${yieldOf(b)}/h</b><br><small>${L('cbPend', pend(b, now))}</small><div class="row" style="gap:6px;margin-top:8px">${lv < LVMAX ? `<button class="btn" type="button" data-cbup="${i}" style="flex:1;font-size:15px">⬆️ ${L('cbUpB')}<br><small>${upCostOf(b)} → +${Math.round(C.y * (1 + 0.5 * lv))}/h</small></button>` : ''}<button class="btn gray" type="button" data-cbdel="${i}" style="flex:1;font-size:15px">🧹 ${L('cbDel')}<br><small>+${Math.round(C.c * 0.5)}</small></button></div></div>`; };
EXT.click.push(d => { if (d.cbpick) { G.cbPlace = d.cbpick; closeSheet(); toast(L('cbPlaceHint', L('cb_' + d.cbpick)), 4000); return true; } if (d.cbcolall) { act({ a: 'cbAllCol' }); return true; } if (d.cbup) { act({ a: 'cbUp', i: +d.cbup }); return true; } if (d.cbdel) { if (G.cbDelArm === d.cbdel && Date.now() - G.cbDelT < 5000) { act({ a: 'cbDel', i: +d.cbdel }); G.cbDelArm = null; closeSheet(); } else { G.cbDelArm = d.cbdel; G.cbDelT = Date.now(); toast(L('cbDelSure'), 2500); } return true; } return false; });
EXT.fx.push(f => { if (f[0] === 'lvlBig') { setTimeout(() => toast(L('lvlBigT', f[1], f[2]), 5000), 2500); return true; } if (f[0] === 'cbBuilt') { toast(L('cbBuiltT', L('cb_' + f[1])), 2500); return true; } if (f[0] === 'cbUp') { toast(L('cbUpT', f[1]), 2500); return true; } return false; });
EXT.go.construir = () => openSheet('construir');
// ---------- botão 🔨 ----------
const btn = document.createElement('button'); btn.className = 'ib'; btn.id = 'bBuild'; btn.type = 'button'; btn.textContent = '🔨'; btn.setAttribute('aria-label', 'Construir'); btn.style.cssText = 'position:fixed;right:max(14px,env(safe-area-inset-right));bottom:calc(env(safe-area-inset-bottom) + 18px);z-index:3;width:58px;height:58px;border-radius:50%;font-size:28px;box-shadow:0 4px 0 rgba(0,0,0,.25),0 6px 16px rgba(0,0,0,.25);display:none';
btn.onclick = () => { if (!G.S) return; if (G.cbPlace) { G.cbPlace = null; toast(L('cbCancel'), 1800); } else openSheet('construir'); }; document.body.appendChild(btn);
setInterval(() => { const on = !!(G.S && !$('hud').hidden && !SH); btn.style.display = on ? '' : 'none'; btn.style.background = G.cbPlace ? '#ffd23f' : ''; }, 500);
// ---------- textos ----------
Object.assign(TX.pt, { cbT: 'Construir', cbSub: 'Escolha o que construir e toque em qualquer lugar livre dos seus terrenos. Cada construção rende moedas por hora.', cbCap: 'Acumula até 4 horas: toque na construção para cobrar.', cbColAll: 'Cobrar tudo', cbG_casa: '🏠 Casas', cbG_neg: '🏪 Negócios', cbG_prod: '🏭 Produção', cb_casa: 'Casa', cb_sobrado: 'Sobrado', cb_predio: 'Prédio', cb_cafe: 'Café', cb_loja: 'Loja', cb_pizzaria: 'Pizzaria', cb_cinema: 'Cinema', cb_banco: 'Banco', cb_horta: 'Horta', cb_granja: 'Granja', cb_fabrica: 'Fábrica',
  cbPlaceHint: (n) => `Toque onde quer construir: ${n}. 🔨 cancela.`, cbNoSpot: 'Aqui não dá: escolha um lugar livre num terreno seu.', cbMax: 'Você chegou ao máximo de construções.', cbNothing: 'Ainda não há moedas para cobrar.', cbPend: (v) => `Para cobrar agora: ${v}`, cbUpB: 'Melhorar', cbDel: 'Demolir', cbDelSure: 'Toque de novo para demolir.', cbBuiltT: (n) => `🏗️ ${n} construído!`, cbUpT: (l) => `⬆️ Melhorado para ★${l}`, cbCancel: 'Construção cancelada.', lvlBigT: (l, c) => `🏆 Nível ${l}! Prêmio especial de ${c} moedas.`, zone_casa: '🏘️ Bairro residencial', zone_neg: '🛍️ Zona comercial', zone_prod: '🏭 Polo industrial', cbZones: 'Junte 3 ou mais do mesmo tipo perto para formar um bairro: residencial +20%, comercial +25%, industrial +25%.', cbPopJ: (p, j) => `Moradores: +${p} · Empregos: +${j}`,
  land_livre1: 'Planície Livre', landDesc_livre1: 'Terreno enorme e vazio no extremo oeste: construa casas, negócios e produção onde quiser com 🔨.', land_livre2: 'Colinas Livres', landDesc_livre2: 'Mais espaço livre no oeste para construir o que você quiser com 🔨.', land_livre3: 'Vale Livre', landDesc_livre3: 'Outro grande terreno livre no oeste para novos bairros com 🔨.', land_livre4: 'Costa Oeste', landDesc_livre4: 'O último terreno livre do oeste: espaço para uma cidade inteira com 🔨.',
  n_cb: 'Construa onde quiser', n_cbD: 'Novo botão 🔨: escolha casas, negócios ou produção e toque em qualquer lugar livre dos seus terrenos. Cada construção rende moedas por hora, pode ser melhorada até ★5 e dá experiência para subir de nível (agora até o nível 60).' });
Object.assign(TX.es, { cbT: 'Construir', cbSub: 'Elige qué construir y toca cualquier lugar libre de tus terrenos. Cada construcción rinde monedas por hora.', cbCap: 'Acumula hasta 4 horas: toca la construcción para cobrar.', cbColAll: 'Cobrar todo', cbG_casa: '🏠 Casas', cbG_neg: '🏪 Negocios', cbG_prod: '🏭 Producción', cb_casa: 'Casa', cb_sobrado: 'Casona', cb_predio: 'Edificio', cb_cafe: 'Café', cb_loja: 'Tienda', cb_pizzaria: 'Pizzería', cb_cinema: 'Cine', cb_banco: 'Banco', cb_horta: 'Huerta', cb_granja: 'Granja', cb_fabrica: 'Fábrica',
  cbPlaceHint: (n) => `Toca donde quieres construir: ${n}. 🔨 cancela.`, cbNoSpot: 'Aquí no se puede: elige un lugar libre en un terreno tuyo.', cbMax: 'Llegaste al máximo de construcciones.', cbNothing: 'Aún no hay monedas para cobrar.', cbPend: (v) => `Para cobrar ahora: ${v}`, cbUpB: 'Mejorar', cbDel: 'Demoler', cbDelSure: 'Toca otra vez para demoler.', cbBuiltT: (n) => `🏗️ ¡${n} construido!`, cbUpT: (l) => `⬆️ Mejorado a ★${l}`, cbCancel: 'Construcción cancelada.', lvlBigT: (l, c) => `🏆 ¡Nivel ${l}! Premio especial de ${c} monedas.`, zone_casa: '🏘️ Barrio residencial', zone_neg: '🛍️ Zona comercial', zone_prod: '🏭 Polo industrial', cbZones: 'Junta 3 o más del mismo tipo cerca para formar un barrio: residencial +20%, comercial +25%, industrial +25%.', cbPopJ: (p, j) => `Vecinos: +${p} · Empleos: +${j}`,
  land_livre1: 'Llanura Libre', landDesc_livre1: 'Terreno enorme y vacío en el extremo oeste: construye casas, negocios y producción donde quieras con 🔨.', land_livre2: 'Colinas Libres', landDesc_livre2: 'Más espacio libre en el oeste para construir lo que quieras con 🔨.', land_livre3: 'Valle Libre', landDesc_livre3: 'Otro gran terreno libre en el oeste para nuevos barrios con 🔨.', land_livre4: 'Costa Oeste', landDesc_livre4: 'El último terreno libre del oeste: espacio para una ciudad entera con 🔨.',
  n_cb: 'Construye donde quieras', n_cbD: 'Nuevo botón 🔨: elige casas, negocios o producción y toca cualquier lugar libre de tus terrenos. Cada construcción rinde monedas por hora, se puede mejorar hasta ★5 y da experiencia para subir de nivel (ahora hasta el nivel 60).' });
if (typeof NEWS === 'object' && Array.isArray(NEWS) && !NEWS.some(n => n[0] === 'n_cb')) NEWS.unshift(['n_cb', 'construir']);
})();
