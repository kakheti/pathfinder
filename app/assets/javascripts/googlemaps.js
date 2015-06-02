var Promise = require('bluebird');
var _ = require('lodash');
var clusterer = require('./lib/markerclusterer');
var api = require('./api');
var objectTypes = require('./object-types');

var API_URL = 'https://maps.googleapis.com/maps/api/js';
var DEFAULT_ZOOM = 9;
var DEFAULT_LAT = 41.9;
var DEFAULT_LNG = 45.8;

var map;
var markerClusterers = {};
var infoWindow;

var styleFunction = function(f) {
  var clazz = f.getProperty('class');
  if (clazz === 'Objects::FiderLine') {
    return {
      strokeColor: '#FFA504',
      strokeWeight: 3,
      strokeOpacity: 0.5
    };
  } else if (clazz === 'Objects::Line') {
    return {
      strokeColor: '#FF0000',
      strokeWeight: 5,
      strokeOpacity: 0.5
    };
  }
};

var markerZoomer = function() {
  var zoom = map.getZoom();
  for(type in objectTypes) {
    var clust = markerClusterers[type];
    var min_zoom = objectTypes[type].zoom;
    if (min_zoom <= zoom) {
      if (clust && clust.savedMarkers) {
        clust.addMarkers(clust.savedMarkers);
        clust.savedMarkers = null;
      }
    } else {
      if (clust && !clust.savedMarkers) {
        clust.savedMarkers = clust.getMarkers();
        clust.clearMarkers();
      }
    }
  }
};

var loadAPI = function(opts) {
  return new Promise(function(resolve, reject) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    var baseUrl = API_URL + '?v=3.ex&sensor=false&callback=onGoogleMapLoaded&libraries=geometry';

    if ( opts && opts.apikey ) {
      script.src = baseUrl+'&key=' + opts.apikey;
    } else {
      script.src = baseUrl;
    }

    document.body.appendChild(script);
    window.onGoogleMapLoaded = resolve ;
  });
};

var createMap = function(opts) {
  var zoom = ( opts && opts.zoom ) || DEFAULT_ZOOM;
  var lat  = ( opts && opts.center && opts.center.lat ) || DEFAULT_LAT;
  var lng  = ( opts && opts.center && opts.center.lng ) || DEFAULT_LNG;
  var mapOptions = {
    zoom: zoom,
    center: new google.maps.LatLng(lat, lng),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };
  var mapElement=document.getElementById(( opts && opts.mapid ) || 'mapregion');

  map = new google.maps.Map( mapElement, mapOptions );
  infoWindow = new google.maps.InfoWindow({ content: '' });

  ///////////////////////////////////////////////////////////////////////////////

  map.objects = [];

  var markerClickListener = function() {
    var contentToString = function(content) {
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
      api.loadObjectInfo(marker.id, marker.type).then(function(content) {
        marker.content = content;
        infoWindow.setContent(contentToString(marker.content));
        infoWindow.open(map, marker);
      });
    }
  };

  map.loadedMarkers = {};

  map.showObjects = function(objects) {
    var markers = [];
    _.forEach(objects, function(obj){
      if(map.loadedMarkers[obj.id] == true) return;

      var latLng = new google.maps.LatLng(obj.lat, obj.lng);
      var icon = "/map/"+obj.type +'.png';
      var marker = new google.maps.Marker({ position: latLng, icon: icon, title: obj.name });
      marker.id = obj.id;
      marker.type = obj.type;
      marker.name = obj.name;
      map.loadedMarkers[obj.id] = true;
      google.maps.event.addListener(marker, 'click', markerClickListener);
      if ( !markerClusterers[obj.type] ) {
        markerClusterers[obj.type] = new clusterer.MarkerClusterer(map);
        markerClusterers[obj.type].setMinimumClusterSize(objectTypes[obj.type].cluster);
      }
      markerClusterers[obj.type].addMarker(marker);
      markers.push(marker);
    });
    
    markerZoomer();
    map.objects.concat(markers);
    return markers;
  };

  map.setLayerVisible = function(layer, visible) {
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
  }

  map.clearAll = function(){
    map.objects = [];
    map.loadedMarkers = {};
    for(i in markerClusterers) {
      markerClusterers[i].clearMarkers();
    };
  };

  map.clearLines = function(){
    map.data.forEach(function(a){
      var clazz = a.getProperty('class');
      if (clazz === 'Objects::Line') {
        map.data.remove(a);
      }
    });
  };

  map.clearFiders = function(){
    map.data.forEach(function(a){
      var clazz = a.getProperty('class');
      if (clazz === 'Objects::FiderLine') {
        map.data.remove(a);
      }
    });
  };

  map.loadLines = function() {
    map.data.loadGeoJson('/api/lines');
  };

  map.loadFiders = function() {
    var params = api.getParams();
    if(map.zoom >= objectTypes.fider.zoom)
      map.data.loadGeoJson('/api/lines/fiders?'+params);
  }

  google.maps.event.addListener(map, 'zoom_changed', markerZoomer);
  google.maps.event.addListener(map, 'click', function(){
    $('#search-output').hide();
  });

  map.data.setStyle(styleFunction);

  ///////////////////////////////////////////////////////////////////////////////  

  return map;
};

module.exports = {
  start  : loadAPI,
  create : createMap
};
