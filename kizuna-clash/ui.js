/* Kizuna Clash — cards, rope tokens, icons, rules and the Yokai Book */
const UI = (() => {
  const $ = id => document.getElementById(id);
  const C = GAME.BY_ID;
  const I = {
    fire: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-4-1-6 1-9z" fill="currentColor"/></svg>',
    water: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c3 5 7 9 7 13a7 7 0 0 1-14 0c0-4 4-8 7-13z" fill="currentColor"/><path d="M9 15a3 3 0 0 0 3 3" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/></svg>',
    wind: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9h11a3 3 0 1 0-3-3M3 14h15a3 3 0 1 1-3 3M3 19h7" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>',
    charm: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l2.6 6.4L21 9l-5 4.4L17.4 20 12 16.6 6.6 20 8 13.4 3 9l6.4-.6z" fill="currentColor"/></svg>',
    fist: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10V7a2 2 0 0 1 4 0V6a2 2 0 0 1 4 0v1a2 2 0 0 1 4 0v6c0 5-3 8-7 8s-7-3-7-7v-2a2 2 0 0 1 2-2h3" fill="currentColor"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21C5 15 2 12 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 4-3 7-10 13z" fill="currentColor"/></svg>',
    grip: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v15M7 8h10M4 14c1 4 4 6 8 6s7-2 8-6" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round"/><circle cx="12" cy="4" r="2" fill="currentColor"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="currentColor"/></svg>',
    sword: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 3L10 13M8 11l5 5M6 15l-3 3 3 3 3-3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    flag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="3" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>',
    snow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7M9 4l3 2 3-2M9 20l3-2 3 2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    luck: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10l-1 4H8zM6 8h12v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" fill="currentColor"/><circle cx="12" cy="14" r="3" fill="#fff"/></svg>'
  };
  const RAR = { common: 'Common', rare: 'Rare', epic: 'Epic', legend: 'Legend' };
  const BG = { fire: ['#ffb25b', '#ffd38a', '#fff1c9'], water: ['#7cc8ff', '#a9dcff', '#e3f5ff'], wind: ['#8fe0a8', '#b9efc8', '#eafbe9'], charm: ['#ffa8cf', '#ffd0e4', '#fff0f6'], legend: ['#ffc93c', '#ffe48a', '#fff7d6'] };
  const typeOf = c => (c.kind === 'charm' ? 'charm' : c.type);

  /* creature or charm illustration (inner markup for a 0 0 100 100 svg) */
  function art(id) {
    const c = C[id];
    if (c.kind === 'charm') return (window.ICON_ART && ICON_ART['ch_' + id]) || fallback(c);
    return (window.YOKAI_ART && YOKAI_ART[id]) || fallback(c);
  }
  function fallback(c) {
    const col = { fire: '#ff6b3d', water: '#2f9bff', wind: '#22b573', charm: '#b35cff' }[typeOf(c)];
    return `<ellipse cx="50" cy="93" rx="26" ry="4" fill="#2b2340" opacity=".15"/><circle cx="50" cy="52" r="34" fill="${col}" stroke="#2b2340" stroke-width="3"/><text x="50" y="64" text-anchor="middle" font-size="34" font-weight="900" fill="#fff" font-family="sans-serif">${c.name[0]}</text>`;
  }
  /* bright sunburst behind the art */
  const rayCache = {};
  function rays(key) {
    if (rayCache[key]) return rayCache[key];
    const [c1, c2, c3] = BG[key];
    let s = `<rect width="100" height="100" fill="${c1}"/>`;
    for (let i = 0; i < 16; i += 2) {
      const a1 = (i / 16) * Math.PI * 2, a2 = ((i + 1) / 16) * Math.PI * 2;
      s += `<polygon points="50,58 ${(50 + Math.cos(a1) * 90).toFixed(1)},${(58 + Math.sin(a1) * 90).toFixed(1)} ${(50 + Math.cos(a2) * 90).toFixed(1)},${(58 + Math.sin(a2) * 90).toFixed(1)}" fill="${c2}"/>`;
    }
    s += `<circle cx="50" cy="58" r="30" fill="${c3}" opacity=".85"/>`;
    if (key === 'water') s += '<path d="M0 86q12-6 25 0t25 0 25 0 25 0V100H0z" fill="#fff" opacity=".55"/>';
    if (key === 'wind') s += '<path d="M8 22q10-8 20 0M70 16q8-6 16 0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>';
    if (key === 'fire') s += '<circle cx="14" cy="16" r="2.5" fill="#fff" opacity=".8"/><circle cx="86" cy="22" r="2" fill="#fff" opacity=".8"/><circle cx="80" cy="9" r="1.5" fill="#fff" opacity=".8"/>';
    if (key === 'legend' || key === 'charm') s += '<path d="M14 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2zM84 12l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#fff"/>';
    return (rayCache[key] = s);
  }
  const bgKey = c => (c.rarity === 'legend' ? 'legend' : typeOf(c));
  const artSVG = (id, cls, flip) => `<svg class="${cls || ''}" viewBox="0 0 100 100" aria-hidden="true">${flip ? '<g transform="translate(100 0) scale(-1 1)">' : ''}${art(id)}${flip ? '</g>' : ''}</svg>`;
  const sceneSVG = (id, cls, slice) => `<svg class="${cls || ''}" viewBox="${slice ? '-12 0 124 100' : '0 0 100 100'}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${slice ? '<g transform="translate(-12 0) scale(1.24 1)">' + rays(bgKey(C[id])) + '</g>' : rays(bgKey(C[id]))}${art(id)}</svg>`;
  const typeName = t => (t === 'charm' ? 'Charm' : GAME.TYPES[t].name);
  const beatsLine = c => c.kind === 'yokai' ? `${I[c.type]}<span>Beats <b>${GAME.TYPES[GAME.TYPES[c.type].beats].name}</b></span>` : `${I.charm}<span>${c.trap ? 'Trap charm' : 'Charm'}</span>`;
  const rarClass = c => ' r-' + c.rarity + (c.rarity === 'legend' ? ' legend' : '');

  /* full card */
  function cardHTML(id, o = {}) {
    const c = C[id], t = typeOf(c);
    const ab = c.kind === 'yokai' ? (c.abs.length ? `<b>${c.abs.map(a => (a.combo ? 'Combo ' : '') + GAME.AB[a.k][0]).join(' · ')}</b> ${c.text}` : `<b>Brute</b> ${c.text}`) : c.text;
    const bonds = c.bonds ? `<div class="c-bond">${c.bonds.map(b => `<span title="${GAME.bondText(GAME.BOND_BY[b]).replace(/"/g, '&quot;')}">絆 ${GAME.BOND_BY[b].name}</span>`).join('')}</div>` : '';
    return `<div class="card t-${t}${rarClass(c)}${o.cls ? ' ' + o.cls : ''}">
      <div class="c-top"><span class="gem">${c.cost}</span><b class="c-name">${c.name}</b><span class="c-type t-${t}">${I[t]}</span></div>
      <div class="c-art">${sceneSVG(id)}${c.rarity === 'legend' ? '<span class="c-leg">LEGEND</span>' : ''}${o.locked ? `<span class="c-lock">${I.lock}</span>` : ''}</div>
      <div class="c-title"><span>${c.title}</span><span class="rar r-${c.rarity}">${RAR[c.rarity]}</span></div>
      <div class="c-ab">${ab}</div>${o.bonds !== false ? bonds : ''}
      <div class="c-foot">${c.kind === 'yokai' ? `<span class="st pw">${I.fist}${c.power}</span><span class="st hp">${I.heart}${c.hp}</span>` : ''}<span class="c-beat">${beatsLine(c)}</span></div>
    </div>`;
  }
  /* hand card */
  function miniHTML(id, o = {}) {
    const c = C[id], t = typeOf(c), el = o.el || 'button';
    const label = `${c.name}, ${RAR[c.rarity]} ${c.kind === 'yokai' ? `${typeName(t)} yokai, cost ${c.cost}, power ${c.power}, HP ${c.hp}` : `charm, cost ${c.cost}`}${o.locked ? ', locked' : ''}${o.indeck ? ', in your deck' : ''}`;
    return `<${el} ${el === 'button' ? 'type="button" ' : ''}class="mini t-${t}${rarClass(c)}${o.sel ? ' sel' : ''}${o.dim ? ' dim' : ''}${o.locked ? ' locked' : ''}${o.indeck ? ' indeck' : ''}" data-id="${id}" ${el === 'button' ? `aria-pressed="${!!o.sel}" aria-label="${label}"` : ''}>
      <span class="m-art">${sceneSVG(id)}</span><span class="gem">${c.cost}</span><span class="m-type">${I[t]}</span>
      <span class="m-name"><i class="pip r-${c.rarity}" title="${RAR[c.rarity]}"></i>${c.name}</span>
      ${c.kind === 'yokai' ? `<span class="m-st"><i class="pw">${I.fist}${c.power}</i><i class="hp">${I.heart}${c.hp}</i></span>` : `<span class="m-st"><i class="ch">${c.trap ? 'Trap' : 'Charm'}</i></span>`}
      ${o.locked ? `<span class="m-lock">${I.lock}</span>` : ''}${o.tag ? `<span class="m-tag">${o.tag}</span>` : ''}${o.indeck ? '<span class="m-check">✓</span>' : ''}
    </${el}>`;
  }
  /* a card as a row with its picture and full effect (deck builder): tap the row to see the card, tap + / − to add or remove */
  function rowHTML(id, o = {}) {
    const c = C[id], t = typeOf(c);
    const fx = c.kind === 'yokai' ? (c.abs.length ? `<b>${c.abs.map(a => (a.combo ? 'Combo ' : '') + GAME.AB[a.k][0]).join(' · ')}:</b> ${c.text}` : '<b>Brute:</b> no ability, just big and strong.') : `<b>${c.trap ? 'Trap' : 'Charm'}:</b> ${c.text}`;
    const bonds = c.bonds ? `<span class="cr-bond">${c.bonds.map(b => '絆 ' + GAME.BOND_BY[b].name).join(' · ')}</span>` : '';
    return `<div class="cardrow t-${t}${rarClass(c)}${o.indeck ? ' indeck' : ''}" data-id="${id}">
      <button type="button" class="cr-open" aria-label="${c.name}: see the card">
        <span class="cr-art">${sceneSVG(id)}<span class="gem">${c.cost}</span><span class="cr-type">${I[t]}</span>${o.indeck ? '<span class="cr-check">✓</span>' : ''}</span>
        <span class="cr-body"><span class="cr-name"><i class="pip r-${c.rarity}" title="${RAR[c.rarity]}"></i>${c.name}</span>
          ${c.kind === 'yokai' ? `<span class="cr-st"><i class="pw">${I.fist}${c.power}</i><i class="hp">${I.heart}${c.hp}</i></span>` : ''}
          <span class="cr-fx">${fx}</span>${bonds}</span>
      </button>
      ${o.act ? `<button type="button" class="cr-act ${o.act}" data-act="${o.act}" aria-label="${o.act === 'add' ? 'Add' : 'Remove'} ${c.name}" ${o.actOff ? 'disabled' : ''}>${o.act === 'add' ? '+' : '−'}</button>` : ''}
      ${o.tag ? `<span class="m-tag">${o.tag}</span>` : ''}
    </div>`;
  }
  /* a yokai holding the rope */
  function tokenHTML(m, y, o = {}) {
    const c = C[y.id], pw = GAME.powerOf(m, y), base = c.power;
    const tags = [];
    if (o.tag) tags.push(o.tag);
    const badges = [];
    if (GAME.has(y, 'guardian')) badges.push(`<i class="bd sh" title="Guardian">${I.shield}</i>`);
    if (GAME.has(y, 'anchor') || GAME.has(y, 'fortress') || GAME.has(y, 'leviathan') || y.gripUntil >= m.turnNo) badges.push(`<i class="bd an" title="Strong grip">${I.grip}</i>`);
    if (y.omamori) badges.push(`<i class="bd om" title="Omamori">${I.luck}</i>`);
    if (y.barrier) badges.push('<i class="bd ba" title="Barrier">◎</i>');
    if (y.silenced) badges.push('<i class="bd si" title="Silenced">✕</i>');
    if (C[y.id].bonds && GAME.bondsActive(m, y.owner).some(b => b.members.includes(y.id))) badges.push('<i class="bd bo" title="Bond active">絆</i>');
    if (GAME.frozenNow(m, y)) badges.push(`<i class="bd fr" title="Frozen">${I.snow}</i>`);
    return `<button type="button" class="tok t-${y.type}${c.rarity === 'legend' ? ' legend' : ''}${GAME.frozenNow(m, y) ? ' frozen' : ''}${y.silenced ? ' silenced' : ''}${y.token ? ' token' : ''}${o.cls ? ' ' + o.cls : ''}" data-uid="${y.uid}" data-side="${o.side}"
        aria-label="${c.name}, power ${pw}, HP ${y.hp} of ${y.maxHp}${o.tag ? ', ' + o.tag.replace(/<[^>]+>/g, '') : ''}">
      <span class="tk-disc"></span>${artSVG(y.id, 'tk-art', o.flip)}
      <span class="tk-pw${pw > base ? ' up' : pw < base ? ' down' : ''}">${I.fist}<b>${pw}</b></span>
      <span class="tk-hp${y.hp < y.maxHp ? ' hurt' : ''}">${I.heart}<b>${Math.max(0, y.hp)}</b></span>
      ${badges.length ? `<span class="tk-bd">${badges.join('')}</span>` : ''}
      ${tags.length ? `<span class="tk-tag">${tags.join(' ')}</span>` : ''}
      <span class="tk-name">${c.name}</span>
      ${o.preview ? `<span class="tk-prev">${o.preview}</span>` : ''}
    </button>`;
  }
  const eventIcon = (ev, cls) => `<svg class="${cls || ''}" viewBox="0 0 100 100" aria-hidden="true">${(window.ICON_ART && ICON_ART['ev_' + ev]) || '<circle cx="50" cy="50" r="40" fill="#ffc93c" stroke="#2b2340" stroke-width="4"/>'}</svg>`;

  /* ---------- rules ---------- */
  const GLOSS = { summon: 'When it joins: summon the yokai named on the card.', legacy: 'When knocked out: summon the yokai named on the card.' };
  function renderRules() {
    const G = GAME.C, ENV_DRAW = G.DRAW + ' cards';
    $('rulesBody').innerHTML = `
      <div class="panel goal"><h3>Win the tug</h3><p>Both teams hold one rope. Pull the knot <b>${G.WIN} steps</b> to your side to win. If nobody gets there in ${G.MAX_TURNS} turns each, whoever has the knot on their side wins.</p></div>
      <div class="panel"><h3>Your turn</h3><ol>
        <li>You draw ${ENV_DRAW} and refill your energy: your turn number + ${G.ENERGY_PLUS}, up to ${G.MAX_ENERGY}.</li>
        <li><b>Summon as many yokai as you like</b> (up to ${G.TEAM_MAX} on your rope) and play <b>charms</b>, as long as your energy lasts. Tap a card to see it, then tap its button.</li>
        <li><b>Attack</b> (optional): tap one of your glowing yokai, then a rival yokai. It deals its power as damage. At 0 HP the rival flies off the rope. New yokai have to wait a turn before attacking, unless they are Swift.</li>
        <li><b>HEAVE!</b> Every yokai that didn't attack pulls with its power. Then <b>tap the screen as fast as you can</b>: every 3 taps add 1 pull, up to +${G.TAP_MAX}. The rival team grips back: each of their yokai grips 1. The knot moves by your pull minus their grip.</li></ol>
        <p>So every yokai pulls for you on your turn and grips for you on theirs. Attacking means one less puller now, but one less rival later.</p></div>
      <div class="panel"><h3>Combos and Bonds</h3><p>Play several cards in one turn to build a <b>COMBO</b>. Cards marked <b>Combo</b> get their bonus only if you already played another card that turn, and <b>Frenzy</b> cards grow with every card before them.</p>
        <p>Some yokai belong together. When enough of them are on your rope at once, they form a <b>Kizuna Bond</b> (絆): a big one-time effect, plus extra power for as long as they stay together.</p>
        <ul class="bondlist">${GAME.BONDS.map(b => `<li>${GAME.bondText(b)}</li>`).join('')}</ul></div>
      <div class="panel"><h3>Tricks to know</h3><ul>
        <li><b>Silence</b>: the yokai loses its ability for the rest of the duel.</li>
        <li><b>Frozen</b>: it can't pull or attack on its owner's next turn.</li>
        <li><b>Toll</b>: the rival's cards cost more on their next turn.</li>
        <li><b>Slippery</b>: the rival's next heave is weaker.</li>
        <li><b>Summon</b> and <b>Call</b>: a card brings more yokai onto your rope. Summoned copies vanish when they are knocked out.</li>
        <li><b>Barrier</b>: blocks the first hit. <b>Hidden</b>: can't be attacked or targeted until your next turn.</li></ul></div>
      <div class="panel"><h3>Types</h3><p>An attack on a type yours beats deals <b>+1 damage</b>. Mixing types in your deck keeps you safe from a bad matchup.</p>
        <div class="trio">${Object.entries(GAME.TYPES).map(([k, t]) => `<span class="tchip t-${k}">${I[k]}${t.name}</span> beats <span class="tchip t-${t.beats}">${I[t.beats]}${GAME.TYPES[t.beats].name}</span>`).join('<br>')}</div></div>
      <div class="panel"><h3>Festival schedule</h3><p>Every round brings a festival event that changes one rule for both players. The whole schedule is shown during the duel, so you can plan ahead. Round 1 is always the Opening Ceremony and round ${G.MAX_TURNS} the Grand Finale.</p>
        <ul class="evlist">${Object.entries(GAME.EVENTS).map(([k, e]) => `<li>${eventIcon(k, 'evi')}<span><b>${e.name}</b> ${e.text}</span></li>`).join('')}</ul></div>
      <div class="panel"><h3>No luck</h3><p>No dice and no coin flips. Only the shuffle of your deck and of the festival schedule. Everything else follows fixed rules, so the better plan wins.</p></div>
      <div class="panel"><h3>Fair start</h3><p>Whoever goes first starts with just 1 energy and skips their first draw. Whoever goes second starts with ${1 + G.ENERGY_PLUS} energy and draws an extra card.</p></div>
      <div class="panel"><h3>Decks</h3><p>A deck has exactly <b>${G.DECK} different cards</b>, at least 8 of them yokai, with at most <b>${G.MAX_LEGENDS} Legends</b>. You can keep 3 decks and pick which one to duel with.</p></div>
      <div class="panel"><h3>Collecting cards</h3><p>There are <b>${GAME.CARDS.length} cards</b>: ${GAME.CARDS.filter(c => c.kind === 'yokai').length} yokai and ${GAME.CARDS.filter(c => c.kind === 'charm').length} charms, in four rarities: Common, Rare, Epic and Legend. You start with ${GAME.STARTER.length}. Earn koban coins from duels, daily missions and quests, then open <b>Lucky Bags</b> (each type has its own bag) or buy from the <b>daily stall</b>. Lucky Bags favour cards you don't have yet, and a card you already own turns into koban.</p></div>
      <div class="panel"><h3>Abilities</h3><div class="ablist">${Object.entries(GAME.AB).map(([k, [n, t]]) => `<b>${n}</b><span>${GLOSS[k] || t('X', { type: 'fire' }).replace(/Fire yokai/, 'yokai of its type')}</span>`).join('')}</div></div>
      <div class="panel"><h3>Charms</h3><div class="ablist">${GAME.CARDS.filter(c => c.kind === 'charm').map(c => `<b>${c.name}</b><span>${c.text} <i>Cost ${c.cost}.</i></span>`).join('')}</div></div>
      <div class="panel"><h3>Ranked duels</h3><p>Win to earn Rank Points and climb: ${LADDER.RANKS.map(r => `${r.kanji} ${r.name}`).join(' → ')}. Each duel puts ${LADDER.STAKE} RP at stake, and 3 wins in a row add a bonus. You never drop below the start of your rank. Festival masters get smarter, and bring rarer cards, as you climb.</p></div>
      <div class="panel"><h3>Duel a friend</h3><p>Play live, turn by turn, against a friend on another phone. One of you creates a room and shares the 4-letter code, the other joins. ${window.KZ_APP ? 'Both of you need the Kizuna Clash app and an internet connection.' : 'Both of you need the game open in Claude while signed in, and your friend needs access to it (the owner adds them from the Share menu).'} Friend duels don't change your rank.</p></div>`;
  }

  return { I, RAR, art, artSVG, sceneSVG, cardHTML, miniHTML, rowHTML, tokenHTML, eventIcon, typeOf, typeName, renderRules };
})();
