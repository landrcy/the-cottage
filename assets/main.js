/* The Cottage — boot. ?scene=kitchen|book  ?cook=<recipe>&step=<n>  ?surprise=<deer|owl|cardinal|aurora|carolers|star> */
(function () {
  'use strict';
  var C = window.COT, q = C.q;
  var sc = q.get('scene'), ck = q.get('cook'), sp = q.get('surprise');
  if (ck && C.recipes.byId[ck]) C.go('cook', { id: ck, step: +(q.get('step') || 0) }, true);
  else if (sc && C.scenes[sc]) C.go(sc, null, true);
  else if (sp) C.go('kitchen', null, true);
  else C.go('title', null, true);
  if (sp && C.kitchen.trigger) C.kitchen.trigger(sp);
  window.addEventListener('pointerdown', function once() { C.sfx.unlock && C.sfx.unlock(); C.music.start(); window.removeEventListener('pointerdown', once); });
  C.start();
})();
