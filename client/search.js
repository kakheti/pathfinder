var $ = require('jquery');

var typeNames = {
  towers: 'ანძა #',
  substations: 'ქ/ს ',
  tps: 'ჯიხური #',
  poles: 'ბოძი #'
};

var data = {
  filterMarkers: function(q) {
    var filterFunction = function(marker) {
      if (q) {
        return marker.name.indexOf(q) !== -1;
      } else {
        return true;
      }
    };
    var tps = this.map.tp_markers.filter(filterFunction);
    var towers = this.map.tower_markers.filter(filterFunction);
    var substations = this.map.substation_markers.filter(filterFunction);
    var poles = this.map.pole_markers.filter(filterFunction);
    return {
      towers: towers,
      substations: substations,
      tps: tps,
      poles: poles,
      size: tps.length + towers.length + substations.length + poles.length
    };
  }
};

var view = {
  showSearch: function() {
    $('#search').show();
    $('#search-output').hide();
    $('#search-query').focus();
  },

  initSearch: function() {
    var field = $($('#search-query')[0]);
    field.keyup(function() {
      var q = field.val();
      var markers = data.filterMarkers(q);
      view.displayMarkers(q, markers);
    });
  },

  renderMarker: function(marker) {
    var m = $('<div class="search-marker"></div>');
    m.html('<span class="text-muted">' + (typeNames[marker.type] || marker.type) + '</span>' + marker.name);
    m.click(function() {
      data.map.setZoom(15);
      google.maps.event.trigger(marker, 'click');
      data.map.setCenter(marker.getPosition());
      
      console.log(marker.name);
    });
    return m;
  },

  displayMarkers: function(q, markers) {
    var renderCollection = function(type, output) {
      var array = markers[type];
      for (var i = 0; i < array.length && i < 5; i++) {
        var element = view.renderMarker(array[i]);
        output.append(element);
      }
    };
    if (q && markers.size > 0) {
      var summary = $('<div class="search-summary">ნაპოვნია: <span class="text-muted"><strong>' + markers.size + '</strong> ობიექტი</span></div>');
      var output = $('#search-output');
      output.html('');
      output.show();
      output.append(summary);
      renderCollection('substations', output);
      renderCollection('towers', output);
      renderCollection('tps', output);
      renderCollection('poles', output);
    } else {
      $('#search-output').html('');
      $('#search-output').hide();
    }
  },
};

module.exports = {
  initialize: function(map) {
    data.map = map;
    view.showSearch();
    view.initSearch();
  }
};
