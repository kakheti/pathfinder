var googlemaps = require('./googlemaps');


googlemaps.start().then(googlemaps.create).then(function(map) {
  console.log('google map initialized');
});


