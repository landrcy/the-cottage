/* The Cottage — the kitchen room painter: timber walls, beams with drying herbs and copper pans, stone fireplace,
   frosted window onto the snowy forest, dish shelf, counter, rug, clock and lamp. Static parts are baked per layout;
   fire, firelight, snow, steam and the clock are animated each frame. Also the small "mini dish" sprites for the shelf. */
(function () {
  'use strict';
  var C = window.COT, A = C.art, P = C.P, R = C.ramp, pal = A.pal, OUT = pal.out;
  var RM = C.room = {};
  var PLASTER = R(['#5a3a26', '#7a5236', '#9a6c48', '#b8885c', '#d0a470', '#e2bc88']), TIMBER = pal.wood, LOG = R(['#3a1a0a', '#6a3414', '#9a5420', '#c4782e', '#e09a44', '#f4bc66']), PINE = R(['#4a240e', '#7a3e18', '#a8602a', '#c8803c', '#e0a058', '#f2c47c']),
    PLAID = R(['#1e0606', '#420c0a', '#6e1610', '#9c2218', '#c43626', '#dc5a40']), PLAIDK = R(['#0c0606', '#1a0e0c', '#2a1612', '#3c201a']), LEATH = R(['#1e0e08', '#361a0e', '#522a16', '#6e3c20', '#8a5230', '#a86c44']), KNIT = R(['#7a6a58', '#a8957c', '#cdbca0', '#e6d8bc', '#f6ecd6']),
    FLOOR = R(['#3a1a0a', '#62300f', '#8a4a1c', '#ac662c', '#c8843e', '#dca058']), OLDFLOOR = R(['#2a160d', '#3e2213', '#55301b', '#6c3f23', '#82502c']);
  function px(g, x, y, c) { g.fillStyle = typeof c === 'string' ? c : C.css(c); g.fillRect(x, y, 1, 1); }
  function rect(g, x0, y0, w, h, f) { for (var y = y0; y < y0 + h; y++) for (var x = x0; x < x0 + w; x++) { var c = f(x, y, x - x0, y - y0); if (c) px(g, x, y, c); } }
  RM.px = px; RM.rect = rect;
  /* ---------- layout ---------- */
  RM.lay = function (W, H) {
    var L = { W: W, H: H, por: C.portrait };
    if (!L.por) {
      L.floor = Math.round(H * .76); L.ceil = 18; L.beam = 24;
      L.fire = { x: Math.max(6, Math.round(W * .03)), y: L.floor - 78, w: 92, h: 78 };
      L.win = { x: Math.round(W * .5 - 28), y: Math.round(H * .14), w: 58, h: 52 };
      L.counter = { x: Math.round(W * .5 - 50), y: Math.round(L.floor - 34), w: 100, h: 34 };
      L.shelf = { x: W - 96 - Math.max(6, Math.round(W * .03)), y: Math.round(H * .12), w: 92, h: 90 };
      L.clock = { x: L.win.x + L.win.w + Math.round((L.shelf.x - L.win.x - L.win.w) / 2) - 7, y: Math.round(H * .18) };
      L.lamp = { x: L.counter.x + L.counter.w - 18, y: L.counter.y - 20 };
      L.book = { x: L.counter.x + 14, y: L.counter.y - 9, w: 34, h: 10 };
      L.rug = { cx: L.fire.x + L.fire.w / 2 + 18, cy: L.floor + Math.round((H - L.floor) * .5), rx: 52, ry: Math.max(9, Math.round((H - L.floor) * .3)) };
    } else {
      L.ceil = 12; L.beam = 18; L.floor = Math.round(H * .8);
      L.win = { x: Math.round(W / 2 - 29), y: 24, w: 58, h: 52 };
      L.clock = { x: 10, y: 30 };
      L.shelf = { x: Math.round(W / 2 - 46), y: 96, w: 92, h: 90 };
      L.counter = { x: Math.round(W / 2 - 50), y: L.shelf.y + L.shelf.h + 36, w: 100, h: 34 };
      L.book = { x: L.counter.x + 14, y: L.counter.y - 9, w: 34, h: 10 };
      L.lamp = { x: L.counter.x + L.counter.w - 18, y: L.counter.y - 20 };
      L.fire = { x: Math.round(W / 2 - 46), y: L.floor - 78, w: 92, h: 78 };
      L.rug = { cx: W / 2, cy: L.floor + Math.round((H - L.floor) * .45), rx: Math.min(80, W / 2 - 8), ry: Math.max(9, Math.round((H - L.floor) * .28)) };
    }
    L.chair = L.por ? { x: W - 50, y: L.floor - 24, w: 44, h: 38 } : { x: L.shelf.x + 18, y: L.floor - 22, w: 46, h: 38 };
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
    /* honey log walls: rounded courses, chinking, grain lines one shade up, ridge shadow one shade down */
    var CE = L.ceil, mid = W / 2, fcx = L.fire.x + L.fire.w / 2;
    function wallTop(x) { return Math.round(CE * Math.min(1, Math.abs(x - mid) / (W * .5))); }
    rect(g, 0, 0, W, L.floor, function (x, y) {
      var wt = wallTop(x); if (y < wt) { /* vaulted ceiling: tongue-and-groove boards running up the slope */
        var d = wt - y, seam = d % 4 === 0, warm = .42 + d * .006; return C.rp(PINE, seam ? .2 : warm + (d % 4 === 1 ? .15 : 0) + A.tex.wood(x, y * 3, 77) * .1, x, y); }
      var row = Math.floor((y - wt) / 9), yy = (y - wt) % 9; var prof = [0, .1, .78, .7, .62, .55, .46, .32, .16][yy];
      var gr = yy > 2 && yy < 7 ? A.tex.wood(x + row * 37, yy, row * 13 + 5) * .17 : 0;
      var lit = Math.max(0, 1 - Math.abs(x - fcx) / (W * .55)) * .1 - .06 - (1 - y / L.floor) * .08;
      return C.rp(LOG, prof + gr + lit, x, y); });
    /* exposed timbers: tie beam, king post, rafters along the slope */
    rect(g, 0, CE, W, 6, function (x, y, xx, yy) { return C.rp(TIMBER, (yy === 0 ? .85 : yy === 5 ? .05 : yy === 4 ? .25 : .6) + (yy > 0 && yy < 4 ? A.tex.wood(x, yy, 3) * .17 : 0), x, y); });
    rect(g, Math.round(mid) - 3, 0, 6, CE, function (x, y, xx) { return C.rp(TIMBER, (xx === 0 ? .8 : xx === 5 ? .1 : .5) + (xx > 0 && xx < 5 ? A.tex.wood(y, xx, 8) * .17 : 0), x, y); });
    for (var rf = 1; rf < 4; rf++) [mid - rf * W / 8, mid + rf * W / 8].forEach(function (rx) { rx = Math.round(rx); var wt = wallTop(rx); rect(g, rx - 2, 0, 5, wt, function (x, y, xx) { return y < wallTop(x) ? C.rp(TIMBER, xx === 0 ? .75 : xx === 4 ? .08 : .45, x, y) : 0; }); });
    for (var bx = 0; bx < W; bx++) { px(g, bx, wallTop(bx), C.rp(TIMBER, .1, bx, 0)); }
    for (var bx2 = 10; bx2 < W; bx2 += 46) rect(g, bx2, CE + 6, 6, 2, function (x, y, xx, yy) { return C.rp(TIMBER, .25 - yy * .1, x, y); });
    /* base log */
    rect(g, 0, L.floor - 5, W, 5, function (x, y, xx, yy) { return C.rp(LOG, [.75, .5, .4, .25, .08][yy], x, y); });
    /* warm pine floor planks with grain */
    rect(g, 0, L.floor, W, H - L.floor, function (x, y, xx, yy) { var row = Math.floor(yy / 6), off = row * 23 % 53; var seam = (yy % 6 === 5) || ((x + off) % 53 === 0); if (seam) return C.rp(FLOOR, .05, x, y);
      var hl = yy % 6 === 0 ? .1 : 0; return C.rp(FLOOR, .6 + hl + A.tex.wood(x + row * 91, yy * 2, row + 30) * .17 - yy / (H - L.floor) * .12 + Math.max(0, 1 - Math.abs(x - fcx) / (W * .5)) * .1, x, y); });
    /* red plaid rug with frayed ends, twill ridges */
    var rg = L.rug, rx0 = Math.round(rg.cx - rg.rx), ry0 = Math.round(rg.cy - rg.ry), RW = Math.round(rg.rx * 2), RH = Math.round(rg.ry * 2);
    rect(g, rx0, ry0, RW, RH, function (x, y, xx, yy) { if ((xx === 0 || xx === RW - 1) && yy % 2) return C.rp(PLAID, .55, x, y); if (xx === 0 || xx === RW - 1) return 0; return plaid(xx, yy, x, y, yy === RH - 1 ? -.2 : yy === 0 ? .1 : 0); });
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
      rect(g, sh.x, sy + 4, sh.w, 1, function (x, y) { return C.bayer(x, y) < .5 ? C.rp(LOG, .05, x, y) : 0; }); }
    /* river-stone fireplace: round stones (cells), chimney up to the ceiling in landscape */
    var f = L.fire, my = f.y + 6, chX = f.x + 12, chW = f.w - 24;
    rect(g, f.x, f.y + 12, f.w, f.h - 12, function (x, y) { return riverStone(x, y, f); });
    if (!L.por) rect(g, chX, 0, chW, f.y + 12, function (x, y, xx) { return riverStone(x, y, f, xx === 0 || xx === chW - 1); });
    /* mantel: one thick hewn log with grain */
    rect(g, f.x - 6, f.y + 5, f.w + 12, 8, function (x, y, xx, yy) { if ((xx === 0 || xx === f.w + 11) && (yy === 0 || yy === 7)) return 0; var gr = A.tex.wood(x, y, 41); return C.rp(LOG, (yy === 0 ? .9 : yy === 7 ? .02 : yy === 6 ? .18 : yy === 1 ? .78 : .55) + (yy > 0 && yy < 6 ? gr * .17 : 0), x, y); });
    var bxx = L.box;
    rect(g, bxx.x - 2, bxx.y - 2, bxx.w + 4, bxx.h + 2, function (x, y, xx, yy) { var a = Math.pow((xx - (bxx.w + 4) / 2) / ((bxx.w + 4) / 2), 2) + Math.pow((8 - yy) / 8, 2); return yy < 8 && a > 1 ? 0 : C.rp(pal.stone, .12, x, y); });
    rect(g, bxx.x, bxx.y, bxx.w, bxx.h, function (x, y, xx, yy) { var arch = yy < 6 && Math.pow((xx - bxx.w / 2) / (bxx.w / 2), 2) + Math.pow((6 - yy) / 6, 2) > 1; if (arch) return 0; return C.rp(R(['#0a0504', '#140a06', '#22120a', '#2e1a0e']), .15 + yy / bxx.h * .55 + ((x + y * 3) % 7 === 0 ? .25 : 0), x, y); });
    /* hearth slab */
    rect(g, f.x - 6, L.floor, f.w + 12, 5, function (x, y, xx, yy) { return C.rp(pal.stone, yy === 0 ? .9 : yy === 4 ? .15 : (xx % 17 === 0 ? .15 : .55 - yy * .06 + ((x * 3 + y) % 11 === 0 ? .2 : 0)), x, y); });
    var LG = R(['#1a0c06', '#2e180c', '#4a2a16', '#6a4022']);
    [[bxx.x + 10, bxx.y + bxx.h - 6, 40], [bxx.x + 16, bxx.y + bxx.h - 10, 30]].forEach(function (lg) { rect(g, lg[0], lg[1], lg[2], 5, function (x, y, xx, yy) { if ((xx === 0 || xx === lg[2] - 1) && (yy === 0 || yy === 4)) return 0; return xx < 2 || xx > lg[2] - 3 ? C.rp(R(['#6a4a2a', '#9a7448', '#c4a070']), yy % 2 ? .3 : .8, x, y) : C.rp(LG, .2 + (yy === 1 ? .6 : 0) + (A.tex.wood(x, y, 9) > 0 ? .3 : 0), x, y); }); });
    /* mounted antlers on the chimney (landscape) */
    if (!L.por) deer(g, f.x + f.w / 2, my - 40);
    /* lanterns on the mantel, a small jar between */
    L.lanterns = [[f.x + 2, my], [f.x + f.w - 11, my]]; L.lanterns.forEach(function (ln) { lantern(g, ln[0], ln[1]); });
    var jr = C.food.sprite('cinnamon').skin; g.drawImage(jr.canvas(), f.x + 18, my - jr.h + 1);
    /* string lights draped along the mantel front (bulbs twinkle in the kitchen draw) */
    L.bulbs = []; var lx0 = f.x - 6, lx1 = f.x + f.w + 6, nS = 4, seg = (lx1 - lx0) / nS;
    for (var lx = lx0; lx <= lx1; lx++) { var u = ((lx - lx0) % seg) / seg, sag = Math.round(Math.sin(u * Math.PI) * 4); px(g, lx, my + 7 + sag, '#1c120a'); if ((lx - lx0) % 6 === 3) L.bulbs.push([lx, my + 8 + sag]); }
    for (var dy2 = 0; dy2 < 30; dy2 += 1) { var ly = my + 8 + dy2, wob = Math.round(Math.sin(dy2 * .35)); px(g, lx0 + wob, ly, '#1c120a'); px(g, lx1 - wob, ly, '#1c120a'); if (dy2 % 6 === 4) { L.bulbs.push([lx0 + wob + 1, ly]); L.bulbs.push([lx1 - wob - 1, ly]); } }
    /* stacked firewood on the hearth + boots */
    woodpile(g, f.x + f.w - 22, L.floor - 13, 20, 13);
    boots(g, f.x + f.w + 2, L.floor + 3);
    /* hanging herbs & copper pans from the beam */
    var hs = L.por ? [[18, 'h'], [W - 26, 'h'], [W / 2 - 50, 'p'], [W / 2 + 40, 'h']] : [[L.win.x - 22, 'h'], [L.win.x + L.win.w + 14, 'h'], [L.fire.x + L.fire.w + 14, 'p'], [L.shelf.x - 18, 'h'], [L.fire.x + L.fire.w + 34, 'h']];
    hs.forEach(function (hh, i) { var x0 = Math.round(hh[0]); if (hh[1] === 'h') herbs(g, x0, L.beam, i); else pans(g, x0, L.beam); });
    /* wall clock body (hands animate) */
    var ck = L.clock; rect(g, ck.x - 1, ck.y - 1, 16, 32, function (x, y, xx, yy) { var e = xx === 0 || xx === 15 || yy === 0 || yy === 31; return e ? OUT : C.rp(TIMBER, yy < 16 ? .6 : .45 + (xx === 1 ? .2 : 0), x, y); });
    C.title.ellipseFill(g, ck.x + 7, ck.y + 7, 6, 6, function (x, y, d) { return d > .75 ? '#c89a4a' : C.css(C.rp(pal.cream, .8 - d * .3, x, y)); });
    rect(g, ck.x + 3, ck.y + 16, 9, 13, function (x, y, xx, yy) { return xx === 0 || xx === 8 || yy === 12 ? '#24140d' : '#140a06'; });
    for (var hh2 = 0; hh2 < 12; hh2++) { var an = hh2 / 12 * 6.283; px(g, Math.round(ck.x + 7 + Math.sin(an) * 4.6), Math.round(ck.y + 7 - Math.cos(an) * 4.6), '#5a3a26'); }
    /* worn leather armchair with knit throw, plaid pillow and a guitar */
    armchair(g, L.chair);
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

  /* ---------- cabin painters ---------- */
  function riverStone(x, y, f, edge) { /* jittered-grid cells = rounded river stones, mortar between; two-tone speckle, no dither noise */
    var cw = 11, chh = 8, gx = Math.floor(x / cw), gy = Math.floor(y / chh), b1 = 1e9, b2 = 1e9, bc = null;
    for (var j = -1; j <= 1; j++) for (var i = -1; i <= 1; i++) { var cx = (gx + i) * cw + 2 + C.hash(gx + i, gy + j, 61) * (cw - 4), cy = (gy + j) * chh + 1 + C.hash(gx + i, gy + j, 62) * (chh - 2);
      var dx = (x - cx) / 1.25, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy); if (d < b1) { b2 = b1; b1 = d; bc = [cx, cy, gx + i, gy + j]; } else if (d < b2) b2 = d; }
    if (b2 - b1 < 1.4 || edge) return C.rp(STMORT, .2 + (b2 - b1) * .2, x, y);
    var warm = C.hash(bc[2], bc[3], 63), rmp = warm < .45 ? pal.stone : warm < .8 ? STAN : STGRY, r = (b2 + b1) / 2;
    var v = .5 + (bc[1] - y) * .07 + (bc[0] - x) * .03 - b1 / r * .25 + (C.hash(bc[2], bc[3], 64) - .5) * .2;
    if (b2 - b1 < 2.6 && y > bc[1]) v -= .17; /* ridge shadow under each stone */
    if ((x * 7 + y * 13 + bc[2]) % 23 === 0) v += .17;
    return C.rp(rmp, v + Math.max(0, 1 - Math.abs(x - (f.x + f.w / 2)) / 60) * .05, x, y);
  }
  var STMORT = R(['#1a1410', '#2e241c', '#43362a']), STAN = R(['#3a2e22', '#5c4a38', '#806a52', '#a48c70', '#c4ae90', '#dccaa8']), STGRY = R(['#2a2828', '#464240', '#64605a', '#86807a', '#a8a29a', '#c8c2b8']);
  function plaid(xx, yy, x, y, sh) { /* tartan: dark bands both ways, thin pale line, 2-colour twill ridges */
    var a = (xx % 14), b = (yy % 10), da = a < 4, db = b < 3, thin = a === 8 || b === 6;
    var tw = (x + y) % 3 === 0 ? .17 : (x + y) % 3 === 1 ? -.08 : 0;
    if (da && db) return C.rp(PLAIDK, .3 + tw + sh, x, y);
    if (da || db) return C.rp(PLAID, .22 + tw + sh, x, y);
    if (thin) return C.rp(R(['#8a6a40', '#c8a060', '#e8c888']), .5 + tw + sh, x, y);
    return C.rp(PLAID, .66 + tw + sh, x, y);
  }
  RM.plaid = plaid;
  function deer(g, cx, cy) {
    cx = Math.round(cx); cy = Math.round(cy);
    C.title.ellipseFill(g, cx, cy + 4, 10, 12, function (x, y, d) { return C.css(C.rp(LOG, d > .8 ? .05 : .75 - d * .4 + A.tex.wood(x, y, 5) * .1, x, y)); });
    C.title.ellipseFill(g, cx, cy + 3, 5, 6, function (x, y, d) { return C.css(C.rp(R(['#2a160c', '#4a2a16', '#6e4426', '#906038', '#b07e50']), .75 - d * .5 - (x > cx ? .17 : 0) + ((x + y) % 3 === 0 ? .17 : 0), x, y)); });
    C.title.ellipseFill(g, cx, cy + 10, 3, 3, function (x, y, d) { return C.css(C.rp(R(['#2a160c', '#4a2a16', '#6e4426', '#906038']), .6 - d * .4, x, y)); });
    px(g, cx, cy + 12, '#140a06'); px(g, cx - 2, cy + 2, '#140a06'); px(g, cx + 2, cy + 2, '#140a06'); px(g, cx - 2, cy + 1, '#e8d0a0');
    [-1, 1].forEach(function (s) { px(g, cx + s * 6, cy - 1, '#6e4426'); px(g, cx + s * 7, cy - 2, '#906038');
      var AN = ['#a08a6a', '#e0cca8', '#fff0d4'], pts = [[2, -3], [3, -5], [4, -7], [5, -9], [6, -11], [6, -13], [7, -15], [3, -9], [2, -11], [1, -13], [7, -9], [9, -10], [10, -12], [5, -14], [4, -16]];
      pts.forEach(function (q, k) { px(g, cx + s * q[0], cy + q[1], AN[k % 3 === 0 ? 0 : k % 3]); px(g, cx + s * q[0] + s, cy + q[1], AN[0]); }); });
  }
  function lantern(g, x, by) { /* 9 wide, 13 tall, sits on the mantel */
    rect(g, x, by - 13, 9, 13, function (X, Y, xx, yy) { if (yy === 0) return xx > 2 && xx < 6 ? '#1a1410' : 0; if (yy === 1) return xx > 1 && xx < 7 ? '#2e2620' : 0; if (yy === 2 || yy === 12) return '#2e2620'; if (yy === 11) return xx > 0 && xx < 8 ? '#1a1410' : 0;
      if (xx === 0 || xx === 8 || xx === 4) return xx === 4 ? '#24201c' : '#1a1410'; return yy < 5 ? '#ffe6a0' : yy < 9 ? '#ffc860' : '#e89a3a'; });
    px(g, x + 2, by - 7, '#fff6d0'); px(g, x + 6, by - 7, '#fff6d0');
  }
  function woodpile(g, x0, y0, w, h) { /* log ends: rings, bark rim, ridge shadow below each */
    for (var r = 0; r < 3; r++) for (var k = 0; k < 4; k++) { var cx = x0 + 3 + k * 5 + (r % 2 ? 2 : 0), cy = y0 + h - 3 - r * 4; if (cx > x0 + w - 2 || (r === 2 && (k === 0 || k === 3))) continue;
      C.title.ellipseFill(g, cx, cy, 3, 2.6, function (x, y, d) { return d > .7 ? C.css(C.rp(R(['#1e100a', '#3a2214', '#5a3820']), y > cy ? .1 : .7, x, y)) : C.css(C.rp(R(['#8a5c30', '#b88450', '#d8aa70', '#ecc88e']), (Math.round(Math.sqrt(d) * 3) % 2 ? .3 : .8), x, y)); }); }
  }
  function boots(g, x0, y0) { [0, 6].forEach(function (o) { rect(g, x0 + o, y0 - 8, 6, 9, function (x, y, xx, yy) { if (yy < 6 && xx > 3) return 0; if (yy === 8) return '#140a06'; if (yy === 0) return '#c8b090'; return C.rp(LEATH, (xx === 0 ? .2 : .55) + (yy === 1 ? .2 : 0) + ((x + y) % 4 === 0 ? .17 : 0) - yy * .03, x, y); }); }); }
  function armchair(g, ch) {
    if (!ch) return; var x0 = ch.x, y0 = ch.y, w = ch.w, h = ch.h;
    /* guitar leaning on the right arm (behind) */
    var gx = x0 + w - 6, gy = y0 + h - 14;
    for (var k = 0; k < 26; k++) { var nx = gx + 10 - Math.round(k * .25), ny = gy - k; px(g, nx, ny, k > 22 ? '#2a1a10' : '#5a3a20'); px(g, nx + 1, ny, k > 22 ? '#2a1a10' : '#3a2414'); }
    C.title.ellipseFill(g, gx + 11, gy + 6, 7, 6, function (x, y, d) { return C.css(C.rp(R(['#4a2006', '#8a4a14', '#c47a2a', '#e0a050', '#f0c070']), d > .82 ? .05 : .8 - d * .5 + ((x - y) % 5 === 0 ? .17 : 0), x, y)); });
    C.title.ellipseFill(g, gx + 9, gy + 1, 5, 4, function (x, y, d) { return C.css(C.rp(R(['#4a2006', '#8a4a14', '#c47a2a', '#e0a050', '#f0c070']), d > .8 ? .05 : .75 - d * .45, x, y)); });
    C.title.ellipseFill(g, gx + 10, gy + 4, 1.6, 1.6, function () { return '#1a0c06'; });
    /* chair: back, arms, seat cushion, legs; leather with creases (ridge lines one up, shadow one down) */
    function leather(x, y, v) { var cr = A.tex.ridge(x, y, 3); return C.rp(LEATH, v + cr * .17 - ((x * 5 + y * 3) % 17 === 0 ? .17 : 0), x, y); }
    rect(g, x0 + 5, y0, w - 10, h - 12, function (x, y, xx, yy) { var e = xx === 0 || xx === w - 11 || yy === 0; return e ? OUT : leather(x, y, .55 - yy * .012 + (yy === 1 ? .2 : 0) - (xx > w - 16 ? .15 : 0)); });
    [[x0, 0], [x0 + w - 8, 1]].forEach(function (a) { rect(g, a[0], y0 + 12, 8, h - 16, function (x, y, xx, yy) { if (yy < 3 && (xx === 0 || xx === 7) && yy === 0) return 0; var e = xx === 0 || xx === 7 || yy === h - 17; return e ? OUT : leather(x, y, (yy < 3 ? .8 : .5) - (a[1] ? .1 : 0) - (xx === 6 ? .17 : 0)); }); });
    rect(g, x0 + 8, y0 + h - 18, w - 16, 7, function (x, y, xx, yy) { return yy === 6 ? OUT : leather(x, y, yy === 0 ? .85 : .62 - yy * .05); });
    rect(g, x0 + 2, y0 + h - 4, 3, 4, function () { return '#1a0c06'; }); rect(g, x0 + w - 5, y0 + h - 4, 3, 4, function () { return '#1a0c06'; });
    /* plaid pillow on the seat */
    rect(g, x0 + 9, y0 + h - 29, 13, 12, function (x, y, xx, yy) { if ((xx === 0 || xx === 12) && (yy === 0 || yy === 11)) return 0; if (xx === 0 || xx === 12 || yy === 0 || yy === 11) return '#2a0c08'; return plaid(xx * 2, yy * 2, x, y, .1 - yy * .02); });
    /* cream knit throw over the right back corner and arm: vertical knit ridges */
    rect(g, x0 + w - 18, y0 - 1, 14, h - 6, function (x, y, xx, yy) { var edge = 4 + Math.round(Math.sin(yy * .5) * 1.5); if (yy > 6 && xx < edge) return 0; if (yy > h - 10 && (xx + yy) % 3 === 0) return 0;
      var k = A.tex.knit(xx, yy); return C.rp(KNIT, .62 + k * .25 - (xx > 11 ? .2 : 0) - yy * .006, x, y); });
  }
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
