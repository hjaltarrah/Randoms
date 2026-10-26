/* Kizuna Clash — your collection, koban coins, Lucky Bags, the daily stall, decks, missions and quests.
   Everything is kept on this device. Only the shuffle-free parts live here; the duel engine never sees coins. */
const PROF = (() => {
  const G = GAME, BY = G.BY_ID;
  const KEY = 'kz2:profile';
  const ALL = G.CARDS.map(c => c.id);
  const PRICE = { common: 60, rare: 150, epic: 400, legend: 1000 };
  const REFUND = { common: 10, rare: 25, epic: 60, legend: 150 };
  const REWARD = { rankedWin: 60, rankedLoss: 20, streak: 20, firstWin: 60, rankUp: 200, friendWin: 40, friendLoss: 15, friendDaily: 5 };
  const ODDS = {
    base: { common: 60, rare: 30, epic: 8, legend: 2 },
    rareplus: { rare: 75, epic: 19, legend: 6 },
    golden: { rare: 62, epic: 28, legend: 10 },
    epicplus: { epic: 65, legend: 35 }
  };
  const BAGS = [
    { id: 'fire', name: 'Fire Lucky Bag', price: 100, text: '3 Fire yokai. The third is Rare or better.', pool: c => c.kind === 'yokai' && c.type === 'fire', slots: ['base', 'base', 'rareplus'] },
    { id: 'water', name: 'Water Lucky Bag', price: 100, text: '3 Water yokai. The third is Rare or better.', pool: c => c.kind === 'yokai' && c.type === 'water', slots: ['base', 'base', 'rareplus'] },
    { id: 'wind', name: 'Wind Lucky Bag', price: 100, text: '3 Wind yokai. The third is Rare or better.', pool: c => c.kind === 'yokai' && c.type === 'wind', slots: ['base', 'base', 'rareplus'] },
    { id: 'charm', name: 'Charm Lucky Bag', price: 80, text: '3 charms and traps. The third is Rare or better.', pool: c => c.kind === 'charm', slots: ['base', 'base', 'rareplus'] },
    { id: 'golden', name: 'Golden Lucky Bag', price: 300, text: '3 yokai of any type, all Rare or better. The third is Epic or Legend.', pool: c => c.kind === 'yokai', slots: ['golden', 'golden', 'epicplus'] }
  ];
  const BAG_BY = Object.fromEntries(BAGS.map(b => [b.id, b]));

  /* daily missions: three a day, picked by the date */
  const MISSIONS = [
    { id: 'win2', text: 'Win 2 duels', goal: 2, coins: 80, stat: 'wins' },
    { id: 'play3', text: 'Play 3 duels', goal: 3, coins: 60, stat: 'duels' },
    { id: 'ko6', text: 'Knock 6 rival yokai off the rope', goal: 6, coins: 60, stat: 'kos' },
    { id: 'sum15', text: 'Summon 15 yokai', goal: 15, coins: 50, stat: 'summons' },
    { id: 'charm5', text: 'Play 5 charms', goal: 5, coins: 50, stat: 'charms' },
    { id: 'combo3', text: 'Play 3 or more cards in one turn, twice', goal: 2, coins: 60, stat: 'bigcombo' },
    { id: 'bond1', text: 'Form a Kizuna Bond', goal: 1, coins: 70, stat: 'bonds' },
    { id: 'fire5', text: 'Summon 5 Fire yokai', goal: 5, coins: 60, stat: 'sum_fire', group: 'type' },
    { id: 'water5', text: 'Summon 5 Water yokai', goal: 5, coins: 60, stat: 'sum_water', group: 'type' },
    { id: 'wind5', text: 'Summon 5 Wind yokai', goal: 5, coins: 60, stat: 'sum_wind', group: 'type' },
    { id: 'pull30', text: 'Pull the knot 30 steps toward you', goal: 30, coins: 60, stat: 'pulled' },
    { id: 'big8', text: 'Move the knot 8 or more with one heave', goal: 1, coins: 50, stat: 'bigheave' },
    { id: 'fast', text: 'Win a duel within 5 of your turns', goal: 1, coins: 80, stat: 'fastwin' },
    { id: 'bag1', text: 'Open a Lucky Bag', goal: 1, coins: 40, stat: 'bags' },
    { id: 'legend1', text: 'Summon a Legend', goal: 1, coins: 60, stat: 'sum_legend', needs: 'legend' }
  ];
  /* one-time quests */
  const QUESTS = [
    { id: 'q_tut', text: 'Finish the tutorial', goal: 1, coins: 200, stat: 'tutorial' },
    { id: 'q_win1', text: 'Win your first ranked duel', goal: 1, coins: 100, stat: 'rankedWins' },
    { id: 'q_deck', text: 'Save a deck you built yourself', goal: 1, coins: 100, stat: 'decksBuilt' },
    { id: 'q_bags5', text: 'Open 5 Lucky Bags', goal: 5, coins: 150, stat: 'bagsTotal' },
    { id: 'q_legend', text: 'Find your first Legend', goal: 1, coins: 150, stat: 'legends' },
    { id: 'q_friend', text: 'Win a live duel against a friend', goal: 1, coins: 150, stat: 'friendWins' },
    { id: 'q_win10', text: 'Win 10 ranked duels', goal: 10, coins: 300, stat: 'rankedWins' },
    { id: 'q_col100', text: 'Collect 100 cards', goal: 100, coins: 200, stat: 'collection' },
    { id: 'q_ko100', text: 'Knock 100 rival yokai off the rope', goal: 100, coins: 300, stat: 'kosTotal' },
    { id: 'q_col200', text: 'Collect 200 cards', goal: 200, coins: 400, stat: 'collection' },
    { id: 'q_win50', text: 'Win 50 ranked duels', goal: 50, coins: 800, stat: 'rankedWins' },
    { id: 'q_col300', text: 'Collect 300 cards', goal: 300, coins: 800, stat: 'collection' },
    { id: 'q_bond5', text: 'Form 5 Kizuna Bonds', goal: 5, coins: 300, stat: 'bondsTotal' },
    { id: 'q_master', text: 'Reach Kizuna Master rank', goal: 1, coins: 1000, stat: 'master' },
    { id: 'q_colall', text: `Collect all ${ALL.length} cards`, goal: ALL.length, coins: 3000, stat: 'collection' }
  ];

  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  const load = () => { try { const v = localStorage.getItem(KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; } };
  let P = load();
  function fresh() {
    let returning = false, tut = false;
    try { tut = localStorage.getItem('kz2:tutorialDone') === 'true'; returning = tut || !!localStorage.getItem('kz2:stats'); } catch (e) { /* storage unavailable */ }
    return {
      v: 2, coins: returning ? 500 : 300, owned: Object.fromEntries(G.STARTER.map(id => [id, 1])), seen: {},
      decks: [{ name: 'Starter Tug', cards: G.STARTER_DECK.slice() }, { name: 'Deck 2', cards: [] }, { name: 'Deck 3', cards: [] }], active: 0,
      life: { rankedWins: 0, friendWins: 0, bagsTotal: 0, kosTotal: 0, decksBuilt: 0, bondsTotal: 0, tutorial: tut ? 1 : 0, master: 0 },
      day: { date: '', stats: {}, claimed: {}, firstWin: false, friendRewards: 0, stall: [] }, quests: {}, welcome: returning
    };
  }
  if (!P || P.v !== 2) P = fresh();
  for (const id of G.STARTER) P.owned[id] = 1;
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) { /* storage unavailable */ } };
  save();

  /* ---------- day rollover ---------- */
  function day() {
    const d = today();
    if (P.day.date !== d) P.day = { date: d, stats: {}, claimed: {}, firstWin: false, friendRewards: 0, stall: [] };
    return P.day;
  }
  function dailyMissions() {
    const rand = G.seeded('missions:' + day().date);
    const hasLegend = Object.keys(P.owned).some(id => BY[id] && BY[id].rarity === 'legend');
    const out = [];
    for (const m of G.shuffle(MISSIONS, rand)) {
      if (out.length >= 3) break;
      if (m.needs === 'legend' && !hasLegend) continue;
      if (m.group && out.some(x => x.group === m.group)) continue;
      out.push(m);
    }
    return out;
  }

  /* ---------- collection ---------- */
  const owns = id => !!P.owned[id];
  const ownedIds = () => ALL.filter(owns);
  const legendsOwned = () => ownedIds().filter(id => BY[id].rarity === 'legend').length;
  function grant(id) { // returns { id, isNew, refund }
    if (owns(id)) { const r = REFUND[BY[id].rarity]; P.coins += r; return { id, isNew: false, refund: r }; }
    P.owned[id] = 1; P.seen[id] = 0; return { id, isNew: true, refund: 0 };
  }
  const isNewCard = id => P.seen[id] === 0;
  function markSeen() { let n = 0; for (const k in P.seen) if (P.seen[k] === 0) { P.seen[k] = 1; n++; } if (n) save(); }

  /* ---------- Lucky Bags ---------- */
  function rollRarity(table, avail, r) {
    const entries = Object.entries(table).filter(([k]) => avail.has(k));
    const total = entries.reduce((x, [, w]) => x + w, 0);
    let roll = r() * total;
    for (const [k, w] of entries) { roll -= w; if (roll < 0) return k; }
    return entries[entries.length - 1][0];
  }
  function openBag(bagId, r = Math.random) {
    const bag = BAG_BY[bagId];
    if (!bag) return { ok: false, why: 'No such bag.' };
    if (P.coins < bag.price) return { ok: false, why: `You need ${bag.price} koban.` };
    P.coins -= bag.price;
    const pool = G.CARDS.filter(bag.pool), avail = new Set(pool.map(c => c.rarity));
    const got = [], picked = new Set();
    for (const slot of bag.slots) {
      const rar = rollRarity(ODDS[slot], avail, r);
      const ofRar = pool.filter(c => c.rarity === rar && !picked.has(c.id));
      const unowned = ofRar.filter(c => !owns(c.id));
      const from = unowned.length && r() < 0.75 ? unowned : ofRar.length ? ofRar : pool;
      const c = from[Math.floor(r() * from.length)];
      picked.add(c.id);
      got.push(Object.assign(grant(c.id), { rarity: c.rarity }));
    }
    P.life.bagsTotal++; bump('bags', 1);
    save();
    return { ok: true, bag, cards: got };
  }
  const foundIn = bagId => { const pool = G.CARDS.filter(BAG_BY[bagId].pool); return { have: pool.filter(c => owns(c.id)).length, of: pool.length }; };
  function bagFor(id) { const c = BY[id]; return c.kind === 'charm' ? BAG_BY.charm : BAG_BY[c.type]; }

  /* ---------- daily stall: three cards for sale each day ---------- */
  function stall() {
    const d = day();
    const rand = G.seeded('stall:' + d.date);
    const pick = list => G.shuffle(list, rand);
    let cand = pick(ALL.filter(id => !owns(id)));
    if (!d.stallIds) { // fix today's three so buying one doesn't reshuffle the others
      const ids = [];
      const want = ['common', 'rare', 'epic'];
      for (const w of want) { const id = cand.find(x => BY[x].rarity === w && !ids.includes(x)) || cand.find(x => !ids.includes(x)); if (id) ids.push(id); }
      if (rand() < 0.35) { const leg = cand.find(x => BY[x].rarity === 'legend' && !ids.includes(x)); if (leg) ids[ids.length - 1] = leg; }
      for (const x of pick(ALL)) { if (ids.length >= 3) break; if (!ids.includes(x)) ids.push(x); }
      d.stallIds = ids; save();
    }
    return d.stallIds.map(id => ({ id, price: PRICE[BY[id].rarity], bought: (d.stall || []).includes(id), owned: owns(id) }));
  }
  function buyStall(id) {
    const d = day(), item = stall().find(x => x.id === id);
    if (!item || item.bought) return { ok: false, why: 'Sold out.' };
    if (P.coins < item.price) return { ok: false, why: `You need ${item.price} koban.` };
    P.coins -= item.price; d.stall = (d.stall || []).concat(id);
    const res = grant(id); save();
    return Object.assign({ ok: true }, res);
  }

  /* ---------- decks ---------- */
  const deck = i => P.decks[i];
  function deckProblem(cards) {
    const p = G.deckProblem(cards);
    if (p) return p;
    const missing = cards.filter(id => !owns(id));
    return missing.length ? `You don't own ${BY[missing[0]].name} yet.` : null;
  }
  function setDeck(i, cards, name) {
    const d = P.decks[i];
    const was = d.cards.join(',');
    d.cards = cards.filter(id => BY[id]).slice(0, G.C.DECK);
    if (name != null) d.name = String(name).replace(/[\u0000-\u001f]/g, '').slice(0, 16) || `Deck ${i + 1}`;
    if (d.cards.length === G.C.DECK && !G.deckProblem(d.cards) && d.cards.join(',') !== was && d.cards.join(',') !== G.STARTER_DECK.join(',')) P.life.decksBuilt = Math.max(P.life.decksBuilt, 1);
    save();
  }
  function setActive(i) { P.active = i; save(); }
  /* the deck you duel with (falls back to the starter deck if yours isn't finished) */
  function activeDeck() {
    const d = P.decks[P.active];
    return d && !deckProblem(d.cards) ? d.cards.slice() : null;
  }
  function autoFill(i) {
    const d = P.decks[i], have = d.cards.filter(owns);
    if (have.length >= G.C.DECK) return;
    const types = {};
    for (const id of have) if (BY[id].kind === 'yokai') types[BY[id].type] = (types[BY[id].type] || 0) + 1;
    const main = Object.entries(types).sort((a, b) => b[1] - a[1])[0];
    const pool = ownedIds().filter(id => !have.includes(id));
    const fill = G.buildDeck(pool.concat(have), { type: main ? main[0] : null, charms: 3 });
    // keep the player's picks first, then the builder's choices
    const legendsHave = have.filter(id => BY[id].rarity === 'legend').length;
    let legends = legendsHave;
    const out = have.slice();
    for (const id of fill.concat(G.buildDeck(pool))) {
      if (out.length >= G.C.DECK) break;
      if (out.includes(id)) continue;
      if (BY[id].rarity === 'legend') { if (legends >= G.C.MAX_LEGENDS) continue; legends++; }
      out.push(id);
    }
    setDeck(i, out);
  }

  /* ---------- missions & quests ---------- */
  function bump(stat, n) { const d = day(); d.stats[stat] = (d.stats[stat] || 0) + n; }
  function questStat(stat) {
    if (stat === 'collection') return ownedIds().length;
    if (stat === 'legends') return legendsOwned();
    return P.life[stat] || 0;
  }
  function missions() {
    const d = day();
    return dailyMissions().map(m => ({ m, prog: Math.min(m.goal, d.stats[m.stat] || 0), done: (d.stats[m.stat] || 0) >= m.goal, claimed: !!d.claimed[m.id] }));
  }
  function quests() {
    return QUESTS.map(q => ({ m: q, prog: Math.min(q.goal, questStat(q.stat)), done: questStat(q.stat) >= q.goal, claimed: !!P.quests[q.id] }));
  }
  function claim(id) {
    const d = day();
    const ms = missions().find(x => x.m.id === id);
    if (ms) { if (!ms.done || ms.claimed) return 0; d.claimed[id] = 1; P.coins += ms.m.coins; save(); return ms.m.coins; }
    const qs = quests().find(x => x.m.id === id);
    if (qs) { if (!qs.done || qs.claimed) return 0; P.quests[id] = 1; P.coins += qs.m.coins; save(); return qs.m.coins; }
    return 0;
  }
  const claimable = () => missions().filter(x => x.done && !x.claimed).length + quests().filter(x => x.done && !x.claimed).length;

  /* ---------- after a duel ---------- */
  /* t: { mode: 'ai'|'online', won, draw, turns, kos, summons, sumType:{fire,water,wind}, sumLegend, charms, pulled, bigheave, rank: {delta, rankUp, master} } */
  function recordDuel(t) {
    const d = day(), lines = [];
    const before = missions().filter(x => x.done).map(x => x.m.id);
    bump('duels', 1);
    if (t.won) bump('wins', 1);
    bump('kos', t.kos || 0); P.life.kosTotal += t.kos || 0;
    bump('summons', t.summons || 0);
    for (const ty of ['fire', 'water', 'wind']) bump('sum_' + ty, (t.sumType && t.sumType[ty]) || 0);
    bump('sum_legend', t.sumLegend || 0);
    bump('charms', t.charms || 0);
    bump('pulled', t.pulled || 0);
    bump('bigcombo', t.bigcombo || 0);
    bump('bonds', t.bonds || 0); P.life.bondsTotal = (P.life.bondsTotal || 0) + (t.bonds || 0);
    if ((t.bigheave || 0) >= 8) bump('bigheave', 1);
    if (t.won && t.turns <= 5) bump('fastwin', 1);
    if (t.mode === 'ai') {
      if (t.won) {
        lines.push(['Win', REWARD.rankedWin]); P.life.rankedWins++;
        if (t.streak >= 3) lines.push([`${t.streak} wins in a row`, REWARD.streak]);
        if (!d.firstWin) { d.firstWin = true; lines.push(['First win today', REWARD.firstWin]); }
      } else if (!t.draw) lines.push(['Good tug', REWARD.rankedLoss]);
      else lines.push(['Draw', REWARD.rankedLoss]);
      if (t.rankUp) lines.push([`Reached ${t.rankUp}`, REWARD.rankUp]);
      if (t.master) P.life.master = 1;
    } else if (t.mode === 'online') {
      if (t.won) P.life.friendWins++;
      if (d.friendRewards < REWARD.friendDaily) { d.friendRewards++; lines.push([t.won ? 'Friend duel win' : 'Friend duel', t.won ? REWARD.friendWin : REWARD.friendLoss]); }
    }
    const coins = lines.reduce((x, l) => x + l[1], 0);
    P.coins += coins;
    const done = missions().filter(x => x.done && !before.includes(x.m.id)).map(x => x.m.text);
    save();
    return { lines, coins, done };
  }
  function recordTutorial() { if (!P.life.tutorial) { P.life.tutorial = 1; save(); } }

  return {
    BAGS, BAG_BY, PRICE, REFUND, REWARD, ODDS, ALL,
    get coins() { return P.coins; }, get active() { return P.active; }, get welcome() { return P.welcome; },
    clearWelcome() { P.welcome = false; save(); },
    owns, ownedIds, isNewCard, markSeen, openBag, foundIn, bagFor, stall, buyStall,
    deck, setDeck, setActive, activeDeck, autoFill, deckProblem, missions, quests, claim, claimable, recordDuel, recordTutorial,
    _p: () => P, _reset() { P = fresh(); save(); }
  };
})();
