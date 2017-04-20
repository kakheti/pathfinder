/* global require, google */

/**
 * Imports
 */

var _ = require('lodash'),
    objectTypes = require('./object-types'),
    api = require('./api');

/**
 * Local variables
 */

var data = {},
    $search = $('.search'),
    $output = $("#search-output"),
    $searchBtn = $("#search-form").find(".btn"),
    searchResultTp = _.template('<a class="search-marker collection-item">'
        + '<span class="type"><%=type%></span> '
        + '<span class="name"><%=name%></span> '
        + '<span class="moreinfo"><%=moreInfo%> მუნიციპალიტეტი: <%=region%></span>'
        + '</a>'),
    summaryTp = _.template('ნაპოვნია: <strong><%=length%></strong> ობიექტი');

var search = {
    resizeOutput: function () {
        $(".search .scrollable").css("max-height", $(window).innerHeight() - 50)
    },

    initSearch: function () {
        var $field = $('#search-query'),
            $typeField = $('#search-types'),
            $typeCheckboxes = $typeField.find("input[type=checkbox]"),
            $regionField = $("#search-region"),
            $form = $("#search-form"),
            $searchTypeAll = $("#search-type-all");

        $searchTypeAll.on('click', function () {
            $(this).prop('checked', !this.checked);
            if (this.checked) {
                $typeCheckboxes.removeProp('checked');
            } else {
                $typeCheckboxes.prop('checked', true);
            }
        });

        $typeCheckboxes.on('click', function () {
            if (this.value === "*")
                return;
            if (!this.checked) {
                $searchTypeAll.prop('checked', false);
            } else {
                var allChecked = true;
                $typeCheckboxes.each(function () {
                    if (!this.checked && this.value !== "*")
                        allChecked = false;
                });
                $searchTypeAll.prop('checked', allChecked);
            }
        });

        $form.submit(function (event) {
            var query = $field.val(),
                type = [];

            event.preventDefault();

            if (query.length < 2) return;

            $typeField.find("input[type=checkbox]:checked").each(function () {
                if (this.value !== "*")
                    type.push($(this).val());
            });

            var filters = {name: query, type: type};

            if ($regionField.val() !== "") {
                filters.region = $regionField.val();
            }

            $searchBtn.prop("disabled", "disabled").addClass("loading");

            $.get(api.getUrl("/api/search/by_name"), filters).done(function (data) {
                $searchBtn.prop("disabled", false).removeClass("loading");
                search.displayMarkers(query, data);
            }).error(function () {
                $searchBtn.removeProp("disabled", false).removeClass("loading");
            });
        });

        $field.on('click', function () {
            $search.addClass('open');
            if ($output.find(".collection .collection-item").length > 0) {
                $output.show();
            }
        });

        $field.on('focus', function () {
            $search.addClass('open');
        });

        $('body').on('click', function () {
            $search.removeClass('open');
        });

        $search.find("* > *").on('click', function (event) {
            event.stopPropagation();
        });

        $(window).on('resize', search.resizeOutput);
        search.resizeOutput();
    },

    renderMarker: function (marker) {
        var markers = data.map.objects,
            realMarker = _.find(markers, _.matchesProperty('id', marker.id));

        if (!realMarker) {
            markers = data.map.showObjects([marker]);
            realMarker = markers[0];
        }

        var el = $(searchResultTp({
            name: marker.name,
            region: marker.region.name,
            type: (objectTypes[marker.type].name || marker.type),
            moreInfo: marker.info
        }));

        el.click(function () {
            var zoom = objectTypes[marker.type].zoom;

            if (data.map.zoom < zoom) data.map.setZoom(zoom);
            if (marker.lat && marker.lng) data.map.setCenter({lat: marker.lat, lng: marker.lng});

            if (search.oldSearchMarker)
                search.oldSearchMarker.setMap(null);

            search.oldSearchMarker = new google.maps.Marker({
                position: {lat: marker.lat, lng: marker.lng},
                map: map
            });

            $search.removeClass('open');
            $output.hide();

            if (realMarker)
                realMarker.setVisible(true);
            map.showInfo(marker);
        });
        return el;
    },

    displayMarkers: function (q, markers) {
        var renderCollection = function (array, output) {
            array.forEach(function (item) {
                var element = search.renderMarker(item);
                output.append(element);
            });
        };

        $output.show();
        $output.find(".summary").html(summaryTp({length: markers.length}));
        var output = $output.find('.collection');
        output.html('');
        renderCollection(markers, output);
    }
};

module.exports = {
    initialize: function (map) {
        data.map = map;
        search.initSearch();
        search.resizeOutput();
    }
};
