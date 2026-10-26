/* Kizuna Clash — screens, the tug arena, animations, ranked duels vs festival masters */
const KZ = (() => {
  const $ = id => document.getElementById(id);
  const G = GAME, O = G.other, BY = G.BY_ID;
  const store = { get(k, d) { try { const v = localStorage.getItem('kz2:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('kz2:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } } };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let skip = false, timer = null, retreatArm = 0;
  const wait = ms => new Promise(r => setTimeout(r, skip ? 0 : reduce ? Math.min(ms, 60) : ms));
  const KNOT = '<svg viewBox="0 0 34 52" aria-hidden="true"><path d="M13 26L6 50l7-5 4 6z" fill="#ff4b5c" stroke="#2b2340" stroke-width="2" stroke-linejoin="round"/><path d="M21 26l7 24-7-5-4 6z" fill="#fff" stroke="#2b2340" stroke-width="2" stroke-linejoin="round"/><circle cx="17" cy="21" r="14" fill="#fff" stroke="#2b2340" stroke-width="2.5"/><circle cx="17" cy="21" r="8.5" fill="#ff4b5c" stroke="#2b2340" stroke-width="2"/><circle cx="14" cy="18" r="2.5" fill="#fff" opacity=".8"/></svg>';
  // eight places per side: the front column first, the rows next to the rope first
  const SLOTS = [{ x: 39, r: -0.5 }, { x: 39, r: 0.5 }, { x: 23.5, r: -0.5 }, { x: 23.5, r: 0.5 }, { x: 36, r: -1.5 }, { x: 36, r: 1.5 }, { x: 20.5, r: -1.5 }, { x: 20.5, r: 1.5 }];
  const ICONS = {
    decks: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="7" width="13" height="19" rx="3" transform="rotate(-14 10 16)" fill="#fff" stroke="#2b2340" stroke-width="2.4"/><rect x="10" y="5" width="13" height="19" rx="3" fill="#ffc93c" stroke="#2b2340" stroke-width="2.4"/><rect x="15" y="7" width="13" height="19" rx="3" transform="rotate(14 21 16)" fill="#ff4b5c" stroke="#2b2340" stroke-width="2.4"/><circle cx="21.5" cy="16" r="3.2" fill="#fff" transform="rotate(14 21 16)"/></svg>',
    missions: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="6" y="4" width="20" height="25" rx="3" fill="#fff" stroke="#2b2340" stroke-width="2.4"/><rect x="11" y="2" width="10" height="5" rx="2" fill="#ffc93c" stroke="#2b2340" stroke-width="2.2"/><path d="M10 13l2 2 3-4M10 21l2 2 3-4" fill="none" stroke="#2fc27e" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 13h5M18 21h5" stroke="#2b2340" stroke-width="2.2" stroke-linecap="round"/></svg>',
    book: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 8C12 5 7 5 3 6v19c4-1 9-1 13 2 4-3 9-3 13-2V6c-4-1-9-1-13 2z" fill="#fff" stroke="#2b2340" stroke-width="2.4" stroke-linejoin="round"/><path d="M16 8v19" stroke="#2b2340" stroke-width="2.2"/><circle cx="9.5" cy="14" r="3" fill="#ff6b3d"/><circle cx="22.5" cy="14" r="3" fill="#2f8cff"/><path d="M7 20h5M20 20h5" stroke="#2b2340" stroke-width="2" stroke-linecap="round"/></svg>'
  };

  let S = { screen: 'title', M: null };
  let stats = store.get('stats', { rp: 0, streak: 0, wins: 0, losses: 0 });
  let setup = store.get('setup', { rival: 0 });
  const SCREENS = ['title', 'setup', 'online', 'duel', 'shop', 'decks', 'missions'];

  /* ---------- screens ---------- */
  function show(screen) {
    S.screen = screen;
    for (const id of SCREENS) $(id).hidden = screen !== id;
    AU.music(screen === 'duel' ? 'duel' : 'menu');
    if (screen === 'title') renderTitle(); else if (screen === 'setup') renderSetup(); else if (screen === 'duel') renderDuel();
    else if (screen === 'shop') SCR.renderShop(); else if (screen === 'decks') { SCR.resetTab(); SCR.renderDecks(); } else if (screen === 'missions') SCR.renderMissions();
    if (screen !== 'duel') { const el = $(screen); if (el) el.scrollTop = 0; }
  }
  function renderTitle() {
    $('rankBadge').innerHTML = LADDER.badgeHTML(stats);
    $('titleSnd').innerHTML = AU.button('sndTitle');
    $('titleCoins').innerHTML = SCR.coinPill();
    const n = PROF.claimable(); $('missionsBadge').textContent = n; $('missionsBadge').hidden = !n;
    $('miniTug').innerHTML = `<div class="mt-rope"></div><div class="mt-knot">${KNOT}</div>${UI.artSVG('kappa', 'mt-l')}${UI.artSVG('tanuki', 'mt-r', true)}`;
    $('shopIcon').innerHTML = SCR.bagSVG('golden');
    $('decksIcon').innerHTML = ICONS.decks; $('missionsIcon').innerHTML = ICONS.missions; $('bookIcon').innerHTML = ICONS.book;
    if (PROF.welcome) { PROF.clearWelcome(); setTimeout(() => SCR.toast('<b>The festival grew!</b> 300 yokai and 75 charms to collect. Here are 500 koban to start.', '', 6000), 400); }
  }
  /* the master you face: chosen in the ranked menu, deck strength set by your rank */
  const rival = () => LADDER.master(setup.rival || 0, LADDER.rankOf(stats.rp).level);
  function renderSetup() {
    const m = rival(), rank = LADDER.rankOf(stats.rp), mine = PROF.activeDeck();
    $('setupBody').innerHTML = `${LADDER.badgeHTML(stats)}
      <label>Your deck</label>
      <div class="decktiles" id="deckPick">${SCR.deckTiles(PROF.active, 'data-deck')}</div>
      <button class="btn small" type="button" id="editDecks">Edit decks</button>
      <div class="panel vsrow"><div class="avatar">${UI.sceneSVG(m.lead)}</div><div><b>Your rival: ${m.name}</b><p class="note">${m.title}. Plays ${m.style}. At ${rank.name} rank, masters play at strength ${rank.level + 1} of 6.</p></div>
        <button class="btn small" type="button" id="rivalNext">Other rival</button></div>
      <button class="btn red" type="button" id="startBtn" ${mine ? '' : 'disabled'}>${mine ? `Start the tug! · ${LADDER.STAKE} RP` : 'Finish a deck first'}</button>`;
    $('deckPick').onclick = e => { const b = e.target.closest('[data-deck]'); if (!b) return; const i = +b.dataset.deck;
      if (PROF.deckProblem(PROF.deck(i).cards)) { SCR.toast('That deck isn\'t finished yet. Opening the deck builder…'); show('decks'); return; }
      PROF.setActive(i); renderSetup(); };
    $('editDecks').onclick = () => show('decks');
    $('rivalNext').onclick = () => { setup.rival = (setup.rival || 0) + 1; store.set('setup', setup); renderSetup(); };
    $('startBtn').onclick = startAI;
  }

  /* ---------- starting duels ---------- */
  function baseState(mode, M, me, extra) {
    stopTimer();
    S = Object.assign({ screen: 'duel', mode, M, ME: me, FOE: O(me), att: null, pick: null, busy: false, level: 5, endInfo: null, ended: false, timerFor: -1, lastRound: 0, dealt: {},
      tally: { kos: 0, summons: 0, sumType: { fire: 0, water: 0, wind: 0 }, sumLegend: 0, charms: 0, pulled: 0, bigheave: 0, bigcombo: 0, bonds: 0 } }, extra);
    $('endScreen').hidden = true; $('pop').hidden = true; $('timerWrap').hidden = mode === 'tut';
  }
  function startAI() {
    const mine = PROF.activeDeck(); if (!mine) return show('decks');
    store.set('setup', setup);
    const n = store.get('aiGames', 0); store.set('aiGames', n + 1);
    const m = rival();
    const M = G.newMatch({ decks: { a: mine, b: m.deck }, first: n % 2 === 0 ? 'a' : 'b' });
    baseState('ai', M, 'a', { rival: { name: m.title, lead: m.lead }, master: m, level: LADDER.rankOf(stats.rp).level });
    show('duel'); taunt(LADDER.line('start'));
    begin(G.beginTurn(M));
  }
  function startTutorial() {
    const T = TUT.setup();
    const M = G.newMatch({ decks: { a: T.you, b: T.rival }, first: 'a', keepOrder: true, events: T.events, script: { b: T.script }, seed: 1, classic: true, win: 12, turns: 8 });
    baseState('tut', M, 'a', { rival: { name: 'Practice partner', lead: 'kamaitachi' }, master: { name: 'Mizuha', title: 'Practice partner' }, level: 0 });
    show('duel'); TUT.start();
    begin(G.beginTurn(M));
  }
  function startOnline(o) {
    const M = G.newMatch({ decks: o.decks, first: o.first || 'a', seed: o.seed });
    baseState('online', M, o.me, { oppName: o.oppName, rival: { name: 'Friend duel', lead: LADDER.deckLead(o.decks[O(o.me)]) } });
    show('duel');
    begin(G.beginTurn(M));
  }
  async function begin(ev) { S.busy = true; await animate(ev); S.busy = false; afterAction(); }

  /* ---------- timer ---------- */
  const TURN_TIME = 50;
  function startTimer() {
    stopTimer();
    if (S.mode === 'tut') { $('timerWrap').hidden = true; return; }
    $('timerWrap').hidden = false;
    S.timeLeft = TURN_TIME * 10;
    timer = setInterval(() => {
      if (S.screen !== 'duel' || !S.M || S.M.over) return stopTimer();
      if (S.busy || !$('pop').hidden || !$('rulesSheet').hidden) return;
      S.timeLeft--;
      if (S.M.active === S.ME && S.timeLeft > 0 && S.timeLeft <= 80 && S.timeLeft % 10 === 0) AU.play('tickTock');
      const bar = $('timerBar'); bar.style.width = (100 * S.timeLeft / (TURN_TIME * 10)) + '%';
      $('timerWrap').classList.toggle('hot', S.timeLeft <= 80 && S.M.active === S.ME);
      $('timerWrap').classList.toggle('theirs', S.M.active !== S.ME);
      if (S.timeLeft <= 0) { stopTimer(); if (S.M.active === S.ME) { clearPick(); doAct({ t: 'heave', tap: 0 }); } }
    }, 100);
  }
  function stopTimer() { if (timer) clearInterval(timer); timer = null; }

  /* ---------- rendering ---------- */
  const myTurn = () => S.M && !S.M.over && S.M.active === S.ME && !S.busy;
  const foeName = () => S.mode === 'online' ? (S.oppName || 'Rival') : S.master ? S.master.name : 'Rival';
  const sgn = () => (S.ME === 'a' ? 1 : -1);
  const knotPct = rope => 50 - (rope / S.M.win) * 40 * sgn();
  const WIN = () => S.M.win;
  function renderBars() {
    const M = S.M, Fo = M[S.FOE], foeTurn = M.active === S.FOE && !M.over;
    const lead = S.rival ? S.rival.lead : 'kitsunebi';
    $('rBar').className = 'pbar' + (foeTurn ? ' active' : '');
    $('rBar').innerHTML = `<div class="avatar">${UI.sceneSVG(lead)}</div>
      <div class="who"><b>${esc(foeName())}</b><small class="${foeTurn ? 'turn' : ''}">${foeTurn ? 'Their turn…' : S.rival ? S.rival.name : ''}</small></div>
      <div class="chips"><span class="chip cards" title="Cards in hand">🂠 ${Fo.hand.length}</span>${Fo.trap ? `<span class="chip trap" title="A face-down trap: a Paper Ward, Caltrops or a Paper Doll">${UI.I.charm}Trap</span>` : ''}${statusChips(M, S.FOE)}</div>
      ${AU.button('sndDuel')}
      ${S.mode === 'tut' ? '' : `<button type="button" class="iconbtn${retreatArm > Date.now() ? ' armed' : ''}" id="retreatBtn" aria-label="Retreat">${retreatArm > Date.now() ? 'Sure?' : UI.I.flag}</button>`}
      <div class="taunt" id="taunt" hidden></div>`;
    const ev = G.eventNow(M), r = G.round(M), nx = M.events.slice(r, r + 2);
    $('ribbon').innerHTML = `${UI.eventIcon(ev, 'evi')}<div class="evt"><b><em>Round ${r}</em>${G.EVENTS[ev].name}</b><span>${G.EVENTS[ev].text}</span></div>
      ${nx.length ? `<div class="next">Next ${nx.map(e => `<span title="${G.EVENTS[e].name}: ${G.EVENTS[e].text}">${UI.eventIcon(e, 'evi')}</span>`).join('')}</div>` : ''}`;
  }
  /* toll, slippery rope, cheers and bonds that are in play for one side */
  function statusChips(M, k) {
    const s = M[k], out = [];
    if (s.taxTurn === M.turnNo && s.tax && M.active === k) out.push(`<span class="chip bad" title="Their cards cost more this turn">Toll +${s.tax}</span>`);
    if (s.taxNext) out.push(`<span class="chip bad" title="Cards cost more next turn">Toll +${s.taxNext} next</span>`);
    const sap = s.sap + M[O(k)].team.reduce((x, t) => x + (G.has(t, 'sapaura') || 0), 0);
    if (sap) out.push(`<span class="chip bad" title="Their next heave is weaker">Heave −${sap}</span>`);
    if (M.active === k && s.cheer + s.drum) out.push(`<span class="chip good" title="Extra pull this turn">Heave +${s.cheer + s.drum}</span>`);
    if (M.active === k && s.discount) out.push(`<span class="chip good" title="The next card costs less">Next −${s.discount}</span>`);
    const bonds = G.bondsActive(M, k);
    if (bonds.length) out.push(`<span class="chip bond" title="${esc(bonds.map(b => b.name).join(', '))}">絆 ${bonds.length}</span>`);
    return out.join('');
  }
  function renderMeter(rope) {
    const pin = 50 - (rope / WIN()) * 50 * sgn();
    const toMe = rope * sgn() > 0;
    const myNeed = WIN() - rope * sgn(), foeNeed = WIN() + rope * sgn();
    $('meter').innerHTML = `<div class="flagL">${UI.I.flag}</div><div class="track"><div class="fill" style="left:${Math.min(50, pin)}%;right:${100 - Math.max(50, pin)}%;background:${toMe ? 'var(--me)' : 'var(--foe)'}"></div><div class="ticks"></div><div class="mid"></div></div>
      <div class="pin" style="left:calc(30px + (100% - 60px) * ${pin / 100})">${Math.abs(rope)}</div><div class="flagR">${UI.I.flag}</div>`;
    $('tuglabel').innerHTML = `<span>You need <b>${myNeed}</b> · ${esc(foeName())} needs <b>${foeNeed}</b></span>`;
    const k = knotPct(rope);
    if (!$('knot').firstChild) $('knot').innerHTML = KNOT;
    $('knot').style.left = k + '%';
    $('rope').style.setProperty('--rx', ((k - 50) * 3.6) + 'px');
  }
  function tokenFor(y, side) {
    const M = S.M, mine = side === 'me';
    let cls = '', tag = '', preview = '';
    const ourTurn = M.active === S.ME && !M.over;
    if (mine) {
      if (S.pick && BY[S.pick].target === 'own') cls += ' mine-pick';
      else if (S.att === y.uid) cls += ' att';
      else if (myTurn() && G.canAttack(M, S.ME, y.uid) && !S.pick) { cls += ' ready'; tag = y.attacks ? 'Again!' : 'Ready'; }
      if (ourTurn && !cls.includes('ready') && S.att !== y.uid) {
        if (G.frozenNow(M, y)) tag = 'Frozen';
          else if (y.attacks) { cls += ' acted'; tag = 'Attacked'; }
        else if (y.fresh) tag = 'New';
      }
    } else {
      const att = S.att != null && G.find(M, S.att);
      if (att && G.targets(M, S.ME, att.uid).includes(y)) { cls += ' tgt'; const d = G.damageOf(M, att, y); preview = y.barrier ? 'Block' : d.dmg >= y.hp && !y.omamori ? 'KO!' : `−${d.dmg}${d.mult > 1 ? ' +1' : ''}`; }
      if (S.pick && /rival/.test(BY[S.pick].target) && G.charmTargets(M, S.ME, S.pick).includes(y.uid)) { cls += ' tgt'; preview = charmPreview(S.pick, y); }
      if (G.frozenNow(M, y) && !preview) tag = 'Frozen';
    }
    if (G.hiddenNow(M, y)) { cls += ' hiddenTok'; tag = 'Hidden'; }
    if (y.silenced && !tag) tag = 'Silenced';
    return UI.tokenHTML(M, y, { side, cls, tag, preview, flip: !mine });
  }
  function charmPreview(id, y) {
    const n = { firecracker: 2, rocket: 4, hamaya: 5, bucket: y.type === 'fire' ? 5 : 2, kaminari: y.type === 'water' ? 5 : 2, hibashi: y.type === 'wind' ? 5 : 2 }[id];
    if (n != null) { if (y.barrier) return 'Block'; const dmg = Math.max(0, n - (G.has(y, 'stoneskin') ? 1 : 0) - (S.M[y.owner].team.some(t => G.has(t, 'fortress')) ? 1 : 0)); return dmg >= y.hp && !y.omamori ? 'KO!' : '−' + dmg; }
    return { net: 'Scoop', kakigori: 'Freeze', fuin: 'Silence', kotodama: 'Silence', tenguuchiwa: 'Blow away', dohyo: 'Push' }[id] || '';
  }
  function slotStyle(i, side) {
    const s = SLOTS[i] || SLOTS[7], x = side === 'me' ? s.x : 100 - s.x;
    return `left:${x}%;top:calc(50% - var(--tokh) / 2 + ${s.r} * var(--rowgap))`;
  }
  function renderTeams() {
    for (const side of ['me', 'foe']) {
      const k = side === 'me' ? S.ME : S.FOE, team = S.M[k].team;
      let h = team.map((y, i) => tokenFor(y, side).replace('<button', `<button style="${slotStyle(i, side)}"`)).join('');
      if (side === 'me' && S.hintSlot && team.length < G.C.TEAM_MAX) h += `<div class="slotHint go" style="${slotStyle(team.length, side)}">+</div>`;
      const box = $(side === 'me' ? 'teamMe' : 'teamFoe'); box.innerHTML = h; box.classList.toggle('crowd', team.length > 4);
    }
  }
  function renderInfo(text) {
    const M = S.M;
    let h = text;
    if (!h) {
      if (M.over) h = 'The tug is over.';
      else if (M.active !== S.ME) h = `<b>${esc(foeName())}</b> is taking their turn…`;
      else if (S.pick) h = `<b>${BY[S.pick].name}:</b> tap a glowing yokai. Tap the card again to cancel.`;
      else if (S.att != null) h = '<b>Attack!</b> Tap a glowing rival yokai, or tap your yokai again to cancel.';
      else { const h2 = G.heaveOf(M, S.ME); h = `Play as many cards as your energy allows, attack with <b>Ready</b> yokai, then <b>HEAVE!</b> and tap fast (pull ${h2.pull} − their grip ${h2.grip}).`; }
    }
    $('info').innerHTML = `<span>${h}</span>`;
  }
  function renderYBar() {
    const M = S.M, Me = M[S.ME], mine = myTurn(), h = G.heaveOf(M, S.ME);
    const toWin = WIN() - M.rope * sgn();
    const lan = Array.from({ length: Math.min(12, Math.max(Me.energy, G.C.MAX_ENERGY)) }, (_, i) => `<i class="${i < Me.energy ? 'on' : ''}"></i>`).join('');
    const tapNote = M.noTap ? '' : ` · tap +${G.C.TAP_MAX}`, ours = M.active === S.ME && !M.over;
    $('yBar').innerHTML = `<div class="energy"><span class="gem" id="energyGem">${Me.energy}</span><div><div class="lan">${lan}</div><small>energy</small></div></div>
      <div class="mychips">${Me.trap ? `<span class="chip trap" title="Your face-down ${BY[Me.trap].name}">${UI.I.charm}${{ ward: 'Ward', spikes: 'Spikes', hitogata: 'Doll' }[Me.trap]}</span>` : ''}${statusChips(M, S.ME)}</div>
      <button type="button" class="btn heave${ours ? '' : ' wait'}${ours && h.net >= toWin ? ' big' : ''}" id="heaveBtn" ${mine ? '' : 'disabled'}>
        ${ours ? `HEAVE! ${h.net > 0 ? '+' + h.net : '±0'}<small>${h.net >= toWin ? 'This pull wins the tug!' : `pull ${h.pull} − grip ${h.grip}${tapNote}`}</small>` : M.over ? 'Tug over' : `Wait…<small>${esc(foeName())} is pulling</small>`}</button>`;
  }
  function renderHand() {
    const M = S.M, me = S.ME, mine = myTurn();
    $('hand').innerHTML = M[me].hand.map(id => UI.miniHTML(id, { sel: S.pick === id, dim: !mine || !G.playable(M, me, id) })).join('') || '<span class="empty">No cards in hand.</span>';
  }
  function renderDuel() {
    if (!S.M) return show('title');
    renderBars(); renderMeter(S.M.rope); renderTeams(); renderInfo(); renderYBar(); renderHand(); TUT.refresh();
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- card pop-up ---------- */
  function openPop(id, live) {
    const M = S.M, c = BY[id];
    let btn = '', why = '';
    if (live) { // a yokai already on the rope
      why = `Power ${G.powerOf(M, live)} · HP ${Math.max(0, live.hp)}/${live.maxHp} · Grip ${G.gripOf(M, live)}${G.frozenNow(M, live) ? ' · Frozen' : ''}${live.silenced ? ' · Silenced' : ''}${live.barrier ? ' · Barrier' : ''}${live.omamori ? ' · Omamori' : ''}${live.token ? ' · Summoned' : ''}`;
    } else if (S.screen === 'duel' && M && M[S.ME].hand.includes(id)) {
      const ok = myTurn() && G.playable(M, S.ME, id), cost = G.costOf(M, S.ME, id);
      if (ok) btn = `<button class="btn red" type="button" id="popGo">${c.kind === 'yokai' ? 'Summon' : c.target === 'none' ? (c.trap ? 'Set trap' : 'Use') : 'Choose target'} · ${cost}⚡</button>`;
      else why = !myTurn() ? 'Wait for your turn.' : cost > M[S.ME].energy ? `You need ${cost} energy.` : c.kind === 'yokai' ? `Your rope is full (${G.C.TEAM_MAX} yokai).` : c.trap ? 'You already have a trap set.' : 'Nothing to aim it at yet.';
      if (ok && cost < c.cost) why = `Costs ${cost} this turn instead of ${c.cost}.`;
      if (ok && cost > c.cost) why = `Costs ${cost} this turn because of a toll.`;
      if (ok && M[S.ME].played >= 1 && c.abs.some(a => a.combo)) why = (why ? why + ' ' : '') + 'Combo ready!';
    }
    $('pop').innerHTML = `<div class="pin">${UI.cardHTML(id)}${why ? `<div class="why">${why}</div>` : ''}<div class="acts">${btn}<button class="btn" type="button" id="popClose">Close</button></div></div>`;
    $('pop').hidden = false;
    $('popClose').onclick = () => closePop(true);
    if ($('popGo')) $('popGo').onclick = () => {
      if (!TUT.allow('play', { id })) return;
      closePop(false);
      if (c.kind === 'charm' && c.target !== 'none') { clearPick(); S.pick = id; renderDuel(); TUT.after('pick'); return; }
      doAct({ t: 'play', card: id });
    };
    AU.play('open');
    if (!live) TUT.after('open', { id });
  }
  function closePop(byUser) {
    if ($('pop').hidden) return;
    $('pop').hidden = true; if (S.M && S.screen === 'duel') renderTeams();
    if (byUser) { AU.play('close'); TUT.popClosed(); }
  }
  $('pop').onclick = e => { if (e.target.id === 'pop') closePop(true); };

  /* ---------- player input ---------- */
  function clearPick() { S.att = null; S.pick = null; S.hintSlot = false; }
  function tapHand(id) {
    if (!S.M || S.busy) return;
    if (S.pick === id) { if (!TUT.allow('cancel')) return; clearPick(); renderDuel(); return; }
    if (!TUT.allow('open', { id })) return;
    clearPick(); renderDuel();
    S.hintSlot = BY[id].kind === 'yokai' && myTurn();
    renderTeams();
    openPop(id);
    S.hintSlot = false;
  }
  function tapToken(uid, side) {
    if (!S.M || S.busy) return;
    const M = S.M, y = G.find(M, uid); if (!y) return;
    if (side === 'me') {
      if (S.pick && BY[S.pick].target === 'own') { const id = S.pick; if (!TUT.allow('play', { id, target: y.id })) return; clearPick(); return doAct({ t: 'play', card: id, target: uid }); }
      if (myTurn() && G.canAttack(M, S.ME, uid) && !S.pick) {
        if (S.att === uid) { if (!TUT.allow('cancel')) return; S.att = null; AU.play('tap'); renderDuel(); return; }
        if (!TUT.allow('attacker', { id: y.id })) return;
        S.att = uid; AU.play('tap'); renderDuel(); TUT.after('attacker', { id: y.id }); return;
      }
      return openPop(y.id, y);
    }
    if (S.pick && /rival/.test(BY[S.pick].target)) {
      if (!G.charmTargets(M, S.ME, S.pick).includes(uid)) { AU.play('nope'); return; }
      const id = S.pick; if (!TUT.allow('play', { id, target: y.id })) return;
      clearPick(); return doAct({ t: 'play', card: id, target: uid });
    }
    if (S.att != null && myTurn()) {
      if (G.targets(M, S.ME).includes(y)) {
        const a = G.find(M, S.att); if (!TUT.allow('attack', { from: a.id, to: y.id })) return;
        const from = S.att; clearPick(); return doAct({ t: 'attack', from, to: uid });
      }
      AU.play('nope');
      renderInfo(G.targets(M, S.ME).some(t => t.ab === 'guardian') ? 'A <b>Guardian</b> is protecting the others: attack it first.' : 'That yokai is <b>Hidden</b> this turn.');
      return;
    }
    openPop(y.id, y);
  }
  function tapHeave() {
    if (!myTurn() || !TUT.allow('heave')) return;
    clearPick();
    if (S.M.noTap || (S.mode === 'tut' && !TUT.wantsTap())) return doAct({ t: 'heave', tap: 0 });
    tapGame(bonus => doAct({ t: 'heave', tap: bonus }));
  }
  /* HEAVE! tap as fast as you can for a couple of seconds: every 3 taps add 1 pull, up to +5 */
  const TAP_MS = 2300, TAPS_PER = 3;
  function tapGame(done) {
    const el = $('tapGame'); let taps = 0, over = false;
    S.busy = true; stopTimer();
    const bonus = () => Math.min(G.C.TAP_MAX, Math.floor(taps / TAPS_PER));
    el.innerHTML = `<div class="tg-in"><b class="tg-title">TAP! TAP! TAP!</b><div class="tg-drum" id="tgDrum"><span id="tgN">0</span></div>
      <div class="tg-meter">${Array.from({ length: G.C.TAP_MAX }, (_, i) => `<i data-i="${i}"></i>`).join('')}</div><div class="tg-time"><i id="tgTime"></i></div><small>Tap anywhere, as fast as you can!</small></div>`;
    el.hidden = false; AU.play('heave');
    const t0 = performance.now();
    const hit = e => {
      if (over) return; if (e) e.preventDefault();
      taps++; const b = bonus();
      $('tgN').textContent = taps;
      el.querySelectorAll('.tg-meter i').forEach((x, i) => x.classList.toggle('on', i < b));
      const d = $('tgDrum'); d.classList.remove('bang'); void d.offsetWidth; d.classList.add('bang');
      AU.play(taps % TAPS_PER === 0 && b <= G.C.TAP_MAX ? 'gain' : 'tapDon');
      if (navigator.vibrate) { try { navigator.vibrate(12); } catch (x) { /* ignore */ } }
    };
    const key = e => { if (e.key === ' ' || e.key === 'Enter') hit(e); };
    el.onpointerdown = hit; addEventListener('keydown', key);
    const tick = () => {
      const left = Math.max(0, TAP_MS - (performance.now() - t0));
      const bar = $('tgTime'); if (bar) bar.style.width = (100 * left / TAP_MS) + '%';
      if (left > 0) return requestAnimationFrame(tick);
      over = true; removeEventListener('keydown', key); el.onpointerdown = null;
      const b = bonus();
      el.querySelector('.tg-in').innerHTML = `<b class="tg-result">${b ? `+${b} PULL!` : 'HEAVE!'}</b><small>${taps} taps</small>`;
      setTimeout(() => { el.hidden = true; S.busy = false; done(b); }, reduce ? 150 : 650);
    };
    requestAnimationFrame(tick);
  }
  function retreat() {
    if (S.mode === 'tut' || !S.M || S.M.over) return;
    if (retreatArm > Date.now()) {
      retreatArm = 0; G.act(S.M, { t: 'forfeit', k: S.ME }); S.endInfo = { forfeit: S.ME };
      if (S.mode === 'online') NET.send({ t: 'forfeit' });
      renderDuel(); return endMatch();
    }
    retreatArm = Date.now() + 3000; renderBars(); setTimeout(() => { if (S.M && !S.M.over) renderBars(); }, 3100);
  }

  /* ---------- applying actions ---------- */
  async function doAct(a) {
    if (!S.M || S.busy) return;
    a.k = S.ME;
    const r = G.act(S.M, a);
    if (!r.ok) { renderDuel(); return; }
    if (S.mode === 'online') NET.send(a);
    if (a.t === 'heave') stopTimer();
    S.busy = true; skip = false;
    renderHand(); renderYBar();
    await animate(r.ev);
    S.busy = false;
    if (S.mode === 'ai') {
      if (r.ev.some(e => e.t === 'ko' && e.k === S.FOE)) taunt(LADDER.line('lostOne'));
      else if (a.t === 'heave' && S.M.rope * sgn() >= WIN() * 0.7 && !S.M.over) taunt(LADDER.line('danger'));
    }
    if (a.t !== 'heave') TUT.after(a.t === 'play' ? 'play' : a.t, a.t === 'play' ? { id: a.card } : null);
    afterAction();
  }
  async function applyRemote(a) {
    while (S.busy) await new Promise(r => setTimeout(r, 50));
    if (!S.M || S.M.over) return false;
    const r = G.act(S.M, a);
    if (!r.ok) return false;
    S.busy = true; skip = false;
    await animate(r.ev);
    S.busy = false;
    afterAction();
    return true;
  }
  function afterAction() {
    const M = S.M;
    if (!M) return;
    renderDuel();
    if (M.over) return endMatch();
    if (S.mode !== 'tut' && S.timerFor !== M.turnNo && (M.active === S.ME || S.mode === 'online')) { S.timerFor = M.turnNo; startTimer(); }
    if (M.active === S.ME) TUT.turnStart(M);
    else if (S.mode !== 'online' && !S.aiRunning) aiTurn();
  }
  async function aiTurn() {
    const M = S.M; S.aiRunning = true; stopTimer(); $('timerWrap').classList.add('theirs');
    renderDuel();
    await wait(450);
    let kos = 0;
    for (let n = 0; n < 30 && !M.over && M.active === S.FOE; n++) {
      let a = G.aiNext(M, S.FOE, S.level);
      let r = G.act(M, a);
      if (!r.ok) { a = { t: 'heave', k: S.FOE }; r = G.act(M, a); }
      kos += r.ev.filter(e => e.t === 'ko' && e.k === S.ME).length;
      S.busy = true; skip = false;
      await animate(r.ev);
      S.busy = false;
      if (a.t === 'heave') break;
      renderDuel(); await wait(260);
    }
    S.aiRunning = false;
    if (S.mode === 'ai' && !M.over) {
      if (M.rope * sgn() <= -(WIN() * 0.7)) taunt(LADDER.line('close'));
      else if (kos) taunt(LADDER.line('ko'));
    }
    TUT.resolved(M);
    afterAction();
  }

  /* ---------- animation ---------- */
  const sideOf = k => (k === S.ME ? 'me' : 'foe');
  const tokEl = uid => document.querySelector(`.tok[data-uid="${uid}"]`);
  const center = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  function floatAt(el, text, cls, dy = 0) {
    if (!el || skip) return; const p = center(el);
    const d = document.createElement('div'); d.className = 'float' + (cls ? ' ' + cls : ''); d.textContent = text;
    d.style.left = p.x + 'px'; d.style.top = (p.y + dy) + 'px';
    $('fx').appendChild(d); setTimeout(() => d.remove(), 950);
  }
  function banner(text, cls) { if (skip) return; const d = document.createElement('div'); d.className = 'banner' + (cls ? ' ' + cls : ''); d.textContent = text; $('fx').appendChild(d); setTimeout(() => d.remove(), 1000); }
  function taunt(text) {
    const t = $('taunt'); if (!t || S.mode !== 'ai') return;
    t.textContent = text; t.hidden = false; clearTimeout(taunt.h); taunt.h = setTimeout(() => { const x = $('taunt'); if (x) x.hidden = true; }, 2600);
  }
  function flash(el, cls) { if (!el || skip) return; el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }
  /* the attacker dashes across the field, strikes and runs back */
  function lunge(el, target) {
    if (!el || !target || skip || reduce || !el.animate) return;
    const a = center(el), b = center(target), dx = (b.x - a.x) * 0.82, dy = (b.y - a.y) * 0.82;
    el.style.zIndex = 9;
    el.animate([{ transform: 'none' }, { transform: `translate(${-dx * 0.08}px, ${-dy * 0.08}px) scale(.95) rotate(${dx > 0 ? -8 : 8}deg)`, offset: 0.18 },
      { transform: `translate(${dx}px, ${dy}px) scale(1.22) rotate(${dx > 0 ? 10 : -10}deg)`, offset: 0.5 }, { transform: `translate(${dx * 0.9}px, ${dy * 0.9}px) scale(1.1)`, offset: 0.62 }, { transform: 'none' }],
      { duration: 520, easing: 'ease-in-out' }).onfinish = () => { el.style.zIndex = ''; };
  }
  function shake(power = 1) {
    if (skip || reduce) return; const el = $('arena'); if (!el.animate) return;
    const p = 4 * power;
    el.animate([{ transform: 'none' }, { transform: `translate(${p}px, ${-p / 2}px)` }, { transform: `translate(${-p}px, ${p / 2}px)` }, { transform: `translate(${p / 2}px, ${p / 3}px)` }, { transform: 'none' }], { duration: 260 + 80 * power });
  }
  function swingRope(toward) {
    if (skip || reduce) return; const el = document.querySelector('.ropewrap'); if (!el || !el.animate) return;
    const d = toward === 'me' ? -1 : 1;
    el.animate([{ transform: 'none' }, { transform: `translateX(${d * 16}px) rotate(${d * -2}deg)`, offset: 0.3 }, { transform: `translateX(${-d * 7}px) rotate(${d * 1.2}deg)`, offset: 0.6 }, { transform: `translateX(${d * 3}px)`, offset: 0.82 }, { transform: 'none' }], { duration: 700, easing: 'ease-out' });
  }
  /* COMBO x2, x3… when one side plays several cards in a turn */
  function comboPop(k, n) {
    if (n < 2 || skip) return;
    const d = document.createElement('div'); d.className = 'combo ' + sideOf(k) + (n >= 4 ? ' hot' : ''); d.innerHTML = `COMBO<b>×${n}</b>`;
    $('fx').appendChild(d); setTimeout(() => d.remove(), 900);
    AU.play(n >= 4 ? 'epic' : 'rare');
  }
  function slashAt(el) {
    if (!el || skip || reduce) return; const p = center(el);
    const d = document.createElement('div'); d.className = 'slash'; d.style.left = p.x + 'px'; d.style.top = p.y + 'px'; d.style.width = '90px';
    $('fx').appendChild(d); setTimeout(() => d.remove(), 420);
  }
  function puffs(el, toward) {
    if (!el || skip || reduce) return; const r = el.getBoundingClientRect();
    for (let i = 0; i < 3; i++) {
      const d = document.createElement('div'); d.className = 'puff';
      d.style.left = (r.left + r.width * (0.2 + 0.3 * i)) + 'px'; d.style.top = (r.bottom - 12) + 'px'; d.style.setProperty('--dx', (toward * (8 + i * 6)) + 'px');
      $('fx').appendChild(d); setTimeout(() => d.remove(), 650);
    }
  }
  function setTok(uid, y) {
    const el = tokEl(uid); if (!el || !y) return;
    const side = el.dataset.side, style = el.getAttribute('style');
    const tmp = document.createElement('div'); tmp.innerHTML = tokenFor(y, side);
    const nu = tmp.firstElementChild; nu.setAttribute('style', style); el.replaceWith(nu);
  }
  function confetti() {
    if (reduce) return;
    const cols = ['#ff4b5c', '#ffc93c', '#2f9bff', '#2fc27e', '#ff8fb8', '#9b6bff'];
    for (let i = 0; i < 70; i++) {
      const d = document.createElement('div'); d.className = 'confetti';
      d.style.left = (Math.random() * 100) + 'vw'; d.style.background = cols[i % cols.length];
      d.style.setProperty('--dx', ((Math.random() - 0.5) * 160) + 'px'); d.style.setProperty('--rot', (Math.random() * 900) + 'deg');
      d.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; d.style.animationDelay = (Math.random() * 0.5) + 's';
      document.body.appendChild(d); setTimeout(() => d.remove(), 4000);
    }
  }
  function count(e) {
    const T = S.tally; if (!T) return;
    if (e.t === 'join' && e.k === S.ME) { T.summons++; const c = BY[e.id]; T.sumType[c.type] = (T.sumType[c.type] || 0) + 1; if (c.rarity === 'legend') T.sumLegend++; }
    else if (e.t === 'ko' && e.k === S.FOE) T.kos++;
    else if (e.t === 'charm' && e.k === S.ME) T.charms++;
    else if (e.t === 'move' && e.k === S.ME) T.pulled += e.amount;
    else if (e.t === 'heave' && e.k === S.ME) { T.bigheave = Math.max(T.bigheave, e.net); if (S.M[S.ME].played >= 3) T.bigcombo++; }
    else if (e.t === 'bond' && e.k === S.ME) T.bonds++;
  }
  async function animate(ev) {
    const M = S.M, nm = id => BY[id].name, who = k => (k === S.ME ? 'You' : foeName());
    for (const e of ev) {
      count(e);
      switch (e.t) {
        case 'turn': {
          const r = e.round;
          renderDuel();
          AU.music(r >= M.maxTurns - 1 || Math.abs(M.rope) >= M.win * 0.7 ? 'finale' : 'duel');
          if (r !== S.lastRound) { S.lastRound = r; flash($('ribbon'), 'flash'); if (r > 1) { AU.play('event'); banner(G.EVENTS[e.event].name, 'gold'); await wait(800); } }
          AU.play(e.k === S.ME ? 'myturn' : 'foeturn');
          banner(e.k === S.ME ? 'Your turn!' : `${foeName()}'s turn`, e.k === S.ME ? 'blue' : '');
          await wait(650); break;
        }
        case 'join': {
          const y = G.find(M, e.uid);
          if (y) {
            const side = sideOf(e.k), team = M[e.k].team, i = team.indexOf(y);
            const box = $(side === 'me' ? 'teamMe' : 'teamFoe');
            const tmp = document.createElement('div'); tmp.innerHTML = tokenFor(y, side).replace('<button', `<button style="${slotStyle(i, side)}"`);
            box.querySelectorAll('.slotHint').forEach(n => n.remove());
            const el = tmp.firstElementChild; box.appendChild(el); flash(el, e.summoned ? 'summonin' : 'popin'); puffs(el, 0); AU.play('summon');
            if (e.summoned) floatAt(el, y.token ? 'Summoned!' : 'Called!', 'word', -34);
          }
          renderInfo(`${who(e.k)} ${e.summoned ? 'bring' : 'summon'}${e.k === S.ME ? '' : 's'} <b>${nm(e.id)}</b>${e.summoned ? ' onto the rope' : ''}!`);
          if (!e.summoned) comboPop(e.k, M[e.k].played);
          if (e.k !== S.ME) renderBars();
          await wait(e.summoned ? 320 : 420); break;
        }
        case 'ability': { AU.play('charm'); const y = G.find(M, e.uid); if (y) setTok(e.uid, y); floatAt(tokEl(e.uid), e.text, 'word', -30); renderInfo(`<b>${nm(e.id)}</b> · ${e.text}`); await wait(440); break; }
        case 'charm': {
          const c = BY[e.id];
          AU.play('charm');
          if (e.k !== S.ME) { renderBars(); openPeek(e.id); await wait(900); closePeek(); }
          floatAt($(e.k === S.ME ? 'teamMe' : 'teamFoe'), c.name + '!', 'word');
          comboPop(e.k, M[e.k].played);
          renderInfo(`${who(e.k)} use${e.k === S.ME ? '' : 's'} <b>${c.name}</b>: ${c.text}`);
          renderYBar(); renderBars(); await wait(420); break;
        }
        case 'bond': {
          const b = G.BOND_BY[e.bond];
          AU.play('legend'); banner('絆 ' + e.name + '!', 'bond'); shake(1.5);
          for (const u of e.members) { const el = tokEl(u); if (el) flash(el, 'bondglow'); }
          renderInfo(`<b>Kizuna Bond: ${e.name}!</b> ${G.bondText(b).split(': ').slice(1).join(': ')}`);
          renderTeams(); await wait(1100); break;
        }
        case 'silence': { AU.play('down'); const y = G.find(M, e.uid); if (y) setTok(e.uid, y); floatAt(tokEl(e.uid), 'Silenced!', 'x2', -30); renderInfo(`<b>${nm(e.id)}</b> is silenced and loses its ability.`); await wait(420); break; }
        case 'block': { AU.play('ward'); const y = G.find(M, e.uid); if (y) setTok(e.uid, y); floatAt(tokEl(e.uid), 'Blocked!', 'word', -30); renderInfo(`<b>${nm(e.id)}</b>'s Barrier blocks the hit.`); await wait(420); break; }
        case 'status': { AU.play('charm'); floatAt($(sideOf(e.k) === 'me' ? 'teamMe' : 'teamFoe'), e.text, 'word', 20); renderBars(); renderYBar(); await wait(380); break; }
        case 'draw': renderHand(); renderBars(); if (e.k === S.ME) floatAt($('hand'), `+${e.n} card${e.n > 1 ? 's' : ''}`, 'word', -20); await wait(220); break;
        case 'spikes': AU.play('ward'); floatAt($(sideOf(e.k) === 'me' ? 'teamMe' : 'teamFoe'), 'Caltrops!', 'word'); renderInfo('<b>Caltrops!</b> The attacker steps on the trap.'); renderBars(); renderYBar(); await wait(550); break;
        case 'trapgone': AU.play('ward'); floatAt($(sideOf(e.k) === 'me' ? 'teamMe' : 'teamFoe'), 'Trap broken!', 'word'); renderInfo('The <b>Sacred Mirror</b> breaks the face-down trap.'); renderBars(); renderYBar(); await wait(500); break;
        case 'ward': AU.play('ward'); floatAt($(sideOf(e.k) === 'me' ? 'teamMe' : 'teamFoe'), 'Blocked by Paper Ward!', 'word'); renderInfo(`<b>Paper Ward!</b> The ${e.what === 'attack' ? 'attack' : BY[e.what].name} is cancelled.`); renderBars(); renderYBar(); await wait(650); break;
        case 'power': { AU.play(e.delta > 0 ? 'up' : 'down'); const y = G.find(M, e.uid); setTok(e.uid, y); floatAt(tokEl(e.uid), (e.delta > 0 ? '+' : '−') + Math.abs(e.delta) + ' power', e.delta > 0 ? 'heal' : 'x2', -20); await wait(260); break; }
        case 'attack': { AU.play('whoosh'); const a = tokEl(e.uid), d = tokEl(e.to); lunge(a, d); renderInfo(`<b>${nm(e.id)}</b> attacks!`); await wait(260); break; }
        case 'dmg': {
          const el = tokEl(e.uid);
          AU.play(e.mult > 1 ? 'super' : 'hit'); slashAt(el); flash(el, 'shake'); flash(el, 'hitflash');
          if (e.amount >= 4 || e.hp <= 0) shake(e.amount >= 6 ? 2 : 1);
          if (el) { const hp = el.querySelector('.tk-hp b'); if (hp) hp.textContent = Math.max(0, e.hp); el.querySelector('.tk-hp').classList.add('hurt'); }
          floatAt(el, '−' + e.amount, 'dmg'); if (e.mult > 1) floatAt(el, 'Super effective +1!', 'x2', -34);
          if (e.by) S.dealt[e.by] = (S.dealt[e.by] || 0) + e.amount;
          await wait(300); break;
        }
        case 'ko': {
          const el = tokEl(e.uid); AU.play('ko'); flash(el, sideOf(e.k) === 'me' ? 'flyoffL' : 'flyoff'); floatAt(el, 'KO!', 'ko'); shake(1.4);
          renderInfo(`<b>${nm(e.id)}</b> flies off the rope!${e.rebirth ? ' It returns to the hand (Rebirth).' : ''}`);
          await wait(520); if (el) el.remove(); break;
        }
        case 'bounce': { AU.play('whoosh'); const el = tokEl(e.uid); flash(el, 'flyoff'); renderInfo(`<b>${nm(e.id)}</b> is sent back to the hand!`); await wait(500); if (el) el.remove(); renderBars(); break; }
        case 'heal': { AU.play('heal'); const y = G.find(M, e.uid); setTok(e.uid, y); floatAt(tokEl(e.uid), '+' + e.amount, 'heal'); await wait(160); break; }
        case 'heave': {
          const side = sideOf(e.k), box = $(side === 'me' ? 'teamMe' : 'teamFoe');
          AU.play('heave'); box.classList.remove('pull'); void box.offsetWidth; box.classList.add('pull');
          if (e.k !== S.ME && e.tap) { banner(`${foeName()} taps +${e.tap}!`, ''); AU.play('heave', 0.15); await wait(500); }
          floatAt($('knot'), 'HEAVE!', 'word', -40);
          renderInfo(`${who(e.k)} heave${e.k === S.ME ? '' : 's'}: pull <b>${e.pull}</b>${e.tap ? ` (tapping +${e.tap})` : ''}${e.sap ? ` (slippery −${e.sap})` : ''} − grip <b>${e.grip}</b>${e.event === 'finale' ? ' × 2 (Grand Finale)' : ''} = <b>${e.net > 0 ? '+' + e.net : 'no move'}</b>`);
          await wait(420);
          if (!e.net) { floatAt($('knot'), 'Held!', 'x2', -10); await wait(400); }
          break;
        }
        case 'move': {
          AU.play(e.k === S.ME ? 'gain' : 'loss'); renderMeter(e.rope); puffs($(sideOf(e.k) === 'me' ? 'teamMe' : 'teamFoe'), sideOf(e.k) === 'me' ? -1 : 1);
          swingRope(sideOf(e.k)); if (e.amount >= 8) shake(Math.min(3, e.amount / 6));
          floatAt($('knot'), '+' + e.amount, e.amount >= 10 ? 'pull big' : 'pull', -24);
          if (e.source !== 'heave') renderInfo(`The knot moves <b>${e.amount}</b> toward ${e.k === S.ME ? 'you' : esc(foeName())}!`);
          await wait(650); break;
        }
        case 'end': S.endInfo = e; break;
      }
    }
  }
  /* show the rival's charm for a moment */
  function openPeek(id) { $('pop').innerHTML = `<div class="pin">${UI.cardHTML(id)}<div class="why">${esc(foeName())} plays ${BY[id].name}</div></div>`; $('pop').hidden = false; }
  function closePeek() { $('pop').hidden = true; }

  /* ---------- end of duel ---------- */
  function remoteForfeit(left) {
    if (!S.M || S.M.over) return;
    G.act(S.M, { t: 'forfeit', k: S.FOE }); S.endInfo = { forfeit: S.FOE, left: !!left };
    renderDuel(); endMatch();
  }
  function endMatch() {
    if (S.ended) return;
    S.ended = true; stopTimer();
    const M = S.M, won = M.winner === S.ME, draw = M.winner === 'draw', tut = S.mode === 'tut';
    const info = S.endInfo || {};
    let how = '';
    if (info.forfeit) how = info.forfeit === S.ME ? 'You let go of the rope.' : `${esc(foeName())} ${info.left ? 'left the duel' : 'let go of the rope'}.`;
    else if (M.reason === 'time') how = `After ${G.C.MAX_TURNS} turns each, the knot was ${M.rope === 0 ? 'dead centre' : won ? 'on your side' : 'on their side'}.`;
    else how = won ? 'You pulled the knot all the way to your side!' : `${esc(foeName())} pulled the knot to their side.`;
    let res = null, pay = null;
    if (S.mode === 'ai') { res = LADDER.settle(stats, won, draw); store.set('stats', stats); }
    if ((S.mode === 'ai' || S.mode === 'online') && info.forfeit !== S.ME) { // letting go of the rope earns nothing
      pay = PROF.recordDuel(Object.assign({ mode: S.mode, won, draw, turns: M[S.ME].turns, streak: stats.streak, rankUp: res && res.rankUp ? res.rankUp.name : null, master: res && res.top }, S.tally));
    }
    if (tut) PROF.recordTutorial();
    const mvp = Object.entries(S.dealt).map(([uid, n]) => [+uid, n]).sort((x, y) => y[1] - x[1]).find(([uid]) => uid && M.uid >= uid);
    $('endScreen').innerHTML = `<div class="panel" role="dialog" aria-label="Duel result">
      <div class="big ${won ? 'win' : draw ? '' : 'lose'}">${draw ? 'DRAW' : won ? 'VICTORY!' : 'DEFEAT'}</div>
      <p>${how}</p>
      ${res ? `<div class="rpdelta ${res.delta >= 0 ? 'up' : 'down'}">${res.delta >= 0 ? '+' : ''}${res.delta} RP</div>${res.rankUp ? `<div class="rankup">Rank up! ${res.rankUp.kanji} ${res.rankUp.name}</div>` : ''}${LADDER.badgeHTML(stats)}` : ''}
      ${pay && pay.coins ? `<div class="payout">${pay.lines.map(([l, n]) => `<span>${l}<b>+${n}</b></span>`).join('')}<div class="paytotal">${SCR.COIN}+${pay.coins} koban</div></div>` : ''}
      ${pay && pay.done.length ? `<div class="mdone">${pay.done.map(t => `<span>Mission complete: ${t}</span>`).join('')}<small>Claim the reward in Missions.</small></div>` : ''}
      ${S.mode === 'ai' && S.master ? `<p class="said">“${LADDER.line(won ? 'lose' : 'win')}” — ${S.master.name}</p>` : ''}
      ${tut ? `<p>Tutorial complete! Claim your <b>${SCR.COIN}200 koban</b> quest reward in Missions, open some Lucky Bags, then climb the ranks.</p>` : ''}
      <div class="row">${tut ? '<button class="btn red" type="button" id="toMissions">Claim reward</button>'
        : S.mode === 'online' ? '<button class="btn red" type="button" id="onlineAgain">Play again</button>'
        : '<button class="btn red" type="button" id="rematchBtn">Rematch</button><button class="btn" type="button" id="againBtn">Change deck</button>'}
        <button class="btn" type="button" id="toTitleBtn">Title</button></div></div>`;
    $('endScreen').hidden = false;
    AU.music(null); AU.play(won ? 'win' : 'lose');
    if (won) confetti();
    if (tut) { store.set('tutorialDone', true); TUT.stop(); }
    if ($('rematchBtn')) $('rematchBtn').onclick = () => { $('endScreen').hidden = true; startAI(); };
    if ($('againBtn')) $('againBtn').onclick = () => { $('endScreen').hidden = true; S.M = null; show('setup'); };
    if ($('onlineAgain')) $('onlineAgain').onclick = () => NET.again();
    if ($('toMissions')) $('toMissions').onclick = () => { $('endScreen').hidden = true; S.M = null; show('missions'); };
    if (pay && pay.coins) AU.play('coin', 0.6);
    $('toTitleBtn').onclick = () => { $('endScreen').hidden = true; if (S.mode === 'online') NET.leave(); S.M = null; show('title'); };
    void mvp;
  }

  /* ---------- wiring ---------- */
  $('playBtn').onclick = () => { if (!store.get('tutorialDone', false)) return startTutorial(); show('setup'); };
  $('tutorialBtn').onclick = startTutorial;
  $('friendBtn').onclick = () => { show('online'); NET.render(); };
  $('setupBack').onclick = () => show('title');
  $('shopBtn').onclick = () => show('shop');
  $('decksBtn').onclick = () => show('decks');
  $('missionsBtn').onclick = () => show('missions');
  for (const id of ['shopBack', 'decksBack', 'missionsBack']) $(id).onclick = () => show('title');
  $('rulesBtn').onclick = () => { UI.renderRules(); $('rulesSheet').hidden = false; $('rulesSheet').scrollTop = 0; };
  $('bookBtn').onclick = () => { SCR.renderBook(); $('bookSheet').hidden = false; $('bookSheet').scrollTop = 0; };
  SCR.bindBook();
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => { b.closest('.sheet').hidden = true; if (S.screen === 'title') renderTitle(); });
  $('hand').onclick = e => { const b = e.target.closest('.mini'); if (b) tapHand(b.dataset.id); };
  $('field').onclick = e => { const t = e.target.closest('.tok'); if (t) tapToken(+t.dataset.uid, t.dataset.side); else if ((S.att != null || S.pick) && TUT.allow('cancel')) { clearPick(); renderDuel(); } };
  $('duel').addEventListener('click', () => { if (S.busy) skip = true; }, true);
  $('yBar').onclick = e => { if (e.target.closest('#heaveBtn')) tapHeave(); };
  $('rBar').onclick = e => { if (e.target.closest('#retreatBtn')) retreat(); else if (e.target.closest('.sndbtn')) AU.cycle(); };
  $('titleSnd').onclick = e => { if (e.target.closest('.sndbtn')) AU.cycle(); };
  document.addEventListener('click', e => { if (e.target.closest('.btn:not(#heaveBtn):not(#popGo):not(#popClose)')) AU.play('tap'); }, true);

  /* Android back button (the app asks this first; false means "exit the app") */
  window.KZBack = () => {
    if (!$('pop').hidden) { closePop(true); return true; }
    if (!$('bagOpen').hidden) { if (document.getElementById('boDone')) SCR.closeBag(); return true; }
    for (const id of ['rulesSheet', 'bookSheet']) if (!$(id).hidden) { $(id).hidden = true; if (S.screen === 'title') renderTitle(); return true; }
    if (['setup', 'shop', 'decks', 'missions'].includes(S.screen)) { show('title'); return true; }
    if (S.screen === 'online') { NET.leave(); show('title'); return true; }
    if (S.screen === 'duel') {
      if (!$('endScreen').hidden) { $('toTitleBtn').click(); return true; }
      if (S.mode === 'tut') { TUT.stop(); stopTimer(); S.M = null; show('title'); return true; }
      const armed = retreatArm > Date.now(); retreat(); if (!armed && S.M && !S.M.over) renderInfo('Press <b>back</b> again to let go of the rope and retreat.');
      return true;
    }
    return false;
  };

  window.claude?.hot?.ready ? window.claude.hot.ready(() => show('title')) : show('title');

  return { show, startOnline, applyRemote, remoteForfeit, renderDuel, confetti, get S() { return S; }, store };
})();
