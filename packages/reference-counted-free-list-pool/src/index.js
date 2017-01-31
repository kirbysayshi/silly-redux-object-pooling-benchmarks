
function RCFLPool (maker, initialCount) {
  this.NEXT = '@@__next__';
  this.RC = '@@__rc__';

  this.first = null;
  this.prev = null;

  this.count = initialCount;
  this.freeCount = 0;

  this.maker = maker;

  this.allocate();
}

RCFLPool.prototype.allocate = function () {
  this.first = this.maker();
  this.prev = this.first;

  for (var i = 0; i < this.count; i++) {
    var next = this.maker();
    this.prev[this.NEXT] = next;
    this.prev[this.RC] = 0;
    this.prev = next;
    this.freeCount += 1;
  }

  this.prev[this.NEXT] = null;
}

RCFLPool.prototype.retain = function () {
  if (this.first === null) {
    this.count = this.count * this.count;
    this.allocate();
  }

  var free = this.first;
  this.first = free[this.NEXT];
  this.freeCount -= 1;
  free[this.RC] += 1;
  return free;
}

RCFLPool.prototype.release = function (obj) {
  obj[this.RC] -= 1;
  if (obj[this.RC] <= 0) {
    obj[this.RC] = 0;
    obj[this.NEXT] = this.first;
    this.first = obj;
    this.freeCount += 1;
  }
}

module.exports = RCFLPool;