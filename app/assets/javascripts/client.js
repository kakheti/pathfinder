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

var loadAll = function (types, message) {
  message = message || 'იტვირთება...';
  if (!types) types = _.keys(objectTypes);
  var shouldLoad = [];

  for (var type in objectTypes) {
    var objType = objectTypes[type];
    if (types.indexOf(type) > -1 && objType.marker !== false && map.zoom >= objType.zoom) {
      shouldLoad.push(type);
    }
  }

  return api.loadObjects(shouldLoad, message).then(map.showObjects);
};

var typeOrder = ['office', 'substation', 'line', 'tower', 'fider', 'pole', 'tp', 'fider04', 'pole04'],
  tp = _.template('<div class="checkbox-eye"><input type="checkbox" <%= checked %> value="<%= type %>" id="visible-type-<%= type %>">'
    + '<label for="visible-type-<%= type %>"><%= name %></label></div>'),
  searchTp = _.template('<div class="checkbox-search"><input type="checkbox" checked value="<%= type %>" id="search-type-<%= type %>">'
    + '<label for="search-type-<%= type %>"><%= name %></label></div>'),
  $visibleTypes = $("#visible-types"),
  $searchTypes = $("#search-types");

typeOrder.forEach(function (type) {
  $visibleTypes.append(tp({
    type: type,
    name: objectTypes[type].plural,
    checked: objectTypes[type].active ? "checked" : ""
  }));
  $searchTypes.append(searchTp({
    type: type,
    name: objectTypes[type].plural
  }));
});

api.loadRegions().then(function (regions) {
  var option_tp = _.template("<option value='<%=id%>'><%=name%></option>");
  regions.forEach(function (region) {
    $("#visible-region, #search-region").append(option_tp(region));
  });
});

var searchQuery = $("#search-query"),
  searchFilters = $("#search-filters");
searchQuery.on('focus', function () {
  searchFilters.show();
});
$('body').on('click', function () {
  searchFilters.hide();
});
$(".search").on('click', function (event) {
  event.stopPropagation();
});

var getVisibleLayers = function () {
  var types = {};
  $("#visible-types").find("input[type=checkbox]").each(function () {
    types[$(this).val()] = $(this).is(":checked");
  });

  return types;
};

var adjustVisibility = function () {
  var types = getVisibleLayers(),
    needToLoad = [];

  for (var type in types) {
    if (!types.hasOwnProperty(type))
      continue;

    var enabled = types[type],
      lastEnabled = window.visibleTypes[type];

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
          map.loadLines();
        } else {
          map.showFiders = false;
          map.clearFiders();
        }
        break;
      case "fider04":
        if (enabled && lastEnabled) {

        } else if (enabled) {
          map.loadLines();
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

googlemaps.start().then(googlemaps.create).then(function (map) {
  // setting loggers
  map.logger = api.logger = search.logger = logger;

  window.map = map;
  search.initialize(map);

  map.showLines = true;
  map.showFiders = true;
  map.show04Fiders = true;

  google.maps.event.addListener(map, 'idle', function () {
    Promise.all([
      adjustVisibility(),
      map.loadLines()
    ]);
  });

  $("#visible-types").find("input").on('change', adjustVisibility);

  $("#visible-region").on('change', function () {
    map.clearAll();
    map.clearFiders();
    map.clear04Fiders();
    adjustVisibility();
    map.loadLines();
  });
});
