/* Kizuna Clash: charm card icons, set 7 (flat SVG, 100x100 box). */
window.ICON_ART = window.ICON_ART || {};
(function () {
  const r = n => Math.round(n * 10) / 10;
  const D = Math.PI / 180;
  const O = 'stroke="#2b2340" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"';
  const wrap = (inner, tf) => `<g ${O}${tf ? ` transform="${tf}"` : ''}>${inner}</g>`;
  const P = (x, y) => r(x) + ' ' + r(y);
  const pol = (cx, cy, a, rr) => [cx + rr * Math.cos(a * D), cy + rr * Math.sin(a * D)];
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
  // merged puffy cloud: outlined circles, then the same circles unstroked on top
  const cloud = (cs, f, sw = 2.4) => cs.map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2] + sw / 2}" fill="#2b2340" stroke="none"/>`).join('') +
    cs.map(c => `<circle cx="${c[0]}" cy="${c[1]}" r="${c[2] - sw / 2}" fill="${f}" stroke="none"/>`).join('');
  // hanging tassel: knot at 0,0, fringe below
  const tassel = (x, y, c = '#ff4b5c', k = '#ffcf3d', s = 1, rot = 0) =>
    `<g transform="translate(${r(x)} ${r(y)}) rotate(${r(rot)}) scale(${s})"><path d="M-4.4 4L-6 18.5Q0 21 6 18.5L4.4 4Z" fill="${c}" stroke-width="2"/><path d="M-2.6 8.5V17.8M0 8.5V18.8M2.6 8.5V17.8" fill="none" stroke-width="1.1" opacity=".45"/><rect x="-5.4" y="2.6" width="10.8" height="4.4" rx="1.6" fill="${k}" stroke-width="1.8"/><circle cx="0" cy="0" r="3.6" fill="${k}" stroke-width="1.8"/></g>`;
  // flaming jewel (hoju), centred on 0,0, ~8 tall at s=1
  const hoju = (x, y, s, f = '#fff4d6', fl = '#ff4b5c') =>
    `<g transform="translate(${r(x)} ${r(y)}) scale(${s})"><path d="M-6 4Q-11 1 -9 -5Q-7 -1 -4.5 -1.5M6 4Q11 1 9 -5Q7 -1 4.5 -1.5" fill="${fl}" stroke-width="${r(1.4 / s)}"/><path d="M0 -8C2 -4.5 6 -3 6 1.5C6 5 3.5 6.5 0 6.5C-3.5 6.5 -6 5 -6 1.5C-6 -3 -2 -4.5 0 -8Z" fill="${f}" stroke-width="${r(1.6 / s)}"/><path d="M-2.5 2.5Q-3 -1 -0.5 -3.5" fill="none" stroke="#ff9db0" stroke-width="${r(1.4 / s)}"/></g>`;

  /* ---------------- PAPER DOLL ---------------- */
  const dollHalf = [['L', 54.5, 34], ['Q', 56, 33.6, 59, 33.6], ['L', 84, 37.1], ['Q', 89.4, 38.3, 88, 41], ['Q', 87, 43.2, 83.5, 43.2], ['L', 62.5, 45.2],
    ['Q', 60, 51, 59.6, 58], ['Q', 61.5, 72, 70, 84], ['Q', 71.5, 88.5, 66, 88.5], ['L', 55, 88.5], ['L', 50, 78.5]];
  const dollD = (() => {
    const pts = [[54, 30.2]];
    let R = '';
    dollHalf.forEach(g => { const e = g.slice(-2); R += g[0] === 'L' ? `L${P(...e)}` : `Q${P(g[1], g[2])} ${P(...e)}`; pts.push(e); });
    let L = '';
    for (let i = dollHalf.length - 1; i >= 0; i--) {
      const g = dollHalf[i], e = pts[i];
      L += g[0] === 'L' ? `L${P(100 - e[0], e[1])}` : `Q${P(100 - g[1], g[2])} ${P(100 - e[0], e[1])}`;
    }
    return { full: `M54 30.2${R}${L}A10 10 0 1 1 54 30.2Z`, right: `M50 11A10 10 0 0 1 54 30.2${R}Z` };
  })();
  const ch_hitogata = wrap(`
<circle cx="50" cy="51" r="40" fill="#efe9ff" stroke="none" opacity=".75"/>
${tp('M9 64Q15 60 21 62', 2, '#fff')}${tp('M76 72Q82 68 87 70', 2, '#fff')}
<path d="${dollD.full}" fill="#fffdf7"/>
<path d="${dollD.right}" fill="#b9b0dd" stroke="none" opacity=".42"/>
<path d="M50 33V76" fill="none" stroke="#a79ccf" stroke-width="1.4" stroke-dasharray="2.6 3"/>
<path d="M42.5 15Q44 12 47 11.5" fill="none" stroke="#e3ddf3" stroke-width="2"/>
<path d="M18 39.5H34M37.5 63Q36.5 72 33 80" fill="none" stroke="#e3ddf3" stroke-width="2"/>
<path d="${dollD.full}" fill="none"/>
<circle cx="50" cy="55" r="7" fill="#ff4b5c" stroke-width="2"/>
<circle cx="50" cy="55" r="4" fill="none" stroke="#fff" stroke-width="1.3" opacity=".85"/>
<circle cx="47.6" cy="52.6" r="1.5" fill="#fff" stroke="none" opacity=".8"/>
${sp(84, 17, 4.6, '#ffd34d')}${sp(15, 23, 3.6, '#fff')}${sp(83, 86, 3, '#fff')}
`, 'rotate(-10 50 52)');

  /* ---------------- SMOKE BOMB ---------------- */
  const ch_kemuridama = wrap(`
${cloud([[18, 73, 9], [27, 81, 9], [16.5, 82, 6.5], [38, 85, 5.6]], '#e4e1ef')}
${cloud([[76, 75, 8.5], [84.5, 67, 6.5], [84.5, 80, 6.5], [66, 84, 6.2]], '#e4e1ef')}
${cloud([[17, 40, 6], [22, 33, 5]], '#eeecf6')}
<circle cx="16" cy="72" r="3" fill="#fff" stroke="none" opacity=".8"/><circle cx="74" cy="73" r="3" fill="#fff" stroke="none" opacity=".8"/>
<g transform="rotate(40 60.5 40.5)"><rect x="53" y="34" width="15" height="11" rx="2.4" fill="#ffcf3d"/><path d="M56 37V42" fill="none" stroke="#fff6c0" stroke-width="1.8"/></g>
${tp('M64 34C69 28 63 23 70 19C75 16 76 19 78.5 16.5', 2.2, '#e8c27a')}
<circle cx="44" cy="61" r="26" fill="#3b3f8f"/>
<path d="M70 61A26 26 0 0 1 26 79.6A28 28 0 0 0 66 46Z" fill="#23275f" stroke="none" opacity=".4"/>
<path d="M22 56A22 22 0 0 1 40 38.5" fill="none" stroke="#7a84e6" stroke-width="3.4"/>
<ellipse cx="31" cy="47" rx="5.2" ry="3" transform="rotate(-48 31 47)" fill="#fff" stroke="none" opacity=".85"/>
<circle cx="37.5" cy="42.5" r="1.6" fill="#fff" stroke="none" opacity=".85"/>
<g transform="translate(47 66) rotate(15)"><path d="M0 -9L2.4 -2.4L9 0L2.4 2.4L0 9L-2.4 2.4L-9 0L-2.4 -2.4Z" fill="#a9b4ff" stroke-width="1.6"/><circle r="1.8" fill="#3b3f8f" stroke-width="1.2"/></g>
<circle cx="80" cy="15" r="8" fill="#ffe36b" stroke="none" opacity=".6"/>
${star5(80, 15, 8, '#ff8a3d', 12, 1.8)}${star5(80, 15, 4.2, '#ffe36b', 30, 1.2)}
<path d="M87 9L89.5 6.5M89 16.5L91.5 17.5M72.5 8.5L71 6" fill="none" stroke="#ff8a3d" stroke-width="2"/>
${sp(11, 56, 3, '#fff')}${sp(54, 11.5, 3.4, '#ffd34d')}
`);

  /* ---------------- KUNAI ---------------- */
  const kunai = (tf, wrapC, wrapL) => `<g transform="${tf}">
<path d="M0 22.5V25" fill="none" stroke-width="4.4"/>
<circle cx="0" cy="30" r="5.2" fill="none" stroke-width="5.8"/><circle cx="0" cy="30" r="5.2" fill="none" stroke="#c9d2ee" stroke-width="2.8"/>
<path d="M-1.8 26.6A3.8 3.8 0 0 0 -4 30.5" fill="none" stroke="#fff" stroke-width="1.2" opacity=".8"/>
<rect x="-3.6" y="-2" width="7.2" height="25" rx="1.6" fill="${wrapC}"/>
<path d="M-3.6 2L3.6 5.5M-3.6 7.5L3.6 11M-3.6 13L3.6 16.5M-3.6 18.5L3.6 22" fill="none" stroke-width="1.2" opacity=".5"/>
<path d="M-1.6 0V21" fill="none" stroke="${wrapL}" stroke-width="1.4" opacity=".8"/>
<path d="M0 -46C3 -36 8.5 -26 8.5 -18C8.5 -12 5 -7 4 -4L-4 -4C-5 -7 -8.5 -12 -8.5 -18C-8.5 -26 -3 -36 0 -46Z" fill="#e4eaf8"/>
<path d="M0 -46C3 -36 8.5 -26 8.5 -18C8.5 -12 5 -7 4 -4L0 -4Z" fill="#8f9ccc" stroke="none" opacity=".45"/>
<path d="M0 -41V-6" fill="none" stroke-width="1.2" opacity=".45"/>
<path d="M-3 -32Q-5.6 -24 -5.2 -15" fill="none" stroke="#fff" stroke-width="1.8"/>
<rect x="-5.2" y="-5.5" width="10.4" height="4.6" rx="1.4" fill="#9aa6d2" stroke-width="2"/>
</g>`;
  const ch_kunai = wrap(`
${kunai('translate(50 53) rotate(-40) scale(1.06)', '#7a63e0', '#b6a6ff')}
${kunai('translate(50 53) rotate(40) scale(1.06)', '#ff4b5c', '#ffa0aa')}
${sp(81, 12, 5, '#fff')}${sp(18, 12, 3.6, '#ffd34d')}${sp(50, 88, 3.4, '#fff')}
`);

  /* ---------------- SEND-OFF FIRE ---------------- */
  const logE = (x1, y1, x2, y2, w) => {
    const a = Math.atan2(y2 - y1, x2 - x1) / D;
    return tl(x1, y1, x2, y2, w, '#c8743a') + `<path d="M${P(x1, y1)}L${P(x2, y2)}" fill="none" stroke="#e89a5a" stroke-width="${r(w * 0.3)}" opacity=".8" transform="translate(0 ${r(-w * 0.22)})"/>` +
      `<g transform="translate(${P(x2, y2)}) rotate(${r(a)})"><ellipse rx="${r(w * 0.34)}" ry="${r(w / 2 + 0.8)}" fill="#f6c98a" stroke-width="2"/><ellipse rx="${r(w * 0.15)}" ry="${r(w * 0.25)}" fill="none" stroke="#c8743a" stroke-width="1.2"/></g>`;
  };
  const ch_okuribi = wrap(`
<circle cx="50" cy="44" r="36" fill="#fff1b0" stroke="none" opacity=".6"/>
<path d="M50 8.5C57 20 69 23 69 38C72 32 76 31 78 25C84 40 82 58 68 70L32 70C18 58 17 41 23 28C26 34 30 37 33 39C32 26 42 20 50 8.5Z" fill="#ff5a3d"/>
<path d="M50 20C54 29 63 33 62 45C64 41 67 40 68 37C71 48 68 61 60 68L40 68C32 61 30 50 33 41C35 45 37 46 39 47C39 37 45 30 50 20Z" fill="#ff9a2e" stroke-width="2"/>
<path d="M50 34C53 41 58 44 57 53C57 59 54 64 50 65C45 64 42 59 43 53C43 45 47 41 50 34Z" fill="#ffe04d" stroke-width="1.8"/>
<path d="M50 46C52 50 53.5 53 53 57C52 60 48 60 47 57C46.5 53 48 50 50 46Z" fill="#fff6c0" stroke="none"/>
<path d="M30 70Q38 66 50 67Q62 66 70 70" fill="none" stroke-width="2.2"/>
${logE(20, 77, 64, 52, 8)}${logE(80, 77, 36, 52, 8)}
<path d="M14 82C14 75 22 72.5 32 72.5L68 72.5C78 72.5 86 75 86 82C86 89 78 91.5 66 91.5L34 91.5C22 91.5 14 89 14 82Z" fill="#cdc9e0"/>
<path d="M19.5 77.5C23 74.8 29 74.3 35 74.3L65 74.3C71 74.3 77 74.8 80.5 77.5C73 80 27 80 19.5 77.5Z" fill="#f1eff8" stroke="none" opacity=".9"/>
<path d="M86 81C86 89 78 91.5 66 91.5L42 91.5C62 89 80 88 86 81Z" fill="#7d77a6" stroke="none" opacity=".3"/>
<path d="M19 85Q34 88.5 50 88.5" fill="none" stroke="#fff" stroke-width="1.8" opacity=".55"/>
<circle cx="72" cy="84" r="1.2" fill="#8f89b3" stroke="none"/><circle cx="62" cy="88" r="1" fill="#8f89b3" stroke="none"/><circle cx="28" cy="82" r="1" fill="#8f89b3" stroke="none"/><circle cx="78" cy="79.6" r=".9" fill="#8f89b3" stroke="none"/><circle cx="40" cy="84.6" r=".9" fill="#8f89b3" stroke="none"/>
<circle cx="29" cy="16" r="2.2" fill="#ffb43d" stroke-width="1.4"/><circle cx="72" cy="12" r="1.8" fill="#ffe04d" stroke-width="1.4"/><circle cx="85" cy="42" r="1.6" fill="#ff8a3d" stroke-width="1.3"/><circle cx="15" cy="48" r="1.6" fill="#ffe04d" stroke-width="1.3"/>
${sp(13, 26, 3.6, '#fff')}${sp(87, 22, 4, '#ffd34d')}
`);

  /* ---------------- TSUNAMI ---------------- */
  const claw = (x, y, rot, s) => `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" d="M-3 0C-4.4 6 -1.6 11 5.6 11.6C3 10 1.6 8.6 2.6 6.4C1.6 4.6 2.4 2 3.2 0Z" fill="#fff" stroke-width="${r(1.8 / s)}"/>`;
  const wave = 'M8 88L8 82C20 80 34 74 42 62C48 52 49 40 42 34C36 29 26 32 24 40C23 45 25 49 29 51C22 55 12 50 10 38C8 22 26 8 46 8C66 8 82 22 88 40C91 52 92 70 92 88Z';
  const ch_tsunami = wrap(`
<path d="${wave}" fill="#2f7de1"/>
<path d="M29 51C25 49 23 45 24 40C26 32 36 29 42 34C49 40 48 52 42 62C38 68 33 71 28 71C25 64 27 56 29 51Z" fill="#9fe2ff" stroke-width="2"/>
<path d="M42 34C49 40 48 52 42 62C38 68 33 71 28 71C36 64 42 54 42 34Z" fill="#5fb6ff" stroke="none" opacity=".6"/>
<path d="M92 56C92 72 92 82 92 88L58 88C74 80 86 70 90 50Z" fill="#1d4fa8" stroke="none" opacity=".35"/>
<path d="M54 84C70 68 72 44 60 26M66 84C80 66 82 46 74 30M44 82C56 72 60 58 56 44" fill="none" stroke="#6fbaff" stroke-width="2.2"/>
${tp('M76 26C66 12 42 8 26 16C15 22 10.5 33 12.5 42C14 48 20 52 27.5 50.5', 4.4, '#fff')}
<circle cx="70" cy="17" r="2" fill="#fff" stroke-width="1.4"/><circle cx="62" cy="12.4" r="1.4" fill="#fff" stroke="none"/>
${claw(11.2, 40, -4, 0.72)}${claw(13, 45.4, -22, 0.78)}${claw(17.4, 49.6, -40, 0.74)}${claw(23, 51.8, -58, 0.68)}${claw(28.4, 51, -78, 0.58)}
<path d="M28 19Q34 15 42 13.6" fill="none" stroke="#bfe6ff" stroke-width="1.8"/>
<path d="M58 88C64 80 72 74 80 74C86 74 90 78 92 82L92 88Z" fill="#5fb6ff"/>
${tp('M64 82C70 76 78 74 84 76', 2.4, '#fff')}
<path d="M8 88Q14 84 20 88Q26 84 32 88Q38 84 44 88Q50 84 56 88" fill="none" stroke="#fff" stroke-width="2.4"/>
<circle cx="13" cy="15" r="2.4" fill="#fff" stroke-width="1.5"/><circle cx="20" cy="10" r="1.6" fill="#fff" stroke-width="1.3"/><circle cx="8.5" cy="22" r="1.4" fill="#fff" stroke-width="1.2"/>
${sp(88, 12, 4.4, '#ffd34d')}${sp(30, 80, 3.2, '#fff')}
`, 'translate(100 0) scale(-1 1)');

  /* ---------------- TYPHOON ---------------- */
  const arm = k => {
    const L = [], R = [], N = 18;
    for (let i = 0; i <= N; i++) {
      const t = i / N, th = (k * 120 + t * 210) * D, rr = 6 + 30 * t;
      const w = 13 * Math.pow(1 - t, 0.75) + 0.3;
      const x = 50 + rr * Math.cos(th), y = 50 + rr * Math.sin(th);
      const dx = 30 * Math.cos(th) - rr * 210 * D * Math.sin(th), dy = 30 * Math.sin(th) + rr * 210 * D * Math.cos(th);
      const m = Math.hypot(dx, dy), nx = -dy / m, ny = dx / m;
      L.push([x + nx * w / 2, y + ny * w / 2]); R.push([x - nx * w / 2, y - ny * w / 2]);
    }
    return 'M' + L.map(p => P(...p)).join('L') + 'L' + R.reverse().map(p => P(...p)).join('L') + 'Z';
  };
  const leaf = (x, y, rot, s, c) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 -8C5.5 -4 5.5 4 0 8C-5.5 4 -5.5 -4 0 -8Z" fill="${c}" stroke-width="${r(2 / s)}"/><path d="M0 -5V10" fill="none" stroke-width="${r(1.4 / s)}"/></g>`;
  const arcP = (cx, cy, rr, a, b) => `M${P(...pol(cx, cy, a, rr))}A${rr} ${rr} 0 0 1 ${P(...pol(cx, cy, b, rr))}`;
  const ch_taifu = wrap(`
<circle cx="50" cy="50" r="37" fill="#e6f6ff" stroke="none" opacity=".7"/>
${tp(arcP(50, 50, 41, 195, 250), 2.6, '#fff')}${tp(arcP(50, 50, 41, 15, 70), 2.6, '#fff')}${tp(arcP(50, 50, 41, 290, 320), 2.2, '#fff')}
<path d="${arm(0)}" fill="#6cc6ff"/><path d="${arm(1)}" fill="#a3defc"/><path d="${arm(2)}" fill="#b8a8ff"/>
<circle cx="50" cy="50" r="8.5" fill="#fff"/><circle cx="50" cy="50" r="3.6" fill="#6cc6ff" stroke-width="1.6"/>
${leaf(16.5, 17.5, 40, 1.12, '#6fd35f')}${leaf(83.5, 82.5, -30, 1.12, '#ffb43d')}${leaf(85.5, 21, 70, 0.9, '#a6e35a')}${leaf(15, 82, -60, 0.9, '#ff7a5a')}
`);

  /* ---------------- ECLIPSE ---------------- */
  const rays = (r0, rl, rs, h, n = 12) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const a = i * 360 / n, t = i % 2 ? rs : rl, m = (r0 + t) / 2;
      d += `M${P(...pol(50, 50, a - h, r0))}Q${P(...pol(50, 50, a - h * 0.3, m + 2))} ${P(...pol(50, 50, a + 6, t))}Q${P(...pol(50, 50, a + h * 0.45, m - 1))} ${P(...pol(50, 50, a + h, r0))}Z`;
    }
    return d;
  };
  const ch_nisshoku = wrap(`
<circle cx="50" cy="50" r="41" fill="#fff4c4" stroke="none" opacity=".8"/>
<path d="${rays(22, 42, 34, 13)}" fill="#ffbf3a" stroke-width="2.2"/>
<path d="${rays(22, 34, 29, 8)}" fill="#ffe96b" stroke="none"/>
<circle cx="50" cy="50" r="25" fill="#fff6b8"/>
<circle cx="45.5" cy="54.5" r="23" fill="#3b3f8f" stroke-width="2.2"/>
<path d="M28.5 49A17.5 17.5 0 0 1 41.5 37" fill="none" stroke="#6a74d8" stroke-width="3"/>
<path d="M66 64A22 22 0 0 1 40 76" fill="none" stroke="#2a2d6e" stroke-width="3" opacity=".5"/>
<circle cx="39" cy="51" r="4.4" fill="#5159b5" stroke="none"/><circle cx="51" cy="65" r="3.2" fill="#5159b5" stroke="none"/><circle cx="35" cy="64" r="2.2" fill="#5159b5" stroke="none"/><circle cx="55" cy="48" r="2" fill="#5159b5" stroke="none"/>
<circle cx="68.5" cy="31.5" r="6.5" fill="#fffbe0" stroke="none" opacity=".9"/>
${sp(68.5, 31.5, 8.5, '#fff')}${sp(15, 86, 3.4, '#fff')}${sp(85, 86.5, 3, '#ffd34d')}
`, 'rotate(-6 50 50)');

  /* ---------------- TENGU FAN ---------------- */
  const fanLeaf = (() => {
    const A = [-210, -180, -150, -120, -90, -60, -30, 0, 30], L = [30, 35, 38.5, 40.5, 41.5, 40.5, 38.5, 35, 30];
    const q = (a, rr) => P(...pol(0, 0, a, rr));
    const lobe = (a, l, n0, n1) => `L${q(a - 15, n0)}C${q(a - 18, l * 0.78)} ${q(a - 10, l * 1.02)} ${q(a, l)}C${q(a + 10, l * 1.02)} ${q(a + 18, l * 0.78)} ${q(a + 15, n1)}`;
    let d = `M${q(-228, 9)}`, v = '', sh = '', hi = '';
    A.forEach((a, i) => {
      const l = L[i], n0 = i ? 25 : 12, n1 = i < 8 ? 25 : 12;
      d += lobe(a, l, n0, n1);
      v += `M${q(a, 8)}L${q(a, l * 0.8)}`;
      if (i >= 6) sh += `M0 0${lobe(a, l, n0, n1)}Z`;
      if (i >= 1 && i <= 3) hi += `M${q(a - 7, 13)}L${q(a - 6, l * 0.72)}`;
    });
    d += `L${q(48, 9)}Q0 11 ${q(-228, 9)}Z`;
    return { d, v, sh, hi };
  })();
  const ch_tenguuchiwa = wrap(`
${tp('M75 21Q83 19 89 24', 2.4, '#fff')}${tp('M79 35Q85 34 89 38', 2.2, '#fff')}${tp('M71 11Q77 8.5 83 11', 2, '#fff')}
<g transform="translate(47 52) rotate(-12) scale(.93)">
${tl(0, 6, 0, 24, 7, '#ff4b5c')}
<path d="M-1.6 10V22" fill="none" stroke="#ffa0aa" stroke-width="1.6"/>
<path d="M-3.5 12.5L3.5 15M-3.5 18L3.5 20.5" fill="none" stroke-width="1.2" opacity=".4"/>
<rect x="-5.2" y="23" width="10.4" height="5.4" rx="2" fill="#ffcf3d" stroke-width="2"/>
${tassel(0, 31, '#7a63e0', '#ffcf3d', 0.6, 12)}
<path d="${fanLeaf.d}" fill="#4fc25a"/>
<path d="${fanLeaf.sh}" fill="#2c8a43" stroke="none" opacity=".22"/>
<path d="${fanLeaf.hi}" fill="none" stroke="#b6f08a" stroke-width="2.2" opacity=".9"/>
<path d="${fanLeaf.v}" fill="none" stroke="#2c8a43" stroke-width="1.5" opacity=".6"/>
<path d="${fanLeaf.d}" transform="scale(.82)" fill="none" stroke="#d9f7b0" stroke-width="1.7" stroke-dasharray="2.2 2.8" opacity=".9"/>
<path d="${fanLeaf.d}" fill="none"/>
<path d="M-5.5 3L-5 8.5H5L5.5 3Z" fill="#ffcf3d" stroke-width="2"/>
<circle cx="0" cy="0" r="7.2" fill="#ffcf3d" stroke-width="2.2"/>
<circle cx="0" cy="0" r="3.6" fill="#ff4b5c" stroke-width="1.6"/>
<circle cx="-2.2" cy="-2.6" r="1.4" fill="#fff" stroke="none" opacity=".8"/>
</g>
${sp(12, 20, 4.4, '#ffd34d')}${sp(86, 80, 3.6, '#fff')}${sp(15, 78, 3, '#fff')}
`);

  /* ---------------- LUCKY MALLET ---------------- */
  const coin = (x, y, s, rot) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><ellipse rx="7" ry="6" fill="#ffcf3d" stroke-width="${r(2 / s)}"/><rect x="-2" y="-2" width="4" height="4" fill="#fff8d6" stroke-width="${r(1.4 / s)}"/><path d="M-4.5 -2.5Q-3.5 -4.2 -1.5 -4.6" fill="none" stroke="#fff" stroke-width="${r(1.4 / s)}"/></g>`;
  const ch_uchide = wrap(`
${tp('M69 10Q85 13 89.5 28', 2.2, '#fff')}${tp('M78 9.5Q86 12 89 18.5', 1.8, '#fff')}
<g transform="translate(58 34) rotate(28)">
${tl(0, 14, 0, 44, 7, '#ff4b5c')}
<path d="M-3.5 20L3.5 23M-3.5 26L3.5 29M-3.5 32L3.5 35M-3.5 38L3.5 41" fill="none" stroke-width="1.2" opacity=".45"/>
<path d="M-1.8 18V42" fill="none" stroke="#ffa0aa" stroke-width="1.4"/>
<rect x="-6" y="13" width="12" height="5" rx="1.6" fill="#ffcf3d" stroke-width="2"/>
<rect x="-6" y="43" width="12" height="5" rx="1.6" fill="#ffcf3d" stroke-width="2"/>
<circle cx="0" cy="51" r="3.4" fill="#ffcf3d" stroke-width="2"/>
<path d="M-22 -15L22 -15A6 15 0 0 1 22 15L-22 15A6 15 0 0 1 -22 -15Z" fill="#ffc93d"/>
<rect x="-24" y="6" width="46" height="9" fill="#d98a1c" stroke="none" opacity=".3"/>
<rect x="-21" y="-11" width="42" height="4" rx="2" fill="#fff4b0" stroke="none" opacity=".85"/>
<path d="M-19 -15L-13 -15A6 15 0 0 1 -13 15L-19 15A6 15 0 0 0 -19 -15ZM9 -15L15 -15A6 15 0 0 1 15 15L9 15A6 15 0 0 0 9 -15Z" fill="#ff4b5c" stroke-width="2"/>
<path d="M-22 -15L22 -15A6 15 0 0 1 22 15L-22 15A6 15 0 0 1 -22 -15Z" fill="none"/>
<ellipse cx="22" cy="0" rx="6" ry="15" fill="#ffdf73"/>
<ellipse cx="22" cy="0" rx="3.6" ry="10" fill="#ff4b5c" stroke-width="1.8"/>
<ellipse cx="21" cy="-4" rx="1" ry="2.6" fill="#fff" stroke="none" opacity=".6"/>
${hoju(-2, 0.5, 1.05)}
</g>
${coin(18, 30, 1, -15)}${coin(24, 52, 0.75, 20)}
${sp(37, 13.5, 4.4, '#ffd34d')}${sp(11, 15, 3, '#fff')}${sp(14, 70, 3.6, '#ffd34d')}${sp(84, 64, 4, '#fff')}${sp(70, 84, 3, '#ffd34d')}
`);

  /* ---------------- TREASURE SHIP ---------------- */
  const hull = 'M9 52C9 62 14 74 26 80Q32 83 40 83L64 83Q76 83 82 76C88 68 92 58 91 46C90 41.5 85.5 41.5 85 46C84 55 80 62 72 64L26 64C18 64 14 58 14 52Q12 49 9 52Z';
  const ch_takarabune = wrap(`
${tl(50, 64, 50, 11, 3.2, '#c8743a')}
<path d="M51 10Q62 6 72 11Q64 12.5 58 16.5Q55 13.5 51 14Z" fill="#ff4b5c" stroke-width="2"/>
<circle cx="50" cy="10.6" r="2.4" fill="#ffcf3d" stroke-width="1.8"/>
<path d="M29 16Q50 13 71 16Q75 33 71 50Q50 47 29 50Q33 33 29 16Z" fill="#fff2c4"/>
<path d="M71 16Q75 33 71 50Q60 48 58 48Q64 33 62 15Z" fill="#c9a86a" stroke="none" opacity=".25"/>
<path d="M31 25Q50 22.5 72 25M32 34Q50 31.5 73 34M31 43Q50 40.5 72 43" fill="none" stroke="#c8743a" stroke-width="1.3" opacity=".5"/>
<circle cx="50" cy="31" r="8.6" fill="#ff4b5c" stroke-width="2"/>
${hoju(50, 31.5, 0.7, '#fff4d6', '#ffcf3d')}
${tl(26, 15.5, 74, 15.5, 2.6, '#c8743a')}
<path d="M36 64Q37 51 50 49Q63 51 64 64Z" fill="#ffcf3d"/>
<path d="M41 58.5h5M47 54h5M53 59h5M44 62h4" fill="none" stroke="#d99a1c" stroke-width="1.6"/>
<path d="M43 54Q46 51.5 50 51" fill="none" stroke="#fff6c0" stroke-width="1.8"/>
<g transform="translate(29 58) rotate(-8)"><rect x="-9" y="-6" width="18" height="12" rx="5.5" fill="#f2d48c"/><path d="M-4 -6V6M3 -6V6" fill="none" stroke="#c8743a" stroke-width="1.8"/><ellipse cx="-7.6" cy="0" rx="2" ry="5" fill="#e3bd6c" stroke-width="1.4"/></g>
<g transform="translate(70 56)"><circle r="7.5" fill="#ffe36b" stroke="none" opacity=".6"/>${hoju(0, 0, 0.95, '#8fdcff', '#ff4b5c')}</g>
<path d="${hull}" fill="#ff5a4a"/>
<path d="M14 66C18 76 26 81 36 82L66 82Q76 82 82 76Q74 79 62 79L38 79C28 79 20 74 14 66Z" fill="#b8243a" stroke="none" opacity=".3"/>
${tp('M16 64.5Q22 70 32 70L68 70Q79 69 85 57', 2.4, '#ffcf3d')}
<circle cx="38" cy="76" r="1.6" fill="#ffcf3d" stroke-width="1.2"/><circle cx="50" cy="76" r="1.6" fill="#ffcf3d" stroke-width="1.2"/><circle cx="62" cy="76" r="1.6" fill="#ffcf3d" stroke-width="1.2"/>
<path d="M87 47.5Q88.5 45 89.5 47" fill="none" stroke="#ffcf3d" stroke-width="1.6"/>
${tp('M16 88Q22 83.5 28 87M72 87Q78 83.5 84 88', 2.2, '#fff')}
${sp(14, 22, 4, '#ffd34d')}${sp(86, 26, 3.6, '#fff')}${sp(88, 88, 3, '#fff')}
`);

  /* ---------------- INARI SUSHI ---------------- */
  const pores = pts => pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r=".9" fill="#f3b864" stroke="none"/>`).join('');
  // upright open pouch showing rice
  const openPouch = tf => `<g transform="${tf}">
<path d="M-13.5 -9C-17.5 -3 -18 7 -15.5 13Q-13 17.5 -6 17.5Q0 16.5 6 17.5Q13 17.5 15.5 13C18 7 17.5 -3 13.5 -9Z" fill="#e3922f"/>
<path d="M15.5 13C18 7 17.5 -3 13.5 -9C14.5 1 13 10 8 17.4Q13 17.5 15.5 13Z" fill="#9a4f14" stroke="none" opacity=".35"/>
<path d="M-13 0Q-14 7 -12 11.5" fill="none" stroke="#ffe3a8" stroke-width="2.4"/>
<path d="M-6 4q2 1.6 3.6 0M3 9q2 1.6 3.6 0M-8 12q1.8 1.4 3.2 0" fill="none" stroke="#a8561a" stroke-width="1.3" opacity=".6"/>
${pores([[-4, 9], [5, 4], [9, 12], [0, 14], [-10, 6]])}
<path d="M-11 -9C-11.5 -15 -5 -18.5 0 -16.5C5 -18.5 11.5 -15 11 -9Z" fill="#fffdf7" stroke-width="1.8"/>
<path d="M-7 -13q1.6 -1.4 3.4 -.4M4.5 -14q1.6 -1 3 .4" fill="none" stroke-width="1" opacity=".4"/>
<ellipse cx="-7" cy="-10.6" rx=".55" ry=".9" fill="#2b2340" stroke="none" transform="rotate(30 -7 -10.6)"/><ellipse cx="7.6" cy="-10.2" rx=".55" ry=".9" fill="#2b2340" stroke="none" transform="rotate(-30 7.6 -10.2)"/><ellipse cx="-3" cy="-9.8" rx=".55" ry=".9" fill="#2b2340" stroke="none"/>
<path d="M1 -11.5Q-1 -17.5 -6.5 -18Q-6 -12.5 1 -11.5ZM1.5 -11.5Q3.5 -17 9 -16.6Q8 -11.6 1.5 -11.5Z" fill="#6fd35f" stroke-width="1.4"/><path d="M1 -11.5L-3.6 -15.6M1.5 -11.5L6 -14.6" fill="none" stroke="#2c8a43" stroke-width="1" opacity=".7"/>
<path d="M-14.5 -9.5Q-7 -4.5 0 -6Q7 -4.5 14.5 -9.5Q15 -5.5 12 -3.6Q6 -1.2 0 -2.6Q-6 -1.2 -12 -3.6Q-15 -5.5 -14.5 -9.5Z" fill="#f6b54c" stroke-width="1.8"/>
</g>`;
  // classic lying pillow pouch
  const pillow = tf => `<g transform="${tf}">
<path d="M-18 -9Q-2 -12.5 16 -9.5Q21 -8 20.5 -1Q21 7 17 10Q0 13 -17 10.5Q-21.5 8 -21 0Q-21.5 -7 -18 -9Z" fill="#e3922f"/>
<path d="M-17 -6.5Q0 -9.6 15.5 -7Q18.5 -4.6 16.5 -1.8Q0 .4 -16.5 -1.2Q-19.4 -3.8 -17 -6.5Z" fill="#f6b54c" stroke="none" opacity=".85"/>
<path d="M-21 2Q-20 8 -17 10.5Q0 13 17 10Q19.5 8 20.5 4Q10 9 -2 9Q-14 8.5 -21 2Z" fill="#9a4f14" stroke="none" opacity=".35"/>
<path d="M-14 -4.4Q-6 -6.8 4 -6.4" fill="none" stroke="#fff4d6" stroke-width="2.2"/>
<path d="M-12 3q2.2 1.8 4.4 0M-1 5q2.2 1.8 4.4 0M8 2q2 1.6 4 0M-6 -3q2 1.4 4 0M6 -4q2 1.4 4 0" fill="none" stroke="#a8561a" stroke-width="1.3" opacity=".6"/>
${pores([[-15, 5], [4, 2], [11, 6]])}
<path d="M14 -8.5Q17 0 14.6 10" fill="none" stroke="#a8561a" stroke-width="1.5" opacity=".7"/>
</g>`;
  const ch_inarizushi = wrap(`
<ellipse cx="50" cy="78" rx="35" ry="11" fill="#c7d3f5"/>
<ellipse cx="50" cy="73" rx="41" ry="14" fill="#fffdf7"/>
<path d="M91 73A41 14 0 0 1 9 73A41 15.5 0 0 0 91 73Z" fill="#b9c6ee" stroke="none" opacity=".5"/>
<ellipse cx="50" cy="73" rx="31" ry="9.5" fill="none" stroke="#3d8bff" stroke-width="1.6"/>
${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => `<circle cx="${r(50 + 36 * Math.cos(a * D))}" cy="${r(73 + 11.8 * Math.sin(a * D))}" r="1.3" fill="#3d8bff" stroke="none"/>`).join('')}
<path d="M12 64Q46 46 90 54Q54 60 12 64Z" fill="#5ccf5a" stroke-width="2.2"/>
<path d="M16 63Q50 53 86 54.5" fill="none" stroke="#2c8a43" stroke-width="1.3" opacity=".7"/>
${openPouch('translate(63 50) rotate(8) scale(1.22)')}
${pillow('translate(40 67) rotate(-6) scale(1.26)')}
<g transform="translate(82 75)"><path d="M-6 1Q-6.5 -5.5 0 -6Q2 -1.5 -6 1Z" fill="#ff9fb5" stroke-width="1.6"/><path d="M-2 3.5Q-1 -2.5 5.5 -1.5Q5 2.6 -2 3.5Z" fill="#ffb8c8" stroke-width="1.6"/></g>
${sp(15, 26, 4, '#fff')}${sp(88, 26, 3.6, '#ffd34d')}${sp(36, 36, 3, '#fff')}
`);

  /* ---------------- SHADOW CLONE ---------------- */
  const hands = (sk, sh, sl, cf, nl, full) => `
<path d="M-16 12L-4 17L-6.6 38L-21.6 35.4Z" fill="${sl}"/><path d="M16 12L4 17L6.6 38L21.6 35.4Z" fill="${sl}"/>
<path d="M-17.5 9.5L-3 14.5L-5 21L-20 16Z" fill="${cf}" stroke-width="2"/><path d="M17.5 9.5L3 14.5L5 21L20 16Z" fill="${cf}" stroke-width="2"/>
<path d="M-7 -4V-26Q-7 -31.5 -3.5 -31.5Q0 -31.5 0 -26V-4Z" fill="${sk}"/><path d="M0 -4V-26Q0 -31.5 3.5 -31.5Q7 -31.5 7 -26V-4Z" fill="${sk}"/>
${full ? `<path d="M3.5 -31.5Q7 -31.5 7 -26V-6L3 -6Z" fill="${sh}" stroke="none" opacity=".4"/><path d="M-5.4 -25.5Q-5.4 -29.2 -3.5 -29.2Q-1.6 -29.2 -1.6 -25.5Z" fill="${nl}" stroke-width="1.1"/><path d="M1.6 -25.5Q1.6 -29.2 3.5 -29.2Q5.4 -29.2 5.4 -25.5Z" fill="${nl}" stroke-width="1.1"/>` : ''}
<path d="M-18.5 -3C-20 5 -18 13 -12 17C-6 20.5 6 20.5 12 17C18 13 20 5 18.5 -3C17.5 -8.5 13.5 -10 10.5 -8C8 -11 -8 -11 -10.5 -8C-13.5 -10 -17.5 -8.5 -18.5 -3Z" fill="${sk}"/>
${full ? `<path d="M13 17C18 13 20 5 18.5 -3C18 6 15 12 8 16Z" fill="${sh}" stroke="none" opacity=".45"/><path d="M-10.5 -8Q-11.5 -5 -10 -2.5M10.5 -8Q11.5 -5 10 -2.5M-19 3Q-15 5 -12 3.5M-18.4 9.5Q-14.5 11.5 -11.5 10M19 3Q15 5 12 3.5M18.4 9.5Q14.5 11.5 11.5 10" fill="none" stroke-width="1.5"/>` : ''}
${tl(9, 11, -1.5, -6, 6.2, sk)}${tl(-9, 11, 1.5, -6, 6.2, sk)}
${full ? `<path d="M-3.4 -3.6L0.4 -7.6" fill="none" stroke="${nl}" stroke-width="2.4"/>` : ''}`;
  const ghost = ['#c4b8ff', '#5b4bb5', '#6a5ad0', '#e4dcff', '#efeaff'];
  const ch_kagebunshin = wrap(`
<g transform="translate(25 53) rotate(-9) scale(.84)" opacity=".5">${hands(...ghost, 0)}</g>
<g transform="translate(75 53) rotate(9) scale(.84)" opacity=".5">${hands(...ghost, 0)}</g>
${cloud([[16, 81, 6.5], [23.5, 85, 5.8], [13.5, 87.5, 3.4], [31, 87.5, 3.2]], '#ebe8f5')}${cloud([[84, 81, 6.5], [76.5, 85, 5.8], [86.5, 87.5, 3.4], [69, 87.5, 3.2]], '#ebe8f5')}
<g transform="translate(50 53)">${hands('#ffd2ae', '#e0956a', '#3b3f8f', '#fffdf7', '#fff1e6', 1)}</g>
${sp(16, 18, 4, '#b8a8ff')}${sp(84, 18, 4.2, '#ffd34d')}
`);

  Object.assign(window.ICON_ART, { ch_hitogata, ch_kemuridama, ch_kunai, ch_okuribi, ch_tsunami, ch_taifu, ch_nisshoku, ch_tenguuchiwa, ch_uchide, ch_takarabune, ch_inarizushi, ch_kagebunshin });
})();
