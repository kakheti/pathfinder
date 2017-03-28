/* global require, $, Materialize, google */

/**
 * Imports
 */

var googlemaps = require('./googlemaps'),
  api = require('./api'),
  search = require('./search'),
  _ = require('lodash'),
  objectTypes = require('./object-types');

/**
 * Local functions
 */

var logger = function (message, duration) {
  if (!message) return;
  console.log(message);
  Materialize.toast(message, duration || 2000);
};

var loadAll = function (types, message) {
  if (!types) types = _.keys(objectTypes);
  var shouldLoad = [];

  for (var type in objectTypes) {
    var objType = objectTypes[type],
      loadable = types.indexOf(type) > -1 && objType.marker !== false && map.zoom >= objType.zoom,
      allLoaded = objType.zoom === 0 && objType.loaded;
    if (loadable && !allLoaded) {
      shouldLoad.push(type);
    }
  }

  return api.loadObjects(shouldLoad, message).then(function (objects) {
    shouldLoad.forEach(function (type) {
      objectTypes[type].loaded = true;
    });

    return map.showObjects(objects);
  });
};

/**
 * Local variables
 */

var typeOrder = ['office', 'substation', 'line', 'tower', 'fider', 'pole', 'tp', 'fider04', 'pole04'],
  checkboxTp = _.template('<div class="checkbox-eye"><input type="checkbox" <%= checked %> value="<%= type %>" id="visible-type-<%= type %>">'
    + '<label for="visible-type-<%= type %>"><%= name %></label></div>'),
  searchTp = _.template('<div class="checkbox-search"><input type="checkbox" checked value="<%= type %>" id="search-type-<%= type %>">'
    + '<label for="search-type-<%= type %>"><%= name %></label></div>'),
  $visibleTypes = $("#visible-types"),
  $searchTypes = $("#search-types"),
  $searchQuery = $("#search-query"),
  $searchFilters = $("#search-filters"),
  $sidebar = $('.sidebar')
  $openSidebar = $('.open-sidebar');

/**
 * Code
 */

$openSidebar.on('click', function () {
  $sidebar.removeClass('closed');
});

window.visibleTypes = {};

typeOrder.forEach(function (type) {
  $visibleTypes.append(checkboxTp({
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
  var regionTp = _.template("<option value='<%=id%>'><%=name%></option>");
  regions.forEach(function (region) {
    // $("#visible-region, #search-region").append(regionTp(region));
    $("#search-region").append(regionTp(region));
  });
});

$searchQuery.on('focus', function () {
  $searchFilters.show();
});
$('body').on('click', function () {
  $searchFilters.hide();
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

    var enabled = types[type];

    map.setLayerVisible(type, enabled);

    switch (type) {
      case "line":
        map.showLines = enabled;
        break;
      case "fider":
        map.showFiders = enabled;
        break;
      case "fider04":
        map.show04Fiders = enabled;
        break;
      default:
        if (enabled) {
          needToLoad.push(type);
        }
    }
  }

  map.updateStyle();

  loadAll(needToLoad);
  map.loadLines();
  window.visibleTypes = types;
};

var map = googlemaps.create();

// setting loggers
map.logger = api.logger = search.logger = logger;

window.map = map;
search.initialize(map);

map.showLines = true;
map.showFiders = true;
map.show04Fiders = true;

google.maps.event.addListener(map, 'idle', adjustVisibility);

$visibleTypes.find("input").on('change', adjustVisibility);

// $("#visible-region").on('change', function () {
//   map.clearAll();
//   map.clearFiders();
//   map.clear04Fiders();
//   adjustVisibility();
//   map.loadLines();
// });
