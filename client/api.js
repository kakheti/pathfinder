var Promise = require('bluebird');
var $ = require('jquery');

var API = {};

var logger = function(message) { if (API.logger) { API.logger(message); } };

var loadObjects = function(type, message) {
  logger(message);
  return new Promise(function(resolve, reject) {
    $.get('/api/' + type).done(function(data) { logger(); resolve(data); }).fail(function(err) { logger(); reject(err); });
  });
};

API.loadTowers = function() { return loadObjects('towers', 'ანძების ჩამოტვირთვა...'); };
API.loadSubstations = function() { return loadObjects('substations', 'ქვესადგურების ჩამოტვირთვა...'); };
API.loadTps = function() { return loadObjects('tps', 'ჯიხურების ჩამოტვირთვა...'); };
API.loadPoles = function() { return loadObjects('poles', 'ბოძების ჩამოტვირთვა...'); };

API.loadObjectInfo = function(id, type) {
  logger('იტვირთება...');
  return new Promise(function(resolve, reject) {
    $.get('/api/' + type + '/' + id).done(function(data){ logger(); resolve(data); }).fail(function(err){ logger(); reject(err); });
  });
};

module.exports = API;
