(async () => { const n = Date.now(); const all = { leste: 1, sul: 1, colina: 1, vila: 1, bairro: 1, escolar: 1, praia: 1, lavoura: 1, cidade: 1, centro: 1, porto2: 1, oeste: 1, curral: 1, vale: 1, aero: 1, diversao: 1, serra: 1, ferias: 1 };
  const { b, A, errs, shot } = await require('./look.js')({ land: all, lvl: 26, coins: 900000, homes: Array.from({ length: 40 }, (_, i) => ({ c: n - 9e6, st: i, big: 1 })), city: { cargo: { s: n - 9e6, e: n - 8e6, c: n } }, serv: { praca: 1, posto: 1, prefeitura: 1 } });
  await A.evaluate(() => { const D = Date.now; let o = 0; while (nightF(D() + o) > 0) o += 20000; window._o = o; Date.now = () => D() + window._o; if (SH) closeSheet(); });
  console.log('tres', await A.evaluate(() => { const S = G.S, out = []; for (let i = 0; i < 6; i++) { const c0 = S.coins; const r = act({ a: 'muTres', i }); out.push([r.ok, S.coins - c0, JSON.stringify(S.mu.tres[i].rw)]); } const again = act({ a: 'muTres', i: 0 }); return JSON.stringify([out, again.ok, again.msg, S.mu.relics || 0, JSON.stringify(S.min || {})]); }));
  console.log('ring', await A.evaluate(() => { const S = G.S; let k = 0; while (act({ a: 'muExplore' }).ok) k++; return [k, S.mu.disc, JSON.stringify(worldB())]; }));
  // visuals: treasure island ready & looted, expedition ship mid-way, far ring city
  await A.evaluate(() => { const S = G.S; delete S.mu.tres[1]; S.mu.texp = { i: 2, t: Date.now() - 15000 }; });
  await shot(3900 + 0.25 * 9400, 520 + 0.36 * (await A.evaluate(() => WH) - 1100), 0.45, 't_ready.png');
  await shot(3900 + 0.52 * 9400, 520 + 0.30 * (await A.evaluate(() => WH) - 1100), 0.45, 't_looted.png');
  await shot(3900 + 1.40 * 9400, 520 + 0.46 * (await A.evaluate(() => WH) - 1100), 0.32, 't_fogo.png');
  await A.evaluate(() => openSheet('mundo')); await A.waitForTimeout(600); await A.evaluate(() => { const c = document.getElementById('muMap'); c && c.scrollIntoView(); }); await A.waitForTimeout(300); await A.screenshot({ path: __dirname + '/t_panel.png' });
  const perf = await A.evaluate(() => { CAM.z = zMin(); CAM.x = 11000; CAM.y = WH / 2; clampCam(); const d = []; for (let i = 0; i < 12; i++) { const a = performance.now(); draw(TT, 0.016); d.push(performance.now() - a); } d.sort((a, b) => a - b); return d[6].toFixed(1); }); console.log('far ms', perf);
  console.log(errs.length, errs.slice(0, 4)); await b.close(); })();
