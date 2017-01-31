
function PoolES5 (maker, initialCount) {
  this.NEXT = '@@__next__';
  this.POOLED = '@@__pooled__';
  this.RETAINED = '@@__retained__';

  this.first = null;
  this.prev = null;

  this.count = initialCount;
  this.freeCount = 0;

  this.maker = maker;

  this.allocate();
}

PoolES5.prototype.allocate = function () {
  this.first = this.maker();
  this.prev = this.first;

  for (var i = 0; i < this.count; i++) {
    var next = this.maker();
    this.prev[this.NEXT] = next;
    this.prev[this.POOLED] = true;
    this.prev[this.RETAINED] = false;
    this.prev = next;
    this.freeCount += 1;
  }

  this.prev[this.NEXT] = null;
}

PoolES5.prototype.retain = function () {
  if (this.first === null) {
    this.count = this.count * this.count;
    this.allocate();
  }

  var free = this.first;
  this.first = free[this.NEXT];
  this.freeCount -= 1;
  free[this.RETAINED] = true;
  return free;
}

PoolES5.prototype.release = function (obj) {
  obj[this.RETAINED] = false;
  obj[this.NEXT] = this.first;
  this.first = obj;
  this.freeCount += 1;
}

module.exports = PoolES5;