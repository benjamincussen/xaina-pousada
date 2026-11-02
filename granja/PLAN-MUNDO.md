# Plan de progreso del Mundo (sesión "Corsario", archivo `mundo.js`)

Reparto aprobado por Benjamin:
- **Esta sesión:** el Mundo (ciudades vecinas, colonias, comercio exterior, militar del mundo), todo en `mundo.js`.
- **La otra sesión:** economía, producción, casas, terrenos y gráficas, en `game.js` y `negocios.js`.

Zona del mapa reservada para el Mundo: **x > 3000**, el océano al este del mapa original. Los únicos hooks en `game.js` son `worldB()` (límites de cámara y noche, ampliables con `EXT.bounds`) y los de v73–v75 (Concejo, `muApply`, etc.).

## Hecho
- v73–v75: Concejo elegido, Villa Aurora, milicia, mina, Mapa del Mundo (hoja), colonias de 5 especialidades y conquista con 3 victorias.
- v82: flota de guerra y arqueros, comercio de productos con cada ciudad vecina, Ilhas Gêmeas, Cidade Real y Cabo Leste.
- **v88–v89: el mundo dentro del mapa.**
  - Océano al este (x 3000 → 14000) con todas las islas a escala real; se recorren arrastrando.
  - Cada ciudad tiene casas según su población, castillo, murallas, soldados y muelle.
  - Cada colonia se dibuja según su especialidad (rascacielos y palmeras, campos y granero, montaña minera, fuerte con soldados, ciudad con depósitos).
  - Niebla con "?" en lo no explorado: tocar la siguiente isla la explora.
  - Rutas punteadas desde nuestro puerto y barcos yendo y volviendo a cada colonia.
  - Tocar una isla abre su ciudad. 🌍 lleva la cámara al mar del mundo; tocarlo otra vez abre el panel.

- **v93: fases 1 y 2.**
  - Vida en las islas: vecinos paseando, humo de chimeneas, gaviotas, y obra con andamios y grúa ("En obra") 2 min después de fundar o mejorar una colonia.
  - Expediciones navales animadas: al atacar, la flota (2–8 barcos según los de guerra) sale del fuerte, cruza el mar en 45 s, combate 12 s frente a la isla (humo, chispas y 💥, sin heridos) y vuelve con el cartel del resultado; el aviso de victoria o derrota sale al terminar el combate.
  - Ataques enemigos visibles: los saqueos de las ciudades del mundo llegan en barcos con su bandera hasta nuestro puerto, con aviso "⚠️ Barcos de … vienen", y si la defensa gana se ve "¡Defendimos!".

## Próximas fases (grandes, una por ronda)
1. ~~Vida en las islas~~ (hecho en v93):
   - vecinos caminando, humo, faroles de noche y gaviotas;
   - las colonias crecen a la vista nivel a nivel (andamios, obra en curso);
   - nombres propios de barrio.
2. ~~Expediciones navales animadas~~ (hecho en v93):
   - al atacar, la flota sale del fuerte, cruza el mar hasta la isla, hay un combate de dibujo animado (humo, chispas, nadie muere) y vuelve;
   - el resultado llega al llegar.
   - Los ataques enemigos también se ven venir: barcos con su bandera que cruzan hacia nosotros, con aviso en pantalla.
3. **Diplomacia entre ciudades:**
   - alianzas y guerras entre ellas, con ataques visibles entre islas;
   - embajadores que llegan en barco con propuestas: tratado, comercio o tributo;
   - ranking de ciudades.
4. **Exploración profunda:**
   - islas del tesoro y ruinas;
   - mapa del mundo en el minimapa;
   - zonas nuevas al norte y al sur (otro tramo de océano) cuando se exploró todo.
5. **Colonias autónomas:**
   - cada colonia con su gobernador que pide cosas (productos o mejoras) y crece sola;
   - el Concejo arma estrategia mundial (prioriza las especialidades que faltan);
   - piratas que atacan rutas mal defendidas.
6. **Pulido y rendimiento:**
   - menos detalle al alejar la cámara;
   - co-op: ver dónde está el amigo en el mar;
   - noche con luces en las islas.

## Reglas
- Atacar es siempre decisión del jugador.
- El Concejo solo gasta el tesoro.
- Partidas viejas, co-op y la sala UVDE intactos.
- PT/ES con "tú".
- Arte original.
- Antes de cada push: `git pull --rebase origin main`, versión = main + 1.
