var Promise = require('bluebird');
var $ = require('jquery');

var API = {};

var logger = function(message) { if (API.logger) { API.logger(message); } };

API.getParams = function() {
  var bounds = window.map.getBounds().toUrlValue();
  var region = $("#search-region").val();
  var params = "bounds="+bounds+"&region_id="+region;
  return params;
}

API.loadObjects = function(type, message) {
  if(message) logger(message);
  var bounds = window.map.getBounds().toUrlValue();
  var region = $("#search-region").val();
  return new Promise(function(resolve, reject) {
    $.get('/api/search', {bounds: bounds, region_id: region, type: [type]}).done(function(data) { logger(); resolve(data); }).fail(function(err) { logger(); reject(err); });
  });
};

API.loadObjectInfo = function(id, type) {
  logger('იტვირთება...');
  return new Promise(function(resolve, reject) {
    $.get('/api/' + type + 's/' + id).done(function(data){ logger(); resolve(data); }).fail(function(err){ logger(); reject(err); });
  });
};

module.exports = API;
