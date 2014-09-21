var Promise = require('bluebird');
var $ = require('jquery');

var API = {};

var logger = function(message) { if (API.logger) { API.logger(message); } };

API.loadTowers = function() {
  logger('ანძების ჩატვირთვა...');
  return new Promise(function(resolve, reject) {
    $.get('/api/towers').done(function(data) {
      logger(); resolve(data);
    }).fail(function(err) {
      logger(); reject(err);
    });
  });
};

API.getTowerInfo = function(id) {
  logger('ინფორმაციის მიღება...');
  return new Promise(function(resolve, reject) {
    $.get('/api/towers/' + id).done(function(data) {
      logger(); resolve(data);
    }).fail(function(err) {
      logger(); reject(err);
    });
  });
};

API.getInfo = function(type, id) {
  if ('tower' === type) {
    return API.getTowerInfo(id);
  }
};

module.exports = API;
