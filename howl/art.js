/* Howl — role emblems, drawn here as small SVGs (64×64, one colour + the card face colour for cut-outs). */
(function (root) {
  'use strict';
  const COLORS = {
    werewolf: '#c8364d', minion: '#9160d8', doppelganger: '#2f9fae', seer: '#4b82de', robber: '#d68d22',
    troublemaker: '#dc5a9d', drunk: '#64a83a', insomniac: '#6c70dc', mason: '#a8714a', hunter: '#3b8758', villager: '#9a8452',
  };
  /* F = ink colour, B = cut-out colour (the card face) */
  const SHAPES = {
    werewolf: (F, B) => `<path fill="${F}" d="M12 6l11 15 9-4 9 4 11-15v23c0 15-9 25-20 30C21 54 12 44 12 29z"/><path fill="${B}" d="M20 30l9 4-1 4-8-3zM44 30l-9 4 1 4 8-3z"/><path fill="${B}" d="M27 46h10l-5 6z"/>`,
    minion: (F, B) => `<path fill="${F}" d="M32 5C17 5 10 19 10 33v24h44V33C54 19 47 5 32 5z"/><path fill="${B}" d="M32 17c-9 0-14 8-14 17v8c4 3 9 5 14 5s10-2 14-5v-8c0-9-5-17-14-17z"/><circle cx="26" cy="33" r="2.6" fill="${F}"/><circle cx="38" cy="33" r="2.6" fill="${F}"/>`,
    doppelganger: (F, B) => `<path fill="${F}" opacity=".45" d="M30 8h24v22c0 12-6 20-12 22-6-2-12-10-12-22z"/><path fill="${F}" d="M10 14h26v22c0 13-7 21-13 23-6-2-13-10-13-23z"/><path fill="${B}" d="M15 27l7 2v3l-7-1zM31 27l-7 2v3l7-1zM18 44c3 2 7 2 10 0"/><path fill="none" stroke="${B}" stroke-width="2.4" stroke-linecap="round" d="M18 44c3 2 7 2 10 0"/>`,
    seer: (F, B) => `<path fill="${F}" d="M4 32c8-12 18-18 28-18s20 6 28 18c-8 12-18 18-28 18S12 44 4 32z"/><circle cx="32" cy="32" r="11" fill="${B}"/><circle cx="32" cy="32" r="6" fill="${F}"/><g stroke="${F}" stroke-width="3" stroke-linecap="round"><path d="M32 3v6M14 8l3 5M50 8l-3 5M32 55v6"/></g>`,
    robber: (F, B) => `<path fill="${F}" d="M3 26c7-6 17-7 29-2 12-5 22-4 29 2-1 10-7 17-16 17-6 0-10-3-13-7-3 4-7 7-13 7-9 0-15-7-16-17z"/><ellipse cx="20" cy="31" rx="6" ry="4.4" fill="${B}"/><ellipse cx="44" cy="31" rx="6" ry="4.4" fill="${B}"/><path fill="${F}" d="M58 24l5-6v10z"/>`,
    troublemaker: (F) => `<g fill="none" stroke="${F}" stroke-width="6" stroke-linecap="round"><path d="M12 24c4-10 13-14 22-13 6 1 11 4 14 8"/><path d="M52 40c-4 10-13 14-22 13-6-1-11-4-14-8"/></g><path fill="${F}" d="M42 9l13 9-15 5zM22 55L9 46l15-5z"/>`,
    drunk: (F, B) => `<g transform="rotate(-14 32 34)"><rect x="12" y="20" width="30" height="34" rx="5" fill="${F}"/><path fill="none" stroke="${F}" stroke-width="5" d="M42 28h5a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6h-5"/><path fill="${B}" d="M17 26h20v4H17z"/><path fill="${F}" d="M10 21c0-6 5-9 9-8 2-4 8-5 11-2 4-3 11 0 11 5 3 1 4 4 3 6H10z"/></g><circle cx="52" cy="13" r="3" fill="${F}"/><circle cx="57" cy="5" r="2" fill="${F}"/>`,
    insomniac: (F, B) => `<path fill="${F}" d="M24 26h16v32H24z"/><path fill="${B}" d="M28 30h3v24h-3z" opacity=".6"/><path fill="${F}" d="M32 4c6 7 8 12 8 15a8 8 0 0 1-16 0c0-3 2-8 8-15z"/><path fill="${B}" d="M32 13c2 3 3 5 3 6.5a3 3 0 0 1-6 0c0-1.5 1-3.5 3-6.5z"/><path fill="${F}" d="M14 58h36v4H14z"/>`,
    mason: (F, B) => `<g fill="${F}"><rect x="4" y="44" width="17" height="8" rx="1.5"/><rect x="23" y="44" width="17" height="8" rx="1.5"/><rect x="42" y="44" width="18" height="8" rx="1.5"/><rect x="13" y="54" width="17" height="7" rx="1.5"/><rect x="32" y="54" width="17" height="7" rx="1.5"/></g><path fill="${F}" d="M38 5l20 20-16 6-10-10z"/><path fill="${F}" d="M33 24l5 5-17 13c-2 1.5-4 1.5-5 0s-1.5-3 0-5z"/><path fill="${B}" d="M41 13l8 8" stroke="${B}" stroke-width="2"/>`,
    hunter: (F) => `<path fill="none" stroke="${F}" stroke-width="5" stroke-linecap="round" d="M16 6c18 6 26 20 26 26S34 52 16 58"/><path stroke="${F}" stroke-width="2" d="M16 6v52"/><path stroke="${F}" stroke-width="4" stroke-linecap="round" d="M8 32h46"/><path fill="${F}" d="M62 32l-11-7v14z"/><path fill="${F}" d="M8 32l-5-6h7l4 6-4 6H3z"/>`,
    villager: (F) => `<path stroke="${F}" stroke-width="5" stroke-linecap="round" d="M32 62V26"/><path fill="none" stroke="${F}" stroke-width="4.5" stroke-linecap="round" d="M16 6v14c0 6 7 8 16 8s16-2 16-8V6M32 4v22"/>`,
  };
  function emblem(role, opts) {
    opts = opts || {};
    const base = String(role || '').replace(/^doppel:/, '');
    const draw = SHAPES[base];
    const F = opts.color || COLORS[base] || '#888', B = opts.cut || '#f3ead2';
    const size = opts.size || 64;
    if (!draw) return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true"><circle cx="32" cy="32" r="20" fill="${F}"/></svg>`;
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${draw(F, B)}</svg>`;
  }
  /* card back: a moon over a hill line */
  function back(size) {
    return `<svg viewBox="0 0 100 148" width="${size || 100}" aria-hidden="true" class="backart">
      <rect x="6" y="6" width="88" height="136" rx="9" fill="none" stroke="#f3ead2" stroke-opacity=".28" stroke-width="1.4"/>
      <circle cx="50" cy="62" r="22" fill="#f3ead2" opacity=".92"/>
      <circle cx="58" cy="55" r="20" fill="#232a5e"/>
      <g fill="#f3ead2" opacity=".7"><circle cx="24" cy="30" r="1.3"/><circle cx="78" cy="38" r="1.1"/><circle cx="70" cy="96" r="1"/><circle cx="30" cy="104" r="1.2"/><circle cx="82" cy="20" r="1.4"/><circle cx="18" cy="76" r=".9"/></g>
      <path d="M6 118c14-9 26-11 38-6s26 4 50-6v26a10 10 0 0 1-10 10H16A10 10 0 0 1 6 132z" fill="#151a3f"/>
    </svg>`;
  }
  root.ART = { COLORS, emblem, back };
})(self);
