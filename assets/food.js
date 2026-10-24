/* The Cottage — ingredients, tools and dishes, all painted in code on the scene grid.
   Each ingredient has a skin sprite and a matching flesh sprite (same mask) so cuts and peels reveal real pixels. */
(function () {
  'use strict';
  var C = window.COT, A = C.art, P = C.P, R = C.ramp, pal = A.pal, OUT = pal.out;
  var F = C.food = { ing: {}, list: [] };
  function nz(s, sc) { return A.noise(s, sc); }
  function gr(s) { return A.grain(s); }
  function add(id, o) { o.id = id; F.ing[id] = o; F.list.push(id); }
  /* build sprite pair from a spec */
  function build(o, s) {
    var w = o.w(s), h = o.h(s), m = o.mask(s, w, h);
    var skin = A.dome(w, h, m, { ramp: o.ramp, R: o.Rr ? o.Rr(s) : null, tex: o.tex, spec: o.spec, outline: OUT, amb: o.amb, col: o.col });
    if (o.deco) o.deco(skin, s, w, h);
    var flesh = o.flesh ? A.dome(w, h, o.fmask ? o.fmask(s, w, h) : m, { ramp: o.flesh, R: Math.max(2, Math.min(w, h) / 2.5), tex: o.ftex || gr(9), col: o.fcol ? function (x, y, v, d) { return o.fcol(x, y, v, d, w, h); } : null, outline: OUT, amb: .5 }) : null;
    return { skin: skin, flesh: flesh, w: w, h: h };
  }
  F.sprite = function (id, s) { var o = F.ing[id], k = '_c' + (s || o.s); if (!o[k]) o[k] = build(o, s || o.s); return o[k]; };

  var RED = R(['#3d0a0e', '#6e1218', '#9e1d22', '#c9342c', '#e25a3c', '#f5916a']), GRN = R(['#1d3312', '#2f5a1b', '#4a8227', '#73ab3a', '#a3cf5a']);
  var BRN = R(['#2a150b', '#4a2814', '#6d3d1e', '#93582c', '#b77a45']);
  /* apple */
  add('apple', { n: 'Apple', s: 18, snd: 'crunch', peel: 1, w: function (s) { return s + 2; }, h: function (s) { return s + 4; },
    mask: function (s, w, h) { var r = s / 2; return A.not(A.or(A.ell(w / 2 - r * .28, h - r - 1, r * .78, r * .9), A.ell(w / 2 + r * .28, h - r - 1, r * .78, r * .9)), A.ell(w / 2, h - 2 * r + .3, r * .3, r * .32)); },
    fmask: function (s, w, h) { var r = s / 2; return A.or(A.ell(w / 2 - r * .28, h - r - 1, r * .78, r * .9), A.ell(w / 2 + r * .28, h - r - 1, r * .78, r * .9), A.ell(w / 2, h - r - 1.5, r * .98, r * .95)); },
    ramp: RED, spec: P('#ffd6c2'), tex: function (x, y) { return A.noise(3, 2)(x * 3, y * .5) * .9 + (C.hash(x, y, 5) - .5) * .5; },
    col: function (x, y, v) { return y > 17 && C.hash(x, y, 2) > .7 ? P('#e8a63a') : 0; },
    deco: function (p, s, w, h) { var cx = w / 2 | 0, top = h - s - 1; for (var i = 0; i < 4; i++) p.set(cx + (i > 2 ? 1 : 0), top - 3 + i, P(i < 1 ? '#2a150b' : '#5a3418')); p.set(cx + 1, top - 1, P('#2f5a1b')); p.set(cx + 2, top - 2, P('#4a8227')); p.set(cx + 3, top - 2, P('#73ab3a')); p.set(cx + 2, top - 3, P('#73ab3a')); p.set(cx + 4, top - 3, P('#2f5a1b')); p.set(cx + 3, top - 3, P('#a3cf5a')); },
    flesh: R(['#b8955a', '#dcc68e', '#efe2b5', '#fff8e2']), fcol: function (x, y, v, d, w, h) { var dx = x - w / 2, dy = y - h * .6; if (dx * dx + dy * dy < 5) return (x + y) % 3 === 0 ? P('#3a2010') : P('#d9c07c'); return 0; } });
  /* pumpkin with ribs */
  add('pumpkin', { n: 'Pumpkin', s: 30, snd: 'chop', w: function (s) { return s + 4; }, h: function (s) { return Math.round(s * .78) + 5; },
    mask: function (s, w, h) { var cy = h - s * .39 - 1; return A.or(A.ell(w / 2, cy, s / 2 + 1, s * .39), A.ell(w / 2 - s * .22, cy + 1, s * .3, s * .36), A.ell(w / 2 + s * .22, cy + 1, s * .3, s * .36)); },
    ramp: R(['#4a1a06', '#7c300b', '#b14d12', '#dc6f1c', '#f39232', '#ffc06a']), Rr: function (s) { return s / 3; }, spec: P('#ffe0a8'),
    tex: function (x, y) { return Math.cos((x - 2) * .62) * 1.6 - .3 + (C.hash(x, y, 7) - .5) * .4; },
    deco: function (p, s, w, h) { var cx = w / 2 | 0, top = h - Math.round(s * .78) - 2; for (var i = 0; i < 5; i++) { p.set(cx + (i > 2 ? 1 : 0), top + i - 2, P(i % 2 ? '#4a6a22' : '#36521a')); p.set(cx - 1 + (i > 2 ? 1 : 0), top + i - 2, P('#22350f')); } p.set(cx + 2, top - 2, P('#4a6a22')); },
    flesh: R(['#a8460e', '#d9701c', '#f1953a', '#ffbb63', '#ffd796']), fcol: function (x, y, v, d, w, h) { var dx = (x - w / 2) / (w * .22), dy = (y - h * .58) / (h * .2); var q = dx * dx + dy * dy; if (q < 1) return C.hash(x, y, 4) > .78 ? P('#fff1c8') : P('#e9a548'); return 0; } });
  add('onion', { n: 'Onion', s: 16, snd: 'crunch', peel: 1, w: function (s) { return s + 2; }, h: function (s) { return s + 5; },
    mask: function (s, w, h) { var r = s / 2; return A.or(A.ell(w / 2, h - r - 1, r, r * .92), function (x, y) { var t = (h - r - 1 - y) / 5; return t > 0 && t < 1 && Math.abs(x + .5 - w / 2) < (1 - t) * r * .5 + .6; }); },
    ramp: R(['#4a2208', '#7a3f12', '#a8621e', '#cf8a35', '#ebb45c', '#f8d896']), spec: P('#fff0c8'), tex: function (x, y) { return Math.cos((x - 9) * .9) * .9; },
    deco: function (p, s, w, h) { var cx = w / 2 | 0; p.set(cx, 0, P('#7a5a2a')); p.set(cx, 1, P('#a8862a')); for (var i = -2; i <= 2; i++) p.set(cx + i, h - 1, P('#d8c8a0')); },
    flesh: R(['#a99a6c', '#d6cfa4', '#eee9cc', '#fbfaf0']), fcol: function (x, y, v, d) { return (d | 0) % 3 === 0 ? P('#c9c39a') : 0; } });
  add('carrot', { n: 'Carrot', s: 32, snd: 'chop', w: function (s) { return s + 2; }, h: function () { return 14; },
    mask: function (s, w, h) { return function (x, y) { var t = (x - 7) / (s - 7); if (t < 0 || t > 1) return false; var r = 4.2 * (1 - t * .85); return Math.abs(y + .5 - 9) <= r; }; },
    ramp: R(['#6a2405', '#a8410b', '#dc6a14', '#f58f2a', '#ffb860']), spec: P('#ffe0b0'), tex: function (x, y) { return (C.hash(x, 0, 3) > .82 ? -1.3 : 0) + (C.hash(x, y, 9) - .5) * .4; },
    deco: function (p) { var G = [P('#2f5a1b'), P('#4a8227'), P('#73ab3a')]; for (var i = 0; i < 7; i++) { p.set(6 - i, 9 - (i * .6 | 0), G[i % 3]); p.set(6 - i, 7 - (i * 1.1 | 0), G[(i + 1) % 3]); p.set(5 - i, 10 + (i * .4 | 0), G[(i + 2) % 3]); } },
    flesh: R(['#b4500f', '#e57820', '#ff9c3e', '#ffc078']), fcol: function (x, y, v, d) { return d > 2.2 ? P('#ffcf8a') : 0; } });
  add('celery', { n: 'Celery', s: 34, snd: 'crunch', w: function (s) { return s + 2; }, h: function () { return 11; },
    mask: function (s) { return A.rrect(1, 3, s, 6, 2); }, ramp: R(['#2c4a18', '#4f7a26', '#78a83a', '#a2cc5c', '#cbe892']), tex: function (x, y) { return (y % 2 ? .6 : -.6); },
    deco: function (p, s) { var G = [P('#4a8227'), P('#73ab3a'), P('#a3cf5a')]; for (var i = 0; i < 6; i++) { p.set(s - 1 + (i % 2), 2 + i, G[i % 3]); p.set(s + 1, 1 + i, G[(i + 1) % 3]); } },
    flesh: R(['#6a8a3a', '#a6c46a', '#d5e7a8', '#eef6d6']) });
  add('potato', { n: 'Potato', s: 22, snd: 'chop', peel: 1, w: function (s) { return s + 2; }, h: function (s) { return Math.round(s * .72) + 2; },
    mask: function (s, w, h) { var a = A.ell(w / 2, h / 2, s / 2, s * .34); return function (x, y) { return a(x + Math.round(A.noise(4, 3)(x, y) * 1.2), y); }; },
    ramp: R(['#3e2a12', '#6a4a24', '#957040', '#b9925a', '#d4b27a', '#ead2a0']), tex: function (x, y) { return C.hash(x, y, 4) > .93 ? -2.5 : A.noise(6, 2)(x, y) * .6; },
    flesh: R(['#b8a050', '#e2cf80', '#f4e7aa', '#fff6d2']) });
  add('beef', { n: 'Beef', s: 26, snd: 'chop', w: function (s) { return s + 2; }, h: function (s) { return Math.round(s * .62) + 2; },
    mask: function (s, w, h) { return A.rrect(1, 1, w - 2, h - 2, 5); }, ramp: R(['#3a0a10', '#621420', '#8e2430', '#b23b43', '#cf6162', '#e89090']), amb: .3,
    tex: function (x, y) { var n = A.noise(11, 2.5)(x, y); return Math.abs(n) < .1 ? 2.2 : n * .5; },
    col: function (x, y, v) { return Math.abs(A.noise(11, 2.5)(x, y)) < .07 ? P('#f3dcd2') : 0; },
    flesh: R(['#5a0f18', '#8e2430', '#b23b43', '#cf6162']), fcol: function (x, y) { return Math.abs(A.noise(12, 2)(x, y)) < .08 ? P('#f0d8cc') : 0; } });
  add('butter', { n: 'Butter', s: 22, snd: 'slice', w: function (s) { return s + 2; }, h: function () { return 12; },
    mask: function (s) { return A.rrect(1, 2, s, 8, 1); }, ramp: R(['#a8862a', '#d9b84a', '#f1d872', '#fbeaa0', '#fff6d0']), amb: .45, Rr: function () { return 2; },
    deco: function (p, s) { for (var x = s - 6; x < s + 1; x++) for (var y = 2; y < 10; y++) p.set(x, y, (x + y) % 5 ? P('#f4f0e6') : P('#c8302a')); p.outline(OUT); },
    flesh: R(['#c9a640', '#ecd170', '#fbe89c', '#fff4c8']) });
  add('pecan', { n: 'Pecans', s: 10, snd: 'crunch', w: function (s) { return s + 2; }, h: function (s) { return Math.round(s * .6) + 2; },
    mask: function (s, w, h) { return A.ell(w / 2, h / 2, s / 2, s * .3); }, ramp: R(['#2a1206', '#4e2610', '#7a3e1a', '#a35d2a', '#c8864a']), tex: function (x, y) { return Math.sin(x * 1.9 + y) * .9; },
    flesh: R(['#6a3a18', '#a06a38', '#c99a64', '#e6c494']) });
  add('egg', { n: 'Eggs', s: 11, snd: 'clink', w: function (s) { return s + 2; }, h: function (s) { return s + 4; }, mask: function (s, w, h) { return function (x, y) { var dx = (x + .5 - w / 2) / (s / 2), dy = (y + .5 - h / 2) / ((h - 2) / 2); dx *= 1 + dy * .16; return dx * dx + dy * dy <= 1; }; },
    ramp: R(['#7a5a3a', '#a88458', '#cfae80', '#e8cfa6', '#f8ead0']), spec: P('#fffaf0'), tex: function (x, y) { return C.hash(x, y, 13) > .92 ? -1.2 : 0; } });
  add('herbs', { n: 'Rosemary & thyme', s: 18, snd: 'cloth', w: function () { return 18; }, h: function () { return 20; }, mask: function () { return function (x, y) { return (Math.abs(x - 9 + (y - 18) * .1) < 1 && y > 6) || (C.hash(x, y, 31) > .45 && Math.abs(x - 9 - (y - 14) * .25 * Math.sin(x)) < 6 - y * .12 && y > 1 && y < 15); }; },
    ramp: R(['#173014', '#2a4f22', '#3f7334', '#5d9a48', '#8cc06a']), amb: .4, deco: function (p) { for (var x = 6; x < 12; x++) { p.set(x, 15, P('#8a3a2a')); p.set(x, 16, P('#b05038')); } } });
  add('cloves', { n: 'Cloves', s: 8, w: function () { return 9; }, h: function () { return 11; }, mask: function () { return A.or(A.rrect(3, 4, 3, 7, 1), A.ell(4.5, 3, 2.6, 2.4)); }, ramp: R(['#1e0c06', '#3a1a0c', '#5c2c16', '#844426']) });
  add('marsh', { n: 'Marshmallows', s: 7, w: function () { return 8; }, h: function () { return 8; }, mask: function () { return A.rrect(1, 1, 6, 6, 2); }, ramp: R(['#b8aca4', '#ddd4ce', '#f4eeea', '#ffffff']), amb: .5 });
  add('ginger', { n: 'Ginger', s: 16, w: function () { return 18; }, h: function () { return 12; }, mask: function () { return A.or(A.ell(7, 7, 6, 3.6), A.ell(12, 5, 4, 2.6), A.ell(4, 4.5, 2.6, 2.2)); }, ramp: R(['#5a3a16', '#8a6232', '#b88c52', '#d9b47a', '#efd6a8']) });
  /* ---------- containers (jars, sacks, bottles) ---------- */
  function jar(id, n, fill, lid, label, o) { o = o || {}; add(id, { n: n, s: 14, snd: 'jar', jar: 1, pourCol: o.pc || fill[3], w: function () { return 16; }, h: function () { return 20; }, mask: function () { return A.or(A.rrect(1, 5, 14, 14, 3), A.rrect(3, 2, 10, 4, 1)); }, ramp: R(['#3a4a52', '#6a7f88', '#a6bcc2', '#d8e6ea', '#f6fcff']), amb: .4,
    col: function (x, y, v) { if (y >= 2 && y < 5) return C.rp(lid, v, x, y); if (y >= o.top || (y >= 8 && !o.top)) { if (label && y >= 11 && y < 15 && x > 2 && x < 13) return y === 11 || y === 14 ? P('#a88a5a') : (x > 4 && x < 11 && y === 12 && (x % 2) ? P('#5a3a20') : P('#efe3c4')); return C.rp(fill, v + C.hash(x, y, 3) * .15 - .07, x, y); } return 0; }, spec: P('#ffffff') }); }
  jar('sugar', 'Sugar', R(['#c8c0b4', '#e2ddd6', '#f6f3ee', '#ffffff']), R(['#5a3218', '#8a5228', '#b07040']), 1, { pc: P('#ffffff') });
  jar('brown', 'Brown sugar', R(['#5a2e10', '#8a4e1e', '#b0703a', '#cf9256']), R(['#3a3a42', '#6a6a74', '#9a9aa4']), 1);
  jar('cinnamon', 'Cinnamon', R(['#4a1e0c', '#73341a', '#9a4c28', '#b9683a']), R(['#7a1a14', '#a8302a', '#d0503c']), 1);
  jar('spice', 'Pie spice', R(['#5a2a10', '#84461e', '#aa6230', '#c8844a']), R(['#2a4a2a', '#3f6e3a', '#5f945a']), 1);
  jar('molasses', 'Molasses', R(['#1a0a04', '#33160a', '#4e2410', '#6a3418']), R(['#7a1a14', '#a8302a', '#d0503c']), 1, { top: 7 });
  jar('honey', 'Honey glaze', R(['#7a3a06', '#b8640e', '#e0901c', '#f8bc40']), R(['#5a3218', '#8a5228', '#b07040']), 1, { top: 7 });
  jar('cocoa', 'Cocoa', R(['#2a120a', '#45200f', '#633018', '#7e4322']), R(['#7a1a14', '#a8302a', '#d0503c']), 1);
  jar('yeast', 'Yeast', R(['#9a7a46', '#c4a468', '#e0c68a', '#f2e0b0']), R(['#3a3a42', '#6a6a74', '#9a9aa4']), 1);
  add('flour', { n: 'Flour', s: 20, snd: 'pourDry', pourCol: P('#fbf6ec'), w: function () { return 20; }, h: function () { return 22; }, mask: function () { return function (x, y) { var t = y / 22; return y > 1 && Math.abs(x + .5 - 10) < 6 + t * 3.4 + (y < 4 ? (x % 3 === 0 ? -1 : 0) : 0); }; },
    ramp: R(['#6a5a3e', '#9a8662', '#c4b08a', '#e2d2ae', '#f4ead2']), tex: function (x, y) { return ((x + y) % 2 ? .25 : -.25) + (y === 5 ? -1.5 : 0); },
    deco: function (p) { for (var x = 6; x < 15; x++) for (var y = 10; y < 15; y++) if (y === 10 || y === 14 || ((x * 7 + y * 3) % 5 === 0)) p.set(x, y, P('#7a3a2a')); } });
  add('milk', { n: 'Milk', s: 12, snd: 'clink', pourCol: P('#fbfbf6'), w: function () { return 12; }, h: function () { return 22; }, mask: function () { return A.or(A.rrect(1, 8, 10, 13, 3), A.rrect(3, 2, 6, 7, 1)); }, ramp: R(['#8a948e', '#c4ccc8', '#eef2ee', '#ffffff']), amb: .5, spec: P('#ffffff'),
    col: function (x, y, v) { return y < 4 ? C.rp(R(['#1f3a6a', '#3a5aa0', '#5a80c8']), v, x, y) : (y > 12 && y < 17 && x > 2 && x < 9 ? (y === 14 && x % 2 ? P('#3a5aa0') : P('#d8e4f4')) : 0); } });
  add('cream', { n: 'Cream', s: 12, snd: 'clink', pourCol: P('#fffbf0'), w: function () { return 14; }, h: function () { return 14; }, mask: function () { return A.or(A.rrect(2, 3, 10, 10, 3), A.ell(12.5, 7, 2, 3)); }, ramp: pal.blueware.concat([P('#c8d4f0'), P('#ffffff')]), amb: .4 });
  add('water', { n: 'Water', s: 16, snd: 'clink', pourCol: P('#bfe2f4'), w: function () { return 18; }, h: function () { return 18; }, mask: function () { return A.or(A.rrect(3, 3, 11, 14, 3), A.ell(15, 9, 2.4, 4), A.rrect(2, 1, 6, 3, 1)); }, ramp: R(['#2a3a3e', '#5a6c70', '#8ca0a4', '#c0d4d6', '#eaf6f8']), amb: .35, spec: P('#ffffff') });
  add('broth', { n: 'Broth', s: 16, snd: 'clink', pourCol: P('#b8762e'), w: function () { return 14; }, h: function () { return 20; }, mask: function () { return A.or(A.rrect(1, 6, 12, 13, 3), A.rrect(4, 1, 6, 6, 1)); }, ramp: R(['#3a1c08', '#6a3a14', '#9a5e24', '#c48a44', '#e0b070']), amb: .35, spec: P('#ffe8c0'), col: function (x, y) { return y < 3 ? P('#8a3a2a') : 0; } });
  add('salt', { n: 'Salt', s: 8, w: function () { return 9; }, h: function () { return 15; }, mask: function () { return A.or(A.rrect(1, 5, 7, 10, 2), A.rrect(2, 1, 5, 5, 2)); }, ramp: pal.metal.slice(1), amb: .4, col: function (x, y, v) { return y > 6 ? C.rp(R(['#a8a49c', '#d8d4cc', '#f8f6f2']), v, x, y) : 0; }, deco: function (p) { p.set(3, 2, P('#1f2226')); p.set(5, 2, P('#1f2226')); p.set(4, 3, P('#1f2226')); } });
  add('pepper', { n: 'Pepper', s: 8, w: function () { return 9; }, h: function () { return 16; }, mask: function () { return A.or(A.rrect(1, 5, 7, 11, 2), A.rrect(3, 0, 3, 6, 1)); }, ramp: pal.wood.slice(1), amb: .4 });
  add('turkey', { n: 'Turkey', s: 40, w: function () { return 44; }, h: function () { return 30; }, mask: function () { return turkeyMask(44, 30); }, ramp: R(['#7a4a3a', '#b07a62', '#d6a688', '#ecc8a8', '#f8e2c8', '#fff4e6']), tex: gr(21), amb: .3 });
  add('ham', { n: 'Ham', s: 34, w: function () { return 36; }, h: function () { return 28; }, mask: function () { return hamMask(36, 28); }, ramp: R(['#6a2a2a', '#a2483e', '#cc6e5e', '#e89a88', '#f6c4b2']), tex: gr(22), amb: .3 });
  add('dough', { n: 'Dough', s: 24 });
  function turkeyMask(w, h) { return A.or(A.ell(w / 2, h * .58, w * .4, h * .38), A.ell(w * .2, h * .32, w * .14, h * .18), A.ell(w * .8, h * .32, w * .14, h * .18), A.rrect(w * .08 | 0, h * .12 | 0, 4, 5, 2), A.rrect(w * .82 | 0, h * .12 | 0, 4, 5, 2)); }
  function hamMask(w, h) { return A.or(A.ell(w * .46, h * .56, w * .42, h * .42), A.ell(w * .86, h * .3, w * .1, h * .14)); }
  F.turkeyMask = turkeyMask; F.hamMask = hamMask;

  /* ---------- tools ---------- */
  var T = F.tools = {};
  T.knife = A.fromFn(26, 7, function (x, y) { if (x < 9) return y >= 2 && y <= 4 ? (y === 2 ? P('#8a5a32') : y === 4 ? P('#3a1e10') : P('#6a3e22')) : (x === 3 || x === 6) && y === 3 ? P('#d8c8a0') : 0; if (y >= 1 && y <= 4 + (x < 22 ? 0 : -(x - 22)) && y <= 5) return y === 1 ? P('#ffffff') : y === 4 || y === 5 ? P('#7a848c') : P('#c8d0d6'); return 0; }).outline(OUT);
  T.peeler = A.fromFn(22, 7, function (x, y) { if (x < 10) return y >= 2 && y <= 4 ? (y === 2 ? P('#d0503c') : P('#8a2a1e')) : 0; if (y >= 1 && y <= 5 && (x < 12 || x > 19 || y === 1 || y === 5)) return P(y < 3 ? '#e0e6ea' : '#9aa4ac'); if (y === 3 && x > 12 && x < 19) return P('#6a747c'); return 0; }).outline(OUT);
  T.pin = A.dome(48, 8, A.or(A.rrect(0, 2, 8, 4, 2), A.rrect(8, 0, 32, 8, 3), A.rrect(40, 2, 8, 4, 2)), { ramp: pal.woodL, R: 3, outline: OUT, tex: function (x) { return Math.sin(x * .7) * .3; } });
  T.brush = A.fromFn(10, 22, function (x, y) { if (y < 12) return Math.abs(x - 4.5) < 1.2 ? P(y % 4 ? '#8a5a32' : '#6a3e22') : 0; if (y < 14) return x > 1 && x < 8 ? P('#adb5bc') : 0; return x > 0 && x < 9 && y < 21 - (x === 1 || x === 8 ? 1 : 0) ? P(x % 2 ? '#e8c890' : '#c8a060') : 0; }).outline(OUT);
  T.spoon = A.fromFn(10, 30, function (x, y) { if (y < 20) return Math.abs(x - 4.5) < 1.1 ? P(y % 5 ? '#ae7744' : '#7a4a2c') : 0; var dx = (x - 4.5) / 4, dy = (y - 24.5) / 5; return dx * dx + dy * dy <= 1 ? P(dx < -.2 || dy < -.4 ? '#c99356' : '#966139') : 0; }).outline(OUT);
  T.mitt = A.dome(18, 20, A.or(A.ell(9, 9, 7, 8), A.ell(3, 10, 2.6, 4), A.rrect(3, 14, 12, 6, 1)), { ramp: R(['#4a0e14', '#7a1a22', '#a82a30', '#d04a48', '#ec7a70']), outline: OUT, tex: function (x, y) { return ((x >> 1) + (y >> 1)) % 2 ? .5 : -.5; }, col: function (x, y) { return y >= 16 ? ((x + y) % 2 ? P('#f4ead2') : P('#d8c8a8')) : 0; } });
  T.cutter = A.fromFn(16, 18, function (x, y) { var g = gman(x - 1, y - 1, 14, 16), e = gman(x, y, 16, 18, 1); return e && !g ? P('#adb5bc') : 0; }).outline(OUT);
  T.bag = A.dome(16, 22, A.or(function (x, y) { return y >= 2 && Math.abs(x + .5 - 8) < (22 - y) * .33; }), { ramp: R(['#a8a49c', '#d8d4cc', '#f4f2ee', '#ffffff']), outline: OUT, amb: .5 });
  T.shakerS = F.sprite('salt').skin; T.shakerP = F.sprite('pepper').skin;
  /* gingerbread person mask */
  function gman(x, y, w, h, grow) { var g = grow ? 1.2 : 0, cx = w / 2; var hx = (x + .5 - cx) / (w * .19 + g), hy = (y + .5 - h * .2) / (h * .17 + g); if (hx * hx + hy * hy <= 1) return true;
    if (y >= h * .34 - g && y < h * .62 + g && Math.abs(x + .5 - cx) < w * .5 * (y < h * .48 + g ? 1 : .55)) return true;
    if (y >= h * .58 - g && y < h + g && Math.abs(Math.abs(x + .5 - cx) - w * .2) < w * .14 + g * .5) return true; return false; }
  F.gman = gman;
  /* small pixel icons for the step hints */
  F.icon = {};
})();
