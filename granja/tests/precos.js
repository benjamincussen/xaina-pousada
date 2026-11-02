// v81: precios del día. node tests/precos.js [carpeta]
const { open, richFarm, simulate, openSheets, shot } = require('./lib'); const out = process.argv[2] || '/tmp';
(async () => { const { pg, errs, close } = await open(); await richFarm(pg);
  const r = await pg.evaluate(() => { const ms = Date.now(), ks = Object.keys(ITEMS).slice(0, 12); const mult = ks.map(k => +priceMult(G.S, k, ms).toFixed(2)); const d1 = priceMult(G.S, 'trigo', ms), d2 = priceMult(G.S, 'trigo', ms + 3600000); const p0 = sellPrice('trigo'); const r = act({ a: 'sell', k: 'trigo', q: 5 }); return { mult, min: Math.min(...mult), max: Math.max(...mult), changesNextHour: d1 !== d2, sellOk: r.ok, price: p0, fx: r.fx.map(f => f[0]) }; });
  console.log(JSON.stringify(r));
  const sheets = await openSheets(pg, ['precos', 'barn', 'cv']); console.log(JSON.stringify(sheets));
  const txt = await pg.evaluate(() => { openSheet('precos'); const t = document.getElementById('sBody').innerText.slice(0, 260).replace(/\n+/g, ' | '); closeSheet(); return t; }); console.log('PRECOS>>', txt);
  const sim = await simulate(pg, 1); console.log('sim', JSON.stringify(sim));
  await pg.evaluate(() => { openSheet('precos'); }); await pg.waitForTimeout(300); await pg.screenshot({ path: out + '/precos-sheet.png' });
  await shot(pg, 400, 880, 1.1, out + '/precos-board.png');
  const tap = await pg.evaluate(() => { closeSheet(); const r = { before: !!SH }; try { onTap && 0; } catch (e) {} return r; });
  console.log('errors', errs.length, errs.slice(0, 5)); await close(); process.exit(errs.length || r.min < 0.8 || r.max > 1.5 ? 1 : 0); })();
