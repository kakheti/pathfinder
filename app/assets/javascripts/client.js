var googlemaps = require('./googlemaps');
var api = require('./api');
var search = require('./search');
var $ = require('jquery');

var zoomLevels = {
  towers: 16,
  tps: 18,
  poles: 18,
  fiders: 16
};

var logger = function(message) {
  if(!message) return;
  console.log(message);
  window.currentToast = Materialize.toast(message, 2000)
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
      promise = promise.then(api.loadTowers).then(map.showTowers)
    }
    if(map.zoom >= zoomLevels.tps) {
      promise = promise.then(api.loadTps).then(map.showTps)
    }
    if(map.zoom >= zoomLevels.poles) {
      promise = promise.then(api.loadPoles).then(map.showPoles)
    }
    promise.then(map.loadLines)
  });

  $("#search-type input").on('change', function(){
    var allDisabled = true;
    var types = {};

    $("#search-type input[type=checkbox]").each(function(){
      var enabled = $(this).is(":checked");
      types[$(this).val()] = enabled;
      if(enabled) allDisabled = false;
    });
    for(type in types) {
      var enabled = types[type];
      if(allDisabled) enabled = true;

      googlemaps.setLayerVisible(type, enabled);
    }
  });
});
