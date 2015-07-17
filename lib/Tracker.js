"use strict";

var EventEmitter = require('events').EventEmitter,
	Util = require('util');

var ServerConfiguration = require('./Message').ServerConfiguration;
	
/* Available protocols for message handling */
				
var ProtocolConfig = {
	TK104:	{	name:	'TK104',
				port:	0,		// tracker_baseport + 0
				definition:	'./Protocol_TK104'
				},
	KT90:	{	name:	'KT90',
				port:	1,		// tracker_baseport + 1
				definition:	'./Protocol_KT90'
				}
};

/**
 * Constructor
 * @param {key} protocol config key (Tracker.KT90 | Tracker.TK104 | ...)
 * @param {net.socket} connection
 * @param {object} options
 */
function Tracker(proto, conn, opts) {

  this.imei = null;
  
  this.connection = conn;
  this.connection.setEncoding('utf-8');
  
  this.config = new ServerConfiguration( opts );
  this.config.initialized = false; // Tracker initialized? Heartbeat intervall, Tracking interval etc.
  
  
  /* read protocol definition for this tracker */
  var Definition = require(ProtocolConfig[proto].definition);
  this.Protocol = new Definition();
  
  /* define help methods */
  
  this.disconnect = function() {
	  if (!this.connection.destroyed) {
		this.connection.destroy();
	  }
	};
  
  /* define handlers */
  var _this = this;
  this.connection.on('data', function( buffer ) {
    
    var messages = buffer.toString('utf8').split( _this.Protocol.EOL );
    
    for (var key in messages) {
	
	  if (messages[key].length < 2) continue;	// chunk too short to be used 
	  
      var message = _this.Protocol.parseMessage( messages[key] );

      if (!message) {
        _this.emit('error', new Error('Error parsing message'), messages[key]);
        return;
      }
      
      _this.emit('packet.in', message.raw);
  
      if (!_this.imei && message.imei) {
        _this.imei = message.imei;
        _this.emit('connect', _this.imei);
      }
      
	  _this.emit('message', message);
	  
	  var res = null;
	  
      if (message.command === _this.Protocol.COMMAND.REQ_LOGIN) {
		res = _this.Protocol.prepare(_this.imei, _this.Protocol.COMMAND.RES_LOGIN, null);
		if (res) {
			_this.emit('packet.out', res.raw);
			_this.Protocol.send(_this.connection, res);
		}
	  }
		
		
	  if (!_this.config.initialized) {
		res = _this.Protocol.prepare(_this.imei, _this.Protocol.COMMAND.SET_HEARTBEAT_INTERVAL, { interval: _this.config.heartbeat_interval }); // seconds
		if (res) {
			_this.emit('packet.out', res.raw);
			_this.Protocol.send(_this.connection, res);
		}
		
		res = _this.Protocol.prepare(_this.imei, _this.Protocol.COMMAND.SET_TRACK_BY_TIME_INTERVAL, { interval: _this.config.tracking_interval });  // seconds
		if (res) {
			_this.emit('packet.out', res.raw);
			_this.Protocol.send(_this.connection, res);
		}
		
		_this.config.initialized = true;
      }
	  
	  if (message.command === _this.Protocol.COMMAND.REQ_HEARTBEAT) {
		res = _this.Protocol.prepare(_this.imei, _this.Protocol.COMMAND.RES_HEARTBEAT, null);
		if (res) {
			_this.emit('packet.out', res.raw);
			_this.Protocol.send(_this.connection, res);
		}
	  }

      if (message.command === _this.Protocol.COMMAND.AUTOMATIC_EVENT_REPORT) {
        _this.emit('position', _this.Protocol.parsePosition( message.raw ));
      }
	  
	  if (message.event === _this.Protocol.EVENT.ALARM_LOW_BATTERY) {		// switch off GPRS to save battery
		res = _this.Protocol.prepare(_this.imei, _this.Protocol.COMMAND.SET_GSM_MODE, null);
		if (res) {
			_this.emit('packet.out', res.raw);
			_this.Protocol.send(_this.connection, res);
		}
	  }
      
    } // for messages
  });
  
  this.connection.on('close', function() {
    _this.emit('disconnect');
  });
  
  if (this.config.timeout > 0) {
    this.connection.setTimeout(this.config.timeout * 1000, function() {
      _this.emit('timeout');
      _this.disconnect();
    });
  }
  
  return this;
}

Util.inherits(Tracker, EventEmitter);
module.exports = {
	ProtocolConfig: ProtocolConfig,
	Tracker: Tracker
	};
