var EventEmitter = require('events').EventEmitter;
var Tracker = new EventEmitter;

/* Available protocols for message handling, see constructors 'case' statement to implement other protocols */

Tracker.TK104 = {
  'protocol': 'TK104',
  'port': 5006
  };
var TK104 = require('./Protocol_TK104');

Tracker.KT90  = {
  'protocol': 'KT90',
  'port': 5007
  };
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
  
  if( typeof opts === 'object') {
    for (var key in opts) {
      if (typeof this.config[key] !== 'undefined') {
        this.config[key] = opts[key];
      }
    }
  }
  
  switch (proto)
  {
    case this.TK104.protocol:
      this.Message = new TK104();
      break;
    case this.KT90.protocol:
      this.Message = new KT90();
      break;
    default:
      this.emit('error', new Error('Unknown protocol'), proto);
  }
  
  /* define handlers */
  var tracker = this;
  this.connection.on('data', function(buffer) {
    
    var message = tracker.Message.parseMessage(buffer);
    if (!message) {
      tracker.emit('error', new Error('Error parsing message'), buffer);
      return;
    }
    
    tracker.emit('packet.in', message);
  
    if (!tracker.imei && message.imei) {
      tracker.imei = message.imei;
      tracker.emit('connect', tracker.imei);
    }
    
    if (message.command === tracker.Message.command.LOGIN) {
      // respond to login request
    }
    
    if (message.command === tracker.Message.command.HEARTBEAT) {
      // respond to heartbeat
    }
    
    if (message.command === tracker.Message.command.AUTOMATIC_EVENT_REPORT) {
      tracker.emit('message', message);
      tracker.emit('position', tracker.Message.parsePosition( new Buffer(message.data) ));
    }
    
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
