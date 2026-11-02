// game.js — Sítio do Vento: um sítio para cuidar sozinho ou com um amigo, no mesmo mapa e ao mesmo tempo.
// Quem cria a sala (ou joga sozinho) é o dono do estado: aplica as ações e salva. O convidado manda ações e guarda uma cópia.
'use strict';
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- idiomas (português e espanhol) ----------
let LANG = (() => { try { const v = localStorage.getItem('sitio-lang'); if (v === 'es' || v === 'pt') return v; } catch (e) {} return /^es/i.test(navigator.language || '') ? 'es' : 'pt'; })();
const NM = {
  pt: { trigo: 'Trigo', milho: 'Milho', cenoura: 'Cenoura', cana: 'Cana', ovo: 'Ovo', leite: 'Leite', racaoG: 'Ração de galinha', racaoV: 'Ração de vaca', pao: 'Pão', bolo: 'Bolo de cenoura', queijo: 'Queijo', acucar: 'Açúcar',
    moinho: 'Moinho', padaria: 'Padaria', queijaria: 'Queijaria', galinheiro: 'Galinheiro', estabulo: 'Estábulo',
    algodao: 'Algodão', tecido: 'Tecido', rede: 'Rede de descanso', tecelagem: 'Tecelagem', coco: 'Coco', escola: 'Escola de kite',
    laranja: 'Laranja', manga: 'Manga', suco: 'Suco de laranja', vitamina: 'Vitamina de manga', mel: 'Mel', peixe: 'Peixe', paoMel: 'Pão de mel', sucos: 'Fábrica de sucos', apiario: 'Apiário', barco: 'Barco de pesca' },
  es: { trigo: 'Trigo', milho: 'Maíz', cenoura: 'Zanahoria', cana: 'Caña', ovo: 'Huevo', leite: 'Leche', racaoG: 'Ración de gallina', racaoV: 'Ración de vaca', pao: 'Pan', bolo: 'Pastel de zanahoria', queijo: 'Queso', acucar: 'Azúcar',
    moinho: 'Molino', padaria: 'Panadería', queijaria: 'Quesería', galinheiro: 'Gallinero', estabulo: 'Establo',
    algodao: 'Algodón', tecido: 'Tela', rede: 'Hamaca', tecelagem: 'Tejeduría', coco: 'Coco', escola: 'Escuela de kite',
    laranja: 'Naranja', manga: 'Mango', suco: 'Jugo de naranja', vitamina: 'Batido de mango', mel: 'Miel', peixe: 'Pescado', paoMel: 'Pan de miel', sucos: 'Fábrica de jugos', apiario: 'Apiario', barco: 'Barco de pesca' },
};
const N = k => (/^[a-z]+_\d$/.test(k) ? N(k.split('_')[0]) + ' ' + k.split('_')[1] : null) || NM[LANG][k] || NM.pt[k] || (TX && TX[LANG] && typeof TX[LANG][k] === 'string' ? TX[LANG][k] : k);
const TX = {
  pt: {
    title: 'Sítio do Vento', intro: 'Plante, cuide dos animais e entregue encomendas. Sozinho ou com um amigo, no mesmo sítio.',
    farmsLbl: 'Seus sítios', joinOr: 'ou entre no sítio de um amigo', enter: 'Entrar', codeAria: 'Código da sala',
    inviteTitle: 'Convide seu amigo', codeLbl: 'Código', shareLbl: 'Ou mande este link', linkAria: 'Link da sala', copy: 'Copiar', copied: 'Copiado', keepPlaying: 'Continuar jogando',
    canvasAria: 'O sítio. Arraste para se mover e toque nos canteiros, animais e construções.', lvlAria: 'Nível', coinsAria: 'Moedas', ordersAria: 'Encomendas', barnAria: 'Celeiro', shopAria: 'Loja', menuAria: 'Menu', close: 'Fechar',
    myFarm: 'Meu sítio', friendFarm: 'Sítio do amigo', lvl: n => `Nível ${n}`, own: 'seu sítio', copyHere: 'cópia salva aqui', play: 'Jogar', friendBtn: '+ Amigo', inviteAria: n => `Convidar amigo para ${n}`,
    code4: 'O código tem 4 letras.', unlockAt: n => `Libera no nível ${n}`, noCoins: 'Moedas insuficientes', barnFull: 'O celeiro está cheio. Toque no Celeiro e venda alguma coisa.', queueFull: 'A fila está cheia',
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
    barn: 'Celeiro', barnUsed: (n, c) => `${n} de ${c} lugares ocupados`, barnEmpty: 'Vazio. Colha os canteiros para encher o celeiro.', barnUp: 'Aumentar celeiro (+50)', sellSurplus: 'Vender sobras', sellSurplusHint: 'Vende de uma vez o que nenhuma encomenda precisa e guarda um pouco de cada ingrediente.', noSurplus: 'Não há sobras: tudo serve para encomendas ou receitas.', soldSurplus: c => `Vendeu as sobras por ${c} moedas`,
    orders: 'Encomendas', ordersSub: 'O pessoal da vila paga bem. Entregue para ganhar moedas e experiência.', newOrderIn: t => `Nova encomenda chegando em ${t}…`, discardAria: 'Descartar encomenda', deliver: 'Entregar',
    shop: 'Loja', newPlot: 'Novo canteiro', allBought: 'Todos comprados', plotsOf: (n, m) => `${n} de ${m} canteiros`, bigBarn: 'Celeiro maior (+50)', fitsNow: c => `Hoje cabem ${c} itens`,
    soon: 'Em breve', expansion: 'expansão', exps: ['Feira da vila', 'Sorveteria', 'Casa de praia', 'Estufa de flores'],
    land_leste: 'Terreno do Pomar', land_sul: 'Terreno do Lago', forSale: 'À VENDA', landDesc_leste: 'Seis árvores de laranja e manga e uma fábrica de sucos.', landDesc_sul: 'Colmeias que dão mel e um barco de pesca no lago.',
    buyFor: 'Comprar terreno', lands: 'Terrenos', landOwned: 'Já é seu', boatGo: 'Mandar o barco (isca: 2 milhos)', boatBack: t => `O barco volta em ${t}`, boatIdle: 'O barco está no cais. Use 2 milhos de isca para pescar.',
    honeyIn: t => `Mel pronto em ${t}`, zoomHint: 'Use dois dedos para aproximar ou afastar o mapa.',
    shiftLbl: 'Contratar por', sh0: '20 min', sh1: '1 hora', sh2: '24 horas', autoSell: 'Vender sobras quando o celeiro encher', autoSellHint: 'Eles só vendem o que nenhuma encomenda precisa. Ampliar o celeiro e investir continua sendo decisão sua.',
    helperDoes2: 'Eles entregam as encomendas, plantam o que as encomendas pedem, fazem os produtos nos prédios, mantêm a ração dos animais, colhem e recolhem tudo, cuidam do pomar, das colmeias, do barco e cobram a Vila.',
    sound: 'Som', music: 'Música', ambient: 'Sons do sítio', on: 'sim', off: 'não',
    lvlCap: '+50 lugares no celeiro', lvlTitle: l => `Nível ${l}!`, lvlCoins: c => `+${c} moedas de prêmio`, lvlUnlocked: 'Liberado agora', lvlNext: l => `No nível ${l}`, lvlNothing: 'Prêmio em moedas, +50 lugares no celeiro e encomendas que pagam mais.', lvlRoad: 'Próximos níveis', great: 'Que bom!',
    land_bairro: 'Bairro Novo', landDesc_bairro: 'Um bairro com avenida e 12 lotes: construa casas, chegam vizinhos que pagam aluguel e dão bônus nas encomendas.',
    city: 'Cidade', cityBtn: 'Painel da cidade', happyL: 'Felicidade', happyHint: 'Quanto mais feliz a cidade, mais rendem os aluguéis (até 1,5x).', cityPop: (p, m) => `${p} moradores · aluguéis x${m}`, serv_praca: 'Praça', servD_praca: 'Bancos, árvores e coreto: +15 de felicidade', serv_posto: 'Posto de saúde', servD_posto: 'Cuida dos vizinhos: +20 de felicidade', servDone: (n, h) => `${n} inaugurado! Felicidade: ${h}`, hpFrom: 'Sobe com: decorações, ruas, obras da vila, praça e posto.', incomeH: n => `Aluguéis: ~${n} moedas por hora`,
    upTitle: 'Melhorar prédio', upHint: (l, p) => `Nível ${l}: tudo fica ${p}% mais rápido (vale para as cópias também).`, upBtn: 'Melhorar', upDone: (n, l) => `${n} agora é nível ${l}!`, upMax: 'Nível máximo', bLvl: l => `Nv ${l}`,
    boosts: 'Impulsos', boost_abono: 'Adubo mágico', boostD_abono: 'Plantas crescem 2x mais rápido por 10 min', boost_racao: 'Ração premium', boostD_racao: 'Animais produzem 2x mais rápido por 10 min', boostDone_abono: 'Adubo ativo: plante agora!', boostDone_racao: 'Ração premium ativa: alimente os animais!', boostLeft: t => `Ativo: ${t}`,
    truck: 'Caminhão de entregas', truckD: 'Entrega sozinho uma encomenda pronta a cada 30 s, mesmo sem ajudantes.', truckDone: 'O caminhão entregou uma encomenda!', truckBought: 'Caminhão novo! Ele entrega as encomendas prontas sozinho.',
    tourist: 'Turista', rainNow: 'Está chovendo! A chuva regou a plantação (+30 s).',
    fair: 'Feira do bairro', fairSub: 'Coloque produtos nas barracas: vizinhos e turistas compram pelo preço cheio (mais que vender no celeiro). Com a Pousada pronta chegam turistas.', fairEmpty: 'Barraca vazia: escolha o que vender', fairTake: 'Retirar', fairBuy: 'Vou levar!', fairSold: n => `Vendido na feira: ${n} moedas`, stall: i => `Barraca ${i}`,
    npcSad: 'Falta uma praça por aqui…', npcHappy: 'Amo morar nesta cidade!',
    reqs: 'Pedidos dos vizinhos', reqSub: 'Os vizinhos pedem em pessoa e pagam o dobro. Toque no vizinho com o balão.', reqFrom: n => `${n} quer:`, reqThanks: 'Obrigado, vizinho!', reqWait: t => `Novo pedido em ${t}`,
    homes: 'Casas do bairro', homeHint: 'Cada casa traz 2 vizinhos: +2% nas encomendas por casa (até 20%) e aluguel de 30 moedas a cada 5 min.', homeBuy: 'Construir casa', homeDone: (a, b) => `${a} e ${b} se mudaram para o bairro!`, homesN: (n, m, p) => `${n} de ${m} casas · ${p} moradores`, homeOf: (a, b) => `Casa de ${a} e ${b}`, emptyLot: 'Lote vazio', rentIn: (n, t) => `${n} moedas em ${t}`, npcHi: n => `Oi, sou ${n}!`,
    npc: ['Que dia bonito!', 'Adoro o pão daqui!', 'Essa rua ficou linda.', 'Vou na feira mais tarde.', 'Bom dia, vizinho!', 'O vento hoje está ótimo!', 'Meu filho quer ser kitesurfista.', 'Que cheiro de bolo!', 'A cidade está crescendo!', 'Tem sorvete hoje?', 'Obrigado pelas ruas novas!', 'Vou pescar no lago.'],
    roads: 'Ruas', roadHint: 'Arraste para pintar · toque para apagar · 2 dedos movem o mapa', roadBar: (f, c) => f > 0 ? `Ruas: ${f} grátis` : `Ruas: ${c} moedas cada`, roadNo: 'Aqui não dá para fazer rua', roadBtn: 'Construir ruas', roadInfo: (n, b) => `${n} pedaços de rua · +${b}% nas encomendas (1% a cada 20, até 10%)`,
    dups: 'Duplicar prédios', dupHint: 'Mais um prédio igual, com fila própria: produz o dobro ao mesmo tempo. Os ajudantes usam todos.', dupHave: (n, m) => `Você tem ${n} de ${m}`, dupBtn: 'Construir outro', dupDone: n => `${n} construído! Fila nova pronta.`, needLand: l => `Primeiro compre o terreno: ${l}`, dupNeedLand: l => `Fica no terreno ${l}`,
    silos: 'Silos', silo: 'Silo', siloHint: n => `Cada silo aparece no mapa e soma +100 lugares. ${n} de 4.`, buySilo: 'Construir silo',
    land_praia: 'Terreno da Praia', landDesc_praia: 'Areia, mar e coqueiros que dão coco. Lá se constrói a Escola de kite, que dá o maior aluguel.',
    helpersTitle: 'Ajudantes', keptHost: 'Seu amigo também jogou separado: ficou o progresso desta sala.', hire: n => `Contratar ${n}`, helpersN: (n, m) => `${n} de ${m} ajudantes`, helpersWork: 'Cada ajudante faz uma tarefa ao mesmo tempo e eles constroem a Vila mais rápido.', shiftAll: n => `Pagar turno de 20 min para ${n === 1 ? 'o ajudante' : 'os ' + n + ' ajudantes'}`,
    land_vila: 'Terreno da Vila', landDesc_vila: 'A cidade: seus ajudantes constroem Pousada, Mercado e Restaurante, que dão moedas sozinhos.',
    pousada: 'Pousada', mercado: 'Mercado', restaurante: 'Restaurante', build: 'Construir', building: t => `Em obra: falta ${t}`, built: 'Pronto! Dá moedas sozinho.', rentReady: n => `Recolher ${n} moedas`, rentNext: (n, t) => `${n} moedas a cada 5 min. Próximas em ${t}`, buildFaster: n => `Com ${n} ajudante${n > 1 ? 's' : ''} a obra fica ${n}x mais rápida.`, lot: 'Lote para construir',
    rushTitle: 'Acelerar', rushText: t => `Falta ${t}. Quer terminar agora?`, rushBtn: 'Terminar agora', rushDone: 'Pronto na hora!',
    trees: 'Árvores', buyTreeL: 'Plantar laranjeira', buyTreeM: 'Plantar mangueira', treesN: (n, m) => `${n} de ${m} árvores extras`,
    move: 'Mover', moveHint: 'Modo mover: arraste prédios, currais, árvores, colmeias, decoração ou a plantação.', moveDone: 'Pronto', moved: 'Lugar salvo',
    sorveteria: 'Sorveteria', sorvete: 'Sorvete de manga', picole: 'Picolé de laranja',
    land_colina: 'Terreno da Colina', landDesc_colina: 'Espaço novo com a Sorveteria: sorvete de manga e picolé de laranja.',
    animals: 'Animais', buyHen: 'Mais uma galinha', buyCow: 'Mais uma vaca', haveN: (n, m) => `${n} de ${m}`, decos: 'Decoração', decoBonus: n => `Cada decoração faz as encomendas pagarem 5% a mais. Agora: +${n}%`,
    deco_banco: 'Banco de madeira', deco_flores: 'Canteiro de flores', deco_espantalho: 'Espantalho', deco_fonte: 'Fonte', bought: 'Comprado', newDeco: n => `${n} enfeitando o sítio!`,
    joiningOpen: c => `A sala ${c} já está aberta. Entrando nela…`, roomWaiting: c => `Sala ${c}: esperando seu amigo entrar`, blocked: 'A sala existe, mas a conexão entre os celulares não abriu. Tentem os dois no mesmo Wi-Fi e entrem de novo.',
    addSlot: 'Mais um espaço na fila', slotsMax: 'Fila no máximo', newVersion: 'Tem uma versão nova do jogo.', update: 'Atualizar',
    sellOne: 'Vender 1', sellAll: 'Vender tudo', each: n => `${n} cada`, barnFullHint: 'O celeiro está cheio. Toque no Celeiro e venda alguma coisa.', sold: (q, k, c) => `Vendeu ${q} ${N(k).toLowerCase()} por ${L('coins', c)}`,
    helperTitle: 'Ajudante Juca', helperAria: 'Ajudante', helperLocked: n => `Entregue ${n} encomendas e vocês ganham o Juca, um ajudante que cuida do sítio.`, helperProg: (d, n) => `${d} de ${n} encomendas entregues`,
    helperWon: 'Vocês ganharam um ajudante: o Juca!', shiftBtn: 'Pagar um turno de 20 min', working: t => `O Juca está trabalhando. Ainda ${t}.`, resting: 'O Juca está descansando. Pague um turno para ele trabalhar.',
    helperDoes: 'Enquanto trabalha, ele colhe e replanta os canteiros, recolhe a produção, alimenta os animais e cuida do pomar, das colmeias e do barco.', helperFull: 'O Juca parou: o celeiro está cheio.',
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
    code4: 'El código tiene 4 letras.', unlockAt: n => `Se desbloquea en el nivel ${n}`, noCoins: 'No te alcanzan las monedas', barnFull: 'El granero está lleno. Toca el Granero y vende algo.', queueFull: 'La fila está llena',
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
    barn: 'Granero', barnUsed: (n, c) => `${n} de ${c} espacios ocupados`, barnEmpty: 'Vacío. Cosecha las parcelas para llenar el granero.', barnUp: 'Ampliar granero (+50)', sellSurplus: 'Vender sobras', sellSurplusHint: 'Vende de una vez lo que ningún pedido necesita y guarda un poco de cada ingrediente.', noSurplus: 'No hay sobras: todo sirve para pedidos o recetas.', soldSurplus: c => `Vendiste las sobras por ${c} monedas`,
    orders: 'Pedidos', ordersSub: 'La gente del pueblo paga bien. Entrega para ganar monedas y experiencia.', newOrderIn: t => `Llega un pedido nuevo en ${t}…`, discardAria: 'Descartar pedido', deliver: 'Entregar',
    shop: 'Tienda', newPlot: 'Nueva parcela', allBought: 'Todas compradas', plotsOf: (n, m) => `${n} de ${m} parcelas`, bigBarn: 'Granero más grande (+50)', fitsNow: c => `Hoy caben ${c} cosas`,
    soon: 'Muy pronto', expansion: 'expansión', exps: ['Feria del pueblo', 'Heladería', 'Casa de playa', 'Invernadero de flores'],
    land_leste: 'Terreno del Huerto', land_sul: 'Terreno del Lago', forSale: 'SE VENDE', landDesc_leste: 'Seis árboles de naranja y mango y una fábrica de jugos.', landDesc_sul: 'Colmenas que dan miel y un barco de pesca en el lago.',
    buyFor: 'Comprar terreno', lands: 'Terrenos', landOwned: 'Ya es tuyo', boatGo: 'Mandar el barco (carnada: 2 maíces)', boatBack: t => `El barco vuelve en ${t}`, boatIdle: 'El barco está en el muelle. Usa 2 maíces de carnada para pescar.',
    honeyIn: t => `Miel lista en ${t}`, zoomHint: 'Usa dos dedos para acercar o alejar el mapa.',
    shiftLbl: 'Contratar por', sh0: '20 min', sh1: '1 hora', sh2: '24 horas', autoSell: 'Vender lo que sobra cuando se llene el granero', autoSellHint: 'Solo venden lo que ningún pedido necesita. Ampliar el granero e invertir sigue siendo decisión tuya.',
    helperDoes2: 'Entregan los pedidos, siembran lo que piden los pedidos, fabrican en los edificios, mantienen la ración de los animales, cosechan y recogen todo, cuidan el huerto, las colmenas, el barco y cobran en la Villa.',
    sound: 'Sonido', music: 'Música', ambient: 'Sonidos del campo', on: 'sí', off: 'no',
    lvlCap: '+50 espacios en el granero', lvlTitle: l => `¡Nivel ${l}!`, lvlCoins: c => `+${c} monedas de premio`, lvlUnlocked: 'Se desbloquea ahora', lvlNext: l => `En el nivel ${l}`, lvlNothing: 'Premio en monedas, +50 espacios en el granero y pedidos que pagan más.', lvlRoad: 'Próximos niveles', great: '¡Genial!',
    land_bairro: 'Barrio Nuevo', landDesc_bairro: 'Un barrio con avenida y 12 lotes: construye casas, llegan vecinos que pagan arriendo y dan bono en los pedidos.',
    city: 'Ciudad', cityBtn: 'Panel de la ciudad', happyL: 'Felicidad', happyHint: 'Mientras más feliz la ciudad, más rinden los arriendos (hasta 1,5x).', cityPop: (p, m) => `${p} vecinos · arriendos x${m}`, serv_praca: 'Plaza', servD_praca: 'Bancos, árboles y glorieta: +15 de felicidad', serv_posto: 'Posta de salud', servD_posto: 'Cuida a los vecinos: +20 de felicidad', servDone: (n, h) => `¡${n} inaugurada! Felicidad: ${h}`, hpFrom: 'Sube con: decoraciones, calles, obras de la villa, plaza y posta.', incomeH: n => `Arriendos: ~${n} monedas por hora`,
    upTitle: 'Mejorar edificio', upHint: (l, p) => `Nivel ${l}: todo sale ${p}% más rápido (también en las copias).`, upBtn: 'Mejorar', upDone: (n, l) => `¡${n} ahora es nivel ${l}!`, upMax: 'Nivel máximo', bLvl: l => `Nv ${l}`,
    boosts: 'Impulsos', boost_abono: 'Abono mágico', boostD_abono: 'Las plantas crecen 2x más rápido por 10 min', boost_racao: 'Ración premium', boostD_racao: 'Los animales producen 2x más rápido por 10 min', boostDone_abono: 'Abono activo: ¡siembra ahora!', boostDone_racao: 'Ración premium activa: ¡alimenta a los animales!', boostLeft: t => `Activo: ${t}`,
    truck: 'Camión de reparto', truckD: 'Entrega solo un pedido listo cada 30 s, aunque no haya ayudantes.', truckDone: '¡El camión entregó un pedido!', truckBought: '¡Camión nuevo! Entrega los pedidos listos solo.',
    tourist: 'Turista', rainNow: '¡Está lloviendo! La lluvia regó los cultivos (+30 s).',
    fair: 'Feria del barrio', fairSub: 'Pon productos en los puestos: vecinos y turistas compran a precio completo (más que vender en el granero). Con la Pousada lista llegan turistas.', fairEmpty: 'Puesto vacío: elige qué vender', fairTake: 'Retirar', fairBuy: '¡Me lo llevo!', fairSold: n => `Vendido en la feria: ${n} monedas`, stall: i => `Puesto ${i}`,
    npcSad: 'Falta una plaza por aquí…', npcHappy: '¡Me encanta vivir en esta ciudad!',
    reqs: 'Pedidos de los vecinos', reqSub: 'Los vecinos piden en persona y pagan el doble. Toca al vecino con el globo.', reqFrom: n => `${n} quiere:`, reqThanks: '¡Gracias, vecino!', reqWait: t => `Nuevo pedido en ${t}`,
    homes: 'Casas del barrio', homeHint: 'Cada casa trae 2 vecinos: +2% en los pedidos por casa (hasta 20%) y arriendo de 30 monedas cada 5 min.', homeBuy: 'Construir casa', homeDone: (a, b) => `¡${a} y ${b} se mudaron al barrio!`, homesN: (n, m, p) => `${n} de ${m} casas · ${p} vecinos`, homeOf: (a, b) => `Casa de ${a} y ${b}`, emptyLot: 'Lote vacío', rentIn: (n, t) => `${n} monedas en ${t}`, npcHi: n => `¡Hola, soy ${n}!`,
    npc: ['¡Qué día tan bonito!', '¡Me encanta el pan de aquí!', 'Esta calle quedó preciosa.', 'Voy a la feria más tarde.', '¡Buen día, vecino!', '¡Hoy el viento está perfecto!', 'Mi hijo quiere ser kitesurfista.', '¡Qué olor a pastel!', '¡La ciudad está creciendo!', '¿Hay helado hoy?', '¡Gracias por las calles nuevas!', 'Voy a pescar al lago.'],
    roads: 'Calles', roadHint: 'Arrastra para pintar · toca para borrar · 2 dedos mueven el mapa', roadBar: (f, c) => f > 0 ? `Calles: ${f} gratis` : `Calles: ${c} monedas cada una`, roadNo: 'Aquí no se puede hacer calle', roadBtn: 'Construir calles', roadInfo: (n, b) => `${n} tramos de calle · +${b}% en los pedidos (1% cada 20, hasta 10%)`,
    dups: 'Duplicar edificios', dupHint: 'Otro edificio igual, con su propia fila: produce el doble al mismo tiempo. Los ayudantes usan todos.', dupHave: (n, m) => `Tienes ${n} de ${m}`, dupBtn: 'Construir otro', dupDone: n => `¡${n} construido! Nueva fila lista.`, needLand: l => `Primero compra el terreno: ${l}`, dupNeedLand: l => `Va en el terreno ${l}`,
    silos: 'Silos', silo: 'Silo', siloHint: n => `Cada silo aparece en el mapa y suma +100 espacios. ${n} de 4.`, buySilo: 'Construir silo',
    land_praia: 'Terreno de la Playa', landDesc_praia: 'Arena, mar y cocoteros que dan cocos. Ahí se construye la Escuela de kite, que da el mejor arriendo.',
    helpersTitle: 'Ayudantes', keptHost: 'Tu amigo también jugó por separado: quedó el avance de esta sala.', hire: n => `Contratar a ${n}`, helpersN: (n, m) => `${n} de ${m} ayudantes`, helpersWork: 'Cada ayudante hace una tarea al mismo tiempo y construyen la Villa más rápido.', shiftAll: n => `Pagar turno de 20 min ${n === 1 ? 'al ayudante' : 'a los ' + n + ' ayudantes'}`,
    land_vila: 'Terreno de la Villa', landDesc_vila: 'La ciudad: tus ayudantes construyen la Pousada, el Mercado y el Restaurante, que dan monedas solos.',
    pousada: 'Pousada', mercado: 'Mercado', restaurante: 'Restaurante', build: 'Construir', building: t => `En obra: falta ${t}`, built: '¡Listo! Da monedas solo.', rentReady: n => `Recoger ${n} monedas`, rentNext: (n, t) => `${n} monedas cada 5 min. Próximas en ${t}`, buildFaster: n => `Con ${n} ayudante${n > 1 ? 's' : ''} la obra va ${n}x más rápido.`, lot: 'Lote para construir',
    rushTitle: 'Acelerar', rushText: t => `Falta ${t}. ¿Terminar ahora?`, rushBtn: 'Terminar ahora', rushDone: '¡Listo al instante!',
    trees: 'Árboles', buyTreeL: 'Plantar naranjo', buyTreeM: 'Plantar mango', treesN: (n, m) => `${n} de ${m} árboles extra`,
    move: 'Mover', moveHint: 'Modo mover: arrastra edificios, corrales, árboles, colmenas, decoración o el sembrado.', moveDone: 'Listo', moved: 'Lugar guardado',
    sorveteria: 'Heladería', sorvete: 'Helado de mango', picole: 'Paleta de naranja',
    land_colina: 'Terreno de la Colina', landDesc_colina: 'Espacio nuevo con la Heladería: helado de mango y paleta de naranja.',
    animals: 'Animales', buyHen: 'Una gallina más', buyCow: 'Una vaca más', haveN: (n, m) => `${n} de ${m}`, decos: 'Decoración', decoBonus: n => `Cada decoración hace que los pedidos paguen 5% más. Ahora: +${n}%`,
    deco_banco: 'Banco de madera', deco_flores: 'Macizo de flores', deco_espantalho: 'Espantapájaros', deco_fonte: 'Fuente', bought: 'Comprado', newDeco: n => `¡${n} adornando la granja!`,
    joiningOpen: c => `La sala ${c} ya está abierta. Entrando…`, roomWaiting: c => `Sala ${c}: esperando que entre tu amigo`, blocked: 'La sala existe, pero la conexión entre los celulares no se abrió. Prueben los dos en el mismo Wi-Fi y vuelvan a entrar.',
    addSlot: 'Un espacio más en la fila', slotsMax: 'Fila al máximo', newVersion: 'Hay una versión nueva del juego.', update: 'Actualizar',
    sellOne: 'Vender 1', sellAll: 'Vender todo', each: n => `${n} c/u`, barnFullHint: 'El granero está lleno. Toca el Granero y vende algo.', sold: (q, k, c) => `Vendiste ${q} ${N(k).toLowerCase()} por ${L('coins', c)}`,
    helperTitle: 'Ayudante Juca', helperAria: 'Ayudante', helperLocked: n => `Entreguen ${n} pedidos y se ganan a Juca, un ayudante que cuida la granja.`, helperProg: (d, n) => `${d} de ${n} pedidos entregados`,
    helperWon: '¡Se ganaron un ayudante: Juca!', shiftBtn: 'Pagar un turno de 20 min', working: t => `Juca está trabajando. Le quedan ${t}.`, resting: 'Juca está descansando. Págale un turno para que trabaje.',
    helperDoes: 'Mientras trabaja, cosecha y vuelve a sembrar las parcelas, recoge la producción, alimenta a los animales y cuida el huerto, las colmenas y el barco.', helperFull: 'Juca se detuvo: el granero está lleno.',
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
  const aria = { bMove: 'move', bHelper: 'helperAria', iCode: 'codeAria', rLink: 'linkAria', cv: 'canvasAria', hLvl: 'lvlAria', hCoins: 'coinsAria', bOrders: 'ordersAria', bBarn: 'barnAria', bShop: 'shopAria', bMenu: 'menuAria', sClose: 'close' };
  for (const [id, k] of Object.entries(aria)) { const e = $(id); if (e) e.setAttribute('aria-label', L(k)); }
  $('mLangs').innerHTML = langButtons();
}
document.addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (b) { setLang(b.dataset.lang); SND.pop(); } });

// ---------- dados do jogo ----------
const ITEMS = {
  trigo: { n: 'Trigo', v: 2 }, milho: { n: 'Milho', v: 4 }, cenoura: { n: 'Cenoura', v: 7 }, cana: { n: 'Cana', v: 10 },
  ovo: { n: 'Ovo', v: 9 }, leite: { n: 'Leite', v: 16 }, racaoG: { n: 'Ração de galinha', v: 4 }, racaoV: { n: 'Ração de vaca', v: 7 },
  pao: { n: 'Pão', v: 15 }, bolo: { n: 'Bolo de cenoura', v: 42 }, queijo: { n: 'Queijo', v: 44 }, acucar: { n: 'Açúcar', v: 26 },
  sorvete: { n: 'Sorvete', v: 62 }, picole: { n: 'Picolé', v: 36 },
  algodao: { n: 'Algodão', v: 14 }, tecido: { n: 'Tecido', v: 48 }, rede: { n: 'Rede', v: 130 }, coco: { n: 'Coco', v: 20 },
  laranja: { n: 'Laranja', v: 12 }, manga: { n: 'Manga', v: 15 }, suco: { n: 'Suco', v: 45 }, vitamina: { n: 'Vitamina', v: 58 }, mel: { n: 'Mel', v: 30 }, peixe: { n: 'Peixe', v: 28 }, paoMel: { n: 'Pão de mel', v: 70 },
};
const CROPS = {
  trigo: { t: 12, y: 2, cost: 1, lvl: 1, xp: 1 }, milho: { t: 35, y: 2, cost: 2, lvl: 1, xp: 2 },
  cenoura: { t: 70, y: 2, cost: 4, lvl: 2, xp: 3 }, cana: { t: 140, y: 2, cost: 6, lvl: 4, xp: 5 }, algodao: { t: 50, y: 2, cost: 5, lvl: 7, xp: 4 },
};
const BUILD = {
  moinho: { n: 'Moinho', lvl: 1, q: 3, x: 320, y: 205, w: 96, h: 120, rec: [
    { o: 'racaoG', k: 3, i: { trigo: 2, milho: 1 }, t: 30, lvl: 1, xp: 2 },
    { o: 'racaoV', k: 3, i: { milho: 2, cenoura: 1 }, t: 45, lvl: 3, xp: 3 },
    { o: 'acucar', k: 1, i: { cana: 2 }, t: 60, lvl: 5, xp: 4 }] },
  padaria: { n: 'Padaria', lvl: 2, q: 3, x: 84, y: 560, w: 116, h: 84, rec: [
    { o: 'pao', k: 1, i: { trigo: 3 }, t: 60, lvl: 2, xp: 3 },
    { o: 'bolo', k: 1, i: { cenoura: 2, ovo: 1, trigo: 1 }, t: 150, lvl: 3, xp: 6 },
    { o: 'paoMel', k: 1, i: { trigo: 2, mel: 1, ovo: 1 }, t: 120, lvl: 5, xp: 8, land: 'sul' }] },
  tecelagem: { n: 'Tecelagem', lvl: 8, q: 2, x: 190, y: 985, w: 120, h: 84, rec: [
    { o: 'tecido', k: 1, i: { algodao: 3 }, t: 60, lvl: 8, xp: 6 },
    { o: 'rede', k: 1, i: { tecido: 2, cana: 1 }, t: 150, lvl: 8, xp: 10 }] },
  queijaria: { n: 'Queijaria', lvl: 4, q: 2, x: 556, y: 560, w: 116, h: 84, rec: [
    { o: 'queijo', k: 1, i: { leite: 2 }, t: 120, lvl: 4, xp: 6 }] },
  sorveteria: { n: 'Sorveteria', lvl: 6, q: 2, x: 900, y: 930, w: 130, h: 86, land: 'colina', rec: [
    { o: 'sorvete', k: 1, i: { leite: 1, manga: 1, acucar: 1 }, t: 90, lvl: 6, xp: 8 },
    { o: 'picole', k: 2, i: { laranja: 2, acucar: 1 }, t: 60, lvl: 6, xp: 6 }] },
  sucos: { n: 'Sucos', lvl: 4, q: 3, x: 870, y: 590, w: 140, h: 90, land: 'leste', rec: [
    { o: 'suco', k: 1, i: { laranja: 3 }, t: 90, lvl: 4, xp: 5 },
    { o: 'vitamina', k: 1, i: { manga: 2, leite: 1 }, t: 120, lvl: 5, xp: 7 }] },
};
// expansão 1: terrenos novos que fazem o mapa crescer
const LANDS = {
  leste: { lvl: 4, cost: 300, r: { x: 660, y: 70, w: 420, h: 590 }, sx: 870, sy: 330 },
  sul: { lvl: 5, cost: 500, r: { x: 20, y: 1010, w: 1060, h: 300 }, sx: 380, sy: 1150 },
  colina: { lvl: 6, cost: 800, r: { x: 660, y: 680, w: 420, h: 300 }, sx: 870, sy: 800 },
  vila: { lvl: 7, cost: 1200, r: { x: 20, y: 1370, w: 1060, h: 320 }, sx: 560, sy: 1470 },
  praia: { lvl: 9, cost: 2000, r: { x: 1110, y: 40, w: 370, h: 1650 }, sx: 1290, sy: 420 },
  bairro: { lvl: 8, cost: 1500, r: { x: 20, y: 1730, w: 1460, h: 570 }, sx: 740, sy: 1900 },
};
const TREES = [['laranja', 740, 210], ['laranja', 860, 210], ['laranja', 980, 210], ['manga', 740, 380], ['manga', 860, 380], ['manga', 980, 380]];
const FRUIT = { laranja: { t: 90, y: 3, xp: 4 }, manga: { t: 140, y: 2, xp: 5 }, coco: { t: 180, y: 2, xp: 6 } };
const COCO_POS = [[1190, 300], [1310, 560], [1190, 800], [1310, 1000]];
const SILOS = [{ x: 640, y: 215 }, { x: 640, y: 325 }, { x: 455, y: 160 }, { x: 405, y: 160 }], siloCost = n => [500, 900, 1400, 2000][n] || 0;
const HIVES = [[110, 1110], [190, 1110], [110, 1220], [190, 1220]], HIVE_T = 110;
const BOAT = { x: 640, y: 1190, t: 70, bait: { milho: 2 }, out: 'peixe', k: 2, xp: 5 };
const LAKE = { x: 830, y: 1170, rx: 230, ry: 110 };
const MAXQ = 7, qCap = (S, k) => BUILD[k].q + ((S.slots && S.slots[k]) || 0), slotCost = (S, k) => 60 * Math.pow(2, (S.slots && S.slots[k]) || 0);
const sellPrice = k => Math.max(1, Math.round(ITEMS[k].v * 0.6));
for (const B of Object.values(BUILD)) for (const r of B.rec) r.t = Math.max(10, Math.round(r.t * 0.6));
// prédios duplicados: 2ª e 3ª unidade de cada prédio de produção, com fila própria (mesmas receitas)
const DUP_TYPES = ['moinho', 'padaria', 'queijaria', 'sucos', 'tecelagem', 'sorveteria'], DUP_MAX = 2;
const DUP_BASE = { moinho: 300, padaria: 500, queijaria: 800, sucos: 900, tecelagem: 1200, sorveteria: 1500 };
const dupCost = (k, n) => DUP_BASE[k] * (n + 1);
const DUP_SPOTS = [[90, 1500, 'vila'], [220, 1500, 'vila'], [350, 1500, 'vila'], [480, 1500, 'vila'], [610, 1500, 'vila'], [740, 1500, 'vila'], [870, 1500, 'vila'], [1000, 1500, 'vila'],
  [310, 1130, 'sul'], [440, 1130, 'sul'], [310, 1290, 'sul'], [440, 1290, 'sul']];
const DUP_COL = { moinho: ['#f2e3c6', '#b5523b'], padaria: ['#ffe2b0', '#c8702a'], queijaria: ['#e6f2ff', '#3f8fd1'], sucos: ['#fff4d6', '#ff9a1f'], tecelagem: ['#f3e9ff', '#7b5ea7'], sorveteria: ['#ffe4ee', '#ff7aa8'] };
{ let si = 0; for (let n = 2; n <= 1 + DUP_MAX; n++) for (const k of DUP_TYPES) { const B = BUILD[k], sp = DUP_SPOTS[si++];
  BUILD[k + '_' + n] = { n: B.n + ' ' + n, base: k, idx: n, lvl: B.lvl, q: B.q, x: sp[0], y: sp[1], w: 110, h: 80, land: sp[2], baseLand: B.land, rec: B.rec }; } }
// melhorias: nível 2 e 3 de cada tipo de prédio (vale para todas as cópias): produz mais rápido
const UP_MULT = [1, 0.8, 0.6], UP_LVL = [0, 6, 10], upLv = (S, k) => (S.blv && S.blv[k]) || 0, upCost = (k, l) => Math.round((DUP_BASE[k] || 400) * 1.5 * (l + 1));
// impulsos: abono (plantas crescem 2x) e ração premium (animais 2x) por 10 minutos
const BOOSTS = { abono: { cost: 120, min: 10 }, racao: { cost: 160, min: 10 } }, boostOn = (S, k, now) => !!(S.boost && S.boost[k] > now);
const dupN = (S, k) => (S.dup && S.dup[k]) || 0;
const famOf = b => BUILD[b].base || b;
const fam = (S, k) => Object.keys(BUILD).filter(b => famOf(b) === k && okB(S, BUILD[b]));
const rushCost = sec => Math.max(2, Math.ceil(sec / 8));
const XT_MAX = 16, treeCost = k => k === 'laranja' ? 150 : 220;
const XT_SPOTS = [[560, 470], [620, 520], [560, 160], [150, 960], [470, 980], [1060, 520], [700, 720], [800, 720], [1010, 720], [700, 860], [790, 860], [1040, 860], [1050, 960], [700, 960], [1060, 120]];
const FIELD = { dx: 0, dy: 0 };
// posições padrão de tudo que pode ser movido; o layout salvo (S.pos) é aplicado por cima
const DEF = {};
function captureDefaults() {
  for (const [k, B] of Object.entries(BUILD)) DEF[k] = { x: B.x, y: B.y, o: B };
  for (const [k, P] of Object.entries(PENS)) DEF[k] = { x: P.x, y: P.y, o: P };
  for (const [k, D] of Object.entries(DECOS)) DEF['d_' + k] = { x: D.x, y: D.y, o: D };
  TREES.forEach((t, i) => { DEF['t' + i] = { x: t[1], y: t[2], tr: t }; });
  HIVES.forEach((h, i) => { DEF['h' + i] = { x: h[0], y: h[1], hv: h }; });
  SILOS.forEach((o, i) => { DEF['s' + i] = { x: o.x, y: o.y, o }; });
  DEF.campo = { x: 0, y: 0, field: true };
}
function applyLayout(S) {
  for (const [k, d] of Object.entries(DEF)) {
    let p = (S && S.pos && S.pos[k]) || d; if (G.dragPos && G.dragPos.k === k) p = G.dragPos;
    if (d.o) { d.o.x = p.x; d.o.y = p.y; } else if (d.tr) { d.tr[1] = p.x; d.tr[2] = p.y; } else if (d.hv) { d.hv[0] = p.x; d.hv[1] = p.y; } else if (d.field) { FIELD.dx = p.x; FIELD.dy = p.y; }
  }
  if (S && G.dragPos && /^x\d+$/.test(G.dragPos.k)) { const t = S.xt[+G.dragPos.k.slice(1)]; if (t) { G.dragXt = { j: +G.dragPos.k.slice(1), x: G.dragPos.x, y: G.dragPos.y }; } } else G.dragXt = null;
}
const PEN_MAX = { galinheiro: 10, estabulo: 8 }, animalCost = (k, n) => k === 'galinheiro' ? 60 + 40 * (n - 3) : 180 + 120 * (n - 2);
const DECOS = { banco: { cost: 150, x: 185, y: 690 }, flores: { cost: 200, x: 255, y: 692 }, espantalho: { cost: 300, x: 510, y: 330 }, fonte: { cost: 600, x: 470, y: 700 } };
const RD = 40, ROAD_MAX = 700, ROAD_COST = 5, ROAD_FREE = 30, roadKey = (gx, gy) => gy * 100 + gx;
const roadBonus = S => Math.min(10, Math.floor(((S.roads && S.roads.length) || 0) / 20));
const decoBonus = S => Object.keys(DECOS).filter(k => S.deco && S.deco[k]).length * 5 + roadBonus(S) + popBonus(S);
function roadOk(S, gx, gy) { const x = gx * RD + RD / 2, y = gy * RD + RD / 2; if (x < 20 || y < 50 || x > WW - 20 || y > WH - 20) return false; for (const [k, Ld] of Object.entries(LANDS)) if (!S.land[k] && inR({ x, y }, Ld.r)) return false; return true; }
captureDefaults.later = true;
const HELPER_NAMES = ['Juca', 'Nina', 'Tonho', 'Bia'], HELPER_LOOKS = ['cap', 'cap2', 'cap3', 'cap4'], hireCost = n => [0, 400, 900, 1600][n] || 0;
const PROJ = {
  pousada: { lvl: 7, cost: 800, need: { pao: 6, suco: 3 }, t: 300, inc: 60, x: 200, y: 1640, w: 170, h: 110 },
  mercado: { lvl: 8, cost: 1500, need: { queijo: 4, mel: 3 }, t: 480, inc: 100, x: 560, y: 1640, w: 160, h: 96 },
  restaurante: { lvl: 9, cost: 2500, need: { peixe: 6, bolo: 3 }, t: 600, inc: 160, x: 910, y: 1640, w: 160, h: 100 },
  escola: { land: 'praia', lvl: 10, cost: 3000, need: { rede: 2, suco: 4, coco: 4 }, t: 720, inc: 250, x: 1300, y: 1330, w: 170, h: 100 },
};
const RENT_EVERY = 300, RENT_CAP = 6;
// bairro: lotes para casas de vizinhos; cada casa traz 2 moradores (NPC) e paga aluguel
const LOTS = [[130, 1960], [330, 1960], [530, 1960], [730, 1960], [930, 1960], [1130, 1960], [130, 2250], [330, 2250], [930, 2250], [1130, 2250]];
// feira do bairro: 4 barracas onde vizinhos e turistas compram pelo preço cheio
const FAIR = { x: 630, y: 2250, n: 4, max: 10 }, fairX = i => FAIR.x - 150 + i * 100;
const HOME_INC = 30, homeCost = n => 400 + n * 250, popBonus = S => Math.min(20, ((S.homes && S.homes.length) || 0) * 2);
const HOME_COL = [['#fff1d6', '#d9614b'], ['#e6f2ff', '#3f8fd1'], ['#f3ffe6', '#4f9a2f'], ['#ffe4ee', '#c2477a'], ['#fff4d6', '#e6a92a'], ['#f3e9ff', '#7b5ea7']];
const NPC_NAMES = ['Dona Rosa', 'Seu Zé', 'Lia', 'Caio', 'Dona Cida', 'Tião', 'Malu', 'Davi', 'Iara', 'Beto', 'Lena', 'Rui', 'Dona Fia', 'Nico', 'Sol', 'Teo', 'Mel', 'Gui', 'Bela', 'Duda', 'Kiko', 'Rita', 'Leo', 'Vivi'];
function homeRent(S, i, now) { const h = S.homes[i]; if (!h) return 0; return Math.round(Math.min(Math.floor((now - h.c) / (RENT_EVERY * 1000)), RENT_CAP) * HOME_INC * cityMult(S)); }
const hCount = S => S.helper && S.helper.on ? (S.helper.n || 1) : 0;
// serviços do bairro e felicidade da cidade (multiplica aluguéis)
const SERV = { praca: { cost: 1200, hp: 15, x: 1330, y: 2250, lvl: 8 }, posto: { cost: 2000, hp: 20, x: 1330, y: 1960, lvl: 10 } };
function happy(S) { let h = 30 + Object.keys(DECOS).filter(k => S.deco && S.deco[k]).length * 5 + roadBonus(S) * 2 + Object.keys(PROJ).filter(k => S.city[k]).length * 5;
  for (const [k, V] of Object.entries(SERV)) if (S.serv && S.serv[k]) h += V.hp; return Math.min(100, h); }
const cityMult = S => 0.5 + happy(S) / 100;
function rentNow(S, k, now) { const c = S.city[k]; if (!c || c.e > now) return 0; const per = Math.floor((now - c.c) / (RENT_EVERY * 1000)); return Math.round(Math.min(per, RENT_CAP) * PROJ[k].inc * cityMult(S)); }
const SHIFTS = [{ min: 20, cost: 25 }, { min: 60, cost: 60 }, { min: 1440, cost: 900 }];
const HELPER_ORDERS = 8, SHIFT = { cost: 25, min: 20 }, HELPER_HOME = { x: 196, y: 262 };
const PENS = {
  galinheiro: { n: 'Galinheiro', lvl: 1, feed: 'racaoG', out: 'ovo', t: 90, count: 3, xp: 2, x: 125, y: 790, w: 210, h: 140 },
  estabulo: { n: 'Estábulo', lvl: 3, feed: 'racaoV', out: 'leite', t: 180, count: 2, xp: 4, x: 515, y: 790, w: 210, h: 140 },
};
PENS.galinheiro.t = 50; PENS.estabulo.t = 90; // ritmo mais rápido
const BARN = { x: 548, y: 205, w: 124, h: 96 }, HOUSE = { x: 96, y: 205, w: 120, h: 86 }, BOARD = { x: 320, y: 905, w: 120, h: 70 };
const LV = [0, 12, 35, 70, 120, 190, 280, 400, 550, 750, 1000, 1300];
for (let l = 12; l < 40; l++) LV.push(LV[l - 1] + 300 + (l - 11) * 160); // níveis até 40
const MAXPLOTS = 12, PLOT0 = 6, WW = 1500, WH = 2320;
const plotRect = i => ({ x: 168 + FIELD.dx + (i % 3) * 104, y: 290 + FIELD.dy + Math.floor(i / 3) * 82, w: 96, h: 72 });
const plotCost = np => Math.round(25 * Math.pow(1.55, np - PLOT0));
const capCost = cap => Math.round(60 + Math.max(0, cap - 100) / 50 * 70);

// ---------- estado ----------
const rid = () => Math.random().toString(36).slice(2, 10);
function newFarm(name) {
  return { v: 1, fid: rid(), rev: 0, name, coins: 60, xp: 0, lvl: 1, cap: 100, np: PLOT0, capv2: 1,
    plots: Array.from({ length: MAXPLOTS }, () => ({ c: null, p: 0 })), inv: { trigo: 4, milho: 2 },
    bld: { moinho: { q: [] }, padaria: { q: [] }, queijaria: { q: [] } },
    pens: { galinheiro: { a: [0, 0, 0] }, estabulo: { a: [0, 0] } }, orders: [], oid: 1, land: {}, trees: TREES.map(() => 0), hives: HIVES.map(() => 0), boat: { e: 0 } };
}
function migrate(S) {
  if (!S.land || typeof S.land !== 'object') S.land = {};
  if (!Array.isArray(S.trees) || S.trees.length !== TREES.length) S.trees = TREES.map(() => 0);
  if (!Array.isArray(S.hives) || S.hives.length !== HIVES.length) S.hives = HIVES.map(() => 0);
  if (!S.boat || typeof S.boat !== 'object') S.boat = { e: 0 };
  if (typeof S.done !== 'number') S.done = 0;
  if (!S.slots || typeof S.slots !== 'object') S.slots = {};
  if (!S.deco || typeof S.deco !== 'object') S.deco = {};
  if (!Array.isArray(S.xt)) S.xt = [];
  if (!S.city || typeof S.city !== 'object') S.city = {};
  if (!S.dup || typeof S.dup !== 'object') S.dup = {}; if (!S.blv || typeof S.blv !== 'object') S.blv = {}; if (!S.serv || typeof S.serv !== 'object') S.serv = {}; if (typeof S.truck !== 'number') S.truck = 0; if (!S.boost || typeof S.boost !== 'object') S.boost = {};
  if (!Array.isArray(S.homes)) S.homes = []; if (!Array.isArray(S.reqs)) S.reqs = []; if (!Array.isArray(S.fair)) S.fair = [null, null, null, null];
  if (!Array.isArray(S.roads)) S.roads = []; if (typeof S.roadFree !== 'number') S.roadFree = ROAD_FREE;
  if (typeof S.silos !== 'number') S.silos = 0;
  if (!S.capv2) { S.capv2 = 1; S.cap = (S.cap || 50) + 150; }
  if (S.helper && !S.helper.n) S.helper.n = 1; if (S.helper && !Array.isArray(S.helper.ps)) S.helper.ps = [];
  if (!S.pos || typeof S.pos !== 'object') S.pos = {};
  if (!S.helper || typeof S.helper !== 'object') S.helper = { on: 0, until: 0, x: HELPER_HOME.x, y: HELPER_HOME.y };
  for (const k of Object.keys(BUILD)) if (!S.bld[k]) S.bld[k] = { q: [] };
  return S;
}
const okB = (S, B) => B.lvl <= S.lvl && (!B.land || S.land[B.land]) && (!B.base || (dupN(S, B.base) >= B.idx - 1 && (!B.baseLand || S.land[B.baseLand])));
const dupOwned = (S, B) => !B.base || (S.dup && dupN(S, B.base) >= B.idx - 1);
const okR = (S, r) => r.lvl <= S.lvl && (!r.land || S.land[r.land]);
function treeList(S) { const out = []; if (S.land.leste) TREES.forEach((t, i) => out.push({ i, k: t[0], x: t[1], y: t[2], t: S.trees[i] })); (S.xt || []).forEach((t, j) => { const d = typeof G !== 'undefined' && G.dragXt && G.dragXt.j === j ? G.dragXt : t; out.push({ i: TREES.length + j, k: t.k, x: d.x, y: d.y, t: t.t, j }); }); return out; }
const treeAt = (S, i) => treeList(S).find(t => t.i === i);
function setTreeT(S, i, v) { if (i < TREES.length) S.trees[i] = v; else S.xt[i - TREES.length].t = v; }
const treeReady = (S, i, now) => { const t = treeAt(S, i); return !!t && now >= t.t + FRUIT[t.k].t * 1000; };
const hiveReady = (S, i, now) => S.land.sul && now >= S.hives[i] + HIVE_T * 1000;
const invCount = S => Object.values(S.inv).reduce((a, b) => a + b, 0);
const has = (S, need) => Object.entries(need).every(([k, q]) => (S.inv[k] || 0) >= q);
function take(S, need) { for (const [k, q] of Object.entries(need)) { S.inv[k] -= q; if (S.inv[k] <= 0) delete S.inv[k]; } }
const give = (S, k, q) => { S.inv[k] = (S.inv[k] || 0) + q; };
const plotReady = (pl, now) => pl.c && now >= pl.p + CROPS[pl.c].t * 1000;
function addXp(S, x, out) { S.xp += x; while (S.lvl < LV.length && S.xp >= LV[S.lvl]) { S.lvl++; S.coins += 50 * S.lvl; S.cap += 50; out.fx.push(['lvl', S.lvl]); } }
function unlockedItems(S) {
  const out = [];
  for (const [k, c] of Object.entries(CROPS)) if (c.lvl <= S.lvl) out.push(k);
  for (const p of Object.values(PENS)) if (p.lvl <= S.lvl) out.push(p.out);
  for (const b of Object.values(BUILD)) if (okB(S, b)) for (const r of b.rec) if (okR(S, r) && !r.o.startsWith('racao')) out.push(r.o);
  if (S.land.leste) out.push('laranja', 'manga');
  if (S.land.sul) out.push('mel', 'peixe');
  if (S.land.praia) out.push('coco');
  return out;
}
function genOrder(S) {
  const items = unlockedItems(S), kinds = 1 + (items.length > 2 && Math.random() < 0.55 ? 1 : 0) + (S.lvl >= 3 && Math.random() < 0.3 ? 1 : 0), it = [];
  const pool = items.slice();
  for (let i = 0; i < kinds && pool.length; i++) { const k = pool.splice(Math.floor(Math.random() * pool.length), 1)[0]; const q = clamp(Math.round((8 + S.lvl * 4) / ITEMS[k].v * (0.6 + Math.random() * 0.8)), 1, 8); it.push([k, q]); }
  const val = it.reduce((a, [k, q]) => a + ITEMS[k].v * q, 0);
  return { it, c: Math.round(val * 1.4) + 5, x: Math.round(val / 3) + 1 };
}
// pedidos dos vizinhos: cada morador pode pedir algo em pessoa e paga o dobro
function genReq(S) { const items = unlockedItems(S), k = items[Math.floor(Math.random() * items.length)], q = clamp(Math.round((20 + S.lvl * 6) / ITEMS[k].v * (0.6 + Math.random() * 0.6)), 1, 6), val = ITEMS[k].v * q;
  return { who: Math.floor(Math.random() * Math.max(1, S.homes.length * 2)), it: [[k, q]], c: Math.round(val * 2) + 10, x: Math.round(val / 3) + 2 }; }
function ensureReqs(S, now) { if (!S.homes || !S.homes.length) return false; let ch = false; const want = Math.min(4, S.homes.length);
  while (S.reqs.length < want) { const r = { id: S.oid++, w: now, ...genReq(S) }; if (S.reqs.some(o => o.who === r.who)) r.who = (r.who + 1) % (S.homes.length * 2); S.reqs.push(r); ch = true; } return ch; }
// chuva: de vez em quando chove 1 minuto e rega tudo (plantas e árvores adiantam 30 s)
function rainTick(S, now) { if (!S.wx || typeof S.wx !== 'object') S.wx = {}; if (S.wx.r > now || now < (S.wx.next || 0)) return false; if (Math.random() > 1 / 300) return false;
  S.wx = { r: now + 60000, next: now + 7 * 60000 }; for (const pl of S.plots) if (pl.c && !plotReady(pl, now)) pl.p -= 30000; (S.xt || []).forEach(t => { t.t -= 30000; }); S.trees = S.trees.map(t => t - 30000); toast(L('rainNow'), 3500); return true; }
// caminhão de entregas: a cada 30 s entrega sozinho uma encomenda que já dá para cumprir
const TRUCK = { cost: 2000, lvl: 9, x: 440, y: 960 };
function truckTick(S, now) { if (!S.truck || now - (S.truckAt || 0) < 30000) return null; const o = S.orders.find(o => o.w <= now && has(S, Object.fromEntries(o.it)));
  if (!o) return null; const r = apply(S, { a: 'deliver', id: o.id }, now); if (r.ok) S.truckAt = now; return r; }
function drawTruck(g, x, y, d, T) { g.save(); g.translate(x, y); g.scale(d, 1); g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 4, 46, 8, 0, 0, 6.283); g.fill();
  g.fillStyle = '#3f8fd1'; rr(g, -44, -44, 58, 40, 6); g.fill(); g.fillStyle = '#ffffff'; g.fillRect(-38, -36, 46, 4); g.fillStyle = '#e0533d'; rr(g, 14, -34, 30, 30, 6); g.fill(); g.fillStyle = '#bfe9ff'; g.fillRect(24, -30, 16, 12);
  g.fillStyle = '#ffd23f'; g.fillRect(40, -12, 5, 5); for (const wx of [-28, 28]) { g.fillStyle = '#2b2b2b'; g.beginPath(); g.arc(wx, -2, 9, 0, 6.283); g.fill(); g.fillStyle = '#aaa'; g.beginPath(); g.arc(wx, -2, 3.5, 0, 6.283); g.fill(); }
  g.drawImage(iconCanvas('orders'), -30, -42, 26, 26); g.restore(); }
function fairTick(S, now) { if (!S.land.bairro || !S.fair || !S.fair.some(Boolean)) return -1; const tour = S.city.pousada && S.city.pousada.e <= now;
  const p = 0.05 + Math.min(0.1, S.homes.length * 0.01) + (tour ? 0.05 : 0); if (Math.random() > p) return -1;
  const opts = S.fair.map((st, i) => st ? i : -1).filter(i => i >= 0), i = opts[Math.floor(Math.random() * opts.length)], st = S.fair[i];
  S.coins += ITEMS[st.k].v; S.fairSold = (S.fairSold || 0) + ITEMS[st.k].v; if (--st.q <= 0) S.fair[i] = null; return i; }
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
    S.coins -= c.cost; S.plots[i] = { c: a.c, p: boostOn(S, 'abono', now) ? now - c.t * 500 : now }; out.fx.push(['plant', i]);
  } else if (a.a === 'harvest') {
    const i = a.i | 0, pl = S.plots[i]; if (!pl || !plotReady(pl, now)) return fail('');
    const c = CROPS[pl.c]; if (invCount(S) + c.y > S.cap) return fail(L('barnFull'));
    give(S, pl.c, c.y); out.fx.push(['gain', pl.c, c.y, 'plot', i]); addXp(S, c.xp, out); S.plots[i] = { c: null, p: 0 };
  } else if (a.a === 'craft') {
    const B = BUILD[a.b], r = B && B.rec[a.r | 0], st = B && S.bld[a.b];
    if (!r || !okB(S, B) || !okR(S, r)) return fail('');
    if (st.q.length >= qCap(S, a.b)) return fail(L('queueFull'));
    if (!has(S, r.i)) return fail(L('missingIng'));
    take(S, r.i); const s = st.q.length ? Math.max(now, st.q[st.q.length - 1].e) : now;
    st.q.push({ r: a.r | 0, s, e: s + Math.round(r.t * UP_MULT[upLv(S, famOf(a.b))] * 1000) }); out.fx.push(['craft', a.b]);
  } else if (a.a === 'collect') {
    const B = BUILD[a.b], st = B && S.bld[a.b]; if (!st) return fail('');
    let n = 0; while (st.q.length && st.q[0].e <= now) { const r = B.rec[st.q[0].r]; if (invCount(S) + r.k > S.cap) { if (!n) return fail(L('barnFull')); break; } give(S, r.o, r.k); addXp(S, r.xp, out); out.fx.push(['gain', r.o, r.k, 'bld', a.b]); st.q.shift(); n++; }
    if (!n) return fail(L('notReady')); packQ(st, now);
  } else if (a.a === 'pen') {
    const P = PENS[a.k], st = P && S.pens[a.k]; if (!st || P.lvl > S.lvl) return fail('');
    let got = 0;
    for (let j = 0; j < st.a.length; j++) if (st.a[j] && now >= st.a[j] + P.t * 1000) { if (invCount(S) + 1 > S.cap) { if (!got) return fail(L('barnFull')); break; } give(S, P.out, 1); addXp(S, P.xp, out); st.a[j] = 0; got++; }
    if (got) out.fx.push(['gain', P.out, got, 'pen', a.k]);
    else { let fed = 0; for (let j = 0; j < st.a.length; j++) if (!st.a[j] && (S.inv[P.feed] || 0) > 0) { take(S, { [P.feed]: 1 }); st.a[j] = boostOn(S, 'racao', now) ? now - P.t * 500 : now; fed++; }
      if (!fed) return fail(st.a.some(x => !x) ? L('needFeed', P.feed) : L('producing')); out.fx.push(['feed', a.k, fed]); }
  } else if (a.a === 'deliver') {
    const o = S.orders.find(x => x.id === a.id); if (!o || o.w > now) return fail('');
    const need = Object.fromEntries(o.it); if (!has(S, need)) return fail(L('missingProd'));
    const pay = Math.round(o.c * (1 + decoBonus(S) / 100)); take(S, need); S.coins += pay; addXp(S, o.x, out); out.fx.push(['coins', pay]);
    Object.assign(o, { id: S.oid++, w: now + 12000 }, genOrder(S));
    S.done = (S.done || 0) + 1; if (S.done >= HELPER_ORDERS && !S.helper.on) { S.helper.on = 1; out.fx.push(['helper']); }
  } else if (a.a === 'discard') {
    const o = S.orders.find(x => x.id === a.id); if (!o || o.w > now) return fail('');
    Object.assign(o, { id: S.oid++, w: now + 40000 }, genOrder(S));
  } else if (a.a === 'buyPlot') {
    if (S.np >= MAXPLOTS) return fail(''); const c = plotCost(S.np); if (S.coins < c) return fail(L('noCoins'));
    S.coins -= c; S.np++; out.fx.push(['coins', -c]);
  } else if (a.a === 'land') {
    const Ld = LANDS[a.k]; if (!Ld || S.land[a.k]) return fail('');
    if (Ld.lvl > S.lvl) return fail(L('unlockAt', Ld.lvl)); if (S.coins < Ld.cost) return fail(L('noCoins'));
    S.coins -= Ld.cost; S.land[a.k] = 1; if (a.k === 'praia') for (const [x, y] of COCO_POS) S.xt.push({ k: 'coco', x, y, t: now }); if (a.k === 'leste') S.trees = TREES.map(() => now); if (a.k === 'sul') S.hives = HIVES.map(() => now);
    out.fx.push(['land', a.k]);
  } else if (a.a === 'tree') {
    const i = a.i | 0, tr = treeAt(S, i); if (!tr) return fail('');
    if (!treeReady(S, i, now)) return fail(L('readyIn', tr.k, fmtT(Math.ceil((tr.t + FRUIT[tr.k].t * 1000 - now) / 1000))));
    const F = FRUIT[tr.k]; if (invCount(S) + F.y > S.cap) return fail(L('barnFull'));
    give(S, tr.k, F.y); addXp(S, F.xp, out); setTreeT(S, i, now); out.fx.push(['gain', tr.k, F.y, 'tree', i]);
  } else if (a.a === 'hive') {
    if (!S.land.sul) return fail(''); let n = 0;
    for (let i = 0; i < HIVES.length; i++) if (hiveReady(S, i, now)) { if (invCount(S) + 1 > S.cap) { if (!n) return fail(L('barnFull')); break; } give(S, 'mel', 1); S.hives[i] = now; n++; }
    if (!n) return fail(L('honeyIn', fmtT(Math.ceil((Math.min(...S.hives) + HIVE_T * 1000 - now) / 1000))));
    addXp(S, 2 * n, out); out.fx.push(['gain', 'mel', n, 'hive', 0]);
  } else if (a.a === 'boat') {
    if (!S.land.sul) return fail('');
    if (!S.boat.e) { if (!has(S, BOAT.bait)) return fail(L('missingIng')); take(S, BOAT.bait); S.boat.e = now + BOAT.t * 1000; out.fx.push(['boat']); }
    else if (S.boat.e <= now) { if (invCount(S) + BOAT.k > S.cap) return fail(L('barnFull')); give(S, BOAT.out, BOAT.k); addXp(S, BOAT.xp, out); S.boat.e = 0; out.fx.push(['gain', BOAT.out, BOAT.k, 'boat', 0]); }
    else return fail(L('boatBack', fmtT(Math.ceil((S.boat.e - now) / 1000))));
  } else if (a.a === 'rush') {
    let rem = 0, doIt = null;
    if (a.t === 'plot') { const pl = S.plots[a.i | 0]; if (pl && pl.c && !plotReady(pl, now)) { rem = pl.p + CROPS[pl.c].t * 1000 - now; doIt = () => { pl.p = now - CROPS[pl.c].t * 1000; }; } }
    else if (a.t === 'pen') { const P = PENS[a.k], st = P && S.pens[a.k]; if (st) { const busy = st.a.filter(f => f && now < f + P.t * 1000); if (busy.length) { rem = Math.max(...busy) + P.t * 1000 - now; doIt = () => { st.a = st.a.map(f => f && now < f + P.t * 1000 ? now - P.t * 1000 : f); }; } } }
    else if (a.t === 'bld') { const st = S.bld[a.b]; const j = st && st.q[0]; if (j && j.e > now) { rem = j.e - now; doIt = () => { j.s = Math.min(j.s, now); j.e = now; }; } }
    else if (a.t === 'tree') { const tr = treeAt(S, a.i | 0); if (tr && !treeReady(S, tr.i, now)) { rem = tr.t + FRUIT[tr.k].t * 1000 - now; doIt = () => setTreeT(S, tr.i, now - FRUIT[tr.k].t * 1000); } }
    else if (a.t === 'city') { const c = S.city[a.k]; if (c && c.e > now) { rem = c.e - now; doIt = () => { c.e = now; c.c = now; }; } }
    else if (a.t === 'boat') { if (S.boat.e && S.boat.e > now) { rem = S.boat.e - now; doIt = () => { S.boat.e = now; }; } }
    if (!doIt) return fail(''); const c = rushCost(Math.ceil(rem / 1000)); if (S.coins < c) return fail(L('noCoins'));
    S.coins -= c; doIt(); out.fx.push(['coins', -c]); out.fx.push(['rush']);
  } else if (a.a === 'fairPut') {
    const i = a.i | 0, k = a.k; if (!S.land.bairro || i < 0 || i >= FAIR.n || S.fair[i] || !ITEMS[k] || !(S.inv[k] > 0)) return fail(''); const q = Math.min(FAIR.max, S.inv[k]); take(S, { [k]: q }); S.fair[i] = { k, q }; out.fx.push(['fairPut', i]);
  } else if (a.a === 'fairTake') {
    const i = a.i | 0, st = S.fair[i]; if (!st) return fail(''); if (invCount(S) + st.q > S.cap) return fail(L('barnFull')); give(S, st.k, st.q); S.fair[i] = null;
  } else if (a.a === 'truck') {
    if (S.truck) return fail(''); if (S.lvl < TRUCK.lvl) return fail(L('unlockAt', TRUCK.lvl)); if (S.coins < TRUCK.cost) return fail(L('noCoins')); S.coins -= TRUCK.cost; S.truck = 1; S.truckAt = 0; out.fx.push(['truck']);
  } else if (a.a === 'serv') {
    const V = SERV[a.k]; if (!V || S.serv[a.k]) return fail(''); if (!S.land.bairro) return fail(L('needLand', L('land_bairro'))); if (S.lvl < V.lvl) return fail(L('unlockAt', V.lvl));
    if (S.coins < V.cost) return fail(L('noCoins')); S.coins -= V.cost; S.serv[a.k] = 1; addXp(S, 15, out); out.fx.push(['serv', a.k]);
  } else if (a.a === 'up') {
    const k = a.k, B = BUILD[k], l = upLv(S, k); if (!B || B.base || !okB(S, B) || l >= 2) return fail(''); if (S.lvl < UP_LVL[l + 1]) return fail(L('unlockAt', UP_LVL[l + 1]));
    const c = upCost(k, l); if (S.coins < c) return fail(L('noCoins')); S.coins -= c; S.blv[k] = l + 1; out.fx.push(['up', k]);
  } else if (a.a === 'boost') {
    const B = BOOSTS[a.k]; if (!B) return fail(''); if (S.coins < B.cost) return fail(L('noCoins')); S.coins -= B.cost; S.boost[a.k] = Math.max(now, S.boost[a.k] || 0) + B.min * 60000; out.fx.push(['boost', a.k]);
  } else if (a.a === 'req') {
    const o = S.reqs.find(x => x.id === a.id); if (!o || o.w > now) return fail(''); const need = Object.fromEntries(o.it); if (!has(S, need)) return fail(L('missingProd'));
    const pay = Math.round(o.c * (1 + decoBonus(S) / 100)); take(S, need); S.coins += pay; addXp(S, o.x, out); out.fx.push(['coins', pay]); out.fx.push(['req', o.who]);
    Object.assign(o, { id: S.oid++, w: now + 45000 }, genReq(S)); if (S.reqs.some(x => x !== o && x.who === o.who)) o.who = (o.who + 1) % (S.homes.length * 2);
  } else if (a.a === 'home') {
    if (!S.land.bairro) return fail(L('needLand', L('land_bairro'))); const n = S.homes.length; if (n >= LOTS.length) return fail(L('slotsMax'));
    const c = homeCost(n); if (S.coins < c) return fail(L('noCoins')); S.coins -= c; S.homes.push({ c: now, st: n % HOME_COL.length }); addXp(S, 10, out); out.fx.push(['home', n]);
  } else if (a.a === 'homeRent') {
    const i = a.i | 0, h = S.homes[i]; if (!h) return fail(''); const amt = homeRent(S, i, now); if (!amt) return fail(L('rentNext', HOME_INC, fmtT(Math.ceil((h.c + RENT_EVERY * 1000 - now) / 1000))));
    const per = Math.floor((now - h.c) / (RENT_EVERY * 1000)); h.c = per > RENT_CAP ? now : h.c + per * RENT_EVERY * 1000; S.coins += amt; out.fx.push(['coins', amt]); out.fx.push(['gain', 'coin', amt, 'home', i]);
  } else if (a.a === 'road') {
    const gx = a.x | 0, gy = a.y | 0, key = roadKey(gx, gy), i = S.roads.indexOf(key);
    if (a.on) { if (i >= 0) return out; if (!roadOk(S, gx, gy)) return fail(L('roadNo')); if (S.roads.length >= ROAD_MAX) return fail(L('slotsMax'));
      if (S.roadFree > 0) S.roadFree--; else { if (S.coins < ROAD_COST) return fail(L('noCoins')); S.coins -= ROAD_COST; } S.roads.push(key); }
    else { if (i < 0) return out; S.roads.splice(i, 1); }
  } else if (a.a === 'dup') {
    const k = a.k, B = BUILD[k], n = dupN(S, k); if (!B || !DUP_TYPES.includes(k) || !okB(S, B) || n >= DUP_MAX) return fail('');
    const X = BUILD[k + '_' + (n + 2)]; if (!S.land[X.land]) return fail(L('needLand', L('land_' + X.land)));
    const c = dupCost(k, n); if (S.coins < c) return fail(L('noCoins'));
    S.coins -= c; S.dup[k] = n + 1; if (!S.bld[k + '_' + (n + 2)]) S.bld[k + '_' + (n + 2)] = { q: [] }; out.fx.push(['dup', k + '_' + (n + 2)]);
  } else if (a.a === 'silo') {
    if (S.silos >= SILOS.length) return fail(''); const c = siloCost(S.silos); if (S.coins < c) return fail(L('noCoins'));
    S.coins -= c; S.silos++; S.cap += 100; out.fx.push(['coins', -c]); out.fx.push(['silo', S.silos - 1]);
  } else if (a.a === 'hire') {
    const n = hCount(S); if (!n || n >= HELPER_NAMES.length) return fail(''); const c = hireCost(n); if (S.coins < c) return fail(L('noCoins'));
    S.coins -= c; S.helper.n = n + 1; out.fx.push(['coins', -c]); out.fx.push(['hired', n]);
  } else if (a.a === 'build') {
    const P = PROJ[a.k]; if (!P || !S.land[P.land || 'vila'] || S.city[a.k]) return fail(''); if (P.lvl > S.lvl) return fail(L('unlockAt', P.lvl));
    if (S.coins < P.cost) return fail(L('noCoins')); if (!has(S, P.need)) return fail(L('missingProd'));
    S.coins -= P.cost; take(S, P.need); const dur = Math.max(30, Math.round(P.t / Math.max(1, hCount(S)))) * 1000; S.city[a.k] = { s: now, e: now + dur, c: now + dur }; addXp(S, 20, out); out.fx.push(['coins', -P.cost]); out.fx.push(['build', a.k]);
  } else if (a.a === 'rent') {
    const c = S.city[a.k]; if (!c || c.e > now) return fail(''); const amt = rentNow(S, a.k, now); if (!amt) return fail(L('rentNext', PROJ[a.k].inc, fmtT(Math.ceil((c.c + RENT_EVERY * 1000 - now) / 1000))));
    const per = Math.floor((now - c.c) / (RENT_EVERY * 1000)); c.c = per > RENT_CAP ? now : c.c + per * RENT_EVERY * 1000; S.coins += amt; out.fx.push(['coins', amt]); out.fx.push(['gain', 'coin', amt, 'city', a.k]);
  } else if (a.a === 'buyTree') {
    if (!FRUIT[a.k] || a.k === 'coco' || S.lvl < 4 || S.xt.length >= XT_MAX) return fail(''); const c = treeCost(a.k); if (S.coins < c) return fail(L('noCoins'));
    const all = treeList(S), spot = XT_SPOTS.find(([x, y]) => all.every(t => Math.hypot(t.x - x, t.y - y) > 70)) || XT_SPOTS[S.xt.length % XT_SPOTS.length];
    S.coins -= c; S.xt.push({ k: a.k, x: spot[0], y: spot[1], t: now }); out.fx.push(['coins', -c]); out.fx.push(['newTree', S.xt.length - 1]);
  } else if (a.a === 'move') {
    const x = Math.round(+a.x), y = Math.round(+a.y); if (!Number.isFinite(x) || !Number.isFinite(y)) return fail('');
    if (a.k === 'campo') S.pos.campo = { x: clamp(x, -150, 560), y: clamp(y, -240, 640) };
    else if (/^x\d+$/.test(a.k)) { const t = S.xt[+a.k.slice(1)]; if (!t) return fail(''); t.x = clamp(x, 30, WW - 30); t.y = clamp(y, 90, WH - 20); }
    else if (DEF[a.k]) S.pos[a.k] = { x: clamp(x, 40, WW - 40), y: clamp(y, 100, WH - 20) };
    else return fail('');
  } else if (a.a === 'animal') {
    const P = PENS[a.k], st = P && S.pens[a.k]; if (!st || P.lvl > S.lvl || st.a.length >= PEN_MAX[a.k]) return fail('');
    const c = animalCost(a.k, st.a.length); if (S.coins < c) return fail(L('noCoins')); S.coins -= c; st.a.push(0); out.fx.push(['coins', -c]);
  } else if (a.a === 'deco') {
    const D = DECOS[a.k]; if (!D || S.deco[a.k]) return fail(''); if (S.coins < D.cost) return fail(L('noCoins'));
    S.coins -= D.cost; S.deco[a.k] = 1; addXp(S, 10, out); out.fx.push(['deco', a.k]);
  } else if (a.a === 'slot') {
    const B = BUILD[a.b]; if (!B || !okB(S, B) || qCap(S, a.b) >= MAXQ) return fail(''); const c = slotCost(S, a.b); if (S.coins < c) return fail(L('noCoins'));
    S.coins -= c; S.slots[a.b] = (S.slots[a.b] || 0) + 1; out.fx.push(['coins', -c]);
  } else if (a.a === 'sellSurplus') {
    let total = 0; for (let guard = 0; guard < 40; guard++) { const sale = surplusSale(S, now, true); if (!sale) break; const q = Math.min(sale.q, S.inv[sale.k] || 0); if (q <= 0) break; total += q * sellPrice(sale.k); take(S, { [sale.k]: q }); }
    if (!total) return fail(L('noSurplus')); S.coins += total; out.fx.push(['coins', total]); out.fx.push(['soldAll', total]);
  } else if (a.a === 'sell') {
    const k = a.k, q = Math.min(a.q | 0, S.inv[k] || 0); if (!ITEMS[k] || q <= 0) return fail('');
    const c = q * sellPrice(k); take(S, { [k]: q }); S.coins += c; out.fx.push(['coins', c]); out.fx.push(['sold', q, k, c]);
  } else if (a.a === 'shift') {
    if (!S.helper.on) return fail(''); const SH = SHIFTS[a.d | 0] || SHIFTS[0], sc = SH.cost * hCount(S); if (S.coins < sc) return fail(L('noCoins'));
    S.coins -= sc; S.helper.until = Math.max(now, S.helper.until || 0) + SH.min * 60000; out.fx.push(['coins', -sc]);
  } else if (a.a === 'autosell') { S.helper.sell = S.helper.sell === false; 
  } else if (a.a === 'cap') {
    const c = capCost(S.cap); if (S.coins < c) return fail(L('noCoins')); S.coins -= c; S.cap += 50;
  } else return fail('');
  out.ok = true; S.rev++; return out;
}
function sane(S) { const ok = !!(S && S.v === 1 && typeof S.fid === 'string' && Array.isArray(S.plots) && S.inv && S.bld && S.pens && Array.isArray(S.orders)); if (ok) migrate(S); return ok; }

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
    case 'laranja': blob(50, 56, 32, 32, '#ff9a1f', '#c96a0a'); g.fillStyle = '#4fae3a'; g.beginPath(); g.ellipse(60, 22, 12, 6, -0.5, 0, 6.283); g.fill(); g.strokeStyle = '#7a4b25'; g.lineWidth = 4; g.beginPath(); g.moveTo(50, 26); g.lineTo(52, 16); g.stroke(); blob(40, 46, 7, 5, 'rgba(255,255,255,.4)'); break;
    case 'manga': g.save(); g.translate(50, 56); g.rotate(-0.5); const mg = g.createLinearGradient(-30, 0, 30, 0); mg.addColorStop(0, '#e63b2e'); mg.addColorStop(0.5, '#ffb627'); mg.addColorStop(1, '#8cc63f'); g.fillStyle = mg; g.beginPath(); g.ellipse(0, 0, 36, 26, 0, 0, 6.283); g.fill(); g.strokeStyle = '#a3561a'; g.lineWidth = 4; g.stroke(); g.restore(); g.fillStyle = '#4fae3a'; g.beginPath(); g.ellipse(70, 26, 12, 5, 0.6, 0, 6.283); g.fill(); break;
    case 'suco': case 'vitamina': { const c = k === 'suco' ? '#ff9a1f' : '#ffcf3a'; g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.moveTo(26, 22); g.lineTo(74, 22); g.lineTo(66, 92); g.lineTo(34, 92); g.closePath(); g.fill(); g.fillStyle = c; g.beginPath(); g.moveTo(29, 38); g.lineTo(71, 38); g.lineTo(65, 88); g.lineTo(35, 88); g.closePath(); g.fill(); g.strokeStyle = '#7a9cb8'; g.lineWidth = 4; g.beginPath(); g.moveTo(26, 22); g.lineTo(74, 22); g.lineTo(66, 92); g.lineTo(34, 92); g.closePath(); g.stroke(); g.strokeStyle = '#e0533d'; g.lineWidth = 5; g.beginPath(); g.moveTo(58, 46); g.lineTo(70, 8); g.stroke(); if (k === 'suco') { blob(36, 30, 12, 12, '#ff9a1f', '#c96a0a'); } else { blob(38, 30, 10, 8, '#8cc63f'); } break; }
    case 'mel': g.fillStyle = '#ffb627'; g.beginPath(); g.moveTo(24, 36); g.quadraticCurveTo(20, 92, 50, 92); g.quadraticCurveTo(80, 92, 76, 36); g.closePath(); g.fill(); g.strokeStyle = '#a8741c'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#8a5a2b'; g.fillRect(24, 22, 52, 14); g.fillStyle = '#fff4d6'; g.fillRect(34, 52, 32, 22); g.fillStyle = '#a8741c'; g.font = '900 16px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('MEL', 50, 69); g.fillStyle = '#ffb627'; g.beginPath(); g.ellipse(32, 40, 5, 9, 0, 0, 6.283); g.fill(); break;
    case 'peixe': g.fillStyle = '#5aa9d6'; g.beginPath(); g.ellipse(46, 52, 32, 18, 0, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(72, 52); g.lineTo(94, 34); g.lineTo(94, 70); g.closePath(); g.fill(); g.strokeStyle = '#2f6f99'; g.lineWidth = 4; g.beginPath(); g.ellipse(46, 52, 32, 18, 0, 0, 6.283); g.stroke(); blob(28, 48, 4, 4, '#1b3a52'); g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(44, 40); g.quadraticCurveTo(50, 52, 44, 64); g.stroke(); break;
    case 'paoMel': g.fillStyle = '#8a4a1f'; g.beginPath(); g.ellipse(50, 60, 34, 26, 0, 0, 6.283); g.fill(); g.strokeStyle = '#4f2810'; g.lineWidth = 4; g.stroke(); g.fillStyle = '#ffb627'; g.beginPath(); g.moveTo(22, 52); g.quadraticCurveTo(50, 26, 78, 52); g.lineTo(78, 56); g.quadraticCurveTo(70, 70, 64, 56); g.quadraticCurveTo(56, 72, 48, 56); g.quadraticCurveTo(38, 70, 30, 56); g.lineTo(22, 56); g.closePath(); g.fill(); break;
    case 'land': g.fillStyle = '#6fbf4a'; g.fillRect(12, 40, 76, 48); g.fillStyle = '#3f8f2e'; for (const [x, y] of [[26, 52], [52, 64], [74, 50]]) { g.beginPath(); g.arc(x, y, 9, 0, 6.283); g.fill(); } g.fillStyle = '#c9905a'; g.fillRect(40, 14, 40, 26); g.fillStyle = '#7a4b25'; g.fillRect(46, 40, 6, 30); g.fillStyle = '#fff'; g.fillRect(46, 22, 28, 4); g.fillRect(46, 30, 20, 4); break;
    case 'helper': blob(50, 92, 30, 12, '#3f8f2e'); g.fillStyle = '#2f9e6e'; g.fillRect(28, 60, 44, 34); g.fillStyle = '#f2c6a0'; g.beginPath(); g.arc(50, 44, 20, 0, 6.283); g.fill(); g.fillStyle = '#3a2412'; g.beginPath(); g.arc(43, 44, 2.5, 0, 6.283); g.arc(57, 44, 2.5, 0, 6.283); g.fill(); g.strokeStyle = '#3a2412'; g.lineWidth = 3; g.beginPath(); g.arc(50, 50, 7, 0.3, 2.84); g.stroke(); g.fillStyle = '#2f9e6e'; g.beginPath(); g.arc(50, 34, 20, Math.PI, 0); g.fill(); g.fillRect(50, 30, 28, 6); g.fillStyle = '#ffc23a'; g.fillRect(36, 70, 8, 8); g.fillRect(56, 70, 8, 8); break;
    case 'algodao': g.strokeStyle = '#6b8f3a'; g.lineWidth = 5; g.beginPath(); g.moveTo(50, 94); g.lineTo(50, 50); g.stroke(); g.fillStyle = '#8a5a2b'; for (const [x, y] of [[36, 46], [64, 46], [50, 30]]) { g.beginPath(); g.moveTo(x - 14, y + 8); g.lineTo(x, y + 16); g.lineTo(x + 14, y + 8); g.fill(); } for (const [x, y, r] of [[36, 40, 13], [64, 40, 13], [50, 24, 14], [50, 42, 12]]) blob(x, y, r, r * 0.9, '#ffffff', '#cfcfcf'); break;
    case 'tecido': for (let i = 0; i < 3; i++) { g.fillStyle = ['#7b5ea7', '#e0533d', '#3f8fd1'][i]; g.beginPath(); if (g.roundRect) g.roundRect(16, 22 + i * 22, 68, 20, 6); else g.rect(16, 22 + i * 22, 68, 20); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(16, 26 + i * 22, 68, 3); } break;
    case 'rede': g.fillStyle = '#7a4b25'; g.fillRect(10, 20, 8, 72); g.fillRect(82, 20, 8, 72); g.strokeStyle = '#e8d6a4'; g.lineWidth = 3; g.beginPath(); g.moveTo(14, 30); g.lineTo(28, 50); g.moveTo(86, 30); g.lineTo(72, 50); g.stroke(); g.fillStyle = '#e0533d'; g.beginPath(); g.moveTo(26, 48); g.quadraticCurveTo(50, 92, 74, 48); g.quadraticCurveTo(50, 70, 26, 48); g.fill(); g.strokeStyle = '#ffd23f'; g.lineWidth = 4; g.beginPath(); g.moveTo(30, 56); g.quadraticCurveTo(50, 84, 70, 56); g.stroke(); break;
    case 'coco': blob(50, 56, 32, 30, '#7a4b25', '#4f2810'); g.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 5; i++) g.fillRect(28 + i * 9, 36 + (i % 2) * 6, 3, 30); blob(42, 42, 5, 4, '#3a2412'); blob(56, 42, 5, 4, '#3a2412'); blob(49, 52, 5, 4, '#3a2412'); g.fillStyle = '#4f9a2f'; g.beginPath(); g.ellipse(62, 22, 16, 5, -0.5, 0, 6.283); g.fill(); break;
    case 'road': g.fillStyle = '#b9a27a'; g.beginPath(); g.moveTo(30, 92); g.lineTo(44, 8); g.lineTo(56, 8); g.lineTo(70, 92); g.closePath(); g.fill(); g.fillStyle = '#8f7a55'; g.fillRect(24, 88, 52, 6); g.fillStyle = '#fff'; for (let i = 0; i < 4; i++) g.fillRect(48, 16 + i * 20, 4 + i, 10); break;
    case 'move': g.fillStyle = '#3f8fd1'; for (let r = 0; r < 4; r++) { g.save(); g.translate(50, 50); g.rotate(r * Math.PI / 2); g.beginPath(); g.moveTo(0, -42); g.lineTo(14, -26); g.lineTo(6, -26); g.lineTo(6, -6); g.lineTo(-6, -6); g.lineTo(-6, -26); g.lineTo(-14, -26); g.closePath(); g.fill(); g.restore(); } blob(50, 50, 10, 10, '#1d5a8f'); break;
    case 'sorvete': g.fillStyle = '#d9a35a'; g.beginPath(); g.moveTo(30, 50); g.lineTo(70, 50); g.lineTo(50, 96); g.closePath(); g.fill(); g.strokeStyle = '#a8741c'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(34 + i * 10, 52); g.lineTo(50, 92); g.stroke(); } blob(50, 40, 24, 20, '#ffb627', '#d98a10'); blob(42, 22, 14, 12, '#ffd76a'); blob(60, 16, 5, 5, '#e0533d'); break;
    case 'picole': g.fillStyle = '#e8c58a'; g.fillRect(45, 70, 10, 26); g.fillStyle = '#ff9a1f'; g.beginPath(); if (g.roundRect) g.roundRect(30, 10, 40, 66, 18); else g.rect(30, 10, 40, 66); g.fill(); g.strokeStyle = '#c96a0a'; g.lineWidth = 4; g.stroke(); g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(38, 18, 6, 40); break;
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
    lvl: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.25, 'triangle', 0.1, i * 0.1)),
    // sons do sítio (sintetizados aqui, sem gravações)
    cluck: () => { for (let i = 0; i < 3; i++) tone(700 + i * 60, 520, 0.07, 'square', 0.04, i * 0.09); },
    moo: () => { tone(150, 110, 0.9, 'sawtooth', 0.05); tone(152, 112, 0.9, 'triangle', 0.06); },
    splash: () => { tone(900, 200, 0.25, 'sine', 0.05); tone(1400, 300, 0.2, 'sine', 0.03, 0.05); },
    hammer: () => { for (let i = 0; i < 3; i++) { tone(180, 90, 0.06, 'square', 0.08, i * 0.18); tone(2200, 1800, 0.03, 'triangle', 0.03, i * 0.18); } },
    bird: () => { const b = 2200 + Math.random() * 1200; for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) tone(b, b * (1.2 + Math.random() * 0.3), 0.09, 'sine', 0.025, i * 0.13); },
    get ac() { return ac; }, tone }; })();
// música de fundo gerada na hora: acordes suaves numa escala pentatônica, nunca repete igual
const MUSIC = (() => { let on = false, timer = 0, step = 0; const ROOTS = [261.6, 220, 174.6, 196], PENTA = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2];
  const tick = () => { if (!on || !SND.ac) return; const root = ROOTS[Math.floor(step / 8) % ROOTS.length];
    if (step % 8 === 0) for (const m of [1, 5 / 4, 3 / 2]) SND.tone(root * m / 2, root * m / 2, 3.6, 'triangle', 0.018);
    if (Math.random() < 0.7) { const f = root * PENTA[Math.floor(Math.random() * PENTA.length)] * (Math.random() < 0.3 ? 2 : 1); SND.tone(f, f, 0.5, 'sine', 0.022); }
    step++; };
  return { set(v) { on = v; clearInterval(timer); if (on) { SND.init(); timer = setInterval(tick, 460); } }, get on() { return on; } }; })();
let AMB = true;
try { AMB = localStorage.getItem('sitio-amb') !== '0'; if (localStorage.getItem('sitio-music') === '1') addEventListener('pointerdown', () => { if (!MUSIC.on) MUSIC.set(true); }, { once: true }); } catch (e) {}
setInterval(() => { if (AMB && G.S && SND.ac && Math.random() < 0.45) SND.bird(); }, 7000);
addEventListener('pointerdown', () => SND.init(), { capture: true });

// ---------- personagens ----------
const ME = { name: '', look: 'hat' };
try { ME.name = (localStorage.getItem('sitio-name') || '').slice(0, 16); ME.look = localStorage.getItem('sitio-look') === 'hair' ? 'hair' : 'hat'; } catch (e) {}
const AV = { helper: { x: 236, y: 272, tx: 236, ty: 272, t: 0 }, me: { x: 150, y: 262, tx: 150, ty: 262, t: 0 }, fr: { x: 196, y: 268, tx: 196, ty: 268, t: 0, on: false, name: '', look: 'hair' } };
const ownerName = S => S && S.owner ? S.owner : '';
const farmTitle = S => ownerName(S) ? L('farmOf', ownerName(S)) : dispName(S && S.name);
function meInfo() { return { n: ME.name, l: ME.look }; }
function sendMe() { if (NET.room) NET.room.presence({ me: meInfo() }).catch(() => {}); }
function walkTo(av, x, y) { av.tx = clamp(x, 20, WW - 20); av.ty = clamp(y + 18, 40, WH - 30); }
function stepAv(av, dt) { const dx = av.tx - av.x, dy = av.ty - av.y, d = Math.hypot(dx, dy), sp = 240 * dt; if (d > 1) { const k = Math.min(1, sp / d); av.x += dx * k; av.y += dy * k; av.t += dt; av.dir = dx >= 0 ? 1 : -1; av.walk = true; } else av.walk = false; }
// vizinhos (NPC): só visual, cada aparelho simula os seus a partir do estado salvo
const NPCS = { list: [], key: '', sayT: 0 };
const npcLine = S => { const a = L('npc'), h = happy(S); if (h < 50 && Math.random() < 0.4) return L('npcSad'); if (h >= 80 && Math.random() < 0.3) return L('npcHappy'); return a[Math.floor(Math.random() * a.length)]; };
function npcSpots(S) { const pts = []; for (const k of S.roads || []) pts.push([(k % 100) * RD + RD / 2, Math.floor(k / 100) * RD + RD / 2 + 10]);
  if (S.land.vila) pts.push([400, 1590], [200, 1580], [700, 1580], [900, 1580], [320, 1450]);
  if (S.land.bairro) { for (let x = 80; x < 1440; x += 120) pts.push([x, 2040]); if (S.fair && S.fair.some(Boolean)) for (let i = 0; i < FAIR.n; i++) pts.push([fairX(i), FAIR.y + 26], [fairX(i), FAIR.y + 26]); }
  for (const [k, P] of Object.entries(PROJ)) if (S.city[k] && S.city[k].e <= Date.now()) pts.push([P.x, P.y + 20]);
  if (!pts.length) pts.push([320, 700], [320, 1000]); return pts; }
function syncNpcs(S) { const nH = (S.homes || []).length, nP = Object.keys(PROJ).filter(k => S.city[k] && S.city[k].e <= Date.now()).length, key = nH + ':' + nP + ':' + LANG; if (key === NPCS.key) return; NPCS.key = key;
  const want = []; for (let i = 0; i < nH * 2; i++) want.push({ id: 'h' + i, name: NPC_NAMES[i % NPC_NAMES.length], home: LOTS[i >> 1] }); for (let i = 0; i < nP; i++) want.push({ id: 'p' + i, name: NPC_NAMES[(23 - i) % NPC_NAMES.length], home: null }); if (S.city.pousada && S.city.pousada.e <= Date.now()) for (let i = 0; i < 3; i++) want.push({ id: 't' + i, name: L('tourist'), home: null, tour: true });
  const old = new Map(NPCS.list.map(n => [n.id, n])); NPCS.list = want.map((w, i) => old.get(w.id) || (() => { const st = w.home ? [w.home[0], w.home[1] + 14] : [400, 1590];
    return { ...w, x: st[0], y: st[1], tx: st[0], ty: st[1], wait: 1 + Math.random() * 3, t: 0, dir: 1, walk: false, say: '', sayT: 0, sh: ['#e0533d', '#3d7fd6', '#2f9e6e', '#e6a92a', '#9b5de5', '#ff7aa8', '#1fa6a0'][i % 7], hr: ['#3a2412', '#5a2e14', '#d9a441', '#1d1d1d', '#a0522d'][(i * 3) % 5], long: i % 3 === 1, hat: w.tour || i % 4 === 2, kid: !w.tour && i % 5 === 4, cam: !!w.tour }; })()); }
function stepNpcs(S, dt) { syncNpcs(S); const pts = npcSpots(S);
  for (const n of NPCS.list) { if (n.sayT > 0) n.sayT -= dt; const dx = n.tx - n.x, dy = n.ty - n.y, d = Math.hypot(dx, dy);
    if (d > 2) { const k = Math.min(1, 46 * dt / d); n.x += dx * k; n.y += dy * k; n.t += dt; n.dir = dx >= 0 ? 1 : -1; n.walk = true; }
    else { n.walk = false; n.wait -= dt; if (n.wait <= 0) { const wants = n.home && (S.reqs || []).some(o => 'h' + o.who === n.id && o.w <= Date.now()); const p = n.home && (wants || Math.random() < 0.2) ? [n.home[0], n.home[1] + 14] : pts[Math.floor(Math.random() * pts.length)]; n.tx = p[0] + (Math.random() - 0.5) * 16; n.ty = p[1] + (Math.random() - 0.5) * 8; n.wait = 2 + Math.random() * 5; } } }
  NPCS.sayT -= dt; if (NPCS.sayT <= 0 && NPCS.list.length) { NPCS.sayT = 4 + Math.random() * 4; const n = NPCS.list[Math.floor(Math.random() * NPCS.list.length)]; n.say = npcLine(S); n.sayT = 3.5; } }
function drawNpc(g, n, T) { const x = n.x, y = n.y, sc = n.kid ? 0.78 : 0.92, step = n.walk ? Math.sin(n.t * 12) : 0, bob = n.walk ? Math.abs(Math.sin(n.t * 12)) * 1.6 : 0, d = n.dir;
  g.save(); g.translate(x, y); g.scale(sc, sc); g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0, 2, 12, 4, 0, 0, 6.283); g.fill();
  g.strokeStyle = '#3a4a5a'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-4, -14 - bob); g.lineTo(-4 + step * 4, -1); g.moveTo(4, -14 - bob); g.lineTo(4 - step * 4, -1); g.stroke();
  if (n.long) { g.fillStyle = n.hr; g.beginPath(); g.ellipse(-d * 2, -34 - bob, 11, 15, 0, 0, 6.283); g.fill(); }
  g.fillStyle = n.sh; rr(g, -10, -32 - bob, 20, 20, 6); g.fill();
  g.strokeStyle = '#e8b890'; g.lineWidth = 5; g.beginPath(); g.moveTo(-10, -28 - bob); g.lineTo(-14, -18 - bob + step * 3); g.moveTo(10, -28 - bob); g.lineTo(14, -18 - bob - step * 3); g.stroke();
  g.fillStyle = '#e8b890'; g.beginPath(); g.arc(0, -40 - bob, 9, 0, 6.283); g.fill(); g.fillStyle = '#3a2412'; g.beginPath(); g.arc(d * 3, -41 - bob, 1.6, 0, 6.283); g.fill();
  if (n.hat) { g.fillStyle = '#f2d38a'; g.beginPath(); g.ellipse(0, -46 - bob, 14, 4, 0, 0, 6.283); g.fill(); g.beginPath(); g.arc(0, -47 - bob, 8, Math.PI, 0); g.fill(); g.fillStyle = n.sh; g.fillRect(-8, -49 - bob, 16, 2.5); }
  else { g.fillStyle = n.hr; g.beginPath(); g.arc(0, -44 - bob, 9.5, Math.PI, 0); g.fill(); }
  if (n.cam) { g.fillStyle = '#2b2b2b'; g.fillRect(d * 6 - 5, -28 - bob, 10, 7); g.fillStyle = '#9fd7f0'; g.beginPath(); g.arc(d * 6, -24.5 - bob, 2, 0, 6.283); g.fill(); }
  g.restore();
  if (CAM.z > 0.55) { g.font = '800 11px Nunito, sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.85)'; const w = g.measureText(n.name).width + 10; rr(g, x - w / 2, y + 4, w, 15, 7); g.fill(); g.fillStyle = '#3a2412'; g.fillText(n.name, x, y + 15); }
  const rq = G.S && (G.S.reqs || []).find(o => 'h' + o.who === n.id && o.w <= Date.now()); if (rq && !(n.sayT > 0)) { bubble(g, x, y - 72, rq.it[0][0], T); g.fillStyle = '#e0533d'; g.beginPath(); g.arc(x + 16, y - 90, 8, 0, 6.283); g.fill(); g.fillStyle = '#fff'; g.font = '900 12px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('!', x + 16, y - 86); }
  if (n.sayT > 0 && n.say) { g.font = '800 13px Nunito, sans-serif'; const w = Math.min(220, g.measureText(n.say).width + 18), by = y - 62 * sc - 26; g.globalAlpha = Math.min(1, n.sayT * 2); g.fillStyle = '#fff'; rr(g, x - w / 2, by, w, 24, 10); g.fill(); g.beginPath(); g.moveTo(x - 5, by + 24); g.lineTo(x, by + 31); g.lineTo(x + 5, by + 24); g.fill(); g.fillStyle = '#3a2412'; g.textAlign = 'center'; g.fillText(n.say, x, by + 16, w - 10); g.globalAlpha = 1; } }
function drawAv(g, av, name, look, T, mine) {
  const x = av.x, y = av.y, step = av.walk ? Math.sin(av.t * 14) : 0, bob = av.walk ? Math.abs(Math.sin(av.t * 14)) * 2 : 0, d = av.dir || 1;
  const CAPC = { cap: '#2f9e6e', cap2: '#3d7fd6', cap3: '#e0533d', cap4: '#e6a92a' }, isCap = !!CAPC[look];
  const shirt = look === 'hair' ? '#9b5de5' : isCap ? CAPC[look] : '#ff8a1f', pants = look === 'hair' ? '#3d5a99' : isCap ? '#3a4a5a' : '#4a6fa5';
  g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(x, y + 2, 13, 4, 0, 0, 6.283); g.fill();
  g.strokeStyle = pants; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 4, y - 14 - bob); g.lineTo(x - 4 + step * 4, y - 1); g.moveTo(x + 4, y - 14 - bob); g.lineTo(x + 4 - step * 4, y - 1); g.stroke();
  if (look === 'hair') { g.fillStyle = '#5a2e14'; g.beginPath(); g.ellipse(x - d * 2, y - 34 - bob, 12, 16, 0, 0, 6.283); g.fill(); }
  g.fillStyle = shirt; g.beginPath(); g.roundRect ? g.roundRect(x - 10, y - 32 - bob, 20, 20, 6) : g.rect(x - 10, y - 32 - bob, 20, 20); g.fill();
  g.strokeStyle = '#f2c6a0'; g.lineWidth = 5; g.beginPath(); g.moveTo(x - 10, y - 28 - bob); g.lineTo(x - 14, y - 18 - bob + step * 3); g.moveTo(x + 10, y - 28 - bob); g.lineTo(x + 14, y - 18 - bob - step * 3); g.stroke();
  g.fillStyle = '#f2c6a0'; g.beginPath(); g.arc(x, y - 40 - bob, 9, 0, 6.283); g.fill();
  g.fillStyle = '#3a2412'; g.beginPath(); g.arc(x + d * 3, y - 41 - bob, 1.6, 0, 6.283); g.fill();
  if (look === 'hair') { g.fillStyle = '#5a2e14'; g.beginPath(); g.arc(x, y - 44 - bob, 9.5, Math.PI, 0); g.fill(); }
  else if (isCap) { g.fillStyle = CAPC[look]; g.beginPath(); g.arc(x, y - 45 - bob, 9.5, Math.PI, 0); g.fill(); g.fillRect(x + (d > 0 ? 0 : -14), y - 47 - bob, 14, 3.5); }
  else { g.fillStyle = '#f2d06b'; g.beginPath(); g.ellipse(x, y - 47 - bob, 17, 5, 0, 0, 6.283); g.fill(); g.fillRect(x - 8, y - 56 - bob, 16, 9); g.fillStyle = '#c8702a'; g.fillRect(x - 8, y - 50 - bob, 16, 3); }
  if (name) { g.font = '900 12px Nunito, sans-serif'; const w = g.measureText(name).width + 14; g.fillStyle = look === 'hair' ? 'rgba(155,93,229,.95)' : isCap ? CAPC[look] : 'rgba(255,138,31,.95)';
    g.beginPath(); g.roundRect ? g.roundRect(x - w / 2, y - 80 - bob, w, 18, 9) : g.rect(x - w / 2, y - 80 - bob, w, 18); g.fill(); g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText(name, x, y - 67 - bob); }
}

// ---------- câmera e entrada ----------
const cv = $('cv'), cx = cv.getContext('2d');
const CAM = { x: 320, y: 470, z: 1 };
let DPR = 1;
function resize() { DPR = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * DPR; cv.height = innerHeight * DPR; CAM.z = clamp(innerWidth / 610, 0.55, 1.3); clampCam(); }
const zMin = () => Math.min(innerWidth / WW, innerHeight / WH) * 0.95;
function clampCam() { CAM.z = clamp(CAM.z, zMin(), 1.8); const hw = innerWidth / CAM.z / 2, hh = innerHeight / CAM.z / 2; CAM.x = hw * 2 >= WW ? WW / 2 : clamp(CAM.x, hw, WW - hw); CAM.y = hh * 2 >= WH ? WH / 2 : clamp(CAM.y, hh - 70, WH - hh + 40); }
addEventListener('resize', resize); resize();
const toWorld = (sx, sy) => ({ x: (sx - innerWidth / 2) / CAM.z + CAM.x, y: (sy - innerHeight / 2) / CAM.z + CAM.y });
let drag = null, pinch = null; const PTR = new Map();
function zoomAt(z, sx, sy) { const w = toWorld(sx, sy); CAM.z = clamp(z, zMin(), 1.8); CAM.x = w.x - (sx - innerWidth / 2) / CAM.z; CAM.y = w.y - (sy - innerHeight / 2) / CAM.z; clampCam(); }
cv.addEventListener('pointerdown', e => { PTR.set(e.pointerId, { x: e.clientX, y: e.clientY }); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  if (PTR.size === 2) { G.paint = null; const [a, b] = [...PTR.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, z: CAM.z, w: toWorld((a.x + b.x) / 2, (a.y + b.y) / 2) }; drag = null; return; }
  if (PTR.size === 1 && G.road && G.S) { const w = toWorld(e.clientX, e.clientY), gx = Math.floor(w.x / RD), gy = Math.floor(w.y / RD); G.paint = { id: e.pointerId, on: !G.S.roads.includes(roadKey(gx, gy)), last: -1 }; paintAt(w); return; }
  if (PTR.size === 1 && G.edit && G.S) { const w = toWorld(e.clientX, e.clientY), hit = editHit(G.S, w); if (hit) { G.dragObj = { id: e.pointerId, k: hit.k, ox: w.x - hit.x, oy: w.y - hit.y }; G.dragPos = { k: hit.k, x: hit.x, y: hit.y }; return; } }
  if (PTR.size === 1) drag = { id: e.pointerId, x: e.clientX, y: e.clientY, cx: CAM.x, cy: CAM.y, moved: false }; });
cv.addEventListener('pointermove', e => { if (PTR.has(e.pointerId)) PTR.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && PTR.size >= 2) { const [a, b] = [...PTR.values()], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; CAM.z = clamp(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, zMin(), 1.8); CAM.x = pinch.w.x - (mx - innerWidth / 2) / CAM.z; CAM.y = pinch.w.y - (my - innerHeight / 2) / CAM.z; clampCam(); return; }
  if (G.paint && e.pointerId === G.paint.id) { if (PTR.size >= 2) { G.paint = null; return; } paintAt(toWorld(e.clientX, e.clientY)); return; }
  if (G.dragObj && e.pointerId === G.dragObj.id) { const w = toWorld(e.clientX, e.clientY); G.dragPos = { k: G.dragObj.k, x: w.x - G.dragObj.ox, y: w.y - G.dragObj.oy }; return; }
  if (!drag || e.pointerId !== drag.id) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.hypot(dx, dy) > 8) drag.moved = true; if (drag.moved) { CAM.x = drag.cx - dx / CAM.z; CAM.y = drag.cy - dy / CAM.z; clampCam(); } });
const endPtr = e => { PTR.delete(e.pointerId); if (G.paint && e.pointerId === G.paint.id) { G.paint = null; return; }
  if (G.dragObj && e.pointerId === G.dragObj.id) { const dp = G.dragPos; G.dragObj = null; G.dragPos = null; G.dragXt = null; if (dp && e.type === 'pointerup') { const r = act({ a: 'move', k: dp.k, x: dp.x, y: dp.y }); if (r.ok) toast(L('moved'), 1200); } return; } if (pinch) { if (PTR.size < 2) pinch = null; drag = null; return; } if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; if (!d.moved && e.type === 'pointerup') tapAt(toWorld(e.clientX, e.clientY)); };
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr);
cv.addEventListener('wheel', e => { e.preventDefault(); zoomAt(CAM.z * Math.exp(-e.deltaY * 0.0015), e.clientX, e.clientY); }, { passive: false });
function paintAt(w) { const P = G.paint, S = G.S; if (!P || !S) return; const gx = Math.floor(w.x / RD), gy = Math.floor(w.y / RD), key = roadKey(gx, gy); if (key === P.last) return; P.last = key;
  if (P.on === S.roads.includes(key)) return; const r = act({ a: 'road', x: gx, y: gy, on: P.on }, true); if (r.ok) { SND.pop(); $('editT').textContent = roadBarText(); } else if (r.msg) { toast(r.msg, 1400); G.paint = null; } }
const inR = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
const bRect = b => ({ x: b.x - b.w / 2, y: b.y - b.h - 40, w: b.w, h: b.h + 46 });
const penRect = p => ({ x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h });
function editHit(S, w) {
  applyLayout(S);
  for (const [k, D] of Object.entries(DECOS)) if (S.deco[k] && Math.abs(w.x - D.x) < 36 && w.y > D.y - 80 && w.y < D.y + 8) return { k: 'd_' + k, x: D.x, y: D.y };
  for (const t of treeList(S)) if (Math.hypot(w.x - t.x, w.y - (t.y - 40)) < 52) return { k: t.i < TREES.length ? 't' + t.i : 'x' + t.j, x: t.x, y: t.y };
  if (S.land.sul) for (let i = 0; i < HIVES.length; i++) if (Math.abs(w.x - HIVES[i][0]) < 30 && w.y > HIVES[i][1] - 62 && w.y < HIVES[i][1] + 10) return { k: 'h' + i, x: HIVES[i][0], y: HIVES[i][1] };
  for (const [k, B] of Object.entries(BUILD)) { if ((B.land && !S.land[B.land]) || !dupOwned(S, B)) continue; if (inR(w, bRect(B))) return { k, x: B.x, y: B.y }; }
  for (const [k, P] of Object.entries(PENS)) if (inR(w, penRect(P))) return { k, x: P.x, y: P.y };
  for (let i = 0; i < S.silos; i++) if (Math.abs(w.x - SILOS[i].x) < 30 && w.y > SILOS[i].y - 110 && w.y < SILOS[i].y + 8) return { k: 's' + i, x: SILOS[i].x, y: SILOS[i].y };
  const a = plotRect(0), b = plotRect(MAXPLOTS - 1); if (w.x > a.x && w.x < b.x + b.w && w.y > a.y && w.y < b.y + b.h) return { k: 'campo', x: FIELD.dx, y: FIELD.dy };
  return null;
}
function tapAt(p) {
  if (!G.S) return; const S = G.S, now = nowS(); applyLayout(S);
  if (G.edit) return;
  ping(p.x, p.y);
  for (const [k, Ld] of Object.entries(LANDS)) if (!S.land[k] && inR(p, Ld.r)) return openSheet('land', k);
  for (const n of NPCS.list) if (Math.abs(p.x - n.x) < 20 && p.y > n.y - 60 && p.y < n.y + 8) { const rq = (S.reqs || []).find(o => 'h' + o.who === n.id && o.w <= now); if (rq) return openSheet('req', rq.id); n.say = L('npcHi', n.name) + ' ' + npcLine(S); n.sayT = 4; return; }
  if (S.land.bairro && Math.abs(p.x - FAIR.x) < 200 && p.y > FAIR.y - 120 && p.y < FAIR.y + 10) return openSheet('fair');
  if (S.land.bairro) for (const [k, V] of Object.entries(SERV)) if (Math.abs(p.x - V.x) < 80 && p.y > V.y - 150 && p.y < V.y + 10) return openSheet('city');
  if (S.land.bairro) { for (let i = 0; i < LOTS.length; i++) { const [hx, hy] = LOTS[i]; if (Math.abs(p.x - hx) < 66 && p.y > hy - 140 && p.y < hy + 10) { if (S.homes[i] && homeRent(S, i, now) > 0) return void act({ a: 'homeRent', i }); return openSheet('homes', i); } } }
  for (const [k, P] of Object.entries(PROJ)) if (S.land[P.land || 'vila'] && Math.abs(p.x - P.x) < P.w / 2 + 10 && p.y > P.y - P.h - 70 && p.y < P.y + 12) { if (rentNow(S, k, now) > 0) return void act({ a: 'rent', k }); return openSheet('proj', k); }
  for (const t of treeList(S)) if (Math.hypot(p.x - t.x, p.y - (t.y - 40)) < 52) return treeReady(S, t.i, now) ? void act({ a: 'tree', i: t.i }) : openSheet('rush', { t: 'tree', i: t.i });
  if (S.land.sul) { for (const [hx, hy] of HIVES) if (Math.abs(p.x - hx) < 34 && p.y > hy - 60 && p.y < hy + 12) return void act({ a: 'hive' });
    if (p.x > BOAT.x - 120 && p.x < BOAT.x + 120 && p.y > BOAT.y - 70 && p.y < BOAT.y + 50) return openSheet('boat'); }
  for (let i = 0; i < MAXPLOTS; i++) if (inR(p, plotRect(i))) {
    const pl = S.plots[i];
    if (i >= S.np) return openSheet('shop');
    if (!pl.c) return openSheet('seeds', i);
    if (plotReady(pl, now)) return act({ a: 'harvest', i });
    return openSheet('rush', { t: 'plot', i });
  }
  for (const [k, B] of Object.entries(BUILD)) if (dupOwned(S, B) && inR(p, bRect(B))) {
    if (B.land && !S.land[B.land]) return openSheet('land', B.land);
    if (B.lvl > S.lvl) return toast(L('unlockName', N(k), B.lvl));
    const q = S.bld[k].q; if (q.length && q[0].e <= now) act({ a: 'collect', b: k }, true); return openSheet('bld', k);
  }
  for (const [k, P] of Object.entries(PENS)) if (inR(p, penRect(P))) {
    if (P.lvl > S.lvl) return toast(L('unlockName', N(k), P.lvl));
    const r = act({ a: 'pen', k }, true); if (!r.ok) openSheet('pen', k); return;
  }
  if (S.helper && S.helper.on && (AV.hs || []).some(av => Math.hypot(p.x - av.x, p.y - (av.y - 30)) < 34)) return openSheet('helper');
  for (let i = 0; i < S.silos; i++) if (Math.abs(p.x - SILOS[i].x) < 30 && p.y > SILOS[i].y - 110 && p.y < SILOS[i].y + 8) return openSheet('barn');
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
    if (f[0] === 'gain') { if (f[1] === 'ovo') SND.cluck(); if (f[1] === 'leite') SND.moo(); if (f[1] === 'peixe') SND.splash(); const at = f[3] === 'plot' ? (() => { const r = plotRect(f[4]); return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; })() : f[3] === 'bld' ? { x: BUILD[f[4]].x, y: BUILD[f[4]].y - 60 } : f[3] === 'home' ? { x: LOTS[f[4]][0], y: LOTS[f[4]][1] - 60 }
        : f[3] === 'city' ? { x: PROJ[f[4]].x, y: PROJ[f[4]].y - 120 } : f[3] === 'tree' ? (() => { const t = treeAt(G.S, f[4]) || { x: 870, y: 300 }; return { x: t.x, y: t.y - 70 }; })() : f[3] === 'hive' ? { x: 150, y: 1120 } : f[3] === 'boat' ? { x: BOAT.x, y: BOAT.y - 40 } : { x: PENS[f[4]].x, y: PENS[f[4]].y - 30 };
      FLOAT.push({ k: f[1], n: f[2], x: at.x, y: at.y, t: 0 }); SND.pop(); burst(at.x, at.y, f[1]); }
    if (f[0] === 'plant') SND.plant();
    if (f[0] === 'craft' || f[0] === 'feed') SND.pop();
    if (f[0] === 'coins') SND.coin();
    if (f[0] === 'land') { SND.lvl(); toast(L('land_' + f[1]) + '!', 2600); const Ld = LANDS[f[1]]; CAM.x = Ld.r.x + Ld.r.w / 2; CAM.y = Ld.r.y + Ld.r.h / 2; clampCam(); }
    if (f[0] === 'boat') SND.plant();
    if (f[0] === 'sold') toast(L('sold', f[1], f[2], f[3]));
    if (f[0] === 'soldAll') { toast(L('soldSurplus', f[1])); burst(BARN.x, BARN.y - 60, 'coin'); }
    if (f[0] === 'rush') { SND.lvl(); toast(L('rushDone')); }
    if (f[0] === 'hired') { SND.lvl(); toast(HELPER_NAMES[f[1]] + '!'); }
    if (f[0] === 'build') { SND.hammer(); const P = PROJ[f[1]]; CAM.x = P.x; CAM.y = P.y - 80; clampCam(); }
    if (f[0] === 'newTree') { SND.plant(); const t = G.S.xt[f[1]]; if (t) { CAM.x = t.x; CAM.y = t.y - 40; clampCam(); for (let i = 0; i < 14; i++) SPARK.push({ x: t.x, y: t.y - 30, vx: (Math.random() - 0.5) * 140, vy: -50 - Math.random() * 110, t: 0, c: ['#8cc63f', '#ffd23f', '#ffffff'][i % 3] }); } }
    if (f[0] === 'deco') { SND.lvl(); toast(L('newDeco', L('deco_' + f[1]))); const D = DECOS[f[1]]; for (let i = 0; i < 18; i++) SPARK.push({ x: D.x, y: D.y - 20, vx: (Math.random() - 0.5) * 160, vy: -60 - Math.random() * 120, t: 0, c: ['#ffd23f', '#ff8fb1', '#8fd3ff', '#ffffff'][i % 4] }); }
    if (f[0] === 'helper') { SND.lvl(); toast(L('helperWon'), 3600); }
    if (f[0] === 'lvl') { SND.lvl(); openSheet('lvl', f[1]); for (let i = 0; i < 30; i++) SPARK.push({ x: CAM.x + (Math.random() - 0.5) * 200, y: CAM.y - 100, vx: (Math.random() - 0.5) * 300, vy: -100 - Math.random() * 200, t: 0, c: ['#ffd23f', '#ff8fb1', '#8fd3ff', '#8cc63f'][i % 4] }); }
    if (f[0] === 'truck') { SND.lvl(); CAM.x = TRUCK.x; CAM.y = TRUCK.y - 40; clampCam(); closeSheet(); toast(L('truckBought'), 3200); }
    if (f[0] === 'serv') { SND.hammer(); const V = SERV[f[1]]; CAM.x = V.x; CAM.y = V.y - 60; clampCam(); closeSheet(); burst(V.x, V.y - 60, 'star'); toast(L('servDone', L('serv_' + f[1]), happy(G.S)), 3200); }
    if (f[0] === 'up') { SND.lvl(); const B = BUILD[f[1]]; burst(B.x, B.y - 60, 'star'); toast(L('upDone', N(f[1]), upLv(G.S, f[1]) + 1), 3000); }
    if (f[0] === 'boost') { SND.lvl(); toast(L('boostDone_' + f[1]), 3000); }
    if (f[0] === 'req') { SND.coin(); const n = NPCS.list.find(x => x.id === 'h' + f[1]); if (n) { n.say = L('reqThanks'); n.sayT = 3; burst(n.x, n.y - 40, 'coin'); } }
    if (f[0] === 'home') { SND.hammer(); const [hx, hy] = LOTS[f[1]]; CAM.x = hx; CAM.y = hy - 60; clampCam(); closeSheet(); burst(hx, hy - 60, 'coin'); toast(L('homeDone', NPC_NAMES[(f[1] * 2) % NPC_NAMES.length], NPC_NAMES[(f[1] * 2 + 1) % NPC_NAMES.length]), 3600); }
    if (f[0] === 'dup') { SND.hammer(); const B = BUILD[f[1]]; applyLayout(G.S); CAM.x = B.x; CAM.y = B.y - 60; clampCam(); closeSheet(); burst(B.x, B.y - 60, 'coin'); toast(L('dupDone', N(f[1])), 3000); }
    if (f[0] === 'silo') { SND.lvl(); burst(SILOS[f[1]].x, SILOS[f[1]].y - 60, 'coin'); }
  }
}
function upCard(S, k) { const l = upLv(S, k), B = BUILD[k]; if (!B || !okB(S, B)) return '';
  return `<div class="card"><div class="row"><span style="width:40px;height:40px;display:grid;place-items:center">${img('star')}</span><div style="flex:1"><b>${L('upTitle')} · ${L('bLvl', l + 1)}</b><br><small>${l >= 2 ? L('upMax') : L('upHint', l + 2, Math.round((1 - UP_MULT[l + 1]) * 100))}</small></div>
    ${l >= 2 ? '' : S.lvl < UP_LVL[l + 1] ? `<small>${L('lvl', UP_LVL[l + 1])}</small>` : `<button class="btn blue" type="button" data-up="${k}" ${S.coins < upCost(k, l) ? 'disabled' : ''}>${img('coin')} ${upCost(k, l)}</button>`}</div></div>`; }
function oneBoost(S, k) { const now = nowS(), B = BOOSTS[k]; return `<div class="card"><div class="row"><b style="flex:1">⚡ ${L('boost_' + k)}<br><small>${boostOn(S, k, now) ? L('boostLeft', fmtT(Math.ceil((S.boost[k] - now) / 1000))) : L('boostD_' + k)}</small></b><button class="btn" type="button" data-boost="${k}" ${S.coins < B.cost ? 'disabled' : ''}>${img('coin')} ${B.cost}</button></div></div>`; }
function boostCards(S) { const now = nowS(); return `<span class="lbl">${L('boosts')}</span>` + Object.entries(BOOSTS).map(([k, B]) => `<div class="card"><div class="row"><span style="width:40px;height:40px;display:grid;place-items:center">${img(k === 'abono' ? 'trigo' : 'racaoV')}</span><div style="flex:1"><b>${L('boost_' + k)}</b><br><small>${boostOn(S, k, now) ? L('boostLeft', fmtT(Math.ceil((S.boost[k] - now) / 1000))) : L('boostD_' + k)}</small></div>
    <button class="btn" type="button" data-boost="${k}" ${S.coins < B.cost ? 'disabled' : ''}>${img('coin')} ${B.cost}</button></div></div>`).join(''); }
function fairFx(i) { SND.coin(); burst(fairX(i), FAIR.y - 60, 'coin'); const n = NPCS.list[Math.floor(Math.random() * NPCS.list.length)]; if (n) { n.tx = fairX(i); n.ty = FAIR.y + 26; n.wait = 3; n.say = L('fairBuy'); n.sayT = 2.5; } }
function reqCard(o) { const S = G.S, now = nowS(), nm = NPC_NAMES[o.who % NPC_NAMES.length];
  return o.w > now ? `<div class="card"><p class="sub">${L('reqWait', fmtT(Math.ceil((o.w - now) / 1000)))}</p></div>`
    : `<div class="card"><b>${L('reqFrom', nm)}</b>${needHtml(S, Object.fromEntries(o.it))}<div class="row"><span class="need"><span>${img('coin')}${o.c}</span><span>${img('star')}${o.x}</span></span><span style="flex:1"></span><button class="btn" type="button" data-req="${o.id}" ${has(S, Object.fromEntries(o.it)) ? '' : 'disabled'}>${L('deliver')}</button></div></div>`; }
function dupCard(S, k) {
  const n = dupN(S, k), B = BUILD[k]; if (!okB(S, B)) return '';
  const nx = n < DUP_MAX ? BUILD[k + '_' + (n + 2)] : null, landOk = !nx || S.land[nx.land];
  return `<div class="card"><div class="row"><span style="width:40px;height:40px;display:grid;place-items:center">${img(B.rec[0].o)}</span><div style="flex:1"><b>${N(k)}</b><br><small>${L('dupHave', n + 1, DUP_MAX + 1)}${nx && !landOk ? ' · ' + L('dupNeedLand', L('land_' + nx.land)) : ''}</small></div>
    ${!nx ? `<small>${L('slotsMax')}</small>` : `<button class="btn" type="button" data-dup="${k}" ${S.coins < dupCost(k, n) || !landOk ? 'disabled' : ''}>${img('coin')} ${dupCost(k, n)}</button>`}</div></div>`;
}
function levelNews(l) {
  const n = [];
  for (const [k, c] of Object.entries(CROPS)) if (c.lvl === l) n.push(N(k));
  for (const [bk, b] of Object.entries(BUILD)) { if (b.base) continue; if (b.lvl === l) n.push(N(bk)); else for (const r of b.rec) if (r.lvl === l && b.lvl < l) n.push(N(r.o)); }
  for (const [pk, p] of Object.entries(PENS)) if (p.lvl === l) n.push(N(pk));
  for (const [lk, Ld] of Object.entries(LANDS)) if (Ld.lvl === l) n.push(L('land_' + lk));
  for (const [pk, P] of Object.entries(PROJ)) if (P.lvl === l) n.push(N(pk));
  return n.length ? L('news', n.join(', ')) : '';
}
function ping(x, y) { G.myPing = [Math.round(x), Math.round(y), Date.now()]; walkTo(AV.me, x, y); if (NET.room) NET.room.presence({ ping: G.myPing, me: meInfo() }).catch(() => {}); }
let bcT = 0, bcLast = 0;
function broadcast() { if (G.mode !== 'host' || !NET.room) return; const now = Date.now(); clearTimeout(bcT); const send = () => { bcLast = Date.now(); NET.room.presence({ st: G.S, now: Date.now() }).catch(() => {}); }; if (now - bcLast > 150) send(); else bcT = setTimeout(send, 150); }
// escolhe e faz uma tarefa pendente; devolve a ação feita
// o que as encomendas abertas pedem
function orderNeeds(S, now) { const need = {}; for (const o of S.orders.concat(S.reqs || [])) if (o.w <= now) for (const [k, q] of o.it) need[k] = (need[k] || 0) + q;
  for (const [pk, P] of Object.entries(PROJ)) if (!S.city[pk] && P.lvl <= S.lvl && S.land[P.land || 'vila']) for (const [k, q] of Object.entries(P.need)) need[k] = (need[k] || 0) + q; return need; }
function findRecipe(S, out) { for (const [b, B] of Object.entries(BUILD)) { if (B.base || !okB(S, B)) continue; const i = B.rec.findIndex(r => r.o === out && okR(S, r)); if (i >= 0) { const best = fam(S, b).map(x => [x, S.bld[x].q.length / qCap(S, x)]).sort((p, q) => p[1] - q[1])[0][0]; return { b: best, i, r: B.rec[i] }; } } return null; }
const queued = (S, b, out) => fam(S, famOf(b)).reduce((a, x) => a + S.bld[x].q.filter(j => BUILD[x].rec[j.r].o === out).length, 0) * (BUILD[b].rec.find(r => r.o === out) || { k: 1 }).k;
// escolhe o que plantar: primeiro o que falta para as encomendas, depois o que falta para a ração
function pickCrop(S, now, fallback) {
  const want = {}, add = (k, q) => { if (q > 0 && CROPS[k] && CROPS[k].lvl <= S.lvl) want[k] = (want[k] || 0) + q; };
  for (const [k, q] of Object.entries(orderNeeds(S, now))) { const miss = q - (S.inv[k] || 0); if (miss <= 0) continue; if (CROPS[k]) add(k, miss); else { const R = findRecipe(S, k); if (R) for (const [ik, iq] of Object.entries(R.r.i)) add(ik, iq * Math.ceil(miss / R.r.k) - (S.inv[ik] || 0)); } }
  for (const [pk, P] of Object.entries(PENS)) if (P.lvl <= S.lvl && (S.inv[P.feed] || 0) < S.pens[pk].a.length) { const R = findRecipe(S, P.feed); if (R) for (const [ik, iq] of Object.entries(R.r.i)) add(ik, iq * 2 - (S.inv[ik] || 0)); }
  for (const pl of S.plots) if (pl.c && want[pl.c]) want[pl.c] -= CROPS[pl.c].y;
  const best = Object.entries(want).filter(([, v]) => v > 0).sort((x, y) => y[1] - x[1])[0];
  return best ? best[0] : (fallback && CROPS[fallback] && CROPS[fallback].lvl <= S.lvl ? fallback : 'trigo');
}
// vende a maior sobra (o que nenhuma encomenda precisa), guardando um pouco de cada ingrediente
function surplusSale(S, now, all) {
  const need = orderNeeds(S, now), ingr = new Set();
  for (const B of Object.values(BUILD)) if (okB(S, B)) for (const r of B.rec) if (okR(S, r)) Object.keys(r.i).forEach(k => ingr.add(k));
  for (const P of Object.values(PENS)) ingr.add(P.feed); if (S.land.sul) ingr.add('milho');
  let best = null, bs = 0; for (const [k, q] of Object.entries(S.inv)) { const sur = q - (need[k] || 0) - (ingr.has(k) ? 6 : 1); if (sur > bs) { bs = sur; best = k; } }
  return best ? { a: 'sell', k: best, q: all ? bs : Math.min(bs, Math.max(3, Math.ceil(S.cap * 0.15))) } : null;
}
function helperTask(S, now) {
  applyLayout(S);
  const tries = [], at = (x, y) => ({ x: x - 10, y: y - 10, w: 20, h: 20 });
  for (const o of S.orders) if (o.w <= now && has(S, Object.fromEntries(o.it))) tries.push([{ a: 'deliver', id: o.id }, at(BOARD.x, BOARD.y)]);
  for (const o of S.reqs || []) if (o.w <= now && has(S, Object.fromEntries(o.it))) { const hp = LOTS[o.who >> 1] || [740, 2040]; tries.push([{ a: 'req', id: o.id }, at(hp[0], hp[1] + 20)]); }
  S.plots.forEach((pl, i) => { if (i < S.np && plotReady(pl, now)) tries.push([{ a: 'harvest', i }, plotRect(i), pl.c]); });
  for (const k of Object.keys(BUILD)) { const q = S.bld[k].q; if (q.length && q[0].e <= now) tries.push([{ a: 'collect', b: k }, at(BUILD[k].x, BUILD[k].y)]); }
  for (const [k, P] of Object.entries(PENS)) if (P.lvl <= S.lvl) { const st = S.pens[k], ready = st.a.some(f => f && now >= f + P.t * 1000), hungry = st.a.some(f => !f) && (S.inv[P.feed] || 0) > 0; if (ready || hungry) tries.push([{ a: 'pen', k }, at(P.x, P.y)]); }
  treeList(S).forEach(t => { if (treeReady(S, t.i, now)) tries.push([{ a: 'tree', i: t.i }, at(t.x, t.y)]); });
  if (S.land.sul) { if (HIVES.some((h, i) => hiveReady(S, i, now))) tries.push([{ a: 'hive' }, at(HIVES[0][0], HIVES[0][1])]);
    if ((S.boat.e && S.boat.e <= now) || (!S.boat.e && (S.inv.milho || 0) >= 4)) tries.push([{ a: 'boat' }, at(BOAT.x - 40, BOAT.y)]); }
  for (const k of Object.keys(PROJ)) if (rentNow(S, k, now) > 0) tries.push([{ a: 'rent', k }, at(PROJ[k].x, PROJ[k].y)]);
  (S.homes || []).forEach((h, i) => { if (homeRent(S, i, now) >= HOME_INC * 2) tries.push([{ a: 'homeRent', i }, at(LOTS[i][0], LOTS[i][1])]); });
  if (S.helper.sell !== false && invCount(S) >= S.cap * 0.85) { const sale = surplusSale(S, now); if (sale) tries.push([sale, at(BARN.x, BARN.y)]); }
  // fazer nos prédios o que as encomendas pedem
  for (const [k, q] of Object.entries(orderNeeds(S, now))) { if (CROPS[k]) continue; const R = findRecipe(S, k); if (!R) continue; const miss = q - (S.inv[k] || 0) - queued(S, R.b, k);
    if (miss > 0 && S.bld[R.b].q.length < qCap(S, R.b) && has(S, R.r.i)) tries.push([{ a: 'craft', b: R.b, r: R.i }, at(BUILD[R.b].x, BUILD[R.b].y)]); }
  // ração para os animais
  for (const [pk, P] of Object.entries(PENS)) if (P.lvl <= S.lvl) { const R = findRecipe(S, P.feed); if (R && (S.inv[P.feed] || 0) + queued(S, R.b, P.feed) < S.pens[pk].a.length && S.bld[R.b].q.length < qCap(S, R.b) && has(S, R.r.i)) tries.push([{ a: 'craft', b: R.b, r: R.i }, at(BUILD[R.b].x, BUILD[R.b].y)]); }
  S.plots.forEach((pl, i) => { if (i < S.np && !pl.c) { const c = pickCrop(S, now, pl.last); if (S.coins >= CROPS[c].cost + 10) tries.push([{ a: 'plant', i, c }, plotRect(i)]); } });
  let blocked = false;
  for (const [a, r, crop] of tries) { const res = apply(S, a, now); if (res.ok) { if (a.a === 'harvest') { S.plots[a.i].last = crop; const nc = pickCrop(S, now, crop); if (CROPS[nc] && S.coins >= CROPS[nc].cost + 10) { const re = apply(S, { a: 'plant', i: a.i, c: nc }, now); if (re.ok) { S.plots[a.i].last = nc; res.fx.push(...re.fx); } } }
      S.helper.x = r.x + r.w / 2; S.helper.y = r.y + r.h / 2 + 18; return res; } if (res.msg === L('barnFull')) blocked = true; }
  return blocked ? { full: true } : null;
}
const BUILD_V = '2026-11-02.27';
async function checkVersion() { try { const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return; const j = await r.json(); if (j && j.v && j.v !== BUILD_V) { $('updT').textContent = L('newVersion'); $('bUpd').textContent = L('update'); $('upd').hidden = false; } } catch (e) {} }
$('vTag').textContent = 'v ' + BUILD_V;
setTimeout(checkVersion, 4000); setInterval(checkVersion, 90000);
$('bUpd').onclick = () => { if (G.S && G.mode !== 'guest') storeFarm(G.S);
  try { if (G.S) sessionStorage.setItem('sitio-resume', JSON.stringify({ fid: G.S.fid, mode: G.mode, code: NET.code || '' })); } catch (e) {}
  location.href = location.href.split('#')[0]; };
let helperClock = 0;
setInterval(() => { if (!G.S) return; if (G.mode !== 'guest') {
  const S = G.S, now = Date.now(); helperClock++; if (ensureReqs(S, now)) { S.rev++; saveSoon(); broadcast(); }
  if (rainTick(S, now)) { S.rev++; saveSoon(); broadcast(); }
  { const tr = truckTick(S, now); if (tr && tr.ok) { ensureOrders(S); S.rev++; saveSoon(); broadcast(); playFx(tr.fx); toast(L('truckDone'), 2000); } }
  { const fi = fairTick(S, now); if (fi >= 0) { S.rev++; saveSoon(); broadcast(); fairFx(fi); } }
  if (S.helper && S.helper.on && S.helper.until > now && helperClock % 2 === 0) { let r = null; for (let hh = 0; hh < hCount(S); hh++) { const rr = helperTask(S, now); if (rr && rr.ok) { S.helper.ps[hh] = [S.helper.x, S.helper.y]; if (r && r.ok) playFx(r.fx.filter(f => f[0] !== 'coins')); r = rr; } else if (!r) r = rr; } if (r && r.ok) { playFx(r.fx.filter(f => f[0] !== 'coins')); ensureOrders(S); saveSoon(); broadcast(); } else if (r && r.full && !G.helperWarned) { G.helperWarned = 1; toast(L('helperFull'), 3200); } if (r && r.ok) G.helperWarned = 0; } if (ensureOrders(G.S)) { G.S.rev++; saveSoon(); } } if (G.mode === 'host' && (G.S.rev !== G.bcRev || Date.now() - bcLast > 4000)) { G.bcRev = G.S.rev; broadcast(); } refresh(); }, 1000);

const NET = { api: null, room: null, sub: null, code: null, role: null, guestPeer: null,
  async leave() { if (this.sub) this.sub(); this.sub = null; const r = this.room; this.room = null; this.guestPeer = null; if (r) try { await r.leave(); } catch (e) {} } };
(async () => {
  await null;
  try { NET.api = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('room') : null; } catch (e) { NET.api = null; }
  if (!NET.api && window.RELAY_ROOM) NET.api = window.RELAY_ROOM; // servidor intermediário: funciona em qualquer rede
  if (!NET.api && window.P2P_ROOM) NET.api = window.P2P_ROOM;
  let resume = null; try { resume = JSON.parse(sessionStorage.getItem('sitio-resume') || 'null'); sessionStorage.removeItem('sitio-resume'); } catch (e) {}
  if (resume && resume.fid && ME.name) {
    if (resume.mode === 'guest' && /^[A-Z]{4}$/.test(resume.code)) join(resume.code);
    else if (loadFarm(resume.fid)) { startFarm(resume.fid); if (resume.mode === 'host') { await hostRoom(); $('ovRoom').hidden = true; } }
  } else joinFromHash();
  addEventListener('hashchange', joinFromHash);
})();
const CODE_AB = 'ACDEFGHJKMNPQRTUVWXY', newCode = () => Array.from({ length: 4 }, () => CODE_AB[Math.floor(Math.random() * CODE_AB.length)]).join('');
function joinFromHash() { const h = (location.hash || '').slice(1).toUpperCase(); if (NET.api && /^[A-Z]{4}$/.test(h) && !NET.room) { $('iCode').value = h; if (ME.name) join(h); else { $('mMsg').textContent = L('needName'); $('iName').focus(); } } }
const others = () => NET.room ? NET.room.peers().filter(p => !p.sameTab && p.presence && p.presence.app === 'sitio1') : [];
async function openRoom(role, code, keep) {
  if (!NET.api) { $('mMsg').textContent = L('noFriendMode'); return null; }
  await NET.leave(); let r = null;
  for (let tries = 0; ; tries++) {
    try { r = await NET.api.join('sitio-' + code.toLowerCase(), role); break; }
    catch (e) { const c = e && e.code; if (c === 'taken' && role === 'host' && keep) return 'taken'; if (c === 'taken' && role === 'host' && tries < 4) { code = newCode(); continue; }
      const m = c === 'not_found' ? L('notFound') : c === 'blocked' ? L('blocked') : L('noConn');
      $('mMsg').textContent = m; $('rMsg').textContent = m; return null; }
  }
  Object.assign(NET, { room: r, code, role }); G.lastSeq = 0;
  NET.sub = r.onPeers(onPeers, () => toast(L('roomLost')));
  r.presence({ app: 'sitio1', role, me: meInfo() }).catch(() => {});
  return r;
}
async function hostRoom() {
  $('rMsg').textContent = ''; $('rStatus').textContent = L('creating'); $('rCode').textContent = '----'; $('ovRoom').hidden = false;
  let saved = ''; try { saved = localStorage.getItem('sitio-code-' + G.S.fid) || ''; } catch (e) {}
  const fixed = /^[A-Z]{4}$/.test(saved);
  const r = await openRoom('host', fixed ? saved : newCode(), fixed); if (!r) return;
  // a sala deste sítio já está aberta no celular do amigo: entra nela em vez de criar outra
  if (r === 'taken') { $('ovRoom').hidden = true; toast(L('joiningOpen', saved), 3000); return join(saved); }
  try { localStorage.setItem('sitio-code-' + G.S.fid, NET.code); } catch (e) {}
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
      // o progresso do amigo só entra se quem abriu a sala não jogou desde a última vez que estiveram juntos
      if (pr.up && pr.up.fid === G.S.fid && sane(pr.up) && !G.sent['u' + pr.up.rev]) { G.sent['u' + pr.up.rev] = 1;
        if (G.S.rev === (G.S.sy || 0) && pr.up.rev > G.S.rev) { G.S = pr.up; storeFarm(G.S); toast(L('loadedFriend')); } else if (pr.up.rev !== G.S.rev) toast(L('keptHost'), 3600);
        broadcast(); refresh(); }
      if (pr.have === G.S.rev && G.S.sy !== G.S.rev) { G.S.sy = G.S.rev; saveSoon(); }
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
        if (mine && mine.rev > (mine.sy || 0) && mine.rev !== st.rev && !G.sent[st.fid + ':' + mine.rev]) { G.sent[st.fid + ':' + mine.rev] = 1; NET.room.presence({ up: mine }).catch(() => {}); }
        const first = G.mode !== 'guest';
        G.S = st; G.mode = 'guest'; storeFarm({ ...st, sy: st.rev }, false); if (G.ackRev !== st.rev) { G.ackRev = st.rev; NET.room.presence({ have: st.rev }).catch(() => {}); } try { if (NET.code) localStorage.setItem('sitio-code-' + st.fid, NET.code); } catch (e) {}
        if (first) { $('ovMenu').hidden = true; $('hud').hidden = false; toast(L('youJoined', farmTitle(st))); }
        refresh();
      }
      readFriend(h.presence);
    } else if (G.mode === 'guest' && !G.hostGoneT) {
      toast(L('lostFriend'));
      G.hostGoneT = setTimeout(() => { if (G.mode === 'guest' && !others().length) { goMenu(); $('mMsg').textContent = L('connDropped'); } }, 90000);
    }
    updCoop();
  }
}
function readFriend(pr) {
  const m = pr.me || {}; AV.fr.on = true; AV.fr.name = String(m.n || '').slice(0, 16) || L('friend'); AV.fr.look = m.l === 'hair' ? 'hair' : 'hat';
  if (pr.ping && (!G.partnerPing || pr.ping[2] !== G.partnerPing[2])) { G.partnerPing = pr.ping; walkTo(AV.fr, pr.ping[0], pr.ping[1]); }
}
function updCoop() {
  const waiting = NET.role === 'host' && !NET.guestPeer && NET.room;
  const on = (NET.role === 'host' && NET.guestPeer) || (NET.role === 'guest' && G.mode === 'guest') || waiting;
  $('coop').hidden = !on || !G.S; $('coop').classList.toggle('wait', !!waiting);
  if (waiting) { $('coopT').textContent = L('roomWaiting', NET.code); return; } const fn = AV.fr.on && AV.fr.name; $('coopT').textContent = NET.role === 'guest' ? (G.S && ownerName(G.S) ? L('coopGuestN', ownerName(G.S)) : L('coopGuest')) : (fn ? L('coopHostN', fn) : L('coopHost'));
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
  if (G.edit) setEdit(false);
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
$('bHelper').onclick = () => openSheet('helper'); $('bMove').onclick = () => setEdit(!G.edit); $('bEditDone').onclick = () => G.road ? setRoad(false) : setEdit(false); $('bRoad').onclick = () => setRoad(!G.road);
function roadBarText() { const S = G.S; return S ? L('roadBar', S.roadFree, ROAD_COST) + ' · ' + L('roadHint') : ''; }
function setRoad(on) { if (on && G.edit) setEdit(false); G.road = !!on; closeSheet(); $('editBar').hidden = !G.road; $('editT').textContent = roadBarText(); $('bEditDone').textContent = L('moveDone'); $('bRoad').classList.toggle('on', G.road); SND.pop(); }
function setEdit(on) { if (G.road) { G.road = false; $('bRoad').classList.remove('on'); } G.edit = !!on; closeSheet(); $('editBar').hidden = !G.edit; $('editT').textContent = L('moveHint'); $('bEditDone').textContent = L('moveDone'); $('bMove').classList.toggle('on', G.edit); SND.pop(); } $('bOrders').onclick = () => openSheet('orders'); $('bBarn').onclick = () => openSheet('barn'); $('bShop').onclick = () => openSheet('shop'); $('bMenu').onclick = () => openSheet('menu'); $('hCoins').onclick = () => openSheet('shop');
$('sClose').onclick = () => closeSheet();
$('icHelper').src = icon('helper'); $('icMove').src = icon('move'); $('icRoad').src = icon('road'); $('icCoin').src = icon('coin'); $('icOrders').src = icon('orders'); $('icBarn').src = icon('barn'); $('icShop').src = icon('shop');

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
      : `<button class="tile" type="button" data-plant="${k}" ${S.coins < c.cost ? 'disabled' : ''}>${img(k)}${N(k)}<small>${L('coins', c.cost)} · ${fmtT(c.t)}</small><small>${L('yields', c.y)}</small></button>`).join('')}</div>` + oneBoost(S, 'abono');
  } else if (SH.type === 'bld') {
    const B = BUILD[SH.arg], st = S.bld[SH.arg]; t.textContent = N(SH.arg);
    const slots = Array.from({ length: qCap(S, SH.arg) }, (_, i) => { const j = st.q[i]; if (!j) return `<div class="slot">${L('empty')}</div>`; const r = B.rec[j.r], ready = j.e <= now; return `<div class="slot ${ready ? 'ready' : ''}">${img(r.o)}<em>${ready ? L('ready') : j.s <= now ? fmtT(Math.ceil((j.e - now) / 1000)) : L('queued')}</em></div>`; }).join('');
    const more = qCap(S, SH.arg) >= MAXQ ? `<small>${L('slotsMax')}</small>` : `<button class="btn blue" type="button" data-slot="1" ${S.coins < slotCost(S, SH.arg) ? 'disabled' : ''} style="font-size:16px">${L('addSlot')} · ${img('coin')} ${slotCost(S, SH.arg)}</button>`;
    const fj = st.q[0], rushB = fj && fj.e > now && fj.s <= now ? `<button class="btn" type="button" data-rushb="1" ${S.coins < rushCost(Math.ceil((fj.e - now) / 1000)) ? 'disabled' : ''} style="font-size:16px">⚡ ${L('rushBtn')} · ${img('coin')} ${rushCost(Math.ceil((fj.e - now) / 1000))}</button>` : '';
    h = rushB + `<div class="row"><div class="q" style="flex:1">${slots}</div>${st.q.some(j => j.e <= now) ? `<button class="btn" type="button" data-collect="1">${L('collect')}</button>` : ''}</div>
      ${B.rec.map((r, i) => !okR(S, r) ? `<div class="card" style="opacity:.55"><div class="row">${img(r.o)}<b style="flex:1">${N(r.o)}</b><small>${r.lvl > S.lvl ? L('lvl', r.lvl) : L('land_' + r.land)}</small></div></div>`
        : `<div class="card"><div class="row"><span style="width:44px;height:44px;display:grid;place-items:center">${img(r.o)}</span><div style="flex:1"><b>${N(r.o)}${r.k > 1 ? ' ×' + r.k : ''}</b><br><small>${fmtT(Math.round(r.t * UP_MULT[upLv(S, famOf(SH.arg))]))}</small></div>
          <button class="btn" type="button" data-craft="${i}" ${!has(S, r.i) || st.q.length >= qCap(S, SH.arg) ? 'disabled' : ''}>${L('make')}</button></div>${needHtml(S, r.i)}</div>`).join('')}${more}${upCard(S, famOf(SH.arg))}${DUP_TYPES.includes(famOf(SH.arg)) ? `<span class="lbl">${L('dups')}</span>` + dupCard(S, famOf(SH.arg)) : ''}`;
  } else if (SH.type === 'pen') {
    const P = PENS[SH.arg], st = S.pens[SH.arg]; t.textContent = N(SH.arg);
    const ready = st.a.filter(x => x && now >= x + P.t * 1000).length, busy = st.a.filter(x => x && now < x + P.t * 1000), hungry = st.a.filter(x => !x).length;
    h = `<p class="sub">${L('penSub', st.a.length, SH.arg, hungry, busy.length, ready)}</p>
      <div class="card"><div class="row">${img(P.feed)}<div style="flex:1"><b>${N(P.feed)}</b><br><small>${L('youHave', S.inv[P.feed] || 0)}</small></div></div>
      ${busy.length ? `<small>${L('nextIn', P.out, fmtT(Math.ceil((Math.min(...busy) + P.t * 1000 - now) / 1000)))}</small>` : ''}</div>
      <button class="btn" type="button" data-pen="1">${ready ? L('collectX', P.out) : L('feed')}</button>
      ${busy.length ? `<button class="btn blue" type="button" data-rushp="1" ${S.coins < rushCost(Math.ceil((Math.max(...busy) + P.t * 1000 - now) / 1000)) ? 'disabled' : ''}>⚡ ${L('rushBtn')} · ${img('coin')} ${rushCost(Math.ceil((Math.max(...busy) + P.t * 1000 - now) / 1000))}</button>` : ''}` + oneBoost(S, 'racao');
  } else if (SH.type === 'barn') {
    const n = invCount(S); t.textContent = L('barn'); const sellAllBtn = `<button class="btn" type="button" data-sellall="1">${img('coin')} ${L('sellSurplus')}</button><small>${L('sellSurplusHint')}</small>`;
    const ks = Object.keys(S.inv).filter(k => S.inv[k] > 0);
    h = sellAllBtn + `<p class="sub">${L('barnUsed', n, S.cap)}</p><div style="height:10px;border-radius:5px;background:#e6d6b5;overflow:hidden"><i style="display:block;height:100%;width:${Math.min(100, n / S.cap * 100)}%;background:${n >= S.cap ? '#e0533d' : '#5cc04a'}"></i></div>
      ${ks.length ? ks.map(k => `<div class="card" style="padding:8px 10px"><div class="row"><span style="width:40px;height:40px;display:grid;place-items:center">${img(k)}</span><div style="flex:1;min-width:0"><b>${N(k)} ×${S.inv[k]}</b><br><small>${img('coin').replace('<img', '<img style="width:14px;height:14px;vertical-align:-2px"')} ${L('each', sellPrice(k))}</small></div>
        <button class="btn gray" type="button" data-sell="${k}" data-q="1" style="font-size:15px;padding:9px 10px">${L('sellOne')}</button><button class="btn" type="button" data-sell="${k}" data-q="${S.inv[k]}" style="font-size:15px;padding:9px 10px">${L('sellAll')}</button></div></div>`).join('') : `<p class="sub">${L('barnEmpty')}</p>`}
      <button class="btn blue" type="button" data-cap="1" ${S.coins < capCost(S.cap) ? 'disabled' : ''}>${L('barnUp')} · ${img('coin')} ${capCost(S.cap)}</button>`;
  } else if (SH.type === 'orders') {
    t.textContent = L('orders');
    h = `<p class="sub">${L('ordersSub')}</p>` + S.orders.map(o => o.w > now
      ? `<div class="card"><p class="sub">${L('newOrderIn', fmtT(Math.ceil((o.w - now) / 1000)))}</p></div>`
      : `<div class="card">${needHtml(S, Object.fromEntries(o.it))}<div class="row"><span class="need"><span>${img('coin')}${o.c}</span><span>${img('star')}${o.x}</span></span><span style="flex:1"></span>
        <button class="btn gray" type="button" data-discard="${o.id}" aria-label="${L('discardAria')}">✕</button><button class="btn" type="button" data-deliver="${o.id}" ${has(S, Object.fromEntries(o.it)) ? '' : 'disabled'}>${L('deliver')}</button></div></div>`).join('');
    if (S.reqs && S.reqs.length) h += `<span class="lbl">${L('reqs')}</span><p class="sub">${L('reqSub')}</p>` + S.reqs.map(reqCard).join('');
  } else if (SH.type === 'req') {
    const o = S.reqs.find(x => x.id === SH.arg); t.textContent = L('reqs'); h = o ? reqCard(o) : '';
  } else if (SH.type === 'lvl') {
    const l = SH.arg; t.textContent = L('lvlTitle', l); const news = levelNews(l), nxt = levelNews(l + 1);
    h = `<div class="card" style="align-items:center;text-align:center"><b style="font-family:var(--display);font-size:38px;color:#2f7a22">${l}</b><p class="sub" style="display:flex;gap:6px;align-items:center;justify-content:center">${img('coin').replace('<img', '<img style="width:24px;height:24px"')} ${L('lvlCoins', 50 * l)}</p><p class="sub">${img('barn').replace('<img', '<img style="width:24px;height:24px;vertical-align:-6px"')} ${L('lvlCap')}</p></div>
      <div class="card"><span class="lbl">${L('lvlUnlocked')}</span><p style="margin:0;font-weight:800">${news ? news.replace(/^[^:]+: /, '') : L('lvlNothing')}</p></div>
      <div class="card"><span class="lbl">${L('lvlNext', l + 1)}</span><p style="margin:0;font-weight:700">${nxt ? nxt.replace(/^[^:]+: /, '') : L('lvlNothing')}</p></div>
      <button class="btn" type="button" data-close="1">${L('great')}</button>`;
  } else if (SH.type === 'fair') {
    t.textContent = L('fair'); const ks = Object.keys(S.inv).filter(k => S.inv[k] > 0);
    h = `<p class="sub">${L('fairSub')}</p><p class="sub">${L('fairSold', S.fairSold || 0)}</p>` + S.fair.map((st, i) => st
      ? `<div class="card"><div class="row"><span style="width:40px;height:40px;display:grid;place-items:center">${img(st.k)}</span><div style="flex:1"><b>${L('stall', i + 1)}: ${N(st.k)} ×${st.q}</b><br><small>${img('coin').replace('<img', '<img style="width:14px;height:14px;vertical-align:-2px"')} ${L('each', ITEMS[st.k].v)}</small></div><button class="btn gray" type="button" data-ftake="${i}">${L('fairTake')}</button></div></div>`
      : `<div class="card"><b>${L('stall', i + 1)}</b><small>${L('fairEmpty')}</small><div class="grid">${ks.map(k => `<button class="tile" type="button" data-fput="${i}" data-k="${k}">${img(k)}${N(k)}<small>×${Math.min(FAIR.max, S.inv[k])} · ${ITEMS[k].v}</small></button>`).join('')}</div></div>`).join('');
  } else if (SH.type === 'city') {
    t.textContent = L('city'); const hp = happy(S), m = cityMult(S), inc = Math.round((S.homes.length * HOME_INC + Object.keys(PROJ).filter(k => S.city[k] && S.city[k].e <= now).reduce((a, k) => a + PROJ[k].inc, 0)) * m * 12);
    h = `<div class="card"><b>${L('happyL')}: ${hp}/100</b><div style="height:12px;border-radius:6px;background:#e6d6b5;overflow:hidden"><i style="display:block;height:100%;width:${hp}%;background:${hp > 70 ? '#5cc04a' : hp > 45 ? '#ffc23a' : '#e0533d'}"></i></div><small>${L('happyHint')}</small><small>${L('hpFrom')}</small></div>
      <div class="card"><p class="sub">${L('cityPop', S.homes.length * 2, m.toFixed(2))}</p><p class="sub">${L('incomeH', inc)}</p></div>
      ${Object.entries(SERV).map(([k, V]) => `<div class="card"><div class="row"><span style="width:40px;height:40px;display:grid;place-items:center">${img('star')}</span><div style="flex:1"><b>${L('serv_' + k)}</b><br><small>${L('servD_' + k)}</small></div>
        ${S.serv[k] ? `<small>${L('landOwned')}</small>` : !S.land.bairro ? `<small>${L('land_bairro')}</small>` : S.lvl < V.lvl ? `<small>${L('lvl', V.lvl)}</small>` : `<button class="btn" type="button" data-serv="${k}" ${S.coins < V.cost ? 'disabled' : ''}>${img('coin')} ${V.cost}</button>`}</div></div>`).join('')}`;
  } else if (SH.type === 'homes') {
    const i = SH.arg, hm = S.homes[i]; t.textContent = hm ? L('homeOf', NPC_NAMES[(i * 2) % NPC_NAMES.length], NPC_NAMES[(i * 2 + 1) % NPC_NAMES.length]) : L('emptyLot');
    h = hm ? `<p class="sub">${L('rentIn', HOME_INC, fmtT(Math.ceil((hm.c + RENT_EVERY * 1000 - now) / 1000)))}</p><small>${L('homeHint')}</small>`
      : `<p class="sub">${L('homesN', S.homes.length, LOTS.length, S.homes.length * 2)}</p><small>${L('homeHint')}</small>${S.homes.length < LOTS.length ? `<button class="btn" type="button" data-home="1" ${S.coins < homeCost(S.homes.length) ? 'disabled' : ''}>${L('homeBuy')} · ${img('coin')} ${homeCost(S.homes.length)}</button>` : ''}`;
  } else if (SH.type === 'proj') {
    const k = SH.arg, P = PROJ[k], c = S.city[k]; t.textContent = N(k);
    if (!c) h = `<div class="card"><p class="sub">${L('lot')}</p>${P.lvl > S.lvl ? `<p class="sub">${L('unlockAt', P.lvl)}</p>` : `${needHtml(S, P.need)}<p class="sub">${L('buildFaster', Math.max(1, hCount(S)))} · ${fmtT(Math.max(30, Math.round(P.t / Math.max(1, hCount(S)))))}</p>
      <button class="btn" type="button" data-build="${k}" ${S.coins < P.cost || !has(S, P.need) ? 'disabled' : ''}>${L('build')} · ${img('coin')} ${P.cost}</button>`}</div>`;
    else if (c.e > now) h = `<div class="card"><p class="sub">${L('building', fmtT(Math.ceil((c.e - now) / 1000)))}</p><button class="btn" type="button" data-rushc="${k}" ${S.coins < rushCost(Math.ceil((c.e - now) / 1000)) ? 'disabled' : ''}>⚡ ${L('rushBtn')} · ${img('coin')} ${rushCost(Math.ceil((c.e - now) / 1000))}</button></div>`;
    else { const amt = rentNow(S, k, now); h = `<div class="card"><p class="sub">${L('built')}</p><p class="sub">${L('rentNext', P.inc, fmtT(Math.max(0, Math.ceil((c.c + RENT_EVERY * 1000 - now) / 1000))))}</p>${amt ? `<button class="btn" type="button" data-rent="${k}">${L('rentReady', amt)}</button>` : ''}</div>`; }
  } else if (SH.type === 'rush') {
    const r = SH.arg; t.textContent = L('rushTitle'); let rem = 0, ic = 'coin';
    if (r.t === 'plot') { const pl = S.plots[r.i]; if (pl && pl.c) { rem = pl.p + CROPS[pl.c].t * 1000 - now; ic = pl.c; } }
    else if (r.t === 'tree') { const tr = treeAt(S, r.i); if (tr) { rem = tr.t + FRUIT[tr.k].t * 1000 - now; ic = tr.k; } }
    if (rem <= 0) { closeSheet(); return; }
    const sec = Math.ceil(rem / 1000), c = rushCost(sec);
    h = `<div class="card"><div class="row"><span style="width:48px;height:48px;display:grid;place-items:center">${img(ic)}</span><p style="flex:1;margin:0;font-weight:800">${N(ic)}: ${L('rushText', fmtT(sec))}</p></div>
      <button class="btn" type="button" data-rush="1" ${S.coins < c ? 'disabled' : ''}>⚡ ${L('rushBtn')} · ${img('coin')} ${c}</button></div>`;
  } else if (SH.type === 'land') {
    const k = SH.arg, Ld = LANDS[k]; t.textContent = L('land_' + k);
    h = `<div class="card"><div class="row">${img('land')}<p style="flex:1;margin:0;font-weight:800">${L('landDesc_' + k)}</p></div>
      ${S.land[k] ? `<p class="sub">${L('landOwned')}</p>` : Ld.lvl > S.lvl ? `<p class="sub">${L('unlockAt', Ld.lvl)}</p>`
        : `<button class="btn" type="button" data-land="${k}" ${S.coins < Ld.cost ? 'disabled' : ''}>${L('buyFor')} · ${img('coin')} ${Ld.cost}</button>`}</div>`;
  } else if (SH.type === 'boat') {
    t.textContent = N('barco'); const e = S.boat.e;
    h = `<div class="card"><div class="row">${img('peixe')}<p style="flex:1;margin:0;font-weight:800">${!e ? L('boatIdle') : e > now ? L('boatBack', fmtT(Math.ceil((e - now) / 1000))) : L('ready')}</p></div>
      ${!e ? needHtml(S, BOAT.bait) + `<button class="btn blue" type="button" data-boat="1" ${has(S, BOAT.bait) ? '' : 'disabled'}>${L('boatGo')}</button>` : e <= now ? `<button class="btn" type="button" data-boat="1">${L('collectX', 'peixe')} ×${BOAT.k}</button>` : `<button class="btn" type="button" data-rushboat="1" ${S.coins < rushCost(Math.ceil((e - now) / 1000)) ? 'disabled' : ''}>⚡ ${L('rushBtn')} · ${img('coin')} ${rushCost(Math.ceil((e - now) / 1000))}</button>`}</div>`;
  } else if (SH.type === 'helper') {
    const H = S.helper; t.textContent = hCount(S) > 1 ? L('helpersTitle') : L('helperTitle');
    h = `<div class="card"><div class="row"><span style="width:56px;height:56px;display:grid;place-items:center">${img('helper')}</span><p style="flex:1;margin:0;font-weight:800">${L('helperDoes2')}</p></div></div>`
      + (!H.on ? `<div class="card"><p class="sub">${L('helperLocked', HELPER_ORDERS)}</p><div style="height:10px;border-radius:5px;background:#e6d6b5;overflow:hidden"><i style="display:block;height:100%;width:${Math.min(100, (S.done || 0) / HELPER_ORDERS * 100)}%;background:#5cc04a"></i></div><small>${L('helperProg', Math.min(S.done || 0, HELPER_ORDERS), HELPER_ORDERS)}</small></div>`
        : `<div class="card"><p class="sub">${H.until > now ? L('working', fmtT(Math.ceil((H.until - now) / 1000))) : L('resting')}</p><span class="lbl">${L('shiftLbl')}</span>
          <div class="row">${SHIFTS.map((x, i) => `<button class="btn${i === 2 ? '' : ' blue'}" type="button" data-shift="${i}" style="flex:1;font-size:15px;flex-direction:column;gap:2px" ${S.coins < x.cost * hCount(S) ? 'disabled' : ''}>${L('sh' + i)}<small style="font-family:var(--body);font-size:12px">${img('coin').replace('<img', '<img style="width:13px;height:13px;vertical-align:-2px"')} ${x.cost * hCount(S)}</small></button>`).join('')}</div>
          <button class="btn gray" type="button" data-autosell="1" style="font-size:15px">${S.helper.sell === false ? '☐' : '☑'} ${L('autoSell')}</button><small>${L('autoSellHint')}</small></div>
          <div class="card"><p class="sub">${L('helpersN', hCount(S), HELPER_NAMES.length)} · ${HELPER_NAMES.slice(0, hCount(S)).join(', ')}</p><p class="sub">${L('helpersWork')}</p>
          ${hCount(S) < HELPER_NAMES.length ? `<button class="btn blue" type="button" data-hire="1" ${S.coins < hireCost(hCount(S)) ? 'disabled' : ''}>${L('hire', HELPER_NAMES[hCount(S)])} · ${img('coin')} ${hireCost(hCount(S))}</button>` : ''}</div>`);
  } else if (SH.type === 'shop') {
    t.textContent = L('shop');
    h = `<div class="card"><div class="row"><b style="flex:1">${L('newPlot')}</b>${S.np >= MAXPLOTS ? `<small>${L('allBought')}</small>` : `<button class="btn" type="button" data-buyplot="1" ${S.coins < plotCost(S.np) ? 'disabled' : ''}>${img('coin')} ${plotCost(S.np)}</button>`}</div><small>${L('plotsOf', S.np, MAXPLOTS)}</small></div>
      <div class="card"><div class="row"><b style="flex:1">${L('bigBarn')}</b><button class="btn blue" type="button" data-cap="1" ${S.coins < capCost(S.cap) ? 'disabled' : ''}>${img('coin')} ${capCost(S.cap)}</button></div><small>${L('fitsNow', S.cap)}</small></div>
      <span class="lbl">${L('animals')}</span>${Object.entries(PENS).filter(([, P]) => P.lvl <= S.lvl).map(([k]) => { const n = S.pens[k].a.length, m = PEN_MAX[k];
        return `<div class="card"><div class="row"><span style="width:40px;height:40px;display:grid;place-items:center">${img(PENS[k].out)}</span><div style="flex:1"><b>${L(k === 'galinheiro' ? 'buyHen' : 'buyCow')}</b><br><small>${N(k)} · ${L('haveN', n, m)}</small></div>
        ${n >= m ? `<small>${L('slotsMax')}</small>` : `<button class="btn" type="button" data-animal="${k}" ${S.coins < animalCost(k, n) ? 'disabled' : ''}>${img('coin')} ${animalCost(k, n)}</button>`}</div></div>`; }).join('')}
      ${boostCards(S)}
      <div class="card"><div class="row"><span style="width:40px;height:40px;display:grid;place-items:center">${img('orders')}</span><div style="flex:1"><b>${L('truck')}</b><br><small>${L('truckD')}</small></div>${S.truck ? `<small>${L('landOwned')}</small>` : S.lvl < TRUCK.lvl ? `<small>${L('lvl', TRUCK.lvl)}</small>` : `<button class="btn" type="button" data-truck="1" ${S.coins < TRUCK.cost ? 'disabled' : ''}>${img('coin')} ${TRUCK.cost}</button>`}</div></div>
      <button class="btn blue" type="button" data-citypanel="1">${L('cityBtn')} · ${L('happyL')} ${happy(S)}</button>
      ${S.land.bairro ? `<span class="lbl">${L('homes')}</span><div class="card"><p class="sub">${L('homesN', S.homes.length, LOTS.length, S.homes.length * 2)}</p><small>${L('homeHint')}</small>${S.homes.length < LOTS.length ? `<button class="btn" type="button" data-home="1" ${S.coins < homeCost(S.homes.length) ? 'disabled' : ''}>${L('homeBuy')} · ${img('coin')} ${homeCost(S.homes.length)}</button>` : ''}</div>` : ''}
      <span class="lbl">${L('roads')}</span><div class="card"><p class="sub">${L('roadInfo', S.roads.length, roadBonus(S))}</p><button class="btn blue" type="button" data-roadmode="1">${L('roadBtn')}</button></div>
      ${DUP_TYPES.some(k => okB(S, BUILD[k])) ? `<span class="lbl">${L('dups')}</span><p class="sub">${L('dupHint')}</p>${DUP_TYPES.map(k => dupCard(S, k)).join('')}` : ''}
      <span class="lbl">${L('silos')}</span><div class="card"><div class="row"><span style="width:40px;height:40px;display:grid;place-items:center"><img src="${siloIcon()}" alt=""></span><div style="flex:1"><b>${L('silo')} (+100)</b><br><small>${L('siloHint', S.silos)}</small></div>
        ${S.silos >= SILOS.length ? `<small>${L('slotsMax')}</small>` : `<button class="btn" type="button" data-silo="1" ${S.coins < siloCost(S.silos) ? 'disabled' : ''}>${img('coin')} ${siloCost(S.silos)}</button>`}</div></div>
      ${S.lvl >= 4 ? `<span class="lbl">${L('trees')}</span><p class="sub">${L('treesN', S.xt.length, XT_MAX)}</p><div class="grid">${[['laranja', 'buyTreeL'], ['manga', 'buyTreeM']].map(([k, lb]) => `<button class="tile" type="button" data-tree="${k}" ${S.xt.length >= XT_MAX || S.coins < treeCost(k) ? 'disabled' : ''}>${img(k)}${L(lb)}<small>${img('coin').replace('<img', '<img style="width:14px;height:14px;vertical-align:-2px"')} ${treeCost(k)}</small></button>`).join('')}</div>` : ''}
      <span class="lbl">${L('decos')}</span><p class="sub">${L('decoBonus', decoBonus(S))}</p><div class="grid">${Object.entries(DECOS).map(([k, D]) => `<button class="tile" type="button" data-deco="${k}" ${S.deco[k] || S.coins < D.cost ? 'disabled' : ''}><img src="${decoIcon(k)}" alt="">${L('deco_' + k)}<small>${S.deco[k] ? L('bought') : img('coin').replace('<img', '<img style="width:14px;height:14px;vertical-align:-2px"') + ' ' + D.cost}</small></button>`).join('')}</div>
      <span class="lbl">${L('lands')}</span>${Object.entries(LANDS).map(([k, Ld]) => `<div class="card"><div class="row">${img('land')}<div style="flex:1"><b>${L('land_' + k)}</b><br><small>${L('landDesc_' + k)}</small></div>
        ${S.land[k] ? `<small>${L('landOwned')}</small>` : Ld.lvl > S.lvl ? `<small>${L('lvl', Ld.lvl)}</small>` : `<button class="btn" type="button" data-land="${k}" ${S.coins < Ld.cost ? 'disabled' : ''}>${img('coin')} ${Ld.cost}</button>`}</div></div>`).join('')}
      <p class="sub">${L('zoomHint')}</p>
      <span class="lbl">${L('soon')}</span><div class="grid">${L('exps').map(e => `<div class="tile lock">${e}<small>${L('expansion')}</small></div>`).join('')}</div>`;
  } else if (SH.type === 'menu') {
    t.textContent = farmTitle(S);
    const host = G.mode === 'host' || G.mode === 'solo';
    h = `<p class="sub">${L('stats', S.lvl, S.xp, S.coins)}</p>
      ${G.mode === 'guest' ? `<p class="sub">${L('guestNote')}</p>` : ''}
      ${host ? `<button class="btn blue" type="button" data-invite="1">${NET.role === 'host' ? L('seeCode') : L('invite')}</button>` : ''}
      <span class="lbl">${L('sound')}</span><div class="row"><button class="btn ${MUSIC.on ? '' : 'gray'}" type="button" data-music="1" style="flex:1;font-size:16px">♪ ${L('music')}: ${MUSIC.on ? L('on') : L('off')}</button><button class="btn ${AMB ? '' : 'gray'}" type="button" data-amb="1" style="flex:1;font-size:16px">🐦 ${L('ambient')}: ${AMB ? L('on') : L('off')}</button></div>
      <span class="lbl">${L('lvlRoad')}</span>${[1, 2, 3].map(d => { const nn = levelNews(S.lvl + d); return `<p class="sub" style="margin:0">${L('lvl', S.lvl + d)}: ${nn ? nn.replace(/^[^:]+: /, '') : L('lvlNothing')}</p>`; }).join('')}
      <span class="lbl">${L('langLbl')}</span>${langButtons()}
      <button class="btn blue" type="button" data-citypanel="1">${L('cityBtn')}</button>
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
  if (d.land) { const r = act({ a: 'land', k: d.land }); if (r.ok) closeSheet(); }
  if (d.boat) act({ a: 'boat' });
  if (d.sell) act({ a: 'sell', k: d.sell, q: +d.q });
  if (d.sellall) act({ a: 'sellSurplus' });
  if (d.slot) act({ a: 'slot', b: SH.arg });
  if (d.animal) act({ a: 'animal', k: d.animal });
  if (d.tree) { const r = act({ a: 'buyTree', k: d.tree }); if (r.ok) closeSheet(); }
  if (d.rush) { const r = act({ a: 'rush', ...SH.arg }); if (r.ok) closeSheet(); }
  if (d.rushb) act({ a: 'rush', t: 'bld', b: SH.arg });
  if (d.rushp) act({ a: 'rush', t: 'pen', k: SH.arg });
  if (d.rushboat) act({ a: 'rush', t: 'boat' });
  if (d.hire) act({ a: 'hire' });
  if (d.silo) act({ a: 'silo' });
  if (d.dup) act({ a: 'dup', k: d.dup });
  if (d.home) act({ a: 'home' });
  if (d.up) act({ a: 'up', k: d.up });
  if (d.serv) act({ a: 'serv', k: d.serv });
  if (d.truck) act({ a: 'truck' });
  if (d.fput) act({ a: 'fairPut', i: +d.fput, k: d.k });
  if (d.ftake) act({ a: 'fairTake', i: +d.ftake });
  if (d.citypanel) { openSheet('city'); return; }
  if (d.boost) act({ a: 'boost', k: d.boost });
  if (d.req) { const r = act({ a: 'req', id: +d.req }); if (r.ok && SH && SH.type === 'req') closeSheet(); }
  if (d.roadmode) { setRoad(true); return; }
  if (d.music) { MUSIC.set(!MUSIC.on); try { localStorage.setItem('sitio-music', MUSIC.on ? '1' : '0'); } catch (e) {} }
  if (d.amb) { AMB = !AMB; try { localStorage.setItem('sitio-amb', AMB ? '1' : '0'); } catch (e) {} if (AMB) SND.bird(); }
  if (d.close) { closeSheet(); return; }
  if (d.build) act({ a: 'build', k: d.build });
  if (d.rent) act({ a: 'rent', k: d.rent });
  if (d.rushc) act({ a: 'rush', t: 'city', k: d.rushc });
  if (d.deco) act({ a: 'deco', k: d.deco });
  if (d.shift) act({ a: 'shift', d: +d.shift });
  if (d.autosell) act({ a: 'autosell' });
  if (d.buyplot) act({ a: 'buyPlot' });
  if (d.deliver) act({ a: 'deliver', id: +d.deliver });
  if (d.discard) act({ a: 'discard', id: +d.discard });
  if (d.invite) { closeSheet(); if (NET.role === 'host') { $('ovRoom').hidden = false; renderRoom(); } else hostRoom(); }
  if (d.exit) goMenu();
  $('sBody').dataset.sig = ''; renderSheet();
});

// ---------- desenho ----------
let BG = null, BGKEY = '';
function seeded(n) { let a = n >>> 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function rr(g, x, y, w, h, r) { g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); }
function bush(g, x, y, s, c1 = '#3f8f2e', c2 = '#5cb844') { g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.ellipse(x, y + 4, 20 * s, 6 * s, 0, 0, 6.283); g.fill();
  for (const [dx, dy, r, c] of [[-10, -6, 11, c1], [10, -6, 11, c1], [0, -12, 13, c2], [-4, -16, 6, 'rgba(255,255,255,.18)']]) { g.fillStyle = c; g.beginPath(); g.arc(x + dx * s, y + dy * s, r * s, 0, 6.283); g.fill(); } }
function path(g, pts, w) {
  const line = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const p = pts[i]; if (p.length === 4) g.quadraticCurveTo(p[0], p[1], p[2], p[3]); else g.lineTo(p[0], p[1]); } };
  g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#b8935a'; g.lineWidth = w + 8; line(); g.stroke(); g.strokeStyle = '#e3c58f'; g.lineWidth = w; line(); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = w * 0.3; line(); g.stroke();
}
// dia e noite: ciclo de 16 min igual nos dois celulares
function nightF(ms) { const t = (ms / 1000) % 960; return t < 660 ? 0 : t < 720 ? (t - 660) / 60 : t < 900 ? 1 : (960 - t) / 60; }
function lampPts(S) { const pts = []; if (S.land.bairro) for (let x = 100; x < 1440; x += 200) pts.push([x, 2004]); if (S.land.vila) for (let x = 160; x < 1000; x += 200) pts.push([x, 1545]);
  for (let y = 760; y < 1500; y += 240) pts.push([352, y]); for (const k of S.roads || []) { const gx = k % 100, gy = Math.floor(k / 100); if ((gx * 3 + gy * 5) % 7 === 0) pts.push([gx * RD + RD - 4, gy * RD + 6]); } return pts; }
function lamps(g, S, nf, T) { for (const [x, y] of lampPts(S)) { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x, y, 7, 3, 0, 0, 6.283); g.fill(); g.fillStyle = '#3a3a44'; g.fillRect(x - 2, y - 56, 4, 56); g.fillRect(x - 6, y - 4, 12, 4);
  g.fillStyle = nf > 0.05 ? `rgba(255,214,120,${0.6 + 0.4 * nf})` : '#e8eef2'; g.beginPath(); g.moveTo(x - 7, y - 56); g.lineTo(x + 7, y - 56); g.lineTo(x + 5, y - 68); g.lineTo(x - 5, y - 68); g.closePath(); g.fill(); g.fillStyle = '#3a3a44'; g.fillRect(x - 8, y - 71, 16, 4); } }
function drawRoads(g, S) {
  const set = new Set(S.roads), has2 = (x, y) => set.has(roadKey(x, y));
  if (G.road) { g.save(); g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1; g.beginPath(); for (let x = 0; x <= WW; x += RD) { g.moveTo(x, 0); g.lineTo(x, WH); } for (let y = 0; y <= WH; y += RD) { g.moveTo(0, y); g.lineTo(WW, y); } g.stroke(); g.restore(); }
  g.fillStyle = 'rgba(70,50,30,.25)'; for (const k of S.roads) { const x = (k % 100) * RD, y = Math.floor(k / 100) * RD; g.fillRect(x - 3, y - 1, RD + 6, RD + 6); }
  g.fillStyle = '#cdb88f'; for (const k of S.roads) { const x = (k % 100) * RD, y = Math.floor(k / 100) * RD; g.fillRect(x, y, RD, RD); }
  for (const k of S.roads) { const gx = k % 100, gy = Math.floor(k / 100), x = gx * RD, y = gy * RD;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const h = ((gx * 7 + gy * 13 + i * 3 + j * 5) % 7) / 7; g.fillStyle = h < 0.5 ? '#d9c6a0' : '#bfa67b'; rr(g, x + 2 + i * 10 + ((j % 2) ? 3 : 0) - 1, y + 2 + j * 10, 8, 7, 2); g.fill(); }
    g.fillStyle = '#9c8762'; if (!has2(gx, gy - 1)) g.fillRect(x, y, RD, 3); if (!has2(gx, gy + 1)) g.fillRect(x, y + RD - 3, RD, 3); if (!has2(gx - 1, gy)) g.fillRect(x, y, 3, RD); if (!has2(gx + 1, gy)) g.fillRect(x + RD - 3, y, 3, RD); }
}
function makeBg(lands) {
  const c = document.createElement('canvas'), K = 1.5; c.width = WW * K; c.height = WH * K; const g = c.getContext('2d'); g.scale(K, K); const R = seeded(7);
  // grama em ladrilhos com leve variação de tom
  for (let y = 0; y < WH; y += 40) for (let x = 0; x < WW; x += 40) { const v = R(); g.fillStyle = v < 0.33 ? '#72c44c' : v < 0.66 ? '#6fc149' : '#75c74f'; g.fillRect(x, y, 40, 40); }
  const lg = g.createLinearGradient(0, 0, 0, WH); lg.addColorStop(0, 'rgba(255,255,200,.10)'); lg.addColorStop(1, 'rgba(0,40,0,.10)'); g.fillStyle = lg; g.fillRect(0, 0, WW, WH);
  for (let i = 0; i < 2600; i++) { const x = R() * WW, y = R() * WH; g.strokeStyle = R() < 0.5 ? 'rgba(255,255,255,.13)' : 'rgba(30,90,20,.18)'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 3, y - 3 - R() * 4); g.stroke(); }
  // caminhos
  path(g, [[320, 1200], [320, 640]], 44);
  path(g, [[84, 600], [320, 640, 556, 600], [870, 610]], 30);
  path(g, [[96, 230], [320, 260, 548, 230], [870, 250]], 26);
  path(g, [[320, 1180], [440, 1200, 560, 1190]], 30);
  path(g, [[320, 1180], [320, 1560]], 40); path(g, [[120, 1560], [1000, 1560]], 34);
  g.fillStyle = '#e3c58f'; g.beginPath(); g.ellipse(400, 1560, 62, 30, 0, 0, 6.283); g.fill(); g.strokeStyle = '#b8935a'; g.lineWidth = 6; g.stroke();
  for (let i = 0; i < 160; i++) { const y = 650 + R() * 540, x = 300 + R() * 40; g.fillStyle = 'rgba(140,105,60,.35)'; g.beginPath(); g.ellipse(x, y, 2 + R() * 2, 1.5, 0, 0, 6.283); g.fill(); }
  // lagoinha com borda de areia
  g.fillStyle = '#e8d6a4'; g.beginPath(); g.ellipse(62, 380, 52, 77, 0, 0, 6.283); g.fill();
  let wg = g.createRadialGradient(56, 370, 10, 62, 380, 72); wg.addColorStop(0, '#62c0ec'); wg.addColorStop(1, '#2f86c2'); g.fillStyle = wg; g.beginPath(); g.ellipse(62, 380, 45, 70, 0, 0, 6.283); g.fill();
  // lago grande do sul
  g.fillStyle = '#e8d6a4'; g.beginPath(); g.ellipse(LAKE.x, LAKE.y, LAKE.rx + 12, LAKE.ry + 12, 0, 0, 6.283); g.fill();
  wg = g.createRadialGradient(LAKE.x - 40, LAKE.y - 30, 20, LAKE.x, LAKE.y, LAKE.rx); wg.addColorStop(0, '#6cc8f0'); wg.addColorStop(1, '#2a7fbf'); g.fillStyle = wg; g.beginPath(); g.ellipse(LAKE.x, LAKE.y, LAKE.rx, LAKE.ry, 0, 0, 6.283); g.fill();
  g.strokeStyle = '#4f9a2f'; g.lineWidth = 2.5; for (let i = 0; i < 40; i++) { const a = R() * 6.283, x = LAKE.x + Math.cos(a) * (LAKE.rx + 4), y = LAKE.y + Math.sin(a) * (LAKE.ry + 4); if (x < 660) continue; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 4, y - 12 - R() * 8); g.stroke(); }
  // chão do pomar e flores do apiário

  if (lands.sul) for (let i = 0; i < 140; i++) { const x = 40 + R() * 230, y = 1050 + R() * 230; g.fillStyle = ['#ffffff', '#ffd23f', '#ff8fb1', '#b48cff', '#ff6b5a'][i % 5]; for (let q = 0; q < 5; q++) { g.beginPath(); g.arc(x + Math.cos(q * 1.26) * 3, y + Math.sin(q * 1.26) * 3, 2.2, 0, 6.283); g.fill(); } g.fillStyle = '#ffd23f'; g.beginPath(); g.arc(x, y, 1.6, 0, 6.283); g.fill(); }
  // flores soltas
  for (let i = 0; i < 160; i++) { const x = R() * WW, y = R() * WH; if (x > 140 && x < 500 && y > 270 && y < 640) continue; if (Math.abs(x - 320) < 40 && y > 620) continue; if (Math.hypot((x - LAKE.x) / LAKE.rx, (y - LAKE.y) / LAKE.ry) < 1.15) continue;
    g.fillStyle = ['#ffffff', '#ffd23f', '#ff8fb1', '#b48cff'][i % 4]; for (let q = 0; q < 4; q++) { g.beginPath(); g.arc(x + Math.cos(q * 1.57) * 2.5, y + Math.sin(q * 1.57) * 2.5, 2, 0, 6.283); g.fill(); } }
  // pedras
  for (const [x, y, r] of [[630, 150, 9], [612, 980, 12], [1040, 980, 10], [470, 1010, 8], [1070, 460, 11]]) { g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.ellipse(x, y + 4, r * 1.2, r * 0.5, 0, 0, 6.283); g.fill(); g.fillStyle = '#a9a9a0'; g.beginPath(); g.ellipse(x, y, r, r * 0.75, 0, 0, 6.283); g.fill(); g.fillStyle = 'rgba(255,255,255,.3)'; g.beginPath(); g.ellipse(x - r * 0.3, y - r * 0.3, r * 0.4, r * 0.25, 0, 0, 6.283); g.fill(); }
  // terrenos à venda: mato fechado
  for (const [k, Ld] of Object.entries(LANDS)) if (!lands[k]) { const r = Ld.r; g.fillStyle = 'rgba(25,70,20,.42)'; rr(g, r.x, r.y, r.w, r.h, 26); g.fill();
    for (let i = 0; i < Math.round(r.w * r.h / 2600); i++) { const x = r.x + 20 + R() * (r.w - 40), y = r.y + 30 + R() * (r.h - 40); if (Math.hypot(x - Ld.sx, y - Ld.sy) < 90) continue; bush(g, x, y, 0.8 + R() * 0.7, '#2f6f22', '#3f8f2e'); }
    g.setLineDash([10, 8]); g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 3; rr(g, r.x, r.y, r.w, r.h, 26); g.stroke(); g.setLineDash([]); }
  // praia e mar no lado direito
  { const sg = g.createLinearGradient(1100, 0, 1500, 0); sg.addColorStop(0, 'rgba(240,222,170,0)'); sg.addColorStop(0.12, '#f2dfa8'); sg.addColorStop(1, '#f6e6b8'); g.fillStyle = sg; g.fillRect(1100, 0, 400, WH);
    const og = g.createLinearGradient(1400, 0, 1500, 0); og.addColorStop(0, '#5fc3e8'); og.addColorStop(1, '#2a8cc4'); g.fillStyle = og; g.beginPath(); g.moveTo(1500, 0); g.lineTo(1420, 0); for (let y = 0; y <= WH; y += 40) g.lineTo(1412 + Math.sin(y * 0.02) * 10, y); g.lineTo(1500, WH); g.closePath(); g.fill();
    for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(200,170,110,.35)'; g.beginPath(); g.arc(1130 + R() * 270, R() * WH, 1.5 + R() * 2, 0, 6.283); g.fill(); } }
  // avenida de pedra do bairro
  if (lands.bairro) { const st = (x, y, w, h) => { g.fillStyle = 'rgba(70,50,30,.25)'; g.fillRect(x - 3, y - 2, w + 6, h + 7); g.fillStyle = '#cdb88f'; g.fillRect(x, y, w, h);
      for (let yy = y + 2; yy < y + h - 4; yy += 10) for (let xx = x + 2 + ((yy / 10) % 2) * 4; xx < x + w - 6; xx += 11) { g.fillStyle = R() < 0.5 ? '#d9c6a0' : '#bfa67b'; rr(g, xx, yy, 8, 7, 2); g.fill(); }
      g.fillStyle = '#9c8762'; g.fillRect(x, y, w, 3); g.fillRect(x, y + h - 3, w, 3); };
    st(40, 2010, 1420, 48); st(298, 1690, 44, 320); st(1040, 2058, 44, 230); st(208, 2058, 44, 230);
    g.fillStyle = '#e3c58f'; g.beginPath(); g.ellipse(740, 2034, 70, 34, 0, 0, 6.283); g.fill(); g.strokeStyle = '#b8935a'; g.lineWidth = 6; g.stroke(); }
  // cerca em volta de tudo
  g.strokeStyle = '#a8743f'; g.lineWidth = 4; g.strokeRect(10, 24, WW - 20, WH - 34); g.fillStyle = '#8a5a2b';
  for (let x = 10; x <= WW - 10; x += 32) { g.fillRect(x - 3, 12, 6, 20); g.fillRect(x - 3, WH - 22, 6, 20); } for (let y = 24; y <= WH - 10; y += 32) { g.fillRect(4, y - 4, 12, 8); g.fillRect(WW - 16, y - 4, 12, 8); }
  return c;
}
function shadow(g, x, y, w) { const gr = g.createRadialGradient(x, y + 4, 2, x, y + 4, w / 2); gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y + 4, w / 2, w / 6, 0, 0, 6.283); g.fill(); }
function win(g, x, y, w, h) { g.fillStyle = '#7a4b25'; g.fillRect(x - 3, y - 3, w + 6, h + 6); const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, '#bfe9ff'); gr.addColorStop(1, '#6fb6e0'); g.fillStyle = gr; g.fillRect(x, y, w, h); g.fillStyle = '#7a4b25'; g.fillRect(x + w / 2 - 1.5, y, 3, h); g.fillRect(x, y + h / 2 - 1.5, w, 3); g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(x + 2, y + 2, w / 2 - 4, 3); }
function house(g, x, y, w, h, wall, roof, roofH = 40) {
  shadow(g, x, y, w + 40);
  const wg = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0); wg.addColorStop(0, wall); wg.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = wall; g.fillRect(x - w / 2, y - h, w, h); g.fillStyle = wg; g.fillRect(x - w / 2, y - h, w, h);
  g.fillStyle = 'rgba(0,0,0,.12)'; for (let yy = y - h + 12; yy < y; yy += 12) g.fillRect(x - w / 2, yy, w, 1.5);
  g.strokeStyle = 'rgba(40,20,5,.45)'; g.lineWidth = 2.5; g.strokeRect(x - w / 2, y - h, w, h);
  g.fillStyle = roof; g.beginPath(); g.moveTo(x - w / 2 - 12, y - h + 4); g.lineTo(x - w / 2 + 12, y - h - roofH); g.lineTo(x + w / 2 - 12, y - h - roofH); g.lineTo(x + w / 2 + 12, y - h + 4); g.closePath(); g.fill(); g.stroke();
  g.save(); g.clip(); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; for (let yy = y - h - roofH + 9; yy < y - h + 4; yy += 9) { g.beginPath(); g.moveTo(x - w, yy); g.lineTo(x + w, yy); g.stroke(); } g.restore();
  g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x - w / 2 + 12, y - h - roofH, w - 24, 5);
}
function tree(g, x, y, s, T) { shadow(g, x, y, 56 * s); g.fillStyle = '#6b4120'; g.fillRect(x - 4 * s, y - 24 * s, 8 * s, 24 * s); const sw = Math.sin(T * 1.2 + x) * 1.5;
  for (const [dx, dy, r, c] of [[0, -40, 23, '#367f27'], [-15, -30, 17, '#3f8f2e'], [15, -30, 17, '#3f8f2e'], [0, -50, 15, '#4aa236'], [-6, -56, 7, 'rgba(255,255,255,.18)']]) { g.fillStyle = c; g.beginPath(); g.arc(x + dx * s + sw, y + dy * s, r * s, 0, 6.283); g.fill(); } }
function palm(g, x, y, s, T) { shadow(g, x + 10 * s, y, 60 * s); const sw = Math.sin(T * 0.9 + x * 0.1) * 3 * s;
  g.strokeStyle = '#8a6a3a'; g.lineWidth = 7 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10 * s, y - 40 * s, x + 6 * s + sw, y - 78 * s); g.stroke();
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; for (let i = 1; i < 7; i++) { const t = i / 7, px = x + 10 * s * 2 * t * (1 - t) + (6 * s + sw) * t * t, py = y - 78 * s * t; g.beginPath(); g.moveTo(px - 3 * s, py); g.lineTo(px + 3 * s, py); g.stroke(); }
  const tx = x + 6 * s + sw, ty = y - 78 * s;
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.55 + Math.sin(T + i) * 0.04; g.fillStyle = i % 2 ? '#3f9a2f' : '#52b13c'; g.beginPath(); g.moveTo(tx, ty); g.quadraticCurveTo(tx + Math.cos(a - 0.3) * 30 * s, ty + Math.sin(a - 0.3) * 30 * s - 6 * s, tx + Math.cos(a) * 46 * s, ty + Math.sin(a) * 46 * s + 14 * s); g.quadraticCurveTo(tx + Math.cos(a + 0.3) * 24 * s, ty + Math.sin(a + 0.3) * 24 * s, tx, ty); g.fill(); }
  g.fillStyle = '#7a5a2a'; for (const [dx, dy] of [[-5, 4], [4, 5], [0, 9]]) { g.beginPath(); g.arc(tx + dx * s, ty + dy * s, 4.5 * s, 0, 6.283); g.fill(); } }
function fruitTree(g, k, x, y, ready, p, T) {
  if (k === 'coco') { palm(g, x, y, 1.3, T); const sw = Math.sin(T * 0.9 + x * 0.1) * 3 * 1.3, tx = x + 6 * 1.3 + sw, ty = y - 78 * 1.3; const n = ready ? 5 : Math.floor(p * 4);
    for (let i = 0; i < n; i++) { g.fillStyle = ready ? '#7a4b25' : '#8cc63f'; g.beginPath(); g.arc(tx + Math.cos(i * 1.3 + 1) * 9, ty + 8 + Math.sin(i * 1.3 + 1) * 6, 6, 0, 6.283); g.fill(); } return; }
  shadow(g, x, y, 90); g.fillStyle = '#6b4120'; g.fillRect(x - 6, y - 34, 12, 34); const sw = Math.sin(T + x) * 1.2;
  const c1 = k === 'laranja' ? '#2f7f26' : '#367f27', c2 = k === 'laranja' ? '#3d9a2f' : '#4aa236';
  for (const [dx, dy, r, c] of [[0, -62, 34, c1], [-24, -48, 24, c1], [24, -48, 24, c1], [0, -76, 24, c2], [-10, -84, 10, 'rgba(255,255,255,.15)']]) { g.fillStyle = c; g.beginPath(); g.arc(x + dx + sw, y + dy, r, 0, 6.283); g.fill(); }
  const n = ready ? 7 : Math.floor(p * 5); for (let i = 0; i < n; i++) { const fx = x + sw + Math.cos(i * 2.4) * (12 + (i % 3) * 8), fy = y - 60 + Math.sin(i * 2.4) * 18;
    if (k === 'laranja') { g.fillStyle = ready ? '#ff9a1f' : '#a8c94a'; g.beginPath(); g.arc(fx, fy, ready ? 6 : 4, 0, 6.283); g.fill(); }
    else { g.fillStyle = ready ? '#ff7a2f' : '#a8c94a'; g.beginPath(); g.ellipse(fx, fy, ready ? 5 : 3.5, ready ? 7 : 5, 0.4, 0, 6.283); g.fill(); } } }
function hive(g, x, y, T, ready) { shadow(g, x, y, 50); g.fillStyle = '#6b4120'; g.fillRect(x - 18, y - 6, 4, 8); g.fillRect(x + 14, y - 6, 4, 8);
  for (let i = 0; i < 3; i++) { g.fillStyle = i % 2 ? '#f2c14e' : '#e6a92a'; g.fillRect(x - 20, y - 18 - i * 14, 40, 14); g.strokeStyle = '#8a5a2b'; g.lineWidth = 2; g.strokeRect(x - 20, y - 18 - i * 14, 40, 14); }
  g.fillStyle = '#c9905a'; g.fillRect(x - 24, y - 52, 48, 8); g.fillStyle = '#3a2412'; g.fillRect(x - 5, y - 12, 10, 4);
  for (let i = 0; i < (ready ? 5 : 2); i++) { const a = T * (2 + i * 0.4) + i * 2, bx = x + Math.cos(a) * (18 + i * 4), by = y - 34 + Math.sin(a * 1.3) * 14; g.fillStyle = '#ffd23f'; g.beginPath(); g.ellipse(bx, by, 3.5, 2.5, 0, 0, 6.283); g.fill(); g.fillStyle = '#2b2b2b'; g.fillRect(bx - 1, by - 2.5, 1.5, 5); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.ellipse(bx, by - 3, 2.5, 1.5, 0, 0, 6.283); g.fill(); } }
function boatShape(g, x, y, s) { g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(x, y + 8 * s, 36 * s, 8 * s, 0, 0, 6.283); g.fill();
  g.fillStyle = '#b5523b'; g.beginPath(); g.moveTo(x - 36 * s, y - 6 * s); g.lineTo(x + 36 * s, y - 6 * s); g.lineTo(x + 26 * s, y + 8 * s); g.lineTo(x - 26 * s, y + 8 * s); g.closePath(); g.fill(); g.fillStyle = '#fff1d6'; g.fillRect(x - 34 * s, y - 8 * s, 68 * s, 4 * s);
  g.fillStyle = '#7a4b25'; g.fillRect(x - 2 * s, y - 46 * s, 4 * s, 40 * s); g.fillStyle = '#fff8e6'; g.beginPath(); g.moveTo(x + 2 * s, y - 44 * s); g.lineTo(x + 28 * s, y - 12 * s); g.lineTo(x + 2 * s, y - 12 * s); g.closePath(); g.fill(); g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 1.5; g.stroke(); }
function saleSign(g, x, y, k, S) { const Ld = LANDS[k]; shadow(g, x, y, 90); g.fillStyle = '#7a4b25'; g.fillRect(x - 4, y - 50, 8, 50);
  g.fillStyle = '#c9905a'; rr(g, x - 70, y - 104, 140, 62, 8); g.fill(); g.strokeStyle = '#7a4b25'; g.lineWidth = 4; g.stroke();
  g.fillStyle = '#fff'; g.font = '900 18px "Baloo 2", Nunito, sans-serif'; g.textAlign = 'center'; g.fillText(L('forSale'), x, y - 80);
  g.font = '900 12px Nunito, sans-serif'; g.fillText(S && Ld.lvl > S.lvl ? L('lvl', Ld.lvl) : '', x, y - 64); if (!S || Ld.lvl <= S.lvl) { g.drawImage(iconCanvas('coin'), x - 26, y - 76, 18, 18); g.fillText(String(Ld.cost), x + 6, y - 62); } }
const SPARK = [];
// explosão de partículas ao colher/recolher, na cor do produto
const ITEM_COL = { algodao: '#ffffff', tecido: '#7b5ea7', rede: '#e0533d', coco: '#7a4b25', trigo: '#f2c14e', milho: '#ffd23f', cenoura: '#ff8c1a', cana: '#7cc04b', ovo: '#fff3dc', leite: '#ffffff', laranja: '#ff9a1f', manga: '#ffb627', mel: '#ffb627', peixe: '#5aa9d6', coin: '#ffc23a' };
function burst(x, y, k) { const c = ITEM_COL[k] || '#ffd23f'; for (let i = 0; i < 16; i++) { const a = Math.random() * 6.283, v = 70 + Math.random() * 130; SPARK.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 90, t: 0, c: i % 3 ? c : (i % 2 ? '#8cc63f' : '#ffffff'), leaf: i % 3 === 0 }); } }
function drawDeco(g, k, x, y, T) {
  if (k === 'banco') { shadow(g, x, y, 70); g.fillStyle = '#6b4120'; g.fillRect(x - 26, y - 14, 5, 14); g.fillRect(x + 21, y - 14, 5, 14); g.fillStyle = '#a8743f'; for (let i = 0; i < 2; i++) g.fillRect(x - 30, y - 20 - i * 7, 60, 5); for (let i = 0; i < 2; i++) g.fillRect(x - 30, y - 38 - i * 7, 60, 5); g.fillStyle = '#6b4120'; g.fillRect(x - 28, y - 44, 4, 26); g.fillRect(x + 24, y - 44, 4, 26); }
  if (k === 'flores') { shadow(g, x, y, 70); g.fillStyle = '#8a5a33'; g.beginPath(); g.ellipse(x, y - 4, 32, 12, 0, 0, 6.283); g.fill(); g.strokeStyle = '#a9a9a0'; g.lineWidth = 4; g.stroke();
    for (let i = 0; i < 9; i++) { const fx = x - 24 + (i % 5) * 12, fy = y - 8 - Math.floor(i / 5) * 9 + Math.sin(T * 2 + i) * 1.2; g.strokeStyle = '#3f8f2e'; g.lineWidth = 2; g.beginPath(); g.moveTo(fx, fy + 8); g.lineTo(fx, fy); g.stroke(); g.fillStyle = ['#ff6b5a', '#ffd23f', '#ff8fb1', '#b48cff'][i % 4]; for (let q = 0; q < 5; q++) { g.beginPath(); g.arc(fx + Math.cos(q * 1.26) * 3.2, fy + Math.sin(q * 1.26) * 3.2, 2.6, 0, 6.283); g.fill(); } g.fillStyle = '#fff3b0'; g.beginPath(); g.arc(fx, fy, 1.8, 0, 6.283); g.fill(); } }
  if (k === 'espantalho') { shadow(g, x, y, 50); const sw = Math.sin(T * 1.5) * 0.05; g.save(); g.translate(x, y); g.rotate(sw); g.fillStyle = '#7a4b25'; g.fillRect(-3, -70, 6, 70); g.fillRect(-28, -54, 56, 5); g.fillStyle = '#4a6fa5'; g.fillRect(-14, -54, 28, 30);
    g.fillStyle = '#e0533d'; for (let i = -12; i < 14; i += 8) g.fillRect(i, -54, 3, 30); g.fillStyle = '#f2d06b'; for (const sx of [-30, 26]) { g.beginPath(); g.moveTo(sx, -52); g.lineTo(sx + 4, -44); g.lineTo(sx + 2, -56); g.fill(); }
    g.fillStyle = '#f6e7c1'; g.beginPath(); g.arc(0, -64, 10, 0, 6.283); g.fill(); g.fillStyle = '#3a2412'; g.fillRect(-5, -66, 3, 3); g.fillRect(2, -66, 3, 3); g.fillRect(-4, -60, 8, 2);
    g.fillStyle = '#c9902a'; g.beginPath(); g.ellipse(0, -73, 16, 4, 0, 0, 6.283); g.fill(); g.fillRect(-8, -84, 16, 11); g.restore(); }
  if (k === 'fonte') { shadow(g, x, y, 100); g.fillStyle = '#b9b9b0'; g.beginPath(); g.ellipse(x, y - 6, 42, 16, 0, 0, 6.283); g.fill(); g.fillStyle = '#5ab4e6'; g.beginPath(); g.ellipse(x, y - 9, 35, 11, 0, 0, 6.283); g.fill();
    g.fillStyle = '#a5a59c'; g.fillRect(x - 5, y - 40, 10, 32); g.fillStyle = '#b9b9b0'; g.beginPath(); g.ellipse(x, y - 40, 16, 6, 0, 0, 6.283); g.fill();
    for (let i = 0; i < 10; i++) { const ph = (T * 1.4 + i / 10) % 1, a = i * 0.63, r = ph * 20; g.fillStyle = `rgba(150,215,255,${1 - ph})`; g.beginPath(); g.arc(x + Math.cos(a) * r, y - 44 - Math.sin(ph * Math.PI) * 16 + ph * 26, 2.2, 0, 6.283); g.fill(); }
    g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 1.5; const rr2 = (T * 18) % 30; g.beginPath(); g.ellipse(x, y - 9, rr2, rr2 * 0.32, 0, 0, 6.283); g.stroke(); }
}
const DECO_URL = {};
function decoIcon(k) { if (!DECO_URL[k]) { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.translate(48, 82); g.scale(0.9, 0.9); drawDeco(g, k, 0, 0, 0); DECO_URL[k] = c.toDataURL(); } return DECO_URL[k]; }
function siloShape(g, x, y) { shadow(g, x, y, 70); const gr = g.createLinearGradient(x - 26, 0, x + 26, 0); gr.addColorStop(0, '#d9dcd6'); gr.addColorStop(0.5, '#ffffff'); gr.addColorStop(1, '#a9ada6'); g.fillStyle = gr; g.fillRect(x - 26, y - 92, 52, 92);
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; for (let yy = y - 80; yy < y; yy += 16) { g.beginPath(); g.moveTo(x - 26, yy); g.lineTo(x + 26, yy); g.stroke(); }
  g.fillStyle = '#b5523b'; g.beginPath(); g.ellipse(x, y - 92, 28, 10, 0, Math.PI, 0); g.lineTo(x + 28, y - 92); g.quadraticCurveTo(x, y - 128, x - 28, y - 92); g.fill(); g.fillStyle = '#7a4b25'; g.fillRect(x - 8, y - 24, 16, 24); g.strokeStyle = '#7a4b25'; g.lineWidth = 2; g.strokeRect(x - 26, y - 92, 52, 92); }
let SILO_URL = ''; function siloIcon() { if (!SILO_URL) { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.translate(48, 92); g.scale(0.62, 0.62); siloShape(g, 0, 0); SILO_URL = c.toDataURL(); } return SILO_URL; }
const BUTTER = Array.from({ length: 7 }, (_, i) => ({ x: 120 + i * 140, y: 160 + (i % 3) * 300, c: ['#ffd23f', '#ff8fb1', '#8fd3ff', '#ffffff'][i % 4], p: i * 1.7 }));
function butterflies(g, T) { for (const b of BUTTER) { const x = b.x + Math.sin(T * 0.4 + b.p) * 70, y = b.y + Math.sin(T * 0.7 + b.p * 2) * 40, f = Math.abs(Math.sin(T * 14 + b.p)) * 5 + 1; g.fillStyle = b.c; g.beginPath(); g.ellipse(x - f / 2 - 1, y, f, 4, 0, 0, 6.283); g.ellipse(x + f / 2 + 1, y, f, 4, 0, 0, 6.283); g.fill(); g.fillStyle = '#3a2412'; g.fillRect(x - 0.8, y - 3, 1.6, 6); } }
function cropPlant(g, k, st, x, y, T) {
  const sw = Math.sin(T * 2 + x * 0.3) * (st === 2 ? 2 : 1);
  if (st === 0) { g.fillStyle = '#6fd04a'; g.beginPath(); g.ellipse(x - 3 + sw, y - 4, 3, 6, -0.6, 0, 6.283); g.ellipse(x + 3 + sw, y - 4, 3, 6, 0.6, 0, 6.283); g.fill(); return; }
  if (st === 1) { g.strokeStyle = '#4aa236'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + sw, y - 14); g.stroke(); g.fillStyle = '#5cb844'; g.beginPath(); g.ellipse(x - 5 + sw, y - 9, 4, 8, -0.7, 0, 6.283); g.ellipse(x + 5 + sw, y - 11, 4, 8, 0.7, 0, 6.283); g.fill(); return; }
  if (k === 'trigo') { g.strokeStyle = '#c9902a'; g.lineWidth = 2; for (const d of [-4, 0, 4]) { g.beginPath(); g.moveTo(x + d, y); g.lineTo(x + d + sw, y - 20); g.stroke(); g.fillStyle = '#f2c14e'; g.beginPath(); g.ellipse(x + d + sw, y - 24, 3, 7, 0, 0, 6.283); g.fill(); } }
  if (k === 'milho') { g.fillStyle = '#4aa236'; g.beginPath(); g.moveTo(x - 6, y); g.quadraticCurveTo(x - 10 + sw, y - 20, x - 2 + sw, y - 34); g.lineTo(x + 2 + sw, y - 34); g.quadraticCurveTo(x + 10 + sw, y - 20, x + 6, y); g.fill(); g.fillStyle = '#ffd23f'; g.beginPath(); g.ellipse(x + 5 + sw, y - 18, 4, 9, 0.3, 0, 6.283); g.fill(); }
  if (k === 'cenoura') { g.fillStyle = '#4fae3a'; for (const a of [-0.6, 0, 0.6]) { g.beginPath(); g.ellipse(x + Math.sin(a) * 7 + sw, y - 12, 3, 9, a, 0, 6.283); g.fill(); } g.fillStyle = '#ff8c1a'; g.beginPath(); g.ellipse(x, y - 2, 6, 4, 0, 0, 6.283); g.fill(); }
  if (k === 'algodao') { g.strokeStyle = '#6b8f3a'; g.lineWidth = 2; for (const d of [-5, 0, 5]) { g.beginPath(); g.moveTo(x + d * 0.4, y); g.lineTo(x + d + sw, y - 18); g.stroke(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x + d + sw, y - 20, 4.5, 0, 6.283); g.arc(x + d + sw + 3, y - 18, 3.5, 0, 6.283); g.fill(); } }
  if (k === 'cana') { g.fillStyle = '#7cc04b'; for (const d of [-4, 3]) g.fillRect(x + d + sw * 0.5, y - 36, 4, 36); g.fillStyle = '#4f9a2f'; g.beginPath(); g.moveTo(x, y - 30); g.quadraticCurveTo(x + 14 + sw, y - 40, x + 18 + sw, y - 28); g.quadraticCurveTo(x + 10, y - 32, x, y - 26); g.fill(); }
}
function bubble(g, x, y, k, T, faded) { const b = Math.sin(T * 4) * 3; g.save(); g.globalAlpha = faded ? 0.6 : 1; g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y + b, 20, 0, 6.283); g.fill(); g.beginPath(); g.moveTo(x - 6, y + 16 + b); g.lineTo(x, y + 26 + b); g.lineTo(x + 6, y + 16 + b); g.fill(); g.drawImage(iconCanvas(k), x - 16, y - 16 + b, 32, 32); g.restore(); }
function progressBar(g, x, y, w, p) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x - w / 2, y, w, 8); g.fillStyle = '#5cc04a'; g.fillRect(x - w / 2 + 1, y + 1, (w - 2) * clamp(p, 0, 1), 6); }
function lockSign(g, x, y, l) { g.fillStyle = 'rgba(58,36,18,.85)'; g.fillRect(x - 40, y - 12, 80, 24); g.fillStyle = '#fff'; g.font = '900 13px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText(L('lvl', l), x, y + 5); }
const FLOAT = [];
function draw(T, dt) {
  const S = G.S, now = nowS(); applyLayout(S);
  cx.setTransform(DPR, 0, 0, DPR, 0, 0); cx.fillStyle = '#5aa83c'; cx.fillRect(0, 0, innerWidth, innerHeight);
  cx.setTransform(DPR * CAM.z, 0, 0, DPR * CAM.z, DPR * (innerWidth / 2 - CAM.x * CAM.z), DPR * (innerHeight / 2 - CAM.y * CAM.z));
  const lands = S ? S.land : {}, key = ['leste', 'sul', 'colina', 'vila', 'praia', 'bairro'].map(k => lands[k] ? 1 : 0).join(','); if (!BG || key !== BGKEY) { BG = makeBg(lands); BGKEY = key; } cx.drawImage(BG, 0, 0, WW, WH); if (S && (S.roads.length || G.road)) drawRoads(cx, S);
  const lvl = S ? S.lvl : 1;
  // lago com brilho
  cx.strokeStyle = 'rgba(255,255,255,.45)'; cx.lineWidth = 2; for (let i = 0; i < 3; i++) { const r = ((T * 12 + i * 20) % 60); cx.globalAlpha = 1 - r / 60; cx.beginPath(); cx.ellipse(62, 400, r * 0.6, r, 0, 0, 6.283); cx.stroke(); } cx.globalAlpha = 1;
  // casa, celeiro, moinho
  house(cx, HOUSE.x, HOUSE.y, HOUSE.w, HOUSE.h, '#fff1d6', '#d9614b'); cx.fillStyle = '#7a4b25'; cx.fillRect(HOUSE.x - 12, HOUSE.y - 40, 24, 40); cx.fillStyle = '#ffc23a'; cx.beginPath(); cx.arc(HOUSE.x + 6, HOUSE.y - 20, 2, 0, 6.283); cx.fill(); win(cx, HOUSE.x - 46, HOUSE.y - 66, 24, 20); win(cx, HOUSE.x + 22, HOUSE.y - 66, 24, 20);
  cx.fillStyle = '#b5523b'; cx.fillRect(HOUSE.x + 26, HOUSE.y - HOUSE.h - 52, 14, 26); for (let s2 = 0; s2 < 3; s2++) { const ph = (T * 0.4 + s2 / 3) % 1; cx.fillStyle = `rgba(255,255,255,${0.5 * (1 - ph)})`; cx.beginPath(); cx.arc(HOUSE.x + 33 + Math.sin(ph * 5) * 5, HOUSE.y - HOUSE.h - 58 - ph * 36, 5 + ph * 7, 0, 6.283); cx.fill(); }
  if (S) { cx.fillStyle = '#7a4b25'; cx.fillRect(HOUSE.x - 64, HOUSE.y + 8, 128, 22); cx.fillStyle = '#fff'; cx.font = '900 13px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(farmTitle(S).slice(0, 20), HOUSE.x, HOUSE.y + 24); }
  house(cx, BARN.x, BARN.y, BARN.w, BARN.h, '#d9483b', '#8a2a20', 46); cx.fillStyle = '#fff'; cx.fillRect(BARN.x - 22, BARN.y - 56, 44, 56); cx.strokeStyle = '#d9483b'; cx.lineWidth = 5; cx.beginPath(); cx.moveTo(BARN.x - 22, BARN.y - 56); cx.lineTo(BARN.x + 22, BARN.y); cx.moveTo(BARN.x + 22, BARN.y - 56); cx.lineTo(BARN.x - 22, BARN.y); cx.stroke();
  if (S && invCount(S) >= S.cap - 2) bubble(cx, BARN.x, BARN.y - 170, 'coin', T);
  const M = BUILD.moinho; shadow(cx, M.x, M.y, 90); cx.fillStyle = '#f2e3c6'; cx.beginPath(); cx.moveTo(M.x - 34, M.y); cx.lineTo(M.x - 22, M.y - M.h); cx.lineTo(M.x + 22, M.y - M.h); cx.lineTo(M.x + 34, M.y); cx.closePath(); cx.fill(); cx.strokeStyle = 'rgba(0,0,0,.2)'; cx.lineWidth = 2; cx.stroke();
  cx.fillStyle = '#b5523b'; cx.beginPath(); cx.moveTo(M.x - 28, M.y - M.h); cx.lineTo(M.x, M.y - M.h - 26); cx.lineTo(M.x + 28, M.y - M.h); cx.fill(); cx.fillStyle = '#7a4b25'; cx.fillRect(M.x - 10, M.y - 30, 20, 30);
  const spin = S && S.bld.moinho.q.some(j => j.s <= now && j.e > now) ? 3 : 0.6; cx.save(); cx.translate(M.x, M.y - M.h + 6); cx.rotate(T * spin);
  for (let i = 0; i < 4; i++) { cx.rotate(Math.PI / 2); cx.fillStyle = '#fff8e6'; cx.fillRect(4, -7, 58, 14); cx.strokeStyle = '#7a4b25'; cx.lineWidth = 2; cx.strokeRect(4, -7, 58, 14); } cx.fillStyle = '#7a4b25'; cx.beginPath(); cx.arc(0, 0, 7, 0, 6.283); cx.fill(); cx.restore();
  // árvores
  // lago grande: brilho e barco
  cx.strokeStyle = 'rgba(255,255,255,.4)'; cx.lineWidth = 2; for (let i = 0; i < 6; i++) { const x = LAKE.x - 150 + ((T * 14 + i * 60) % 300), y = LAKE.y - 60 + i * 22; cx.beginPath(); cx.moveTo(x, y); cx.quadraticCurveTo(x + 10, y - 4, x + 22, y); cx.stroke(); }
  for (const [x, y, s] of [[22, 150, 1], [222, 120, 0.8], [418, 118, 0.85], [618, 300, 1.1], [610, 420, 0.9], [26, 520, 0.9], [612, 900, 1], [24, 930, 1], [214, 960, 0.8], [430, 960, 0.8]]) tree(cx, x, y, s, T);
  for (const [x, y, s] of (lands.colina ? [[1060, 700, 1.1], [668, 990, 0.9], [520, 1000, 0.9], [1060, 1060, 1], [40, 1300, 0.9]] : [[700, 740, 1], [800, 700, 1.1], [940, 770, 0.9], [1050, 700, 1.15], [720, 930, 1], [880, 950, 0.95], [1030, 930, 1.05], [520, 1000, 0.9], [1060, 1060, 1], [40, 1300, 0.9]])) palm(cx, x, y, s, T);
  for (const [x, y, s] of [[660, 820, 1], [990, 850, 0.9], [580, 940, 0.8], [470, 700, 0.8]]) bush(cx, x, y, s);
  // árvores frutais (do pomar e as plantadas pela loja)
  if (S) treeList(S).forEach(tr => { const F = FRUIT[tr.k], p = clamp((now - tr.t) / (F.t * 1000), 0, 1), ready = p >= 1; cx.fillStyle = 'rgba(120,80,40,.22)'; cx.beginPath(); cx.ellipse(tr.x, tr.y, 46, 16, 0, 0, 6.283); cx.fill(); fruitTree(cx, tr.k, tr.x, tr.y, ready, p, T); if (ready) bubble(cx, tr.x + 34, tr.y - 110, tr.k, T); else progressBar(cx, tr.x, tr.y + 8, 60, p); });
  // terreno da colina: sorveteria
  if (lands.colina) {
    const B = BUILD.sorveteria, st = S.bld.sorveteria; house(cx, B.x, B.y, B.w, B.h, '#ffe4ee', '#ff7aa8', 30);
    cx.save(); for (let i = 0; i < 7; i++) { cx.fillStyle = i % 2 ? '#fff' : '#ff7aa8'; cx.beginPath(); cx.moveTo(B.x - B.w / 2 - 6 + i * (B.w + 12) / 7, B.y - B.h + 6); cx.lineTo(B.x - B.w / 2 - 6 + (i + 1) * (B.w + 12) / 7, B.y - B.h + 6); cx.lineTo(B.x - B.w / 2 - 6 + (i + 1) * (B.w + 12) / 7, B.y - B.h + 22); cx.quadraticCurveTo(B.x - B.w / 2 - 6 + (i + 0.5) * (B.w + 12) / 7, B.y - B.h + 30, B.x - B.w / 2 - 6 + i * (B.w + 12) / 7, B.y - B.h + 22); cx.closePath(); cx.fill(); } cx.restore();
    win(cx, B.x - 50, B.y - 54, 26, 20); win(cx, B.x + 24, B.y - 54, 26, 20); cx.fillStyle = '#7a4b25'; cx.fillRect(B.x - 13, B.y - 38, 26, 38);
    cx.save(); cx.translate(B.x + B.w / 2 - 6, B.y - B.h - 26); cx.scale(0.42, 0.42); cx.translate(-50, -50); drawIcon(cx, 'sorvete', 100); cx.restore();
    cx.fillStyle = '#7a4b25'; rr(cx, B.x - 58, B.y - B.h - 58, 116, 22, 6); cx.fill(); cx.fillStyle = '#fff'; cx.font = '900 12px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(N('sorveteria').toUpperCase(), B.x, B.y - B.h - 43);
    const j = st.q[0]; if (j) { if (j.e <= now) bubble(cx, B.x, B.y - B.h - 84, B.rec[j.r].o, T); else progressBar(cx, B.x, B.y + 10, 70, (now - j.s) / (j.e - j.s)); }
  } else saleSign(cx, LANDS.colina.sx, LANDS.colina.sy, 'colina', S);
  // terreno do pomar
  if (lands.leste) {
    const B = BUILD.sucos, st = S.bld.sucos; house(cx, B.x, B.y, B.w, B.h, '#fff4d6', '#ff9a1f', 34); win(cx, B.x - 54, B.y - 66, 26, 20); win(cx, B.x + 28, B.y - 66, 26, 20); cx.fillStyle = '#7a4b25'; cx.fillRect(B.x - 14, B.y - 42, 28, 42);
    cx.fillStyle = '#7a4b25'; rr(cx, B.x - 62, B.y - B.h - 34, 124, 22, 6); cx.fill(); cx.fillStyle = '#fff'; cx.font = '900 12px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(N('sucos').toUpperCase(), B.x, B.y - B.h - 19);
    const j = st.q[0]; if (j) { if (j.e <= now) bubble(cx, B.x, B.y - B.h - 64, B.rec[j.r].o, T); else progressBar(cx, B.x, B.y + 10, 70, (now - j.s) / (j.e - j.s)); }
  } else saleSign(cx, LANDS.leste.sx, LANDS.leste.sy, 'leste', S);
  // terreno do lago
  if (lands.sul) {
    HIVES.forEach(([x, y], i) => { const ready = hiveReady(S, i, now); hive(cx, x, y, T, ready); if (ready) bubble(cx, x, y - 84, 'mel', T); else progressBar(cx, x, y + 8, 44, (now - S.hives[i]) / (HIVE_T * 1000)); });
    cx.fillStyle = '#8a5a2b'; cx.fillRect(BOAT.x - 90, BOAT.y - 10, 100, 16); cx.fillStyle = '#a8743f'; for (let x = BOAT.x - 88; x < BOAT.x + 10; x += 12) cx.fillRect(x, BOAT.y - 10, 9, 16); cx.fillStyle = '#6b4120'; for (const x of [BOAT.x - 84, BOAT.x - 44, BOAT.x + 4]) cx.fillRect(x, BOAT.y + 4, 5, 12);
    const e = S.boat.e, out = e && e > now, bx = out ? LAKE.x + Math.cos(T * 0.3) * 120 : BOAT.x + 44, by = out ? LAKE.y + Math.sin(T * 0.3) * 50 : BOAT.y + 2;
    boatShape(cx, bx, by + Math.sin(T * 2) * 1.5, 1);
    if (!e) bubble(cx, BOAT.x + 44, BOAT.y - 76, 'milho', T, true); else if (!out) bubble(cx, BOAT.x + 44, BOAT.y - 76, 'peixe', T); else progressBar(cx, BOAT.x - 40, BOAT.y + 22, 70, 1 - (e - now) / (BOAT.t * 1000));
  } else saleSign(cx, LANDS.sul.sx, LANDS.sul.sy, 'sul', S);
  // a Vila: obras dos ajudantes e prédios que dão moedas
  if (lands.vila) {
    // praça com chafariz
    cx.fillStyle = '#5ab4e6'; cx.beginPath(); cx.ellipse(400, 1556, 24, 9, 0, 0, 6.283); cx.fill(); cx.strokeStyle = '#a9a9a0'; cx.lineWidth = 5; cx.stroke();
    for (let i = 0; i < 6; i++) { const ph = (T * 1.2 + i / 6) % 1; cx.fillStyle = `rgba(160,220,255,${1 - ph})`; cx.beginPath(); cx.arc(400 + Math.cos(i) * ph * 14, 1548 - Math.sin(ph * Math.PI) * 12, 2, 0, 6.283); cx.fill(); }
    for (const [k, P] of Object.entries(PROJ)) { if ((P.land || 'vila') !== 'vila') continue; const c = S.city[k];
      if (!c) { cx.fillStyle = 'rgba(140,100,55,.45)'; rr(cx, P.x - P.w / 2, P.y - 50, P.w, 54, 8); cx.fill(); cx.fillStyle = '#7a4b25'; for (const [dx, dy] of [[-P.w / 2, -50], [P.w / 2 - 4, -50], [-P.w / 2, 0], [P.w / 2 - 4, 0]]) cx.fillRect(P.x + dx, P.y + dy - 10, 4, 14);
        cx.fillStyle = 'rgba(58,36,18,.85)'; rr(cx, P.x - 62, P.y - 96, 124, 40, 8); cx.fill(); cx.fillStyle = '#fff'; cx.font = '900 13px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(N(k), P.x, P.y - 80); cx.font = '800 11px Nunito, sans-serif'; cx.fillText(P.lvl > S.lvl ? L('lvl', P.lvl) : L('build') + ' · ' + P.cost, P.x, P.y - 64); continue; }
      if (c.e > now) { const pr = clamp((now - c.s) / (c.e - c.s), 0, 1), hgt = P.h * (0.2 + 0.8 * pr); shadow(cx, P.x, P.y, P.w + 30);
        cx.fillStyle = '#e8d9b8'; cx.fillRect(P.x - P.w / 2 + 10, P.y - hgt, P.w - 20, hgt); cx.strokeStyle = '#b07a3a'; cx.lineWidth = 3;
        for (let x = P.x - P.w / 2; x <= P.x + P.w / 2; x += P.w / 4) { cx.beginPath(); cx.moveTo(x, P.y); cx.lineTo(x, P.y - P.h - 10); cx.stroke(); } for (let y = P.y - 20; y > P.y - P.h - 10; y -= 26) { cx.beginPath(); cx.moveTo(P.x - P.w / 2, y); cx.lineTo(P.x + P.w / 2, y); cx.stroke(); }
        cx.strokeStyle = '#e6a92a'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(P.x + P.w / 2 + 14, P.y); cx.lineTo(P.x + P.w / 2 + 14, P.y - P.h - 50); cx.lineTo(P.x - 10, P.y - P.h - 50); cx.stroke(); cx.lineWidth = 1.5; const sw = Math.sin(T * 1.5) * 8; cx.beginPath(); cx.moveTo(P.x + 6, P.y - P.h - 50); cx.lineTo(P.x + 6 + sw, P.y - P.h - 20); cx.stroke(); cx.fillStyle = '#7a4b25'; cx.fillRect(P.x + sw, P.y - P.h - 22, 12, 8);
        progressBar(cx, P.x, P.y + 10, 90, pr); continue; }
      if (k === 'pousada') { house(cx, P.x, P.y, P.w, P.h, '#fff4e0', '#2f8f8a', 40); for (const dx of [-60, -20, 20, 60]) win(cx, P.x + dx - 11, P.y - P.h + 14, 22, 18); for (const dx of [-60, 40]) win(cx, P.x + dx - 11, P.y - 52, 22, 18); cx.fillStyle = '#7a4b25'; cx.fillRect(P.x - 14, P.y - 42, 28, 42);
        cx.fillStyle = '#a8743f'; cx.fillRect(P.x - P.w / 2, P.y - P.h / 2 - 6, P.w, 6); for (let x = P.x - P.w / 2 + 6; x < P.x + P.w / 2; x += 12) cx.fillRect(x, P.y - P.h / 2 - 18, 3, 12); cx.fillRect(P.x - P.w / 2, P.y - P.h / 2 - 20, P.w, 3); }
      if (k === 'mercado') { house(cx, P.x, P.y, P.w, P.h, '#fff8e6', '#c8702a', 30); for (let i = 0; i < 8; i++) { cx.fillStyle = i % 2 ? '#fff' : '#3d9a2f'; cx.fillRect(P.x - P.w / 2 - 6 + i * (P.w + 12) / 8, P.y - 56, (P.w + 12) / 8, 16); }
        for (const [dx, it] of [[-50, 'laranja'], [-16, 'milho'], [18, 'cenoura'], [52, 'manga']]) { cx.fillStyle = '#a8743f'; cx.fillRect(P.x + dx - 14, P.y - 24, 28, 14); cx.drawImage(iconCanvas(it), P.x + dx - 11, P.y - 36, 22, 22); } }
      if (k === 'restaurante') { house(cx, P.x, P.y, P.w, P.h, '#ffe9d6', '#b5523b', 36); win(cx, P.x - 56, P.y - 70, 30, 24); win(cx, P.x + 26, P.y - 70, 30, 24); cx.fillStyle = '#7a4b25'; cx.fillRect(P.x - 14, P.y - 42, 28, 42); cx.fillStyle = '#b5523b'; cx.fillRect(P.x + 30, P.y - P.h - 50, 14, 30);
        for (let s2 = 0; s2 < 3; s2++) { const ph = (T * 0.5 + s2 / 3) % 1; cx.fillStyle = `rgba(255,255,255,${0.55 * (1 - ph)})`; cx.beginPath(); cx.arc(P.x + 37 + Math.sin(ph * 5) * 4, P.y - P.h - 56 - ph * 36, 5 + ph * 7, 0, 6.283); cx.fill(); }
        for (const dx of [-70, 70]) { cx.fillStyle = '#fff'; cx.beginPath(); cx.ellipse(P.x + dx, P.y + 16, 14, 6, 0, 0, 6.283); cx.fill(); cx.fillStyle = '#e0533d'; cx.beginPath(); cx.moveTo(P.x + dx, P.y - 14); cx.lineTo(P.x + dx - 16, P.y - 2); cx.lineTo(P.x + dx + 16, P.y - 2); cx.fill(); cx.fillStyle = '#7a4b25'; cx.fillRect(P.x + dx - 1, P.y - 2, 2, 18); } }
      cx.fillStyle = '#7a4b25'; rr(cx, P.x - 52, P.y - P.h - (k === 'pousada' ? 64 : 58), 104, 22, 6); cx.fill(); cx.fillStyle = '#fff'; cx.font = '900 12px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(N(k).toUpperCase(), P.x, P.y - P.h - (k === 'pousada' ? 49 : 43));
      if (rentNow(S, k, now) > 0) bubble(cx, P.x + P.w / 2 - 10, P.y - P.h - 70, 'coin', T); }
  } else saleSign(cx, LANDS.vila.sx, LANDS.vila.sy, 'vila', S);
  // espuma das ondas na beira do mar
  cx.strokeStyle = 'rgba(255,255,255,.75)'; cx.lineWidth = 3; for (let y = 20; y < WH; y += 60) { const off = Math.sin(T * 1.4 + y * 0.05) * 8; cx.beginPath(); cx.moveTo(1414 + off + Math.sin(y * 0.02) * 10, y); cx.quadraticCurveTo(1406 + off, y + 20, 1414 + off + Math.sin((y + 40) * 0.02) * 10, y + 40); cx.stroke(); }
  if (lands.praia) { const P = PROJ.escola, c = S.city.escola;
    if (!c) { cx.fillStyle = 'rgba(140,100,55,.35)'; rr(cx, P.x - P.w / 2, P.y - 50, P.w, 54, 8); cx.fill(); cx.fillStyle = 'rgba(58,36,18,.85)'; rr(cx, P.x - 70, P.y - 96, 140, 40, 8); cx.fill(); cx.fillStyle = '#fff'; cx.font = '900 13px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(N('escola'), P.x, P.y - 80); cx.font = '800 11px Nunito, sans-serif'; cx.fillText(P.lvl > S.lvl ? L('lvl', P.lvl) : L('build') + ' · ' + P.cost, P.x, P.y - 64); }
    else if (c.e > now) { const pr = clamp((now - c.s) / (c.e - c.s), 0, 1); cx.fillStyle = '#e8d9b8'; cx.fillRect(P.x - P.w / 2 + 10, P.y - P.h * (0.2 + 0.8 * pr), P.w - 20, P.h * (0.2 + 0.8 * pr)); cx.strokeStyle = '#b07a3a'; cx.lineWidth = 3; for (let x = P.x - P.w / 2; x <= P.x + P.w / 2; x += P.w / 4) { cx.beginPath(); cx.moveTo(x, P.y); cx.lineTo(x, P.y - P.h - 10); cx.stroke(); } progressBar(cx, P.x, P.y + 10, 90, pr); }
    else { house(cx, P.x, P.y, P.w, P.h, '#e9f8ff', '#2a8cc4', 34); win(cx, P.x - 60, P.y - 66, 26, 20); win(cx, P.x + 34, P.y - 66, 26, 20); cx.fillStyle = '#7a4b25'; cx.fillRect(P.x - 14, P.y - 42, 28, 42);
      // pipa de kite em cima do telhado (desenho próprio)
      const kx = P.x + Math.sin(T * 0.8) * 30, ky = P.y - P.h - 110 + Math.cos(T * 1.1) * 8; cx.strokeStyle = 'rgba(40,40,40,.6)'; cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(P.x + 40, P.y - P.h - 30); cx.lineTo(kx - 24, ky + 8); cx.moveTo(P.x + 40, P.y - P.h - 30); cx.lineTo(kx + 24, ky + 8); cx.stroke();
      cx.fillStyle = '#ffb627'; cx.beginPath(); cx.moveTo(kx - 34, ky + 10); cx.quadraticCurveTo(kx, ky - 22, kx + 34, ky + 10); cx.quadraticCurveTo(kx, ky - 6, kx - 34, ky + 10); cx.fill(); cx.strokeStyle = '#c96a0a'; cx.lineWidth = 2; cx.stroke();
      cx.fillStyle = '#7a4b25'; rr(cx, P.x - 64, P.y - P.h - 58, 128, 22, 6); cx.fill(); cx.fillStyle = '#fff'; cx.font = '900 12px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(N('escola').toUpperCase(), P.x, P.y - P.h - 43);
      if (rentNow(S, 'escola', now) > 0) bubble(cx, P.x + P.w / 2 - 10, P.y - P.h - 70, 'coin', T); } }
  else saleSign(cx, LANDS.praia.sx, LANDS.praia.sy, 'praia', S);
  // bairro: casas e lotes
  if (lands.bairro) { cx.save(); cx.translate(740, 2034); cx.fillStyle = '#9fd7f0'; cx.beginPath(); cx.ellipse(0, -2, 30, 12, 0, 0, 6.283); cx.fill(); cx.strokeStyle = 'rgba(255,255,255,.8)'; cx.lineWidth = 2; const fr = (T * 1.5) % 1; cx.beginPath(); cx.ellipse(0, -2, 8 + fr * 20, 3 + fr * 8, 0, 0, 6.283); cx.stroke(); cx.restore();
    LOTS.forEach(([hx, hy], i) => { const hm = S.homes[i];
      if (!hm) { cx.setLineDash([8, 6]); cx.strokeStyle = 'rgba(255,255,255,.6)'; cx.lineWidth = 3; rr(cx, hx - 62, hy - 70, 124, 70, 10); cx.stroke(); cx.setLineDash([]); if (i === S.homes.length) { cx.fillStyle = 'rgba(58,36,18,.8)'; rr(cx, hx - 50, hy - 48, 100, 26, 8); cx.fill(); cx.fillStyle = '#fff'; cx.font = '900 12px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(L('homeBuy') + ' ' + homeCost(i), hx, hy - 30); } return; }
      const [wl, rf] = HOME_COL[hm.st % HOME_COL.length]; house(cx, hx, hy, 100, 70, wl, rf, 30); cx.fillStyle = '#7a4b25'; cx.fillRect(hx - 10, hy - 32, 20, 32); win(cx, hx - 40, hy - 52, 20, 16); win(cx, hx + 20, hy - 52, 20, 16);
      cx.fillStyle = '#b5523b'; cx.fillRect(hx + 22, hy - 116, 10, 18); for (let k = 0; k < 4; k++) { cx.fillStyle = ['#ff8fb1', '#ffd23f', '#fff'][k % 3]; cx.beginPath(); cx.arc(hx - 46 + k * 9, hy - 2, 4, 0, 6.283); cx.fill(); }
      if (homeRent(S, i, now) > 0) bubble(cx, hx, hy - 140, 'coin', T); }); }
  if (lands.bairro) { for (let i = 0; i < FAIR.n; i++) { const x = fairX(i), y = FAIR.y, st = S.fair[i], col = ['#e0533d', '#3d7fd6', '#2f9e6e', '#e6a92a'][i];
      shadow(cx, x, y, 90); cx.fillStyle = '#a8743f'; cx.fillRect(x - 40, y - 34, 80, 34); cx.fillStyle = '#c99561'; cx.fillRect(x - 42, y - 38, 84, 8); cx.fillStyle = '#7a4b25'; cx.fillRect(x - 38, y - 86, 5, 52); cx.fillRect(x + 33, y - 86, 5, 52);
      for (let j = 0; j < 5; j++) { cx.fillStyle = j % 2 ? '#fff' : col; cx.beginPath(); cx.moveTo(x - 46 + j * 18.4, y - 86); cx.lineTo(x - 46 + (j + 1) * 18.4, y - 86); cx.lineTo(x - 46 + (j + 1) * 18.4, y - 74); cx.quadraticCurveTo(x - 46 + (j + 0.5) * 18.4, y - 66, x - 46 + j * 18.4, y - 74); cx.closePath(); cx.fill(); }
      cx.fillStyle = col; cx.fillRect(x - 46, y - 94, 92, 10);
      if (st) { for (let q = 0; q < Math.min(3, st.q); q++) cx.drawImage(iconCanvas(st.k), x - 34 + q * 22, y - 60, 24, 24); cx.fillStyle = '#fff'; cx.font = '900 11px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText('×' + st.q, x, y - 12); } }
    cx.fillStyle = '#7a4b25'; rr(cx, FAIR.x - 60, FAIR.y + 6, 120, 20, 6); cx.fill(); cx.fillStyle = '#fff'; cx.font = '900 11px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(L('fair').toUpperCase(), FAIR.x, FAIR.y + 20); }
  if (lands.bairro) for (const [k, V] of Object.entries(SERV)) { const x = V.x, y = V.y;
    if (!S.serv[k]) { cx.setLineDash([8, 6]); cx.strokeStyle = 'rgba(255,255,255,.6)'; cx.lineWidth = 3; rr(cx, x - 80, y - 90, 160, 90, 12); cx.stroke(); cx.setLineDash([]); cx.fillStyle = 'rgba(58,36,18,.8)'; rr(cx, x - 64, y - 58, 128, 26, 8); cx.fill(); cx.fillStyle = '#fff'; cx.font = '900 12px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(L('serv_' + k) + ' · ' + V.cost, x, y - 40); continue; }
    if (k === 'praca') { cx.fillStyle = '#e3c58f'; cx.beginPath(); cx.ellipse(x, y - 30, 90, 40, 0, 0, 6.283); cx.fill(); cx.strokeStyle = '#b8935a'; cx.lineWidth = 4; cx.stroke(); tree(cx, x - 70, y - 50, 0.7, T); tree(cx, x + 70, y - 50, 0.7, T);
      cx.fillStyle = '#fff8e6'; cx.fillRect(x - 34, y - 60, 68, 8); for (const dx of [-30, 30]) cx.fillRect(x + dx - 3, y - 92, 6, 34); cx.fillStyle = '#d9614b'; cx.beginPath(); cx.moveTo(x - 44, y - 90); cx.lineTo(x, y - 116); cx.lineTo(x + 44, y - 90); cx.closePath(); cx.fill();
      for (let i = 0; i < 3; i++) { const ph = (T * 0.7 + i / 3) % 1; cx.fillStyle = `rgba(80,50,30,${1 - ph})`; cx.font = '900 14px Nunito, sans-serif'; cx.fillText('♪', x - 10 + i * 12 + Math.sin(ph * 6) * 6, y - 120 - ph * 30); } }
    else { house(cx, x, y, 130, 84, '#ffffff', '#3fb37f', 30); cx.fillStyle = '#7a4b25'; cx.fillRect(x - 14, y - 40, 28, 40); win(cx, x - 52, y - 62, 24, 18); win(cx, x + 28, y - 62, 24, 18); cx.fillStyle = '#e0533d'; cx.fillRect(x - 5, y - 132, 10, 30); cx.fillRect(x - 15, y - 122, 30, 10); }
    cx.fillStyle = '#7a4b25'; rr(cx, x - 56, y + 6, 112, 20, 6); cx.fill(); cx.fillStyle = '#fff'; cx.font = '900 11px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(L('serv_' + k).toUpperCase(), x, y + 20); }
  else saleSign(cx, LANDS.bairro.sx, LANDS.bairro.sy, 'bairro', S);
  // canteiros
  for (let i = 0; i < MAXPLOTS; i++) {
    const r = plotRect(i), pl = S ? S.plots[i] : { c: null }, locked = !S || i >= S.np;
    if (!locked) { cx.fillStyle = '#6b4120'; rr(cx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, 12); cx.fill(); }
    cx.fillStyle = locked ? 'rgba(120,80,40,.25)' : '#8a5a33'; rr(cx, r.x, r.y, r.w, r.h, 10); cx.fill();
    if (!locked) { const sg = cx.createLinearGradient(0, r.y, 0, r.y + r.h); sg.addColorStop(0, 'rgba(255,255,255,.08)'); sg.addColorStop(1, 'rgba(0,0,0,.12)'); cx.fillStyle = sg; rr(cx, r.x, r.y, r.w, r.h, 10); cx.fill(); }
    if (locked) { if (S && i === S.np) { cx.fillStyle = '#fff'; cx.font = '900 13px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(L('buy'), r.x + r.w / 2, r.y + r.h / 2 - 2); cx.drawImage(iconCanvas('coin'), r.x + r.w / 2 - 22, r.y + r.h / 2 + 4, 16, 16); cx.fillText(plotCost(S.np), r.x + r.w / 2 + 8, r.y + r.h / 2 + 17); } continue; }
    cx.strokeStyle = '#6f4626'; cx.lineWidth = 3; for (let j = 0; j < 3; j++) { cx.beginPath(); cx.moveTo(r.x + 10, r.y + 16 + j * 20); cx.lineTo(r.x + r.w - 10, r.y + 16 + j * 20); cx.stroke(); }
    if (pl.c) { const c = CROPS[pl.c], p = clamp((now - pl.p) / (c.t * 1000), 0, 1), st = p >= 1 ? 2 : p < 0.35 ? 0 : 1;
      if (st === 2) { const pu = 0.5 + 0.5 * Math.sin(T * 4 + i), gl = cx.createRadialGradient(r.x + r.w / 2, r.y + r.h / 2, 6, r.x + r.w / 2, r.y + r.h / 2, r.w * 0.75); gl.addColorStop(0, `rgba(255,236,140,${0.35 + 0.25 * pu})`); gl.addColorStop(1, 'rgba(255,236,140,0)'); cx.fillStyle = gl; cx.fillRect(r.x - 20, r.y - 20, r.w + 40, r.h + 40); }
      for (let j = 0; j < 6; j++) cropPlant(cx, pl.c, st, r.x + 18 + (j % 3) * 30, r.y + 30 + Math.floor(j / 3) * 26, T);
      if (st < 2) progressBar(cx, r.x + r.w / 2, r.y + r.h - 6, 60, p);
      else if (Math.sin(T * 5 + i) > 0.6) { cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(r.x + r.w - 12, r.y + 10, 3, 0, 6.283); cx.fill(); } }
  }
  // padaria e queijaria
  for (const k of ['padaria', 'queijaria', 'tecelagem']) {
    const B = BUILD[k], locked = B.lvl > lvl, st = S && S.bld[k];
    cx.save(); if (locked) cx.globalAlpha = 0.55;
    house(cx, B.x, B.y, B.w, B.h, k === 'padaria' ? '#ffe2b0' : k === 'tecelagem' ? '#f3e9ff' : '#e6f2ff', k === 'padaria' ? '#c8702a' : k === 'tecelagem' ? '#7b5ea7' : '#3f8fd1', 34);
    cx.fillStyle = '#7a4b25'; cx.fillRect(B.x - 14, B.y - 40, 28, 40); win(cx, B.x - 48, B.y - 66, 26, 18); win(cx, B.x + 22, B.y - 66, 26, 18);
    cx.fillStyle = '#7a4b25'; cx.fillRect(B.x - 40, B.y - B.h - 30, 80, 20); cx.fillStyle = '#fff'; cx.font = '900 12px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(N(k).toUpperCase(), B.x, B.y - B.h - 16);
    cx.restore();
    if (locked) { lockSign(cx, B.x, B.y - 40, B.lvl); continue; }
    const j = st.q[0]; if (j) { if (j.e <= now) bubble(cx, B.x, B.y - B.h - 60, B.rec[j.r].o, T); else { progressBar(cx, B.x, B.y + 10, 70, (now - j.s) / (j.e - j.s)); if (k === 'padaria') for (let s = 0; s < 3; s++) { const ph = (T * 0.6 + s / 3) % 1; cx.fillStyle = `rgba(255,255,255,${0.6 * (1 - ph)})`; cx.beginPath(); cx.arc(B.x + 36 + Math.sin(ph * 6) * 4, B.y - B.h - 34 - ph * 40, 6 + ph * 8, 0, 6.283); cx.fill(); } } }
  }
  if (S) { const j = S.bld.moinho.q[0]; if (j) { if (j.e <= now) bubble(cx, M.x + 54, M.y - 140, BUILD.moinho.rec[j.r].o, T); else progressBar(cx, M.x, M.y + 10, 70, (now - j.s) / (j.e - j.s)); } }
  // prédios duplicados (desenho próprio: casinha nas cores do original, placa com número)
  if (S) for (const [k, B] of Object.entries(BUILD)) { if (!B.base || !dupOwned(S, B) || !S.land[B.land]) continue; const bk = B.base, [wall, roof] = DUP_COL[bk], st = S.bld[k];
    if (bk === 'moinho') { shadow(cx, B.x, B.y, 80); cx.fillStyle = wall; cx.beginPath(); cx.moveTo(B.x - 28, B.y); cx.lineTo(B.x - 18, B.y - 92); cx.lineTo(B.x + 18, B.y - 92); cx.lineTo(B.x + 28, B.y); cx.closePath(); cx.fill(); cx.strokeStyle = '#7a4b25'; cx.lineWidth = 3; cx.stroke();
      cx.fillStyle = roof; cx.beginPath(); cx.moveTo(B.x - 24, B.y - 92); cx.lineTo(B.x, B.y - 114); cx.lineTo(B.x + 24, B.y - 92); cx.fill(); cx.fillStyle = '#7a4b25'; cx.fillRect(B.x - 9, B.y - 26, 18, 26);
      const sp = st.q.some(j => j.s <= now && j.e > now) ? 3 : 0.6; cx.save(); cx.translate(B.x, B.y - 86); cx.rotate(T * sp + B.idx); for (let i = 0; i < 4; i++) { cx.rotate(Math.PI / 2); cx.fillStyle = '#fff8e6'; cx.fillRect(4, -6, 46, 12); cx.strokeStyle = '#7a4b25'; cx.lineWidth = 2; cx.strokeRect(4, -6, 46, 12); } cx.fillStyle = '#7a4b25'; cx.beginPath(); cx.arc(0, 0, 6, 0, 6.283); cx.fill(); cx.restore(); }
    else { house(cx, B.x, B.y, B.w, B.h, wall, roof, 30); cx.fillStyle = '#7a4b25'; cx.fillRect(B.x - 12, B.y - 36, 24, 36); win(cx, B.x - 44, B.y - 58, 22, 16); win(cx, B.x + 22, B.y - 58, 22, 16);
      cx.save(); cx.translate(B.x + B.w / 2 - 4, B.y - B.h - 20); cx.scale(0.34, 0.34); cx.translate(-50, -50); drawIcon(cx, B.rec[0].o, 100); cx.restore(); }
    const ty = bk === 'moinho' ? B.y + 14 : B.y - B.h - 52; cx.fillStyle = '#7a4b25'; rr(cx, B.x - 52, ty, 104, 20, 6); cx.fill(); cx.fillStyle = '#fff'; cx.font = '900 11px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(N(k).toUpperCase(), B.x, ty + 14);
    const j = st.q[0]; if (j) { if (j.e <= now) bubble(cx, B.x, B.y - B.h - 78, B.rec[j.r].o, T); else progressBar(cx, B.x, bk === 'moinho' ? B.y + 38 : B.y + 8, 64, (now - j.s) / (j.e - j.s)); } }
  // currais
  for (const k of ['galinheiro', 'estabulo']) {
    const P = PENS[k], R = penRect(P), locked = P.lvl > lvl, st = S && S.pens[k];
    cx.fillStyle = k === 'galinheiro' ? '#d9c08a' : '#8fcf62'; cx.fillRect(R.x, R.y, R.w, R.h);
    cx.strokeStyle = '#a8743f'; cx.lineWidth = 4; cx.strokeRect(R.x, R.y, R.w, R.h); cx.fillStyle = '#8a5a2b'; for (let x = R.x; x <= R.x + R.w; x += 30) { cx.fillRect(x - 3, R.y - 6, 6, 12); cx.fillRect(x - 3, R.y + R.h - 6, 6, 12); }
    house(cx, R.x + 36, R.y + 52, 52, 40, k === 'galinheiro' ? '#f2d38a' : '#c0583e', '#7a4b25', 20);
    if (locked) { cx.fillStyle = 'rgba(255,255,255,.35)'; cx.fillRect(R.x, R.y, R.w, R.h); lockSign(cx, P.x, P.y, P.lvl); continue; }
    (st ? st.a : [0, 0, 0].slice(0, P.count)).forEach((f, j) => {
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
  // silos
  if (S) for (let i = 0; i < S.silos; i++) siloShape(cx, SILOS[i].x, SILOS[i].y);
  // decorações
  if (S) for (const k of Object.keys(DECOS)) if (S.deco[k]) drawDeco(cx, k, DECOS[k].x, DECOS[k].y, T);
  // quadro de encomendas
  shadow(cx, BOARD.x, BOARD.y, 120); cx.fillStyle = '#8a5a2b'; cx.fillRect(BOARD.x - 50, BOARD.y - 20, 8, 24); cx.fillRect(BOARD.x + 42, BOARD.y - 20, 8, 24);
  cx.fillStyle = '#c9905a'; cx.fillRect(BOARD.x - 60, BOARD.y - BOARD.h, 120, 54); cx.strokeStyle = '#7a4b25'; cx.lineWidth = 4; cx.strokeRect(BOARD.x - 60, BOARD.y - BOARD.h, 120, 54);
  if (S) S.orders.forEach((o, i) => { const x = BOARD.x - 50 + i * 36, y = BOARD.y - BOARD.h + 6; cx.fillStyle = o.w > now ? 'rgba(255,255,255,.4)' : '#fff'; cx.fillRect(x, y, 30, 40); if (o.w <= now) { cx.drawImage(iconCanvas(o.it[0][0]), x + 3, y + 8, 24, 24); if (has(S, Object.fromEntries(o.it))) { cx.fillStyle = '#5cc04a'; cx.beginPath(); cx.arc(x + 26, y + 4, 6, 0, 6.283); cx.fill(); } } });
  cx.fillStyle = '#fff'; cx.font = '900 12px Nunito, sans-serif'; cx.textAlign = 'center'; cx.fillText(L('board'), BOARD.x, BOARD.y + 22);
  // modo mover: contornos do que pode ser arrastado
  if (S && G.edit) { cx.save(); cx.setLineDash([8, 6]); cx.lineWidth = 3; cx.strokeStyle = 'rgba(255,255,255,.9)';
    const box = (x, y, w, h, on) => { cx.strokeStyle = on ? '#ffc23a' : 'rgba(255,255,255,.9)'; rr(cx, x, y, w, h, 10); cx.stroke(); };
    for (const [k, B] of Object.entries(BUILD)) if ((!B.land || S.land[B.land]) && dupOwned(S, B)) { const r = bRect(B); box(r.x, r.y, r.w, r.h, G.dragPos && G.dragPos.k === k); }
    for (const [k, P] of Object.entries(PENS)) { const r = penRect(P); box(r.x - 4, r.y - 4, r.w + 8, r.h + 8, G.dragPos && G.dragPos.k === k); }
    for (const t of treeList(S)) { cx.beginPath(); cx.arc(t.x, t.y - 40, 50, 0, 6.283); cx.strokeStyle = 'rgba(255,255,255,.9)'; cx.stroke(); }
    if (S.land.sul) HIVES.forEach(([x, y]) => box(x - 28, y - 62, 56, 72));
    for (const [k, D] of Object.entries(DECOS)) if (S.deco[k]) box(D.x - 36, D.y - 80, 72, 88, G.dragPos && G.dragPos.k === 'd_' + k);
    const a = plotRect(0), b = plotRect(MAXPLOTS - 1); box(a.x - 8, a.y - 8, b.x + b.w - a.x + 16, b.y + b.h - a.y + 16, G.dragPos && G.dragPos.k === 'campo'); cx.restore(); }
  // nuvens (sombras passando)
  for (let i = 0; i < 5; i++) { const x = ((T * 10 + i * 300) % (WW + 300)) - 150, y = 180 + i * 260; cx.fillStyle = 'rgba(30,60,20,.08)'; cx.beginPath(); cx.ellipse(x, y, 90, 36, 0, 0, 6.283); cx.ellipse(x + 60, y + 10, 60, 28, 0, 0, 6.283); cx.fill();
    // a nuvem branca fica acima da sua sombra
    const ux = x + 70, uy = y - 150; cx.fillStyle = 'rgba(255,255,255,.42)'; cx.beginPath(); for (const [dx, dy, r] of [[0, 0, 40], [42, 6, 32], [-40, 8, 30], [18, -18, 30], [-14, -12, 26]]) { cx.moveTo(ux + dx + r, uy + dy); cx.arc(ux + dx, uy + dy, r, 0, 6.283); } cx.fill(); }
  for (let i = 0; i < 4; i++) { const bx = ((T * (40 + i * 6) + i * 340) % (WW + 200)) - 100, by = 120 + i * 330 + Math.sin(T * 0.8 + i) * 20, fl = Math.sin(T * 9 + i * 2) * 5;
    cx.strokeStyle = 'rgba(40,40,40,.75)'; cx.lineWidth = 2.2; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(bx - 9, by - fl); cx.quadraticCurveTo(bx - 4, by - 3, bx, by); cx.quadraticCurveTo(bx + 4, by - 3, bx + 9, by - fl); cx.stroke(); }
  // toques do amigo e seus
  for (const [pg, col] of [[G.partnerPing, '#9b5de5'], [G.myPing, '#ffb020']]) if (pg && Date.now() - pg[2] < 900) { const p = (Date.now() - pg[2]) / 900; cx.strokeStyle = col; cx.globalAlpha = 1 - p; cx.lineWidth = 4; cx.beginPath(); cx.arc(pg[0], pg[1], 10 + p * 26, 0, 6.283); cx.stroke(); cx.globalAlpha = 1; }
  // o Juca
  if (S && S.helper && S.helper.on) for (let hh = 0; hh < hCount(S); hh++) { const H = S.helper, working = H.until > now; AV.hs = AV.hs || []; const av = AV.hs[hh] = AV.hs[hh] || { x: HELPER_HOME.x + 40 + hh * 30, y: HELPER_HOME.y + 10, tx: 0, ty: 0, t: 0 };
    const pp = H.ps && H.ps[hh]; if (working && pp) { av.tx = pp[0] + hh * 6; av.ty = pp[1]; } else if (working && hh === 0) { av.tx = H.x; av.ty = H.y; } else { av.tx = HELPER_HOME.x + 40 + hh * 30; av.ty = HELPER_HOME.y + 10 + (hh % 2) * 14; } stepAv(av, dt); drawAv(cx, av, HELPER_NAMES[hh], HELPER_LOOKS[hh], T, false);
    if (!working) { cx.fillStyle = '#fff'; cx.strokeStyle = '#3a2412'; cx.lineWidth = 3; cx.font = '900 14px Nunito, sans-serif'; cx.textAlign = 'left'; const zz = 'z' + (Math.floor(T * 2) % 3 ? 'z' : '') + (Math.floor(T * 2) % 3 === 2 ? 'Z' : ''); cx.strokeText(zz, av.x + 12, av.y - 60); cx.fillText(zz, av.x + 12, av.y - 60); } }
  if (S && S.truck) { const e = (Date.now() - (S.truckAt || 0)) / 8000; if (e >= 1 || e < 0) drawTruck(cx, TRUCK.x, TRUCK.y, -1, T);
    else { const go = e < 0.5, q = go ? e * 2 : (1 - e) * 2, y = TRUCK.y + q * (1540 - TRUCK.y); drawTruck(cx, 382, y, go ? 1 : -1, T); } }
  // vizinhos
  if (S) { stepNpcs(S, dt); NPCS.list.slice().sort((a, b) => a.y - b.y).forEach(n => drawNpc(cx, n, T)); }
  // personagens
  if (S) { stepAv(AV.me, dt); const list = [[AV.me, ME.name, ME.look, true]]; if (AV.fr.on && G.mode !== 'solo') { stepAv(AV.fr, dt); list.push([AV.fr, AV.fr.name, AV.fr.look, false]); }
    list.sort((a, b) => a[0].y - b[0].y).forEach(([av, n, l, m]) => drawAv(cx, av, n, l, T, m)); }
  butterflies(cx, T);
  for (const p of SPARK) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.vx *= 0.98; cx.globalAlpha = Math.max(0, 1 - p.t / 1.2); cx.fillStyle = p.c; cx.beginPath(); if (p.leaf) cx.ellipse(p.x, p.y, 5, 2.5, p.t * 9, 0, 6.283); else cx.arc(p.x, p.y, 3.2 * (1 - p.t / 1.6), 0, 6.283); cx.fill(); } cx.globalAlpha = 1;
  for (let i = SPARK.length - 1; i >= 0; i--) if (SPARK[i].t > 1.2) SPARK.splice(i, 1);
  // ganhos flutuando
  for (const f of FLOAT) { f.t += dt; const p = f.t / 1.2; cx.globalAlpha = 1 - Math.max(0, p - 0.6) / 0.4; cx.drawImage(iconCanvas(f.k), f.x - 18, f.y - 30 - p * 50, 36, 36); cx.fillStyle = '#fff'; cx.strokeStyle = '#3a2412'; cx.lineWidth = 4; cx.font = '900 18px Nunito, sans-serif'; cx.textAlign = 'left'; cx.strokeText('+' + f.n, f.x + 18, f.y - 6 - p * 50); cx.fillText('+' + f.n, f.x + 18, f.y - 6 - p * 50); cx.globalAlpha = 1; }
  for (let i = FLOAT.length - 1; i >= 0; i--) if (FLOAT[i].t > 1.2) FLOAT.splice(i, 1);
  // noite: escurece e acende os postes; chuva
  if (S) { const nf = nightF(Date.now()); lamps(cx, S, nf, T); if (nf > 0) { cx.fillStyle = `rgba(18,26,74,${0.42 * nf})`; cx.fillRect(-600, -600, WW + 1200, WH + 1200); cx.save(); cx.globalCompositeOperation = 'lighter';
      for (const [x, y] of lampPts(S)) { const gl = cx.createRadialGradient(x, y - 56, 2, x, y - 40, 90); gl.addColorStop(0, `rgba(255,200,110,${0.55 * nf})`); gl.addColorStop(1, 'rgba(255,200,110,0)'); cx.fillStyle = gl; cx.fillRect(x - 90, y - 130, 180, 180); }
      cx.restore(); } }
  // luz de sol quente e vinheta suave, na tela
  cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (S && S.wx && S.wx.r > Date.now()) { cx.fillStyle = 'rgba(60,80,110,.16)'; cx.fillRect(0, 0, innerWidth, innerHeight); cx.strokeStyle = 'rgba(210,230,255,.55)'; cx.lineWidth = 1.5; cx.beginPath();
    for (let i = 0; i < 90; i++) { const x = ((i * 97.3 + T * 60) % (innerWidth + 60)) - 30, y = ((i * 57.1 + T * (520 + (i % 5) * 40)) % (innerHeight + 40)) - 20; cx.moveTo(x, y); cx.lineTo(x - 5, y + 16); } cx.stroke(); }
  const sun = cx.createRadialGradient(innerWidth * 0.2, -innerHeight * 0.1, 10, innerWidth * 0.2, -innerHeight * 0.1, innerHeight * 1.1); sun.addColorStop(0, 'rgba(255,236,170,.22)'); sun.addColorStop(1, 'rgba(255,236,170,0)'); cx.fillStyle = sun; cx.fillRect(0, 0, innerWidth, innerHeight);
  const vg = cx.createRadialGradient(innerWidth / 2, innerHeight / 2, Math.min(innerWidth, innerHeight) * 0.45, innerWidth / 2, innerHeight / 2, Math.max(innerWidth, innerHeight) * 0.8); vg.addColorStop(0, 'rgba(0,30,0,0)'); vg.addColorStop(1, 'rgba(0,30,0,.22)'); cx.fillStyle = vg; cx.fillRect(0, 0, innerWidth, innerHeight);
}
let last = performance.now(), TT = 0;
function frame(now) { requestAnimationFrame(frame); const dt = clamp((now - last) / 1000, 0, 0.05); last = now; TT += dt; try { draw(TT, dt); } catch (e) { console.error(e); } }
requestAnimationFrame(frame);
captureDefaults(); applyLang(); renderFarms();
