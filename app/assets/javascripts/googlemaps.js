/* global require */

var Promise = require('bluebird'),
  _ = require('lodash'),
  clusterer = require('./lib/markerclusterer'),
  api = require('./api'),
  objectTypes = require('./object-types');

var API_URL = 'https://maps.googleapis.com/maps/api/js';
var DEFAULT_ZOOM = 9;
var DEFAULT_LAT = 41.9;
var DEFAULT_LNG = 45.8;

var map;
var markerClusterers = {};
var infoWindow;

var styleFunction = function (f) {
  var clazz = f.getProperty('class');
  switch (clazz) {
    case 'Objects::FiderLine':
      return {
        strokeColor: '#FFA504',
        strokeWeight: 4,
        strokeOpacity: 0.5
      };
    case 'Objects::Fider04':
      return {
        strokeColor: '#2196F3',
        strokeWeight: 4,
        strokeOpacity: 0.5
      };
    case 'Objects::Line':
      return {
        strokeColor: '#FF0000',
        strokeWeight: 5,
        strokeOpacity: 0.5
      };
  }
};

var markerZoomer = function () {
  var zoom = map.getZoom();
  for (var type in objectTypes) {
    var clust = markerClusterers[type];
    var min_zoom = objectTypes[type].zoom;
    if (min_zoom <= zoom) {
      $("#visible-type-" + type).prop('disabled', false);
      if (clust && clust.savedMarkers) {
        clust.addMarkers(clust.savedMarkers);
        clust.savedMarkers = null;
      }
    } else {
      $("#visible-type-" + type).prop('disabled', true);
      if (type == 'fider') {
        map.clearFiders();
      }
      if (type == 'fider04') {
        map.clear04Fiders();
      }
      if (clust && !clust.savedMarkers) {
        clust.savedMarkers = clust.getMarkers();
        clust.clearMarkers();
      }
    }
  }
};

var loadAPI = function (opts) {
  return new Promise(function (resolve) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    var baseUrl = API_URL + '?v=3&callback=onGoogleMapLoaded&libraries=geometry&key=AIzaSyAHnzMNzJ-YzRFCiYgEbWt8DHX0RkGm8yo';

    if (opts && opts.apikey) {
      script.src = baseUrl + '&key=' + opts.apikey;
    } else {
      script.src = baseUrl;
    }

    document.body.appendChild(script);
    window.onGoogleMapLoaded = resolve;
  });
};

var createMap = function (opts) {
  var zoom = ( opts && opts.zoom ) || DEFAULT_ZOOM;
  var lat = ( opts && opts.center && opts.center.lat ) || DEFAULT_LAT;
  var lng = ( opts && opts.center && opts.center.lng ) || DEFAULT_LNG;
  var mapOptions = {
    zoom: zoom,
    center: new google.maps.LatLng(lat, lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var mapElement = document.getElementById(( opts && opts.mapid ) || 'mapregion');

  map = new google.maps.Map(mapElement, mapOptions);
  infoWindow = new google.maps.InfoWindow({content: ''});

  ///////////////////////////////////////////////////////////////////////////////

  map.objects = [];

  var markerClickListener = function () {
    var contentToString = function (content) {
      if (typeof content === 'string') {
        return content
      } else if (typeof content.error === 'string') {
        return content.error;
      } else {
        return content.toString();
      }
    };
    var marker = this;
    if (marker.content) {
      infoWindow.setContent(contentToString(marker.content));
      infoWindow.open(map, marker);
    } else {
      api.loadObjectInfo(marker.id, marker.type).then(function (content) {
        marker.content = content;
        infoWindow.setContent(contentToString(marker.content));
        infoWindow.open(map, marker);
      });
    }
  };

  var lineInfo = new google.maps.InfoWindow();

  var lineClickListener = function (event) {
    var contentToString = function (content) {
      if (!content) return "";

      if (typeof content === 'string') {
        return content
      } else if (typeof content.error === 'string') {
        return content.error;
      } else {
        return content.toString();
      }
    };

    var line = event.feature;
    var type;

    switch (line.getProperty('class')) {
      case "Objects::Line":
        type = "line";
        break;
      case "Objects::FiderLine":
        type = "fiderline";
        break;
      case "Objects::Fider04":
        type = "fider04";
        break;
    }

    lineInfo.setPosition(line.getProperty('latLng'));

    if (line.content) {
      lineInfo.setContent(contentToString(line.content));
      lineInfo.open(map);
    } else {
      api.loadObjectInfo(line.getId(), type).then(function (content) {
        lineInfo.setContent(contentToString(content));
        lineInfo.open(map);
      });
    }
  };

  var hoverWindow = new google.maps.InfoWindow(),
    infowindow = new google.maps.InfoWindow();

  var lineHoverListener = function (event) {
    var line = event.feature;

    hoverWindow.setPosition(event.latLng);
    hoverWindow.setContent(line.getProperty('name'));
    hoverWindow.open(map);
  };

  var lineHoverOverListener = function () {
    hoverWindow.close();
  };

  map.loadedMarkers = [];

  map.showObjects = function (objects) {
    var markers = [];
    _.forEach(objects, function (obj) {
      if (map.loadedMarkers.indexOf(obj.type+obj.id) > -1
        || !window.visibleTypes[obj.type]
        || map.zoom < objectTypes[obj.type].zoom) return;

      var latLng = new google.maps.LatLng(obj.lat, obj.lng);
      var icon = "/map/" + obj.type + '.png';
      var marker = new google.maps.Marker({position: latLng, icon: icon, title: obj.name});
      marker.id = obj.id;
      marker.type = obj.type;
      marker.name = obj.name;
      map.loadedMarkers.push(obj.type+obj.id);
      google.maps.event.addListener(marker, 'click', markerClickListener);
      if (!markerClusterers[obj.type]) {
        markerClusterers[obj.type] = new clusterer.MarkerClusterer(map);
        markerClusterers[obj.type].setMinimumClusterSize(objectTypes[obj.type].cluster);
      }
      markerClusterers[obj.type].addMarker(marker);

      marker.addListener('mouseover', function() {
        infowindow.setContent(obj.name);
        infowindow.open(map, this);
      });

      marker.addListener('mouseout', function() {
        infowindow.close();
      });

      markers.push(marker);
    });

    markerZoomer();

    map.objects = map.objects.concat(markers);
    return markers;
  };

  map.setLayerVisible = function (layer, visible) {
    var clust = markerClusterers[layer];
    if (visible) {
      if (clust && clust.msavedMarkers) {
        clust.addMarkers(clust.msavedMarkers);
        clust.msavedMarkers = null;
      }
    } else {
      if (clust && !clust.msavedMarkers) {
        clust.msavedMarkers = clust.getMarkers();
        clust.clearMarkers();
      }
    }
  };

  map.clearAll = function () {
    map.objects = [];
    map.loadedMarkers = [];
    for (i in markerClusterers) {
      markerClusterers[i].clearMarkers();
    }
  };

  map.clearLines = function () {
    map.linesLoaded = false;
    map.data.forEach(function (a) {
      var clazz = a.getProperty('class');
      if (clazz === 'Objects::Line') {
        map.data.remove(a);
      }
    });
  };

  map.clearFiders = function () {
    map.data.forEach(function (a) {
      var clazz = a.getProperty('class');
      if (clazz === 'Objects::FiderLine') {
        map.data.remove(a);
      }
    });
  };

  map.clear04Fiders = function () {
    map.data.forEach(function (a) {
      var clazz = a.getProperty('class');
      if (clazz === 'Objects::Fider04') {
        map.data.remove(a);
      }
    });
  };

  map.loadLines = function () {
    return new Promise(function (resolve) {
      var types = [];
      if (map.showLines && !map.linesLoaded) {
        types.push('line');
      }
      if (map.showFiders && map.zoom >= objectTypes.fider.zoom) {
        types.push('fider-line');
      }
      if (map.show04Fiders && map.zoom >= objectTypes.fider04.zoom) {
        types.push('fider04');
      }
      if (types.length) {
        map.data.loadGeoJson(api.getUrl('/api/lines/?' + $.param({
            type: types,
            bounds: window.map.getBounds().toUrlValue()
            //region: $("#visible-region").val()
          })), null, function () {
          map.linesLoaded = true;
          resolve();
        });
      } else {
        resolve();
      }
    });
  };

  google.maps.event.addListener(map, 'zoom_changed', markerZoomer);
  google.maps.event.addListener(map, 'click', function () {
    $('#search-output').hide();
  });

  map.data.setStyle(styleFunction);
  map.data.addListener('click', lineClickListener);
  map.data.addListener('mouseover', lineHoverListener);
  map.data.addListener('mouseout', lineHoverOverListener);

  markerZoomer();

  ///////////////////////////////////////////////////////////////////////////////

  return map;
};

module.exports = {
  start: loadAPI,
  create: createMap
};
