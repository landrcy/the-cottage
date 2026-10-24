/* The Cottage — music: two real CC0 recordings from OpenGameArt (see CREDITS.txt), cross-faded, remembered mute. */
(function () {
  'use strict';
  var C = window.COT, KEY = 'cottage:mute';
  var TRACKS = [{ f: 'jrpgpiano', name: 'JRPG Piano', by: 'Joth', url: 'https://opengameart.org/content/jrpg-piano' }, { f: 'softpiano', name: 'Soft Piano Emotional 1', by: 'Tozan', url: 'https://opengameart.org/content/soft-piano-emotional-1' }];
  var M = C.music = { tracks: TRACKS, els: [], vols: [0, 0], targets: [0, 0], cur: 0, started: false, muted: false, level: .1, blocked: false, plays: 0 };
  try { M.muted = localStorage.getItem(KEY) === '1'; } catch (e) { }
  function mk(i) { var a = new Audio(); a.preload = 'auto'; a.src = 'assets/music/' + TRACKS[i].f + '.mp3'; a.volume = 0; return a; }
  function playEl(a) { var p = a.play(); if (p && p.catch) p.catch(function () { M.blocked = true; }); }
  M.start = function () {
    if (C.q.has('nomusic')) return;
    if (M.started) { if (M.blocked) { M.blocked = false; if (!M.muted) playEl(M.els[M.cur]); } return; }
    M.started = true; M.els = [mk(0), mk(1)]; M.targets = [M.muted ? 0 : M.level, 0]; if (!M.muted) playEl(M.els[0]);
  };
  M.setMuted = function (m) { M.muted = !!m; try { localStorage.setItem(KEY, m ? '1' : '0'); } catch (e) { } if (M.started) { if (m) M.targets = [0, 0]; else { M.targets[M.cur] = M.level; playEl(M.els[M.cur]); } } C.ui && C.ui.refresh(); };
  M.toggle = function () { M.setMuted(!M.muted); if (!M.started && !M.muted) M.start(); };
  /* the short soft-piano loop plays three times, then the longer gentle piano piece, and back; kept quiet (level .1) under the cooking sounds */
  C.hooks.push(function (dt) {
    if (!M.started) return; var a = M.els[M.cur];
    if (!M.muted && a.duration && a.currentTime > a.duration - (M.cur === 0 ? .05 : 6)) { if (M.cur === 0 && M.plays < 2) { M.plays++; a.currentTime = 0; playEl(a); } else { M.plays = 0; var n = 1 - M.cur, b = M.els[n]; b.currentTime = 0; playEl(b); M.targets[M.cur] = 0; M.targets[n] = M.level; M.cur = n; } }
    for (var i = 0; i < 2; i++) { var el = M.els[i], tv = M.targets[i], v = M.vols[i]; v = tv > v ? Math.min(tv, v + dt / 4) : Math.max(tv, v - dt / 3); M.vols[i] = v; el.volume = C.clamp(v, 0, 1); if (v <= 0 && tv <= 0 && !el.paused) el.pause(); }
  });
  document.addEventListener('visibilitychange', function () { if (!M.started) return; if (document.hidden) M.els.forEach(function (e) { e.pause(); }); else if (!M.muted) playEl(M.els[M.cur]); });
  function unblock() { if (M.started && M.blocked) M.start(); } addEventListener('pointerdown', unblock); addEventListener('keydown', unblock);
})();
