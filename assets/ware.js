/* The Cottage — kitchenware (bowls, pots, pie plate, pans, mug, board, plate) and the dishes themselves.
   Dishes are re-painted from their recipe state (crust, filling, lattice, crimps, bake...) and cached by state key. */
(function () {
  'use strict';
  var C = window.COT, A = C.art, P = C.P, R = C.ramp, pal = A.pal, OUT = pal.out;
  var W = C.ware = {}, D = C.dish = {};
  var cache = {};
  function memo(k, f) { return cache[k] || (cache[k] = f()); }
  W.memo = memo;
  /* 3/4 view vessel: rim ellipse + body; returns {pix, ix, iy, irx, iry} (inner ellipse in local coords) */
  function vessel(w, depth, ry, ramp, o) {
    o = o || {}; var h = ry * 2 + depth + 3, cx = w / 2, rimY = ry + 1, rx = w / 2 - 1;
    var m = function (x, y) { var dx = (x + .5 - cx) / rx, dy = (y + .5 - rimY) / ry; if (dx * dx + dy * dy <= 1) return true; if (y + .5 < rimY) return false; var t = (y + .5 - rimY) / (depth + ry); if (t > 1) return false; var k = o.straight ? (t < .92 ? 1 : 1 - (t - .92) * 3) : Math.sqrt(Math.max(0, 1 - t * t * (o.round || 1))); return Math.abs(x + .5 - cx) < rx * k; };
    var irx = rx - (o.lip || 2.5), iry = ry - (o.lip || 2.5) * .45;
    var p = A.dome(w, h, m, { ramp: ramp, R: Math.min(w, h) / 2.2, outline: OUT, spec: o.spec, amb: .25, tex: o.tex,
      col: function (x, y, v) { var dx = (x + .5 - cx) / irx, dy = (y + .5 - rimY) / iry; var e2 = dx * dx + dy * dy; if (e2 <= 1) { var s = .25 + (y + .5 - rimY + iry) / (2 * iry) * .45 + (dx * .1); if (e2 > .78 && dy < 0) s -= .25; /* rim's dark lower edge */ return C.rp(o.inner || ramp, s, x, y); }
        var ox = (x + .5 - cx) / rx, oy = (y + .5 - rimY) / ry, onRim = ox * ox + oy * oy <= 1;
        if (onRim) return C.rp(ramp, v + (y + .5 < rimY ? .22 : .05) + (Math.abs(ox) < .25 && y + .5 > rimY ? .2 : 0), x, y); /* rim highlight */
        if (y + .5 < rimY + ry + 1.5 && y + .5 > rimY) { var ob = (x + .5 - cx) / rx; if (ob * ob + Math.pow((y - .5 - rimY) / ry, 2) <= 1) return C.rp(ramp, v - .25, x, y); } /* shadow under the rim */
        if (Math.abs(x + .5 - (cx - rx * .55)) < 1 && y + .5 > rimY + ry + 2 && (!o.band || y + .5 > rimY + o.band[1] || y + .5 < rimY + o.band[0])) return C.rp(ramp, v + .3, x, y); /* gloss sheen */
        if (o.band && y + .5 > rimY + o.band[0] && y + .5 < rimY + o.band[1]) return C.rp(o.bandRamp, v, x, y); return 0; } });
    return { pix: p, cx: cx, cy: rimY, irx: irx, iry: iry, w: w, h: h };
  }
  W.vessel = vessel;
  W.bowl = function () { return memo('bowl', function () { return vessel(66, 14, 11, R(['#5a3a24', '#8a5e3a', '#b8875a', '#d9ae7c', '#efd2a4', '#fbecd0']), { inner: R(['#6a4a30', '#9a7450', '#c49c70', '#e0c094']), band: [6, 9], bandRamp: pal.blueware, tex: function (x, y) { return C.hash(x, y, 77) > .94 ? .8 : 0; } }); }); };
  W.pot = function () { return memo('pot', function () { var v = vessel(70, 20, 11, R(['#121416', '#22262a', '#353b41', '#4b535b', '#68727c']), { straight: 1, inner: R(['#0e1012', '#1a1d20', '#2a2f34']), lip: 2, spec: P('#a0aab4') });
    v.pix.blit(A.dome(6, 6, A.rrect(0, 1, 6, 4, 2), { ramp: pal.metal, outline: OUT }), 0, 14); v.pix.blit(A.dome(6, 6, A.rrect(0, 1, 6, 4, 2), { ramp: pal.metal, outline: OUT }), 64, 14); return v; }); };
  W.pan = function () { return memo('pan', function () { var v = vessel(60, 5, 13, R(['#101214', '#1e2226', '#2e343a', '#444c54', '#5c666e']), { straight: 1, inner: R(['#16181a', '#24282c', '#30363c']), lip: 2 }); var q = new A.Pix(90, v.h); q.blit(v.pix, 0, 0); for (var x = 58; x < 88; x++) for (var y = 12; y < 16; y++) q.set(x, y, y === 12 ? P('#5c666e') : y === 15 ? P('#101214') : P('#2e343a')); q.outline(OUT); v.pix = q; return v; }); };
  W.mug = function () { return memo('mug', function () { var v = vessel(30, 18, 5, R(['#6a1a18', '#9a2a24', '#c84438', '#e0705a', '#f4a088']), { straight: 1, inner: R(['#3a1410', '#5a2018']), lip: 2, band: [8, 11], bandRamp: R(['#c8b8a0', '#efe2c8', '#fff8e8']) }); var q = new A.Pix(38, v.h); q.blit(v.pix, 0, 0); var hd = A.dome(9, 14, A.not(A.ell(3, 7, 5.5, 6.5), A.ell(3, 7, 2.6, 3.4)), { ramp: R(['#6a1a18', '#9a2a24', '#c84438', '#e0705a']), outline: OUT }); q.blit(hd, 28, 8); v.pix = q; return v; }); };
  W.dishP = function () { return memo('pied', function () { return vessel(76, 5, 16, pal.blueware.concat([P('#a8bce0'), P('#e4ecf8')]), { inner: R(['#6a7fb0', '#8ea2cc', '#c0cfe8', '#e4ecf8']), lip: 4 }); }); };
  W.plate = function (w) { w = w || 92; return memo('plate' + w, function () { return vessel(w, 3, Math.round(w * .2), pal.plate, { inner: R(['#c5c0bd', '#e2ddd8', '#f5f1ec', '#ffffff']), lip: 6, band: [-1, 1], bandRamp: pal.blueware }); }); };
  W.roaster = function () { return memo('roast', function () { return vessel(84, 10, 15, R(['#121a2a', '#1e2c48', '#2c4068', '#3c5888', '#6080b0']), { straight: 1, inner: R(['#141c2a', '#1e2a40', '#2a3a58']), lip: 3, tex: function (x, y) { return C.hash(x, y, 8) > .9 ? 1.4 : 0; } }); }); };
  W.tray = function () { return memo('tray', function () { var p = A.dome(88, 34, A.rrect(0, 0, 88, 34, 3), { ramp: pal.metal.slice(0, 5), R: 2, outline: OUT, flat: .55, tex: function (x, y) { return x === 3 || y === 3 || x === 84 || y === 30 ? -1.2 : 0; } }); return { pix: p, w: 88, h: 34 }; }); };
  W.sqpan = function () { return memo('sqpan', function () { var p = A.dome(70, 44, A.rrect(0, 0, 70, 44, 4), { ramp: R(['#3a1a08', '#5a2c12', '#7a401e', '#9a582c']), R: 3, outline: OUT, tex: function (x, y) { return x < 4 || y < 4 || x > 65 || y > 39 ? 1 : -.4; } }); return { pix: p, w: 70, h: 44 }; }); };
  W.board = function () { return memo('board', function () { var w = 104, h = 30, p = A.dome(w, h, A.or(A.rrect(0, 0, w - 10, h, 4), A.rrect(w - 14, 9, 14, 12, 4)), { ramp: pal.woodL, R: 3, outline: OUT, flat: .6, pat: function (x, y) { return A.tex.wood(x, y, 21); },
      tex: function (x, y) { return A.noise(5, 3)(x * .25, y * 2) * 1.6 + (C.hash(x, y, 4) - .5) * .4; }, col: function (x, y) { var dx = x - (w - 7), dy = y - 15; return dx * dx + dy * dy < 4 ? P('#2a160d') : (y >= h - 4 ? C.rp(pal.wood, .5 + (C.hash(x, 1, 2) - .5) * .4, x, y) : 0); } }); return { pix: p, w: w, h: h, top: 3, bot: h - 5 }; }); };

  /* ---------- pastry / dough colours ---------- */
  var DOUGH = R(['#a8865a', '#cfae7e', '#e8cfa2', '#f6e6c6', '#fff6e2']), CRUST = R(['#6a3210', '#9a5418', '#c87e2c', '#e8a64a', '#f8cf7c', '#fff0b8']);
  D.DOUGH = DOUGH; D.CRUST = CRUST;
  function pastry(v, bake, x, y) { var a = C.rp(DOUGH, v, x, y); if (bake <= 0) return a; var b = C.rp(CRUST, v * .9 + .05 * C.hash(x, y, 3), x, y); return bake >= 1 ? b : (C.bayer(x, y) < bake ? b : a); }
  D.pastry = pastry;
  var FILL = { apple: R(['#6a3a10', '#a8661e', '#d89a3a', '#f0c464', '#fbe39a']), pumpkin: R(['#7a2e08', '#b0480e', '#d86818', '#ee8a2c', '#f8ac4e']), pecan: R(['#1e0c04', '#3a1808', '#5e2a0e', '#86421a', '#b06a30']) };
  /* ---------- pie ---------- */
  D.pie = function (st) {
    var key = 'pie' + JSON.stringify([st.kind, st.crust, Math.round((st.fill || 0) * 8), st.lattice || 0, (st.crimp || []).join(''), Math.round((st.bake || 0) * 12)]);
    return memo(key, function () {
      var dp = W.dishP(), p = dp.pix.clone(), cx = dp.cx, cy = dp.cy, bake = st.bake || 0, N = 14;
      var fr = st.fill || 0, kind = st.kind, fx = dp.irx - 2, fy = dp.iry - 1.2, nzA = A.noise(41, 2.2);
      for (var y = 0; y < p.h; y++) for (var x = 0; x < p.w; x++) {
        var dx = (x + .5 - cx), dy = (y + .5 - cy), e = (dx * dx) / (dp.irx * dp.irx) + (dy * dy) / (dp.iry * dp.iry);
        var rimE = (dx * dx) / ((dp.irx + 4.5) * (dp.irx + 4.5)) + (dy * dy) / ((dp.iry + 2.4) * (dp.iry + 2.4));
        var ang = Math.atan2(dy / dp.iry, dx / dp.irx), seg = Math.floor(((ang + Math.PI) / (Math.PI * 2)) * N) % N, segF = (((ang + Math.PI) / (Math.PI * 2)) * N) % 1;
        if (st.crust && e <= 1) {
          var fe = (dx * dx) / (fx * fx) + (dy * dy) / (fy * fy);
          if (fr > 0 && fe <= Math.min(1, fr * 1.15)) {
            var v = .55 - dy / fy * .25 - dx / fx * .1, col;
            if (kind === 'apple') { var cell = nzA(x, y); v += cell * .5; col = C.rp(FILL.apple, v - bake * .15, x, y); }
            else if (kind === 'pecan') { v += (C.hash(x, y, 9) > .9 ? .4 : 0); col = C.rp(FILL.pecan, v + .1, x, y); if (fe < .8 && ((x * 3 + y * 7) % 11 === 0)) col = P('#c88a4a'); }
            else { col = C.rp(FILL.pumpkin, v - bake * .25 + (fe > .85 ? -.25 : 0), x, y); if (bake > .6 && C.hash(x, y, 5) > .985) col = P('#7a2e08'); }
            if (fe > .92) col = C.mix(col, P('#3a1a08'), .25);
            p.set(x, y, col);
          } else p.set(x, y, pastry(.35 + (dy / dp.iry) * .25 + (C.hash(x, y, 6) - .5) * .2, bake * .6, x, y));
        }
        /* rim pastry ring with crimps */
        if (st.crust && e > .78 && rimE <= 1) {
          var cr = st.crimp && st.crimp[seg], v2 = .6 - dy / dp.iry * .2;
          if (cr) { var bump = Math.abs(segF - .5) * 2; v2 += (1 - bump) * .45 - .2; if (bump > .86 && e > .9) v2 = .05; var rr = .9 + .1 * (1 - bump); if (rimE > rr) continue; }
          else { v2 += (C.hash(seg, 0, 2) - .5) * .2; if (rimE > .93 + C.hash(x, y, 8) * .06) continue; }
          p.set(x, y, pastry(v2, bake, x, y));
        }
      }
      /* lattice strips */
      var L = st.lattice || 0;
      for (var k = 0; k < L; k++) {
        var horiz = k % 2 === 0, idx = (k / 2 | 0), off = (idx - 1) * (horiz ? 7 : 18);
        for (y = 0; y < p.h; y++) for (x = 0; x < p.w; x++) {
          dx = (x + .5 - cx); dy = (y + .5 - cy); e = (dx * dx) / (dp.irx * dp.irx) + (dy * dy) / (dp.iry * dp.iry); if (e > 1.05) continue;
          var d = horiz ? dy - off * .55 : dx - off; var bw = horiz ? 2.2 : 4;
          if (Math.abs(d) <= bw) { var vv = .7 - Math.abs(d) / bw * .35 + (d < 0 ? .1 : -.1); p.set(x, y, pastry(vv, bake, x, y)); if (Math.abs(d) > bw - .6) p.set(x, y, pastry(.15, bake, x, y)); }
        }
      }
      if (bake > .5) for (var i = 0; i < 18; i++) { var a = C.hash(i, 1, 4) * 6.28, rr2 = .3 + C.hash(i, 2, 4) * .5; var sx = Math.round(cx + Math.cos(a) * fx * rr2), sy = Math.round(cy + Math.sin(a) * fy * rr2); if (st.crust && kind !== 'pecan' && L === 0 && C.hash(i, 3, 1) > .5) p.set(sx, sy, P('#fff4c8')); }
      return p;
    });
  };
  /* ---------- bread loaf ---------- */
  D.loaf = function (st) {
    var rise = st.rise || 0, bake = st.bake || 0, key = 'loaf' + Math.round(rise * 10) + '_' + Math.round(bake * 12);
    return memo(key, function () {
      var w = 64, h = 40, ry = 9 + rise * 7, cy = h - 4 - ry * .9;
      var m = function (x, y) { var dx = (x + .5 - w / 2) / (24 + rise * 6), dy = (y + .5 - cy) / ry; return dx * dx + dy * dy <= 1 && y < h - 3; };
      return A.dome(w, h, m, { ramp: DOUGH, R: 9, outline: OUT, amb: .25, pat: function (x, y) { return A.tex.crust(x, y, 5); }, col: function (x, y, v) { var c = pastry(v, bake, x, y); if (bake > .7 && C.hash(x, y, 33) > .93 && y < cy) c = P('#fff8ea'); return c; } });
    });
  };
  /* ---------- roast turkey ---------- */
  var RAWB = R(['#7a4a3a', '#b07a62', '#d6a688', '#ecc8a8', '#f8e2c8']), ROAST = R(['#4a1a06', '#7a320c', '#a85418', '#d07e2a', '#ecaa4a', '#fbd88a']);
  D.turkey = function (st) { var bake = st.bake || 0, key = 'tk' + Math.round(bake * 12); return memo(key, function () {
      var w = 66, h = 44, body = A.ell(w / 2, h * .58, w * .38, h * .36), legL = A.ell(w * .2, h * .66, w * .15, h * .2), legR = A.ell(w * .8, h * .66, w * .15, h * .2), knobL = A.ell(w * .1, h * .4, 4, 4), knobR = A.ell(w * .9, h * .4, 4, 4);
      var stickL = function (x, y) { return Math.abs((x - w * .1) - (y - h * .4) * -.9) < 2.5 && y > h * .4 && y < h * .6; }, stickR = function (x, y) { return Math.abs((x - w * .9) - (y - h * .4) * .9) < 2.5 && y > h * .4 && y < h * .6; };
      return A.dome(w, h, A.or(body, legL, legR, knobL, knobR, stickL, stickR), { ramp: RAWB, R: 8, outline: OUT, amb: .25, pat: function (x, y) { return bake > .3 ? A.tex.skin(x, y) : 0; }, spec: bake > .5 ? P('#fff0c0') : 0,
        col: function (x, y, v) { var knob = knobL(x, y) || knobR(x, y); if (knob) return C.rp(R(['#c8b8a0', '#efe2c8', '#fff8e8']), v, x, y); var a = C.rp(RAWB, v + (C.hash(x, y, 3) - .5) * .12, x, y); var b = C.rp(ROAST, v + A.noise(17, 2)(x, y) * .15, x, y); return bake >= 1 ? b : C.bayer(x, y) < bake ? b : a; } });
    }); };
  var HAM = R(['#6a2a2a', '#a2483e', '#cc6e5e', '#e89a88', '#f6c4b2']), HAMG = R(['#3a0e06', '#6a2010', '#9a3a18', '#c4602a', '#e48c46', '#f8c070']);
  D.ham = function (st) { var bake = st.bake || 0, key = 'hm' + Math.round(bake * 12); return memo(key, function () {
      var w = 48, h = 36, m = A.or(A.ell(w * .46, h * .56, w * .42, h * .42), A.ell(w * .88, h * .32, w * .09, h * .13));
      return A.dome(w, h, m, { ramp: HAM, R: 10, outline: OUT, amb: .25, pat: A.tex.skin, spec: P('#fff0e0'), col: function (x, y, v) { if (x > w * .8 && y < h * .45) return C.rp(R(['#a89070', '#d8c8a8', '#f4ead8']), v, x, y); var a = C.rp(HAM, v, x, y), b = C.rp(HAMG, v + (C.hash(x, y, 5) - .5) * .15, x, y); return bake >= 1 ? b : C.bayer(x, y) < bake ? b : a; } });
    }); };
  /* round dough blob for kneading: squash sq (-1..1), smooth 0..1 */
  D.doughBlob = function (sq, sm, base) { base = base || 20; var k = 'db' + Math.round(sq * 10) + '_' + Math.round(sm * 5) + '_' + base; return memo(k, function () {
      var rx = base * (1 + sq * .35), ry = base * .62 * (1 - sq * .38), w = Math.ceil(rx * 2) + 4, h = Math.ceil(ry * 2) + 4, n = A.noise(51, 2);
      return A.dome(w, h, function (x, y) { var dx = (x + .5 - w / 2) / rx, dy = (y + .5 - h / 2) / ry; return dx * dx + dy * dy <= 1 + n(x, y) * .12 * (1 - sm); }, { ramp: DOUGH, R: ry * .9, outline: OUT, amb: .3, pat: function (x, y) { return A.tex.crust(x, y, 8); },
        tex: function (x, y) { return n(x * 1.6, y * 1.6) * (1 - sm) * 2.2 + (C.hash(x, y, 2) - .5) * .4; }, col: function (x, y) { return C.hash(x, y, 9) > .9 + sm * .09 ? P('#fffaf0') : 0; } });
    }); };
  /* flat dough sheet (round or rect), r 0..1 progress */
  D.sheet = function (shape, r, bake) { var k = 'sh' + shape + Math.round(r * 16) + '_' + Math.round((bake || 0) * 8); return memo(k, function () {
      var rx = shape === 'rect' ? 18 + r * 22 : 14 + r * 20, ry = shape === 'rect' ? 8 + r * 12 : 6 + r * 8, w = Math.ceil(rx * 2) + 4, h = Math.ceil(ry * 2) + 6, n = A.noise(52, 3);
      var m = shape === 'rect' ? function (x, y) { var dx = Math.abs(x + .5 - w / 2) / rx, dy = Math.abs(y + .5 - h / 2 + 1) / ry; return Math.max(dx, dy) <= 1 + n(x, y) * .06 && dx * dx + dy * dy < 1.85; } : function (x, y) { var dx = (x + .5 - w / 2) / rx, dy = (y + .5 - h / 2 + 1) / ry; return dx * dx + dy * dy <= 1 + n(x, y) * .1; };
      return A.dome(w, h, m, { ramp: DOUGH, R: 2, outline: OUT, amb: .5, flat: .6, tex: function (x, y) { return n(x, y) * .6; }, col: function (x, y, v) { return C.hash(x, y, 4) > .95 ? P('#fffaf0') : pastry(v, bake || 0, x, y); } });
    }); };
  /* cinnamon roll (top view spiral) */
  D.roll = function (bake, size) { size = size || 14; var k = 'roll' + Math.round(bake * 8) + size; return memo(k, function () {
      var c = size / 2; return A.dome(size + 1, size + 1, A.ell(c + .5, c + .5, c, c * .92), { ramp: DOUGH, R: 4, outline: OUT, amb: .3, pat: function (x, y) { return A.tex.crust(x, y, 9); }, col: function (x, y, v) { var dx = x + .5 - c - .5, dy = (y + .5 - c - .5) / .92, r = Math.hypot(dx, dy), a = Math.atan2(dy, dx); var sp = (r - a / Math.PI * 1.3 + 20) % 2.6; if (sp < .9 && r > 1) return C.rp(R(['#3a1406', '#5e240e', '#7e3a1a']), v, x, y); return pastry(v, bake, x, y); } });
    }); };
  D.cookie = function (bake) { var k = 'ck' + Math.round(bake * 8); return memo(k, function () { var GB = R(['#4a1e08', '#6e3212', '#94501e', '#b8702e', '#d49448']); return A.dome(16, 18, function (x, y) { return C.food.gman(x - 1, y - 1, 14, 16); }, { ramp: GB, R: 3, outline: OUT, amb: .3, col: function (x, y, v) { var a = C.rp(R(['#6a3a18', '#94582c', '#b87a44', '#d49a60']), v, x, y), b = C.rp(GB, v, x, y); return C.bayer(x, y) < bake ? b : a; } }); }); };
})();
