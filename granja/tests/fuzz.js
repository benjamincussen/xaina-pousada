(async () => { const n = Date.now(); const all = { leste: 1, sul: 1, colina: 1, vila: 1, bairro: 1, escolar: 1, praia: 1, lavoura: 1, cidade: 1, centro: 1, vale: 1, oeste: 1, curral: 1, aero: 1, porto2: 1, diversao: 1, ferias: 1, serra: 1 };
  const lang = process.argv[2] || 'es';
  const { b, A, errs } = await require('./look.js')({ _lang: lang, land: all, lvl: 22, xp: 60000, coins: 500000, cap: 3000, homes: Array.from({ length: 40 }, (_, i) => ({ c: n - 9e6, st: i })), city: { eolico: { s: n - 9e6, e: n - 8e6, c: n - 8e6 }, torre: { s: n - 9e6, e: n + 8e6, c: n } }, serv: { praca: 1, posto: 1, colegio: 1, prefeitura: 1, shopping: 1 },
    inv: { trigo: 100, milho: 100, pao: 30, queijo: 20, ovo: 30, leite: 30, suco: 20, bolo: 10 }, helper: { on: 1, until: n + 3600000, n: 8, ps: [] } });
  await A.evaluate(l => { LANG = l; }, lang).catch(() => {});
  const types = ['mundo','urbe','cv','album','anniv','arch','away','barn','bday','bike','city','daily','decor','evalbum','exped','export','fair','farol','fish','ft','goals','golf','helper','homes','land','lvl','mail','map','masc','medals','menu','news','orders','race','req','rush','seeds','shop','tiro'];
  const bad = [];
  for (const t of types) { const e0 = errs.length; await A.evaluate(t => { try { openSheet(t, t === 'seeds' ? 0 : t === 'land' ? 'vale' : undefined); } catch (e) { window._fz = (window._fz || []).concat(t + ': ' + e.message); } }, t); await A.waitForTimeout(150); await A.evaluate(() => { if (SH) closeSheet(); }); if (errs.length > e0) bad.push(t); }
  console.log('sheet errs', bad, await A.evaluate(() => window._fz || []));
  // random taps across world
  const e1 = errs.length; let sheets = {};
  for (let i = 0; i < 400; i++) { const r = await A.evaluate(([x, y]) => { CAM.z = 0.9; CAM.x = x; CAM.y = y; clampCam(); return [innerWidth, innerHeight]; }, [-2900 + Math.random() * 5800, 100 + Math.random() * 4700]);
    await A.mouse.click(20 + Math.random() * (r[0] - 40), 120 + Math.random() * (r[1] - 260)); await A.waitForTimeout(60);
    const st = await A.evaluate(() => SH && SH.type); if (st) { sheets[st] = (sheets[st] || 0) + 1; const btn = await A.$('#sBody button:not([disabled])'); if (btn && Math.random() < 0.5) { await btn.click().catch(() => {}); await A.waitForTimeout(60); } await A.evaluate(() => { if (SH) closeSheet(); }); } }
  console.log('tap errs', errs.length - e1, errs.slice(e1, e1 + 5), JSON.stringify(sheets));
  await b.close(); })();
