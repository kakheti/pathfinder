var _ = require('lodash'),
Promise = require('bluebird')
config = require('config');

var API = {};

var logger = function(message) { if (API.logger) { API.logger(message); } };

API.getUrl = function(url) {
  return config.url + url;
};

API.getParams = function() {
  var bounds = window.map.getBounds().toUrlValue();
  var region = $("#search-region").val();
  var tp = _.template('bounds=<%=bounds%>&region_id=<%=region%>');
  var params = tp({ bounds: bounds, region: region });
  return params;
};

API.loadObjects = function(type, message) {
  if(message) logger(message);
  var bounds = window.map.getBounds().toUrlValue();
  var region = $("#search-region").val();
  return new Promise(function(resolve, reject) {
    $.get(API.getUrl('/api/search'), {bounds: bounds, region_id: region, type: [type]}).done(function(data) { logger(); resolve(data); }).fail(function(err) { logger(); reject(err); });
  });
};

API.loadObjectInfo = function(id, type) {
  logger('იტვირთება...');
  return new Promise(function(resolve, reject) {
    var tp = _.template('/api/<%=type%>s/<%=id%>');
    $.get(API.getUrl(tp({ type: type, id:id }))).done(function(data){ logger(); resolve(data); }).fail(function(err){ logger(); reject(err); });
  });
};

module.exports = API;
