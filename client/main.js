var googlemaps = require('./googlemaps');
var api = require('./api');

googlemaps.start().then(googlemaps.create).then(function(map) {
  console.log('google map initialized');
  api.loadTowers().then(function(data) {
    console.log(data);
  }).catch(function(err) {
    console.log(err.status, err.statusText);
  });
});


