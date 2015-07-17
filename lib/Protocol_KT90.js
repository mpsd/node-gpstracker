"use strict";

var Message  = require('./Message').Message,
    Position = require('./Message').Position;


/*
	Meitrack protocol http://www.meitrack.net/meitrack-support/protocol/MEITRACK_GPRS_Protocol.pdf
	
	server to tracker: @@<Data identifier><Data length>,<IMEI>,<Command type>,<Command><*Checksum>\r\n
	tracker to server: $$<Data identifier><Data length>,<IMEI>,<Command type>,<Command><*Checksum>\r\n
	
 */
	
function Protocol() {

  // do something, define constants
  this.COMMAND = {
    /* Incoming commands */
    REQ_LOGIN				: 'LOGIN_REQUEST',
    REQ_HEARTBEAT			: 'HEARTBEAT_REQUEST',
    AUTOMATIC_EVENT_REPORT	: 'AAA',  // The most common reply by tracker device
    
    /* Outgoing commands */
    RES_LOGIN				: null,
    RES_HEARTBEAT			: null,
	
    REAL_TIME_LOCATION_QUERY	: 'A10',	
    
    SET_HEARTBEAT_INTERVAL		: 'A11', 	
    SET_TRACK_BY_TIME_INTERVAL	: 'A12',	
	
	SET_SMS_MODE				: null		

  };
  
  this.EVENT = {
  
    ALARM_SOS					: '1',
    ALARM_LOW_BATTERY			: '17',
    
    STATUS_GPS_SIGNAL_LOSE		: '24',
    STATUS_GPS_SIGNAL_RECOVERY	: '25',
    STATUS_ENTER_SLEEP			: '26',
    STATUS_EXIT_SLEEP			: '27',
    STATUS_POWER_ON				: '29',
    
    REPORT_HEARTBEAT			: '31',
    REPORT_DIRECTION_CHANGE		: '32',
    REPORT_BY_DISTANCE			: '33',
    REPORT_REAL_TIME_LOCATION_QUERY	: '34',
    REPORT_BY_TIME_INTERVAL		: '35'
 
    };
  
  this.EOL = '\r\n';
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
	// $$W129,353358017784062,AAA,35,22.540113,114.076141,100313094354,A,5,22,1,174,4,129,0,435,0|0|10133|4110,0000,166|224|193|2704|916,*BE\r\n
	
	/* split by ','
	$$W129				Data identifier & length
	353358017784062		IMEI
	AAA					Command
	35					Event
	22.540113			Lat
	114.076141			Lng
	100313094354		yymmddHHMMSS
	A					GPS status A..valid V..invalid
	5					GPS satellites
	22					GSM signal strength 0..31
	1					speed km/h
	174					direction
	4					Horizontal position accuracy 1..best 50..poor 99.9..?? 
	129					ele in m
	0					mileage in m
	435					runtime in s
	0|0|10133|4110		Basestation MCC|MNC|LAC|CI
	0000				IO port status
	166|224|193|2704|916 Analog input status
	*BE\r\n				Checksum & EOL
	
	*/

	// Verify checksum
	var data = msg.split('*');
	if ( calculateChecksum( data[0] + '*' ) != data[1].substr(0,2).toUpperCase() ) {
		// console.log('Checksum', calculateChecksum( data[0] + '*' ), 'incorrect > ignoring ...');
		return false;
	}

	var parts = msg.split(',');
	if ( parts && parts[2] && parts[3] ) {
		return new Message({
			raw:	msg,
			imei:	parts[1].toString(),
			command:	parts[2].toString(),
			commandText: this.getCommandByCode( parts[2].toString() ),
			event:		parts[3].toString(),
			eventText:	this.getEventByCode( parts[3].toString() ),
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
	raw:	data,          				// full GPS location message as received from GPS tracker
	lat:	parseFloat( parts[4] ), 	// GPS latitude in Degree
	lng:	parseFloat( parts[5] ), 	// GPS longitude in Degree
	date:	new Date(
			parseInt('20' + parts[6].substr(0, 2), 10), 
            parseInt(parts[6].substr(2,2),10) - 1, 
            parseInt(parts[6].substr(4,2),10),
            parseInt(parts[6].substr(6,2),10),
            parseInt(parts[6].substr(8,2),10),
            parseInt(parts[6].substr(10,2),10)
			),						   // GPS datetime
	ele:	parseInt(parts[13], 10),
	fix:	(parts[7] == 'A') ? true : false ,         // GPS fix valid or not
	speed:	{
			'knots': parseInt( parseFloat(parts[10]) / 1.85200, 10 ),
			'kmh': parseInt( parts[10], 10 ),
			'mph': parseInt( parseFloat(parts[10]) / 1.609344, 10 )
			},
	imei:	parts[1].toString(),           // GPS tracker IMEI
	eventText:	this.getEventByCode( parts[3].toString() )
	});

}

Protocol.prototype.prepare = function(imei, cmd, data) {
	
	if (!cmd) return null;
	
	var mess = (',').toString('ascii');
	mess += imei.toString(10);
	mess += (',').toString('ascii');
	mess += cmd.toString('ascii');
	mess += (',').toString('ascii');
	
	if (cmd == this.COMMAND.RES_LOGIN
		|| cmd == this.COMMAND.RES_HEARTBEAT
		|| cmd == this.COMMAND.REAL_TIME_LOCATION_QUERY
		|| cmd == this.COMMAND.SET_GSM_MODE) {
			mess += null;
		}

	
	if (cmd == this.COMMAND.SET_HEARTBEAT_INTERVAL) {
		var hbi = Math.floor(parseInt( data.interval) / 60).toString(10);
		mess += (hbi < 1) ? 1 : hbi;
		}
		
	if (cmd == this.COMMAND.SET_TRACK_BY_TIME_INTERVAL) {
		var ti = Math.floor(parseInt( data.interval) / 10).toString(10);
		mess += (ti < 1) ? 1 : ti;
		}
		
	mess += ('*').toString('ascii');
	
	var len = mess.length;	// ,<IMEI>,<Command type>,<Command><*Checksum>\r\n
	len += 2;				// Checksum (bytes)
	len += 2;				//  \r\n (bytes)
	
	var msg = '@@';								// Server prefix
	msg += String.fromCharCode( Math.floor( Math.random() * (122 - 65) + 65 ) ); // Data identifier 0x41 to 0x7a http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript
	msg += len.toString(10);												// Data length
	
	msg += mess;			// ,<IMEI>,<Command type>,<Command><*
	
	msg += calculateChecksum( msg );									// Checksum
	msg += ('\r\n').toString('ascii');
	
	return new Message({
		raw: msg,
		imei: imei,
		command: cmd,
		commandText: this.getCommandByCode( cmd ),
		event:	null,
		eventText: null,
		data:	data
		});

}


Protocol.prototype.send = function(clientconn, msg) {
	clientconn.write( new Buffer(msg.raw) );
}

module.exports = Protocol;


/* http://www.lammertbies.nl/forum/viewtopic.php?t=1842

   checksum: @@<Data identifier><Data length>,<IMEI>,<Command type>,<Command><*
   checksum: $$<Data identifier><Data length>,<IMEI>,<Command type>,<Command><*
 */
var calculateChecksum = function(data) {

	var b = 0; 
	
	for ( var c in data.split('') ) { 
		b += data.charCodeAt(c);
	} 
	
	b %= 256;
	
	return ( '00' + b.toString(16).toUpperCase() ).slice(-2); // must be 2 bytes
}
