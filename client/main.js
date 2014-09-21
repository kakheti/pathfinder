var googlemaps = require('./googlemaps');
var api = require('./api');

var logger = function(message) {
  var el = document.getElementById('messages');
  if( message ) { el.innerHTML = '<span>' + message + '</span>'; }
  else { el.innerHTML = ''; }
};

logger('იტვირთება...');

googlemaps.start().then(googlemaps.create).then(function(map) {
  map.logger = api.logger = logger;
  api.loadTowers()
    .then(map.showTowers)
    .then(api.loadSubstations)
    .then(map.showSubstations);
});
