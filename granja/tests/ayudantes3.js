// v86: oficio Industria, 24 ayudantes, Lúcia en el Barrio Sur. node tests/ayudantes3.js [carpeta]
const { open, richFarm, simulate, openSheets, shot } = require('./lib'); const out = process.argv[2] || '/tmp';
(async () => { const { pg, errs, close } = await open(); await richFarm(pg, { homes: 44, coins: 400000, inv: { trigo: 90, milho: 90, cana: 40, algodao: 40, cenoura: 40, pao: 60, pedra: 20, ferro: 6, madeira: 6, cafe: 9 } });
  const r = await pg.evaluate(() => { const S = G.S, now = Date.now(), o = {}; S.helper.on = 1; S.helper.until = now + 3600000; let hired = 0; while (act({ a: 'hire' }, true).ok) hired++; o.helpers = hCount(S); o.roles = Array.from({ length: hCount(S) }, (_, h) => roleOf(S, h)); o.nInd = o.roles.filter(r => r === 'industria').length;
    const r1 = helperTask(S, now, 'industria', 0); o.task1 = r1 && r1.ok; o.q = Object.fromEntries(['racaoFab', 'usina', 'cantera', 'serraria', 'ferraria'].map(k => [k, S.bld[k].q.length])); let n = 0; for (let i = 0; i < 12; i++) { const r = helperTask(S, now, 'industria', 0); if (r && r.ok) n++; } o.tasks = n; o.q2 = Object.fromEntries(['racaoFab', 'usina', 'cantera', 'serraria', 'ferraria'].map(k => [k, S.bld[k].q.length]));
    S.arch.on = 1; S.land.bairroSul = 1; const ideas = archIdeas(S, now).map(c => c.sig); o.archSul = ideas.filter(x => /sul/.test(x)); return o; });
  console.log(JSON.stringify(r));
  const sheets = await openSheets(pg, ['helper', 'arch']); console.log(JSON.stringify(sheets));
  await shot(pg, 300, 350, 0.9, out + '/help3.png');
  console.log('errors', errs.length, errs.slice(0, 5)); await close(); process.exit(errs.length || r.helpers < 24 || !r.task1 ? 1 : 0); })();
