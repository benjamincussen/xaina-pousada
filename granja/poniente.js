// Sítio do Vento — Terras do Poente: região nova a oeste (x −18000 a −6000) com 64 terrenos à venda, caminhos e árvores. A equipe e o Conselho compram sozinhos.
(function () {
const X0 = -18000, X1 = -6000, COLS = 8, ROWS = 8, CW = 1500, RH = 1160, LW = 1460, LH = 1120, LVL0 = 26;
const A = ['Campina', 'Colina', 'Vale', 'Planalto', 'Bosque', 'Lagoa', 'Ribeira', 'Pradaria'], B = ['do Sol', 'da Lua', 'do Vento', 'das Flores', 'do Norte', 'do Sul', 'dos Pássaros', 'das Águas'];
const AE = ['Campiña', 'Colina', 'Valle', 'Meseta', 'Bosque', 'Laguna', 'Ribera', 'Pradera'], BE = ['del Sol', 'de la Luna', 'del Viento', 'de las Flores', 'del Norte', 'del Sur', 'de los Pájaros', 'de las Aguas'];
const KEYS = [];
// ordem: as colunas mais perto da cidade primeiro (mais baratas), de cima para baixo
for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) { const i = c * ROWS + r, k = 'pon' + i, x = X1 - (c + 1) * CW + 20, y = 40 + r * RH;
  LANDS[k] = { ext: 1, pon: 1, lvl: LVL0 + Math.floor(i / 4), cost: 8000 + i * 1500, r: { x, y, w: LW, h: LH }, sx: x + LW / 2, sy: y + LH / 2 }; KEYS.push(k);
  TX.pt['land_' + k] = A[(c + r) % 8] + ' ' + B[(c * 3 + r) % 8]; TX.es['land_' + k] = AE[(c + r) % 8] + ' ' + BE[(c * 3 + r) % 8];
  TX.pt['landDesc_' + k] = 'Terreno nas Terras do Poente: espaço livre para bairros, cidade e tecnologia.'; TX.es['landDesc_' + k] = 'Terreno en las Tierras del Poniente: espacio libre para barrios, ciudad y tecnología.'; }
// o fundo original não deve ver estes terrenos (ficam fora da sua área e só gastariam tempo)
if (typeof bgPaintAll === 'function') { const orig = bgPaintAll; window.bgPaintAll = function (g, lands, S, y0, th) { const hid = {}; for (const k of KEYS) { hid[k] = LANDS[k]; delete LANDS[k]; } try { return orig.call(this, g, lands, S, y0, th); } finally { Object.assign(LANDS, hid); } }; }
EXT.bounds = EXT.bounds || []; EXT.bounds.push(S => S && S.lvl >= LVL0 ? { x0: X0, x1: XMAX, y0: 0, y1: WH } : null);
// ---------- desenho do chão (antes de tudo o que é construído) ----------
let PAT = null;
function pats(g) { if (PAT) return PAT; const R = seeded(77), mk = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d')); return g.createPattern(c, 'repeat'); };
  const grass = mk(512, 512, q => { q.fillStyle = '#71c34c'; q.fillRect(0, 0, 512, 512); for (let i = 0; i < 40; i++) { const x = R() * 512, y = R() * 512, r = 40 + R() * 90, dk = R() < 0.45, gr = q.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, dk ? 'rgba(20,100,40,.06)' : 'rgba(215,255,150,.06)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); q.fillStyle = gr; q.fillRect(x - r, y - r, r * 2, r * 2); } q.lineCap = 'round'; for (let i = 0; i < 700; i++) { const x = R() * 512, y = R() * 512, h = 3 + R() * 5; q.strokeStyle = R() < 0.5 ? 'rgba(255,255,255,.16)' : 'rgba(25,85,20,.22)'; q.lineWidth = 1.5; q.beginPath(); q.moveTo(x, y); q.lineTo(x - 1.5, y - h); q.stroke(); } });
  const wild = mk(300, 300, q => { q.fillStyle = 'rgba(25,70,20,.42)'; q.fillRect(0, 0, 300, 300); for (let i = 0; i < 14; i++) bush(q, 20 + R() * 260, 25 + R() * 260, 0.8 + R() * 0.7, '#2f6f22', '#3f8f2e'); });
  return (PAT = { grass, wild }); }
const vis = r => r.x < CAM.x + innerWidth / CAM.z / 2 + 200 && r.x + r.w > CAM.x - innerWidth / CAM.z / 2 - 200 && r.y < CAM.y + innerHeight / CAM.z / 2 + 200 && r.y + r.h > CAM.y - innerHeight / CAM.z / 2 - 200;
EXT.draw0.unshift((g, S, T) => { if (!S || S.lvl < LVL0) return; const hw = innerWidth / CAM.z / 2, hh = innerHeight / CAM.z / 2; if (CAM.x - hw > X1 + 50) return; const P = pats(g);
  const vx0 = Math.max(X0, CAM.x - hw - 50), vx1 = Math.min(X1 + 30, CAM.x + hw + 50), vy0 = Math.max(0, CAM.y - hh - 50), vy1 = Math.min(WH, CAM.y + hh + 50); if (vx1 <= vx0) return;
  g.fillStyle = P.grass; g.fillRect(vx0, vy0, vx1 - vx0, vy1 - vy0);
  for (const k of KEYS) { const Ld = LANDS[k], r = Ld.r; if (!vis(r)) continue; if (!S.land[k]) { g.fillStyle = P.wild; rr(g, r.x, r.y, r.w, r.h, 26); g.fill(); g.setLineDash([10, 8]); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; rr(g, r.x, r.y, r.w, r.h, 26); g.stroke(); g.setLineDash([]); } else { g.strokeStyle = 'rgba(255,240,200,.35)'; g.lineWidth = 4; rr(g, r.x - 2, r.y - 2, r.w + 4, r.h + 4, 26); g.stroke(); } }
  // caminhos entre os terrenos e a estrada de chegada
  const road = (x, y, w, h) => { if (!vis({ x, y, w, h })) return; g.fillStyle = '#c9a66b'; g.fillRect(x, y, w, h); g.fillStyle = 'rgba(255,255,255,.18)'; if (w > h) g.fillRect(x, y + 3, w, 3); else g.fillRect(x + 3, y, 3, h); };
  for (let c = 0; c <= COLS; c++) road(X1 - c * CW + 2, 20, 36, WH - 40); for (let r = 0; r <= ROWS; r++) road(X0, 2 + r * RH, X1 - X0 + 40, 36);
  if (CAM.z > 0.25) for (let c = 0; c <= COLS; c++) for (let y = 120; y < WH - 60; y += 260) { const x = X1 - c * CW + 20; if (Math.abs(x - CAM.x) < hw + 60 && Math.abs(y - CAM.y) < hh + 60) { bush(g, x - 34, y, 0.9); bush(g, x + 38, y + 130, 0.9); } }
  if (vis({ x: X1 - 300, y: 900, w: 600, h: 400 })) { const x = X1 + 30, y = 1150; g.fillStyle = '#7a4b25'; g.fillRect(x - 120, y - 70, 8, 70); g.fillRect(x + 112, y - 70, 8, 70); g.fillStyle = '#a0683a'; rr(g, x - 140, y - 120, 280, 56, 10); g.fill(); g.fillStyle = '#fff'; g.font = '900 22px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('← ' + L('ponT'), x, y - 84); } });
// ---------- ir até lá ----------
const goPon = () => { const S = G.S; if (!S || S.lvl < LVL0) { toast(L('unlockAt', LVL0), 2500); return; } const k = KEYS.find(k => S.land[k]) || KEYS[0], r = LANDS[k].r; closeSheet(); CAM.z = 0.3; CAM.x = r.x + r.w / 2; CAM.y = r.y + r.h / 2; clampCam(); };
EXT.click.push(d => { if (d.pongo) { goPon(); return true; } return false; }); EXT.go.poniente = goPon;
const btnH = S => S.lvl >= LVL0 ? `<button class="btn" type="button" data-pongo="1" style="margin-bottom:8px;font-size:14px;background:#a0683a;color:#fff">🧭 ${L('ponGo', KEYS.filter(k => S.land[k]).length, KEYS.length)}</button>` : '';
{ const f0 = EXT.sheet.construir; if (typeof f0 === 'function') EXT.sheet.construir = (S, t, a) => { const h = f0(S, t, a); return btnH(S) + h; }; }
{ const f0 = EXT.sheet.equipo; if (typeof f0 === 'function') EXT.sheet.equipo = (S, t, a) => { const h = f0(S, t, a); return h + btnH(S); }; }
// ---------- textos ----------
Object.assign(TX.pt, { ponT: 'Terras do Poente', ponGo: (n, m) => `Ir às Terras do Poente (${n}/${m} terrenos)`, n_pon: 'Terras do Poente: 64 terrenos novos', n_ponD: 'O mapa cresceu muito para o oeste: 64 terrenos novos com caminhos e árvores, desde o nível 26. A Marta (equipe) e o Conselho compram sozinhos quando sobra dinheiro, e a Rosa e a Ada abrem bairros e parques tecnológicos lá.' });
Object.assign(TX.es, { ponT: 'Tierras del Poniente', ponGo: (n, m) => `Ir a las Tierras del Poniente (${n}/${m} terrenos)`, n_pon: 'Tierras del Poniente: 64 terrenos nuevos', n_ponD: 'El mapa creció mucho hacia el oeste: 64 terrenos nuevos con caminos y árboles, desde el nivel 26. Marta (equipo) y el Concejo los compran solos cuando sobra dinero, y Rosa y Ada abren barrios y parques tecnológicos ahí.' });
if (typeof NEWS === 'object' && Array.isArray(NEWS) && !NEWS.some(n => n[0] === 'n_pon')) NEWS.unshift(['n_pon', 'poniente']);
window.PON_KEYS = KEYS;
})();
