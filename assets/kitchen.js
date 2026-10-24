/* The Cottage — the kitchen hub: crackling fire, cat on the rug, snow past the frosted window, lamp light,
   kettle, clock with the real time, the shelf of finished dishes and grandma's cookbook on the counter.
   Rare cozy surprises at the window: deer, owl, cardinal, aurora, carolers, a shooting star. */
(function () {
  'use strict';
  var C = window.COT, A = C.art, P = C.P, R = C.ramp, RM = C.room, CAT = C.cat, pal = A.pal;
  var K = C.kitchen = { t: 0, L: null, bg: null, surprise: null, nextS: 18, poke: 0, steam: [], sparks: [], snow: [], kettleT: 40, fall: null };
  function rebuild() { K.L = RM.lay(C.W, C.H); K.bg = RM.bake(K.L); var L = K.L; CAT.place(L.rug.cx + (L.por ? 0 : -6), L.rug.cy + 4); K.snow = []; for (var i = 0; i < 40; i++) K.snow.push({ x: Math.random() * 50, y: Math.random() * 44, z: Math.random() < .4 ? 1 : 0, ph: Math.random() * 6 }); }
  C.layoutListeners.push(function () { if (K.bg) rebuild(); });
  var KET = A.dome(18, 15, A.or(A.ell(9, 9, 7.5, 6), A.rrect(6, 1, 6, 3, 1), function (x, y) { return y >= 6 && y <= 9 && x >= 15 && x - 15 < 3 - (y - 6) * .4; }), { ramp: pal.copper, outline: pal.out, spec: P('#fff0d8') });
  var DEER = ['......#.#..', '.......#...', '.......##..', '......###..', '#######....', '########...', '.#######...', '.#.....#...', '.#.....#...', '.#.....#...'];
  var OWL = ['.#...#.', '.#####.', '#o###o#', '##.#.##', '.#####.', '.##.##.', '..###..', '..#.#..'];
  var BIRD = ['..##..', '.####.', '#####>', '.####.', '..##..', '..#...'];
  function rows(g, r, x, y, col, map) { for (var j = 0; j < r.length; j++) for (var i = 0; i < r[j].length; i++) { var ch = r[j][i]; if (ch !== '.') { g.fillStyle = map && map[ch] || col; g.fillRect(x + i, y + j, 1, 1); } } }
  var SURP = ['deer', 'owl', 'cardinal', 'aurora', 'carolers', 'star'];
  K.trigger = function (k) { k = k || SURP[(Math.random() * SURP.length) | 0]; K.surprise = { k: k, t: 0, dur: { deer: 12, owl: 9, cardinal: 9, aurora: 14, carolers: 12, star: 2.5 }[k] }; C.save.data.seen[k] = 1; C.save.write();
    if (k === 'owl') C.sfx('owl'); if (k === 'carolers') { C.sfx('sleigh'); setTimeout(function () { C.sfx('chime', { vol: .7 }); }, 900); } if (k === 'aurora') C.sfx('chime', { vol: .6 }); };
  function drawWindow(g, L, t) {
    var w = L.win, ox = w.x + 1, oy = w.y + 1, ow = w.w - 2, oh = w.h - 2;
    g.save(); g.beginPath(); g.rect(ox, oy, ow, oh); g.clip();
    g.drawImage(RM.out, ox, oy);
    var s = K.surprise;
    if (s) { var p = s.t / s.dur;
      if (s.k === 'aurora') { var a = Math.sin(p * Math.PI); for (var x = 0; x < ow; x++) { var yy = 6 + Math.sin(x * .15 + t * .8) * 4 + Math.sin(x * .05 + t * .3) * 3; for (var k = 0; k < 10; k++) if (C.bayer(x, k + (t * 6 | 0)) < a * (1 - k / 10) * .8) { g.fillStyle = k < 3 ? '#9affc8' : k < 6 ? '#4ad8a0' : '#3a8aa8'; g.fillRect(ox + x, oy + Math.round(yy + k), 1, 1); } } }
      if (s.k === 'star') { var sx = ox + 6 + p * 40, sy = oy + 4 + p * 12; for (var i = 0; i < 6; i++) { g.fillStyle = i ? '#a8b8e8' : '#ffffff'; g.fillRect(Math.round(sx - i * 1.6), Math.round(sy - i * .5), 1, 1); } }
      if (s.k === 'deer') rows(g, DEER, Math.round(ox - 12 + p * (ow + 24)), oy + oh - 14, '#2a1e1a', { '#': '#3a2a22' });
      if (s.k === 'owl') { rows(g, OWL, ox + ow - 14, oy + 10, '#6a5a4a', { o: Math.sin(t * 2) > .95 ? '#6a5a4a' : '#ffcf4a' }); g.fillStyle = '#2a1a10'; g.fillRect(ox + ow - 20, oy + 18, 20, 1); }
      if (s.k === 'carolers') { for (var c = 0; c < 3; c++) { var cx = Math.round(ox + ow * .2 + c * 9 + (p < .15 ? (p - .15) * 80 : p > .85 ? (p - .85) * 80 : 0)); g.fillStyle = ['#8a2a2a', '#2a4a6a', '#4a6a2a'][c]; g.fillRect(cx, oy + oh - 15, 5, 8); g.fillStyle = '#e8c8a0'; g.fillRect(cx + 1, oy + oh - 19, 3, 3); g.fillStyle = ['#e8e0d0', '#c8302a', '#e8e0d0'][c]; g.fillRect(cx, oy + oh - 20, 5, 2); }
        RM.glow(g, ox + ow * .2 + 30, oy + oh - 14, 6, '#ffcf6a', .9); g.fillStyle = '#fff0a0'; g.fillRect(Math.round(ox + ow * .2 + 30), oy + oh - 15, 1, 2); }
    }
    for (i = 0; i < K.snow.length; i++) { var sn = K.snow[i]; g.fillStyle = sn.z ? '#ffffff' : '#b8c4e0'; g.fillRect(ox + (sn.x | 0), oy + (sn.y | 0), 1, 1); }
    if (s && s.k === 'cardinal') { var hop = Math.abs(Math.sin(s.t * 4)) > .9 ? 1 : 0; rows(g, BIRD, ox + 10 + Math.round(s.t * 2), oy + oh - 8 - hop, '#c8202a', { '>': '#f0a020' }); }
    /* frost creeping in from the corners */
    for (var fy = 0; fy < oh; fy++) for (var fx = 0; fx < ow; fx++) { var dx = Math.min(fx, ow - 1 - fx), dy = Math.min(fy, oh - 1 - fy), d = Math.min(dx + dy * .8, dx * 1.6, dy * 1.6); var lvl = 1 - d / 9 + A.noise(5, 2)(fx, fy) * .25; if (lvl > 0 && C.bayer(fx, fy) < lvl * .7) { g.fillStyle = lvl > .7 ? '#f4f8ff' : '#c8d6ec'; g.fillRect(ox + fx, oy + fy, 1, 1); } }
    g.restore();
    /* mullions */
    RM.rect(g, w.x + (w.w >> 1) - 1, w.y, 3, w.h, function (x, y, xx) { return C.rp(pal.woodL, xx === 1 ? .7 : .25, x, y); });
    RM.rect(g, w.x, w.y + (w.h >> 1) - 1, w.w, 3, function (x, y, xx, yy) { return C.rp(pal.woodL, yy === 1 ? .7 : .25, x, y); });
    for (x = 0; x < w.w; x += 3) { g.fillStyle = '#ffffff'; g.fillRect(w.x + x, w.y + w.h - 1 - (x % 2), 1, 1); }
  }
  function bookSprite() { if (K._book) return K._book; var w = 34, h = 11; K._book = A.fromFn(w, h, function (x, y) { if (y >= 8) return x > 1 && x < w - 1 ? (y === 8 ? P('#fbf3dc') : y === 9 ? P('#d3b781') : P('#2a110b')) : 0; var e = x === 0 || x === w - 1 || y === 0; if (e) return P('#2a110b'); if (x === 2 || x === w - 3 || y === 2 || y === 6) return P('#c89a4a'); return C.rp(pal.leather, .55 + (C.hash(x, y, 4) - .5) * .3 + (x < 6 ? .15 : 0), x, y); }); return K._book; }
  C.scenes.kitchen = {
    enter: function () { if (!K.bg) rebuild(); C.ui.refresh(); },
    update: function (dt) { if (K.newDish) K.newT = (K.newT || 0) + dt;
      var L = K.L; K.t += dt; var M = C.mouse;
      CAT.update(dt, L);
      for (var i = 0; i < K.snow.length; i++) { var s = K.snow[i]; s.y += (s.z ? 9 : 5) * dt; s.x += Math.sin(K.t + s.ph) * 2 * dt; if (s.y > 50) { s.y = -1; s.x = Math.random() * 56; } }
      K.nextS -= dt; if (K.surprise) { K.surprise.t += dt; if (K.surprise.t > K.surprise.dur) K.surprise = null; } else if (K.nextS <= 0) { K.trigger(); K.nextS = 35 + Math.random() * 40; }
      K.poke = Math.max(0, K.poke - dt * .7);
      C.sfx.loop('fire', .8 + K.poke * .6); C.sfx.loop('wind', .25);
      var b = L.box; if (Math.random() < dt * (2 + K.poke * 30)) K.sparks.push({ x: b.x + 10 + Math.random() * (b.w - 20), y: b.y + b.h - 10, vx: (Math.random() - .5) * 10, vy: -20 - Math.random() * 25, a: 0 });
      for (i = K.sparks.length - 1; i >= 0; i--) { var sp = K.sparks[i]; sp.a += dt; sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.vy += 6 * dt; if (sp.a > 1.2 || sp.y < b.y + 2) K.sparks.splice(i, 1); }
      K.kettleT -= dt; var kx = L.fire.x - 2, ky = L.floor - 13; if (K.kettleT < 0) { K.kettleT = 70 + Math.random() * 60; K.whistle = 3; C.sfx('kettle'); }
      K.whistle = Math.max(0, (K.whistle || 0) - dt);
      if (Math.random() < dt * (K.whistle > 0 ? 25 : 1.2)) K.steam.push({ x: kx + 17, y: ky + 6, a: 0, vx: 4 + Math.random() * 3 + (K.whistle > 0 ? 10 : 0) });
      for (i = K.steam.length - 1; i >= 0; i--) { var st = K.steam[i]; st.a += dt; st.x += st.vx * dt; st.y -= 8 * dt; st.vx *= Math.exp(-dt); if (st.a > 2) K.steam.splice(i, 1); }
      if (K.fall) { K.fall.vy += 200 * dt; K.fall.y += K.fall.vy * dt; if (K.fall.y > L.floor + 4 && !K.fall.hit) { K.fall.hit = 1; K.fall.y = L.floor + 4; C.sfx('wood'); C.sfx('clink2', { vol: .5 }); } if (K.fall.hit) K.fall.t = (K.fall.t || 0) + dt; if (K.fall.t > 6) K.fall = null; }
      /* clock tick */
      var sec = new Date().getSeconds(); if (sec !== K.sec) { K.sec = sec; C.sfx('clock', { vol: .6 }); }
      /* regions */
      var bk = L.book; C.region(bk.x - 2, bk.y - 4, bk.w + 4, bk.h + 6, 'book', { t: 'cookbook', d: "Grandma's recipes. Click to open." });
      var cb = CAT.box(); C.region(cb.x, cb.y, cb.w, cb.h, 'cat', { t: 'the cat', d: 'Pet her. She purrs.', n: C.save.data.pets ? 'Petted ' + C.save.data.pets + ' times' : null });
      C.region(b.x, b.y, b.w, b.h, 'fire', { t: 'fire', d: 'Poke the logs.' });
      C.region(L.win.x, L.win.y, L.win.w, L.win.h, 'win', { t: 'window', d: 'Snow on the pines. Watch for visitors.' });
      C.region(kx, ky, 18, 15, 'kettle', { t: 'kettle', d: 'Put the kettle on.' });
      C.region(L.clock.x - 1, L.clock.y - 1, 16, 32, 'clock', function () { var d = new Date(); return { t: 'clock', d: d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) }; });
      var made = C.save.data.made; C.recipes.list.forEach(function (r, i) { var sl = slot(L, i); if (made[r.id]) C.region(sl.x, sl.y - 18, 22, 20, 'dish:' + r.id, { t: r.name.toLowerCase(), d: r.blurb, n: 'Made ' + made[r.id] + (made[r.id] > 1 ? ' times' : ' time') }); });
      if (M.down && K.petting) { var cb2 = CAT.box(); if (M.x > cb2.x && M.x < cb2.x + cb2.w && M.y > cb2.y && M.y < cb2.y + cb2.h) CAT.pet(); }
    },
    draw: function (g) {
      var L = K.L, t = K.t; g.drawImage(K.bg, 0, 0);
      drawWindow(g, L, t);
      RM.fire(g, L, t, K.poke);
      var fl = .55 + .2 * Math.sin(t * 7.1) * Math.sin(t * 3.3 + 1) + K.poke * .3, lv = Math.round(fl * 6) / 6;
      RM.glow(g, L.box.x + L.box.w / 2, L.box.y + L.box.h - 6, 70, '#ffb347', lv * .45, 48);
      RM.glow(g, L.lamp.x + 5, L.lamp.y + 8, 30, '#ffd38a', .4);
      /* lanterns + twinkling string lights on the mantel */
      (L.lanterns || []).forEach(function (ln, i) { RM.glow(g, ln[0] + 4, ln[1] - 7, 14, '#ffc860', .55 + .1 * Math.round(Math.sin(t * 5 + i * 2)), 12); g.fillStyle = Math.sin(t * 11 + i) > .3 ? '#fff6d0' : '#ffd070'; g.fillRect(ln[0] + 3, ln[1] - 8, 3, 3); });
      var BC = ['#ffd27a', '#ffe8b0', '#ffb84a', '#fff4d8']; (L.bulbs || []).forEach(function (b, i) { var on = Math.sin(t * (1.3 + (i % 5) * .37) + i * 2.1); g.fillStyle = on > -.4 ? BC[i % 4] : '#8a5a2a'; g.fillRect(b[0], b[1], 1, 1); if (on > .6) { g.fillStyle = 'rgba(255,214,130,.45)'; g.fillRect(b[0] - 1, b[1], 1, 1); g.fillRect(b[0] + 1, b[1], 1, 1); g.fillRect(b[0], b[1] + 1, 1, 1); } });
      K.sparks.forEach(function (s) { g.fillStyle = s.a < .5 ? '#fff0a0' : '#ff8a2a'; g.fillRect(Math.round(s.x), Math.round(s.y), 1, 1); });
      /* lamp flame */
      g.fillStyle = Math.sin(t * 9) > 0 ? '#fff6c8' : '#ffcf6a'; g.fillRect(L.lamp.x + 4, L.lamp.y + 8, 2, 3);
      /* clock hands + pendulum */
      var d = new Date(), ck = L.clock, cx = ck.x + 7, cy = ck.y + 7, hA = ((d.getHours() % 12) + d.getMinutes() / 60) / 12 * 6.283, mA = d.getMinutes() / 60 * 6.283;
      for (var i = 0; i <= 3; i++) { g.fillStyle = '#24140d'; g.fillRect(Math.round(cx + Math.sin(mA) * i * 1.3), Math.round(cy - Math.cos(mA) * i * 1.3), 1, 1); if (i < 3) g.fillRect(Math.round(cx + Math.sin(hA) * i), Math.round(cy - Math.cos(hA) * i), 1, 1); }
      var pa = Math.sin(t * Math.PI) * .35; for (i = 0; i < 8; i++) { g.fillStyle = '#c89a4a'; g.fillRect(Math.round(cx + Math.sin(pa) * i), ck.y + 17 + Math.round(Math.cos(pa) * i), 1, 1); } g.fillStyle = '#f0c060'; g.fillRect(Math.round(cx + Math.sin(pa) * 9) - 1, ck.y + 17 + Math.round(Math.cos(pa) * 9) - 1, 3, 3);
      /* dish shelf */
      var made = C.save.data.made; C.recipes.list.forEach(function (r, i) { var sl = slot(L, i), p = RM.mini(r.id); if (!made[r.id]) { g.fillStyle = 'rgba(40,20,10,.25)'; return; } var nw = K.newDish === r.id && K.newT < 9, bob = 0;
        if (nw) { var k2 = Math.max(0, 1 - K.newT / 9), pul = .5 + .5 * Math.sin(K.newT * 5); RM.glow(g, sl.x + 11, sl.y - (p.h >> 1), 20, '#ffe08a', (.6 + .3 * pul) * k2, 14); bob = K.newT < 1.2 ? -Math.round(Math.abs(Math.sin(K.newT * 8)) * 3 * (1.2 - K.newT)) : 0; }
        p.draw(g, sl.x + 11 - (p.w >> 1), sl.y - p.h + bob);
        if (nw) for (var sk = 0; sk < 6; sk++) { var ph = K.newT * 1.6 + sk * 1.7, a2 = Math.sin(ph * 3.1); if (a2 > .1) { var sx = sl.x + 11 + Math.round(Math.cos(sk * 2.3 + ph * .4) * 13), sy = sl.y - (p.h >> 1) + Math.round(Math.sin(sk * 1.9 + ph * .5) * 9); g.fillStyle = '#fff6d0'; g.fillRect(sx, sy, 1, 1); if (a2 > .75) { g.fillRect(sx - 1, sy, 3, 1); g.fillRect(sx, sy - 1, 1, 3); } } } if (made[r.id] > 1) C.digits(g, 'x' + Math.min(99, made[r.id]), sl.x + 14, sl.y - 6, '#fff3dc'); });
      /* the cookbook on the counter */
      var bk = L.book, hov = C.hover && C.hover.id === 'book'; bookSprite().draw(g, bk.x, bk.y - (hov ? 1 : 0)); if (hov || K.t % 4 < .1) { g.fillStyle = '#ffe8a8'; g.fillRect(bk.x + 3 + ((K.t * 20) | 0) % 28, bk.y + 1 - (hov ? 1 : 0), 1, 1); }
      /* kettle on the hearth */
      var kx = L.fire.x - 2, ky = L.floor - 13; KET.draw(g, kx, ky);
      K.steam.forEach(function (s) { var a = 1 - s.a / 2; for (var k = 0; k < 3; k++) if (C.bayer(k, s.a * 10 | 0) < a) { g.fillStyle = '#f4ecdc'; g.fillRect(Math.round(s.x + k - 1), Math.round(s.y - k % 2), 1, 1); } });
      if (K.fall) { var sp = C.food.tools.spoon; if (K.fall.hit) { g.save(); g.translate(Math.round(K.fall.x), Math.round(K.fall.y)); g.rotate(Math.PI / 2); g.drawImage(sp.canvas(), -5, -30); g.restore(); } else sp.draw(g, K.fall.x, K.fall.y - 30); }
      CAT.draw(g);
      /* warm firelight on the floor */
      RM.glow(g, L.box.x + L.box.w / 2, L.floor + 6, 60, '#ffb060', lv * .25, 10);
    },
    down: function (m) {
      var h = C.hit(m.x, m.y); K.petting = false; if (!h) return;
      if (h.id === 'book') { C.sfx('bookOpen'); C.go('book'); }
      else if (h.id === 'cat') { K.petting = true; CAT.pet(); if (Math.random() < .25) C.sfx('cloth2', { vol: .4 }); }
      else if (h.id === 'fire') { K.poke = 1; C.sfx('wood', { jitter: .2 }); C.sfx('hiss', { vol: .4 }); }
      else if (h.id === 'win') { if (!K.surprise) { K.trigger(); K.nextS = 40 + Math.random() * 40; } }
      else if (h.id === 'kettle') { K.whistle = 2.5; C.sfx('kettle'); }
      else if (h.id.indexOf('dish:') === 0) { C.sfx('plate', { vol: .6 }); }
    },
    up: function () { K.petting = false; }
  };
  function slot(L, i) { var sh = L.shelf, row = Math.floor(i / 4), col = i % 4; return { x: sh.x + 2 + col * 22, y: sh.y + 28 + row * 30 }; }
  K.slot = slot;
  /* the cat sometimes knocks the wooden spoon off the counter */
  C.hooks.push(function (dt) { if (C.sceneName !== 'kitchen' || K.fall || !K.L) return; if (Math.random() < dt / 150) { var L = K.L; K.fall = { x: L.counter.x + L.counter.w - 30, y: L.counter.y - 2, vy: -20 }; CAT.st.state = 'sit'; CAT.st.t = 0; CAT.st.nextT = 5; } });
})();
