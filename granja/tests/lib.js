// Base de las pruebas Playwright de la granja: sirve granja/ por http y abre el juego.
// Uso: const { open } = require('./lib'); const { pg, close, errs } = await open(); ... await close();
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), pathm = require('path');
const ROOT = pathm.join(__dirname, '..');
async function open(opts = {}) {
  const srv = http.createServer((q, r) => { const p = pathm.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html')); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': p.endsWith('.js') ? 'text/javascript' : p.endsWith('.json') ? 'application/json' : 'text/html' }); r.end(d); }); });
  await new Promise(res => srv.listen(0, res)); const port = srv.address().port;
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: opts.w || 1000, height: opts.h || 700 } }); const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 240)); });
  await pg.goto(`http://localhost:${port}/index.html`); await pg.waitForFunction(() => typeof newFarm === 'function' && typeof muApply === 'function', null, { timeout: 30000 });
  return { pg, errs, close: async () => { await br.close(); srv.close(); } };
}
// Crea en la página una partida rica (nivel 20, todo comprado salvo `skipLands`) y la abre. Devuelve lo que retorne `extra` (función serializada que corre en la página).
async function richFarm(pg, { skipLands = [], coins = 100000, homes = 30, inv = null } = {}) {
  return pg.evaluate(([skipLands, coins, homes, inv]) => { const now = Date.now(), S = newFarm('Teste'); S.lvl = 20; S.xp = 99999; S.coins = coins; S.np = 84; S.cap = 600; for (const k of Object.keys(LANDS)) if (!skipLands.includes(k)) S.land[k] = 1; S.serv = {}; for (const k of Object.keys(SERV)) S.serv[k] = { c: now }; S.city = {}; for (const k of Object.keys(PROJ)) S.city[k] = { c: now, e: 0 }; S.homes = Array.from({ length: homes }, (_, i) => ({ c: now, st: i % 6 }));
    S.inv = inv || { trigo: 60, milho: 60, pao: 40, queijo: 30, leite: 40, ovo: 40, cenoura: 40, cana: 30, algodao: 30, pedra: 30 }; sane(S); localStorage.setItem('sitio-farm-' + S.fid, JSON.stringify(S)); localStorage.setItem('sitio-farms', JSON.stringify([{ fid: S.fid, name: 'Teste', own: 1 }])); localStorage.setItem('sitio-news', NEWS_ID); localStorage.setItem('sitio-snap-' + S.fid, JSON.stringify(snapOf(S))); ME.name = 'Benja'; startFarm(S.fid); closeSheet(); return S.fid; }, [skipLands, coins, homes, inv]);
}
// Simula `hours` horas del Concejo (y de las extensiones) en la página.
async function simulate(pg, hours = 3, treasury = 60000) {
  return pg.evaluate(([hours, treasury]) => { const T0 = Date.now(); cvTick(G.S, T0); G.S.cv.at = T0 - hours * 3600000; G.S.cv.t += treasury; cvWal(G.S); for (const r of CV_ROLES) G.S.cv.w[r] += treasury / 5; cvSum(G.S); const t1 = performance.now(); cvTick(G.S, T0); const C = G.S.cv, kinds = {}; for (const e of C.log) kinds[e[2]] = (kinds[e[2]] || 0) + 1; return { ms: Math.round(performance.now() - t1), decisions: C.seq, kinds, treas: Math.round(C.t), homes: G.S.homes.length, coins: G.S.coins }; }, [hours, treasury]);
}
// Abre hojas y devuelve errores de apertura.
async function openSheets(pg, types) {
  return pg.evaluate(types => { const out = []; for (const t of types) { const [ty, arg] = Array.isArray(t) ? t : [t]; try { closeSheet(); openSheet(ty, arg); out.push(ty + (arg ? '/' + arg : '') + ':ok'); } catch (e) { out.push(ty + ':' + e.message); } } closeSheet(); return out; }, types);
}
async function shot(pg, x, y, z, file) { await pg.evaluate(([x, y, z]) => { closeSheet(); CAM.x = x; CAM.y = y; CAM.z = z; }, [x, y, z]); await pg.waitForTimeout(700); await pg.evaluate(() => closeSheet()); await pg.waitForTimeout(200); await pg.screenshot({ path: file }); }
module.exports = { open, richFarm, simulate, openSheets, shot };
