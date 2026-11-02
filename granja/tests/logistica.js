// v79: camiones de reparto, oficios nuevos, producción por hora, luces de noche. node tests/logistica.js [carpeta]
const { open, richFarm, simulate, openSheets, shot } = require('./lib'); const out = process.argv[2] || '/tmp';
(async () => { const { pg, errs, close } = await open(); await richFarm(pg, { inv: { trigo: 90, milho: 90, cana: 40, algodao: 40, cenoura: 40, pao: 60, pedra: 20, ferro: 6, madeira: 6, cafe: 9 } });
  const r = await pg.evaluate(() => { const now = Date.now(), out = {}; for (const k of ['racaoFab', 'usina', 'tecidos', 'cantera', 'serraria', 'torrefacao']) { const r = apply(G.S, { a: 'craft', b: k, r: 0 }, now); out['craft_' + k] = r.ok; } for (const k of Object.keys(G.S.bld)) for (const j of G.S.bld[k].q) { j.s = now - 1000; j.e = now - 1; }
    out.col = ['racaoFab', 'usina', 'tecidos', 'cantera', 'serraria', 'torrefacao'].map(k => { const r = act({ a: 'collect', b: k }); return r.ok; }); out.trucks = TRUCKS.length; out.prod = G.S.prod && G.S.prod.b; out.jobs = residents(G.S).slice(0, 40).map(id => jobOf(G.S, id)).filter(j => j && ['operario', 'mineiro', 'ferreiro', 'lenhador', 'barista', 'oleiro', 'tecelao', 'acucareiro'].includes(j[0])).length; return out; });
  console.log(JSON.stringify(r));
  const sim = await simulate(pg, 2); console.log('sim', JSON.stringify(sim));
  const sheets = await openSheets(pg, ['cv', 'city', 'helper']); console.log(JSON.stringify(sheets));
  const card = await pg.evaluate(() => { openSheet('cv'); const b = document.getElementById('sBody').innerText, i = b.indexOf('🏭'); closeSheet(); return b.slice(i, i + 200).replace(/\n+/g, ' | '); }); console.log('PROD>>', card);
  await pg.evaluate(() => { const now = Date.now(); for (let i = 0; i < 3; i++) TRUCKS.push({ x0: 620 + i * 100, y0: 6160, x1: BARN.x + 90, y1: BARN.y + 20, t: 0.02 * i, d: 60, k: ['acucar', 'tecido', 'racaoG'][i] }); }); await shot(pg, 700, 6000, 0.7, out + '/log-trucks.png');
  await pg.evaluate(() => { const r = Date.now; const off = (800 - (r() / 1000) % 960) * 1000; Date.now = () => r() + off; }); await shot(pg, 700, 6080, 0.75, out + '/log-night.png'); await shot(pg, -2250, 5500, 0.55, out + '/log-cantera.png');
  console.log('errors', errs.length, errs.slice(0, 5)); await close(); process.exit(errs.length ? 1 : 0); })();
