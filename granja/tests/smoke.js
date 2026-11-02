// Prueba general: partida rica, 3 h simuladas, hojas principales, fábricas nuevas, capturas. node tests/smoke.js [carpeta_capturas]
const { open, richFarm, simulate, openSheets, shot } = require('./lib'); const out = process.argv[2] || '/tmp';
(async () => { const { pg, errs, close } = await open(); await richFarm(pg);
  const sim = await simulate(pg, 3); console.log('sim', JSON.stringify(sim));
  const bld = await pg.evaluate(() => Object.keys(BUILD).filter(k => !BUILD[k].base).map(k => [k, apply(G.S, { a: 'craft', b: k, r: 0 }, Date.now()).ok ? 'ok' : 'x'])); console.log('craft', JSON.stringify(bld));
  const sheets = await openSheets(pg, ['cv', 'map', 'city', 'shop', 'menu', 'helper', 'barn', 'orders', 'goals', 'mundo', 'arch', 'seeds', 'decor', ['land', 'bairroSul'], ['bld', 'serraria'], ['bld', 'cantera']]); console.log('sheets', JSON.stringify(sheets));
  await shot(pg, 740, 5300, 0.6, out + '/smoke-sul.png'); await shot(pg, -2250, 5600, 0.55, out + '/smoke-cantera.png');
  console.log('errors', errs.length, errs.slice(0, 5)); await close(); process.exit(errs.length ? 1 : 0); })();
