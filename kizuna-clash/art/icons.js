/* Kizuna Clash: festival event + charm card icons (flat SVG, 100x100 box). */
window.ICON_ART = window.ICON_ART || {};
(function () {
  const r = n => Math.round(n * 10) / 10;
  const D = Math.PI / 180;
  const O = 'stroke="#2b2340" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
  const wrap = (inner, tf) => `<g ${O}${tf ? ` transform="${tf}"` : ''}>${inner}</g>`;
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
  // thick outlined line (outline underneath, colour on top)
  const tl = (x1, y1, x2, y2, w, c) =>
    `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke-width="${w + 2.8}"/><path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  // thick outlined path
  const tp = (d, w, c) => `<path d="${d}" fill="none" stroke-width="${w + 2.8}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  // zigzag paper streamer (shide)
  const shide = (x, y, s = 1, rot = 0) =>
    `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M0 0h6v6h4v6h-4v6h4v6h-6v-6h-4v-6h4v-6h-4z" fill="#fff" stroke-width="${r(1.7 / s)}"/>`;
  // rain / water drop
  const drop = (x, y, s = 1, f = '#5cbcff') =>
    `<path d="M${r(x)} ${r(y - 7 * s)}C${r(x + 2 * s)} ${r(y - 3 * s)} ${r(x + 4.5 * s)} ${r(y - s)} ${r(x + 4.5 * s)} ${r(y + 2 * s)}A${r(4.5 * s)} ${r(4.5 * s)} 0 0 1 ${r(x - 4.5 * s)} ${r(y + 2 * s)}C${r(x - 4.5 * s)} ${r(y - s)} ${r(x - 2 * s)} ${r(y - 3 * s)} ${r(x)} ${r(y - 7 * s)}Z" fill="${f}" stroke-width="1.8"/><ellipse cx="${r(x - 1.6 * s)}" cy="${r(y + 1.2 * s)}" rx="${r(1.1 * s)}" ry="${r(1.6 * s)}" fill="#fff" stroke="none" opacity=".85"/>`;
  // cute goldfish, head toward +x, centred at 0,0
  const fish = tf => `<g transform="${tf}">
<path d="M-9 0C-17 -13 -29 -13 -28 -4C-27 -1 -27 1 -28 4C-29 13 -17 13 -9 0Z" fill="#ffa95e"/>
<path d="M-13 0L-23 -6M-13 0L-23 6" fill="none" stroke-width="1.2" opacity=".45"/>
<path d="M-3 -8Q3 -17 9 -7Z" fill="#ffa95e"/>
<ellipse cx="0" cy="0" rx="13" ry="9.5" fill="#ff5a36"/>
<path d="M-8 4Q2 9.5 11 3.5Q5 8.5 -3 8Z" fill="#ffd2a0" stroke="none"/>
<path d="M-7 -5Q-1 -8.5 4 -7.5" fill="none" stroke="#ffb59e" stroke-width="2"/>
<path d="M-1 3Q-5 10 2.5 9.5Z" fill="#ffa95e" stroke-width="1.6"/>
<circle cx="6.5" cy="-2" r="3" fill="#2b2340" stroke="none"/><circle cx="7.6" cy="-3.1" r="1.1" fill="#fff" stroke="none"/>
<path d="M11.5 1.5Q12.8 2.8 11.8 4" fill="none" stroke-width="1.3"/>
</g>`;
  // one comma of the mitsudomoe (radius 12)
  const tomoe = c => [0, 120, 240].map(a =>
    `<path transform="rotate(${a})" d="M0 -12A6 6 0 0 1 0 0A6 6 0 0 0 -10.4 6A12 12 0 0 1 0 -12Z" fill="${c}" stroke-width="1.5"/>`).join('');
  // firework burst of rays + end dots
  const burst = (cx, cy, n, r1, r2, rd, dr, cols, w, rot = 0) => {
    let under = '', over = '', dots = '';
    for (let i = 0; i < n; i++) {
      const a = (rot - 90 + i * 360 / n) * D, c = Math.cos(a), s = Math.sin(a), col = cols[i % cols.length];
      const seg = `M${r(cx + r1 * c)} ${r(cy + r1 * s)}L${r(cx + r2 * c)} ${r(cy + r2 * s)}`;
      under += seg;
      over += `<path d="${seg}" fill="none" stroke="${col}" stroke-width="${w}"/>`;
      dots += `<circle cx="${r(cx + rd * c)}" cy="${r(cy + rd * s)}" r="${dr}" fill="${col}" stroke-width="1.7"/>`;
    }
    return `<path d="${under}" fill="none" stroke-width="${w + 2.8}"/>${over}${dots}`;
  };

  /* ---------------- EVENTS ---------------- */

  const ev_opening = wrap(`
<rect x="11" y="45" width="78" height="8.5" rx="1.5" fill="#ff5a3c"/>
<path d="M14 47.6H86" fill="none" stroke="#ffb7a3" stroke-width="1.6"/>
<path d="M24 33L31 33L32.6 84H22.4Z" fill="#ff5a3c"/>
<path d="M69 33L76 33L77.6 84H67.4Z" fill="#ff5a3c"/>
<path d="M28.8 36L31 36L32.3 83H29.8Z" fill="#c4302a" opacity=".3" stroke="none"/>
<path d="M73.8 36L76 36L77.3 83H74.8Z" fill="#c4302a" opacity=".3" stroke="none"/>
<path d="M25.6 37L26.3 81M70.6 37L71.3 81" fill="none" stroke="#ffb7a3" stroke-width="1.8"/>
<rect x="19.5" y="82" width="16" height="9" rx="2" fill="#3b3f8f"/>
<rect x="64.5" y="82" width="16" height="9" rx="2" fill="#3b3f8f"/>
<rect x="43" y="31" width="14" height="15" rx="1.5" fill="#3b3f8f"/>
<rect x="45.6" y="33.6" width="8.8" height="9.8" rx="1" fill="#ffd34d" stroke-width="1.4"/>
<path d="M11 24Q30 30 50 29.5Q70 30 89 24L87.5 33.5Q70 36.5 50 36.5Q30 36.5 12.5 33.5Z" fill="#ff5a3c"/>
<path d="M15 28.6Q32 32.8 48 32.8" fill="none" stroke="#ffb7a3" stroke-width="1.6"/>
<path d="M5 13Q28 24 50 23Q72 24 95 13L93 22Q72 30.5 50 29.5Q28 30.5 7 22Z" fill="#3b3f8f"/>
<path d="M10 17.8Q30 26.2 50 25.6" fill="none" stroke="#8d94f0" stroke-width="1.8"/>
<path d="M50 53.5V56" fill="none" stroke-width="1.6"/>
${shide(45, 55, 1.15, 5)}
${sp(89, 63, 5.5, '#ffd34d')}${sp(11, 63, 4.5, '#fff')}${sp(50, 9, 3.5, '#fff4a8')}
`, 'rotate(-4 50 52)');

  let tacks = '';
  for (let i = 0; i < 16; i++) {
    const a = i * 22.5 * D;
    tacks += `<circle cx="${r(40 + 22.8 * Math.cos(a))}" cy="${r(50 + 25.8 * Math.sin(a))}" r="1.7" fill="#ffd34d" stroke-width="1"/>`;
  }
  const ev_taiko = wrap(`
${tl(30, 70, 18, 90, 5, '#c98a4b')}${tl(58, 72, 70, 90, 5, '#c98a4b')}${tl(19, 85, 69, 85, 4, '#b8783e')}
<path d="M40 22C54 15 71 21 77 35C81 45 81 57 77 66C71 80 54 85 40 78Z" fill="#e0783a"/>
<path d="M64 74C71 68 77 60 79 52C79.5 64 74 75 60 80Z" fill="#a8461f" opacity=".35" stroke="none"/>
<path d="M47 21.5C57 18.5 66 21.5 71 29" fill="none" stroke="#ffc08a" stroke-width="2.2"/>
<path d="M58 21C67 28 72 40 72 50C72 61 67 72 58 79" fill="none" stroke="#ffcf3d" stroke-width="2.4"/>
<circle cx="72.5" cy="50" r="5" fill="none" stroke-width="5.4"/><circle cx="72.5" cy="50" r="5" fill="none" stroke="#ffcf3d" stroke-width="2.6"/>
<ellipse cx="40" cy="50" rx="25" ry="28" fill="#b65a2c"/>
<ellipse cx="40" cy="50" rx="20.5" ry="23.5" fill="#fff1d2" stroke-width="2"/>
<path d="M50 70C56 64 59 57 60 50C60 60 55 69 46 73Z" fill="#f0d29c" opacity=".7" stroke="none"/>
${tacks}
<g transform="translate(40 50) scale(1.08 1.18)">${tomoe('#ff4d4d')}</g>
<path d="M25 40Q28 32 36 29" fill="none" stroke="#fff" stroke-width="2.6"/>
${tl(62, 36, 90, 9, 5, '#f6cf8c')}${tl(65, 8, 92, 31, 5, '#f6cf8c')}
<circle cx="62" cy="36" r="3.6" fill="#ff6b5a" stroke-width="2"/><circle cx="92" cy="31" r="3.6" fill="#ff6b5a" stroke-width="2"/>
<path d="M10 30L5 27M9 40L3 40M12 21L8 16" fill="none" stroke-width="2.2"/>
${sp(20, 12, 5, '#ffd34d')}${sp(88, 50, 4, '#fff')}
`);

  const ev_rain = wrap(`
<g transform="rotate(-12 50 50)">
<path d="M47.5 50V86Q50 88 52.5 86V50Z" fill="#f3d08a"/>
<rect x="45.6" y="71" width="8.8" height="18" rx="3.5" fill="#ff8a3d"/>
<path d="M46.5 76H53.5M46.5 80.5H53.5M46.5 85H53.5" fill="none" stroke-width="1.3"/>
<path d="M10 50Q14 18 50 12Q86 18 90 50Q82 45 74 51Q66 46 58 52Q50 47 42 52Q34 46 26 51Q18 45 10 50Z" fill="#ff4d4d"/>
<path d="M66 17Q86 24 90 50Q82 45 74 51Q76 31 66 17Z" fill="#c42f3a" opacity=".28" stroke="none"/>
<path d="M50 13Q30 26 26 50M50 13Q40 30 42 51M50 13Q60 30 58 51M50 13Q70 26 74 50" fill="none" stroke-width="1.3" opacity=".5"/>
<path d="M26.3 21Q50 11 73.7 21L81.7 28.6Q50 17 18.3 28.6Z" fill="#fff" stroke="none"/>
<path d="M26.3 21Q50 11 73.7 21M81.7 28.6Q50 17 18.3 28.6" fill="none" stroke-width="1.5"/>
<path d="M10 50Q14 18 50 12Q86 18 90 50" fill="none"/>
<path d="M16 42Q20 24 40 16" fill="none" stroke="#ffb0a8" stroke-width="2.6"/>
<ellipse cx="50" cy="12.5" rx="6" ry="3.2" fill="#3b3f8f"/>
<path d="M50 9V5" fill="none" stroke-width="2.4"/>
</g>
${drop(13, 27, .8)}${drop(84, 13, .9)}${drop(12, 74, 1)}${drop(29, 88, .8)}${drop(88, 64, .9)}${drop(80, 87, 1)}
`);

  const ev_fireworks = wrap(`
<circle cx="40" cy="78" r="1.8" fill="#ffcf3d" stroke-width="1.2"/><circle cx="41" cy="86" r="1.4" fill="#ff9a3d" stroke-width="1.1"/><circle cx="42" cy="93" r="1.1" fill="#ffcf3d" stroke-width="1"/>
${burst(42, 40, 12, 10, 24, 30.5, 3.6, ['#ff5f8f', '#ffcf3d', '#4fc3ff', '#a07cff', '#5fdc7a', '#ff9a3d'], 5)}
<circle cx="42" cy="40" r="6.5" fill="#fff6c4"/>
${burst(76, 73, 8, 5, 11.5, 16, 2.8, ['#5fdc7a', '#ffcf3d', '#4fc3ff', '#ff5f8f'], 4, 22.5)}
<circle cx="76" cy="73" r="3.8" fill="#fff6c4" stroke-width="2"/>
${sp(85, 17, 6.5, '#ffe066')}${sp(15, 84, 5, '#fff')}${sp(88, 46, 3.5, '#fff')}
`);

  const ev_kites = wrap(`
${tp('M37 50C44 58 40 66 48 72S58 82 55 91', 4.4, '#ff4d5e')}
${tp('M70 58C76 64 72 72 80 78S90 84 91 92', 4.4, '#4fb6ff')}
<path d="M30 41L50 13.6M30 41L42.5 44.6M30 41L67.7 34.4" fill="none" stroke-width="1.2" opacity=".7"/>
<path d="M30 41Q12 60 8 92" fill="none" stroke-width="1.6"/>
<g transform="translate(58 32) rotate(14)">
<rect x="-18" y="-22" width="36" height="44" rx="2" fill="#ffd23f"/>
<rect x="9" y="-21" width="8" height="42" fill="#e8a020" opacity=".25" stroke="none"/>
<path d="M-18 -22L18 22M18 -22L-18 22M0 -22V22M-18 0H18" fill="none" stroke="#b9772f" stroke-width="1.2" opacity=".55"/>
<rect x="-13.5" y="-17.5" width="27" height="35" rx="1" fill="none" stroke="#ff4040" stroke-width="3.2"/>
<path d="M-18 -22h8l-8 8zM18 -22h-8l8 8zM-18 22h8l-8-8zM18 22h-8l8-8z" fill="#ff4040" stroke-width="1.4"/>
<circle cx="0" cy="0" r="10" fill="#ff4040" stroke-width="1.8"/>
<path d="M-6 -3Q-4 -7 1 -7.4" fill="none" stroke="#ffc2b5" stroke-width="2"/>
<rect x="-18" y="-22" width="36" height="44" rx="2" fill="none"/>
</g>
<path d="M8 18Q16 13 24 18M12 28Q18 25 24 28" fill="none" stroke-width="1.8" opacity=".5"/>
${sp(88, 48, 4.5, '#fff')}${sp(18, 46, 3.5, '#ffd34d')}
`);

  const ev_mochi = wrap(`
<path d="M14 56C15 68 20 74 20 80L19 86Q44 95 69 86L68 80C68 74 73 68 74 56Z" fill="#d68a48"/>
<path d="M60 62L74 56C73 68 68 74 68 80L69 86Q65 88.5 60 89.5Z" fill="#9c5a2a" opacity=".3" stroke="none"/>
<path d="M19 63C20 70 23 74 23.5 80" fill="none" stroke="#f2b878" stroke-width="2.4"/>
<path d="M17 67Q44 76 71 67M20.5 80Q44 88 67.5 80" fill="none" stroke="#9c5a2a" stroke-width="2"/>
<path d="M32 72Q34 76 33 78M52 73Q54 76 53 79" fill="none" stroke="#9c5a2a" stroke-width="1.3" opacity=".7"/>
<ellipse cx="44" cy="56" rx="30" ry="10" fill="#eab071"/>
<ellipse cx="44" cy="57" rx="22" ry="6.5" fill="#a9622c" stroke-width="2"/>
<path d="M23 58C21 48 28 42 36 42C40 37 50 37 54 42C62 42 67 48 65 58Q44 64 23 58Z" fill="#fff"/>
<path d="M26 57.5Q44 62 62 57.5Q60 55 56 56Q44 59 30 56Z" fill="#dfe6f5" stroke="none"/>
<ellipse cx="38.5" cy="50" rx="1.9" ry="2.5" fill="#2b2340" stroke="none"/><ellipse cx="50" cy="50" rx="1.9" ry="2.5" fill="#2b2340" stroke="none"/>
<path d="M42 53.5Q44.2 56 46.4 53.5" fill="none" stroke-width="1.5"/>
<ellipse cx="34" cy="53.5" rx="3" ry="1.7" fill="#ff7a9a" opacity=".55" stroke="none"/><ellipse cx="54.5" cy="53.5" rx="3" ry="1.7" fill="#ff7a9a" opacity=".55" stroke="none"/>
<g transform="translate(58 22) rotate(48)">
<rect x="7" y="-3.3" width="37" height="6.6" rx="3.3" fill="#f0c27e"/>
<path d="M12 -1.2H40" fill="none" stroke="#fff0c8" stroke-width="1.6"/>
<rect x="-9.5" y="-14" width="19" height="28" rx="4.5" fill="#c97a3c"/>
<rect x="-6.5" y="-11" width="4" height="22" rx="2" fill="#e6a160" stroke="none"/>
<path d="M-9.5 -8H9.5M-9.5 8H9.5" fill="none" stroke-width="1.6"/>
</g>
<path d="M73 7Q82 7 87 14M80 3Q88 5 92 11" fill="none" stroke-width="1.8" opacity=".55"/>
${sp(13, 44, 4.5, '#ffd34d')}${sp(24, 32, 3, '#fff')}${sp(86, 70, 4, '#fff')}
`);

  let bags = '';
  for (let x = 20; x <= 80.1; x += 7.5) if (x < 42 || x > 58) bags += `M${r(x)} 65L${r(50 + (x - 50) * 1.1)} 80`;
  const ev_sumo = wrap(`
<path d="M9 64H91L94 80Q50 84 6 80Z" fill="#dba760"/>
<path d="${bags}" fill="none" stroke-width="1.3" opacity=".4"/>
<path d="M43 64H57L58 81.5H42Z" fill="#efc88c" stroke-width="1.8"/>
<path d="M42.5 70H57.5M42.3 76H57.7" fill="none" stroke-width="1.4"/>
<path d="M20 16H80L91 64H9Z" fill="#f2d49a"/>
<path d="M80 16L91 64H76Z" fill="#d9a35f" opacity=".25" stroke="none"/>
<path d="M12 62.4H88" fill="none" stroke="#fff3d4" stroke-width="1.8"/>
<path d="M24.5 20.5H75.5L85.5 60H14.5Z" fill="none" stroke-width="6.4"/>
<path d="M24.5 20.5H75.5L85.5 60H14.5Z" fill="none" stroke="#f5cf5e" stroke-width="3.6"/>
<path d="M24.5 20.5H75.5L85.5 60H14.5Z" fill="none" stroke="#c9963a" stroke-width="3.6" stroke-dasharray="1.2 3.6" stroke-linecap="butt"/>
<ellipse cx="50" cy="40" rx="25.5" ry="14.5" fill="#f2d49a" stroke-width="8.4"/>
<path d="M32 37Q40 31.5 51 31M36 46Q45 50.5 58 49.5M58 33Q64 35 67 39" fill="none" stroke="#e3bd78" stroke-width="1.6"/>
<ellipse cx="50" cy="40" rx="25.5" ry="14.5" fill="none" stroke="#f5cf5e" stroke-width="5.2"/>
<ellipse cx="50" cy="40" rx="25.5" ry="14.5" fill="none" stroke="#c9963a" stroke-width="5.2" stroke-dasharray="1.3 4.2" stroke-linecap="butt"/>
<path d="M30 31Q37 26.6 45 25.4" fill="none" stroke="#fff6c8" stroke-width="1.4"/>
<circle cx="30" cy="9" r="1.6" fill="#fff" stroke-width="1"/><circle cx="37" cy="5.5" r="1.3" fill="#fff" stroke-width="1"/><circle cx="24" cy="5" r="1.1" fill="#fff" stroke-width="1"/><circle cx="32" cy="2.5" r="1" fill="#fff" stroke-width="1"/>
${sp(86, 9, 5.5, '#fff')}${sp(12, 10, 4, '#ffd34d')}${sp(93, 42, 3.5, '#ffd34d')}
`, 'rotate(-3 50 50)');

  const ev_bon = wrap(`
<path d="M62 3V9" fill="none" stroke-width="2.4"/>
<ellipse cx="62" cy="40" rx="25" ry="28" fill="#ff4d4d"/>
<path d="M78 18C88 28 90 48 82 60C76 67 68 69 62 68C76 60 82 40 78 18Z" fill="#c42f3a" opacity=".3" stroke="none"/>
<path d="M44.5 20Q62 23 79.5 20M39.4 28Q62 31.5 84.6 28M37.2 36Q62 39.5 86.8 36M37.2 44Q62 47.5 86.8 44M39.4 52Q62 55.5 84.6 52M44.5 60Q62 63 79.5 60" fill="none" stroke-width="1.2" opacity=".4"/>
<ellipse cx="47" cy="30" rx="4.5" ry="10" fill="#fff" opacity=".35" stroke="none" transform="rotate(18 47 30)"/>
<circle cx="71" cy="38" r="8.5" fill="#fff4dc" stroke-width="1.8"/><circle cx="71" cy="38" r="3.6" fill="#ff4d4d" stroke-width="1.4"/>
<rect x="51" y="8" width="22" height="7" rx="2" fill="#3b3f8f"/>
<rect x="51" y="65" width="22" height="7" rx="2" fill="#3b3f8f"/>
<path d="M62 72V76" fill="none" stroke-width="2"/>
<path d="M58.5 76H65.5L67 87H57Z" fill="#ffcf3d"/>
<g transform="rotate(16 36 56)">
${tl(36, 72, 36, 95, 5.5, '#f3d08a')}
<circle cx="36" cy="52" r="22" fill="#5ec8ff"/>
<path d="M14.8 58Q20.2 53 25.5 58Q30.8 53 36 58Q41.2 53 46.5 58Q51.8 53 57.2 58A22 22 0 0 1 14.8 58Z" fill="#2f8fe0" stroke-width="1.6"/>
<path d="M20 66Q25 62 30 66Q35 62 40 66Q45 62 50 66" fill="none" stroke="#fff" stroke-width="1.8"/>
<path d="M19 42Q23 33 32 31" fill="none" stroke="#fff" stroke-width="2.4" opacity=".8"/>
${fish('translate(37 43) rotate(-12) scale(.62)')}
<circle cx="36" cy="52" r="22" fill="none"/>
</g>
${sp(88, 76, 5, '#ffd34d')}${sp(16, 18, 4.5, '#fff')}
`);

  const ev_moon = wrap(`
<circle cx="58" cy="38" r="30" fill="#ffe680"/>
<path d="M80 18A30 30 0 0 1 40 62Q72 56 80 18Z" fill="#ffc93a" opacity=".55" stroke="none"/>
<circle cx="67" cy="27" r="5" fill="#f7cf55" stroke="none"/><circle cx="50" cy="45" r="3.6" fill="#f7cf55" stroke="none"/>
<circle cx="72" cy="47" r="3" fill="#f7cf55" stroke="none"/><circle cx="54" cy="22" r="2.2" fill="#f7cf55" stroke="none"/>
<path d="M35 27A25 25 0 0 1 50 13" fill="none" stroke="#fff" stroke-width="3.2" opacity=".8"/>
<path d="M14 93Q30 76 50 74Q32 82 22 93Z" fill="#6fcf6a"/>
<path d="M12 93Q2 80 6 64Q11 80 19 93Z" fill="#8fdc6a"/>
${tp('M15 93Q11 66 20 46', 2, '#a6c96a')}${tp('M22 93Q24 72 36 58', 2, '#a6c96a')}${tp('M10 93Q4 76 9 62', 2, '#a6c96a')}
<path d="M19 49C13 36 20 23 34 16C30 26 28 39 22 49Z" fill="#f6ead2"/>
<path d="M22 41L18 37M24.5 34L20.5 30M27.5 27.5L24.5 23.5" fill="none" stroke="#c8a96a" stroke-width="1.3"/>
<path d="M35 60C35 48 42 40 56 36C50 44 46 54 38 60Z" fill="#f6ead2"/>
<path d="M40 54L37 50M44 48L41 44M48.5 43L46 39.5" fill="none" stroke="#c8a96a" stroke-width="1.3"/>
<path d="M8 64C3 54 4 42 10 34C11 44 13 54 11 64Z" fill="#f6ead2"/>
<path d="M8.5 56L6 52M9 48L6.5 44" fill="none" stroke="#c8a96a" stroke-width="1.3"/>
${tl(54, 92, 90, 50, 3.4, '#e9c48a')}
<circle cx="64.4" cy="79.9" r="8.6" fill="#8fdc7a"/><circle cx="72.9" cy="70" r="8.6" fill="#fffaf2"/><circle cx="81.3" cy="60.1" r="8.6" fill="#ff9fc2"/>
<path d="M60 77Q61 74 64 73.5M68.5 67Q69.5 64 72.5 63.5M77 57Q78 54 81 53.5" fill="none" stroke="#fff" stroke-width="2"/>
<path d="M75 76Q79 73 80.5 69" fill="none" stroke="#dfe6f5" stroke-width="2"/>
${sp(16, 14, 4, '#fff4a8')}${sp(92, 80, 4.5, '#fff')}
`);

  let spikes = '', shine = '', tips = '';
  for (let i = 0; i < 16; i++) {
    const long = i % 2 === 0, R = long ? 41 : 30, a = (i * 22.5 - 90), ar = a * D;
    const pt = (rr, da) => r(50 + rr * Math.cos((a + da) * D)) + ',' + r(48 + rr * Math.sin((a + da) * D));
    const poly = `<polygon points="${pt(11, -9.5)} ${pt(R * 0.55, -6)} ${pt(R, 0)} ${pt(R * 0.55, 6)} ${pt(11, 9.5)}" fill="${long ? '#ffc928' : (i % 4 === 1 ? '#ff9a2e' : '#ff6f9c')}" stroke-width="2.1"/>`;
    spikes = long ? spikes + poly : poly + spikes;
    if (long) shine += `M${r(50 + 15 * Math.cos(ar))} ${r(48 + 15 * Math.sin(ar))}L${r(50 + (R - 11) * Math.cos(ar))} ${r(48 + (R - 11) * Math.sin(ar))}`;
  }
  const gap = k => { const a = (k * 45 - 67.5) * D; return [r(50 + 40 * Math.cos(a)), r(48 + 40 * Math.sin(a))]; };
  const conf = (k, c, rot) => { const [x, y] = gap(k); return `<rect x="${r(x - 4)}" y="${r(y - 2)}" width="8" height="4" rx="1" fill="${c}" stroke-width="1.6" transform="rotate(${rot} ${x} ${y})"/>`; };
  const st = (k, c, R2) => { const [x, y] = gap(k); return star5(x, y, R2, c, 12); };
  const ev_finale = wrap(`
<circle cx="50" cy="48" r="36" fill="#fffbe8" opacity=".5" stroke="none"/>
<circle cx="50" cy="48" r="25" fill="#fff6c0" opacity=".7" stroke="none"/>
${spikes}
<path d="${shine}" fill="none" stroke="#fff3b0" stroke-width="2.2"/>
<circle cx="50" cy="48" r="15" fill="#fff6c2" stroke-width="2.4"/>
${star5(50, 48.6, 12, '#ffcf3d', 0, 2)}
<path d="M45.5 44.5L48.5 39" fill="none" stroke="#fff" stroke-width="2"/>
${st(0, '#ff5f8f', 6.5)}${conf(1, '#4fc3ff', 30)}${st(2, '#5fdc7a', 6)}${conf(3, '#ff5f8f', -25)}
${st(4, '#a07cff', 6.5)}${conf(5, '#5fdc7a', 40)}${st(6, '#4fc3ff', 6)}${conf(7, '#a07cff', -35)}
${sp(10, 10, 4.5, '#fff')}${sp(90, 90, 4.5, '#fff')}${sp(91, 10, 3.5, '#ffe066')}${sp(9, 88, 3.5, '#ffe066')}
`);

  /* ---------------- CHARMS ---------------- */

  const ch_drum = wrap(`
<g transform="rotate(-20 46 52)">
<ellipse cx="20" cy="52" rx="9" ry="26" fill="#ff5a3c"/>
<ellipse cx="18.6" cy="52" rx="5" ry="20" fill="#fff0cf" stroke-width="1.6"/>
<path d="M22 39C34 40 38 47.5 45 47.5C52 47.5 56 40 68 39V65C56 64 52 56.5 45 56.5C38 56.5 34 64 22 65Z" fill="#4a4fb0"/>
<path d="M27 43C35 44 39 49 45 49.5" fill="none" stroke="#8d94f0" stroke-width="2"/>
<circle cx="30" cy="59" r="1.5" fill="#ffd34d" stroke="none"/><circle cx="60" cy="44" r="1.5" fill="#ffd34d" stroke="none"/><circle cx="59" cy="60" r="1.5" fill="#ffd34d" stroke="none"/><circle cx="33" cy="45" r="1.1" fill="#ffd34d" stroke="none"/>
<path d="M21 28L42 48M21 36L42 49.5M69 28L48 48M69 36L48 49.5M21 76L42 56M21 68L42 54.5M69 76L48 56M69 68L48 54.5" fill="none" stroke-width="4.2"/>
<path d="M21 28L42 48M21 36L42 49.5M69 28L48 48M69 36L48 49.5M21 76L42 56M21 68L42 54.5M69 76L48 56M69 68L48 54.5" fill="none" stroke="#ff9a2e" stroke-width="2"/>
<rect x="41" y="45" width="8" height="14" rx="2.5" fill="#ff9a2e" stroke-width="1.8"/>
<path d="M41 49.7H49M41 54.3H49" fill="none" stroke-width="1.1"/>
<ellipse cx="69" cy="52" rx="12" ry="26" fill="#ff5a3c"/>
<ellipse cx="70.5" cy="52" rx="8.4" ry="21.5" fill="#fff0cf" stroke-width="1.8"/>
<path d="M75 66C77 60 77.5 54 77 48C79 56 78 64 74 70Z" fill="#f0d29c" stroke="none"/>
<path d="M66 40Q66.5 35 69 32" fill="none" stroke="#fff" stroke-width="2.2"/>
<path d="M64 30Q68 27 72 27.6" fill="none" stroke="#ffb7a3" stroke-width="1.6"/>
</g>
${tl(92, 12, 79, 37, 4.4, '#f6cf8c')}
<circle cx="79" cy="37.5" r="4.4" fill="#ff6b5a" stroke-width="2"/>
<path d="M85 47Q89 53 87 60M90 43Q94.5 52 91.5 63" fill="none" stroke-width="2.2"/>
${sp(88, 26, 4.5, '#ffd34d')}${sp(12, 16, 4, '#fff')}${sp(82, 78, 3.5, '#fff')}
`);

  const ch_firecracker = wrap(`
<g transform="translate(44 60) rotate(28)">
<rect x="-12" y="-28" width="24" height="56" rx="4" fill="#ff4545"/>
<rect x="-8.5" y="-24" width="4" height="48" rx="2" fill="#ff9a8a" stroke="none"/>
<rect x="5" y="-26" width="5" height="52" rx="2" fill="#c42f3a" opacity=".35" stroke="none"/>
<rect x="-12.6" y="-24" width="25.2" height="5" rx="1" fill="#ffcf3d" stroke-width="1.8"/>
<rect x="-12.6" y="19" width="25.2" height="5" rx="1" fill="#ffcf3d" stroke-width="1.8"/>
<rect x="-12.6" y="-8" width="25.2" height="16" rx="1" fill="#fff4d6" stroke-width="1.8"/>
<path d="M0 -5L4.5 0L0 5L-4.5 0Z" fill="#ff4545" stroke-width="1.4"/>
<ellipse cx="0" cy="-28" rx="12" ry="4.2" fill="#ffc9b8"/>
${tp('M0 -29C3 -36 -3 -41 1 -46C3 -49 5 -50 6 -52', 2.2, '#9a6a44')}
</g>
${star5(74, 17, 13, '#ffd23f', 18, 2)}
${star5(74, 17, 6.5, '#fff', 0, 1.4)}
<path d="M88 26L92 29M62 6L59 2M90 10L94 7M60 26L56 28" fill="none" stroke-width="2.2"/>
<circle cx="86" cy="36" r="2" fill="#ff9a2e" stroke-width="1.3"/><circle cx="58" cy="12" r="1.8" fill="#ffd23f" stroke-width="1.3"/><circle cx="84" cy="4" r="1.6" fill="#ff9a2e" stroke-width="1.2"/>
${sp(14, 30, 4.5, '#ffd34d')}${sp(20, 14, 3, '#fff')}
`);

  const ch_onigiri = wrap(`
<g transform="rotate(-6 50 50)">
<path d="M50 12C58 12 62 18 66 25L86 62C92 74 86 86 72 86L28 86C14 86 8 74 14 62L34 25C38 18 42 12 50 12Z" fill="#fff"/>
<path d="M72 50L86 62C92 74 86 86 72 86L64 86C76 80 80 66 72 50Z" fill="#dfe6f5" stroke="none"/>
<path d="M22 56L37 28" fill="none" stroke="#fff" stroke-width="3"/>
<path d="M37 24Q39 22 41 23M24 60Q23 62 24 64M78 66Q79 68 78 70M60 22Q62 22 63 24" fill="none" stroke-width="1.3" opacity=".5"/>
<path d="M34 63Q50 60 66 63L67 86H33Z" fill="#2f5d50"/>
<path d="M38 68V83M44 66.5V84M56 66.5V84M62 68V83" fill="none" stroke="#4f8a77" stroke-width="1.5"/>
<ellipse cx="40" cy="45" rx="3.6" ry="4.8" fill="#2b2340" stroke="none"/><ellipse cx="60" cy="45" rx="3.6" ry="4.8" fill="#2b2340" stroke="none"/>
<circle cx="41.2" cy="43.2" r="1.5" fill="#fff" stroke="none"/><circle cx="61.2" cy="43.2" r="1.5" fill="#fff" stroke="none"/>
<circle cx="39" cy="47" r=".7" fill="#fff" stroke="none"/><circle cx="59" cy="47" r=".7" fill="#fff" stroke="none"/>
<path d="M45 51.5Q50 59 55 51.5Z" fill="#ff6b7f" stroke-width="1.6"/>
<ellipse cx="32" cy="53" rx="4.6" ry="2.6" fill="#ff7a9a" opacity=".55" stroke="none"/><ellipse cx="68" cy="53" rx="4.6" ry="2.6" fill="#ff7a9a" opacity=".55" stroke="none"/>
</g>
${sp(84, 22, 6, '#ffd34d')}${sp(14, 30, 4, '#fff')}${sp(90, 52, 3, '#fff')}
`);

  const ch_ward = wrap(`
<rect x="16" y="3" width="68" height="94" rx="26" fill="#ffe96b" opacity=".35" stroke="none"/>
<rect x="24" y="7" width="52" height="86" rx="16" fill="#fff3a0" opacity=".6" stroke="none"/>
${tl(22, 30, 13, 25, 2.6, '#ffc22e')}${tl(21, 50, 10, 50, 2.6, '#ffc22e')}${tl(22, 70, 13, 75, 2.6, '#ffc22e')}
${tl(79, 30, 88, 25, 2.6, '#ffc22e')}${tl(80, 50, 91, 50, 2.6, '#ffc22e')}${tl(79, 70, 88, 75, 2.6, '#ffc22e')}
<g transform="rotate(5 50 50)">
<path d="M32 12H68V87Q59 85 50 88Q41 85 32 87Z" fill="#fffaf0"/>
<path d="M62 13H67.5V86.5Q65 86 62 86Z" fill="#eadfc4" opacity=".7" stroke="none"/>
<path d="M35.5 16H64.5V82.5Q57 81 50 83.5Q43 81 35.5 82.5Z" fill="none" stroke="#ff4d4d" stroke-width="1.6"/>
<circle cx="50" cy="27" r="6.5" fill="#ff4d4d" stroke-width="1.6"/>
<circle cx="50" cy="27" r="2.4" fill="#fffaf0" stroke="none"/>
<path d="M50 38C53 45 53 57 50 67C47 57 47 45 50 38Z" fill="#ff4d4d" stroke-width="1.4"/>
<path d="M40.5 50L43.5 46L46.5 50L43.5 54Z M53.5 50L56.5 46L59.5 50L56.5 54Z" fill="#ff4d4d" stroke-width="1.3"/>
<rect x="43" y="70" width="14" height="10" rx="1" fill="#ff4d4d" stroke-width="1.6"/>
<rect x="46" y="72.6" width="8" height="4.8" fill="none" stroke="#fff" stroke-width="1.4"/>
</g>
${sp(18, 14, 5, '#fff')}${sp(84, 86, 5.5, '#ffe066')}${sp(87, 13, 3.5, '#ffe066')}${sp(14, 86, 3.5, '#fff')}
`);

  const ch_headband = wrap(`
<g transform="rotate(-10 50 50)">
<path d="M7 34A29 13 0 0 1 65 34L65 49A29 13 0 0 0 7 49Z" fill="#d9ddf0"/>
<path d="M67 39C72 30 78 31 82 24C84 20 86 16 90 13L90.6 18.4L94 21C91 24 89 28 87 31C83 39 77 41 71 44Z" fill="#fff"/>
<path d="M76 34C80 31 83 27 86 21" fill="none" stroke="#d9ddf0" stroke-width="1.8"/>
<path d="M69 46C77 48 79 57 85 63C87 65 89 67 93 69L88.8 71.2L88 76C84 73 81 69 79 65C75 59 73 54 67 51Z" fill="#fff"/>
<path d="M74 52C78 56 80 62 85 67" fill="none" stroke="#d9ddf0" stroke-width="1.8"/>
<path d="M7 34A29 13 0 0 0 65 34L65 49A29 13 0 0 1 7 49Z" fill="#fff"/>
<path d="M48 46.5A29 13 0 0 0 65 34L65 49A29 13 0 0 1 48 61.5Z" fill="#d9ddf0" opacity=".75" stroke="none"/>
<path d="M11 39Q22 46.5 34 47.3" fill="none" stroke="#c9cfe8" stroke-width="1.4"/>
<path d="M19 45Q20 50 18.5 56M55 45Q56 50 54.5 56" fill="none" stroke-width="1.2" opacity=".3"/>
<circle cx="36" cy="54.5" r="7.4" fill="#ff3b3b" stroke-width="1.8"/>
<path d="M32.5 52Q34 49.8 36.6 49.4" fill="none" stroke="#ff9a8a" stroke-width="1.6"/>
<path d="M61 36Q69 31 73 38Q75 46 69 50Q61 50 61 42Z" fill="#fff"/>
<path d="M66 37.5Q69 40 68 46" fill="none" stroke-width="1.2" opacity=".4"/>
</g>
<path d="M78 82Q84 84 90 81M72 90Q78 92 83 90M80 7Q85 8.5 90 6" fill="none" stroke-width="1.8" opacity=".5"/>
${sp(14, 76, 5, '#ffd34d')}${sp(27, 86, 3, '#fff')}${sp(16, 18, 3.5, '#fff')}
`);

  const ch_chime = wrap(`
<path d="M8 32Q14 28 20 32M4 46Q12 42 19 46M10 60Q20 56 28 62Q34 66 40 62" fill="none" stroke-width="1.8" opacity=".5"/>
<g transform="rotate(-6 50 6)">
<circle cx="50" cy="5" r="2.4" fill="none" stroke-width="1.8"/>
<path d="M50 7.5V16" fill="none" stroke-width="1.8"/>
<path d="M50 46V62" fill="none" stroke-width="1.4"/>
<circle cx="50" cy="52.5" r="3.2" fill="#ffcf3d" stroke-width="1.6"/>
<path d="M24 48C23 28 34 15 50 15C66 15 77 28 76 48Q50 54 24 48Z" fill="#bfeeff" fill-opacity=".92"/>
<path d="M64 20C72 26 77 36 76 48Q70 49.5 64 50C70 40 70 28 64 20Z" fill="#7fcff0" opacity=".45" stroke="none"/>
<path d="M28 42Q32.5 38 37 42Q41.5 38 46 42Q50.5 38 55 42Q59.5 38 64 42Q68.5 38 72 41" fill="none" stroke="#3aa0e8" stroke-width="1.8"/>
${fish('translate(53 30) rotate(-8) scale(.5)')}
<path d="M24 48Q50 43 76 48Q50 54 24 48Z" fill="#8fdcf8" stroke-width="2"/>
<path d="M31 40C30 30 35 23 43 20" fill="none" stroke="#fff" stroke-width="3"/>
<ellipse cx="50" cy="15.5" rx="4.5" ry="2.6" fill="#ffcf3d" stroke-width="1.8"/>
<g transform="translate(50 62) rotate(-22)">
<rect x="-8" y="0" width="16" height="29" rx="1.5" fill="#ff9ec4"/>
<rect x="4" y="1" width="3.5" height="27" fill="#e0709a" opacity=".35" stroke="none"/>
<path d="M-8 5H8" fill="none" stroke-width="1.4"/>
<circle cx="0" cy="15" r="4.2" fill="#fff4c2" stroke-width="1.4"/>
<circle cx="0" cy="15" r="1.5" fill="#ff6b8f" stroke="none"/>
<path d="M-4 23L0 26L4 23" fill="none" stroke="#fff" stroke-width="1.6"/>
</g>
</g>
${sp(86, 22, 5, '#fff')}${sp(88, 52, 3.5, '#ffe066')}
`);

  const ch_net = wrap(`
${tl(53, 72, 86, 90, 6, '#ff6fa5')}
<path d="M59 77L84 88" fill="none" stroke="#ffc0d8" stroke-width="1.8"/>
<g transform="rotate(-16 34 60)">
<ellipse cx="34" cy="60" rx="25" ry="18" fill="#eaf7ff" stroke-width="8"/>
<path d="M11 62Q22 56 34 62Q46 68 57.5 61A25 18 0 0 1 11 62Z" fill="#bfe6ff" stroke="none" opacity=".8"/>
<ellipse cx="34" cy="60" rx="25" ry="18" fill="none" stroke="#ff6fa5" stroke-width="5"/>
<path d="M12.5 52Q16.5 44.5 26 42" fill="none" stroke="#ffd0e2" stroke-width="1.8"/>
<circle cx="27" cy="56" r="1.6" fill="#9ad8ff" stroke="none"/><circle cx="41" cy="53" r="1.2" fill="#9ad8ff" stroke="none"/>
</g>
${fish('translate(72 21) rotate(-32) scale(.88)')}
<path d="M44 36Q43 29 47 24M52 37Q52 32 55 29" fill="none" stroke-width="1.8" opacity=".5"/>
${drop(34, 30, .7)}${drop(88, 42, .8)}${drop(56, 12, .6)}${drop(62, 38, .55)}
${sp(14, 18, 4.5, '#ffd34d')}${sp(24, 8, 3, '#fff')}
`);

  const RS = x => Math.sin(Math.PI * (x - 8) / 84);
  const RC = x => 24 + 16 * RS(x), RH = x => 7.4 + 2.8 * RS(x);
  const RT = x => RC(x) - RH(x), RB = x => RC(x) + RH(x);
  let tube = `M11 ${r(RT(11))}`;
  for (let x = 13; x <= 89; x += 2) tube += `L${x} ${r(RT(x))}`;
  tube += `A${r(RH(89))} ${r(RH(89))} 0 0 1 89 ${r(RB(89))}`;
  for (let x = 87; x >= 11; x -= 2) tube += `L${x} ${r(RB(x))}`;
  tube += `A${r(RH(11))} ${r(RH(11))} 0 0 1 11 ${r(RT(11))}Z`;
  let stripes = '', twl = '';
  for (let x = 17.5; x <= 86; x += 5.6) {
    const k = 6.5, w = 2.8;
    stripes += `M${r(x)} ${r(RT(x))}L${r(x + w)} ${r(RT(x + w))}L${r(x + w - k)} ${r(RB(x + w - k))}L${r(x - k)} ${r(RB(x - k))}Z`;
    twl += `M${r(x + w)} ${r(RT(x + w) + 0.8)}L${r(x + w - k)} ${r(RB(x + w - k) - 0.8)}`;
  }
  let hi = `M14 ${r(RT(14) + 2.6)}`;
  for (let x = 18; x <= 86; x += 4) hi += `L${x} ${r(RT(x) + 2.6)}`;
  const band = x => `<path d="M${r(x - 1.9)} ${r(RT(x - 1.9) - 0.6)}L${r(x + 1.9)} ${r(RT(x + 1.9) - 0.6)}L${r(x + 1.9)} ${r(RB(x + 1.9) + 0.6)}L${r(x - 1.9)} ${r(RB(x - 1.9) + 0.6)}Z" fill="#ff4d4d" stroke-width="1.8"/>`;
  const brush = (x, dir) => { const y = r(RC(x)), d = `M${x} ${y}L${x + dir * 6.5} ${r(y - 6)}M${x} ${y}L${x + dir * 8} ${y}M${x} ${y}L${x + dir * 6.5} ${r(y + 6)}`; return `<path d="${d}" fill="none" stroke-width="4.8"/><path d="${d}" fill="none" stroke="#f2cf6b" stroke-width="2.2"/>`; };
  const ch_rope = wrap(`
${shide(19, r(RB(26) - 3), 1.3, 5)}${shide(43.5, r(RB(50) - 3), 1.35, -2)}${shide(68, r(RB(74) - 3), 1.3, 6)}
${brush(12, -1)}${brush(88, 1)}
<path d="${tube}" fill="#f2cf6b"/>
<path d="${stripes}" fill="#d9a548" stroke="none"/>
<path d="${twl}" fill="none" stroke-width="1.3" opacity=".45"/>
<path d="${hi}" fill="none" stroke="#fff3c4" stroke-width="1.8" opacity=".9"/>
<path d="${tube}" fill="none"/>
${band(15)}${band(85)}
${sp(50, 13, 4.5, '#ffd34d')}${sp(24, 10, 3, '#fff')}${sp(80, 12, 3.5, '#fff')}${sp(90, 70, 3.5, '#ffd34d')}${sp(10, 66, 3, '#fff')}
`, 'rotate(-3 50 50)');

  const sparks = (cx, cy, R0, rot) => {
    const d = ['', ''];
    let dots = '';
    for (let i = 0; i < 8; i++) {
      const a = (rot + i * 45) * D, c = Math.cos(a), s = Math.sin(a), R = i % 2 ? R0 * 0.72 : R0;
      const m = R * 0.6, f = R * 0.32;
      const mx = cx + m * c, my = cy + m * s;
      let p = `M${r(cx + 7.5 * c)} ${r(cy + 7.5 * s)}L${r(cx + R * c)} ${r(cy + R * s)}`;
      p += `M${r(mx)} ${r(my)}L${r(mx + f * Math.cos(a - 0.7))} ${r(my + f * Math.sin(a - 0.7))}`;
      p += `M${r(mx)} ${r(my)}L${r(mx + f * Math.cos(a + 0.7))} ${r(my + f * Math.sin(a + 0.7))}`;
      d[i % 2] += p;
      if (i % 2) dots += `<circle cx="${r(cx + (R0 * 0.95) * c)}" cy="${r(cy + (R0 * 0.95) * s)}" r="1.5" fill="#fff4a8" stroke-width="1"/>`;
    }
    const all = d[0] + d[1];
    return `<path d="${all}" fill="none" stroke-width="4"/><path d="${d[0]}" fill="none" stroke="#ffcf3d" stroke-width="1.9"/><path d="${d[1]}" fill="none" stroke="#ff8a3d" stroke-width="1.9"/>${dots}`;
  };
  const stick = (x1, y1, x2, y2, c) => {
    const tx = x1 + (x2 - x1) * 0.82, ty = y1 + (y2 - y1) * 0.82;
    return `${tl(x1, y1, x2, y2, 4, c)}<path d="M${x1} ${y1}L${r(tx)} ${r(ty)}" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="1.6 5" stroke-linecap="butt" opacity=".7"/>${tl(r(tx), r(ty), x2, y2, 5.2, '#c2563a')}`;
  };
  const ch_sparkler = wrap(`
<circle cx="28" cy="30" r="11" fill="#ffe36b" opacity=".55" stroke="none"/>
<circle cx="72" cy="30" r="11" fill="#ffe36b" opacity=".55" stroke="none"/>
${stick(66, 92, 30, 32, '#a07cff')}
${stick(34, 92, 70, 32, '#ff6fb0')}
${sparks(28, 29, 20, -10)}${sparks(72, 29, 20, 15)}
<circle cx="28" cy="29" r="5" fill="#ff7a2e" stroke-width="2"/><circle cx="26.6" cy="27.6" r="1.6" fill="#fff4c2" stroke="none"/>
<circle cx="72" cy="29" r="5" fill="#ff7a2e" stroke-width="2"/><circle cx="70.6" cy="27.6" r="1.6" fill="#fff4c2" stroke="none"/>
${sp(50, 12, 4.5, '#fff')}${sp(50, 50, 3.5, '#ffe066')}${sp(14, 64, 3.5, '#ffe066')}${sp(86, 64, 3.5, '#fff')}
`);

  Object.assign(window.ICON_ART, {
    ev_opening, ev_taiko, ev_rain, ev_fireworks, ev_kites, ev_mochi, ev_sumo, ev_bon, ev_moon, ev_finale,
    ch_drum, ch_firecracker, ch_onigiri, ch_ward, ch_headband, ch_chime, ch_net, ch_rope, ch_sparkler,
  });
})();
