function StackPool(maker, batchSize) {
  this.heap = [];
  this.maker = maker;
  this.batchSize = batchSize;

  this.allocate();
}

StackPool.prototype.allocate = function() {
  for (var i = 0; i < this.batchSize; i++) {
    var obj = this.maker();
    this.heap.push(obj);
  }
};

StackPool.prototype.retain = function() {
  if (!this.heap.length) this.allocate();
  return this.heap.pop();
};

StackPool.prototype.release = function(obj) {
  this.heap.push(obj);
};

module.exports = StackPool;
