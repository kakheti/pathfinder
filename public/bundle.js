require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var HOST = 'https://maps.googleapis.com/maps/api/js';

module.exports = function(callback) {

  var script = document.createElement('script');
  script.type = 'text/javascript';
  var baseUrl = HOST + '?v=3.ex&sensor=false&callback=onGoogleMapLoaded&libraries=geometry';

  if ( apikey ) {
    script.src = baseUrl+'&key='+apikey;
  } else {
    script.src = baseUrl;
  }

  document.body.appendChild(script);
  window.onGoogleMapLoaded = callback;

};

},{}],"kedmaps":[function(require,module,exports){
var googlemaps = require('./googlemaps');


googlemaps(function () {
  console.log('google maps loaded');
});



},{"./googlemaps":1}]},{},["kedmaps"]);
