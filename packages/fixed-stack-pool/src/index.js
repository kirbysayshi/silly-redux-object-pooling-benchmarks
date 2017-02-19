function FixedStackPool(maker, batchSize) {
  this.free = Array(batchSize);
  this.freeIndex = 0;
  this.maker = maker;
  this.batchSize = batchSize;

  this.allocate();
}

FixedStackPool.prototype.allocate = function() {
  for (var i = 0; i < this.batchSize; i++) {
    var obj = this.maker();
    this.free[i] = obj;
  }
  this.freeIndex = i - 1;
};

FixedStackPool.prototype.retain = function() {
  if (this.freeIndex < 0) {
    this.batchSize = this.batchSize * this.batchSize;
    this.allocate();
  }
  var obj = this.free[this.freeIndex];
  this.free[this.freeIndex] = null;
  this.freeIndex--;
  return obj;
};

FixedStackPool.prototype.release = function(obj) {
  this.free[++this.freeIndex] = obj;
};

module.exports = FixedStackPool;
