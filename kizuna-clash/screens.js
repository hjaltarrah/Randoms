/* Kizuna Clash — Lucky Bags, the daily stall, the deck builder, missions, the collection and the bag-opening show */
const SCR = (() => {
  const $ = id => document.getElementById(id);
  const G = GAME, BY = G.BY_ID, I = UI.I;
  const COIN = '<svg class="koban" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="8" ry="10.5" fill="#ffc93c" stroke="#2b2340" stroke-width="2"/><ellipse cx="12" cy="12" rx="5" ry="7.6" fill="none" stroke="#c48a00" stroke-width="1.4"/><path d="M9.5 8.5h5M9.5 12h5M9.5 15.5h5" stroke="#c48a00" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const coinPill = (n = PROF.coins) => `<span class="coinpill">${COIN}<b>${n.toLocaleString('en-US')}</b></span>`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TYPES = ['fire', 'water', 'wind', 'charm'];
  const typeLabel = t => (t === 'all' ? 'All' : UI.typeName(t));

  /* ---------- small helpers ---------- */
  function toast(text, cls, ms) {
    const t = $('toast'); t.innerHTML = text; t.className = 'toast' + (cls ? ' ' + cls : ''); t.hidden = false;
    clearTimeout(toast.h); toast.h = setTimeout(() => { t.hidden = true; }, ms || 2600);
  }
  function refreshCoins() { document.querySelectorAll('[data-coins]').forEach(el => { el.innerHTML = coinPill(); }); }
  function popCard(id, o = {}) {
    const btns = (o.buttons || []).map((b, i) => `<button class="btn ${b.cls || ''}" type="button" data-pb="${i}" ${b.disabled ? 'disabled' : ''}>${b.label}</button>`).join('');
    $('pop').innerHTML = `<div class="pin">${UI.cardHTML(id, { locked: o.locked, cls: o.locked ? 'locked' : '' })}${o.note ? `<div class="why">${o.note}</div>` : ''}
      <div class="acts">${btns}<button class="btn" type="button" id="popClose">Close</button></div></div>`;
    $('pop').hidden = false; AU.play('open');
    $('popClose').onclick = () => { $('pop').hidden = true; AU.play('close'); };
    $('pop').querySelectorAll('[data-pb]').forEach(b => { b.onclick = () => { const x = o.buttons[+b.dataset.pb]; $('pop').hidden = true; x.fn(); }; });
  }
  const sortCards = ids => ids.slice().sort((a, b) => TYPES.indexOf(UI.typeOf(BY[a])) - TYPES.indexOf(UI.typeOf(BY[b])) || BY[a].cost - BY[b].cost || BY[a].name.localeCompare(BY[b].name));

  /* a fukubukuro lucky bag, tied with a festival cord */
  const BAGCOL = { fire: ['#ff6b3d', '#ffb25b'], water: ['#2f8cff', '#8fd0ff'], wind: ['#1fae6d', '#9be8b4'], charm: ['#b35cff', '#ffa8cf'], golden: ['#ffc93c', '#fff1a8'] };
  function bagSVG(id, cls) {
    const [c1, c2] = BAGCOL[id];
    const icon = id === 'golden' ? '' : (I[id === 'charm' ? 'charm' : id] || '').replace('<svg viewBox="0 0 24 24" aria-hidden="true">', `<svg x="39" y="55" width="22" height="22" viewBox="0 0 24 24" color="${c1}">`);
    return `<svg class="${cls || ''}" viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy="93" rx="30" ry="4.5" fill="#2b2340" opacity=".15"/>
      <path d="M31 40C14 52 13 80 26 88c12 6 36 6 48 0 13-8 12-36-5-48z" fill="${c1}" stroke="#2b2340" stroke-width="3" stroke-linejoin="round"/>
      <path d="M24 60q6 4 12 0t12 0 12 0 12 0 6 0M22 74q7 4 14 0t14 0 14 0 14 0" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".45"/>
      <path d="M33 41c-3-9-8-16-2-24 4 5 8 2 12-5 3 7 11 7 14 0 4 7 8 10 12 5 6 8 1 15-2 24z" fill="${c2}" stroke="#2b2340" stroke-width="3" stroke-linejoin="round"/>
      <path d="M28 41q22 9 44 0" fill="none" stroke="#2b2340" stroke-width="7.5" stroke-linecap="round"/><path d="M28 41q22 9 44 0" fill="none" stroke="#ff4b5c" stroke-width="4" stroke-linecap="round"/>
      <path d="M62 45l6 14M66 44l9 12" stroke="#2b2340" stroke-width="5" stroke-linecap="round"/><path d="M62 45l6 14M66 44l9 12" stroke="#ff4b5c" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="50" cy="66" r="14" fill="#fff" stroke="#2b2340" stroke-width="3"/>
      ${id === 'golden' ? '<text x="50" y="73" text-anchor="middle" font-size="19" font-family="Dela Gothic One, sans-serif" fill="#ff4b5c">福</text>' : icon}
      <path d="M38 24l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#fff" opacity=".9"/>
    </svg>`;
  }

  /* ---------- Lucky Bags & daily stall ---------- */
  function renderShop() {
    $('shopCoins').innerHTML = coinPill();
    const stall = PROF.stall();
    const pct = (t, k) => { const tot = Object.values(t).reduce((a, b) => a + b, 0); return Math.round(100 * (t[k] || 0) / tot * 10) / 10; };
    $('shopBody').innerHTML = `
      <div class="bags">${PROF.BAGS.map(bagTile).join('')}</div>
      <p class="note">Lucky Bags favour cards you don't have yet. A card you already own turns into koban instead (${Object.entries(PROF.REFUND).map(([r, n]) => `${UI.RAR[r]} ${n}`).join(', ')}).</p>
      <details class="panel odds"><summary>Drop rates</summary>
        <p>Type and Charm bags: first two cards ${['common', 'rare', 'epic', 'legend'].map(r => `${UI.RAR[r]} ${pct(PROF.ODDS.base, r)}%`).join(', ')}. Third card ${['rare', 'epic', 'legend'].map(r => `${UI.RAR[r]} ${pct(PROF.ODDS.rareplus, r)}%`).join(', ')}. Charms have no Legends.</p>
        <p>Golden bag: first two cards ${['rare', 'epic', 'legend'].map(r => `${UI.RAR[r]} ${pct(PROF.ODDS.golden, r)}%`).join(', ')}. Third card Epic ${pct(PROF.ODDS.epicplus, 'epic')}%, Legend ${pct(PROF.ODDS.epicplus, 'legend')}%.</p></details>
      <div class="panel stall"><h3>Daily stall</h3><p class="note">Three cards for sale today. The stall restocks tomorrow.</p>
        <div class="stallrow">${stall.map(s => `<div class="stallitem">${UI.miniHTML(s.id, { tag: s.owned && !s.bought ? 'Owned' : '' })}
          <button class="btn small ${!s.bought && !s.owned && PROF.coins >= s.price ? 'gold' : ''}" type="button" data-buy="${s.id}" ${s.bought || s.owned || PROF.coins < s.price ? 'disabled' : ''}>${s.bought ? 'Bought' : s.owned ? 'Owned' : COIN + s.price}</button></div>`).join('')}</div></div>`;
    $('shopBody').onclick = e => {
      const bag = e.target.closest('[data-bag]'); if (bag) return openBag(bag.dataset.bag);
      const buy = e.target.closest('[data-buy]'); if (buy) return buyStall(buy.dataset.buy);
      const m = e.target.closest('.mini'); if (m) { const id = m.dataset.id; const s = PROF.stall().find(x => x.id === id);
        popCard(id, { note: s && !s.bought && !s.owned ? `On sale today for ${s.price} koban.` : null, buttons: s && !s.bought && !s.owned ? [{ label: `Buy · ${COIN}${s.price}`, cls: 'gold', disabled: PROF.coins < s.price, fn: () => buyStall(id) }] : [] }); }
    };
  }
  function bagTile(b) {
    const f = PROF.foundIn(b.id), can = PROF.coins >= b.price;
    return `<div class="bagtile b-${b.id}">${bagSVG(b.id, 'bagart')}<div class="bagtxt"><b>${b.name}</b><span>${b.text}</span><small>${f.have} of ${f.of} found</small></div>
      <button class="btn ${can ? 'red' : ''}" type="button" data-bag="${b.id}" ${can ? '' : 'disabled'} aria-label="Open ${b.name} for ${b.price} koban">${COIN}${b.price}</button></div>`;
  }
  function buyStall(id) {
    const r = PROF.buyStall(id);
    if (!r.ok) { AU.play('nope'); return toast(r.why, 'bad'); }
    AU.play('coin'); AU.play(BY[id].rarity === 'legend' ? 'legend' : BY[id].rarity === 'epic' ? 'epic' : 'rare', 0.1);
    toast(`<b>${BY[id].name}</b> joins your collection!`);
    renderShop(); refreshCoins();
  }

  /* ---------- the bag-opening show ---------- */
  let B = null;
  function openBag(bagId) {
    const res = PROF.openBag(bagId);
    if (!res.ok) { AU.play('nope'); return toast(res.why, 'bad'); }
    AU.play('coin');
    B = { res, flipped: [false, false, false], phase: 'bag' };
    renderBag();
    $('bagOpen').hidden = false;
  }
  function renderBag() {
    const el = $('bagOpen'), r = B.res;
    if (B.phase === 'bag') {
      el.innerHTML = `<div class="bo-in"><h2>${r.bag.name}</h2><button type="button" class="bo-bag" id="boBag" aria-label="Open the bag">${bagSVG(r.bag.id)}</button><p class="bo-hint">Tap the bag to open it!</p></div>`;
      let taps = 0;
      $('boBag').onclick = () => {
        taps++; const b = $('boBag'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); AU.play('shake');
        if (taps >= (reduce ? 1 : 2)) { setTimeout(() => { AU.play('burst'); B.phase = 'cards'; renderBag(); }, reduce ? 0 : 260); }
      };
      return;
    }
    const all = B.flipped.every(Boolean), best = r.cards.reduce((m, c) => Math.max(m, ['common', 'rare', 'epic', 'legend'].indexOf(c.rarity)), 0);
    el.innerHTML = `<div class="bo-in"><h2>${all ? (best >= 3 ? 'A LEGEND!' : best === 2 ? 'Epic find!' : 'Your cards') : 'Tap each card'}</h2>
      <div class="bo-cards">${r.cards.map((c, i) => B.flipped[i]
        ? `<button type="button" class="bo-card up r-${c.rarity}" data-i="${i}"><span class="bo-rays"></span>${UI.miniHTML(c.id, { el: 'span' })}<span class="bo-res ${c.isNew ? 'new' : ''}">${c.isNew ? 'NEW!' : `+${c.refund} ${COIN}`}</span><span class="bo-rar">${UI.RAR[c.rarity]}</span></button>`
        : `<button type="button" class="bo-card back" data-i="${i}" aria-label="Reveal card ${i + 1}"><span class="cardback"><span>絆</span></span></button>`).join('')}</div>
      <div class="bo-acts">${all ? `${PROF.coins >= r.bag.price ? `<button class="btn red" type="button" id="boAgain">Open another · ${COIN}${r.bag.price}</button>` : ''}<button class="btn" type="button" id="boDone">Done</button>`
        : '<button class="btn gold" type="button" id="boAll">Reveal all</button>'}</div>
      <p class="bo-hint">${coinPill()}</p></div>`;
    el.querySelectorAll('.bo-card').forEach(b => { b.onclick = () => { const i = +b.dataset.i; if (!B.flipped[i]) flip(i); else popCard(r.cards[i].id); }; });
    if ($('boAll')) $('boAll').onclick = () => { B.flipped.forEach((f, i) => { if (!f) setTimeout(() => flip(i), i * 220); }); };
    if ($('boDone')) $('boDone').onclick = closeBag;
    if ($('boAgain')) $('boAgain').onclick = () => { const id = r.bag.id; openBag(id); refreshCoins(); };
  }
  function flip(i) {
    if (B.flipped[i]) return;
    B.flipped[i] = true;
    const c = B.res.cards[i];
    AU.play({ common: 'flip', rare: 'rare', epic: 'epic', legend: 'legend' }[c.rarity]);
    if (c.rarity === 'legend' && !reduce) KZ.confetti();
    renderBag();
    const el = document.querySelector(`.bo-card[data-i="${i}"]`); if (el) { el.classList.add('flipin'); }
  }
  function closeBag() { $('bagOpen').hidden = true; B = null; renderShop(); refreshCoins(); }

  /* ---------- deck picker (ranked and friend duels) ---------- */
  function deckTiles(sel, attr) {
    return [0, 1, 2].map(i => {
      const d = PROF.deck(i), bad = PROF.deckProblem(d.cards), lead = d.cards.length ? LADDER.deckLead(d.cards.filter(id => BY[id].kind === 'yokai').length ? d.cards : G.STARTER_DECK) : 'kodama';
      const tys = ['fire', 'water', 'wind', 'charm'].map(t => [t, d.cards.filter(id => UI.typeOf(BY[id]) === t).length]).filter(x => x[1]);
      return `<button type="button" class="decktile${bad ? ' bad' : ''}" ${attr}="${i}" aria-pressed="${sel === i && !bad}">${UI.sceneSVG(lead, '', true)}
        <span class="dt-txt"><b>${esc(d.name)}</b><span>${bad ? (d.cards.length < G.C.DECK ? `${d.cards.length}/${G.C.DECK} cards · unfinished` : 'Needs fixing') : tys.map(([t, n]) => `<i class="t-${t}">${I[t]}${n}</i>`).join('')}</span></span></button>`;
    }).join('');
  }

  /* ---------- deck builder ---------- */
  let tab = null, dFilter = 'all';
  /* the whole screen; afterwards only the deck panel and the changed cards are redrawn, so taps stay quick */
  function renderDecks() {
    if (tab == null) tab = PROF.active;
    const cards = PROF.deck(tab).cards;
    const owned = sortCards(PROF.ownedIds()).filter(id => dFilter === 'all' || UI.typeOf(BY[id]) === dFilter);
    $('decksBody').innerHTML = `
      <div class="dtabs" role="tablist" id="deckTabs"></div>
      <div class="panel deckpanel" id="deckPanel"></div>
      <div class="colhead"><h3>Your cards <small>${PROF.ownedIds().length}/${PROF.ALL.length}</small></h3></div>
      <div class="bookf" id="deckFilters">${['all', ...TYPES].map(f => `<button type="button" data-f="${f}" aria-pressed="${dFilter === f}" class="${f !== 'all' ? 't-' + f : ''}">${f === 'all' ? '' : I[f]}${typeLabel(f)}</button>`).join('')}</div>
      <p class="note">Tap <b>+</b> to add a card, or tap a card to see it big.</p>
      <div class="rowgrid" id="deckGrid">${owned.map(id => UI.rowHTML(id, { indeck: cards.includes(id), act: cards.includes(id) ? 'remove' : 'add', tag: PROF.isNewCard(id) ? 'NEW' : '' })).join('')}</div>
      <p class="note">Want more cards? Open Lucky Bags with the koban you win.</p>`;
    $('decksBody').onclick = e => {
      const t = e.target.closest('[data-tab]'); if (t) { tab = +t.dataset.tab; AU.play('tap'); return refreshDeck(); }
      const f = e.target.closest('[data-f]'); if (f) { dFilter = f.dataset.f; return renderDecks(); }
      const q = e.target.closest('.cr-act'); if (q) { const id = q.closest('.cardrow').dataset.id; return q.dataset.act === 'add' ? addCard(id) : removeCard(id); }
      const c = e.target.closest('.cardrow'); if (c) return deckCard(c.dataset.id);
    };
    refreshDeck();
  }
  function refreshDeck() {
    const d = PROF.deck(tab), cards = d.cards, prob = PROF.deckProblem(cards);
    const yok = cards.filter(id => BY[id].kind === 'yokai'), leg = cards.filter(id => BY[id].rarity === 'legend').length;
    const avg = cards.length ? (cards.reduce((x, id) => x + BY[id].cost, 0) / cards.length).toFixed(1) : '0';
    const tyCount = t => cards.filter(id => UI.typeOf(BY[id]) === t).length;
    $('deckTabs').innerHTML = [0, 1, 2].map(i => `<button type="button" role="tab" data-tab="${i}" aria-selected="${tab === i}">${PROF.active === i ? '★ ' : ''}${esc(PROF.deck(i).name)}</button>`).join('');
    $('deckPanel').innerHTML = `
        <div class="dhead"><input id="deckName" maxlength="16" value="${esc(d.name)}" aria-label="Deck name"><span class="dcount ${cards.length === G.C.DECK ? 'ok' : ''}">${cards.length}/${G.C.DECK}</span></div>
        <div class="dstats"><span>${yok.length} yokai</span><span>${cards.length - yok.length} charms</span><span class="${leg > G.C.MAX_LEGENDS ? 'bad' : ''}">${leg}/${G.C.MAX_LEGENDS} Legends</span><span>avg cost ${avg}</span></div>
        <div class="typebar">${TYPES.map(t => tyCount(t) ? `<i class="t-${t}" style="flex:${tyCount(t)}" title="${typeLabel(t)} ${tyCount(t)}">${I[t]}${tyCount(t)}</i>` : '').join('') || '<i class="empty">Empty deck</i>'}</div>
        <div class="rowgrid indeckgrid">${sortCards(cards).map(id => UI.rowHTML(id, { act: 'remove' })).join('')}
          ${cards.length < G.C.DECK ? `<div class="cardrow emptyrow">${G.C.DECK - cards.length} empty slot${G.C.DECK - cards.length > 1 ? 's' : ''}</div>` : ''}</div>
        <p class="dnote ${prob && cards.length === G.C.DECK ? 'bad' : ''}">${!prob ? (PROF.active === tab ? 'Ready. This is the deck you duel with.' : 'Ready to duel.') : cards.length < G.C.DECK ? `Add ${G.C.DECK - cards.length} more card${G.C.DECK - cards.length > 1 ? 's' : ''}: tap a card below.` : prob}</p>
        <div class="drow">
          <button class="btn small ${!prob && PROF.active !== tab ? 'red' : ''}" type="button" id="deckUse" ${prob || PROF.active === tab ? 'disabled' : ''}>${PROF.active === tab ? '★ In use' : 'Duel with this deck'}</button>
          <button class="btn small" type="button" id="deckFill" ${cards.length >= G.C.DECK ? 'disabled' : ''}>Auto-fill</button>
          <button class="btn small" type="button" id="deckClear" ${cards.length ? '' : 'disabled'}>Clear</button>
        </div>`;
    $('deckName').onchange = e => { PROF.setDeck(tab, PROF.deck(tab).cards, e.target.value); refreshDeck(); };
    $('deckUse').onclick = () => { PROF.setActive(tab); toast(`You'll duel with <b>${esc(PROF.deck(tab).name)}</b>.`); refreshDeck(); };
    $('deckFill').onclick = () => { PROF.autoFill(tab); AU.play('summon'); refreshDeck(); };
    $('deckClear').onclick = () => { PROF.setDeck(tab, []); refreshDeck(); };
    // tick or untick the cards in the grid below without rebuilding it
    const full = cards.length >= G.C.DECK, legends = cards.filter(x => BY[x].rarity === 'legend').length;
    for (const m of $('deckGrid').querySelectorAll('.cardrow')) {
      const id = m.dataset.id, want = cards.includes(id), off = !want && (full || (BY[id].rarity === 'legend' && legends >= G.C.MAX_LEGENDS));
      const btn = m.querySelector('.cr-act');
      if (m.classList.contains('indeck') !== want) { const t = document.createElement('div'); t.innerHTML = UI.rowHTML(id, { indeck: want, act: want ? 'remove' : 'add', actOff: off }); m.replaceWith(t.firstElementChild); }
      else if (btn && btn.disabled !== off) btn.disabled = off;
    }
  }
  function addCard(id) {
    const d = PROF.deck(tab), c = BY[id];
    if (d.cards.includes(id)) return;
    if (d.cards.length >= G.C.DECK) { AU.play('nope'); return toast(`This deck is full (${G.C.DECK} cards). Remove one first.`, 'bad'); }
    if (c.rarity === 'legend' && d.cards.filter(x => BY[x].rarity === 'legend').length >= G.C.MAX_LEGENDS) { AU.play('nope'); return toast(`A deck can hold only ${G.C.MAX_LEGENDS} Legends.`, 'bad'); }
    PROF.setDeck(tab, d.cards.concat(id)); AU.play('summon'); refreshDeck(); maybeBuilt();
  }
  function removeCard(id) { const d = PROF.deck(tab); PROF.setDeck(tab, d.cards.filter(x => x !== id)); AU.play('close'); refreshDeck(); }
  function deckCard(id) {
    const d = PROF.deck(tab), inDeck = d.cards.includes(id), c = BY[id];
    const legends = d.cards.filter(x => BY[x].rarity === 'legend').length;
    let why = null;
    if (!inDeck && d.cards.length >= G.C.DECK) why = `This deck is full (${G.C.DECK} cards). Remove one first.`;
    else if (!inDeck && c.rarity === 'legend' && legends >= G.C.MAX_LEGENDS) why = `A deck can hold only ${G.C.MAX_LEGENDS} Legends.`;
    popCard(id, {
      note: why,
      buttons: [inDeck ? { label: 'Remove from deck', fn: () => { PROF.setDeck(tab, d.cards.filter(x => x !== id)); AU.play('close'); refreshDeck(); } }
        : { label: 'Add to deck', cls: 'red', disabled: !!why, fn: () => { PROF.setDeck(tab, d.cards.concat(id)); AU.play('summon'); refreshDeck(); maybeBuilt(); } }]
    });
  }
  function maybeBuilt() { if (PROF.deck(tab).cards.length === G.C.DECK && !PROF.deckProblem(PROF.deck(tab).cards)) toast(`Deck complete! ${G.C.DECK} cards, ready to duel.`); }

  /* ---------- missions & quests ---------- */
  function renderMissions() {
    $('missionsCoins').innerHTML = coinPill();
    const row = x => {
      const ready = x.done && !x.claimed;
      return `<div class="mrow${x.claimed ? ' claimed' : ready ? ' ready' : ''}"><div class="mtxt"><b>${x.m.text}</b><div class="mbar"><i style="width:${Math.round(100 * x.prog / x.m.goal)}%"></i></div><small>${x.prog}/${x.m.goal}</small></div>
        <button class="btn small ${ready ? 'gold' : ''}" type="button" data-claim="${x.m.id}" ${ready ? '' : 'disabled'}>${x.claimed ? 'Done ✓' : ready ? `Claim ${COIN}${x.m.coins}` : `${COIN}${x.m.coins}`}</button></div>`;
    };
    const qs = PROF.quests(), order = x => (x.done && !x.claimed ? 0 : !x.claimed ? 1 : 2);
    $('missionsBody').innerHTML = `
      <div class="panel"><h3>Daily missions</h3><p class="note">Three new missions every day at midnight. Ranked and friend duels both count.</p>${PROF.missions().map(row).join('')}</div>
      <div class="panel"><h3>Quests</h3><p class="note">One-time goals with big rewards.</p>${qs.slice().sort((a, b) => order(a) - order(b)).map(row).join('')}</div>
      <div class="panel"><h3>More ways to earn koban</h3><ul>
        <li>Ranked win: <b>${PROF.REWARD.rankedWin}</b>, or <b>${PROF.REWARD.rankedLoss}</b> for a loss. 3 wins in a row: +${PROF.REWARD.streak}.</li>
        <li>First ranked win of the day: +${PROF.REWARD.firstWin}.</li>
        <li>Each new rank: +${PROF.REWARD.rankUp}.</li>
        <li>Friend duels: <b>${PROF.REWARD.friendWin}</b> for a win, <b>${PROF.REWARD.friendLoss}</b> for a loss (up to ${PROF.REWARD.friendDaily} duels a day).</li></ul></div>`;
    $('missionsBody').onclick = e => {
      const b = e.target.closest('[data-claim]'); if (!b) return;
      const n = PROF.claim(b.dataset.claim);
      if (n) { AU.play('coin'); AU.play('gain', 0.08); toast(`+${n} koban!`); renderMissions(); refreshCoins(); }
    };
  }

  /* ---------- collection (the Yokai Book) ---------- */
  let bFilter = 'all';
  function renderBook() {
    const list = G.CARDS.filter(c => bFilter === 'all' || UI.typeOf(c) === bFilter);
    const have = list.filter(c => PROF.owns(c.id)).length, total = PROF.ownedIds().length;
    $('bookFilters').innerHTML = ['all', ...TYPES].map(f => `<button type="button" data-f="${f}" aria-pressed="${bFilter === f}" class="${f !== 'all' ? 't-' + f : ''}">${f === 'all' ? '' : I[f]}${typeLabel(f)}</button>`).join('');
    $('bookCount').innerHTML = `<span><b>${total}</b> of ${G.CARDS.length} collected${bFilter !== 'all' ? ` · ${typeLabel(bFilter)}: ${have}/${list.length}` : ''}</span><span class="rbar"><i style="width:${Math.round(100 * total / G.CARDS.length)}%"></i></span>`;
    $('bookGrid').innerHTML = list.map(c => `<button type="button" class="bk" data-id="${c.id}" aria-label="${c.name}${PROF.owns(c.id) ? '' : ', locked'}">${UI.miniHTML(c.id, { el: 'span', locked: !PROF.owns(c.id), tag: PROF.isNewCard(c.id) ? 'NEW' : '' })}</button>`).join('');
    PROF.markSeen();
  }
  function bindBook() {
    $('bookFilters').onclick = e => { const b = e.target.closest('button[data-f]'); if (b) { bFilter = b.dataset.f; renderBook(); } };
    $('bookGrid').onclick = e => {
      const b = e.target.closest('.bk'); if (!b) return;
      const id = b.dataset.id;
      if (PROF.owns(id)) return popCard(id);
      const bag = PROF.bagFor(id);
      popCard(id, { locked: true, note: `Locked. Find it in the ${bag.name}${BY[id].rarity !== 'common' ? ' or the Golden bag' : ''}, or watch the daily stall.`,
        buttons: [{ label: 'Lucky Bags', cls: 'gold', fn: () => { $('bookSheet').hidden = true; KZ.show('shop'); } }] });
    };
  }

  return { COIN, coinPill, toast, refreshCoins, popCard, bagSVG, renderShop, renderDecks, renderMissions, renderBook, bindBook, deckTiles, closeBag, get bagOpen() { return !!B; },
    resetTab() { tab = null; } };
})();
