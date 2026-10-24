/* The Cottage — grandma's leather cookbook: two aged pages per recipe (one page on phones), a sepia illustration of the
   finished dish painted from the same sprites, the ingredients as little sepia drawings, a page-flip, and a cook ribbon. */
(function () {
  'use strict';
  var C = window.COT, A = C.art, P = C.P, R = C.ramp, F = C.food, D = C.dish, Wr = C.ware, RM = C.room, pal = A.pal, OUT = pal.out;
  var B = C.book = { page: 0, flip: null, t: 0 };
  var ILL = {};
  function illus(id) {
    if (ILL[id]) return ILL[id]; var p;
    var full = []; for (var i = 0; i < 14; i++) full.push(1);
    if (id === 'apple' || id === 'pumpkin' || id === 'pecan') { p = D.pie({ kind: id, crust: 1, fill: 1, lattice: id === 'apple' ? 6 : 0, crimp: full, bake: 1 }).clone(); if (id === 'pecan') { var q = new A.Pix(p.w, p.h); q.blit(p, 0, 0); var dp = Wr.dishP(); for (var k = 0; k < 12; k++) { var ring = k < 8 ? 1 : .45, a = (k < 8 ? k / 8 : (k - 8) / 4) * 6.283; q.blit(C.steps.itemPix('pecan', k), Math.round(dp.cx + Math.cos(a) * (dp.irx - 9) * ring) - 4, Math.round(dp.cy + Math.sin(a) * (dp.iry - 5) * ring) - 2); } p = q; } }
    else if (id === 'bread') p = D.loaf({ rise: 1, bake: 1 });
    else if (id === 'turkey' || id === 'ham') { var v = Wr.roaster(), m = id === 'turkey' ? D.turkey({ bake: 1 }) : D.ham({ bake: 1 }); var ro = C.cook.roastOff(id); p = new A.Pix(v.pix.w, v.pix.h + C.cook.RPAD); p.blit(v.pix, 0, C.cook.RPAD); p.blit(m, ro.x, ro.y); }
    else if (id === 'stew') { var bw = Wr.bowl(); p = bw.pix.clone(); for (var y = 0; y < p.h; y++) for (var x = 0; x < p.w; x++) { var dx = (x + .5 - bw.cx) / (bw.irx - 1), dy = (y + .5 - bw.cy) / (bw.iry - .6); if (dx * dx + dy * dy <= 1) p.set(x, y, C.hash(x >> 1, y >> 1, 3) > .78 ? P('#f08a2a') : C.hash(x >> 1, y >> 1, 4) > .8 ? P('#e8d8a8') : C.rp(R(['#3a1806', '#5a2a10', '#7a4018']), .6 - dy * .3, x, y)); } }
    else if (id === 'cinnamon') { p = Wr.sqpan().pix.clone(); for (i = 0; i < 6; i++) p.blit(D.roll(1, 18), 6 + (i % 3) * 20, 4 + Math.floor(i / 3) * 18); }
    else if (id === 'ginger') { p = Wr.tray().pix.clone(); for (i = 0; i < 5; i++) p.blit(D.cookie(1), 4 + i * 17, 8 + (i % 2) * 6); }
    else if (id === 'cocoa') { var mg = Wr.mug(); p = mg.pix.clone(); for (y = 0; y < p.h; y++) for (x = 0; x < p.w; x++) { dx = (x + .5 - mg.cx) / (mg.irx - 1); dy = (y + .5 - mg.cy) / mg.iry; if (dx * dx + dy * dy <= 1) p.set(x, y, C.rp(R(['#3a1408', '#5a2a14', '#7a4020']), .6 - dy * .3, x, y)); } for (i = 0; i < 4; i++) p.blit(C.steps.itemPix('marsh', i), mg.cx - 10 + i * 5, mg.cy - 3 + (i % 2)); }
    return (ILL[id] = p.ink(pal.sepia));
  }
  B.illus = illus;
  var INKI = {};
  function inkIcon(id) { return INKI[id] || (INKI[id] = F.sprite(id).skin.ink(pal.sepia)); }
  function lay() { var W = C.W, H = C.H, por = C.portrait; if (por) { var w = Math.min(W - 12, 184), h = Math.min(H - 70, 300); return { por: 1, x: Math.round((W - w) / 2), y: Math.round((H - h) / 2) + 8, w: w, h: h }; }
    var w2 = Math.min(W - 52, 296), h2 = Math.min(H - 30, 178); return { por: 0, x: Math.round((W - w2) / 2), y: Math.round((H - h2) / 2) + 4, w: w2, h: h2 }; }
  B.lay = lay;
  var LIST = function () { return C.recipes.list; };
  /* aged paper page painted into a canvas */
  var pageCache = {};
  function paper(w, h, side) { var k = w + 'x' + h + side; if (pageCache[k]) return pageCache[k]; var c = C.mk(w, h), n = A.noise(61, 9), n2 = A.noise(62, 2);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var edge = Math.min(x, y, w - 1 - x, h - 1 - y), sp = side === 'L' ? (w - 1 - x) : side === 'R' ? x : 99; var v = .78 + n(x, y) * .12 + n2(x, y) * .04 - Math.max(0, 6 - sp) * .06 - Math.max(0, 3 - edge) * .08; if (C.hash(x, y, 13) > .995) v -= .3; RM.px(c.g, x, y, C.rp(pal.page, v, x, y)); }
    return (pageCache[k] = c); }
  function drawPage(g, rec, x, y, w, h, part) {
    /* part: 'L' illustration, 'R' ingredients + cook, 'B' both (phone) */
    g.drawImage(paper(w, h, part === 'B' ? 'B' : part), x, y);
    var made = C.save.data.made[rec.id] || 0, il = illus(rec.id);
    if (part === 'L' || part === 'B') { var iy = part === 'B' ? y + 34 : y + Math.round(h / 2) - il.h / 2 + 8; il.draw(g, x + Math.round(w / 2 - il.w / 2), iy);
      /* little sepia flourish under the art */ for (var i = -14; i <= 14; i++) RM.px(g, x + (w >> 1) + i, iy + il.h + 4 + Math.round(Math.sin(i * .45) * 1), '#7d5632');
      if (part === 'L') { C.digits(g, (B.page + 1) + '', x + 6, y + h - 9, '#7d5632'); } }
    if (part === 'R' || part === 'B') { var ys = part === 'B' ? y + 34 + il.h + 16 : y + 30, cols = part === 'B' ? 5 : 4, cw = Math.floor((w - 16) / cols);
      rec.ing.forEach(function (id, i) { var ic = inkIcon(id), cx = x + 8 + (i % cols) * cw + (cw >> 1), cy = ys + Math.floor(i / cols) * 26; ic.draw(g, cx - (ic.w >> 1), cy + 20 - ic.h); C.region(cx - 10, cy, 20, 22, 'ing:' + id, { t: F.ing[id].n.toLowerCase() }); });
      /* steps as tiny pips */ var py = part === 'B' ? y + h - 22 : y + h - 40; rec.steps.forEach(function (s, i) { RM.px(g, x + 10 + i * 4, py, '#7d5632'); RM.px(g, x + 10 + i * 4 + 1, py, '#a57d4f'); });
      /* made stamp */ if (made) { var sx = x + w - 22, sy = y + 8; C.title.ellipseFill(g, sx + 7, sy + 7, 7, 7, function (X, Y, d) { return d > .7 ? '#8a2a1e' : (C.bayer(X, Y) < .3 ? '#c84438' : 0); }); C.digits(g, made > 9 ? '9' : made + '', sx + 6, sy + 5, '#8a2a1e'); C.region(sx, sy, 15, 15, 'made', { t: 'made', d: 'You have cooked this ' + made + (made > 1 ? ' times.' : ' time.') }); }
      /* cook ribbon (bookmark) */ var bx = x + w - 30, by = y + h - 30, hov = C.hover && C.hover.id === 'cook'; drawRibbon(g, bx, by - (hov ? 1 : 0), hov); C.region(bx - 4, by - 4, 30, 30, 'cook', { t: 'cook', d: 'Cook ' + rec.name.toLowerCase() + '.' }); }
  }
  function drawRibbon(g, x, y, hov) { /* wax-seal button with a wooden spoon + flame */
    C.title.ellipseFill(g, x + 11, y + 11, 11, 11, function (X, Y, d) { return d > .82 ? '#3a0a08' : C.css(C.rp(R(['#5a0e0c', '#8a1a16', '#b42a22', '#d84a36', '#f07a5a']), .85 - d * .5 - (Y - y) / 40 + (hov ? .15 : 0), X, Y)); });
    /* a wooden spoon lying diagonally: oval bowl lower-left, handle to the upper-right */
    var sp = ['..........##', '.........#o#', '........#o#.', '.......#o#..', '......#o#...', '..###.#o#...', '.#ooo#o#....', '#oooooo#....', '#ooooo#.....', '#oooo#......', '.#oo#.......', '..##........'];
    for (var j = 0; j < sp.length; j++) for (var i = 0; i < 12; i++) { var c = sp[j][i]; if (c === '#') RM.px(g, x + 5 + i, y + 5 + j, '#3a0a08'); else if (c === 'o') RM.px(g, x + 5 + i, y + 5 + j, (i + j) % 5 === 0 ? '#e8b878' : '#ffe8c8'); }
  }
  function drawBook(g, t) {
    var Lb = lay(), list = LIST(), rec = list[B.page];
    /* table + candle glow */
    RM.glow(g, Lb.x + Lb.w / 2, Lb.y + Lb.h / 2, Math.round(Lb.w * .7), '#ffcf7a', .25 + .03 * Math.sin(t * 5), Math.round(Lb.h * .7));
    /* leather cover behind the pages */
    RM.rect(g, Lb.x - 6, Lb.y - 5, Lb.w + 12, Lb.h + 12, function (x, y, xx, yy) { var e = xx === 0 || yy === 0 || xx === Lb.w + 11 || yy === Lb.h + 11; if (e) return OUT; var gold = (xx === 3 || yy === 3 || xx === Lb.w + 8 || yy === Lb.h + 8); return gold ? P('#a8783a') : C.rp(pal.leather, .45 + A.noise(71, 3)(x, y) * .25 + (C.hash(x, y, 7) - .5) * .2, x, y); });
    /* page stack edges */
    for (var k = 0; k < 3; k++) RM.rect(g, Lb.x - 2 + k, Lb.y + Lb.h + 2 - k, Lb.w + 4 - k * 2, 1, function (x) { return x % 3 ? P('#d3b781') : P('#b4935f'); });
    if (Lb.por) { drawPage(g, rec, Lb.x, Lb.y, Lb.w, Lb.h, 'B'); }
    else { var pw = Lb.w / 2 | 0; drawPage(g, rec, Lb.x, Lb.y, pw, Lb.h, 'L'); drawPage(g, rec, Lb.x + pw, Lb.y, Lb.w - pw, Lb.h, 'R');
      /* spine shadow */ for (var y = Lb.y; y < Lb.y + Lb.h; y++) { RM.px(g, Lb.x + pw - 1, y, '#8a6a45'); RM.px(g, Lb.x + pw, y, '#a88a5a'); } }
    /* page flip: the turning page squeezes toward the spine and opens on the other side */
    var f = B.flip; if (f) { var e = C.ease(f.t), spine = Lb.por ? Lb.x : Lb.x + (Lb.w >> 1), pw2 = Lb.por ? Lb.w : Lb.w >> 1, old = list[f.from];
      var src = C.mk(pw2, Lb.h); if (Lb.por) drawPageInto(src.g, old, 'B'); else drawPageInto(src.g, f.dir > 0 ? old : old, f.dir > 0 ? (e < .5 ? 'R' : 'L') : (e < .5 ? 'L' : 'R'));
      var k2 = Math.abs(Math.cos(e * Math.PI)), w = Math.max(1, Math.round(pw2 * k2)); var right = f.dir > 0 ? e < .5 : e >= .5; if (Lb.por) right = true;
      var dxp = right ? spine : spine - w; if (Lb.por && f.dir < 0) dxp = spine + pw2 - w;
      g.drawImage(src, 0, 0, pw2, Lb.h, dxp, Lb.y - Math.round(Math.sin(e * Math.PI) * 4), w, Lb.h);
      /* shading line at the fold */ for (y = 0; y < Lb.h; y++) RM.px(g, right ? dxp + w - 1 : dxp, Lb.y + y - Math.round(Math.sin(e * Math.PI) * 4), '#8a6a45'); }
    B._lay = Lb;
  }
  function drawPageInto(g, rec, part) { var regs = C.regions.length; var Lb = lay(), pw = Lb.por ? Lb.w : Lb.w >> 1; drawPage(g, rec, 0, 0, pw, Lb.h, part); C.regions.length = regs; }
  function turn(dir) { var n = LIST().length, to = (B.page + dir + n) % n; if (B.flip) return; B.flip = { from: B.page, dir: dir, t: 0 }; B.page = to; C.save.data.page = to; C.save.write(); C.sfx.any('flip', 3, { jitter: .15 }); }
  B.turn = turn;
  C.scenes.book = {
    enter: function () { B.page = C.save.data.page || 0; if (B.page >= LIST().length) B.page = 0; B.t = 0; C.ui.refresh(); },
    update: function (dt) { B.t += dt; if (B.flip) { B.flip.t += dt * 2.6; if (B.flip.t >= 1) B.flip = null; }
      var Lb = lay(), rec = LIST()[B.page];
      C.region(0, 0, C.W, C.H, 'bg', null);
      var ay = Lb.y + Lb.h / 2 - 8; C.region(Lb.x - 22, ay - 6, 18, 28, 'prev', { t: 'previous recipe' }); C.region(Lb.x + Lb.w + 4, ay - 6, 18, 28, 'next', { t: 'next recipe' });
      var sy = Lb.por ? Lb.y + 16 : Lb.y + 18, sx = Lb.por ? 0 : Lb.w / 4; if (Lb.por) C.ui.script(B.flip ? '' : rec.name.toLowerCase(), Lb.y + 4, 20, { ink: 1, w: Lb.w - 16 }); else C.ui.script(B.flip ? '' : rec.name.toLowerCase(), Lb.y + 5, 20, { ink: 1, align: 'left', x: Lb.x + (Lb.w >> 1) + 10, w: (Lb.w >> 1) - 24 });
      C.ui.label(''); },
    draw: function (g) { g.fillStyle = '#1a0e08'; g.fillRect(0, 0, C.W, C.H);
      /* wooden table */ RM.rect(g, 0, 0, C.W, C.H, function (x, y) { return C.rp(pal.wood, .35 + A.noise(81, 4)(x * .3, y * 2) * .2 + (y % 14 === 0 ? -.3 : 0), x, y); });
      drawBook(g, B.t); var Lb = lay(), ay = Lb.y + Lb.h / 2 - 8; arrow(g, Lb.x - 18, ay, -1, C.hover && C.hover.id === 'prev'); arrow(g, Lb.x + Lb.w + 8, ay, 1, C.hover && C.hover.id === 'next'); },
    down: function (m) { var h = C.hit(m.x, m.y); B.sx = m.x; B.swiped = 0; if (!h) return; if (h.id === 'prev') turn(-1); else if (h.id === 'next') turn(1); else if (h.id === 'cook') { var id = LIST()[B.page].id; C.sfx('bookClose'); B.leaving(); C.go('cook', { id: id }); } else if (h.id.indexOf('ing:') === 0) C.sfx('flip3', { vol: .3, rate: 1.5 }); },
    move: function (m) { if (m.down && !B.swiped && Math.abs(m.x - B.sx) > 24) { B.swiped = 1; turn(m.x < B.sx ? 1 : -1); } },
    key: function (e) { if (e.key === 'ArrowRight') turn(1); if (e.key === 'ArrowLeft') turn(-1); if (e.key === 'Escape') C.go('kitchen'); if (e.key === 'Enter') { C.go('cook', { id: LIST()[B.page].id }); B.leaving(); } }
  };
  B.leaving = function () { var scr = document.getElementById('script'); scr.removeAttribute('style'); scr.classList.remove('ink'); };
  var _onScene = C.onScene; C.onScene = function (n) { if (n !== 'book') B.leaving(); _onScene(n); };
  function arrow(g, x, y, dir, hov) { var A2 = ['...#', '..##', '.###', '####', '.###', '..##', '...#']; for (var j = 0; j < 7; j++) for (var i = 0; i < 4; i++) if (A2[j][dir < 0 ? i : 3 - i] === '#') { RM.px(g, x + i * 2, y + j * 2, hov ? '#ffffff' : '#fff3dc'); RM.px(g, x + i * 2 + 1, y + j * 2, hov ? '#ffffff' : '#fff3dc'); RM.px(g, x + i * 2, y + j * 2 + 1, '#c8a878'); RM.px(g, x + i * 2 + 1, y + j * 2 + 1, '#c8a878'); } }
})();
