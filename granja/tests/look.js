const { chromium } = require('playwright');
module.exports = async function setup(extra) {
  const b = await chromium.launch(); const c = await b.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 }); const A = await c.newPage(); const errs = [];
  A.on('pageerror', e => errs.push(e.message)); A.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  await A.goto('http://127.0.0.1:8767/granja/index.html'); await A.waitForTimeout(400);
  await A.evaluate((extra) => { const n = Date.now();
    const S = Object.assign({ v: 1, fid: 'lk1', rev: 5, name: '', owner: 'Ana Luyza', coins: 99000, xp: 9000, lvl: 18, cap: 400, capv2: 1, np: 12, plots: Array.from({ length: 12 }, () => ({ c: null, p: 0 })), inv: { trigo: 10, picole: 6 }, bld: { moinho: { q: [] } }, pens: { galinheiro: { a: [0, 0, 0] } }, orders: [], oid: 10, land: { leste: 1, sul: 1, colina: 1, vila: 1, bairro: 1, escolar: 1, praia: 1 }, serv: { praca: 1, posto: 1, colegio: 1, parque: 1, prefeitura: 1, campo: 1 }, homes: Array.from({ length: 12 }, (_, i) => ({ c: n - 9e6, st: i })), babies: 4, babyHome: [0, 1, 2, 3], roads: [], trees: [n], hives: [n], boat: { e: 0 }, city: {}, done: 20, helper: { on: 0 } }, extra || {});
    localStorage.setItem('sitio-farm-lk1', JSON.stringify(S)); localStorage.setItem('sitio-index', JSON.stringify([{ fid: 'lk1', name: '', lvl: 18, rev: 5, own: false, owner: 'Ana Luyza', last: n }])); localStorage.setItem('sitio-name', 'Benjamin'); localStorage.setItem('sitio-lang', (extra && extra._lang) || 'es'); }, extra);
  await A.reload(); await A.waitForTimeout(500); await A.click('[data-play="lk1"]'); await A.waitForTimeout(1500);
  await A.evaluate(() => closeSheet()); await A.waitForTimeout(2500); await A.evaluate(() => { if (SH) closeSheet(); });
  return { b, A, errs, shot: async (x, y, z, f) => { await A.evaluate(([x, y, z]) => { CAM.z = z; CAM.x = x; CAM.y = y; clampCam(); }, [x, y, z]); await A.waitForTimeout(400); await A.screenshot({ path: __dirname + '/' + f }); } };
};
