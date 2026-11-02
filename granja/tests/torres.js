// v84: torres, población, cap de caminantes. node tests/torres.js [carpeta]
const { open, richFarm, simulate, openSheets, shot } = require('./lib'); const out = process.argv[2] || '/tmp';
(async () => { const { pg, errs, close } = await open(); await richFarm(pg, { homes: 40, coins: 200000 });
  const r = await pg.evaluate(() => { const S = G.S, now = Date.now(), o = {}; S.homes.forEach(h => { h.big = 1; h.apt = 1; }); o.res0 = residents(S).length; o.t1 = act({ a: 'homeTower', i: 0 }).ok; o.t2 = act({ a: 'homeTower', i: 0 }).ok; o.res1 = residents(S).length; o.names = [resName(2000), resName(2007), resHome(2007), resHome(2000 + 8 * 5 + 3)]; o.rent = homeRent(S, 0, now + 400000) / homeRent(S, 1, now + 400000); syncNpcs(S); o.npcs = NPCS.list ? NPCS.list.length : (NPCS.all || NPCS.n || []).length; o.opts = cvOpts(S, now, 'obras').map(x => x[0].a); return o; });
  console.log(JSON.stringify(r));
  const sim = await simulate(pg, 3, 200000); console.log('sim', JSON.stringify(sim));
  const r2 = await pg.evaluate(() => ({ towers: G.S.homes.filter(h => h && h.tw).length, res: residents(G.S).length, pill: document.getElementById('hTreasD').textContent }));
  console.log(JSON.stringify(r2));
  const sheets = await openSheets(pg, [['homes', 0], 'goals', 'city', 'cv']); console.log(JSON.stringify(sheets));
  await shot(pg, 740, 2050, 0.7, out + '/torres-bairro.png');
  console.log('errors', errs.length, errs.slice(0, 5)); await close(); process.exit(errs.length || !r.t1 || r.t2 ? 1 : 0); })();
