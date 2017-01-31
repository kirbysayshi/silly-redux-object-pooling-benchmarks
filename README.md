Silly Redux Object Pooling Benchmarks
=====================================

I was using [Redux](https://github.com/reactjs/redux) for a game (aka lots of reducer updates at 60fps), and wondered how detrimental garbage collection was. Profiling using DevTools showed my app using around 8% of the time for GC.

One classic technique to prevent excessive memory thrashing is [object pooling](http://gameprogrammingpatterns.com/object-pool.html). And it's often [1][1] mentioned [2][2] as a solution [3][3] for JS GC as well. So I wrote a simple Redux middleware that would release pooled action objects that use the same shape as [FSA](https://github.com/acdlite/flux-standard-action).

And yet... I couldn't see improvements in my app when profiling!

So I wrote a few different approaches to pooling (and included some popular results from an [npm search](https://www.npmjs.com/search?q=object+pool)) and tried to benchmark each.

Running the Benchmarks
----------------------

```
$ npm install # yarn works too
```

In node:

```
$ node benchmarks/pools.js
```

In a browser:

```
$ npm run build
$ open benchmarks/index.html
```

Results
-------

### node v6.4.0:

```
  10 tests completed.

  vanilla-no-pool                  x 50,354,084 ops/sec ±4.09% (73 runs sampled)
  free-list-pool                   x 31,383,834 ops/sec ±1.56% (75 runs sampled)
  reference-counted-free-list-pool x 26,129,774 ops/sec ±3.44% (73 runs sampled)
  stack-pool                       x 25,196,442 ops/sec ±2.12% (76 runs sampled)
  fixed-stack-pool                 x 25,595,092 ops/sec ±2.96% (73 runs sampled)
  deepool                          x 15,176,881 ops/sec ±4.39% (69 runs sampled)
  object-object-pool               x 20,719,618 ops/sec ±5.79% (67 runs sampled)
  opool                            x  3,475,599 ops/sec ±4.15% (71 runs sampled)
  aronnax-pooling                  x     88,907 ops/sec ±3.67% (73 runs sampled)
  reuse-pool                       x 15,496,312 ops/sec ±2.21% (76 runs sampled)
```

### node v7.5.0:

```
  10 tests completed.

  vanilla-no-pool                  x 36,981,882 ops/sec ±1.76% (78 runs sampled)
  free-list-pool                   x 25,150,424 ops/sec ±2.83% (77 runs sampled)
  reference-counted-free-list-pool x 23,587,524 ops/sec ±2.29% (77 runs sampled)
  stack-pool                       x 21,418,854 ops/sec ±2.84% (76 runs sampled)
  fixed-stack-pool                 x 25,257,064 ops/sec ±2.50% (78 runs sampled)
  deepool                          x 15,312,059 ops/sec ±2.77% (78 runs sampled)
  object-object-pool               x 22,936,774 ops/sec ±2.11% (79 runs sampled)
  opool                            x  3,642,860 ops/sec ±3.38% (78 runs sampled)
  aronnax-pooling                  x    168,445 ops/sec ±2.97% (76 runs sampled)
  reuse-pool                       x 14,303,677 ops/sec ±2.84% (77 runs sampled)
```

### Chrome 56.0.2924.87:

```
stdout:   10 tests completed.

   vanilla-no-pool                  x 33,212,058 ops/sec ±3.56% (42 runs sampled)
   free-list-pool                   x 16,951,300 ops/sec ±14.10% (37 runs sampled)
   reference-counted-free-list-pool x 17,814,727 ops/sec ±6.66% (43 runs sampled)
   stack-pool                       x 17,391,215 ops/sec ±6.82% (42 runs sampled)
   fixed-stack-pool                 x 14,617,317 ops/sec ±6.75% (39 runs sampled)
   deepool                          x  9,235,186 ops/sec ±7.43% (39 runs sampled)
   object-object-pool               x 19,258,751 ops/sec ±4.48% (46 runs sampled)
   opool                            x  2,282,889 ops/sec ±9.48% (44 runs sampled)
   aronnax-pooling                  x    112,474 ops/sec ±14.04% (36 runs sampled)
   reuse-pool                       x 12,220,047 ops/sec ±3.46% (47 runs sampled)
```

### Firefox 53.0a2:

```
stdout:   10 tests completed.

  vanilla-no-pool                  x 701,634,335 ops/sec ±7.48% (20 runs sampled)
  free-list-pool                   x  13,941,747 ops/sec ±31.68% (29 runs sampled)
  reference-counted-free-list-pool x   6,781,078 ops/sec ±4.17% (40 runs sampled)
  stack-pool                       x  38,761,403 ops/sec ±2.36% (42 runs sampled)
  fixed-stack-pool                 x  68,494,274 ops/sec ±2.35% (39 runs sampled)
  deepool                          x  74,384,340 ops/sec ±4.37% (40 runs sampled)
  object-object-pool               x  33,316,093 ops/sec ±6.83% (32 runs sampled)
  opool                            x   1,553,627 ops/sec ±5.12% (37 runs sampled)
  aronnax-pooling                  x      42,408 ops/sec ±12.07% (37 runs sampled)
  reuse-pool                       x  42,372,364 ops/sec ±70.10% (35 runs sampled)
```

### Safari 10.0.2 (12602.3.12.0.1)

```
stdout: – "  10 tests completed." (bundle.js, line 4565)

  vanilla-no-pool                  x 8,165,142 ops/sec ±2.20% (50 runs sampled) (bundle.js, line 1676)
  free-list-pool                   x 2,762,483 ops/sec ±3.73% (47 runs sampled) (bundle.js, line 1676)
  reference-counted-free-list-pool x 2,160,573 ops/sec ±5.70% (41 runs sampled) (bundle.js, line 1676)
  stack-pool                       x 4,741,075 ops/sec ±2.14% (51 runs sampled) (bundle.js, line 1676)
  fixed-stack-pool                 x 4,572,775 ops/sec ±3.72% (52 runs sampled) (bundle.js, line 1676)
  deepool                          x 4,959,799 ops/sec ±6.63% (48 runs sampled) (bundle.js, line 1676)
  object-object-pool               x 4,837,814 ops/sec ±3.82% (50 runs sampled) (bundle.js, line 1676)
  opool                            x 2,053,498 ops/sec ±2.32% (48 runs sampled) (bundle.js, line 1676)
  aronnax-pooling                  x    87,180 ops/sec ±2.91% (54 runs sampled) (bundle.js, line 1676)
  reuse-pool                       x 2,803,415 ops/sec ±2.97% (52 runs sampled) (bundle.js, line 1676)
```

Conclusions
-----------

I have come to the following _possible_ conclusions:

A. I know nothing about how JS engines work these days.
B. My benchmarks are flawed (`<-- likely!`).
C. Action objects are so "small" that the engine is quite good at quick allocation/creation.
D. [Benchmark.js](https://github.com/bestiejs/benchmark.js) might not be able to show the effect of GC on a tight loop.
E. JS GC has become so fast that worrying about allocations is misguided.

Any input is greatly appreciated!

[1]: https://www.html5rocks.com/en/tutorials/speed/static-mem-pools/
[2]: http://buildnewgames.com/garbage-collector-friendly-code/
[3]: http://radar.oreilly.com/2013/10/the-joys-of-static-memory-javascript.html