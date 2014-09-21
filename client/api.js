var Promise = require('bluebird');
var $ = require('jquery');

var API = {};

var logger = function(message) { if (API.logger) { API.logger(message); } };

API.loadTowers = function(opts) {
  logger('ანძების ჩატვირთვა...');
  return new Promise(function(resolve, reject) {
    $.get('/api/towers').done(function(data) {
      logger(); resolve(data);
    }).fail(function(err) {
      logger(); reject(err);
    });
  });
};

module.exports = API;
