/* Kizuna Clash — ranked ladder and the festival masters you face */
const LADDER = (() => {
  const RANKS = [
    { name: 'Ashigaru', kanji: '足軽', rp: 0, level: 0 },
    { name: 'Samurai', kanji: '侍', rp: 40, level: 1 },
    { name: 'Hatamoto', kanji: '旗本', rp: 100, level: 2 },
    { name: 'Daimyo', kanji: '大名', rp: 180, level: 3 },
    { name: 'Shogun', kanji: '将軍', rp: 280, level: 4 },
    { name: 'Kizuna Master', kanji: '絆', rp: 400, level: 5 }
  ];
  const STAKE = 10, STREAK_BONUS = 5;
  const rankOf = rp => RANKS.reduce((r, x) => (rp >= x.rp ? x : r), RANKS[0]);
  const nextOf = rp => RANKS.find(x => x.rp > rp) || null;
  /* four festival masters; their decks grow rarer as you climb, and their avatar is their strongest yokai */
  const MASTERS = {
    fire: { id: 'fire', name: 'Homura', title: 'Master of the Flame Festival', style: 'Fire yokai, with a few Wind friends' },
    water: { id: 'water', name: 'Mizuha', title: 'Master of the River Festival', style: 'Water yokai, with a few Fire friends' },
    wind: { id: 'wind', name: 'Hayate', title: 'Master of the Kite Festival', style: 'Wind yokai, with a few Water friends' },
    mixed: { id: 'mixed', name: 'Kagura', title: 'Leader of the Grand Parade', style: 'the best of every type' }
  };
  const ORDER = ['fire', 'water', 'wind', 'mixed'];
  const deckLead = deck => deck.map(id => GAME.BY_ID[id]).filter(c => c.kind === 'yokai').sort((a, b) => b.cost - a.cost || b.power - a.power)[0].id;
  function master(i, level) {
    const m = MASTERS[ORDER[((i % 4) + 4) % 4]], deck = GAME.masterDeck(m.id, level);
    return Object.assign({ deck, lead: deckLead(deck) }, m);
  }
  const LINES = {
    start: ['Grab the rope. Let\'s see your grip!', 'No luck here, only strength.', 'My team never lets go.', 'Ready? Heave!'],
    bigPull: ['Feel that pull?', 'Ha! Come back here!', 'Heave-ho!'],
    ko: ['Off the rope you go!', 'Too slow!', 'Next!'],
    lostOne: ['Hey! Play nice!', 'Tch. Lucky... no, good move.', 'You\'ll pay for that.'],
    close: ['Almost there...', 'Just one more heave!'],
    danger: ['Hold on, team, HOLD ON!', 'This isn\'t over!'],
    win: ['Train your grip and come back.', 'A great tug. Mine, though!'],
    lose: ['...You earned that.', 'Next festival, I win.']
  };
  let n = 0;
  const line = kind => { const l = LINES[kind]; return l[(n++) % l.length]; };

  function settle(stats, won, draw) {
    const before = stats.rp, beforeRank = rankOf(before);
    let delta = 0;
    if (draw) delta = 0;
    else if (won) { stats.streak = (stats.streak || 0) + 1; delta = STAKE + (stats.streak >= 3 ? STREAK_BONUS : 0); stats.wins = (stats.wins || 0) + 1; }
    else { stats.streak = 0; delta = -STAKE; stats.losses = (stats.losses || 0) + 1; }
    stats.rp = Math.max(beforeRank.rp, before + delta); // you never drop below the floor of your current rank
    const after = rankOf(stats.rp);
    return { delta: stats.rp - before, rankUp: after.rp > beforeRank.rp ? after : null, top: after === RANKS[RANKS.length - 1] };
  }
  function badgeHTML(stats) {
    const r = rankOf(stats.rp), nx = nextOf(stats.rp);
    const pct = nx ? Math.round(100 * (stats.rp - r.rp) / (nx.rp - r.rp)) : 100;
    return `<div class="rank"><span class="rk">${r.kanji}</span><div class="rinfo"><b>${r.name}</b><span>${stats.rp} RP${nx ? ` · ${nx.rp - stats.rp} to ${nx.name}` : ' · top rank'}${stats.streak >= 2 ? ` · ${stats.streak} wins in a row` : ''}</span>
      <div class="rbar"><i style="width:${pct}%"></i></div></div></div>`;
  }
  return { RANKS, STAKE, rankOf, nextOf, MASTERS, ORDER, master, deckLead, line, settle, badgeHTML };
})();
