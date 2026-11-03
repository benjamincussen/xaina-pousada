# Noche autónoma (3 de noviembre de 2026)

Benjamin se fue a dormir y pidió 10 horas de mejoras autónomas. Para él es un experimento de cómo la IA mejora un juego sola en dos niveles:
1. **Desarrollo del juego:** rondas de mejora cada hora (agenda `trig_019M2p2RGt6w2WhfseTzMAeV`, cron `10 * * * *`, hasta 2026-11-03T14:20Z; al terminar, borrarla con `delete_trigger`).
2. **Crecimiento dentro del juego:** personajes con cargo que trabajan solos (equipo de la ciudad, cobradores, Concejo, Lúcia).

Lo que quiere ver en la mañana: el mapa mucho más grande (triple o cuádruple de tierras), más casas, más barrios, más data centers, mucho más dinero, más calles y gente, y gente a cargo de lo que está parado. Comisión de cobradores: 2%.

## Cómo observar el juego
- `node granja/tests/noche.js [horas]`: partida grande parecida a la de Benjamin (nivel 89, 250k monedas, tesoro del Concejo), juego "cerrado" N horas, se reabre y el equipo recupera el tiempo. Imprime antes y después, el diagnóstico (demanda, cobertura, billetera, metas, barrios) y saca `noche_rep.png`, `noche_mapa.png` y `noche_cerca.png`.
- No tenemos la partida real de Benjamin (está en su teléfono). Sus capturas: nivel 89, ~252k monedas, tesoro del Concejo 87,7k con +1882/min, 3437 vecinos, aprobación 59–62%, muchas casas del 🔨 y lotes de ciudad, colonias en islas.

## Backlog (en orden)
1. ✅ Equipo de la ciudad (v126): Marta, Rosa, Ada, Tomás y Clara; recuperación de hasta 12 h al abrir; informe "Mientras no estabas"; billetera con metas de ahorro; aporte del tesoro del Concejo; barrios planificados con núcleo de servicios; parque tecnológico. Cobradores al 2%.
2. ✅ (v127) **Mapa más grande:** agregar muchas tierras nuevas para comprar (más allá del oeste, norte o sur; usar `EXT.bounds` y sumar a `LANDS` desde una extensión, con suelo dibujado) para triplicar el área. Marta las compra.
3. ✅ (v128) **Economía:** que el equipo haga crecer las monedas y no solo gastarlas (rentas de lotes y data centers, prioridades de inversión por retorno, aporte del Concejo). Medir con noche.js.
4. **Tecnología:** robots, autos eléctricos y celulares hechos con chips; exportar a las ciudades vecinas de `mundo.js`; bolsa de valores de Brisa IA.
5. **Barrios con estilo** (colonial, moderno, playa) elegidos por Lúcia, rascacielos ★5 y horizonte de noche.
6. **Vida en las calles:** autobuses que paran en las paradas, semáforos, ferias de fin de semana, fuegos artificiales con aprobación > 90.
7. **Más empleados:** jardinero (árboles y plazas donde hay humo), repartidor (abastece negocios con el granero), director de turismo (hoteles), jefe de tránsito.
8. **Tren de pasajeros** a las ciudades vecinas y aeropuerto con vuelos a las islas.
9. **Rendimiento:** recuperación de 12 h con 400 lotes y 300 construcciones en menos de 5 s.
10. **Informe final** visual de la noche (capturas y números) para Benjamin.

## Bitácora
- **04:10Z · v126** — Equipo de la ciudad (`equipo.js`) y cobradores al 2%. Prueba `noche.js` 10 h: terrenos 16 → 29, lotes 30 → 32–73 según balance, vecinos 204 → 670–1450, recuperación ~1,6 s. Pendiente: economía más fuerte (el equipo gasta casi todo lo que entra) y mapa más grande.
- **05:10Z · v127** — Tierras del Poniente (`poniente.js`): 64 terrenos nuevos al oeste (de 39 a 103), caminos, árboles, cartel; Marta compra hasta 2 por turno. noche.js 10 h: terrenos 16 → 32 (el Concejo compra la mayoría), lotes 30 → 65, vecinos 204 → 788, monedas 250k → 228k. Cuello de botella: la plata del equipo (billetera ~4k, tesoro de la prueba < 30k). Próximo: economía (ítem 3).
- **06:11Z · v128** — Economía: lotes ×1,6, valor del suelo (plazas, parques y monumentos, capa 🌳), Rosa reurbaniza (demuele un lote vacío o una casa chica para poner policía, hospital o escuela) y pone plazas y parques en los barrios; zonas nuevas solo con servicios cubiertos; impuesto mínimo 8%. noche.js 10 h: aprobación 52% (antes 30–40%), lotes 30 → 43, monedas ~232k, ingreso ciudad ~5,8k/h + 🔨 ~8,3k/h. Próximo: tecnología (ítem 4); Ada todavía no arranca en la prueba porque la billetera no junta 30k para la universidad.
