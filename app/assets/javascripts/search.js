var $ = require('jquery');
var googlemaps = require('./googlemaps');
var objectTypes = require('./object-types');

var data = {};

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
      var type = [];

      typeField.find("input[type=checkbox]:checked").each(function(){
        type.push($(this).val());
      });

      var filters = { name: q, type: type };

      if(regionField.val() != "") {
        filters.region_id = regionField.val();
      }

      $("#search-form .btn").prop("disabled", "disabled").addClass("loading");

      $.get("/api/search", filters).done(function(data){
        $("#search-form .btn").prop("disabled", false).removeClass("loading");
        view.displayMarkers(q, data);
      }).error(function(){

        $("#search-form .btn").removeProp("disabled", false).removeClass("loading");
      });
    });
  },

  renderMarker: function(marker) {
    var realMarker;
    var markers = data.map[marker.type + '_markers'];
    for(m in markers) {
      if(markers[m].id == marker.id) {
        realMarker = markers[m];
      }
    }

    if(!realMarker) {
      markers = data.map.showObjects([marker]);
      realMarker = markers[0];
    }

    var m = $('<a class="search-marker collection-item"></a>');
    m.html(marker.name+ '<span class="badge">' + (objectTypes[marker.type].name || marker.type) + '</span>');
    m.click(function() {
      data.map.setZoom(15);
      setTimeout(function() {
        google.maps.event.trigger(realMarker, 'click');
      }, 500);
      data.map.setCenter(new google.maps.LatLng(marker.lat, marker.lng));
    });
    return m;
  },

  displayMarkers: function(q, markers) {
    var renderCollection = function(array, output) {
      for (var i = 0; i < array.length; i++) {
        var element = view.renderMarker(array[i]);
        output.append(element);
      }
    };
    if (markers.length > 0) {
      $('#search-output').show();
      var summary = 'ნაპოვნია: <span class="text-muted"><strong>' + markers.length + '</strong> ობიექტი</span>';
      $("#search-output .summary").html(summary);
      var output = $('#search-output .collection');
      output.html('');
      renderCollection(markers, output);
    } else {
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
