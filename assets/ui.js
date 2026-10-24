/* The Cottage — icon-only pixel buttons (DOM), the step label, the script title, and tooltips (hover / long-press / focus). */
(function () {
  'use strict';
  var C = window.COT, U = C.ui = {}, M = C.mouse;
  var ICON = {
    sound: ['.............', '......#......', '.....##..#...', '..####.#..#..', '..#..#..#.#..', '..#..#..#.#..', '..#..#..#.#..', '..####.#..#..', '.....##..#...', '......#......', '.............'],
    mute: ['.............', '......#......', '.....##......', '..####.#.#.#.', '..#..#..#.#..', '..#..#...#...', '..#..#..#.#..', '..####.##...#', '.....##......', '......#......', '.............'],
    home: ['.............', '......#......', '.....###.##..', '....#####.#..', '...#######...', '..#########..', '...#######...', '...##...##...', '...##.#.##...', '...##...##...', '...#######...'],
    book: ['.............', '..#########..', '..#.......#..', '..#.#####.#..', '..#.......#..', '..#.####..#..', '..#.......#..', '..#.###...#..', '..#.......#..', '..#########..', '...........#.'],
    back: ['.............', '.....#.......', '....##.......', '...#########.', '..##########.', '...#########.', '....##.......', '.....#.......', '.............', '.............', '.............'],
    left: ['.............', '.......#.....', '......##.....', '.....###.....', '....####.....', '.....###.....', '......##.....', '.......#.....', '.............', '.............', '.............'],
    right: ['.............', '.....#.......', '.....##......', '.....###.....', '.....####....', '.....###.....', '.....##......', '.....#.......', '.............', '.............', '.............'],
    cook: ['.............', '..##.#.#.....', '..##.#.#.....', '..##.###.....', '..##..#......', '..##..#...#..', '..##..#..###.', '..##..#..###.', '..##..#...#..', '..##..#...#..', '.............'],
    reset: ['.............', '....####.....', '...#....#.#..', '..#......##..', '..#.....###..', '..#..........', '..#......#...', '...#....#....', '....####.....', '.............', '.............']
  };
  /* draw a 13x13 icon: wooden plaque with cream glyph and a 1px dark rim */
  function iconCanvas(name) {
    var c = C.mk(13, 13), g = c.g, rows = ICON[name];
    g.fillStyle = '#140c08'; g.fillRect(1, 0, 11, 13); g.fillRect(0, 1, 13, 11);
    g.fillStyle = '#5e3522'; g.fillRect(1, 1, 11, 11); g.fillStyle = '#7a4a2c'; g.fillRect(1, 1, 11, 1); g.fillRect(1, 1, 1, 11); g.fillStyle = '#43251a'; g.fillRect(1, 11, 11, 1); g.fillRect(11, 1, 1, 11);
    for (var y = 0; y < rows.length; y++) for (var x = 0; x < 13; x++) if (rows[y][x] === '#') { g.fillStyle = '#2a160d'; g.fillRect(x, y + 2, 1, 1); g.fillStyle = '#fff3dc'; g.fillRect(x, y + 1, 1, 1); }
    return c;
  }
  var root = document.getElementById('ui'), lroot = document.createElement('div'); lroot.id = 'lbtns'; document.body.appendChild(lroot);
  var btns = {};
  function btn(id, icon, tip, fn, left) {
    var b = document.createElement('button'); b.className = 'pbtn'; b.id = 'b-' + id; b.setAttribute('aria-label', tip.t); b.dataset.tip = id;
    b.appendChild(iconCanvas(icon)); b.addEventListener('click', function (e) { e.stopPropagation(); C.unlockAudio && C.unlockAudio(); C.sfx('click'); fn(); });
    (left ? lroot : root).appendChild(b); btns[id] = { el: b, tip: tip, icon: icon }; return b;
  }
  U.tips = {};
  U.setIcon = function (id, icon) { var b = btns[id]; if (!b || b.icon === icon) return; b.icon = icon; b.el.replaceChild(iconCanvas(icon), b.el.firstChild); };
  btn('home', 'home', { t: 'kitchen', d: 'Back to the warm kitchen.' }, function () { if (C.cook && C.cook.active) C.cook.leave(); C.go('kitchen'); }, true);
  btn('book', 'book', { t: 'cookbook', d: "Open grandma's old cookbook." }, function () { C.go('book'); }, true);
  btn('mute', 'sound', { t: 'sound', d: 'Music and sounds on or off.' }, function () { C.music.toggle(); });
  U.refresh = function () {
    U.setIcon('mute', C.music.muted ? 'mute' : 'sound'); btns.mute.tip.d = C.music.muted ? 'Sound is off. Click to turn it on.' : 'Music and sounds are on. Click to mute.';
    var s = C.sceneName; btns.home.el.hidden = !(s === 'cook' || s === 'book'); btns.book.el.hidden = !(s === 'kitchen'); root.hidden = s === 'title' && !C.title.ready;
  };
  C.onScene = function () { U.refresh(); U.label(''); U.script(''); };
  if (document.fonts && document.fonts.load) document.fonts.load("20px 'Sacramento'");
  /* label (short lowercase step word) and script line (Sacramento) in grid coordinates */
  var lab = document.getElementById('label'), scr = document.getElementById('script');
  U.label = function (t, y) { if (!t) { lab.classList.remove('on'); return; } if (lab.textContent !== t) lab.textContent = t; lab.style.top = ((y || 4) * C.S) + 'px'; lab.classList.add('on'); };
  /* script text (Sacramento) is rasterised onto the game's own pixel grid: drawn at grid resolution, thresholded to hard
     pixels (no antialiasing), given a 1px shadow, then scaled up with the canvas like every other sprite. */
  var SC = { t: '' }, SCC = {};
  U.script = function (t, y, size, o) { scr.classList.remove('on'); o = o || {}; SC = { t: t || '', y: y, size: Math.round(size), x: o.x, w: o.w, align: o.align || 'center', ink: !!o.ink }; };
  function scriptPix(t, size, maxW, ink) {
    var k = t + '|' + size + '|' + maxW + '|' + ink; if (SCC[k]) return SCC[k];
    var c = document.createElement('canvas'), g = c.getContext('2d'), font = size + "px 'Sacramento'"; g.font = font;
    var words = t.split(' '), lines = [], cur = '';
    words.forEach(function (wd) { var tr = cur ? cur + ' ' + wd : wd; if (maxW && g.measureText(tr).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = tr; }); lines.push(cur);
    var lh = Math.round(size * .9), W = Math.ceil(Math.max.apply(null, lines.map(function (l) { return g.measureText(l).width; }))) + size, H = lh * lines.length + Math.round(size * .6);
    c.width = W; c.height = H; g.font = font; g.textBaseline = 'alphabetic'; g.fillStyle = '#000';
    lines.forEach(function (l, i) { g.fillText(l, Math.round(size * .5), Math.round(size * .78) + i * lh); });
    var id = g.getImageData(0, 0, W, H), a = id.data, on = new Uint8Array(W * H), i2;
    for (i2 = 0; i2 < W * H; i2++) on[i2] = a[i2 * 4 + 3] > 92 ? 1 : 0;
    var out = g.createImageData(W, H), d = out.data, fg = ink ? [58, 36, 20] : [255, 246, 226], sh = ink ? null : [42, 22, 34];
    for (var y = 0; y < H; y++) for (var x = 0; x < W; x++) { var p = y * W + x, q = p * 4, col = null;
      if (on[p]) col = fg; else if (sh && ((y > 0 && on[p - W]) || (x > 0 && y > 0 && on[p - W - 1]))) col = sh;
      if (col) { d[q] = col[0]; d[q + 1] = col[1]; d[q + 2] = col[2]; d[q + 3] = 255; } }
    g.putImageData(out, 0, 0); c.pad = Math.round(size * .5); c.lines = lines.length; return (SCC[k] = c);
  }
  U.drawScript = function (g) { if (!SC.t || !document.fonts || document.fonts.check && !document.fonts.check("12px 'Sacramento'")) return;
    var c = scriptPix(SC.t, SC.size, SC.w || 0, SC.ink), x = SC.align === 'left' ? Math.round(SC.x - c.pad) : Math.round((SC.x != null ? SC.x : C.W / 2) - c.width / 2);
    g.drawImage(c, x, Math.round(SC.y)); };
  /* ---------- tooltips ---------- */
  var tip = document.getElementById('tip'), cur = null, since = 0, lp = null, shownFor = null;
  function render(o) { if (typeof o === 'function') o = o(); if (!o) return false; tip.innerHTML = '<b>' + o.t + '</b>' + (o.d ? '<p>' + o.d + '</p>' : '') + (o.n ? '<p class="nt">' + o.n + '</p>' : ''); return true; }
  function place(px, py) { var r = tip.getBoundingClientRect(), x = px + 14, y = py + 18; if (x + r.width > innerWidth - 4) x = px - r.width - 10; if (x < 4) x = 4; if (y + r.height > innerHeight - 4) y = py - r.height - 12; if (y < 4) y = 4; tip.style.left = x + 'px'; tip.style.top = y + 'px'; }
  function show(o, px, py) { if (!render(o)) return hide(); tip.hidden = false; place(px, py); }
  function hide() { tip.hidden = true; shownFor = null; }
  U.hideTip = hide;
  document.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return; var t = e.target.closest && e.target.closest('.pbtn'), key = null, o = null;
    if (t) { key = 'b:' + t.dataset.tip; o = btns[t.dataset.tip].tip; } else if (e.target === C.canvas) { var h = C.hit(e.clientX / C.S, e.clientY / C.S); if (h && h.tip && !M.down) { key = 'r:' + h.id; o = h.tip; } }
    if (key !== cur) { cur = key; since = performance.now(); hide(); }
    U._pending = o ? { o: o, x: e.clientX, y: e.clientY } : null; if (shownFor && o) place(e.clientX, e.clientY);
  });
  C.hooks.push(function () { var p = U._pending; if (p && !shownFor && performance.now() - since > 380 && !M.down) { show(p.o, p.x, p.y); shownFor = cur; } if (!p && shownFor) hide(); });
  /* touch long-press */
  document.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') { hide(); U._pending = null; cur = null; return; } hide();
    var t = e.target.closest && e.target.closest('.pbtn'), o = null;
    if (t) o = btns[t.dataset.tip].tip; else if (e.target === C.canvas) { var h = C.hit(e.clientX / C.S, e.clientY / C.S); if (h && h.tip && !h.noLong) o = h.tip; }
    clearTimeout(lp); if (!o) return; var x = e.clientX, y = e.clientY, sx = x, sy = y;
    lp = setTimeout(function () { if (Math.abs(C.mouse.x * C.S - sx) + Math.abs(C.mouse.y * C.S - sy) < 14) { show(o, x, y); shownFor = 'lp'; C.longPressed = performance.now(); } }, 480);
  }, true);
  document.addEventListener('pointerup', function () { clearTimeout(lp); if (shownFor === 'lp') setTimeout(hide, 1600); }, true);
  addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  document.addEventListener('focusin', function (e) { var t = e.target.closest && e.target.closest('.pbtn'); if (t) { var r = t.getBoundingClientRect(); show(btns[t.dataset.tip].tip, r.left, r.bottom); shownFor = 'f'; } });
  document.addEventListener('focusout', hide);
})();
