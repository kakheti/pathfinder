var $ = require('jquery');
var googlemaps = require('./googlemaps');

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
    $('#search-query').focus();
  },

  initSearch: function() {
    var field = $('#search-query');
    var typeField = $('#search-type');
    var regionField = $("#search-region");
    var form = $("#search-form");

    form.submit(function(event) {
      event.preventDefault();

      var q = field.val();
      var type = typeField.val();

      var filters = { name: q, type: type };

      if(regionField.val() != "") {
        filters.region = regionField.val();
      }

      $.get("/api/search", filters).done(function(data){
        console.log(data);
        view.displayMarkers(q, data);
      });
    });
  },

  renderMarker: function(marker) {
    var m = $('<div class="search-marker"></div>');
    m.html('<span class="text-muted">' + (typeNames[marker.type] || marker.type) + '</span>' + marker.name);
    m.click(function() {
      data.map.setZoom(15);
      setTimeout(function() {
        google.maps.event.trigger(marker, 'click');
      }, 500);
      data.map.setCenter(new googlemaps.LatLng(marker.lat, marker.lng));
    });
    return m;
  },

  displayMarkers: function(q, markers) {
    var renderCollection = function(array, output) {
      for (var i = 0; i < array.length && i < 5; i++) {
        var element = view.renderMarker(array[i]);
        output.append(element);
      }
    };
    if (markers.length > 0) {
      var summary = $('<div class="search-summary">ნაპოვნია: <span class="text-muted"><strong>' + markers.length + '</strong> ობიექტი</span></div>');
      var output = $('#search-output');
      output.html('');
      output.append(summary);
      renderCollection(markers, output);
    } else {
      $('#search-output').html('');
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
