/* Kizuna Clash: charm card icons, set 8 (flat SVG, 100x100 box). */
window.ICON_ART = window.ICON_ART || {};
(function () {
  const r = n => Math.round(n * 10) / 10;
  const D = Math.PI / 180;
  const O = 'stroke="#2b2340" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
  const wrap = (inner, tf) => `<g ${O}${tf ? ` transform="${tf}"` : ''}>${inner}</g>`;
  const P = (x, y) => r(x) + ' ' + r(y);
  // 4-point sparkle
  const sp = (x, y, s, f = '#fff4a8') => {
    const k = s * 0.2;
    return `<path d="M${r(x)} ${r(y - s)}Q${r(x + k)} ${r(y - k)} ${r(x + s)} ${r(y)}Q${r(x + k)} ${r(y + k)} ${r(x)} ${r(y + s)}Q${r(x - k)} ${r(y + k)} ${r(x - s)} ${r(y)}Q${r(x - k)} ${r(y - k)} ${r(x)} ${r(y - s)}Z" fill="${f}" stroke-width="1.6"/>`;
  };
  // thick outlined line / path (outline underneath, colour on top)
  const tl = (x1, y1, x2, y2, w, c) =>
    `<path d="M${P(x1, y1)}L${P(x2, y2)}" fill="none" stroke-width="${w + 2.8}"/><path d="M${P(x1, y1)}L${P(x2, y2)}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  const tp = (d, w, c) => `<path d="${d}" fill="none" stroke-width="${w + 2.8}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  const arc = (cx, cy, rr, a, b) => `M${P(cx + rr * Math.cos(a * D), cy + rr * Math.sin(a * D))}A${rr} ${rr} 0 0 1 ${P(cx + rr * Math.cos(b * D), cy + rr * Math.sin(b * D))}`;
  // star burst polygon
  const burst = (x, y, R, ri, n, rot = 0) => {
    const p = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (rot - 90 + i * 180 / n) * D, rr = i % 2 ? ri : R;
      p.push(P(x + rr * Math.cos(a), y + rr * Math.sin(a)));
    }
    return 'M' + p.join('L') + 'Z';
  };
  // hanging tassel: knot at 0,0, fringe below
  const tassel = (x, y, c = '#ff4b5c', k = '#ffcf3d', s = 1, rot = 0) =>
    `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(rot)}) scale(${s})"><path d="M-4.4 4L-6 18.5Q0 21 6 18.5L4.4 4Z" fill="${c}" stroke-width="2"/><path d="M-2.6 8.5V17.8M0 8.5V18.8M2.6 8.5V17.8" fill="none" stroke-width="1.1" opacity=".45"/><path d="M-3.4 6V15" fill="none" stroke="#fff" stroke-width="1.4" opacity=".45"/><rect x="-5.4" y="2.6" width="10.8" height="4.4" rx="1.6" fill="${k}" stroke-width="1.8"/><circle cx="0" cy="0" r="3.6" fill="${k}" stroke-width="1.8"/><circle cx="-1.1" cy="-1.1" r="1.1" fill="#fff" stroke="none" opacity=".8"/></g>`;
  // three-comma tomoe crest, radius ~12 at scale 1
  const tomoe = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">` + [0, 120, 240].map(a =>
    `<path transform="rotate(${a})" d="M0 -12A6 6 0 0 1 0 0A6 6 0 0 0 -10.4 6A12 12 0 0 1 0 -12Z" fill="${c}" stroke-width="${r(1.4 / s)}"/>`).join('') + '</g>';
  // filled variable-width stroke along a polyline
  const ribbon = (pts, ws) => {
    const L = [], R = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const tx = b[0] - a[0], ty = b[1] - a[1], m = Math.hypot(tx, ty) || 1;
      const nx = -ty / m, ny = tx / m, w = ws[i] / 2;
      L.push(P(pts[i][0] + nx * w, pts[i][1] + ny * w)); R.push(P(pts[i][0] - nx * w, pts[i][1] - ny * w));
    }
    return 'M' + L.join('L') + 'L' + R.reverse().join('L') + 'Z';
  };

  /* ---------------- WASSHOI! (raised fist) ---------------- */
  const SK = '#ffd2a8', SKD = '#e89a6a';
  let fRays = '';
  for (const a of [-165, -143, -37, -15]) {
    const c = Math.cos(a * D), s = Math.sin(a * D);
    fRays += `M${P(50 + 30 * c, 34 + 30 * s)}L${P(50 + 39 * c, 34 + 39 * s)}`;
  }
  const fingers = [14, 10.6, 11, 14.6].map((y, i) =>
    `<rect x="${r(29 + i * 10.5)}" y="${y}" width="10.5" height="${r(34 - y)}" rx="5.2" fill="${SK}" stroke-width="2.4"/>`).join('');
  let wave = '';
  for (const [x, y] of [[33, 82], [43, 82], [53, 82], [63, 82], [38, 87], [48, 87], [58, 87], [68, 87]]) wave += `M${P(x - 4.6, y)}A4.6 4.6 0 0 1 ${P(x + 4.6, y)}M${P(x - 2.4, y)}A2.4 2.4 0 0 1 ${P(x + 2.4, y)}`;
  const ch_wasshoi = wrap(`
<path d="${burst(50, 34, 26, 17, 11, 6)}" fill="#fff3a8" stroke="none" opacity=".9"/>
<path d="${fRays}" fill="none" stroke-width="2.8"/>
<path d="M22 64Q17 54 20 44M78 64Q83 54 80 44M27 70Q24 66 24.6 61M73 70Q76 66 75.4 61" fill="none" stroke-width="2.4" opacity=".6"/>
<ellipse cx="50" cy="72" rx="18" ry="5" fill="#2440a8" stroke-width="8"/><ellipse cx="50" cy="72" rx="18" ry="5" fill="none" stroke="#fff" stroke-width="5.4"/>
<path d="M38.6 50L38 74Q50 77 62 74L61.4 50Z" fill="${SK}"/>
<path d="M56.6 54L57 75.4Q60 74.8 62 74L61.4 50Z" fill="${SKD}" stroke="none" opacity=".45"/>
<path d="M29 22L29 42Q29 54.5 41 55.5L59 55.5Q71 54.5 71 42L71 22Z" fill="${SK}"/>
${fingers}
<path d="M65 24L65 44Q65 52 59 55Q70 53.6 71 42L71 22Z" fill="${SKD}" stroke="none" opacity=".45"/>
<path d="M33 16.4Q32 19.6 32.6 23M43.4 13.4Q42.4 16.6 43 20" fill="none" stroke="#fff" stroke-width="1.8" opacity=".75"/>
<path d="M25.5 36Q25 29 33 29L57.6 30Q63.6 30.6 63.6 35.8Q63.6 41 57.6 41.4L33 42Q25.5 42 25.5 36Z" fill="${SK}"/>
<path d="M56.4 31.6Q61.4 31.6 61.6 35.6Q61.6 38.4 58.6 39.2Q60.6 36 56.4 31.6Z" fill="#fff" stroke="none" opacity=".7"/>
<path d="M29 33Q32 31.2 37 31.4" fill="none" stroke="#fff" stroke-width="1.8" opacity=".75"/>
<path d="M37.4 56Q50 60.6 62.6 56L63.2 64.4Q50 69 37 64.4Z" fill="#ff4b5c"/>
<path d="M40.6 57.4L43.4 65.6M46.8 59L49.4 67M53.2 59L55.8 66.8M59.4 57.6L62 65" fill="none" stroke="#fff" stroke-width="2.4"/>
<path d="M37.4 56Q50 60.6 62.6 56L63.2 64.4Q50 69 37 64.4Z" fill="none"/>
<path d="M65 58.6Q74 50.6 86 53.4Q80.6 57 84 61.6Q74 59.6 65.6 62.4Z" fill="#ff4b5c" stroke-width="2.2"/>
<path d="M68.4 58.2Q75 55 81.6 55.6" fill="none" stroke="#fff" stroke-width="1.9"/>
<path d="M65 62.4Q72.6 67.4 82.6 70Q76.6 72.2 75 77Q68.4 70.6 64 64.4Z" fill="#ff4b5c" stroke-width="2.2"/>
<path d="M67.6 65.4Q72.2 69.4 76.6 71" fill="none" stroke="#fff" stroke-width="1.9"/>
<circle cx="64.4" cy="60.6" r="3.8" fill="#ff4b5c" stroke-width="2.2"/>
<path d="M32 72A18 5 0 0 0 68 72L74 84Q75.6 90 69 90L31 90Q24.4 90 26 84Z" fill="#3d6bff"/>
<path d="${wave}" fill="none" stroke="#fff" stroke-width="1.5" opacity=".85"/>
<path d="M68 72L74 84Q75.6 90 69 90L64 90Q70 82 62 75.6Z" fill="#2440a8" stroke="none" opacity=".35"/>
<path d="M32 72A18 5 0 0 0 68 72" fill="none" stroke-width="8"/><path d="M32 72A18 5 0 0 0 68 72" fill="none" stroke="#fff" stroke-width="5.4"/>
<path d="M32 72L26 84Q24.4 90 31 90L69 90Q75.6 90 74 84L68 72" fill="none"/>
${sp(15, 44, 4.2, '#ffd34d')}${sp(86, 36, 3.6, '#fff')}${sp(18, 14, 3.2, '#fff')}${sp(84, 84, 3.6, '#ffd34d')}
`, 'rotate(-6 50 60)');

  /* ---------------- THOUSAND CRANES ---------------- */
  const SB = [[18, 13], [16, 86], [84, 86], [82, 13]];
  const sbz = t => { const u = 1 - t; return [0, 1].map(k => u * u * u * SB[0][k] + 3 * u * u * t * SB[1][k] + 3 * u * t * t * SB[2][k] + t * t * t * SB[3][k]); };
  const sbd = t => { const u = 1 - t; return [0, 1].map(k => 3 * u * u * (SB[1][k] - SB[0][k]) + 6 * u * t * (SB[2][k] - SB[1][k]) + 3 * t * t * (SB[3][k] - SB[2][k])); };
  const crane = (x, y, rot, s, c) => `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(rot)}) scale(${s})" stroke-width="${r(2 / s)}">
<path d="M1 -2.6L9 -2.6L8.4 -16.4Z" fill="${c}"/><path d="M1 -2.6L9 -2.6L8.4 -16.4Z" fill="#2b2340" stroke="none" opacity=".3"/>
<path d="M-3 0L-13.4 -12.4L-7.6 2.2Z" fill="${c}"/>
<path d="M3.4 0L11.2 -13.6L8.2 1.6Z" fill="${c}"/><path d="M11.2 -13.6L15.6 -10.4L10.2 -11Z" fill="${c}"/>
<path d="M-9.6 0L0 7.6L10.2 0L0 -3Z" fill="${c}"/><path d="M0 -3L0 7.6L10.2 0Z" fill="#2b2340" stroke="none" opacity=".16"/>
<path d="M-7.6 -1.6L5.8 -1.6L-4 -19.6Z" fill="${c}"/><path d="M-4 -19.6L-7.6 -1.6L-1.4 -1.6Z" fill="#fff" stroke="none" opacity=".45"/>
</g>`;
  const cCols = ['#ff4b5c', '#ffb02e', '#4fc66a', '#3d9bff'];
  let cranes = '', beads = '';
  [0.2, 0.4, 0.6, 0.8].forEach((t, i) => {
    const [x, y] = sbz(t), [dx, dy] = sbd(t);
    const ang = Math.max(-16, Math.min(16, Math.atan2(dy, dx) / D * 0.3));
    cranes += crane(x, y + 3, ang, 1.08, cCols[i]);
  });
  [0.06, 0.28, 0.5, 0.72, 0.94].forEach(t => { const [x, y] = sbz(t); beads += `<circle cx="${r(x)}" cy="${r(y)}" r="2.3" fill="#ffcf3d" stroke-width="1.6"/>`; });
  const sbPath = `M${P(...SB[0])}C${P(...SB[1])} ${P(...SB[2])} ${P(...SB[3])}`;
  const ch_senbazuru = wrap(`
${tp(sbPath, 1.8, '#ff6b7a')}
${tassel(18, 12, '#a06bff', '#ffcf3d', 0.85, 20)}${tassel(82, 12, '#ff6fb0', '#ffcf3d', 0.85, -20)}
${beads}${cranes}
${sp(50, 30, 5, '#ffd34d')}${sp(36, 18, 3, '#fff')}${sp(65, 20, 3.2, '#fff')}${sp(50, 86, 3, '#fff')}${sp(12, 70, 3, '#ffd34d')}${sp(88, 70, 3, '#fff')}
`, 'translate(50 50) scale(.96) translate(-50 -50)');

  /* ---------------- KINTSUGI ---------------- */
  const kcr = 'M29.6 42.8C35 49 31 55 39.4 60.6S47 70 52.6 78.6M39.4 60.6C45 57.4 51 60.6 56 55.4S62.4 48.6 65.6 43.8M76.8 41.2C73.6 47 79 52 75.6 59.4M75.4 49.6L71 52';
  const ch_kintsugi = wrap(`
<circle cx="50" cy="52" r="40" fill="#fff3a8" stroke="none" opacity=".5"/>
<rect x="36.5" y="76" width="27" height="10" rx="3" fill="#2f63c8"/>
<path d="M39.5 79H52" fill="none" stroke="#7fb0ff" stroke-width="1.6"/>
<path d="M13 34C13 60 29 81 50 81C71 81 87 60 87 34Z" fill="#3f7fe0"/>
<path d="M87 34C87 60 71 81 50 81C66 74 77 58 80 38Z" fill="#1f4aa8" stroke="none" opacity=".4"/>
<path d="M18 46C20 58 26 68 33 74" fill="none" stroke="#a9d2ff" stroke-width="3" opacity=".7"/>
<path d="M13 34C13 60 29 81 50 81C71 81 87 60 87 34" fill="none"/>
<ellipse cx="50" cy="34" rx="37" ry="11" fill="#5d9cf0"/>
<ellipse cx="50" cy="35" rx="32.5" ry="8" fill="#bfe0ff" stroke-width="2"/>
<path d="M18 35.6Q22 28.4 50 27.2Q70 27 80 31.2Q68 29.4 50 30Q26 30.6 18 35.6Z" fill="#2f63c8" stroke="none" opacity=".25"/>
<path d="${kcr}" fill="none" stroke="#ffe36b" stroke-width="7.4" opacity=".5"/>
<path d="${kcr}" fill="none" stroke-width="5"/>
<path d="${kcr}" fill="none" stroke="#ffcf3d" stroke-width="2.4"/>
<path d="M31.4 45.6Q33.6 48.6 33.4 51.4M47 59Q51 59.4 54 56.6" fill="none" stroke="#fff6c0" stroke-width="1.1"/>
${sp(39.4, 60.6, 3.2, '#fff4a8')}${sp(75.6, 60, 2.8, '#ffd34d')}${sp(52.6, 78.6, 2.6, '#ffd34d')}
${sp(30, 15, 4.6, '#ffd34d')}${sp(80, 17, 3.6, '#fff')}${sp(86, 76, 4, '#ffd34d')}${sp(14, 72, 3, '#fff')}
`, 'rotate(-6 50 55)');

  /* ---------------- MAMEMAKI (masu + beans) ---------------- */
  const bean = (x, y, rot, s = 1) => `<g transform="translate(${r(x)} ${r(y)}) rotate(${rot}) scale(${s})"><ellipse rx="4.6" ry="3.7" fill="#eaa553" stroke-width="${r(1.9 / s)}"/><ellipse cx="-1.4" cy="-1.2" rx="1.6" ry="1" fill="#ffe2b0" stroke="none"/><path d="M1.6 -1.6Q2.8 0 1.6 1.6" fill="none" stroke="#b46a2a" stroke-width="${r(1.1 / s)}"/></g>`;
  const oL = [15, 46], oT = [50, 32], oR = [85, 46], oB = [50, 60];
  const sh = (p, k) => [50 + (p[0] - 50) * k, 46 + (p[1] - 46) * k];
  const iL = sh(oL, 0.82), iT = sh(oT, 0.82), iR = sh(oR, 0.82), iB = sh(oB, 0.82);
  const H = 26;
  const pp = (...a) => a.map(p => P(p[0], p[1])).join('L');
  const ch_mamemaki = wrap(`
<path d="M31 32Q27 26 28.6 20M47 28Q46.4 22 48 16M66 30Q69 25 71 20" fill="none" stroke-width="1.8" stroke-dasharray="2.4 4" opacity=".55"/>
<path d="M${pp(oL, oB, [oB[0], oB[1] + H], [oL[0], oL[1] + H])}Z" fill="#f2c27a"/>
<path d="M${pp(oB, oR, [oR[0], oR[1] + H], [oB[0], oB[1] + H])}Z" fill="#d9a05c"/>
<path d="M20 52L20 68M26 56L26 73M33 58L33 76" fill="none" stroke="#c98a44" stroke-width="1.3" opacity=".7"/>
<path d="M60 63L60 80M70 58L70 75M78 54.5L78 69" fill="none" stroke="#b07a3a" stroke-width="1.3" opacity=".7"/>
<path d="M18 50.6L46.5 63.6" fill="none" stroke="#fff3d0" stroke-width="2" opacity=".8"/>
<path d="M${pp(oL, oT, oR, oB)}Z" fill="#ffe0a3"/>
<path d="M${pp(iL, iT, iR, iB)}Z" fill="#b9773e" stroke-width="2"/>
<path d="M${pp(iL)}Q30 36 50 37Q70 36 ${pp(iR)}L${pp(iB)}Z" fill="#eaa553" stroke="none"/>
${bean(30, 45, 20, 0.95)}${bean(39, 40, -30, 0.95)}${bean(49, 43, 10, 0.95)}${bean(59, 39, 40, 0.95)}${bean(68, 45, -15, 0.95)}${bean(44, 50, 60, 0.95)}${bean(56, 50, -40, 0.95)}${bean(50, 35, 0, 0.9)}
<path d="M${pp(oL, oB, oR, iR, iB, iL)}Z" fill="#ffe0a3" stroke="none"/>
<path d="M${pp(oL, oB, oR)}" fill="none"/>
<path d="M${pp(iL, iB, iR)}" fill="none" stroke-width="2"/>
<path d="M${pp(oL, oT, oR)}" fill="none"/>
<path d="M${pp(oB, [oB[0], oB[1] + H])}" fill="none" stroke-width="2.2"/>
${bean(26, 26, -30)}${bean(42, 18, 25)}${bean(58, 22, -50)}${bean(74, 26, 15)}${bean(35, 11, 70, 0.85)}${bean(64, 11.4, -20, 0.85)}
${sp(14, 30, 4, '#ffd34d')}${sp(88, 30, 3.4, '#fff')}${sp(88, 84, 3.4, '#ffd34d')}${sp(12, 82, 3, '#fff')}
`, 'translate(50 51) scale(.96) rotate(-6) translate(-50 -51)');

  /* ---------------- KOTODAMA (brush + glowing ink) ---------------- */
  const KC = [36, 61], kpts = [], kws = [];
  const KN = 40;
  for (let i = 0; i <= KN; i++) {
    const t = i / KN, th = (-28 + t * 430) * D, R0 = 25 - 18.5 * Math.pow(t, 0.85);
    kpts.push([KC[0] + R0 * Math.cos(th), KC[1] + R0 * Math.sin(th) * 0.92]);
    kws.push(1.6 + 8.8 * Math.pow(Math.sin(Math.PI * (0.12 + 0.88 * t)), 0.9) * (1 - 0.35 * t));
  }
  const ink = ribbon(kpts, kws);
  const kmid = 'M' + kpts.slice(4, 26).map(p => P(p[0] - 1.3, p[1] - 1.3)).join('L');
  const ch_kotodama = wrap(`
<circle cx="${KC[0]}" cy="${KC[1]}" r="31" fill="#fff3a8" stroke="none" opacity=".45"/>
<path d="${ink}" fill="#e3d6ff" stroke="#e3d6ff" stroke-width="11" opacity=".6"/>
<path d="${ink}" fill="#c9b4ff" stroke="#c9b4ff" stroke-width="5.4" opacity=".7"/>
<path d="${ink}" fill="#5b4bb5"/>
<path d="${kmid}" fill="none" stroke="#a593ff" stroke-width="1.8" opacity=".9"/>
<circle cx="14" cy="84" r="2.4" fill="#5b4bb5" stroke-width="1.6"/><circle cx="20.6" cy="89" r="1.6" fill="#5b4bb5" stroke-width="1.4"/><circle cx="68" cy="82" r="2" fill="#5b4bb5" stroke-width="1.5"/>
<g transform="translate(${r(kpts[0][0] + 0.5)} ${r(kpts[0][1] - 1)}) rotate(40)">
<circle cx="0" cy="-49.4" r="3.4" fill="none" stroke-width="5.2"/><circle cx="0" cy="-49.4" r="3.4" fill="none" stroke="#ff4b5c" stroke-width="2.2"/>
<rect x="-4.6" y="-46.4" width="9.2" height="26" rx="3" fill="#f2d48c"/>
<path d="M-4.6 -36.6H4.6" fill="none" stroke-width="1.5"/>
<path d="M-1.6 -43.4V-39M-1.6 -34V-24" fill="none" stroke="#fff6d6" stroke-width="1.6"/>
<path d="M1.6 -45V-21" fill="none" stroke="#c49a4a" stroke-width="1.4" opacity=".5"/>
<rect x="-6" y="-21.5" width="12" height="6.5" rx="2" fill="#ff4b5c"/>
<path d="M-6 -18.2H6" fill="none" stroke="#ffcf3d" stroke-width="1.6"/>
<path d="M-5.4 -15C-6.6 -8 -3.4 -3 0 2.4C3.4 -3 6.6 -8 5.4 -15Z" fill="#fff6e8"/>
<path d="M-4.4 -6.6C-3 -3.2 -1.4 -0.6 0 2.4C1.4 -0.6 3 -3.2 4.4 -6.6Q0 -4.6 -4.4 -6.6Z" fill="#5b4bb5" stroke-width="1.6"/>
<path d="M-2.4 -13.4Q-2.8 -10.4 -2 -8" fill="none" stroke="#fff" stroke-width="1.4"/>
</g>
${sp(14, 40, 4.4, '#ffd34d')}${sp(66, 72, 3.4, '#fff')}${sp(38, 61, 3.2, '#ffd34d')}${sp(84, 62, 3.6, '#ffd34d')}${sp(30, 20, 3, '#fff')}${sp(62, 14, 2.8, '#fff')}
`, 'translate(50 51) scale(.96) translate(-50 -50)');

  /* ---------------- DOHYO (sumo ring) ---------------- */
  const DX = 50, DY = 37.4, DRX = 24.4, DRY = 11.2;
  let ties = '';
  for (let a = 0; a < 360; a += 20) {
    const c = Math.cos(a * D), s = Math.sin(a * D);
    ties += `M${P(DX + (DRX - 3.2) * c, DY + (DRY - 3.2) * s)}L${P(DX + (DRX + 3.2) * c, DY + (DRY + 3.2) * s)}`;
  }
  const ea = (rx, ry, a, b, dy = 0) => `M${P(DX + rx * Math.cos(a * D), DY + dy + ry * Math.sin(a * D))}A${rx} ${ry} 0 0 1 ${P(DX + rx * Math.cos(b * D), DY + dy + ry * Math.sin(b * D))}`;
  const ch_dohyo = wrap(`
<path d="M12 54L88 54L92 70Q92.6 73 89.6 73L10.4 73Q7.4 73 8 70Z" fill="#d9915a"/>
<path d="M64 54L88 54L92 70Q92.6 73 89.6 73L72 73Z" fill="#a8602a" stroke="none" opacity=".3"/>
<path d="M14.4 57.4L11.6 69" fill="none" stroke="#f0b47a" stroke-width="2.4"/>
<circle cx="30" cy="63" r="1" fill="#b86e34" stroke="none"/><circle cx="46" cy="66" r="1.1" fill="#b86e34" stroke="none"/><circle cx="62" cy="62" r="1" fill="#b86e34" stroke="none"/><circle cx="78" cy="67" r="1.1" fill="#b86e34" stroke="none"/>
<path d="M25 20L75 20Q77.4 20 78.2 22.2L87.6 51Q88.4 54 85.4 54L14.6 54Q11.6 54 12.4 51L21.8 22.2Q22.6 20 25 20Z" fill="#eeb06a"/>
<path d="M24.6 22.6L75.4 22.6" fill="none" stroke="#ffe0b0" stroke-width="2.2"/>
<path d="M21 26.4L14.6 50" fill="none" stroke="#ffe0b0" stroke-width="2.2"/>
<ellipse cx="${DX}" cy="${DY}" rx="${DRX}" ry="${DRY}" fill="#fff4dc" stroke="none"/>
<ellipse cx="${DX}" cy="${DY}" rx="${DRX}" ry="${DRY}" fill="none" stroke-width="10.6"/>
<ellipse cx="${DX}" cy="${DY}" rx="${DRX}" ry="${DRY}" fill="none" stroke="#f2d26a" stroke-width="7"/>
<path d="${ties}" fill="none" stroke="#b8962e" stroke-width="1.3"/>
<path d="${ea(DRX, DRY, 190, 262, -1.6)}" fill="none" stroke="#fff6c4" stroke-width="1.8"/>
<path d="${ea(DRX, DRY, 20, 100, 1.8)}" fill="none" stroke="#c9a23a" stroke-width="2" opacity=".8"/>
<path d="M45.6 35.6H54.4M45.6 39H54.4" fill="none" stroke-width="3.4"/><path d="M45.6 35.6H54.4M45.6 39H54.4" fill="none" stroke="#fff" stroke-width="1.6"/>
<rect x="14" y="6" width="3.4" height="3.4" rx=".6" fill="#fff" stroke-width="1.3" transform="rotate(20 15.7 7.7)"/>
<rect x="27" y="4.6" width="3" height="3" rx=".6" fill="#fff" stroke-width="1.3" transform="rotate(-15 28.5 6.1)"/>
<rect x="20" y="12" width="2.6" height="2.6" rx=".5" fill="#fff" stroke-width="1.2"/>
<rect x="35" y="9" width="2.6" height="2.6" rx=".5" fill="#fff" stroke-width="1.2" transform="rotate(30 36.3 10.3)"/>
${sp(10, 24, 3.4, '#fff')}${sp(84, 8, 4.4, '#ffd34d')}${sp(66, 8, 3, '#fff')}${sp(50, 82, 3.4, '#ffd34d')}${sp(18, 82, 2.8, '#fff')}${sp(84, 82, 2.8, '#fff')}
`, 'translate(50 55) scale(.95) rotate(-3) translate(-50 -50)');

  /* ---------------- KAMINARI (bolt + drums) ---------------- */
  const drum = (x, y, rot) => {
    let studs = '';
    for (let a = 0; a < 360; a += 60) studs += `M${P(8.4 * Math.cos(a * D), 8.4 * Math.sin(a * D))}h0`;
    return `<g transform="translate(${x} ${y}) rotate(${rot})"><circle cx="2.4" cy="1.8" r="10" fill="#c42a3a"/><circle r="10" fill="#ff5a4a"/><path d="${studs}" fill="none" stroke="#ffcf3d" stroke-width="2"/><circle r="6.4" fill="#fff4d6" stroke-width="1.8"/>${tomoe(0, 0, 0.44, '#ff4b4b')}</g>`;
  };
  const bolt = 'M55 10L30 52L46 52L37 86L73 40L56 40L70 10Z';
  const ch_kaminari = wrap(`
<path d="${arc(50, 48, 35, 140, 220)}${arc(50, 48, 35, -40, 40)}" fill="none" stroke-width="7.8"/>
<path d="${arc(50, 48, 35, 140, 220)}${arc(50, 48, 35, -40, 40)}" fill="none" stroke="#ff9a3d" stroke-width="4.4"/>
<path d="${arc(50, 48, 35, 150, 175)}${arc(50, 48, 35, -30, -5)}" fill="none" stroke="#ffd0a0" stroke-width="1.4"/>
<path d="${bolt}" fill="#fff3a8" stroke="#fff3a8" stroke-width="8" opacity=".7"/>
${drum(22, 27, -20)}${drum(78, 27, 20)}${drum(22, 69, 15)}${drum(78, 69, -15)}
<path d="${burst(38, 83, 8.4, 4.4, 8, 0)}" fill="#fff3a8" stroke-width="2"/>
<path d="${bolt}" fill="#ffd93d"/>
<path d="M55 10L30 52L46 52L37 86L44 59L34 59Z" fill="#fff6b0" stroke="none" opacity=".9"/>
<path d="M73 40L56 40L70 10L63 10L50 44L64 44Z" fill="#ffa62b" stroke="none" opacity=".4"/>
<path d="${bolt}" fill="none"/>
<path d="M23 84H27.6M49 84H53.6" fill="none" stroke-width="2.2"/>
${sp(48, 12, 3.2, '#fff')}${sp(88, 48, 3.4, '#fff')}${sp(12, 48, 3.4, '#ffd34d')}
`, 'rotate(-3 50 50)');

  /* ---------------- HIBASHI (fire tongs + ember) ---------------- */
  const EX = 67, EY = 68;
  const lump = (k, ox = 0, oy = 0) => {
    const q = [14, 12.4, 14.6, 12.8, 14.2, 12.2, 14.4, 12.6, 13.6].map((rr, i) => {
      const a = (i * 40 + 10) * D;
      return [EX + ox + rr * k * Math.cos(a), EY + oy + rr * k * Math.sin(a) * 0.88];
    });
    const m = (u, v) => P((u[0] + v[0]) / 2, (u[1] + v[1]) / 2);
    let d = 'M' + m(q[q.length - 1], q[0]);
    q.forEach((pt, i) => { d += `Q${P(pt[0], pt[1])} ${m(pt, q[(i + 1) % q.length])}`; });
    return d + 'Z';
  };
  const rod = (x1, y1, x2, y2) => {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    const g1 = 6, g2 = 23;
    let wr = '';
    for (let k = g1 + 2; k < g2; k += 3.2) wr += `M${P(x1 + ux * k - uy * 3, y1 + uy * k + ux * 3)}L${P(x1 + ux * (k + 1.6) + uy * 3, y1 + uy * (k + 1.6) - ux * 3)}`;
    return tl(x1, y1, x2, y2, 3.6, '#b7c6ea') +
      `<path d="M${P(x1 + ux * 2 - uy * 0.9, y1 + uy * 2 + ux * 0.9)}L${P(x2 - ux * 2 - uy * 0.9, y2 - uy * 2 + ux * 0.9)}" fill="none" stroke="#fff" stroke-width="1.1" opacity=".8"/>` +
      tl(x1 + ux * g1, y1 + uy * g1, x1 + ux * g2, y1 + uy * g2, 6.2, '#ff4b5c') +
      `<path d="${wr}" fill="none" stroke="#fff" stroke-width="1.4" opacity=".85"/>`;
  };
  const ch_hibashi = wrap(`
<circle cx="${EX}" cy="${EY}" r="25" fill="#ffd27a" stroke="none" opacity=".35"/>
<circle cx="${EX}" cy="${EY}" r="19" fill="#ffe36b" stroke="none" opacity=".45"/>
<path d="M72 58Q66 50 71 41Q74 48 78 46Q83 54 78 59Z" fill="#ff8a3d" stroke-width="2.2"/>
<path d="M73.6 57Q71 52 73.4 47.6Q75.6 51.4 77.6 51Q79 55 76.4 57.6Z" fill="#ffe36b" stroke="none"/>
<path d="${lump(1)}" fill="#e8452e"/>
<path d="${lump(0.74, -1.6, -1.6)}" fill="#ff8a3d" stroke="none"/>
<path d="${lump(0.42, -2.6, -2.6)}" fill="#ffd34d" stroke="none"/>
<path d="M${EX + 12.6} ${EY - 1}Q${EX + 11} ${EY + 9} ${EX - 1} ${EY + 11.4}Q${EX + 8} ${EY + 6} ${EX + 9} ${EY - 2}Z" fill="#b8282a" stroke="none" opacity=".45"/>
<path d="M${EX - 10} ${EY + 4}Q${EX - 6} ${EY + 3} ${EX - 4} ${EY + 7}M${EX + 4} ${EY - 9}Q${EX + 5} ${EY - 5} ${EX + 9} ${EY - 4}M${EX + 3} ${EY + 4}Q${EX + 6} ${EY + 4} ${EX + 7} ${EY + 8}" fill="none" stroke="#b8282a" stroke-width="1.5"/>
<path d="M${EX + 6} ${EY + 9.6}q2.6 -0.6 3.6 -3M${EX + 10.6} ${EY + 3}q1.4 -1.6 1.2 -3.6M${EX - 8} ${EY + 9}q2 1.2 4.4 1.2" fill="none" stroke="#fff1e0" stroke-width="2.2" opacity=".9"/>
${rod(19.4, 14.6, 65, 54.6)}${rod(14.6, 19.4, 52.6, 66.4)}
<circle cx="15.4" cy="15.4" r="5.6" fill="none" stroke-width="5.6"/><circle cx="15.4" cy="15.4" r="5.6" fill="none" stroke="#ffcf3d" stroke-width="2.6"/>
<circle cx="86" cy="40" r="1.8" fill="#ffcf3d" stroke-width="1.4"/><circle cx="80" cy="30" r="1.4" fill="#ff8a3d" stroke-width="1.2"/><circle cx="89" cy="56" r="1.4" fill="#ff8a3d" stroke-width="1.2"/>
${sp(56, 32, 3.2, '#ffd34d')}${sp(34, 80, 3.6, '#fff')}${sp(88, 18, 3, '#fff')}
`);

  /* ---------------- JINRIKISHA (rickshaw) ---------------- */
  const WX = 36, WY = 68, WR = 20;
  let spokes = '';
  for (let a = 0; a < 360; a += 30) spokes += `M${P(WX + 4.5 * Math.cos(a * D), WY + 4.5 * Math.sin(a * D))}L${P(WX + 15.8 * Math.cos(a * D), WY + 15.8 * Math.sin(a * D))}`;
  const HX = 40, HY = 47;
  const hp = (a, rr) => P(HX + rr * Math.cos(a * D), HY + rr * Math.sin(a * D));
  const hood = `M${hp(200, 2)}L${hp(196, 30)}A30 30 0 0 1 ${hp(292, 30)}Z`;
  const folds = [221, 245, 268].map(a => `M${hp(a, 6)}L${hp(a, 30)}`).join('');
  const ch_jinrikisha = wrap(`
${tl(54, 60, 90, 77, 3.6, '#e0523f')}
${tl(87.6, 70.6, 91, 82, 3, '#f2c27a')}
<path d="M76 72L77 75.4" fill="none" stroke-width="1.6"/>
<ellipse cx="77.4" cy="80.6" rx="4.4" ry="5.4" fill="#fff4d6" stroke-width="2"/>
<path d="M73.2 79.2H81.6M73.2 82.2H81.6" fill="none" stroke="#ff4b5c" stroke-width="1.6"/>
<rect x="74.6" y="74.6" width="5.6" height="1.8" rx=".8" fill="#2b2340" stroke="none"/><rect x="74.6" y="84.8" width="5.6" height="1.8" rx=".8" fill="#2b2340" stroke="none"/>
<path d="M56 58L69 68L78 68Q80 68 80 70L80 71Q80 73 78 73L67.4 73L53 62Z" fill="#c42a3a"/>
<path d="${hood}" fill="#3d5bd9"/>
<path d="${folds}" fill="none" stroke="#2b3a9a" stroke-width="1.8"/>
<path d="M${hp(202, 26.4)}A26.4 26.4 0 0 1 ${hp(238, 26.4)}" fill="none" stroke="#8fa4ff" stroke-width="2.4"/><path d="M${hp(268, 4)}L${hp(268, 30)}L${hp(292, 30)}Z" fill="#2b3a9a" stroke="none" opacity=".3"/>
<path d="M${hp(292, 28.6)}L${hp(290, 12)}" fill="none" stroke="#ffcf3d" stroke-width="2.4"/>
<path d="M16 40Q12 54 21 61Q27 65 38 64L57 64Q62 63 61 57L59 47L44 47Q42 41 37 40Z" fill="#ff4b4b"/>
<path d="M55 51L59 47L61 57Q62 63 57 64L45 64Q55 59 55 51Z" fill="#c42a3a" stroke="none" opacity=".45"/>
<path d="M18.6 46Q17.4 54 23 59" fill="none" stroke="#ff9a8a" stroke-width="2.4"/>
<path d="M17.4 44Q30 46 44 47L59 47" fill="none" stroke="#ffcf3d" stroke-width="1.8"/>
<rect x="36" y="42.6" width="26" height="7" rx="3.5" fill="#fff4d6"/>
<path d="M39 45H56" fill="none" stroke="#fff" stroke-width="1.6"/>

<path d="${arc(WX, WY, WR + 4, 198, 342)}" fill="none" stroke-width="7.4"/>
<path d="${arc(WX, WY, WR + 4, 198, 342)}" fill="none" stroke="#ff4b4b" stroke-width="4.2"/>
<circle cx="${WX}" cy="${WY}" r="${WR - 2}" fill="#fff4d6" stroke="none" opacity=".55"/>
<path d="${spokes}" fill="none" stroke-width="3.6"/><path d="${spokes}" fill="none" stroke="#ff6a5a" stroke-width="1.6"/>
<circle cx="${WX}" cy="${WY}" r="${WR}" fill="none" stroke-width="8"/>
<circle cx="${WX}" cy="${WY}" r="${WR}" fill="none" stroke="#3a3152" stroke-width="4.6"/>
<circle cx="${WX}" cy="${WY}" r="${WR - 3.6}" fill="none" stroke="#ff4b4b" stroke-width="2"/>
<path d="${arc(WX, WY, WR, 200, 250)}" fill="none" stroke="#8a7fb8" stroke-width="1.6"/>
<circle cx="${WX}" cy="${WY}" r="5" fill="#ffcf3d" stroke-width="2"/><circle cx="${WX - 1.4}" cy="${WY - 1.4}" r="1.4" fill="#fff" stroke="none"/>
${sp(82, 16, 4.4, '#ffd34d')}${sp(74, 40, 3, '#fff')}${sp(12, 26, 3.2, '#fff')}
`, 'translate(51 52) scale(.95) rotate(-3) translate(-50 -52)');

  /* ---------------- HIKYAKU (courier) ---------------- */
  const ch_hikyaku = wrap(`
<path d="M8 30H17M6 37H13M10 60H18M8 68H14" fill="none" stroke-width="2.4" opacity=".55"/>
${tl(14, 34, 88, 14, 4, '#f2d48c')}
<path d="M38.4 27.4L39.6 31.8M62 21L63.2 25.4" fill="none" stroke-width="1.4"/>
<path d="M74 18L58 38M74 18L88 38" fill="none" stroke-width="3.8"/><path d="M74 18L58 38M74 18L88 38" fill="none" stroke="#ff4b5c" stroke-width="1.6"/>
<g transform="rotate(6 73 50)">
<rect x="56" y="37" width="33" height="25" rx="3" fill="#e0523f"/>
<path d="M76 37L89 37L89 59Q89 62 86 62L74 62Q82 55 76 37Z" fill="#a8302a" stroke="none" opacity=".35"/>
<path d="M56 43H89" fill="none" stroke-width="2"/>
<path d="M60 40H72" fill="none" stroke="#ff9a7a" stroke-width="1.8"/>
<path d="M72.5 37V62" fill="none" stroke-width="5.4"/><path d="M72.5 37V62" fill="none" stroke="#a06bff" stroke-width="2.8"/>
<path d="M56 51H89" fill="none" stroke-width="5.4"/><path d="M56 51H89" fill="none" stroke="#a06bff" stroke-width="2.8"/>
<path d="M72.5 51L67 60M72.5 51L78.5 59.5" fill="none" stroke-width="4.6"/><path d="M72.5 51L67 60M72.5 51L78.5 59.5" fill="none" stroke="#a06bff" stroke-width="2"/>
<circle cx="72.5" cy="51" r="3" fill="#c9a6ff" stroke-width="1.8"/>
<path d="M56 40V37H59M89 40V37H86M56 59V62H59M89 59V62H86" fill="none" stroke="#ffcf3d" stroke-width="2"/>
<rect x="62" y="31" width="13" height="7" rx="1" fill="#fffaf0" stroke-width="1.8" transform="rotate(-8 68 34)"/>
<circle cx="66" cy="34" r="1.6" fill="#ff4b5c" stroke="none"/>
</g>
<g transform="translate(37 71) rotate(-32)">
<path d="M-20 -7Q-22.4 0 -20 7Q-10 9.2 4 9.6Q19.4 10 21.6 0Q19.4 -10 4 -9.6Q-10 -9.2 -20 -7Z" fill="#ebc47e"/>
<path d="M-16.6 -4.6Q-18.2 0 -16.6 4.6Q-8 6.6 4 6.8Q15.6 7 17.6 0Q15.6 -7 4 -6.8Q-8 -6.6 -16.6 -4.6Z" fill="none" stroke="#c4904a" stroke-width="1.3"/>
<path d="M-12 -5.4V5.4M-6 -6V6M0 -6.4V6.4M6 -6.4V6.4M12 -5.6V5.6" fill="none" stroke="#c4904a" stroke-width="1.2" opacity=".7"/>
<path d="M-18.4 -2.4Q-19 0 -18.4 2.4M-12 -8.2Q-4 -8.8 4 -8.6" fill="none" stroke="#fff3c8" stroke-width="1.5"/>
<path d="M13.4 0Q4 -10.4 -5 -9.4M13.4 0Q4 10.4 -5 9.4" fill="none" stroke-width="5"/>
<path d="M13.4 0Q4 -10.4 -5 -9.4M13.4 0Q4 10.4 -5 9.4" fill="none" stroke="#ff4b5c" stroke-width="2.4"/>
<circle cx="-5" cy="-9.4" r="2.2" fill="#ebc47e" stroke-width="1.6"/><circle cx="-5" cy="9.4" r="2.2" fill="#ebc47e" stroke-width="1.6"/>
<circle cx="13.4" cy="0" r="2.8" fill="#ff4b5c" stroke-width="1.8"/>
</g>
<path d="M16 88Q11 86 13 81.6Q15.6 78 20 80.6Q22 77 26 79.6Q29.6 82 27 86Q25 89 21 88Z" fill="#fff" stroke-width="1.8" opacity=".9"/>
${sp(24, 14, 4.2, '#ffd34d')}${sp(50, 52, 3, '#fff')}${sp(84, 82, 3.6, '#ffd34d')}${sp(62, 86, 2.8, '#fff')}
`);

  /* ---------------- SAISEN (offering box + coins) ---------------- */
  const coin = (x, y, rot, sx = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${sx} 1)"><path d="M-8 0A8 8 0 1 0 8 0A8 8 0 1 0 -8 0ZM-2.4 0A2.4 2.4 0 1 1 2.4 0A2.4 2.4 0 1 1 -2.4 0Z" fill="#ffcf3d" fill-rule="evenodd" stroke-width="${r(2 / Math.max(sx, 0.5))}"/><path d="M-5.4 0A5.4 5.4 0 0 1 0 -5.4" fill="none" stroke="#fff6c0" stroke-width="1.6"/><path d="M5.6 1.6A5.6 5.6 0 0 1 1.6 5.6" fill="none" stroke="#d99a1a" stroke-width="1.5"/></g>`;
  let slats = '';
  for (let i = 0; i < 5; i++) {
    const y1 = 38 + i * 3.4, y2 = y1 + 1.8, k1 = (y1 - 36) / 16, k2 = (y2 - 36) / 16;
    const xl1 = 22 - 8 * k1, xr1 = 78 + 8 * k1, xl2 = 22 - 8 * k2, xr2 = 78 + 8 * k2;
    slats += `M${P(xl1 + 1, y1)}L${P(xr1 - 1, y1)}L${P(xr2 - 1, y2)}L${P(xl2 + 1, y2)}Z`;
  }
  const ch_saisen = wrap(`
<path d="M30 9V12.6M36 9V12M58 8.6V11.6M64 8.6V12M46 22V25" fill="none" stroke-width="1.8" opacity=".5"/>
<rect x="10" y="82" width="80" height="8" rx="2.6" fill="#b4602a"/>
<path d="M14 52L86 52L86 84L14 84Z" fill="#e39a55"/>
<path d="M66 52L86 52L86 84L66 84Z" fill="#b4602a" stroke="none" opacity=".3"/>
<rect x="20" y="57" width="60" height="22" rx="2" fill="#f2b06a" stroke="#c47a3a" stroke-width="1.8"/>
<path d="M22 60V76" fill="none" stroke="#ffd59a" stroke-width="2"/>
<circle cx="50" cy="68" r="9" fill="#ffcf3d" stroke-width="2.2"/>
${tomoe(50, 68, 0.56, '#e0523f')}
<path d="M14 58V52H20M86 58V52H80M14 78V84H20M86 78V84H80" fill="none" stroke-width="5.4"/>
<path d="M14 58V52H20M86 58V52H80M14 78V84H20M86 78V84H80" fill="none" stroke="#ffcf3d" stroke-width="2.6"/>
<path d="M22 36L78 36L86 52L14 52Z" fill="#7a4220"/>
<path d="${slats}" fill="#f2b06a" stroke="none"/>
<path d="M22 36L78 36L86 52L14 52Z" fill="none"/>
<path d="M14 52H86" fill="none" stroke-width="3"/>
${coin(50, 32.6, 0, 0.32)}${coin(33, 22, -24)}${coin(62, 18, 18, 0.7)}
${sp(80, 26, 4.2, '#ffd34d')}${sp(18, 32, 3.4, '#fff')}${sp(48, 20, 3, '#fff')}${sp(90, 70, 3, '#fff')}
`);

  /* ---------------- KARAKURI (tea-serving doll) ---------------- */
  let gear = '';
  for (let i = 0; i < 8; i++) {
    const a = i * 45 * D, a1 = a - 12 * D, a2 = a + 12 * D;
    gear += `${i ? 'L' : 'M'}${P(9.6 * Math.cos(a - 22.5 * D), 9.6 * Math.sin(a - 22.5 * D))}L${P(9.6 * Math.cos(a1), 9.6 * Math.sin(a1))}L${P(12.6 * Math.cos(a1 + 3 * D), 12.6 * Math.sin(a1 + 3 * D))}L${P(12.6 * Math.cos(a2 - 3 * D), 12.6 * Math.sin(a2 - 3 * D))}L${P(9.6 * Math.cos(a2), 9.6 * Math.sin(a2))}`;
  }
  const ch_karakuri = wrap(`
<g transform="translate(26 80) rotate(10)"><path d="${gear}Z" fill="#ffcf3d" stroke-width="2"/><circle r="4.4" fill="#e8a52a" stroke-width="1.8"/><circle r="1.6" fill="#2b2340" stroke="none"/></g>
<path d="M31 58H19" fill="none" stroke-width="5.4"/><path d="M31 58H19" fill="none" stroke="#ffcf3d" stroke-width="2.6"/>
<path d="M18.4 58C12 54 11 46 15.6 45.4C20 45 21 52 18.4 58C21 64 20 71 15.6 70.6C11 70 12 62 18.4 58ZM16.6 51.4A1.8 2.6 0 1 0 16.6 51.5ZM16.6 64.5A1.8 2.6 0 1 0 16.6 64.6Z" fill="#ffcf3d" fill-rule="evenodd" stroke-width="2"/>
<path d="M14 49Q14.4 47 16 46.8" fill="none" stroke="#fff6c0" stroke-width="1.4"/>
<path d="M9 44Q6 50 7.6 56M8 62Q7.4 68 11 72" fill="none" stroke-width="1.8" opacity=".55"/>
<path d="M40 46L56 46L68 84Q68 88 64 88L32 88Q27 88 28 84Z" fill="#3d6bff"/>
<path d="M44 66V87M52 66V87M60 66V87" fill="none" stroke="#2440a8" stroke-width="1.6"/>
<path d="M36 64L58 64L68 84Q68 88 64 88L60 88Q64 76 58 64Z" fill="#2440a8" stroke="none" opacity=".3"/>
<path d="M39 46L57 46L60 66L34 66Z" fill="#ff4b5c"/>
<circle cx="42" cy="56" r="1.4" fill="#ffcf3d" stroke="none"/><circle cx="50" cy="60" r="1.4" fill="#ffcf3d" stroke="none"/><circle cx="54" cy="52" r="1.4" fill="#ffcf3d" stroke="none"/><circle cx="39" cy="62.6" r="1.2" fill="#ffcf3d" stroke="none"/>
<path d="M43 46L49 55L55 46" fill="#fff" stroke-width="2"/>
<rect x="34" y="62.6" width="26.4" height="5" rx="1.6" fill="#ffcf3d" stroke-width="2"/>
<ellipse cx="38" cy="88.4" rx="5" ry="2.6" fill="#fff" stroke-width="1.8"/><ellipse cx="56" cy="88.4" rx="5" ry="2.6" fill="#fff" stroke-width="1.8"/>
<path d="M52 49Q60 50 66 54L68 66Q60 64 54 60Z" fill="#ff4b5c"/>
<path d="M54 60Q60 64 68 66" fill="none" stroke="#c42a3a" stroke-width="1.4"/>
<ellipse cx="69" cy="55" rx="3.8" ry="3.2" fill="#fff6ee" stroke-width="2"/>
<ellipse cx="74" cy="56.6" rx="13.6" ry="3.6" fill="#e0523f"/>
<path d="M62 56.6Q74 59.4 86 56.6" fill="none" stroke="#ff9a7a" stroke-width="1.4"/>
<path d="M67 46Q67 55 74 55Q81 55 81 46Z" fill="#fff"/>
<path d="M67.4 49H80.6" fill="none" stroke="#3d9bff" stroke-width="2"/>
<ellipse cx="74" cy="46" rx="7" ry="2.2" fill="#74c23f" stroke-width="1.8"/>
<path d="M71 41Q69 38 71 35Q73 32 71 29M77 41Q75 38 77 35" fill="none" stroke="#fff" stroke-width="3.6"/><path d="M71 41Q69 38 71 35Q73 32 71 29M77 41Q75 38 77 35" fill="none" stroke="#c9d6f0" stroke-width="1.2" opacity="0"/>
<circle cx="47" cy="29" r="17" fill="#fff6ee"/>
<path d="M30 33C26 14 40 8 49 9C60 9 68 16 65 30L62 26L48 25L43 32L40 25L36 33L34 44Q30 42 30 33Z" fill="#3b3f8f"/>
<path d="M34 16Q40 11 47 11" fill="none" stroke="#7f86e0" stroke-width="2.4"/>
<path d="M38 13Q44 6 52 9" fill="none" stroke-width="0"/>
<circle cx="48" cy="9" r="5" fill="#3b3f8f"/><path d="M45 7.6Q47 5.6 49.6 6" fill="none" stroke="#7f86e0" stroke-width="1.4"/>
<path d="M42 10L54 10L52 14L44 14Z" fill="#ff4b5c" stroke-width="1.8"/>
<path d="M49 34Q51.4 31.6 53.8 34M58.6 33.4Q60.6 31.4 62.6 33.6" fill="none" stroke-width="2"/>
<ellipse cx="48" cy="38.6" rx="2.8" ry="1.6" fill="#ff7a9a" stroke="none" opacity=".6"/><ellipse cx="63" cy="38.4" rx="2" ry="1.5" fill="#ff7a9a" stroke="none" opacity=".6"/>
<path d="M56.4 40.6Q57.6 41.8 59 40.6" fill="none" stroke="#e0523f" stroke-width="1.8"/>
${sp(86, 22, 4, '#ffd34d')}${sp(16, 28, 3.4, '#fff')}${sp(88, 76, 3.4, '#fff')}
`, 'translate(50 50.5) scale(.94) translate(-50 -49)');

  Object.assign(window.ICON_ART, { ch_wasshoi, ch_senbazuru, ch_kintsugi, ch_mamemaki, ch_kotodama, ch_dohyo, ch_kaminari, ch_hibashi, ch_jinrikisha, ch_hikyaku, ch_saisen, ch_karakuri });
})();
