/* Kizuna Clash — festival music and sound effects, synthesized live with Web Audio (no sound files).
   Music: matsuri-bayashi style — taiko, shime-daiko, kane bell, fue flute and shamisen on the yo scale.
   Sound setting cycles: 0 = music + sounds, 1 = sounds only, 2 = silent. */
const AU = (() => {
  let ctx = null, master, musicBus, sfxBus, echo, noise, state = 0, track = null, want = null, timer = null, step = 0, nextT = 0, loops = 0;
  try { const v = +localStorage.getItem('kz2:sound'); if (v === 1 || v === 2) state = v; } catch (e) { /* storage unavailable */ }
  const save = () => { try { localStorage.setItem('kz2:sound', String(state)); } catch (e) { /* storage unavailable */ } };
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  const N = { D4: 62, E4: 64, G4: 67, A4: 69, B4: 71, D5: 74, E5: 76, G5: 79, A5: 81, B5: 83, D6: 86, E6: 88, G6: 91, A6: 93, D2: 38, G2: 43, A2: 45, D3: 50, G3: 55, A3: 57 };

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume().catch(() => {}); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try { ctx = new AC(); } catch (e) { ctx = null; return null; }
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 5; comp.connect(ctx.destination);
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(comp);
    musicBus = ctx.createGain(); musicBus.connect(master);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    // a soft echo so the flute sounds like an open festival square
    echo = ctx.createDelay(1); echo.delayTime.value = 0.23;
    const fb = ctx.createGain(); fb.gain.value = 0.28; const wet = ctx.createGain(); wet.gain.value = 0.22;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    echo.connect(lp); lp.connect(fb); fb.connect(echo); lp.connect(wet); wet.connect(musicBus);
    noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    applyState();
    return ctx;
  }
  function applyState() {
    if (!ctx) return;
    const t = ctx.currentTime;
    musicBus.gain.setTargetAtTime(state === 0 ? 0.34 : 0, t, 0.08);
    sfxBus.gain.setTargetAtTime(state < 2 ? 0.85 : 0, t, 0.05);
  }

  /* ---------- building blocks ---------- */
  function env(g, t, a, peak, dec) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec);
  }
  function tone(out, type, f0, t, dur, peak, f1, a = 0.005) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t);
    if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, a, peak, dur); o.connect(g); g.connect(out); o.start(t); o.stop(t + a + dur + 0.05);
    return o;
  }
  function hiss(out, t, dur, peak, type, f, q = 1, f1) {
    const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noise; s.loop = true; fl.type = type; fl.frequency.setValueAtTime(f, t); fl.Q.value = q;
    if (f1) fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
    env(g, t, 0.004, peak, dur); s.connect(fl); fl.connect(g); g.connect(out);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
  }
  /* instruments */
  const taiko = (out, t, v = 1) => { tone(out, 'sine', 120, t, 0.45, 0.9 * v, 46); tone(out, 'triangle', 90, t, 0.12, 0.25 * v, 60); hiss(out, t, 0.06, 0.25 * v, 'lowpass', 500); };
  const ka = (out, t, v = 1) => { hiss(out, t, 0.035, 0.35 * v, 'highpass', 2600); tone(out, 'triangle', 1250, t, 0.03, 0.12 * v); };
  const shime = (out, t, v = 1) => { tone(out, 'sine', 360, t, 0.09, 0.32 * v, 240); hiss(out, t, 0.04, 0.12 * v, 'bandpass', 1800, 2); };
  function kane(out, t, v = 1, base = 1180) {
    for (const [r, g] of [[1, 0.1], [2.76, 0.06], [5.4, 0.035], [8.93, 0.02]]) tone(out, 'sine', base * r, t, 0.22, g * v);
    hiss(out, t, 0.03, 0.08 * v, 'highpass', 6000);
  }
  function fue(out, t, f, dur, v = 1) {
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2;
    lfo.frequency.value = 5.6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.012, t + Math.min(0.25, dur * 0.6));
    lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    const g2 = ctx.createGain(); g2.gain.value = 0.18;
    o.connect(g); o2.connect(g2); g2.connect(g);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22 * v, t + 0.035);
    g.gain.setValueAtTime(0.2 * v, t + Math.max(0.04, dur - 0.06)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);
    g.connect(out); if (out === musicBus) g.connect(echo);
    for (const x of [o, o2, lfo]) { x.start(t); x.stop(t + dur + 0.12); }
    hiss(out, t, Math.min(0.08, dur), 0.04 * v, 'bandpass', f * 2, 3);
  }
  function pluck(out, t, f, v = 1, len = 0.38) {
    const o = ctx.createOscillator(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = f; fl.type = 'lowpass'; fl.Q.value = 4;
    fl.frequency.setValueAtTime(f * 6, t); fl.frequency.exponentialRampToValueAtTime(f * 1.3, t + len);
    env(g, t, 0.003, 0.22 * v, len); o.connect(fl); fl.connect(g); g.connect(out); o.start(t); o.stop(t + len + 0.05);
    hiss(out, t, 0.015, 0.1 * v, 'highpass', 3000);
  }

  /* ---------- music ---------- */
  const MEL = 'D5:2 D5:2 B4:2 A4:2 B4:4 D5:4|E5:2 D5:2 B4:2 A4:2 G4:8|A4:2 B4:2 D5:2 E5:2 G5:4 E5:4|D5:2 E5:2 D5:2 B4:2 A4:8|' +
    'G5:2 G5:2 E5:2 D5:2 E5:4 G5:4|A5:4 G5:2 E5:2 D5:8|B4:2 D5:2 E5:2 D5:2 B4:2 A4:2 G4:4|A4:2 B4:2 A4:2 G4:2 E4:4 D4:4';
  const MELODY = (() => { const a = []; let s = 0; for (const tok of MEL.replace(/\|/g, ' ').split(' ')) { const [n, d] = tok.split(':'); a[s] = [hz(N[n]), +d]; s += +d; } return a; })();
  const ROOTS = ['D2', 'G2', 'D2', 'A2', 'G2', 'D2', 'G2', 'D2'];
  const TRACKS = {
    menu: { bpm: 96, swing: 0.1 },
    duel: { bpm: 122, swing: 0.12 },
    finale: { bpm: 138, swing: 0.08 }
  };
  function playStep(name, s, t, sp) {
    const T = TRACKS[name], bar = Math.floor(s / 16), b = s % 16, out = musicBus;
    const m = MELODY[s];
    if (name === 'menu') {
      if (b === 0 || b === 8) taiko(out, t, 0.55);
      if (b === 4 || b === 12) kane(out, t, 0.6);
      if (b === 0) pluck(out, t, hz(N[ROOTS[bar]]) * 2, 0.6, 0.6);
      if (m && loops % 2 === 0) fue(out, t, m[0], m[1] * sp * 0.95, 0.75);
      if (m && loops % 2 === 1 && m[1] >= 4) pluck(out, t, m[0], 0.55, 0.5);
      return;
    }
    const hot = name === 'finale';
    // taiko: don . . . . . don . don . . don don . . .
    if ([0, 6, 8, 12].includes(b)) taiko(out, t, b === 0 ? 1 : 0.75);
    if (b === 11 || (hot && b === 14)) taiko(out, t, 0.45);
    if (b === 4 || b === 14) ka(out, t, 0.8);
    if (b % 2 === 0) shime(out, t, b % 4 === 0 ? 0.7 : 0.4);
    if (hot && b % 2 === 1) shime(out, t, 0.25);
    if ([0, 3, 4, 8, 11, 12].includes(b)) kane(out, t, b % 4 === 0 ? 0.7 : 0.45);
    if (b === 0 || b === 8) pluck(out, t, hz(N[ROOTS[bar]]) * (b === 8 ? 1.5 : 1), 0.7, 0.3);
    if (m) { fue(out, t, m[0], m[1] * sp * 0.92, 1); if (loops % 2 === 1 || hot) pluck(out, t, m[0] / 2, 0.45, 0.25); }
  }
  function tick() {
    if (!ctx || !track || ctx.state !== 'running') return;
    const T = TRACKS[track], sp = 60 / T.bpm / 4;
    if (nextT < ctx.currentTime - 0.2) nextT = ctx.currentTime + 0.05;
    while (nextT < ctx.currentTime + 0.18) {
      const sw = step % 2 === 1 ? sp * T.swing : 0;
      try { playStep(track, step, nextT + sw, sp); } catch (e) { /* keep going */ }
      nextT += sp; step++;
      if (step >= 128) { step = 0; loops++; }
    }
  }
  function music(name) {
    want = name;
    if (!ctx) return;
    if (track === name) return;
    const from = track; track = name;
    if (!name) return;
    if (from === 'duel' && name === 'finale') { /* keep the beat, just speed up */ }
    else { step = 0; loops = 0; nextT = ctx.currentTime + 0.12; }
    if (!timer) timer = setInterval(tick, 30);
  }

  /* ---------- sound effects ---------- */
  const SFX = {
    tap: t => { tone(sfxBus, 'sine', 900, t, 0.05, 0.25, 620); hiss(sfxBus, t, 0.02, 0.12, 'highpass', 3000); },
    open: t => { hiss(sfxBus, t, 0.13, 0.16, 'bandpass', 500, 1.5, 2600); pluck(sfxBus, t + 0.03, hz(N.A5), 0.5, 0.2); },
    close: t => { hiss(sfxBus, t, 0.1, 0.1, 'bandpass', 2000, 1.5, 600); },
    nope: t => { tone(sfxBus, 'square', 150, t, 0.07, 0.08); tone(sfxBus, 'square', 130, t + 0.1, 0.09, 0.08); },
    summon: t => { tone(sfxBus, 'sine', 260, t, 0.1, 0.35, 900); hiss(sfxBus, t, 0.18, 0.12, 'lowpass', 900); [N.D5, N.G5, N.A5].forEach((n, i) => pluck(sfxBus, t + 0.06 + i * 0.06, hz(n), 0.6, 0.3)); },
    charm: t => { [N.B5, N.D6, N.E6, N.A6].forEach((n, i) => kane(sfxBus, t + i * 0.055, 0.7, hz(n))); },
    whoosh: t => { hiss(sfxBus, t, 0.2, 0.22, 'bandpass', 2800, 1.2, 500); },
    hit: t => { tone(sfxBus, 'sine', 170, t, 0.16, 0.7, 55); hiss(sfxBus, t, 0.08, 0.35, 'lowpass', 1500); },
    super: t => { SFX.hit(t); kane(sfxBus, t + 0.02, 1, 1760); tone(sfxBus, 'square', 1320, t + 0.03, 0.08, 0.05); },
    ko: t => {
      const o = tone(sfxBus, 'sine', 1500, t, 0.45, 0.22, 280);
      const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 14; lg.gain.value = 40; l.connect(lg); lg.connect(o.frequency); l.start(t); l.stop(t + 0.5);
      tone(sfxBus, 'sine', 600, t + 0.45, 0.08, 0.3, 1200); hiss(sfxBus, t + 0.45, 0.06, 0.2, 'highpass', 1500);
    },
    heave: t => { taiko(sfxBus, t, 1); taiko(sfxBus, t + 0.17, 1.1); hiss(sfxBus, t + 0.17, 0.35, 0.08, 'lowpass', 300, 1, 120); },
    gain: t => { [N.D5, N.E5, N.G5, N.A5, N.D6].forEach((n, i) => pluck(sfxBus, t + i * 0.05, hz(n), 0.65, 0.25)); kane(sfxBus, t + 0.25, 0.6); },
    loss: t => { [N.A4, N.G4, N.E4, N.D4].forEach((n, i) => pluck(sfxBus, t + i * 0.07, hz(n), 0.55, 0.3)); },
    ward: t => { kane(sfxBus, t, 1.2, 620); kane(sfxBus, t + 0.04, 0.8, 930); hiss(sfxBus, t, 0.25, 0.12, 'highpass', 4000); },
    heal: t => { tone(sfxBus, 'sine', hz(N.D6), t, 0.2, 0.15, hz(N.A6)); tone(sfxBus, 'sine', hz(N.A6), t + 0.08, 0.25, 0.1); },
    up: t => { [N.G5, N.A5, N.D6].forEach((n, i) => tone(sfxBus, 'triangle', hz(n), t + i * 0.05, 0.08, 0.14)); },
    down: t => { tone(sfxBus, 'sawtooth', 300, t, 0.25, 0.08, 120); },
    myturn: t => { kane(sfxBus, t, 1, 1320); fue(sfxBus, t + 0.05, hz(N.A5), 0.18, 0.8); fue(sfxBus, t + 0.22, hz(N.D6), 0.3, 0.8); },
    foeturn: t => { taiko(sfxBus, t, 0.7); ka(sfxBus, t + 0.12, 0.7); },
    event: t => { [N.D5, N.E5, N.G5, N.A5].forEach((n, i) => fue(sfxBus, t + i * 0.11, hz(n), 0.12, 0.9)); fue(sfxBus, t + 0.44, hz(N.D6), 0.4, 0.9); kane(sfxBus, t + 0.44, 0.9); taiko(sfxBus, t + 0.44, 0.9); },
    tickTock: t => { tone(sfxBus, 'sine', 1500, t, 0.03, 0.14, 1100); },
    win: t => {
      const seq = [[N.D5, 0.12], [N.E5, 0.12], [N.G5, 0.12], [N.A5, 0.24], [N.G5, 0.12], [N.A5, 0.12], [N.D6, 0.6]];
      let x = 0; for (const [n, d] of seq) { fue(sfxBus, t + x, hz(n), d, 1); x += d; }
      for (let i = 0; i < 6; i++) taiko(sfxBus, t + i * 0.12, 0.8); kane(sfxBus, t + x - 0.6, 1.2);
      [0.9, 1.25, 1.5, 1.9, 2.2].forEach((d, i) => { hiss(sfxBus, t + d, 0.5, 0.18, 'highpass', 1800 + i * 300); tone(sfxBus, 'sine', 140, t + d, 0.2, 0.3, 60); });
    },
    lose: t => { [[N.A4, 0.3], [N.G4, 0.3], [N.E4, 0.3], [N.D4, 0.8]].reduce((x, [n, d]) => { fue(sfxBus, t + x, hz(n), d, 0.8); return x + d; }, 0); taiko(sfxBus, t + 1.2, 0.6); },
    coin: t => { kane(sfxBus, t, 0.8, 1980); kane(sfxBus, t + 0.07, 0.9, 2640); },
    shake: t => { ka(sfxBus, t, 0.6); ka(sfxBus, t + 0.09, 0.5); hiss(sfxBus, t, 0.16, 0.1, 'bandpass', 900, 2); },
    burst: t => { taiko(sfxBus, t, 1); hiss(sfxBus, t, 0.35, 0.3, 'highpass', 1200, 1, 5000); [N.G5, N.A5, N.D6].forEach((n, i) => pluck(sfxBus, t + 0.05 + i * 0.05, hz(n), 0.7, 0.3)); },
    flip: t => { hiss(sfxBus, t, 0.09, 0.16, 'bandpass', 2400, 1.5, 900); pluck(sfxBus, t + 0.02, hz(N.D5), 0.5, 0.2); },
    rare: t => { [N.D5, N.G5, N.B5, N.D6].forEach((n, i) => kane(sfxBus, t + i * 0.06, 0.8, hz(n))); },
    epic: t => { [N.D5, N.E5, N.G5, N.A5, N.D6, N.E6].forEach((n, i) => fue(sfxBus, t + i * 0.07, hz(n), 0.1, 0.9)); kane(sfxBus, t + 0.42, 1.1, 1760); },
    legend: t => { SFX.event(t); [0.6, 0.8, 1.0].forEach(d => { hiss(sfxBus, t + d, 0.4, 0.16, 'highpass', 2200); tone(sfxBus, 'sine', 150, t + d, 0.2, 0.3, 60); }); kane(sfxBus, t + 0.9, 1.3, 2200); }
  };
  const BUZZ = { hit: 18, super: [20, 30, 40], ko: [30, 40, 60], heave: [35, 50, 45], gain: 25, win: [60, 60, 60, 60, 120], ward: 40, shake: 15, burst: [40, 30, 60], legend: [60, 40, 60, 40, 120], epic: [40, 30, 50] };
  function play(name, delay = 0) {
    if (state === 2) return;
    if (!ensure() || !SFX[name] || ctx.state !== 'running') return;
    try { SFX[name](ctx.currentTime + 0.01 + delay); } catch (e) { /* ignore */ }
    if (BUZZ[name] && navigator.vibrate) { try { navigator.vibrate(BUZZ[name]); } catch (e) { /* ignore */ } }
  }

  /* ---------- setting ---------- */
  const ICONS = [
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/><path d="M17 4l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity=".0"/></svg>',
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>'
  ];
  const LABELS = ['Music and sounds on', 'Music off, sounds on', 'Sound off'];
  function button(id) { return `<button type="button" class="iconbtn sndbtn" id="${id}" aria-label="${LABELS[state]}" title="${LABELS[state]}">${ICONS[state]}</button>`; }
  function cycle() {
    state = (state + 1) % 3; save(); ensure(); applyState();
    document.querySelectorAll('.sndbtn').forEach(b => { b.innerHTML = ICONS[state]; b.setAttribute('aria-label', LABELS[state]); b.title = LABELS[state]; });
    if (state < 2) play('tap');
    return LABELS[state];
  }
  /* browsers only allow sound after the first tap */
  function unlock() { if (!ensure()) return; if (want && track !== want) music(want); }
  ['pointerdown', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, unlock, { passive: true, capture: true }));
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {}); else ctx.resume().then(() => { nextT = ctx.currentTime + 0.05; }).catch(() => {});
  });

  const pause = () => { if (ctx) ctx.suspend().catch(() => {}); };
  const resume = () => { if (ctx) ctx.resume().then(() => { nextT = ctx.currentTime + 0.05; }).catch(() => {}); };
  return { play, music, cycle, button, pause, resume, get state() { return state; } };
})();
