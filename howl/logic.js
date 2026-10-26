/* Howl — rules engine. Pure functions over plain objects, no DOM and no network,
   so the host's phone runs it and Node can test it. Players act by their ORIGINAL card
   (the Doppelganger by the role it copied); teams are decided by the card in front of
   each player at dawn. */
(function (root) {
  'use strict';

  const ROLES = {
    werewolf:     { name: 'Werewolf',     plural: 'Werewolves',    team: 'wolf',    max: 2, blurb: 'Wake with the other Werewolves. If you are the only one, you may look at one center card.' },
    minion:       { name: 'Minion',       plural: 'Minions',       team: 'wolf',    max: 1, blurb: 'See who the Werewolves are. They don’t know you. You win if no Werewolf dies, even if you die.' },
    doppelganger: { name: 'Doppelganger', plural: 'Doppelgangers', team: 'village', max: 1, blurb: 'Look at another player’s card and become that role, team and all.' },
    seer:         { name: 'Seer',         plural: 'Seers',         team: 'village', max: 1, blurb: 'Look at another player’s card, or at two of the center cards.' },
    robber:       { name: 'Robber',       plural: 'Robbers',       team: 'village', max: 1, blurb: 'You may swap your card with another player’s, then look at your new card.' },
    troublemaker: { name: 'Troublemaker', plural: 'Troublemakers', team: 'village', max: 1, blurb: 'You may swap the cards of two other players without looking at them.' },
    drunk:        { name: 'Drunk',        plural: 'Drunks',        team: 'village', max: 1, blurb: 'Swap your card with a center card without looking at it.' },
    insomniac:    { name: 'Insomniac',    plural: 'Insomniacs',    team: 'village', max: 1, blurb: 'At the end of the night, look at your own card to see if it changed.' },
    mason:        { name: 'Mason',        plural: 'Masons',        team: 'village', max: 2, pair: true, blurb: 'Wake up and see the other Mason. Masons always come as a pair.' },
    hunter:       { name: 'Hunter',       plural: 'Hunters',       team: 'village', max: 1, blurb: 'No night action. If you die, the player you voted for dies too.' },
    villager:     { name: 'Villager',     plural: 'Villagers',     team: 'village', max: 3, blurb: 'No night action. Talk, bluff and find a Werewolf.' },
  };
  /* deck-builder order: the evil cards first, then the night order, then the quiet roles */
  const ROLE_KEYS = ['werewolf', 'minion', 'doppelganger', 'seer', 'robber', 'troublemaker', 'drunk', 'insomniac', 'mason', 'hunter', 'villager'];

  /* night order; seconds per step at normal pace. Every step in the deck runs its full time,
     even when that card sits in the center, so nobody learns anything from the clock. */
  const NIGHT = [
    { role: 'doppelganger', dur: 30 },
    { role: 'werewolf', dur: 13 },
    { role: 'minion', dur: 9 },
    { role: 'mason', dur: 9 },
    { role: 'seer', dur: 16 },
    { role: 'robber', dur: 13 },
    { role: 'troublemaker', dur: 15 },
    { role: 'drunk', dur: 11 },
    { role: 'insomniac', dur: 9 },
  ];
  const ACTS_NOW = ['seer', 'robber', 'troublemaker', 'drunk']; // a Doppelganger copying these acts during its own turn
  const MIN_PLAYERS = 3, MAX_PLAYERS = 12;
  const CENTER_NAMES = ['left', 'middle', 'right'];

  const rnd = rng => (rng || Math.random)();
  const pick = (arr, rng) => arr[Math.floor(rnd(rng) * arr.length)];
  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd(rng) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  /* ---------- deck ---------- */
  function cleanDeck(deck) {
    const d = {};
    for (const k of ROLE_KEYS) {
      let n = Math.max(0, Math.min(ROLES[k].max, (deck && deck[k]) | 0));
      if (ROLES[k].pair && n === 1) n = 0;
      if (n) d[k] = n;
    }
    return d;
  }
  const deckSize = deck => ROLE_KEYS.reduce((s, k) => s + ((deck && deck[k]) | 0), 0);
  const deckList = deck => ROLE_KEYS.flatMap(k => Array((deck && deck[k]) | 0).fill(k));
  const evilCount = deck => ((deck.werewolf | 0) + (deck.minion | 0));

  /* how many bad cards suit a table of n players (the deck always has n + 3 cards) */
  function recommend(n) {
    if (n <= 4) return { werewolf: 2, minion: 0, text: '2 Werewolves, no Minion', why: 'With so few players, a Minion makes the bad team too strong.' };
    if (n === 5) return { werewolf: 2, minion: 0, optionalMinion: true, text: '2 Werewolves (a Minion is optional)', why: 'Add the Minion if your group is good at catching Werewolves.' };
    return { werewolf: 2, minion: 1, text: '2 Werewolves and 1 Minion', why: 'Bigger tables need a Minion to give the Werewolves cover.' };
  }

  /* a balanced deck for n players, as a starting point the host can change */
  function suggestDeck(n) {
    n = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, n | 0));
    const want = n + 3, rec = recommend(n), d = {};
    const add = (k, c = 1) => { d[k] = (d[k] || 0) + c; };
    const size = () => deckSize(d);
    add('werewolf', 2); add('seer'); add('robber'); add('troublemaker'); add('villager');
    if (rec.minion) add('minion');
    for (const [k, c] of [['insomniac', 1], ['drunk', 1], ['hunter', 1], ['mason', 2], ['doppelganger', 1], ['villager', 1], ['villager', 1]]) {
      if (size() + c <= want) add(k, c);
    }
    while (size() > want) { // only for 3 players, where the base set is already 6
      for (const k of ['villager', 'troublemaker']) if (size() > want && d[k]) { d[k]--; if (!d[k]) delete d[k]; }
    }
    return d;
  }

  /* checks before the host can start; problems block, notes don't */
  function checkDeck(deck, n) {
    const problems = [], notes = [], size = deckSize(deck), want = n + 3;
    if (n < MIN_PLAYERS) problems.push(`You need at least ${MIN_PLAYERS} players.`);
    if (n > MAX_PLAYERS) problems.push(`At most ${MAX_PLAYERS} players can play.`);
    if (size !== want) problems.push(size < want ? `Add ${want - size} more card${want - size === 1 ? '' : 's'} (${n} players + 3 in the center = ${want}).` : `Remove ${size - want} card${size - want === 1 ? '' : 's'} (${n} players + 3 in the center = ${want}).`);
    if (!deck.werewolf) problems.push('Put at least one Werewolf in.');
    if (deck.mason === 1) problems.push('Masons come as a pair: use both or none.');
    if (deck.insomniac && !deck.robber && !deck.troublemaker && !deck.doppelganger) notes.push('The Insomniac learns nothing without a Robber or Troublemaker.');
    const rec = recommend(n), evil = evilCount(deck), recEvil = rec.werewolf + rec.minion;
    let balance = 'ok';
    if (evil < recEvil && !(rec.optionalMinion && evil === recEvil)) balance = 'light';
    if (evil > recEvil + (rec.optionalMinion ? 1 : 0)) balance = 'heavy';
    return { ok: problems.length === 0, problems, notes, size, want, balance, rec, evil };
  }

  /* ---------- a round ---------- */
  function newRound(seats, deck, rng) {
    const cards = shuffle(deckList(deck), rng);
    if (cards.length !== seats.length + 3) throw new Error('deck size');
    const g = {
      seats: seats.slice(), orig: {}, cur: {}, center0: cards.slice(seats.length), center: cards.slice(seats.length),
      steps: NIGHT.filter(s => deck[s.role]).map(s => s.role), si: -1,
      dop: { pid: null, copy: null, target: null },
      pending: {}, info: {}, log: [],
    };
    seats.forEach((p, i) => { g.orig[p] = cards[i]; g.cur[p] = cards[i]; g.info[p] = []; });
    g.dop.pid = seats.find(p => g.orig[p] === 'doppelganger') || null;
    return g;
  }

  const has = (g, p) => g.seats.includes(p);
  const tell = (g, p, line) => { g.info[p].push(line); };
  const story = (g, line) => { g.log.push(line); };

  /* who is awake for a night step */
  function awake(g, role) {
    const list = g.seats.filter(p => g.orig[p] === role);
    if (role !== 'doppelganger' && g.dop.pid && g.dop.copy === role && !ACTS_NOW.includes(role)) list.push(g.dop.pid);
    return list;
  }

  function spec(role, as) {
    switch (role) {
      case 'doppelganger': return { kind: 'player', n: 1, optional: false, as, prompt: 'Pick a player whose card you will copy.' };
      case 'seer': return { kind: 'seer', optional: true, as, prompt: 'Look at one player’s card, or two center cards.' };
      case 'robber': return { kind: 'player', n: 1, optional: true, as, prompt: 'Pick a player to swap cards with. You will see your new card.' };
      case 'troublemaker': return { kind: 'player', n: 2, optional: true, as, prompt: 'Pick two other players to swap their cards.' };
      case 'drunk': return { kind: 'center', n: 1, optional: false, as, prompt: 'Pick a center card to swap with yours. You won’t see it.' };
      case 'lonewolf': return { kind: 'center', n: 1, optional: true, as, prompt: 'You are the only Werewolf. You may look at one center card.' };
    }
    return null;
  }

  /* begin step i: hand out what each awake player sees and what they must choose */
  function startStep(g, i) {
    g.si = i; g.pending = {};
    const role = g.steps[i];
    const who = awake(g, role);
    const names = ps => ps.map(p => ({ p }));
    if (role === 'doppelganger') {
      who.forEach(p => { g.pending[p] = spec('doppelganger', 'doppelganger'); });
    } else if (role === 'werewolf') {
      who.forEach(p => {
        if (who.length === 1) { tell(g, p, ['You are the only Werewolf awake.']); g.pending[p] = spec('lonewolf', 'werewolf'); }
        else tell(g, p, ['The Werewolves are ', ...joinList(names(who))]);
      });
      if (who.length > 1) story(g, ['The ', { r: 'werewolf', pl: 1 }, ' ', ...joinList(names(who)), ' saw each other.']);
      if (who.length === 0) story(g, ['No ', { r: 'werewolf', pl: 1 }, ' woke up — they were in the center.']);
    } else if (role === 'minion') {
      const wolves = awake(g, 'werewolf');
      who.forEach(p => tell(g, p, wolves.length ? ['The Werewolves are ', ...joinList(names(wolves))] : ['No players are Werewolves. They’re in the center.']));
      who.forEach(p => story(g, [{ p }, ' (', { r: 'minion' }, ') ', wolves.length ? 'saw the Werewolves.' : 'saw that no player was a Werewolf.']));
    } else if (role === 'mason') {
      who.forEach(p => {
        const others = who.filter(q => q !== p);
        tell(g, p, others.length ? [others.length > 1 ? 'The other Masons are ' : 'The other Mason is ', ...joinList(names(others))] : ['You are the only Mason awake. The other one is in the center.']);
      });
      if (who.length) story(g, ['The ', { r: 'mason', pl: 1 }, ' ', ...joinList(names(who)), who.length > 1 ? ' saw each other.' : ' woke up alone.']);
    } else if (role === 'insomniac') {
      who.forEach(p => {
        tell(g, p, ['You checked your card again: ', { r: g.cur[p] }, g.cur[p] === g.orig[p] ? '. It didn’t change.' : '.']);
        story(g, [{ p }, ' (', { r: p === g.dop.pid ? 'doppelganger' : 'insomniac' }, ') checked their card at dawn and saw ', { r: g.cur[p] }, '.']);
      });
    } else {
      who.forEach(p => { g.pending[p] = spec(role, role); });
    }
    return who;
  }

  /* validate and apply one choice. a = {players:[...]} | {center:[...]} | {skip:true}. Returns true if taken. */
  function act(g, p, a) {
    const s = g.pending[p];
    if (!s || !a) return false;
    const others = (a.players || []).filter(q => has(g, q) && q !== p);
    const uniq = arr => arr.length === new Set(arr).size;
    const centers = (a.center || []).filter(i => Number.isInteger(i) && i >= 0 && i < 3);
    const asRole = s.as;

    if (a.skip) {
      if (!s.optional) return false;
      delete g.pending[p];
      const msg = { seer: 'You chose not to look at anything.', robber: 'You chose not to rob anyone.', troublemaker: 'You chose not to swap anyone.', werewolf: 'You chose not to look at a center card.' }[asRole] || 'You did nothing.';
      tell(g, p, [msg]);
      story(g, [{ p }, ' (', { r: asRole === 'werewolf' ? 'werewolf' : roleLabel(g, p, asRole) }, ') did nothing.']);
      return true;
    }

    if (s.kind === 'player' && asRole === 'doppelganger') {
      if (others.length !== 1) return false;
      const t = others[0], copy = g.cur[t];
      g.dop.copy = copy; g.dop.target = t;
      tell(g, p, ['You copied ', { p: t }, '’s card: ', { r: copy }, '. You are now the ', { r: copy }, '.']);
      story(g, [{ p }, ' (', { r: 'doppelganger' }, ') copied ', { p: t }, ' and became the ', { r: copy }, '.']);
      if (ACTS_NOW.includes(copy)) {
        g.pending[p] = spec(copy, copy);
        tell(g, p, ['Do the ', { r: copy }, '’s action now.']);
      } else {
        delete g.pending[p];
        const later = { werewolf: 'You will wake up with the Werewolves.', minion: 'You will see the Werewolves when the Minion wakes.', mason: 'You will wake up with the Masons.', insomniac: 'You will check your card when the Insomniac wakes.' }[copy];
        tell(g, p, [later || 'You have nothing else to do tonight.']);
      }
      return true;
    }

    if (s.kind === 'seer') {
      if (others.length === 1 && !centers.length) {
        const t = others[0];
        tell(g, p, ['You looked at ', { p: t }, '’s card: ', { r: g.cur[t] }, '.']);
        story(g, [{ p }, ' (', { r: roleLabel(g, p, 'seer') }, ') looked at ', { p: t }, ' and saw ', { r: g.cur[t] }, '.']);
      } else if (centers.length === 2 && uniq(centers) && !others.length) {
        const [i, j] = centers.sort();
        tell(g, p, ['You looked at two center cards. The ', { c: i }, ' is the ', { r: g.center[i] }, ', and the ', { c: j }, ' is the ', { r: g.center[j] }, '.']);
        story(g, [{ p }, ' (', { r: roleLabel(g, p, 'seer') }, ') looked at two center cards: ', { r: g.center[i] }, ' and ', { r: g.center[j] }, '.']);
      } else return false;
      delete g.pending[p]; return true;
    }

    if (s.kind === 'player' && asRole === 'robber') {
      if (others.length !== 1) return false;
      const t = others[0];
      [g.cur[p], g.cur[t]] = [g.cur[t], g.cur[p]];
      tell(g, p, ['You robbed ', { p: t }, '. Your new card: ', { r: g.cur[p] }, '.']);
      story(g, [{ p }, ' (', { r: roleLabel(g, p, 'robber') }, ') robbed ', { p: t }, ' and took the ', { r: g.cur[p] }, '.']);
      delete g.pending[p]; return true;
    }

    if (s.kind === 'player' && asRole === 'troublemaker') {
      if (others.length !== 2 || !uniq(others)) return false;
      const [x, y] = others;
      [g.cur[x], g.cur[y]] = [g.cur[y], g.cur[x]];
      tell(g, p, ['You swapped the cards of ', { p: x }, ' and ', { p: y }, '.']);
      story(g, [{ p }, ' (', { r: roleLabel(g, p, 'troublemaker') }, ') swapped ', { p: x }, ' and ', { p: y }, '.']);
      delete g.pending[p]; return true;
    }

    if (s.kind === 'center' && asRole === 'drunk') {
      if (centers.length !== 1) return false;
      const i = centers[0];
      [g.cur[p], g.center[i]] = [g.center[i], g.cur[p]];
      tell(g, p, ['You swapped your card with the ', { c: i }, '. You don’t know what you are now.']);
      story(g, [{ p }, ' (', { r: roleLabel(g, p, 'drunk') }, ') swapped with the ', { c: i }, ' and became the ', { r: g.cur[p] }, ' without knowing.']);
      delete g.pending[p]; return true;
    }

    if (s.kind === 'center' && asRole === 'werewolf') {
      if (centers.length !== 1) return false;
      const i = centers[0];
      tell(g, p, ['You peeked at the ', { c: i }, ': ', { r: g.center[i] }, '.']);
      story(g, [{ p }, ' (the only ', { r: 'werewolf' }, ' awake) peeked at the ', { c: i }, ' and saw ', { r: g.center[i] }, '.']);
      delete g.pending[p]; return true;
    }
    return false;
  }

  /* how the story names someone acting as a role: a Doppelganger copying it reads "Doppelganger-Seer" */
  function roleLabel(g, p, role) { return p === g.dop.pid && g.dop.copy === role ? 'doppel:' + role : role; }

  /* time's up for the step: required choices are made at random, optional ones are skipped */
  function endStep(g, rng) {
    for (const p of Object.keys(g.pending)) {
      let guard = 0;
      while (g.pending[p] && guard++ < 3) {
        const s = g.pending[p];
        if (s.optional) { act(g, p, { skip: true }); continue; }
        if (s.kind === 'player') act(g, p, { players: [pick(g.seats.filter(q => q !== p), rng)], auto: true });
        else if (s.kind === 'center') act(g, p, { center: [Math.floor(rnd(rng) * 3)], auto: true });
        if (g.pending[p] === s) delete g.pending[p];
      }
    }
    g.pending = {};
  }

  /* ---------- dawn ---------- */
  function finalRole(g, p) {
    const c = g.cur[p];
    if (c === 'doppelganger') return g.dop.copy || 'doppelganger';
    return c;
  }
  const teamOf = role => (ROLES[role] ? ROLES[role].team : 'village');

  /* votes: {pid: targetPid}. Returns deaths, hunter shots and who won. */
  function tally(g, votes) {
    const counts = {};
    g.seats.forEach(p => { counts[p] = 0; });
    for (const p of g.seats) { const t = votes[p]; if (t && t !== p && has(g, t)) counts[t]++; }
    const max = Math.max(0, ...Object.values(counts));
    const dead = new Set(max >= 2 ? g.seats.filter(p => counts[p] === max) : []);
    const voteKills = [...dead], hunterShots = [];
    let changed = true;
    while (changed) {
      changed = false;
      for (const p of [...dead]) {
        const t = votes[p];
        if (finalRole(g, p) === 'hunter' && t && has(g, t) && t !== p && !dead.has(t)) { dead.add(t); hunterShots.push({ hunter: p, target: t }); changed = true; }
      }
    }
    const fr = {}; g.seats.forEach(p => { fr[p] = finalRole(g, p); });
    const wolves = g.seats.filter(p => fr[p] === 'werewolf');
    const minions = g.seats.filter(p => fr[p] === 'minion');
    let villageWin, wolfWin, minionWin, headline, kind;
    if (wolves.length) {
      const wolfDied = wolves.some(p => dead.has(p));
      villageWin = wolfDied; wolfWin = !wolfDied; minionWin = wolfWin;
      kind = wolfDied ? 'village' : 'wolf';
      headline = wolfDied ? 'The village wins' : 'The Werewolves win';
    } else {
      villageWin = dead.size === 0;
      minionWin = minions.length > 0 && [...dead].some(p => fr[p] !== 'minion');
      wolfWin = minionWin;
      if (villageWin) { kind = 'village'; headline = 'The village wins'; }
      else if (minionWin) { kind = 'wolf'; headline = 'The Minion wins'; }
      else { kind = 'none'; headline = 'Nobody wins'; }
    }
    const winners = g.seats.filter(p => (teamOf(fr[p]) === 'wolf' ? (fr[p] === 'minion' ? minionWin : wolfWin) : villageWin));
    let why;
    if (wolves.length) why = kind === 'village' ? 'A Werewolf was killed.' : (dead.size ? 'No Werewolf was killed.' : 'Nobody died, and a Werewolf was among you.');
    else if (kind === 'village') why = 'There were no Werewolves among the players, and nobody died.';
    else if (kind === 'wolf') why = 'There were no Werewolves among the players, but an innocent player died.';
    else why = 'There were no Werewolves among the players, and someone still died.';
    return { counts, max, dead: [...dead], voteKills, hunterShots, finalRoles: fr, wolves, kind, headline, why, winners };
  }

  /* ---------- text helpers shared with the page ---------- */
  function joinList(items) {
    const out = [];
    items.forEach((x, i) => { if (i) out.push(i === items.length - 1 ? ' and ' : ', '); out.push(x); });
    return out;
  }

  const api = { ROLES, ROLE_KEYS, NIGHT, ACTS_NOW, MIN_PLAYERS, MAX_PLAYERS, CENTER_NAMES, shuffle, cleanDeck, deckSize, deckList, evilCount, recommend, suggestDeck, checkDeck, newRound, awake, startStep, act, endStep, finalRole, teamOf, tally, joinList };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.HOWL = api;
})(typeof self !== 'undefined' ? self : this);
