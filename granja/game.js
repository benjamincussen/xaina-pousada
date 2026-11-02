// game.js — Sítio do Vento: um sítio para cuidar sozinho ou com um amigo, no mesmo mapa e ao mesmo tempo.
// Quem cria a sala (ou joga sozinho) é o dono do estado: aplica as ações e salva. O convidado manda ações e guarda uma cópia.
'use strict';
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- idiomas (português e espanhol) ----------
let LANG = (() => { try { const v = localStorage.getItem('sitio-lang'); if (v === 'es' || v === 'pt') return v; } catch (e) {} return /^es/i.test(navigator.language || '') ? 'es' : 'pt'; })();
const NM = {
  pt: { trigo: 'Trigo', milho: 'Milho', cenoura: 'Cenoura', cana: 'Cana', ovo: 'Ovo', leite: 'Leite', racaoG: 'Ração de galinha', racaoV: 'Ração de vaca', pao: 'Pão', bolo: 'Bolo de cenoura', queijo: 'Queijo', acucar: 'Açúcar',
    moinho: 'Moinho', padaria: 'Padaria', queijaria: 'Queijaria', galinheiro: 'Galinheiro', estabulo: 'Estábulo' },
  es: { trigo: 'Trigo', milho: 'Maíz', cenoura: 'Zanahoria', cana: 'Caña', ovo: 'Huevo', leite: 'Leche', racaoG: 'Ración de gallina', racaoV: 'Ración de vaca', pao: 'Pan', bolo: 'Pastel de zanahoria', queijo: 'Queso', acucar: 'Azúcar',
    moinho: 'Molino', padaria: 'Panadería', queijaria: 'Quesería', galinheiro: 'Gallinero', estabulo: 'Establo' },
};
const N = k => NM[LANG][k] || NM.pt[k] || k;
const TX = {
  pt: {
    title: 'Sítio do Vento', intro: 'Plante, cuide dos animais e entregue encomendas. Sozinho ou com um amigo, no mesmo sítio.',
    farmsLbl: 'Seus sítios', joinOr: 'ou entre no sítio de um amigo', enter: 'Entrar', codeAria: 'Código da sala',
    inviteTitle: 'Convide seu amigo', codeLbl: 'Código', shareLbl: 'Ou mande este link', linkAria: 'Link da sala', copy: 'Copiar', copied: 'Copiado', keepPlaying: 'Continuar jogando',
    canvasAria: 'O sítio. Arraste para se mover e toque nos canteiros, animais e construções.', lvlAria: 'Nível', coinsAria: 'Moedas', ordersAria: 'Encomendas', barnAria: 'Celeiro', shopAria: 'Loja', menuAria: 'Menu', close: 'Fechar',
    myFarm: 'Meu sítio', friendFarm: 'Sítio do amigo', lvl: n => `Nível ${n}`, own: 'seu sítio', copyHere: 'cópia salva aqui', play: 'Jogar', friendBtn: '+ Amigo', inviteAria: n => `Convidar amigo para ${n}`,
    code4: 'O código tem 4 letras.', unlockAt: n => `Libera no nível ${n}`, noCoins: 'Moedas insuficientes', barnFull: 'O celeiro está cheio', queueFull: 'A fila está cheia',
    missingIng: 'Faltam ingredientes', notReady: 'Ainda não está pronto', needFeed: k => `Precisa de ${N(k)}`, producing: 'Os animais ainda estão produzindo', missingProd: 'Faltam produtos',
    readyIn: (k, t) => `${N(k)}: pronto em ${t}`, unlockName: (n, l) => `${n}: libera no nível ${l}`, lvlUp: (l, x) => `Nível ${l}! ${x}`, news: x => `Novo: ${x}.`,
    noFriendMode: 'O modo com amigo não está disponível nesta página.', notFound: 'Não achei uma sala com esse código. Confira as letras ou peça para seu amigo criar de novo.',
    noConn: 'Não foi possível conectar. Confira a internet e tente de novo.', roomLost: 'A conexão com a sala caiu', creating: 'Criando a sala…', searching: c => `Procurando a sala ${c}…`,
    connected: 'Conectado! Esperando o sítio do seu amigo…', friendIn: 'Seu amigo entrou! Vocês já estão no mesmo sítio.', waitFriend: 'Mande o código ou o link para seu amigo. Pode continuar jogando enquanto isso.',
    friendJoined: 'Seu amigo entrou no sítio!', friendLeft: 'Seu amigo saiu do sítio', loadedFriend: 'Carregamos o progresso que seu amigo fez', youJoined: n => `Você entrou no ${n}!`,
    lostFriend: 'Perdemos a conexão com seu amigo…', connDropped: 'A conexão caiu. O sítio ficou salvo aqui como "Sítio do amigo": você pode continuar sozinho.',
    coopGuest: 'No sítio do seu amigo', coopHost: 'Seu amigo está aqui', plant: 'Plantar', plantSub: 'Escolha o que plantar neste canteiro.',
    coins: n => n === 1 ? '1 moeda' : `${n} moedas`, yields: n => `colhe ${n}`, empty: 'vazio', ready: 'pronto', queued: 'na fila', collect: 'Recolher', make: 'Fazer',
    penSub: (n, k, h, b, r) => `${n} ${k === 'galinheiro' ? 'galinhas' : 'vacas'}: ${h} com fome, ${b} produzindo, ${r} prontas.`,
    youHave: n => `Você tem ${n}. Faça mais no Moinho.`, nextIn: (k, t) => `Próximo ${N(k).toLowerCase()} em ${t}`, collectX: k => `Recolher ${N(k).toLowerCase()}`, feed: 'Alimentar',
    barn: 'Celeiro', barnUsed: (n, c) => `${n} de ${c} lugares ocupados`, barnEmpty: 'Vazio. Colha os canteiros para encher o celeiro.', barnUp: 'Aumentar celeiro (+25)',
    orders: 'Encomendas', ordersSub: 'O pessoal da vila paga bem. Entregue para ganhar moedas e experiência.', newOrderIn: t => `Nova encomenda chegando em ${t}…`, discardAria: 'Descartar encomenda', deliver: 'Entregar',
    shop: 'Loja', newPlot: 'Novo canteiro', allBought: 'Todos comprados', plotsOf: (n, m) => `${n} de ${m} canteiros`, bigBarn: 'Celeiro maior (+25)', fitsNow: c => `Hoje cabem ${c} itens`,
    soon: 'Em breve', expansion: 'expansão', exps: ['Pomar de frutas', 'Apiário com mel', 'Barco de pesca', 'Feira da vila'],
    stats: (l, x, c) => `Nível ${l} · ${x} de experiência · ${c} moedas`, guestNote: 'Você está no sítio do seu amigo. Tudo o que fizer fica salvo nos dois celulares.',
    seeCode: 'Ver código da sala', invite: 'Convidar um amigo', backHome: 'Voltar ao início', langLbl: 'Idioma', buy: 'Comprar', board: 'ENCOMENDAS',
    nameLbl: 'Seu nome', namePh: 'Como você se chama?', lookLbl: 'Seu personagem', lookHat: 'Chapéu de palha', lookHair: 'Cabelo comprido', needName: 'Escreva seu nome primeiro.',
    farmOf: n => `Sítio de ${n}`, coopHostN: n => `${n} está aqui`, coopGuestN: n => `No sítio de ${n}`, joinedN: n => `${n} entrou no sítio!`, leftN: n => `${n} saiu do sítio`, friend: 'Amigo',
  },
  es: {
    title: 'Granja del Viento', intro: 'Siembra, cuida a los animales y entrega pedidos. Solo o con un amigo, en la misma granja.',
    farmsLbl: 'Tus granjas', joinOr: 'o entra a la granja de un amigo', enter: 'Entrar', codeAria: 'Código de la sala',
    inviteTitle: 'Invita a tu amigo', codeLbl: 'Código', shareLbl: 'O mándale este enlace', linkAria: 'Enlace de la sala', copy: 'Copiar', copied: 'Copiado', keepPlaying: 'Seguir jugando',
    canvasAria: 'La granja. Arrastra para moverte y toca las parcelas, animales y construcciones.', lvlAria: 'Nivel', coinsAria: 'Monedas', ordersAria: 'Pedidos', barnAria: 'Granero', shopAria: 'Tienda', menuAria: 'Menú', close: 'Cerrar',
    myFarm: 'Mi granja', friendFarm: 'Granja del amigo', lvl: n => `Nivel ${n}`, own: 'tu granja', copyHere: 'copia guardada aquí', play: 'Jugar', friendBtn: '+ Amigo', inviteAria: n => `Invitar a un amigo a ${n}`,
    code4: 'El código tiene 4 letras.', unlockAt: n => `Se desbloquea en el nivel ${n}`, noCoins: 'No te alcanzan las monedas', barnFull: 'El granero está lleno', queueFull: 'La fila está llena',
    missingIng: 'Faltan ingredientes', notReady: 'Todavía no está listo', needFeed: k => `Necesitas ${N(k)}`, producing: 'Los animales todavía están produciendo', missingProd: 'Faltan productos',
    readyIn: (k, t) => `${N(k)}: listo en ${t}`, unlockName: (n, l) => `${n}: se desbloquea en el nivel ${l}`, lvlUp: (l, x) => `¡Nivel ${l}! ${x}`, news: x => `Nuevo: ${x}.`,
    noFriendMode: 'El modo con amigo no está disponible en esta página.', notFound: 'No encontré una sala con ese código. Revisa las letras o pide a tu amigo que la cree de nuevo.',
    noConn: 'No se pudo conectar. Revisa tu internet y prueba de nuevo.', roomLost: 'Se cortó la conexión con la sala', creating: 'Creando la sala…', searching: c => `Buscando la sala ${c}…`,
    connected: '¡Conectado! Esperando la granja de tu amigo…', friendIn: '¡Tu amigo entró! Ya están en la misma granja.', waitFriend: 'Mándale el código o el enlace a tu amigo. Puedes seguir jugando mientras tanto.',
    friendJoined: '¡Tu amigo entró a la granja!', friendLeft: 'Tu amigo salió de la granja', loadedFriend: 'Cargamos el avance que hizo tu amigo', youJoined: n => `¡Entraste a ${n}!`,
    lostFriend: 'Se perdió la conexión con tu amigo…', connDropped: 'Se cortó la conexión. La granja quedó guardada aquí como "Granja del amigo": puedes seguir solo.',
    coopGuest: 'En la granja de tu amigo', coopHost: 'Tu amigo está aquí', plant: 'Sembrar', plantSub: 'Elige qué sembrar en esta parcela.',
    coins: n => n === 1 ? '1 moneda' : `${n} monedas`, yields: n => `cosechas ${n}`, empty: 'vacío', ready: 'listo', queued: 'en fila', collect: 'Recoger', make: 'Hacer',
    penSub: (n, k, h, b, r) => `${n} ${k === 'galinheiro' ? 'gallinas' : 'vacas'}: ${h} con hambre, ${b} produciendo, ${r} listas.`,
    youHave: n => `Tienes ${n}. Haz más en el Molino.`, nextIn: (k, t) => `Siguiente ${N(k).toLowerCase()} en ${t}`, collectX: k => `Recoger ${N(k).toLowerCase()}`, feed: 'Alimentar',
    barn: 'Granero', barnUsed: (n, c) => `${n} de ${c} espacios ocupados`, barnEmpty: 'Vacío. Cosecha las parcelas para llenar el granero.', barnUp: 'Ampliar granero (+25)',
    orders: 'Pedidos', ordersSub: 'La gente del pueblo paga bien. Entrega para ganar monedas y experiencia.', newOrderIn: t => `Llega un pedido nuevo en ${t}…`, discardAria: 'Descartar pedido', deliver: 'Entregar',
    shop: 'Tienda', newPlot: 'Nueva parcela', allBought: 'Todas compradas', plotsOf: (n, m) => `${n} de ${m} parcelas`, bigBarn: 'Granero más grande (+25)', fitsNow: c => `Hoy caben ${c} cosas`,
    soon: 'Muy pronto', expansion: 'expansión', exps: ['Huerto de frutas', 'Colmenas con miel', 'Barco de pesca', 'Feria del pueblo'],
    stats: (l, x, c) => `Nivel ${l} · ${x} de experiencia · ${c} monedas`, guestNote: 'Estás en la granja de tu amigo. Todo lo que hagas queda guardado en los dos celulares.',
    seeCode: 'Ver código de la sala', invite: 'Invitar a un amigo', backHome: 'Volver al inicio', langLbl: 'Idioma', buy: 'Comprar', board: 'PEDIDOS',
    nameLbl: 'Tu nombre', namePh: '¿Cómo te llamas?', lookLbl: 'Tu personaje', lookHat: 'Sombrero de paja', lookHair: 'Pelo largo', needName: 'Escribe tu nombre primero.',
    farmOf: n => `Granja de ${n}`, coopHostN: n => `${n} está aquí`, coopGuestN: n => `En la granja de ${n}`, joinedN: n => `¡${n} entró a la granja!`, leftN: n => `${n} salió de la granja`, friend: 'Amigo',
  },
};
const L = (k, ...a) => { const v = TX[LANG][k] ?? TX.pt[k] ?? k; return typeof v === 'function' ? v(...a) : v; };
const dispName = n => (!n || n === 'Meu sítio' || n === 'Mi granja') ? L('myFarm') : n;
const langButtons = () => `<div class="langs" role="group" aria-label="${L('langLbl')}">${[['pt', 'Português'], ['es', 'Español']].map(([k, n]) => `<button type="button" data-lang="${k}" aria-pressed="${LANG === k}">${n}</button>`).join('')}</div>`;
function setLang(l) {
  if (l !== 'pt' && l !== 'es') return; LANG = l; try { localStorage.setItem('sitio-lang', l); } catch (e) {}
  applyLang(); renderFarms(); if (!$('ovRoom').hidden && NET.room) renderRoom(); updCoop(); if (SH) { $('sBody').dataset.sig = ''; renderSheet(); } refresh();
}
function applyLang() {
  document.documentElement.lang = LANG === 'es' ? 'es' : 'pt-BR'; document.title = L('title');
  const set = (id, k) => { const e = $(id); if (e) e.textContent = L(k); };
  set('tTitle', 'title'); set('tIntro', 'intro'); set('tFarms', 'farmsLbl'); set('tJoinOr', 'joinOr'); set('bJoin', 'enter'); set('tInvite', 'inviteTitle'); set('tCodeLbl', 'codeLbl'); set('tShareLbl', 'shareLbl'); set('bCopy', 'copy'); set('bRoomOk', 'keepPlaying'); set('tName', 'nameLbl'); set('tLook', 'lookLbl'); set('lkHat', 'lookHat'); set('lkHair', 'lookHair'); $('iName').placeholder = L('namePh');
  const aria = { iCode: 'codeAria', rLink: 'linkAria', cv: 'canvasAria', hLvl: 'lvlAria', hCoins: 'coinsAria', bOrders: 'ordersAria', bBarn: 'barnAria', bShop: 'shopAria', bMenu: 'menuAria', sClose: 'close' };
  for (const [id, k] of Object.entries(aria)) { const e = $(id); if (e) e.setAttribute('aria-label', L(k)); }
  $('mLangs').innerHTML = langButtons();
}
document.addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (b) { setLang(b.dataset.lang); SND.pop(); } });

// ---------- dados do jogo ----------
const ITEMS = {
  trigo: { n: 'Trigo', v: 2 }, milho: { n: 'Milho', v: 4 }, cenoura: { n: 'Cenoura', v: 7 }, cana: { n: 'Cana', v: 10 },
  ovo: { n: 'Ovo', v: 9 }, leite: { n: 'Leite', v: 16 }, racaoG: { n: 'Ração de galinha', v: 4 }, racaoV: { n: 'Ração de vaca', v: 7 },
  pao: { n: 'Pão', v: 15 }, bolo: { n: 'Bolo de cenoura', v: 42 }, queijo: { n: 'Queijo', v: 44 }, acucar: { n: 'Açúcar', v: 26 },
};
const CROPS = {
  trigo: { t: 20, y: 2, cost: 1, lvl: 1, xp: 1 }, milho: { t: 60, y: 2, cost: 2, lvl: 1, xp: 2 },
  cenoura: { t: 120, y: 2, cost: 4, lvl: 2, xp: 3 }, cana: { t: 240, y: 2, cost: 6, lvl: 4, xp: 5 },
};
const BUILD = {
  moinho: { n: 'Moinho', lvl: 1, q: 3, x: 320, y: 205, w: 96, h: 120, rec: [
    { o: 'racaoG', k: 3, i: { trigo: 2, milho: 1 }, t: 30, lvl: 1, xp: 2 },
    { o: 'racaoV', k: 3, i: { milho: 2, cenoura: 1 }, t: 45, lvl: 3, xp: 3 },
    { o: 'acucar', k: 1, i: { cana: 2 }, t: 60, lvl: 5, xp: 4 }] },
  padaria: { n: 'Padaria', lvl: 2, q: 3, x: 84, y: 560, w: 116, h: 84, rec: [
    { o: 'pao', k: 1, i: { trigo: 3 }, t: 60, lvl: 2, xp: 3 },
    { o: 'bolo', k: 1, i: { cenoura: 2, ovo: 1, trigo: 1 }, t: 150, lvl: 3, xp: 6 }] },
  queijaria: { n: 'Queijaria', lvl: 4, q: 2, x: 556, y: 560, w: 116, h: 84, rec: [
    { o: 'queijo', k: 1, i: { leite: 2 }, t: 120, lvl: 4, xp: 6 }] },
};
const PENS = {
  galinheiro: { n: 'Galinheiro', lvl: 1, feed: 'racaoG', out: 'ovo', t: 90, count: 3, xp: 2, x: 125, y: 790, w: 210, h: 140 },
  estabulo: { n: 'Estábulo', lvl: 3, feed: 'racaoV', out: 'leite', t: 180, count: 2, xp: 4, x: 515, y: 790, w: 210, h: 140 },
};
const BARN = { x: 548, y: 205, w: 124, h: 96 }, HOUSE = { x: 96, y: 205, w: 120, h: 86 }, BOARD = { x: 320, y: 905, w: 120, h: 70 };
const LV = [0, 12, 35, 70, 120, 190, 280, 400, 550, 750, 1000, 1300];
const MAXPLOTS = 12, PLOT0 = 6, WW = 640, WH = 980;
const plotRect = i => ({ x: 168 + (i % 3) * 104, y: 290 + Math.floor(i / 3) * 82, w: 96, h: 72 });
const plotCost = np => Math.round(25 * Math.pow(1.55, np - PLOT0));
const capCost = cap => 80 + (cap - 50) / 25 * 70;

// ---------- estado ----------
const rid = () => Math.random().toString(36).slice(2, 10);
function newFarm(name) {
  return { v: 1, fid: rid(), rev: 0, name, coins: 60, xp: 0, lvl: 1, cap: 50, np: PLOT0,
    plots: Array.from({ length: MAXPLOTS }, () => ({ c: null, p: 0 })), inv: { trigo: 4, milho: 2 },
    bld: { moinho: { q: [] }, padaria: { q: [] }, queijaria: { q: [] } },
    pens: { galinheiro: { a: [0, 0, 0] }, estabulo: { a: [0, 0] } }, orders: [], oid: 1 };
}
const invCount = S => Object.values(S.inv).reduce((a, b) => a + b, 0);
const has = (S, need) => Object.entries(need).every(([k, q]) => (S.inv[k] || 0) >= q);
function take(S, need) { for (const [k, q] of Object.entries(need)) { S.inv[k] -= q; if (S.inv[k] <= 0) delete S.inv[k]; } }
const give = (S, k, q) => { S.inv[k] = (S.inv[k] || 0) + q; };
const plotReady = (pl, now) => pl.c && now >= pl.p + CROPS[pl.c].t * 1000;
function addXp(S, x, out) { S.xp += x; while (S.lvl < LV.length && S.xp >= LV[S.lvl]) { S.lvl++; S.coins += 20 * S.lvl; out.fx.push(['lvl', S.lvl]); } }
function unlockedItems(S) {
  const out = [];
  for (const [k, c] of Object.entries(CROPS)) if (c.lvl <= S.lvl) out.push(k);
  for (const p of Object.values(PENS)) if (p.lvl <= S.lvl) out.push(p.out);
  for (const b of Object.values(BUILD)) if (b.lvl <= S.lvl) for (const r of b.rec) if (r.lvl <= S.lvl && !r.o.startsWith('racao')) out.push(r.o);
  return out;
}
function genOrder(S) {
  const items = unlockedItems(S), kinds = 1 + (items.length > 2 && Math.random() < 0.55 ? 1 : 0) + (S.lvl >= 3 && Math.random() < 0.3 ? 1 : 0), it = [];
  const pool = items.slice();
  for (let i = 0; i < kinds && pool.length; i++) { const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]; const q = clamp(Math.round((8 + S.lvl * 4) / ITEMS[k].v * (0.6 + Math.random() * 0.8)), 1, 8); it.push([k, q]); }
  const val = it.reduce((a, [k, q]) => a + ITEMS[k].v * q, 0);
  return { it, c: Math.round(val * 1.4) + 5, x: Math.round(val / 3) + 1 };
}
function ensureOrders(S) { let ch = false; while (S.orders.length < 3) { S.orders.push({ id: S.oid++, w: 0, ...genOrder(S) }); ch = true; } return ch; }
function packQ(b, now) { let t = now; for (const j of b.q) { j.s = Math.max(t, j.s); j.e = Math.max(j.e, j.s); t = j.e; } }
// aplica uma ação; devolve {ok, msg, fx}. Determinístico a partir de "now", exceto as encomendas novas (só o dono gera).
function apply(S, a, now) {
  const out = { ok: false, msg: '', fx: [] }, fail = m => (out.msg = m, out);
  if (!a || typeof a !== 'object') return fail('');
  if (a.a === 'plant') {
    const i = a.i | 0, pl = S.plots[i], c = CROPS[a.c];
    if (!pl || i >= S.np || pl.c || !c) return fail('');
    if (c.lvl > S.lvl) return fail(L('unlockAt', c.lvl));
    if (S.coins < c.cost) return fail(L('noCoins'));
    S.coins -= c.cost; S.plots[i] = { c: a.c, p: now }; out.fx.push(['plant', i]);
  } else if (a.a === 'harvest') {
    const i = a.i | 0, pl = S.plots[i]; if (!pl || !plotReady(pl, now)) return fail('');
    const c = CROPS[pl.c]; if (invCount(S) + c.y > S.cap) return fail(L('barnFull'));
    give(S, pl.c, c.y); out.fx.push(['gain', pl.c, c.y, 'plot', i]); addXp(S, c.xp, out); S.plots[i] = { c: null, p: 0 };
  } else if (a.a === 'craft') {
    const B = BUILD[a.b], r = B && B.rec[a.r | 0], st = B && S.bld[a.b];
    if (!r || B.lvl > S.lvl || r.lvl > S.lvl) return fail('');
    if (st.q.length >= B.q) return fail(L('queueFull'));
    if (!has(S, r.i)) return fail(L('missingIng'));
    take(S, r.i); const s = st.q.length ? Math.max(now, st.q[st.q.length - 1].e) : now;
    st.q.push({ r: a.r | 0, s, e: s + r.t * 1000 }); out.fx.push(['craft', a.b]);
  } else if (a.a === 'collect') {
    const B = BUILD[a.b], st = B && S.bld[a.b]; if (!st) return fail('');
    let n = 0; while (st.q.length && st.q[0].e <= now) { const r = B.rec[st.q[0].r]; if (invCount(S) + r.k > S.cap) { if (!n) return fail(L('barnFull')); break; } give(S, r.o, r.k); addXp(S, r.xp, out); out.fx.push(['gain', r.o, r.k, 'bld', a.b]); st.q.shift(); n++; }
    if (!n) return fail(L('notReady')); packQ(st, now);
  } else if (a.a === 'pen') {
    const P = PENS[a.k], st = P && S.pens[a.k]; if (!st || P.lvl > S.lvl) return fail('');
    let got = 0;
    for (let j = 0; j < st.a.length; j++) if (st.a[j] && now >= st.a[j] + P.t * 1000) { if (invCount(S) + 1 > S.cap) { if (!got) return fail(L('barnFull')); break; } give(S, P.out, 1); addXp(S, P.xp, out); st.a[j] = 0; got++; }
    if (got) out.fx.push(['gain', P.out, got, 'pen', a.k]);
    else { let fed = 0; for (let j = 0; j < st.a.length; j++) if (!st.a[j] && (S.inv[P.feed] || 0) > 0) { take(S, { [P.feed]: 1 }); st.a[j] = now; fed++; }
      if (!fed) return fail(st.a.some(x => !x) ? L('needFeed', P.feed) : L('producing')); out.fx.push(['feed', a.k, fed]); }
  } else if (a.a === 'deliver') {
    const o = S.orders.find(x => x.id === a.id); if (!o || o.w > now) return fail('');
    const need = Object.fromEntries(o.it); if (!has(S, need)) return fail(L('missingProd'));
    take(S, need); S.coins += o.c; addXp(S, o.x, out); out.fx.push(['coins', o.c]);
    Object.assign(o, { id: S.oid++, w: now + 12000 }, genOrder(S));
  } else if (a.a === 'discard') {
    const o = S.orders.find(x => x.id === a.id); if (!o || o.w > now) return fail('');
    Object.assign(o, { id: S.oid++, w: now + 40000 }, genOrder(S));
  } else if (a.a === 'buyPlot') {
    if (S.np >= MAXPLOTS) return fail(''); const c = plotCost(S.np); if (S.coins < c) return fail(L('noCoins'));
    S.coins -= c; S.np++; out.fx.push(['coins', -c]);
  } else if (a.a === 'cap') {
    const c = capCost(S.cap); if (S.coins < c) return fail(L('noCoins')); S.coins -= c; S.cap += 25;
  } else return fail('');
  out.ok = true; S.rev++; return out;
}
function sane(S) { return S && S.v === 1 && typeof S.fid === 'string' && Array.isArray(S.plots) && S.inv && S.bld && S.pens && Array.isArray(S.orders); }

// ---------- salvar ----------
const IDX = 'sitio-index';
function loadIdx() { try { return JSON.parse(localStorage.getItem(IDX)) || []; } catch (e) { return []; } }
function saveIdx(x) { try { localStorage.setItem(IDX, JSON.stringify(x)); } catch (e) {} }
function loadFarm(fid) { try { const s = JSON.parse(localStorage.getItem('sitio-farm-' + fid)); return sane(s) ? s : null; } catch (e) { return null; } }
function storeFarm(S, own) {
  try { localStorage.setItem('sitio-farm-' + S.fid, JSON.stringify(S)); } catch (e) {}
  const idx = loadIdx(), m = idx.find(x => x.fid === S.fid), meta = { fid: S.fid, name: S.name, owner: S.owner || '', lvl: S.lvl, rev: S.rev, own: m ? m.own : !!own, last: Date.now() };
  if (m) Object.assign(m, meta); else idx.push(meta); saveIdx(idx);
}
let saveT = 0;
function saveSoon() { clearTimeout(saveT); saveT = setTimeout(() => { if (G.S) storeFarm(G.S); }, 400); }

// ---------- ícones (desenhados, sem imagens externas) ----------
function drawIcon(g, k, s) {
  g.save(); g.scale(s / 100, s / 100); g.lineJoin = 'round'; g.lineCap = 'round';
  const blob = (x, y, rx, ry, c, st) => { g.fillStyle = c; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.283); g.fill(); if (st) { g.strokeStyle = st; g.lineWidth = 4; g.stroke(); } };
  const sack = (c1, c2, dots) => { g.fillStyle = c1; g.beginPath(); g.moveTo(26, 34); g.quadraticCurveTo(16, 70, 26, 88); g.lineTo(74, 88); g.quadraticCurveTo(84, 70, 74, 34); g.closePath(); g.fill(); g.strokeStyle = '#5a3a1a'; g.lineWidth = 4; g.stroke();
    g.fillStyle = c2; g.beginPath(); g.moveTo(30, 34); g.lineTo(40, 18); g.lineTo(60, 18); g.lineTo(70, 34); g.closePath(); g.fill(); g.stroke(); g.fillStyle = dots; for (let i = 0; i < 6; i++) blob(36 + (i % 3) * 14, 56 + Math.floor(i / 3) * 14, 5, 4, dots); };
  switch (k) {
    case 'trigo': for (const [x, r] of [[34, -0.25], [50, 0], [66, 0.25]]) { g.save(); g.translate(x, 90); g.rotate(r); g.strokeStyle = '#c9902a'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -55); g.stroke(); for (let j = 0; j < 4; j++) { blob(-6, -50 + j * 9, 6, 9, '#f2c14e', '#b8862a'); blob(6, -50 + j * 9, 6, 9, '#f2c14e', '#b8862a'); } g.restore(); } break;
    case 'milho': g.fillStyle = '#5aa83c'; g.beginPath(); g.moveTo(50, 92); g.quadraticCurveTo(18, 60, 30, 24); g.quadraticCurveTo(40, 60, 50, 92); g.fill(); g.beginPath(); g.moveTo(50, 92); g.quadraticCurveTo(82, 60, 70, 24); g.quadraticCurveTo(60, 60, 50, 92); g.fill(); blob(50, 48, 15, 34, '#ffd23f', '#c99a10'); g.fillStyle = '#e6b412'; for (let y = 22; y < 78; y += 9) for (let x = 42; x <= 58; x += 8) blob(x, y, 3, 3, '#e6b412'); break;
    case 'cenoura': g.fillStyle = '#4fae3a'; for (const a of [-0.5, 0, 0.5]) { g.save(); g.translate(50, 30); g.rotate(a); g.beginPath(); g.ellipse(0, -12, 7, 16, 0, 0, 6.283); g.fill(); g.restore(); } g.fillStyle = '#ff8c1a'; g.beginPath(); g.moveTo(30, 32); g.quadraticCurveTo(50, 26, 70, 32); g.lineTo(52, 94); g.quadraticCurveTo(50, 97, 48, 94); g.closePath(); g.fill(); g.strokeStyle = '#c4610a'; g.lineWidth = 4; g.stroke(); g.lineWidth = 3; for (const y of [48, 62, 76]) { g.beginPath(); g.moveTo(40, y); g.lineTo(50, y + 2); g.stroke(); } break;
    case 'cana': for (const x of [36, 54, 70]) { g.fillStyle = '#7cc04b'; g.fillRect(x - 6, 14, 12, 80); g.strokeStyle = '#3f7f22'; g.lineWidth = 3; g.strokeRect(x - 6, 14, 12, 80); for (const y of [34, 56, 76]) { g.beginPath(); g.moveTo(x - 6, y); g.lineTo(x + 6, y); g.stroke(); } } g.fillStyle = '#4f9a2f'; g.beginPath(); g.moveTo(54, 16); g.quadraticCurveTo(84, 4, 92, 24); g.quadraticCurveTo(76, 14, 54, 22); g.fill(); break;
    case 'ovo': blob(50, 56, 26, 34, '#fff3dc', '#c9a97a'); blob(42, 44, 6, 9, '#ffffff'); break;
    case 'leite': g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(34, 30); g.lineTo(34, 88); g.quadraticCurveTo(50, 94, 66, 88); g.lineTo(66, 30); g.lineTo(58, 16); g.lineTo(42, 16); g.closePath(); g.fill(); g.strokeStyle = '#7a9cb8'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#3f8fd1'; g.fillRect(40, 8, 20, 10); g.fillRect(35, 50, 30, 18); break;
    case 'racaoG': sack('#d9b77a', '#c49a55', '#f2c14e'); break;
    case 'racaoV': sack('#a9c97a', '#8fb05e', '#6b8f3a'); break;
    case 'pao': g.fillStyle = '#c9802f'; g.beginPath(); g.ellipse(50, 62, 38, 24, 0, 3.14, 6.283); g.lineTo(88, 74); g.lineTo(12, 74); g.closePath(); g.fill(); blob(50, 56, 38, 22, '#d9913a', '#8a5420'); g.strokeStyle = '#f6d39a'; g.lineWidth = 4; for (const x of [32, 48, 64]) { g.beginPath(); g.moveTo(x, 46); g.lineTo(x + 8, 62); g.stroke(); } break;
    case 'bolo': g.fillStyle = '#f08a3c'; g.fillRect(16, 46, 68, 40); g.fillStyle = '#c86a24'; g.fillRect(16, 64, 68, 6); g.fillStyle = '#fff4e0'; g.beginPath(); g.moveTo(14, 46); g.quadraticCurveTo(50, 26, 86, 46); g.lineTo(86, 52); for (let x = 86; x >= 14; x -= 12) g.quadraticCurveTo(x - 6, 62, x - 12, 52); g.closePath(); g.fill(); g.strokeStyle = '#8a4a1a'; g.lineWidth = 4; g.strokeRect(16, 46, 68, 40); blob(50, 30, 6, 6, '#e0533d'); break;
    case 'queijo': g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(12, 74); g.lineTo(84, 40); g.lineTo(88, 74); g.closePath(); g.fill(); g.strokeStyle = '#c99a10'; g.lineWidth = 4; g.stroke(); for (const [x, y, r] of [[60, 62, 6], [76, 56, 4], [42, 68, 4], [80, 68, 3]]) blob(x, y, r, r, '#e6b412'); break;
    case 'acucar': g.fillStyle = '#ffffff'; g.strokeStyle = '#9fb3c8'; g.lineWidth = 4; for (const [x, y] of [[22, 52], [52, 52], [37, 24]]) { g.fillRect(x, y, 28, 28); g.strokeRect(x, y, 28, 28); } break;
    case 'coin': blob(50, 50, 40, 40, '#ffc23a', '#c98a10'); blob(50, 50, 28, 28, '#ffd76a'); g.fillStyle = '#c98a10'; g.font = '900 40px Nunito, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 50, 53); break;
    case 'orders': g.fillStyle = '#c9905a'; g.fillRect(16, 14, 68, 72); g.strokeStyle = '#7a4b25'; g.lineWidth = 5; g.strokeRect(16, 14, 68, 72); g.fillStyle = '#fff'; g.fillRect(26, 24, 22, 28); g.fillRect(52, 30, 22, 26); g.fillRect(30, 58, 40, 20); g.fillStyle = '#e0533d'; blob(37, 25, 4, 4, '#e0533d'); blob(63, 31, 4, 4, '#e0533d'); blob(50, 59, 4, 4, '#e0533d'); break;
    case 'barn': g.fillStyle = '#d9483b'; g.fillRect(18, 44, 64, 44); g.fillStyle = '#8a2a20'; g.beginPath(); g.moveTo(10, 46); g.lineTo(50, 14); g.lineTo(90, 46); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.fillRect(38, 58, 24, 30); g.strokeStyle = '#d9483b'; g.lineWidth = 4; g.beginPath(); g.moveTo(38, 58); g.lineTo(62, 88); g.moveTo(62, 58); g.lineTo(38, 88); g.stroke(); break;
    case 'shop': g.fillStyle = '#ffffff'; g.fillRect(18, 40, 64, 48); g.strokeStyle = '#7a4b25'; g.lineWidth = 4; g.strokeRect(18, 40, 64, 48); for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#fff' : '#3f8fd1'; g.beginPath(); g.moveTo(14 + i * 18, 40); g.lineTo(32 + i * 18, 40); g.lineTo(30 + i * 18, 22); g.lineTo(18 + i * 18, 22); g.closePath(); g.fill(); } g.fillStyle = '#7a4b25'; g.fillRect(40, 60, 20, 28); break;
    case 'star': g.fillStyle = '#4aa8ef'; g.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 18 : 42, a = -Math.PI / 2 + i * Math.PI / 5; g.lineTo(50 + Math.cos(a) * r, 52 + Math.sin(a) * r); } g.closePath(); g.fill(); g.strokeStyle = '#1d5a8f'; g.lineWidth = 4; g.stroke(); break;
  }
  g.restore();
}
const ICON_URL = {}, ICON_CV = {};
function iconCanvas(k) { if (!ICON_CV[k]) { const c = document.createElement('canvas'); c.width = c.height = 96; drawIcon(c.getContext('2d'), k, 96); ICON_CV[k] = c; } return ICON_CV[k]; }
function icon(k) { if (!ICON_URL[k]) ICON_URL[k] = iconCanvas(k).toDataURL(); return ICON_URL[k]; }
const img = (k, alt = '') => `<img src="${icon(k)}" alt="${alt}">`;

// ---------- som ----------
const SND = (() => { let ac = null;
  const init = () => { if (ac) { if (ac.state === 'suspended') ac.resume(); return; } try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} };
  const tone = (f0, f1, d, type, p, del = 0) => { if (!ac) return; const t = ac.currentTime + del, o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(p, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + d + 0.05); };
  return { init, pop: () => tone(500, 900, 0.12, 'sine', 0.12), coin: () => { tone(988, 988, 0.08, 'square', 0.05); tone(1319, 1319, 0.2, 'square', 0.05, 0.07); },
    plant: () => tone(300, 180, 0.12, 'triangle', 0.12), no: () => tone(220, 160, 0.15, 'square', 0.05),
    lvl: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.25, 'triangle', 0.1, i * 0.1)) }; })();
addEventListener('pointerdown', () => SND.init(), { capture: true });

// ---------- personagens ----------
const ME = { name: '', look: 'hat' };
try { ME.name = (localStorage.getItem('sitio-name') || '').slice(0, 16); ME.look = localStorage.getItem('sitio-look') === 'hair' ? 'hair' : 'hat'; } catch (e) {}
const AV = { me: { x: 150, y: 262, tx: 150, ty: 262, t: 0 }, fr: { x: 196, y: 268, tx: 196, ty: 268, t: 0, on: false, name: '', look: 'hair' } };
const ownerName = S => S && S.owner ? S.owner : '';
const farmTitle = S => ownerName(S) ? L('farmOf', ownerName(S)) : dispName(S && S.name);
function meInfo() { return { n: ME.name, l: ME.look }; }
function sendMe() { if (NET.room) NET.room.presence({ me: meInfo() }).catch(() => {}); }
function walkTo(av, x, y) { av.tx = clamp(x, 20, WW - 20); av.ty = clamp(y + 18, 40, WH - 30); }
function stepAv(av, dt) { const dx = av.tx - av.x, dy = av.ty - av.y, d = Math.hypot(dx, dy), sp = 240 * dt; if (d > 1) { const k = Math.min(1, sp / d); av.x += dx * k; av.y += dy * k; av.t += dt; av.dir = dx >= 0 ? 1 : -1; av.walk = true; } else av.walk = false; }
function drawAv(g, av, name, look, T, mine) {
  const x = av.x, y = av.y, step = av.walk ? Math.sin(av.t * 14) : 0, bob = av.walk ? Math.abs(Math.sin(av.t * 14)) * 2 : 0, d = av.dir || 1;
  const shirt = look === 'hair' ? '#9b5de5' : '#ff8a1f', pants = look === 'hair' ? '#3d5a99' : '#4a6fa5';
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(x, y + 2, 13, 4, 0, 0, 6.283); g.fill();
  g.strokeStyle = pants; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 4, y - 14 - bob); g.lineTo(x - 4 + step * 4, y - 1); g.moveTo(x + 4, y - 14 - bob); g.lineTo(x + 4 - step * 4, y - 1); g.stroke();
  if (look === 'hair') { g.fillStyle = '#5a2e14'; g.beginPath(); g.ellipse(x - d * 2, y - 34 - bob, 12, 16, 0, 0, 6.283); g.fill(); }
  g.fillStyle = shirt; g.beginPath(); g.roundRect ? g.roundRect(x - 10, y - 32 - bob, 20, 20, 6) : g.rect(x - 10, y - 32 - bob, 20, 20); g.fill();
  g.strokeStyle = '#f2c6a0'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 10, y - 28 - bob); g.lineTo(x - 14, y - 18 - bob + step * 3); g.moveTo(x + 10, y - 28 - bob); g.lineTo(x + 14, y - 18 - bob - step * 3); g.stroke();
  g.fillStyle = '#f2c6a0'; g.beginPath(); g.arc(x, y - 40 - bob, 9, 0, 6.283); g.fill();
  g.fillStyle = '#3a2412'; g.beginPath(); g.arc(x + d * 3, y - 41 - bob, 1.6, 0, 6.283); g.fill();
  if (look === 'hair') { g.fillStyle = '#5a2e14'; g.beginPath(); g.arc(x, y - 44 - bob, 9.5, Math.PI, 0); g.fill(); }
  else { g.fillStyle = '#f2d06b'; g.beginPath(); g.ellipse(x, y - 47 - bob, 17, 5, 0, 0, 6.283); g.fill(); g.fillRect(x - 8, y - 56 - bob, 16, 9); g.fillStyle = '#c8702a'; g.fillRect(x - 8, y - 50 - bob, 16, 3); }
  if (name) { g.font = '900 12px Nunito, sans-serif'; const w = g.measureText(name).width + 14; g.fillStyle = look === 'hair' ? 'rgba(155,93,229,.95)' : 'rgba(255,138,31,.95)';
    g.beginPath(); g.roundRect ? g.roundRect(x - w / 2, y - 80 - bob, w, 18, 9) : g.rect(x - w / 2, y - 80 - bob, w, 18); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(name, x, y - 67 - bob); }
}

// ---------- câmera e entrada ----------
const cv = $('cv'), cx = cv.getContext('2d');
const CAM = { x: WW / 2, y: 470, z: 1 };
let DPR = 1;
function resize() { DPR = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * DPR; cv.height = innerHeight * DPR; CAM.z = clamp(innerWidth / 610, 0.55, 1.3); clampCam(); }
function clampCam() { const hw = innerWidth / CAM.z / 2, hh = innerHeight / CAM.z / 2; CAM.x = hw * 2 >= WW ? WW / 2 : clamp(CAM.x, hw, WW - hw); CAM.y = hh * 2 >= WH ? WH / 2 : clamp(CAM.y, hh - 70, WH - hh + 40); }
addEventListener('resize', resize); resize();
const toWorld = (sx, sy) => ({ x: (sx - innerWidth / 2) / CAM.z + CAM.x, y: (sy - innerHeight / 2) / CAM.z + CAM.y });
let drag = null;
cv.addEventListener('pointerdown', e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: CAM.x, cy: CAM.y, moved: false }; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
cv.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 8) drag.moved = true; if (drag.moved) { CAM.x = drag.cx - dx / CAM.z; CAM.y = drag.cy - dy / CAM.z; clampCam(); } });
cv.addEventListener('pointerup', e => { if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; if (!d.moved) tapAt(toWorld(e.clientX, e.clientY)); });
cv.addEventListener('pointercancel', () => { drag = null; });
const inR = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
const bRect = b => ({ x: b.x - b.w / 2, y: b.y - b.h - 40, w: b.w, h: b.h + 46 });
const penRect = p => ({ x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h });
function tapAt(p) {
  if (!G.S) return; const S = G.S, now = nowS();
  ping(p.x, p.y);
  for (let i = 0; i < MAXPLOTS; i++) if (inR(p, plotRect(i))) {
    const pl = S.plots[i];
    if (i >= S.np) return openSheet('shop');
    if (!pl.c) return openSheet('seeds', i);
    if (plotReady(pl, now)) return act({ a: 'harvest', i });
    const left = Math.ceil((pl.p + CROPS[pl.c].t * 1000 - now) / 1000); return toast(L('readyIn', pl.c, fmtT(left)));
  }
  for (const [k, B] of Object.entries(BUILD)) if (inR(p, bRect(B))) {
    if (B.lvl > S.lvl) return toast(L('unlockName', N(k), B.lvl));
    const q = S.bld[k].q; if (q.length && q[0].e <= now) act({ a: 'collect', b: k }, true); return openSheet('bld', k);
  }
  for (const [k, P] of Object.entries(PENS)) if (inR(p, penRect(P))) {
    if (P.lvl > S.lvl) return toast(L('unlockName', N(k), P.lvl));
    const r = act({ a: 'pen', k }, true); if (!r.ok) openSheet('pen', k); return;
  }
  if (inR(p, bRect(BARN))) return openSheet('barn');
  if (inR(p, bRect(BOARD))) return openSheet('orders');
  if (inR(p, bRect(HOUSE))) return openSheet('menu');
}
const fmtT = s => s >= 60 ? `${Math.floor(s / 60)} min ${s % 60 ? (s % 60) + ' s' : ''}`.trim() : `${s} s`;

// ---------- jogo / rede ----------
const G = { S: null, mode: null, off: 0, seq: 0, acts: [], lastSeq: 0, partnerPing: null, myPing: null, sent: {}, hostGoneT: null, guestName: '' };
const nowS = () => Date.now() + (G.mode === 'guest' ? G.off : 0);
function act(a, quiet) {
  const S = G.S; if (!S) return { ok: false };
  const r = apply(S, a, nowS());
  if (!r.ok) { if (r.msg) { toast(r.msg); SND.no(); } return r; }
  playFx(r.fx);
  if (G.mode === 'guest') { G.seq++; G.acts.push([G.seq, a]); if (G.acts.length > 12) G.acts.shift(); NET.room && NET.room.presence({ acts: { fid: S.fid, q: G.acts } }).catch(() => {}); }
  else { if (ensureOrders(S)) S.rev++; saveSoon(); broadcast(); }
  refresh(); return r;
}
function playFx(fx) {
  for (const f of fx) {
    if (f[0] === 'gain') { const at = f[3] === 'plot' ? (() => { const r = plotRect(f[4]); return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; })() : f[3] === 'bld' ? { x: BUILD[f[4]].x, y: BUILD[f[4]].y - 60 } : { x: PENS[f[4]].x, y: PENS[f[4]].y - 30 };
      FLOAT.push({ k: f[1], n: f[2], x: at.x, y: at.y, t: 0 }); SND.pop(); }
    if (f[0] === 'plant') SND.plant();
    if (f[0] === 'craft' || f[0] === 'feed') SND.pop();
    if (f[0] === 'coins') SND.coin();
    if (f[0] === 'lvl') { SND.lvl(); toast(L('lvlUp', f[1], levelNews(f[1])), 3500); }
  }
}
function levelNews(l) {
  const n = [];
  for (const [k, c] of Object.entries(CROPS)) if (c.lvl === l) n.push(N(k));
  for (const [bk, b] of Object.entries(BUILD)) { if (b.lvl === l) n.push(N(bk)); else for (const r of b.rec) if (r.lvl === l && b.lvl < l) n.push(N(r.o)); }
  for (const [pk, p] of Object.entries(PENS)) if (p.lvl === l) n.push(N(pk));
  return n.length ? L('news', n.join(', ')) : '';
}
function ping(x, y) { G.myPing = [Math.round(x), Math.round(y), Date.now()]; walkTo(AV.me, x, y); if (NET.room) NET.room.presence({ ping: G.myPing, me: meInfo() }).catch(() => {}); }
let bcT = 0, bcLast = 0;
function broadcast() { if (G.mode !== 'host' || !NET.room) return; const now = Date.now(); clearTimeout(bcT); const send = () => { bcLast = Date.now(); NET.room.presence({ st: G.S, now: Date.now() }).catch(() => {}); }; if (now - bcLast > 150) send(); else bcT = setTimeout(send, 150); }
setInterval(() => { if (!G.S) return; if (G.mode !== 'guest') { if (ensureOrders(G.S)) { G.S.rev++; saveSoon(); } } if (G.mode === 'host') broadcast(); refresh(); }, 1000);

const NET = { api: null, room: null, sub: null, code: null, role: null, guestPeer: null,
  async leave() { if (this.sub) this.sub(); this.sub = null; const r = this.room; this.room = null; this.guestPeer = null; if (r) try { await r.leave(); } catch (e) {} } };
(async () => {
  await null;
  try { NET.api = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('room') : null; } catch (e) { NET.api = null; }
  if (!NET.api && window.P2P_ROOM) NET.api = window.P2P_ROOM;
  joinFromHash(); addEventListener('hashchange', joinFromHash);
})();
const CODE_AB = 'ACDEFGHJKMNPQRTUVWXY', newCode = () => Array.from({ length: 4 }, () => CODE_AB[Math.floor(Math.random() * CODE_AB.length)]).join('');
function joinFromHash() { const h = (location.hash || '').slice(1).toUpperCase(); if (NET.api && /^[A-Z]{4}$/.test(h) && !NET.room) { $('iCode').value = h; if (ME.name) join(h); else { $('mMsg').textContent = L('needName'); $('iName').focus(); } } }
const others = () => NET.room ? NET.room.peers().filter(p => !p.sameTab && p.presence && p.presence.app === 'sitio1') : [];
async function openRoom(role, code) {
  if (!NET.api) { $('mMsg').textContent = L('noFriendMode'); return null; }
  await NET.leave(); let r = null;
  for (let tries = 0; ; tries++) {
    try { r = await NET.api.join('sitio-' + code.toLowerCase(), role); break; }
    catch (e) { const c = e && e.code; if (c === 'taken' && role === 'host' && tries < 4) { code = newCode(); continue; }
      const m = c === 'not_found' ? L('notFound') : L('noConn');
      $('mMsg').textContent = m; $('rMsg').textContent = m; return null; }
  }
  Object.assign(NET, { room: r, code, role }); G.lastSeq = 0;
  NET.sub = r.onPeers(onPeers, () => toast(L('roomLost')));
  r.presence({ app: 'sitio1', role, me: meInfo() }).catch(() => {});
  return r;
}
async function hostRoom() {
  $('rMsg').textContent = ''; $('rStatus').textContent = L('creating'); $('rCode').textContent = '----'; $('ovRoom').hidden = false;
  const r = await openRoom('host', newCode()); if (!r) return;
  G.mode = 'host'; $('rCode').textContent = NET.code;
  $('rShare').hidden = !(NET.api && NET.api.p2p); $('rLink').value = location.href.split('#')[0] + '#' + NET.code;
  renderRoom(); broadcast();
}
async function join(code) {
  $('mMsg').textContent = L('searching', code);
  const r = await openRoom('guest', code); if (!r) return;
  $('mMsg').textContent = L('connected');
}
function renderRoom() { const o = others().find(p => p.presence.role === 'guest'); $('rStatus').textContent = o ? L('friendIn') : L('waitFriend'); updCoop(); }
function onPeers() {
  const ps = others();
  if (NET.role === 'host') {
    const o = ps.find(p => p.presence.role === 'guest');
    if (o && o.peer !== NET.guestPeer) { NET.guestPeer = o.peer; G.lastSeq = 0; toast(o.presence.me && o.presence.me.n ? L('joinedN', o.presence.me.n) : L('friendJoined')); broadcast(); }
    if (!o && NET.guestPeer) { NET.guestPeer = null; toast(AV.fr.name ? L('leftN', AV.fr.name) : L('friendLeft')); AV.fr.on = false; }
    if (o) {
      const pr = o.presence;
      if (pr.up && pr.up.fid === G.S.fid && sane(pr.up) && pr.up.rev > G.S.rev && !G.sent[pr.up.rev]) { G.sent[pr.up.rev] = 1; G.S = pr.up; storeFarm(G.S); toast(L('loadedFriend')); broadcast(); refresh(); }
      if (pr.acts && pr.acts.fid === G.S.fid && Array.isArray(pr.acts.q)) for (const [q, a] of pr.acts.q) if (q > G.lastSeq) { G.lastSeq = q; const r = apply(G.S, a, Date.now()); if (r.ok) { playFx(r.fx.filter(f => f[0] !== 'lvl')); r.fx.filter(f => f[0] === 'lvl').forEach(f => playFx([f])); ensureOrders(G.S); saveSoon(); broadcast(); refresh(); } }
      readFriend(pr);
    }
    if (!$('ovRoom').hidden) renderRoom(); updCoop();
  } else if (NET.role === 'guest') {
    const h = ps.find(p => p.presence.role === 'host');
    if (h) {
      clearTimeout(G.hostGoneT); G.hostGoneT = null;
      const st = h.presence.st;
      if (st && sane(st)) {
        G.off = (h.presence.now || Date.now()) - Date.now();
        const mine = loadFarm(st.fid);
        if (mine && mine.rev > st.rev && !G.sent[st.fid + ':' + mine.rev]) { G.sent[st.fid + ':' + mine.rev] = 1; NET.room.presence({ up: mine }).catch(() => {}); }
        const first = G.mode !== 'guest';
        G.S = st; G.mode = 'guest'; storeFarm(st, false);
        if (first) { $('ovMenu').hidden = true; $('hud').hidden = false; toast(L('youJoined', farmTitle(st))); }
        refresh();
      }
      readFriend(h.presence);
    } else if (G.mode === 'guest' && !G.hostGoneT) {
      toast(L('lostFriend'));
      G.hostGoneT = setTimeout(() => { if (G.mode === 'guest' && !others().length) { const fid = G.S && G.S.fid; goMenu(); $('mMsg').textContent = L('connDropped'); } }, 12000);
    }
    updCoop();
  }
}
function readFriend(pr) {
  const m = pr.me || {}; AV.fr.on = true; AV.fr.name = String(m.n || '').slice(0, 16) || L('friend'); AV.fr.look = m.l === 'hair' ? 'hair' : 'hat';
  if (pr.ping && (!G.partnerPing || pr.ping[2] !== G.partnerPing[2])) { G.partnerPing = pr.ping; walkTo(AV.fr, pr.ping[0], pr.ping[1]); }
}
function updCoop() {
  const on = (NET.role === 'host' && NET.guestPeer) || (NET.role === 'guest' && G.mode === 'guest');
  $('coop').hidden = !on; const fn = AV.fr.on && AV.fr.name; $('coopT').textContent = NET.role === 'guest' ? (G.S && ownerName(G.S) ? L('coopGuestN', ownerName(G.S)) : L('coopGuest')) : (fn ? L('coopHostN', fn) : L('coopHost'));
}

// ---------- telas ----------
let toastT = 0;
function toast(t, ms = 2200) { const el = $('toast'); el.textContent = t; el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; }, ms); }
function startFarm(fid) {
  let S = loadFarm(fid); if (!S) return;
  const meta = loadIdx().find(x => x.fid === fid); if (meta && meta.own && ME.name) S.owner = ME.name;
  G.S = S; G.mode = 'solo'; ensureOrders(S); storeFarm(S); AV.fr.on = false;
  $('ovMenu').hidden = true; $('hud').hidden = false; refresh();
}
function goMenu() {
  NET.leave(); G.mode = null; G.S = null; closeSheet(); $('hud').hidden = true; $('coop').hidden = true; $('ovRoom').hidden = true; $('ovMenu').hidden = false; $('mMsg').textContent = ''; renderFarms();
}
function needNameOk() { if (ME.name) return true; $('mMsg').textContent = L('needName'); $('iName').focus(); return false; }
function renderLook() { for (const [id, l] of [['lkHat', 'hat'], ['lkHair', 'hair']]) $(id).setAttribute('aria-pressed', String(ME.look === l)); }
$('iName').value = ME.name;
$('iName').addEventListener('input', e => { ME.name = e.target.value.replace(/[<>]/g, '').slice(0, 16).trim(); try { localStorage.setItem('sitio-name', ME.name); } catch (er) {} if (ME.name) $('mMsg').textContent = ''; renderFarms(); });
for (const [id, l] of [['lkHat', 'hat'], ['lkHair', 'hair']]) $(id).onclick = () => { ME.look = l; try { localStorage.setItem('sitio-look', l); } catch (er) {} renderLook(); SND.pop(); };
renderLook();
function renderFarms() {
  let idx = loadIdx();
  if (!idx.some(x => x.own)) { const S = newFarm(''); ensureOrders(S); storeFarm(S, true); idx = loadIdx(); }
  idx.sort((a, b) => b.own - a.own || b.last - a.last);
  $('farms').innerHTML = idx.map(f => `<div class="farm"><div><b>${esc(f.own ? (ME.name ? L('farmOf', ME.name) : dispName(f.name)) : (f.owner ? L('farmOf', f.owner) : L('friendFarm')))}</b><small>${L('lvl', f.lvl)} · ${f.own ? L('own') : L('copyHere')}</small></div>
    <button class="btn" data-play="${f.fid}" type="button">${L('play')}</button><button class="btn blue" data-host="${f.fid}" type="button" aria-label="${esc(L('inviteAria', f.own ? dispName(f.name) : L('friendFarm')))}">${L('friendBtn')}</button></div>`).join('');
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
$('farms').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (!needNameOk()) return; if (b.dataset.play) startFarm(b.dataset.play); if (b.dataset.host) { startFarm(b.dataset.host); hostRoom(); } });
$('bJoin').onclick = () => { if (!needNameOk()) return; const c = $('iCode').value.toUpperCase().replace(/[^A-Z]/g, ''); if (c.length !== 4) { $('mMsg').textContent = L('code4'); return; } join(c); };
$('iCode').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4); });
$('bRoomOk').onclick = () => { $('ovRoom').hidden = true; };
$('bCopy').onclick = async () => { const i = $('rLink'); try { await navigator.clipboard.writeText(i.value); $('bCopy').textContent = L('copied'); } catch (e) { i.focus(); i.select(); } setTimeout(() => { $('bCopy').textContent = L('copy'); }, 1500); };
$('bOrders').onclick = () => openSheet('orders'); $('bBarn').onclick = () => openSheet('barn'); $('bShop').onclick = () => openSheet('shop'); $('bMenu').onclick = () => openSheet('menu'); $('hCoins').onclick = () => openSheet('shop');
$('sClose').onclick = () => closeSheet();
$('icCoin').src = icon('coin'); $('icOrders').src = icon('orders'); $('icBarn').src = icon('barn'); $('icShop').src = icon('shop');

let SH = null;
function openSheet(type, arg) { SH = { type, arg }; $('sheet').hidden = false; renderSheet(); }
function closeSheet() { SH = null; $('sheet').hidden = true; }
function refresh() {
  const S = G.S; if (!S) return;
  $('hLvlN').textContent = S.lvl; const lo = LV[S.lvl - 1] || 0, hi = LV[S.lvl] || lo + 1; $('hLvl').style.setProperty('--p', clamp((S.xp - lo) / (hi - lo) * 100, 0, 100));
  $('hCoinsN').textContent = S.coins;
  const now = nowS(), can = S.orders.filter(o => o.w <= now && has(S, Object.fromEntries(o.it))).length; $('dOrders').textContent = can || '';
  if (SH) renderSheet();
}
function needHtml(S, need) { return `<div class="need">${Object.entries(need).map(([k, q]) => `<span class="${(S.inv[k] || 0) >= q ? '' : 'no'}">${img(k, N(k))}${S.inv[k] || 0}/${q}</span>`).join('')}</div>`; }
function renderSheet() {
  const S = G.S; if (!S || !SH) return; const now = nowS(), t = $('sTitle'), b = $('sBody'); let h = '';
  const sig = JSON.stringify([SH, S.rev, Math.floor(now / 1000), LANG]); if (b.dataset.sig === sig) return; b.dataset.sig = sig;
  if (SH.type === 'seeds') {
    t.textContent = L('plant');
    h = `<p class="sub">${L('plantSub')}</p><div class="grid">${Object.entries(CROPS).map(([k, c]) => c.lvl > S.lvl
      ? `<button class="tile lock" type="button" disabled>${img(k)}${N(k)}<small>${L('lvl', c.lvl)}</small></button>`
      : `<button class="tile" type="button" data-plant="${k}" ${S.coins < c.cost ? 'disabled' : ''}>${img(k)}${N(k)}<small>${L('coins', c.cost)} · ${fmtT(c.t)}</small><small>${L('yields', c.y)}</small></button>`).join('')}</div>`;
  } else if (SH.type === 'bld') {
    const B = BUILD[SH.arg], st = S.bld[SH.arg]; t.textContent = N(SH.arg);
    const slots = Array.from({ length: B.q }, (_, i) => { const j = st.q[i]; if (!j) return `<div class="slot">${L('empty')}</div>`; const r = B.rec[j.r], ready = j.e <= now; return `<div class="slot ${ready ? 'ready' : ''}">${img(r.o)}<em>${ready ? L('ready') : j.s <= now ? fmtT(Math.ceil((j.e - now) / 1000)) : L('queued')}</em></div>`; }).join('');
    h = `<div class="row"><div class="q" style="flex:1">${slots}</div>${st.q.some(j => j.e <= now) ? `<button class="btn" type="button" data-collect="1">${L('collect')}</button>` : ''}</div>
      ${B.rec.map((r, i) => r.lvl > S.lvl ? `<div class="card" style="opacity:.55"><div class="row">${img(r.o)}<b style="flex:1">${N(r.o)}</b><small>${L('lvl', r.lvl)}</small></div></div>`
        : `<div class="card"><div class="row"><span style="width:44px;height:44px;display:grid;place-items:center">${img(r.o)}</span><div style="flex:1"><b>${N(r.o)}${r.k > 1 ? ' ×' + r.k : ''}</b><br><small>${fmtT(r.t)}</small></div>
          <button class="btn" type="button" data-craft="${i}" ${!has(S, r.i) || st.q.length >= B.q ? 'disabled' : ''}>${L('make')}</button></div>${needHtml(S, r.i)}</div>`).join('')}`;
  } else if (SH.type === 'pen') {
    const P = PENS[SH.arg], st = S.pens[SH.arg]; t.textContent = N(SH.arg);
    const ready = st.a.filter(x => x && now >= x + P.t * 1000).length, busy = st.a.filter(x => x && now < x + P.t * 1000), hungry = st.a.filter(x => !x).length;
    h = `<p class="sub">${L('penSub', st.a.length, SH.arg, hungry, busy.length, ready)}</p>
      <div class="card"><div class="row">${img(P.feed)}<div style="flex:1"><b>${N(P.feed)}</b><br><small>${L('youHave', S.inv[P.feed] || 0)}</small></div></div>
      ${busy.length ? `<small>${L('nextIn', P.out, fmtT(Math.ceil((Math.min(...busy) + P.t * 1000 - now) / 1000)))}</small>` : ''}</div>
      <button class="btn" type="button" data-pen="1">${ready ? L('collectX', P.out) : L('feed')}</button>`;
  } else if (SH.type === 'barn') {
    const n = invCount(S); t.textContent = L('barn');
    const ks = Object.keys(S.inv).filter(k => S.inv[k] > 0);
    h = `<p class="sub">${L('barnUsed', n, S.cap)}</p><div style="height:10px;border-radius:5px;background:#e6d6b5;overflow:hidden"><i style="display:block;height:100%;width:${Math.min(100, n / S.cap * 100)}%;background:${n >= S.cap ? '#e0533d' : '#5cc04a'}"></i></div>
      <div class="grid">${ks.length ? ks.map(k => `<div class="tile">${img(k)}${N(k)}<small>×${S.inv[k]}</small></div>`).join('') : `<p class="sub">${L('barnEmpty')}</p>`}</div>
      <button class="btn blue" type="button" data-cap="1" ${S.coins < capCost(S.cap) ? 'disabled' : ''}>${L('barnUp')} · ${img('coin')} ${capCost(S.cap)}</button>`;
  } else if (SH.type === 'orders') {
    t.textContent = L('orders');
    h = `<p class="sub">${L('ordersSub')}</p>` + S.orders.map(o => o.w > now
      ? `<div class="card"><p class="sub">${L('newOrderIn', fmtT(Math.ceil((o.w - now) / 1000)))}</p></div>`
      : `<div class="card">${needHtml(S, Object.fromEntries(o.it))}<div class="row"><span class="need"><span>${img('coin')}${o.c}</span><span>${img('star')}${o.x}</span></span><span style="flex:1"></span>
        <button class="btn gray" type="button" data-discard="${o.id}" aria-label="${L('discardAria')}">✕</button><button class="btn" type="button" data-deliver="${o.id}" ${has(S, Object.fromEntries(o.it)) ? '' : 'disabled'}>${L('deliver')}</button></div></div>`).join('');
  } else if (SH.type === 'shop') {
    t.textContent = L('shop');
    h = `<div class="card"><div class="row"><b style="flex:1">${L('newPlot')}</b>${S.np >= MAXPLOTS ? `<small>${L('allBought')}</small>` : `<button class="btn" type="button" data-buyplot="1" ${S.coins < plotCost(S.np) ? 'disabled' : ''}>${img('coin')} ${plotCost(S.np)}</button>`}</div><small>${L('plotsOf', S.np, MAXPLOTS)}</small></div>
      <div class="card"><div class="row"><b style="flex:1">${L('bigBarn')}</b><button class="btn blue" type="button" data-cap="1" ${S.coins < capCost(S.cap) ? 'disabled' : ''}>${img('coin')} ${capCost(S.cap)}</button></div><small>${L('fitsNow', S.cap)}</small></div>
      <span class="lbl">${L('soon')}</span><div class="grid">${L('exps').map(e => `<div class="tile lock">${e}<small>${L('expansion')}</small></div>`).join('')}</div>`;
  } else if (SH.type === 'menu') {
    t.textContent = farmTitle(S);
    const host = G.mode === 'host' || G.mode === 'solo';
    h = `<p class="sub">${L('stats', S.lvl, S.xp, S.coins)}</p>
      ${G.mode === 'guest' ? `<p class="sub">${L('guestNote')}</p>` : ''}
      ${host ? `<button class="btn blue" type="button" data-invite="1">${NET.role === 'host' ? L('seeCode') : L('invite')}</button>` : ''}
      <span class="lbl">${L('langLbl')}</span>${langButtons()}
      <button class="btn gray" type="button" data-exit="1">${L('backHome')}</button>`;
  }
  b.innerHTML = h;
}
$('sBody').addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn || btn.disabled || !SH) return; const d = btn.dataset;
  if (d.plant) { const r = act({ a: 'plant', i: SH.arg, c: d.plant }); if (r.ok) closeSheet(); }
  if (d.craft) act({ a: 'craft', b: SH.arg, r: +d.craft });
  if (d.collect) act({ a: 'collect', b: SH.arg });
  if (d.pen) act({ a: 'pen', k: SH.arg });
  if (d.cap) act({ a: 'cap' });
  if (d.buyplot) act({ a: 'buyPlot' });
  if (d.deliver) act({ a: 'deliver', id: +d.deliver });
  if (d.discard) act({ a: 'discard', id: +d.discard });
  if (d.invite) { closeSheet(); if (NET.role === 'host') { $('ovRoom').hidden = false; renderRoom(); } else hostRoom(); }
  if (d.exit) goMenu();
  $('sBody').dataset.sig = ''; renderSheet();
});

// ---------- desenho ----------
let BG = null;
function seeded(n) { let a = n >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function makeBg() {
  const c = document.createElement('canvas'), K = 2; c.width = WW * K; c.height = WH * K; const g = c.getContext('2d'); g.scale(K, K); const R = seeded(7);
  const gr = g.createLinearGradient(0, 0, 0, WH); gr.addColorStop(0, '#7ccb52'); gr.addColorStop(1, '#5fb03e'); g.fillStyle = gr; g.fillRect(0, 0, WW, WH);
  for (let i = 0; i < 900; i++) { const x = R() * WW, y = R() * WH; g.fillStyle = R() < 0.5 ? 'rgba(255,255,255,.07)' : 'rgba(30,90,20,.12)'; g.beginPath(); g.ellipse(x, y, 2 + R() * 5, 1 + R() * 2, R() * 3, 0, 6.283); g.fill(); }
  // caminhos de terra
  g.strokeStyle = '#d9b77a'; g.lineCap = 'round'; g.lineWidth = 46; g.beginPath(); g.moveTo(320, WH + 30); g.lineTo(320, 640); g.stroke();
  g.lineWidth = 30; g.beginPath(); g.moveTo(84, 600); g.quadraticCurveTo(320, 640, 556, 600); g.stroke(); g.beginPath(); g.moveTo(96, 230); g.quadraticCurveTo(320, 260, 548, 230); g.stroke();
  g.strokeStyle = 'rgba(160,120,70,.25)'; g.lineWidth = 2; for (let i = 0; i < 60; i++) { const y = 660 + R() * 320, x = 300 + R() * 40; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4, y + 1); g.stroke(); }
  // lago
  g.fillStyle = '#3c9bd0'; g.beginPath(); g.ellipse(62, 380, 46, 70, 0, 0, 6.283); g.fill(); g.strokeStyle = '#e8d6a4'; g.lineWidth = 6; g.stroke(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(52, 350, 14, 22, 0, 0, 6.283); g.fill();
  // cerca
  g.strokeStyle = '#a8743f'; g.lineWidth = 4; for (const y of [24, WH - 8]) { g.beginPath(); g.moveTo(10, y); g.lineTo(WW - 10, y); g.stroke(); }
  g.fillStyle = '#8a5a2b'; for (let x = 10; x <= WW - 10; x += 32) for (const y of [24, WH - 8]) g.fillRect(x - 3, y - 12, 6, 20);
  // flores
  for (let i = 0; i < 70; i++) { const x = R() * WW, y = R() * WH; if (x > 140 && x < 500 && y > 270 && y < 640) continue; if (Math.abs(x - 320) < 40 && y > 620) continue; g.fillStyle = ['#ffffff', '#ffd23f', '#ff8fb1', '#b48cff'][i % 4]; for (let p = 0; p < 4; p++) { g.beginPath(); g.arc(x + Math.cos(p * 1.57) * 2.5, y + Math.sin(p * 1.57) * 2.5, 2, 0, 6.283); g.fill(); } }
  return c;
}
function shadow(g, x, y, w) { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x, y + 4, w / 2, w / 7, 0, 0, 6.283); g.fill(); }
function house(g, x, y, w, h, wall, roof, roofH = 40) {
  shadow(g, x, y, w + 20);
  g.fillStyle = wall; g.fillRect(x - w / 2, y - h, w, h); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2; g.strokeRect(x - w / 2, y - h, w, h);
  g.fillStyle = roof; g.beginPath(); g.moveTo(x - w / 2 - 10, y - h + 2); g.lineTo(x - w / 2 + 14, y - h - roofH); g.lineTo(x + w / 2 - 14, y - h - roofH); g.lineTo(x + w / 2 + 10, y - h + 2); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - w / 2 + 14, y - h - roofH, w - 28, 6);
}
function tree(g, x, y, s, T) { shadow(g, x, y, 40 * s); g.fillStyle = '#7a4b25'; g.fillRect(x - 4 * s, y - 22 * s, 8 * s, 22 * s); const sw = Math.sin(T * 1.2 + x) * 1.5;
  for (const [dx, dy, r, c] of [[0, -40, 22, '#3f8f2e'], [-14, -30, 16, '#4aa236'], [14, -30, 16, '#4aa236'], [0, -50, 14, '#5cb844']]) { g.fillStyle = c; g.beginPath(); g.arc(x + dx * s + sw, y + dy * s, r * s, 0, 6.283); g.fill(); } }
function cropPlant(g, k, st, x, y, T) {
  const sw = Math.sin(T * 2 + x * 0.3) * (st === 2 ? 2 : 1);
  if (st === 0) { g.fillStyle = '#6fd04a'; g.beginPath(); g.ellipse(x - 3 + sw, y - 4, 3, 6, -0.6, 0, 6.283); g.ellipse(x + 3 + sw, y - 4, 3, 6, 0.6, 0, 6.283); g.fill(); return; }
  if (st === 1) { g.strokeStyle = '#4aa236'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + sw, y - 14); g.stroke(); g.fillStyle = '#5cb844'; g.beginPath(); g.ellipse(x - 5 + sw, y - 9, 4, 8, -0.7, 0, 6.283); g.ellipse(x + 5 + sw, y - 11, 4, 8, 0.7, 0, 6.283); g.fill(); return; }
  if (k === 'trigo') { g.strokeStyle = '#c9902a'; g.lineWidth = 2; for (const d of [-4, 0, 4]) { g.beginPath(); g.moveTo(x + d, y); g.lineTo(x + d + sw, y - 20); g.stroke(); g.fillStyle = '#f2c14e'; g.beginPath(); g.ellipse(x + d + sw, y - 24, 3, 7, 0, 0, 6.283); g.fill(); } }
  if (k === 'milho') { g.fillStyle = '#4aa236'; g.beginPath(); g.moveTo(x - 6, y); g.quadraticCurveTo(x - 10 + sw, y - 20, x - 2 + sw, y - 34); g.lineTo(x + 2 + sw, y - 34); g.quadraticCurveTo(x + 10 + sw, y - 20, x + 6, y); g.fill(); g.fillStyle = '#ffd23f'; g.beginPath(); g.ellipse(x + 5 + sw, y - 18, 4, 9, 0.3, 0, 6.283); g.fill(); }
  if (k === 'cenoura') { g.fillStyle = '#4fae3a'; for (const a of [-0.6, 0, 0.6]) { g.beginPath(); g.ellipse(x + Math.sin(a) * 7 + sw, y - 12, 3, 9, a, 0, 6.283); g.fill(); } g.fillStyle = '#ff8c1a'; g.beginPath(); g.ellipse(x, y - 2, 6, 4, 0, 0, 6.283); g.fill(); }
  if (k === 'cana') { g.fillStyle = '#7cc04b'; for (const d of [-4, 3]) g.fillRect(x + d + sw * 0.5, y - 36, 4, 36); g.fillStyle = '#4f9a2f'; g.beginPath(); g.moveTo(x, y - 30); g.quadraticCurveTo(x + 14 + sw, y - 40, x + 18 + sw, y - 28); g.quadraticCurveTo(x + 10, y - 32, x, y - 26); g.fill(); }
}
function bubble(g, x, y, k, T, faded) { const b = Math.sin(T * 4) * 3; g.save(); g.globalAlpha = faded ? 0.6 : 1; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y + b, 20, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(x - 6, y + 16 + b); g.lineTo(x, y + 26 + b); g.lineTo(x + 6, y + 16 + b); g.fill(); g.drawImage(iconCanvas(k), x - 16, y - 16 + b, 32, 32); g.restore(); }
function progressBar(g, x, y, w, p) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x - w / 2, y, w, 8); g.fillStyle = '#5cc04a'; g.fillRect(x - w / 2 + 1, y + 1, (w - 2) * clamp(p, 0, 1), 6); }
function lockSign(g, x, y, l) { g.fillStyle = 'rgba(58,36,18,.85)'; g.fillRect(x - 40, y - 12, 80, 24); g.fillStyle = '#fff'; g.font = '900 13px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText(L('lvl', l), x, y + 5); }
const FLOAT = [];
function draw(T, dt) {
  const S = G.S, now = nowS();
  cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.fillStyle = '#5aa83c'; cx.fillRect(0, 0, innerWidth, innerHeight);
  cx.setTransform(DPR * CAM.z, 0, 0, DPR * CAM.z, DPR * (innerWidth / 2 - CAM.x * CAM.z), DPR * (innerHeight / 2 - CAM.y * CAM.z));
  if (!BG) BG = makeBg(); cx.drawImage(BG, 0, 0, WW, WH);
  const lvl = S ? S.lvl : 1;
  // lago com brilho
  cx.strokeStyle = 'rgba(255,255,255,.45)'; cx.lineWidth = 2; for (let i = 0; i < 3; i++) { const r = ((T * 12 + i * 20) % 60); cx.globalAlpha = 1 - r / 60; cx.beginPath(); cx.ellipse(62, 400, r * 0.6, r, 0, 0, 6.283); cx.stroke(); } cx.globalAlpha = 1;
  // casa, celeiro, moinho
  house(cx, HOUSE.x, HOUSE.y, HOUSE.w, HOUSE.h, '#fff1d6', '#d9614b'); cx.fillStyle = '#7a4b25'; cx.fillRect(HOUSE.x - 12, HOUSE.y - 40, 24, 40); cx.fillStyle = '#8fd3ff'; cx.fillRect(HOUSE.x - 46, HOUSE.y - 66, 24, 20); cx.fillRect(HOUSE.x + 22, HOUSE.y - 66, 24, 20);
  if (S) { cx.fillStyle = '#7a4b25'; cx.fillRect(HOUSE.x - 64, HOUSE.y + 8, 128, 22); cx.fillStyle = '#fff'; cx.font = '900 13px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(farmTitle(S).slice(0, 20), HOUSE.x, HOUSE.y + 24); }
  house(cx, BARN.x, BARN.y, BARN.w, BARN.h, '#d9483b', '#8a2a20', 46); cx.fillStyle = '#fff'; cx.fillRect(BARN.x - 22, BARN.y - 56, 44, 56); cx.strokeStyle = '#d9483b'; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(BARN.x - 22, BARN.y - 56); cx.lineTo(BARN.x + 22, BARN.y); cx.moveTo(BARN.x + 22, BARN.y - 56); cx.lineTo(BARN.x - 22, BARN.y); cx.stroke();
  if (S && invCount(S) >= S.cap) bubble(cx, BARN.x, BARN.y - 170, 'barn', T);
  const M = BUILD.moinho; shadow(cx, M.x, M.y, 90); cx.fillStyle = '#f2e3c6'; cx.beginPath(); cx.moveTo(M.x - 34, M.y); cx.lineTo(M.x - 22, M.y - M.h); cx.lineTo(M.x + 22, M.y - M.h); cx.lineTo(M.x + 34, M.y); cx.closePath(); cx.fill(); cx.strokeStyle = 'rgba(0,0,0,.2)'; cx.lineWidth = 2; cx.stroke();
  cx.fillStyle = '#b5523b'; cx.beginPath(); cx.moveTo(M.x - 28, M.y - M.h); cx.lineTo(M.x, M.y - M.h - 26); cx.lineTo(M.x + 28, M.y - M.h); cx.fill(); cx.fillStyle = '#7a4b25'; cx.fillRect(M.x - 10, M.y - 30, 20, 30);
  const spin = S && S.bld.moinho.q.some(j => j.s <= now && j.e > now) ? 3 : 0.6; cx.save(); cx.translate(M.x, M.y - M.h + 6); cx.rotate(T * spin);
  for (let i = 0; i < 4; i++) { cx.rotate(Math.PI / 2); cx.fillStyle = '#fff8e6'; cx.fillRect(4, -7, 58, 14); cx.strokeStyle = '#7a4b25'; cx.lineWidth = 2; cx.strokeRect(4, -7, 58, 14); } cx.fillStyle = '#7a4b25'; cx.beginPath(); cx.arc(0, 0, 7, 0, 6.283); cx.fill(); cx.restore();
  // árvores
  for (const [x, y, s] of [[22, 150, 1], [222, 120, 0.8], [418, 118, 0.85], [618, 300, 1.1], [610, 420, 0.9], [26, 520, 0.9], [612, 900, 1], [24, 930, 1], [214, 960, 0.8], [430, 960, 0.8]]) tree(cx, x, y, s, T);
  // canteiros
  for (let i = 0; i < MAXPLOTS; i++) {
    const r = plotRect(i), pl = S ? S.plots[i] : { c: null }, locked = !S || i >= S.np;
    cx.fillStyle = locked ? 'rgba(120,80,40,.25)' : '#8a5a33'; cx.beginPath(); cx.roundRect ? cx.roundRect(r.x, r.y, r.w, r.h, 10) : cx.rect(r.x, r.y, r.w, r.h); cx.fill();
    if (locked) { if (S && i === S.np) { cx.fillStyle = '#fff'; cx.font = '900 13px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(L('buy'), r.x + r.w / 2, r.y + r.h / 2 - 2); cx.drawImage(iconCanvas('coin'), r.x + r.w / 2 - 22, r.y + r.h / 2 + 4, 16, 16); cx.fillText(plotCost(S.np), r.x + r.w / 2 + 8, r.y + r.h / 2 + 17); } continue; }
    cx.strokeStyle = '#6f4626'; cx.lineWidth = 3; for (let j = 0; j < 3; j++) { cx.beginPath(); cx.moveTo(r.x + 10, r.y + 16 + j * 20); cx.lineTo(r.x + r.w - 10, r.y + 16 + j * 20); cx.stroke(); }
    if (pl.c) { const c = CROPS[pl.c], p = clamp((now - pl.p) / (c.t * 1000), 0, 1), st = p >= 1 ? 2 : p < 0.35 ? 0 : 1;
      for (let j = 0; j < 6; j++) cropPlant(cx, pl.c, st, r.x + 18 + (j % 3) * 30, r.y + 30 + Math.floor(j / 3) * 26, T);
      if (st < 2) progressBar(cx, r.x + r.w / 2, r.y + r.h - 6, 60, p);
      else if (Math.sin(T * 5 + i) > 0.6) { cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(r.x + r.w - 12, r.y + 10, 3, 0, 6.283); cx.fill(); } }
  }
  // padaria e queijaria
  for (const k of ['padaria', 'queijaria']) {
    const B = BUILD[k], locked = B.lvl > lvl, st = S && S.bld[k];
    cx.save(); if (locked) cx.globalAlpha = 0.55;
    house(cx, B.x, B.y, B.w, B.h, k === 'padaria' ? '#ffe2b0' : '#e6f2ff', k === 'padaria' ? '#c8702a' : '#3f8fd1', 34);
    cx.fillStyle = '#7a4b25'; cx.fillRect(B.x - 14, B.y - 40, 28, 40); cx.fillStyle = '#fff'; cx.fillRect(B.x - 48, B.y - 66, 26, 18); cx.fillRect(B.x + 22, B.y - 66, 26, 18);
    cx.fillStyle = '#7a4b25'; cx.fillRect(B.x - 40, B.y - B.h - 30, 80, 20); cx.fillStyle = '#fff'; cx.font = '900 12px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(N(k).toUpperCase(), B.x, B.y - B.h - 16);
    cx.restore();
    if (locked) { lockSign(cx, B.x, B.y - 40, B.lvl); continue; }
    const j = st.q[0]; if (j) { if (j.e <= now) bubble(cx, B.x, B.y - B.h - 60, B.rec[j.r].o, T); else { progressBar(cx, B.x, B.y + 10, 70, (now - j.s) / (j.e - j.s)); if (k === 'padaria') for (let s = 0; s < 3; s++) { const ph = (T * 0.6 + s / 3) % 1; cx.fillStyle = `rgba(255,255,255,${0.6 * (1 - ph)})`; cx.beginPath(); cx.arc(B.x + 36 + Math.sin(ph * 6) * 4, B.y - B.h - 34 - ph * 40, 6 + ph * 8, 0, 6.283); cx.fill(); } } }
  }
  if (S) { const j = S.bld.moinho.q[0]; if (j) { if (j.e <= now) bubble(cx, M.x + 54, M.y - 140, BUILD.moinho.rec[j.r].o, T); else progressBar(cx, M.x, M.y + 10, 70, (now - j.s) / (j.e - j.s)); } }
  // currais
  for (const k of ['galinheiro', 'estabulo']) {
    const P = PENS[k], R = penRect(P), locked = P.lvl > lvl, st = S && S.pens[k];
    cx.fillStyle = k === 'galinheiro' ? '#d9c08a' : '#8fcf62'; cx.fillRect(R.x, R.y, R.w, R.h);
    cx.strokeStyle = '#a8743f'; cx.lineWidth = 4; cx.strokeRect(R.x, R.y, R.w, R.h); cx.fillStyle = '#8a5a2b'; for (let x = R.x; x <= R.x + R.w; x += 30) { cx.fillRect(x - 3, R.y - 6, 6, 12); cx.fillRect(x - 3, R.y + R.h - 6, 6, 12); }
    house(cx, R.x + 36, R.y + 52, 52, 40, k === 'galinheiro' ? '#f2d38a' : '#c0583e', '#7a4b25', 20);
    if (locked) { cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(R.x, R.y, R.w, R.h); lockSign(cx, P.x, P.y, P.lvl); continue; }
    st.a.forEach((f, j) => {
      const ready = f && now >= f + P.t * 1000, hungry = !f, ph = j * 2.1, sp = hungry ? 0.25 : 0.5;
      const ax = P.x + 20 + Math.sin(T * sp + ph) * 58, ay = P.y + 8 + Math.cos(T * sp * 0.8 + ph * 1.3) * 34, dir = Math.cos(T * sp + ph) >= 0 ? 1 : -1;
      if (k === 'galinheiro') { const peck = Math.max(0, Math.sin(T * 6 + ph)) * 3; cx.fillStyle = 'rgba(0,0,0,.15)'; cx.beginPath(); cx.ellipse(ax, ay + 8, 10, 3, 0, 0, 6.283); cx.fill();
        cx.fillStyle = '#fff'; cx.beginPath(); cx.ellipse(ax, ay, 10, 8, 0, 0, 6.283); cx.fill(); cx.beginPath(); cx.arc(ax + dir * 8, ay - 7 + peck, 5, 0, 6.283); cx.fill();
        cx.fillStyle = '#e0533d'; cx.beginPath(); cx.arc(ax + dir * 8, ay - 12 + peck, 2.5, 0, 6.283); cx.fill(); cx.fillStyle = '#ffa23a'; cx.beginPath(); cx.moveTo(ax + dir * 12, ay - 7 + peck); cx.lineTo(ax + dir * 17, ay - 5 + peck); cx.lineTo(ax + dir * 12, ay - 4 + peck); cx.fill(); }
      else { cx.fillStyle = 'rgba(0,0,0,.15)'; cx.beginPath(); cx.ellipse(ax, ay + 14, 20, 5, 0, 0, 6.283); cx.fill(); cx.fillStyle = '#fff'; cx.beginPath(); cx.ellipse(ax, ay, 20, 12, 0, 0, 6.283); cx.fill(); cx.fillStyle = '#2b2b2b'; cx.beginPath(); cx.ellipse(ax - 6, ay - 3, 6, 5, 0.4, 0, 6.283); cx.ellipse(ax + 8, ay + 3, 5, 4, 0, 0, 6.283); cx.fill();
        cx.fillStyle = '#f2c6b4'; cx.beginPath(); cx.ellipse(ax + dir * 22, ay - 4, 8, 7, 0, 0, 6.283); cx.fill(); cx.fillStyle = '#2b2b2b'; cx.fillRect(ax - 14, ay + 8, 4, 8); cx.fillRect(ax + 10, ay + 8, 4, 8); }
      if (ready) bubble(cx, ax, ay - 40, P.out, T); else if (hungry) bubble(cx, ax, ay - 40, P.feed, T, true);
    });
  }
  // quadro de encomendas
  shadow(cx, BOARD.x, BOARD.y, 120); cx.fillStyle = '#8a5a2b'; cx.fillRect(BOARD.x - 50, BOARD.y - 20, 8, 24); cx.fillRect(BOARD.x + 42, BOARD.y - 20, 8, 24);
  cx.fillStyle = '#c9905a'; cx.fillRect(BOARD.x - 60, BOARD.y - BOARD.h, 120, 54); cx.strokeStyle = '#7a4b25'; cx.lineWidth = 4; cx.strokeRect(BOARD.x - 60, BOARD.y - BOARD.h, 120, 54);
  if (S) S.orders.forEach((o, i) => { const x = BOARD.x - 50 + i * 36, y = BOARD.y - BOARD.h + 6; cx.fillStyle = o.w > now ? 'rgba(255,255,255,.4)' : '#fff'; cx.fillRect(x, y, 30, 40); if (o.w <= now) { cx.drawImage(iconCanvas(o.it[0][0]), x + 3, y + 8, 24, 24); if (has(S, Object.fromEntries(o.it))) { cx.fillStyle = '#5cc04a'; cx.beginPath(); cx.arc(x + 26, y + 4, 6, 0, 6.283); cx.fill(); } } });
  cx.fillStyle = '#fff'; cx.font = '900 12px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(L('board'), BOARD.x, BOARD.y + 22);
  // nuvens (sombras passando)
  for (let i = 0; i < 3; i++) { const x = ((T * 10 + i * 260) % (WW + 300)) - 150, y = 180 + i * 280; cx.fillStyle = 'rgba(30,60,20,.08)'; cx.beginPath(); cx.ellipse(x, y, 90, 36, 0, 0, 6.283); cx.ellipse(x + 60, y + 10, 60, 28, 0, 0, 6.283); cx.fill(); }
  // toques do amigo e seus
  for (const [pg, col] of [[G.partnerPing, '#9b5de5'], [G.myPing, '#ffb020']]) if (pg && Date.now() - pg[2] < 900) { const p = (Date.now() - pg[2]) / 900; cx.strokeStyle = col; cx.globalAlpha = 1 - p; cx.lineWidth = 4; cx.beginPath(); cx.arc(pg[0], pg[1], 10 + p * 26, 0, 6.283); cx.stroke(); cx.globalAlpha = 1; }
  // personagens
  if (S) { stepAv(AV.me, dt); const list = [[AV.me, ME.name, ME.look, true]]; if (AV.fr.on && G.mode !== 'solo') { stepAv(AV.fr, dt); list.push([AV.fr, AV.fr.name, AV.fr.look, false]); }
    list.sort((a, b) => a[0].y - b[0].y).forEach(([av, n, l, m]) => drawAv(cx, av, n, l, T, m)); }
  // ganhos flutuando
  for (const f of FLOAT) { f.t += dt; const p = f.t / 1.2; cx.globalAlpha = 1 - Math.max(0, p - 0.6) / 0.4; cx.drawImage(iconCanvas(f.k), f.x - 18, f.y - 30 - p * 50, 36, 36); cx.fillStyle = '#fff'; cx.strokeStyle = '#3a2412'; cx.lineWidth = 4; cx.font = '900 18px Nunito, sans-serif'; cx.textAlign = 'left'; cx.strokeText('+' + f.n, f.x + 18, f.y - 6 - p * 50); cx.fillText('+' + f.n, f.x + 18, f.y - 6 - p * 50); cx.globalAlpha = 1; }
  for (let i = FLOAT.length - 1; i >= 0; i--) if (FLOAT[i].t > 1.2) FLOAT.splice(i, 1);
}
let last = performance.now(), TT = 0;
function frame(now) { requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now; TT += dt; try { draw(TT, dt); } catch (e) { console.error(e); } }
requestAnimationFrame(frame);
applyLang(); renderFarms();
