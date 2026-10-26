/* Howl — the page. One phone hosts: it runs the rules engine (logic.js), keeps the clock and
   sends every phone its own view through the relay (net.js). Every phone, the host's included,
   renders the same screens from two things: the public table state and its own private view. */
(function () {
  'use strict';
  const H = self.HOWL, A = self.ART, N = self.NET;
  const app = document.getElementById('app');
  const qs = new URLSearchParams(location.search);
  const SPEED = Math.max(0.02, Math.min(4, parseFloat(qs.get('speed')) || 1)); // testing knob; 1 in real play
  const CODE_ABC = 'BCDFGHJKLMNPQRSTVWXZ';
  const PCOLORS = ['#f4a93c', '#5cc39e', '#ef7895', '#7ea8ff', '#c99bff', '#f0d466', '#5fd0e0', '#ff8f62', '#a9da6c', '#e6a6da', '#a3b4cf', '#d9b78c'];
  const PACE = { quick: 0.75, normal: 1, relaxed: 1.4 };
  const INTRO_SECS = 5, DAWN_SECS = 4, VOTE_SECS = 60, OFFLINE_MS = 12000;

  const store = {
    get(k, d) { try { const v = localStorage.getItem('howl.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('howl.' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
    del(k) { try { localStorage.removeItem('howl.' + k); } catch (e) { /* private mode */ } },
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const cleanName = s => String(s || '').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯]/g, '').replace(/\s+/g, ' ').trim().slice(0, 14);
  const now = () => Date.now();
  const keepParams = () => ['broker', 'speed'].filter(k => qs.get(k)).map(k => '&' + k + '=' + encodeURIComponent(qs.get(k))).join('');
  const roomUrl = code => location.origin + location.pathname + '?r=' + code;

  /* ---------------- client state ---------------- */
  const C = {
    mode: 'home', // home | joining | host | player
    link: null, linkOnline: true, pub: null, priv: null, skew: 0, lastBeat: 0, hostGone: false,
    name: store.get('name', ''), joinCode: (qs.get('r') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4),
    code: '', secret: '', homeErr: '', busy: '', toast: '',
    narr: false, sheet: null, cue: '', buzzKey: '',
    ui: { flipped: '', sel: [], selKey: '', seerTab: 'player', sentKey: '', voteSel: null },
    want: {}, lastPriv: {}, lastPubKey: '', onlineSig: '',
  };
  let HS = null; // the host's whole game, only on the host's phone

  /* ================= HOST ================= */
  const hp = id => HS.players.find(p => p.id === id);
  const isOnline = p => !!p && !p.left && (p.id === HS.hostId || now() - p.last < OFFLINE_MS);
  const inRound = id => !!(HS.g && HS.g.seats.includes(id));
  const activeIds = () => HS.players.filter(p => !p.waiting && !p.left).map(p => p.id);
  function genCode() { const a = new Uint8Array(4); crypto.getRandomValues(a); return Array.from(a, x => CODE_ABC[x % CODE_ABC.length]).join(''); }
  function freeColor() { const used = new Set(HS.players.map(p => p.color)); for (let i = 0; i < PCOLORS.length; i++) if (!used.has(i)) return i; return HS.players.length % PCOLORS.length; }
  function uniqueName(name, exceptId) {
    const taken = x => HS.players.some(p => p.id !== exceptId && !p.left && p.name.toLowerCase() === x.toLowerCase());
    let n = name || 'Player', k = 2;
    while (taken(n)) n = (name || 'Player').slice(0, 11) + ' ' + k++;
    return n;
  }

  async function hostCreate() {
    const name = cleanName(C.name);
    if (!name) { C.homeErr = 'Type your name first.'; render(); return; }
    const code = genCode();
    C.busy = 'Opening a room…'; C.homeErr = ''; render();
    let link;
    try { link = await N.host(code); } catch (e) { C.busy = ''; C.homeErr = 'Couldn’t reach the game server. Check your internet and try again.'; render(); return; }
    const hostId = N.rid(6), hostSecret = N.rid(16);
    HS = {
      v: 1, code, relay: link.relayIndex, hostId, hostSecret, created: now(),
      players: [{ id: hostId, secret: hostSecret, name, color: 0, last: now() }],
      deck: H.cleanDeck(store.get('deck', null) || H.suggestDeck(5)),
      settings: Object.assign({ day: 5, pace: 'normal' }, store.get('settings', {})),
      phase: 'lobby', roundNo: 0, g: null, ready: {}, voteReady: {}, votes: {}, locked: {}, t: {}, reveal: null,
    };
    store.del('session');
    startHosting(link);
  }

  async function hostResume(saved) {
    C.mode = 'joining'; C.busy = 'Reopening room ' + saved.code + '…'; render();
    let link;
    try { link = await N.host(saved.code, saved.relay); } catch (e) { C.mode = 'home'; C.busy = ''; C.homeErr = 'Couldn’t reach the game server. Check your internet and try again.'; render(); return; }
    HS = saved; HS.relay = link.relayIndex;
    HS.players.forEach(p => { p.last = now(); }); // give everyone a moment to reconnect
    startHosting(link);
  }

  function startHosting(link) {
    C.mode = 'host'; C.link = link; C.code = HS.code; C.busy = ''; C.homeErr = ''; C.linkOnline = true;
    C.narr = store.get('narrHost', true);
    C.lastPriv = {}; C.lastPubKey = '';
    link.sub('h', m => hostMsg(m));
    link.onStatus(on => { C.linkOnline = on; if (on) flush(true); render(); });
    clearInterval(C.hostTimer); C.hostTimer = setInterval(hostTick, 250);
    clearInterval(C.beatTimer); C.beatTimer = setInterval(() => { if (C.link) C.link.pub('b', { now: now() }); }, 2500);
    link.pub('b', { now: now() });
    history.replaceState(null, '', location.pathname + '?r=' + HS.code + keepParams());
    flush(true);
  }

  function hostMsg(m) {
    if (!HS || !m || typeof m.s !== 'string' || typeof m.t !== 'string') return;
    let p = HS.players.find(x => x.secret === m.s);
    if (m.t === 'join') {
      const name = cleanName(m.name) || 'Player';
      if (p) {
        p.last = now();
        if (p.left && (HS.phase === 'lobby' || inRound(p.id))) p.left = false;
        if (name !== p.name) p.name = uniqueName(name, p.id);
        changed(); flushPriv(p, true); return;
      }
      if (HS.players.filter(x => !x.left).length >= H.MAX_PLAYERS) { C.link.pub('p/' + m.s, { err: 'full' }); return; }
      p = { id: N.rid(6), secret: m.s, name: uniqueName(name), color: freeColor(), last: now() };
      if (HS.phase !== 'lobby') p.waiting = true;
      HS.players.push(p); changed(); return;
    }
    if (!p) { if (m.t !== 'leave') C.link.pub('p/' + m.s, { err: 'unknown' }); return; }
    const wasOn = isOnline(p);
    p.last = now();
    switch (m.t) {
      case 'ping': if (!wasOn) changed(); break;
      case 'leave': removePlayer(p); break;
      case 'ready': if (HS.phase === 'roles' && inRound(p.id) && !HS.ready[p.id]) { HS.ready[p.id] = 1; changed(); } break;
      case 'act': if (HS.phase === 'night' && HS.g && m.si === HS.g.si && H.act(HS.g, p.id, m.a || {})) changed(); break;
      case 'vready': if (HS.phase === 'day' && inRound(p.id)) { HS.voteReady[p.id] = m.on ? 1 : 0; changed(); } break;
      case 'vote':
        if (HS.phase === 'vote' && inRound(p.id) && !HS.locked[p.id] && inRound(m.target) && m.target !== p.id) { HS.votes[p.id] = m.target; HS.locked[p.id] = 1; changed(); }
        break;
    }
  }

  function removePlayer(p) {
    if (p.id === HS.hostId) return;
    if (inRound(p.id) && HS.phase !== 'lobby') { p.left = true; }
    else { HS.players = HS.players.filter(x => x !== p); C.link.pub('p/' + p.secret, null, true); delete C.lastPriv[p.id]; }
    changed();
  }

  /* host-only commands from the host's own screen */
  const hostCmd = {
    deck(role, delta) {
      if (HS.phase !== 'lobby') return;
      const R = H.ROLES[role], d = Object.assign({}, HS.deck);
      d[role] = Math.max(0, Math.min(R.max, (d[role] || 0) + delta * (R.pair ? 2 : 1)));
      HS.deck = H.cleanDeck(d); store.set('deck', HS.deck); changed();
    },
    suggest() { HS.deck = H.suggestDeck(activeIds().length); store.set('deck', HS.deck); changed(); },
    setting(k, v) {
      if (k === 'day') HS.settings.day = Math.max(1, Math.min(15, parseInt(v, 10) || 5));
      if (k === 'pace' && PACE[v]) HS.settings.pace = v;
      store.set('settings', HS.settings); changed();
    },
    kick(id) {
      const p = hp(id);
      if (!p || p.id === HS.hostId) return;
      C.link.pub('p/' + p.secret, { kicked: 1 }, true);
      HS.players = HS.players.filter(x => x !== p); delete C.lastPriv[p.id];
      if (HS.g && inRound(id)) p.left = true;
      changed();
    },
    start() {
      const ids = activeIds();
      if (!H.checkDeck(HS.deck, ids.length).ok) return;
      HS.g = H.newRound(ids, HS.deck);
      HS.roundNo++; HS.phase = 'roles'; HS.ready = {}; HS.voteReady = {}; HS.votes = {}; HS.locked = {}; HS.reveal = null; HS.t = {};
      changed();
    },
    night() { if (HS.phase === 'roles') startNight(); },
    vote() { if (HS.phase === 'day') startVote(); },
    addMin() { if (HS.phase === 'day') { HS.t.dayEnds += 60000; changed(); } },
    reveal() { if (HS.phase === 'vote') doReveal(); },
    again() {
      if (HS.phase !== 'reveal') return;
      HS.players.filter(p => p.left).forEach(p => C.link.pub('p/' + p.secret, null, true));
      HS.players = HS.players.filter(p => !p.left);
      HS.players.forEach(p => { delete p.waiting; });
      HS.phase = 'lobby'; HS.g = null; HS.reveal = null; HS.t = {};
      changed();
    },
    close() { closeRoom(); },
  };

  function startNight() {
    HS.phase = 'night'; HS.g.si = -1;
    HS.t.stepDur = INTRO_SECS * 1000 * SPEED; HS.t.stepEnds = now() + HS.t.stepDur;
    changed();
  }
  function advanceNight() {
    const g = HS.g;
    if (g.si >= 0 && g.si < g.steps.length) H.endStep(g);
    const next = g.si + 1;
    if (next < g.steps.length) {
      H.startStep(g, next);
      const base = H.NIGHT.find(s => s.role === g.steps[next]).dur;
      HS.t.stepDur = base * 1000 * (PACE[HS.settings.pace] || 1) * SPEED;
    } else if (next === g.steps.length) {
      g.si = next; HS.t.stepDur = DAWN_SECS * 1000 * SPEED;
    } else { startDay(); return; }
    HS.t.stepEnds = now() + HS.t.stepDur;
    changed();
  }
  function startDay() { HS.phase = 'day'; HS.t.dayEnds = now() + HS.settings.day * 60000 * SPEED; changed(); }
  function startVote() { HS.phase = 'vote'; HS.t.voteEnds = now() + VOTE_SECS * 1000 * SPEED; changed(); }
  function doReveal() {
    const g = HS.g, res = H.tally(g, HS.votes);
    HS.reveal = { seats: g.seats, orig: g.orig, cur: g.cur, center0: g.center0, center: g.center, dop: g.dop, votes: HS.votes, res, log: g.log };
    HS.phase = 'reveal'; changed();
  }

  function hostTick() {
    if (!HS) return;
    const t = now(), g = HS.g;
    const sig = HS.players.map(p => (isOnline(p) ? 1 : 0)).join('');
    if (sig !== C.onlineSig) { C.onlineSig = sig; changed(); }
    const here = () => g.seats.filter(id => isOnline(hp(id)));
    if (HS.phase === 'roles') { const on = here(); if (on.length && on.every(id => HS.ready[id])) startNight(); }
    else if (HS.phase === 'night') { if (t >= HS.t.stepEnds) advanceNight(); }
    else if (HS.phase === 'day') { const on = here(); if (t >= HS.t.dayEnds || (on.length && on.every(id => HS.voteReady[id]))) startVote(); }
    else if (HS.phase === 'vote') { const on = here(); if (t >= HS.t.voteEnds || on.every(id => HS.locked[id])) doReveal(); }
  }

  function publicView() {
    const S = HS, g = S.g;
    const pv = {
      v: 1, code: S.code, phase: S.phase, round: S.roundNo, host: S.hostId, deck: S.deck, settings: S.settings,
      players: S.players.map(p => {
        const o = { id: p.id, name: p.name, c: p.color, on: isOnline(p) ? 1 : 0 };
        if (p.waiting) o.w = 1;
        if (p.left) o.left = 1;
        if (S.phase === 'roles' && S.ready[p.id]) o.rd = 1;
        if (S.phase === 'day' && S.voteReady[p.id]) o.vr = 1;
        if (S.phase === 'vote' && S.locked[p.id]) o.vt = 1;
        return o;
      }),
    };
    if (g) pv.seats = g.seats;
    if (S.phase === 'night') pv.night = { steps: g.steps, si: g.si, ends: S.t.stepEnds, dur: S.t.stepDur };
    if (S.phase === 'day') pv.day = { ends: S.t.dayEnds };
    if (S.phase === 'vote') pv.vote = { ends: S.t.voteEnds };
    if (S.phase === 'reveal') pv.reveal = S.reveal;
    return pv;
  }
  function privateView(id) {
    const S = HS, g = S.g, p = hp(id);
    const v = { id, phase: S.phase, round: S.roundNo };
    if (p && p.waiting) v.waiting = 1;
    if (g && g.seats.includes(id)) {
      v.card = g.orig[id];
      v.info = g.info[id];
      if (S.phase === 'roles') v.ready = S.ready[id] ? 1 : 0;
      if (S.phase === 'night' && g.si >= 0 && g.si < g.steps.length) {
        v.si = g.si;
        if (g.pending[id]) v.pending = g.pending[id];
        if (g.pending[id] || H.awake(g, g.steps[g.si]).includes(id)) v.awake = 1;
      }
      if (S.phase === 'day') v.vr = S.voteReady[id] ? 1 : 0;
      if (S.phase === 'vote') { v.vote = S.votes[id] || null; v.locked = S.locked[id] ? 1 : 0; }
    }
    return v;
  }

  function changed() { flush(false); }
  function flush(force) {
    C.forceFlush = C.forceFlush || force;
    if (C.flushT) return;
    C.flushT = setTimeout(() => { const f = C.forceFlush; C.flushT = 0; C.forceFlush = false; doFlush(f); }, 15);
  }
  function doFlush(force) {
    if (!HS) return;
    const pv = publicView(), key = JSON.stringify(pv);
    if (C.link && (force || key !== C.lastPubKey)) { C.lastPubKey = key; C.link.pub('s', Object.assign({ now: now() }, pv), true); }
    for (const p of HS.players) if (p.id !== HS.hostId) flushPriv(p, force);
    C.pub = pv; C.priv = privateView(HS.hostId); C.skew = 0; C.lastBeat = now();
    store.set('host', HS);
    render();
  }
  function flushPriv(p, force) {
    if (!C.link) return;
    const v = privateView(p.id), k = JSON.stringify(v);
    if (force || k !== C.lastPriv[p.id]) { C.lastPriv[p.id] = k; C.link.pub('p/' + p.secret, v, true); }
  }

  function closeRoom() {
    if (!HS) return;
    const link = C.link, players = HS.players.slice();
    link.pub('s', { closed: 1, code: HS.code }, true);
    players.forEach(p => { if (p.id !== HS.hostId) link.pub('p/' + p.secret, null, true); });
    setTimeout(() => { link.pub('s', null, true); setTimeout(() => link.end(), 800); }, 1500);
    clearInterval(C.hostTimer); clearInterval(C.beatTimer);
    HS = null; store.del('host');
    resetToHome('');
  }

  /* ================= PLAYER ================= */
  async function joinRoom(code, auto) {
    code = String(code || '').toUpperCase().replace(/[^A-Z]/g, '');
    const name = cleanName(C.name);
    if (!name) { C.homeErr = 'Type your name first.'; render(); return; }
    if (code.length !== 4) { C.homeErr = 'Room codes have 4 letters.'; render(); return; }
    const sess = store.get('session', null);
    const same = sess && sess.code === code;
    C.secret = same ? sess.secret : N.rid(16);
    C.mode = 'joining'; C.code = code; C.homeErr = ''; C.busy = 'Looking for room ' + code + '…'; render();
    let link;
    try { link = await N.find(code, same ? sess.relay : null); } catch (e) {
      C.mode = 'home'; C.busy = '';
      C.homeErr = e.message === 'no-room' ? `There’s no open room ${code}. Check the code with your host.` : 'Couldn’t reach the game server. Check your internet and try again.';
      if (auto && e.message === 'no-room') store.del('session');
      render(); return;
    }
    C.link = link; C.mode = 'player'; C.busy = ''; C.pub = null; C.priv = null; C.hostGone = false; C.linkOnline = true; C.want = {};
    C.narr = store.get('narr', false);
    store.set('session', { code, secret: C.secret, relay: link.relayIndex, at: now() });
    C.lastBeat = now();
    link.sub('b', d => { C.lastBeat = now(); if (d && d.now) C.skew = d.now - now(); if (C.hostGone) { C.hostGone = false; render(); } });
    link.sub('s', onPub);
    link.sub('p/' + C.secret, onPriv);
    link.onStatus(on => { C.linkOnline = on; if (on) send('join', { name: cleanName(C.name) }); render(); });
    send('join', { name });
    clearInterval(C.pingTimer); C.pingTick = 0;
    C.pingTimer = setInterval(playerTick, 1000);
    history.replaceState(null, '', location.pathname + '?r=' + code + keepParams());
    render();
  }
  function onPub(d) {
    if (!d) return;
    if (d.closed) { endSession('The host closed the room.'); return; }
    if (d.code !== C.code) return;
    C.pub = d; render();
  }
  function onPriv(d) {
    if (!d) return;
    if (d.kicked) { endSession('The host removed you from the room.'); return; }
    if (d.err === 'full') { endSession('That room is full. Twelve players is the most.'); return; }
    if (d.err === 'unknown') { send('join', { name: cleanName(C.name) }); return; }
    if (!d.id) return;
    C.priv = d; checkWants(); render();
  }
  function playerTick() {
    C.pingTick++;
    if (C.pingTick % 4 === 0) send('ping');
    const gone = now() - C.lastBeat > 10000;
    if (gone !== C.hostGone) { C.hostGone = gone; render(); }
    for (const [t, w] of Object.entries(C.want)) {
      if (w.done(C.priv)) { delete C.want[t]; continue; }
      if (now() - w.at > 2500) { w.at = now(); send(t, w.data); }
    }
  }
  function checkWants() { for (const [t, w] of Object.entries(C.want)) if (w.done(C.priv)) delete C.want[t]; }
  function want(t, data, done) { send(t, data); if (C.mode === 'player') C.want[t] = { data, done, at: now() }; }
  function send(t, data) {
    if (C.mode === 'host') { hostMsg(Object.assign({ s: HS.hostSecret, t }, data || {})); return; }
    if (C.link) C.link.pub('h', Object.assign({ s: C.secret, t }, data || {}));
  }
  function endSession(msg) {
    if (C.mode === 'player' && C.link) C.link.end();
    clearInterval(C.pingTimer);
    store.del('session');
    resetToHome(msg);
  }
  function resetToHome(msg) {
    C.mode = 'home'; C.link = null; C.pub = null; C.priv = null; C.homeErr = msg || ''; C.busy = ''; C.sheet = null; C.want = {};
    document.body.dataset.sky = 'night';
    history.replaceState(null, '', location.pathname + (keepParams() ? '?' + keepParams().slice(1) : ''));
    releaseWake();
    render();
  }

  /* ================= SOUND, BUZZ, SCREEN ================= */
  let audio = null;
  function unlockAudio() {
    try { if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); } catch (e) { audio = null; }
  }
  function chime() {
    if (!audio) return;
    try {
      const t = audio.currentTime;
      [[523.25, 0], [783.99, 0.14]].forEach(([f, d]) => {
        const o = audio.createOscillator(), gn = audio.createGain();
        o.type = 'sine'; o.frequency.value = f;
        gn.gain.setValueAtTime(0.0001, t + d); gn.gain.exponentialRampToValueAtTime(0.18, t + d + 0.02); gn.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.6);
        o.connect(gn).connect(audio.destination); o.start(t + d); o.stop(t + d + 0.65);
      });
    } catch (e) { /* no sound */ }
  }
  function buzz() { try { navigator.vibrate && navigator.vibrate([220, 90, 220]); } catch (e) { /* no vibration */ } chime(); }
  function speak(text) {
    try {
      if (!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.rate = 0.92; u.pitch = 0.85; u.lang = 'en-US';
      speechSynthesis.speak(u);
    } catch (e) { /* no voice */ }
  }
  const wakeName = r => (r === 'werewolf' ? 'Werewolves' : r === 'mason' ? 'Masons' : H.ROLES[r].name);
  function cues() {
    const pub = C.pub, priv = C.priv;
    if (!pub) return;
    const n = pub.night;
    const key = `${pub.round}|${pub.phase}|${n ? n.si : ''}`;
    if (key !== C.cue) {
      const first = !C.cue; C.cue = key;
      if (!first && C.narr) {
        let say = '';
        if (pub.phase === 'roles') say = 'Look at your card.';
        else if (pub.phase === 'night') {
          if (n.si < 0) say = 'Night falls. Everyone, close your eyes.';
          else if (n.si >= n.steps.length) say = (n.steps.length ? wakeName(n.steps[n.steps.length - 1]) + ', close your eyes. ' : '') + 'Dawn is breaking.';
          else say = (n.si > 0 ? wakeName(n.steps[n.si - 1]) + ', close your eyes. ' : '') + wakeName(n.steps[n.si]) + ', wake up.';
        } else if (pub.phase === 'day') say = 'Everyone, wake up. Find the Werewolves.';
        else if (pub.phase === 'vote') say = 'Time to vote.';
        else if (pub.phase === 'reveal' && pub.reveal) say = pub.reveal.res.headline + '.';
        if (say) speak(say);
      }
    }
    if (priv && priv.awake && pub.phase === 'night' && priv.si === (n && n.si)) {
      const bk = pub.round + '|' + priv.si;
      if (bk !== C.buzzKey) { C.buzzKey = bk; buzz(); }
    }
  }
  let wake = null;
  async function keepAwake() {
    if (wake || C.mode === 'home' || document.visibilityState !== 'visible' || !('wakeLock' in navigator)) return;
    try { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } catch (e) { wake = null; }
  }
  function releaseWake() { try { if (wake) wake.release(); } catch (e) { /* already released */ } wake = null; }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { keepAwake(); if (C.mode === 'host') flush(true); } });

  /* ================= RENDER HELPERS ================= */
  const myId = () => (C.mode === 'host' ? HS && HS.hostId : C.priv && C.priv.id);
  const isHost = () => C.mode === 'host';
  const pl = id => (C.pub && C.pub.players.find(p => p.id === id)) || { id, name: 'Someone', c: 11 };
  const pcol = p => PCOLORS[(p.c || 0) % PCOLORS.length];
  const roleBase = r => String(r || '').replace(/^doppel:/, '');
  const rcolor = r => A.COLORS[roleBase(r)] || '#888';
  function roleName(r, plural) {
    if (!r) return '?';
    if (String(r).startsWith('doppel:')) return 'Doppelganger-' + H.ROLES[roleBase(r)].name;
    const R = H.ROLES[r];
    return R ? (plural ? R.plural : R.name) : r;
  }
  const chip = (r, n, plural) => `<span class="rc" style="--rc:${rcolor(r)}">${A.emblem(r, { size: 20 })}${esc(roleName(r, plural))}${n > 1 ? ` <span class="n">×${n}</span>` : ''}</span>`;
  const who = (id, you) => { const p = pl(id); return `<span class="who" style="--pc:${pcol(p)}"><i></i>${esc(p.name)}${you !== false && id === myId() ? ' (you)' : ''}</span>`; };
  const centerName = i => `${H.CENTER_NAMES[i] || '?'} center card`;
  function lineHTML(line, plain) {
    return (line || []).map(s => {
      if (typeof s === 'string') return esc(s);
      if (s.p) return who(s.p, plain ? false : undefined);
      if (s.r) return chip(s.r, 0, !!s.pl);
      if (s.c != null) return `<b>${centerName(s.c)}</b>`;
      return '';
    }).join('');
  }
  const finalLabel = (card, dop) => (card === 'doppelganger' && dop && dop.copy ? 'doppel:' + dop.copy : card);
  function bigCard(role, up) {
    const R = H.ROLES[roleBase(role)];
    return `<button class="card3d ${up ? 'up' : ''}" data-act="flip" aria-label="${up ? esc('Your card: ' + R.name) : 'Tap to see your card'}">
      <span class="in"><span class="face back">${A.back(240)}</span>
      <span class="face front" style="--rc:${rcolor(role)}"><span class="team">${R.team === 'wolf' ? 'Werewolf team' : 'Village team'}</span>
      <span class="art">${A.emblem(role, { size: 120 })}</span><span class="nm">${esc(R.name)}</span><span class="bl">${esc(R.blurb)}</span></span></span></button>`;
  }
  const mini = (role, label) => `<span class="minicard" style="--rc:${rcolor(role)}">${A.emblem(role, { size: 40 })}<b>${esc(label || roleName(role))}</b></span>`;
  const miniBack = () => `<span class="minicard back">${A.back(70)}</span>`;
  const deckChips = deck => `<div class="chips">${H.ROLE_KEYS.filter(k => deck[k]).map(k => chip(k, deck[k])).join('')}</div>`;
  const timer = (ends, cls) => `<span class="${cls || ''}" data-ends="${ends}"> </span>`;
  const timebar = (ends, dur) => `<div class="timebar"><span data-ends="${ends}" data-dur="${dur}" data-fmt="bar"></span></div>`;
  const icon = {
    speaker: on => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/>${on ? '<path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>' : '<path d="M17 9l5 6M22 9l-5 6"/>'}</svg>`,
    menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>`,
  };

  function playersList(opts) {
    opts = opts || {};
    const pub = C.pub;
    const list = pub.players.filter(p => !(opts.seated && pub.seats && !pub.seats.includes(p.id)));
    return `<ul class="players">${list.map(p => {
      const mark = opts.mark && opts.mark(p);
      const sub = [];
      if (p.id === myId()) sub.push('you');
      if (p.id === pub.host) sub.push('host');
      if (p.left) sub.push('left');
      else if (!p.on) sub.push('offline');
      if (p.w) sub.push('next round');
      if (mark) sub.push(mark);
      const kick = isHost() && opts.kick && p.id !== pub.host ? `<button class="kick" data-act="kick" data-arg="${p.id}" aria-label="Remove ${esc(p.name)}">✕</button>` : '';
      return `<li class="${!p.on || p.left ? 'off' : ''} ${mark ? 'mark' : ''}" style="--pc:${pcol(p)}"><span class="av">${esc((p.name[0] || '?').toUpperCase())}</span><span class="nm"><b>${esc(p.name)}</b><small>${esc(sub.join(', ')) || ' '}</small></span>${kick}</li>`;
    }).join('')}</ul>`;
  }

  /* ================= SCREENS ================= */
  function render() {
    let html;
    const pub = C.pub, priv = C.priv;
    let sky = 'night';
    if (C.mode === 'home') html = homeScreen();
    else if (C.mode === 'joining' || !pub || (!priv && C.mode === 'player')) html = frame(`<main class="stage" style="justify-content:center;flex:1;align-content:center"><h2>${esc(C.busy || 'Joining room ' + C.code + '…')}</h2><p class="muted">This takes a few seconds.</p></main>`);
    else if (priv && priv.waiting && pub.phase !== 'lobby') html = frame(waitingScreen());
    else {
      if (pub.phase === 'lobby') html = frame(lobbyScreen());
      else if (pub.phase === 'roles') html = frame(rolesScreen());
      else if (pub.phase === 'night') html = frame(nightScreen());
      else if (pub.phase === 'day') { html = frame(dayScreen()); sky = 'dawn'; }
      else if (pub.phase === 'vote') { html = frame(voteScreen()); sky = 'dawn'; }
      else if (pub.phase === 'reveal') { html = frame(revealScreen()); sky = pub.reveal.res.kind === 'wolf' ? 'wolf' : pub.reveal.res.kind === 'village' ? 'village' : 'none'; }
      else html = frame('<main></main>');
    }
    document.body.dataset.sky = sky;
    if (C.mode === 'home') delete document.body.dataset.room; else document.body.dataset.room = '1';
    const focus = document.activeElement && document.activeElement.id;
    const caret = focus && document.activeElement.selectionStart;
    app.innerHTML = html + sheetHTML();
    if (focus) { const el = document.getElementById(focus); if (el) { el.focus(); try { el.setSelectionRange(caret, caret); } catch (e) { /* not a text field */ } } }
    updateTimers();
    if (C.mode === 'host' || C.mode === 'player') { cues(); keepAwake(); }
  }

  function frame(inner) {
    const off = !C.linkOnline ? 'Reconnecting to the game server…' : C.hostGone && C.mode === 'player' ? 'Can’t reach the host’s phone. Waiting for it to come back…' : '';
    return `<header class="bar"><span class="brand">Howl</span>
      <button class="codechip" data-act="share" aria-label="Share room ${esc(C.code)}">${esc(C.code)}</button>
      <button class="iconbtn" data-act="narr" aria-pressed="${C.narr}" aria-label="Narrator voice ${C.narr ? 'on' : 'off'}">${icon.speaker(C.narr)}</button>
      <button class="iconbtn" data-act="menu" aria-label="Menu">${icon.menu}</button></header>
      ${off ? `<div class="banner" role="status">${off}</div>` : ''}${C.toast ? `<div class="banner" role="status" style="background:#173a30e6;border-color:#5cc39e88">${esc(C.toast)}</div>` : ''}${inner}`;
  }

  function homeScreen() {
    const host = store.get('host', null), sess = store.get('session', null);
    const resume = host && now() - (host.created || 0) < 12 * 3600e3 ? `<button class="btn primary" data-act="resumeHost">Back to your room ${esc(host.code)}</button>` :
      sess && now() - (sess.at || 0) < 12 * 3600e3 ? `<button class="btn primary" data-act="resumeJoin">Back to room ${esc(sess.code)}</button>` : '';
    const busy = !!C.busy;
    return `<main class="home">
      <h1 class="title">Howl</h1>
      <p class="tagline">One night in a village with Werewolves in it. Everyone plays on their own phone, 3 to 12 players.</p>
      ${resume ? `<div class="panel">${resume}</div>` : ''}
      <div class="panel">
        <label class="field" for="nm">Your name<input class="input" id="nm" maxlength="14" autocomplete="nickname" value="${esc(C.name)}" placeholder="Name your friends will see"></label>
        <label class="field" for="cd">Room code<input class="input codein" id="cd" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${esc(C.joinCode)}" placeholder="ABCD"></label>
        <button class="btn primary" data-act="join" ${busy ? 'disabled' : ''}>Join room</button>
        <div class="or">or</div>
        <button class="btn" data-act="host" ${busy ? 'disabled' : ''}>Host a new room</button>
        ${C.busy ? `<p class="muted" role="status">${esc(C.busy)}</p>` : ''}
        ${C.homeErr ? `<p class="err" role="alert">${esc(C.homeErr)}</p>` : ''}
      </div>
      <details class="rules"><summary>How to play</summary>${rulesList()}</details>
    </main>`;
  }
  function rulesList() {
    return `<ol>
      <li>The host opens a room and picks the cards. Friends join with the 4-letter code.</li>
      <li>Everyone gets a secret card. Three more cards stay face down in the center.</li>
      <li>At night, each role wakes in turn on its owner’s phone. Your phone buzzes when it’s your turn.</li>
      <li>In the morning you talk. Werewolves lie, and some cards may have been swapped in the night.</li>
      <li>Everyone votes at once. The player with the most votes dies (it takes at least 2 votes).</li>
      <li>The village wins if a Werewolf dies. The Werewolves win if none of them die. Your team is the card in front of you at dawn.</li>
    </ol>`;
  }

  function waitingScreen() {
    return `<main><div class="stage"><h2>A round is on</h2><p class="muted">You’re in the room. You’ll get a card when the next round starts.</p></div>${playersList()}</main>`;
  }

  function lobbyScreen() {
    const pub = C.pub, host = isHost();
    const ids = pub.players.filter(p => !p.w && !p.left).map(p => p.id), n = ids.length;
    const chk = H.checkDeck(pub.deck, n);
    let deckPart;
    if (host) {
      const rec = chk.rec;
      const status = chk.balance === 'ok' ? `Your deck has ${chk.evil} bad card${chk.evil === 1 ? '' : 's'}. That’s balanced.`
        : chk.balance === 'light' ? `Your deck has ${chk.evil} bad card${chk.evil === 1 ? '' : 's'}. That’s easy for the village.`
        : `Your deck has ${chk.evil} bad cards. That’s hard for the village.`;
      const over = chk.size > chk.want;
      deckPart = `<section class="panel"><h3>Cards</h3>
        <div class="meter"><span>Cards in the deck</span><span class="${chk.size !== chk.want ? 'bad' : ''}"><b>${chk.size}</b> of ${chk.want}</span></div>
        <div class="bar-track ${over ? 'over' : ''}"><span style="width:${Math.min(100, (chk.size / chk.want) * 100)}%"></span></div>
        <p class="small muted">${n} player${n === 1 ? '' : 's'} + 3 cards in the center = ${chk.want} cards.</p>
        <div class="advice ${chk.balance}"><p>For <b>${n < 3 ? 3 : n} players</b> we suggest <b>${esc(rec.text)}</b>. ${esc(rec.why)}</p><p class="status">${status}</p>
          <button class="btn small" data-act="suggest">Use a suggested deck for ${n < 3 ? 3 : n}</button></div>
        <ul class="deck">${H.ROLE_KEYS.map(k => {
          const R = H.ROLES[k], c = pub.deck[k] || 0, step = R.pair ? 2 : 1;
          return `<li class="${c ? 'in' : ''} ${R.team === 'wolf' ? 'wolf' : ''}"><span class="ic">${A.emblem(k, { size: 36 })}</span>
            <span class="tx"><b>${esc(R.name)}</b><small>${esc(R.blurb)}</small></span>
            <span class="step"><button data-act="deck" data-arg="${k}" data-d="-1" ${c <= 0 ? 'disabled' : ''} aria-label="One less ${esc(R.name)}">−</button><output aria-live="polite">${c}</output><button data-act="deck" data-arg="${k}" data-d="1" ${c + step > R.max ? 'disabled' : ''} aria-label="One more ${esc(R.name)}">+</button></span></li>`;
        }).join('')}</ul>
        ${chk.notes.map(x => `<p class="small muted">${esc(x)}</p>`).join('')}
      </section>
      <section class="panel"><h3>Talking time in the morning</h3>
        <div class="seg">${[3, 5, 7, 10].map(m => `<button data-act="setting" data-arg="day" data-v="${m}" aria-pressed="${pub.settings.day === m}">${m} min</button>`).join('')}</div>
        <h3>Night speed</h3>
        <div class="seg">${[['quick', 'Quick'], ['normal', 'Normal'], ['relaxed', 'Relaxed']].map(([v, l]) => `<button data-act="setting" data-arg="pace" data-v="${v}" aria-pressed="${pub.settings.pace === v}">${l}</button>`).join('')}</div>
      </section>`;
    } else {
      deckPart = `<section class="panel"><h3>Cards the host picked</h3>${deckChips(pub.deck)}<p class="small muted">${chk.size} cards for ${n} players and 3 in the center. ${pub.settings.day} minutes of talking.</p></section>`;
    }
    const hostName = pl(pub.host).name;
    const foot = host
      ? `<div class="foot">${chk.ok ? '' : `<p class="note">${esc(chk.problems[0])}</p>`}<button class="btn primary" data-act="start" ${chk.ok ? '' : 'disabled'}>Deal the cards</button></div>`
      : `<div class="foot"><p class="note">Waiting for ${esc(hostName)} to deal the cards.</p></div>`;
    return `<main>
      <section class="panel codebox"><span class="muted">Room code</span><b class="code">${esc(pub.code)}</b>
        <p class="small muted">Friends open this page and type the code, or tap your invite link.</p>
        <div class="row"><button class="btn small" data-act="share">Share invite</button><a class="btn small" href="https://wa.me/?text=${encodeURIComponent('Join my Howl game! Room ' + pub.code + ': ' + roomUrl(pub.code))}" target="_blank" rel="noopener">Send on WhatsApp</a></div></section>
      <section class="panel"><h3>Players <span class="muted">${n} of ${H.MAX_PLAYERS}</span></h3>${playersList({ kick: true })}
        ${host ? '<p class="small muted">Keep this phone’s screen on while you host. The game runs on it.</p>' : ''}</section>
      ${deckPart}</main>${foot}`;
  }

  function rolesScreen() {
    const pub = C.pub, priv = C.priv, card = priv.card;
    if (!card) return waitingScreen();
    const key = pub.round + '';
    const up = C.ui.flipped === key;
    const seats = pub.seats || [];
    const readyN = pub.players.filter(p => seats.includes(p.id) && p.rd).length;
    return `<main><div class="stage"><h2>Your card</h2><p class="muted">${up ? 'Remember it. Your team can change in the night.' : 'Tap the card to look. Keep your screen to yourself.'}</p></div>
      <div class="cardwrap">${bigCard(card, up)}</div>
      ${playersList({ seated: true, mark: p => (p.rd ? 'ready' : '') })}</main>
      <div class="foot"><p class="note">${readyN} of ${seats.length} ready. The night starts when everyone is.</p>
      ${priv.ready ? '<button class="btn" disabled>You’re ready</button>' : `<button class="btn primary" data-act="ready" ${up ? '' : 'disabled'}>I’m ready for the night</button>`}
      ${isHost() && readyN < seats.length ? '<button class="btn small ghost" data-act="hnight">Start the night now</button>' : ''}</div>`;
  }

  function nightScreen() {
    const pub = C.pub, priv = C.priv, n = pub.night;
    const steps = n.steps, si = n.si;
    const order = `<ol class="order" aria-label="Wake order">${steps.map((r, i) => `<li class="${i < si ? 'done' : i === si ? 'now' : ''}" title="${esc(H.ROLES[r].name)}">${A.emblem(r, { size: 22 })}</li>`).join('')}</ol>`;
    let stage;
    if (si < 0) stage = `<h2>Night falls</h2><p class="muted">Stay quiet. When your role wakes up, your phone buzzes and shows you what to do.</p>`;
    else if (si >= steps.length) stage = `<h2>Dawn is breaking</h2><p class="muted">The night is over. Get ready to talk.</p>`;
    else { const r = steps[si]; const many = r === 'werewolf' || r === 'mason'; stage = `<h2>The ${esc(many ? H.ROLES[r].plural : H.ROLES[r].name)} ${many ? 'are' : 'is'} awake</h2>`; }
    stage += timebar(n.ends, n.dur);
    let action = '';
    if (priv.pending && priv.si === si) action = actionPanel(priv.pending, si);
    else if (priv.awake && priv.si === si) action = `<section class="panel act"><p class="prompt">You’re awake.</p>${(priv.info || []).length ? `<p class="line">${lineHTML(priv.info[priv.info.length - 1])}</p>` : ''}</section>`;
    else if (si >= 0 && si < steps.length) action = `<p class="sleep">You’re asleep</p>`;
    return `<main>${order}<div class="stage">${stage}</div>${action}${learned(true)}</main>`;
  }

  function learned(highlightLast) {
    const priv = C.priv, info = priv.info || [];
    const first = `<div class="line">You started as the ${chip(priv.card)}.</div>`;
    return `<section class="learned" aria-label="What you know"><h3>What you know</h3>${first}${info.map(l => `<div class="line">${lineHTML(l)}</div>`).join('')}</section>`;
  }

  const ACT_WORDS = {
    doppelganger: ['Copy this card', null], seer: ['Look', 'Don’t look'], robber: ['Swap and look', 'Don’t rob'],
    troublemaker: ['Swap them', 'Don’t swap'], drunk: ['Swap with it', null], werewolf: ['Peek', 'Don’t peek'],
  };
  function actionPanel(s, si) {
    const pub = C.pub, me = myId();
    const key = `${pub.round}|${si}|${s.as}|${s.kind}`;
    if (C.ui.selKey !== key) { C.ui.selKey = key; C.ui.sel = []; C.ui.seerTab = 'player'; }
    const sent = C.ui.sentKey === key;
    const [go, skip] = ACT_WORDS[s.as] || ['Confirm', 'Skip'];
    const others = (pub.seats || []).filter(id => id !== me);
    const mode = s.kind === 'seer' ? C.ui.seerTab : s.kind;
    const need = s.kind === 'seer' ? (mode === 'player' ? 1 : 2) : s.n;
    const playersPick = () => `<div class="pick">${others.map(id => { const p = pl(id); return `<button data-act="selp" data-arg="${id}" aria-pressed="${C.ui.sel.includes(id)}" style="--pc:${pcol(p)}"><i></i><span>${esc(p.name)}</span></button>`; }).join('')}</div>`;
    const centerPick = () => `<div class="centers">${[0, 1, 2].map(i => `<button data-act="selc" data-arg="${i}" aria-pressed="${C.ui.sel.includes(i)}" aria-label="${centerName(i)}">${miniBack()}<span>${esc(H.CENTER_NAMES[i])}</span></button>`).join('')}</div>`;
    const title = s.as === 'werewolf' ? 'Werewolf' : roleName(s.as);
    return `<section class="panel act" aria-live="polite"><p class="prompt">${chip(s.as)} ${esc(s.prompt)}</p>
      ${s.kind === 'seer' ? `<div class="seg"><button data-act="seertab" data-arg="player" aria-pressed="${mode === 'player'}">One player</button><button data-act="seertab" data-arg="center" aria-pressed="${mode === 'center'}">Two center cards</button></div>` : ''}
      ${mode === 'player' ? playersPick() : centerPick()}
      <div class="row"><button class="btn primary" data-act="confirm" data-arg="${si}" ${C.ui.sel.length === need && !sent ? '' : 'disabled'}>${sent ? 'Sending…' : esc(go)}</button>
      ${s.optional && skip ? `<button class="btn" data-act="skipact" data-arg="${si}" ${sent ? 'disabled' : ''}>${esc(skip)}</button>` : ''}</div>
      ${!s.optional ? `<p class="small muted">If time runs out, the ${esc(title)} picks at random.</p>` : ''}</section>`;
  }

  function dayScreen() {
    const pub = C.pub, priv = C.priv, seats = pub.seats || [];
    const readyN = pub.players.filter(p => seats.includes(p.id) && p.vr).length;
    const inR = seats.includes(myId());
    return `<main><div class="clock">${timer(pub.day.ends, 'big')}<p class="muted">Talk. Claim a role, ask questions, catch a liar.</p></div>
      ${inR ? learned(false) : ''}
      <section class="panel"><h3>Cards in this game</h3>${deckChips(pub.deck)}<p class="small muted">Three of these are in the center, not with a player.</p>
        <h3>Wake order</h3><div class="chips">${pub.deck && H.NIGHT.filter(s => pub.deck[s.role]).map(s => chip(s.role)).join('')}</div></section>
      ${playersList({ seated: true, mark: p => (p.vr ? 'ready to vote' : '') })}</main>
      <div class="foot"><p class="note">${readyN} of ${seats.length} ready to vote. Voting starts when everyone is, or when time runs out.</p>
      ${inR ? `<button class="btn ${priv.vr ? '' : 'primary'}" data-act="vready">${priv.vr ? 'Not ready yet' : 'I’m ready to vote'}</button>` : ''}
      ${isHost() ? '<div class="row"><button class="btn small" data-act="addmin">+1 minute</button><button class="btn small" data-act="hvote">Vote now</button></div>' : ''}</div>`;
  }

  function voteScreen() {
    const pub = C.pub, priv = C.priv, me = myId(), seats = pub.seats || [];
    const votedN = pub.players.filter(p => seats.includes(p.id) && p.vt).length;
    const inR = seats.includes(me);
    let body;
    if (!inR) body = '<p class="muted">You’re watching this round.</p>';
    else if (priv.locked) body = `<section class="panel"><p class="prompt">You voted for ${who(priv.vote)}.</p><p class="muted small">Votes are shown when everyone has voted.</p></section>`;
    else body = `<section class="panel act"><p class="prompt">Who is a Werewolf?</p><div class="pick">${seats.filter(id => id !== me).map(id => { const p = pl(id); return `<button data-act="vsel" data-arg="${id}" aria-pressed="${C.ui.voteSel === id}" style="--pc:${pcol(p)}"><i></i><span>${esc(p.name)}</span></button>`; }).join('')}</div></section>`;
    return `<main><div class="clock">${timer(pub.vote.ends, 'big')}<h2>Vote</h2><p class="muted">The player with the most votes dies. It takes at least 2 votes.</p></div>${body}
      ${playersList({ seated: true, mark: p => (p.vt ? 'voted' : '') })}</main>
      <div class="foot"><p class="note">${votedN} of ${seats.length} voted.</p>
      ${inR && !priv.locked ? `<button class="btn primary" data-act="vote" ${C.ui.voteSel ? '' : 'disabled'}>${C.ui.voteSel ? 'Vote for ' + esc(pl(C.ui.voteSel).name) : 'Pick a player'}</button>` : ''}
      ${isHost() ? '<button class="btn small ghost" data-act="hreveal">Show the result now</button>' : ''}</div>`;
  }

  function revealScreen() {
    const pub = C.pub, R = pub.reveal, res = R.res, me = myId();
    const fr = res.finalRoles, dop = R.dop;
    const inR = R.seats.includes(me);
    const youLine = inR ? `<p class="you ${res.winners.includes(me) ? 'win' : 'lose'}">${res.winners.includes(me) ? 'You won' : 'You lost'} as the ${esc(roleName(finalLabel(R.cur[me], dop)))}</p>` : '';
    const dead = res.dead.length ? `<div class="dead">${res.dead.map(id => `<figure>${mini(fr[id], roleName(finalLabel(R.cur[id], dop)))}<figcaption>${who(id)}</figcaption></figure>`).join('')}</div>` : '<p class="muted">Nobody died.</p>';
    const shots = res.hunterShots.map(s => `<p class="line">${who(s.hunter)} was the ${chip('hunter')} and took ${who(s.target)} down too.</p>`).join('');
    const tally = R.seats.filter(id => res.counts[id] > 0).sort((a, b) => res.counts[b] - res.counts[a]);
    const voters = t => R.seats.filter(v => R.votes[v] === t);
    const noVote = R.seats.filter(v => !R.votes[v]);
    const votes = tally.length ? tally.map(t => `<div class="tr ${res.dead.includes(t) ? 'died' : ''}"><span>${who(t)}</span><span class="small">${voters(t).map(v => who(v, false)).join(', ')}</span><b>${res.counts[t]}</b></div>`).join('') : '<p class="muted">No votes were cast.</p>';
    const rows = R.seats.map(id => `<div class="tr ${res.dead.includes(id) ? 'died' : ''}"><span>${who(id)}</span><span class="cards">${chip(R.orig[id])}${R.cur[id] !== R.orig[id] ? `<span class="arrow" aria-label="became">→</span>${chip(finalLabel(R.cur[id], dop))}` : ''}</span><span class="w ${res.winners.includes(id) ? 'y' : 'n'}">${res.winners.includes(id) ? 'won' : 'lost'}</span></div>`).join('');
    const center = [0, 1, 2].map(i => `<div class="tr"><span>${esc(H.CENTER_NAMES[i])}</span><span class="cards">${chip(R.center0[i])}${R.center[i] !== R.center0[i] ? `<span class="arrow" aria-label="became">→</span>${chip(R.center[i])}` : ''}</span><span></span></div>`).join('');
    return `<main class="end"><div class="stage"><h1 class="verdict">${esc(res.headline)}</h1><p class="why">${esc(res.why)}</p>${youLine}</div>
      <section class="panel"><h3>Who died</h3>${dead}${shots}</section>
      <section class="panel"><h3>Votes</h3><div class="table">${votes}</div>${noVote.length ? `<p class="small muted">Didn’t vote: ${noVote.map(v => who(v, false)).join(', ')}</p>` : ''}</section>
      <section class="panel"><h3>Everyone’s cards</h3><p class="small muted">Started with, and ended with if it changed.</p><div class="table">${rows}</div></section>
      <section class="panel"><h3>Center cards</h3><div class="table">${center}</div></section>
      <section class="panel"><h3>What happened in the night</h3><ol class="story">${R.log.map(l => `<li>${lineHTML(l, true)}</li>`).join('') || '<li>A quiet night.</li>'}</ol></section></main>
      <div class="foot">${isHost() ? '<button class="btn primary" data-act="again">Back to the lobby</button>' : '<p class="note">The host starts the next round.</p>'}</div>`;
  }

  function sheetHTML() {
    if (!C.sheet) return '';
    const host = isHost();
    const pub = C.pub;
    const order = pub && pub.deck ? `<h3>Wake order in this game</h3><ol class="order" style="justify-content:flex-start">${H.NIGHT.filter(s => pub.deck[s.role]).map(s => `<li class="now" style="transform:none;box-shadow:none;border-color:transparent" title="${esc(H.ROLES[s.role].name)}">${A.emblem(s.role, { size: 26 })}</li>`).join('')}</ol><div class="chips">${H.NIGHT.filter(s => pub.deck[s.role]).map(s => chip(s.role)).join('')}</div>` : '';
    return `<div class="sheet" data-act="closesheet"><div class="box" data-act="noop" role="dialog" aria-label="Menu">
      <h2>Howl</h2>${rulesList()}${order}
      ${host ? '<button class="btn danger" data-act="closeroom">Close the room for everyone</button>' : '<button class="btn danger" data-act="leave">Leave the room</button>'}
      <button class="btn" data-act="closesheet">Back to the game</button></div></div>`;
  }

  function updateTimers() {
    const t = now() + (C.mode === 'host' ? 0 : C.skew);
    document.querySelectorAll('[data-ends]').forEach(el => {
      const left = Math.max(0, +el.dataset.ends - t);
      if (el.dataset.fmt === 'bar') { const dur = +el.dataset.dur || 1; el.style.transform = `scaleX(${Math.min(1, left / dur).toFixed(3)})`; return; }
      const s = Math.ceil(left / 1000);
      el.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
      el.classList.toggle('low', s <= 30);
    });
  }
  setInterval(updateTimers, 250);

  /* ================= EVENTS ================= */
  function toast(msg) { C.toast = msg; render(); clearTimeout(C.toastT); C.toastT = setTimeout(() => { C.toast = ''; render(); }, 2200); }
  async function share() {
    const code = C.code, url = roomUrl(code), text = `Join my Howl game! Room ${code}`;
    try { if (navigator.share) { await navigator.share({ title: 'Howl', text, url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text + ': ' + url); toast('Invite link copied.'); } catch (e) { toast('Room code: ' + code); }
  }
  const acts = {
    host: () => hostCreate(),
    join: () => joinRoom(C.joinCode),
    resumeHost: () => { const h = store.get('host', null); if (h) hostResume(h); },
    resumeJoin: () => { const s = store.get('session', null); if (s) { C.joinCode = s.code; joinRoom(s.code, true); } },
    share: () => share(),
    narr: () => { C.narr = !C.narr; store.set(isHost() ? 'narrHost' : 'narr', C.narr); if (C.narr) speak('Narrator on.'); render(); },
    menu: () => { C.sheet = 'menu'; render(); },
    closesheet: (el, e) => { if (e.target.closest('[data-act]') !== el) return; C.sheet = null; render(); },
    noop: () => {},
    leave: () => { send('leave'); setTimeout(() => endSession(''), 250); },
    closeroom: () => { if (confirm('Close the room? Everyone will be sent back to the start.')) closeRoom(); },
    kick: el => { const p = pl(el.dataset.arg); if (confirm(`Remove ${p.name} from the room?`)) hostCmd.kick(el.dataset.arg); },
    deck: el => hostCmd.deck(el.dataset.arg, +el.dataset.d),
    suggest: () => hostCmd.suggest(),
    setting: el => hostCmd.setting(el.dataset.arg, el.dataset.v),
    start: () => hostCmd.start(),
    flip: () => { C.ui.flipped = C.ui.flipped === String(C.pub.round) ? '' : String(C.pub.round); render(); },
    ready: () => want('ready', {}, p => !p || p.phase !== 'roles' || !!p.ready),
    hnight: () => hostCmd.night(),
    selp: el => {
      const s = C.priv.pending, id = el.dataset.arg, sel = C.ui.sel.filter(x => typeof x === 'string');
      const max = s.kind === 'seer' ? 1 : s.n;
      C.ui.sel = sel.includes(id) ? sel.filter(x => x !== id) : (max === 1 ? [id] : [...sel, id].slice(-max));
      render();
    },
    selc: el => {
      const s = C.priv.pending, i = +el.dataset.arg, sel = C.ui.sel.filter(x => typeof x === 'number');
      const max = s.kind === 'seer' ? 2 : s.n;
      C.ui.sel = sel.includes(i) ? sel.filter(x => x !== i) : (max === 1 ? [i] : [...sel, i].slice(-max));
      render();
    },
    seertab: el => { C.ui.seerTab = el.dataset.arg; C.ui.sel = []; render(); },
    confirm: el => {
      const si = +el.dataset.arg, s = C.priv.pending; if (!s) return;
      const a = C.ui.sel.length && typeof C.ui.sel[0] === 'number' ? { center: C.ui.sel.slice() } : { players: C.ui.sel.slice() };
      C.ui.sentKey = C.ui.selKey;
      want('act', { si, a }, p => !p || p.si !== si || !p.pending || p.pending.as !== s.as || p.pending.kind !== s.kind);
      render();
    },
    skipact: el => {
      const si = +el.dataset.arg, s = C.priv.pending; if (!s) return;
      C.ui.sentKey = C.ui.selKey;
      want('act', { si, a: { skip: true } }, p => !p || p.si !== si || !p.pending || p.pending.as !== s.as);
      render();
    },
    vready: () => { const on = !C.priv.vr; want('vready', { on }, p => !p || p.phase !== 'day' || !!p.vr === on); },
    addmin: () => hostCmd.addMin(),
    hvote: () => hostCmd.vote(),
    vsel: el => { C.ui.voteSel = el.dataset.arg; render(); },
    vote: () => { const target = C.ui.voteSel; if (!target) return; want('vote', { target }, p => !p || p.phase !== 'vote' || !!p.locked); },
    hreveal: () => hostCmd.reveal(),
    again: () => hostCmd.again(),
  };
  document.addEventListener('click', e => {
    unlockAudio();
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = acts[el.dataset.act];
    if (fn) fn(el, e);
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'nm') { C.name = e.target.value; store.set('name', cleanName(C.name)); }
    if (e.target.id === 'cd') {
      const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
      if (v !== e.target.value) e.target.value = v;
      C.joinCode = v;
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.target.id === 'cd' || e.target.id === 'nm') && C.mode === 'home' && !C.busy) { e.preventDefault(); joinRoom(C.joinCode); }
    if (e.key === 'Escape' && C.sheet) { C.sheet = null; render(); }
  });

  /* ================= START ================= */
  (function boot() {
    const h = store.get('host', null), s = store.get('session', null);
    const fresh = x => x && now() - (x.created || x.at || 0) < 12 * 3600e3;
    const urlCode = C.joinCode;
    if (fresh(h) && (!urlCode || urlCode === h.code)) { hostResume(h); return; }
    if (fresh(s) && (!urlCode || urlCode === s.code) && cleanName(C.name)) { joinRoom(s.code, true); return; }
    render();
  })();
  self.__howl = { C, get HS() { return HS; } }; // for testing
})();
