# Extensiones de la granja (para trabajar en paralelo sin tocar game.js)

`game.js` expone `EXT` (definido arriba de todo). Un archivo nuevo (cargado por `index.html` después de `game.js`) se registra así:

```js
EXT.apply.push({ pre: 'ng', fn: (S, a, now, out, fail) => { /* acciones que empiezan con 'ng'; devolver true si ok, fail(msg) si no, null si no es mía */ } });
EXT.step.push((S, now) => { /* cada 20 s simulados dentro del Concejo (también offline); devolver true si cambió algo */ });
EXT.tick.push((S, now) => { /* cada ~1 s real, solo host; true si cambió algo (se guarda y manda al amigo) */ });
EXT.draw0.push((cx, S, T, dt, now) => { /* dibujo en el mundo, justo después del fondo (bajo edificios) */ });
EXT.draw.push((cx, S, T, dt, now) => { /* dibujo en el mundo, encima de todo y antes de la noche */ });
EXT.sheet.miHoja = (S, t, arg) => { t.textContent = 'Título'; return '<div class="card">…</div>'; }; // openSheet('miHoja', arg)
EXT.click.push((d, SH) => { if (d.miBoton) { act({ a: 'ngAlgo' }); return true; } return false; });
EXT.fx.push(f => { if (f[0] === 'ngListo') { toast('…'); return true; } return false; });
EXT.opts.push((S, now, role, o) => { /* opciones del Concejo: o.push([{ a: 'ngX' }, costo]) */ });
EXT.tap.push((p, S) => { /* toque en el mapa (coords del mundo); true si lo manejé */ return false; });
EXT.migrate.push(S => { if (!S.ng) S.ng = {}; });
EXT.go.miHoja = () => openSheet('miHoja'); // destino de "Ver" en Novedades
```

Reglas: textos en `TX.pt`/`TX.es` y nombres en `NM.pt`/`NM.es` (con `Object.assign`); todo cambio de estado por `apply` (co-op); nada de datos grandes por red; dibujar solo lo que está cerca de la cámara (`CAM.x/y/z`, `innerWidth/innerHeight`); versión +1 sobre la de `main` al pushear (`version.json`, `index.html` FALL, `BUILD_V` en game.js) y una sección en `PLAN.md`.
