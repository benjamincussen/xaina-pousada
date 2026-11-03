(async () => { const { b, A, errs } = await require('./look.js')();
  console.log(await A.evaluate(() => { const miss = []; const chk = (k) => { for (const lg of ['pt', 'es']) { const v = TX[lg][k] ?? TX.pt[k]; if (v === undefined) miss.push(lg + ':' + k); } };
    Object.keys(LANDS).forEach(k => { chk('land_' + k); chk('landDesc_' + k); }); Object.keys(SERV).forEach(k => { chk('serv_' + k); chk('servD_' + k); }); ROLES.forEach(r => { chk('role_' + r); chk('roleD_' + r); });
    ['full', 'coins', 'idle'].forEach(w => chk('why_' + w)); CG.forEach(c => chk('cg_' + c[0])); EVS.forEach(e => chk(e[2])); agenda(G.S, Date.now()).forEach(e => chk('ag_' + e.k)); ['ayuda', 'export', 'golf', 'tiro'].forEach(k => chk('ag_' + k));
    Object.keys(PLOG_IC).forEach(k => { if (TX.pt['hlog_' + k] === undefined) chk('plog_' + k); }); Object.keys(HLOG_IC).forEach(k => chk('hlog_' + k)); [0, 1, 2, 3, 4].forEach(i => chk('mayor' + i)); [0, 1, 2].forEach(i => { chk('ayudaK' + i); chk('golfRes' + i); chk('tiroRes' + i); });
    G.mapSpots = null; const sp = ['map_farm', 'map_lake', 'map_vila', 'map_bairro', 'map_escolar', 'map_lavoura', 'map_diversao', 'map_praia', 'map_serra', 'map_ferias', 'map_oeste', 'map_curral', 'map_cidade', 'map_vale', 'map_centro', 'map_aero', 'map_porto2', 'map_all']; sp.forEach(chk);
    NEWS.forEach(([k]) => { chk(k); chk(k + 'D'); }); Object.keys(PROJ).forEach(k => { if (N(k) === k) miss.push('N:' + k); }); Object.keys(PENS).forEach(k => { if (N(k) === k) miss.push('N:' + k); });
    return miss.join(' ') || 'all ok'; }));
  await b.close(); })();
