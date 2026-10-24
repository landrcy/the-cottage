/* The Cottage — hands-on steps, part 2: brush/baste, shake (seasoning), pour (tilt + stream), crack eggs, stir/whisk/mash/
   simmer, proof (rise under a cloth), roll-up, sear (tap to flip), pipe icing, and the wood oven (door, timer, bake, mitt). */
(function () {
  'use strict';
  var C = window.COT, A = C.art, P = C.P, R = C.ramp, F = C.food, D = C.dish, Wr = C.ware, RM = C.room, pal = A.pal, OUT = pal.out, ST = C.steps;
  function M() { return C.mouse; }
  function targetOf(K, k) { return k === 'roast' || !k ? K.R.main : k; }
  /* ================= brush / baste ================= */
  ST.brush = function (cfg, K) {
    var n = cfg.on || K.R.main, d = K.deco(n), S = { p: 0 }, r0 = K.rectOf(n, 0, 0), tot = 0;
    d.glaze = { w: r0.w, h: r0.h, a: new Float32Array(r0.w * r0.h), c: cfg.glaze };
    for (var y = 0; y < r0.h; y++) for (var x = 0; x < r0.w; x++) if (r0.o.surf(x, y)) tot++;
    function paint(px, py) { var r = K.rectOf(n, K.L.cx, K.L.cy), gz = d.glaze, any = 0; for (var dy = -4; dy <= 4; dy++) for (var dx = -5; dx <= 5; dx++) { if (dx * dx / 25 + dy * dy / 16 > 1) continue; var X = Math.round(px - r.x + dx), Y = Math.round(py - r.y + dy); if (X < 0 || Y < 0 || X >= gz.w || Y >= gz.h) continue; var i = Y * gz.w + X; if (gz.a[i] < 1) { gz.a[i] = Math.min(1, gz.a[i] + .34); any = 1; } } if (any) C.sfx('cloth', { vol: .45, jitter: .3 }); }
    function cov() { var gz = d.glaze, c = 0, r = K.rectOf(n, 0, 0); for (var y = 0; y < gz.h; y++) for (var x = 0; x < gz.w; x++) if (gz.a[y * gz.w + x] >= .6 && r.o.surf(x, y)) c++; return tot ? c / tot : 1; }
    var acc = 0; S.update = function (dt) { acc += dt; if (acc > .15) { acc = 0; S.p = Math.min(1, cov() / .8); } var r = K.rectOf(n, K.L.cx, K.L.cy); S.sparkAt = { x: r.x + r.w / 2, y: r.y + r.h / 2 }; C.region(r.x - 8, r.y - 8, r.w + 16, r.h + 16, 'brush', null); };
    S.draw = function (g) { var L = K.L; if (n === 'sheet') RM.glow(g, L.cx, L.cy, 62, '#f8f2e6', .8, 26); K.drawObj(g, n, L.cx, L.cy); if (cfg.after) K.steamAt(L.cx, L.cy - 14, 3, 1 / 60); var m = M(); if (m.inside || m.down) F.tools.brush.draw(g, m.x - 5, m.y - 20); };
    S.down = function (m) { paint(m.x, m.y); }; S.move = function (m) { if (m.down) paint(m.x, m.y); };
    S.hint = function (t) { var r = K.rectOf(n, K.L.cx, K.L.cy); return { x: r.x + r.w * (.2 + .6 * t), y: r.y + r.h * (.45 + .15 * Math.sin(t * 12)), press: 1 }; };
    S.skip = function () { d.glaze.a.fill(1); S.p = 1; };
    return S;
  };
  /* ================= shake seasoning ================= */
  ST.shake = function (cfg, K) {
    var n = targetOf(K, cfg.over), d = K.deco(n), S = { p: 0, n: 0, dir: 0, fall: [], x: 0, y: 0, tilt: 0 }, sp = F.sprite(cfg.src).skin;
    function shakeOnce() { S.n++; S.tilt = 1; C.sfx('shake', { jitter: .25 }); for (var i = 0; i < 9; i++) S.fall.push({ x: S.x + (Math.random() - .5) * 8, y: S.y + 4, vy: 20 + Math.random() * 30, vx: (Math.random() - .5) * 14 }); }
    S.update = function (dt) { var m = M(), L = K.L, r = K.rectOf(n, L.cx, L.cy); var tx = m.inside || m.down ? m.x : L.cx + Math.sin(C.t) * 10; S.x = C.damp(S.x || tx, C.clamp(tx, r.x, r.x + r.w), 20, dt); S.y = Math.min(r.y - 8, L.cy - 30); S.tilt = Math.max(0, S.tilt - dt * 5);
      for (var i = S.fall.length - 1; i >= 0; i--) { var f = S.fall[i]; f.vy += 160 * dt; f.x += f.vx * dt; f.y += f.vy * dt; var lx = Math.round(f.x - r.x), ly = Math.round(f.y - r.y); if (ly >= 0 && r.o.surf(lx, ly) && Math.random() < .25 + (f.y - S.y) / 120) { if (d.specks.length < 500) d.specks.push({ x: lx, y: ly, c: cfg.col }); S.fall.splice(i, 1); } else if (f.y > r.y + r.h + 4) S.fall.splice(i, 1); }
      S.p = Math.min(1, S.n / cfg.n); S.sparkAt = { x: r.x + r.w / 2, y: r.y + r.h / 2 }; C.region(0, K.L.top - 50, K.L.W, K.L.H, 'shake', null);
      if (S.p >= 1 && !S.fin) { S.fin = 1; var st = K.R[n]; if (st && st.cols) st.cols.push({ c: cfg.col, a: .06 }); } };
    S.draw = function (g) { var L = K.L; if (n === 'sheet') RM.glow(g, L.cx, L.cy, 62, '#f8f2e6', .8, 26); if (n === 'pot') K.drawStove(g, L.cx, L.cy + 14, K.R.pot.heat, C.t); K.drawObj(g, n, L.cx, L.cy); S.fall.forEach(function (f) { g.fillStyle = C.css(cfg.col); g.fillRect(Math.round(f.x), Math.round(f.y), 1, 1); });
      g.save(); g.translate(Math.round(S.x), Math.round(S.y)); g.rotate(Math.PI + (S.dir || 1) * S.tilt * .35); g.drawImage(sp.canvas(), -(sp.w >> 1), -sp.h + 2); g.restore(); };
    S.move = function (m, dx) { if (!m.down) return; var nd = dx > .4 ? 1 : dx < -.4 ? -1 : 0; if (nd && nd !== S.dir) { S.dir = nd; shakeOnce(); } };
    S.down = function () { shakeOnce(); };
    S.hint = function (t) { var r = K.rectOf(n, K.L.cx, K.L.cy); return { x: r.x + r.w / 2 + Math.sin(t * 6.283 * 2) * 14, y: Math.min(r.y - 8, K.L.cy - 30), press: 1 }; };
    S.skip = function () { while (S.n < cfg.n) shakeOnce(); S.update(0); };
    return S;
  };
  /* ================= pour (hold to tilt) ================= */
  var DRY = { flour: 1, sugar: 1, brown: 1, cocoa: 1, yeast: 1 };
  ST.pour = function (cfg, K) {
    var src = cfg.src, into = cfg.into, vessel = src === 'bowl' || src === 'pot', S = { p: 0, amt: 0, tilt: 0, stream: [], h: null }, need = cfg.amt || 1;
    var st = K.R[into], startLvl = st && st.lvl || 0, srcSt = vessel ? K.R[src] : null, srcLvl0 = srcSt ? srcSt.lvl : 0, colEntry = null;
    var col = cfg.col || (srcSt ? K.avgCol(srcSt.cols.length ? srcSt.cols : [{ c: P('#c08040'), a: 1 }]) : P('#ffffff'));
    if (into === 'pie' && K.R.rec.pie === 'pumpkin') col = P('#e07a22');
    if (src === 'bowl' && into === 'pie') col = K.R.rec.pie === 'apple' ? P('#d89a3a') : K.R.rec.pie === 'pecan' ? P('#4a200a') : col;
    function L() { return K.L; }
    function tgtPos() { var l = L(); return { x: l.cx + (vessel ? 18 : 0), y: l.cy + 4 }; }
    /* the source tips TOWARD the target: a jar sits up-right and turns counter-clockwise, a bowl/pot sits up-left and turns
       clockwise. Its pivot is placed so that the lip, at full tilt, hangs over the target; the stream starts at the lip. */
    var AMAX = vessel ? 1.25 : 1.9, DIR = vessel ? 1 : -1;
    function rot(x, y, a) { return { x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a) }; }
    function srcPix() { return vessel ? K.obj[src]().pix : F.sprite(src).skin; }
    function lipLocal() { var p = srcPix(); return vessel ? { x: p.w / 2 - 1, y: -p.h / 2 + 2 } : { x: -p.w / 2 + 2, y: -p.h / 2 + 1 }; }
    function srcPos() { var t = tgtPos(), r = K.rectOf(into, t.x, t.y), ll = lipLocal(), e = rot(ll.x, ll.y, DIR * AMAX), aimX = r.x + r.w * (vessel ? .38 : .62);
      return { x: Math.round(aimX - e.x), y: Math.round(r.y - (vessel ? 12 : 16) - e.y) }; }
    function lip() { var s = srcPos(), ll = lipLocal(), e = rot(ll.x, ll.y, DIR * S.tilt * AMAX); return { x: s.x + e.x, y: s.y + e.y }; }
    S.update = function (dt) { var m = M(), want = m.down ? 1 : 0; S.tilt = C.damp(S.tilt, want, 7, dt);
      var t = tgtPos(), r = K.rectOf(into, t.x, t.y), s = srcPos(), flowing = S.tilt > .6 && S.amt < need;
      if (flowing) { var rate = vessel ? .35 : .3 * Math.max(.4, need * 1.6), da = Math.min(need - S.amt, rate * dt * (S.tilt - .5) * 2); S.amt += da;
        if (into === 'pie') K.R.pie.fill = Math.min(1, S.amt / need); else if (st) { st.lvl = startLvl + (into === 'bowl' || into === 'pot' ? S.amt : S.amt / need * .85); if (!colEntry) { colEntry = { c: col, a: 0 }; if (!vessel) st.cols.push(colEntry); else st.cols = srcSt.cols.slice(); } if (!vessel) colEntry.a += da; st.mix = vessel ? 1 : Math.max(0, (st.mix || 0) - da * 1.5); if (vessel && srcSt.chunks && st.chunks && st.chunks.length < Math.round(srcSt.chunks.length * S.amt / need)) st.chunks.push({ x: (Math.random() - .5) * 1.2, y: (Math.random() - .5) * 1, c: srcSt.chunks[st.chunks.length % srcSt.chunks.length].c }); }
        if (srcSt) srcSt.lvl = Math.max(.08, srcLvl0 * (1 - S.amt / need));
        var lp = lip(), mx = lp.x, my = lp.y + 1; for (var i = 0; i < 3; i++) S.stream.push({ x: mx + (Math.random() - .5) * (DRY[src] ? 3 : 1.5), y: my, vy: 30 + Math.random() * 10, ty: r.y + r.h * (into === 'pie' ? .4 : .3) });
        if (!S.h) S.h = C.sfx(DRY[src] ? 'pourDry' : 'pour', { vol: vessel ? .7 : 1 }); if (vessel && Math.random() < dt * 3) C.sfx.any('squish', 3, { vol: .3 }); }
      else if (S.h) { S.h.stop(.12); S.h = null; }
      for (i = S.stream.length - 1; i >= 0; i--) { var f = S.stream[i]; f.vy += 300 * dt; f.y += f.vy * dt; if (f.y > f.ty) S.stream.splice(i, 1); }
      S.p = Math.min(1, S.amt / need); S.sparkAt = { x: r.x + r.w / 2, y: r.y + r.h / 2 }; C.region(0, K.L.top - 60, K.L.W, K.L.H, 'pour', null);
      if (S.p >= 1 && S.h) { S.h.stop(.2); S.h = null; } };
    S.draw = function (g) { var l = L(), t = tgtPos(); if (into === 'pot') K.drawStove(g, t.x, t.y + 14, K.R.pot.heat, C.t); if (into === 'mug' || into === 'stewbowl') K.steamAt(t.x, t.y - 10, 2, 1 / 60);
      K.drawObj(g, into, t.x, t.y); var s = srcPos();
      S.stream.forEach(function (f) { g.fillStyle = C.css(col); g.fillRect(Math.round(f.x), Math.round(f.y), DRY[src] ? 1 : 2, 2); });
      var ang = Math.round(DIR * S.tilt * AMAX * 16) / 16, sp = srcPix(); g.save(); g.translate(s.x, s.y); g.rotate(ang); g.drawImage(sp.canvas(), -Math.round(sp.w / 2), -Math.round(sp.h / 2)); g.restore(); };
    S.up = function () { };
    S.hint = function (t) { var s = srcPos(); return { x: s.x, y: s.y, press: t > .2 }; };
    S.skip = function () { S.amt = need; if (into === 'pie') K.R.pie.fill = 1; else if (st) { st.lvl = startLvl + (into === 'bowl' || into === 'pot' ? need : .85); if (vessel) { st.cols = srcSt.cols.slice(); st.mix = 1; if (srcSt.chunks && st.chunks) st.chunks = srcSt.chunks.slice(); } else st.cols.push({ c: col, a: need }); } };
    S.leave = function () { if (S.h) S.h.stop(); };
    return S;
  };
  /* ================= crack eggs ================= */
  var EGG = null;
  ST.crack = function (cfg, K) {
    var S = { p: 0, n: 0, stage: 0, anim: 0, drip: [] }; EGG = EGG || F.sprite('egg', 16).skin;
    function bowlR() { return K.rectOf('bowl', K.L.cx, K.L.cy + 6); }
    S.update = function (dt) { S.anim = Math.max(0, S.anim - dt * 4); for (var i = S.drip.length - 1; i >= 0; i--) { var d = S.drip[i]; d.vy += 200 * dt; d.y += d.vy * dt; if (d.y > d.ty) { S.drip.splice(i, 1); } } S.p = Math.min(1, S.n / cfg.n); var r = bowlR(); S.sparkAt = { x: r.x + r.w / 2, y: r.y + 8 }; C.region(0, K.L.top - 60, K.L.W, K.L.H, 'crack', null); };
    S.draw = function (g) { var L = K.L, r = bowlR(); K.drawObj(g, 'bowl', L.cx, L.cy + 6); S.drip.forEach(function (d) { g.fillStyle = d.c; g.fillRect(Math.round(d.x), Math.round(d.y), d.w, 2); });
      if (S.n < cfg.n) { var ex = r.x + r.w / 2 - 8, ey = r.y - 18 + (S.anim > 0 ? Math.round(S.anim * 4) : 0); if (S.stage === 0) { EGG.draw(g, ex, ey); } else if (S.stage === 1) { EGG.draw(g, ex, ey); g.fillStyle = '#5a3a20'; for (var k = 0; k < 8; k++) g.fillRect(ex + 4 + k, ey + 10 + (k % 2), 1, 1); } }
      for (var i = 0; i < cfg.n - S.n - 1; i++) EGG.draw(g, r.x + r.w + 4 + i * 12, r.y + r.h - 18); };
    S.down = function () { if (S.n >= cfg.n) return; var r = bowlR(); if (S.stage === 0) { S.stage = 1; S.anim = 1; C.sfx('clink1', { jitter: .2 }); C.sfx.any('crunch', 2, { vol: .4, rate: 1.4 }); }
      else { S.stage = 0; S.n++; C.sfx('plop'); for (var i = 0; i < 8; i++) S.drip.push({ x: r.x + r.w / 2 - 2 + Math.random() * 3, y: r.y - 6 - i * 2, vy: 0, ty: r.y + 8, c: i < 3 ? '#f8b828' : '#f4ecd8', w: i < 3 ? 3 : 2 }); var b = K.R.bowl; b.cols.push({ c: P('#f8c838'), a: .12 }); b.lvl += .1; b.mix = Math.max(0, b.mix - .3); } };
    S.hint = function (t) { var r = bowlR(); return { x: r.x + r.w / 2, y: r.y - 10, press: t > .5 }; };
    S.skip = function () { while (S.n < cfg.n) { S.stage = 1; S.down(); } };
    return S;
  };
  /* ================= stir / whisk / mash / simmer ================= */
  ST.stir = function (cfg, K) {
    var n = cfg.in, st = K.R[n], S = { p: 0, acc: 0, ang: null, bub: [] }, need = cfg.turns * Math.PI * 2, chunks0 = (st.chunks || []).length;
    if (cfg.heat) st.heat = 1;
    function ctr() { var r = K.rectOf(n, K.L.cx, K.L.cy), v = K.obj[n]().v; return { x: r.x + v.cx, y: r.y + v.cy + 2, rx: v.irx, ry: v.iry, r: r }; }
    S.update = function (dt) { var c = ctr(), m = M(); if (m.down) { var a = Math.atan2((m.y - c.y) / c.ry, (m.x - c.x) / c.rx); if (S.ang != null) { var da = a - S.ang; if (da > Math.PI) da -= 2 * Math.PI; if (da < -Math.PI) da += 2 * Math.PI; if (Math.abs(da) < 1.2) { S.acc += Math.abs(da); if (Math.abs(da) > .02) C.sfx.loop('stir', .9); } } S.ang = a; } else S.ang = null;
      S.p = Math.min(1, S.acc / need); st.mix = Math.max(st.mix || 0, S.p);
      if (cfg.mash && st.chunks) st.chunks.length = Math.round(chunks0 * (1 - S.p));
      if (cfg.heat) { C.sfx.loop('simmer', .8); if (Math.random() < dt * 8) S.bub.push({ x: (Math.random() - .5) * 1.4, y: (Math.random() - .5) * 1.0, a: 0 }); K.steamAt(c.x, c.y - 6, 3, dt); }
      for (var i = S.bub.length - 1; i >= 0; i--) { S.bub[i].a += dt; if (S.bub[i].a > .6) S.bub.splice(i, 1); }
      if (S.p >= 1 && !S.fin) { S.fin = 1; K.deco(n).specks = []; st.cols = [{ c: K.avgCol(st.cols), a: 1 }]; st.mix = 1; if (cfg.dough) { st.doughBall = 1; st.doughCol = cfg.doughCol || 1; st.lvl = Math.max(.3, st.lvl * .7); } }
      S.sparkAt = { x: c.x, y: c.y }; C.region(c.r.x, c.r.y - 20, c.r.w, c.r.h + 20, 'stir', null); };
    S.draw = function (g) { var L = K.L; if (n === 'pot') K.drawStove(g, L.cx, L.cy + 14, st.heat, C.t); K.drawObj(g, n, L.cx, L.cy); var c = ctr();
      S.bub.forEach(function (b) { var x = Math.round(c.x + b.x * c.rx * .7), y = Math.round(c.y + b.y * c.ry * .6); g.fillStyle = b.a < .4 ? '#fff6e8' : 'rgba(255,246,232,.5)'; g.fillRect(x, y, 1, 1); if (b.a > .3) { g.fillRect(x - 1, y, 1, 1); g.fillRect(x + 1, y, 1, 1); } });
      var m = M(), sx, sy; if (m.down || m.inside) { var dx = (m.x - c.x) / c.rx, dy = (m.y - c.y) / c.ry, d = Math.hypot(dx, dy); if (d > .85) { dx *= .85 / d; dy *= .85 / d; } sx = c.x + dx * c.rx; sy = c.y + dy * c.ry; } else { sx = c.x + Math.cos(C.t) * c.rx * .5; sy = c.y + Math.sin(C.t) * c.ry * .5; }
      var sp = cfg.mash ? F.tools.spoon : F.tools.spoon; g.drawImage(sp.canvas(), Math.round(sx - 5), Math.round(sy - 27)); };
    S.hint = function (t) { var c = ctr(), a = t * 6.283; return { x: c.x + Math.cos(a) * c.rx * .55, y: c.y + Math.sin(a) * c.ry * .5, press: 1 }; };
    S.skip = function () { S.acc = need; S.update(0); };
    return S;
  };
  /* ================= proof (rise under a cloth) ================= */
  ST.proof = function (cfg, K) {
    var S = { p: 0, cov: 0, t: 0, lift: 0 }, b = K.R.bowl;
    S.update = function (dt) { if (S.cov) { S.t += dt; S.p = Math.min(1, S.t / 3.6); } if (S.p >= 1 && !S.fin) { S.fin = 1; C.sfx('cloth2'); K.R.loaf.rise = .6; } C.region(0, K.L.top - 40, K.L.W, K.L.H, 'proof', null); S.sparkAt = { x: K.L.cx, y: K.L.cy - 6 }; };
    S.draw = function (g) { var L = K.L, r = K.rectOf('bowl', L.cx, L.cy); K.drawObj(g, 'bowl', L.cx, L.cy); var v = Wr.bowl(), rise = S.p;
      var blob = D.doughBlob(-.1 - rise * .2, 1, 15 + Math.round(rise * 7)); if (S.cov) blob.draw(g, r.x + v.cx - blob.w / 2, r.y + v.cy - blob.h / 2 - 2 - rise * 6);
      if (S.cov && !S.fin) { /* checked tea towel draped over */ var cy = r.y + v.cy - 6 - rise * 10; RM.rect(g, r.x + 2, Math.round(cy), r.w - 4, 12, function (x, y, xx, yy) { var drop = Math.abs(xx - (r.w - 4) / 2) / ((r.w - 4) / 2); if (yy > 11 - drop * 4 + Math.sin(xx * .5) * 1) return 0; var ch = ((xx >> 2) + (yy >> 2)) % 2, line = (xx % 8 === 3) || (yy % 8 === 3); return line ? P('#a8302a') : ch ? P('#f4ead8') : P('#e2d4bc'); });
        /* tiny clock for time passing */ var cx = r.x + r.w + 10, ccy = r.y; C.title.ellipseFill(g, cx, ccy, 6, 6, function (x, y, d) { return d > .7 ? '#5e3522' : '#fff3dc'; }); var a = S.t * 6; for (var i = 0; i < 5; i++) { g.fillStyle = '#2a160d'; g.fillRect(Math.round(cx + Math.sin(a) * i), Math.round(ccy - Math.cos(a) * i), 1, 1); } if (Math.floor(S.t * 4) !== S.tk) { S.tk = Math.floor(S.t * 4); C.sfx('tick', { vol: .6 }); } }
      if (!S.cov) { var m = M(); RM.rect(g, L.W - 50, L.cy - 30, 36, 10, function (x, y, xx, yy) { var ch = ((xx >> 2) + (yy >> 2)) % 2, line = xx % 8 === 3 || yy % 8 === 3; return line ? P('#a8302a') : ch ? P('#f4ead8') : P('#e2d4bc'); }); } };
    S.down = function () { if (!S.cov) { S.cov = 1; C.sfx('cloth'); } };
    S.hint = function (t) { return S.cov ? null : { x: K.L.cx, y: K.L.cy - 4, press: t > .5 }; };
    S.skip = function () { S.cov = 1; S.t = 9; S.p = 1; K.R.loaf.rise = .6; S.fin = 1; };
    return S;
  };
  /* ================= roll up the sheet into a log ================= */
  ST.rollup = function (cfg, K) {
    var S = { p: 0, y0: null };
    S.update = function () { S.sparkAt = { x: K.L.cx, y: K.L.cy }; C.region(0, K.L.top - 20, K.L.W, K.L.H, 'rollup', null); };
    S.draw = function (g) { var L = K.L, r = K.rectOf('sheet', L.cx, L.cy), cut = Math.round(r.h * (1 - S.p * .85)); RM.glow(g, L.cx, L.cy, 62, '#f8f2e6', .8, 26);
      g.save(); g.beginPath(); g.rect(r.x, r.y, r.w, cut); g.clip(); K.drawObj(g, 'sheet', L.cx, L.cy); g.restore();
      var th = 4 + Math.round(S.p * 10); RM.rect(g, r.x + 2, r.y + cut - th + 2, r.w - 4, th, function (x, y, xx, yy) { if ((xx === 0 || xx === r.w - 5) && (yy === 0 || yy === th - 1)) return 0; if (yy === 0 || yy === th - 1 || xx === 0 || xx === r.w - 5) return OUT; var spiral = (xx < 3 || xx > r.w - 8) && ((yy + (xx < 3 ? 0 : 1)) % 3 === 0); return spiral ? P('#6a2a10') : D.pastry(.85 - yy / th * .6, 0, x, y); });
      var m = M(); if (m.inside || m.down) K.hand(g, m.x - 4, m.y - 2, m.down); };
    S.down = function (m) { S.y0 = m.y; };
    S.move = function (m, dx, dy) { if (!m.down) return; var d = Math.abs(dy) + Math.abs(dx) * .3; var was = S.p; S.p = Math.min(1, S.p + d / 110); if (Math.floor(S.p * 8) !== Math.floor(was * 8)) C.sfx.any('squish', 3, { vol: .5, jitter: .2 }); };
    S.hint = function (t) { var r = K.rectOf('sheet', K.L.cx, K.L.cy); return { x: K.L.cx, y: r.y + r.h - t * r.h * .8, press: 1 }; };
    S.skip = function () { S.p = 1; };
    return S;
  };
  /* ================= sear beef (tap to flip) ================= */
  ST.sear = function (cfg, K) {
    var S = { p: 0, pcs: [] }, n = Math.max(4, Math.min(6, (K.R.pan && K.R.pan.pieces) || 5)), rnd = C.rng(4);
    for (var i = 0; i < n; i++) S.pcs.push({ x: -20 + (i % 3) * 18 + rnd() * 4, y: -4 + Math.floor(i / 3) * 9, top: 0, bot: 0, hop: 0, sz: 9 + Math.round(rnd() * 3) });
    var RAW = R(['#5a1a1a', '#8a2a2a', '#b8484a', '#d87070']), BR = R(['#2a1006', '#4a200c', '#6a3414', '#8a4a20']);
    function cube(pc, side) { var key = 'cube' + pc.sz + Math.round(side * 6); return Wr.memo(key, function () { return A.dome(pc.sz + 2, pc.sz, A.rrect(0, 0, pc.sz + 2, pc.sz, 3), { ramp: RAW, outline: OUT, R: 3, col: function (x, y, v) { return C.bayer(x, y) < side ? C.rp(BR, v + (C.hash(x, y, 2) - .5) * .3, x, y) : 0; } }); }); }
    function ctr() { var L = K.L; return { x: L.cx - 10, y: L.cy }; }
    S.update = function (dt) { var c = ctr(); C.sfx.loop('fry', .9); var tot = 0; S.pcs.forEach(function (pc, i) { pc.bot = Math.min(1, pc.bot + dt * .45); pc.hop = Math.max(0, pc.hop - dt * 4); tot += Math.min(pc.top, pc.bot) >= .9 ? 1 : (Math.min(pc.top, pc.bot)) * .8; C.region(c.x + pc.x - 2, c.y + pc.y - 2, pc.sz + 6, pc.sz + 4, 'pc' + i, null); if (Math.random() < dt * 2) K.steamAt(c.x + pc.x + 5, c.y + pc.y - 2, 60, dt); });
      S.p = Math.min(1, tot / S.pcs.length); S.sparkAt = c; if (S.p >= 1 && !S.fin) { S.fin = 1; for (var i = 0; i < 6; i++) K.R.pot.chunks.push({ x: (Math.random() - .5) * 1.3, y: (Math.random() - .5) * 1.1, c: P('#5a2a10') }); K.R.pot.lvl = Math.max(K.R.pot.lvl, .3); if (!K.R.pot.cols.length) K.R.pot.cols.push({ c: P('#6a3010'), a: .4 }); } };
    S.draw = function (g) { var c = ctr(), L = K.L; K.drawStove(g, L.cx, L.cy + 14, 1, C.t); var pan = Wr.pan(); pan.pix.draw(g, c.x - pan.cx, c.y - pan.cy + 4);
      S.pcs.forEach(function (pc) { var cb = cube(pc, pc.top); cb.draw(g, c.x + pc.x, c.y + pc.y - Math.round(Math.sin(pc.hop * Math.PI) * 6)); if (pc.bot > .85 && pc.top < .9 && Math.floor(C.t * 3) % 2) { g.fillStyle = '#fff6c8'; g.fillRect(c.x + pc.x + (pc.sz >> 1), c.y + pc.y - 3, 1, 1); } });
      if (Math.random() < .5) { g.fillStyle = '#fff2c0'; g.fillRect(Math.round(c.x - 22 + Math.random() * 50), Math.round(c.y - 4 + Math.random() * 14), 1, 1); } };
    S.down = function (m) { var h = C.hit(m.x, m.y); if (!h || h.id.indexOf('pc') !== 0) return; var pc = S.pcs[+h.id.slice(2)]; var t = pc.top; pc.top = pc.bot; pc.bot = t; pc.hop = 1; C.sfx('sizzle', { jitter: .2 }); C.sfx.any('squish', 3, { vol: .3 }); };
    S.hint = function (t) { var c = ctr(), pc = S.pcs.filter(function (p) { return p.bot > .85 && p.top < .9; })[0] || S.pcs[0]; return { x: c.x + pc.x + 4, y: c.y + pc.y + 2, press: t > .5 }; };
    S.skip = function () { S.pcs.forEach(function (pc) { pc.top = pc.bot = 1; }); S.update(0); };
    return S;
  };
  /* ================= pipe icing ================= */
  ST.pipe = function (cfg, K) {
    var n = K.R.main, d = K.deco(n), S = { p: 0, last: null }, set = {}, need = n === 'rolls' ? 160 : 90;
    function add(x, y) { var r = K.rectOf(n, K.L.cx, K.L.cy), X = Math.round(x - r.x), Y = Math.round(y - r.y); var w = n === 'rolls' ? 1 : 0; for (var dy = 0; dy <= w; dy++) for (var dx = 0; dx <= w; dx++) { var k = (X + dx) + ',' + (Y + dy); if (!set[k] && r.o.surf(X + dx, Y + dy)) { set[k] = 1; d.icing.push([X + dx, Y + dy]); C.sfx('squish4', { vol: .25, gap: .12, rate: 1.4 }); } } }
    function line(a, b) { var n2 = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y)); for (var k = 0; k <= n2; k++) add(a.x + (b.x - a.x) * k / n2, a.y + (b.y - a.y) * k / n2); }
    S.update = function () { S.p = Math.min(1, d.icing.length / need); var r = K.rectOf(n, K.L.cx, K.L.cy); S.sparkAt = { x: r.x + r.w / 2, y: r.y + r.h / 2 }; C.region(r.x - 8, r.y - 20, r.w + 16, r.h + 28, 'pipe', null); };
    S.draw = function (g) { var L = K.L; K.drawObj(g, n, L.cx, L.cy); K.steamAt(L.cx, L.cy - 14, 1, 1 / 60); var m = M(); if (m.inside || m.down) F.tools.bag.draw(g, m.x - 8, m.y - 22); };
    S.down = function (m) { S.last = { x: m.x, y: m.y }; add(m.x, m.y); };
    S.move = function (m) { if (!m.down || !S.last) return; line(S.last, m); S.last = { x: m.x, y: m.y }; };
    S.up = function () { S.last = null; };
    S.hint = function (t) { var r = K.rectOf(n, K.L.cx, K.L.cy); return { x: r.x + r.w * (.15 + .7 * t), y: r.y + r.h * .45 + Math.sin(t * 30) * 4, press: 1 }; };
    S.skip = function () { var r = K.rectOf(n, 0, 0); for (var y = 0; y < r.h && d.icing.length < need; y += 3) for (var x = 0; x < r.w && d.icing.length < need; x++) if (r.o.surf(x, y) && Math.sin(x * .7 + y) > .3) { d.icing.push([x, y]); } S.p = 1; };
    return S;
  };
  /* ================= the wood oven ================= */
  var BRICK = R(['#3a120a', '#5e2214', '#83351e', '#a54a2a', '#c4683e']);
  ST.oven = function (cfg, K) {
    var n = K.R.main, st = K.R[n], S = { p: 0, ph: 0, door: 0, doorT: 0, dish: 0, wind: 0, bake: 0, t: 0, drag: 0, out: 0, steamT: 0 };
    var PH = ['open', 'load', 'timer', 'bake', 'ding', 'out'];
    function lay() { var L = K.L, ow = Math.min(140, L.W - 40), oh = L.por ? 96 : 92, ox = Math.round(L.cx - ow / 2 - (L.por ? 0 : 24)), oy = L.por ? Math.round(L.top - oh + 30) : Math.round(L.top - oh + 26);
      var mouth = { x: ox + 18, y: oy + 26, w: ow - 36, h: oh - 38 }, timer = L.por ? { x: L.W - 30, y: L.H - 60 } : { x: ox + ow + 34, y: L.cy + 8 }, dishAt = L.por ? { x: L.cx, y: L.H - 70 } : { x: L.cx - 24, y: L.cy + 30 };
      return { ox: ox, oy: oy, ow: ow, oh: oh, mouth: mouth, timer: timer, dishAt: dishAt }; }
    var fireL = null;
    function setPh(i) { S.ph = i; S.t = 0; }
    S.update = function (dt) { var O = lay(), m = M(); S.t += dt; S.doorT = C.damp(S.doorT, S.door, 8, dt); C.sfx.loop('fire', .7);
      var ph = PH[S.ph];
      if (ph === 'open') C.region(O.mouth.x, O.mouth.y, O.mouth.w, O.mouth.h, 'door', { t: 'oven door', d: 'Open it.' });
      if (ph === 'load') { C.region(O.dishAt.x - 45, O.dishAt.y - 30, 90, 50, 'dish', null); C.region(O.mouth.x, O.mouth.y, O.mouth.w, O.mouth.h, 'door', null); if (S.drag) { S.dish = C.clamp(1 - (m.y - O.mouth.y - O.mouth.h / 2) / (O.dishAt.y - O.mouth.y - O.mouth.h / 2), 0, 1); } else S.dish = C.damp(S.dish, S.dish > .55 ? 1 : 0, 10, dt); if (S.dish > .97 && !S.drag) { S.dish = 1; S.door = 0; C.sfx('wood'); setTimeout(function () { C.sfx('latch'); }, 250); setPh(2); } }
      if (ph === 'timer') { C.region(O.timer.x - 14, O.timer.y - 14, 28, 28, 'timer', { t: 'timer', d: 'Wind it round.' }); if (S.wind >= 1) { setPh(3); C.sfx('click'); } }
      if (ph === 'bake') { var dur = 4.5; S.bake = Math.min(1, S.t / dur); S.wind = 1 - S.bake; st.bake = S.bake; var dg = K.R.deco[n]; if (dg && dg.glaze) { if (dg.glaze.c0 == null) dg.glaze.c0 = dg.glaze.c; dg.glaze.c = C.mix(dg.glaze.c0, P('#8a4414'), Math.min(1, S.bake * 1.3) * .9); } if (n === 'loaf') st.rise = .6 + .4 * Math.min(1, S.bake * 1.6); if (Math.floor(S.t * 4) !== S.tk) { S.tk = Math.floor(S.t * 4); C.sfx('tick', { vol: .7 }); } if (Math.random() < dt * 6) K.steamAt(O.ox + O.ow - 20, O.oy - 4, 30, dt); if (S.bake >= 1) { setPh(4); C.sfx('ding'); C.sfx('bell', { vol: .6 }); } }
      if (ph === 'ding') { if (S.t > .8) { S.door = 1; C.sfx('creak2'); setPh(5); } }
      if (ph === 'out') { C.region(O.mouth.x, O.mouth.y, O.mouth.w, O.mouth.h + 50, 'dish', null); if (S.drag) S.dish = C.clamp(1 - (m.y - O.mouth.y - O.mouth.h / 2) / (O.dishAt.y - O.mouth.y - O.mouth.h / 2), 0, 1); else S.dish = C.damp(S.dish, S.dish < .45 ? 0 : 1, 10, dt); if (S.dish < .03 && !S.drag && !S.fin) { S.fin = 1; S.dish = 0; C.sfx('thump'); C.sfx('hiss', { vol: .6 }); for (var i = 0; i < 12; i++) K.steamAt(O.dishAt.x, O.dishAt.y - 10, 600, dt); } if (S.fin) { K.steamAt(O.dishAt.x, O.dishAt.y - 10, 6, dt); S.out += dt; } }
      S.p = S.fin ? Math.min(1, .9 + S.out * .2) : Math.min(.9, (S.ph + (ph === 'bake' ? S.bake : 0)) / 6);
      S.sparkAt = { x: O.dishAt.x, y: O.dishAt.y - 10 };
    };
    S.draw = function (g) { var O = lay(), L = K.L, t = C.t;
      /* brick oven built into the wall */
      RM.rect(g, O.ox, O.oy, O.ow, O.oh, function (x, y, xx, yy) { var row = Math.floor(yy / 5), off = (row % 2) * 6, mort = yy % 5 === 4 || (xx + off) % 12 === 11; var arch = Math.pow((xx - O.ow / 2) / (O.ow / 2), 2) + Math.pow((yy - 22) / 22, 2) > 1 && yy < 22; if (arch) return 0; return C.rp(BRICK, mort ? .05 : .5 + (C.hash(Math.floor((xx + off) / 12), row, 3) - .5) * .5 - yy / O.oh * .2, x, y); });
      RM.rect(g, O.ox - 4, O.oy + O.oh - 4, O.ow + 8, 6, function (x, y, xx, yy) { return C.rp(pal.stone, yy === 0 ? .9 : .5 - yy * .06, x, y); });
      /* chimney flue */ RM.rect(g, O.ox + O.ow - 26, O.oy - 30, 14, 32, function (x, y, xx) { return C.rp(BRICK, xx === 0 ? .15 : .45, x, y); });
      var mo = O.mouth; RM.rect(g, mo.x, mo.y, mo.w, mo.h, function (x, y, xx, yy) { var a = yy < 12 && Math.pow((xx - mo.w / 2) / (mo.w / 2), 2) + Math.pow((12 - yy) / 12, 2) > 1; if (a) return 0; return C.rp(R(['#0a0504', '#160a06', '#24120a']), .3 + yy / mo.h * .4, x, y); });
      fireL = fireL || {}; fireL.box = { x: mo.x + 6, y: mo.y + 4, w: mo.w - 12, h: mo.h - 10 }; g.save(); g.beginPath(); g.rect(mo.x, mo.y, mo.w, mo.h); g.clip(); RM.fire(g, fireL, t, .2);
      RM.glow(g, mo.x + mo.w / 2, mo.y + mo.h - 6, mo.w / 2 + 10, '#ffb347', .5 + .1 * Math.sin(t * 8), 20); g.restore();
      /* the dish: on the counter (dish=0) or inside the oven mouth (dish=1) */
      var ph = PH[S.ph], e = C.ease(S.dish), dx = C.lerp(O.dishAt.x, mo.x + mo.w / 2, e), dy = C.lerp(O.dishAt.y, mo.y + mo.h - 14, e);
      var inside = S.dish > .5; if (inside) { g.save(); g.beginPath(); g.rect(mo.x, mo.y, mo.w, mo.h); g.clip(); K.drawObj(g, n, dx, dy); g.restore(); }
      /* iron door (swings down) */
      var dh = Math.round((1 - S.doorT) * mo.h); if (dh > 1) { RM.rect(g, mo.x - 2, mo.y + mo.h - dh, mo.w + 4, dh, function (x, y, xx, yy) { var e2 = xx === 0 || yy === 0 || xx === mo.w + 3 || yy === dh - 1; if (e2) return OUT; var bar = xx % 9 === 4 && yy > 3 && yy < dh - 4 && yy < mo.h - 4; var win = yy > 3 && yy < dh - 4 && xx > 4 && xx < mo.w - 1 && !bar && yy > dh * .25 && yy < dh * .7; if (win) return 0; return C.rp(pal.metal, bar ? .7 : .25 + (yy === 1 ? .4 : 0) + (C.hash(x, y, 2) - .5) * .1, x, y); });
        RM.rect(g, mo.x + mo.w / 2 - 6, mo.y + mo.h - dh + 2, 12, 3, function (x, y, xx, yy) { return C.rp(pal.copper, yy ? .4 : .9, x, y); }); }
      if (!inside) K.drawObj(g, n, dx, dy);
      if (ph === 'out' && S.dish > 0 || ph === 'out' && !S.fin) { F.tools.mitt.draw(g, dx + 30, dy - 18); }
      /* wind-up kitchen timer */
      var tm = O.timer; C.title.ellipseFill(g, tm.x, tm.y, 12, 11, function (x, y, d) { return d > .8 ? '#5a1010' : C.css(C.rp(R(['#7a1a14', '#a8302a', '#d0503c', '#ec7a62']), .9 - d * .5 - (y - tm.y) / 30, x, y)); }); C.title.ellipseFill(g, tm.x, tm.y - 1, 8, 7, function (x, y, d) { return d > .85 ? '#c8b8a0' : '#fff6e4'; });
      for (var k = 0; k < 12; k++) { var a = k / 12 * 6.283; RM.px(g, Math.round(tm.x + Math.sin(a) * 6), Math.round(tm.y - 1 - Math.cos(a) * 5), '#8a6a4a'); }
      var wa = S.wind * 6.283 * .9; for (k = 0; k < 6; k++) RM.px(g, Math.round(tm.x + Math.sin(wa) * k), Math.round(tm.y - 1 - Math.cos(wa) * k * .85), '#2a160d'); RM.rect(g, tm.x - 2, tm.y - 14, 5, 3, function (x, y, xx, yy) { return C.rp(pal.metal, yy ? .4 : .9, x, y); });
      if (ph === 'ding' && Math.floor(t * 12) % 2) { RM.px(g, tm.x - 8, tm.y - 14, '#fff6c8'); RM.px(g, tm.x + 9, tm.y - 13, '#fff6c8'); }
    };
    S.down = function (m) { var O = lay(), ph = PH[S.ph], h = C.hit(m.x, m.y);
      if (ph === 'open' && h && h.id === 'door') { S.door = 1; C.sfx('creak'); setPh(1); }
      else if ((ph === 'load' || ph === 'out') && h && (h.id === 'dish' || h.id === 'door')) { S.drag = 1; S.downAt = { x: m.x, y: m.y, t: performance.now() }; C.sfx('grab', { vol: .5 }); }
      else if (ph === 'timer') { S.wang = Math.atan2(m.y - O.timer.y, m.x - O.timer.x); if (h && h.id === 'timer') { S.wind = Math.min(1, S.wind + .25); C.sfx('tick'); } }
    };
    S.move = function (m) { var O = lay(), ph = PH[S.ph]; if (ph === 'timer' && m.down && S.wang != null) { var a = Math.atan2(m.y - O.timer.y, m.x - O.timer.x), da = a - S.wang; if (da > Math.PI) da -= 6.283; if (da < -Math.PI) da += 6.283; if (Math.abs(da) < 1) { var was = S.wind; S.wind = C.clamp(S.wind + Math.abs(da) / (6.283 * .8), 0, 1); if (Math.floor(S.wind * 16) !== Math.floor(was * 16)) C.sfx('tick', { gap: .05 }); } S.wang = a; } };
    S.up = function (m) { var ph = PH[S.ph]; if (S.drag) { S.drag = 0; var tap = S.downAt && Math.hypot(m.x - S.downAt.x, m.y - S.downAt.y) < 4; if (tap) S.dish = ph === 'load' ? .99 : .01; } S.wang = null; };
    S.hint = function (t) { var O = lay(), ph = PH[S.ph], mo = O.mouth; if (ph === 'open') return { x: mo.x + mo.w / 2, y: mo.y + mo.h - 6, press: t > .5 }; if (ph === 'load') return { x: O.dishAt.x, y: C.lerp(O.dishAt.y, mo.y + mo.h / 2, t), press: 1 }; if (ph === 'timer') { var a = t * 6.283; return { x: O.timer.x + Math.cos(a) * 9, y: O.timer.y + Math.sin(a) * 9, press: 1 }; } if (ph === 'out') return { x: mo.x + mo.w / 2, y: C.lerp(mo.y + mo.h / 2, O.dishAt.y, t), press: 1 }; return null; };
    S.skip = function () { st.bake = 1; if (n === 'loaf') st.rise = 1; var dg = K.R.deco[n]; if (dg && dg.glaze) { if (dg.glaze.c0 == null) dg.glaze.c0 = dg.glaze.c; dg.glaze.c = C.mix(dg.glaze.c0, P('#8a4414'), .9); } S.fin = 1; S.ph = 5; S.dish = 0; S.door = 1; S.out = 9; S.p = 1; };
    S.phase = function () { return PH[S.ph]; }; S.lay = lay;
    return S;
  };
})();
