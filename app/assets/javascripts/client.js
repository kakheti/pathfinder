var googlemaps = require('./googlemaps');
var api = require('./api');
var search = require('./search');
var $ = require('jquery');
var objectTypes = require('./object-types');

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

    // Loading data
    logger("იტვირთება");

    for(type in objectTypes) {
      var objType = objectTypes[type];
      if(objType.marker !== false && map.zoom >= objType.zoom) {
        api.loadObjects(type).then(map.showObjects);
      }
    }
    map.loadLines();
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

      map.setLayerVisible(type, enabled);
    }
  });
});
