var googlemaps = require('./googlemaps');
var api = require('./api');
var search = require('./search');

var zoomLevels = {
  towers: 16,
  tps: 18,
  poles: 18,
  fiders: 16
};

var logger = function(message) {
  var el = document.getElementById('messages');
  if( message ) { el.innerHTML = '<span>' + message + '</span>'; }
  else { el.innerHTML = ''; }
};

logger('იტვირთება...');

googlemaps.start().then(googlemaps.create).then(function(map) {
  // setting loggers
  map.logger = api.logger = search.logger = logger;

  window.map = map;
  search.initialize(map);

  google.maps.event.addListener(map, 'tilesloaded', function() {

    // loading data
    var promise = api.loadSubstations().then(map.showSubstations);
    if(map.zoom >= zoomLevels.towers) {
      promise.then(api.loadTowers).then(map.showTowers)
    }
    if(map.zoom >= zoomLevels.tps) {
      promise.then(api.loadTps).then(map.showTps)
    }
    if(map.zoom >= zoomLevels.poles) {
      promise.then(api.loadPoles).then(map.showPoles)
    }
    promise.then(map.loadLines)
  });
});
