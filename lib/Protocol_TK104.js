var MessagePosition = ('./Message');

TK104 = function() {
  // do something, define constants
  this.command = {
    /* Incoming commands */
    LOGIN			: '',
    HEARTBEAT			: '',
    AUTOMATIC_EVENT_REPORT	: '',  // The most common reply by tracker device
    
    /* Outgoing commands */
    REAL_TIME_LOCATION_QUERY	: 'A10',
    
    SET_HEARTBEAT_INTERVAL	: 'A11',
    SET_TRACK_BY_TIME_INTERVAL	: 'A12',
    SET_TRACK_BY_DISTANCE	: 'A14',
  };
  
  this.event = {
    ALARM_SOS			: 1,
    ALARM_LOW_BATTERY		: 17,
    ALARM_LOW_BATTERY_EXTERNAL	: 18,
    
    STATUS_GPS_SIGNAL_LOSE	: 24,
    STATUS_GPS_SIGNAL_RECOVERY	: 25,
    STATUS_ENTER_SLEEP		: 26,
    STATUS_EXIT_SLEEP		: 27,
    STATUS_POWER_ON		: 29,
    
    REPORT_HEARTBEAT		: 31,
    REPORT_DIRECTION_CHANGE	: 32,
    REPORT_BY_DISTANCE		: 33,
    REPORT_REAL_TIME_LOCATION_QUERY	: 34,
    REPORT_BY_TIME_INTERVAL	: 35
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
  
  return new Message();
}

/**
 * parse position from Message.data
 * @param {message.data} data
 */
TK104.prototype.parsePosition = funtion( data ) {
  
  return new Position();
}

TK104.prototype.prepare = function(imei, cmd, data) {
  
  return new Message();
}
module.exports = TK104;
