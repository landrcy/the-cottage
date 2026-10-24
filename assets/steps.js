/* The Cottage — hands-on steps, part 1: gather (pantry + icebox), peel, cut (pixel pieces split along your swipe),
   score, knead, roll, crimp, lattice, place, stamp. Each step: {update, draw, down, move, up, p (0..1), hint(t)}. */
(function () {
  'use strict';
  var C = window.COT, A = C.art, P = C.P, R = C.ramp, F = C.food, D = C.dish, Wr = C.ware, RM = C.room, pal = A.pal, OUT = pal.out;
  var ST = C.steps = {};
  function M() { return C.mouse; }
  function inR(r, x, y, pad) { pad = pad || 0; return x >= r.x - pad && y >= r.y - pad && x < r.x + r.w + pad && y < r.y + r.h + pad; }
  ST.inR = inR;
  function sndOf(id) { var s = (F.ing[id] || {}).snd; if (s === 'crunch') C.sfx.any('crunch', 2); else if (s === 'slice') C.sfx.any('slice', 2); else C.sfx.any('chop', 3, { jitter: .15 }); }
  /* wicker basket */
  var BASKET = A.dome(56, 26, A.or(A.and(A.ell(28, 6, 27, 22), function (x, y) { return y >= 6; }), A.ell(28, 6, 27, 5)), { ramp: R(['#3a220e', '#6a4420', '#9a6a34', '#c4924a', '#e0b46a']), outline: OUT, R: 4, tex: function (x, y) { return ((x + (y >> 1) * 2) % 4 < 2 ? .6 : -.6) + (y % 3 === 0 ? -.8 : 0); }, col: function (x, y) { var dx = (x + .5 - 28) / 24, dy = (y + .5 - 6) / 3.6; return dx * dx + dy * dy < 1 ? P('#2a1608') : 0; } });
  var COLD = { butter: 1, milk: 1, cream: 1, egg: 1, beef: 1, turkey: 1, ham: 1 };
  /* ================= gather ================= */
  ST.gather = function (cfg, K) {
    var rec = K.R.rec, need = rec.ing.slice(), got = {}, S = { p: 0, fly: [], wob: {}, ice: 0, iceT: 0, t: 0 };
    var pantry = F.list.filter(function (id) { return !COLD[id] && id !== 'dough'; }), cold = F.list.filter(function (id) { return COLD[id]; });
    function layout() {
      var L = K.L, W = L.W, H = L.H, items = [];
      var pa = L.por ? { x: 6, y: 40, w: W - 12, h: Math.round(H * .5) } : { x: 6, y: 26, w: Math.round(W * .62), h: H - 70 };
      var ib = L.por ? { x: Math.round(W / 2 - 56), y: pa.y + pa.h + 6, w: 112, h: Math.round(H * .26) } : { x: pa.x + pa.w + 8, y: 26, w: W - pa.w - 26, h: H - 70 };
      var nS = L.por ? 5 : 4, sh = Math.floor(pa.h / nS), x = pa.x + 4, row = 0;
      pantry.forEach(function (id) { var sp = F.sprite(id).skin; if (x + sp.w > pa.x + pa.w - 4) { row++; x = pa.x + 4; } items.push({ id: id, x: x, y: pa.y + (row + 1) * sh - sp.h - 3, w: sp.w, h: sp.h, sp: sp }); x += sp.w + 3; });
      var ix = ib.x + 6, irow = 0, rh = Math.floor((ib.h - 16) / 3);
      cold.forEach(function (id) { var sp = F.sprite(id).skin; if (ix + sp.w > ib.x + ib.w - 6) { irow++; ix = ib.x + 6; } items.push({ id: id, cold: 1, x: ix, y: ib.y + 8 + (irow + 1) * rh - sp.h - 1, w: sp.w, h: sp.h, sp: sp }); ix += sp.w + 3; });
      S.pa = pa; S.ib = ib; S.sh = sh; S.nS = nS; S.rh = rh; S.items = items; S.basket = { x: Math.round(W / 2 - 28), y: H - 30 };
      if (!L.por) S.basket.x = Math.round(pa.x + pa.w / 2 - 28);
    }
    layout(); S.relayout = layout;
    S.update = function (dt) {
      S.t += dt; S.iceT = C.damp(S.iceT, S.ice, 9, dt);
      for (var i = S.fly.length - 1; i >= 0; i--) { var f = S.fly[i]; f.t += dt * 2.4; if (f.t >= 1) { S.fly.splice(i, 1); C.sfx('cloth2', { vol: .5 }); } }
      for (var k in S.wob) { S.wob[k] -= dt * 3; if (S.wob[k] <= 0) delete S.wob[k]; }
      var n = 0; need.forEach(function (id) { if (got[id]) n++; }); S.p = S.fly.length ? Math.min(.99, n / need.length) : n / need.length;
      S.items.forEach(function (it) { if (got[it.id]) return; if (it.cold && S.ice < 1) return; C.region(it.x, it.y, it.w, it.h, 'it:' + it.id, { t: F.ing[it.id].n.toLowerCase(), d: need.indexOf(it.id) >= 0 ? 'Needed for this recipe.' : 'Not for this one.' }); });
      if (S.ice < 1) C.region(S.ib.x, S.ib.y, S.ib.w, S.ib.h, 'icebox', { t: 'icebox', d: 'Cold things: butter, milk, eggs, meat.' });
      S.sparkAt = { x: S.basket.x + 28, y: S.basket.y };
    };
    S.draw = function (g) {
      var L = K.L, pa = S.pa, ib = S.ib;
      /* pantry cupboard */
      RM.rect(g, pa.x - 3, pa.y - 6, pa.w + 6, pa.h + 8, function (x, y, xx, yy) { var e = xx < 3 || xx > pa.w + 2 || yy < 3; return e ? C.rp(pal.wood, xx === 0 || yy === 0 ? .1 : .55, x, y) : C.rp(R(['#1e100a', '#2e1a10', '#3e2416']), .5 + (C.hash(x >> 2, y, 1) - .5) * .3 - (yy % S.sh) / S.sh * .3, x, y); });
      for (var s = 1; s <= S.nS; s++) { var sy = pa.y + s * S.sh - 3; RM.rect(g, pa.x, sy, pa.w, 3, function (x, y, xx, yy) { return C.rp(pal.woodL, yy === 0 ? .85 : yy === 2 ? .1 : .5, x, y); }); }
      /* icebox (oak with brass hinges) */
      RM.rect(g, ib.x, ib.y, ib.w, ib.h, function (x, y, xx, yy) { var e = xx === 0 || yy === 0 || xx === ib.w - 1 || yy === ib.h - 1; if (e) return OUT; if (xx < 4 || yy < 4 || xx > ib.w - 5 || yy > ib.h - 5) return C.rp(pal.woodL, .6, x, y); return C.rp(R(['#c8dce8', '#e0ecf4', '#f2f8fc']), .5 + (C.hash(x, y, 2) - .5) * .3, x, y); });
      for (var r = 1; r <= 3; r++) RM.rect(g, ib.x + 4, ib.y + 8 + r * S.rh, ib.w - 8, 1, function (x) { return x % 2 ? P('#8a9aa8') : P('#c0ccd6'); });
      var di = S.items, now = S.t;
      di.forEach(function (it) { if (got[it.id]) return; if (it.cold && S.iceT < .5) return; var wob = S.wob[it.id] ? Math.round(Math.sin(S.wob[it.id] * 20) * 1.5) : 0, hov = C.hover && C.hover.id === 'it:' + it.id ? -1 : 0; it.sp.draw(g, it.x + wob, it.y + hov);
        if (need.indexOf(it.id) >= 0 && (Math.floor(now * 2 + it.x) % 3 === 0)) { var sx = it.x + ((now * 7 + it.y) % it.w | 0); g.fillStyle = '#fff6c8'; g.fillRect(sx, it.y - 2, 1, 1); g.fillRect(sx - 1, it.y - 1, 3, 1); g.fillRect(sx, it.y, 1, 1); } });
      /* icebox door swings open (shrinks to the hinge side) */
      var dw = Math.round((ib.w - 4) * (1 - S.iceT * .88));
      if (dw > 2) { RM.rect(g, ib.x + 2, ib.y + 2, dw, ib.h - 4, function (x, y, xx, yy) { var e = xx === 0 || yy === 0 || xx === dw - 1 || yy === ib.h - 5; if (e) return OUT; var pn = xx > 4 && xx < dw - 5 && yy > 5 && yy < ib.h - 10 && (yy < (ib.h - 4) / 2 - 2 || yy > (ib.h - 4) / 2 + 2); return C.rp(pal.wood, pn ? .7 : .45 + (C.hash(x >> 1, y, 3) - .5) * .2, x, y); });
        RM.rect(g, ib.x + dw - 6, ib.y + (ib.h >> 1) - 5, 3, 10, function (x, y, xx, yy) { return C.rp(pal.copper, yy < 2 ? .9 : .5, x, y); }); }
      if (S.ice && S.iceT > .5 && Math.random() < .3) { g.fillStyle = '#e8f4ff'; g.fillRect(ib.x + 6 + Math.random() * (ib.w - 12), ib.y + ib.h - 6 - Math.random() * 8, 1, 1); }
      /* basket + what's in it */
      var b = S.basket; BASKET.draw(g, b.x, b.y);
      var gi = 0; need.forEach(function (id) { if (!got[id] || S.fly.some(function (f) { return f.id === id; })) return; var sp = F.sprite(id).skin; g.save(); g.beginPath(); g.rect(b.x, b.y - 30, 56, 37); g.clip(); sp.draw(g, b.x + 6 + (gi * 9) % 40, b.y + 6 - sp.h + (gi % 2) * 2); g.restore(); gi++; });
      S.fly.forEach(function (f) { var t = C.ease(f.t), x = C.lerp(f.x0, b.x + 20, t), y = C.lerp(f.y0, b.y - 6, t) - Math.sin(t * Math.PI) * 24; f.sp.draw(g, x, y); });
      BASKET.draw && g.drawImage(BASKET.canvas(), 0, 9, 56, 17, b.x, b.y + 9, 56, 17);
      /* needed list as icons (top-right), dimmed until gathered */
      var lx = L.W - 6, ly = L.por ? 6 : L.H - 22; if (L.por) ly = L.H - 22;
      for (var i = need.length - 1; i >= 0; i--) { var sp = F.sprite(need[i]).skin, sc = sp; lx -= Math.min(sp.w, 18) + 2; g.save(); if (!got[need[i]]) g.globalAlpha = .35; g.beginPath(); g.rect(lx, ly, 18, 20); g.clip(); sp.draw(g, lx, ly + 20 - sp.h); g.restore(); if (got[need[i]]) { g.fillStyle = '#9aff9a'; g.fillRect(lx + 2, ly + 21, Math.min(sp.w, 18) - 4, 1); } }
    };
    S.down = function (m) {
      var h = C.hit(m.x, m.y); if (!h) return;
      if (h.id === 'icebox') { S.ice = 1; C.sfx('creak'); return; }
      if (h.id.indexOf('it:') === 0) { var id = h.id.slice(3), it = S.items.filter(function (q) { return q.id === id; })[0];
        if (need.indexOf(id) >= 0) { got[id] = 1; S.fly.push({ id: id, sp: it.sp, x0: it.x, y0: it.y, t: 0 }); var s = F.ing[id].snd; C.sfx(s === 'jar' ? 'jar' : s === 'clink' ? 'clink1' : 'grab', { jitter: .1 }); }
        else { S.wob[id] = 1; C.sfx('click', { vol: .5 }); } }
    };
    S.hint = function (t) { var id = need.filter(function (q) { return !got[q]; })[0]; if (!id) return null; if (COLD[id] && S.ice < 1) return { x: S.ib.x + S.ib.w / 2, y: S.ib.y + S.ib.h / 2, press: t > .5 }; var it = S.items.filter(function (q) { return q.id === id; })[0]; return { x: it.x + it.w / 2, y: it.y + it.h / 2 + 2, press: t > .5 }; };
    S.skip = function () { need.forEach(function (id) { got[id] = 1; }); S.fly = []; };
    return S;
  };
  /* ================= big ingredient sprites for the board ================= */
  var BIG = { apple: 40, onion: 38, potato: 46, pumpkin: 48, beef: 46, carrot: 56 };
  var LOG = null;
  function logPair() { if (LOG) return LOG; var w = 76, h = 20, m = A.rrect(0, 2, w, 16, 7);
    var skin = A.dome(w, h, m, { ramp: D.DOUGH, R: 7, outline: OUT, tex: function (x, y) { return Math.sin(x * .5) * .25; }, col: function (x, y, v) { return (x < 3 || x > w - 4) ? C.rp(R(['#5e240e', '#a86a3a', '#e8cfa2']), (x + y) % 3 / 2, x, y) : 0; } });
    var flesh = A.dome(w, h, m, { ramp: D.DOUGH, R: 3, outline: OUT, amb: .6, col: function (x, y, v) { var dy = y - 10; return Math.abs(dy) % 4 < 1.5 ? C.rp(R(['#3a1406', '#5e240e', '#7e3a1a']), v, x, y) : 0; } });
    LOG = { skin: skin, flesh: flesh, w: w, h: h }; return LOG; }
  function bigPair(id, R0) { if (id === 'log') return logPair(); var sp = F.sprite(id, BIG[id]); if (R0 && R0.peeled && R0.peeled[id]) return { skin: sp.flesh || sp.skin, flesh: sp.flesh || sp.skin, w: sp.w, h: sp.h }; return sp; }
  ST.bigPair = bigPair;
  function boardAt(K) { var bd = Wr.board(), L = K.L; return { b: bd, x: Math.round(L.cx - bd.w / 2), y: Math.round(L.cy - 4) }; }
  /* ================= peel ================= */
  ST.peel = function (cfg, K) {
    var sp = F.sprite(cfg.ing, BIG[cfg.ing]), cur = sp.skin.clone(), fl = sp.flesh || sp.skin, total = 0, done = 0, S = { p: 0, bits: [], last: null };
    for (var i = 0; i < cur.d.length; i++) if ((cur.d[i] >>> 24) && fl.d[i] !== cur.d[i]) total++;
    function pos() { var bd = boardAt(K); return { x: Math.round(K.L.cx - sp.w / 2), y: bd.y + 8 - sp.h + 6, bd: bd }; }
    function scrape(x0, y0, x1, y1) { var o = pos(), n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0))), hit = 0;
      for (var k = 0; k <= n; k++) { var cx = x0 + (x1 - x0) * k / n - o.x, cy = y0 + (y1 - y0) * k / n - o.y; for (var dy = -3; dy <= 3; dy++) for (var dx = -3; dx <= 3; dx++) { if (dx * dx + dy * dy > 10) continue; var X = Math.round(cx + dx), Y = Math.round(cy + dy), id = Y * cur.w + X; if (X < 0 || Y < 0 || X >= cur.w || Y >= cur.h) continue; var c = cur.d[id]; if ((c >>> 24) && c !== fl.d[id]) { cur.d[id] = fl.d[id]; cur.dirty = true; done++; hit++; if (Math.random() < .25) S.bits.push({ x: o.x + X, y: o.y + Y, vx: (Math.random() - .5) * 30, vy: -10 - Math.random() * 20, c: C.css(c), a: 0 }); } } }
      if (hit) { C.sfx('knife2', { jitter: .3, vol: .8 }); if (Math.random() < .15) C.sfx.any('slice', 2, { vol: .35 }); } }
    S.update = function (dt) { S.p = Math.min(1, done / (total * .9)); if (S.p >= 1 && !S.fin) { S.fin = 1; K.R.peeled = K.R.peeled || {}; K.R.peeled[cfg.ing] = 1; for (var i = 0; i < cur.d.length; i++) cur.d[i] = fl.d[i]; cur.dirty = true; }
      for (var i2 = S.bits.length - 1; i2 >= 0; i2--) { var b = S.bits[i2]; b.a += dt; b.vy += 120 * dt; b.x += b.vx * dt; b.y += b.vy * dt; var o = pos(); if (b.y > o.bd.y + 22) { b.y = o.bd.y + 22; b.vy = 0; b.vx *= .5; } if (b.a > 4) S.bits.splice(i2, 1); }
      var o2 = pos(); S.sparkAt = { x: o2.x + sp.w / 2, y: o2.y + sp.h / 2 }; C.region(o2.x, o2.y, sp.w, sp.h, 'peel', null); };
    S.draw = function (g) { var o = pos(); o.bd.b.pix.draw(g, o.bd.x, o.bd.y); cur.draw(g, o.x, o.y); S.bits.forEach(function (b) { g.fillStyle = b.c; g.fillRect(Math.round(b.x), Math.round(b.y), 2, 1); });
      var m = M(); if (m.inside || m.down) { F.tools.peeler.draw(g, m.x - 16, m.y - 3 + (m.down ? 1 : 0)); } };
    S.down = function (m) { S.last = { x: m.x, y: m.y }; scrape(m.x, m.y, m.x, m.y); };
    S.move = function (m) { if (!m.down || !S.last) return; scrape(S.last.x, S.last.y, m.x, m.y); S.last = { x: m.x, y: m.y }; };
    S.up = function () { S.last = null; };
    S.hint = function (t) { var o = pos(); return { x: o.x + sp.w * (.2 + .6 * t), y: o.y + sp.h * (.3 + .4 * Math.sin(t * 6.28) * .5 + .2), press: 1 }; };
    S.skip = function () { done = total; K.R.peeled = K.R.peeled || {}; K.R.peeled[cfg.ing] = 1; };
    return S;
  };
  /* ================= cut: split pixel pieces along the swipe ================= */
  ST.cut = function (cfg, K) {
    var pair = bigPair(cfg.ing, K.R), S = { p: 0, cuts: 0, knife: null, a: null, crumbs: [] };
    var fl = pair.flesh || pair.skin;
    function base() { var bd = boardAt(K); return { x: Math.round(K.L.cx - pair.w / 2), y: bd.y + 14 - pair.h, bd: bd }; }
    var pieces = [{ pix: pair.skin.clone(), dx: 0, dy: 0, vx: 0, vy: 0 }];
    S.pieces = pieces;
    function split(x0, y0, x1, y1) {
      var o = base(), nx = -(y1 - y0), ny = x1 - x0, ln = Math.hypot(nx, ny) || 1; nx /= ln; ny /= ln; var any = 0;
      for (var pi = pieces.length - 1; pi >= 0; pi--) { var pc = pieces[pi], ox = o.x + pc.dx, oy = o.y + pc.dy, a = new A.Pix(pc.pix.w, pc.pix.h), b = new A.Pix(pc.pix.w, pc.pix.h), na = 0, nb = 0;
        for (var y = 0; y < pc.pix.h; y++) for (var x = 0; x < pc.pix.w; x++) { var c = pc.pix.d[y * pc.pix.w + x]; if (!(c >>> 24)) continue; var sd = (ox + x + .5 - x0) * nx + (oy + y + .5 - y0) * ny;
          var edge = Math.abs(sd) < 1.3, f = fl.d[y * fl.w + x], col = edge && (f >>> 24) ? (Math.abs(sd) < .7 ? C.mix(f, P('#ffffff'), .15) : f) : c; if (sd < 0) { a.d[y * a.w + x] = col; na++; } else { b.d[y * b.w + x] = col; nb++; } }
        if (na > 5 && nb > 5) { any = 1; pieces.splice(pi, 1, { pix: a, dx: pc.dx, dy: pc.dy, vx: -nx * 16, vy: -ny * 6 }, { pix: b, dx: pc.dx, dy: pc.dy, vx: nx * 16, vy: ny * 6 }); } }
      return any;
    }
    function cutLine(x0, y0, x1, y1) { var o = base(); var ext = 80, dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; var ax = x0 - dx * ext, ay = y0 - dy * ext, bx = x1 + dx * ext, by = y1 + dy * ext;
      S.knife = { x0: ax, y0: ay, x1: bx, y1: by, t: 0 }; if (split(x0, y0, x1, y1)) { S.cuts++; sndOf(cfg.ing === 'log' ? 'butter' : cfg.ing); C.sfx('knife', { vol: .6, jitter: .2 }); for (var i = 0; i < 6; i++) S.crumbs.push({ x: (x0 + x1) / 2 + (Math.random() - .5) * 10, y: o.bd.y + 10, vx: (Math.random() - .5) * 40, vy: -20 - Math.random() * 30, a: 0, c: C.css(fl.d[(pair.h >> 1) * fl.w + (pair.w >> 1)] || P('#ffffff')) }); } else C.sfx('wood', { vol: .5 }); }
    S.update = function (dt) {
      pieces.forEach(function (pc) { pc.dx += pc.vx * dt; pc.dy += pc.vy * dt; pc.vx *= Math.exp(-dt * 7); pc.vy *= Math.exp(-dt * 7); });
      if (S.knife) { S.knife.t += dt * 5; if (S.knife.t > 1) S.knife = null; }
      for (var i = S.crumbs.length - 1; i >= 0; i--) { var c = S.crumbs[i]; c.a += dt; c.vy += 140 * dt; c.x += c.vx * dt; c.y += c.vy * dt; if (c.a > .8) S.crumbs.splice(i, 1); }
      S.p = Math.min(1, S.cuts / cfg.n); var o = base(); S.sparkAt = { x: o.x + pair.w / 2, y: o.y + pair.h / 2 }; C.region(o.bd.x, o.bd.y - 30, o.bd.b.w, 60, 'cut', null);
      if (S.p >= 1 && !S.fin) { S.fin = 1; finishCut(cfg, K, pieces.length); }
    };
    S.draw = function (g) { var o = base(); o.bd.b.pix.draw(g, o.bd.x, o.bd.y); pieces.forEach(function (pc) { pc.pix.draw(g, o.x + pc.dx, o.y + pc.dy); });
      S.crumbs.forEach(function (c) { g.fillStyle = c.c; g.fillRect(Math.round(c.x), Math.round(c.y), 1, 1); });
      var m = M(); if (S.a && m.down) { var n = Math.ceil(Math.hypot(m.x - S.a.x, m.y - S.a.y)); for (var k = 0; k < n; k += 2) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(Math.round(S.a.x + (m.x - S.a.x) * k / n), Math.round(S.a.y + (m.y - S.a.y) * k / n), 1, 1); } }
      var kn = F.tools.knife;
      if (S.knife) { var t = C.ease(S.knife.t), kx = C.lerp(S.knife.x0, S.knife.x1, t), ky = C.lerp(S.knife.y0, S.knife.y1, t), ang = Math.atan2(S.knife.y1 - S.knife.y0, S.knife.x1 - S.knife.x0); g.save(); g.translate(Math.round(kx), Math.round(ky)); g.rotate(Math.round((ang + Math.PI / 2) / (Math.PI / 8)) * Math.PI / 8); g.drawImage(kn.canvas(), -22, -4); g.restore(); }
      else if (m.inside || m.down) { g.save(); g.translate(Math.round(m.x), Math.round(m.y)); g.rotate(Math.PI / 2); g.drawImage(kn.canvas(), -24, -4); g.restore(); } };
    S.down = function (m) { S.a = { x: m.x, y: m.y }; };
    S.up = function (m) { if (!S.a) return; var d = Math.hypot(m.x - S.a.x, m.y - S.a.y); if (d > 8) cutLine(S.a.x, S.a.y, m.x, m.y); else cutLine(m.x + .3, m.y - 10, m.x - .3, m.y + 10); S.a = null; };
    S.hint = function (t) { var o = base(), x = o.x + pair.w * (.25 + .5 * ((S.cuts * .37) % 1)); return { x: x, y: o.y - 6 + t * (pair.h + 12), press: 1 }; };
    S.skip = function () { S.cuts = cfg.n; if (!S.fin) { S.fin = 1; finishCut(cfg, K, cfg.n + 1); } };
    return S;
  };
  function finishCut(cfg, K, n) {
    var R0 = K.R, rnd = C.rng(n * 7 + 3);
    if (cfg.into === 'bowl') { R0.bowl.lvl = Math.max(R0.bowl.lvl, .45); R0.bowl.cols.push({ c: cfg.col, a: 1 }); for (var i = 0; i < 9; i++) R0.bowl.chunks.push({ x: (rnd() - .5) * 1.3, y: (rnd() - .5) * 1.1, c: C.mix(cfg.col, P('#ffffff'), .3) }); }
    if (cfg.into === 'pot') { for (i = 0; i < 8; i++) R0.pot.chunks.push({ x: (rnd() - .5) * 1.3, y: (rnd() - .5) * 1.1, c: cfg.chunk }); R0.pot.lvl = Math.max(R0.pot.lvl, .3); if (!R0.pot.cols.length) R0.pot.cols.push({ c: P('#7a3a14'), a: .5 }); }
    if (cfg.into === 'pan') R0.pan = { pieces: n };
    if (cfg.then === 'rolls') { R0.rolls.n = 6; }
  }
  /* ================= score (knife lines on loaf / ham) ================= */
  ST.score = function (cfg, K) {
    var n = R0main(K), S = { p: 0, a: null, k: 0 }, d = K.deco(n);
    function pos() { var L = K.L; return K.rectOf(n, L.cx, L.cy); }
    S.update = function () { S.p = Math.min(1, d.lines.filter(function (l) { return l.sc; }).length / cfg.n); var r = pos(); S.sparkAt = { x: r.x + r.w / 2, y: r.y + r.h / 2 }; C.region(r.x, r.y, r.w, r.h, 'score', null); };
    S.draw = function (g) { var L = K.L; if (n === 'loaf') { var bd = boardAt(K); bd.b.pix.draw(g, bd.x, L.cy + 10); } K.drawObj(g, n, L.cx, L.cy); var m = M(); if (S.a && m.down) { g.fillStyle = '#fff3dc'; g.fillRect(Math.round(m.x), Math.round(m.y), 1, 1); } if (m.inside || m.down) { g.save(); g.translate(Math.round(m.x), Math.round(m.y)); g.rotate(Math.PI / 2); g.drawImage(F.tools.knife.canvas(), -24, -4); g.restore(); } };
    function add(x0, y0, x1, y1) { var r = pos(); d.lines.push({ x0: x0 - r.x, y0: y0 - r.y, x1: x1 - r.x, y1: y1 - r.y, c: n === 'ham' ? '#5a1a0c' : '#fbe6b0', hi: n === 'ham' ? '#f0b090' : null, sc: 1 }); C.sfx.any('slice', 2); S.k++; }
    function auto(i) { var r = pos(); if (cfg.hatch) { var s = i % 2 ? 1 : -1, off = (Math.floor(i / 2) - 1) * 10; return [r.x + r.w / 2 - 14 + off, r.y + 6, r.x + r.w / 2 + 14 + off, r.y + r.h - 4].map(function (v, j) { return j % 2 ? v : (s < 0 ? (j ? v : v) : v); }).map(function (v, j) { return (j === 0 && s < 0) ? r.x + r.w / 2 + 14 + off : (j === 2 && s < 0) ? r.x + r.w / 2 - 14 + off : v; }); } var x = r.x + r.w / 2 + (i - 1) * 10; return [x - 6, r.y + 10, x + 6, r.y + r.h - 12]; }
    S.down = function (m) { S.a = { x: m.x, y: m.y }; };
    S.up = function (m) { if (!S.a) return; if (Math.hypot(m.x - S.a.x, m.y - S.a.y) > 6) add(S.a.x, S.a.y, m.x, m.y); else { var a = auto(S.k); add(a[0], a[1], a[2], a[3]); } S.a = null; };
    S.hint = function (t) { var a = auto(S.k); return { x: C.lerp(a[0], a[2], t), y: C.lerp(a[1], a[3], t), press: 1 }; };
    S.skip = function () { while (S.k < cfg.n) { var a = auto(S.k); add(a[0], a[1], a[2], a[3]); } };
    return S;
  };
  function R0main(K) { return K.R.main; }
  /* ================= knead (squash and spring) ================= */
  ST.knead = function (cfg, K) {
    var S = { p: 0, sq: 0, v: 0, n: 0, armed: 1, puffs: [], fold: 0 };
    S.update = function (dt) { var m = M(), tgt = m.down ? .95 : 0; var k = 120, damp = m.down ? 18 : 7; S.v += (tgt - S.sq) * k * dt - S.v * damp * dt; S.sq += S.v * dt; S.sq = C.clamp(S.sq, -.6, 1);
      if (S.sq > .6 && S.armed) { S.armed = 0; S.n++; C.sfx.any('squish', 3, { jitter: .15 }); for (var i = 0; i < 6; i++) S.puffs.push({ x: K.L.cx + (Math.random() - .5) * 50, y: K.L.cy + 8, vx: (Math.random() - .5) * 40, vy: -Math.random() * 14, a: 0 }); }
      if (S.sq < .25) S.armed = 1;
      for (var j = S.puffs.length - 1; j >= 0; j--) { var p = S.puffs[j]; p.a += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= Math.exp(-dt * 4); if (p.a > 1) S.puffs.splice(j, 1); }
      S.p = Math.min(1, S.n / cfg.n); S.sparkAt = { x: K.L.cx, y: K.L.cy - 4 }; C.region(K.L.cx - 40, K.L.cy - 30, 80, 50, 'knead', null); };
    S.draw = function (g) { var L = K.L; RM.glow(g, L.cx, L.cy + 6, 46, '#f8f2e6', .9, 12); var sm = S.p, b = D.doughBlob(C.clamp(S.sq, -.5, 1), sm, 22); b.draw(g, L.cx - b.w / 2, L.cy + 10 - b.h); S.puffs.forEach(function (p) { if (C.bayer(p.x | 0, p.y | 0) < 1 - p.a) { g.fillStyle = '#fffaf0'; g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); } });
      var m = M(); if (m.inside || m.down) K.hand(g, m.x - 4, m.y - 6, m.down); };
    S.hint = function (t) { return { x: K.L.cx - 4, y: K.L.cy - 14, press: t % .5 > .25 }; };
    S.skip = function () { S.n = cfg.n; };
    return S;
  };
  /* ================= roll (rolling pin grows the sheet) ================= */
  ST.roll = function (cfg, K) {
    var sh = K.R.sheet; sh.shape = cfg.shape; sh.r = 0; sh.ginger = cfg.ginger ? 1 : 0; var S = { p: 0, py: null, dir: 0, puffs: [] };
    S.update = function (dt) { S.p = Math.min(1, sh.r); S.sparkAt = { x: K.L.cx, y: K.L.cy }; C.region(0, K.L.top, K.L.W, K.L.H - K.L.top, 'roll', null); if (S.p >= 1 && !S.fin) { S.fin = 1; if (cfg.then === 'pie') K.R.pie.crust = 1; }
      for (var j = S.puffs.length - 1; j >= 0; j--) { var p = S.puffs[j]; p.a += dt; p.x += p.vx * dt; if (p.a > 1) S.puffs.splice(j, 1); } };
    S.draw = function (g) { var L = K.L; RM.glow(g, L.cx, L.cy, 62, '#f8f2e6', .8, 26); K.drawObj(g, 'sheet', L.cx, L.cy); var m = M(), y = S.py != null ? S.py : (m.inside ? m.y : L.cy - 20), pin = F.tools.pin; pin.draw(g, L.cx - pin.w / 2 + (m.inside ? C.clamp(m.x - L.cx, -10, 10) : 0), Math.round(y) - 4);
      S.puffs.forEach(function (p) { g.fillStyle = '#fffaf0'; g.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }); };
    S.down = function (m) { S.py = m.y; C.sfx('thump', { vol: .5 }); };
    S.move = function (m, dx, dy) { if (!m.down) return; var L = K.L, r = K.rectOf('sheet', L.cx, L.cy); S.py = C.clamp(m.y, r.y - 6, r.y + r.h + 6); var d = Math.abs(dy) + Math.abs(dx) * .3; if (m.y > r.y - 8 && m.y < r.y + r.h + 8) { sh.r = Math.min(1, sh.r + d / 300); var nd = dy > 0 ? 1 : dy < 0 ? -1 : S.dir; if (nd !== S.dir && Math.abs(dy) > .5) { S.dir = nd; C.sfx('cloth2', { vol: .5, jitter: .2 }); for (var i = 0; i < 4; i++) S.puffs.push({ x: L.cx + (Math.random() - .5) * 60, y: S.py + (Math.random() - .5) * 6, vx: (Math.random() - .5) * 30, a: 0 }); } C.sfx('knife2', { vol: .25, rate: .6 }); } };
    S.up = function () { S.py = null; };
    S.hint = function (t) { var r = K.rectOf('sheet', K.L.cx, K.L.cy), k = Math.sin(t * 6.283); return { x: K.L.cx, y: r.y + r.h / 2 + k * (r.h / 2 + 4), press: 1 }; };
    S.skip = function () { sh.r = 1; if (cfg.then === 'pie') K.R.pie.crust = 1; };
    return S;
  };
  /* ================= crimp (pinch the pie rim) ================= */
  function rimPts(K) { var L = K.L, r = K.rectOf('pie', L.cx, L.cy), dp = Wr.dishP(), pts = []; for (var i = 0; i < 14; i++) { var a = -Math.PI + (i + .5) / 14 * Math.PI * 2; pts.push({ x: r.x + dp.cx + Math.cos(a) * (dp.irx + 1.5), y: r.y + dp.cy + Math.sin(a) * (dp.iry + 1) }); } return pts; }
  ST.crimp = function (cfg, K) {
    var cr = K.R.pie.crimp, S = { p: 0 };
    function pinch(x, y) { rimPts(K).forEach(function (pt, i) { if (!cr[i] && Math.hypot(pt.x - x, (pt.y - y) * 1.6) < 9) { cr[i] = 1; C.sfx('squish4', { jitter: .3 }); K.sparkle(pt.x, pt.y, 2); } }); }
    S.update = function () { var n = cr.filter(Boolean).length; S.p = n / 14; S.sparkAt = { x: K.L.cx, y: K.L.cy }; var r = K.rectOf('pie', K.L.cx, K.L.cy); C.region(r.x, r.y, r.w, r.h, 'crimp', null); };
    S.draw = function (g) { var L = K.L; K.drawObj(g, 'pie', L.cx, L.cy); var t = C.t; rimPts(K).forEach(function (pt, i) { if (!cr[i] && Math.floor(t * 3 + i) % 4 === 0) { g.fillStyle = '#fff6c8'; g.fillRect(Math.round(pt.x), Math.round(pt.y), 1, 1); } }); var m = M(); if (m.inside || m.down) K.hand(g, m.x - 4, m.y - 1, m.down); };
    S.down = function (m) { pinch(m.x, m.y); }; S.move = function (m) { if (m.down) pinch(m.x, m.y); };
    S.hint = function (t) { var pts = rimPts(K), i = cr.indexOf(0); if (i < 0) return null; var a = pts[i], b = pts[(i + 1) % 14]; return { x: C.lerp(a.x, b.x, t), y: C.lerp(a.y, b.y, t), press: 1 }; };
    S.skip = function () { for (var i = 0; i < 14; i++) cr[i] = 1; };
    return S;
  };
  /* ================= lattice ================= */
  ST.lattice = function (cfg, K) {
    var pie = K.R.pie, S = { p: 0, drop: 0 };
    S.update = function (dt) { S.drop = Math.max(0, S.drop - dt * 5); S.p = pie.lattice / cfg.n; S.sparkAt = { x: K.L.cx, y: K.L.cy }; var r = K.rectOf('pie', K.L.cx, K.L.cy); C.region(r.x, r.y - 20, r.w, r.h + 20, 'lattice', null); };
    S.draw = function (g) { var L = K.L; K.drawObj(g, 'pie', L.cx, L.cy); /* next strip waiting above */ if (pie.lattice < cfg.n) { var horiz = pie.lattice % 2 === 0, y = L.cy - 34 - Math.round(S.drop * 6); var sh = D.sheet('rect', .1, 0); if (horiz) RM.rect(g, L.cx - 30, y, 60, 4, function (x, yy, xx, j) { return D.pastry(j === 0 ? .9 : j === 3 ? .2 : .6, 0, x, yy); }); else RM.rect(g, L.cx - 3, y - 14, 7, 22, function (x, yy, xx) { return D.pastry(xx === 0 ? .9 : xx === 6 ? .2 : .6, 0, x, yy); }); } var m = M(); if (m.inside) K.hand(g, m.x - 4, m.y - 1, m.down); };
    S.down = function () { if (pie.lattice < cfg.n) { pie.lattice++; S.drop = 1; C.sfx('squish2', { vol: .6, jitter: .2 }); C.sfx('cloth', { vol: .5 }); } };
    S.hint = function (t) { return { x: K.L.cx, y: K.L.cy - 6, press: t > .5 }; };
    S.skip = function () { pie.lattice = cfg.n; };
    return S;
  };
  /* ================= place (pecans, cloves, marshmallows, stuffing) ================= */
  var ITEM = {}, _sprig = null;
  /* small rosemary/thyme sprig for tucking into the turkey */
  function SPRIG() { if (_sprig) return _sprig; var rows = ['......g..g', '..g..gGgG.', '.gGg.GsGg.', 'g.GsGsg...', '.GsGg.g...', 'Gs.g......', 's.........'];
    _sprig = A.fromFn(10, 7, function (x, y) { var c = rows[y][x]; return c === 'g' ? P('#4a8a3a') : c === 'G' ? P('#2a5a26') : c === 's' ? P('#6a4a22') : 0; }); return _sprig; }
  function itemPix(k, i) { var key = k + (i % 3); if (ITEM[key]) return ITEM[key];
    var p; if (k === 'pecan') p = A.dome(8, 5, A.ell(4, 2.5, 3.8, 2.3), { ramp: R(['#2a1006', '#5a2a0e', '#8a4a1e', '#b8743a']), outline: OUT, tex: function (x) { return x === 4 ? -1.5 : Math.sin(x * 2) * .4; } });
    else if (k === 'cloves') p = A.fromFn(3, 4, function (x, y) { return y === 0 ? (x === 1 ? P('#5a2a10') : P('#2a1206')) : x === 1 ? P('#3a1a0a') : 0; });
    else if (k === 'marsh') p = A.dome(7, 6, A.rrect(0, 0, 7, 6, 2), { ramp: R(['#c8b8a8', '#e8e0d8', '#fffaf4', '#ffffff']), outline: OUT, amb: .6, col: i % 2 ? function (x, y) { return y === 0 && x > 1 && x < 5 ? P('#e8c890') : 0; } : null });
    else p = i % 2 ? SPRIG() : A.dome(10, 9, A.not(A.ell(5, 5, 4.6, 4.2), A.ell(9, 1, 4, 4)), { ramp: R(['#a89878', '#d8c8a0', '#f4ead0', '#fffaf0']), outline: OUT, tex: function (x, y) { return Math.sin(Math.hypot(x - 9, y - 1) * 1.6) * .6; } });
    return (ITEM[key] = p); }
  ST.place = function (cfg, K) {
    var n = cfg.on, d = K.deco(n), S = { p: 0, spots: null, k: 0 };
    function spots() { var r = K.rectOf(n, 0, 0), o = r.o, pts = [], rnd = C.rng(11), tries = 0, cxs = r.w / 2, cys = r.h / 2;
      if (cfg.item === 'pecan') { for (var i = 0; i < cfg.n; i++) { var ring = i < 8 ? 1 : .45, a = (i < 8 ? i / 8 : (i - 8) / 4) * 6.283 + (ring < 1 ? .4 : 0), dp = Wr.dishP(); pts.push({ x: Math.round(dp.cx + Math.cos(a) * (dp.irx - 9) * ring), y: Math.round(dp.cy + Math.sin(a) * (dp.iry - 5) * ring) }); } return pts; }
      if (cfg.item === 'stuff') { var ro = K.roastOff('turkey'), cx0 = ro.x + ro.w / 2, cy0 = ro.y + ro.h * .5; var SP = [[-9, 2], [1, 3], [-4, -1], [-8, -4], [0, -3]]; for (i = 0; i < cfg.n; i++) { var q2 = SP[i % SP.length]; pts.push({ x: Math.round(cx0 + q2[0]), y: Math.round(cy0 + q2[1]) }); } return pts; }
      while (pts.length < cfg.n && tries++ < 4000) { var x = Math.round(rnd() * r.w), y = Math.round(rnd() * r.h); if (!o.surf(x, y)) continue; if (pts.some(function (p) { return Math.hypot(p.x - x, p.y - y) < (cfg.item === 'marsh' ? 5 : 7); })) continue; pts.push({ x: x, y: y }); } return pts; }
    S.spots = spots();
    function put() { if (S.k >= S.spots.length) return; var sp = S.spots[S.k]; d.items.push({ pix: itemPix(cfg.item, S.k), x: sp.x, y: sp.y, pop: 1 }); S.k++; C.sfx(cfg.item === 'cloves' ? 'click' : cfg.item === 'stuff' ? 'squish3' : 'plop', { jitter: .2, vol: .8 }); }
    S.update = function (dt) { d.items.forEach(function (it) { if (it.pop > 0) it.pop = Math.max(0, it.pop - dt * 5); }); S.p = S.k / cfg.n; var r = K.rectOf(n, K.L.cx, K.L.cy); S.sparkAt = { x: r.x + r.w / 2, y: r.y + r.h / 2 }; C.region(r.x - 10, r.y - 10, r.w + 20, r.h + 20, 'place', null); };
    S.draw = function (g) { var L = K.L, r = K.drawObj(g, n, L.cx, L.cy);
      /* ghost spots */ for (var i = S.k; i < S.spots.length; i++) if (Math.floor(C.t * 2) % 2 || i === S.k) { g.fillStyle = i === S.k ? '#fff6c8' : 'rgba(255,246,200,.45)'; g.fillRect(r.x + S.spots[i].x, r.y + S.spots[i].y, 1, 1); }
      /* the little supply dish */ var m = M(); if (m.inside || m.down) { var ip = itemPix(cfg.item, S.k); ip.draw(g, m.x - (ip.w >> 1), m.y - ip.h - 2); } };
    S.down = function () { put(); };
    S.hint = function (t) { var sp = S.spots[S.k]; if (!sp) return null; var r = K.rectOf(n, K.L.cx, K.L.cy); return { x: r.x + sp.x, y: r.y + sp.y, press: t > .5 }; };
    S.skip = function () { while (S.k < cfg.n) put(); };
    return S;
  };
  ST.itemPix = itemPix;
  /* ================= stamp (cookie cutter) ================= */
  ST.stamp = function (cfg, K) {
    var d = K.deco('sheet'), S = { p: 0, k: 0, slots: null, press: 0 };
    function slots() { var r = K.rectOf('sheet', 0, 0), pts = []; for (var i = 0; i < cfg.n; i++) pts.push({ x: Math.round(r.w / 2 + (i - (cfg.n - 1) / 2) * 15), y: Math.round(r.h / 2 + (i % 2 ? 4 : -4)) }); return pts; }
    S.slots = slots();
    var hole = A.fromFn(16, 18, function (x, y) { var g = F.gman(x - 1, y - 1, 14, 16), e = F.gman(x, y, 16, 18, 1); return e && !g ? P('#3a1a08') : 0; });
    function stamp() { if (S.k >= cfg.n) return; var s = S.slots[S.k]; d.items.push({ pix: hole, x: s.x, y: s.y, pop: 0 }); d.items.push({ pix: D.cookie(0), x: s.x, y: s.y, pop: .6 }); S.k++; S.press = 1; C.sfx('thump', { jitter: .2 }); C.sfx('click', { vol: .5 }); }
    S.update = function (dt) { S.press = Math.max(0, S.press - dt * 6); d.items.forEach(function (it) { if (it.pop > 0) it.pop = Math.max(0, it.pop - dt * 4); }); S.p = S.k / cfg.n; S.sparkAt = { x: K.L.cx, y: K.L.cy }; C.region(0, K.L.top, K.L.W, K.L.H - K.L.top, 'stamp', null);
      if (S.p >= 1 && !S.fin) { S.fin = 1; K.R.cookies.list = []; for (var i = 0; i < cfg.n; i++) K.R.cookies.list.push({ x: 4 + i * 17, y: 8 + (i % 2) * 6 }); } };
    S.draw = function (g) { var L = K.L; RM.glow(g, L.cx, L.cy, 62, '#f8f2e6', .8, 26); var r = K.drawObj(g, 'sheet', L.cx, L.cy); var m = M(); if (m.inside || m.down) F.tools.cutter.draw(g, m.x - 8, m.y - 9 + (m.down ? 1 : -1)); var s = S.slots[S.k]; if (s && Math.floor(C.t * 2) % 2) { g.fillStyle = '#fff6c8'; g.fillRect(r.x + s.x + 7, r.y + s.y + 8, 2, 2); } };
    S.down = function () { stamp(); };
    S.hint = function (t) { var s = S.slots[S.k]; if (!s) return null; var r = K.rectOf('sheet', K.L.cx, K.L.cy); return { x: r.x + s.x + 6, y: r.y + s.y + 6, press: t > .5 }; };
    S.skip = function () { while (S.k < cfg.n) stamp(); S.p = 1; if (!S.fin) { S.fin = 1; K.R.cookies.list = []; for (var i = 0; i < cfg.n; i++) K.R.cookies.list.push({ x: 4 + i * 17, y: 8 + (i % 2) * 6 }); } };
    return S;
  };
})();
