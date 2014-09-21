var Promise = require('bluebird');
var clusterer = require('lib/markerclusterer');
var api = require('./api');

var API_URL = 'https://maps.googleapis.com/maps/api/js';
var DEFAULT_ZOOM = 8;
var DEFAULT_LAT = 41.9;
var DEFAULT_LNG = 44.8;

var markerClusterer;
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
  markerClusterer = new clusterer.MarkerClusterer(map);
  infoWindow = new google.maps.InfoWindow({ content: '' });

  // new methods for map

  map.clearObjects = markerClusterer.clearMarkers;

  var markerClickListener = function() {
    var marker = this;
    if (marker.content) {
      infoWindow.setContent(marker.content);
      infoWindow.open(map, marker);
    } else {
      api.getInfo(marker.type, marker.id).then(function(content) {
        marker.content = content;
        infoWindow.setContent(marker.content);
        infoWindow.open(map, marker);
      });
    }
  };

  map.showTowers = function(towers) {
    var markers = [];
    for (var i = 0, l = towers.length; i < l; ++i) {
      var latLng = new google.maps.LatLng(towers[i].lat, towers[i].lng);
      var marker = new google.maps.Marker({ position: latLng, icon: '/map/tower.png' });
      marker.id = towers[i].id; marker.type = 'tower';

      google.maps.event.addListener(marker, 'click', markerClickListener);

      markers.push(marker);
    }
    markerClusterer.addMarkers(markers);
    window.clusterer = markerClusterer;
  };

  return map;
};

module.exports = {
  start  : loadAPI,
  create : createMap,
};
