var PriorityQueue = function(priorityFunc) {
  this.priority = priorityFunc; //priority is a function that takes two parameters x1 and x2. If priority(x1, x2) == true, x1 comes before x2 in the priority queue
  this.queue = [];
};

PriorityQueue.prototype.enqueue = function(item) {
  for (var i = 0; i < this.queue.length; i++) {
    if (this.priority(item, this.queue[i])) {
      this.queue.splice(i, 0, item);
      return;
    }
  }
  this.queue.push(item);
};

PriorityQueue.prototype.dequeue = function() {
  return this.queue.shift();
};

PriorityQueue.prototype.length = function() {
  return this.queue.length;
};

PriorityQueue.prototype.peek = function() {
  return this.queue[0];
};

PriorityQueue.prototype.filter = function(filterFunc) { //if filterFunc(item) == true, keep the item
  var newQueue = [];
  for (var i = 0; i < this.queue.length; i++) {
    if (filterFunc(this.queue[i])) {
      newQueue.push(this.queue[i]);
    }
  }
  this.queue = newQueue;
};

PriorityQueue.prototype.remove = function(filterFunc) { //if filterFunc(item) == true, remove the item -> only removes the first item found
  for (var i = 0; i < this.queue.length; i++) {
    if (filterFunc(this.queue[i])) {
      this.queue.splice(i, 1);
    }
  }
}
