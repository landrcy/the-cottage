/* The Cottage — the cook engine: the close-up counter scene, the state of the dish being built (R), object painters
   (bowl, pot, pie, roast, loaf, dough sheet, rolls, cookies, mug), the step runner with sparkle + idle hint, and the
   finished-dish reveal that puts the dish on the kitchen shelf. */
(function () {
  'use strict';
  var C = window.COT, A = C.art, P = C.P, R = C.ramp, Wr = C.ware, D = C.dish, pal = A.pal, OUT = pal.out, RM = C.room;
  var K = C.cook = { active: false, R: null, step: null, i: 0, t: 0, idle: 0, sparks: [], bg: null, phase: 'step', steam: [] };
  var MAIN = { apple: 'pie', pumpkin: 'pie', pecan: 'pie', bread: 'loaf', turkey: 'turkey', ham: 'ham', stew: 'stewbowl', cinnamon: 'rolls', ginger: 'cookies', cocoa: 'mug' };
  K.MAIN = MAIN;
  /* ---------- layout + background (worktop close-up) ---------- */
  K.lay = function () { var W = C.W, H = C.H, por = C.portrait; var top = por ? Math.round(H * .34) : Math.round(H * .4); return { W: W, H: H, por: por, top: top, cx: Math.round(W / 2), cy: por ? Math.round(H * .6) : Math.round(H * .66) }; };
  function bakeBg(L) {
    var W = L.W, H = L.H, c = C.mk(W, H), g = c.g, PL = R(['#5a3a26', '#7a5236', '#9a6c48', '#b8885c', '#d0a470']), TILE = R(['#3a4f80', '#5a72a8', '#c8d4e8', '#eef2f8', '#ffffff']);
    RM.rect(g, 0, 0, W, L.top, function (x, y) { return C.rp(PL, .55 + A.noise(7, 6)(x, y) * .15 + (C.hash(x, y, 3) - .5) * .12 - y / L.top * .2, x, y); });
    /* delft tile backsplash */
    var ty0 = L.top - 34; RM.rect(g, 0, ty0, W, 34, function (x, y, xx, yy) { var tx = xx % 17, tyy = yy % 17, tile = Math.floor(xx / 17) + Math.floor(yy / 17) * 7; if (tx === 0 || tyy === 0) return P('#8a8478'); var dx = tx - 8.5, dy = tyy - 8.5, d = Math.abs(dx) + Math.abs(dy); var k = tile % 3; var motif = k === 0 ? (d > 4.5 && d < 6) || (d < 1.6) : k === 1 ? Math.abs(Math.abs(dx) - Math.abs(dy)) < .8 && d < 6 : (dx * dx + dy * dy < 9 && dx * dx + dy * dy > 4) || (Math.abs(dx) < .6 && dy > 2); if (motif) return TILE[1]; if ((tx < 2 || tyy < 2) && C.bayer(x, y) < .5) return TILE[4]; return C.rp(TILE, .72 + (C.hash(tile, 0, 1) - .5) * .1, x, y); });
    /* utensil rail with hanging spoons/whisk */
    RM.rect(g, 10, ty0 - 16, W - 20, 2, function (x, y, xx, yy) { return C.rp(pal.copper, yy ? .3 : .8, x, y); });
    for (var u = 0; u < Math.floor((W - 30) / 28); u++) { var ux = 22 + u * 28; for (var k = 0; k < 4; k++) RM.px(g, ux, ty0 - 14 + k, '#5a3a26'); var sp = u % 2 ? C.food.tools.spoon : C.food.tools.brush; g.drawImage(sp.canvas(), ux - (sp.w >> 1), ty0 - 10); }
    /* worktop planks */
    RM.rect(g, 0, L.top, W, H - L.top, function (x, y, xx, yy) { var row = Math.floor(yy / 12), seam = yy % 12 === 11 || yy === 0; var v = .5 + A.noise(row * 3, 4)(x * .25, y * 1.5) * .3 + (C.hash(x, y, 9) - .5) * .12 + (yy < 3 ? .3 : 0) - yy / (H - L.top) * .25; return C.rp(pal.woodL, seam ? .1 : v, x, y); });
    for (var i = 0; i < 70; i++) RM.px(g, (C.hash(i, 1, 3) * W) | 0, L.top + 4 + ((C.hash(i, 2, 3) * (H - L.top - 6)) | 0), C.hash(i, 3, 3) > .5 ? '#f4ecdc' : '#e8dcc4');
    return c;
  }
  C.layoutListeners.push(function () { if (K.active) { K.L = K.lay(); K.bg = bakeBg(K.L); if (K.step && K.step.relayout) K.step.relayout(); } });
  /* ---------- dish state ---------- */
  function freshState(rec) {
    var S = { id: rec.id, rec: rec, main: MAIN[rec.id],
      bowl: { lvl: 0, cols: [], mix: 0, dough: 0, chunks: [] }, pot: { lvl: 0, cols: [], mix: 0, heat: 0, chunks: [] },
      pie: { kind: rec.pie || 'apple', crust: 0, fill: 0, lattice: 0, crimp: [], bake: 0 },
      turkey: { bake: 0 }, ham: { bake: 0 }, loaf: { rise: 0, bake: 0 }, sheet: { shape: 'round', r: 0, roll: 0 },
      rolls: { n: 0, bake: 0 }, cookies: { list: [], bake: 0 }, mug: { lvl: 0, cols: [] }, stewbowl: { lvl: 0, cols: [], chunks: [] }, deco: {} };
    for (var i = 0; i < 14; i++) S.pie.crimp.push(0);
    return S;
  }
  K.deco = function (n) { var d = K.R.deco[n]; if (!d) d = K.R.deco[n] = { specks: [], lines: [], items: [], glaze: null, icing: [] }; return d; };
  /* ---------- contents colour: layered swirl that blends as mix → 1 ---------- */
  function avgCol(cols) { var r = 0, g = 0, b = 0, t = 0; cols.forEach(function (c) { var u = C.unpack(c.c); r += u[0] * c.a; g += u[1] * c.a; b += u[2] * c.a; t += c.a; }); if (!t) return P('#808080'); return C.pack(r / t | 0, g / t | 0, b / t | 0); }
  K.avgCol = avgCol;
  function shadeC(c, v) { var u = C.unpack(c), k = .62 + v * .55; return C.pack(Math.min(255, u[0] * k) | 0, Math.min(255, u[1] * k) | 0, Math.min(255, u[2] * k) | 0); }
  function contentsCol(st, x, y, v, ang, r) {
    if (!st.cols.length) return 0; var avg = avgCol(st.cols);
    if (st.mix >= 1 || st.cols.length === 1) return shadeC(avg, v + (C.hash(x, y, 4) - .5) * .15);
    var tot = 0; st.cols.forEach(function (c) { tot += c.a; }); var sw = (A.noise(31, 3)(x + Math.cos(ang * 2) * r * 4, y + Math.sin(ang * 2) * r * 4) * .5 + .5 + ang / 6.283 * .5 + st.mix * r * 2) % 1; var acc = 0, pick = st.cols[0].c;
    for (var i = 0; i < st.cols.length; i++) { acc += st.cols[i].a / tot; if (sw <= acc) { pick = st.cols[i].c; break; } }
    return shadeC(C.bayer(x, y) < st.mix ? avg : pick, v);
  }
  function vesselWithContents(v, st, key, opt) {
    return Wr.memo(key, function () {
      var p = v.pix.clone(), lv = Math.min(1, st.lvl); if (lv <= 0) return p; var rx = v.irx * (.62 + .38 * lv) - 1, ry = v.iry * (.62 + .38 * lv) - .6, cy = v.cy + (1 - lv) * (opt && opt.deep || 6);
      for (var y = 0; y < p.h; y++) for (var x = 0; x < p.w; x++) { var dx = (x + .5 - v.cx) / rx, dy = (y + .5 - cy) / ry, d = dx * dx + dy * dy; if (d > 1) continue; var ang = Math.atan2(dy, dx) + Math.PI, vv = .7 - dy * .25 - d * .2 + (d > .82 ? -.25 : 0); var c = st.doughCol ? C.rp(st.doughCol === 'ginger' ? R(['#5a2a0e', '#7a4018', '#9a5a28', '#b87a40']) : D.DOUGH, vv + (C.hash(x, y, 2) - .5) * .2, x, y) : contentsCol(st, x, y, vv, ang, Math.sqrt(d)); if (c) p.set(x, y, c); }
      (st.chunks || []).forEach(function (ch) { var x0 = Math.round(v.cx + ch.x * rx), y0 = Math.round(cy + ch.y * ry); for (var j = 0; j < 2; j++) for (var i = 0; i < 3; i++) { var u = ch.c; p.set(x0 + i, y0 + j, j === 0 ? C.mix(u, P('#ffffff'), .25) : u); } p.set(x0 - 1, y0, C.mix(ch.c, P('#000000'), .4)); p.set(x0 + 3, y0 + 1, C.mix(ch.c, P('#000000'), .4)); });
      if (st.doughBall) { var b = D.doughBlob(0, 1, 15); if (st.doughCol === 'ginger') b = b.ink(R(['#3a1a08', '#6a3414', '#94562a', '#b8743e', '#d0904e'])); p.blit(b, Math.round(v.cx - b.w / 2), Math.round(cy - b.h / 2 - 1)); }
      return p;
    });
  }
  function q(v, n) { return Math.round(v * (n || 8)); }
  function stKey(st) { return [q(st.lvl, 16), q(st.mix, 10), st.cols.map(function (c) { return c.c + ':' + q(c.a, 8); }).join(','), (st.chunks || []).length, st.doughCol || '', st.doughBall || 0].join('|'); }
  /* ---------- object pix + surface ---------- */
  var O = K.obj = {};
  O.bowl = function () { var st = K.R.bowl, v = Wr.bowl(); return { pix: vesselWithContents(v, st, 'cb' + stKey(st)), v: v, surf: function (x, y) { var dx = (x - v.cx) / (v.irx - 2), dy = (y - v.cy - 1) / (v.iry - 1); return dx * dx + dy * dy < 1; } }; };
  O.pot = function () { var st = K.R.pot, v = Wr.pot(); return { pix: vesselWithContents(v, st, 'cp' + stKey(st), { deep: 10 }), v: v, surf: function (x, y) { var dx = (x - v.cx) / (v.irx - 2), dy = (y - v.cy - 1) / (v.iry - 1); return dx * dx + dy * dy < 1; } }; };
  O.stewbowl = function () { var st = K.R.stewbowl, v = Wr.bowl(); return { pix: vesselWithContents(v, st, 'cs' + stKey(st)), v: v, surf: function (x, y) { var dx = (x - v.cx) / (v.irx - 2), dy = (y - v.cy - 1) / (v.iry - 1); return dx * dx + dy * dy < 1; } }; };
  O.mug = function () { var st = K.R.mug, v = Wr.mug(); return { pix: vesselWithContents(v, st, 'cm' + stKey(st), { deep: 8 }), v: v, surf: function (x, y) { var dx = (x - v.cx) / (v.irx - 1), dy = (y - v.cy) / (v.iry); return dx * dx + dy * dy < 1.2; } }; };
  O.pie = function () { var st = K.R.pie, p = D.pie(st), dp = Wr.dishP(); return { pix: p, surf: function (x, y) { var dx = (x - dp.cx) / (dp.irx - 4), dy = (y - dp.cy) / (dp.iry - 2); return dx * dx + dy * dy < 1; }, rim: dp } };
  K.RPAD = 26; K.roastOff = function (kind) { var v = Wr.roaster(), m = kind === 'turkey' ? D.turkey({}) : D.ham({}); return { x: Math.round(v.cx - m.w / 2), y: Math.round(v.cy + K.RPAD - m.h + (kind === 'turkey' ? 3 : 6)), w: m.w, h: m.h }; };
  function roastPix(kind) { var st = K.R[kind]; return Wr.memo('rs' + kind + q(st.bake, 12), function () { var v = Wr.roaster(), p = new A.Pix(v.pix.w, v.pix.h + K.RPAD), m = kind === 'turkey' ? D.turkey(st) : D.ham(st), o = K.roastOff(kind); p.blit(v.pix, 0, K.RPAD); p.blit(m, o.x, o.y); return p; }); }
  function roastObj(kind) { return function () { var v = Wr.roaster(), m = kind === 'turkey' ? D.turkey(K.R[kind]) : D.ham(K.R[kind]), o2 = K.roastOff(kind), ox = o2.x, oy = o2.y; return { pix: roastPix(kind), surf: function (x, y) { var c = m.get(x - ox, y - oy); return (c >>> 24) && m.get(x - ox, y - oy + 1) >>> 24 && (kind !== 'ham' || x - ox < m.w * .8); } }; }; }
  O.turkey = roastObj('turkey'); O.ham = roastObj('ham');
  O.loaf = function () { var st = K.R.loaf, l = D.loaf(st); return { pix: l, surf: function (x, y) { return (l.get(x, y) >>> 24) && y < l.h - 8 && y > 4; } }; };
  O.sheet = function () { var st = K.R.sheet, s = D.sheet(st.shape, st.r, 0), g = st.ginger; if (g) s = Wr.memo('gs' + q(st.r, 16), function () { return D.sheet(st.shape, st.r, 0).ink(R(['#3a1a08', '#6a3414', '#94562a', '#b8743e', '#d0904e'])); }); return { pix: s, surf: function (x, y) { return (s.get(x, y) >>> 24) && (s.get(x + 1, y + 1) >>> 24) && (s.get(x - 1, y - 1) >>> 24); } }; };
  O.rolls = function () { var st = K.R.rolls; return { pix: Wr.memo('rl' + st.n + q(st.bake, 8), function () { var v = Wr.sqpan(), p = v.pix.clone(); for (var i = 0; i < st.n; i++) { var r = D.roll(st.bake, 18), x = 6 + (i % 3) * 20, y = 4 + Math.floor(i / 3) * 18; p.blit(r, x, y); } return p; }), surf: function (x, y) { return x > 4 && y > 3 && x < 66 && y < 40; } }; };
  O.cookies = function () { var st = K.R.cookies; return { pix: Wr.memo('ck' + st.list.length + q(st.bake, 8), function () { var v = Wr.tray(), p = v.pix.clone(); st.list.forEach(function (c) { p.blit(D.cookie(st.bake), c.x, c.y); }); return p; }), surf: function (x, y) { var hit = false; st.list.forEach(function (c) { if (C.food.gman(x - c.x - 1, y - c.y - 1, 14, 16)) hit = true; }); return hit; } }; };
  /* draw object `n` centred at (x,y) with its decorations; returns the rect */
  K.drawObj = function (g, n, x, y, opt) {
    var o = O[n](), p = o.pix, x0 = Math.round(x - p.w / 2), y0 = Math.round(y - p.h / 2); p.draw(g, x0, y0); decoDraw(g, n, x0, y0, o); return { x: x0, y: y0, w: p.w, h: p.h, o: o };
  };
  K.rectOf = function (n, x, y) { var o = O[n](), p = o.pix; return { x: Math.round(x - p.w / 2), y: Math.round(y - p.h / 2), w: p.w, h: p.h, o: o }; };
  function decoDraw(g, n, x0, y0, o) {
    var d = K.R.deco[n]; if (!d) return;
    if (d.glaze) { var gm = d.glaze; for (var j = 0; j < gm.h; j++) for (var i = 0; i < gm.w; i++) { var a = gm.a[j * gm.w + i]; if (a > 0 && C.bayer(i, j) < a * .5 && o.surf(i, j)) { g.fillStyle = C.css(C.mix(gm.c, P('#ffffff'), (C.hash(i, j, 3) > .975) ? .5 : 0)); g.fillRect(x0 + i, y0 + j, 1, 1); } } }
    d.lines.forEach(function (l) { g.fillStyle = l.c || '#3a1a0a'; var n2 = Math.ceil(Math.hypot(l.x1 - l.x0, l.y1 - l.y0)); for (var k = 0; k <= n2; k++) { var X = Math.round(l.x0 + (l.x1 - l.x0) * k / n2), Y = Math.round(l.y0 + (l.y1 - l.y0) * k / n2); if (o.surf(X, Y)) { g.fillRect(x0 + X, y0 + Y, 1, 1); if (l.hi) { g.fillStyle = l.hi; g.fillRect(x0 + X, y0 + Y + 1, 1, 1); g.fillStyle = l.c || '#3a1a0a'; } } } });
    d.specks.forEach(function (s) { g.fillStyle = s.css || (s.css = C.css(s.c)); g.fillRect(x0 + s.x, y0 + s.y, 1, 1); });
    d.items.forEach(function (it) { var p = it.pix; p.draw(g, x0 + it.x - (p.w >> 1), y0 + it.y - (p.h >> 1) - (it.pop > 0 ? Math.round(it.pop * 3) : 0)); });
    d.icing.forEach(function (s) { g.fillStyle = '#fffaf2'; g.fillRect(x0 + s[0], y0 + s[1], 1, 1); });
  }
  /* stove burner under the pot */
  K.drawStove = function (g, x, y, heat, t) {
    RM.rect(g, x - 40, y, 80, 8, function (X, Y, xx, yy) { return C.rp(pal.metal, yy === 0 ? .6 : (xx % 10 < 2 ? .1 : .3), X, Y); });
    if (heat > 0) for (var i = 0; i < 16; i++) { var fx = x - 24 + i * 3, fh = 2 + Math.round((Math.sin(t * 13 + i * 1.7) * .5 + .5) * 3 * heat); for (var k = 0; k < fh; k++) RM.px(g, fx, y - k, k === 0 ? '#3a6aff' : k < 2 ? '#7ab0ff' : '#ffb347'); }
  };
  /* ---------- sparkles + hint hand ---------- */
  K.sparkle = function (x, y, n) { for (var i = 0; i < (n || 14); i++) { var a = Math.random() * 6.283, s = 10 + Math.random() * 30; K.sparks.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 10, a: 0 }); } };
  var HAND = ['..##......', '.#..#.....', '.#..#.....', '.#..###...', '.#..#..##.', '##..#..#.#', '#.#.....##', '#.......#.', '.#......#.', '..#....#..', '...####...'];
  K.hand = function (g, x, y, press) { x = Math.round(x); y = Math.round(y) + (press ? 1 : 0); for (var j = 0; j < HAND.length; j++) for (var i = 0; i < 10; i++) { var ch = HAND[j][i]; if (ch === '#') { g.fillStyle = '#2a160d'; g.fillRect(x + i - 1, y + j, 1, 1); } else if (j > 0 && i > 0 && HAND[j].lastIndexOf('#') > i && HAND[j].indexOf('#') < i) { g.fillStyle = '#fff3dc'; g.fillRect(x + i - 1, y + j, 1, 1); } } };
  /* ---------- steam wisps (shared) ---------- */
  K.steamAt = function (x, y, rate, dt) { if (Math.random() < dt * rate) K.steam.push({ x: x + (Math.random() - .5) * 20, y: y, a: 0, ph: Math.random() * 6 }); };
  function drawSteam(g, dt) { for (var i = K.steam.length - 1; i >= 0; i--) { var s = K.steam[i]; s.a += dt; s.y -= 9 * dt; s.x += Math.sin(s.a * 2 + s.ph) * 4 * dt; if (s.a > 2.6) { K.steam.splice(i, 1); continue; } var al = 1 - s.a / 2.6; for (var k = 0; k < 4; k++) if (C.bayer(k + (s.x | 0), (s.y | 0) + k) < al * .8) { g.fillStyle = k % 2 ? '#e8e0d4' : '#fffaf2'; g.fillRect(Math.round(s.x + Math.sin(k + s.a * 3) * 1.5), Math.round(s.y + k), 1, 1); } } }
  /* ---------- runner ---------- */
  K.begin = function (id, stepIdx) {
    var rec = C.recipes.byId[id]; K.R = freshState(rec); K.active = true; K.L = K.lay(); K.bg = bakeBg(K.L); K.phase = 'step'; K.sparks = []; K.steam = []; K.i = -1;
    var target = stepIdx || 0; K.next(); while (K.i < target && K.step) { if (K.step.skip) K.step.skip(); K.step.p = 1; K.next(); }
  };
  K.next = function () { K.i++; K.idle = 0; K.doneT = 0; var rec = K.R.rec; if (K.i >= rec.steps.length) { K.step = null; K.phase = 'reveal'; K.revealT = 0; C.sfx('chime', { vol: .8 }); C.sfx('plate', { vol: .7 }); return; }
    var cfg = rec.steps[K.i], f = C.steps[cfg.t]; if (!f) throw new Error('no step ' + cfg.t); K.step = f(cfg, K); K.step.cfg = cfg; if (K.step.p == null) K.step.p = 0; };
  K.leave = function () { K.active = false; if (K.step && K.step.leave) K.step.leave(); };
  K.complete = function () { if (K.phase === 'reveal') return; if (K.step.skip) K.step.skip(); K.step.p = 1; };
  K.finishAll = function () { var guard = 0; while (K.phase !== 'reveal' && guard++ < 100) { K.complete(); K.doneT = 9; K.update(0); } };
  K.update = function (dt) {
    var M = C.mouse; K.t += dt;
    if (K.phase === 'step' && K.step) {
      K.step.update && K.step.update(dt);
      if (K.step.p >= 1) { if (!K.doneT) { K.doneT = 1e-6; var sp = K.step.sparkAt || { x: K.L.cx, y: K.L.cy }; K.sparkle(sp.x, sp.y); C.sfx('chime', { vol: .35, rate: 1.25 }); } K.doneT += dt; if (K.doneT > .9) { K.step.leave && K.step.leave(); K.next(); } }
      if (!M.down) K.idle += dt; else K.idle = 0;
      U.label(K.step ? K.step.cfg.label : '', C.portrait ? 16 : 4);
    } else if (K.phase === 'reveal') {
      K.revealT += dt; U.label(''); var L = K.L; if (K.revealT > .4) U.script(K.R.rec.name.toLowerCase(), L.por ? 30 : 12, L.por ? 30 : 34);
      K.steamAt(L.cx, L.cy - 20, 4, dt);
      C.region(0, 0, L.W, L.H, 'reveal', null);
    }
    for (var i = K.sparks.length - 1; i >= 0; i--) { var s = K.sparks[i]; s.a += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= Math.exp(-dt * 3); s.vy *= Math.exp(-dt * 3); if (s.a > .9) K.sparks.splice(i, 1); }
    /* gentle fire crackle from the next room */
    C.sfx.loop('fire', .25);
  };
  var U = C.ui;
  K.draw = function (g, dt) {
    var L = K.L; g.drawImage(K.bg, 0, 0);
    RM.glow(g, -10, L.top - 10, 90, '#ffb347', .18 + .06 * Math.sin(K.t * 6) * Math.sin(K.t * 2.3), 60);
    if (K.phase === 'step' && K.step) {
      K.step.draw(g);
      if (K.idle > 4 && K.step.hint && !K.doneT) { var h = K.step.hint(((K.idle - 4) % 2.2) / 2.2); if (h) K.hand(g, h.x, h.y, h.press); }
      /* progress pips for the recipe */
      var n = K.R.rec.steps.length, pw = n * 5, px0 = Math.round(L.W / 2 - pw / 2), py = L.por ? 28 : 15;
      for (var i = 0; i < n; i++) { g.fillStyle = '#140c08'; g.fillRect(px0 + i * 5 - 1, py - 1, 5, 4); g.fillStyle = i < K.i ? '#ffcf6a' : i === K.i ? '#fff3dc' : '#5e3522'; g.fillRect(px0 + i * 5, py, 3, 2); }
      /* in-step progress bar */
      var bw = 40, bx = Math.round(L.W / 2 - bw / 2), by = py + 5, pp = C.clamp(K.step.p, 0, 1); g.fillStyle = '#140c08'; g.fillRect(bx - 1, by - 1, bw + 2, 4); g.fillStyle = '#43251a'; g.fillRect(bx, by, bw, 2); g.fillStyle = '#ffcf6a'; g.fillRect(bx, by, Math.round(bw * pp), 2);
    } else if (K.phase === 'reveal') drawReveal(g);
    drawSteam(g, dt);
    K.sparks.forEach(function (s) { g.fillStyle = s.a < .3 ? '#ffffff' : s.a < .6 ? '#ffe08a' : '#ffb347'; g.fillRect(Math.round(s.x), Math.round(s.y), 1, 1); if (s.a < .3) { g.fillRect(Math.round(s.x) - 1, Math.round(s.y), 1, 1); g.fillRect(Math.round(s.x) + 1, Math.round(s.y), 1, 1); } });
  };
  /* ---------- reveal: plate it ---------- */
  function drawReveal(g) {
    var L = K.L, t = K.revealT, n = K.R.main, e = C.ease ? C.ease(Math.min(1, t / .6)) : Math.min(1, t / .6);
    var pl = Wr.plate(L.por ? 120 : 140); var y = L.cy + 6 + Math.round((1 - e) * 20);
    /* table cloth (checked) */
    RM.glow(g, L.cx, y, 90, '#ffd38a', .35, 40);
    pl.pix.draw(g, L.cx - pl.pix.w / 2, y - pl.cy);
    var r = K.rectOf(n, 0, 0); K.drawObj(g, n, L.cx, y - Math.round(r.h * .35));
    if (t > .2 && Math.random() < .3) K.sparkle(L.cx + (Math.random() - .5) * 80, y - 30 - Math.random() * 30, 1);
    if (t > 1.2) { var a = Math.floor(t * 2) % 2; K.hand(g, L.cx + 50, y + 18, a); }
  }
  C.scenes.cook = {
    enter: function (arg) { if (arg && arg.id) K.begin(arg.id, arg.step); C.ui.refresh(); },
    update: function (dt) { K.update(dt); K._dt = dt; },
    draw: function (g) { K.draw(g, K._dt || 0); },
    down: function (m) { if (K.phase === 'reveal') { if (K.revealT > .8) K.finish(); return; } K.idle = 0; if (K.step && K.step.down && !K.doneT) K.step.down(m); },
    move: function (m, dx, dy) { if (K.step && K.step.move && !K.doneT && K.phase === 'step') K.step.move(m, dx, dy); },
    up: function (m) { if (K.step && K.step.up && K.phase === 'step') K.step.up(m); },
    key: function (e) { if (e.key === 'Escape') { K.leave(); C.go('kitchen'); } }
  };
  K.finish = function () { C.save.made(K.R.id); C.kitchen.newDish = K.R.id; C.kitchen.newT = 0; K.leave(); C.sfx('plate'); C.go('kitchen'); };
})();
