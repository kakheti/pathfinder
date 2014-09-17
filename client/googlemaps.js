var HOST = 'https://maps.googleapis.com/maps/api/js';

module.exports = function(opts) {

  var script = document.createElement('script');
  script.type = 'text/javascript';
  var baseUrl = HOST + '?v=3.ex&sensor=false&callback=onGoogleMapLoaded&libraries=geometry';

  if ( opts && opts.apikey ) {
    script.src = baseUrl+'&key=' + opts.apikey;
  } else {
    script.src = baseUrl;
  }

  document.body.appendChild(script);
  window.onGoogleMapLoaded = opts && opts.callback ;

};
