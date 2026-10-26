/* Kizuna Clash — festival tug-of-war engine, version 3 (sides 'a' and 'b').
   Two teams of yokai pull one rope. On your turn: summon as many yokai and play as many charms as your energy allows,
   send yokai to attack rival yokai, then HEAVE: every yokai that didn't attack pulls (plus whatever you add by tapping fast).
   The knot moves by (your pull − their grip). Pull it all the way to your side to win.
   Cards chain together: Combos reward a second card in the same turn, Bonds reward yokai who belong together,
   and many cards summon friends, silence, freeze, tax or weaken the rival.
   No luck: the only randomness is the shuffle (decks and the event schedule), seeded so online duels match. */
const GAME = (() => {
  const C = { WIN: 30, MAX_TURNS: 10, ENERGY_PLUS: 3, DRAW: 2, START_HAND: 5, HAND_MAX: 10, TEAM_MAX: 8, MAX_ENERGY: 10, GRIP: 1, ANCHOR: 3, DECK: 20, MAX_LEGENDS: 3, TAP_MAX: 5 };
  const TABLES = typeof KZ_YOKAI_TABLE !== 'undefined' ? { y: KZ_YOKAI_TABLE, c: KZ_CHARM_TABLE } : (() => { const d = require('./cards-data.js'); return { y: d.KZ_YOKAI_TABLE, c: d.KZ_CHARM_TABLE }; })();

  /* ---------- random (seeded) ---------- */
  function seeded(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
  }
  function shuffle(arr, rand) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ---------- types ---------- */
  const TYPES = { fire: { name: 'Fire', beats: 'wind' }, wind: { name: 'Wind', beats: 'water' }, water: { name: 'Water', beats: 'fire' } };
  const beats = (a, b) => TYPES[a] && TYPES[a].beats === b;
  const RARITY = { C: 'common', R: 'rare', E: 'epic', L: 'legend' };
  const RARITY_NAME = { common: 'Common', rare: 'Rare', epic: 'Epic', legend: 'Legend' };

  /* ---------- abilities: key or key:n; [name, text(n, card)] ---------- */
  const nm = id => (BY_ID[id] ? BY_ID[id].name : id);
  const list = ids => { const c = {}; for (const i of ids) c[i] = (c[i] || 0) + 1; const p = Object.entries(c).map(([i, n]) => (n > 1 ? `${n} ${nm(i)}` : nm(i))); return p.length > 1 ? p.slice(0, -1).join(', ') + ' and ' + p[p.length - 1] : p[0]; };
  const AB = {
    swift: ['Swift', () => 'Can attack on the turn it joins.'],
    guardian: ['Guardian', () => 'Rivals must attack a Guardian first.'],
    anchor: ['Anchor', () => `Grips the rope with ${C.ANCHOR} instead of ${C.GRIP}.`],
    rally: ['Rally', n => `Your other yokai get +${n} power.`],
    aura: ['Aura', (n, c) => `Your other ${TYPES[c.type].name} yokai get +${n} power.`],
    healer: ['Healer', n => `At the start of your turn, heal your yokai ${n}.`],
    regen: ['Regrow', n => `At the start of your turn, it heals ${n}.`],
    grow: ['Grow', n => `Gets +${n} power at the start of each of your turns.`],
    trick: ['Trick', () => 'Its attacks also lower the target\'s power by 1.'],
    hidden: ['Hidden', () => 'Can\'t be attacked or targeted until your next turn.'],
    bigpull: ['Big Pull', n => `Pulls with +${n} extra power.`],
    rebirth: ['Rebirth', () => 'When knocked out, it returns to your hand.'],
    ambush: ['Ambush', n => `When it joins: ${n} damage to the strongest rival yokai.`],
    snipe: ['Snipe', n => `When it joins: ${n} damage to the rival yokai with the least HP.`],
    burst: ['Gust', n => `When it joins: the knot moves ${n} toward you.`],
    hex: ['Hex', n => `When it joins: the strongest rival yokai loses ${n} power.`],
    thorns: ['Spiky', n => `When attacked, it deals ${n} damage to the attacker.`],
    scout: ['Scout', n => `When it joins: draw ${n === 1 ? 'a card' : n + ' cards'}.`],
    spark: ['Spark', n => `When it joins: +${n} energy right now.`],
    cleave: ['Sweep', () => 'Its attacks also deal 1 damage to every other rival yokai.'],
    twin: ['Twin Strike', () => 'Can attack twice each turn.'],
    momentum: ['Momentum', () => 'When it knocks out a yokai, the knot moves 2 toward you.'],
    stoneskin: ['Stone Skin', () => 'Takes 1 less damage from everything.'],
    finalpull: ['Last Heave', n => `When knocked out, the knot moves ${n} toward you.`],
    kin: ['Kin', () => '+1 power for each other yokai of its type on your team.'],
    ropespirit: ['Rope Spirit', () => 'Your team grips +2.'],
    pickpocket: ['Pickpocket', n => `When it joins: the rival gets ${n} less energy on their next turn.`],
    frost: ['Frost', () => 'The yokai it attacks can\'t pull or attack on its owner\'s next turn.'],
    charmer: ['Charmer', () => 'Your charms cost 1 less.'],
    loner: ['Lone Wolf', () => '+3 power while it is the only yokai on your team.'],
    underdog: ['Underdog', () => '+2 power while the knot is on the rival\'s side.'],
    dash: ['Dash', n => `Pulls +${n} on the turn it joins.`],
    gift: ['Parting Gift', n => `When knocked out, you draw ${n === 1 ? 'a card' : n + ' cards'}.`],
    summon: ['Summon', ids => `When it joins: summon ${list(ids)}.`],
    call: ['Call', n => `When it joins: summon the next yokai in your deck that costs ${n} or less.`],
    silence: ['Silence', () => 'When it joins: silence the strongest rival yokai (it loses its ability).'],
    tax: ['Toll', n => `When it joins: the rival's cards cost ${n} more on their next turn.`],
    sap: ['Slippery', n => `When it joins: the rival's next heave is ${n} weaker.`],
    sapaura: ['Heavy Air', n => `While it is on your rope, rival heaves are ${n} weaker.`],
    freeze: ['Freeze', () => 'When it joins: freeze the strongest rival yokai (it can\'t pull or attack next turn).'],
    whirl: ['Whirlpool', () => 'When it joins: send the weakest rival yokai back to its owner\'s hand.'],
    buffall: ['Inspire', n => `When it joins: your other yokai get +${n} power for the rest of the duel.`],
    healall: ['Soothe', n => `When it joins: heal all your yokai ${n}.`],
    discount: ['Bargain', n => `When it joins: your next card this turn costs ${n} less.`],
    cheer: ['Cheer', n => `When it joins: your heave this turn gets +${n}.`],
    frenzy: ['Frenzy', () => 'When it joins: +1 power for each other card you played this turn.'],
    barrier: ['Barrier', () => 'The first damage it would take is blocked.'],
    pierce: ['Pierce', () => 'Its attacks ignore Guardians and Hidden.'],
    curse: ['Curse', () => 'When knocked out by an attack, it freezes the attacker.'],
    legacy: ['Legacy', id => `When knocked out: summon ${nm(id)}.`],
    blessing: ['Blessing', () => 'When it joins: fully heal all your yokai.'],
    firestorm: ['Firestorm', n => `When it joins: ${n} damage to every rival yokai.`],
    overlord: ['Oni King', () => 'When it joins: knock out the weakest rival yokai.'],
    whirlwind: ['Whirlwind', () => 'When it joins: send the strongest rival yokai back to its owner\'s hand.'],
    ninetails: ['Nine Tails', () => '+1 power for each other yokai on your team.'],
    guide: ['Sunrise Guide', () => 'When it joins: all your yokai can attack this turn, even new ones and ones that already attacked.'],
    leviathan: ['Leviathan', () => 'Grips the rope with 5.'],
    muse: ['Muse', () => 'At the start of your turns: +1 energy.'],
    thunder: ['Thunderclap', () => 'When it joins: 3 damage to the two strongest rival yokai.'],
    harmony: ['Harmony', () => 'When it joins: the knot moves 2 toward you, or 5 if you are losing.'],
    sunfire: ['Sunfire', () => 'When it joins and at the start of your turns: 1 damage to every rival yokai.'],
    binding: ['Binding Rope', () => 'When it joins: the strongest rival yokai loses 2 power and can\'t pull on its next turn.'],
    fortress: ['Fortress', () => 'Grips with 3. Your whole team takes 1 less damage.'],
    treasure: ['Dragon Palace', () => 'When it joins: draw 2 cards and heal your team 3.'],
    westwind: ['White Wind', () => 'Can attack on the turn it joins, and twice each turn.'],
    moonreturn: ['Moon Return', () => 'When it joins: every rival yokai that costs 2 or less goes back to its owner\'s hand.'],
    sunrise: ['Sunrise', () => 'When she joins: fully heal your team, your other yokai get +1 power for the rest of the duel, and the knot moves 2 toward you.'],
    warlord: ['God of War', () => 'Your other yokai get +2 power and can attack on the turn they join.'],
    harvest: ['Rich Harvest', () => 'At the start of your turns: +2 energy and draw a card.'],
    bounty: ['Big Catch', () => 'When he joins: draw 3 cards, and your cards cost 1 less for the rest of this turn.'],
    eightheads: ['Eight Heads', () => 'Its attacks hit every rival yokai at once.'],
    flood: ['Great Flood', () => 'When it joins: every rival yokai with 4 HP or less goes back to its owner\'s hand.'],
    blizzard: ['Blizzard', () => 'When it joins: freeze every rival yokai.'],
    storm: ['Divine Storm', () => 'When he joins: 3 damage to every rival yokai.'],
    eclipse: ['Moonlit Silence', () => 'When he joins: silence every rival yokai.'],
    dawn: ['Dance of Dawn', () => 'When she joins: all your yokai can attack this turn, and your heave this turn gets +4.']
  };
  const JOIN = new Set(['ambush', 'snipe', 'burst', 'hex', 'scout', 'spark', 'pickpocket', 'summon', 'call', 'silence', 'tax', 'sap', 'freeze', 'whirl', 'buffall', 'healall', 'discount', 'cheer', 'frenzy',
    'blessing', 'firestorm', 'overlord', 'whirlwind', 'guide', 'thunder', 'harmony', 'sunfire', 'binding', 'treasure', 'moonreturn', 'sunrise', 'bounty', 'flood', 'blizzard', 'storm', 'eclipse', 'dawn', 'hidden']);
  const ARG_LIST = new Set(['summon']), ARG_ID = new Set(['legacy']);
  function parseAbs(s) {
    if (!s || s === '-') return [];
    return s.split(';').map(part => {
      let combo = false; if (part.startsWith('combo+')) { combo = true; part = part.slice(6); }
      const [k, arg] = part.split(':');
      const n = ARG_LIST.has(k) ? arg.split(',') : ARG_ID.has(k) ? arg : arg != null ? +arg : 1;
      return { k, n, combo };
    });
  }
  function abText(a, c) {
    const d = AB[a.k]; if (!d) return a.k;
    const t = d[1](a.n, c);
    return a.combo ? 'Combo: if you already played a card this turn, ' + t.replace(/^When (it|he|she) joins: /, '').replace(/^./, x => x.toLowerCase()) : t;
  }

  /* ---------- cards ---------- */
  const CARDS = [];
  for (const line of TABLES.y.trim().split('\n')) {
    const [id, name, type, cost, power, hp, ab, r, title] = line.split('|');
    CARDS.push({ id, name, kind: 'yokai', type, cost: +cost, power: +power, hp: +hp, abs: parseAbs(ab), rarity: RARITY[r], title });
  }
  for (const line of TABLES.c.trim().split('\n')) {
    const [id, name, cost, target, r, title, text] = line.split('|');
    CARDS.push({ id, name, kind: 'charm', type: 'charm', cost: +cost, target, rarity: RARITY[r], title, text, trap: id === 'ward' || id === 'spikes' || id === 'hitogata', abs: [] });
  }
  const BY_ID = Object.fromEntries(CARDS.map(c => [c.id, c]));
  CARDS.forEach((c, i) => { c.no = i + 1; c.ab = c.abs[0] ? c.abs[0].k : null; });
  const ONI = new Set(['akaoni', 'aoni', 'kooni', 'shuten', 'ibaraki', 'rikishi', 'namahage', 'korioni', 'ushioni', 'hannya', 'amanojaku', 'gozu', 'mezu']);

  /* ---------- Kizuna Bonds: yokai who belong together ---------- */
  const BONDS = [
    { id: 'oni', name: 'Oni Brothers', members: ['akaoni', 'aoni'], need: 2, power: 2, form: 'ambush:3' },
    { id: 'storm', name: 'Wind and Thunder', members: ['fujin', 'raijin'], need: 2, power: 2, form: 'burst:3' },
    { id: 'momotaro', name: "Momotaro's Band", members: ['momotaro', 'inu', 'saru', 'kiji'], need: 3, power: 1, form: 'burst:3;scout:1' },
    { id: 'lucky', name: 'Seven Lucky Gods', members: ['ebisu', 'benten', 'bishamon', 'hotei', 'fukurokuju', 'jurojin'], need: 3, power: 2, form: 'spark:3;scout:2' },
    { id: 'hell', name: 'Gates of the Underworld', members: ['gozu', 'mezu'], need: 2, power: 1, grip: 2, form: 'freeze2' },
    { id: 'oe', name: 'Mount Oe Gang', members: ['shuten', 'ibaraki'], need: 2, power: 2, form: 'firestorm:3' },
    { id: 'raiko', name: "Raiko's Heroes", members: ['raiko', 'kintaro', 'kuma'], need: 2, power: 1, form: 'ambush:4' },
    { id: 'bridge', name: 'Gojo Bridge', members: ['benkei', 'ushiwaka'], need: 2, power: 2, form: 'guide' },
    { id: 'palace', name: 'Dragon Palace', members: ['urashima', 'kame', 'otohime', 'ryujin'], need: 2, power: 1, form: 'scout:2;healall:3' },
    { id: 'izanagi', name: 'Children of Izanagi', members: ['amaterasu', 'tsukuyomi', 'susanoo'], need: 2, power: 3, form: 'burst:4' },
    { id: 'kappa', name: 'Kappa River', members: ['kappa', 'kawataro', 'kyuri'], need: 2, power: 1, form: 'healall:3' },
    { id: 'cats', name: 'Cat Clan', members: ['nekomata', 'bakeneko', 'kasha', 'manekineko', 'nekomusume'], need: 3, power: 1, form: 'spark:2' },
    { id: 'fox', name: 'Fox Shrine', members: ['kitsune', 'kitsunebi', 'kyubi', 'inari', 'tenko', 'kitsuneyome'], need: 3, power: 1, form: 'scout:2' },
    { id: 'tengu', name: 'Tengu Mountain', members: ['tengu', 'karasutengu', 'kotengu', 'sojobo'], need: 2, power: 1, form: 'firestorm:2' },
    { id: 'long', name: 'Long Arms and Long Legs', members: ['tenaga', 'ashinaga'], need: 2, power: 3, form: 'burst:2' },
    { id: 'snow', name: 'Snow Country', members: ['yukionna', 'yukinko', 'yukiusagi', 'yukidaruma', 'tsurara', 'korioni', 'kuraokami'], need: 3, power: 1, form: 'blizzard' },
    { id: 'guardians', name: 'Four Guardians', members: ['suzaku', 'genbu', 'byakko', 'kirin'], need: 2, power: 2, form: 'firestorm:3' },
    { id: 'dance', name: 'Festival Dancers', members: ['awaodori', 'yosakoi', 'uzume', 'shishimai', 'renjishi'], need: 2, power: 1, form: 'cheer:4;spark:1' },
    { id: 'bugs', name: 'Summer Bugs', members: ['hotaru', 'semi', 'suzumushi', 'tombo', 'kabutomushi', 'kuwagata', 'chou', 'hachi', 'kamakiri', 'ari'], need: 3, power: 1, form: 'scout:1' },
    { id: 'food', name: 'Food Stall Row', members: ['takoyaki', 'yakisoba', 'okonomi', 'ramen', 'yakitori', 'gyoza', 'taiyakun', 'yakiimo', 'dorayaki', 'tenpura', 'senbei', 'yatai'], need: 3, power: 1, form: 'healall:3' },
    { id: 'lantern', name: 'Lantern Night', members: ['chochin', 'andon', 'toro', 'rosoku', 'kagaribi', 'nebuta', 'hitodama'], need: 3, power: 1, form: 'firestorm:2' },
    { id: 'sky', name: 'Summer Sky', members: ['tsuru', 'suzume', 'kiji', 'uguisu', 'tsubame', 'hibari', 'washi', 'kamome', 'kawasemi'], need: 3, power: 1, form: 'burst:2' },
    { id: 'tsukumo', name: 'Tsukumogami', members: ['karakasa', 'bakezori', 'ittanmomen', 'koto', 'biwa', 'kyorinrin', 'chochin', 'oboroguruma'], need: 3, power: 1, form: 'silence' },
    { id: 'deep', name: 'Deep Sea', members: ['same', 'isonade', 'shachi', 'maguro', 'iruka', 'anko', 'ika', 'tako'], need: 3, power: 1, form: 'firestorm:2' }
  ];
  for (const b of BONDS) { b.formAbs = parseAbs(b.form.replace('freeze2', 'freeze;freeze')); for (const id of b.members) { const c = BY_ID[id]; if (c) (c.bonds = c.bonds || []).push(b.id); } }
  const BOND_BY = Object.fromEntries(BONDS.map(b => [b.id, b]));
  const bare = t => t.replace(/^When (it|he|she) joins: /, '').replace(/\.$/, '').replace(/^./, x => x.toLowerCase());
  const bondFx = b => (b.form === 'freeze2' ? 'freeze the two strongest rival yokai' : b.formAbs.map(a => bare(abText(a, { type: 'fire' })).replace(/ \(it [^)]*\)/, '')).join(', and '));
  const bondText = b => `${b.name}: ${b.need === b.members.length ? b.members.map(nm).join(' + ') : `any ${b.need} of ${b.members.map(nm).join(', ')}`}. Together they get +${b.power} power${b.grip ? ` and +${b.grip} grip` : ''}. When the Bond forms: ${bondFx(b)}.`;
  /* card text: "When it joins" abilities are merged into one sentence */
  function cardText(c) {
    if (!c.abs.length) return 'No ability, just big and strong.';
    const out = []; let joinPart = null;
    for (const a of c.abs) {
      const t = abText(a, c);
      if (!a.combo && /^When (it|he|she) joins: /.test(t)) { if (joinPart) { joinPart.t = joinPart.t.replace(/\.$/, '') + ', and ' + bare(t) + '.'; continue; } joinPart = { t }; out.push(joinPart); }
      else out.push({ t });
    }
    return out.map(x => x.t).join(' ');
  }
  for (const c of CARDS) if (c.kind === 'yokai') c.text = cardText(c);

  /* the 20% you own from the start, and the first deck built from them */
  const STARTER = ['hinotama', 'chochin', 'kasha', 'akaoni', 'yakiimo', 'taiyakun', 'hozuki', 'takoyaki', 'saru', 'hagoita', 'enenra', 'kooni', 'inu', 'gyoza', 'hinoko', 'tenpura', 'dorayaki', 'onibi', 'rosoku', 'hibachi', 'senko', 'kagaribi', 'kuma', 'inoshishi',
    'kappa', 'kingyo', 'kawauso', 'kani', 'kurage', 'uni', 'same', 'ebi', 'medaka', 'kaeru', 'issunboshi', 'kamo', 'ayu', 'iwashi', 'shizuku', 'awa', 'zarigani', 'kyuri', 'sushi', 'kurione', 'azarashi',
    'kodama', 'tanuki', 'karakasa', 'kamaitachi', 'suzume', 'hotaru', 'tombo', 'hachi', 'kiji', 'momiji', 'takenoko', 'kotengu', 'tsubame', 'hibari', 'risu', 'ari', 'momo', 'inazuma', 'kamakiri',
    'drum', 'firecracker', 'onigiri', 'chime', 'dango', 'abura', 'bento', 'mochitsuki', 'kunai', 'inarizushi', 'yoyo'];
  const STARTER_DECK = ['hinotama', 'kasha', 'akaoni', 'inu', 'saru', 'gyoza', 'kuma', 'kappa', 'kawauso', 'kani', 'same', 'iwashi', 'kamaitachi', 'kiji', 'tombo', 'hachi', 'drum', 'firecracker', 'mochitsuki', 'abura'];

  function deckProblem(deck) {
    if (!Array.isArray(deck)) return 'No deck.';
    if (deck.length !== C.DECK) return `A deck needs exactly ${C.DECK} cards (this one has ${deck.length}).`;
    if (new Set(deck).size !== deck.length) return 'Each card can only be in a deck once.';
    if (deck.some(id => !BY_ID[id])) return 'This deck has an unknown card.';
    if (deck.filter(id => BY_ID[id].rarity === 'legend').length > C.MAX_LEGENDS) return `A deck can hold at most ${C.MAX_LEGENDS} Legends.`;
    if (deck.filter(id => BY_ID[id].kind === 'yokai').length < 8) return 'A deck needs at least 8 yokai to pull the rope.';
    return null;
  }
  /* a rough value for the deck builder */
  const AB_VALUE = { swift: 0.6, guardian: 0.8, anchor: 1.1, rally: 1.4, aura: 1, healer: 0.8, regen: 0.5, grow: 1.1, trick: 0.4, hidden: 0.5, bigpull: 0.6, rebirth: 1, ambush: 0.5, snipe: 0.5, burst: 0.7,
    hex: 0.5, thorns: 0.3, scout: 1, spark: 0.9, cleave: 1.1, twin: 1, momentum: 1, stoneskin: 0.8, finalpull: 0.4, kin: 0.9, ropespirit: 1.3, pickpocket: 0.8, frost: 0.8, charmer: 0.6,
    loner: 0.3, underdog: 0.8, dash: 0.4, gift: 0.5, summon: 1.4, call: 1.2, silence: 1, tax: 0.7, sap: 0.4, sapaura: 1.2, freeze: 1, whirl: 1.2, buffall: 1.5, healall: 0.4, discount: 0.5,
    cheer: 0.5, frenzy: 0.8, barrier: 0.8, pierce: 0.6, curse: 0.6, legacy: 1 };
  function cardScore(c) {
    if (c.kind === 'charm') return { common: 2.2, rare: 2.7, epic: 3.3 }[c.rarity] || 2.5;
    const ab = c.abs.reduce((x, a) => x + (AB_VALUE[a.k] != null ? AB_VALUE[a.k] * (typeof a.n === 'number' && a.n > 1 ? 0.6 + 0.4 * a.n : 1) * (a.combo ? 0.7 : 1) : 2.5), 0);
    return (c.power * 1.1 + c.hp * 0.45 + ab) / (c.cost + 1.4) * 3 + ({ epic: 0.4, legend: 0.8 }[c.rarity] || 0);
  }
  /* how often decks with each card won in simulated duels (used by the masters' deck builder) */
  const RATING = Object.fromEntries('sojobo:76 urashima:69 momotaro:66 hakucho:65 kawataro:64 bishamon:64 suzaku:63 seimei:62 susanoo:62 fudo:61 karyu:60 ibaraki:59 shuten:59 gama:59 otohime:59 raijin:59 shishimai:58 kuraokami:58 tsukuyomi:58 orochi:58 usagi:58 fujin:58 aoni:58 isonade:58 bakeneko:58 shachi:57 sakura:57 tatsumaki:57 ari:57 tsurube:57 amaterasu:57 kajiya:56 byakko:56 kawaakago:56 yamauba:56 benkei:55 bakekujira:55 namahage:55 akaoni:55 chochin:55 kyubi:55 ushioni:55 akabeko:55 yosakoi:54 takenoko:54 kani:54 iwashi:54 okonomi:54 daidarabotchi:54 bell:54 kamome:54 semi:54 wakame:54 namazu:54 ebisu:53 oboroguruma:53 yadokari:53 iruka:53 jinrikisha:53 ayu:53 amabie:53 bakekani:53 mikoshi:53 abura:53 umibozu:53 hinezumi:53 tanpopo:53 genbu:53 hiwatari:53 gozu:53 kitsuneyome:53 hitotsume:53 amefuri:53 shirasagi:53 karasutengu:53 sanshouo:53 uguisu:53 daruma:53 otamajakushi:53 risu:53 shinobi:52 horagai:52 bakezori:52 korioni:52 oshidori:52 shoki:52 uchide:52 kagutsuchi:52 kaguya:52 nekomusume:52 kame:52 kamo:52 uzumaki:52 tea:52 hachi:52 rokurokubi:52 taiko:52 kaminari:52 tsuchigumo:52 hikeshi:52 hasu:52 kiji:52 hikyaku:52 okuribi:51 hinoko:51 momiji:51 kamado:51 inugami:51 yoyo:51 ema:51 ameonna:51 ward:51 kuma:51 akaei:51 andon:51 yatai:51 tsubame:51 raiko:51 onibi:51 kawasemi:51 shizuku:51 hotei:51 shachihoko:51 koinobori:51 mukade:51 ryujin:51 anko:51 hanabidama:51 tako:51 kamakiri:51 senko:51 tenpura:51 suiko:51 ayakashi:51 funayurei:51 kitsunebi:51 hannya:51 tengu:51 kasha:51 hinotama:51 yukiusagi:51 kagaribi:51 ika:51 yukidaruma:51 fan:51 kyuri:51 komainu:50 tanishi:50 oniyuri:50 dango:50 kingyo:50 nue:50 niji:50 kemari:50 bucket:50 same:50 hoo:50 taiyakun:50 dorayaki:50 spikes:50 headband:50 yukinko:50 kodama:50 tanuki:50 baku:50 zashiki:50 kogarashi:50 kappa:50 mochitsuki:50 himawari:50 kurage:50 kazaguruma:50 kirin:50 rosoku:50 kamifusen:50 terubozu:50 ramen:50 ramune:50 komori:50 hitogata:50 nurikabe:50 hakuryu:50 hamaya:50 inari:50 taki:50 yukionna:50 enenra:50 origami:50 awaodori:50 yakiimo:50 tsurara:50 tsuru:50 hagoita:49 goemon:49 kintaro:49 torii:49 rocket:49 kazekozo:49 hozuki:49 kooni:49 zarigani:49 tsuchinoko:49 mizuchi:49 lantern:49 sushi:49 momo:49 hyottoko:49 saru:49 firecracker:49 ikura:49 dorotabo:49 koto:49 wasshoi:49 manekineko:49 pengin:49 tatsunoko:49 momonga:49 yakko:49 yatagarasu:49 kintsugi:49 rikishi:49 togarashi:49 kotengu:49 kamaitachi:49 nureonna:49 kagami:49 umeboshi:49 koi:49 taru:49 kokeshi:49 uni:49 inu:49 hitodama:48 sparkler:48 kitsune:48 kyorinrin:48 rope:48 benten:48 ittanmomen:48 taketombo:48 fuin:48 kaeru:48 senbei:48 fukurou:48 otafuku:48 hakutaku:48 kawauso:48 umiushi:48 nekomata:48 tennyo:48 dohyo:48 kakigori:48 karakuri:48 uzume:48 kanashibari:48 omatsuri:48 takoyaki:48 washi:48 medaka:48 yukata:48 kanzashi:48 niwatori:48 suzume:48 susuki:48 whistle:48 okami:48 yakisoba:48 onsen:48 kumo:48 amanojaku:48 nebuta:48 awa:48 inarizushi:48 bunbuku:48 kuwagata:48 tenko:48 hotaru:48 kotatsu:48 kiyohime:48 gyoza:48 tora:47 otedama:47 chime:47 biwa:47 fukurokuju:47 sango:47 tenaga:47 hamaguri:47 ebi:47 musubi:47 yamabiko:47 suika:47 sazae:47 furaribi:47 inoshishi:47 drum:47 ashika:47 ama:47 inazuma:47 mujina:47 kusudama:47 tenugui:47 hinoenma:47 ajisai:47 kabutomushi:47 geta:46 basan:46 sekisho:46 suzumushi:46 omamori:46 bigkite:46 shuriken:46 ojizo:46 kurione:46 shimaenaga:46 kotodama:46 karakasa:46 mamemaki:46 unagi:46 mask:46 kakashi:46 hibari:46 kagebunshin:46 ningyo:46 net:46 jurojin:46 hitode:46 kiri:46 kijimuna:46 issunboshi:46 mezu:46 onigiri:46 rakko:46 nisshoku:46 toro:45 gong:45 taiyaki:45 koma:45 tombo:45 kuchiyose:45 wanyudo:45 senbazuru:45 umihebi:45 bento:45 shika:45 azarashi:45 kunai:45 yakitori:45 chou:45 fuji:45 shikigami:45 tai:45 nopperabo:45 fugu:45 maguro:45 kendama:44 ushiwaka:44 renjishi:44 toronagashi:44 hibashi:44 mizugumo:44 tenguuchiwa:44 kemuridama:44 hotate:44 saisen:44 shojo:43 raiju:43 scroll:43 taifu:43 tsunami:43 hibachi:43 tanzaku:43 ashinaga:43 suijin:41 takarabune:41'.split(' ').map(x => { const [id, w] = x.split(':'); return [id, +w]; }));
  function buildDeck(pool, opts = {}) {
    const type = opts.type, splash = opts.splash, size = opts.size || C.DECK, curve = { 1: 4, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 };
    const base = c => (RATING[c.id] != null && !opts.plain ? (RATING[c.id] - 50) * 0.6 + cardScore(c) * 0.3 : cardScore(c));
    const prefer = c => base(c) + (type && c.type === type ? 3 : 0) + (splash && c.type === splash ? 1 : 0) + (type && c.kind === 'yokai' && c.type !== type && c.type !== splash ? -2 : 0);
    const cards = pool.map(id => BY_ID[id]).filter(Boolean).sort((a, b) => prefer(b) - prefer(a) || a.no - b.no);
    const deck = [], have = {};
    let legends = 0, charms = 0, splashes = 0;
    const take = c => { deck.push(c.id); have[c.cost] = (have[c.cost] || 0) + 1; if (c.rarity === 'legend') legends++; if (c.kind === 'charm') charms++; if (splash && c.type === splash) splashes++; };
    const ok = c => !deck.includes(c.id) && !(c.rarity === 'legend' && legends >= C.MAX_LEGENDS) && !(splash && c.type === splash && splashes >= (opts.splashMax || 5));
    for (const c of cards) if (deck.length < size && ok(c) && c.kind === 'charm' && charms < (opts.charms || 4)) take(c);
    for (const c of cards) if (deck.length < size && ok(c) && c.kind === 'yokai' && (have[Math.min(8, c.cost)] || 0) < (curve[Math.min(8, c.cost)] || 1)) take(c);
    for (const c of cards) if (deck.length < size && ok(c) && (c.kind === 'yokai' || charms < (opts.charms || 4) + 2)) take(c);
    return deck;
  }

  /* ---------- festival events (one per round, public) ---------- */
  const EVENTS = {
    opening: { name: 'Opening Ceremony', text: 'No special rule. Let the tug begin!' },
    taiko: { name: 'Taiko Parade', text: 'Every heave gets +3.' },
    rain: { name: 'Rain Shower', text: 'Water yokai get +2 power.' },
    fireworks: { name: 'Fireworks Night', text: 'Fire yokai get +2 power.' },
    kites: { name: 'Kite Festival', text: 'Wind yokai get +2 power.' },
    mochi: { name: 'Mochi Pounding', text: 'At the end of every turn, all yokai heal 2.' },
    sumo: { name: 'Sumo Exhibition', text: 'Grip is doubled.' },
    bon: { name: 'Bon Dance', text: 'Yokai can attack on the turn they join.' },
    moon: { name: 'Moon Viewing', text: 'Whoever is losing the tug gets +4 on their heave.' },
    market: { name: 'Night Market', text: 'Every card costs 1 less.' },
    finale: { name: 'Grand Finale', text: 'Every heave counts double!' }
  };
  const MIDDLE = ['taiko', 'rain', 'fireworks', 'kites', 'mochi', 'sumo', 'bon', 'moon', 'market'];

  const other = k => (k === 'a' ? 'b' : 'a');
  const dir = k => (k === 'a' ? 1 : -1);

  /* ---------- setup ---------- */
  function newSide(deck, rand, keepOrder) {
    const d = keepOrder ? deck.slice() : shuffle(deck, rand);
    // a fair opening: if the first hand has nothing that costs 2 or less, the first cheap card in the deck swaps in
    if (!keepOrder && !d.slice(0, C.START_HAND).some(id => BY_ID[id].cost <= 2)) {
      const j = d.findIndex((id, i) => i >= C.START_HAND && BY_ID[id].cost <= 2);
      if (j > 0) [d[C.START_HAND - 1], d[j]] = [d[j], d[C.START_HAND - 1]];
    }
    return { deck: d.slice(C.START_HAND), hand: d.slice(0, C.START_HAND), grave: [], lost: [], team: [], energy: 0, bonus: 0, turns: 0,
      trap: null, rope: 0, drum: 0, cheer: 0, pulled: 0, ema: 0, tanzaku: 0, gongTurn: -1, bellTurn: -1, koiTurn: -1, kemariTurn: -1, taruTurn: -1, bountyTurn: -1,
      played: 0, joined: 0, discount: 0, rushNext: false, tax: 0, taxTurn: -1, taxNext: 0, sap: 0, bonds: {} };
  }
  /* o: { decks:{a,b}, first, seed, keepOrder, events (fixed schedule), script, classic (tutorial), win } */
  function newMatch(o) {
    const rand = seeded('kizuna-tug:' + (o.seed != null ? o.seed : Math.floor(Math.random() * 1e9)));
    const turns = o.turns || C.MAX_TURNS;
    const mid = shuffle(MIDDLE, rand).slice(0, turns - 2);
    return { turnNo: 0, active: o.first || 'a', first: o.first || 'a', over: false, winner: null, reason: null, uid: 0, seq: 0, rope: 0,
      win: o.win || C.WIN, maxTurns: turns, events: o.events || ['opening', ...mid, 'finale'],
      a: newSide(o.decks.a, rand, o.keepOrder), b: newSide(o.decks.b, rand, o.keepOrder), script: o.script || null, classic: !!o.classic, noTap: !!o.noTap };
  }
  const round = m => Math.max(1, Math.ceil(m.turnNo / 2));
  const eventNow = m => m.events[Math.min(m.events.length - 1, round(m) - 1)];
  const E = (m, ev, o) => { o.rope = m.rope; ev.push(o); };

  /* ---------- queries ---------- */
  const find = (m, uid) => { for (const k of ['a', 'b']) { const y = m[k].team.find(t => t.uid === uid); if (y) return y; } return null; };
  /* the value of ability key on a yokai (null if it lacks it or is silenced); combo abilities only fire on joining */
  const has = (y, k) => { if (y.silenced) return null; for (const a of y.abs) if (a.k === k && !a.combo) return a.n; return null; };
  const count = (team, k, not) => team.reduce((x, t) => (t !== not && has(t, k) != null ? x + (has(t, k) === true ? 1 : has(t, k)) : x), 0);
  function bondsActive(m, k) {
    const team = m[k].team, out = [];
    for (const b of BONDS) { const ids = new Set(team.map(t => t.id)); const n = b.members.filter(id => ids.has(id)).length; if (n >= b.need) out.push(b); }
    return out;
  }
  function bondPower(m, y) {
    let p = 0;
    const c = BY_ID[y.id]; if (!c.bonds) return 0;
    const ids = new Set(m[y.owner].team.map(t => t.id));
    for (const bid of c.bonds) { const b = BOND_BY[bid]; if (b.members.filter(id => ids.has(id)).length >= b.need) p += b.power; }
    return p;
  }
  function powerOf(m, y, pulling) {
    const s = m[y.owner], team = s.team, ev = eventNow(m);
    let p = y.power + y.boost + (y.tempTurn === m.turnNo ? y.temp : 0);
    for (const t of team) {
      if (t === y || t.silenced) continue;
      const r = has(t, 'rally'); if (r) p += r;
      const au = has(t, 'aura'); if (au && t.type === y.type) p += au;
      if (has(t, 'warlord')) p += 2;
    }
    if (has(y, 'ninetails')) p += team.length - 1;
    if (has(y, 'kin')) p += team.filter(t => t !== y && t.type === y.type).length;
    if (has(y, 'loner') && team.length === 1) p += 3;
    if (has(y, 'underdog') && m.rope * dir(y.owner) < 0) p += 2;
    if ((ev === 'rain' && y.type === 'water') || (ev === 'fireworks' && y.type === 'fire') || (ev === 'kites' && y.type === 'wind')) p += 2;
    if (s.bellTurn === m.turnNo) p += 1;
    if (s.koiTurn === m.turnNo && y.type === 'water') p += 2;
    if (s.taruTurn === m.turnNo) p += 2;
    p += bondPower(m, y);
    if (pulling) { const bp = has(y, 'bigpull'); if (bp) p += bp; const d = has(y, 'dash'); if (d && y.joined === m.turnNo) p += d; }
    return Math.max(0, p);
  }
  function gripOf(m, y) {
    let g = has(y, 'leviathan') ? 5 : has(y, 'anchor') || has(y, 'fortress') ? C.ANCHOR : C.GRIP;
    if (y.gripUntil >= m.turnNo) g += 3;
    const c = BY_ID[y.id];
    if (c.bonds) { const ids = new Set(m[y.owner].team.map(t => t.id)); for (const bid of c.bonds) { const b = BOND_BY[bid]; if (b.grip && b.members.filter(id => ids.has(id)).length >= b.need) g += b.grip; } }
    return g * (eventNow(m) === 'sumo' ? 2 : 1);
  }
  const teamGrip = (m, k) => m[k].team.reduce((x, t) => x + gripOf(m, t), 0) + 2 * count(m[k].team, 'ropespirit') + m[k].rope;
  const hiddenNow = (m, y) => y.hiddenUntil >= m.turnNo;
  const frozenNow = (m, y) => y.frozenUntil >= m.turnNo;
  const maxAttacks = y => (has(y, 'twin') || has(y, 'westwind') ? 2 : 1);
  function canAttack(m, k, uid) {
    const y = m[k].team.find(t => t.uid === uid);
    if (!y || m.over || m.active !== k || y.attacks >= maxAttacks(y) || frozenNow(m, y) || m[k].taruTurn === m.turnNo) return false;
    if (y.fresh && !(has(y, 'swift') || has(y, 'westwind') || y.readied || eventNow(m) === 'bon' || m[k].team.some(t => t !== y && has(t, 'warlord')))) return false;
    return targets(m, k, uid).length > 0;
  }
  function targets(m, k, uid) {
    const a = uid != null ? find(m, uid) : null;
    if (a && has(a, 'pierce')) return m[other(k)].team.slice();
    const foes = m[other(k)].team.filter(t => !hiddenNow(m, t));
    const guards = foes.filter(t => has(t, 'guardian'));
    return guards.length ? guards : foes;
  }
  const shieldOf = (m, d) => (has(d, 'stoneskin') ? 1 : 0) + (m[d.owner].team.some(t => has(t, 'fortress')) ? 1 : 0);
  // type advantage: +1 damage (fire > wind > water > fire)
  const rawDmg = (m, a, d) => powerOf(m, a) + (beats(a.type, d.type) ? 1 : 0) + (a.rushTurn === m.turnNo ? 2 : 0);
  function damageOf(m, a, d) { return { dmg: d.barrier ? 0 : Math.max(0, rawDmg(m, a, d) - shieldOf(m, d)), mult: beats(a.type, d.type) ? 2 : 1 }; }
  const pulls = (m, y) => !frozenNow(m, y) && (!y.attacks || m[y.owner].kemariTurn === m.turnNo);
  function heaveOf(m, k, tap = 0) {
    const s = m[k], fk = other(k), ev = eventNow(m);
    const pullers = s.team.filter(t => pulls(m, t));
    let pull = pullers.reduce((x, t) => x + powerOf(m, t, true), 0) + s.drum + s.cheer + Math.max(0, Math.min(C.TAP_MAX, tap | 0));
    if (ev === 'taiko') pull += 3;
    if (ev === 'moon' && m.rope * dir(k) < 0) pull += 4;
    const sap = s.sap + count(m[fk].team, 'sapaura');
    pull = Math.max(0, pull - sap);
    const grip = s.gongTurn === m.turnNo ? 0 : teamGrip(m, fk);
    let net = Math.max(0, pull - grip);
    if (ev === 'finale') net *= 2;
    return { pull, grip, net, sap, pullers: pullers.map(t => t.uid) };
  }
  function costOf(m, k, id) {
    const c = BY_ID[id], s = m[k], fk = other(k);
    let cost = c.cost;
    if (c.kind === 'charm') cost -= count(s.team, 'charmer'); else if (s.rushNext) cost -= 2;
    if (c.kind === 'charm') cost += m[fk].team.filter(t => has(t, 'jam')).length;
    cost -= s.discount;
    if (s.bountyTurn === m.turnNo) cost -= 1;
    if (eventNow(m) === 'market') cost -= 1;
    if (s.taxTurn === m.turnNo) cost += s.tax;
    return Math.max(0, cost);
  }
  function playable(m, k, id) {
    const s = m[k], c = BY_ID[id];
    if (m.over || m.active !== k || !s.hand.includes(id) || costOf(m, k, id) > s.energy) return false;
    if (c.kind === 'yokai') return s.team.length < C.TEAM_MAX;
    if (c.trap) return !s.trap;
    const foe = m[other(k)].team;
    switch (id) {
      case 'kagami': return !!m[other(k)].trap || s.deck.length > 0;
      case 'shuriken': case 'kunai': case 'mamemaki': case 'okuribi': case 'tsunami': case 'nisshoku': case 'kanashibari': case 'sparkler': return foe.length > 0;
      case 'kuchiyose': return s.team.length < C.TEAM_MAX && s.deck.some(x => BY_ID[x].kind === 'yokai' && BY_ID[x].cost <= 3);
      case 'kagebunshin': return s.team.length < C.TEAM_MAX && s.team.length > 0;
      case 'toronagashi': return s.lost.length > 0 && s.hand.length < C.HAND_MAX + 1;
    }
    if (c.target !== 'none') return charmTargets(m, k, id).length > 0;
    return true;
  }
  function charmTargets(m, k, id) {
    const c = BY_ID[id], foe = m[other(k)].team;
    if (c.target === 'own') return m[k].team.filter(t => id !== 'kagebunshin' || BY_ID[t.id].cost <= 6).map(t => t.uid);
    if (c.target === 'anyrival') return foe.map(t => t.uid);
    if (c.target === 'rival') return foe.filter(t => !hiddenNow(m, t) && (id !== 'net' || BY_ID[t.id].cost <= 2) && (id !== 'tenguuchiwa' || BY_ID[t.id].cost <= 4)).map(t => t.uid);
    return [];
  }
  const strongest = (m, team) => team.slice().sort((x, y) => powerOf(m, y) - powerOf(m, x) || y.hp - x.hp || x.uid - y.uid)[0];
  const weakest = (m, team) => team.slice().sort((x, y) => (powerOf(m, x) + x.hp) - (powerOf(m, y) + y.hp) || x.uid - y.uid)[0];
  const frailest = team => team.slice().sort((x, y) => x.hp - y.hp || x.uid - y.uid)[0];
  const visible = (m, team) => team.filter(t => !hiddenNow(m, t));

  /* ---------- turn flow ---------- */
  function beginTurn(m) {
    const ev = [], k = m.active, s = m[k], fk = other(k);
    m.turnNo++; s.turns++;
    // energy: your turn number + 3, up to 10. Whoever goes first starts with just 1, and whoever goes second draws an extra card.
    // (the tutorial keeps a gentler classic start)
    s.energy = Math.max(0, Math.min(s.turns + (m.classic ? 1 : C.ENERGY_PLUS), C.MAX_ENERGY) + s.bonus); s.bonus = 0;
    if (s.turns === 1 && k === m.first && !m.classic) s.energy = Math.max(0, 1 + s.energy - (1 + C.ENERGY_PLUS));
    if (s.turns === 1 && k !== m.first && m.classic) s.energy += 1;
    if (s.tanzaku > 0) { s.energy += 1; s.tanzaku--; }
    s.energy += count(s.team, 'muse');
    if (!(k === m.first && s.turns === 1)) for (let i = 0; i < (m.classic ? 1 : C.DRAW); i++) draw(s);
    if (k !== m.first && s.turns === 1 && !m.classic) draw(s);
    for (; s.ema > 0; s.ema--) draw(s);
    s.rope = 0; s.drum = 0; s.cheer = 0; s.played = 0; s.joined = 0; s.discount = 0; s.rushNext = false;
    if (s.taxNext) { s.tax = s.taxNext; s.taxTurn = m.turnNo; s.taxNext = 0; }
    for (const y of s.team) { y.fresh = false; y.attacks = 0; y.readied = false; }
    E(m, ev, { t: 'turn', k, turn: s.turns, energy: s.energy, event: eventNow(m), round: round(m), tax: s.taxTurn === m.turnNo ? s.tax : 0 });
    for (const y of s.team.slice()) { const g = has(y, 'grow'); if (g) { y.power += g; E(m, ev, { t: 'power', k, uid: y.uid, id: y.id, delta: g, text: `Grow +${g}` }); } }
    for (const h of s.team.slice()) { const n = has(h, 'healer'); if (n) for (const y of s.team) heal(m, y, n, ev); const r = has(h, 'regen'); if (r) heal(m, h, r, ev); }
    for (const y of s.team.slice()) if (has(y, 'harvest')) { E(m, ev, { t: 'ability', k, uid: y.uid, id: y.id, text: 'Rich Harvest!' }); s.energy += 2; drawN(m, k, 1, ev); }
    for (const y of s.team.filter(t => has(t, 'sunfire'))) { E(m, ev, { t: 'ability', k, uid: y.uid, id: y.id, text: 'Sunfire!' }); for (const d of m[fk].team.slice()) hit(m, d, 1, ev, y.uid); }
    return ev;
  }
  function draw(s) { if (s.deck.length && s.hand.length < C.HAND_MAX) { s.hand.push(s.deck.shift()); return true; } return false; }
  function drawN(m, k, n, ev) { let got = 0; for (let i = 0; i < n; i++) if (draw(m[k])) got++; if (got) E(m, ev, { t: 'draw', k, n: got }); }
  function drawKind(m, k, kind, ev) { const s = m[k], i = s.deck.findIndex(id => BY_ID[id].kind === kind); if (i >= 0 && s.hand.length < C.HAND_MAX) { s.hand.push(s.deck.splice(i, 1)[0]); E(m, ev, { t: 'draw', k, n: 1 }); } }
  function heal(m, y, n, ev) { const before = y.hp; y.hp = Math.min(y.maxHp, y.hp + n); if (y.hp > before) E(m, ev, { t: 'heal', k: y.owner, uid: y.uid, amount: y.hp - before, hp: y.hp }); }
  function moveRope(m, k, n, ev, source) {
    if (n <= 0 || m.over) return;
    m.rope = Math.max(-m.win, Math.min(m.win, m.rope + n * dir(k)));
    E(m, ev, { t: 'move', k, amount: n, source });
    checkWin(m, ev);
  }
  function checkWin(m, ev) {
    if (m.over) return;
    if (Math.abs(m.rope) >= m.win) { m.over = true; m.winner = m.rope > 0 ? 'a' : 'b'; m.reason = 'tug'; E(m, ev, { t: 'end', winner: m.winner, reason: 'tug' }); }
  }
  function hit(m, d, n, ev, by, extra) {
    if (!d || !m[d.owner].team.includes(d) || m.over) return;
    n = Math.max(0, n - shieldOf(m, d));
    if (n <= 0) return;
    if (d.barrier) { d.barrier = false; E(m, ev, { t: 'block', k: d.owner, uid: d.uid, id: d.id }); return; }
    d.hp -= n;
    E(m, ev, Object.assign({ t: 'dmg', k: d.owner, uid: d.uid, id: d.id, amount: n, hp: d.hp, by }, extra || {}));
    if (d.hp <= 0) ko(m, d, ev, by);
  }
  function ko(m, d, ev, by) {
    const s = m[d.owner];
    if (d.omamori) { d.omamori = false; d.hp = 1; E(m, ev, { t: 'ability', k: d.owner, uid: d.uid, id: d.id, text: 'Omamori! Still standing' }); E(m, ev, { t: 'heal', k: d.owner, uid: d.uid, amount: 0, hp: 1 }); return; }
    s.team = s.team.filter(t => t !== d);
    if (s.trap === 'hitogata' && !d.token) { // the paper doll takes its place
      s.trap = null; E(m, ev, { t: 'status', k: d.owner, text: 'Paper Doll!' });
      if (s.hand.length < C.HAND_MAX) s.hand.push(d.id); else s.grave.push(d.id);
      E(m, ev, { t: 'bounce', k: d.owner, uid: d.uid, id: d.id }); return;
    }
    const back = !d.token && has(d, 'rebirth') && s.hand.length < C.HAND_MAX;
    if (!d.token) { if (back) s.hand.push(d.id); else s.grave.push(d.id); s.lost.push(d.id); }
    E(m, ev, { t: 'ko', k: d.owner, uid: d.uid, id: d.id, rebirth: back, token: !!d.token });
    const fp = has(d, 'finalpull'); if (fp) { E(m, ev, { t: 'ability', k: d.owner, uid: d.uid, id: d.id, text: 'Last Heave!' }); moveRope(m, d.owner, fp, ev, d.id); }
    const g = has(d, 'gift'); if (g) drawN(m, d.owner, g, ev);
    const lg = has(d, 'legacy'); if (lg && !m.over) { E(m, ev, { t: 'ability', k: d.owner, uid: d.uid, id: d.id, text: 'Legacy!' }); summonToken(m, d.owner, lg, ev); }
    const a = by != null ? find(m, by) : null;
    if (a && a.owner !== d.owner) {
      if (has(d, 'curse')) { a.frozenUntil = m.turnNo + 1; E(m, ev, { t: 'ability', k: a.owner, uid: a.uid, id: a.id, text: 'Cursed! Frozen' }); }
      if (has(a, 'momentum')) { E(m, ev, { t: 'ability', k: a.owner, uid: a.uid, id: a.id, text: 'Momentum!' }); moveRope(m, a.owner, 2, ev, a.id); }
    }
  }
  function bounce(m, d, ev) {
    const s = m[d.owner];
    s.team = s.team.filter(t => t !== d);
    if (!d.token) { if (s.hand.length < C.HAND_MAX) s.hand.push(d.id); else s.grave.push(d.id); }
    E(m, ev, { t: 'bounce', k: d.owner, uid: d.uid, id: d.id, token: !!d.token });
  }
  function silence(m, d, ev) { if (!d || d.silenced) return; d.silenced = true; d.barrier = false; E(m, ev, { t: 'silence', k: d.owner, uid: d.uid, id: d.id }); }
  function freezeY(m, d, ev) { if (!d) return; d.frozenUntil = m.turnNo + 1; E(m, ev, { t: 'ability', k: d.owner, uid: d.uid, id: d.id, text: 'Frozen!' }); }
  /* the rival's face-down Paper Ward cancels this attack/charm */
  function warded(m, defK, ev, what) {
    if (m[defK].trap !== 'ward') return false;
    m[defK].trap = null;
    E(m, ev, { t: 'ward', k: defK, what });
    return true;
  }
  function newYokai(m, k, id, token) {
    const c = BY_ID[id];
    return { uid: ++m.uid, id, owner: k, type: c.type, abs: c.abs, power: c.power, boost: 0, temp: 0, tempTurn: -1, hp: c.hp, maxHp: c.hp,
      fresh: true, attacks: 0, joined: m.turnNo, readied: false, frozenUntil: -1, gripUntil: -1, omamori: false, silenced: false, token: !!token,
      barrier: c.abs.some(a => a.k === 'barrier'), hiddenUntil: c.abs.some(a => a.k === 'hidden') ? m.turnNo + 1 : -1, rushTurn: -1 };
  }
  /* put a yokai on the rope; tokens (summoned copies) don't use their own join ability */
  function place(m, k, id, ev, opts = {}) {
    const s = m[k]; if (s.team.length >= C.TEAM_MAX || m.over) return null;
    const y = newYokai(m, k, id, opts.token);
    if (opts.hp) { y.hp = opts.hp; y.maxHp = Math.max(1, opts.hp); }
    s.team.push(y); s.joined++;
    E(m, ev, { t: 'join', k, uid: y.uid, id, summoned: !!opts.token || !!opts.called });
    if (!opts.token) onJoin(m, y, ev, opts.combo, opts.depth || 0);
    checkBonds(m, k, ev);
    return y;
  }
  const summonToken = (m, k, id, ev) => place(m, k, id, ev, { token: true });
  function checkBonds(m, k, ev) {
    const s = m[k];
    for (const b of bondsActive(m, k)) {
      if (s.bonds[b.id] || m.over) continue;
      s.bonds[b.id] = true;
      const members = s.team.filter(t => b.members.includes(t.id)).map(t => t.uid);
      E(m, ev, { t: 'bond', k, bond: b.id, name: b.name, members });
      runJoinAbs(m, k, b.formAbs, ev, { uid: members[0], id: s.team.find(t => t.uid === members[0]).id, type: s.team.find(t => t.uid === members[0]).type }, 0);
    }
  }

  function act(m, a) {
    const ev = [];
    if (!m.over && a.t === 'forfeit' && (a.k === 'a' || a.k === 'b')) {
      m.over = true; m.winner = other(a.k); m.reason = 'forfeit'; m.seq++;
      E(m, ev, { t: 'end', winner: m.winner, reason: 'forfeit', forfeit: a.k }); return { ok: true, ev };
    }
    if (m.over || a.k !== m.active) return { ok: false, ev };
    let ok = false;
    if (a.t === 'play') ok = play(m, a.k, a.card, a.target, ev);
    else if (a.t === 'attack') ok = attack(m, a.k, a.from, a.to, ev);
    else if (a.t === 'heave') { ok = true; heave(m, a.k, ev, m.noTap ? 0 : a.tap || 0); }
    if (ok) m.seq++;
    return { ok, ev };
  }
  function play(m, k, id, target, ev) {
    if (!playable(m, k, id)) return false;
    const s = m[k], c = BY_ID[id], fk = other(k), foe = m[fk];
    if (c.kind === 'charm' && c.target !== 'none' && !charmTargets(m, k, id).includes(target)) return false;
    const combo = s.played > 0, before = s.played;
    s.energy -= costOf(m, k, id); s.hand.splice(s.hand.indexOf(id), 1);
    s.discount = 0; s.played++;
    if (c.kind === 'yokai') {
      const rush = s.rushNext; s.rushNext = false;
      const y = place(m, k, id, ev, { combo, before });
      if (y && rush) { y.readied = true; }
      return true;
    }
    s.grave.push(id);
    E(m, ev, { t: 'charm', k, id, target });
    const own = target != null ? find(m, target) : null;
    const tempPower = (y, n) => { if (y.tempTurn !== m.turnNo) { y.temp = 0; y.tempTurn = m.turnNo; } y.temp += n; E(m, ev, { t: 'power', k, uid: y.uid, id: y.id, delta: n, text: `+${n} power` }); };
    const perm = (y, n, text) => { y.boost += n; E(m, ev, { t: 'power', k: y.owner, uid: y.uid, id: y.id, delta: n, text: text || `${n > 0 ? '+' : '−'}${Math.abs(n)} power` }); };
    const status = text => E(m, ev, { t: 'status', k, text });
    switch (id) {
      case 'drum': s.drum += 4; break;
      case 'firecracker': if (!warded(m, fk, ev, id)) hit(m, own, 2, ev, null, { src: id }); break;
      case 'onigiri': heal(m, own, 4, ev); break;
      case 'ward': case 'spikes': case 'hitogata': s.trap = id; break;
      case 'headband': perm(own, 2); break;
      case 'chime': moveRope(m, k, 3, ev, id); break;
      case 'net': if (!warded(m, fk, ev, id)) bounce(m, own, ev); break;
      case 'rope': s.rope += 4; break;
      case 'sparkler': if (!warded(m, fk, ev, id)) for (const d of foe.team.slice()) hit(m, d, 2, ev, null, { src: id }); break;
      case 'mask': own.hiddenUntil = m.turnNo + 1; E(m, ev, { t: 'ability', k, uid: own.uid, id: own.id, text: 'Hidden!' }); break;
      case 'tea': drawN(m, k, 2, ev); break;
      case 'lantern': s.bonus += 2; break;
      case 'fan': own.attacks = 0; own.readied = true; E(m, ev, { t: 'ability', k, uid: own.uid, id: own.id, text: 'Ready to attack!' }); break;
      case 'rocket': if (!warded(m, fk, ev, id)) hit(m, own, 4, ev, null, { src: id }); break;
      case 'taiyaki': for (const y of s.team) heal(m, y, 3, ev); break;
      case 'gong': s.gongTurn = m.turnNo; status('Grip broken!'); break;
      case 'bell': s.bellTurn = m.turnNo; break;
      case 'yukata': own.maxHp += 3; heal(m, own, 3, ev); break;
      case 'dango': own.boost += 1; own.maxHp += 1; own.hp += 1; E(m, ev, { t: 'power', k, uid: own.uid, id: own.id, delta: 1, text: '+1 power, +1 HP' }); break;
      case 'whistle': bounce(m, own, ev); s.energy += 1; break;
      case 'bigkite': moveRope(m, k, 2 + s.team.filter(t => t.type === 'wind').length, ev, id); break;
      case 'bucket': if (!warded(m, fk, ev, id)) hit(m, own, own.type === 'fire' ? 5 : 2, ev, null, { src: id }); break;
      case 'kaminari': if (!warded(m, fk, ev, id)) hit(m, own, own.type === 'water' ? 5 : 2, ev, null, { src: id }); break;
      case 'hibashi': if (!warded(m, fk, ev, id)) hit(m, own, own.type === 'wind' ? 5 : 2, ev, null, { src: id }); break;
      case 'omamori': own.omamori = true; E(m, ev, { t: 'ability', k, uid: own.uid, id: own.id, text: 'Protected!' }); break;
      case 'koinobori': s.koiTurn = m.turnNo; break;
      case 'kanzashi': tempPower(own, 2); break;
      case 'geta': own.gripUntil = m.turnNo + 1; E(m, ev, { t: 'ability', k, uid: own.uid, id: own.id, text: '+3 grip' }); break;
      case 'scroll': drawN(m, k, 1, ev); s.energy += 1; break;
      case 'kagami': if (foe.trap) { foe.trap = null; E(m, ev, { t: 'trapgone', k: fk }); } drawN(m, k, 1, ev); break;
      case 'shuriken': if (!warded(m, fk, ev, id)) { const d = foe.team.slice().sort((x, y) => y.hp - x.hp || x.uid - y.uid)[0]; hit(m, d, 3, ev, null, { src: id }); } break;
      case 'kusudama': drawN(m, k, 3, ev); break;
      case 'ema': s.ema += 2; break;
      case 'ramune': heal(m, own, 2, ev); tempPower(own, 2); break;
      case 'kakigori': if (!warded(m, fk, ev, id)) freezeY(m, own, ev); break;
      case 'yoyo': moveRope(m, k, 1, ev, id); drawN(m, k, 1, ev); break;
      case 'hamaya': if (!warded(m, fk, ev, id)) hit(m, own, 5, ev, null, { src: id }); break;
      case 'tanzaku': s.tanzaku += 2; break;
      case 'onsen': for (const y of s.team) { perm(y, 1); heal(m, y, 99, ev); } break;
      case 'kemari': s.kemariTurn = m.turnNo; break;
      case 'fuin': if (!warded(m, fk, ev, id)) silence(m, own, ev); break;
      case 'kotodama': if (!warded(m, fk, ev, id)) silence(m, own, ev); drawN(m, k, 1, ev); break;
      case 'kanashibari': if (!warded(m, fk, ev, id)) for (const d of foe.team.slice().sort((x, y) => powerOf(m, y) - powerOf(m, x) || x.uid - y.uid).slice(0, 2)) freezeY(m, d, ev); break;
      case 'sekisho': foe.taxNext += 1; E(m, ev, { t: 'status', k: fk, text: 'Toll: +1 cost next turn' }); break;
      case 'abura': foe.sap += 3; E(m, ev, { t: 'status', k: fk, text: 'Slippery: next heave −3' }); break;
      case 'kuchiyose': { const i = s.deck.findIndex(x => BY_ID[x].kind === 'yokai' && BY_ID[x].cost <= 3); if (i >= 0) place(m, k, s.deck.splice(i, 1)[0], ev, { called: true, combo: true }); break; }
      case 'musubi': drawN(m, k, bondsActive(m, k).length ? 2 : 1, ev); break;
      case 'omatsuri': s.cheer += 2 * before; status(`Festival Frenzy +${2 * before}`); break;
      case 'tenugui': heal(m, own, 3, ev); own.frozenUntil = -1; own.silenced = false; E(m, ev, { t: 'ability', k, uid: own.uid, id: own.id, text: 'Refreshed!' }); break;
      case 'mochitsuki': s.discount = 2; status('Next card −2'); break;
      case 'taru': s.taruTurn = m.turnNo; status('Kanpai! +2 power'); break;
      case 'bento': for (const y of s.team) heal(m, y, 2, ev); drawN(m, k, 1, ev); break;
      case 'toronagashi': { const lid = s.lost.pop(); const gi = s.grave.lastIndexOf(lid); if (gi >= 0) s.grave.splice(gi, 1); if (s.hand.length < C.HAND_MAX) { s.hand.push(lid); E(m, ev, { t: 'draw', k, n: 1 }); } break; }
      case 'kemuridama': for (const y of s.team) y.hiddenUntil = m.turnNo + 1; status('Smoke! Everyone hides'); break;
      case 'kunai': if (!warded(m, fk, ev, id)) for (const d of foe.team.slice().sort((x, y) => powerOf(m, y) - powerOf(m, x) || x.uid - y.uid).slice(0, 2)) hit(m, d, 2, ev, null, { src: id }); break;
      case 'okuribi': if (!warded(m, fk, ev, id)) for (const d of foe.team.filter(t => BY_ID[t.id].cost <= 2)) hit(m, d, 3, ev, null, { src: id }); break;
      case 'tsunami': if (!warded(m, fk, ev, id)) for (const d of foe.team.filter(t => t.hp <= 3)) bounce(m, d, ev); break;
      case 'taifu': moveRope(m, k, 3, ev, id); s.gongTurn = m.turnNo; break;
      case 'nisshoku': if (!warded(m, fk, ev, id)) for (const d of foe.team.slice()) silence(m, d, ev); break;
      case 'tenguuchiwa': if (!warded(m, fk, ev, id)) bounce(m, own, ev); break;
      case 'uchide': own.boost += 3; own.maxHp += 3; own.hp += 3; E(m, ev, { t: 'power', k, uid: own.uid, id: own.id, delta: 3, text: '+3 power, +3 HP' }); break;
      case 'takarabune': drawN(m, k, 2, ev); s.bonus += 2; break;
      case 'inarizushi': heal(m, own, 3, ev); perm(own, 1); break;
      case 'kagebunshin': { const y = place(m, k, own.id, ev, { token: true, hp: 1 }); if (y) { y.boost = own.boost; E(m, ev, { t: 'ability', k, uid: y.uid, id: y.id, text: 'Shadow clone!' }); } break; }
      case 'wasshoi': s.cheer += 2 * s.joined; status(`Wasshoi! +${2 * s.joined}`); break;
      case 'senbazuru': for (const y of s.team) { y.maxHp += 2; heal(m, y, 2, ev); } break;
      case 'kintsugi': own.maxHp += 2; heal(m, own, 99, ev); break;
      case 'mamemaki': if (!warded(m, fk, ev, id)) for (const d of foe.team.slice()) hit(m, d, ONI.has(d.id) ? 3 : 1, ev, null, { src: id }); break;
      case 'dohyo': if (!warded(m, fk, ev, id)) { own.boost -= 1; E(m, ev, { t: 'power', k: fk, uid: own.uid, id: own.id, delta: -1, text: 'Pushed out!' }); own.frozenUntil = Math.max(own.frozenUntil, m.turnNo + 1); } break;
      case 'jinrikisha': own.attacks = 0; own.readied = true; own.rushTurn = m.turnNo; E(m, ev, { t: 'ability', k, uid: own.uid, id: own.id, text: 'Rickshaw rush! +2' }); break;
      case 'hikyaku': drawKind(m, k, 'yokai', ev); drawKind(m, k, 'charm', ev); break;
      case 'saisen': s.energy += before >= 2 ? 3 : 1; status(`+${before >= 2 ? 3 : 1} energy`); break;
      case 'karakuri': s.rushNext = true; status('Next yokai −2 and ready'); break;
    }
    return true;
  }
  /* the "when it joins" abilities (and Bond effects, which use the same keys) */
  function onJoin(m, y, ev, combo, depth) {
    runJoinAbs(m, y.owner, y.abs.filter(a => JOIN.has(a.k) && (!a.combo || combo)), ev, y, depth, combo);
  }
  function runJoinAbs(m, k, abs, ev, y, depth = 0, combo) {
    const fk = other(k), foe = m[fk], s = m[k];
    const say = text => E(m, ev, { t: 'ability', k, uid: y.uid, id: y.id, text });
    for (const a of abs) {
      if (m.over) return;
      const n = a.n, tag = a.combo ? 'Combo! ' : '';
      switch (a.k) {
        case 'ambush': { const d = strongest(m, visible(m, foe.team)); if (d) { say(tag + 'Ambush!'); hit(m, d, n, ev, y.uid); } break; }
        case 'snipe': { const d = frailest(visible(m, foe.team)); if (d) { say(tag + 'Snipe!'); hit(m, d, n, ev, y.uid); } break; }
        case 'burst': say(tag + 'Gust!'); moveRope(m, k, n, ev, y.id); break;
        case 'hex': { const d = strongest(m, visible(m, foe.team)); if (d) { say(tag + 'Hex!'); d.boost -= n; E(m, ev, { t: 'power', k: fk, uid: d.uid, id: d.id, delta: -n, text: `−${n} power` }); } break; }
        case 'hidden': say('Hidden!'); break;
        case 'scout': say(tag + 'Scout!'); drawN(m, k, n, ev); break;
        case 'spark': say(tag + `+${n} energy!`); s.energy += n; break;
        case 'pickpocket': say('Pickpocket!'); foe.bonus -= n; E(m, ev, { t: 'status', k: fk, text: `−${n} energy next turn` }); break;
        case 'summon': say('Summon!'); for (const id of n) summonToken(m, k, id, ev); break;
        case 'call': { if (depth > 2) break; const i = s.deck.findIndex(x => BY_ID[x].kind === 'yokai' && BY_ID[x].cost <= n); if (i >= 0 && s.team.length < C.TEAM_MAX) { say('Call!'); place(m, k, s.deck.splice(i, 1)[0], ev, { called: true, combo: true, depth: depth + 1 }); } break; }
        case 'silence': { const d = strongest(m, visible(m, foe.team).filter(t => !t.silenced)); if (d) { say(tag + 'Silence!'); silence(m, d, ev); } break; }
        case 'tax': say(tag + 'Toll!'); foe.taxNext += n; E(m, ev, { t: 'status', k: fk, text: `Toll: +${n} cost next turn` }); break;
        case 'sap': say(tag + 'Slippery!'); foe.sap += n; E(m, ev, { t: 'status', k: fk, text: `Next heave −${n}` }); break;
        case 'freeze': { const d = strongest(m, visible(m, foe.team).filter(t => !frozenNow(m, t) || t.frozenUntil < m.turnNo + 1)); if (d) freezeY(m, d, ev); break; }
        case 'whirl': { const d = weakest(m, visible(m, foe.team)); if (d) { say(tag + 'Whirlpool!'); bounce(m, d, ev); } break; }
        case 'buffall': say(tag + 'Inspire!'); for (const t of s.team) if (t !== y && t.uid !== y.uid) { t.boost += n; E(m, ev, { t: 'power', k, uid: t.uid, id: t.id, delta: n, text: `+${n} power` }); } break;
        case 'healall': say(tag + 'Soothe!'); for (const t of s.team) heal(m, t, n, ev); break;
        case 'discount': say(tag + `Next card −${n}`); s.discount += n; break;
        case 'cheer': say(tag + `Cheer +${n}`); s.cheer += n; break;
        case 'frenzy': { const p = Math.max(0, s.played - 1); if (p) { y.boost += p; E(m, ev, { t: 'power', k, uid: y.uid, id: y.id, delta: p, text: `Frenzy +${p}` }); } break; }
        case 'blessing': say('Blessing!'); for (const t of s.team) heal(m, t, 99, ev); break;
        case 'firestorm': if (foe.team.length) { say(tag + 'Firestorm!'); for (const d of foe.team.slice()) hit(m, d, n, ev, y.uid); } break;
        case 'storm': if (foe.team.length) { say('Divine Storm!'); for (const d of foe.team.slice()) hit(m, d, 3, ev, y.uid); } break;
        case 'overlord': { const d = weakest(m, foe.team); if (d) { say('Oni King!'); const h = d.hp; d.hp = 0; E(m, ev, { t: 'dmg', k: fk, uid: d.uid, id: d.id, amount: h, hp: 0, by: y.uid }); ko(m, d, ev, y.uid); } break; }
        case 'whirlwind': { const d = strongest(m, foe.team); if (d) { say('Whirlwind!'); bounce(m, d, ev); } break; }
        case 'guide': case 'dawn': say(a.k === 'dawn' ? 'Dance of Dawn!' : 'All ready!'); for (const t of s.team) { t.attacks = 0; t.readied = true; } if (a.k === 'dawn') s.cheer += 4; break;
        case 'thunder': { const ds = foe.team.slice().sort((x, z) => powerOf(m, z) - powerOf(m, x) || x.uid - z.uid).slice(0, 2); if (ds.length) { say('Thunderclap!'); for (const d of ds) hit(m, d, 3, ev, y.uid); } break; }
        case 'harmony': say('Harmony!'); moveRope(m, k, m.rope * dir(k) < 0 ? 5 : 2, ev, y.id); break;
        case 'sunfire': if (foe.team.length) { say('Sunfire!'); for (const d of foe.team.slice()) hit(m, d, 1, ev, y.uid); } break;
        case 'binding': { const d = strongest(m, foe.team); if (d) { say('Binding Rope!'); d.boost -= 2; d.frozenUntil = m.turnNo + 1; E(m, ev, { t: 'power', k: fk, uid: d.uid, id: d.id, delta: -2, text: 'Bound!' }); } break; }
        case 'treasure': say('Dragon Palace!'); drawN(m, k, 2, ev); for (const t of s.team) heal(m, t, 3, ev); break;
        case 'moonreturn': { const ds = foe.team.filter(t => BY_ID[t.id].cost <= 2); if (ds.length) { say('Moon Return!'); for (const d of ds) bounce(m, d, ev); } break; }
        case 'sunrise': say('Sunrise!'); for (const t of s.team) { heal(m, t, 99, ev); if (t !== y) { t.boost += 1; E(m, ev, { t: 'power', k, uid: t.uid, id: t.id, delta: 1, text: '+1 power' }); } } moveRope(m, k, 2, ev, y.id); break;
        case 'bounty': say('Big Catch!'); drawN(m, k, 3, ev); s.bountyTurn = m.turnNo; break;
        case 'flood': { const ds = foe.team.filter(t => t.hp <= 4); if (ds.length) { say('Great Flood!'); for (const d of ds) bounce(m, d, ev); } break; }
        case 'blizzard': if (foe.team.length) { say('Blizzard!'); for (const d of foe.team) freezeY(m, d, ev); } break;
        case 'eclipse': if (foe.team.length) { say('Moonlit Silence!'); for (const d of foe.team) silence(m, d, ev); } break;
      }
    }
  }
  function attack(m, k, from, to, ev) {
    if (!canAttack(m, k, from)) return false;
    const a = m[k].team.find(t => t.uid === from), d = m[other(k)].team.find(t => t.uid === to);
    if (!d || !targets(m, k, from).includes(d)) return false;
    a.attacks++;
    E(m, ev, { t: 'attack', k, uid: a.uid, id: a.id, to: d.uid });
    const fk = other(k);
    if (m[fk].trap === 'spikes') {
      m[fk].trap = null; E(m, ev, { t: 'spikes', k: fk });
      hit(m, a, 4, ev, null, { src: 'spikes' });
      if (!m[k].team.includes(a)) return true;
    }
    if (warded(m, fk, ev, 'attack')) return true;
    const victims = has(a, 'eightheads') ? [d].concat(m[fk].team.filter(t => t !== d && !hiddenNow(m, t))) : [d];
    for (const v of victims) {
      if (!m[fk].team.includes(v) || m.over) continue;
      if (has(a, 'trick')) { v.boost -= 1; E(m, ev, { t: 'power', k: fk, uid: v.uid, id: v.id, delta: -1, text: 'Trick −1' }); }
      hit(m, v, rawDmg(m, a, v), ev, a.uid, { mult: beats(a.type, v.type) ? 2 : 1, main: v === d });
      if (has(a, 'frost') && m[fk].team.includes(v)) freezeY(m, v, ev);
      const th = has(v, 'thorns');
      if (th && m[k].team.includes(a)) { E(m, ev, { t: 'ability', k: fk, uid: v.uid, id: v.id, text: 'Spiky!' }); hit(m, a, th, ev, v.uid); }
      if (!m[k].team.includes(a)) break;
    }
    if (has(a, 'cleave') && m[k].team.includes(a)) for (const o of m[fk].team.filter(t => t !== d)) hit(m, o, 1, ev, a.uid);
    return true;
  }
  function heave(m, k, ev, tap) {
    const h = heaveOf(m, k, tap);
    m[k].pulled += h.net;
    E(m, ev, { t: 'heave', k, pull: h.pull, grip: h.grip, net: h.net, sap: h.sap, tap: Math.max(0, Math.min(C.TAP_MAX, tap | 0)), pullers: h.pullers, event: eventNow(m) });
    m[k].sap = 0;
    if (h.net > 0) moveRope(m, k, h.net, ev, 'heave');
    if (m.over) return;
    if (eventNow(m) === 'mochi') for (const s of ['a', 'b']) for (const y of m[s].team) heal(m, y, 2, ev);
    if (m[k].turns >= m.maxTurns && m[other(k)].turns >= m.maxTurns) {
      m.over = true; m.winner = m.rope > 0 ? 'a' : m.rope < 0 ? 'b' : 'draw'; m.reason = 'time';
      E(m, ev, { t: 'end', winner: m.winner, reason: 'time' }); return;
    }
    m.active = other(k);
    E(m, ev, { t: 'pass', k: m.active });
    ev.push(...beginTurn(m));
  }

  /* ---------- AI (deterministic): greedy search with a board evaluation ---------- */
  const TAP_AI = [1, 2, 2, 3, 3, 4];
  /* a quick copy for look-ahead: abilities and the event schedule never change, so they are shared */
  function clone(m) {
    const c = Object.assign({}, m); c.script = null; c._ai = null;
    for (const k of ['a', 'b']) {
      const s = m[k], t = Object.assign({}, s);
      t.deck = s.deck.slice(); t.hand = s.hand.slice(); t.grave = s.grave.slice(); t.lost = s.lost.slice(); t.bonds = Object.assign({}, s.bonds);
      t.team = s.team.map(y => Object.assign({}, y)); c[k] = t;
    }
    return c;
  }
  function yokaiValue(m, y) { return powerOf(m, y) * 0.8 + y.hp * 0.25 + gripOf(m, y) * 0.6 + (y.omamori || y.barrier ? 1 : 0) + (y.silenced ? 0 : 0.4 * y.abs.length) - (frozenNow(m, y) && y.frozenUntil > m.turnNo ? 1.5 : 0); }
  function evaluate(m, k, level = 5) {
    if (m.over) return m.winner === k ? 1e4 : m.winner === 'draw' ? 0 : -1e4;
    const fk = other(k), s = m[k], f = m[fk];
    const h = heaveOf(m, k, TAP_AI[level]), myRope = m.rope * dir(k) + h.net;
    if (myRope >= m.win) return 5000 + myRope;
    // the rival's pull next turn against the grip we'll have
    const theirPull = Math.max(0, f.team.filter(t => !(t.frozenUntil >= m.turnNo + 1)).reduce((x, t) => x + powerOf(m, t, true), 0) + 3 - f.sap - count(s.team, 'sapaura'));
    const theirNet = Math.max(0, theirPull - teamGrip(m, k)) * (m.events[Math.min(m.events.length - 1, Math.ceil((m.turnNo + 1) / 2) - 1)] === 'finale' ? 2 : 1);
    if (myRope - theirNet <= -m.win) return -2000 + myRope;
    let v = myRope - theirNet * 0.9;
    v += (s.team.reduce((x, t) => x + yokaiValue(m, t), 0) - f.team.reduce((x, t) => x + yokaiValue(m, t), 0)) * 0.3;
    v += s.hand.reduce((x, id) => x + Math.min(5, BY_ID[id].cost), 0) * 0.06 - f.hand.length * 0.05;
    v += (s.bonus + s.tanzaku + s.ema * 0.8) * 0.4 + f.taxNext * 0.5 - f.bonus * 0.3;
    if (s.trap && f.team.length) v += 1.2;
    if (f.trap) v -= 0.6;
    return v;
  }
  function candidates(m, k, level) {
    const s = m[k], out = [];
    for (const id of new Set(s.hand)) {
      if (!playable(m, k, id)) continue;
      const c = BY_ID[id];
      if (level === 0 && c.kind === 'charm' && c.target !== 'none') continue;
      if (c.kind === 'charm' && c.target !== 'none') for (const t of charmTargets(m, k, id)) out.push({ t: 'play', k, card: id, target: t });
      else out.push({ t: 'play', k, card: id });
    }
    if (level >= 1) for (const a of s.team) if (canAttack(m, k, a.uid)) for (const d of targets(m, k, a.uid)) out.push({ t: 'attack', k, from: a.uid, to: d.uid });
    return out;
  }
  function aiNext(m, k, level = 5) {
    const s = m[k], tap = m.noTap || m.classic ? 0 : TAP_AI[level];
    if (m.script && m.script[k] && m.script[k][s.turns]) {
      const q = m.script[k][s.turns], nx = q.find(x => !x.done);
      if (nx) { nx.done = true; return Object.assign({ k }, nx.a); }
      return { t: 'heave', k, tap };
    }
    const h = heaveOf(m, k, tap);
    if (h.net >= m.win - m.rope * dir(k)) return { t: 'heave', k, tap };
    m._ai = m._ai && m._ai.turn === m.turnNo ? m._ai : { turn: m.turnNo, plays: 0 };
    if (m._ai.plays >= [2, 3, 6, 14, 14, 14][level]) return { t: 'heave', k, tap };
    const base = evaluate(m, k, level);
    let best = null;
    const scored = [];
    for (const a of candidates(m, k, level)) {
      const c = clone(m); const r = act(c, a); if (!r.ok) continue;
      let v = evaluate(c, k, level);
      if (level === 1 && a.t === 'attack' && !r.ev.some(e => e.t === 'ko' && e.k !== k)) v -= 2;
      scored.push({ a, v, c });
      if (!best || v > best.v) best = { a, v };
    }
    // strong masters look one more move ahead for their best few options
    if (level >= 4 && scored.length) {
      scored.sort((x, y) => y.v - x.v);
      for (const sc of scored.slice(0, 3)) {
        let follow = sc.v;
        for (const a2 of candidates(sc.c, k, level)) { const c2 = clone(sc.c); if (act(c2, a2).ok) follow = Math.max(follow, evaluate(c2, k, level)); }
        const v = sc.v * 0.5 + follow * 0.5;
        if (v > best.v) best = { a: sc.a, v };
      }
    }
    if (best && best.v > base + 0.05) { m._ai.plays++; return best.a; }
    return { t: 'heave', k, tap };
  }

  /* masters' decks grow stronger with your rank */
  const MASTER_TYPES = ['fire', 'water', 'wind', 'mixed'];
  const SPLASH = { fire: 'wind', water: 'fire', wind: 'water' }; // covers the type that beats them
  function masterDeck(type, level) {
    const cap = [['common'], ['common', 'rare'], ['common', 'rare'], ['common', 'rare', 'epic'], ['common', 'rare', 'epic', 'legend'], ['common', 'rare', 'epic', 'legend']][level];
    const pool = CARDS.filter(c => cap.includes(c.rarity) && (type === 'mixed' || c.type === type || c.type === SPLASH[type] || c.kind === 'charm')).map(c => c.id);
    // the early masters build plainer decks; from Daimyo on they use the cards that win most
    const deck = buildDeck(pool, { type: type === 'mixed' ? null : type, splash: SPLASH[type], charms: 4, plain: level < 3 });
    if (level === 4) { // at most one legend at Shogun
      const legends = deck.filter(id => BY_ID[id].rarity === 'legend');
      for (const l of legends.slice(1)) { const swap = CARDS.find(c => c.rarity === 'epic' && !deck.includes(c.id) && (type === 'mixed' || c.type === type)); if (swap) deck[deck.indexOf(l)] = swap.id; }
    }
    return deck;
  }

  return { C, CARDS, BY_ID, TYPES, AB, BONDS, BOND_BY, EVENTS, RARITY_NAME, STARTER, STARTER_DECK, MASTER_TYPES, RATING, beats, other, dir, seeded, shuffle, newMatch, beginTurn, act, eventNow, round,
    find, has, powerOf, gripOf, teamGrip, hiddenNow, frozenNow, canAttack, targets, damageOf, heaveOf, costOf, playable, charmTargets, aiNext, deckProblem, buildDeck, masterDeck, cardScore,
    bondsActive, bondText, abText, TAP_AI, _place: (m, k, id, token) => place(m, k, id, [], { token }) };
})();
if (typeof module !== 'undefined') module.exports = GAME;
