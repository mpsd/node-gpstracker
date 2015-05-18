/* Implement TK104 protocol */

TK104 = function() {
  // do something, define constants
  this.command = {
    LOGIN:      '',
    HEARTBEAT:  '',
    AUTOMATIC_EVENT_REPORT: '',
    
  };
  
  
  this.event = {
    
  };
}

TK104.prototype.getCommandByCode = function(code) {
  for (var key in this.command) {
		if (this.command[key] === code) {
			return key;
		}
	}
	return 'UNKNOWN_COMMAND';    
}
  
TK104.prototype.getEventByCode = function(code) {
  for (var key in this.event) {
		if (this.event[key] === code) {
			return key;
		}
	}
	return 'UNKNOWN_EVENT';
}

/**
 * parse Message from socket
 * @param {net.socket.buffer} buffer
 */
TK104.prototype.parseMessage = function( buffer ) {
  
}

/**
 * parse position from Message.data
 * @param {message.data} data
 */
TK104.prototype.parsePosition = funtion( data ) {
  
}

TK104.prototype.prepare = function(imei, cmd, data) {
  
}
module.exports = TK104;
