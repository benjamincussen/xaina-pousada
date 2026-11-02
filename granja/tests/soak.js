// Soak: ciudad al máximo, 8 h simuladas, tamaño del guardado y tiempos. node tests/soak.js
const { open, richFarm, simulate } = require('./lib');
(async () => { const { pg, errs, close } = await open(); await richFarm(pg, { homes: 82, coins: 500000 });
  await pg.evaluate(() => { const S = G.S; S.helper.on = 1; S.helper.until = Date.now() + 3600000; while (act({ a: 'hire' }, true).ok); S.arch.on = 1; S.arch.budget = 2000; S.homes.forEach(h => { h.big = 1; h.apt = 1; h.tw = 1; }); });
  const sim = await simulate(pg, 8, 500000); console.log('sim', JSON.stringify(sim));
  const r = await pg.evaluate(() => { const j = JSON.stringify(G.S); const parts = Object.entries(G.S).map(([k, v]) => [k, JSON.stringify(v).length]).sort((a, b) => b[1] - a[1]).slice(0, 6); syncNpcs(G.S); const ds = []; CAM.x = 740; CAM.y = 2050; CAM.z = 0.8; for (let i = 0; i < 30; i++) { const a = performance.now(); draw(i * 0.016, 0.016); ds.push(performance.now() - a); } ds.sort((a, b) => a - b); return { bytes: j.length, parts, res: residents(G.S).length, npcs: NPCS.list.length, cvLog: G.S.cv.log.length, helperLog: (G.S.helper.log || []).length, frameMed: +ds[15].toFixed(1) }; });
  console.log(JSON.stringify(r)); console.log('errors', errs.length, errs.slice(0, 5)); await close(); process.exit(errs.length || r.bytes > 400000 ? 1 : 0); })();
