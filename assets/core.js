/* The Cottage — core: one integer-scaled pixel grid, delta-time loop, pointer input, hit regions, pixel helpers.
   Everything (title, kitchen, cookbook, cooking) is drawn on this single grid; DOM is only used for text and icon buttons. */
(function () {
  'use strict';
  var C = window.COT = {};
  var Q = C.q = new URLSearchParams(location.search);
  C.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  C.lerp = function (a, b, t) { return a + (b - a) * t; };
  C.ease = function (t) { t = C.clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  C.damp = function (a, b, k, dt) { return b + (a - b) * Math.exp(-k * dt); }; /* frame-rate independent approach */
  C.rng = function (seed) { var s = seed >>> 0 || 1; return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  C.hash = function (x, y, s) { var h = (x * 374761393 + y * 668265263 + (s || 0) * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  C.R = Math.random;
  /* 8x8 Bayer matrix */
  var B8 = new Float32Array(64);
  (function () { function ex(m) { var n = m.length, r = []; for (var y = 0; y < n * 2; y++) { r.push([]); for (var x = 0; x < n * 2; x++) r[y].push(m[y % n][x % n] * 4 + (y < n ? (x < n ? 0 : 2) : (x < n ? 3 : 1))); } return r; } var b = ex(ex(ex([[0]]))); for (var y = 0; y < 8; y++) for (var x = 0; x < 8; x++) B8[y * 8 + x] = (b[y][x] + .5) / 64; })();
  C.bayer = function (x, y) { return B8[((y & 7) << 3) | (x & 7)]; };

  /* ---------- the one pixel grid ---------- */
  var canvas = document.getElementById('game'), ctx = canvas.getContext('2d', { alpha: false });
  C.canvas = canvas; C.ctx = ctx; C.W = 320; C.H = 200; C.S = 4; C.layoutListeners = [];
  C.layout = function () {
    var vw = Math.max(200, window.innerWidth), vh = Math.max(200, window.innerHeight);
    var S = Math.max(1, Math.ceil(Math.max(vw / 400, vh / 250)));
    S = Math.max(1, Math.min(S, Math.floor(vw / 190)));
    if (Q.get('s')) S = Math.max(1, +Q.get('s') | 0);
    var W = Math.floor(vw / S), H = Math.floor(vh / S), ch = W !== C.W || H !== C.H || S !== C.S;
    C.S = S; C.W = W; C.H = H; C.portrait = H > W * 1.15;
    if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
    canvas.style.width = W * S + 'px'; canvas.style.height = H * S + 'px';
    document.documentElement.style.setProperty('--S', S);
    ctx.imageSmoothingEnabled = false;
    if (ch) C.layoutListeners.forEach(function (f) { f(W, H, S); });
  };
  var lt = 0; addEventListener('resize', function () { clearTimeout(lt); lt = setTimeout(C.layout, 60); });
  C.layout();

  C.mk = function (w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); var g = c.getContext('2d'); g.imageSmoothingEnabled = false; c.g = g; return c; };

  /* ---------- colours (packed ABGR for ImageData Uint32 views) ---------- */
  C.rgb = function (hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  C.pack = function (r, g, b, a) { return ((a == null ? 255 : a) << 24 | b << 16 | g << 8 | r) >>> 0; };
  C.P = function (hex) { var c = C.rgb(hex); return C.pack(c[0], c[1], c[2]); };
  C.unpack = function (u) { return [u & 255, u >> 8 & 255, u >> 16 & 255, u >>> 24]; };
  C.css = function (u) { var c = C.unpack(u); return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; };
  C.mix = function (u, v, t) { var a = C.unpack(u), b = C.unpack(v); return C.pack(Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t), a[3]); };
  C.ramp = function (hexes) { return hexes.map(C.P); };
  /* pick a ramp entry for value v (0..1) with ordered dithering between neighbours */
  C.rp = function (ramp, v, x, y) { var n = ramp.length - 1, f = C.clamp(v, 0, 1) * n, i = Math.floor(f), fr = f - i; fr = fr < .3 ? 0 : fr > .7 ? 1 : (fr - .3) * 2.5; if (fr > C.bayer(x, y)) i++; /* clean bands, dither only at the seams */ return ramp[C.clamp(i, 0, n)]; };

  /* ---------- dither dissolve ---------- */
  var dpat = {};
  C.dissolve = function (g, t, color, x, y, w, h) {
    if (t <= 0) return; x = x || 0; y = y || 0; w = w || C.W; h = h || C.H; color = color || '#140c08';
    if (t >= 1) { g.fillStyle = color; g.fillRect(x, y, w, h); return; }
    var lvl = Math.round(t * 64), key = color + lvl, p = dpat[key];
    if (!p) { var c = C.mk(8, 8); c.g.fillStyle = color; for (var yy = 0; yy < 8; yy++) for (var xx = 0; xx < 8; xx++) if (B8[yy * 8 + xx] < lvl / 64) c.g.fillRect(xx, yy, 1, 1); p = dpat[key] = ctx.createPattern(c, 'repeat'); }
    g.fillStyle = p; g.fillRect(x, y, w, h);
  };

  /* ---------- tiny 3x5 pixel digits for the timer ---------- */
  var GL = { '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001', '5': '111100111001111', '6': '111100111101111', '7': '111001001001001', '8': '111101111101111', '9': '111101111001111', ':': '000010000010000', 'x': '000101010101000', '+': '000010111010000' };
  C.digits = function (g, s, x, y, col) { s = String(s); g.fillStyle = col; for (var i = 0; i < s.length; i++) { var gl = GL[s[i]]; if (gl) for (var k = 0; k < 15; k++) if (gl[k] === '1') g.fillRect(x + i * 4 + k % 3, y + (k / 3 | 0), 1, 1); } };

  /* ---------- input: pointer in grid coordinates ---------- */
  var M = C.mouse = { x: -99, y: -99, down: false, type: 'mouse', moved: 0, t0: 0, sx: 0, sy: 0, vx: 0, vy: 0, inside: false };
  function gp(e) { return { x: e.clientX / C.S, y: e.clientY / C.S }; }
  canvas.addEventListener('pointerdown', function (e) {
    var p = gp(e); M.x = p.x; M.y = p.y; M.sx = p.x; M.sy = p.y; M.down = true; M.type = e.pointerType; M.moved = 0; M.t0 = performance.now(); M.inside = true;
    try { canvas.setPointerCapture(e.pointerId); } catch (er) { }
    C.unlockAudio && C.unlockAudio();
    var sc = C.scene; if (sc && sc.down) sc.down(M); e.preventDefault();
  });
  canvas.addEventListener('pointermove', function (e) {
    var p = gp(e); var dx = p.x - M.x, dy = p.y - M.y; M.moved += Math.abs(dx) + Math.abs(dy); M.x = p.x; M.y = p.y; M.type = e.pointerType; M.inside = true;
    var sc = C.scene; if (sc && sc.move) sc.move(M, dx, dy);
  });
  function up(e) { if (!M.down) return; var p = gp(e); M.x = p.x; M.y = p.y; M.down = false; var sc = C.scene; if (sc && sc.up) sc.up(M); if (M.type !== 'mouse') { M.inside = false; } }
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse' && !M.down) { M.inside = false; } });
  canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  addEventListener('keydown', function (e) { var sc = C.scene; if (sc && sc.key) sc.key(e); });

  /* ---------- hit regions (rebuilt every frame by the scene) for hover, cursor and tooltips ---------- */
  C.regions = [];
  C.region = function (x, y, w, h, id, tip) { C.regions.push({ x: x, y: y, w: w, h: h, id: id, tip: tip }); };
  C.hit = function (x, y) { for (var i = C.regions.length - 1; i >= 0; i--) { var r = C.regions[i]; if (x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h) return r; } return null; };

  /* ---------- scenes + fixed-feel loop ---------- */
  C.scenes = {}; C.scene = null; C.t = 0; C.fps = 60; C.trans = 0; C.transTo = null;
  C.go = function (name, arg, instant) {
    if (instant || !C.scene) { C.scene = C.scenes[name]; C.sceneName = name; C.scene.enter && C.scene.enter(arg); C.onScene && C.onScene(name); return; }
    C.transTo = { name: name, arg: arg, t: 0 };
  };
  C.step = function (dt) {
    C.t += dt;
    if (C.transTo) { var tr = C.transTo; tr.t += dt; if (tr.t >= .35 && !tr.done) { tr.done = 1; C.scene = C.scenes[tr.name]; C.sceneName = tr.name; C.scene.enter && C.scene.enter(tr.arg); C.onScene && C.onScene(tr.name); } if (tr.t >= .7) C.transTo = null; }
    C.regions.length = 0;
    if (C.scene && C.scene.update) C.scene.update(dt);
    C.hooks.forEach(function (f) { f(dt); });
  };
  C.hooks = [];
  C.draw = function () {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
    if (C.scene && C.scene.draw) C.scene.draw(ctx);
    if (C.ui && C.ui.drawScript) C.ui.drawScript(ctx);
    if (C.transTo) { var t = C.transTo.t; C.dissolve(ctx, t < .35 ? t / .35 : 1 - (t - .35) / .35, '#140c08'); }
    var h = M.inside ? C.hit(M.x, M.y) : null; canvas.style.cursor = h && h.id ? 'pointer' : 'default'; C.hover = h;
  };
  var last = performance.now(), fa = 0, fn = 0;
  function frame(now) {
    var dt = Math.min(.05, Math.max(0, (now - last) / 1000)); last = now;
    fa += dt; fn++; if (fa > .5) { C.fps = fn / fa; fa = 0; fn = 0; }
    if (!C.paused) { C.step(dt); C.draw(); }
    requestAnimationFrame(frame);
  }
  C.start = function () { requestAnimationFrame(function (n) { last = n; frame(n); }); };
  /* headless helper: advance simulated time deterministically */
  C.stepSim = function (sec, hz) { hz = hz || 60; for (var i = 0; i < sec * hz; i++) C.step(1 / hz); C.draw(); };
  C.reduced = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
})();
