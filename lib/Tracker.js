/* Define Tracker class */

var EventEmitter = require('events').EventEmitter;
var Tracker = new EventEmitter;

/* Available protocols for message handling, see constructors 'case' statement to implement other protocols */

Tracker.TK104 = 'TK104';
var TK104 = require('./Protocol_TK104');

Tracker.KT90  = 'KT90';
var KT90  = require('./Protocol_KT90');

/**
 * Constructor
 * @param {string} protocol (Tracker.KT90 | Tracker.TK104 | ...)
 * @param {net.socket} connection
 * @param {object} options
 */
Tracker = function(proto, conn, opts) {
  this.imei = null;
  
  this.connection = conn;
  this.connection.setEncoding('utf-8');
  
  this.config = {
    timeout: 120     // timeout in s
    };
  
  if( typeof opts === 'object' && Object.keys(opts) .length >= 1 ) {
    for (var key in opts) {
        this.config[key] = opts[key];
    }
  }
  
  switch (proto)
  {
    case this.TK104:
      this.message = new TK104();
      break;
    case this.KT90:
      this.message = new KT90();
      break;
    default:
      this.emit('error', new Error('Unknown protocol'));
  }
  
  /* define handlers */
  var tracker = this;
  this.connection.on('data', function(msg) {
    tracker.emit('packet.in', msg);
  
    if (!tracker.imei) {
      tracker.imei = tracker.message.getImei(msg);
      tracker.emit('connect', tracker.imei);
    }
    
    tracker.message.parse(msg);
    
  });
  
  this.connection.on('close', function() {
    tracker.emit('disconnect');
  });
  
  if (this.config.timeout > 0) {
    this.connection.setTimeout(this.config.timeout * 1000, function() {
      tracker.emit('timeout');
      tracker.disconnect();
    });
  }
}

/**
 * Send command to tracker
 * @param {string} command to send
 */
Tracker.prototype.send = function(msg) {
  this.emit('packet.out', msg);
  this.connection.write( msg.toBuffer() );
}

/**
 * Disconnect tracker
 */
Tracker.prototype.disconnect = function() {
  if (!this.connection.destroyed) {
    this.connection.destroy();
  }
}

module.exports = Tracker;
