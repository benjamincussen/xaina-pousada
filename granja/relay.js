// relay.js — sala online por um servidor intermediário (MQTT sobre WebSocket seguro), sem contas.
// Os celulares não se conectam entre si: cada um fala com o servidor, como num chat. Funciona em Wi-Fi e em dados móveis.
// Imita a "sala" usada pelo jogo: join(nome, papel) -> { presence, peers, onPeers, connected, leave }.
// Cada jogador publica sua "presença" (estado, ações, nome) num tópico próprio, guardado no servidor (retain);
// quem chega depois recebe a última presença de cada um. Ao sair, o servidor apaga a presença (last will).
'use strict';
window.RELAY_ROOM = (() => {
  if (!window.mqtt || typeof window.mqtt.connect !== 'function') return null;
  const URLS = window.MQTT_URLS || ['wss://broker.hivemq.com:8884/mqtt', 'wss://broker.emqx.io:8084/mqtt', 'wss://test.mosquitto.org:8081'];
  const NS = 'sitio-do-vento-bc/v1/';
  const STALE = 25000, BEAT = 5000;
  const rid = () => Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
  // id desta aba que sobrevive ao recarregar (atualização): serve para reconhecer o "fantasma" da própria aba
  // que fica uns 30 s no servidor depois de recarregar, e para ficar só com a presença mais nova de cada jogador
  const DEV = (() => { try { let d = sessionStorage.getItem('sitio-dev'); if (!d) { d = rid(); sessionStorage.setItem('sitio-dev', d); } return d; } catch (e) { return rid(); } })();
  function connectAny(me, will) {
    return new Promise((resolve, reject) => {
      let i = 0;
      const next = () => {
        if (i >= URLS.length) return reject({ code: 'upstream_error' });
        const url = URLS[i++]; let done = false;
        const c = window.mqtt.connect(url, { clientId: 'sv_' + me, clean: true, keepalive: 20, reconnectPeriod: 2000, connectTimeout: 7000, will });
        const t = setTimeout(() => { if (done) return; done = true; try { c.end(true); } catch (e) {} next(); }, 8000);
        c.once('connect', () => { if (done) return; done = true; clearTimeout(t); resolve(c); });
        c.once('error', () => { if (done) return; done = true; clearTimeout(t); try { c.end(true); } catch (e) {} next(); });
      };
      next();
    });
  }
  async function join(name, role) {
    const me = rid(), base = NS + name + '/', topic = base + me;
    const client = await connectAny(me, { topic, payload: '', retain: true, qos: 1 });
    const peers = new Map(); let mine = {}, subs = [], snap = Object.freeze([]), left = false;
    const rebuild = () => {
      const now = Date.now(), list = [{ peer: me, sameTab: true, isMe: true, kind: 'viewer', guest: false, by: null, presence: Object.freeze({ ...mine }) }];
      const best = new Map(); for (const [id, p] of peers) { if (now - p.ts >= STALE || p.dev === DEV) continue; const k = p.dev || id, o = best.get(k); if (!o || p.ts > o[1].ts) best.set(k, [id, p]); }
      for (const [id, p] of [...best.values()].sort((a, b) => b[1].ts - a[1].ts)) list.push({ peer: id, sameTab: false, isMe: false, kind: 'viewer', guest: false, by: null, presence: p.pr });
      snap = Object.freeze(list); const ch = { peers: snap };
      Promise.resolve().then(() => subs.slice().forEach(f => { try { f(ch); } catch (e) { console.error(e); } }));
    };
    let pubT = 0, lastPub = 0;
    const publishNow = () => { lastPub = Date.now(); if (!left && client.connected) client.publish(topic, JSON.stringify({ p: mine, ts: Date.now(), dev: DEV }), { retain: true, qos: 0 }); };
    const publish = () => { clearTimeout(pubT); const wait = 120 - (Date.now() - lastPub); if (wait <= 0) publishNow(); else pubT = setTimeout(publishNow, wait); };
    client.on('message', (t, buf) => {
      if (!t.startsWith(base)) return; const id = t.slice(base.length); if (!id || id === me) return;
      if (!buf || !buf.length) { peers.delete(id); rebuild(); return; }
      try { const d = JSON.parse(new TextDecoder().decode(buf)); if (d && d.p && typeof d.p === 'object') { peers.set(id, { pr: Object.freeze(d.p), ts: Math.min(Date.now(), d.ts || Date.now()), dev: d.dev || '' }); rebuild(); } } catch (e) {}
    });
    client.on('connect', () => { if (!left) { client.subscribe(base + '+', { qos: 0 }); publishNow(); } }); // ao reconectar
    await new Promise(res => client.subscribe(base + '+', { qos: 0 }, () => res()));
    const beat = setInterval(() => { if (left) return; publishNow(); rebuild(); }, BEAT);
    const api = {
      name, p2p: true,
      presence: async patch => { mine = { ...mine }; for (const k in patch) { if (patch[k] === null) delete mine[k]; else mine[k] = JSON.parse(JSON.stringify(patch[k])); } publish(); rebuild(); },
      peers: () => snap,
      onPeers: f => { subs.push(f); Promise.resolve().then(() => { if (subs.includes(f)) f({ peers: snap }); }); return () => { subs = subs.filter(x => x !== f); }; },
      connected: () => client.connected,
      leave: async () => { if (left) return; left = true; clearInterval(beat); clearTimeout(pubT); removeEventListener('pagehide', onHide); try { client.publish(topic, '', { retain: true, qos: 1 }); } catch (e) {} setTimeout(() => { try { client.end(true); } catch (e) {} }, 300); subs = []; },
    };
    const onHide = () => { try { client.publish(topic, '', { retain: true, qos: 0 }); } catch (e) {} };
    addEventListener('pagehide', onHide);
    // espera um pouco para receber quem já está na sala
    await new Promise(r => setTimeout(r, 1500));
    const live = () => [...peers.entries()].filter(([, p]) => Date.now() - p.ts < STALE && p.dev !== DEV);
    if (role === 'guest') {
      const t0 = Date.now(); while (!live().some(([, p]) => p.pr.role === 'host') && Date.now() - t0 < 6000) await new Promise(r => setTimeout(r, 300));
      if (!live().some(([, p]) => p.pr.role === 'host')) { await api.leave(); throw { code: 'not_found' }; }
    } else if (live().some(([, p]) => p.pr.role === 'host')) { await api.leave(); throw { code: 'taken' }; }
    rebuild();
    return api;
  }
  return { join, p2p: true, relay: true };
})();
