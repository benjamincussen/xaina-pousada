# Traspaso: Sítio do Vento / Granja del Viento

Para la próxima sesión de Claude Code. El juego es `granja/`, publicado en GitHub Pages desde `main`. Jugadores: Benjamin y Ana Luyza.

## Reglas de Benjamin
- **Publicar:** subir siempre a `main` (y a la rama de trabajo). Cada versión sube el número en `version.json`, en el `FALL` de `index.html` y en `BUILD_V` (primera fecha `2026-11-03.N` de `game.js`); se agrega una sección al final de `PLAN.md`.
- **Partidas y co-op:** no romper partidas guardadas (`migrate`), ni el co-op por relay MQTT (`relay.js`), ni el código de sala fijo por granja.
- **Contenido:** textos en portugués y español (español con "tú", nunca voseo). Arte original.
- **Tokens:** trabajar por rondas grandes pero cuidando los tokens.

## Archivos
- `index.html` pone `window.EXT_READY = true` cuando cargaron todos los archivos; las recuperaciones (ciudad y equipo) esperan esa marca.
| Archivo | Qué contiene |
|---|---|
| `game.js` | El juego base. `apply(S, a, now)` cambia el estado (co-op host-authoritative). Hooks `EXT` (ver `PLAN-EXT.md`) y `worldB()` (límites de cámara y noche, ampliables con `EXT.bounds`). |
| `mundo.js` | Océano del este (x > 3000) con ciudades vecinas, colonias (casas y negocios), flotas, diplomacia, islas del tesoro, Concejo, Villa Aurora y milicia. Plan: `PLAN-MUNDO.md`. |
| `negocios.js` | Banco, mercado grande, escuela de oficios, chocolatería. |
| `construir.js` | 🔨: construir donde quieras (`S.cb`), zonas, recreación, monumentos, calles de la arquitecta (`S.cbst`, acciones `cbArr`, `cbArrAll`, `cbArrAuto`; Lúcia sola con `S.arrAuto`, `S.arrSig`, `S.arrPend`, `S.arrLog`), abastecer (`cbSup`), metas grandes, `cbPop`/`cbJobs`/`cbHappy`/`cbPrest`. |
| `cidade.js` | 🏙️ SimCity: zonas R/C/I que crecen solas (`S.ci.z`), demanda, luz y agua con capacidad, policía/bomberos/hospital con radio (`S.ci.p`), emergencias (`S.ci.ev`), aprobación (`S.ci.ap`) y globitos de opinión. Un paso por minuto en `EXT.tick` (host). |
| `cidade2.js` | Tráfico y transporte (parada, metro), presupuesto (`S.ci.tax`, `S.ci.fund`), desastres leves (`S.ci.dz`, `S.ci.dis`), turismo y hotel, luces de noche y dibujos de los monumentos (`monArt`). Se engancha en `window.CI.H` de cidade.js. |
| `cidade3.js` | Educación (escuela, universidad, ★4 necesita educación), contaminación (`CI.smog`), mapa de cobertura (`G.ciMap`), ordenanzas (`S.ci.ord`) y guía de primeros pasos. |
| `tecno.js` | Fábrica de chips, data center y laboratorio de IA (`S.tech`: chips, srv, prog, ver, subs). Usa la energía y el agua que sobran de la ciudad. Ficha `tecno`. |
| `arte.js` | Dibujos de casas, edificios, negocios y lotes de la ciudad (`cbArt`, `ciArt`), estilos de barrio (`S.sty`, acción `cbSty`), rascacielos ★5, horizonte de noche y miniaturas para el zoom lejos (`cbFar`, `ciFar`, `ciPlFar`). |
| `cobrador.js` | Hasta 3 cobradores (`S.cob`) que cobran 🔨, colonias y caja de la ciudad cada 5 min con 5% de comisión. |
| `equipo.js` | Equipo de la ciudad (`S.eq`, con caja propia `bw`/`tw`/`wal`, ritmo `sp`, aporte automático `auto`/`resv`): Marta, Rosa, Ada, Tomás y Clara trabajan cada 10 min y recuperan hasta 12 h al abrir; billetera, metas de ahorro, barrios planificados, parque tecnológico, informe. |
| `poniente.js` | Regiones nuevas (`REGIONS`): Poniente (`pon0`…`pon63`, oeste), Norte (`nor0`…`nor77`) y Sur (`sur0`…`sur77`), con suelo dibujado aparte y cámara ampliada (`EXT.bounds`). |
| `tecno2.js` | Fábricas de robots, celulares y autos eléctricos (exportan con chips), valor de Brisa IA con gráfico. |
| `calles.js` | Vida en las calles: semáforos y cebras, ferias junto a las plazas, fuegos con aprobación alta, vecinos caminando. |
| `viajes.js` | Estación de tren con tren animado y aeropuerto regional con vuelos a las islas. |
| `stats.js` | Estadísticas por hora (`S.st`) y ficha 📈 con gráficos. |
| `agro.js` | Campo y producción rural (`S.ag`): campos, corrales, silo, fábricas del campo que copian las recetas de `BUILD`, cooperativa. Nico (equipo) lo arma solo. |
| `bienestar.js` | Encargados de bienestar por región (`S.eq.bem`: meta, fondos por región, entregas), Centro vecinal, freno de expansión (`bemOk`). Se engancha en `EQ_PRE` de equipo.js. |
| `NOCHE.md` | Plan, backlog y bitácora de la noche autónoma. |
| `index.html` | Carga: relay.js, p2p.js, game.js, mundo.js, negocios.js, construir.js, cidade.js, cidade2.js, cidade3.js, tecno.js, arte.js, cobrador.js, equipo.js. |

## Pruebas (Playwright; chromium ya instalado; `NODE_PATH=$(npm root -g)`)
- **Servidor:** `python3 -m http.server 8767` desde la raíz del repo.
- **Broker para co-op:** aedes + ws en `ws://127.0.0.1:8885/mqtt` (instalar `mqtt@5.10.4 aedes@0.51.3 ws@8.18.0`).
- **Pruebas en `granja/tests/`:** `smoke.js`, `fuzz.js`, `look.js` (helper), `oldsave.js`, `coopnew.js`, `i18n.js`, `mundo6.js`, `cb.js`, `arr.js`, `cidade.js`, `cidade2.js`, `cidade3.js`, `cobrador.js`, `noche.js` (noche simulada: `node tests/noche.js 10`), `equipo_ui.js`, `perf.js` (rendimiento con ciudad enorme). Algunas guardan capturas junto al archivo.
- **Publicar:** `granja/tests/pushloop.sh "<resumen>"`. Rebasa sobre main, pone versión = main + 1, reemplaza `## Versión 0 (sesión …` en PLAN.md y pushea a main y a la rama actual (edita la línea de atribución del commit con la sesión actual).

## Estado
- Versión **142**: nivel máximo 200, Concejo, mundo con 15 ciudades y colonias, construir libre con arquitecta y calles, ciudad SimCity (zonas, luz/agua, servicios, aprobación, tráfico, presupuesto, desastres leves, turismo, noche, monumentos dibujados), Lúcia que ordena todo y sola, casas con dibujos nuevos, tecnología e IA, educación, contaminación, mapa y ordenanzas, cobradores y dibujos de verdad con el zoom lejos, equipo de la ciudad que trabaja solo, bienestar por región, minas, aserradero, pesca, mercado y refinerías, monedas con K/M (`fmtK`), turbo de fábrica (prueba `tests/v139.js`), versión de computador con panel lateral y teclado (`tests/desk.js`), equipo que crece solo con presupuesto compartido (`tests/solo.js`), fichas que vuelven a abrirse después de colocar algo (`pickSave`/`pickBack`, `tests/multi.js`), silenciar todo (`MUTE`, tecla M, silencio de fábrica en el computador), Clara pasa el 25% del tesoro del Concejo al equipo por turno.

## Próxima ronda pedida ("dale con todo", estilo SimCity)
1. ✅ Zonas que crecen solas con medidor RCI (v122, `cidade.js`).
2. ✅ Electricidad y agua con cobertura y capacidad (v122).
3. ✅ Policía, bomberos y hospital con radio; incendios, robos y enfermos de dibujo animado (v122).
4. ✅ Opinión de los vecinos: globitos y barra de aprobación (v122).
5. ✅ Tráfico y transporte, presupuesto e impuestos, desastres leves, turismo, luces de noche y dibujos de los monumentos (v123, `cidade2.js`).
6. ✅ Lúcia ordena todo y sola, casas nuevas, tecnología e IA, educación, contaminación, mapa de cobertura y ordenanzas (v124).
7. ✅ Cobradores automáticos y miniaturas para el zoom lejos (v125).
8. ✅ Equipo de la ciudad autónomo (v126). Lo que sigue está en `NOCHE.md`.

## Ideas para la ronda siguiente
- Tren entre la ciudad y las ciudades vecinas de `mundo.js`; aeropuerto que trae turistas de otras ciudades.
- Tecnología: robots, autos eléctricos y una bolsa de valores de la ciudad; exportar chips a las ciudades vecinas.
- Barrios con estilo (colonial, moderno, playa) que la arquitecta elija al ordenar.
