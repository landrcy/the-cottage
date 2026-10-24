/* The Cottage — grandma's recipes. Each is a list of hands-on steps run by the cook engine (cook.js, steps*.js).
   obj = the dish being built; steps change it (fill, crust, bake ...). Labels are tiny lowercase hints. */
(function () {
  'use strict';
  var C = window.COT, P = C.P;
  var col = { apple: P('#e8c470'), cinnamon: P('#8a4a22'), sugar: P('#fbf6ec'), pumpkin: P('#e07a22'), egg: P('#f8c838'), cream: P('#fff6e4'), milk: P('#f6f2ea'), spice: P('#a8622e'), flour: P('#f4ecdc'), water: P('#a8c8e0'),
    molasses: P('#3a1808'), brown: P('#9a5a26'), butter: P('#f6d870'), broth: P('#9a5a22'), cocoa: P('#5a2a12'), yeast: P('#d8b878'), ginger: P('#c8a060') };
  C.recipeCol = col;
  var list = [
    { id: 'apple', name: 'Apple Pie', blurb: 'Tart apples, cinnamon and a lattice top.', ing: ['apple', 'flour', 'butter', 'sugar', 'cinnamon'],
      steps: [
        { t: 'gather', label: 'gather' },
        { t: 'peel', ing: 'apple', label: 'peel the apple' },
        { t: 'cut', ing: 'apple', n: 6, label: 'slice it', into: 'bowl', col: col.apple },
        { t: 'pour', src: 'sugar', into: 'bowl', col: col.sugar, amt: .25, label: 'sugar' },
        { t: 'shake', src: 'cinnamon', over: 'bowl', n: 6, col: col.cinnamon, label: 'cinnamon' },
        { t: 'stir', in: 'bowl', turns: 4, label: 'toss' },
        { t: 'roll', shape: 'round', label: 'roll the crust', then: 'pie' },
        { t: 'pour', src: 'bowl', into: 'pie', label: 'fill it' },
        { t: 'lattice', n: 6, label: 'lattice' },
        { t: 'crimp', label: 'crimp the edge' },
        { t: 'oven', label: 'bake', time: 45 }
      ], obj: { k: 'bowl' }, pie: 'apple' },
    { id: 'pumpkin', name: 'Pumpkin Pie', blurb: 'Silky spiced pumpkin custard.', ing: ['pumpkin', 'egg', 'cream', 'sugar', 'spice', 'flour'],
      steps: [
        { t: 'gather', label: 'gather' },
        { t: 'cut', ing: 'pumpkin', n: 4, label: 'cut the pumpkin', into: 'bowl', col: col.pumpkin },
        { t: 'stir', in: 'bowl', turns: 4, mash: 1, label: 'mash' },
        { t: 'crack', n: 2, into: 'bowl', label: 'crack the eggs' },
        { t: 'pour', src: 'cream', into: 'bowl', col: col.cream, amt: .25, label: 'cream' },
        { t: 'shake', src: 'spice', over: 'bowl', n: 6, col: col.spice, label: 'spice' },
        { t: 'stir', in: 'bowl', turns: 5, label: 'whisk' },
        { t: 'roll', shape: 'round', label: 'roll the crust', then: 'pie' },
        { t: 'crimp', label: 'crimp the edge' },
        { t: 'pour', src: 'bowl', into: 'pie', label: 'pour it in' },
        { t: 'oven', label: 'bake', time: 50 }
      ], obj: { k: 'bowl' }, pie: 'pumpkin' },
    { id: 'pecan', name: 'Pecan Pie', blurb: 'Sticky molasses custard under toasted pecans.', ing: ['pecan', 'egg', 'brown', 'molasses', 'butter', 'flour'],
      steps: [
        { t: 'gather', label: 'gather' },
        { t: 'roll', shape: 'round', label: 'roll the crust', then: 'pie' },
        { t: 'crimp', label: 'crimp the edge' },
        { t: 'crack', n: 3, into: 'bowl', label: 'crack the eggs' },
        { t: 'pour', src: 'molasses', into: 'bowl', col: col.molasses, amt: .3, label: 'molasses' },
        { t: 'pour', src: 'brown', into: 'bowl', col: col.brown, amt: .25, label: 'brown sugar' },
        { t: 'stir', in: 'bowl', turns: 4, label: 'stir' },
        { t: 'pour', src: 'bowl', into: 'pie', label: 'pour it in' },
        { t: 'place', item: 'pecan', n: 12, on: 'pie', label: 'pecans on top' },
        { t: 'oven', label: 'bake', time: 55 }
      ], obj: { k: 'bowl' }, pie: 'pecan' },
    { id: 'bread', name: 'Country Loaf', blurb: 'Crackly crust, soft crumb. Slow and simple.', ing: ['flour', 'yeast', 'water', 'salt'],
      steps: [
        { t: 'gather', label: 'gather' },
        { t: 'pour', src: 'flour', into: 'bowl', col: col.flour, amt: .45, label: 'flour' },
        { t: 'pour', src: 'yeast', into: 'bowl', col: col.yeast, amt: .08, label: 'yeast' },
        { t: 'pour', src: 'water', into: 'bowl', col: col.water, amt: .3, label: 'warm water' },
        { t: 'shake', src: 'salt', over: 'bowl', n: 4, col: P('#ffffff'), label: 'pinch of salt' },
        { t: 'stir', in: 'bowl', turns: 4, label: 'stir', dough: 1 },
        { t: 'knead', n: 14, label: 'knead' },
        { t: 'proof', label: 'let it rise', then: 'loaf' },
        { t: 'score', n: 3, label: 'score the top' },
        { t: 'oven', label: 'bake', time: 40 }
      ], obj: { k: 'bowl' } },
    { id: 'turkey', name: 'Roast Turkey', blurb: 'Herb butter, golden skin, onion inside.', ing: ['turkey', 'onion', 'herbs', 'butter', 'salt', 'pepper'],
      steps: [
        { t: 'gather', label: 'gather' },
        { t: 'peel', ing: 'onion', label: 'peel the onion' },
        { t: 'cut', ing: 'onion', n: 4, label: 'quarter it' },
        { t: 'place', item: 'stuff', n: 5, on: 'turkey', label: 'stuff it' },
        { t: 'brush', glaze: P('#f6d870'), label: 'herb butter' },
        { t: 'shake', src: 'salt', over: 'roast', n: 6, col: P('#ffffff'), label: 'salt' },
        { t: 'shake', src: 'pepper', over: 'roast', n: 6, col: P('#2a2018'), label: 'pepper' },
        { t: 'oven', label: 'roast', time: 90 },
        { t: 'brush', glaze: P('#c87a2a'), label: 'baste', after: 1 }
      ], obj: { k: 'turkey' } },
    { id: 'ham', name: 'Glazed Ham', blurb: 'Studded with cloves, lacquered with honey.', ing: ['ham', 'cloves', 'honey', 'brown'],
      steps: [
        { t: 'gather', label: 'gather' },
        { t: 'score', n: 6, label: 'score diamonds', hatch: 1 },
        { t: 'place', item: 'cloves', n: 9, on: 'ham', label: 'cloves' },
        { t: 'brush', glaze: P('#f0a830'), label: 'honey glaze' },
        { t: 'shake', src: 'brown', over: 'roast', n: 6, col: P('#9a5a26'), label: 'brown sugar' },
        { t: 'oven', label: 'bake', time: 60 },
        { t: 'brush', glaze: P('#c86a1a'), label: 'glaze again', after: 1 }
      ], obj: { k: 'ham' } },
    { id: 'stew', name: 'Beef Stew', blurb: 'A pot that simmers all afternoon.', ing: ['beef', 'carrot', 'potato', 'onion', 'broth', 'salt', 'pepper', 'herbs'],
      steps: [
        { t: 'gather', label: 'gather' },
        { t: 'cut', ing: 'beef', n: 4, label: 'cube the beef', into: 'pan' },
        { t: 'sear', label: 'brown it' },
        { t: 'cut', ing: 'carrot', n: 6, label: 'chop carrots', into: 'pot', chunk: P('#f08a2a') },
        { t: 'peel', ing: 'potato', label: 'peel the potato' },
        { t: 'cut', ing: 'potato', n: 4, label: 'chop it', into: 'pot', chunk: P('#e8d8a8') },
        { t: 'pour', src: 'broth', into: 'pot', col: col.broth, amt: .6, label: 'broth' },
        { t: 'shake', src: 'pepper', over: 'pot', n: 5, col: P('#2a2018'), label: 'pepper' },
        { t: 'stir', in: 'pot', turns: 5, label: 'simmer', heat: 1 },
        { t: 'pour', src: 'pot', into: 'stewbowl', label: 'ladle' }
      ], obj: { k: 'pot' } },
    { id: 'cinnamon', name: 'Cinnamon Rolls', blurb: 'Buttery swirls with sweet icing.', ing: ['flour', 'yeast', 'milk', 'butter', 'sugar', 'cinnamon'],
      steps: [
        { t: 'gather', label: 'gather' },
        { t: 'pour', src: 'flour', into: 'bowl', col: col.flour, amt: .45, label: 'flour' },
        { t: 'pour', src: 'milk', into: 'bowl', col: col.milk, amt: .3, label: 'warm milk' },
        { t: 'stir', in: 'bowl', turns: 3, label: 'stir', dough: 1 },
        { t: 'knead', n: 10, label: 'knead' },
        { t: 'roll', shape: 'rect', label: 'roll it out' },
        { t: 'brush', glaze: P('#f6d870'), on: 'sheet', label: 'butter' },
        { t: 'shake', src: 'cinnamon', over: 'sheet', n: 6, col: P('#6a2a10'), label: 'cinnamon sugar' },
        { t: 'rollup', label: 'roll it up' },
        { t: 'cut', ing: 'log', n: 5, label: 'slice', then: 'rolls' },
        { t: 'oven', label: 'bake', time: 25 },
        { t: 'pipe', label: 'icing' }
      ], obj: { k: 'bowl' } },
    { id: 'ginger', name: 'Gingerbread Folk', blurb: 'Molasses and ginger, little iced buttons.', ing: ['flour', 'molasses', 'ginger', 'butter', 'brown', 'spice'],
      steps: [
        { t: 'gather', label: 'gather' },
        { t: 'pour', src: 'flour', into: 'bowl', col: col.flour, amt: .4, label: 'flour' },
        { t: 'pour', src: 'molasses', into: 'bowl', col: col.molasses, amt: .25, label: 'molasses' },
        { t: 'shake', src: 'spice', over: 'bowl', n: 5, col: col.spice, label: 'ginger & spice' },
        { t: 'stir', in: 'bowl', turns: 4, label: 'stir', dough: 1, doughCol: 'ginger' },
        { t: 'roll', shape: 'rect', label: 'roll it out', ginger: 1 },
        { t: 'stamp', n: 5, label: 'cut the folk' },
        { t: 'oven', label: 'bake', time: 12 },
        { t: 'pipe', label: 'icing' }
      ], obj: { k: 'bowl' } },
    { id: 'cocoa', name: 'Hot Cocoa', blurb: 'For after the snow. Extra marshmallows.', ing: ['milk', 'cocoa', 'sugar', 'marsh', 'cream'],
      steps: [
        { t: 'gather', label: 'gather' },
        { t: 'pour', src: 'milk', into: 'pot', col: col.milk, amt: .5, label: 'milk in the pot' },
        { t: 'stir', in: 'pot', turns: 3, label: 'warm it', heat: 1 },
        { t: 'pour', src: 'cocoa', into: 'pot', col: col.cocoa, amt: .1, label: 'cocoa' },
        { t: 'pour', src: 'sugar', into: 'pot', col: col.sugar, amt: .06, label: 'sugar' },
        { t: 'stir', in: 'pot', turns: 4, label: 'whisk', heat: 1 },
        { t: 'pour', src: 'pot', into: 'mug', label: 'pour a mug' },
        { t: 'place', item: 'marsh', n: 5, on: 'mug', label: 'marshmallows' }
      ], obj: { k: 'pot' } }
  ];
  C.recipes = { list: list, byId: {} };
  list.forEach(function (r) { C.recipes.byId[r.id] = r; });
})();
