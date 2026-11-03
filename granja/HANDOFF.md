# Traspaso: Sítio do Vento / Granja del Viento

Para la próxima sesión de Claude Code. El juego es `granja/`, publicado en GitHub Pages desde `main`. Jugadores: Benjamin y Ana Luyza.

## Reglas de Benjamin
- **Publicar:** subir siempre a `main` (y a la rama de trabajo). Cada versión sube el número en `version.json`, en el `FALL` de `index.html` y en `BUILD_V` (primera fecha `2026-11-03.N` de `game.js`); se agrega una sección al final de `PLAN.md`.
- **Partidas y co-op:** no romper partidas guardadas (`migrate`), ni el co-op por relay MQTT (`relay.js`), ni el código de sala fijo por granja.
- **Contenido:** textos en portugués y español (español con "tú", nunca voseo). Arte original.
- **Tokens:** trabajar por rondas grandes pero cuidando los tokens.

## Archivos
| Archivo | Qué contiene |
|---|---|
| `game.js` | El juego base. `apply(S, a, now)` cambia el estado (co-op host-authoritative). Hooks `EXT` (ver `PLAN-EXT.md`) y `worldB()` (límites de cámara y noche, ampliables con `EXT.bounds`). |
| `mundo.js` | Océano del este (x > 3000) con ciudades vecinas, colonias (casas y negocios), flotas, diplomacia, islas del tesoro, Concejo, Villa Aurora y milicia. Plan: `PLAN-MUNDO.md`. |
| `negocios.js` | Banco, mercado grande, escuela de oficios, chocolatería. |
| `construir.js` | 🔨: construir donde quieras (`S.cb`), zonas, recreación, monumentos, calles de la arquitecta (`S.cbst`, acción `cbArr`), abastecer (`cbSup`), metas grandes, `cbPop`/`cbJobs`/`cbHappy`/`cbPrest`. |
| `cidade.js` | 🏙️ SimCity: zonas R/C/I que crecen solas (`S.ci.z`), demanda, luz y agua con capacidad, policía/bomberos/hospital con radio (`S.ci.p`), emergencias (`S.ci.ev`), aprobación (`S.ci.ap`) y globitos de opinión. Un paso por minuto en `EXT.tick` (host). |
| `cidade2.js` | Tráfico y transporte (parada, metro), presupuesto (`S.ci.tax`, `S.ci.fund`), desastres leves (`S.ci.dz`, `S.ci.dis`), turismo y hotel, luces de noche y dibujos de los monumentos (`monArt`). Se engancha en `window.CI.H` de cidade.js. |
| `index.html` | Carga: relay.js, p2p.js, game.js, mundo.js, negocios.js, construir.js, cidade.js, cidade2.js. |

## Pruebas (Playwright; chromium ya instalado; `NODE_PATH=$(npm root -g)`)
- **Servidor:** `python3 -m http.server 8767` desde la raíz del repo.
- **Broker para co-op:** aedes + ws en `ws://127.0.0.1:8885/mqtt` (instalar `mqtt@5.10.4 aedes@0.51.3 ws@8.18.0`).
- **Pruebas en `granja/tests/`:** `smoke.js`, `fuzz.js`, `look.js` (helper), `oldsave.js`, `coopnew.js`, `i18n.js`, `mundo6.js`, `cb.js`, `arr.js`, `cidade.js`, `cidade2.js`. Algunas guardan capturas junto al archivo.
- **Publicar:** `granja/tests/pushloop.sh "<resumen>"`. Rebasa sobre main, pone versión = main + 1, reemplaza `## Versión 0 (sesión …` en PLAN.md y pushea a main y a la rama actual (edita la línea de atribución del commit con la sesión actual).

## Estado
- Versión **123**: nivel máximo 200, Concejo, mundo con 15 ciudades y colonias, construir libre con arquitecta y calles, ciudad SimCity (zonas, luz/agua, servicios, aprobación, tráfico, presupuesto, desastres leves, turismo, noche, monumentos dibujados).

## Próxima ronda pedida ("dale con todo", estilo SimCity)
1. ✅ Zonas que crecen solas con medidor RCI (v122, `cidade.js`).
2. ✅ Electricidad y agua con cobertura y capacidad (v122).
3. ✅ Policía, bomberos y hospital con radio; incendios, robos y enfermos de dibujo animado (v122).
4. ✅ Opinión de los vecinos: globitos y barra de aprobación (v122).
5. ✅ Tráfico y transporte, presupuesto e impuestos, desastres leves, turismo, luces de noche y dibujos de los monumentos (v123, `cidade2.js`).

## Ideas para la ronda siguiente
- Educación (escuela y universidad que suben el nivel máximo de los lotes) y contaminación de la industria.
- Mapa de calor de cobertura (luz, agua, tráfico, aprobación) en la ficha 🏙️.
- Tren entre la ciudad y las ciudades vecinas de `mundo.js`; aeropuerto que trae turistas de otras ciudades.
- Ordenanzas (reciclaje, bicicletas, horario de fiesta) con efectos en el presupuesto.
