var googlemaps = require('./googlemaps');
var api = require('./api');
var search = require('./search');
var _ = require('lodash');
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

var tp = _.template(
  '<div><input type="checkbox" checked value="<%= type %>" id="checkbox-<%= type %>">'
  +'<label for="checkbox-<%= type %>"><%= name %></label></div>');
var container = $("#search-type");
for(type in objectTypes) {
  container.append(tp({
    type: type,
    name: objectTypes[type].plural
  }));
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
    var types = {};

    $("#search-type input[type=checkbox]").each(function(){
      var enabled = $(this).is(":checked");
      types[$(this).val()] = enabled;
    });
    for(type in types) {
      var enabled = types[type];

      map.setLayerVisible(type, enabled);

      /*switch(type) {
        case "line":
          if(enabled) map.loadLines();
          else map.clearLines();
          break;
        case "fider":
          if(enabled) map.loadFiders();
          else map.clearFiders();
          break;
      }*/
    }
  });

  $("#search-region").on('change', function(){
    map.clearAll();
    map.clearFiders();
    loadAll();
    map.loadFiders();
  });
});
