// ¿Crece sola la ciudad sin que el jugador haga nada? Cuenta de nivel 21 (pocas cosas) y de nivel 104 (rica, 255K).
(async () => { const which = process.argv[2] || 'both', MIN = +(process.argv[3] || 30); const out = {};
  for (const pre of (which === 'both' ? ['low', 'high'] : [which])) {
    const base = pre === 'low' ? { lvl: 21, coins: 30000 } : { lvl: 104, coins: 255000, land: { leste: 1, sul: 1, colina: 1, vila: 1, bairro: 1, escolar: 1, praia: 1, lavoura: 1, cidade: 1, centro: 1, porto2: 1, oeste: 1, curral: 1, vale: 1, aero: 1, livre1: 1, livre2: 1 }, serv: { praca: 1, prefeitura: 1 } };
    const { b, A, errs } = await require('./look.js')(base);
    const r = await A.evaluate(async ([pre, MIN]) => { const S = G.S; if (pre === 'high') { const r1 = LANDS.livre1.r; for (let j = 0; j < 12; j++) act({ a: 'ciZone', k: 'rrci'[j % 4], x: r1.x + 200 + (j % 6) * 140, y: r1.y + 400 + Math.floor(j / 6) * 160 }); }
      const reg = k => /^(pon|nor|sur)\d/.test(k);
      const snap = () => ({ coins: Math.round(S.coins), team: S.eq ? Math.round(Object.values(S.eq.bw || {}).reduce((a, v) => a + v, 0) + (S.eq.tw || 0) + (S.eq.wal || 0)) : 0, land: Object.keys(S.land).filter(k => S.land[k]).length, regL: Object.keys(S.land).filter(k => S.land[k] && reg(k)).length, z: S.ci ? S.ci.z.length : 0, zb: S.ci ? S.ci.z.filter(t => t.lv).length : 0, p: S.ci ? S.ci.p.length : 0, cb: (S.cb || []).length, ag: S.ag ? S.ag.b.length : 0, apr: S.ci ? Math.round(S.ci.ap || 0) : null });
      const s0 = snap(); const D = Date.now; window._o = 0; Date.now = () => D() + window._o; const w = ms => new Promise(f => setTimeout(f, ms));
      for (let m = 0; m < MIN; m++) { if (pre === 'low') S.coins += 1500; window._o += 60000; await w(1100); } return { s0, s1: snap(), n: S.eq && S.eq.n, log: S.eq ? S.eq.log.slice(-12).map(l => l[1] + ':' + l[2]) : [] }; }, [pre, MIN]);
    out[pre] = r; console.log(pre, JSON.stringify(r)); console.log('errs', errs.length, errs.slice(0, 2)); await b.close(); } })();
