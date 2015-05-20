var MessagePosition = ('./Message');

TK104 = function() {
  // do something, define constants
  this.command = {
    /* Incoming commands */
    LOGIN			: 'A',
    HEARTBEAT			: 'HEARTBEAT',
    AUTOMATIC_EVENT_REPORT	: 'AUTOMATIC_EVENT_REPORT',  // The most common reply by tracker device
    
    /* Outgoing commands */
    REAL_TIME_LOCATION_QUERY	: 'B',
    
    SET_HEARTBEAT_INTERVAL	: null,
    SET_TRACK_BY_TIME_INTERVAL	: 'C',
    SET_TRACK_BY_DISTANCE	: null,
  };
  
  this.event = {
    ALARM_SOS			: 'help me',
    ALARM_LOW_BATTERY		: 'low battery',
    ALARM_LOW_BATTERY_EXTERNAL	: null,
    
    STATUS_GPS_SIGNAL_LOSE	: null,
    STATUS_GPS_SIGNAL_RECOVERY	: null,
    STATUS_ENTER_SLEEP		: null,
    STATUS_EXIT_SLEEP		: null,
    STATUS_POWER_ON		: 'STATUS_POWER_ON',
    
    REPORT_HEARTBEAT		: 'REPORT_HEARTBEAT',
    REPORT_DIRECTION_CHANGE	: null,
    REPORT_BY_DISTANCE		: null,
    REPORT_REAL_TIME_LOCATION_QUERY	: null,
    REPORT_BY_TIME_INTERVAL	: 'tracker'
  };
  
  this.EOL = ';';
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
 * parse Message
 * @param {string} message
 */
TK104.prototype.parseMessage = function( msg ) {
  
  /* Heartbeat message (only imei is send) */
  if (msg.indexOf(',') === -1) {
  	return new Message({
  		raw:	msg,
  		imei:	msg,
  		command: this.HEARTBEAT,
  		event: this.REPORT_HEARTBEAT,
  		data: null
  	});
  }
  
  var parts = msg.split(',');
  
  /* Logon message */
  if (parts && parts[0] && parts[0] === '##') {
  	return new Message({
  		raw:	msg,
  		imei:	(/imei\:([0-9]*)/).exec(msg)[1],
  		command: this.LOGIN,
  		event:	this.STATUS_POWER_ON,
  		data:	null
  	});
  }
  
  /* Parse message */
  if (parts && parts[0] && parts[1]) {
	return new Message({
		raw:	msg,
  		imei:	(/imei\:([0-9]*)/).exec(msg)[1],
  		command: this.AUTOMATIC_EVENT_REPORT,
  		event:	this.getEventByCode( parts[1] ),
  		data:	msg
	});  	
  }
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
