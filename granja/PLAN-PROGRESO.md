# Plan de progreso — Granja del Viento (dos sesiones en paralelo)

Objetivo de Benjamin: llevar el juego "al siguiente nivel": mapa enorme, dinero que se mueve, ciudades vecinas visibles, muchos recursos y producción, más casas, compra continua de terrenos, y ciudadanos autónomos que producen, comercian y expanden. Mejora continua, con versiones grandes y frecuentes.

## Reglas comunes
- `git pull --rebase origin main` antes de cada push; versión = la de `main` + 1 (`version.json`, FALL en `index.html`, `BUILD_V` en `game.js`); sección en `PLAN.md`; entrada en Novedades cuando el jugador lo nota.
- Nada se sube sin prueba Playwright (`granja/tests/`): partida de nivel 20 con todo comprado + 3 h simuladas del Concejo + hojas abiertas + 0 errores de consola + capturas.
- Nuevo código fuera de `game.js` cuando se pueda, con los hooks `EXT` (`PLAN-EXT.md`). Partidas viejas y co-op nunca se rompen (`migrate()` con defaults; todo por `apply`).
- Tono para niños, PT/ES, arte original, celulares primero (dibujar solo lo visible, fondos en caché).

## Áreas
| Sesión | Área | Archivos |
|---|---|---|
| **A — "graphics/economía"** (esta) | economía y producción, casas y terrenos, mapa (sur/oeste), negocios, gráficas, ayudantes/arquitecta, pruebas | `game.js`, `negocios.js`, `tests/` |
| **B — "Corsario/mundo"** | mundo exterior: ciudades vecinas y colonias dibujadas en el mar del este, comercio exterior por el mapa del mundo, rutas y barcos, militar, más ciudades | `mundo.js` (+ hooks de una línea avisando) |

## Hecho (en vivo) — sesión A
- v76 Economía viva · v77 Mapa al sur (Barrio Sur, Zona Industrial) · v78 Suroeste (Campo Sur, Cantera) · v79 Logística visible · v80 HUD móvil · v81 Precios del día · v83 Negocios (negocios.js) · v84 Torres y población · v85 Gráficas 2 · v86 Ayudantes 3 (Industria, 24) · v87 Rendimiento · v88/89 Diario de la ciudad · v90 Estaciones + riego + fuzz · v91 Árboles por estación.
- Sistema EXT para extensiones; pruebas en `tests/` (smoke, fuzz, logística, precios, torres, ayudantes3, estaciones, negocios, hud-movil).

## Hecho (ronda 2 y 3) — sesión A
- v92 Más al sur (Cacao, Lago del Sur, Barrio Alto; WH 7900) · v93 Ferrocarril de carga · v94 Clima 2 · v95 Guía y metas · v96 Niños 2 · v98 Obras a la vista · v99 Turismo del Lago · v100 Fiesta + Tu ciudad en números.

## Hecho (rondas 4 y 5) — sesión A
- v101 Vecinos con dinero · v102 Más al sur 3 · v103/104 Gráficas 3 y arreglo · v105 Ayudantes 4 · v107/108 Gráfico de crecimiento · v109 Oeste (Sierra Nevada, Minas de Oro, Rancho) · v110 Desierto y Bosque · v111 Oficios 3.

## Próximas versiones — sesión A (ronda 6)
1. **v112 Volcán y Ruinas**: últimos dos terrenos del suroeste (termas y obsidiana; ruinas con museo y tesoros para cavar).
2. **v113 Robustez**: prueba de co-op simulada (dos páginas con el mismo S, acciones del invitado), tope de datos, textos PT/ES revisados.
3. **v114 Eventos por terreno**: festival de la nieve en la Sierra, carrera de camellos en el Desierto, noche de luciérnagas en el Bosque.
4. **v115 Rendimiento móvil 2**: caché del fondo por zona, menos trabajo por frame en zoom lejano.

## Ronda 4 (hecha)
1. **v101 Vecinos con dinero**: los vecinos con empleo cobran y gastan en la feria y el Mercado Grande (compran sobras del granero a buen precio); colas visibles; "consumo" en la Economía.
2. **v102 Eventos de ciudad 2**: carrera de botes en el Lago del Sur (apuestas), festival de la cosecha con puestos, feria de ciencias en el colegio.
3. **v103 Más al sur 3** (WH 9400): Viñedo (uvas → jugo de uva), Parque Nacional (animales, turismo), Ciudad Universitaria (lotes + universidad con empleos).
4. **v104 Gráficas 3**: autos en las avenidas nuevas, estelas de botes, bandadas de pájaros, reflejos en el agua.
5. **v105 Ayudantes 4**: camionero (lleva producción al depósito), Lúcia con presupuesto propio aprobado por el jugador.

## Ronda 2 (hecha)
1. **v92 Más al sur**: el mapa crece otra franja (WH 7900) con Plantación de cacao (cultivo + Fábrica de chocolate), Lago del Sur (muelle, botes, turismo) y Barrio Alto (12 lotes en la colina). Más terrenos para que el Alcalde siga comprando.
2. **v93 Ferrocarril de carga**: tren de mercancías que une Zona Industrial, Cantera y Puerto de Carga; vagones con lo producido; exportación +20% cuando llega el tren.
3. **v94 Escuela y niños 2**: más bebés con torres, guardería grande, niños yendo al colegio del Barrio Sur, "Día del niño".
4. **v95 Clima 2**: viento (molinos y banderas), niebla en invierno, arcoíris; sequía corta que la irrigación evita.
5. **v96 Balance y tutorial**: pasada de precios/tiempos con la simulación de 8 h; guía "¿qué hago ahora?" para los sistemas nuevos.
6. **Continuo**: fuzz en cada versión, rendimiento, revisión de textos PT/ES.

## Hecho antes (ronda 1)
1. **v79 Negocios** (`negocios.js`, ya en desarrollo por un agente): Banco (interés al tesoro), Mercado Grande (bono de ventas), Escuela de Oficios (oficios nuevos → tesoro), Chocolatería (bombón); el Concejo los construye; hoja 🏪. Pulido de la Cantera (cerros con nieve, mina más grande).
2. **v80 Logística visible**: camiones de reparto entre fábricas, depósito y granero (los productos "viajan"); trabajadores que van y vuelven de la Zona Industrial; humo/luces de noche en la industria; "tablero de producción" con lo que cada fábrica hizo en la última hora.
3. **v81 Mercado con precios del día**: tablero de precios que sube y baja por demanda (lo que piden pedidos, feria, vecinos y exportación); el Comercio del Concejo vende cuando el precio está alto; ventas del jugador con bonus "buen momento".
4. **v82 Población y vivienda**: edificios altos en el Barrio Sur (torres de 8 familias), guardería/escuela nuevas para más niños, cada vecino con trabajo paga impuesto visible; meta "1000 vecinos".
5. **v83 Gráficas 2**: variedad de árboles y casas, agua animada en lagunas, lluvia que moja, luces de noche en los barrios nuevos, sombras largas al atardecer, fotos del día.
6. **v84 Ayudantes 3**: oficios nuevos (minero, obrero, camionero), hasta 24 ayudantes, y Lúcia que también decora los barrios nuevos.
7. **Continuo**: fuzz de hojas y toques, rendimiento en celular (presupuesto: 3 ms por frame en Chromium sin GPU), balance de precios y tiempos.

## Próximas versiones — sesión B (propuesta; ajustar según su avance)
1. Islas de las ciudades vecinas y colonias en el mapa real (crecen con pop/lv), barcos yendo y viniendo, tocar la isla abre 'urbe'.
2. Comercio exterior de productos (tratos que piden las ciudades, caravanas/barcos visibles, pago en minerales/monedas/relación).
3. Militar 2 (arquería/astillero, defensa de colonias) y más ciudades con personalidad.
4. Eventos entre ciudades (ferias, regatas, alianzas) y "diario del mundo".

## Cómo nos avisamos
- `send_message` entre sesiones al terminar una versión (qué cambió, hooks tocados, números de la prueba).
- Si una sesión necesita algo de la otra (un hook, un campo de S), lo pide por mensaje y sigue con otra cosa mientras tanto.
