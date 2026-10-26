/* Kizuna Clash — live duels with a friend.
   Both players join a named room ("kz-" + a 4-letter code). Everything travels in each player's presence object,
   which the platform keeps current, re-sends after a reconnect and hands to anyone who arrives:
   each player's deck (12 card ids), the shared shuffle seed (from the host), and a compact log of that player's own moves.
   The engine is deterministic, so applying the other player's moves in order keeps both screens in step. */
const NET = (() => {
  const $ = id => document.getElementById(id);
  const store = KZ.store;
  const V = 6;
  let roomNS, roomState = 'loading'; // loading | ready | none
  let R = null, unsubs = [], role = null, code = '', phase = 'form', note = '', noteBad = false;
  let game = 0, log = [], applied = 0, working = false, oppPeer = null, oppName = '', leftTimer = null, waitTimer = null, againSent = 0;
  const o = Object.assign({ nick: '' }, store.get('online', {}));

  (async () => {
    if (window.KZ_APP && window.MQ_ROOM && window.mqtt) roomNS = MQ_ROOM.ns(); // the Android app uses a public relay
    else { try { roomNS = window.claude && window.claude.use ? await window.claude.use('room') : null; } catch (e) { roomNS = null; } }
    roomState = roomNS ? 'ready' : 'none';
    if (KZ.S.screen === 'online') render();
  })();

  /* ---------- move log codec: p.<card>.<target uid or -> | x.<from uid>.<to uid> | h<tap bonus> ---------- */
  function encode(a) {
    if (a.t === 'play') return `p.${a.card}.${a.target != null ? a.target : '-'}`;
    if (a.t === 'attack') return `x.${a.from}.${a.to}`;
    return 'h' + Math.max(0, Math.min(GAME.C.TAP_MAX, a.tap | 0));
  }
  function decode(tok, k) {
    const p = String(tok).split('.'), n = x => parseInt(x, 10);
    if (p[0] === 'p') return { t: 'play', k, card: p[1], target: p[2] === '-' ? null : n(p[2]) };
    if (p[0] === 'x') return { t: 'attack', k, from: n(p[1]), to: n(p[2]) };
    return { t: 'heave', k, tap: Math.max(0, Math.min(GAME.C.TAP_MAX, parseInt(String(tok).slice(1), 10) || 0)) };
  }

  /* ---------- helpers ---------- */
  const clean = s => String(s || '').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯]/g, '').trim().slice(0, 14);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  /* a deck from the room: any valid 12-card deck is accepted (both phones run the same check, so they agree) */
  const deckOf = str => { const d = String(str || '').split(',').slice(0, GAME.C.DECK); return GAME.deckProblem(d) ? GAME.STARTER_DECK.slice() : d; };
  const myDeck = () => (PROF.activeDeck() || GAME.STARTER_DECK).join(',');
  const me = () => R && R.peers().find(p => p.sameTab);
  const others = () => R ? R.peers().filter(p => !p.sameTab && p.kind === 'viewer' && p.presence && p.presence.app === 'kizuna-tug' && p.presence.v === V) : [];
  const opp = () => others().find(p => p.peer === oppPeer);
  function say(text, bad) { note = text; noteBad = !!bad; const el = $('oNote'); if (el) { el.textContent = text; el.classList.toggle('bad', !!bad); } }
  function setP(patch) { if (R) R.presence(patch).catch(() => say('Could not reach the room. Check your connection.', true)); }
  function newCode() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 4; i++) c += A[Math.floor(Math.random() * A.length)]; return c; }

  /* ---------- the online screen ---------- */
  function render() {
    const body = $('onlineBody'); if (!body) return;
    if (phase === 'wait') {
      body.innerHTML = `<div class="panel roomcode"><span>Room code</span><b>${esc(code)}</b>
          <p>${role === 'host' ? 'Tell your friend to open Kizuna Clash, tap <b>Duel a Friend · Live</b> and enter this code.' : 'Joining your friend\'s room…'}</p></div>
        <p class="onote" id="oNote" aria-live="polite">${esc(note)}</p>
        <button class="btn" type="button" id="oCancel">Leave room</button>`;
      $('oCancel').onclick = () => { leave(); render(); };
      $('oNote').classList.toggle('bad', noteBad);
      return;
    }
    const off = roomState !== 'ready';
    body.innerHTML = `
      <div class="panel"><h3>Live duel, turn by turn</h3><p>One of you creates a room and reads out the 4-letter code. The other joins with it. ${window.KZ_APP ? 'You both need the Kizuna Clash app and an internet connection.' : 'You both need this game open in Claude while signed in.'}</p></div>
      ${roomState === 'none' ? '<div class="panel warn"><p>Live duels are not available in this view. Open the game from its Claude link while signed in. Your friend needs access too: the game\'s owner adds them from the <b>Share</b> menu.</p></div>' : ''}
      <label for="oNick">Your name<input id="oNick" maxlength="14" autocomplete="nickname" placeholder="Name your rival will see" value="${esc(o.nick)}"></label>
      <label>Your deck</label>
      <div class="decktiles" id="oDecks">${SCR.deckTiles(PROF.active, 'data-odeck')}</div>
      <button class="btn red" type="button" id="oCreate" ${off ? 'disabled' : ''}>${roomState === 'loading' ? 'Connecting…' : 'Create a room'}</button>
      <div class="joinrow"><input id="oCode" maxlength="4" size="6" placeholder="CODE" autocapitalize="characters" autocomplete="off" spellcheck="false" aria-label="Room code">
        <button class="btn blue" type="button" id="oJoin" ${off ? 'disabled' : ''}>Join</button></div>
      <p class="onote" id="oNote" aria-live="polite">${esc(note)}</p>`;
    $('oNote').classList.toggle('bad', noteBad);
    $('oNick').oninput = e => { o.nick = clean(e.target.value); save(); };
    $('oDecks').onclick = e => { const b = e.target.closest('[data-odeck]'); if (!b) return; const i = +b.dataset.odeck;
      if (PROF.deckProblem(PROF.deck(i).cards)) return say('That deck isn\'t finished yet. Build it in Decks first.', true);
      PROF.setActive(i); render(); };
    $('oCode').oninput = e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); };
    $('oCreate').onclick = () => enter('host', newCode());
    $('oJoin').onclick = () => { const c = $('oCode').value.trim().toUpperCase(); if (c.length !== 4) return say('Enter the 4-letter code from your friend.', true); enter('guest', c); };
  }
  function save() { store.set('online', o); }

  /* ---------- joining and leaving ---------- */
  async function enter(r, c) {
    if (!roomNS) return;
    if (!o.nick) o.nick = r === 'host' ? 'Host' : 'Guest';
    save();
    role = r; code = c; phase = 'wait'; game = 0; oppPeer = null; againSent = 0;
    say(r === 'host' ? 'Waiting for your friend to join…' : 'Connecting…'); render();
    try { R = await roomNS.join('kz-' + c.toLowerCase()); }
    catch (e) {
      phase = 'form'; R = null; render();
      return say(e && e.code === 'not_permitted' ? 'Your account cannot join live rooms here. The game\'s owner can add you from the Share menu.' : window.KZ_APP ? 'Could not reach the online server. Check your internet and try again.' : 'Could not open the room. Try again in a moment.', true);
    }
    unsubs.push(R.onPeers(onPeers, err => { if (phase !== 'form') { say('Lost the connection to the room.', true); } void err; }));
    setP({ app: 'kizuna-tug', v: V, role, name: o.nick, deck: myDeck(), g: 0, log: '', ff: 0, again: 0, opp: null, seed: null, first: null });
    clearTimeout(waitTimer);
    if (role === 'guest') waitTimer = setTimeout(() => { if (phase === 'wait' && !oppPeer) say(`Nobody is hosting room ${code} yet. Check the code with your friend, or stay here until they create it.`); }, 7000);
  }
  function leave() {
    unsubs.forEach(u => { try { u(); } catch (e) { /* already closed */ } }); unsubs = [];
    if (R) R.leave().catch(() => {});
    R = null; phase = 'form'; role = null; oppPeer = null; game = 0; clearTimeout(leftTimer); clearTimeout(waitTimer); say('');
  }

  /* ---------- starting a game ---------- */
  function hostStart(guest) {
    game += 1; oppPeer = guest.peer; againSent = 0;
    const seed = Math.floor(Math.random() * 1e9), first = game % 2 === 1 ? 'a' : 'b';
    log = []; applied = 0;
    const mine = myDeck();
    setP({ opp: guest.peer, g: game, seed, first, log: '', ff: 0, seq: 0, deck: mine });
    begin({ seed, first, decks: { a: deckOf(mine), b: deckOf(guest.presence.deck) }, me: 'a', oppName: clean(guest.presence.name) || 'Friend' });
  }
  function guestStart(host) {
    const P = host.presence;
    game = P.g; oppPeer = host.peer; againSent = 0; log = []; applied = 0;
    const mine = me() && me().presence.deck ? me().presence.deck : myDeck(); // the deck the host already saw
    setP({ g: game, log: '', ff: 0, seq: 0 });
    begin({ seed: P.seed, first: P.first === 'b' ? 'b' : 'a', decks: { a: deckOf(P.deck), b: deckOf(mine) }, me: 'b', oppName: clean(P.name) || 'Friend' });
  }
  function begin(opts) {
    phase = 'play'; oppName = opts.oppName; clearTimeout(waitTimer);
    KZ.startOnline(opts);
  }

  /* ---------- the room changed ---------- */
  function onPeers() {
    if (!R) return;
    const mine = me(); if (!mine) return;
    if (phase === 'wait') {
      if (role === 'host') {
        const guest = others().filter(p => p.presence.role === 'guest' && (!p.presence.g || p.presence.g === 0)).sort((x, y) => x.updatedAt - y.updatedAt)[0];
        if (guest) hostStart(guest);
      } else {
        const host = others().find(p => p.presence.role === 'host');
        if (host && host.presence.opp === mine.peer && host.presence.g > game) guestStart(host);
        else if (host && host.presence.opp && host.presence.opp !== mine.peer) say(`Room ${code} already has a duel going. Ask your friend for a new code.`, true);
        else if (host) say(`Found ${clean(host.presence.name) || 'your friend'}. Starting…`);
      }
      return;
    }
    if (phase !== 'play') return;
    const O = opp(), M = KZ.S.M;
    if (!O) {
      if (!leftTimer && M && !M.over) leftTimer = setTimeout(() => { leftTimer = null; if (!opp() && phase === 'play') { KZ.remoteForfeit(true); againButton(); } }, 9000);
      againButton();
      return;
    }
    clearTimeout(leftTimer); leftTimer = null;
    const P = O.presence;
    // a rematch the host started
    if (role === 'guest' && P.g > game && P.opp === mine.peer && M && M.over && againSent === game) return guestStart(O);
    if (role === 'host' && M && M.over && againSent === game && P.again === game) return hostStart(O);
    againButton();
    if (P.g !== game || !M) return;
    if (P.ff === game && !M.over) return KZ.remoteForfeit(false);
    pump(String(P.log || ''));
  }
  /* apply the other player's moves that have not been applied yet, one at a time */
  async function pump(text) {
    if (working) { pump.again = text; return; }
    working = true;
    try {
      const toks = text ? text.split(',') : [];
      while (applied < toks.length) {
        const M = KZ.S.M; if (!M || M.over || M.active !== KZ.S.FOE) break;
        const ok = await KZ.applyRemote(decode(toks[applied], KZ.S.FOE));
        if (!ok) { say('The duel fell out of step.', true); break; }
        applied++;
      }
    } finally { working = false; }
    if (pump.again != null) { const t = pump.again; pump.again = null; pump(t); }
  }
  function againButton() {
    const b = $('onlineAgain'); if (!b) return;
    if (!opp()) { b.disabled = true; b.textContent = `${oppName || 'Your friend'} left`; return; }
    if (againSent === game) { b.disabled = true; b.textContent = `Waiting for ${oppName}…`; }
  }

  /* ---------- called by the game ---------- */
  function send(a) {
    if (!R || phase !== 'play') return;
    if (a.t === 'forfeit') return setP({ ff: game });
    log.push(encode(a));
    setP({ log: log.join(','), seq: KZ.S.M ? KZ.S.M.seq : 0 });
  }
  function again() { againSent = game; setP({ again: game }); againButton(); onPeers(); }

  $('onlineBack').onclick = () => { leave(); KZ.show('title'); };

  return { render, send, again, leave: () => { leave(); }, get phase() { return phase; } };
})();
