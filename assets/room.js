/* The Cottage — the kitchen room painter: timber walls, beams with drying herbs and copper pans, stone fireplace,
   frosted window onto the snowy forest, dish shelf, counter, rug, clock and lamp. Static parts are baked per layout;
   fire, firelight, snow, steam and the clock are animated each frame. Also the small "mini dish" sprites for the shelf. */
(function () {
  'use strict';
  var C = window.COT, A = C.art, P = C.P, R = C.ramp, pal = A.pal, OUT = pal.out;
  var RM = C.room = {};
  var PLASTER = R(['#5a3a26', '#7a5236', '#9a6c48', '#b8885c', '#d0a470', '#e2bc88']), TIMBER = pal.wood, FLOOR = R(['#2a160d', '#3e2213', '#55301b', '#6c3f23', '#82502c']);
  function px(g, x, y, c) { g.fillStyle = typeof c === 'string' ? c : C.css(c); g.fillRect(x, y, 1, 1); }
  function rect(g, x0, y0, w, h, f) { for (var y = y0; y < y0 + h; y++) for (var x = x0; x < x0 + w; x++) { var c = f(x, y, x - x0, y - y0); if (c) px(g, x, y, c); } }
  RM.px = px; RM.rect = rect;
  /* ---------- layout ---------- */
  RM.lay = function (W, H) {
    var L = { W: W, H: H, por: C.portrait };
    if (!L.por) {
      L.floor = Math.round(H * .76); L.beam = 9;
      L.fire = { x: Math.max(6, Math.round(W * .03)), y: L.floor - 78, w: 92, h: 78 };
      L.win = { x: Math.round(W * .5 - 28), y: Math.round(H * .14), w: 58, h: 52 };
      L.counter = { x: Math.round(W * .5 - 50), y: Math.round(L.floor - 34), w: 100, h: 34 };
      L.shelf = { x: W - 96 - Math.max(6, Math.round(W * .03)), y: Math.round(H * .12), w: 92, h: 90 };
      L.clock = { x: L.win.x + L.win.w + Math.round((L.shelf.x - L.win.x - L.win.w) / 2) - 7, y: Math.round(H * .18) };
      L.lamp = { x: L.counter.x + L.counter.w - 18, y: L.counter.y - 20 };
      L.book = { x: L.counter.x + 14, y: L.counter.y - 9, w: 34, h: 10 };
      L.rug = { cx: L.fire.x + L.fire.w / 2 + 18, cy: L.floor + Math.round((H - L.floor) * .5), rx: 52, ry: Math.max(9, Math.round((H - L.floor) * .3)) };
    } else {
      L.beam = 9; L.floor = Math.round(H * .8);
      L.win = { x: Math.round(W / 2 - 29), y: 24, w: 58, h: 52 };
      L.clock = { x: 10, y: 30 };
      L.shelf = { x: Math.round(W / 2 - 46), y: 96, w: 92, h: 90 };
      L.counter = { x: Math.round(W / 2 - 50), y: L.shelf.y + L.shelf.h + 36, w: 100, h: 34 };
      L.book = { x: L.counter.x + 14, y: L.counter.y - 9, w: 34, h: 10 };
      L.lamp = { x: L.counter.x + L.counter.w - 18, y: L.counter.y - 20 };
      L.fire = { x: Math.round(W / 2 - 46), y: L.floor - 78, w: 92, h: 78 };
      L.rug = { cx: W / 2, cy: L.floor + Math.round((H - L.floor) * .45), rx: Math.min(80, W / 2 - 8), ry: Math.max(9, Math.round((H - L.floor) * .28)) };
    }
    L.box = { x: L.fire.x + 16, y: L.fire.y + 34, w: 60, h: 36 };
    return L;
  };
  /* ---------- outside the window: night forest ---------- */
  function outside(w, h) {
    var c = C.mk(w, h), g = c.g, SK = R(['#141a34', '#1c2546', '#26335a', '#33446c', '#46587e']);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) px(g, x, y, C.rp(SK, y / h * 1.1, x, y));
    for (var i = 0; i < 14; i++) px(g, (C.hash(i, 1, 5) * w) | 0, (C.hash(i, 2, 5) * h * .4) | 0, i % 3 ? '#a8b0d0' : '#fff6e0');
    var PN = R(['#0a1018', '#121c26', '#1a2a34']), SN = R(['#5a6a90', '#8a9cc0', '#c4d2ea']);
    for (i = 0; i < 6; i++) C.title.pine(g, Math.round(i * w / 5 + C.hash(i, 3, 2) * 6), h - 8 + (i % 2) * 3, 20 + C.hash(i, 4, 2) * 16, PN, SN, 20 + i);
    for (x = 0; x < w; x++) { var sh = h - 7 + Math.round(Math.sin(x * .2) * 1.3); for (y = sh; y < h; y++) px(g, x, y, C.rp(R(['#3c4a70', '#5a6a94', '#8090b8', '#aab8d6']), .5 + (y - sh) * .08, x, y)); }
    return c;
  }
  /* ---------- static room ---------- */
  RM.bake = function (L) {
    var W = L.W, H = L.H, c = C.mk(W, H), g = c.g;
    /* plaster wall with timber framing */
    rect(g, 0, 0, W, L.floor, function (x, y) { var n = A.noise(2, 6)(x, y) * .12 + (C.hash(x, y, 3) - .5) * .12; return C.rp(PLASTER, .55 + n - y / L.floor * .15, x, y); });
    var posts = L.por ? [3, W - 9] : [3, Math.round(W * .33), Math.round(W * .7) - 4, W - 9];
    posts.forEach(function (px0) { rect(g, px0, 0, 6, L.floor, function (x, y, xx) { return C.rp(TIMBER, (xx === 0 ? .15 : xx === 5 ? .2 : .55) + A.noise(9, 3)(x * .4, y * .05) * .2, x, y); }); });
    rect(g, 0, L.floor - 6, W, 6, function (x, y, xx, yy) { return C.rp(TIMBER, yy === 0 ? .7 : yy === 5 ? .1 : .4, x, y); });
    /* ceiling beam */
    rect(g, 0, 0, W, L.beam, function (x, y, xx, yy) { return C.rp(TIMBER, yy === L.beam - 1 ? .05 : .35 + A.noise(4, 2)(x * .3, y) * .25 + (yy === 1 ? .2 : 0), x, y); });
    for (var bx = 6; bx < W; bx += 46) rect(g, bx, L.beam, 8, 3, function (x, y, xx, yy) { return C.rp(TIMBER, .3 - yy * .1, x, y); });
    /* floor planks */
    rect(g, 0, L.floor, W, H - L.floor, function (x, y, xx, yy) { var row = Math.floor(yy / 7), off = row * 23 % 41; var seam = (yy % 7 === 6) || ((x + off) % 41 === 0); return C.rp(FLOOR, seam ? .05 : .5 + A.noise(row, 4)(x * .25, 0) * .3 + (C.hash(x, y, 1) - .5) * .15 + yy / (H - L.floor) * .2, x, y); });
    /* rug (braided rag rug) */
    var rg = L.rug, RUG = [R(['#5a1a14', '#8a2a1e', '#b0402a']), R(['#6a5a2a', '#9a8442', '#c4ac62']), R(['#1e3a3a', '#2e5654', '#3e706c']), R(['#6a3a1a', '#9a5a2a', '#c07a3a'])];
    C.title.ellipseFill(g, rg.cx, rg.cy, rg.rx, rg.ry, function (x, y, d) { var ring = Math.floor(Math.sqrt(d) * 9), braid = (x + (ring % 2 ? 1 : 0) + Math.floor(y / 1)) % 3; return C.css(C.rp(RUG[ring % 4], braid === 0 ? .2 : .75 - Math.sqrt(d) * .2, x, y)); });
    /* window */
    var w = L.win, out = outside(w.w - 8, w.h - 8); RM.out = out;
    rect(g, w.x - 3, w.y - 3, w.w + 6, w.h + 10, function (x, y, xx, yy) { var e = Math.min(xx, yy, w.w + 5 - xx); return C.rp(pal.woodL, e === 0 ? .1 : yy > w.h + 5 ? .3 + (yy === w.h + 6 ? .4 : 0) : .55 + (C.hash(x, y, 5) - .5) * .2, x, y); });
    rect(g, w.x - 6, w.y + w.h + 3, w.w + 12, 4, function (x, y, xx, yy) { return C.rp(pal.woodL, yy === 0 ? .9 : yy === 3 ? .1 : .55, x, y); });
    /* lamp-lit counter */
    var ct = L.counter;
    rect(g, ct.x, ct.y, ct.w, ct.h, function (x, y, xx, yy) { if (yy < 4) return C.rp(pal.woodL, yy === 0 ? .95 : yy === 3 ? .15 : .7 - (C.hash(x, 0, 2) * .2), x, y); var dr = (xx % 33 === 0 || xx % 33 === 32 || yy === 4 || yy === ct.h - 1); if (dr) return C.rp(TIMBER, .1, x, y); var k = (xx % 33 - 16.5) / 16.5, kk = (yy - 4 - (ct.h - 4) / 2) / ((ct.h - 4) / 2); var panel = Math.abs(k) < .7 && Math.abs(kk) < .62; return C.rp(TIMBER, panel ? .45 + (Math.abs(k) > .6 || Math.abs(kk) > .5 ? -.2 : 0) : .65, x, y); });
    for (var k2 = 0; k2 < 3; k2++) { px(g, ct.x + 16 + k2 * 33, ct.y + 12, '#e0b070'); px(g, ct.x + 16 + k2 * 33, ct.y + 13, '#7a4a2c'); }
    /* shelf (three planks with brackets) */
    var sh = L.shelf;
    for (var s = 0; s < 3; s++) { var sy = sh.y + 28 + s * 30; rect(g, sh.x, sy, sh.w, 4, function (x, y, xx, yy) { return C.rp(pal.woodL, yy === 0 ? .9 : yy === 3 ? .1 : .55 + (C.hash(x, 1, s) - .5) * .2, x, y); });
      [6, sh.w - 10].forEach(function (bxx) { rect(g, sh.x + bxx, sy + 4, 4, 6, function (x, y, xx, yy) { return xx < 4 - yy * .6 ? C.rp(TIMBER, .4, x, y) : 0; }); });
      rect(g, sh.x, sy + 4, sh.w, 1, function (x, y) { return C.bayer(x, y) < .5 ? C.rp(PLASTER, .1, x, y) : 0; }); }
    /* fireplace: stone surround, mantel, firebox, hearth */
    var f = L.fire, ST = pal.stone;
    rect(g, f.x, f.y + 12, f.w, f.h - 12, function (x, y, xx, yy) { var row = Math.floor((yy) / 6), off = (row % 2) * 5, col = Math.floor((xx + off) / 10); var mort = yy % 6 === 5 || (xx + off) % 10 === 9; var v = .45 + (C.hash(col, row, 7) - .5) * .4 + (C.hash(x, y, 2) - .5) * .15 - (xx > f.w - 8 ? .15 : 0) + (xx < 4 ? .1 : 0); return C.rp(ST, mort ? .08 : v, x, y); });
    rect(g, f.x - 5, f.y + 6, f.w + 10, 7, function (x, y, xx, yy) { return C.rp(TIMBER, yy === 0 ? .95 : yy === 6 ? .05 : yy === 1 ? .8 : .45 + A.noise(3, 3)(x * .3, y) * .2, x, y); });
    var bxx = L.box;
    rect(g, bxx.x, bxx.y, bxx.w, bxx.h, function (x, y, xx, yy) { var arch = yy < 6 && Math.pow((xx - bxx.w / 2) / (bxx.w / 2), 2) + Math.pow((6 - yy) / 6, 2) > 1; if (arch) return 0; return C.rp(R(['#0a0504', '#140a06', '#22120a', '#2e1a0e']), .2 + yy / bxx.h * .5 + (C.hash(x, y, 1) - .5) * .2, x, y); });
    /* hearth stones */
    rect(g, f.x - 6, L.floor, f.w + 12, 5, function (x, y, xx, yy) { return C.rp(ST, yy === 0 ? .85 : (xx % 13 === 0 ? .1 : .5 - yy * .06), x, y); });
    /* logs in the firebox */
    var LG = R(['#1a0c06', '#2e180c', '#4a2a16', '#6a4022']);
    [[bxx.x + 10, bxx.y + bxx.h - 6, 40], [bxx.x + 16, bxx.y + bxx.h - 10, 30]].forEach(function (lg) { rect(g, lg[0], lg[1], lg[2], 5, function (x, y, xx, yy) { if ((xx === 0 || xx === lg[2] - 1) && (yy === 0 || yy === 4)) return 0; return xx < 2 || xx > lg[2] - 3 ? C.rp(R(['#6a4a2a', '#9a7448', '#c4a070']), yy % 2 ? .3 : .8, x, y) : C.rp(LG, .2 + (yy === 1 ? .6 : 0) + C.hash(x, 0, 2) * .3, x, y); }); });
    /* mantel things: candles, jar, small portrait */
    var my = f.y + 6; candle(g, f.x + 6, my); candle(g, f.x + f.w - 10, my);
    var jr = C.food.sprite('cinnamon').skin; g.drawImage(jr.canvas(), f.x + 18, my - jr.h + 1);
    rect(g, f.x + 44, my - 16, 16, 16, function (x, y, xx, yy) { if (xx === 0 || yy === 0 || xx === 15 || yy === 15) return '#8a5a2a'; if (xx === 1 || yy === 1 || xx === 14 || yy === 14) return '#c89a4a'; var dx = xx - 7.5, dy = yy - 7; return dx * dx + (dy - 3) * (dy - 3) * .6 < 14 ? '#3a2a3a' : dx * dx + (dy + 1) * (dy + 1) < 8 ? '#d8b090' : '#5a6a5a'; });
    /* hanging herbs & copper pans from the beam */
    var hs = L.por ? [[18, 'h'], [W - 26, 'h'], [W / 2 - 50, 'p'], [W / 2 + 40, 'h']] : [[L.win.x - 22, 'h'], [L.win.x + L.win.w + 14, 'h'], [L.fire.x + L.fire.w + 14, 'p'], [L.shelf.x - 18, 'h'], [L.fire.x + L.fire.w + 34, 'h']];
    hs.forEach(function (hh, i) { var x0 = Math.round(hh[0]); if (hh[1] === 'h') herbs(g, x0, L.beam, i); else pans(g, x0, L.beam); });
    /* wall clock body (hands animate) */
    var ck = L.clock; rect(g, ck.x - 1, ck.y - 1, 16, 32, function (x, y, xx, yy) { var e = xx === 0 || xx === 15 || yy === 0 || yy === 31; return e ? OUT : C.rp(TIMBER, yy < 16 ? .6 : .45 + (xx === 1 ? .2 : 0), x, y); });
    C.title.ellipseFill(g, ck.x + 7, ck.y + 7, 6, 6, function (x, y, d) { return d > .75 ? '#c89a4a' : C.css(C.rp(pal.cream, .8 - d * .3, x, y)); });
    rect(g, ck.x + 3, ck.y + 16, 9, 13, function (x, y, xx, yy) { return xx === 0 || xx === 8 || yy === 12 ? '#24140d' : '#140a06'; });
    for (var hh2 = 0; hh2 < 12; hh2++) { var an = hh2 / 12 * 6.283; px(g, Math.round(ck.x + 7 + Math.sin(an) * 4.6), Math.round(ck.y + 7 - Math.cos(an) * 4.6), '#5a3a26'); }
    /* lamp on the counter */
    var lp = L.lamp; rect(g, lp.x, lp.y, 10, 20, function (x, y, xx, yy) { if (yy >= 16) return xx > 0 && xx < 9 ? C.rp(pal.copper, yy === 16 ? .9 : .5, x, y) : 0; if (yy >= 13) return xx > 2 && xx < 7 ? C.rp(pal.copper, .6, x, y) : 0; if (yy >= 2) { var e = Math.abs(xx - 4.5) / (3.5 + Math.sin(yy / 13 * 3.1) * 1.5); return e <= 1 ? (e > .8 ? '#d8c8a0' : '#fff2c0') : 0; } return xx > 2 && xx < 7 ? '#4a3a2a' : 0; });
    return c;
  };
  function candle(g, x, my) { rect(g, x, my - 9, 4, 9, function (xx, yy, a, b) { return b === 0 ? '#e8dcc0' : C.rp(R(['#a89c80', '#d8ccb0', '#f4ead4']), a === 0 ? .9 : a === 3 ? .2 : .6, xx, yy); }); rect(g, x - 1, my - 1, 6, 1, function () { return '#9a7448'; }); }
  function herbs(g, x, y, i) {
    for (var k = 0; k < 6; k++) px(g, x + 3, y + k, '#a88a5a');
    var G = i % 2 ? R(['#2a3a1a', '#4a5a2a', '#6a7a3a', '#8a9a52']) : R(['#3a2a14', '#5a4020', '#7a5a2e', '#a0784a']);
    for (var yy = 0; yy < 18; yy++) for (var xx = -4; xx <= 10; xx++) { var cx = 3 + Math.sin(yy * .4 + i) * .5, hw = 1 + yy * .32; if (Math.abs(xx - cx) < hw && C.hash(x + xx, yy, i) > .3) px(g, x + xx, y + 6 + yy, C.rp(G, .7 - Math.abs(xx - cx) / hw * .5 - yy * .01, x + xx, yy)); }
    for (xx = 1; xx < 6; xx++) px(g, x + xx, y + 7, '#c8302a');
  }
  function pans(g, x, y) { for (var k = 0; k < 6; k++) px(g, x + 6, y + k, '#3a2a1a');
    var p = A.dome(14, 14, A.ell(7, 7, 6.5, 6.5), { ramp: pal.copper, outline: OUT, spec: P('#ffe8c8') }); g.drawImage(p.canvas(), x, y + 10); rect(g, x + 5, y + 5, 3, 6, function () { return '#7a3a1a'; }); }
  /* ---------- animated fire into an ImageData canvas ---------- */
  var fireCv = null, fireId = null, fireU = null;
  RM.fire = function (g, L, t, boost) {
    var b = L.box, w = b.w - 8, h = b.h - 4; if (!fireCv || fireCv.width !== w || fireCv.height !== h) { fireCv = C.mk(w, h); fireId = fireCv.g.createImageData(w, h); fireU = new Uint32Array(fireId.data.buffer); }
    var n = A.noise(91, 4), n2 = A.noise(92, 2), F = pal.fire, base = h - 7;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var cx = (x - w / 2) / (w / 2), vy = (base - y) / (h * (.85 + boost * .15)), shape = 1 - cx * cx * 1.4 - Math.max(0, vy) * 1.15;
      var turb = n(x * .9, y * .7 + t * 22) * .55 + n2(x * 1.3, y + t * 34) * .35;
      var v = shape + turb * .6 + boost * .2; if (y > base) v = .85 - (y - base) * .12 + turb * .3;
      fireU[y * w + x] = v < .18 ? 0 : C.rp(F, (v - .18) * 1.25, x, y + (t * 30 | 0));
    }
    fireCv.g.putImageData(fireId, 0, 0); g.drawImage(fireCv, b.x + 4, b.y + 2);
    /* embers below the logs */
    for (var e = 0; e < 10; e++) { var ex = b.x + 8 + ((C.hash(e, 1, 3) * (b.w - 16)) | 0), on = Math.sin(t * 3 + e * 2) > 0; px(g, ex, b.y + b.h - 2, on ? '#ff8a2a' : '#9c2a08'); }
  };
  /* dithered warm light around a point */
  var lightCache = {};
  RM.glow = function (g, cx, cy, r, col, lvl, ry) {
    var key = r + col + Math.round(lvl * 8) + (ry || r), c = lightCache[key];
    if (!c) { c = C.mk(r * 2 + 1, (ry || r) * 2 + 1); for (var y = 0; y <= (ry || r) * 2; y++) for (var x = 0; x <= r * 2; x++) { var dx = (x - r) / r, dy = (y - (ry || r)) / (ry || r), d = Math.sqrt(dx * dx + dy * dy); if (d < 1 && C.bayer(x, y) < (1 - d) * (1 - d) * lvl) { c.g.fillStyle = col; c.g.fillRect(x, y, 1, 1); } } lightCache[key] = c; }
    g.drawImage(c, Math.round(cx - r), Math.round(cy - (ry || r)));
  };
  /* ---------- mini dishes for the shelf (painted natively at shelf size) ---------- */
  var MINI = {};
  RM.mini = function (id) { if (MINI[id]) return MINI[id]; var p, D = C.dish;
    function ellDish(fill, rimR, top) { return A.dome(24, 14, A.ell(12, 8, 11.5, 5.5), { ramp: rimR || pal.blueware.concat([P('#c0cfe8')]), outline: OUT, amb: .3, col: function (x, y, v) { var dx = (x + .5 - 12) / 9, dy = (y + .5 - 7.5) / 3.8; if (dx * dx + dy * dy <= 1) return top ? top(x, y, v) : C.rp(fill, v, x, y); if (dx * dx + dy * dy <= 1.5) return C.rp(D.CRUST, v, x, y); return 0; } }); }
    switch (id) {
      case 'apple': p = ellDish(null, null, function (x, y, v) { return (x + y) % 4 < 2 || y % 3 === 0 ? C.rp(D.CRUST, v + .1, x, y) : C.rp(R(['#a8661e', '#d89a3a', '#f0c464']), v, x, y); }); break;
      case 'pumpkin': p = ellDish(R(['#b0480e', '#d86818', '#ee8a2c', '#f8ac4e']), null, function (x, y, v) { return x === 12 && y === 6 || x === 13 && y === 6 ? P('#ffffff') : C.rp(R(['#b0480e', '#d86818', '#ee8a2c']), v, x, y); }); break;
      case 'pecan': p = ellDish(null, null, function (x, y, v) { return (x * 3 + y * 5) % 7 === 0 ? P('#c88a4a') : C.rp(R(['#1e0c04', '#3a1808', '#5e2a0e', '#86421a']), v, x, y); }); break;
      case 'bread': p = A.dome(22, 13, A.ell(11, 8, 10, 5.4), { ramp: D.CRUST, outline: OUT, R: 4, col: function (x, y) { return (x === 7 || x === 11 || x === 15) && y > 4 && y < 9 ? P('#fbe0a0') : 0; } }); break;
      case 'turkey': p = A.dome(24, 15, A.or(A.ell(12, 9, 9, 5.5), A.ell(4, 10, 3.5, 3), A.ell(20, 10, 3.5, 3)), { ramp: R(['#4a1a06', '#7a320c', '#a85418', '#d07e2a', '#ecaa4a', '#fbd88a']), outline: OUT, R: 4, spec: P('#fff0c0') }); break;
      case 'ham': p = A.dome(22, 15, A.or(A.ell(10, 9, 9, 5.6), A.ell(19, 6, 2.4, 2.4)), { ramp: R(['#3a0e06', '#6a2010', '#9a3a18', '#c4602a', '#e48c46']), outline: OUT, R: 4, col: function (x, y) { return (x + y) % 5 === 0 && y > 4 && x < 18 ? P('#2a0a04') : x > 17 && y < 9 ? P('#f4ead8') : 0; } }); break;
      case 'stew': p = A.dome(20, 13, A.or(A.ell(10, 5, 9.5, 3.4), A.and(A.ell(10, 5, 9.5, 9), function (x, y) { return y >= 5; })), { ramp: pal.blueware.concat([P('#c0cfe8')]), outline: OUT, R: 4, col: function (x, y, v) { var dx = (x + .5 - 10) / 8, dy = (y + .5 - 5) / 2.5; return dx * dx + dy * dy <= 1 ? (C.hash(x, y, 3) > .7 ? P('#f08a2a') : C.hash(x, y, 4) > .8 ? P('#e8d8a8') : C.rp(R(['#4a2208', '#6a3410', '#8a4a1c']), v, x, y)) : 0; } }); break;
      case 'cinnamon': p = new A.Pix(24, 14); [[1, 0], [8, 0], [15, 0], [4, 5], [11, 5]].forEach(function (o) { p.blit(D.roll(1, 8), o[0], o[1]); }); break;
      case 'ginger': p = new A.Pix(24, 18); [[0, 0], [8, 1], [5, 2]].forEach(function (o, i) { p.blit(D.cookie(1), o[0] + i * 3, o[1]); }); break;
      case 'cocoa': p = A.dome(16, 15, A.or(A.rrect(1, 3, 11, 12, 2), A.not(A.ell(13, 8, 3.2, 4), A.ell(13, 8, 1.4, 2.2))), { ramp: R(['#6a1a18', '#9a2a24', '#c84438', '#e0705a']), outline: OUT, R: 3, col: function (x, y) { return y === 3 && x > 1 && x < 11 ? (x % 3 === 0 ? P('#ffffff') : P('#5a2a14')) : (y === 8 && x > 1 && x < 12 ? P('#efe2c8') : 0); } }); break;
    }
    return (MINI[id] = p);
  };
})();
