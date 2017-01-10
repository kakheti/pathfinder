/**
 * Imports
 */

var _ = require('lodash'),
  Promise = require('bluebird'),
  config = require('config');

/**
 * Local functions
 */

var logger = function (message) {
  if (API.logger) {
    API.logger(message);
  }
};

/**
 * Local variables
 */
var $searchRegion = $("#search-region"),
  //paramsTp = _.template('bounds=<%=bounds%>&region_id=<%=region%>'),
  paramsTp = _.template('bounds=<%=bounds%>'),
  objectInfoTp = _.template('/api/<%=type%>s/<%=id%>');

var API = {
  getUrl: function (url) {
    return config.url + url;
  },
  getParams: function () {
    var bounds = window.map.getBounds().toUrlValue(),
      region = $searchRegion.val();

    return paramsTp({bounds: bounds /*, region: region*/});
  },
  loadObjects: function (types, message) {
    if (types.length < 1)
      return Promise.resolve([]);

    if (message) logger(message);

    var bounds = window.map.getBounds().toUrlValue(),
      region = $searchRegion.val();

    return new Promise(function (resolve, reject) {
      $.get(API.getUrl('/api/search'), {bounds: bounds, /*region_id: region,*/ type: types})
        .done(function (data) {
          if (message) logger();
          resolve(data);
        })
        .fail(function (err) {
          if (message) logger();
          reject(err);
        });
    });
  },
  loadObjectInfo: function (id, type) {
    logger('იტვირთება...');
    return new Promise(function (resolve, reject) {
      $.get(API.getUrl(objectInfoTp({type: type, id: id}))).done(function (data) {
        resolve(data);
      }).fail(function (err) {
        reject(err);
      });
    });
  },
  loadRegions: function () {
    return new Promise(function (resolve, reject) {
      $.get(API.getUrl("/api/regions")).done(function (data) {
        resolve(data);
      }).fail(function (err) {
        reject(err);
      });
    });
  }
};

module.exports = API;
