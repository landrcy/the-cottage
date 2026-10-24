/* The Cottage — pixel painter. Every sprite is built here at load time from code: a mask, a dome-shaded
   lighting pass with ordered dithering between hand-picked colour ramps, texture noise, highlights and a dark outline.
   Pix = editable pixel buffer (Uint32 ABGR) so food can be really cut, peeled and painted pixel by pixel. */
(function () {
  'use strict';
  var C = window.COT, A = C.art = {};
  function Pix(w, h) { this.w = w; this.h = h; this.d = new Uint32Array(w * h); this.cv = null; this.dirty = true; }
  Pix.prototype.get = function (x, y) { return x < 0 || y < 0 || x >= this.w || y >= this.h ? 0 : this.d[y * this.w + x]; };
  Pix.prototype.set = function (x, y, c) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) { this.d[y * this.w + x] = c; this.dirty = true; } };
  Pix.prototype.canvas = function () {
    if (!this.cv) this.cv = C.mk(this.w, this.h);
    if (this.dirty) { var id = this.cv.g.createImageData(this.w, this.h); new Uint32Array(id.data.buffer).set(this.d); this.cv.g.putImageData(id, 0, 0); this.dirty = false; }
    return this.cv;
  };
  Pix.prototype.clone = function () { var p = new Pix(this.w, this.h); p.d.set(this.d); return p; };
  Pix.prototype.draw = function (g, x, y) { g.drawImage(this.canvas(), Math.round(x), Math.round(y)); };
  Pix.prototype.drawC = function (g, x, y) { g.drawImage(this.canvas(), Math.round(x - this.w / 2), Math.round(y - this.h / 2)); };
  Pix.prototype.count = function () { var n = 0; for (var i = 0; i < this.d.length; i++) if (this.d[i] >>> 24) n++; return n; };
  /* stamp another pix onto this one */
  Pix.prototype.blit = function (o, ox, oy) { for (var y = 0; y < o.h; y++) for (var x = 0; x < o.w; x++) { var c = o.d[y * o.w + x]; if (c >>> 24) this.set(x + ox, y + oy, c); } return this; };
  /* 1px outline around opaque pixels (in place, uses transparent border pixels) */
  Pix.prototype.outline = function (col, diag) {
    var w = this.w, h = this.h, s = this.d.slice();
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { if (s[y * w + x] >>> 24) continue; var o = 0;
      for (var k = 0; k < (diag ? 8 : 4); k++) { var dx = [1, -1, 0, 0, 1, 1, -1, -1][k], dy = [0, 0, 1, -1, 1, -1, 1, -1][k], xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h && (s[yy * w + xx] >>> 24) && s[yy * w + xx] !== col) { o = 1; break; } }
      if (o) this.d[y * w + x] = col; }
    this.dirty = true; return this;
  };
  /* recolour by luminance into an ink ramp (cookbook illustrations) */
  Pix.prototype.ink = function (ramp) { var p = this.clone(); for (var i = 0; i < p.d.length; i++) { var c = p.d[i]; if (!(c >>> 24)) continue; var u = C.unpack(c), l = (u[0] * .3 + u[1] * .55 + u[2] * .15) / 255; p.d[i] = C.rp(ramp, l * 1.15, i % p.w, i / p.w | 0); } p.dirty = true; return p; };
  A.Pix = Pix;
  A.fromFn = function (w, h, fn) { var p = new Pix(w, h); for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var c = fn(x, y); if (c) p.d[y * w + x] = c; } return p; };

  /* distance (in px) to the outside of the mask, chamfer 3-4 */
  function dist(m, w, h) {
    var d = new Float32Array(w * h), I = 1e9, i, x, y;
    for (i = 0; i < w * h; i++) d[i] = m[i] ? I : 0;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) { i = y * w + x; if (!d[i]) continue; var v = d[i];
      v = Math.min(v, x > 0 ? d[i - 1] + 3 : 3, y > 0 ? d[i - w] + 3 : 3, x > 0 && y > 0 ? d[i - w - 1] + 4 : 4, x < w - 1 && y > 0 ? d[i - w + 1] + 4 : 4); d[i] = v; }
    for (y = h - 1; y >= 0; y--) for (x = w - 1; x >= 0; x--) { i = y * w + x; if (!d[i]) continue; var u = d[i];
      u = Math.min(u, x < w - 1 ? d[i + 1] + 3 : 3, y < h - 1 ? d[i + w] + 3 : 3, x < w - 1 && y < h - 1 ? d[i + w + 1] + 4 : 4, x > 0 && y < h - 1 ? d[i + w - 1] + 4 : 4); d[i] = u; }
    for (i = 0; i < w * h; i++) d[i] /= 3; return d;
  }
  A.dist = dist;
  var L = (function () { var v = [-.5, -.7, .6], n = Math.hypot(v[0], v[1], v[2]); return v.map(function (a) { return a / n; }); })();
  /* dome-shade a mask.  o: {ramp, R (rounding radius), tex(x,y)->-1..1 tone shift, col(x,y,v)->colour override, spec, outline, amb, flat}
     mask: function (x,y)->bool, evaluated on a w×h grid */
  A.dome = function (w, h, mask, o) {
    var m = new Uint8Array(w * h), x, y;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) m[y * w + x] = mask(x, y) ? 1 : 0;
    var d = dist(m, w, h), R = o.R || Math.max(2, Math.min(w, h) / 3), ht = new Float32Array(w * h);
    for (var i = 0; i < w * h; i++) { if (!m[i]) continue; var t = Math.min(d[i] / R, 1); ht[i] = Math.sqrt(1 - (1 - t) * (1 - t)) * R; }
    var p = new Pix(w, h), ramp = o.ramp, amb = o.amb == null ? .18 : o.amb;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      i = y * w + x; if (!m[i]) continue;
      var hx = (x < w - 1 && m[i + 1] ? ht[i + 1] : 0) - (x > 0 && m[i - 1] ? ht[i - 1] : 0), hy = (y < h - 1 && m[i + w] ? ht[i + w] : 0) - (y > 0 && m[i - w] ? ht[i - w] : 0);
      var nx = -hx * .5, ny = -hy * .5, nz = 1, nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      var v = amb + (1 - amb) * Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      if (o.flat) v = C.lerp(v, o.flat, .5);
      if (o.tex) v += o.tex(x, y) * .14;
      var c = o.col ? o.col(x, y, v, d[i]) : 0;
      if (!c) c = C.rp(ramp, v, x, y);
      if (o.spec && v > .97 && d[i] > 1.5) c = o.spec;
      p.d[i] = c;
    }
    if (o.outline) p.outline(o.outline);
    return p;
  };
  /* shapes */
  A.ell = function (cx, cy, rx, ry) { return function (x, y) { var dx = (x + .5 - cx) / rx, dy = (y + .5 - cy) / ry; return dx * dx + dy * dy <= 1; }; };
  A.rrect = function (x0, y0, w, h, r) { return function (x, y) { if (x < x0 || y < y0 || x >= x0 + w || y >= y0 + h) return false; var dx = Math.max(x0 + r - x - .5, 0, x + .5 - (x0 + w - r)), dy = Math.max(y0 + r - y - .5, 0, y + .5 - (y0 + h - r)); return dx * dx + dy * dy <= r * r; }; };
  A.or = function () { var f = [].slice.call(arguments); return function (x, y) { for (var i = 0; i < f.length; i++) if (f[i](x, y)) return true; return false; }; };
  A.and = function (a, b) { return function (x, y) { return a(x, y) && b(x, y); }; };
  A.not = function (a, b) { return function (x, y) { return a(x, y) && !b(x, y); }; };
  A.noise = function (s, sc) { sc = sc || 1; return function (x, y) { var X = x / sc, Y = y / sc, xi = Math.floor(X), yi = Math.floor(Y), fx = X - xi, fy = Y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    var a = C.hash(xi, yi, s), b = C.hash(xi + 1, yi, s), c = C.hash(xi, yi + 1, s), d = C.hash(xi + 1, yi + 1, s); return (a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy) * 2 - 1; }; };
  A.grain = function (s) { return function (x, y) { return C.hash(x, y, s) * 2 - 1; }; };

  /* ---------- shared palettes ---------- */
  A.pal = {
    ink: '#1a0f0a', inkP: C.P('#1a0f0a'), out: C.P('#24140d'), cream: '#fff3dc', amber: '#ffb347',
    wood: C.ramp(['#2a160d', '#43251a', '#5e3522', '#7a4a2c', '#966139', '#ad7745']),
    woodL: C.ramp(['#4a2a18', '#6e4227', '#8f5b34', '#ae7744', '#c99356', '#ddb070']),
    stone: C.ramp(['#2b2523', '#453a35', '#5f524a', '#7a6b60', '#958579', '#b0a194']),
    brick: C.ramp(['#3a1a14', '#5c2a1e', '#7d3c27', '#9a5034', '#b56a45']),
    metal: C.ramp(['#1f2226', '#3b4047', '#5b626b', '#828a93', '#adb5bc', '#dfe4e8']),
    copper: C.ramp(['#3d1a0f', '#6b2f17', '#9a4a22', '#c46a32', '#e08f4f', '#f7c08a']),
    cream: C.ramp(['#7d6650', '#a88d6e', '#cdb08b', '#e6cfaa', '#f6e6c8', '#fff7e6']),
    plate: C.ramp(['#6f6a6a', '#9c9696', '#c5c0bd', '#e2ddd8', '#f5f1ec', '#ffffff']),
    blueware: C.ramp(['#1f2c4a', '#2f4373', '#4a64a0', '#7d97c9']),
    snow: C.ramp(['#3b4a6b', '#5a6f96', '#7e94b8', '#a9bcd6', '#d3e0ee', '#f4f8ff']),
    leather: C.ramp(['#2a110b', '#45190f', '#642716', '#84391f', '#a3502b', '#c06e3f']),
    page: C.ramp(['#8a6a45', '#b4935f', '#d3b781', '#e8d3a2', '#f4e6c1', '#fbf3dc']),
    sepia: C.ramp(['#3a2414', '#5a3a20', '#7d5632', '#a57d4f', '#cbb07c', '#efe0b4']),
    fire: C.ramp(['#5a1206', '#9c2a08', '#d4500c', '#f2861a', '#ffbf3f', '#fff0a0'])
  };
})();
