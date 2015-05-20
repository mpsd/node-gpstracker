Message = function(options) {
  this.raw ='';
  this.imei = '';
  this.command = '';
  this.event = '';
  this.data = '';

  // Fill in properties
  if (typeof options === 'object') {
    for (var key in options) {
      if (typeof this[key] !== 'undefined') {
          this[key] = options[key];
      }
    }
  }
}

Position = function() {
  this.raw = '';            // full GPS location message as received from GPS tracker
  this.lat = -1.0;          // GPS latitude in Degree
  this.lng = -1.0;          // GPS longitude in Degree
  this.date = new Date();   // GPS datetime
  this.fix = false;         // GPS fix valid or not
  this.speed = {            // GPS Speed
    "knots": 0.0,
    "kmh": 0,
    "mph": 0
  };
  this.ele = 0;             // GPS elevation in m
  this.bearing = 0;         // GPS direction in degree 0..360
  
  this.imei = '';           // GPS tracker IMEI
  this.event = '';          // GPS tracker event
}

module.exports = Message;
module.exports = Position;
