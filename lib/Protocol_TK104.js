"use strict";

var Message  = require('./Message').Message,
    Position = require('./Message').Position;


function Protocol() {

  // do something, define constants
  this.COMMAND = {
    /* Incoming commands */
    REQ_LOGIN				: 'LOGIN_REQUEST',
    REQ_HEARTBEAT			: 'HEARTBEAT_REQUEST',
    AUTOMATIC_EVENT_REPORT	: 'AUTOMATIC_EVENT_REPORT',  // The most common reply by tracker device
    
    /* Outgoing commands */
    RES_LOGIN				: 'LOAD',
    RES_HEARTBEAT			: 'ON',
	
    REAL_TIME_LOCATION_QUERY	: 'B',		// **,imei:359586018966098,B
    
    SET_HEARTBEAT_INTERVAL		: null, 	// not available for TK104
    SET_TRACK_BY_TIME_INTERVAL	: 'C',		// **,imei:359586018966098,C,10[s|m|h]
	
	SET_SMS_MODE				: 'N'		// **,imei:359586018966098,N
  };
  
  this.EVENT = {
    ALARM_SOS					: 'help me',
    ALARM_LOW_BATTERY			: 'low battery',
    
    STATUS_GPS_SIGNAL_LOSE		: null,
    STATUS_GPS_SIGNAL_RECOVERY	: null,
    STATUS_ENTER_SLEEP			: null,
    STATUS_EXIT_SLEEP			: null,
    STATUS_POWER_ON				: 'STATUS_POWER_ON',
    
    REPORT_HEARTBEAT			: 'REPORT_HEARTBEAT',
    REPORT_DIRECTION_CHANGE		: null,
    REPORT_BY_DISTANCE			: null,
    REPORT_REAL_TIME_LOCATION_QUERY	: null,
    REPORT_BY_TIME_INTERVAL		: 'tracker'
  };
  
  this.EOL = ';';
}

Protocol.prototype.getCommandByCode = function(code) {
  for (var key in this.COMMAND) {
		if (this.COMMAND[key] === code) {
			return key;
		}
	}
	return 'UNKNOWN_COMMAND';    
}
  
Protocol.prototype.getEventByCode = function(code) {
  for (var key in this.EVENT) {
		if (this.EVENT[key] === code) {
			return key;
		}
	}
	return 'UNKNOWN_EVENT';
}

/**
 * parse Message
 * @param {string} message
 */
Protocol.prototype.parseMessage = function( msg ) {
  
  /* Heartbeat message only (only imei is send), imei should by > 5 (~15) */
  if (msg.indexOf(',') === -1 && (/([0-9]*)/).exec(msg)[1]) {
	return new Message({
  		raw:	msg,
  		imei:	(/([0-9]*)/).exec(msg)[1],
  		command: this.COMMAND.REQ_HEARTBEAT,
		commandText: this.getCommandByCode( this.COMMAND.REQ_HEARTBEAT ),
  		event: this.EVENT.REPORT_HEARTBEAT,
		eventText: this.getEventByCode( this.EVENT.REPORT_HEARTBEAT ),
  		data: null
  	});
  }
  
  var parts = msg.split(',');

  /* Logon message */
  if (parts && parts[0] && parts[0] === '##') {
  	
	return new Message({
  		raw:	msg,
  		imei:	(/imei\:([0-9]*)/).exec(msg)[1],
  		command: this.COMMAND.REQ_LOGIN,
		commandText: this.getCommandByCode( this.COMMAND.REQ_LOGIN ),
  		event:	this.EVENT.STATUS_POWER_ON,
		eventText:	this.getEventByCode( this.EVENT.STATUS_POWER_ON) ,
  		data:	null
  	});
  }
  
  /* Heartbeat message + other message  */
  /*	TODO handle one after the other */
  
  
  /* Parse message */
  if (parts && parts[0] && parts[1]) {
	return new Message({
		raw:	msg,
  		imei:	(/imei\:([0-9]*)/).exec(msg)[1],
  		command: this.COMMAND.AUTOMATIC_EVENT_REPORT,
		commandText: this.getCommandByCode( this.COMMAND.AUTOMATIC_EVENT_REPORT ),
		event:	parts[1].toString(),
  		eventText:	this.getEventByCode( parts[1].toString() ),
  		data:	msg
	});  	
  }
}

/**
 * parse position from Message.data
 * @param {message.data} data
 */
Protocol.prototype.parsePosition = function( data ) {

  var parts = data.split(",");
  
  return new Position({
	raw:	data,          				  // full GPS location message as received from GPS tracker
	lat:	fixGeo(parts[7], parts[8]),   // GPS latitude in Degree
	lng:	fixGeo(parts[9], parts[10]),  // GPS longitude in Degree
	date:	new Date(
			  parseInt("20" + parts[2].substr(0, 2), 10), 
              parseInt(parts[2].substr(2,2),10) - 1, 
              parseInt(parts[2].substr(4,2),10),
              parseInt(parts[2].substr(6,2),10),
              parseInt(parts[2].substr(8,2),10),
              parseInt(parts[2].substr(10,2),10)),   // GPS datetime
	fix:	(parts[4] == 'F') ? true : false,         // GPS fix valid or not
	speed:	{
            'knots': Math.round(parts[11] * 1000) / 1000,
            'kmh':   Math.round(parts[11] * 1.852 * 1000) / 1000,
            'mph':   Math.round(parts[11] * 1.151 * 1000) / 1000
			},
	imei:	parts[0].split(":")[1],           // GPS tracker IMEI
	eventText:	this.getEventByCode( parts[1].toString() )
	});
}

Protocol.prototype.prepare = function(imei, cmd, data) {
  
  if (cmd == this.COMMAND.RES_LOGIN) {
	// LOAD
	return new Message({
		raw: cmd,
		imei: imei,
		command: cmd,
		commandText: this.getCommandByCode( cmd ),
		event:	null,
		eventText: null,
		data:	data
		});
  }
  
  if (cmd == this.COMMAND.RES_HEARTBEAT) {
	// ON
	return new Message({
		raw: cmd,
		imei: imei,
		command: cmd,
		commandText: this.getCommandByCode( cmd ),
		event:	null,
		eventText: null,
		data:	data
		});
  }
  
  if (cmd == this.COMMAND.SET_HEARTBEAT_INTERVAL) {
	return null;
  }
  
  if (cmd == this.COMMAND.SET_TRACK_BY_TIME_INTERVAL) {
	// **,imei:359586018966098,C,10[s|m|h]
	return new Message({
		raw: '**,imei:' + imei + ',' + cmd + ',' + data.interval + 's',
		imei: imei,
		command: cmd,
		commandText: this.getCommandByCode( cmd ),
		event:	null,
		eventText: null,
		data:	data
		});
  }
  
  if (cmd == this.COMMAND.REAL_TIME_LOCATION_QUERY) {
	// **,imei:359586018966098,B
	return new Message({
		raw: '**,imei:' + imei + ',' + cmd,
		imei: imei,
		command: cmd,
		commandText: this.getCommandByCode( cmd ),
		event:	null,
		eventText: null,
		data:	data
		});
  }
  
  if (cmd == this.COMMAND.SET_GSM_MODE) {
	// **,imei:359586018966098,N
	return new Message({
		raw: '**,imei:' + imei + ',' + cmd,
		imei: imei,
		command: cmd,		
		commandText: this.getCommandByCode( cmd ),
		event:	null,
		eventText: null,
		data:	data
		});
  }

  return null;
}

Protocol.prototype.send = function(clientconn, msg) {
	clientconn.write( new Buffer(msg.raw) );
}

module.exports = Protocol;

/*
 * from tk10x format to decimal
 */
var fixGeo = function(number, letter) {
  var minutes = number.substr(-7, 7);
  var degrees = parseInt(number.replace (minutes, ''), 10);
  var number = degrees + (minutes / 60);
  var number = parseFloat((letter === 'S' || letter === 'W' ? '-' : '') + number);
  return Math.round(number * 1000000) / 1000000;
};
