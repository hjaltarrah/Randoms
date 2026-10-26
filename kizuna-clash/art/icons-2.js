/* Kizuna Clash: charm card icons, set 2 (flat SVG, 100x100 box). */
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
  // 5-point star
  const star5 = (x, y, R, f, rot = 0, sw = 1.8) => {
    const p = [];
    for (let i = 0; i < 10; i++) {
      const a = (rot - 90 + i * 36) * D, rr = i % 2 ? R * 0.48 : R;
      p.push(r(x + rr * Math.cos(a)) + ',' + r(y + rr * Math.sin(a)));
    }
    return `<polygon points="${p.join(' ')}" fill="${f}" stroke-width="${sw}"/>`;
  };
  // thick outlined line / path (outline underneath, colour on top)
  const tl = (x1, y1, x2, y2, w, c) =>
    `<path d="M${P(x1, y1)}L${P(x2, y2)}" fill="none" stroke-width="${w + 2.8}"/><path d="M${P(x1, y1)}L${P(x2, y2)}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  const tp = (d, w, c) => `<path d="${d}" fill="none" stroke-width="${w + 2.8}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  // hanging tassel: knot at 0,0, fringe below
  const tassel = (x, y, c = '#ff4b5c', k = '#ffcf3d', s = 1, rot = 0) =>
    `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(rot)}) scale(${s})"><path d="M-4.4 4L-6 18.5Q0 21 6 18.5L4.4 4Z" fill="${c}" stroke-width="2"/><path d="M-2.6 8.5V17.8M0 8.5V18.8M2.6 8.5V17.8" fill="none" stroke-width="1.1" opacity=".45"/><path d="M-3.4 6V15" fill="none" stroke="#fff" stroke-width="1.4" opacity=".45"/><rect x="-5.4" y="2.6" width="10.8" height="4.4" rx="1.6" fill="${k}" stroke-width="1.8"/><circle cx="0" cy="0" r="3.6" fill="${k}" stroke-width="1.8"/><circle cx="-1.1" cy="-1.1" r="1.1" fill="#fff" stroke="none" opacity=".8"/></g>`;
  // three-comma tomoe crest, radius ~12 at scale 1
  const tomoe = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">` + [0, 120, 240].map(a =>
    `<path transform="rotate(${a})" d="M0 -12A6 6 0 0 1 0 0A6 6 0 0 0 -10.4 6A12 12 0 0 1 0 -12Z" fill="${c}" stroke-width="${r(1.4 / s)}"/>`).join('') + '</g>';
  // smooth open curve through points (quadratic through midpoints)
  const sm = (pts, cmd = 'M') => {
    let d = cmd + P(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, y] = pts[i], [nx, ny] = pts[i + 1];
      const e = i === pts.length - 2 ? [nx, ny] : [(x + nx) / 2, (y + ny) / 2];
      d += `Q${P(x, y)} ${P(e[0], e[1])}`;
    }
    if (pts.length === 2) d += 'L' + P(pts[1][0], pts[1][1]);
    return d;
  };

  /* ---------------- KITSUNE MASK ---------------- */
  const ch_mask = wrap(`
${tp('M83 50C92 54 92 62 87 68', 2.4, '#ff4b5c')}
${tassel(87, 69, '#ff4b5c', '#ffcf3d', 1, -6)}
<path d="M26 10C22 20 20 30 21 40C16 46 13 52 14 58C24 66 36 76 44 84Q50 89 56 84C64 76 76 66 86 58C87 52 84 46 79 40C80 30 78 20 74 10C68 16 63 22 60 28Q50 25 40 28C37 22 32 16 26 10Z" fill="#fffdf7"/>
<path d="M79 40C80 47 84 53 86 58C76 66 64 76 56 84Q62 72 72 62C78 56 80 48 79 40Z" fill="#b9b0dd" stroke="none" opacity=".4"/>
<path d="M26 22C25 28 25 33 26 38" fill="none" stroke="#e3ddf3" stroke-width="2" opacity="0"/>
<path d="M27.5 16C25.5 23 24.5 29 25.5 35L36 30C33.5 25 30.5 20 27.5 16Z" fill="#ff4b5c" stroke-width="1.8"/>
<path d="M72.5 16C74.5 23 75.5 29 74.5 35L64 30C66.5 25 69.5 20 72.5 16Z" fill="#ff4b5c" stroke-width="1.8"/>
<path d="M21 41Q34 33 46 45Q36 39 21 41Z" fill="#ff4b5c" stroke-width="1.6"/>
<path d="M79 41Q66 33 54 45Q64 39 79 41Z" fill="#ff4b5c" stroke-width="1.6"/>
<path d="M25 45Q35 44 43 51Q33 54 25 45Z" fill="#2b2340" stroke-width="1.6"/>
<path d="M75 45Q65 44 57 51Q67 54 75 45Z" fill="#2b2340" stroke-width="1.6"/>
<path d="M50 29C54 34 55 38 50 43C45 38 46 34 50 29Z" fill="#ff4b5c" stroke-width="1.6"/>
<circle cx="41.5" cy="34.5" r="1.9" fill="#ff4b5c" stroke-width="1.2"/><circle cx="58.5" cy="34.5" r="1.9" fill="#ff4b5c" stroke-width="1.2"/>
<path d="M50 32.5V39" fill="none" stroke="#ffcf3d" stroke-width="1.6"/>
<path d="M19 57L28 59.5M20.5 62.5L29 63M23 67.5L30 66" fill="none" stroke="#ff4b5c" stroke-width="2.2"/>
<path d="M81 57L72 59.5M79.5 62.5L71 63M77 67.5L70 66" fill="none" stroke="#ff4b5c" stroke-width="2.2"/>
<ellipse cx="50" cy="76.5" rx="5" ry="3.4" fill="#2b2340" stroke-width="1.6"/>
<ellipse cx="48.6" cy="75.6" rx="1.5" ry=".9" fill="#fff" stroke="none" opacity=".85"/>
<path d="M44 81Q47 84.5 50 81Q53 84.5 56 81" fill="none" stroke-width="1.7"/>
<path d="M30 20Q28 26 28.5 31" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/>
${sp(88, 15, 5, '#ffd34d')}${sp(10, 24, 3.6, '#fff')}${sp(12, 82, 3.2, '#fff')}
`, 'rotate(-8 50 50)');

  /* ---------------- MATCHA ---------------- */
  const glaze = (() => {
    const N = 18, top = [], bot = [], dr = [6, 10.5, 7, 6.5, 11, 7.5];
    for (let i = 0; i <= N; i++) {
      const t = i / N * Math.PI;
      const x = 46 + 34 * Math.cos(t), y = 52 + 10 * Math.sin(t);
      top.push([x, y]);
      const inX = 46 + 33 * Math.cos(t);
      bot.push([inX, y + (i === 0 || i === N ? 4 : dr[i % 6])]);
    }
    return `<path d="${sm(top)}${sm(bot.reverse(), 'L')}Z" fill="#fff1d9" stroke-width="1.6"/>`;
  })();
  const ch_tea = wrap(`
${tp('M27 37C21 31 33 25 27 17', 2.6, '#fff')}${tp('M41 34C37 29 45 25 41 19', 2.4, '#fff')}
<rect x="32" y="81" width="28" height="8.5" rx="3" fill="#d8673f"/>
<path d="M12 52C13 74 28 86 46 86C64 86 79 74 80 52Z" fill="#f08a5d"/>
${glaze}
<path d="M80 52C79 74 64 86 46 86C60 80 70 70 73 56Z" fill="#b8472a" stroke="none" opacity=".3"/>
<path d="M16 64C19 72 24 78 31 82" fill="none" stroke="#fff" stroke-width="2.4" opacity=".55"/>
<path d="M12 52C13 74 28 86 46 86C64 86 79 74 80 52" fill="none"/>
<ellipse cx="46" cy="52" rx="34" ry="10" fill="#ffb48a"/>
<ellipse cx="46" cy="53" rx="29" ry="7" fill="#74c23f" stroke-width="2"/>
<ellipse cx="43" cy="52.2" rx="22" ry="4.6" fill="#a9e35f" stroke="none"/>
<ellipse cx="38" cy="51.4" rx="11" ry="2.2" fill="#d4f59a" stroke="none"/>
<circle cx="30" cy="54" r="1.5" fill="#e9fbc6" stroke="none"/><circle cx="36" cy="55.5" r="1" fill="#e9fbc6" stroke="none"/><circle cx="24" cy="52" r="1.1" fill="#e9fbc6" stroke="none"/><circle cx="48" cy="55.6" r="1.2" fill="#e9fbc6" stroke="none"/>
<g transform="translate(61 54) rotate(30)">
<rect x="-3.6" y="-41" width="7.2" height="27" rx="3" fill="#f2d48c"/>
<path d="M-3.6 -30H3.6" fill="none" stroke-width="1.5"/>
<path d="M-1.3 -38V-33M-1.3 -27V-18" fill="none" stroke="#fff6d6" stroke-width="1.6"/>
<path d="M-3.6 -16C-12 -11 -13.5 -4 -10.5 1.5L10.5 1.5C13.5 -4 12 -11 3.6 -16Z" fill="#f6e2a8"/>
<path d="M-6.5 -11.5Q-8.5 -5 -7 1M-2.4 -14Q-3.4 -6 -2.4 1M2.4 -14Q3.4 -6 2.4 1M6.5 -11.5Q8.5 -5 7 1" fill="none" stroke-width="1.2" opacity=".5"/>
<ellipse cx="0" cy="-9" rx="3.2" ry="4.6" fill="#e3bd6c" stroke-width="1.4"/>
</g>
<path d="M53 56.5Q54 53 57.5 54Q59.5 51.5 62.5 53.5Q66 52 68 55.5Q61 58.5 53 56.5Z" fill="#c4ee7c" stroke-width="1.5"/>
<circle cx="59" cy="54.6" r="1" fill="#f3ffd9" stroke="none"/>
${sp(12, 30, 4, '#fff')}${sp(90, 36, 3.4, '#ffd34d')}${sp(88, 84, 3.6, '#fff')}
`, 'rotate(-4 50 50)');

  /* ---------------- LANTERN ---------------- */
  const LW = y => 14 + 18.5 * Math.sqrt(Math.max(0, 1 - ((y - 52) / 30.5) ** 2));
  const lanternBody = (() => {
    const L = [], R = [];
    for (let y = 22; y <= 82; y += 2) { R.push([50 + LW(y), y]); L.push([50 - LW(y), y]); }
    return 'M' + R.map(p => P(p[0], p[1])).join('L') + 'L' + L.reverse().map(p => P(p[0], p[1])).join('L') + 'Z';
  })();
  let ribs = '';
  for (let y = 28; y <= 77; y += 6.1) ribs += `M${P(50 - LW(y) + 0.4, y)}Q50 ${r(y + 3.2)} ${P(50 + LW(y) - 0.4, y)}`;
  let rays = '';
  for (const a of [-150, -120, -60, -30, 0, 30, 150, 180]) {
    const c = Math.cos(a * D), s = Math.sin(a * D), rr = a === 0 || a === 180 ? 36.5 : 37;
    rays += tl(50 + rr * c, 51 + rr * s, 50 + (rr + 6.5) * c, 51 + (rr + 6.5) * s, 3.2, '#ffd34d');
  }
  const ch_lantern = wrap(`
<circle cx="50" cy="51" r="41" fill="#ffe36b" opacity=".5" stroke="none"/>
<circle cx="50" cy="51" r="34" fill="#fff3a8" opacity=".55" stroke="none"/>
${rays}
<circle cx="50" cy="8" r="4.2" fill="none" stroke-width="5.6"/><circle cx="50" cy="8" r="4.2" fill="none" stroke="#ffcf3d" stroke-width="2.6"/>
<path d="${lanternBody}" fill="#ff4b4b"/>
<ellipse cx="44" cy="45" rx="17" ry="20" fill="#ff8a5c" stroke="none" opacity=".55"/>
<path d="${lanternBody}" fill="none"/>
<path d="M82 46C83 60 80 72 66 80C74 70 77 58 76 46Z" fill="#c42a3a" stroke="none" opacity=".35"/>
<path d="${ribs}" fill="none" stroke-width="1.3" opacity=".4"/>
<path d="M24 40C22 48 22 58 25 66" fill="none" stroke="#fff" stroke-width="2.6" opacity=".55"/>
<circle cx="50" cy="52" r="11.5" fill="#fff4d6" stroke-width="2"/>
${tomoe(50, 52, 0.72, '#ff4b4b')}
<rect x="34" y="13" width="32" height="10.5" rx="2.6" fill="#3a3152"/>
<path d="M37 16.5H56" fill="none" stroke="#7f73a8" stroke-width="1.6"/>
<rect x="36" y="80.5" width="28" height="8.5" rx="2.6" fill="#3a3152"/>
<path d="M39 83.5H54" fill="none" stroke="#7f73a8" stroke-width="1.6"/>
${sp(14, 14, 4, '#fff')}${sp(88, 86, 3.6, '#fff')}
`, 'rotate(-7 50 8)');

  /* ---------------- FOLDING FAN ---------------- */
  const F = { x: 50, y: 82, R: 56, r0: 18, rw: 33, a1: -140, a2: -40, n: 12 };
  const fp = (a, rr) => [F.x + rr * Math.cos(a * D), F.y + rr * Math.sin(a * D)];
  const fP = (a, rr) => P(...fp(a, rr));
  const fanA = i => F.a1 + i * (F.a2 - F.a1) / F.n;
  let paper = `M${fP(F.a1, F.r0)}`;
  for (let i = 0; i <= F.n; i++) paper += `L${fP(fanA(i), F.R)}`;
  paper += `L${fP(F.a2, F.r0)}A${F.r0} ${F.r0} 0 0 0 ${fP(F.a1, F.r0)}Z`;
  const scallop = (rr, k, close) => {
    let d = close ? `M${fP(F.a1, F.r0 + 0.5)}L${fP(F.a1, rr)}` : `M${fP(F.a1, rr)}`;
    for (let i = 0; i < k; i++) {
      const b = F.a1 + (i + 1) * (F.a2 - F.a1) / k;
      const ch = 2 * rr * Math.sin(((F.a2 - F.a1) / k / 2) * D);
      d += `A${r(ch / 2 * 1.05)} ${r(ch / 2 * 1.05)} 0 0 1 ${fP(b, rr)}`;
    }
    if (close) d += `L${fP(F.a2, F.r0 + 0.5)}A${F.r0 + 0.5} ${F.r0 + 0.5} 0 0 0 ${fP(F.a1, F.r0 + 0.5)}Z`;
    return d;
  };
  let pleatShade = '', pleatLines = '';
  for (let i = 0; i < F.n; i++) {
    const a = fanA(i), b = fanA(i + 1);
    if (i % 2) pleatShade += `M${fP(a, F.r0)}L${fP(a, F.R)}L${fP(b, F.R)}L${fP(b, F.r0)}Z`;
    if (i) pleatLines += `M${fP(a, F.r0)}L${fP(a, F.R)}`;
  }
  const sun = fp(-90, 35.5);
  let sunRays = '';
  for (let a = -165; a <= -15; a += 25) {
    const [x1, y1] = [sun[0] + 12 * Math.cos((a - 5) * D), sun[1] + 12 * Math.sin((a - 5) * D)];
    const [x2, y2] = [sun[0] + 12 * Math.cos((a + 5) * D), sun[1] + 12 * Math.sin((a + 5) * D)];
    const L = a < -150 || a > -30 ? 15 : 17;
    const [x3, y3] = [sun[0] + L * Math.cos(a * D), sun[1] + L * Math.sin(a * D)];
    sunRays += `M${P(x1, y1)}L${P(x3, y3)}L${P(x2, y2)}Z`;
  }
  let sticks = '';
  for (let i = 0; i <= F.n; i += 2) sticks += `M${fP(fanA(i), 4)}L${fP(fanA(i), F.r0)}`;
  const ch_fan = wrap(`
${tp(`M${F.x} ${F.y}C58 88 66 88 70 82`, 2.2, '#ff4b5c')}
${tassel(71, 82, '#ff4b5c', '#ffcf3d', 0.72, -14)}
<path d="M${fP(F.a1 - 3, 3)}L${fP(F.a1, F.r0 + 1)}A${F.r0 + 1} ${F.r0 + 1} 0 0 1 ${fP(F.a2, F.r0 + 1)}L${fP(F.a2 + 3, 3)}A5 5 0 0 1 ${fP(F.a1 - 3, 3)}Z" fill="#d9643a"/>
<path d="${sticks}" fill="none" stroke-width="1.4" opacity=".55"/>
<path d="${paper}" fill="#fff2c4"/>
<path d="${sunRays}" fill="#ffc46b" stroke="none" opacity=".75"/>
<circle cx="${r(sun[0])}" cy="${r(sun[1])}" r="10" fill="#ff4b3e" stroke-width="2.2"/>
<circle cx="${r(sun[0] - 3.5)}" cy="${r(sun[1] - 4)}" r="2.6" fill="#fff" stroke="none" opacity=".5"/>
<path d="${scallop(F.rw, 9, true)}" fill="#3d8bff" stroke-width="2"/>
<path d="${scallop(F.rw - 5.5, 8, false)}" fill="none" stroke="#9fdcff" stroke-width="1.8"/>
<path d="${scallop(F.rw - 10.5, 6, false)}" fill="none" stroke="#9fdcff" stroke-width="1.6"/>
<path d="${pleatShade}" fill="#2b2340" stroke="none" opacity=".07"/>
<path d="${pleatLines}" fill="none" stroke-width="1.1" opacity=".3"/>
<path d="${paper}" fill="none"/>
${tl(...fp(F.a1, 3), ...fp(F.a1, F.R - 1), 2.4, '#d9643a')}${tl(...fp(F.a2, 3), ...fp(F.a2, F.R - 1), 2.4, '#d9643a')}
<circle cx="${F.x}" cy="${F.y}" r="3.8" fill="#ffcf3d" stroke-width="2"/>
${sp(14, 18, 4.6, '#ffd34d')}${sp(88, 14, 3.6, '#fff')}${sp(10, 64, 3, '#fff')}
`, `rotate(-8 50 60)`);

  /* ---------------- ROCKET FIREWORK ---------------- */
  let bRays = '', bOver = '', bDots = '';
  const BX = 75, BY = 22, bc = ['#ff6fb0', '#5cc8ff', '#7ee06a', '#ffcf3d', '#a07cff'];
  [-90, -40, 0, 45, 90, -165].forEach((a, i) => {
    const c = Math.cos(a * D), s = Math.sin(a * D), col = bc[i % bc.length];
    const seg = `M${P(BX + 12.5 * c, BY + 12.5 * s)}L${P(BX + 17 * c, BY + 17 * s)}`;
    bRays += seg; bOver += `<path d="${seg}" fill="none" stroke="${col}" stroke-width="2.6"/>`;
  });
  [-65, -18, 22, 68].forEach((a, i) => {
    bDots += `<circle cx="${r(BX + 15 * Math.cos(a * D))}" cy="${r(BY + 15 * Math.sin(a * D))}" r="1.8" fill="${bc[(i + 2) % 5]}" stroke-width="1.4"/>`;
  });
  const ch_rocket = wrap(`
<circle cx="${BX}" cy="${BY}" r="11" fill="#fff3a8" opacity=".7" stroke="none"/>
<path d="${bRays}" fill="none" stroke-width="5.4"/>${bOver}${bDots}
${star5(BX, BY, 10, '#ffcf3d', 8, 2.2)}
<circle cx="${BX - 2.5}" cy="${BY - 2}" r="1.6" fill="#fff" stroke="none" opacity=".85"/>
<g transform="translate(43 57) rotate(38)">
${tl(-11, -6, -11, 46, 3.2, '#e8c27a')}
<path d="M2 15Q7 19 3 23Q0 27 5 30" fill="none" stroke-width="2.2"/>
<circle cx="5" cy="31.5" r="5.5" fill="#ffe36b" opacity=".7" stroke="none"/>
${star5(5, 31.5, 5.2, '#ff8a3d', 15, 1.6)}
<circle cx="5" cy="31.5" r="1.8" fill="#fff4a8" stroke="none"/>
<rect x="-9.5" y="-22" width="19" height="35" rx="2.5" fill="#5b7cff"/>
<rect x="3" y="-21" width="5.6" height="33" fill="#2b2340" stroke="none" opacity=".16"/>
<rect x="-9.5" y="-14.5" width="19" height="5" fill="#ffd34d" stroke-width="1.8"/>
<rect x="-9.5" y="3" width="19" height="5" fill="#ff6fb0" stroke-width="1.8"/>
${star5(0, -3, 4.2, '#fff', 0, 1.4)}
<path d="M-5.6 -20.5V-16M-5.6 -7.5V1M-5.6 9.5V11.5" fill="none" stroke="#fff" stroke-width="2.2" opacity=".5"/>
<path d="M-10.5 -21Q-6 -33 0 -41Q6 -33 10.5 -21Z" fill="#ff4b5c"/>
<path d="M-5.5 -24Q-3.5 -31 -0.5 -36" fill="none" stroke="#fff" stroke-width="2" opacity=".55"/>
<rect x="-10.5" y="11.5" width="21" height="4.5" rx="1.6" fill="#ffd34d" stroke-width="2"/>
</g>
${sp(14, 14, 4.4, '#ffd34d')}${sp(40, 12, 3, '#fff')}${sp(88, 50, 3.6, '#fff')}${sp(62, 86, 3.4, '#ffd34d')}
`);

  /* ---------------- TAIYAKI ---------------- */
  let scales = '';
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      const x = 46 + col * 7 + (row % 2 ? 3.5 : 0), y = 42 + row * 8;
      if (x > 74 || (x < 52 && y < 46)) continue;
      scales += `M${P(x - 3.2, y)}Q${P(x, y + 4)} ${P(x + 3.2, y)}`;
    }
  }
  const bite = 'M42 27A7 7 0 0 1 32 37A7 7 0 0 1 23 45A7 7 0 0 1 13 53';
  const ch_taiyaki = wrap(`
${tp('M58 20C53 15 62 11 57 5', 2.4, '#fff')}${tp('M70 22C66 18 73 14 69 9', 2.2, '#fff')}
<path d="M90 50C88 36 76 26 60 25C54 24 48 25 42 27A7 7 0 0 1 32 37A7 7 0 0 1 23 45A7 7 0 0 1 13 53L9 73Q18 67 25 60C32 70 46 77 62 76C78 75 89 64 90 50Z" fill="#f3a43c"/>
<path d="M88 58C84 68 74 75 62 76C46 77 32 70 25 60C36 66 50 70 64 69C74 68 82 64 88 58Z" fill="#b8601a" stroke="none" opacity=".3"/>
<path d="M52 29.5Q66 26.5 78 32.5" fill="none" stroke="#ffe3a0" stroke-width="3" opacity=".9"/>
<path d="${bite}C18 62 34 63 43 53C49 46 52 37 49 26.3Z" fill="#fff0b8" stroke-width="1.6"/>
<path d="M42.5 31C41 37 36 41 31.5 45C27 49 22 53 19 55C24 59.5 34 59 40 51.5C45 45 47 38 42.5 31Z" fill="#b8344d" stroke-width="1.6"/>
<ellipse cx="36" cy="47" rx="2" ry="1.4" fill="#e05a72" stroke="none"/><ellipse cx="29" cy="53" rx="1.8" ry="1.3" fill="#e05a72" stroke="none"/><ellipse cx="40.5" cy="40" rx="1.6" ry="1.2" fill="#e05a72" stroke="none"/>
<path d="M38 50Q35.5 53 32 54.5" fill="none" stroke="#ff9db0" stroke-width="1.6" opacity=".8"/>
<path d="${bite}" fill="none" stroke-width="2.6"/>
<path d="${scales}" fill="none" stroke="#c46a1c" stroke-width="1.5" opacity=".75"/>
<path d="M74 35Q68 50 74 65" fill="none" stroke="#c46a1c" stroke-width="2" opacity=".8"/>
<path d="M14 66L22 62M12 70L22 64.5" fill="none" stroke="#c46a1c" stroke-width="1.5" opacity=".8"/>
<path d="M40 73Q46 76 54 76.5" fill="none" stroke="#c46a1c" stroke-width="1.5" opacity=".7"/>
<circle cx="80.5" cy="43.5" r="5.4" fill="#ffd27a" stroke-width="1.8"/>
<circle cx="81" cy="43.5" r="3.2" fill="#2b2340" stroke="none"/><circle cx="80" cy="42.4" r="1.2" fill="#fff" stroke="none"/>
<path d="M89.5 53Q86 55 86.5 58" fill="none" stroke-width="1.6"/>
<ellipse cx="80" cy="56" rx="3.4" ry="2" fill="#ff7a5a" stroke="none" opacity=".5"/>
${sp(14, 22, 4, '#fff')}${sp(90, 80, 4.4, '#ffd34d')}${sp(46, 88, 3, '#fff')}
`, 'rotate(-9 50 50)');

  /* ---------------- GONG ---------------- */
  const arc = (cx, cy, rr, a, b) => `M${P(cx + rr * Math.cos(a * D), cy + rr * Math.sin(a * D))}A${rr} ${rr} 0 0 1 ${P(cx + rr * Math.cos(b * D), cy + rr * Math.sin(b * D))}`;
  const GX = 50, GY = 54;
  const ch_gong = wrap(`
<rect x="5" y="85" width="19" height="7" rx="2.5" fill="#b4602a"/><rect x="76" y="85" width="19" height="7" rx="2.5" fill="#b4602a"/>
<rect x="10.5" y="18" width="8.5" height="70" rx="2" fill="#e8954a"/><rect x="81" y="18" width="8.5" height="70" rx="2" fill="#e8954a"/>
<path d="M13 24V82M83.5 24V82" fill="none" stroke="#ffc58a" stroke-width="1.8"/>
<path d="M4 9Q10 15.5 18 15L82 15Q90 15.5 96 9L94.5 23H5.5Z" fill="#e0523f"/>
<path d="M12 18.5H88" fill="none" stroke="#ff9a7a" stroke-width="1.8"/>
<path d="M37 23L41.5 33.5M63 23L58.5 33.5" fill="none" stroke-width="2"/>
<path d="${arc(GX, GY, 27, -55, -20)}${arc(GX, GY, 31.5, -50, -25)}${arc(GX, GY, 27, 200, 235)}${arc(GX, GY, 31.5, 205, 230)}" fill="none" stroke-width="2.4"/>
<path d="${arc(GX, GY, 27, 10, 30)}${arc(GX, GY, 27, 150, 170)}" fill="none" stroke-width="2.2" opacity=".7"/>
<circle cx="${GX}" cy="${GY}" r="22" fill="#f0b040"/>
<path d="M${GX + 22} ${GY}A22 22 0 0 1 ${GX - 15.6} ${GY + 15.6}A24 24 0 0 0 ${GX + 18} ${GY - 6}Z" fill="#b8701a" stroke="none" opacity=".35"/>
<circle cx="${GX}" cy="${GY}" r="16.5" fill="none" stroke="#c4831c" stroke-width="1.8"/>
<path d="${arc(GX, GY, 19, 195, 250)}" fill="none" stroke="#fff6c0" stroke-width="3" opacity=".9"/>
<circle cx="${GX}" cy="${GY}" r="8" fill="#ffd66b" stroke-width="2"/>
<circle cx="${GX - 2.5}" cy="${GY - 2.5}" r="2.4" fill="#fff" stroke="none" opacity=".8"/>
${tl(93, 92, 72, 72, 3.6, '#e8c27a')}
<g transform="rotate(-45 69.5 69.5)"><ellipse cx="69.5" cy="69.5" rx="8" ry="6.6" fill="#ff5a6a"/><path d="M69.5 63V76" fill="none" stroke="#fff" stroke-width="2" opacity=".75"/><path d="M65 66Q66.5 64 68.5 63.6" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/></g>
${sp(30, 86, 3.4, '#ffd34d')}${sp(66, 88, 2.8, '#fff')}
`);

  /* ---------------- SHRINE BELL ---------------- */
  const bz = (p, t) => {
    const u = 1 - t;
    return [0, 1].map(k => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]);
  };
  const bzd = (p, t) => {
    const u = 1 - t;
    return [0, 1].map(k => 3 * u * u * (p[1][k] - p[0][k]) + 6 * u * t * (p[2][k] - p[1][k]) + 3 * t * t * (p[3][k] - p[2][k]));
  };
  const rope = (p, W, n, seg) => {
    const Lp = [], Rp = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, [x, y] = bz(p, t), [dx, dy] = bzd(p, t), m = Math.hypot(dx, dy);
      const nx = -dy / m, ny = dx / m;
      Lp.push([x + nx * W / 2, y + ny * W / 2]); Rp.push([x - nx * W / 2, y - ny * W / 2]);
    }
    const d = `M${P(...p[0])}C${P(...p[1])} ${P(...p[2])} ${P(...p[3])}`;
    let red = '', lines = '';
    const c = k => Math.max(0, Math.min(n, k));
    for (let k = -seg; k < n; k += 2 * seg) {
      const a = c(k), b = c(k + seg), ra = c(k + seg), rb = c(k + 2 * seg);
      red += `M${P(...Lp[a])}L${P(...Lp[b])}L${P(...Rp[rb])}L${P(...Rp[ra])}Z`;
    }
    for (let k = 0; k < n - seg; k += seg) lines += `M${P(...Lp[k])}L${P(...Rp[c(k + seg)])}`;
    const [ex, ey] = bz(p, 1), [tx, ty] = bzd(p, 1), ang = Math.atan2(ty, tx) / D - 90;
    return `<path d="${d}" fill="none" stroke-width="${W + 2.8}"/><path d="${d}" fill="none" stroke="#fffaf0" stroke-width="${W}"/>` +
      `<path d="${red}" fill="#ff4b5c" stroke="none"/><path d="${lines}" fill="none" stroke-width="1" opacity=".3"/>` +
      `<path d="M${P(...Lp[0])}L${P(...Lp[n])}" fill="none" stroke="#fff" stroke-width="0" opacity="0"/>` +
      `<g transform="translate(${r(ex)} ${r(ey)}) rotate(${r(ang)})"><path d="M-6 0L-7.5 11Q0 14 7.5 11L6 0Z" fill="#ff4b5c" stroke-width="2"/><path d="M-3.5 3V11.5M0 3V12.5M3.5 3V11.5" fill="none" stroke-width="1.1" opacity=".45"/><rect x="-7.2" y="-4" width="14.4" height="5.5" rx="2" fill="#ffcf3d" stroke-width="2"/></g>`;
  };
  const BXc = 50, BYc = 37;
  const ch_bell = wrap(`
<path d="${arc(BXc, BYc, 28, -40, -5)}${arc(BXc, BYc, 33, -35, -10)}" fill="none" stroke-width="2.4"/>
<path d="${arc(BXc, BYc, 28, 185, 220)}" fill="none" stroke-width="2.4"/>
<circle cx="50" cy="11" r="4.2" fill="none" stroke-width="5.6"/><circle cx="50" cy="11" r="4.2" fill="none" stroke="#ffcf3d" stroke-width="2.6"/>
${rope([[50, 60], [50, 72], [62, 76], [59, 88]], 11, 26, 2)}
<rect x="43.5" y="56.5" width="13" height="7" rx="2.4" fill="#ffcf3d" stroke-width="2.2"/>
<circle cx="${BXc}" cy="${BYc}" r="22" fill="#ffc93d"/>
<path d="M${BXc + 22} ${BYc}A22 22 0 0 1 ${BXc - 13} ${BYc + 17.7}A23 23 0 0 0 ${BXc + 19} ${BYc - 6}Z" fill="#e08a1c" stroke="none" opacity=".4"/>
<ellipse cx="41" cy="27.5" rx="7.5" ry="4.6" transform="rotate(-32 41 27.5)" fill="#fff4b0" stroke="none" opacity=".9"/>
<path d="M28.2 34.5Q50 43.5 71.8 34.5L71.9 39.8Q50 48.8 28.1 39.8Z" fill="#f2a92c" stroke-width="1.8"/>
<path d="M33 38.5Q42 42 48 42.6" fill="none" stroke="#fff4b0" stroke-width="1.4" opacity=".8"/>
<path d="M38.5 51Q50 55.5 61.5 51" fill="none" stroke-width="4.2"/>
<circle cx="38" cy="50.6" r="2.8" fill="#2b2340" stroke="none"/><circle cx="62" cy="50.6" r="2.8" fill="#2b2340" stroke="none"/>
<rect x="45" y="13.5" width="10" height="5" rx="2" fill="#e8a52a" stroke-width="2"/>
${sp(14, 18, 4.4, '#ffd34d')}${sp(86, 66, 3.8, '#fff')}${sp(24, 74, 3.2, '#fff')}${sp(88, 16, 3, '#fff')}
`, 'rotate(-9 50 11)');

  Object.assign(window.ICON_ART, { ch_mask, ch_tea, ch_lantern, ch_fan, ch_rocket, ch_taiyaki, ch_gong, ch_bell });
})();
