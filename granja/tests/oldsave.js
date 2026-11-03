const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 }); const A = await c.newPage(); const errs = [];
  A.on('pageerror', e => errs.push(e.message)); A.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  await A.goto('http://127.0.0.1:8767/granja/index.html'); await A.waitForTimeout(400);
  await A.evaluate(() => { const n = Date.now(); const S = { v: 1, fid: 'old1', rev: 3, name: 'Velha', coins: 120, xp: 40, lvl: 3, cap: 50, np: 6, plots: Array.from({ length: 12 }, () => ({ c: null, p: 0 })), inv: { trigo: 4, ovo: 2 }, bld: { moinho: { q: [] }, padaria: { q: [] }, queijaria: { q: [] } }, pens: { galinheiro: { a: [0, 0, 0] }, estabulo: { a: [0, 0] } }, orders: [], oid: 1 };
    localStorage.setItem('sitio-farm-old1', JSON.stringify(S)); localStorage.setItem('sitio-index', JSON.stringify([{ fid: 'old1', name: 'Velha', lvl: 3, rev: 3, own: true, last: n }])); localStorage.setItem('sitio-name', 'Benjamin'); localStorage.setItem('sitio-lang', 'es'); });
  await A.reload(); await A.waitForTimeout(500); await A.click('[data-play="old1"]'); await A.waitForTimeout(4000);
  for (const t of ['shop', 'menu', 'city', 'helper', 'orders', 'album', 'medals', 'goals', 'map', 'news']) { await A.evaluate(t => openSheet(t), t); await A.waitForTimeout(150); }
  await A.evaluate(() => { closeSheet(); CAM.z = zMin(); CAM.x = WW / 2; CAM.y = WH / 2; clampCam(); }); await A.waitForTimeout(800);
  console.log('state', await A.evaluate(() => [G.S.plots.length, G.S.cap, albumN(G.S), typeof G.S.decor, G.S.lvl]));
  await A.evaluate(() => openSheet('album')); await A.waitForTimeout(200); await A.screenshot({ path: __dirname + '/old_album.png' });
  console.log('errors', errs); await b.close();
})();
