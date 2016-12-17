/* global require, $, Materialize, google */

var googlemaps = require('./googlemaps'),
  api = require('./api'),
  search = require('./search'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  objectTypes = require('./object-types');
window.visibleTypes = {};

var logger = function (message, duration) {
  if (!message) return;
  console.log(message);
  Materialize.toast(message, duration || 2000)
};

var loadAll = function (types) {
  if (!types) types = _.keys(objectTypes);
  var shouldLoad = [];

  for (var type in objectTypes) {
    var objType = objectTypes[type];
    if (types.indexOf(type) > -1 && objType.marker !== false && map.zoom >= objType.zoom && visibleTypes[type]) {
      shouldLoad.push(type);
    }
  }
  return api.loadObjects(shouldLoad).then(map.showObjects);
};

var typeOrder = ['office', 'substation', 'line', 'tower', 'fider', 'pole', 'tp', 'fider04', 'pole04'];
var tp = _.template(
  '<div><input type="checkbox" checked value="<%= type %>" id="checkbox-<%= type %>">'
  + '<label for="checkbox-<%= type %>"><%= name %></label></div>');
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
  $("#search-type").find("input[type=checkbox]").each(function () {
    types[$(this).val()] = $(this).is(":checked");
  });
  return types;
};

var adjustVisibility = function () {
  var types = getVisibleLayers();

  for (var type in types) {
    if(!types.hasOwnProperty(type))
      continue;

    var enabled = types[type];
    var lastEnabled = visibleTypes[type];
    var needToLoad = [];

    map.setLayerVisible(type, enabled);

    switch (type) {
      case "line":
        if (enabled && lastEnabled) {

        } else if (enabled) {
          map.showLines = true;
          map.loadLines();
        } else {
          map.showLines = false;
          map.clearLines();
        }
        break;
      case "fider":
        if (enabled && lastEnabled) {

        } else if (enabled) {
          map.showFiders = true;
          map.loadFiders();
        } else {
          map.showFiders = false;
          map.clearFiders();
        }
        break;
      case "fider04":
        if (enabled && lastEnabled) {

        } else if (enabled) {
          map.load04Fiders();
          map.show04Fiders = true;
        } else {
          map.clear04Fiders();
          map.show04Fiders = false;
        }
        break;
      default:
        if (enabled && !lastEnabled) {
          needToLoad.push(type);
        }
    }
  }

  loadAll(needToLoad);
  window.visibleTypes = types;
};

logger('იტვირთება...', 6000);

googlemaps.start().then(googlemaps.create).then(function (map) {
  // setting loggers
  map.logger = api.logger = search.logger = logger;

  window.map = map;
  search.initialize(map);

  map.showLines = true;
  map.showFiders = true;
  map.show04Fiders = true;

  google.maps.event.addListener(map, 'idle', function () {
    window.visibleTypes = getVisibleLayers();
    Promise.all([
      loadAll(),
      map.loadLines()
    ]);
  });

  $("#search-type").find("input").on('change', adjustVisibility);

  $("#search-region").on('change', function () {
    map.clearAll();
    map.clearFiders();
    map.clear04Fiders();
    loadAll();
    map.loadLines();
  });
});
