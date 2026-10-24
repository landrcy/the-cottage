/* The Cottage — headless test suite. node tests/run-all.js */
const pp = require('/workspace/tools/node_modules/puppeteer-core');
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ogg': 'audio/ogg', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.svg': 'image/svg+xml', '.txt': 'text/plain' };
const srv = http.createServer((q, r) => { let f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html'; fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) { pass++; console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const sleep = ms => new Promise(r => setTimeout(r, ms));
function du(d) { let s = 0; for (const f of fs.readdirSync(d)) { const p = path.join(d, f), st = fs.statSync(p); s += st.isDirectory() ? (f === 'tests' ? 0 : du(p)) : st.size; } return s; }
(async () => {
  await new Promise(r => srv.listen(0, r)); const base = 'http://localhost:' + srv.address().port + '/';
  const b = await pp.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  async function open(q, w, h) { const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); p.on('requestfailed', r => errs.push('reqfail ' + r.url()));
    await p.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 }); await p.goto(base + q); await sleep(1200); return { p, errs }; }
  console.log('scenes at 1280 / 1920 / 390');
  for (const [w, h] of [[1280, 800], [1920, 1080], [390, 844]]) for (const q of ['', '?scene=kitchen', '?scene=book', '?cook=bread&step=3', '?surprise=deer']) {
    const { p, errs } = await open(q, w, h);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1 || document.documentElement.scrollHeight > innerHeight + 1);
    ok(!errs.length, `${w}px ${q || 'title'} no errors ${errs.slice(0, 2).join(' | ')}`); ok(!ov, `${w}px ${q || 'title'} no overflow`); await p.close(); }
  console.log('frame rate + delta time');
  { const { p } = await open('?scene=kitchen', 1280, 800); const fps = await p.evaluate(() => new Promise(r => { let n = 0, t0 = performance.now(); (function f() { n++; if (performance.now() - t0 < 2000) requestAnimationFrame(f); else r(n / 2); })(); }));
    ok(fps >= 50, 'kitchen fps ' + fps.toFixed(1)); const st = await p.evaluate(() => { const c = COT; return typeof c.stepSim === 'function'; }); ok(st, 'stepSim available'); await p.close(); }
  console.log('every recipe completable');
  { const { p, errs } = await open('?fresh&scene=kitchen', 1280, 800);
    const ids = await p.evaluate(() => COT.recipes.list.map(r => r.id)); ok(ids.length >= 6, ids.length + ' recipes');
    for (const id of ids) { const r = await p.evaluate(id => { const C = COT; C.go('cook', { id }, true); C.cook.finishAll(); const ph = C.cook.phase; C.cook.finish(); return { ph, made: C.save.data.made[id] }; }, id); ok(r.ph === 'reveal' && r.made >= 1, id + ' reaches reveal and is saved'); }
    await sleep(400); ok(!errs.length, 'no errors while cooking ' + errs.slice(0, 2).join(' | '));
    await p.goto(base + '?scene=kitchen'); await sleep(800); const made = await p.evaluate(() => Object.keys(COT.save.data.made).length); ok(made === ids.length, 'save persists after reload (' + made + ')'); await p.close(); }
  console.log('real pointer drag cut (desktop + touch 390)');
  for (const [w, h] of [[1280, 800], [390, 844]]) { const { p, errs } = await open('?cook=apple&step=2', w, h);
    const before = await p.evaluate(() => COT.cook.step.cuts || 0);
    const cy = await p.evaluate(() => { const h = COT.cook.step.hint(0) || {}; return (h.y != null ? h.y : COT.H / 2) * COT.S + COT.canvas.getBoundingClientRect().top; });
    if (w < 500) { const cdp = await p.target().createCDPSession(); for (let k = 0; k < 3; k++) { const y = cy - 20 + k * 20; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 20, y }] }); for (let x = 20; x <= w - 20; x += 15) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + 4 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await sleep(300); } }
    else for (let k = 0; k < 6; k++) { const y = cy - 40 + k * 20; await p.mouse.move(w * .2, y); await p.mouse.down(); await p.mouse.move(w * .8, y + 6, { steps: 25 }); await p.mouse.up(); await sleep(300); }
    const after = await p.evaluate(() => ({ c: COT.cook.step.cuts || 0, p: COT.cook.step.p, i: COT.cook.i }));
    ok(after.c > before || after.i > 2, `${w}px drag cut split the apple (cuts ${after.c}, p ${after.p && after.p.toFixed(2)})`); ok(!errs.length, w + 'px no errors while cutting'); await p.close(); }
  console.log('assets + credits + size');
  const sfx = fs.readdirSync(path.join(ROOT, 'assets/sfx')), mus = fs.readdirSync(path.join(ROOT, 'assets/music')); ok(sfx.length >= 40, sfx.length + ' sound files'); ok(mus.length >= 2, mus.length + ' music files');
  const cr = fs.readFileSync(path.join(ROOT, 'CREDITS.txt'), 'utf8'); const miss = sfx.filter(f => !cr.includes(f)); ok(!miss.length, 'every sound credited ' + miss.slice(0, 3)); ok(mus.every(f => cr.includes(f)), 'music credited'); ok(/OFL|Open Font License/.test(cr) && fs.existsSync(path.join(ROOT, 'assets/fonts')), 'font license');
  const sz = du(ROOT); ok(sz < 10e6, 'size ' + (sz / 1e6).toFixed(2) + ' MB');
  await b.close(); srv.close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
