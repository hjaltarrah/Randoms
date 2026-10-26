/* Kizuna Clash: charm card icons, set 6 (flat SVG, 100x100 box). */
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
  // outlined union of circles (clouds, puffs)
  const blob = (cs, f, w = 2.6) => cs.map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${f}" stroke-width="${w * 2}"/>`).join('') +
    cs.map(([x, y, rr]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${f}" stroke="none"/>`).join('');
  // pentagram outline
  const pent = (x, y, R) => {
    const p = [];
    for (let i = 0; i < 5; i++) { const a = (-90 + i * 144) * D; p.push(P(x + R * Math.cos(a), y + R * Math.sin(a))); }
    return 'M' + p.join('L') + 'Z';
  };
  // three-comma tomoe crest, radius ~12 at scale 1
  const tomoe = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">` + [0, 120, 240].map(a =>
    `<path transform="rotate(${a})" d="M0 -12A6 6 0 0 1 0 0A6 6 0 0 0 -10.4 6A12 12 0 0 1 0 -12Z" fill="${c}" stroke-width="${r(1.4 / s)}"/>`).join('') + '</g>';
  const dots = (pts, f = '#fff', rr = 1.5) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${rr}" fill="${f}" stroke="none"/>`).join('');

  /* ---------------- SEALING OFUDA ---------------- */
  const ch_fuin = wrap(`
<g transform="translate(50 50) rotate(-13)">
<rect x="-20.5" y="-42" width="41" height="84" rx="10" fill="#fff" stroke="none" opacity=".5"/>
<path d="M-16 -39H16C18.5 -14 14 12 17.5 39H-14.5C-12 14 -18.5 -12 -16 -39Z" fill="#fffaf0"/>
<path d="M17.5 39C14 12 18.5 -14 16 -39L11.5 -39C13.5 -12 9.5 14 13 39Z" fill="#c9bfe6" stroke="none" opacity=".5"/>
<path d="M-11.8 -35H12C13.8 -12 10.4 11 13.2 35H-10.5C-8.6 12 -14 -12 -11.8 -35Z" fill="none" stroke="#ff4b5c" stroke-width="1.6"/>
<path d="M-8 -29Q-10.5 -24.5 -8 -20M8.4 -29Q10.9 -24.5 8.4 -20" fill="none" stroke="#e8364a" stroke-width="2"/>
<circle cx="0" cy="-24.5" r="5.6" fill="#ff4b5c" stroke-width="1.8"/>
<circle cx="0" cy="-24.5" r="2.2" fill="#fff" stroke="none"/>
<path d="M0.5 -15Q5.8 -10.5 0.5 -6Q-4.8 -1.5 0.5 3Q5.8 7.5 0.5 12" fill="none" stroke="#e8364a" stroke-width="3.2"/>
<path d="M-6.5 -12.5L-4.5 -10.5M7 -3.5L5 -1.5M-6.5 5.5L-4.5 7.5" fill="none" stroke="#e8364a" stroke-width="2.2"/>
${dots([[7, -12], [-6, -2.5], [7.4, 7]], '#e8364a')}
<circle cx="1" cy="25" r="9.4" fill="#ff4b5c" stroke-width="2"/>
<circle cx="1" cy="25" r="7.2" fill="none" stroke="#fff" stroke-width="1.2"/>
<path d="${pent(1, 25.3, 5.8)}" fill="none" stroke="#fff" stroke-width="1.5"/>
</g>
${sp(85, 14, 5, '#ffd34d')}${sp(15, 20, 3.6, '#fff')}${sp(86, 86, 3.6, '#fff')}${sp(14, 84, 4, '#ffd34d')}
`);

  /* ---------------- KANASHIBARI CHAINS ---------------- */
  const chain = (cx, cy, rx, ry, n, front) => {
    let rings = '', bars = '';
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n * 2 * Math.PI;
      if ((Math.sin(t) > 0) !== front) continue;
      const x = cx + rx * Math.cos(t), y = cy + ry * Math.sin(t);
      const ang = Math.atan2(ry * Math.cos(t), -rx * Math.sin(t)) / D;
      const g = front ? '#ffcf3d' : '#eaa62a';
      const tf = `transform="translate(${r(x)} ${r(y)}) rotate(${r(ang)})"`;
      if (i % 2 === 0) rings += `<g ${tf}><ellipse rx="5.8" ry="3.6" fill="none" stroke-width="5.6"/><ellipse rx="5.8" ry="3.6" fill="none" stroke="${g}" stroke-width="2.8"/>${front ? '<path d="M-3.6 -2.2Q-1.6 -3 .6 -3" fill="none" stroke="#fff8c8" stroke-width="1.2"/>' : ''}</g>`;
      else bars += `<g ${tf}><path d="M-5.4 0H5.4" fill="none" stroke-width="6"/><path d="M-5.4 0H5.4" fill="none" stroke="${g}" stroke-width="3.2"/></g>`;
    }
    return rings + bars;
  };
  const CK = [50, 54, 37.5, 14, 18];
  const ch_kanashibari = wrap(`
<circle cx="50" cy="50" r="33" fill="#fff" opacity=".45" stroke="none"/>
<g transform="rotate(-15 50 54)">
<ellipse cx="${CK[0]}" cy="${CK[1]}" rx="${CK[2]}" ry="${CK[3]}" fill="none" stroke="#fff3a8" stroke-width="13" opacity=".85"/>
${chain(...CK, false)}
</g>
<g transform="rotate(7 50 50)">
<rect x="38.5" y="11" width="23" height="78" rx="1.5" fill="#fffaf0"/>
<rect x="55" y="12.4" width="5.2" height="75.2" fill="#c9bfe6" stroke="none" opacity=".5"/>
<rect x="42" y="14.5" width="16" height="71" fill="none" stroke="#a07cff" stroke-width="1.4"/>
<circle cx="50" cy="23.5" r="4.8" fill="#a07cff" stroke-width="1.8"/><circle cx="50" cy="23.5" r="1.9" fill="#fff" stroke="none"/>
<path d="M50 31V37M50 61V68" fill="none" stroke="#7a5cff" stroke-width="2.4"/>
<path d="M50.5 47.5C53.5 47.5 54 51.5 51 52C47 52.5 46 46.5 50 44.5C55 42.5 58.5 48.5 55.5 53.5C52.5 58.5 44.5 57.5 43.5 51.5C42.5 45 46.5 40.5 51 40" fill="none" stroke="#7a5cff" stroke-width="2.4"/>
<circle cx="50" cy="77.5" r="4.4" fill="#ff4b5c" stroke-width="1.6"/>
</g>
<g transform="rotate(-15 50 54)">
${chain(...CK, true)}
</g>
${sp(87, 16, 5, '#ffd34d')}${sp(13, 22, 3.6, '#fff')}${sp(86, 86, 3.6, '#fff')}${sp(14, 84, 4, '#ffd34d')}
`);

  /* ---------------- TOLL GATE ---------------- */
  let tiles = '';
  for (let x = 28; x <= 72; x += 5.5) tiles += `M${r(x)} 15.5L${r(50 + (x - 50) * 1.62)} 27`;
  let stripes = '';
  for (let x = 14; x < 88; x += 12) stripes += `M${r(x)} 60.2h6v7.6h-6Z`;
  const ch_sekisho = wrap(`
<rect x="17" y="84" width="15" height="7" rx="2" fill="#c9c3dd"/><rect x="68" y="84" width="15" height="7" rx="2" fill="#c9c3dd"/>
<rect x="20.5" y="32" width="8.5" height="54" fill="#e3a05c"/><rect x="71" y="32" width="8.5" height="54" fill="#e3a05c"/>
<path d="M23 38V82M73.5 38V82" fill="none" stroke="#ffd09c" stroke-width="1.8"/>
<path d="M27 38V84M77.5 38V84" fill="none" stroke="#b5662c" stroke-width="1.6" opacity=".6"/>
<rect x="12" y="27" width="76" height="7.5" rx="2" fill="#d9894a"/>
<path d="M15 29.5H84" fill="none" stroke="#ffc58a" stroke-width="1.6"/>
<path d="M25 14H75L85.5 25Q89 27 92.5 25L91 30.5H9L7.5 25Q11 27 14.5 25Z" fill="#5f73d6"/>
<path d="${tiles}" fill="none" stroke="#9fb0ff" stroke-width="1.6"/>
<path d="M11 29H89" fill="none" stroke="#3b3f8f" stroke-width="1.4" opacity=".5"/>
<rect x="22" y="10" width="56" height="5.5" rx="2.5" fill="#3b4aa8"/>
<circle cx="23" cy="12.5" r="3.6" fill="#ffcf3d" stroke-width="2"/><circle cx="77" cy="12.5" r="3.6" fill="#ffcf3d" stroke-width="2"/>
<path d="M50 34.5V38.5" fill="none" stroke-width="1.8"/>
<circle cx="50" cy="46.5" r="12" fill="#fff3a8" opacity=".6" stroke="none"/>
<path d="M50 39C57 39 59 43 59 47C59 51 57 54.5 50 54.5C43 54.5 41 51 41 47C41 43 43 39 50 39Z" fill="#ff4b4b" stroke-width="2.2"/>
<ellipse cx="47.5" cy="45.5" rx="3.2" ry="4.2" fill="#ffb36b" stroke="none" opacity=".75"/>
<path d="M42 44Q50 46 58 44M41.5 50.5Q50 52.5 58.5 50.5" fill="none" stroke-width="1.1" opacity=".45"/>
<rect x="45" y="37.3" width="10" height="3.4" rx="1" fill="#3a3152" stroke-width="1.6"/><rect x="45" y="53.3" width="10" height="3.4" rx="1" fill="#3a3152" stroke-width="1.6"/>
<rect x="8" y="60.2" width="84" height="7.6" rx="3.8" fill="#fff4dc"/>
<path d="${stripes}" fill="#ff4b5c" stroke="none"/>
<path d="M12 62.4H88" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7"/>
<rect x="8" y="60.2" width="84" height="7.6" rx="3.8" fill="none"/>
<rect x="18.5" y="58" width="12.5" height="12" rx="2" fill="#8a5a3a" stroke-width="2"/><rect x="69" y="58" width="12.5" height="12" rx="2" fill="#8a5a3a" stroke-width="2"/>
<circle cx="24.7" cy="64" r="1.8" fill="#ffcf3d" stroke-width="1.2"/><circle cx="75.2" cy="64" r="1.8" fill="#ffcf3d" stroke-width="1.2"/>
${sp(50, 78, 4, '#ffd34d')}${sp(10, 46, 3.2, '#fff')}${sp(90, 44, 3.2, '#fff')}
`, 'translate(0 -.5) rotate(-3 50 50)');

  /* ---------------- OIL JAR ---------------- */
  const jar = 'M38 31C38 36 34 38 28 42C18 48 15.5 62 19.5 72C23.5 82 31 88 40 89H58C67 88 74.5 82 78.5 72C82.5 62 80 48 70 42C64 38 60 36 60 31Z';
  const ch_abura = wrap(`
<path d="${jar}" fill="#f2c08e"/>
<path d="M38 31C38 36 34 38 28 42C18 48 15.5 62 18.5 69Q24 66 29 70Q35 74 41 69Q47 64 53 69Q59 74 65 69Q71 65 79.2 69C81 60 79 48 70 42C64 38 60 36 60 31Z" fill="#4b6ed8" stroke-width="2"/>
<path d="M78.5 72C74.5 82 67 88 58 89H48C60 86 70 80 74 70C78 60 77 50 71 43C79 49 82 61 78.5 72Z" fill="#2b2340" stroke="none" opacity=".16"/>
<path d="M27 48C22.5 53 21.5 58.5 22.5 63" fill="none" stroke="#a9c2ff" stroke-width="3.2"/>
<ellipse cx="33" cy="45.5" rx="2.6" ry="1.6" transform="rotate(-30 33 45.5)" fill="#fff" stroke="none" opacity=".9"/>
<path d="M27 77Q33 83 40 84.5" fill="none" stroke="#fff" stroke-width="2" opacity=".55"/>
<path d="${jar}" fill="none"/>
${tp('M36.5 37.5Q31.5 42 33 48.5', 1.8, '#f2d08c')}${tp('M37.5 38Q37.5 44 40.5 48', 1.8, '#f2d08c')}
<path d="M37.8 33.5Q49 37.5 60.2 33.5L60.8 38Q49 42.5 37.2 38Z" fill="#f2d08c" stroke-width="1.8"/>
<path d="M41 36.7L43 38.6M45 37.2L47 39.1M49 37.4L51 39.3M53 37.2L55 39.1" fill="none" stroke="#c4904a" stroke-width="1.2"/>
<circle cx="37.3" cy="36.6" r="3" fill="#f2d08c" stroke-width="1.8"/>
<rect x="34" y="22" width="30" height="10" rx="4.5" fill="#5f82ea"/>
<ellipse cx="49" cy="23.2" rx="13.2" ry="3.8" fill="#86a3ff" stroke-width="2"/>
<ellipse cx="49" cy="23.4" rx="9.4" ry="2.3" fill="#ffc23a" stroke-width="1.4"/>
<path d="M44 26.5Q45.5 33 46.5 38Q47.5 46 49 51Q51.5 55.5 54 51Q55 46 57 44Q61 47 62 56Q62.5 66 63 70Q64 76.5 68.5 75.8Q72.5 74.5 71.2 68Q69.5 58 68 48Q66 40 61.5 35Q59.5 31 59.5 26.5Q52 28.5 44 26.5Z" fill="#ffc23a" stroke-width="2.2"/>
<path d="M47.5 30Q48.5 38 50 45M63.8 50Q65 58 65.5 66" fill="none" stroke="#fff6c0" stroke-width="2" opacity=".95"/>
<path d="M60 33Q63 37 64.5 42" fill="none" stroke="#e89a1a" stroke-width="1.6" opacity=".6"/>
${dots([[67.5, 71.5], [51.6, 50.2]], '#fff', 1.2)}
<path d="M77 80C78 82.6 80.5 84.8 80.5 87.2A3.6 3.6 0 0 1 73.3 87.2C73.3 84.8 76 82.6 77 80Z" fill="#ffc23a" stroke-width="1.8"/>
<circle cx="75.8" cy="86.6" r="1" fill="#fff" stroke="none"/>
${sp(16, 20, 4.4, '#ffd34d')}${sp(84, 16, 3.6, '#fff')}${sp(88, 60, 3, '#fff')}
`, 'rotate(-6 50 56)');

  /* ---------------- SUMMONING SCROLL ---------------- */
  const puff = [[50, 58, 5], [49, 51, 7.5], [50, 39, 15], [35, 42, 10.5], [65, 41, 11], [39, 27, 12], [61, 26, 12], [50, 17, 11], [25, 31, 7.5], [76, 30, 7.5]];
  const roller = x => `<rect x="${x - 4.5}" y="59" width="9" height="30" rx="3.5" fill="#fff4d6"/><path d="M${x + 1.5} 61V87" fill="none" stroke="#e3cfa2" stroke-width="2.4"/><rect x="${x - 3}" y="54.5" width="6" height="5" rx="1.5" fill="#e2483d" stroke-width="2"/><rect x="${x - 3}" y="88.5" width="6" height="5" rx="1.5" fill="#e2483d" stroke-width="2"/>`;
  const ch_kuchiyose = wrap(`
<g transform="translate(0 2.5)">
${blob(puff, '#a98bff')}
<path d="M34 38C30 33 31 28 35 26M45 22C46 17 52 14 56 17" fill="none" stroke="#d9cbff" stroke-width="2.4"/>
<path d="M64 52C70 50 74 46 74 41M57 48C63 48 66 44 65 40" fill="none" stroke="#7d5fe0" stroke-width="1.8" opacity=".7"/>
<path d="M50 40.5C50 37 54 36.5 55 39.5C56 43.5 50 45.5 46.5 42.5C42.5 39 46 32.5 52 33C59 33.5 61 41 57.5 46" fill="none" stroke="#fff" stroke-width="2.2" opacity=".85"/>
</g>
<circle cx="18" cy="18" r="3.4" fill="#c9b5ff" stroke-width="2"/><circle cx="84" cy="15" r="2.8" fill="#c9b5ff" stroke-width="2"/><circle cx="86" cy="46" r="2.4" fill="#c9b5ff" stroke-width="1.8"/>
<g transform="translate(0 -3.5) rotate(-5 50 74)">
<rect x="16" y="62" width="68" height="23" fill="#fff4d6"/>
<path d="M18 65.5H82M18 81.5H82" fill="none" stroke="#5b7cff" stroke-width="2"/>
<path d="M22 70.5H34M22 75H31M22 78H33M66 70.5H78M69 75H78M67 78H78" fill="none" stroke="#c7b8e8" stroke-width="1.6"/>
<ellipse cx="50" cy="73.5" rx="12" ry="5.6" fill="none" stroke="#a07cff" stroke-width="2"/>
<ellipse cx="50" cy="73.5" rx="7" ry="3" fill="#e4d9ff" stroke="#a07cff" stroke-width="1.4"/>
<path d="M16 84H84" fill="none" stroke="#e3cfa2" stroke-width="2" opacity=".8"/>
<rect x="16" y="62" width="68" height="23" fill="none"/>
${roller(15)}${roller(85)}
</g>
${star5(14, 52, 4, '#ffd34d', 10, 1.6)}${sp(88, 70, 3.4, '#fff')}${sp(30, 11, 3.2, '#fff')}${sp(72, 10.5, 3.6, '#ffd34d')}
`);

  /* ---------------- KIZUNA KNOT (mizuhiki) ---------------- */
  // Catmull-Rom cord with automatic alternating over/under at every self-crossing.
  const cord = (pts, W, colorAt, cuts) => {
    const n = pts.length, S = n - 1;
    const at = i => pts[Math.max(0, Math.min(n - 1, i))];
    const segs = [];
    for (let i = 0; i < S; i++) {
      const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      segs.push([p1, [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6], p2]);
    }
    const bz = (s, t) => { const u = 1 - t; return [0, 1].map(k => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k]); };
    const K = 16, sm = [];
    for (let i = 0; i < S; i++) for (let j = 0; j < K; j++) sm.push(bz(segs[i], j / K));
    sm.push(segs[S - 1][3]);
    const M = sm.length - 1, ev = [];
    for (let a = 0; a < M; a++) for (let b = a + 2; b < M; b++) {
      const p = sm[a], q = sm[a + 1], u = sm[b], v = sm[b + 1];
      const d = (q[0] - p[0]) * (v[1] - u[1]) - (q[1] - p[1]) * (v[0] - u[0]);
      if (Math.abs(d) < 1e-9) continue;
      const s = ((u[0] - p[0]) * (v[1] - u[1]) - (u[1] - p[1]) * (v[0] - u[0])) / d;
      const t = ((u[0] - p[0]) * (q[1] - p[1]) - (u[1] - p[1]) * (q[0] - p[0])) / d;
      if (s >= 0 && s < 1 && t >= 0 && t < 1) ev.push((a + s) / K, (b + t) / K);
    }
    ev.sort((x, y) => x - y);
    const E = ev.length, B = [0];
    for (let k = 0; k < E - 1; k++) B.push((ev[k] + ev[k + 1]) / 2);
    B.push(S);
    const split = (s, t) => {
      const L = (a, b) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      const a = L(s[0], s[1]), b = L(s[1], s[2]), c = L(s[2], s[3]), d = L(a, b), e = L(b, c), f = L(d, e);
      return [[s[0], a, d, f], [f, e, c, s[3]]];
    };
    const sub = (g0, g1) => {
      let d = '';
      for (let i = Math.floor(g0); i < g1 - 1e-6; i++) {
        const t0 = Math.max(0, g0 - i), t1 = Math.min(1, g1 - i);
        if (t1 - t0 < 1e-4) continue;
        let s = segs[i];
        if (t1 < 1) s = split(s, t1)[0];
        if (t0 > 0) s = split(s, t0 / t1)[1];
        d += (d ? '' : 'M' + P(...s[0])) + 'C' + P(...s[1]) + ' ' + P(...s[2]) + ' ' + P(...s[3]);
      }
      return d;
    };
    const ol = ['', ''], col = [{}, {}], ex = 0.14;
    for (let k = 0; k <= E; k++) {
      const pass = k % 2, g0 = B[k], g1 = B[k + 1];
      ol[pass] += sub(Math.max(0, g0 - 0.04), Math.min(S, g1 + 0.04));
      const bs = [g0, ...cuts.filter(c => c > g0 && c < g1), g1];
      for (let i = 0; i < bs.length - 1; i++) {
        const a = bs[i] === g0 && g0 > 0 ? g0 - ex : bs[i], b = bs[i + 1] === g1 && g1 < S ? g1 + ex : bs[i + 1];
        const c = colorAt((bs[i] + bs[i + 1]) / 2);
        col[pass][c] = (col[pass][c] || '') + sub(a, b);
      }
    }
    const end = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], m = Math.hypot(dx, dy), h = (W + 2.6) / 2; return `M${P(p[0] - dy / m * h, p[1] + dx / m * h)}L${P(p[0] + dy / m * h, p[1] - dx / m * h)}`; };
    return { ol, col, ends: end(pts[0], bz(segs[0], 0.05)) + end(pts[n - 1], bz(segs[S - 1], 0.95)), E };
  };
  const RED = '#ff4b5c', WHT = '#fffaf2';
  const LINE = { [RED]: '#c42a3a', [WHT]: '#c9bfe0' };
  const half = [[30, 87], [38.5, 81.5], [50, 75], [63, 66], [77.5, 65], [87.5, 53.5], [86.5, 38.5], [76, 29], [62, 33], [50, 45], [39, 54], [30, 44], [31, 27], [39, 15], [50, 10.5]];
  const knotPts = half.concat(half.slice(0, -1).reverse().map(([x, y]) => [100 - x, y]));
  const KN = cord(knotPts, 6.8, g => g < 14 ? RED : WHT, [14]);
  let knotSvg = '';
  for (const pass of [0, 1]) {
    knotSvg += `<path d="${KN.ol[pass]}" fill="none" stroke-width="9.6" stroke-linecap="butt"/>`;
    for (const c in KN.col[pass]) knotSvg += `<path d="${KN.col[pass][c]}" fill="none" stroke="${c}" stroke-width="6.8" stroke-linecap="butt"/>`;
    for (const c in KN.col[pass]) knotSvg += `<path d="${KN.col[pass][c]}" fill="none" stroke="${LINE[c]}" stroke-width="1" stroke-linecap="butt" opacity=".55"/>`;
  }
  const ch_musubi = wrap(`
${knotSvg}
<path d="${KN.ends}" fill="none" stroke-width="2"/>
${sp(84, 84, 4.2, '#ffd34d')}${sp(16, 82, 3.4, '#fff')}${sp(86, 16, 3.4, '#fff')}${sp(16, 18, 4.2, '#ffd34d')}
`, 'rotate(-5 50 50)');

  /* ---------------- FESTIVAL FRENZY ---------------- */
  const FW = [50, 40];
  const fcol = ['#ffcf3d', '#ff6fb0', '#5cc8ff', '#7ee06a', '#a07cff', '#ff8a3d'];
  let fwRays = '', fwCol = '', fwDots = '';
  for (let i = 0; i < 16; i++) {
    const a = (i * 22.5 - 90 + 11.25) * D, cs = Math.cos(a), sn = Math.sin(a), L = i % 2 ? 23 : 27;
    const seg = `M${P(FW[0] + (L - 9) * cs, FW[1] + (L - 9) * sn)}L${P(FW[0] + L * cs, FW[1] + L * sn)}`;
    fwRays += seg; fwCol += `<path d="${seg}" fill="none" stroke="${fcol[i % 6]}" stroke-width="2.6"/>`;
    fwDots += `<circle cx="${r(FW[0] + (L + 4.2) * cs)}" cy="${r(FW[1] + (L + 4.2) * sn)}" r="2.1" fill="${fcol[(i + 3) % 6]}" stroke-width="1.4"/>`;
  }
  const pole = (x1, y1, x2, y2) => tl(x1, y1, x2, y2, 3.2, '#e8b46a');
  const ch_omatsuri = wrap(`
<circle cx="${FW[0]}" cy="${FW[1]}" r="31" fill="#fff" opacity=".4" stroke="none"/>
<path d="${fwRays}" fill="none" stroke-width="5.4"/>${fwCol}${fwDots}
<circle cx="${FW[0]}" cy="${FW[1]}" r="9" fill="#fff3a8" opacity=".8" stroke="none"/>
${star5(FW[0], FW[1], 6.5, '#ffcf3d', 0, 1.8)}
${pole(64.5, 89, 30, 11.5)}${pole(35.5, 89, 70, 11.5)}
<path d="M31.5 14Q20.5 8.5 9 15Q12 24 8.5 33.5Q20.5 28.5 40.5 34.5Z" fill="#ff4b5c"/>
<path d="M40.5 34.5Q20.5 28.5 8.5 33.5Q10 30.5 11 27Q22 23.5 38.5 30Z" fill="#c42a3a" stroke="none" opacity=".35"/>
<circle cx="22" cy="21.5" r="6.5" fill="#fffaf0" stroke-width="2"/>
${tomoe(22, 21.5, 0.42, '#ff4b5c')}
<path d="M68.5 14Q79.5 8.5 91 15Q88 24 91.5 33.5Q79.5 28.5 59.5 34.5Z" fill="#3d8bff"/>
<path d="M59.5 34.5Q79.5 28.5 91.5 33.5Q90 30.5 89 27Q78 23.5 61.5 30Z" fill="#1f5fc8" stroke="none" opacity=".35"/>
<path d="M63 22Q67.5 17.5 72 22Q76.5 26.5 81 21Q85.5 16.5 89.5 21" fill="none" stroke="#fff" stroke-width="2.4"/>
<path d="M64 16.5Q72 12.5 82 14.5" fill="none" stroke="#9fdcff" stroke-width="1.8"/>
<circle cx="30" cy="11.5" r="3.6" fill="#ffcf3d" stroke-width="2"/><circle cx="70" cy="11.5" r="3.6" fill="#ffcf3d" stroke-width="2"/>
<path d="M44.5 52.5L55.5 60.5M55.5 52.5L44.5 60.5" fill="none" stroke-width="5.4"/><path d="M44.5 52.5L55.5 60.5M55.5 52.5L44.5 60.5" fill="none" stroke="#ff4b5c" stroke-width="2.6"/>
<circle cx="50" cy="56.5" r="3.2" fill="#ffcf3d" stroke-width="1.8"/>
<path d="M48 59.5Q45 66 46.5 72M52 59.5Q55 66 53.5 72" fill="none" stroke-width="4.6"/><path d="M48 59.5Q45 66 46.5 72M52 59.5Q55 66 53.5 72" fill="none" stroke="#ff4b5c" stroke-width="2"/>
${sp(14, 50, 4, '#ffd34d')}${sp(86, 52, 4, '#fff')}${sp(20, 76, 3, '#fff')}${sp(80, 78, 3.4, '#ffd34d')}
`);

  /* ---------------- HAND TOWEL ---------------- */
  const TW = { cx: 41, cy: 58, rx: 29, ry: 13.5, rot: -10, h: 5.6 };
  const tw = (a, dr = 0) => {
    const t = a * D, x = (TW.rx + dr) * Math.cos(t), y = (TW.ry + dr) * Math.sin(t), c = Math.cos(TW.rot * D), s = Math.sin(TW.rot * D);
    return P(TW.cx + x * c - y * s, TW.cy + x * s + y * c);
  };
  const ring = (a, b) => `M${tw(a, TW.h)}A${TW.rx + TW.h} ${TW.ry + TW.h} ${TW.rot} 0 1 ${tw(b, TW.h)}L${tw(b, -TW.h)}A${TW.rx - TW.h} ${TW.ry - TW.h} ${TW.rot} 0 0 ${tw(a, -TW.h)}Z`;
  const twist = (a, b, st) => {
    let d = '';
    for (let t = a; t < b - 1; t += st) d += `M${tw(t, TW.h)}L${tw(Math.min(b, t + st / 2), TW.h)}L${tw(Math.min(b, t + st / 2 + 8), -TW.h)}L${tw(Math.min(b, t + 8), -TW.h)}Z`;
    return d;
  };
  const ch_tenugui = wrap(`
<path d="${ring(180, 360)}" fill="#7ea7f2"/>
<path d="${twist(180, 352, 21)}" fill="#2f5bc4" stroke="none"/>
<path d="${ring(180, 360)}" fill="none"/>
<path d="M65 60C71 51 69 39 80 25L92.5 31.5C83 42 83 54 72.5 63.5Z" fill="#4f8dff"/>
<path d="M92.5 31.5C83 42 83 54 72.5 63.5L69.5 62C79 53 79 42 88.5 29.5Z" fill="#2f5bc4" stroke="none" opacity=".4"/>
<path d="M80 25L92.5 31.5L91 34L78.6 27.6Z" fill="#fff" stroke="none" opacity=".75"/>
<path d="M70 53Q73 41 81 30.5" fill="none" stroke="#9cc7ff" stroke-width="1.8"/>
${dots([[74, 46], [78, 37], [79, 49], [84, 39], [72, 56]], '#fff', 1.6)}
<path d="M68 65.5C77 63 84 71 92.5 72L87.5 84.5C80 82 75 75 67 75Z" fill="#4f8dff"/>
<path d="M92.5 72L87.5 84.5L85 83.6L89.8 71.6Z" fill="#fff" stroke="none" opacity=".75"/>
<path d="M72 69.5Q80 68.5 87 75.5" fill="none" stroke="#9cc7ff" stroke-width="1.8"/>
${dots([[76, 73], [83, 75], [80, 79], [73, 78]], '#fff', 1.6)}
<path d="${ring(0, 180)}" fill="#a9c8ff"/>
<path d="${twist(0, 180, 21)}" fill="#3d72e6" stroke="none"/>
<path d="${ring(0, 180)}" fill="none"/>
${dots([[53.5, 71.5], [39, 72.6], [24.5, 70], [15, 63], [65.5, 64]].map(([x, y]) => [x, y]), '#fff', 1.6)}
<path d="M14.5 50Q22 45 33 43.5" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>
<g transform="translate(66.5 63) rotate(-20)">
<path d="M-11 -6Q-5 -11 0 -7Q5 -12 11 -6Q13.5 0 10.5 6.5Q5 11 0 7Q-5 11.5 -10.5 6Q-13.5 0 -11 -6Z" fill="#4f8dff"/>
<path d="M11 -6Q13.5 0 10.5 6.5Q5 11 0 7Q-5 11.5 -10.5 6Q-4 8 0 4Q5 7.5 9.5 3Q11.5 -1 11 -6Z" fill="#2f5bc4" stroke="none" opacity=".45"/>
<path d="M0 -7Q-1.5 0 0 7M-6 -6.5Q-4.5 -2 -1 -.5M6 -7Q4.5 -2 1 -.5M-6 7Q-4 2 -1 1M6 7.5Q4 2 1 1" fill="none" stroke-width="1.3" opacity=".5"/>
<path d="M-9 -2.5Q-8.5 -6 -5.5 -7.5" fill="none" stroke="#c8dcff" stroke-width="2.2"/>
${dots([[7, -3], [-6.5, 3], [6, 4]], '#fff', 1.4)}
</g>
${sp(16, 24, 4.6, '#ffd34d')}${sp(54, 16, 3.4, '#fff')}${sp(12, 86, 3.4, '#fff')}${sp(86, 12, 3, '#fff')}
`, 'translate(50 55) scale(.96) translate(-50 -55)');

  /* ---------------- MOCHI POUNDING ---------------- */
  const ch_mochitsuki = wrap(`
<path d="M12 60C12 68 19 70 19 76C19 82 13.5 84 13.5 88Q44 95 74.5 88C74.5 84 69 82 69 76C69 70 76 68 76 60Z" fill="#d98e4c"/>
<path d="M76 60C76 68 69 70 69 76C69 82 74.5 84 74.5 88Q66 90 58 90.6C64 86 63 82 63 76C63 70 68 66 68 60Z" fill="#a35a28" stroke="none" opacity=".4"/>
<path d="M19 76Q44 82 69 76" fill="none" stroke="#a35a28" stroke-width="2"/>
<path d="M17 66C19 70 22 72 22 76" fill="none" stroke="#f6c08a" stroke-width="2.2"/>
<path d="M33 69Q33 76 32 86M50 70Q51 78 50 88" fill="none" stroke="#a35a28" stroke-width="1.3" opacity=".6"/>
<ellipse cx="44" cy="60" rx="32" ry="10" fill="#f0b27a"/>
<ellipse cx="44" cy="60.5" rx="26.5" ry="7" fill="#a35a28" stroke-width="2"/>
<path d="M18.5 61C17 48 28 39 43 39C59 39 71 48 69.5 61Q44 69 18.5 61Z" fill="#fffdf8"/>
<path d="M69.5 61Q44 69 18.5 61Q44 63.5 62 57C67 52 66 47 62 44C68 48 70.5 54 69.5 61Z" fill="#d9d0ee" stroke="none" opacity=".7"/>
<path d="M27 50Q32 43 40 42" fill="none" stroke="#fff" stroke-width="3"/>
<ellipse cx="45" cy="46.5" rx="4" ry="1.6" fill="#e9e2f6" stroke="none"/>
<path d="M45 33L43 28M53 34L56 29.5M37 35L33 31.5" fill="none" stroke-width="2"/>
<g transform="translate(69 23) rotate(138)">
<rect x="-2.8" y="-32.5" width="5.6" height="25.5" rx="2" fill="#f2c27a"/>
<path d="M-.8 -30V-10" fill="none" stroke="#fff0c8" stroke-width="1.4"/>
<rect x="-15" y="-8" width="30" height="16" rx="3" fill="#e09a55"/>
<rect x="-15" y="2.5" width="30" height="5.5" fill="#b5662c" stroke="none" opacity=".35"/>
<path d="M-12 -4.5H12" fill="none" stroke="#ffd09c" stroke-width="2"/>
<path d="M-8 -8V8M8 -8V8" fill="none" stroke="#b5662c" stroke-width="1.4"/>
<ellipse cx="15" cy="0" rx="3" ry="8" fill="#f6c08a"/>
</g>
<path d="M86 12Q94 22 90 34M80 8Q86 12 88 16" fill="none" stroke="#fff" stroke-width="2.4" opacity=".9"/>
<path d="M83 13Q90 22 87 31" fill="none" stroke-width="1.6" opacity=".35"/>
${sp(12, 30, 4.2, '#ffd34d')}${sp(28, 14, 3, '#fff')}${sp(88, 70, 3.6, '#fff')}
`);

  /* ---------------- SAKE BARREL ---------------- */
  const ume = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">` + [0, 72, 144, 216, 288].map(a =>
    `<circle cx="${r(5 * Math.cos((a - 90) * D))}" cy="${r(5 * Math.sin((a - 90) * D))}" r="4" fill="#fff" stroke-width="1.4"/>`).join('') +
    `<circle r="3" fill="#ffcf3d" stroke-width="1.2"/></g>`;
  const rope = (d, w = 4) => `<path d="${d}" fill="none" stroke-width="${w + 2.8}"/><path d="${d}" fill="none" stroke="#c4572e" stroke-width="${w}"/><path d="${d}" fill="none" stroke="#f08a5d" stroke-width="${w - 1.4}" stroke-dasharray="1.6 2.4" stroke-linecap="butt"/>`;
  const ch_taru = wrap(`
<path d="M17 30C13 46 13 68 18 84Q48 94 78 84C83 68 83 46 79 30Z" fill="#f7df9e"/>
<path d="M79 30C83 46 83 68 78 84Q68 88 58 89C68 80 71 62 70 46C70 40 70 34 69 31Z" fill="#c9a35a" stroke="none" opacity=".4"/>
<path d="M24 34C21 48 21 66 25 84M32 35C30 50 30 68 33 87M40 36C39 52 39 70 40 88M56 36C57 52 57 70 56 88M64 35C66 50 66 68 63 87M72 34C75 48 75 66 71 84" fill="none" stroke="#d9b05a" stroke-width="1.3"/>
<path d="M20 40C18 50 18 62 20 72" fill="none" stroke="#fff" stroke-width="2.6" opacity=".7"/>
${rope('M17 40.5Q48 51.5 79 40.5')}${rope('M18 76.5Q48 87.5 78 76.5')}
${rope('M29 34Q25 58 30 86', 3.2)}${rope('M67 34Q71 58 66 86', 3.2)}
<circle cx="48" cy="61" r="13" fill="#ff4b5c" stroke-width="2.2"/>
<circle cx="48" cy="61" r="10.4" fill="none" stroke="#fff" stroke-width="1.4"/>
${ume(48, 61, 0.92)}
<path d="M17 30C13 46 13 68 18 84Q48 94 78 84C83 68 83 46 79 30" fill="none"/>
<ellipse cx="48" cy="30" rx="31" ry="9" fill="#e3a560"/>
<ellipse cx="48" cy="30" rx="26" ry="6.6" fill="#f2c27a" stroke-width="1.8"/>
<path d="M30 27.5Q48 25 66 27.5M28 31.5Q48 29.5 68 31.5" fill="none" stroke="#c4843f" stroke-width="1.3"/>
<g transform="rotate(-12 40 24)">
${tl(40, 24, 92, 24, 3, '#f2c27a')}
<rect x="29" y="18" width="15" height="11" rx="2.5" fill="#e09a55"/>
<ellipse cx="36.5" cy="18" rx="7.5" ry="2.6" fill="#a35a28" stroke-width="2"/>
<path d="M32 21V27" fill="none" stroke="#ffd09c" stroke-width="1.6"/>
</g>
${sp(86, 46, 4, '#ffd34d')}${sp(14, 16, 3.4, '#fff')}${sp(88, 84, 3, '#fff')}
`, 'rotate(-4 50 55)');

  /* ---------------- BENTO BOX ---------------- */
  let grains = '';
  [[20, 42], [26, 46], [19, 52], [24, 64], [19, 70], [30, 70], [41, 68], [45, 42], [37, 41], [46, 52], [46, 62], [28, 40]].forEach(([x, y], i) => {
    grains += `<ellipse cx="${x}" cy="${y}" rx="2" ry="1.1" transform="rotate(${(i * 47) % 180} ${x} ${y})" fill="#e8e1f2" stroke="none"/>`;
  });
  const sausage = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="-10" y="-4.6" width="20" height="9.2" rx="4.6" fill="#ff6b5a" stroke-width="2"/><path d="M-4 -4.2L-1.5 4.2M2 -4.2L4.5 4.2" fill="none" stroke="#c42a3a" stroke-width="1.5"/><path d="M-7 -2H7" fill="none" stroke="#ffc0b0" stroke-width="1.6"/></g>`;
  const ch_bento = wrap(`
<rect x="14" y="13" width="72" height="26" rx="5" fill="#c4304a"/>
<path d="M19 18H81" fill="none" stroke="#ffcf3d" stroke-width="1.8"/>
<path d="M8 36C8 32 11 30 15 30H85C89 30 92 32 92 36V82C92 86 89 89 85 89H15C11 89 8 86 8 82Z" fill="#ff5a4a"/>
<path d="M8 80V82C8 86 11 89 15 89H85C89 89 92 86 92 82V80Z" fill="#c4304a" stroke-width="2"/>
<rect x="12.5" y="34" width="75" height="43" rx="4" fill="#9e2a3a" stroke-width="2"/>
<path d="M15 38Q14.5 35.5 18 35.5H50V75.5H17.5Q14.5 75.5 14.5 72Z" fill="#fffdf6" stroke-width="1.8"/>
${grains}
<path d="M17 40Q16.5 38 19 38" fill="none" stroke="#fff" stroke-width="2"/>
<path d="M33 48.5C38 48.5 41 51.5 40.6 56C40.4 60.6 37.5 63.6 33 63.4C28.4 63.4 25.4 60.4 25.5 56C25.6 51.6 28.4 48.5 33 48.5Z" fill="#e8364a" stroke-width="2"/>
<path d="M29.5 52.5Q31.5 51 34 51.4" fill="none" stroke="#ff9aa6" stroke-width="2"/>
<path d="M34.5 55Q36.5 57 35 59.5M30 58Q31 60 33 60.6" fill="none" stroke="#a81c30" stroke-width="1.2" opacity=".7"/>
<path d="M50 35.5L54 39L50 43L54 47L50 51L54 55L50 59L54 63L50 67L54 71L50 75.5" fill="#4cc25a" stroke-width="1.8"/>
<rect x="55" y="36" width="15" height="17" rx="2.5" fill="#ffd84d" stroke-width="2"/>
<rect x="70.5" y="36" width="15" height="17" rx="2.5" fill="#ffd84d" stroke-width="2"/>
<path d="M58.5 41Q62.5 38.5 66 41Q67 46 62 46.5Q59.5 46.5 60 44M74 41Q78 38.5 81.5 41Q82.5 46 77.5 46.5Q75 46.5 75.5 44" fill="none" stroke="#f0a020" stroke-width="1.5"/>
<path d="M56.5 50.5H68.5M72 50.5H84" fill="none" stroke="#e69a2a" stroke-width="1.6" opacity=".7"/>
<path d="M55.5 57Q60 54.5 64 57.5Q68 54.5 72 57.5Q78 55 86 57V75H55.5Z" fill="#7ee06a" stroke-width="1.8"/>
<path d="M60 60Q64 64 62 72M70 60Q73 66 71 72" fill="none" stroke="#4cb04a" stroke-width="1.4"/>
${sausage(67, 64.5, -12)}${sausage(75.5, 70.5, -12)}
<path d="M10 81H90" fill="none" stroke="#ff9a8a" stroke-width="1.6" opacity=".6"/>
<path d="M11 36Q11 33 14 33" fill="none" stroke="#ffb3a8" stroke-width="2.4"/>
${sp(10, 18, 4, '#ffd34d')}${sp(90, 14, 3.4, '#fff')}
`, 'translate(50 56) rotate(-5) scale(.95) translate(-50 -56)');

  /* ---------------- LANTERN RIVER ---------------- */
  const ch_toronagashi = wrap(`
<path d="M10 77C10 70 24 65.5 50 65.5C76 65.5 90 70 90 77C92 79 92 81 89 82C84 87 70 90 50 90C30 90 16 87 11 82C8 81 8 79 10 77Z" fill="#5cc8ff"/>
<ellipse cx="50" cy="77" rx="30" ry="8" fill="none" stroke="#a8e6ff" stroke-width="2.2"/>
<path d="M14 80Q20 83 27 83M74 83Q81 83 86 80M20 72Q24 70 29 69.5" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>
<path d="M44 75.5Q49 77.5 54 75.5M42 80.5Q50 83.5 58 80.5M46 85.5Q50 87 54 85.5" fill="none" stroke="#ffd34d" stroke-width="2.4"/>
<circle cx="51" cy="48" r="33" fill="#fff" opacity=".35" stroke="none"/>
<circle cx="51" cy="48" r="24" fill="#fff3a8" opacity=".5" stroke="none"/>
<path d="M27 66L54 73.5L76 65.5L49 58.5Z" fill="#d9894a"/>
<path d="M27 66V69.5L54 77L76 69V65.5L54 73.5Z" fill="#a35a28"/>
<path d="M31 38L54 44V70L31 64Z" fill="#fff1a0"/>
<path d="M54 44L71 37V63L54 70Z" fill="#ffc45c"/>
<path d="M31 38L54 44L71 37L48 31.5Z" fill="#ffe070"/>
<path d="M50.5 40C47.5 37 49 33.5 51 31.5C53.5 34 54.5 37 50.5 40Z" fill="#ff8a3d" stroke-width="1.6"/>
<ellipse cx="42.5" cy="54" rx="6.5" ry="8" fill="#ffb347" stroke="none" opacity=".45"/>
<path d="M33.5 59L51.5 64M56.5 64.5L68.5 59.5" fill="none" stroke="#ff4b5c" stroke-width="3"/>
<path d="M31 38V64M54 44V70M71 37V63" fill="none" stroke="#b5662c" stroke-width="3.2"/>
<path d="M31 38L54 44L71 37L48 31.5Z" fill="none" stroke="#b5662c" stroke-width="2.6"/>
<path d="M31 38L54 44L71 37M31 64L54 70L71 63M31 38V64M54 44V70M71 37V63" fill="none" stroke-width="1.2" opacity=".55"/>
<path d="M34 42.5V60" fill="none" stroke="#fff" stroke-width="2" opacity=".9"/>
${sp(16, 30, 4.2, '#ffd34d')}${sp(84, 18, 3.6, '#fff')}${sp(28, 14, 3, '#ffd34d')}${sp(86, 46, 3, '#fff')}
`);

  Object.assign(window.ICON_ART, { ch_fuin, ch_kanashibari, ch_sekisho, ch_abura, ch_kuchiyose, ch_musubi, ch_omatsuri, ch_tenugui, ch_mochitsuki, ch_taru, ch_bento, ch_toronagashi });
})();
