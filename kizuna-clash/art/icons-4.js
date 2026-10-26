/* Kizuna Clash: charm card icons, set 4 (flat SVG, 100x100 box). */
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
  // 5-petal flower: notched sakura or round ume
  const flower = (cx, cy, R, f, rot = 0, sw = 1.8, notch = true, mid = '#ffcf3d') => {
    const P = (a, rr) => r(cx + rr * Math.cos(a * D)) + ' ' + r(cy + rr * Math.sin(a * D));
    const rv = R * 0.36, pr = r(R * 0.42);
    let d = '';
    for (let i = 0; i < 5; i++) {
      const a = rot - 90 + i * 72;
      d += (i ? 'L' : 'M') + P(a - 36, rv);
      d += notch
        ? `C${P(a - 46, R * 0.9)} ${P(a - 26, R * 1.12)} ${P(a - 9, R)}L${P(a, R * 0.8)}L${P(a + 9, R)}C${P(a + 26, R * 1.12)} ${P(a + 46, R * 0.9)} ${P(a + 36, rv)}`
        : `A${pr} ${pr} 0 1 1 ${P(a + 36, rv)}`;
    }
    return `<path d="${d}Z" fill="${f}" stroke-width="${sw}"/><circle cx="${r(cx)}" cy="${r(cy)}" r="${r(R * 0.26)}" fill="${mid}" stroke-width="${r(sw * 0.7)}"/>`;
  };

  /* ---------------- KANZASHI ---------------- */
  // point on quadratic strand
  const qp = (x0, y0, cx, cy, x1, y1, t) => [(1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * cx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * cy + t * t * y1];
  const strand = (x, y0, len, items) => {
    const x1 = x + len * 0.16, y1 = y0 + len, cx = x, cy = y0 + len * 0.55;
    let s = `<path d="M${x} ${y0}Q${r(cx)} ${r(cy)} ${r(x1)} ${r(y1)}" fill="none" stroke-width="1.5"/>`;
    for (const [t, k, c] of items) {
      const [px, py] = qp(x, y0, cx, cy, x1, y1, t);
      if (k === 'f') s += flower(px, py, 4.6, c, 18, 1.4, false, '#ff7a9a');
      else if (k === 'b') s += `<circle cx="${r(px)}" cy="${r(py)}" r="2.5" fill="${c}" stroke-width="1.4"/><circle cx="${r(px - 0.8)}" cy="${r(py - 0.8)}" r=".8" fill="#fff" stroke="none"/>`;
      else s += `<path d="M${r(px)} ${r(py - 2)}C${r(px + 3.4)} ${r(py + 1)} ${r(px + 3.2)} ${r(py + 5.6)} ${r(px)} ${r(py + 5.6)}C${r(px - 3.2)} ${r(py + 5.6)} ${r(px - 3.4)} ${r(py + 1)} ${r(px)} ${r(py - 2)}Z" fill="${c}" stroke-width="1.5"/><ellipse cx="${r(px - 1)}" cy="${r(py + 2.4)}" rx=".9" ry="1.4" fill="#fff" stroke="none" opacity=".85"/>`;
    }
    return s;
  };
  const ch_kanzashi = wrap(`
${tl(38, 33, 89, 9, 3, '#ffcf3d')}${tl(41, 38, 92, 17, 3, '#ffcf3d')}
<path d="M58 23L86 10M61 29L89 17" fill="none" stroke="#fff6c2" stroke-width="1.1"/>
<circle cx="89" cy="9" r="2.6" fill="#ff5a6e" stroke-width="1.5"/><circle cx="92" cy="17" r="2.6" fill="#ff5a6e" stroke-width="1.5"/>
<path d="M46 14C52 6 62 6 66 10C60 10 54 13 50 19Z" fill="#6fcf6a" stroke-width="1.8"/>
<path d="M49 16Q56 10 64 10" fill="none" stroke-width="1.1" opacity=".5"/>
<path d="M14 40C6 34 6 24 10 20C11 27 14 32 20 36Z" fill="#6fcf6a" stroke-width="1.8"/>
${tp('M16 53Q33 45 52 53', 2.8, '#ffcf3d')}
${strand(19, 52, 24, [[0.45, 'b', '#4fb6ff'], [1, 'd', '#ff5a6e']])}
${strand(27, 50, 33, [[0.32, 'f', '#fff'], [0.68, 'b', '#ff5a6e'], [1, 'd', '#ffcf3d']])}
${strand(35, 49, 40, [[0.26, 'b', '#a07cff'], [0.56, 'f', '#ff9ec4'], [0.8, 'b', '#5fdc7a'], [1, 'd', '#4fb6ff']])}
${strand(43, 50, 33, [[0.32, 'f', '#ff9ec4'], [0.68, 'b', '#ffcf3d'], [1, 'd', '#ff5a6e']])}
${strand(50, 52, 24, [[0.45, 'b', '#5fdc7a'], [1, 'd', '#a07cff']])}
${flower(52, 21, 9.5, '#fff', 20, 2, false, '#ff7a9a')}
${flower(31, 31, 17, '#ff8fb8', -8, 2.6, true)}
<path d="M24 22Q27 17.5 32 17" fill="none" stroke="#ffd3e4" stroke-width="2.4"/>
<path d="M31 31L31 22M31 31L39.6 28.2M31 31L36.3 38.3M31 31L25.7 38.3M31 31L22.4 28.2" fill="none" stroke="#e05a8a" stroke-width="1.1" opacity=".55"/>
<circle cx="31" cy="31" r="4.4" fill="#ffcf3d" stroke-width="1.8"/><circle cx="29.8" cy="29.8" r="1.3" fill="#fff6c2" stroke="none"/>
${sp(80, 34, 5.5, '#ffd34d')}${sp(70, 62, 3.5, '#fff')}${sp(12, 66, 4, '#fff')}${sp(66, 84, 3, '#ffd34d')}
`, 'rotate(-4 50 50)');

  /* ---------------- GETA ---------------- */
  const geta = tf => {
    const W = 13, L = 30, ex = 3.6, ey = 5.4, tx = 6.4, ty = 12;
    const tooth = (y1, y2) => {
      const a = y1 + ey, b = y2 + ey;
      return `<path d="M${W + ex} ${a}L${W + ex} ${b}L${W + ex + tx} ${b + ty}L${W + ex + tx} ${a + ty}Z" fill="#a0602c" stroke-width="2"/>` +
        `<path d="M${-W + ex} ${b}H${W + ex}L${W + ex + tx} ${b + ty}H${-W + ex + tx}Z" fill="#c98a4b" stroke-width="2.2"/>`;
    };
    return `<g transform="${tf}">
${tooth(-23, -15)}${tooth(14, 22)}
<path d="M${-W} ${-L}H${W}L${W + ex} ${-L + ey}V${L + ey}H${-W + ex}L${-W} ${L}Z" fill="#dc9a55"/>
<path d="M${W} ${-L + 2}L${W + ex} ${-L + ey}V${L + ey}L${W} ${L}Z" fill="#b8783e" stroke-width="1.6"/>
<rect x="${-W}" y="${-L}" width="${2 * W}" height="${2 * L}" rx="6" fill="#f6cf8c"/>
<path d="M4 -26V26M-5 -24V-12M-6 12V25" fill="none" stroke="#d9a35f" stroke-width="1" opacity=".7"/>
<path d="M2 14Q12 18 12 26Q8 29 -2 28Z" fill="#e0a35a" opacity=".35" stroke="none"/>
<path d="M-9.6 -24V22" fill="none" stroke="#fff0c8" stroke-width="2"/>
<path d="M0 -19Q-9 -15 -11.8 5M0 -19Q9 -16 11.8 5" fill="none" stroke-width="3" opacity=".18" transform="translate(2 3.5)"/>
${tp('M0 -19Q-12 -20 -11.8 5', 3.6, '#ff4d4d')}${tp('M0 -19Q6 -21 11.8 5', 3.6, '#ff4d4d')}
<path d="M-2.6 -18.6Q-9 -17.6 -9.6 -6M2.4 -18.8Q5.6 -18 8.4 -8" fill="none" stroke="#ffb0a8" stroke-width="1.3"/>
<ellipse cx="0" cy="-19.4" rx="3.4" ry="2.8" fill="#ff4d4d" stroke-width="1.8"/>
<circle cx="-0.9" cy="-20.3" r=".9" fill="#ffd0c8" stroke="none"/>
</g>`;
  };
  const ch_geta = wrap(`
${geta('translate(69 40) rotate(14)')}
${geta('translate(29 50) rotate(-12)')}
<path d="M86 84Q90 80 89 75M80 92Q87 91 91 86" fill="none" stroke-width="1.8" opacity=".5"/>
${sp(88, 12, 5, '#ffd34d')}${sp(12, 88, 4, '#fff')}${sp(52, 8, 3.5, '#fff')}
`);

  /* ---------------- HANGING SCROLL ---------------- */
  const ch_scroll = wrap(`
<g transform="rotate(-6 50 50)">
${tp('M28 14L50 5L72 14', 1.6, '#ff5a3c')}
<circle cx="50" cy="5" r="2.6" fill="#ffcf3d" stroke-width="1.6"/>
<rect x="25" y="16" width="50" height="62" fill="#4fa8f0"/>
<rect x="69" y="17" width="5" height="60" fill="#2f7fd0" opacity=".35" stroke="none"/>
<path d="M27.6 20V74" fill="none" stroke="#9fd2ff" stroke-width="1.8"/>
<rect x="30" y="26" width="40" height="3.6" fill="#ffcf3d" stroke-width="1.6"/>
<rect x="31" y="29.6" width="38" height="47" fill="#fff7e2" stroke-width="1.8"/>
<circle cx="59" cy="40" r="6.4" fill="#ff4d4d" stroke-width="1.8"/>
<path d="M56.2 37.4Q57.4 35.6 59.4 35.4" fill="none" stroke="#ffb0a8" stroke-width="1.5"/>
<path d="M33 54Q37 52 41 54M58 52Q62 50.5 67 52" fill="none" stroke-width="1.3" opacity=".55"/>
<path d="M31 76L45 50Q48 45.6 51 50L69 76Z" fill="#5b7ef0" stroke-width="2"/>
<path d="M57 63L69 76H58Z" fill="#3b4fb8" opacity=".35" stroke="none"/>
<path d="M45 50Q48 45.6 51 50L53.6 53.8L51 52.8L48.4 55.4L45.8 52.8L42.6 54.2Z" fill="#fff" stroke-width="1.5"/>
<path d="M31 76V69C35 64 40 63 45 66C49 63 55 64 59 72L60 76Z" fill="#6fcf6a" stroke-width="1.8"/>
<path d="M36 68Q39 66 42 67" fill="none" stroke="#b6f0a8" stroke-width="1.5"/>
<path d="M38 16V27M62 16V27" fill="none" stroke-width="5"/><path d="M38 16V27M62 16V27" fill="none" stroke="#fff0c4" stroke-width="2.4" stroke-linecap="butt"/>
<rect x="20" y="11" width="60" height="6" rx="3" fill="#c98a4b"/>
<path d="M24 13.2H52" fill="none" stroke="#f2c08a" stroke-width="1.5"/>
<rect x="21" y="73" width="58" height="15" rx="7.5" fill="#4fa8f0"/>
<path d="M27 76.6H66" fill="none" stroke="#c4e6ff" stroke-width="2"/>
<path d="M25 84.5H76" fill="none" stroke="#2f7fd0" stroke-width="1.4" opacity=".6"/>
<path d="M31 73.4Q50 72 69 73.4" fill="none" stroke="#fff7e2" stroke-width="1.6"/>
<ellipse cx="22" cy="80.5" rx="4" ry="7.5" fill="#fff7e2" stroke-width="2"/>
<path d="M22 80.5m0 -2.4a1.4 2.4 0 1 1 -0.1 4.6a2.6 4.6 0 0 1 .3 -9.2a3.6 6.4 0 1 1 -.4 12.6" fill="none" stroke-width="1.1"/>
<rect x="11" y="76.5" width="8" height="8" rx="3" fill="#ff5a3c"/>
<rect x="79" y="76.5" width="9" height="8" rx="3" fill="#ff5a3c"/>
<path d="M13 78.8H16.4M81.6 78.8H85.4" fill="none" stroke="#ffb7a3" stroke-width="1.5"/>
</g>
<path d="M32 92Q50 95 68 91M40 97Q51 98.5 61 96.5" fill="none" stroke-width="1.8" opacity=".45"/>
${sp(88, 30, 5, '#ffd34d')}${sp(11, 40, 4, '#fff')}${sp(88, 64, 3, '#fff')}
`);

  /* ---------------- SACRED MIRROR ---------------- */
  let rimDots = '';
  for (let i = 0; i < 16; i++) {
    const a = i * 22.5 * D;
    rimDots += `<circle cx="${r(50 + 26.6 * Math.cos(a))}" cy="${r(38 + 26.6 * Math.sin(a))}" r="1.5" fill="#fff1b0" stroke-width=".9"/>`;
  }
  const ch_kagami = wrap(`
<circle cx="50" cy="38" r="38" fill="#fff6c0" opacity=".45" stroke="none"/>
${tl(9, 30, 4, 28, 2.4, '#ffd34d')}${tl(13, 12, 9, 8, 2.4, '#ffd34d')}${tl(91, 30, 96, 28, 2.4, '#ffd34d')}
${tp('M20 50C16 62 24 72 34 72M80 50C84 62 76 72 66 72', 5.5, '#ff5a3c')}
<circle cx="18.5" cy="49" r="4" fill="#ff5a3c" stroke-width="2"/><circle cx="81.5" cy="49" r="4" fill="#ff5a3c" stroke-width="2"/>
<rect x="44" y="62" width="12" height="12" fill="#ff5a3c"/>
<circle cx="50" cy="38" r="30" fill="#f2b33d"/>
<path d="M71 17A30 30 0 0 1 29 59Q62 56 71 17Z" fill="#c97a24" opacity=".35" stroke="none"/>
<path d="M27 21A28 28 0 0 1 46 9" fill="none" stroke="#ffe9a0" stroke-width="2.8"/>
${rimDots}
<circle cx="50" cy="38" r="23" fill="#cdf1ff" stroke-width="2.2"/>
<path d="M66 22A23 23 0 0 1 33 54Q58 52 66 22Z" fill="#8fd0f5" opacity=".55" stroke="none"/>
<path d="M34 42L48 24M39 48L55 27" fill="none" stroke="#fff" stroke-width="4.4"/>
<path d="M45 52L59 34" fill="none" stroke="#fff" stroke-width="2.2" opacity=".8"/>
<rect x="24" y="72" width="52" height="8" rx="2" fill="#ff5a3c"/>
<path d="M27 74.6H60" fill="none" stroke="#ffb7a3" stroke-width="1.6"/>
<rect x="17" y="79" width="66" height="10" rx="2.5" fill="#3b3f8f"/>
<path d="M21 81.8H74" fill="none" stroke="#8d94f0" stroke-width="1.6"/>
<rect x="44" y="81.5" width="12" height="5" rx="1" fill="#ffcf3d" stroke-width="1.4"/>
${sp(72, 16, 8, '#fff')}${sp(86, 70, 4, '#ffd34d')}${sp(14, 70, 3.5, '#fff')}
`);

  /* ---------------- SHURIKEN ---------------- */
  const shuri = (cx, cy, R, rot, lt, dk, ring) => {
    const P = (a, rr) => r(cx + rr * Math.cos(a * D)) + ' ' + r(cy + rr * Math.sin(a * D));
    const v = R * 0.3;
    let out = '', fac = '', ln = '';
    for (let i = 0; i < 4; i++) {
      const a = rot + i * 90;
      out += (i ? 'L' : 'M') + P(a - 45, v) + `Q${P(a - 14, R * 0.5)} ${P(a, R)}`;
      fac += `<path d="M${P(0, 0)}L${P(a - 45, v)}Q${P(a - 14, R * 0.5)} ${P(a, R)}Z" fill="${lt}" stroke="none"/>`;
      fac += `<path d="M${P(0, 0)}L${P(a, R)}L${P(a + 45, v)}Z" fill="${dk}" stroke="none"/>`;
      ln += `M${P(a, R * 0.3)}L${P(a, R * 0.9)}`;
    }
    out += 'Z';
    const hl = `M${P(rot - 90 - 38, v * 1.15)}Q${P(rot - 90 - 14, R * 0.52)} ${P(rot - 90 - 3, R * 0.86)}`;
    return `${fac}<path d="${hl}" fill="none" stroke="#fff" stroke-width="1.8"/><path d="${ln}" fill="none" stroke-width="1.2" opacity=".45"/><path d="${out}" fill="none"/>
<path d="M${P(0, 0)}m-${r(R * 0.2)} 0a${r(R * 0.2)} ${r(R * 0.2)} 0 1 0 ${r(R * 0.4)} 0a${r(R * 0.2)} ${r(R * 0.2)} 0 1 0 -${r(R * 0.4)} 0Zm${r(R * 0.11)} 0a${r(R * 0.09)} ${r(R * 0.09)} 0 1 1 ${r(R * 0.18)} 0a${r(R * 0.09)} ${r(R * 0.09)} 0 1 1 -${r(R * 0.18)} 0Z" fill="${ring}" fill-rule="evenodd" stroke-width="1.8"/>`;
  };
  const ch_shuriken = wrap(`
<path d="M6 20Q14 14 22 16M4 32Q12 28 18 30M10 44Q16 41 20 42" fill="none" stroke-width="2.2" opacity=".5"/>
<path d="M8 62Q18 54 28 57M6 76Q16 71 24 73M14 88Q22 84 30 86" fill="none" stroke-width="2.2" opacity=".5"/>
<path d="M18 13A22 22 0 0 0 16 46" fill="none" stroke="#a07cff" stroke-width="2.4" opacity=".45"/>
<path d="M26 53A30 30 0 0 0 26 90" fill="none" stroke="#4fb6ff" stroke-width="2.6" opacity=".45"/>
${shuri(43, 32, 22, 20, '#efe6ff', '#b39cf0', '#ffcf3d')}
${shuri(61, 62, 29, -8, '#eef3ff', '#9fade4', '#ff4d5e')}
${sp(88, 18, 6, '#fff')}${sp(78, 34, 3.5, '#ffd34d')}${sp(90, 90, 3.5, '#ffd34d')}
`);

  /* ---------------- KUSUDAMA ---------------- */
  // one half-shell, s = -1 left / 1 right, ball centre (50,36) r 24, hinge (50,12)
  const shell = s => {
    const sw = s < 0 ? 0 : 1, x = v => r(50 + s * v);
    return `<path d="M50 12A24 24 0 0 ${sw} 50 60Z" fill="#ffcf3d"/>
<path d="M${x(14)} 55A24 24 0 0 ${sw} 50 60V12Q${x(30)} 34 ${x(14)} 55Z" fill="#e8a020" opacity="${s < 0 ? .2 : .32}" stroke="none"/>
<path d="M${x(1)} 24.5Q${x(13)} 25 ${x(22.6)} 28M${x(1)} 47.5Q${x(13)} 47 ${x(22.6)} 44" fill="none" stroke-width="5.4"/>
<path d="M${x(1)} 24.5Q${x(13)} 25 ${x(22.6)} 28M${x(1)} 47.5Q${x(13)} 47 ${x(22.6)} 44" fill="none" stroke="#ff4d6d" stroke-width="2.8"/>
${flower(50 + s * 13, 36, 6.4, s < 0 ? '#ff8fb8' : '#fff', 10, 1.5, true, '#ff6b5a')}
<path d="M50 12A24 24 0 0 ${sw} 50 60" fill="none"/>
${s < 0 ? '<path d="M37 19Q31 25 29.4 33" fill="none" stroke="#fff6c2" stroke-width="2.4"/>' : ''}
<ellipse cx="50" cy="36" rx="4" ry="24" fill="#ffb347" stroke-width="2"/>
<path d="M50 15Q${x(-2.8)} 36 50 57" fill="none" stroke="#e8802a" stroke-width="1.8" opacity=".6"/>
<path d="M50 60V64" fill="none" stroke-width="1.6"/><circle cx="50" cy="65.4" r="2.4" fill="#ff4d6d" stroke-width="1.4"/>
<path d="M47 67.4H53L54 77H46Z" fill="#ff4d6d" stroke-width="1.5"/><path d="M48.6 69.4V75.4M51.4 69.4V75.4" fill="none" stroke="#ffb0bf" stroke-width="1"/>`;
  };
  const conf = (x, y, w, h, c, rot) => `<rect x="${r(x - w / 2)}" y="${r(y - h / 2)}" width="${w}" height="${h}" rx="1" fill="${c}" stroke-width="1.4" transform="rotate(${rot} ${x} ${y})"/>`;
  const ban = 'M48 38C44 54 58 58 53 72C50 81 55 87 61 91';
  const ch_kusudama = wrap(`
${tp('M54 38C62 46 72 47 74 57C76 66 68 71 72 79', 3.4, '#4fb6ff')}
${tp('M48 40C40 47 30 46 27 56C24 64 31 69 27 77', 3.4, '#5fdc7a')}
${tp(ban, 9.4, '#fff')}
<path d="${ban}" fill="none" stroke="#ff4d6d" stroke-width="2.2" transform="translate(-2.8 .4)"/>
<path d="${ban}" fill="none" stroke="#ff4d6d" stroke-width="2.2" transform="translate(2.8 -.4)"/>
${conf(14, 62, 8, 4, '#4fb6ff', 30)}${conf(86, 46, 8, 4, '#ff5f8f', -25)}${conf(38, 84, 7, 3.6, '#ffcf3d', 50)}${conf(82, 84, 7, 3.6, '#a07cff', -40)}${conf(66, 60, 6, 3.4, '#ffcf3d', 15)}
${star5(88, 64, 5, '#ffcf3d', 10, 1.4)}${star5(14, 82, 4.5, '#ff5f8f', -10, 1.4)}${star5(38, 64, 3.6, '#a07cff', 0, 1.3)}
<circle cx="91" cy="31" r="2.2" fill="#5fdc7a" stroke-width="1.3"/><circle cx="9" cy="44" r="2.2" fill="#ffcf3d" stroke-width="1.3"/><circle cx="72" cy="93" r="2" fill="#ff5f8f" stroke-width="1.3"/><circle cx="24" cy="92" r="1.8" fill="#4fb6ff" stroke-width="1.2"/>
<g transform="rotate(24 50 12)">${shell(-1)}</g>
<g transform="rotate(-24 50 12)">${shell(1)}</g>
${tl(50, 3, 50, 11, 2.4, '#ff4d6d')}
<circle cx="50" cy="12" r="3.2" fill="#ffcf3d" stroke-width="1.8"/>
${sp(13, 14, 5, '#fff')}${sp(87, 12, 4.5, '#ffd34d')}${sp(50, 47, 3.6, '#fff4a8')}
`);

  /* ---------------- EMA PLAQUE ---------------- */
  const horse = `M31 10Q34 4 40 0L41.5 -3.5L43.5 0.2Q47 2.5 50.5 7.5Q51.5 10.5 48.5 10.8Q44.5 10.5 41.8 9.6Q39.5 13.5 40 17.5L45.5 20.5L48 27.5L45.2 28.6L42.6 23.6L37.5 23L36.6 33L32.6 33.2L32.8 23.2Q24 26 17 23.5L18.6 30.6L21.6 33.4L18 35L13.8 28L10.6 24.4L5 30.4L2 28.6L6.6 21.4Q5.6 17 8.6 13.6C4 12 0 16 -3 23C-1.6 15 2.6 9.6 9.4 10.6Q20 8.4 31 10Z`;
  const ch_ema = wrap(`
<g transform="rotate(-6 50 56)">
${tp('M47 33C39 23 43 7 50 5C57 7 61 23 53 33', 2.4, '#ff4d4d')}
<path d="M50 22L87 41V85Q87 89 83 89H17Q13 89 13 85V41Z" fill="#f6cf8c"/>
<path d="M87 41V85Q87 89 83 89H66Q80 84 80 70V44Z" fill="#e0a35a" opacity=".3" stroke="none"/>
<path d="M18 46V82M30 50V86M70 50V86" fill="none" stroke="#d9a35f" stroke-width="1.1" opacity=".6"/>
<path d="M18 48V80" fill="none" stroke="#fff0c8" stroke-width="2"/>
<path d="M50 16L92 38L88.6 44L50 24.6L11.4 44L8 38Z" fill="#c98a4b"/>
<path d="M50 19.4L14 38" fill="none" stroke="#f2c08a" stroke-width="1.6"/>
<g transform="translate(23 47) scale(1.04)" fill="#3b3f8f" stroke-width="1.6">
<path d="${horse}"/>
<path d="M18 11.5Q24 10 30 11L29 19Q23 20 19 18.5Z" fill="#ff4d4d" stroke-width="1.3"/>
<path d="M33.5 9Q37 4 41 1.4" fill="none" stroke="#8d94f0" stroke-width="1.6"/>
<circle cx="45" cy="4.6" r="1.2" fill="#fff" stroke="none"/>
</g>
<path d="M22 86Q32 82 44 85M54 86Q64 83 76 85" fill="none" stroke="#6fbf5a" stroke-width="2"/>
<path d="M50 22L87 41V85Q87 89 83 89H17Q13 89 13 85V41Z" fill="none"/>
<ellipse cx="50" cy="33" rx="3.2" ry="2.5" fill="#ff4d4d" stroke-width="1.6"/>
<circle cx="49" cy="32.2" r=".8" fill="#ffd0c8" stroke="none"/>
</g>
${sp(86, 14, 5.5, '#ffd34d')}${sp(14, 18, 4, '#fff')}${sp(92, 64, 3, '#fff')}
`);

  Object.assign(window.ICON_ART, {
    ch_kanzashi, ch_geta, ch_scroll, ch_kagami, ch_shuriken, ch_kusudama, ch_ema,
  });
})();
