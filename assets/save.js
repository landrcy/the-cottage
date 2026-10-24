/* The Cottage — progress in localStorage: dishes made (per recipe), last recipe, cat pets, surprises seen. */
(function () {
  'use strict';
  var C = window.COT, KEY = 'cottage:save:v1';
  var S = C.save = { data: { made: {}, last: null, pets: 0, seen: {}, page: 0 } };
  try { var j = JSON.parse(localStorage.getItem(KEY) || 'null'); if (j && j.made) S.data = Object.assign(S.data, j); } catch (e) { }
  if (C.q.has('fresh')) S.data = { made: {}, last: null, pets: 0, seen: {}, page: 0 };
  S.write = function () { try { localStorage.setItem(KEY, JSON.stringify(S.data)); } catch (e) { } };
  S.made = function (id) { S.data.made[id] = (S.data.made[id] || 0) + 1; S.data.last = id; S.write(); };
  S.total = function () { var n = 0; for (var k in S.data.made) n += S.data.made[k]; return n; };
  S.reset = function () { S.data = { made: {}, last: null, pets: 0, seen: {}, page: 0 }; S.write(); };
})();
