var Promise = require('bluebird');

var API_URL = 'https://maps.googleapis.com/maps/api/js';

module.exports = function(opts) {
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
