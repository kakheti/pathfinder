var _ = require('lodash');
var googlemaps = require('./googlemaps');
var objectTypes = require('./object-types');

var data = {};

var view = {
  showSearch: function() {
    $('#search-query').focus();
  },

  resizeOutput: function() {
    $("#search-output .collection").css("max-height", $(window).innerHeight() - 125)
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

    field.on('click', function(){
      if($("#search-output .collection .collection-item").length > 0) {
        $("#search-output").show();
      }
    });

    $(window).on('resize', view.resizeOutput);
    view.resizeOutput();
  },

  renderMarker: function(marker) {
    var realMarker;
    var markers = data.map.objects;

    realMarker = _.find(markers, _.matchesProperty('id', marker.id));

    if(!realMarker) {
      markers = data.map.showObjects([marker]);
      realMarker = markers[0];
    }

    var moreinfo=""

    for(i in objectTypes){
      if(marker[i]) moreinfo += _.template(' <%=type%>: <%=name%>')({
        type: objectTypes[i].name,
        name: marker[i].name
      });
    }

    var m = _.template('<a class="search-marker collection-item">'
      +'<span class="type"><%=type%></span> '
      +'<span class="name"><%=name%></span> '
      +'<span class="moreinfo"><%=moreinfo%></span>'
      +'</a>');
    var el = $(m({
      name: marker.name,
      type: (objectTypes[marker.type].name || marker.type),
      moreinfo: moreinfo
    }));
    el.click(function() {
      data.map.setZoom(15);
      setTimeout(function() {
        google.maps.event.trigger(realMarker, 'click');
      }, 500);
      data.map.setCenter(new google.maps.LatLng(marker.lat, marker.lng));
    });
    return el;
  },

  displayMarkers: function(q, markers) {
    var renderCollection = function(array, output) {
      _.forEach(array, function(item){
        var element = view.renderMarker(item);
        output.append(element);
      });
    };
    
    $('#search-output').show();
    var summary = _.template('ნაპოვნია: <strong><%=length%></strong> ობიექტი');
    $("#search-output .summary").html(summary({length: markers.length}));
    var output = $('#search-output .collection');
    output.html('');
    renderCollection(markers, output);
  },
};

module.exports = {
  initialize: function(map) {
    data.map = map;
    view.showSearch();
    view.initSearch();
  }
};
