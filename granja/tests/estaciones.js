// v90: estaciones y riego. node tests/estaciones.js
const { open, richFarm, openSheets } = require('./lib');
(async () => { const { pg, errs, close } = await open(); await richFarm(pg);
  const r = await pg.evaluate(() => { const S = G.S, now = Date.now(), o = {}; S.plots[0] = { c: null, p: 0 }; S.plots[1] = { c: null, p: 0 }; o.p1 = act({ a: 'plant', i: 0, c: 'trigo' }).ok; const shift0 = now - S.plots[0].p; o.irr = act({ a: 'irrig' }).ok; o.irr2 = act({ a: 'irrig' }).ok; o.p2 = act({ a: 'plant', i: 1, c: 'trigo' }).ok; const shift1 = Date.now() - S.plots[1].p; o.fasterWithIrrig = shift1 > shift0 + 1000; o.season = season(now); o.agroOpts = cvOpts(S, now, 'agro').map(x => x[0].a); return o; });
  console.log(JSON.stringify(r)); const sheets = await openSheets(pg, ['shop', 'seeds']); console.log(JSON.stringify(sheets)); console.log('errors', errs.length, errs.slice(0, 3)); await close(); process.exit(errs.length || !r.irr || r.irr2 || !r.fasterWithIrrig ? 1 : 0); })();
