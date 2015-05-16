/* Define Messagequeue class */

/**
 * Constructor
 * 
 */
MessageQueue = function() {
  this.current = null;
  this.queue = [];
  
  Object.defineProperty(this, 'length', {
    get: function() { return this.queue.length; }
  });
}

/**
 * Push to Queue
 * @param {object} message
 */
MessageQueue.prototype.push = function(msg) {
  this.queue.push({
    message: msg
  });
}

/**
 * Get current (first) queue object
 * @return {object | bool false}
 */
MessageQueue.prototype.get = function() {
  if (!this.current) {
    if (this.queue.length < 1) {
      return false;
    }
    this.current = this.queue.shift();
  }
  return this.current;
}

MessageQueue.prototype.isEmpty = function() {
  return this.queue.length === 0;
}

module.exports = MessageQueue;
