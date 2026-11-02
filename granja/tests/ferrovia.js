// v93: ferrocarril de carga. node tests/ferrovia.js [carpeta]
const { open, richFarm, openSheets, shot } = require('./lib'); const out = process.argv[2] || '/tmp';
(async () => { const { pg, errs, close } = await open(); await richFarm(pg, { coins: 100000 });
  const r = await pg.evaluate(() => { const S = G.S, now = Date.now(), o = {}; delete S.serv.ferrovia; o.buy = act({ a: 'serv', k: 'ferrovia' }).ok; o.len = Math.round(railLen()); o.p0 = railPos(0).map(Math.round); o.p1 = railPos(1).map(Math.round); o.pm = railPos(0.5).map(Math.round);
    S.railUntil = now + 900000; const n = expN(now), ord = expOrder(S, n, 0); if (ord) { for (const [k, q] of ord.it) S.inv[k] = (S.inv[k] || 0) + q; const c0 = S.coins; const r = act({ a: 'export', j: 0 }); o.exp = r.ok; o.paid = S.coins - c0; o.base = ord.c; o.bonus = r.ok && S.coins - c0 === Math.round(ord.c * 1.2); } return o; });
  console.log(JSON.stringify(r)); const sheets = await openSheets(pg, ['city', 'map']); console.log(JSON.stringify(sheets));
  await pg.evaluate(() => { const r0 = Date.now; const t = (r0() / 1000) % RAIL_PER; Date.now = () => r0() + (20 - t) * 1000; }); await shot(pg, 1560, 4400, 0.7, out + '/rail-bridge.png'); await shot(pg, 1400, 6000, 0.8, out + '/rail-station.png');
  console.log('errors', errs.length, errs.slice(0, 4)); await close(); process.exit(errs.length || !r.buy || !r.bonus ? 1 : 0); })();
