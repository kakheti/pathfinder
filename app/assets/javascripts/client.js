/* global require, $, Materialize */

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
  var types = [];
  var visibleTypes = getVisibleLayers();

  for(var type in objectTypes) {
    var objType = objectTypes[type];
    if(objType.marker !== false && map.zoom >= objType.zoom && visibleTypes[type]) {
      types.push(type);
    }
  }
  return api.loadObjects(types).then(map.showObjects);
};

var typeOrder = ['office', 'substation', 'line', 'tower', 'fider', 'pole', 'tp', 'fider04', 'pole04'];
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

var getVisibleLayers = function () {
  var types = {};
  $("#search-type").find("input[type=checkbox]").each(function(){
    types[$(this).val()] = $(this).is(":checked");
  });
  return types;
};

var adjustVisibility = function () {
  var types = getVisibleLayers();

  for(var type in types) {
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
      case "fider04":
        if(enabled) {
          map.load04Fiders();
          map.show04Fiders = true;
        } else {
          map.clear04Fiders();
          map.show04Fiders = false;
        }
        break;
    }

    loadAll();
  }
};

logger('იტვირთება...', 6000);

googlemaps.start().then(googlemaps.create).then(function(map) {
  // setting loggers
  map.logger = api.logger = search.logger = logger;

  window.map = map;
  search.initialize(map);

  map.showLines = true;
  map.showFiders = true;
  map.show04Fiders = true;

  google.maps.event.addListener(map, 'tilesloaded', function() {
    Promise.all([
      loadAll(),
      map.loadLines(),
      map.loadFiders(),
      map.load04Fiders()
    ]).then(function () {
      console.log("Bounds changed, markers loaded")
    });
  });

  $("#search-type").find("input").on('change', adjustVisibility);

  $("#search-region").on('change', function() {
    var visibleTypes = getVisibleLayers();

    map.clearAll();
    map.clearFiders();
    map.clear04Fiders();
    loadAll();
    map.loadFiders();
    map.load04Fiders();
  });
});
