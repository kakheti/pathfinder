var Promise = require('bluebird');
var clusterer = require('lib/markerclusterer');
var api = require('./api');

var API_URL = 'https://maps.googleapis.com/maps/api/js';
var DEFAULT_ZOOM = 8;
var DEFAULT_LAT = 41.9;
var DEFAULT_LNG = 44.8;

var markerClusterers = {};
var infoWindow;

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

  var map = new google.maps.Map( mapElement, mapOptions );
  infoWindow = new google.maps.InfoWindow({ content: '' });

  ///////////////////////////////////////////////////////////////////////////////

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

  map.showPointlike = function(objects, type, icon) {
    var markers = [];
    for (var i = 0, l = objects.length; i < l; ++i) {
      var obj = objects[i];
      var latLng = new google.maps.LatLng(obj.lat, obj.lng);
      var marker = new google.maps.Marker({ position: latLng, icon: icon, title: obj.name });
      marker.id = obj.id;
      marker.type = type;
      google.maps.event.addListener(marker, 'click', markerClickListener);
      markers.push(marker);
    }
    if ( !markerClusterers[type] ) {
      markerClusterers[type] = new clusterer.MarkerClusterer(map, {});
      markerClusterers[type].setMinimumClusterSize(30);
    }
    markerClusterers[type].addMarkers(markers);
  };

  map.showTowers = function(towers) { map.showPointlike(towers, 'towers', '/map/tower.png'); };
  map.showSubstations = function(substations) { map.showPointlike(substations, 'substations', '/map/substation.png'); };
  map.showTps = function(tps) { map.showPointlike(tps, 'tps', '/map/tp.png') };
  map.showPoles = function(poles) { map.showPointlike(poles, 'poles', '/map/pole.png') };
  map.loadLines = function() {
    console.log('loading loadGeoJson');
    map.data.loadGeoJson('/api/lines');
  };

  map.data.setStyle(styleFunction);

  ///////////////////////////////////////////////////////////////////////////////  

  return map;
};

var styleFunction = function(f) {
  var clazz = f.getProperty('class');
  console.log(clazz);
  if (clazz === 'Objects::Fider') {
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

module.exports = {
  start  : loadAPI,
  create : createMap,
};
