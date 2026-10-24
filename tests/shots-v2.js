/* before/after texture + cabin screenshots: node tests/shots-v2.js <prefix>  (server on :8811) */
const pp = require('/workspace/tools/node_modules/puppeteer-core'); const OUT = '/workspace/preview/the-cottage/v2/', P = process.argv[2] || 'after';
const sleep = ms => new Promise(r => setTimeout(r, ms)), B = 'http://localhost:' + (process.env.PORT || 8811) + '/?nomusic&';
(async () => { const b = await pp.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  async function pg(q, w = 1280, h = 800) { const p = await b.newPage(); p.on('pageerror', e => console.log('ERR', q, String(e))); await p.setViewport({ width: w, height: h, isMobile: w < 500, hasTouch: w < 500 }); await p.goto(B + q); await sleep(1800); return p; }
  const shot = (p, n, clip) => p.screenshot({ path: OUT + P + '-' + n + '.png', clip });
  let p = await pg(''); await shot(p, 'title'); await p.close();
  p = await pg('', 390, 844); await shot(p, 'phone390-title'); await p.close();
  p = await pg('scene=kitchen'); await p.evaluate(() => { const s = COT.save.data; COT.recipes.list.forEach(r => s.made[r.id] = 1); s.page = 0; COT.save.write(); }); await p.reload(); await sleep(2200);
  await shot(p, 'kitchen'); await shot(p, 'fireplace', { x: 0, y: 0, width: 560, height: 800 });
  const cb = await p.evaluate(() => { const b = COT.cat.box(), s = COT.S, r = COT.canvas.getBoundingClientRect(); return { x: r.left + (b.x - 14) * s, y: r.top + (b.y - 12) * s, w: (b.w + 28) * s, h: (b.h + 20) * s }; });
  await shot(p, 'cat-close', { x: Math.max(0, cb.x), y: Math.max(0, cb.y), width: cb.w, height: cb.h }); await p.close();
  p = await pg('scene=book'); await shot(p, 'cookbook'); await p.close();
  const ids = ['apple', 'pumpkin', 'pecan', 'bread', 'turkey', 'ham', 'stew', 'cinnamon', 'ginger', 'cocoa'];
  for (const id of ids) { p = await pg('cook=' + id); await p.evaluate(() => COT.cook.finishAll()); await sleep(1800); await shot(p, 'dish-' + id); await p.close(); }
  p = await pg('cook=apple'); const ci = await p.evaluate(() => COT.recipes.byId.apple.steps.findIndex(s => s.t === 'cut')); await p.close();
  p = await pg('cook=apple&step=' + ci); for (let k = 0; k < 4; k++) { await p.mouse.move(560 + k * 40, 300); await p.mouse.down(); await p.mouse.move(560 + k * 40, 520, { steps: 8 }); await p.mouse.up(); await sleep(300); } await sleep(600); await shot(p, 'cutting'); await p.close();
  p = await pg('cook=apple&step=' + ci, 390, 844); await shot(p, 'phone390-cutting'); await p.close();
  p = await pg('cook=bread'); const i = await p.evaluate(() => COT.recipes.byId.bread.steps.findIndex(s => s.t === 'proof')); await p.close(); p = await pg('cook=bread&step=' + i); await p.mouse.click(640, 420); await sleep(1500); await shot(p, 'cloth-proof'); await p.close();
  p = await pg('scene=kitchen', 390, 844); await shot(p, 'phone390-kitchen'); await p.close();
  p = await pg('scene=book', 390, 844); await shot(p, 'phone390-cookbook'); await p.close();
  await b.close(); })();
