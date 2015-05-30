var googlemaps = require('./googlemaps');
var api = require('./api');
var search = require('./search');
var $ = require('jquery');
var objectTypes = require('./object-types');

var logger = function(message, duration) {
  if(!message) return;
  console.log(message);
  Materialize.toast(message, duration || 2000)
};

var loadAll = function() {
  for(type in objectTypes) {
    var objType = objectTypes[type];
    if(objType.marker !== false && map.zoom >= objType.zoom) {
      api.loadObjects(type).then(map.showObjects);
    }
  }
}

logger('იტვირთება...', 6000);

googlemaps.start().then(googlemaps.create).then(function(map) {
  // setting loggers
  map.logger = api.logger = search.logger = logger;

  window.map = map;
  search.initialize(map);

  google.maps.event.addListener(map, 'tilesloaded', function() {
    loadAll();
    map.loadLines();
    map.loadFiders();
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

  $("#search-region").on('change', function(){
    map.clearAll();
    map.clearLines();
    loadAll();
    map.loadLines();
    map.loadFiders();
  });
});
