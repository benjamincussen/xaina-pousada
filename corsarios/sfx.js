// sfx.js — sonido sintetizado: cañonazos, salpicaduras, madera, oleaje, gaviotas, campana y una saloma de fondo
'use strict';
const SFX = (() => {
  let ac = null, master = null, musicBus = null, amb = null, noiseBuf = null, musicOn = false, soundOn = true, musicTimer = null, gullT = null;
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4; comp.connect(ac.destination);
    master = ac.createGain(); master.gain.value = soundOn ? .9 : 0; master.connect(comp);
    musicBus = ac.createGain(); musicBus.gain.value = 0; musicBus.connect(master);
    const n = ac.sampleRate * 2; noiseBuf = ac.createBuffer(1, n, ac.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = Math.random() * 2 - 1;
    // oleaje de fondo: ruido grave que sube y baja
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 380;
    const g = ac.createGain(); g.gain.value = .05; const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .11; lg.gain.value = .035; lfo.connect(lg).connect(g.gain);
    src.connect(lp).connect(g).connect(master); src.start(); lfo.start(); amb = g;
    gullT = setInterval(() => { if (Math.random() < .35) gull(); }, 9000);
    document.addEventListener('visibilitychange', () => { if (!ac) return; document.hidden ? ac.suspend() : ac.resume(); });
    if (musicOn) startMusic();
  }
  const now = () => ac.currentTime;
  function env(g, t, a, peak, d) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(.0001, t + a + d); }
  function noise(t, dur, type, freq, q, peak, a = .005) { const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    const g = ac.createGain(); env(g, t, a, peak, dur); s.connect(f).connect(g).connect(master); s.start(t, Math.random()); s.stop(t + a + dur + .05); return f; }
  function tone(t, f0, f1, dur, type, peak, a = .004, bus) { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, a, peak, dur); o.connect(g).connect(bus || master); o.start(t); o.stop(t + a + dur + .05); }
  const ok = () => ac && soundOn;
  function cannon(dist = 0) { if (!ok()) return; const t = now() + dist;
    tone(t, 110, 38, .55, 'sine', .55); noise(t, .45, 'lowpass', 900, 0, .7); noise(t + .02, 1.2, 'lowpass', 300, 0, .25, .03); noise(t, .08, 'highpass', 2500, 0, .25); }
  function splash() { if (!ok()) return; const t = now(); const f = noise(t, .5, 'bandpass', 1400, .8, .32, .01); f.frequency.exponentialRampToValueAtTime(500, t + .5); noise(t + .08, .7, 'lowpass', 700, 0, .12, .05); }
  function hit() { if (!ok()) return; const t = now(); noise(t, .12, 'bandpass', 2200, 1.4, .5); tone(t, 220, 90, .18, 'square', .12); noise(t + .03, .5, 'lowpass', 600, 0, .35); tone(t + .05, 140, 70, .35, 'sawtooth', .06); }
  function rock() { if (!ok()) return; const t = now(); noise(t, .2, 'bandpass', 900, 2, .4); tone(t, 90, 50, .3, 'triangle', .2); }
  function creak() { if (!ok()) return; const t = now(); const o = ac.createOscillator(), g = ac.createGain(), v = ac.createOscillator(), vg = ac.createGain();
    o.type = 'sawtooth'; o.frequency.value = 95 + Math.random() * 40; v.frequency.value = 17; vg.gain.value = 12; v.connect(vg).connect(o.frequency);
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700; f.Q.value = 6; env(g, t, .05, .05, .35); o.connect(f).connect(g).connect(master); o.start(t); v.start(t); o.stop(t + .45); v.stop(t + .45); }
  function swoosh() { if (!ok()) return; const t = now(); const f = noise(t, .45, 'bandpass', 600, 1, .14, .12); f.frequency.exponentialRampToValueAtTime(1600, t + .5); }
  function bell() { if (!ok()) return; const t = now(); for (const [f, v] of [[880, .12], [1320, .05], [2210, .03]]) tone(t, f, f, 1.4, 'sine', v); }
  function tick() { if (!ok()) return; tone(now(), 1500, 1200, .04, 'triangle', .06); }
  function clang() { if (!ok()) return; const t = now(); for (const f of [1900, 2800, 3700]) tone(t, f, f * .98, .5, 'triangle', .07); noise(t, .06, 'highpass', 4000, 0, .2); }
  function gull() { if (!ok()) return; const t = now(); for (let i = 0; i < 2; i++) tone(t + i * .22, 1900, 1250, .18, 'sine', .025, .02); }
  function fanfare(win) { if (!ok()) return; const t = now(), seq = win ? [[523, 0], [659, .16], [784, .32], [1047, .5]] : [[392, 0], [349, .3], [311, .6], [262, .9]];
    for (const [f, d] of seq) { tone(t + d, f, f, win ? .5 : .7, 'triangle', .12); tone(t + d, f / 2, f / 2, win ? .5 : .7, 'sine', .06); } }
  // música: colchón suave de acordes (la menor, fa, do, sol) con notas de arpa sueltas; nada de melodía repetitiva
  const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  let ci = 0, next = 0;
  function pad(t, f, dur, v) { const o1 = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
    o1.type = 'triangle'; o2.type = 'sine'; o1.frequency.value = f; o2.frequency.value = f * 1.004; lp.type = 'lowpass'; lp.frequency.value = 900;
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + 1.4); g.gain.linearRampToValueAtTime(v * .8, t + dur - 1); g.gain.linearRampToValueAtTime(.0001, t + dur + .8);
    o1.connect(lp); o2.connect(lp); lp.connect(g).connect(musicBus); o1.start(t); o2.start(t); o1.stop(t + dur + 1); o2.stop(t + dur + 1); }
  function startMusic() { if (!ac || musicTimer) return; musicBus.gain.setTargetAtTime(.6, now(), .8); next = now() + .2;
    musicTimer = setInterval(() => { while (next < now() + 1) { const ch = CHORDS[ci % CHORDS.length], dur = 6;
      for (const m of ch) pad(next, hz(m), dur, .022); pad(next, hz(ch[0] - 12), dur, .03);
      for (let k = 0; k < 4; k++) { const m = ch[Math.floor(Math.random() * 3)] + 12, t = next + .6 + k * 1.3 + Math.random() * .3; tone(t, hz(m), hz(m), 1.6, 'sine', .018, .01, musicBus); }
      next += dur; ci++; } }, 400); }
  function stopMusic() { if (musicTimer) { clearInterval(musicTimer); musicTimer = null; } if (musicBus) musicBus.gain.setTargetAtTime(0, now(), .2); }
  return {
    init, cannon, splash, hit, rock, creak, swoosh, bell, tick, clang, fanfare, gull,
    setSound(on) { soundOn = on; if (master) master.gain.setTargetAtTime(on ? .9 : 0, now(), .05); },
    setMusic(on) { musicOn = on; if (!ac) return; on ? startMusic() : stopMusic(); },
  };
})();
