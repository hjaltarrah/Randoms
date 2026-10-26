/* Kizuna Clash — guided tutorial tug with Kingyo the festival goldfish as the coach.
   Decks keep their order and Mizuha's first two turns are scripted, so every lesson plays out exactly as described. */
const TUT = (() => {
  const $ = id => document.getElementById(id);
  let active = false, coaching = false, idx = 0, shown = false, lastTurn = -1, tapNow = false;
  const card = id => `#hand .mini[data-id="${id}"]`;
  const tok = uid => `.tok[data-uid="${uid}"]`;
  // uids in this scripted duel: 1 Kasha, 2 Kamaitachi, 3 Kodama, 4 Aka Oni, 5 Tengu, 6 Kappa
  const STEPS = [
    { on: 'now', hl: '#meter', pos: 'bottom', text: 'Welcome to the festival tug-of-war! Both teams pull one rope. Pull the knot 12 steps to your side, the blue flag, to win.' },
    { on: 'now', wait: { act: 'open', id: 'kasha' }, hl: card('kasha'), pos: 'top', text: 'These are your cards. The yellow coin is the energy cost: you have 2 energy now, and more every turn. Tap Kasha.' },
    { on: 'now', wait: { act: 'play', id: 'kasha' }, hl: '#popGo', pos: 'top', text: 'Tap Summon to send her to the rope.' },
    { on: 'now', wait: { act: 'heave' }, hl: '#heaveBtn', pos: 'top', text: "Kasha grabbed the rope! Now tap HEAVE! Every yokai pulls with its power, the red fist. Mizuha has nobody to grip back yet." },
    { on: 'resolved', hl: '#meter', pos: 'bottom', text: 'Mizuha summoned two yokai and heaved back with 4. But Kasha gripped the rope: every yokai grips 1 on the rival\'s turn, so the knot only moved 3.' },
    { on: 'turn', hl: '#ribbon', pos: 'bottom', text: 'Every round brings a festival event. Round 2 is Fireworks Night: Fire yokai get +2 power! The ribbon also shows the next events.' },
    { on: 'now', wait: { act: 'attacker', id: 'kasha' }, hl: tok(1), pos: 'top', text: 'Kasha, your orange cat, has held the rope for a turn, so she is Ready to attack. Tap her on the rope.' },
    { on: 'now', wait: { act: 'attack', from: 'kasha', to: 'kamaitachi' }, hl: tok(2), pos: 'bottom', text: 'Fire beats Wind, so her attack does +1 damage. Now tap Kamaitachi, the white weasel!' },
    { on: 'now', hl: '#teamMe', pos: 'bottom', text: 'Knocked off the rope! But Kasha attacked, so she won\'t pull this turn. Attacking costs a puller now and removes a rival puller for good.' },
    { on: 'now', wait: { act: 'open', id: 'akaoni' }, hl: card('akaoni'), pos: 'top', text: 'Tap Aka Oni.' },
    { on: 'now', wait: { act: 'play', id: 'akaoni' }, hl: '#popGo', pos: 'top', text: 'Summon him. New yokai pull right away, but they wait a turn before they can attack.' },
    { on: 'now', wait: { act: 'heave' }, hl: '#heaveBtn', pos: 'top', text: 'HEAVE! The button always shows your pull minus their grip.' },
    { on: 'resolved', hl: '#teamFoe', pos: 'bottom', text: "Mizuha's Tengu used Ambush: 2 damage to your strongest yokai when it joined. Kodama Grows +1 power every turn. Tap any yokai to see what it does." },
    { on: 'turn', wait: { act: 'open', id: 'kappa' }, hl: card('kappa'), pos: 'top', text: 'Kappa is an Anchor: on Mizuha\'s turn it grips with 3 instead of 1. Tap Kappa.' },
    { on: 'now', wait: { act: 'play', id: 'kappa' }, hl: '#popGo', pos: 'top', text: 'Summon it.' },
    { on: 'now', wait: { act: 'open', id: 'drum' }, hl: card('drum'), pos: 'top', text: 'Charms are one-time tricks. Taiko Drum adds 4 to this heave. Tap it.' },
    { on: 'now', wait: { act: 'play', id: 'drum' }, hl: '#popGo', pos: 'top', text: 'Use it!' },
    { on: 'now', wait: { act: 'heave' }, last: true, hl: '#heaveBtn', pos: 'top', text: 'Round 3 is the Taiko Parade, +3 on every heave. This pull wins the tug! Tap HEAVE, then tap the screen as fast as you can: fast tapping adds up to +5 pull.' }
  ];

  function setup() {
    const sum = card => ({ a: { t: 'play', card } });
    return {
      you: ['kasha', 'akaoni', 'kappa', 'drum', 'hinotama', 'kitsunebi', 'taiko', 'hoo', 'karyu', 'firecracker', 'wanyudo', 'onigiri'],
      rival: ['kamaitachi', 'kodama', 'tengu', 'tanuki', 'karakasa', 'usagi', 'tsuru', 'raiju', 'chime', 'headband', 'kyubi', 'sparkler'],
      events: ['opening', 'fireworks', 'taiko', 'kites', 'mochi', 'sumo', 'moon', 'finale'],
      script: { 1: [sum('kamaitachi'), sum('kodama')], 2: [sum('tengu')] }
    };
  }

  function clearHl() { document.querySelectorAll('.hl').forEach(e => e.classList.remove('hl')); }
  function render() {
    clearHl();
    const box = $('coach');
    if (!coaching || !shown) { box.hidden = true; return; }
    const s = STEPS[idx];
    if (s.hl) document.querySelectorAll(s.hl).forEach(e => e.classList.add('hl'));
    box.className = 'coach' + (s.pos === 'top' ? ' top' : '');
    box.innerHTML = `<div class="sensei">${UI.artSVG('kingyo')}</div><div><p>${s.text}</p>
      <div class="crow"><span class="step">Kingyo's lesson ${idx + 1} of ${STEPS.length}</span>${s.wait ? '' : `<button class="btn small red" type="button" id="coachNext">Next</button>`}</div></div>`;
    box.hidden = false;
    const nb = $('coachNext'); if (nb) nb.onclick = next;
  }
  function advance() {
    if (STEPS[idx].last) { coaching = false; shown = false; return; }
    idx++; shown = STEPS[idx].on === 'now';
  }
  function next() { idx++; shown = STEPS[idx].on !== 'resolved'; render(); }
  function nudge() { const b = $('coach'); if (b.hidden) return; b.classList.remove('nudge'); void b.offsetWidth; b.classList.add('nudge'); if (window.AU) AU.play('nope'); }
  function matches(w, act, d) {
    if (!w || w.act !== act) return false;
    for (const key of ['id', 'from', 'to', 'target']) if (w[key] != null && d[key] !== w[key]) return false;
    return true;
  }

  return {
    get active() { return active; },
    /* only the final heave of the lesson shows the tapping game */
    wantsTap() { const t = tapNow; tapNow = false; return t; },
    setup,
    start() { active = true; coaching = true; idx = 0; shown = true; lastTurn = -1; render(); },
    stop() { active = false; coaching = false; shown = false; render(); },
    /* checked before each player action; during a lesson only the action being taught goes through */
    allow(act, d = {}) {
      if (!active || !coaching) return true;
      const s = STEPS[idx];
      if (act === 'open' && !s.wait && !shown) return true;
      if (act === 'open' && s.wait && s.wait.act === 'play' && s.wait.id === d.id) return true; // re-opening the card being taught
      if (shown && matches(s.wait, act, d)) { if (act === 'heave') { tapNow = !!s.last; advance(); setTimeout(render, 0); } return true; }
      nudge(); return false;
    },
    after(act, d) {
      if (!active || !coaching) return;
      const s = STEPS[idx];
      if (shown && s.wait && s.wait.act === act && (!d || matches(s.wait, act, d))) advance();
      render();
    },
    /* the player closed a card without playing it: go back to the "tap the card" lesson */
    popClosed() {
      if (!active || !coaching) return;
      const s = STEPS[idx], p = STEPS[idx - 1];
      if (s && s.wait && s.wait.act === 'play' && p && p.wait && p.wait.act === 'open' && p.wait.id === s.wait.id) { idx--; shown = true; }
      render();
    },
    turnStart(m) {
      if (!active || !coaching || m.turnNo === lastTurn) return;
      lastTurn = m.turnNo;
      if (STEPS[idx].on === 'turn') { shown = true; render(); }
    },
    resolved() { if (active && coaching && STEPS[idx].on === 'resolved') { shown = true; render(); } },
    refresh() { if (active) render(); }
  };
})();
