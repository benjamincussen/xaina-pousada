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

## Hecho (en vivo)
- v76 Economía viva: monedas que vuelan, pill del tesoro, hoja Economía, venta autónoma de sobras a vecinos, Aserradero/Tostadora/Ladrillera, café.
- v77 Mapa al sur (WH 6400): Barrio Sur (18 lotes) y Zona Industrial (ración, azúcar, telas, depósito).
- v78 Suroeste: Campo Sur (+24 parcelas, 108 en total) y Cantera (hierro, herramientas, herrería).
- Sistema EXT para extensiones.

## Próximas versiones — sesión A
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
