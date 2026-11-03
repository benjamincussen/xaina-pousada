// Vista de computador: 1440x900, mouse. Fotos del mapa, hoja de la ciudad y equipo.
(async () => { const { b, A, errs } = await require('./look.js')({ lvl: 104, coins: 255000, land: { leste: 1, sul: 1, colina: 1, vila: 1, bairro: 1, escolar: 1, praia: 1, lavoura: 1, cidade: 1, centro: 1, livre1: 1 }, serv: { praca: 1, prefeitura: 1 } }); await A.setViewportSize({ width: 1440, height: 900 }); await A.waitForTimeout(500);
  const shot0 = A.screenshot.bind(A); A.screenshot = o => shot0(Object.assign({ scale: 'css' }, o));
  await A.screenshot({ path: __dirname + '/desk_map.png' });
  await A.evaluate(() => { if (SH) closeSheet(); openSheet('cidade'); }); await A.waitForTimeout(500); await A.screenshot({ path: __dirname + '/desk_ci.png' });
  await A.keyboard.press('Escape'); await A.waitForTimeout(300); const closed = await A.evaluate(() => !SH);
  await A.evaluate(() => openSheet('equipo')); await A.waitForTimeout(500); await A.screenshot({ path: __dirname + '/desk_eq.png' });
  const z0 = await A.evaluate(() => CAM.z); await A.keyboard.press('Escape'); await A.keyboard.press('Equal'); await A.waitForTimeout(200); const z1 = await A.evaluate(() => CAM.z);
  const x0 = await A.evaluate(() => CAM.x); await A.keyboard.down('ArrowRight'); await A.waitForTimeout(400); await A.keyboard.up('ArrowRight'); const x1 = await A.evaluate(() => CAM.x);
  const m0 = await A.evaluate(() => MUTE); await A.keyboard.press('m'); const m1 = await A.evaluate(() => MUTE); await A.evaluate(() => { openSheet('menu'); }); await A.waitForTimeout(300); const mb = await A.evaluate(() => !!document.querySelector('#sheet [data-mute]')); console.log(JSON.stringify({ closed, zoomKey: z1 > z0, panKey: x1 > x0, muteDesk: m0, mKey: m0 !== m1, muteBtn: mb, errs })); await b.close(); })();
