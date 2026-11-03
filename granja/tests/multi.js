// Comprar varias cosas seguidas: después de colocar algo, la ficha vuelve a abrirse donde estaba.
(async () => { const { b, A, errs } = await require('./look.js')({ lvl: 104, coins: 900000, land: { leste: 1, sul: 1, colina: 1, vila: 1, bairro: 1, escolar: 1, praia: 1, lavoura: 1, cidade: 1, centro: 1, livre1: 1 }, serv: { praca: 1, prefeitura: 1 } });
  const out = {}; const go = async (open, sel, tag, dx) => {
    await A.evaluate(([open, dx]) => { if (SH) closeSheet(); const r = LANDS.livre1.r; CAM.z = 0.6; CAM.x = r.x + r.w / 2 + dx; CAM.y = r.y + r.h / 2; clampCam(); openSheet(open); $('sheet').scrollTop = 120; }, [open, dx]); await A.waitForTimeout(400);
    const top0 = await A.evaluate(() => $('sheet').scrollTop); const top1 = await A.evaluate(sel => { const e = document.querySelector('#sheet ' + sel); if (!e) return -1; e.scrollIntoView({ block: 'center' }); const t = $('sheet').scrollTop; e.click(); return t; }, sel); if (top1 < 0) { out[tag] = 'nobtn'; return; } await A.waitForTimeout(300);
    const closed = await A.evaluate(() => !SH); const n0 = await A.evaluate(() => G.S.ci.p.length + G.S.cb.length + (G.S.ag ? G.S.ag.b.length : 0));
    for (const [x, y] of [[195, 420], [120, 380], [270, 470], [195, 300], [100, 520]]) { await A.mouse.click(x, y); await A.waitForTimeout(150); if (!(await A.evaluate(() => G.cbPlace || G.ciPlace || G.agPlace))) break; }
    await A.waitForTimeout(700); const n1 = await A.evaluate(() => G.S.ci.p.length + G.S.cb.length + (G.S.ag ? G.S.ag.b.length : 0));
    out[tag] = await A.evaluate(([closed, n0, n1, top1]) => ({ closed, placed: n1 - n0, back: SH && SH.type, scrollKept: Math.abs($('sheet').scrollTop - top1) < 30 }), [closed, n0, n1, top1]); };
  await go('cidade', '[data-cipl="escola"]', 'escola', 0);
  await go('construir', '[data-cbpick="play"]', 'play', 400);
  await go('construir', '[data-cbpick]', 'cb', -400);
  console.log(JSON.stringify(out)); console.log('errs', errs.length, errs.slice(0, 2)); await b.close(); })();
