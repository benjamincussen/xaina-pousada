# Plan: "Ciudad que crece sola, vecinos, mapa grande y agencia militar"

Objetivo (pedido de Benjamin): que la ciudad crezca de forma automática con un **equipo de personas que toma decisiones** con los recursos; que haya **ciudades vecinas** que nacen y crecen; **mapa mucho más grande** que vamos expandiendo; **exploradores** que descubren el mapa y a los vecinos; **muchas más formas de producir** (tierras, minerales, negocios); una **agencia militar**; y poder **atacar al vecino** si se porta mal. Benjamin entra a la app y **ve todo lo que hizo el grupo**.

Reglas fijas que no cambian: sala UVDE, no romper partidas guardadas ni el co-op, PT/ES, arte original, tono para niños (conflictos de dibujo animado: nadie muere, "vuelven con raspones"), el jugador siempre puede frenar o aprobar lo grande.

Cómo encaja con lo que ya existe (para no reinventar):
- Todo cambio de estado pasa por `apply(S, a, now)` y `act()`; eso ya sincroniza el co-op. **Todo lo nuevo también.**
- Las decisiones automáticas corren solo en el host, en el `setInterval` de `helperClock` (junto a `archTick`, `fairTick`). Ahí entran los nuevos "ticks".
- La arquitecta Lúcia (`S.arch`) ya tiene el patrón **propuesta → aprobar/rechazar → obra**. El "Consejo" generaliza ese patrón a más roles y agrega auto-aprobación por presupuesto.
- `maybeAway()` ya calcula "qué pasó mientras no estabas". Se reutiliza para simular el crecimiento offline.
- `LANDS` ya es "comprar terreno para agrandar el mapa". Las regiones nuevas siguen esa idea pero fuera del mapa actual.
- El fondo ya se dibuja por fajas en caché (`makeBg`); el mundo actual mide 1500×4920. **No agrandar ese canvas**: cada región nueva es su propio "mundo" de 1500×~2000, dibujado con las mismas funciones y cacheado igual. Solo se dibuja la región donde está la cámara.

Orden sugerido (cada etapa es jugable sola y se puede subir por separado, una versión cada una):

---

## Etapa 1 — El Consejo: la ciudad crece sola (base de todo)

**Idea.** Un grupo de personas de la ciudad se reúne y decide qué hacer con el dinero. Benjamin ve el "Diario del Consejo" y aprueba lo grande.

**Miembros (cada uno es un avatar en el Ayuntamiento, con nombre y frases):**
- **Alcaldesa Marta** (tesorería): reparte el presupuesto, decide prioridades.
- **Lúcia** (arquitecta, ya existe): calles, decoración, casas.
- **Ingeniero Bruno** (obras y producción): compra parcelas, mejora edificios (`up`), duplica fábricas (`dup`), silos, granero (`cap`), camión, bus, tren.
- **Comerciante Nair** (negocios): vende sobras, pone productos en la feria, pedidos y misiones (lo que hoy hacen scout/pedidos), y más adelante comercia con vecinos.
- **Capitán Teo** (etapa 5) y **Exploradora Iris** (etapa 2) se suman después.

**Cómo decide.** Cada 2 minutos (host) el Consejo arma hasta 5 **propuestas** (`S.council.props`) con el mismo formato de las de Lúcia: `{id, k, who, cost, why, data}`. Reglas:
- **Presupuesto**: Benjamin fija en un panel qué % de las monedas puede gastar el Consejo solo (ej. "hasta 40% del dinero, nunca bajar de 500 monedas") y un **tope por obra para auto-aprobar** (ej. 300). Lo que pasa el tope queda esperando su OK, igual que hoy con Lúcia.
- **Prioridades** (deslizadores simples: Casas / Producción / Belleza / Comercio / Exploración / Defensa): pesan qué propuestas salen primero.
- Fuentes de ideas (todas con funciones que ya existen): `makePlan` (qué falta para progresar), `progressNeeds`, lotes libres → `home`, casas → `homeBig`/`homeApt`, `plotCost` → `buyPlot`, `upCost` → `up`, `dupCost` → `dup`, `LANDS` → `land` (siempre pide OK), `SERV`/`PROJ` → `serv`/`build` (siempre pide OK), decoración → ya lo hace Lúcia.
- Cada decisión tomada escribe en **`S.diary`** (máx. 60 entradas): `[hora, quién, qué, costo, resultado]`.

**Pantalla "Consejo" (hoja nueva `SH.type === 'council'`).**
- Arriba: presupuesto y prioridades (botones, nada de texto largo).
- "Para aprobar": las propuestas grandes con Aprobar / Ver / No.
- "Diario de la ciudad": lo que hicieron, con ícono, nombre y hora ("hace 12 min").
- Botón "Pausar al Consejo" (dejan de gastar; siguen proponiendo).

**Al volver a la app** (`maybeAway`): se simula lo que el Consejo habría hecho en el tiempo ausente (máx. 8 h, en pasos de 10 min con las mismas reglas) y se muestra "Mientras no estabas…" con lo construido y lo ganado.

**Crecimiento automático sin plata del jugador**: los vecinos pagan arriendo (ya existe) y la ciudad cobra **impuesto** (nuevo, 1 moneda por vecino cada 5 min) que va a una **caja del Consejo** (`S.council.coins`) separada de las monedas de Benjamin. Así la ciudad crece sola aunque Benjamin no gaste; cuando la caja alcanza, construyen.

**Datos nuevos**: `S.council = {on, coins, pct, cap, prio:{...}, props:[], paused}`, `S.diary = []`. Migración en `migrate()` con valores por defecto; partidas viejas no cambian hasta contratar al Consejo (nivel 8, 1500 monedas, en el Ayuntamiento/Menú).

**Versión**: "Consejo de la ciudad" (2026-11-03.63).

---

## Etapa 2 — Mapa del mundo, regiones y exploradores

**Idea.** El mapa actual pasa a ser la **región central** de un mundo de **5×5 regiones** (nuestra ciudad en el medio). Cada región es un "mundo" de 1500×2000 con su propio fondo cacheado. El mapa del mundo muestra lo descubierto; lo demás es niebla.

**Datos**: `S.world = { seed, regs: { "x,y": { type, owner, seen, name, res, built:[...] } } }`. `type` ∈ bosque, montaña, costa, pradera, desierto, pantano, ruinas. `owner` ∈ null | 'nos' | id de ciudad vecina. Todo se genera con `seeded(seed + x*31 + y)` para que host e invitado vean lo mismo sin mandar datos grandes.

**Exploradores** (nuevo rol de ayudante `explora` y la **Agencia de Exploración**, edificio nuevo, nivel 9): "Enviar explorador a (región)" cuesta pan + agua/jugo y tarda 5–15 min (como la expedición a la Isla). Al volver: revela la región, trae un informe (recursos, si hay ciudad vecina, ruinas con tesoro) y marca "camino conocido". El Consejo (prioridad Exploración) los manda solo.

**Expandir el mapa**: una región vecina descubierta y sin dueño se puede **anexar** (costo según tipo, siempre pide OK). Al anexar, aparece como región nuestra: tiene lotes, parcelas y un edificio típico del tipo (etapa 3). Se viaja con el botón del mapa: "Ir a…" ya existe (`SH.type === 'map'`), se le agrega la rejilla del mundo.

**Cámara y render**: `G.reg = "x,y"`; `draw()` elige el fondo y los objetos de `G.reg`. La región central sigue siendo exactamente el código de hoy (cero riesgo para lo existente); las regiones nuevas usan una función `drawRegion(reg)` más simple (fondo por tipo + edificios + ayudantes que estén ahí). Los avatares/NPC solo existen en la región visible.

**Minimapa**: `paintMini` dibuja la rejilla 5×5 con colores por dueño y niebla.

**Versión**: "Mundo y exploradores" (.64).

---

## Etapa 3 — Más formas de producir: tierras, minerales y negocios

Cada tipo de región trae su cadena (ítems nuevos en `ITEMS`, edificios en `BUILD` con `land` = la región):
- **Bosque** → Aserradero: madera, muebles (banco de madera para decorar, también se vende).
- **Montaña** → Cantera y Mina 2: piedra, hierro, oro (joya ya existe) → **Fundición**: herramientas (hacen a los ayudantes 20% más rápidos), rieles (tren a regiones).
- **Costa** → Puerto comercial: pescado grande, sal, barcos mercantes (comercio etapa 4).
- **Pradera** → Rancho: ovejas (lana → tejeduría), caballos (exploradores más rápidos).
- **Desierto** → Oasis: dátiles, vidrio (invernadero 2, faroles de vidrio).
- **Pantano** → Arrozal y Apiario 2.
- **Ruinas** → tesoros una sola vez + museo (felicidad).

**Negocios** (edificios de la ciudad, `PROJ`): Banco (interés sobre la caja del Consejo), Mercado grande (precios +10%), Caravanas (envían productos a vecinos, etapa 4), Escuela de oficios (más vecinos con oficio). Los ayudantes y el Ingeniero del Consejo usan las cadenas nuevas con `makePlan` sin cambios de lógica, solo datos.

**Versión**: "Minerales y negocios" (.65).

---

## Etapa 4 — Ciudades vecinas que nacen y crecen

**Idea.** Al explorar aparecen 2–4 ciudades vecinas (nombres y colores generados: "Vila Sol", "Porto Alegre do Vento"…). No se simulan casa por casa: cada una es un conjunto de números que crece con el tiempo, y se **dibuja** procedimentalmente a partir de esos números cuando la visitás.

**Datos** (`S.cities[id]`): `{name, seed, reg, pop, wealth, happy, army, growth, rel (−100..100), mood: 'amiga'|'neutral'|'molesta'|'hostil', trades:[], log:[]}`. Tick del host cada 5 min: `pop += growth`, `wealth += pop*k`, `army` según su personalidad (comerciante, agricultora, guerrera, aislada). Si una ciudad vecina crece mucho, **ocupa regiones libres** cerca (se ven en el mapa del mundo).

**Relaciones**: suben con regalos, comercio y ayudar en sus pedidos; bajan si les robamos el explorador, si anexamos una región que querían, si no cumplimos un trato, o por su personalidad. Con `rel < −40` se vuelven "molestas": piden peaje para pasar, encarecen el comercio, "se portan mal" (mandan ladrones que se llevan algo de la feria, como el evento de la pulga pero al revés). Eso es el detonante para la etapa 5.

**Comercio**: Caravanas/barcos: "ofrecer 10 quesos por 20 hierro". La Comerciante Nair lo negocia sola dentro de las prioridades. Pedidos especiales de ciudades vecinas (pagan mejor que los pedidos normales).

**Visitar**: desde el mapa del mundo → se dibuja su región con casas según `pop`, muralla según `army`, banderas de su color; vecinos con su nombre y frases según `mood`. Se puede dar un regalo, proponer trato o volver.

**Versión**: "Ciudades vecinas" (.66).

---

## Etapa 5 — Agencia militar y conflictos (de dibujo animado)

**Idea.** El **Cuartel** (edificio, nivel 12) y el **Capitán Teo** en el Consejo. Se reclutan **guardias** (cuestan pan + ropa/tejido + 100 monedas, tardan 3 min) y se compran **torres de vigía** en regiones nuestras. Fuerza = guardias + torres + herramientas. Nada de sangre: los conflictos son "expediciones" con resultado por comparación de fuerza + un poco de suerte, y los guardias vuelven "con raspones" (descansan 10 min).

**Defensa automática**: si una ciudad hostil manda ladrones o intenta tomar una región nuestra, el Cuartel responde solo (prioridad Defensa) y el Diario cuenta qué pasó.

**Atacar al vecino**: botón en la ciudad vecina "Mandar expedición", **siempre con OK de Benjamin** (y con aviso claro de la fuerza de cada lado y qué se gana/pierde). Resultados posibles:
- Ganar: tributo (monedas y recursos), una región de ellos pasa a nosotros, su `rel` baja mucho con nosotros pero otras ciudades "respetan" (+5 rel si eran hostiles al vecino).
- Empatar: ambos vuelven; se firma una tregua de 30 min.
- Perder: se pierde parte de los guardias (van al hospital, vuelven en 15 min) y algo de monedas; la ciudad vecina se pone más hostil.
- Siempre se puede **hacer las paces**: regalo grande + 20 min de tregua → `rel` vuelve a neutral.

**Versión**: "Cuartel y expediciones" (.67).

---

## Etapa 6 — Ver todo lo que hizo el grupo (pulido)

- "Mientras no estabas" con resumen por miembro del Consejo y botón "Ver" por cada obra (como las Novedades).
- Notificación en el HUD (punto rojo en el Menú) cuando hay cosas para aprobar.
- Avatares del Consejo reunidos en el Ayuntamiento y hablando (globos con lo último que decidieron).
- Paseo en globo pasa ahora por las regiones anexadas.
- Logros: "Primera región", "Ciudad amiga", "Defensa perfecta".
- Balance: que una ciudad sin que Benjamin toque nada crezca ~1 casa / 10 min y 1 región / 2 h, y que el Consejo nunca deje la caja en cero.

**Versión**: "Ciudad viva 2" (.68).

---

## Riesgos y cómo cuidarlos

- **Partidas guardadas**: todo nuevo es opcional y vive en objetos nuevos (`S.council`, `S.world`, `S.cities`, `S.army`). `migrate()` pone defaults; nada de cambiar el significado de campos viejos.
- **Co-op**: las ideas y ticks solo en host; el invitado solo manda acciones (`act`) como hoy. Nada de datos grandes por red: los mundos y ciudades se regeneran por `seed`.
- **Celulares**: una región visible a la vez, fondo cacheado por región (se libera al salir), avatares solo de la región visible, ticks de ciudades vecinas cada 5 min.
- **Tamaño de game.js**: ya pesa 600 KB. Las etapas 2–5 van en archivos nuevos (`world.js`, `council.js`, `army.js`) cargados por `index.html` igual que `relay.js`/`p2p.js`, con el mismo `?v=`.
- **Tono**: los textos de conflictos los revisa Benjamin antes de subir; nada que asuste.

## Pruebas por etapa (con Playwright, como se hizo con Lúcia)
1. Consejo: con 5000 monedas y presupuesto 40%, en 10 ticks construye ≥3 cosas, nunca baja de la reserva, y lo que pasa el tope queda esperando OK.
2. Mundo: explorar 3 regiones revela exactamente esas 3; anexar una muestra sus edificios; volver al centro no cambia nada del mapa viejo (captura antes/después idéntica).
3. Producción: cada cadena nueva se puede completar con los ayudantes solos.
4. Vecinos: una ciudad "guerrera" llega a hostil en < 1 h simulada; una "comerciante" acepta un trato.
5. Militar: expedición con fuerza 2:1 gana ≥ 80% de las veces en 50 simulaciones; con 1:2 pierde ≥ 80%.
