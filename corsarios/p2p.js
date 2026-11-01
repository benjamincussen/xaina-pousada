// p2p.js — sala online sin cuentas: conexión directa entre los dos celulares (WebRTC con PeerJS).
// Imita la "sala" de claude.ai que usa online.js: join(nombre, rol) → { presence, peers, onPeers, connected, leave }.
// El anfitrión registra un id fijo con el código de la sala; el invitado se conecta a ese id.
'use strict';
window.P2P_ROOM = (() => {
  if (typeof window.Peer !== 'function') return null;
  const OPTS = window.PEER_OPTS || { debug: 0, config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] } };
  const FATAL = ['browser-incompatible', 'invalid-id', 'invalid-key', 'network', 'server-error', 'socket-error', 'socket-closed', 'ssl-unavailable', 'webrtc'];
  function join(name, role) {
    return new Promise((resolve, reject) => {
      const hostId = 'bc-' + name;
      const peer = role === 'host' ? new Peer(hostId, OPTS) : new Peer(OPTS);
      let me = null, conn = null, other = null, mine = {}, subs = [], snap = Object.freeze([]), left = false, settled = false, retryT = null;
      const rebuild = () => {
        const list = [{ peer: me || 'yo', sameTab: true, isMe: true, kind: 'viewer', guest: false, by: null, presence: Object.freeze({ ...mine }) }];
        if (other) list.push({ peer: other.id, sameTab: false, isMe: false, kind: 'viewer', guest: false, by: null, presence: other.pr });
        snap = Object.freeze(list); const ch = { peers: snap };
        Promise.resolve().then(() => subs.slice().forEach(f => { try { f(ch); } catch (e) { console.error(e); } }));
      };
      const send = () => { if (conn && conn.open) try { conn.send({ t: 'p', pr: mine }); } catch (e) {} };
      function leave() { left = true; clearTimeout(retryT); try { if (conn) conn.close(); } catch (e) {} try { peer.destroy(); } catch (e) {} subs = []; }
      const api = {
        name,
        presence: async patch => { mine = { ...mine }; for (const k in patch) { if (patch[k] === null) delete mine[k]; else mine[k] = JSON.parse(JSON.stringify(patch[k])); } send(); rebuild(); },
        peers: () => snap,
        onPeers: f => { subs.push(f); Promise.resolve().then(() => { if (subs.includes(f)) f({ peers: snap }); }); return () => { subs = subs.filter(x => x !== f); }; },
        connected: () => !!(conn && conn.open),
        leave: async () => leave(),
      };
      const done = ok => { if (settled) return; settled = true; clearTimeout(to); ok ? resolve(api) : null; };
      const fail = code => { if (settled) return; settled = true; clearTimeout(to); leave(); reject({ code }); };
      const attach = c => {
        c.on('open', () => {
          if (left) { c.close(); return; }
          if (conn && conn !== c && conn.open) { c.close(); return; } // la sala es de dos
          conn = c; other = { id: c.peer, pr: Object.freeze({}) }; send(); rebuild(); done(true);
        });
        c.on('data', d => { if (c !== conn || !d || d.t !== 'p' || !d.pr || typeof d.pr !== 'object') return; other = { id: c.peer, pr: Object.freeze(d.pr) }; rebuild(); });
        c.on('close', () => { if (c !== conn) return; conn = null; other = null; rebuild(); if (role === 'guest' && !left) retry(); });
        c.on('error', () => {});
      };
      const connect = () => { if (!left) attach(peer.connect(hostId, { reliable: true, serialization: 'json' })); };
      // si se corta, el invitado vuelve a llamar al anfitrión cada 3 s (mismo id: la partida sigue)
      const retry = () => { clearTimeout(retryT); retryT = setTimeout(() => { if (left || (conn && conn.open)) return; if (peer.disconnected && !peer.destroyed) try { peer.reconnect(); } catch (e) {} connect(); retry(); }, 3000); };
      peer.on('open', id => { me = id; rebuild(); if (role === 'host') done(true); else connect(); });
      peer.on('connection', c => { if (role === 'host') attach(c); else c.close(); });
      peer.on('disconnected', () => { if (!left) setTimeout(() => { if (!left && peer.disconnected && !peer.destroyed) try { peer.reconnect(); } catch (e) {} }, 2000); });
      peer.on('error', e => {
        const t = e && e.type;
        if (!settled) { if (t === 'peer-unavailable') return fail('not_found'); if (t === 'unavailable-id') return fail('taken'); if (FATAL.includes(t)) return fail('upstream_error'); }
        else if (t === 'peer-unavailable' && role === 'guest') retry();
      });
      const to = setTimeout(() => fail(role === 'guest' ? 'not_found' : 'upstream_error'), 15000);
    });
  }
  return { join, p2p: true };
})();
