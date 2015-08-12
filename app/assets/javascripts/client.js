var googlemaps = require('./googlemaps'),
api = require('./api'),
search = require('./search'),
_ = require('lodash'),
Promise = require('bluebird'),
objectTypes = require('./object-types');

var logger = function(message, duration) {
  if(!message) return;
  console.log(message);
  Materialize.toast(message, duration || 2000)
};

var loadAll = function() {
  var promises = [];
  for(type in objectTypes) {
    var objType = objectTypes[type];
    if(objType.marker !== false && map.zoom >= objType.zoom) {
      promises.push(api.loadObjects(type).then(map.showObjects));
    }
  }
  return promises;
}

var typeOrder = ['office', 'substation', 'line', 'tower', 'fider', 'pole', 'tp'];
var tp = _.template(
  '<div><input type="checkbox" checked value="<%= type %>" id="checkbox-<%= type %>">'
  +'<label for="checkbox-<%= type %>"><%= name %></label></div>');
var container = $("#search-type");
typeOrder.forEach(function (type) {
  container.append(tp({
    type: type,
    name: objectTypes[type].plural
  }));
});

api.loadRegions().then(function (regions) {
  var option_tp = _.template("<option value='<%=id%>'><%=name%></option>");
  regions.forEach(function (region) {
    $("#search-region").append(option_tp(region));
  });
});

var adjustVisibility = function () {
  var types = {};

  $("#search-type input[type=checkbox]").each(function(){
    var enabled = $(this).is(":checked");
    types[$(this).val()] = enabled;
  });
  for(type in types) {
    var enabled = types[type];

    map.setLayerVisible(type, enabled);

    switch(type) {
      case "line":
        if(enabled) {
          map.loadLines();
          map.showLines = true;
        } else {
          map.clearLines();
          map.showLines = false;
        }
        break;
      case "fider":
        if(enabled) {
          map.loadFiders();
          map.showFiders = true;
        } else {
          map.clearFiders();
          map.showFiders = false;
        }
        break;
    }
  }
};

logger('იტვირთება...', 6000);

googlemaps.start().then(googlemaps.create).then(function(map) {
  // setting loggers
  map.logger = api.logger = search.logger = logger;

  window.map = map;
  search.initialize(map);

  google.maps.event.addListener(map, 'tilesloaded', function() {
    Promise.all([
      loadAll(),
      map.loadLines(),
      map.loadFiders()
    ]).then(adjustVisibility);
  });

  $("#search-type input").on('change', adjustVisibility);

  $("#search-region").on('change', function(){
    map.clearAll();
    map.clearFiders();
    loadAll();
    loadFiders();
  });
});
