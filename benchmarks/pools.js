var BrowserStdout = require('browser-stdout');
var Benchmark = require('benchmark');
var benchmarks = require('beautify-benchmark');
var PoolES5 = require('../packages/free-list-pool');
var Deepool = require('deepool');
var OOPool = require('object-object-pool').default;
var OPool = require('opool');
var Aronnax = require('aronnax-pooling');
var ReusePool = require('reuse-pool');
var RCFLPool = require('../packages/reference-counted-free-list-pool');
var StackPool = require('../packages/stack-pool');
var FixedStackPool = require('../packages/fixed-stack-pool');

// Benchmark requires itself to be a global for browser support.
global.Benchmark = Benchmark;

// Benchmark assumes at least one script tag when in browser mode...
if (global.document && global.document.body) {
  document.body.appendChild(document.createElement('script'));
}

// Add a stdout shim with ANSI colors stripped for browsers.
if (!process || !process.stdout) {
  process = process || {};
  process.stdout = new BrowserStdout();
}

// BEGIN Setup
function reducer (state, action) {
  state = state || 0;
  var payload = action.payload;
  var type = action.type;
  switch (action.type) {
    case 'INC': {
      state += payload;
      return state;
    }

    case 'DEC': {
      state -= payload;
      return state;
    }

    default: return state;
  }
}

function Action () {
  this.type = '';
  this.payload = null;
}

var PREALLOC_AMOUNT = 100;
var ACTION_COUNT = 100;
var poolES5 = new PoolES5(function () {
  return { type: '', payload: null }
}, PREALLOC_AMOUNT);
var dee = Deepool.create(function () {
  return { type: '', payload: null }
});
var oopool = new OOPool();
var opool = new OPool(Action);
var AronnaxAction = Object.create(Aronnax.Pooled);
AronnaxAction.constructor = function () {
  this.type = '';
  this.payload = null;
}
var reusePool = ReusePool(function () {
  return { type: '', payload: null };
});
var rcflpool = new RCFLPool(function () {
  return { type: '', payload: null }
}, PREALLOC_AMOUNT);
var stackpool = new StackPool(function () {
  return { type: '', payload: null }
}, PREALLOC_AMOUNT);
var fixedstackpool = new FixedStackPool(function () {
  return { type: '', payload: null }
}, PREALLOC_AMOUNT);
// END Setup



var suite = new Benchmark.Suite;

suite.add('vanilla-no-pool', function() {
  var state = null;
  var action1 = { type: 'INC', payload: 1 };
  state = reducer(state, action1);
});

suite.add('free-list-pool', function() {
  var state = null;
  var action = poolES5.retain();
  action.type = 'INC';
  action.payload = 1;
  state = reducer(state, action);
  poolES5.release(action);
});

suite.add('reference-counted-free-list-pool', function() {
  var state = null;
  var action = rcflpool.retain();
  action.type = 'INC';
  action.payload = 1;
  state = reducer(state, action);
  rcflpool.release(action);
})

suite.add('stack-pool', function() {
  var state = null;
  var action = stackpool.retain();
  action.type = 'INC';
  action.payload = 1;
  state = reducer(state, action);
  stackpool.release(action);
})

suite.add('fixed-stack-pool', function() {
  var state = null;
  var action = fixedstackpool.retain();
  action.type = 'INC';
  action.payload = 1;
  state = reducer(state, action);
  fixedstackpool.release(action);
})

suite.add('deepool', function() {
  var state = null;
  var action = dee.use();
  action.type = 'INC';
  action.payload = 1;
  state = reducer(state, action);
  dee.recycle(action);
});

suite.add('object-object-pool', function() {
  var state = null;
  var action = oopool.alloc();
  action.type = 'INC';
  action.payload = 1;
  state = reducer(state, action);
  oopool.free(action);
});

suite.add('opool', function() {
  var state = null;
  var action = opool.get();
  action.type = 'INC';
  action.payload = 1;
  state = reducer(state, action);
  opool.release(action);
});

suite.add('aronnax-pooling', function() {
  var state = null;
  var action = AronnaxAction.make();
  action.type = 'INC';
  action.payload = 1;
  state = reducer(state, action);
  action.free();
});

suite.add('reuse-pool', function() {
  var state = null;
  var action = reusePool.get();
  action.type = 'INC';
  action.payload = 1;
  state = reducer(state, action);
  reusePool.recycle(action);
});

suite.on('error', function (err) {
  console.error(err);
})

suite.on('cycle', function(event) {
  benchmarks.add(event.target);
  var div = document.createElement('div');
  div.innerHTML = '<pre>' + String(event.target) + '</pre>';
  document.body.appendChild(div);
});

suite.on('complete', function(event) {
  benchmarks.log();
  var h1 = document.createElement('h1');
  h1.innerHTML = 'Benchmark Finished! Open the console.';
  document.body.appendChild(h1);
});

suite.run({ 'async': true });