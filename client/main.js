var googlemaps = require('./googlemaps');
var api = require('./api');

googlemaps.start().then(googlemaps.create).then(function(map) {
  console.log('google map initialized');
  api.loadTowers().then(map.showTowers).catch(function(err) {
    console.log(err);
  });
});
