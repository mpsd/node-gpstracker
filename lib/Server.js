/* Implement TCP Server(s) per protocol */

var EventEmitter = require('events').EventEmitter;
var net = require('net');
var Tracker = require('./Tracker');

var Server = new EventEmitter;

/**
 * Constructor
 * @param {options} options
 */
Server = function (opts) {
  this.config = {
    timeout: 120    // in s
  };
  
  if( typeof opts === 'object' && Object.keys(opts) .length >= 1 ) {
    for (var key in opts) {
        this.config[key] = opts[key];
    }
  }
  
  this.trackers = [];
  
  var server = this;
  
  /* Start servers for protocols */
  this.tcpServers[Tracker.TK104.protocol] = net.CreateServer( function(connection) {
    var tracker = new Tracker(Tracker.TK104.protocol, connection, {timeout: server.config.timeout});
    
    tracker.on('connect', function(imei) { server.emit('connect', imei, tracker); });
        
    tracker.on('message', function(message) { server.emit('message', message, tracker); });
    tracker.on('position', function(pos) { server.emit('position', pos, tracker); });
    
    tracker.on('packet.in', function(packet){ server.emit('packet.in', packet, tracker); });
    tracker.on('packet.out', function(packet){ server.emit('packet.out', packet, tracker); });
    
    tracker.on('error', function(err, data){ server.emit('error', err, data); });
    tracker.on('disconnect', function() {
        for (var i in server.trackers) {
            if (server.trackers[i] == tracker) {
                server.emit('disconnect', tracker);
                delete server.trackers[i];
              }
          }
    });
        
    server.trackers.push(tracker);
    server.emit('connect', tracker);  
  }).listen(Tracker.TK104.port, function() {  server.emit('listen', Tracker.TK104.protocol, Tracker.TK104.port)});
  
  this.tcpServers[Tracker.KT90.protocol] = net.CreateServer( function(connection) {
    var tracker = new Tracker(Tracker.KT90.protocol, connection, {timeout: server.config.timeout});
    
    tracker.on('connect', function(imei) { server.emit('connect', imei, tracker)});
    
    tracker.on('message', function(message){ server.emit('message', message, tracker); });
    tracker.on('position', function(pos) { server.emit('position', pos, tracker); });
    
    tracker.on('packet.in', function(packet){ server.emit('packet.in', packet, tracker); });
    tracker.on('packet.out', function(packet){ server.emit('packet.out', packet, tracker); });
    
    tracker.on('error', function(err, data){ server.emit('error', err, data); });
    tracker.on('disconnect', function() {
        for (var i in server.trackers) {
            if (server.trackers[i] == tracker) {
                server.emit('disconnect', tracker);
                delete server.trackers[i];
              }
          }
    });
        
    server.trackers.push(tracker);
    server.emit('connect', tracker);  
  }).listen(Tracker.KT90.port, function() {  server.emit('listen', Tracker.KT90.protocol, Tracker.KT90.port)});
  
  return this;
}

module.exports = Server;
