var Promise = require('bluebird');
var $ = require('jquery');

var loadTowers = function() {
  return new Promise(function(resolve, reject) {
    $.get('/api/towers').done(function(data) {
      resolve(data);
    }).fail(function(err) {
      reject(err);
    });
  });
};

module.exports = {
  loadTowers: loadTowers,
};
