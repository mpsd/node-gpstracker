var Server = require('../lib/Server');
var server = new Server();


/* Register handlers */
server.on('listen', function(protoname, port) {
	console.log('listen:', protoname, port);
});

server.on('connect', function(imei, tracker) {
	console.log('connect:', imei);
});

server.on('packet.in', function(packet, tracker) {
	console.log('packet.in:', packet);
});

server.on('packet.out', function(packet, tracker) {
	console.log('packet.out:',  packet);
});

server.on('message', function(message, tracker) {
	console.log('message:', message);
});

server.on('position', function(position, tracker) {
	console.log('position:', position);
});

server.on('disconnect', function(tracker) {
	console.log('disconnect:', tracker.imei);
});

server.on('error', function(err, data) {
	console.log('error:', err);
});

server.on('timeout', function(tracker) {
	console.log('timeout:', tracker.imei);
});
