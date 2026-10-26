/* Kizuna Clash: charm card icons, set 3 (flat SVG, 100x100 box). */
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
  // 5-petal flower: notched sakura or round ume
  const flower = (cx, cy, R, f, rot = 0, sw = 1.8, notch = true, mid = '#ffcf3d') => {
    const Q = (a, rr) => r(cx + rr * Math.cos(a * D)) + ' ' + r(cy + rr * Math.sin(a * D));
    const rv = R * 0.36, pr = r(R * 0.42);
    let d = '';
    for (let i = 0; i < 5; i++) {
      const a = rot - 90 + i * 72;
      d += (i ? 'L' : 'M') + Q(a - 36, rv);
      d += notch
        ? `C${Q(a - 46, R * 0.9)} ${Q(a - 26, R * 1.12)} ${Q(a - 9, R)}L${Q(a, R * 0.8)}L${Q(a + 9, R)}C${Q(a + 26, R * 1.12)} ${Q(a + 46, R * 0.9)} ${Q(a + 36, rv)}`
        : `A${pr} ${pr} 0 1 1 ${Q(a + 36, rv)}`;
    }
    return `<path d="${d}Z" fill="${f}" stroke-width="${sw}"/><circle cx="${r(cx)}" cy="${r(cy)}" r="${r(R * 0.26)}" fill="${mid}" stroke-width="${r(sw * 0.7)}"/>`;
  };
  // single falling petal
  const petal = (x, y, s, rot, f = '#ffb3cf') =>
    `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 -5C4 -4 5 2 0 5C-5 2 -4 -4 0 -5Z" fill="${f}" stroke-width="${r(1.5 / s)}"/>`;
  // water drop
  const drop = (x, y, s = 1, f = '#5cbcff') =>
    `<path d="M${r(x)} ${r(y - 7 * s)}C${r(x + 2 * s)} ${r(y - 3 * s)} ${r(x + 4.5 * s)} ${r(y - s)} ${r(x + 4.5 * s)} ${r(y + 2 * s)}A${r(4.5 * s)} ${r(4.5 * s)} 0 0 1 ${r(x - 4.5 * s)} ${r(y + 2 * s)}C${r(x - 4.5 * s)} ${r(y - s)} ${r(x - 2 * s)} ${r(y - 3 * s)} ${r(x)} ${r(y - 7 * s)}Z" fill="${f}" stroke-width="1.8"/><ellipse cx="${r(x - 1.6 * s)}" cy="${r(y + 1.2 * s)}" rx="${r(1.1 * s)}" ry="${r(1.6 * s)}" fill="#fff" stroke="none" opacity=".85"/>`;
  // smooth open curve through points
  const sm = (pts, cmd = 'M') => {
    let d = cmd + P(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, y] = pts[i], [nx, ny] = pts[i + 1];
      const e = i === pts.length - 2 ? [nx, ny] : [(x + nx) / 2, (y + ny) / 2];
      d += `Q${P(x, y)} ${P(e[0], e[1])}`;
    }
    return d;
  };
  const face = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
<ellipse cx="-4.6" cy="-1" rx="1.7" ry="2.2" fill="#2b2340" stroke="none"/><ellipse cx="4.6" cy="-1" rx="1.7" ry="2.2" fill="#2b2340" stroke="none"/>
<circle cx="-4.1" cy="-1.9" r=".7" fill="#fff" stroke="none"/><circle cx="5.1" cy="-1.9" r=".7" fill="#fff" stroke="none"/>
<path d="M-1.8 2Q0 3.8 1.8 2" fill="none" stroke-width="1.4"/>
<ellipse cx="-8" cy="2.4" rx="2.2" ry="1.3" fill="#ff7a9a" stroke="none" opacity=".55"/><ellipse cx="8" cy="2.4" rx="2.2" ry="1.3" fill="#ff7a9a" stroke="none" opacity=".55"/></g>`;

  /* ---------------- CALTROPS ---------------- */
  const caltrop = (cx, cy, s, rot) => {
    const spike = (ang, len, w) => {
      const a = ang * D, dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
      const T = [cx + dx * len * s, cy + dy * len * s], B1 = [cx + px * w * s, cy + py * w * s], B2 = [cx - px * w * s, cy - py * w * s];
      return `<path d="M${P(...B1)}L${P(...T)}L${P(cx, cy)}Z" fill="#c3d0f2" stroke="none"/><path d="M${P(cx, cy)}L${P(...T)}L${P(...B2)}Z" fill="#7484c6" stroke="none"/><path d="M${P(...B1)}L${P(...T)}L${P(...B2)}" fill="none" stroke-width="2.2"/>`;
    };
    return spike(-90 + rot, 17, 4.6) + spike(150 + rot, 15, 4.6) + spike(30 + rot, 15, 4.6) +
      `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(4.8 * s)}" fill="#95a5e0" stroke-width="2.2"/><circle cx="${r(cx - 1.5 * s)}" cy="${r(cy - 1.5 * s)}" r="${r(1.5 * s)}" fill="#fff" stroke="none" opacity=".75"/>` +
      spike(92 + rot, 9.5, 4.2);
  };
  const jag = (x, y, R, n, f, rot, sw = 2.2) => {
    const p = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (rot - 90 + i * 180 / n) * D, rr = i % 2 ? R * 0.58 : R;
      p.push(P(x + rr * Math.cos(a), y + rr * Math.sin(a)));
    }
    return `<polygon points="${p.join(' ')}" fill="${f}" stroke-width="${sw}"/>`;
  };
  const ch_spikes = wrap(`
${caltrop(34, 52, 1, -8)}${caltrop(62, 54, 0.95, 14)}
${caltrop(20, 76, 1, 6)}${caltrop(50, 77, 1.1, -4)}${caltrop(80, 76, 0.95, 20)}
<circle cx="76" cy="22" r="17" fill="#fff3a8" opacity=".6" stroke="none"/>
${jag(76, 22, 15, 8, '#ffd23d', 8)}
${jag(76, 22, 9.5, 8, '#ff9a3d', 30, 1.6)}
<rect x="73.8" y="13" width="4.4" height="10.5" rx="2.2" fill="#ff3f4e" stroke-width="1.6"/>
<circle cx="76" cy="28.3" r="2.5" fill="#ff3f4e" stroke-width="1.6"/>
<path d="M56 16L61 19M58 8L62 13M92 34L88 33" fill="none" stroke-width="2.2"/>
${sp(34, 30, 3.8, '#fff')}${sp(12, 54, 3.2, '#fff')}${sp(90, 56, 3.4, '#ffd34d')}
`);

  /* ---------------- YUKATA ---------------- */
  const ch_yukata = wrap(`
<rect x="10" y="62" width="80" height="22" rx="5" fill="#2a5ccc"/>
<path d="M13 75.5H87M13 79.5H87" fill="none" stroke="#7fb0ff" stroke-width="1.6"/>
<rect x="10" y="20" width="80" height="56" rx="5" fill="#3d7cf0"/>
<path d="M90 26V70Q90 76 84 76H62Q80 70 84 52Q86 38 90 26Z" fill="#1d3f99" stroke="none" opacity=".25"/>
<path d="M15 26Q15 23 19 23H44" fill="none" stroke="#fff" stroke-width="2.2" opacity=".45"/>
${flower(21, 32, 6.6, '#fff', 10, 1.6, false, '#ffd34d')}${flower(80, 31, 6.2, '#fff', -8, 1.6, false, '#ff9ab8')}
${flower(19, 66, 5.6, '#fff', 25, 1.6, false, '#ff9ab8')}${flower(79, 67, 6.4, '#fff', 4, 1.6, false, '#ffd34d')}
${flower(66, 38, 4, '#fff', 30, 1.4, false, '#ffd34d')}${flower(34, 69, 3.8, '#fff', 0, 1.4, false, '#ffd34d')}
<circle cx="31" cy="27" r="1.4" fill="#fff" stroke="none"/><circle cx="72" cy="24.5" r="1.3" fill="#fff" stroke="none"/><circle cx="62" cy="70" r="1.4" fill="#fff" stroke="none"/><circle cx="27" cy="38" r="1.1" fill="#fff" stroke="none"/>
<path d="M58 20.5H67L49.5 52L44.5 47Z" fill="#23408f"/>
<path d="M62 20.5H65.5L48.8 50.5L46.8 48.5Z" fill="#fff" stroke="none" opacity=".9"/>
<path d="M33 20.5H42L57 47L51.5 52Z" fill="#23408f"/>
<path d="M37.6 20.5H41L55 46L53 48Z" fill="#fff" stroke="none" opacity=".9"/>
<g transform="rotate(-5 50 54)">
<path d="M14 45H80L86 45L83 52L86 60H14Z" fill="#ff4b5c"/>
<path d="M14 48.2H82M14 56.8H82" fill="none" stroke="#ffd34d" stroke-width="1.8"/>
<path d="M80 45L80 60" fill="none" stroke-width="1.6" opacity=".5"/>
<path d="M26 52.5L29 50L32 52.5L29 55ZM44 52.5L47 50L50 52.5L47 55ZM62 52.5L65 50L68 52.5L65 55Z" fill="#ffd34d" stroke-width="1.2"/>
<path d="M17 47.5Q30 46.6 44 47.2" fill="none" stroke="#fff" stroke-width="1.6" opacity=".45"/>
</g>
${sp(92, 12, 4.4, '#ffd34d')}${sp(8, 12, 3.4, '#fff')}${sp(50, 92, 3, '#fff')}
`, 'rotate(-4 50 50)');

  /* ---------------- DANGO ---------------- */
  const dir = [0.677, -0.735];
  const ball = (cx, cy, f, hi, sh, rot = 0) => `<circle cx="${cx}" cy="${cy}" r="14.6" fill="${f}"/>
<path d="M${r(cx + 14.6)} ${cy}A14.6 14.6 0 0 1 ${r(cx - 6)} ${r(cy + 13.3)}A15 15 0 0 0 ${r(cx + 12)} ${r(cy - 5)}Z" fill="${sh}" stroke="none" opacity=".45"/>
<ellipse cx="${r(cx - 6)}" cy="${r(cy - 7)}" rx="4.4" ry="2.8" transform="rotate(-35 ${r(cx - 6)} ${r(cy - 7)})" fill="${hi}" stroke="none"/>
${face(cx + 1.5, cy + 1.5, 1)}`;
  const ch_dango = wrap(`
${tl(16, 91, 85, 15, 3.6, '#e8c27a')}
${ball(35, 70, '#9be06e', '#d7f8b8', '#5aa83a')}
${ball(52.5, 51, '#fffaf0', '#ffffff', '#d8cbe0')}
${ball(70, 32, '#ffa3c4', '#ffd6e5', '#e3608f')}
${flower(22, 24, 12, '#ffbad3', 12, 2, true, '#ff6f9a')}
<path d="M22 19.5V22.5M17.6 23L20.4 24M26.4 23L23.6 24" fill="none" stroke="#e3608f" stroke-width="1.3"/>
${petal(42, 12, 1, 30)}${petal(88, 56, 0.9, -40)}${petal(12, 46, 0.8, 70)}
${sp(88, 86, 4, '#ffd34d')}${sp(60, 84, 3, '#fff')}${sp(92, 34, 3, '#fff')}
`);

  /* ---------------- BAMBOO FLUTE ---------------- */
  const note = (x, y, c, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})">
<path d="M3.8 0V-16.5" fill="none" stroke-width="2.4"/>
<path d="M3.8 -16.5C6.5 -12.5 11.5 -12 10.5 -5.5C9.5 -9 6.8 -10 3.8 -10.5Z" fill="${c}" stroke-width="1.8"/>
<ellipse cx="0" cy="0" rx="4.8" ry="3.7" transform="rotate(-22)" fill="${c}" stroke-width="2"/>
<ellipse cx="-1.4" cy="-1" rx="1.4" ry=".9" transform="rotate(-22)" fill="#fff" stroke="none" opacity=".7"/></g>`;
  const note2 = (x, y, c, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot})">
<path d="M3.8 0V-16M15.8 -3.5V-19.5" fill="none" stroke-width="2.4"/>
<path d="M2.6 -17.6L17 -21V-16.4L2.6 -13Z" fill="${c}" stroke-width="1.8"/>
<ellipse cx="0" cy="0" rx="4.8" ry="3.7" transform="rotate(-22)" fill="${c}" stroke-width="2"/>
<ellipse cx="12" cy="-3.5" rx="4.8" ry="3.7" transform="rotate(-22 12 -3.5)" fill="${c}" stroke-width="2"/></g>`;
  let holes = '';
  [-22, -7, 1, 9, 17, 25].forEach((x, i) => {
    holes += i ? `<ellipse cx="${x}" cy="-1" rx="2.4" ry="2" fill="#2b2340" stroke="none"/>` : `<ellipse cx="${x}" cy="-1" rx="3" ry="2.3" fill="#2b2340" stroke="none"/>`;
  });
  const ch_whistle = wrap(`
<g transform="translate(46 60) rotate(-28)">
<rect x="-42" y="-7.5" width="84" height="15" rx="7.5" fill="#7cc84e"/>
<path d="M-38 3.5H38" fill="none" stroke="#4f9a32" stroke-width="3.4" opacity=".45"/>
<path d="M-36 -4H36" fill="none" stroke="#d6f5a8" stroke-width="2.4" opacity=".9"/>
<rect x="-37.5" y="-7.5" width="6" height="15" fill="#ff4b5c" stroke-width="1.8"/>
<path d="M-35.5 -7V7.5M-33.5 -7V7.5" fill="none" stroke="#ffd34d" stroke-width="1"/>
<rect x="31" y="-7.5" width="5" height="15" fill="#ff4b5c" stroke-width="1.8"/>
<rect x="-15.5" y="-7.5" width="4" height="15" fill="#ff4b5c" stroke-width="1.6"/>
<path d="M-28 -7.3V7.3M28 -7.3V7.3" fill="none" stroke-width="1.4" opacity=".45"/>
${holes}
<ellipse cx="42" cy="0" rx="2.6" ry="7.5" fill="#a8e070" stroke-width="2"/>
<ellipse cx="42.2" cy="0" rx="1.2" ry="4" fill="#2b2340" stroke="none"/>
</g>
${note(70, 30, '#ff6fb0', 8)}${note2(30, 22, '#a07cff', -6)}${note(84, 58, '#ffcf3d', 14)}
<path d="M86 34Q90 30 88 24M80 40Q86 40 90 44" fill="none" stroke-width="2" opacity=".6"/>
${sp(52, 12, 4, '#ffd34d')}${sp(12, 46, 3.4, '#fff')}${sp(62, 86, 3.4, '#fff')}
`);

  /* ---------------- BIG TENGU KITE ---------------- */
  const tailP = [[51.5, 72], [44, 82], [30, 78], [16, 92]];
  const bz = (p, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]); };
  const bzd = (p, t) => { const u = 1 - t; return [0, 1].map(k => 3 * u * u * (p[1][k] - p[0][k]) + 6 * u * t * (p[2][k] - p[1][k]) + 3 * t * t * (p[3][k] - p[2][k])); };
  let bows = '';
  [[0.3, '#ff6fb0'], [0.6, '#ffcf3d'], [0.9, '#5cc8ff']].forEach(([t, c]) => {
    const [x, y] = bz(tailP, t), [dx, dy] = bzd(tailP, t), a = Math.atan2(dy, dx) / D + 90;
    bows += `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(a)})"><path d="M0 0L-7.5 -4.5Q-8.5 0 -7.5 4.5ZM0 0L7.5 -4.5Q8.5 0 7.5 4.5Z" fill="${c}" stroke-width="1.8"/><circle r="2" fill="${c}" stroke-width="1.6"/></g>`;
  });
  const ch_bigkite = wrap(`
<path d="M77 67Q86 76 94 93" fill="none" stroke-width="1.6"/>
<path d="M${P(...tailP[0])}C${P(...tailP[1])} ${P(...tailP[2])} ${P(...tailP[3])}" fill="none" stroke-width="1.6"/>
${bows}
<g transform="translate(46 41) rotate(-10)">
<rect x="-28" y="-32" width="56" height="64" rx="3.5" fill="#3d6bff"/>
<rect x="-23.5" y="-27.5" width="47" height="55" rx="2" fill="#fff3dc" stroke-width="2"/>
<path d="M-20 -24L-16 -24M-20 -24V-20M20 -24L16 -24M20 -24V-20M-20 24H-16M-20 24V20M20 24H16M20 24V20" fill="none" stroke="#3d6bff" stroke-width="1.6"/>
<path d="M0 -24C14 -24 20 -14 20 0C20 14 13 24 0 24C-13 24 -20 14 -20 0C-20 -14 -14 -24 0 -24Z" fill="#ff4b3e"/>
<path d="M20 0C20 14 13 24 0 24C10 18 15 10 15 -2Z" fill="#c4202e" stroke="none" opacity=".35"/>
<path d="M-14 -16Q-10 -21 -4 -21" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>
<path d="M-5 -26.5H5L4.2 -19.5H-4.2Z" fill="#3b3f8f" stroke-width="2"/>
<path d="M-19 -13Q-11 -16 -2 -7L-3.5 -4.5Q-11 -10 -18 -8.5Z" fill="#2b2340" stroke-width="1.4"/>
<path d="M19 -13Q11 -16 2 -7L3.5 -4.5Q11 -10 18 -8.5Z" fill="#2b2340" stroke-width="1.4"/>
<path d="M-17.5 -4Q-10.5 -10 -3.5 -2Q-11 2 -17.5 -4Z" fill="#ffe36b" stroke-width="1.8"/>
<path d="M17.5 -4Q10.5 -10 3.5 -2Q11 2 17.5 -4Z" fill="#ffe36b" stroke-width="1.8"/>
<circle cx="-9" cy="-3.3" r="2.7" fill="#2b2340" stroke="none"/><circle cx="9" cy="-3.3" r="2.7" fill="#2b2340" stroke="none"/><circle cx="-9.9" cy="-4.2" r=".9" fill="#fff" stroke="none"/><circle cx="8.1" cy="-4.2" r=".9" fill="#fff" stroke="none"/>
<path d="M-16 10Q-14 20 -8 21Q-4 27 0 22Q4 27 8 21Q14 20 16 10Q8 17 0 17Q-8 17 -16 10Z" fill="#fff"/>
<path d="M-10 15Q-5 12.5 0 15.5" fill="none" stroke-width="2"/>
<path d="M-4 -5Q0 -8.5 4 -5L15.5 6.5A5.6 5.6 0 0 1 7.5 14.5L-3 1.5Q-5.5 -2 -4 -5Z" fill="#ff7458" stroke-width="2.2"/>
<path d="M-0.5 -4.5L10 5.5" fill="none" stroke="#ffc2b0" stroke-width="2"/>
<ellipse cx="9.3" cy="11.6" rx="1.5" ry="1" transform="rotate(-45 9.3 11.6)" fill="#2b2340" stroke="none"/><ellipse cx="12.6" cy="8.4" rx="1.5" ry="1" transform="rotate(-45 12.6 8.4)" fill="#2b2340" stroke="none"/>
</g>
${sp(88, 14, 4.6, '#ffd34d')}${sp(8, 22, 3.4, '#fff')}${sp(88, 46, 3, '#fff')}
`);

  /* ---------------- WATER BUCKET ---------------- */
  const BC = 46;
  const lvl = f => ({ rx: 32 - 8 * f, cy: 42 + 44 * f, ry: 9 - 3 * f });
  const band = (f, h) => {
    const a = lvl(f - h), b = lvl(f + h);
    return `<path d="M${P(BC - a.rx, a.cy)}A${r(a.rx)} ${r(a.ry)} 0 0 0 ${P(BC + a.rx, a.cy)}L${P(BC + b.rx, b.cy)}A${r(b.rx)} ${r(b.ry)} 0 0 1 ${P(BC - b.rx, b.cy)}Z" fill="#e8894a" stroke-width="2.2"/>` +
      `<path d="M${P(BC - a.rx + 2, a.cy + 2.2)}A${r(a.rx)} ${r(a.ry)} 0 0 0 ${P(BC - a.rx * 0.2, a.cy + a.ry + 1.2)}" fill="none" stroke="#ffc08a" stroke-width="1.6"/>` +
      `<circle cx="${r(BC - a.rx * 0.55)}" cy="${r(a.cy + a.ry * 0.83 + 2.2)}" r="1.2" fill="#ffd9b0" stroke="none"/><circle cx="${r(BC + a.rx * 0.55)}" cy="${r(a.cy + a.ry * 0.83 + 2.2)}" r="1.2" fill="#ffd9b0" stroke="none"/>`;
  };
  let staves = '';
  for (const u of [-0.8, -0.52, -0.25, 0.02, 0.28, 0.55, 0.8]) {
    const t = lvl(0), b = lvl(1);
    staves += `M${P(BC + t.rx * u, t.cy + t.ry * Math.sqrt(1 - u * u))}L${P(BC + b.rx * u, b.cy + b.ry * Math.sqrt(1 - u * u))}`;
  }
  const ch_bucket = wrap(`
<path d="M14 42L22 86A24 6 0 0 0 70 86L78 42Z" fill="#f2c27a"/>
<path d="M78 42L70 86A24 6 0 0 1 56 91.5Q66 70 70 44Z" fill="#b8742e" stroke="none" opacity=".3"/>
<path d="${staves}" fill="none" stroke="#b8742e" stroke-width="1.3" opacity=".55"/>
<path d="M19 50L25 82" fill="none" stroke="#fff" stroke-width="2.4" opacity=".45"/>
<path d="M14 42L22 86A24 6 0 0 0 70 86L78 42" fill="none"/>
${band(0.2, 0.06)}${band(0.8, 0.06)}
<ellipse cx="46" cy="42" rx="32" ry="9" fill="#f9d79a"/>
<ellipse cx="46" cy="43" rx="27.5" ry="6.4" fill="#4cb8ff" stroke-width="2"/>
<ellipse cx="44" cy="42.6" rx="20" ry="3.6" fill="#a8e4ff" stroke="none" opacity=".8"/>
<path d="M56 41.5Q61 40.5 64 42" fill="none" stroke="#fff" stroke-width="1.6"/>
${tl(44, 38, 86, 12, 3.8, '#e8c27a')}
<path d="M84.5 13.3L86.7 11.9" fill="none" stroke="#fff6d6" stroke-width="1.4" opacity="0"/>
<path d="M28 36.5V44Q28 48 35 48Q42 48 42 44V36.5Z" fill="#f2c27a" stroke-width="2.2"/>
<ellipse cx="35" cy="36.5" rx="7" ry="2.6" fill="#6cc6ff" stroke-width="2"/>
<path d="M30 40V45" fill="none" stroke="#fff" stroke-width="1.6" opacity=".55"/>
<path d="M24 44Q26 47 30 47.5Q24 49 21 46Z" fill="#a8e4ff" stroke-width="1.5"/>
<path d="M17 41Q12 33 15 26Q17 34 22 39Z" fill="#a8e4ff" stroke-width="1.6"/>
${drop(22, 22, 1.05)}${drop(12, 14, 0.75)}${drop(36, 16, 0.85)}${drop(60, 24, 0.7)}
${sp(90, 36, 4, '#fff')}${sp(88, 78, 3.6, '#ffd34d')}${sp(50, 8, 3, '#fff')}
`, 'rotate(-3 50 50)');

  /* ---------------- OMAMORI ---------------- */
  let brocade = '';
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const x = 28 + col * 8.8 + (row % 2 ? 4.4 : 0), y = 44 + row * 8.4;
      if (x > 74 || x < 26) continue;
      if (x > 36 && x < 64 && y > 44 && y < 86) continue;
      brocade += `M${P(x, y - 3)}L${P(x + 3, y)}L${P(x, y + 3)}L${P(x - 3, y)}Z`;
    }
  }
  const CORD = '#9a6bff';
  const ch_omamori = wrap(`
${tp('M50 31V22', 3.4, CORD)}
${tp('M49 21C41 5 59 5 51 21', 3.4, CORD)}
${tp('M48 23C38 11 26 22 38 27C42 28.5 45 26 48 23.5', 3.4, CORD)}
${tp('M52 23C62 11 74 22 62 27C58 28.5 55 26 52 23.5', 3.4, CORD)}
<rect x="44.5" y="18.5" width="11" height="8" rx="3" fill="${CORD}" stroke-width="2"/>
<path d="M46.5 21.5H53" fill="none" stroke="#d4c0ff" stroke-width="1.4"/>
<path d="M28 31H72L79 39V87Q79 92 74 92H26Q21 92 21 87V39Z" fill="#ff3f5a"/>
<path d="${brocade}" fill="#ffcf3d" stroke="none" opacity=".95"/>
<path d="M79 40V87Q79 92 74 92H68Q73 88 73 80V40Z" fill="#a8122e" stroke="none" opacity=".3"/>
<path d="M25 44V82" fill="none" stroke="#fff" stroke-width="2.2" opacity=".4"/>
<path d="M28 31H72L79 39H21Z" fill="#ffcf3d" stroke-width="2.4"/>
<path d="M30 35H70" fill="none" stroke="#fff4b0" stroke-width="1.6"/>
<rect x="37.5" y="45" width="25" height="40" rx="3" fill="#fff6dc" stroke-width="2.2"/>
<rect x="40.5" y="48" width="19" height="34" rx="1.8" fill="none" stroke="#ffcf3d" stroke-width="1.8"/>
${flower(50, 60, 8.6, '#ff3f5a', 0, 1.8, true, '#ffcf3d')}
<path d="M45.5 72.5H54.5M47 77H53" fill="none" stroke="#ff3f5a" stroke-width="2.2"/>
${sp(88, 18, 4.6, '#ffd34d')}${sp(12, 22, 3.6, '#fff')}${sp(90, 70, 3.2, '#fff')}${sp(9, 64, 3, '#ffd34d')}
`, 'rotate(6 50 50)');

  /* ---------------- KOINOBORI ---------------- */
  const carp = (x0, y0, L, H, body, scale, ph, amp) => {
    const N = 14, top = [], bot = [], mid = [];
    const wv = u => amp * Math.sin(2 * Math.PI * 1.05 * u + ph) * (0.25 + u);
    for (let i = 0; i <= N; i++) {
      const u = i / N * 0.84, q = u / 0.84;
      const hh = H / 2 * (0.84 + 0.28 * Math.sin(Math.PI * q)) * (1 - 0.38 * q * q);
      const w = wv(u);
      top.push([x0 + u * L, y0 + w - hh]); bot.push([x0 + u * L, y0 + w + hh]); mid.push([x0 + u * L, y0 + w, hh]);
    }
    const we = wv(0.95);
    const tail = [[x0 + L, y0 + we - H * 0.6], [x0 + 0.91 * L, y0 + we], [x0 + 0.99 * L, y0 + we + H * 0.56]];
    const d = sm(top) + `L${P(...tail[0])}L${P(...tail[1])}L${P(...tail[2])}` + sm(bot.slice().reverse(), 'L') + 'Z';
    const gi = 3, head = sm(top.slice(0, gi + 1)) + `Q${P(mid[gi][0] + 4, mid[gi][1])} ${P(...bot[gi])}` + sm(bot.slice(0, gi + 1).reverse(), 'L') + 'Z';
    let sc = '';
    for (let i = 5; i <= 12; i++) {
      const [x, y, hh] = mid[i];
      const rows = i % 2 ? [-0.5, 0, 0.5] : [-0.25, 0.25];
      for (const v of rows) {
        const yy = y + v * hh * 1.25, s = H * 0.15;
        sc += `M${P(x, yy - s)}Q${P(x + s * 1.3, yy)} ${P(x, yy + s)}`;
      }
    }
    const tl1 = `M${P(tail[1][0] + 1, tail[1][1])}L${P(tail[0][0] - 3, tail[0][1] + 3)}M${P(tail[1][0] + 1, tail[1][1])}L${P(tail[2][0] - 3, tail[2][1] - 3)}`;
    const ex = x0 + 0.095 * L, ey = mid[1][1] - mid[1][2] * 0.22, er = H * 0.2;
    return `<path d="M13 ${r(y0 - 6)}L${P(x0, top[0][1] + 1)}M13 ${r(y0 - 6)}L${P(x0, bot[0][1] - 1)}" fill="none" stroke-width="1.5"/>` +
      `<path d="${d}" fill="${body}"/>` +
      `<path d="${sm(bot.slice(4, 13))}" fill="none" stroke="#2b2340" stroke-width="3" opacity=".14"/>` +
      `<path d="${sm(top.slice(4, 11).map(p => [p[0], p[1] + 2.6]))}" fill="none" stroke="#fff" stroke-width="1.8" opacity=".4"/>` +
      `<path d="${sc}" fill="none" stroke="${scale}" stroke-width="1.7"/>` +
      `<path d="${tl1}" fill="none" stroke="${scale}" stroke-width="1.4"/>` +
      `<path d="${head}" fill="#fffaf0" stroke-width="1.8"/>` +
      `<circle cx="${r(ex)}" cy="${r(ey)}" r="${r(er)}" fill="#ffcf3d" stroke-width="1.6"/><circle cx="${r(ex + 0.5)}" cy="${r(ey)}" r="${r(er * 0.55)}" fill="#2b2340" stroke="none"/><circle cx="${r(ex - er * 0.2)}" cy="${r(ey - er * 0.3)}" r="${r(er * 0.22)}" fill="#fff" stroke="none"/>` +
      `<ellipse cx="${x0}" cy="${r(mid[0][1])}" rx="2.8" ry="${r(mid[0][2])}" fill="#ffcf3d" stroke-width="2"/><ellipse cx="${r(x0 + 0.5)}" cy="${r(mid[0][1])}" rx="1.2" ry="${r(mid[0][2] - 2.8)}" fill="#2b2340" stroke="none" opacity=".75"/>`;
  };
  let wheel = '';
  for (let i = 0; i < 8; i++) {
    const a = i * 45 * D;
    wheel += `M${P(12 + 2.5 * Math.cos(a), 10 + 2.5 * Math.sin(a))}L${P(12 + 7 * Math.cos(a), 10 + 7 * Math.sin(a))}`;
  }
  const ch_koinobori = wrap(`
${tl(12, 10, 12, 93, 3.6, '#f2d08c')}
<path d="${wheel}" fill="none" stroke-width="4.8"/><path d="${wheel}" fill="none" stroke="#ffcf3d" stroke-width="2.2"/>
<circle cx="12" cy="10" r="3.4" fill="#ffcf3d" stroke-width="2"/>
${carp(19, 24, 73, 22, '#3b4bc8', '#8fa6ff', 0.4, 3.2)}
${carp(19, 52, 66, 20, '#ff4b4b', '#ffc0b0', 1.6, 3)}
${carp(19, 78, 58, 17, '#36a8ff', '#c7ecff', 2.8, 2.6)}
${sp(92, 42, 3.6, '#ffd34d')}${sp(88, 66, 3, '#fff')}${sp(28, 8, 3, '#fff')}
`);

  Object.assign(window.ICON_ART, { ch_spikes, ch_yukata, ch_dango, ch_whistle, ch_bigkite, ch_bucket, ch_omamori, ch_koinobori });
})();
