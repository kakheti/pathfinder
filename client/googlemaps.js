var Promise = require('bluebird');
var clusterer = require('lib/markerclusterer');

var API_URL = 'https://maps.googleapis.com/maps/api/js';
var DEFAULT_ZOOM = 8;
var DEFAULT_LAT = 41.9;
var DEFAULT_LNG = 44.8;

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

  map.showTowers = function(towers) {
    var markers = [];
    for (var i = 0, l = towers.length; i < l; ++i) {
      var latLng = new google.maps.LatLng(towers[i].lat, towers[i].lng);
      var marker = new google.maps.Marker({
        position: latLng,
        draggable: false,
        //icon: markerImage
      });
      markers.push(marker);
    }
    var markerClusterer = new clusterer.MarkerClusterer(map, markers);
  };

  return map;
};

module.exports = {
  start  : loadAPI,
  create : createMap,
};
