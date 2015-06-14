"use strict";

var EventEmitter = require('events').EventEmitter,
	Util = require('util'),
	net = require('net');

var Tracker = require('./Tracker').Tracker;
var ProtocolConfig = require('./Tracker').ProtocolConfig;

var Config = require('./Message').Config;

/**
 * Constructor
 * @param {options} options
 */
function Server(opts) {
  
  this.config = new Config( opts );
    
  this.trackers = [];
  this.tcpServers = [];

  var _this = this;
    
  /* Start servers for protocols */
  for (var key in ProtocolConfig) {
	(function(key) {		// to initialize by value, not by reference
		_this.tcpServers[key] = net.createServer( function(connection) {
			var tracker = new Tracker(key, connection, _this.config);

			tracker.on('connect', function(imei) 	{ _this.emit('connect', imei, tracker); });
			
			tracker.on('message', function(message) { _this.emit('message', message, tracker); });
			tracker.on('position', function(pos) 	{ _this.emit('position', pos, tracker); });
			
			tracker.on('packet.in', function(packet) { _this.emit('packet.in', packet, tracker); });
			tracker.on('packet.out', function(packet) { _this.emit('packet.out', packet, tracker); });
			
			tracker.on('error', function(err, data) { _this.emit('error', err, data); });
			
			tracker.on('timeout', function() 		{ _this.emit('timeout', tracker); });
			tracker.on('disconnect', function() 	{
				for (var i in _this.trackers) {
					if (_this.trackers[i] == tracker) {
						_this.emit('disconnect', tracker);
						delete _this.trackers[i];
					  }
				  }
			});
			  
			_this.trackers.push(tracker);
			
		  }).listen( ProtocolConfig[key].port, function() {
				_this.emit('listen', ProtocolConfig[key].name, this.address().port);
		  });
    })(key);
  } // for all protocols
    
  return this;
}

Util.inherits(Server, EventEmitter);
module.exports = Server;
