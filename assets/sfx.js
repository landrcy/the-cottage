/* The Cottage — sound: real CC0 recordings (BigSoundBank + Kenney, see CREDITS.txt), decoded into Web Audio buffers,
   mixed under the music and muted with it. C.sfx(name,{vol,rate,jitter}) one-shot (returns a handle with stop()),
   C.sfx.loop(name, level) holds a loop for this frame (ramps in/out with time constants, frame-rate independent). ?nosfx disables. */
(function () {
  'use strict';
  var C = window.COT;
  var MIX = { chop1: .7, chop2: .7, chop3: .7, chop4: .5, slice1: .7, slice2: .7, knife: .35, knife2: .3, saw: .5, crunch1: .6, crunch2: .6, squish1: .55, squish2: .55, squish3: .55, squish4: .45,
    sizzle: .45, fry: .35, simmer: .4, boil: .35, kettle: .18, fire: .5, purr: .55, wind: .16, pour: .55, pourDry: .55, stir: .35, tick: .18, clock: .1, ding: .5, bell: .4, clink1: .45, clink2: .45, jar: .4, glass: .4,
    plate: .5, spoon: .35, creak: .5, creak2: .35, owl: .25, chime: .3, sleigh: .18, shake: .5, hiss: .35, bookOpen: .55, bookClose: .55, flip1: .55, flip2: .55, flip3: .55, pot: .35, pot2: .35, latch: .45, cloth: .4, cloth2: .4,
    grab: .45, thump: .45, door: .4, doorClose: .4, click: .3, wood: .4, plop: .45, step: .25 };
  var LIST = Object.keys(MIX), LOOPS = { fry: 1, simmer: 1, boil: 1, fire: 1, purr: 1, wind: 1, stir: 1 };
  var GAP = { tick: .06, clock: .3, shake: .09, squish4: .08, knife2: .1, cloth: .15, spoon: .25 };
  var MASTER = .8;
  var S = C.sfx = function (n, o) { return play(n, o); };
  S.buffers = {}; S.loaded = 0; S.total = LIST.length; S.ctx = null; S.master = null; S.last = {}; S.loops = {}; S.log = []; S.errors = []; S.ready = false; S.LIST = LIST; S.MIX = MIX;
  S.disabled = C.q.has('nosfx');
  function muted() { return !!(C.music && C.music.muted); }
  function ctxOk() {
    if (S.ctx || S.disabled) return S.ctx; var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    try { S.ctx = new AC(); S.master = S.ctx.createGain(); S.master.gain.value = muted() ? 0 : MASTER; S.master.connect(S.ctx.destination); } catch (e) { S.errors.push(String(e)); S.ctx = null; } return S.ctx;
  }
  function decode(n, ab) { var c = ctxOk(); if (!c) return; var done = function (b) { S.buffers[n] = b; S.loaded++; if (S.loaded >= S.total) S.ready = true; }, fail = function (e) { S.errors.push(n + ': ' + (e && e.message || e)); S.loaded++; };
    try { var p = c.decodeAudioData(ab, done, fail); if (p && p.catch) p.catch(fail); } catch (e) { fail(e); } }
  function b64(s) { var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
  S.load = function () {
    if (S.disabled || S.loading || !ctxOk()) return; S.loading = true;
    if (location.protocol === 'file:') { var sc = document.createElement('script'); sc.src = 'assets/sfx/sfx-data.js'; sc.onload = function () { var D = window.COT_SFX_DATA || {}; LIST.forEach(function (n) { if (D[n]) decode(n, b64(D[n])); else S.loaded++; }); }; document.head.appendChild(sc); return; }
    var ext = (new Audio()).canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : 'mp3';
    LIST.forEach(function (n) { fetch('assets/sfx/' + n + '.' + ext).then(function (r) { return r.arrayBuffer(); }).then(function (ab) { decode(n, ab); }).catch(function (e) { S.errors.push(n + ': ' + e); S.loaded++; }); });
  };
  S.unlock = C.unlockAudio = function () { var c = ctxOk(); if (c && c.state === 'suspended' && c.resume) c.resume().catch(function () { }); if (!S.loading) S.load(); };
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { addEventListener(ev, S.unlock, { capture: true, passive: true }); });
  var NOOP = { stop: function () { } };
  function play(n, o) {
    o = o || {}; var t = performance.now() / 1000, gap = o.gap != null ? o.gap : (GAP[n] || .04);
    if (S.last[n] && t - S.last[n] < gap) return NOOP; S.last[n] = t; S.log.push(n); if (S.log.length > 300) S.log.shift();
    var c = S.ctx, buf = S.buffers[n]; if (!c || !buf || muted() || c.state !== 'running') return NOOP;
    try { var src = c.createBufferSource(), g = c.createGain(); src.buffer = buf; src.playbackRate.value = (o.rate || 1) * (o.jitter ? 1 + (Math.random() - .5) * o.jitter : 1);
      g.gain.value = (MIX[n] || .4) * (o.vol != null ? o.vol : 1); src.connect(g); g.connect(S.master); src.start(0, o.at || 0);
      return { stop: function (tc) { try { g.gain.setTargetAtTime(0, c.currentTime, tc || .08); src.stop(c.currentTime + (tc || .08) * 6); } catch (e) { } } };
    } catch (e) { S.errors.push(String(e)); return NOOP; }
  }
  /* pick one of a numbered family: C.sfx.any('chop', 3) */
  S.any = function (base, n, o) { return play(base + (1 + (Math.random() * n | 0)), o); };
  S.loop = function (n, lv) { var L = S.loops[n] || (S.loops[n] = { want: 0, src: null, gain: null }); L.want = Math.max(L.want, lv || 0); };
  function tick() {
    var c = S.ctx; if (S.master && c) { var m = muted(); if (m !== S._m) { S._m = m; S.master.gain.cancelScheduledValues(0); S.master.gain.value = m ? 0 : MASTER; } }
    for (var n in S.loops) { var L = S.loops[n], want = muted() ? 0 : L.want; L.level = L.want; L.want = 0;
      if (!c || !S.buffers[n] || c.state !== 'running') continue;
      if (want > 0 && !L.src) { var src = c.createBufferSource(), g = c.createGain(); src.buffer = S.buffers[n]; src.loop = true; g.gain.value = 0; src.connect(g); g.connect(S.master); src.start(0, Math.random() * S.buffers[n].duration); L.src = src; L.gain = g; S.log.push(n + ':loop'); }
      if (L.src) { L.gain.gain.setTargetAtTime(want * (MIX[n] || .3), c.currentTime, want > 0 ? .12 : .15);
        if (want <= 0) { L.off = (L.off || 0) + 1; if (L.off > 120) { try { L.src.stop(); } catch (e) { } L.src.disconnect(); L.src = null; L.off = 0; } } else L.off = 0; } }
  }
  C.hooks.push(tick);
  document.addEventListener('visibilitychange', function () { if (!S.ctx) return; if (document.hidden) S.ctx.suspend && S.ctx.suspend(); else S.unlock(); });
})();
