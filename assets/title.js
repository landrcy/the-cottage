/* The Cottage — title: the cottage seen from far away in a snowy forest at dusk. Glowing windows, chimney smoke,
   three depths of falling snow, twinkling stars, a soft lantern. The title is set in Sacramento (OFL) as crisp cream script. */
(function () {
  'use strict';
  var C = window.COT, A = C.art, P = C.P, R = C.ramp;
  var T = C.title = { ready: false, t: 0 }, bg = null, snow = [], smoke = [], bw = 0, bh = 0, house = null;
  var SKY = R(['#1a1430', '#2a1e48', '#3e2a5c', '#5a3868', '#7e4a6e', '#a8606c', '#d08468', '#eaa874']);
  var SNOWR = R(['#2a2a4a', '#3c3e64', '#555a82', '#7480a4', '#98a6c4', '#c2cce0', '#e4ecf6']);
  var PINE = [R(['#0e1424', '#162038', '#203050', '#2c4064']), R(['#101a22', '#18282e', '#22383c', '#2e4a4a']), R(['#0a1210', '#12201a', '#1c3024', '#284032', '#36523e'])];
  T.pine = function (g, x, by, h, ramp, sn, seed) {
    var top = by - h, tiers = Math.max(3, h / 7 | 0), th = h / tiers;
    for (var y = 0; y < h; y++) { var t = y / h, ti = Math.floor(y / th), tf = (y - ti * th) / th, half = (1.5 + t * h * .34) * (.55 + .45 * tf) + 1;
      for (var xx = -Math.ceil(half); xx <= Math.ceil(half); xx++) { var e = Math.abs(xx) / half; if (e > 1) continue; var px = x + xx, py = top + y;
        var v = .55 - xx / half * .35 - tf * .25 + (C.hash(px, py, seed) - .5) * .35, col = C.rp(ramp, v, px, py);
        if (sn && tf < .28 + (C.hash(px, ti, seed) * .25) && e < .97 && C.hash(px, py, seed + 1) > .15) col = C.rp(sn, .55 + (1 - e) * .4 - (xx > 0 ? .25 : 0), px, py);
        g.fillStyle = C.css(col); g.fillRect(px, py, 1, 1); } }
    g.fillStyle = C.css(ramp[0]); g.fillRect(x - 1, by, 2, 3);
  };
  function ellipseFill(g, cx, cy, rx, ry, f) { for (var y = Math.floor(cy - ry); y <= cy + ry; y++) for (var x = Math.floor(cx - rx); x <= cx + rx; x++) { var dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry, d = dx * dx + dy * dy; if (d <= 1) { var c = f(x, y, d); if (c) { g.fillStyle = typeof c === 'string' ? c : C.css(c); g.fillRect(x, y, 1, 1); } } } }
  T.ellipseFill = ellipseFill;
  /* the cottage, ~64 px wide: log walls, snowy roof, stone chimney, glowing windows, wreath, lantern */
  function mkHouse() {
    var w = 72, h = 62, c = C.mk(w, h), g = c.g, LOG = R(['#1e0f08', '#2e180c', '#432414', '#5a321c', '#6e4024']), RF = R(['#3a4466', '#5a6890', '#8a9cc0', '#bccce4', '#e8f0fa', '#ffffff']), ST = A.pal.stone;
    function px(x, y, col) { g.fillStyle = typeof col === 'string' ? col : C.css(col); g.fillRect(x, y, 1, 1); }
    /* chimney */
    for (var y = 6; y < 30; y++) for (var x = 48; x < 56; x++) px(x, y, C.rp(ST, .35 + ((x + (y >> 1)) % 4 === 0 || y % 3 === 0 ? -.3 : .1) + (x > 53 ? -.2 : 0), x, y));
    for (x = 47; x < 57; x++) { px(x, 5, C.rp(RF, .8, x, 5)); px(x, 4, C.rp(RF, .95, x, 4)); }
    /* walls */
    for (y = 30; y < 58; y++) for (x = 8; x < 64; x++) { var row = (y - 30) % 4, v = row === 0 ? .15 : row === 3 ? .35 : .55 + (C.hash(x >> 2, y >> 2, 3) - .5) * .25; if (x < 11 || x > 60) v = row === 0 ? .4 : .8; px(x, y, C.rp(LOG, v - (x > 52 ? .12 : 0), x, y)); }
    /* roof: steep gable with deep snow */
    for (y = 8; y < 34; y++) { var half = (y - 8) * 1.38 + 3; for (x = Math.floor(36 - half); x <= 36 + half; x++) { if (x < 2 || x > 70) continue; var e = Math.abs(x + .5 - 36) / half, edge = y > 30 || e > .93;
        var vv = .62 + (x < 36 ? .2 : -.15) + (C.hash(x, y, 9) - .5) * .2 - (y - 8) / 26 * .1; px(x, y, C.rp(RF, edge ? vv - .35 : vv, x, y)); } }
    for (x = 3; x < 70; x++) { var il = C.hash(x, 1, 4); if (il > .55) for (var k = 0; k < 1 + (il * 4 | 0); k++) px(x, 34 + k, C.rp(RF, .85 - k * .2, x, k)); }
    /* windows (glowing) */
    function win(x0, y0, ww, hh) { for (var y = y0 - 1; y <= y0 + hh; y++) for (var x = x0 - 1; x <= x0 + ww; x++) px(x, y, '#24120a'); for (y = y0; y < y0 + hh; y++) for (x = x0; x < x0 + ww; x++) { var cx = x - x0 - ww / 2 + .5, cy = y - y0 - hh / 2 + .5; px(x, y, C.rp(A.pal.fire, .95 - (cx * cx + cy * cy) * .02, x, y)); }
      for (y = y0; y < y0 + hh; y++) px(x0 + (ww >> 1), y, '#5a2a10'); for (x = x0; x < x0 + ww; x++) px(x, y0 + (hh >> 1), '#5a2a10');
      for (x = x0 - 1; x <= x0 + ww; x++) { px(x, y0 + hh + 1, C.rp(RF, .9, x, 0)); } }
    win(14, 40, 9, 9); win(49, 40, 9, 9); win(33, 18, 6, 7);
    /* door with wreath */
    for (y = 41; y < 58; y++) for (x = 31; x < 41; x++) px(x, y, C.rp(R(['#2a1408', '#4a2a14', '#6a3e20']), (x === 31 || x === 40 || y === 41) ? 0 : .5 + ((x - 31) % 3 === 0 ? -.3 : 0), x, y));
    for (var a = 0; a < 20; a++) { var an = a / 20 * 6.283; px(Math.round(35.5 + Math.cos(an) * 3), Math.round(46 + Math.sin(an) * 3), a % 4 ? '#2a5a2a' : '#c8302a'); }
    px(35, 49, '#e04040'); px(36, 49, '#e04040'); px(39, 50, '#ffcf6a');
    /* lantern */
    px(28, 44, '#24120a'); px(28, 45, '#ffcf6a'); px(28, 46, '#ffbf3f'); px(28, 47, '#24120a');
    /* snow bank at the base */
    for (x = 0; x < w; x++) { var sh = 58 + Math.round(Math.sin(x * .3) * 1.2 + C.hash(x, 0, 6) * 1.5) - (x > 30 && x < 42 ? 1 : 0); for (y = sh; y < h; y++) px(x, y, C.rp(SNOWR, .75 - (y - sh) * .06 + (C.hash(x, y, 2) - .5) * .1, x, y)); }
    return c;
  }
  function build() {
    var W = C.W, H = C.H; bw = W; bh = H; bg = C.mk(W, H); var g = bg.g, hz = Math.round(H * (C.portrait ? .56 : .6));
    T.hz = hz;
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) { var v = Math.pow(y / hz, 1.6) * 1.05 + (C.hash(x >> 3, y >> 3, 1) - .5) * .03; g.fillStyle = C.css(C.rp(SKY, v, x, y)); g.fillRect(x, y, 1, 1); }
    /* moon */
    var mx = Math.round(W * .78), my = Math.round(hz * .28); ellipseFill(g, mx, my, 9, 9, function (x, y, d) { return d > .8 ? '#e8dcc0' : C.hash(x, y, 4) > .82 ? '#e2d6bc' : '#fbf3dc'; });
    ellipseFill(g, mx, my, 18, 18, function (x, y, d) { return d > .3 && C.bayer(x, y) < .12 * (1 - d) ? '#a8a0c0' : 0; });
    /* hills */
    [[.0, SNOWR, .22, 2], [.06, SNOWR, .38, 3]].forEach(function (L, li) { for (var x = 0; x < W; x++) { var top = hz - 14 + li * 10 + Math.round(Math.sin(x * .021 + li * 3) * 6 + Math.sin(x * .057 + li) * 3); for (var y = top; y < H; y++) { g.fillStyle = C.css(C.rp(L[1], L[2] + (y - top) * .004 + (li ? .05 : 0), x, y)); g.fillRect(x, y, 1, 1); } } });
    /* distant pine rows */
    var rnd = C.rng(7);
    for (var i = 0; i < W / 6; i++) { var x0 = Math.round(rnd() * W), h0 = 12 + rnd() * 10; T.pine(g, x0, hz - 6 + Math.round(Math.sin(x0 * .021) * 6) + 2, h0, PINE[0], null, 3); }
    for (i = 0; i < W / 9; i++) { x0 = Math.round(rnd() * W); h0 = 18 + rnd() * 14; T.pine(g, x0, hz + 5 + Math.round(Math.sin(x0 * .021 + 3) * 4), h0, PINE[1], R(['#5a6688', '#7a88aa', '#9aa8c8']), 5); }
    /* foreground snow field */
    var fy = hz + 18; for (y = fy; y < H; y++) for (x = 0; x < W; x++) { var vv = .45 + (y - fy) / (H - fy) * .4 + A.noise(3, 9)(x, y * 2) * .06; g.fillStyle = C.css(C.rp(SNOWR, vv, x, y)); g.fillRect(x, y, 1, 1); }
    /* cottage */
    house = house || mkHouse(); var hx = Math.round(W / 2 - 36), hy = fy - 58;
    T.hx = hx; T.hy = hy;
    /* warm light spill on the snow */
    ellipseFill(g, W / 2, fy + 4, 46, 9, function (x, y, d) { return C.bayer(x, y) < (1 - d) * .55 ? (d < .35 ? '#e6b080' : '#b88a82') : 0; });
    g.drawImage(house, hx, hy);
    /* path to the door */
    for (y = fy; y < H; y++) { var t = (y - fy) / (H - fy), cx = W / 2 + Math.sin(t * 3) * 8 * t, hw = 3 + t * 14; for (x = Math.round(cx - hw); x <= cx + hw; x++) if (C.hash(x, y, 8) > .2) { g.fillStyle = C.css(C.rp(SNOWR, .38 + t * .2 + (C.hash(x, y, 9) - .5) * .1, x, y)); g.fillRect(x, y, 1, 1); } }
    /* near pines framing the scene */
    var side = [[.04, 1], [.13, .8], [.88, .9], [.97, 1.1], [.22, .55], [.76, .6]];
    side.forEach(function (s, k) { var x0 = Math.round(W * s[0]), hh = Math.round(H * .55 * s[1] + 20); T.pine(g, x0, fy + 10 + k % 2 * 6, hh, PINE[2], R(['#8a98ba', '#b8c6de', '#e4ecf6']), 11 + k); });
    /* fence */
    for (x = Math.round(W / 2 - 70); x < W / 2 + 70; x++) { if (Math.abs(x - W / 2) < 12) continue; var fyy = fy + 6; if (x % 7 === 0) for (y = fyy - 6; y < fyy + 2; y++) { g.fillStyle = y < fyy - 4 ? '#e4ecf6' : '#3a2414'; g.fillRect(x, y, 1, 1); } g.fillStyle = '#4a2e18'; g.fillRect(x, fyy - 3, 1, 1); g.fillStyle = '#e4ecf6'; g.fillRect(x, fyy - 4, 1, 1); }
    snow = []; var r = C.rng(3); for (i = 0; i < (W * H) / 260; i++) snow.push({ x: r() * W, y: r() * H, z: r() < .5 ? 0 : r() < .7 ? 1 : 2, ph: r() * 6 });
  }
  C.layoutListeners.push(function () { if (bg) build(); });
  var stars = null;
  C.scenes.title = {
    enter: function () { T.t = 0; T.out = 0; if (!bg || bw !== C.W || bh !== C.H) build(); stars = []; var r = C.rng(5); for (var i = 0; i < 60; i++) stars.push({ x: r() * C.W, y: r() * T.hz * .55, p: r() * 6 }); },
    update: function (dt) {
      T.t += dt; if (T.t > 1.2 && !T.ready) { T.ready = true; C.ui.refresh(); }
      for (var i = 0; i < snow.length; i++) { var s = snow[i], sp = [7, 12, 20][s.z]; s.y += sp * dt; s.x += Math.sin(T.t * .7 + s.ph) * (s.z + 1) * 2 * dt - 3 * dt; if (s.y > C.H) { s.y = -2; s.x = Math.random() * C.W; } if (s.x < -2) s.x += C.W + 4; }
      if (Math.random() < dt * 7) smoke.push({ x: T.hx + 52 + Math.random() * 2, y: T.hy + 4, r: 1.2, a: 1, vx: 3 + Math.random() * 2 });
      for (i = smoke.length - 1; i >= 0; i--) { var m = smoke[i]; m.y -= 7 * dt; m.x += m.vx * dt; m.r += 1.6 * dt; m.a -= dt * .18; if (m.a <= 0) smoke.splice(i, 1); }
      C.ui.script('the cottage', Math.round(C.H * (C.portrait ? .12 : .1)), C.portrait ? 34 : Math.min(54, C.W / 5.4));
      if (T.ready) C.ui.label('tap to come inside', Math.round(C.H - (C.portrait ? 26 : 16)));
      C.region(0, 0, C.W, C.H, 'enter', null);
      if (T.ready) C.sfx.loop('wind', 1);
    },
    draw: function (g) {
      g.drawImage(bg, 0, 0);
      for (var i = 0; i < stars.length; i++) { var s = stars[i], tw = Math.sin(T.t * 1.7 + s.p * 3); if (tw > -.2) { g.fillStyle = tw > .7 ? '#fff6e0' : '#a8a0c8'; g.fillRect(s.x | 0, s.y | 0, 1, 1); } }
      /* smoke */
      for (i = 0; i < smoke.length; i++) { var m = smoke[i]; C.title.ellipseFill(g, m.x, m.y, m.r, m.r, function (x, y, d) { return C.bayer(x, y) < m.a * .6 * (1 - d * .5) ? (d < .4 ? '#8a7e98' : '#6a5e80') : 0; }); }
      /* window flicker */
      var f = .5 + .5 * Math.sin(T.t * 6.3) * Math.sin(T.t * 2.1 + 1);
      if (f > .7) { g.fillStyle = '#fff0a0'; g.fillRect(T.hx + 18, T.hy + 43, 1, 1); g.fillRect(T.hx + 53, T.hy + 44, 1, 1); }
      for (i = 0; i < snow.length; i++) { var sn = snow[i]; g.fillStyle = sn.z === 2 ? '#ffffff' : sn.z === 1 ? '#d8e2f0' : '#9aa6c4'; g.fillRect(sn.x | 0, sn.y | 0, sn.z === 2 ? 2 : 1, sn.z === 2 && sn.ph > 4 ? 2 : 1); }
      if (T.t < 1.2) C.dissolve(g, 1 - T.t / 1.2, '#140c08');
    },
    down: function () { C.sfx.unlock(); C.music.start(); if (T.t > .3) { C.sfx('door'); C.go('kitchen'); } }
  };
})();
