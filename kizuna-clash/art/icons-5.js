/* Kizuna Clash: charm card icons, set 5 (flat SVG, 100x100 box). */
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
  // thick outlined line / path (outline underneath, colour on top)
  const tl = (x1, y1, x2, y2, w, c) =>
    `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke-width="${w + 2.8}"/><path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  const tp = (d, w, c) => `<path d="${d}" fill="none" stroke-width="${w + 2.8}"/><path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  // water drop
  const drop = (x, y, s = 1, f = '#5cbcff') =>
    `<path d="M${r(x)} ${r(y - 7 * s)}C${r(x + 2 * s)} ${r(y - 3 * s)} ${r(x + 4.5 * s)} ${r(y - s)} ${r(x + 4.5 * s)} ${r(y + 2 * s)}A${r(4.5 * s)} ${r(4.5 * s)} 0 0 1 ${r(x - 4.5 * s)} ${r(y + 2 * s)}C${r(x - 4.5 * s)} ${r(y - s)} ${r(x - 2 * s)} ${r(y - 3 * s)} ${r(x)} ${r(y - 7 * s)}Z" fill="${f}" stroke-width="1.8"/><ellipse cx="${r(x - 1.6 * s)}" cy="${r(y + 1.2 * s)}" rx="${r(1.1 * s)}" ry="${r(1.6 * s)}" fill="#fff" stroke="none" opacity=".85"/>`;
  // fizzy bubble
  const bub = (x, y, s) =>
    `<circle cx="${x}" cy="${y}" r="${s}" fill="#e8fcff" stroke-width="1.5"/><circle cx="${r(x - s * 0.35)}" cy="${r(y - s * 0.35)}" r="${r(s * 0.32)}" fill="#fff" stroke="none"/>`;

  /* ---------------- ch_ramune ---------------- */
  const ch_ramune = wrap(`
<g transform="translate(0 -3) rotate(12 50 54)">
<path d="M44.5 19V24C41 26.5 40.5 30 41 33C41.5 37 44 38.5 44 41C44 46 31 50 31 62V83Q31 88 36 88H64Q69 88 69 83V62C69 50 56 46 56 41C56 38.5 58.5 37 59 33C59.5 30 59 26.5 55.5 24V19Z" fill="#b4f1f6"/>
<path d="M33.4 60Q41.5 57 50 60Q58.5 63 66.6 60V83Q66.6 85.6 63.6 85.6H36.4Q33.4 85.6 33.4 83Z" fill="#5fd6ea" stroke="none"/>
<path d="M33.4 60Q41.5 57 50 60Q58.5 63 66.6 60" fill="none" stroke="#2fb3cf" stroke-width="1.5"/>
<path d="M61 50C66 54 68.6 57.5 68.6 62V83Q68.6 87.6 64 87.6H60Q64.6 86.5 64.6 82V62C64.6 57.5 63.5 54 61 50Z" fill="#1f9ab8" opacity=".3" stroke="none"/>
<rect x="31" y="67" width="38" height="11" fill="#ff6fa5" stroke-width="2"/>
<path d="M31 72.5Q34.8 69.5 38.6 72.5Q42.4 75.5 46.2 72.5Q50 69.5 53.8 72.5Q57.6 75.5 61.4 72.5Q65.2 69.5 69 72.5" fill="none" stroke="#fff" stroke-width="1.8"/>
<path d="M60 67V78" fill="none" stroke="#c94a7f" stroke-width="3.5" opacity=".3" stroke-linecap="butt"/>
<circle cx="39" cy="63.5" r="1.5" fill="#fff" stroke="none" opacity=".9"/><circle cx="55" cy="83" r="1.8" fill="#fff" stroke="none" opacity=".9"/><circle cx="46" cy="81" r="1.1" fill="#fff" stroke="none" opacity=".9"/><circle cx="60" cy="63" r="1.1" fill="#fff" stroke="none" opacity=".9"/>
<circle cx="46" cy="52" r="1.6" fill="none" stroke="#fff" stroke-width="1.2"/><circle cx="53.5" cy="47.5" r="1.1" fill="none" stroke="#fff" stroke-width="1.1"/><circle cx="51" cy="55" r="1.1" fill="none" stroke="#fff" stroke-width="1.1"/>
<path d="M35.4 63V84" fill="none" stroke="#fff" stroke-width="3" opacity=".85"/>
<path d="M36.5 55.5Q39.5 50.5 44 47.5" fill="none" stroke="#fff" stroke-width="2.6" opacity=".85"/>
<circle cx="50" cy="32" r="6.3" fill="#effdff" stroke-width="2"/>
<path d="M55.4 29.3A6.3 6.3 0 0 1 47 37.6A6 6 0 0 0 55.4 29.3Z" fill="#7fd3e6" stroke="none" opacity=".7"/>
<circle cx="47.7" cy="29.7" r="1.9" fill="#fff" stroke="none"/><circle cx="52.6" cy="34.4" r=".8" fill="#fff" stroke="none"/>
<rect x="42" y="9.5" width="16" height="11" rx="2.6" fill="#ff6fa5"/>
<path d="M44.5 12.5H55.5" fill="none" stroke="#ffc6dc" stroke-width="1.8"/>
<path d="M46 15.5V18.5M50 15.5V18.5M54 15.5V18.5" fill="none" stroke-width="1.3" opacity=".55"/>
</g>
${bub(70, 9, 3.4)}${bub(79, 17, 2.5)}${bub(84, 8, 1.9)}${bub(73, 24, 1.6)}
<path d="M86 26Q89 27 90 30" fill="none" stroke-width="1.6" opacity=".55"/>
${sp(16, 32, 5, '#ffd34d')}${sp(24, 17, 3, '#fff')}${sp(86, 50, 3.5, '#fff')}
`);

  /* ---------------- ch_kakigori ---------------- */
  const mound = 'M16 61C12 52 18 45 25 45C24 34 34 26 42 27C45 19 57 18 62 25C70 25 77 33 75 42C83 43 88 53 84 61Z';
  const ch_kakigori = wrap(`
<g transform="rotate(-5 50 55)">
${tl(64, 40, 78, 19, 3.4, '#5cbcff')}
<ellipse cx="80.6" cy="14.6" rx="5" ry="7.4" fill="#5cbcff" transform="rotate(34 80.6 14.6)"/>
<ellipse cx="79.6" cy="13.6" rx="1.6" ry="3.2" fill="#c8ecff" stroke="none" transform="rotate(34 79.6 13.6)"/>
<path d="${mound}" fill="#fff"/>
<path d="M75 42C83 43 88 53 84 61H66C76 58 80 50 75 42Z" fill="#dcecff" stroke="none"/>
<path d="M25 45C24 34 34 26 42 27C45 19 50 18.6 53 19.2Q52 27 52.5 33Q53 40 49.5 40Q46.5 40 46.5 36Q46 31 43 34Q41 37 41.5 44Q42 49 38.5 49Q35 49 35.5 44Q36 40 32 42Q29 44 29 49Q28.6 52 26 51Q22.5 50 25 45Z" fill="#ff4f6d" stroke-width="1.8"/>
<path d="M53 19.2C57 19.6 60 21.6 62 25C70 25 77 33 75 42C79 42.6 82.5 45 84 48.5Q84 52 81 51.5Q78.6 51 78.5 47.5Q78 44 75 46Q72 48 72.5 53Q72.5 57 69 57Q65.6 57 66 52Q66.5 46 63 45.5Q59.5 45 60 40Q60.5 36 57 36Q53.2 36 52.5 33Q52 27 53 19.2Z" fill="#8ee04f" stroke-width="1.8"/>
<path d="M30 40C29 34 35 30 40 30.6" fill="none" stroke="#fff" stroke-width="2.6" opacity=".7"/>
<path d="M57.5 24.5Q61 26 62.6 28.6M66 30Q71 31.5 72.6 36" fill="none" stroke="#fff" stroke-width="2.4" opacity=".7"/>
<path d="M20 57Q22 55 24 57M30 54Q32 52 34 54M44 52Q46 50 48 52M55 55Q57 53 59 55M66 60Q68 58 70 60M38 58Q40 56 42 58" fill="none" stroke="#a9d4ff" stroke-width="1.4"/>
<path d="${mound}" fill="none"/>
<path d="M44.5 78V87H55.5V78" fill="#bfeeff"/>
<ellipse cx="50" cy="88" rx="18" ry="4" fill="#bfeeff"/>
<path d="M37 87Q42 85.6 47 85.6" fill="none" stroke="#fff" stroke-width="1.6"/>
<path d="M14 60H86C86 73 72 81 50 81C28 81 14 73 14 60Z" fill="#c9f1ff" fill-opacity=".95"/>
<path d="M66 61H86C86 70 78 77 64 80C74 74 76 68 66 61Z" fill="#7fcff0" opacity=".5" stroke="none"/>
<path d="M18.5 66Q23 62.5 27.5 66Q32 69.5 36.5 66Q41 62.5 45.5 66Q50 69.5 54.5 66Q59 62.5 63.5 66Q68 69.5 72.5 66Q77 62.5 81.5 66" fill="none" stroke="#3aa0e8" stroke-width="2"/>
<path d="M21 70Q26 77 36 79" fill="none" stroke="#fff" stroke-width="2.6"/>
<path d="M14 60H86" fill="none" stroke-width="3"/>
</g>
${sp(13, 30, 5, '#ffd34d')}${sp(20, 16, 3, '#fff')}${sp(90, 36, 3.5, '#fff')}
`);

  /* ---------------- ch_yoyo ---------------- */
  let stripes = '';
  [[-0.85, '#ffe066'], [-0.45, '#fff'], [0, '#5fd0ff'], [0.42, '#ffe066'], [0.82, '#fff']].forEach(([k, c]) => {
    const a = k * 31;
    stripes += `<path d="M0 -21C${r(a - 9)} -13 ${r(a + 7)} 8 ${r(k * 9)} 21.5" fill="none" stroke="${c}" stroke-width="3.6"/>`;
  });
  const ch_yoyo = wrap(`
<path d="M14 58Q10 66 13 74M86 58Q90 66 87 74M20 50Q15 56 16 62" fill="none" stroke-width="2" opacity=".5"/>
<g transform="translate(47 69) rotate(10)">
<ellipse cx="0" cy="0" rx="24.5" ry="22.5" fill="#ff8ec2"/>
${stripes}
<path d="M12 -15C22 -10 26 4 18 14C12 20 2 22 -6 21C10 18 20 2 12 -15Z" fill="#d94f8f" opacity=".28" stroke="none"/>
<ellipse cx="-11" cy="-9" rx="7" ry="4.6" fill="#fff" opacity=".6" stroke="none" transform="rotate(-35 -11 -9)"/>
<circle cx="-15.5" cy="-1" r="1.8" fill="#fff" opacity=".7" stroke="none"/>
<ellipse cx="0" cy="0" rx="24.5" ry="22.5" fill="none"/>
<path d="M-3.5 -21.5Q0 -24 3.5 -21.5L2 -26.5H-2Z" fill="#ff8ec2" stroke-width="2"/>
</g>
<g transform="translate(53 40) rotate(12) scale(.76)">
<path d="M-7.6 -12.5A7.6 2.6 0 0 1 7.6 -12.5" fill="none" stroke="#ff5a8a" stroke-width="2"/>
<rect x="-5.8" y="-30" width="11.6" height="32" rx="5.8" fill="#ffd6b5"/>
<path d="M2.6 -27V-1" fill="none" stroke="#e8a184" stroke-width="2.4" opacity=".45"/>
<rect x="-3.6" y="-6.5" width="7.2" height="7.6" rx="3.2" fill="#fff0ea" stroke-width="1.6"/>
<path d="M-5 -19Q0 -17.6 5 -19" fill="none" stroke="#e8a184" stroke-width="1.6"/>
<path d="M-8 -25C-13 -33 -11 -45 0 -46H12C23 -46 26 -34 21 -26C18 -22 10 -22 6 -24Z" fill="#ffd6b5"/>
<ellipse cx="10.5" cy="-24" rx="5" ry="4.4" fill="#ffd6b5"/>
<ellipse cx="18" cy="-27.5" rx="4.4" ry="4" fill="#ffd6b5"/>
<path d="M-5 -40Q0 -43.5 7 -43" fill="none" stroke="#fff" stroke-width="2.4" opacity=".8"/>
<path d="M15 -42Q22 -40 22 -33" fill="none" stroke="#e8a184" stroke-width="2" opacity=".6"/>
<path d="M-7.6 -12.5A7.6 2.6 0 0 0 7.6 -12.5" fill="none" stroke-width="4.6"/>
<path d="M-7.6 -12.5A7.6 2.6 0 0 0 7.6 -12.5" fill="none" stroke="#ff5a8a" stroke-width="2"/>
</g>
<path d="M54.6 33Q51.6 37.5 51.5 43" fill="none" stroke-width="1.8"/>
${drop(80, 78, .75)}${drop(20, 86, .6)}
${sp(18, 26, 5, '#ffd34d')}${sp(82, 40, 4, '#fff')}${sp(28, 12, 3, '#fff')}
`);

  /* ---------------- ch_hamaya ---------------- */
  const ch_hamaya = wrap(`
<g transform="translate(49 46) rotate(-42)">
<path d="M-23 -2.6C-27 -11 -37 -16.5 -50 -15.5L-45 -2.6Z" fill="#fff"/>
<path d="M-23 2.6C-27 11 -37 16.5 -50 15.5L-45 2.6Z" fill="#fff"/>
<path d="M-27 2.6C-31 9 -38 12 -46 12.5L-45 2.6Z" fill="#dfe6f5" stroke="none"/>
<path d="M-30 -3L-35 -10.5M-36.5 -3L-42 -12M-30 3L-35 10.5M-36.5 3L-42 12" fill="none" stroke-width="1.2" opacity=".35"/>
<path d="M-41 -13.5L-44 -9M-41 13.5L-44 9" fill="none" stroke="#ff4f5e" stroke-width="2.4" opacity=".9"/>
<rect x="-49" y="-2.6" width="84" height="5.2" rx="2.6" fill="#fff6e0"/>
<path d="M-19 -1H31" fill="none" stroke="#fff" stroke-width="1.4"/>
<rect x="-53" y="-3.4" width="6" height="6.8" rx="1.6" fill="#ff4f5e" stroke-width="1.8"/>
<rect x="-21" y="-3.4" width="4.4" height="6.8" rx="1" fill="#ffcf3d" stroke-width="1.6"/>
<rect x="-16.6" y="-3.4" width="4.4" height="6.8" rx="1" fill="#ff4f5e" stroke-width="1.6"/>
<rect x="24" y="-3.4" width="4.4" height="6.8" rx="1" fill="#ff4f5e" stroke-width="1.6"/>
<rect x="28.4" y="-3.4" width="4.4" height="6.8" rx="1" fill="#ffcf3d" stroke-width="1.6"/>
<path d="M33 -7.5Q45 -6 53 0Q45 6 33 7.5Q37 0 33 -7.5Z" fill="#ffcf3d"/>
<path d="M37 0H48" fill="none" stroke="#e0a020" stroke-width="1.4"/>
<path d="M37 -4.4Q44 -3.4 48 -1.2" fill="none" stroke="#fff4b8" stroke-width="1.6"/>
</g>
<path d="M58.4 42.2Q59 47 61 51" fill="none" stroke="#ff4f5e" stroke-width="2.2"/>
<path d="M58.4 42.2Q59 47 61 51" fill="none" stroke-width="1" opacity=".0"/>
<g transform="rotate(7 61 52)">
<path d="M61 51Q70 52 74 60" fill="none" stroke-width="1.6"/>
<circle cx="74.5" cy="62.5" r="4.6" fill="#ffcf3d" stroke-width="2"/>
<path d="M72 63.5H77" fill="none" stroke-width="1.4"/><circle cx="73.2" cy="61" r="1.2" fill="#fff8c8" stroke="none"/>
<path d="M53 59L61 53L69 59V82H53Z" fill="#ff4f5e"/>
<path d="M55.8 61L61 57L66.2 61V79.4H55.8Z" fill="none" stroke="#ffcf3d" stroke-width="1.8"/>
<path d="M65.5 60V81" fill="none" stroke="#b8243a" stroke-width="3" opacity=".3" stroke-linecap="butt"/>
<circle cx="61" cy="68.5" r="4" fill="#ffcf3d" stroke-width="1.6"/>
<circle cx="61" cy="68.5" r="1.5" fill="#ff4f5e" stroke="none"/>
<path d="M57 75H65" fill="none" stroke="#ffcf3d" stroke-width="1.8"/>
<path d="M55.2 62.5V77" fill="none" stroke="#ffa0a8" stroke-width="1.4"/>
<path d="M58 82L57 89M61 82V90M64 82L65 89" fill="none" stroke="#ff4f5e" stroke-width="2.4"/>
<ellipse cx="61" cy="52" rx="3.2" ry="2.4" fill="#ffcf3d" stroke-width="1.6"/>
</g>
${sp(16, 22, 5.5, '#ffd34d')}${sp(28, 10, 3, '#fff')}${sp(88, 52, 3.5, '#fff')}${sp(36, 56, 3, '#fff4a8')}
`);

  /* ---------------- ch_tanzaku ---------------- */
  const leaf = (x, y, L, a, c = '#7ed957') =>
    `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0C${r(L * 0.3)} ${r(-L * 0.24)} ${r(L * 0.72)} ${r(-L * 0.16)} ${L} 0C${r(L * 0.72)} ${r(L * 0.16)} ${r(L * 0.3)} ${r(L * 0.24)} 0 0Z" fill="${c}" stroke-width="2"/><path d="M2.5 0H${r(L * 0.72)}" fill="none" stroke="#3f9e3a" stroke-width="1.1" opacity=".8"/></g>`;
  const strip = (x, y, h, a, c, sh) =>
    `<g transform="translate(${x} ${y}) rotate(${a})"><path d="M0 0V5" fill="none" stroke-width="1.5"/><rect x="-5.5" y="5" width="11" height="${h}" rx="1.4" fill="${c}"/><rect x="2" y="6.4" width="2.4" height="${h - 2.8}" fill="${sh}" opacity=".35" stroke="none"/><path d="M-2.8 8.5V${h + 1.5}" fill="none" stroke="#fff" stroke-width="1.6" opacity=".75"/><circle cx="0" cy="8" r="1.2" fill="#fff" stroke-width="1"/></g>`;
  const Q = t => {
    const P = [[30, 93], [33, 52], [55, 10]], u = 1 - t;
    return [u * u * P[0][0] + 2 * u * t * P[1][0] + t * t * P[2][0], u * u * P[0][1] + 2 * u * t * P[1][1] + t * t * P[2][1]];
  };
  let nodes = '';
  [0.22, 0.46, 0.7].forEach(t => {
    const [x, y] = Q(t);
    nodes += `<path d="M${r(x - 4.2)} ${r(y + 0.8)}L${r(x + 4.2)} ${r(y - 0.8)}" fill="none" stroke-width="1.8"/>`;
  });
  const [ax, ay] = Q(0.45), [bx, by] = Q(0.68);
  const ch_tanzaku = wrap(`
${tp(`M${r(ax)} ${r(ay)}Q62 40 86 38`, 2.2, '#8ad65a')}
${tp(`M${r(bx)} ${r(by)}Q30 22 13 25`, 2.2, '#8ad65a')}
${tp('M30 93Q33 52 55 10', 5.2, '#9be06a')}
<path d="M31.8 88Q33.4 56 49 22" fill="none" stroke="#d6f7b4" stroke-width="1.6"/>
${nodes}
${leaf(55, 10, 20, -10)}${leaf(55, 10, 18, -70)}${leaf(54, 12, 16, -125, '#6ccb4a')}
${leaf(86, 38, 15, -30)}${leaf(86, 38, 13, 30, '#6ccb4a')}
${leaf(13, 25, 15, -150)}${leaf(13, 25, 13, 160, '#6ccb4a')}
${leaf(37, 60, 14, 160, '#6ccb4a')}${leaf(68, 40.4, 13, -62)}${leaf(29, 21.6, 12, -118, '#6ccb4a')}${leaf(55, 10, 15, 25, '#6ccb4a')}
${strip(22, 25, 29, 4, '#ff7eb6', '#d94f8f')}
${strip(57, 43, 30, -5, '#ffd34d', '#e0a020')}
${strip(71, 39.6, 26, 6, '#5fd0ff', '#2a8fd0')}
<path d="M84 38.6V50" fill="none" stroke-width="1.5"/>
${star5(84, 58.5, 10, '#ffd34d', 8, 2.2)}
<path d="M80.5 55.5L83.5 52.5" fill="none" stroke="#fff8c8" stroke-width="1.8"/>
${sp(88, 16, 5, '#ffd34d')}${sp(14, 70, 4, '#fff')}${sp(76, 80, 3.5, '#fff4a8')}
`);

  /* ---------------- ch_onsen ---------------- */
  const steam = (x, y, h) => { const s = h / 2; return `M${x} ${y}C${x - 6} ${r(y - s / 3)} ${x + 6} ${r(y - 2 * s / 3)} ${x} ${r(y - s)}C${x - 6} ${r(y - 4 * s / 3)} ${x + 6} ${r(y - 5 * s / 3)} ${x} ${r(y - h)}`; };
  const ch_onsen = wrap(`
<g transform="rotate(-3 50 55)">
${tp(steam(34, 47, 27), 4.2, '#fff')}
${tp(steam(50, 46, 36), 4.2, '#fff')}
${tp(steam(66, 47, 27), 4.2, '#fff')}
<path d="M14 52L19 81A31 8.5 0 0 0 81 81L86 52Z" fill="#f6c77d"/>
<path d="M26 59.5L28.5 87M38 61.5L39 89M50 62V89.5M62 61.5L61 89M74 59.5L71.5 87" fill="none" stroke="#c98a4b" stroke-width="1.4"/>
<path d="M72 60.5L86 52L81 81A31 8.5 0 0 1 70 88.6Z" fill="#b8743a" opacity=".28" stroke="none"/>
<path d="M19 59L22.6 79" fill="none" stroke="#ffe6b8" stroke-width="2.6"/>
${tp('M15.7 62A34.3 9.6 0 0 0 84.3 62', 3.6, '#ff9a3d')}
${tp('M18.8 74A31.2 8.8 0 0 0 81.2 74', 3.6, '#ff9a3d')}
<path d="M20 63.5Q30 69 40 70.5M22 75.8Q30 80 38 81" fill="none" stroke="#ffd3a0" stroke-width="1.3"/>
<ellipse cx="50" cy="52" rx="36" ry="10" fill="#ffd99a"/>
<ellipse cx="50" cy="52.4" rx="31" ry="7.4" fill="#e8a95c" stroke-width="2"/>
<ellipse cx="50" cy="53.8" rx="29.6" ry="5.9" fill="#6fd8f0" stroke-width="1.6"/>
<path d="M34 53.4Q40 51.4 46 53.4M55 55.6Q60 54 65 55.6" fill="none" stroke="#fff" stroke-width="1.8"/>
<path d="M60.5 59.6Q70.5 58.6 79.5 55L80.6 73.5Q71.6 77.6 62.4 78.6Z" fill="#fff"/>
<path d="M61 65.4Q71 64.4 80 61M61.6 71Q71.4 70 80.3 66.5" fill="none" stroke="#ff6f9a" stroke-width="2.2"/>
<path d="M74.6 57.6L75.8 75.8" fill="none" stroke="#c9d4ee" stroke-width="2.6" opacity=".7"/>
<path d="M60.2 59.6Q70.4 58.4 79.5 55L77.4 50.6Q69 54 59.8 55.2Z" fill="#eef3ff"/>
<path d="M63 79.5V82M67 79V81.6M71 78V80.6M75 76.6V79.2M79 75V77.6" fill="none" stroke-width="1.4"/>
</g>
${drop(12, 40, .7)}${drop(90, 30, .6)}
${sp(14, 20, 4.5, '#ffd34d')}${sp(88, 12, 3.5, '#fff')}${sp(90, 70, 3, '#fff')}
`);

  /* ---------------- ch_kemari ---------------- */
  const ch_kemari = wrap(`
<path d="M9 90Q14 64 36 50L45 66Q22 72 9 90Z" fill="#fff"/>
<path d="M14 84Q20 68 38 58" fill="none" stroke="#bfeaff" stroke-width="3"/>
<path d="M24 92Q30 82 42 76M6 74Q10 62 20 55" fill="none" stroke-width="2" opacity=".5"/>
<g transform="translate(57 41) rotate(-16)">
<ellipse cx="0" cy="0" rx="28" ry="25" fill="#fff"/>
<path d="M16 -18C27 -10 30 6 20 16C13 23 2 25 -8 24C10 20 24 2 16 -18Z" fill="#dfe6f5" stroke="none"/>
<path d="M-21 -11C-17 -18 -10 -21.5 -3 -22" fill="none" stroke="#fff" stroke-width="3"/>
<ellipse cx="0" cy="0" rx="28" ry="25" fill="none"/>
<path d="M-29.6 -3.6A29.6 8.8 0 0 0 29.6 -3.6L29.2 5.4A29.2 8.8 0 0 1 -29.2 5.4Z" fill="#ff4f5e"/>
<path d="M-21 3.2Q-9 7.6 3 7.2" fill="none" stroke="#ffa0a8" stroke-width="1.6"/>
<path d="M17 6A29.2 8.8 0 0 0 29.2 -2V5.4A29.2 8.8 0 0 1 14 13Z" fill="#b8243a" opacity=".25" stroke="none"/>
<path d="M-26.8 0.1L-25.4 6.9L-23.2 2.9L-20.4 9.4L-16.9 5.0L-12.9 11.2L-8.5 6.4L-3.8 12.1L1.0 6.8L5.7 12.0L10.3 6.2L14.5 10.9L18.3 4.6L21.6 9.0L24.2 2.3L26.1 6.4" fill="none" stroke="#fff" stroke-width="1.7"/>
</g>
<path d="M86 14Q92 20 92 28M80 8Q86 9 90 12" fill="none" stroke-width="2" opacity=".5"/>
${sp(24, 22, 5.5, '#ffd34d')}${sp(36, 8, 3, '#fff')}${sp(90, 64, 4, '#fff')}${sp(58, 84, 3.5, '#fff4a8')}${sp(10, 92, 3, '#ffd34d')}
`);

  Object.assign(window.ICON_ART, {
    ch_ramune, ch_kakigori, ch_yoyo, ch_hamaya, ch_tanzaku, ch_onsen, ch_kemari,
  });
})();
