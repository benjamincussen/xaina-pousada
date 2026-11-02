// Prueba Playwright de granja/negocios.js
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = require('path').join(__dirname, '..'), OUT = process.argv[2] || '/tmp';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css' };
const srv = http.createServer((req, res) => { const u = req.url.split('?')[0], f = path.join(ROOT, u === '/' ? 'index.html' : u); fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d); }); });
(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const br = await chromium.launch(); const pg = await br.newPage({ viewport: { width: 900, height: 700 } });
  const errs = []; pg.on('pageerror', e => errs.push('pageerror: ' + e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await pg.goto(`http://127.0.0.1:${port}/index.html`);
  await pg.waitForFunction(() => typeof muApply === 'function' && typeof EXT !== 'undefined' && !!EXT.sheet.negocios, null, { timeout: 20000 });
  const R = {};
  // partida rica
  R.setup = await pg.evaluate(() => { const S = newFarm('Teste'); S.lvl = 20; S.coins = 50000; S.xp = 999999; for (const k of Object.keys(LANDS)) S.land[k] = 1; S.serv = S.serv || {}; S.serv.prefeitura = { c: Date.now() }; S.city = S.city || {}; S.daily = Math.floor((Date.now() - 3 * 3600000) / 86400000); S.annivN = 99; sane(S);
    for (let i = 0; i < 36; i++) S.homes.push({ st: i % 4, big: i % 3 === 0 }); S.cap = 1000; S.inv = { chocolate: 12, leite: 10, acucar: 10, trigo: 40, pao: 20, queijo: 20, bolo: 10, moveis: 5 }; sane(S);
    localStorage.setItem('sitio-farm-' + S.fid, JSON.stringify(S)); localStorage.setItem('sitio-farms', JSON.stringify([{ fid: S.fid, name: S.name, own: 1 }])); localStorage.setItem('sitio-news', NEWS_ID); ME.name = 'Test'; startFarm(S.fid); closeSheet();
    const r = archRects(G.S); return { fid: S.fid, rects: r.length, ng: Object.keys(G.S.ng) }; });
  // chequeo de colisiones de las posiciones elegidas con archRects (40 px de margen)
  R.collide = await pg.evaluate(() => { const S = G.S, T = Date.now(), sv = JSON.stringify(S.serv), ct = JSON.stringify(S.city); for (const k of Object.keys(SERV)) S.serv[k] = { c: T }; for (const k of Object.keys(PROJ)) S.city[k] = { e: T - 1 }; const rs = archRects(S); S.serv = JSON.parse(sv); S.city = JSON.parse(ct); const NGP = ngDef, out = {};
    for (const [k, B] of Object.entries(NGP)) { const r = { x: B.x - B.w / 2 - 40, y: B.y - B.h - 80, w: B.w + 80, h: B.h + 120 }; out[k] = rs.filter(q => q.x < r.x + r.w && q.x + q.w > r.x && q.y < r.y + r.h && q.y + q.h > r.y).map(q => [q.x, q.y, q.w, q.h]); } return out; });
  // construir los 4 por act()
  R.build = await pg.evaluate(() => { const c0 = G.S.coins, out = {}; for (const k of ['banco', 'mercado', 'oficios', 'choc']) { const r = act({ a: 'ngBuild', k }); out[k] = r.ok ? 'ok' : r.msg; } out.spent = c0 - G.S.coins; out.again = act({ a: 'ngBuild', k: 'banco' }).ok; return out; });
  // producir un bombom: ngMake, avanzar el reloj, ngCollect
  R.choc = await pg.evaluate(async () => { const out = {}; const r1 = act({ a: 'ngMake' }); out.make = r1.ok ? 'ok' : r1.msg; out.q = JSON.parse(JSON.stringify(G.S.ng.choc.q)); out.inv = { chocolate: G.S.inv.chocolate, leite: G.S.inv.leite, acucar: G.S.inv.acucar };
    const early = act({ a: 'ngCollect' }); out.early = early.ok ? 'ok?!' : early.msg; G.S.ng.choc.q[0].e = Date.now() - 1; G.S.ng.choc.q[0].s = Date.now() - 151000; const r2 = act({ a: 'ngCollect' }); out.collect = r2.ok ? 'ok' : r2.msg; out.bombom = G.S.inv.bombom; out.price = sellPrice('bombom'); out.name = N('bombom'); const sl = act({ a: 'sell', k: 'bombom', q: 1 }); out.sell = sl.ok ? 'ok' : sl.msg; out.jobs = jobsInfo(G.S); return out; });
  // Concejo: opciones de comercio con un negocio sin construir + 3 h simuladas
  R.cv = await pg.evaluate(() => { const S = G.S, T = Date.now(); const out = {};
    S.ng.oficios.b = 0; cvTick(S, T); S.blv = {}; for (const k of Object.keys(BUILD)) S.blv[k] = 2; mineOf(S).lv = 5; for (const k of Object.keys(S.ng)) S.ng[k].at = T - 3 * 3600000; out.opts = cvOpts(S, T, 'comercio').map(o => [o[0].a, o[0].k, o[1]]);
    for (const k of Object.keys(SERV)) if (!S.serv[k]) S.serv[k] = { c: T }; // sin servicios pendientes, Comercio llega a los negocios
    S.cv.t = 100000; S.cv.w = null; cvWal(S); // tesoro grande para que gaste
    const c0 = S.coins, l0 = S.cv.log.length; S.cv.at = T - 3 * 3600000; S.cv.t += 60000; S.cv.w = null; cvWal(S); const t0 = performance.now(); cvTick(S, T); out.ms = Math.round(performance.now() - t0);
    out.ng = JSON.parse(JSON.stringify(S.ng)); out.flowIn = S.cv.flow && S.cv.flow.in; out.prevIn = S.cv.prev && S.cv.prev.in; out.coinsGain = S.coins - c0; out.tot = Object.fromEntries(Object.entries(S.cv.tot).filter(([k]) => k.slice(0, 2) === 'ng')); out.logNg = S.cv.log.filter(e => e[2].slice(0, 2) === 'ng').slice(0, 8).map(e => [e[1], e[2], e[3], e[4], cvPhrase(e)]); out.speech = cvSpeech(S, 0); out.treasure = Math.round(S.cv.t); out.bombom = S.inv.bombom; return out; });
  // hojas
  R.sheets = await pg.evaluate(async () => { const out = {}; for (const t of ['negocios', 'cv', 'barn']) { openSheet(t); $('sBody').dataset.sig = ''; renderSheet(); out[t] = $('sBody').innerHTML.length; } openSheet('negocios', 'choc'); $('sBody').dataset.sig = ''; renderSheet(); out.chocCard = /Produzir|Producir/.test($('sBody').innerHTML); return out; });
  await pg.waitForTimeout(2500); await pg.evaluate(() => { G.cvAwayOpen = 0; nightF = () => 0; closeSheet(); openSheet('negocios'); $('sBody').dataset.sig = ''; renderSheet(); }); await pg.waitForTimeout(300); await pg.screenshot({ path: OUT + '/neg-hoja.png' }); await pg.evaluate(() => { document.querySelector('[data-ngmake]').scrollIntoView({ block: 'center' }); }); await pg.waitForTimeout(300); await pg.screenshot({ path: OUT + '/neg-hoja-choc.png' });
  await pg.evaluate(() => { closeSheet(); openSheet('cv'); }); await pg.waitForTimeout(300); await pg.screenshot({ path: OUT + '/neg-cv.png' });
  // mapa: Ciudad Nueva (franja de abajo) y Campos del Oeste
  await pg.evaluate(() => { G.cvAwayOpen = 0; closeSheet(); CAM.z = 0.85; CAM.x = -950; CAM.y = 3250; clampCam(); }); await pg.waitForTimeout(600); await pg.screenshot({ path: OUT + '/neg-mapa-cidade.png' });
  await pg.evaluate(() => { act({ a: 'ngMake' }); CAM.z = 1.1; CAM.x = -1040; CAM.y = 900; clampCam(); }); await pg.waitForTimeout(600); await pg.screenshot({ path: OUT + '/neg-mapa-choc.png' });
  // sin construir: cartel de venta
  await pg.evaluate(() => { G.S.ng.banco.b = 0; G.S.ng.mercado.b = 0; CAM.z = 0.85; CAM.x = -950; CAM.y = 3250; clampCam(); }); await pg.waitForTimeout(400); await pg.screenshot({ path: OUT + '/neg-mapa-venda.png' }); await pg.evaluate(() => { G.S.ng.banco.b = 1; G.S.ng.mercado.b = 1; });
  // toque en el mapa sobre el banco abre la hoja
  R.tap = await pg.evaluate(() => { closeSheet(); const S = G.S; let got = null; for (const h of EXT.tap) if (h({ x: ngDef.banco.x, y: ngDef.banco.y - 40 }, S)) { got = SH && SH.type + ':' + SH.arg; break; } closeSheet(); return got; });
  // botón flotante visible
  R.btn = await pg.evaluate(async () => { closeSheet(); await new Promise(r => setTimeout(r, 3000)); closeSheet(); await new Promise(r => setTimeout(r, 1200)); const b = document.getElementById('bNeg'); return { neg: b && getComputedStyle(b).display !== 'none' ? 'visible' : 'hidden', mundo: getComputedStyle(document.getElementById('bMundo')).display, hud: $('hud').hidden, SH: !!SH, lvl: G.S.lvl }; });
  // español
  R.es = await pg.evaluate(() => { LANG = 'es'; openSheet('negocios'); $('sBody').dataset.sig = ''; renderSheet(); const h = $('sBody').innerHTML, bn = N('bombom'); LANG = 'pt'; closeSheet(); return { escuela: /Escuela de Oficios/.test(h), bombon: bn }; });
  R.errors = errs.slice(0, 5); R.nErrors = errs.length; console.log(JSON.stringify(R, null, 1)); await br.close(); srv.close();
})().catch(e => { console.error('FALLO', e); process.exit(1); });
