/* The Cottage — the cat: a ginger tabby painted from shaded ellipses (stripes, cream chest, pink nose, ear tufts).
   Behaviour: mostly asleep on the rug (breathing, little z's), sometimes wakes, stretches, sits, grooms, wanders, and very
   rarely chases a yarn ball. Petting (click or rub) makes it purr (real purr recording) with tiny hearts. */
(function () {
  'use strict';
  var C = window.COT, A = C.art, P = C.P, R = C.ramp, OUT = A.pal.out;
  var FUR = R(['#3a1606', '#6a2c0e', '#9a4818', '#c46a28', '#e2904a', '#f6b878']), CREAM = R(['#a8805a', '#d8b68e', '#f4dcb8', '#fff0dc']);
  var cache = {};
  function tabby(x, y) { return Math.sin(x * 1.25 + y * .35) > .45 ? -2.2 : 0; }
  function mk(key, w, h, parts, belly, deco) {
    if (cache[key]) return cache[key];
    var p = A.dome(w, h, A.or.apply(null, parts), { ramp: FUR, R: 4, outline: OUT, amb: .25, tex: tabby, pat: function (x, y) { return A.tex.fur(x, y); }, col: function (x, y, v) { return belly && belly(x, y) ? C.rp(CREAM, v, x, y) : 0; } });
    if (deco) deco(p); return (cache[key] = p);
  }
  function ear(cx, by, s) { return function (x, y) { var t = (by - y) / 4; return t >= 0 && t <= 1 && Math.abs(x + .5 - cx) <= (1 - t) * 2.2 * (s || 1); }; }
  function closedEye(p, x, y) { p.set(x, y, P('#2a1206')); p.set(x + 1, y + 1, P('#2a1206')); p.set(x + 2, y, P('#2a1206')); }
  function openEye(p, x, y) { p.set(x, y, P('#1a2a10')); p.set(x + 1, y, P('#7ac040')); p.set(x, y - 1, P('#2a1206')); p.set(x + 1, y - 1, P('#2a1206')); }
  var CAT = C.cat = {};
  CAT.sprite = function (pose, f) {
    f = f || 0;
    if (pose === 'sleep') { var b = f ? 1 : 0; return mk('sl' + b, 30, 17, [A.ell(13, 10, 11.5, 6 + b * .6), A.ell(22, 9.5, 5.4, 4.3), ear(20, 6.5), ear(24.5, 6.8), A.ell(9, 14.5, 9, 2.2)], function (x, y) { return y > 13 && x < 18 && x > 1; },
      function (p) { closedEye(p, 21, 10); closedEye(p, 24, 10); p.set(26, 11, P('#e88a8a')); p.set(20, 4, P('#f4a0a0')); }); }
    if (pose === 'loaf') { return mk('lf' + f, 26, 18, [A.ell(11, 11.5, 10, 6), A.ell(19.5, 7, 5.4, 4.6), ear(17.5, 4), ear(22, 4.2), A.ell(4, 15, 4, 2)], function (x, y) { return x > 14 && y > 9; },
      function (p) { if (f) { closedEye(p, 17, 7); closedEye(p, 21, 7); } else { openEye(p, 17, 8); openEye(p, 21, 8); } p.set(19, 9, P('#e88a8a')); p.set(20, 9, P('#e88a8a')); }); }
    if (pose === 'sit') { return mk('st' + f, 22, 26, [A.ell(10, 17, 6.5, 8), A.ell(11, 7, 5.6, 4.8), ear(8.5, 3.6), ear(13.5, 3.6), A.rrect(7, 22, 3, 4, 1), A.rrect(11, 22, 3, 4, 1), A.ell(16 + (f ? 1 : 0), 22, 4.5, 1.8)], function (x, y) { return y > 11 && y < 21 && Math.abs(x - 10.5) < 3; },
      function (p) { if (f === 2) { closedEye(p, 8, 7); closedEye(p, 12, 7); } else { openEye(p, 8, 8); openEye(p, 12, 8); } p.set(10, 9, P('#e88a8a')); p.set(11, 9, P('#e88a8a')); }); }
    if (pose === 'stretch') { return mk('sr', 34, 18, [A.ell(13, 9, 9, 4), A.ell(6, 7, 5, 5), A.ell(25, 11, 4.6, 3.8), ear(23.5, 8.6), ear(27.5, 8.8), A.rrect(27, 13, 7, 2, 1), A.rrect(4, 10, 3, 7, 1), A.rrect(8, 10, 3, 7, 1), function (x, y) { return Math.abs(x - 2 + (y - 2) * .3) < 1.2 && y < 6 && y > 0; }], function (x, y) { return y > 10 && x > 11 && x < 21; },
      function (p) { closedEye(p, 24, 11); closedEye(p, 27, 11); p.set(29, 12, P('#e88a8a')); }); }
    /* walk / run (2 frames) */
    var a = f % 2; return mk('wk' + a, 32, 20, [A.ell(14, 9, 9.5, 4.8), A.ell(24.5, 6, 5, 4.4), ear(22.6, 3), ear(27, 3.2), A.rrect(8 + a * 2, 11, 3, 8, 1), A.rrect(18 - a * 2, 11, 3, 8, 1), A.rrect(11 - a, 11, 3, 7, 1), A.rrect(20 + a, 11, 3, 7, 1), function (x, y) { return Math.abs(x - 4 + (y - 8) * .6) < 1.3 && y < 9 && y > 1; }], function (x, y) { return y > 10 && x > 10 && x < 20 && y < 13; },
      function (p) { openEye(p, 25, 6); p.set(28, 7, P('#e88a8a')); });
  };
  /* small pixel heart and z */
  CAT.heart = function (g, x, y, a) { var H = ['.#.#.', '#####', '#####', '.###.', '..#..']; g.fillStyle = a ? '#ff8aa0' : '#e05070'; for (var j = 0; j < 5; j++) for (var i = 0; i < 5; i++) if (H[j][i] === '#') g.fillRect(x + i, y + j, 1, 1); };
  CAT.z = function (g, x, y, s) { g.fillStyle = '#fff3dc'; var n = s ? 4 : 3; for (var i = 0; i < n; i++) { g.fillRect(x + i, y, 1, 1); g.fillRect(x + i, y + n - 1, 1, 1); g.fillRect(x + n - 1 - i, y + i, 1, 1); } };
  /* yarn ball */
  CAT.yarn = A.dome(9, 9, A.ell(4.5, 4.5, 4, 4), { ramp: R(['#3a1a4a', '#6a2a6a', '#9a4a8a', '#c470a8', '#e8a0c8']), outline: OUT, tex: function (x, y) { return Math.sin((x - y) * 1.6) > .3 ? -1.4 : 0; } });
  /* ---------- behaviour ---------- */
  var K = CAT.st = { x: 0, y: 0, pose: 'sleep', t: 0, dir: 1, f: 0, pet: 0, hearts: [], zs: [], state: 'sleep', tgt: null, nextT: 20, yarn: null, purr: 0 };
  CAT.place = function (x, y) { K.home = { x: x, y: y }; if (!K.placed) { K.x = x; K.y = y; K.placed = 1; } };
  CAT.forceChase = function () { K.state = 'chase'; K.t = 0; };
  CAT.box = function () { var s = CAT.sprite(K.pose, K.f); return { x: Math.round(K.x - s.w / 2), y: Math.round(K.y - s.h), w: s.w, h: s.h }; };
  CAT.update = function (dt, L) {
    K.t += dt; K.nextT -= dt; K.pet = Math.max(0, K.pet - dt); var hm = K.home;
    if (K.pet > 0) { K.purr = Math.min(1, K.purr + dt * 3); if (K.state === 'sleep' || K.state === 'sit') { K.state = 'loaf'; K.t = 0; } } else K.purr = Math.max(0, K.purr - dt * .8);
    if (K.purr > 0) C.sfx.loop('purr', K.purr);
    switch (K.state) {
      case 'sleep': K.pose = 'sleep'; K.f = Math.sin(K.t * 1.6) > 0 ? 1 : 0; if (Math.random() < dt * .5) K.zs.push({ x: K.x + 8 * K.dir, y: K.y - 14, a: 0 });
        if (K.nextT <= 0) { K.state = 'stretch'; K.t = 0; } break;
      case 'stretch': K.pose = 'stretch'; if (K.t > 2.2) { K.state = 'sit'; K.t = 0; K.nextT = 6 + Math.random() * 6; } break;
      case 'sit': K.pose = 'sit'; K.f = (K.t % 5) > 4.2 ? 2 : (K.t % 3 > 2.6 ? 1 : 0);
        if (K.nextT <= 0) { var r = Math.random(); if (r < .14) { K.state = 'chase'; K.t = 0; } else if (r < .6) { K.state = 'walk'; K.tgt = hm.x + (Math.random() - .5) * (L.rug.rx * 1.4); K.t = 0; } else { K.state = 'sleep'; K.t = 0; K.nextT = 25 + Math.random() * 30; } } break;
      case 'loaf': K.pose = 'loaf'; K.f = 1; if (K.pet <= 0 && K.t > 1.5) { K.state = 'sit'; K.t = 0; K.nextT = 3 + Math.random() * 4; } break;
      case 'walk': K.pose = 'walk'; var dx = K.tgt - K.x; K.dir = dx > 0 ? 1 : -1; K.x += K.dir * Math.min(Math.abs(dx), 16 * dt); K.f = Math.floor(K.t * 5) % 2;
        if (Math.abs(dx) < 1) { K.state = Math.random() < .5 ? 'sit' : 'sleep'; K.t = 0; K.nextT = K.state === 'sit' ? 4 : 30 + Math.random() * 30; } break;
      case 'chase':
        if (!K.yarn) { K.yarn = { x: L.W * (K.x < L.W / 2 ? .85 : .15), y: K.y - 1, vx: 0 }; K.yarn.vx = (K.x - K.yarn.x) > 0 ? 40 : -40; C.sfx('plop', { vol: .5 }); }
        var y = K.yarn; y.x += y.vx * dt; y.vx *= Math.exp(-dt * .6); K.pose = 'walk'; K.f = Math.floor(K.t * 10) % 2; var d2 = y.x - K.x; K.dir = d2 > 0 ? 1 : -1; K.x += K.dir * Math.min(Math.abs(d2), 46 * dt);
        if (Math.abs(d2) < 8) { y.vx = (Math.random() < .5 ? -1 : 1) * (30 + Math.random() * 30); C.sfx('cloth', { vol: .6 }); K.bats = (K.bats || 0) + 1; }
        y.x = C.clamp(y.x, 10, L.W - 10); if (K.bats > 4 || K.t > 14) { K.bats = 0; K.yarn = null; K.state = 'walk'; K.tgt = hm.x; K.t = 0; } break;
    }
    K.x = C.clamp(K.x, 16, L.W - 16);
    for (var i = K.zs.length - 1; i >= 0; i--) { var z = K.zs[i]; z.a += dt; z.y -= 6 * dt; z.x += Math.sin(z.a * 3) * 4 * dt; if (z.a > 2.4) K.zs.splice(i, 1); }
    for (i = K.hearts.length - 1; i >= 0; i--) { var h = K.hearts[i]; h.a += dt; h.y -= 10 * dt; if (h.a > 1.4) K.hearts.splice(i, 1); }
  };
  CAT.pet = function () { K.pet = 1.4; if (Math.random() < .3 || !K.hearts.length) K.hearts.push({ x: K.x - 2 + (Math.random() - .5) * 10, y: K.y - 20, a: 0 }); if (K.state === 'sleep' || K.state === 'sit') { K.state = 'loaf'; K.t = 0; } C.save.data.pets++; };
  CAT.draw = function (g) {
    var s = CAT.sprite(K.pose, K.f), x = Math.round(K.x - s.w / 2), y = Math.round(K.y - s.h);
    /* soft shadow */
    g.fillStyle = 'rgba(20,10,6,.35)'; for (var i = 2; i < s.w - 2; i++) if (C.bayer(i, 0) < .6) g.fillRect(x + i, y + s.h - 1, 1, 1);
    if (K.dir < 0) { g.save(); g.translate(x * 2 + s.w, 0); g.scale(-1, 1); s.draw(g, x, y); g.restore(); } else s.draw(g, x, y);
    if (K.yarn) CAT.yarn.draw(g, K.yarn.x - 4, K.yarn.y - 9);
    K.zs.forEach(function (z) { if (z.a < 2.2) CAT.z(g, Math.round(z.x), Math.round(z.y), z.a > 1); });
    K.hearts.forEach(function (h) { CAT.heart(g, Math.round(h.x), Math.round(h.y), h.a > .7); });
  };
})();
