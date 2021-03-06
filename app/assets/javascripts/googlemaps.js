/* global require, google */

var Promise = require('bluebird'),
    clusterer = require('./lib/markerclusterer'),
    api = require('./api'),
    objectTypes = require('./object-types');

var DEFAULT_ZOOM = 9,
    DEFAULT_LAT = 41.9,
    DEFAULT_LNG = 45.8,
    markerClusterers = {},
    map;

var contentToString = function (content) {
    if (typeof content === 'string') {
        return content
    } else if (typeof content.error === 'string') {
        return content.error;
    } else {
        return content.toString();
    }
};

var styleFunction = function (f) {
    var clazz = f.getProperty('class');
    switch (clazz) {
        case 'Objects::FiderLine':
            return map.showFiders ? {
                    strokeColor: '#FFA504',
                    strokeWeight: 4,
                    strokeOpacity: 0.5
                } : {visible: false};
        case 'Objects::Fider04':
            return map.show04Fiders ? {
                    strokeColor: '#2196F3',
                    strokeWeight: 4,
                    strokeOpacity: 0.5
                } : {visible: false};
        case 'Objects::Line':
            return map.showLines ? {
                    strokeColor: '#FF0000',
                    strokeWeight: 5,
                    strokeOpacity: 0.5
                } : {visible: false};
    }
};

var markerZoomer = function () {
    var zoom = map.getZoom();

    for (var type in objectTypes) {
        var clusterer = markerClusterers[type],
            minZoom = objectTypes[type].zoom;

        if (minZoom <= zoom) {
            $("#visible-type-" + type).prop('disabled', false);

            if (clusterer && clusterer.savedMarkers) {
                clusterer.addMarkers(clusterer.savedMarkers);
                clusterer.savedMarkers = null;
            }
        } else {
            $("#visible-type-" + type).prop('disabled', true);

            if (type == 'fider') {
                map.clearFiders();
            }
            if (type == 'fider04') {
                map.clear04Fiders();
            }

            if (clusterer && !clusterer.savedMarkers) {
                clusterer.savedMarkers = clusterer.getMarkers();
                clusterer.clearMarkers();
            }
        }
    }
};

var createMap = function (opts) {
    var zoom = ( opts && opts.zoom ) || DEFAULT_ZOOM,
        lat = ( opts && opts.center && opts.center.lat ) || DEFAULT_LAT,
        lng = ( opts && opts.center && opts.center.lng ) || DEFAULT_LNG,
        mapOptions = {
            zoom: zoom,
            center: new google.maps.LatLng(lat, lng),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        mapElement = document.getElementById(( opts && opts.mapid ) || 'mapregion'),
        hoverWindow = new google.maps.InfoWindow({
            pixelOffset: { width: 0, height: -3 }
        }),
        $info = $('#info'),
        $closeInfo = $('.info .close-info'),
        $sidebar = $('.sidebar');

    map = new google.maps.Map(mapElement, mapOptions);
    map.objects = [];

    var openInfo = function (content) {
        $info.html(content);
        $closeInfo.show();
        $sidebar.removeClass('closed');
    };
    var closeInfo = function () {
        $info.html('');
        $closeInfo.hide();
        $sidebar.addClass('closed');
    };

    $closeInfo.on('click', closeInfo);

    map.showInfo = function(marker) {
        if (marker.content) {
            openInfo(contentToString(marker.content));
        } else {
            api.loadObjectInfo(marker.id, marker.type).then(function (content) {
                marker.content = content;
                openInfo(contentToString(marker.content));
            });
        }
    };

    var markerClickListener = function () {
        var marker = this;

        map.showInfo(marker);
    };

    var lineClickListener = function (event) {
        var type,
            line = event.feature;

        switch (line.getProperty('class')) {
            case "Objects::Line":
                type = "line";
                break;
            case "Objects::FiderLine":
                type = "fiderline";
                break;
            case "Objects::Fider04":
                type = "fider04";
                break;
        }

        if (line.content) {
            openInfo(contentToString(line.content));
        } else {
            api.loadObjectInfo(line.getId(), type).then(function (content) {
                line.content = content;
                openInfo(contentToString(content));
            });
        }
    };

    var lineHoverListener = function (event) {
        hoverWindow.setPosition(event.latLng);
        hoverWindow.setContent(event.feature.getProperty('name'));
        hoverWindow.open(map);
    };

    var lineHoverOverListener = function () {
        hoverWindow.close();
    };

    map.loadedMarkers = [];

    map.showObjects = function (objects) {
        var markers = [];

        objects.forEach(function (obj) {
            if (map.loadedMarkers.indexOf(obj.type + obj.id) > -1
                || !window.visibleTypes[obj.type]
                || map.zoom < objectTypes[obj.type].zoom) return;

            var latLng = new google.maps.LatLng(obj.lat, obj.lng);
            var icon = "/map/" + obj.type + '.png';
            var marker = new google.maps.Marker({position: latLng, icon: icon, title: obj.name});
            marker.id = obj.id;
            marker.type = obj.type;
            marker.name = obj.name;
            map.loadedMarkers.push(obj.type + obj.id);
            google.maps.event.addListener(marker, 'click', markerClickListener);
            if (!markerClusterers[obj.type]) {
                markerClusterers[obj.type] = new clusterer.MarkerClusterer(map);
                markerClusterers[obj.type].setMinimumClusterSize(objectTypes[obj.type].cluster);
            }
            markerClusterers[obj.type].addMarker(marker);

            marker.addListener('mouseover', function () {
                hoverWindow.setContent(obj.name);
                hoverWindow.open(map, this);
            });

            marker.addListener('mouseout', function () {
                hoverWindow.close();
            });

            markers.push(marker);
        });

        markerZoomer();

        map.objects = map.objects.concat(markers);
        return markers;
    };

    map.setLayerVisible = function (layer, visible) {
        var clusterer = markerClusterers[layer];
        if (visible) {
            if (clusterer && clusterer.msavedMarkers) {
                clusterer.addMarkers(clusterer.msavedMarkers);
                clusterer.msavedMarkers = null;
            }
        } else {
            if (clusterer && !clusterer.msavedMarkers) {
                clusterer.msavedMarkers = clusterer.getMarkers();
                clusterer.clearMarkers();
            }
        }
    };

    map.clearAll = function () {
        map.objects = [];
        map.loadedMarkers = [];
        for (var i in markerClusterers) {
            markerClusterers[i].clearMarkers();
        }
    };

    map.clearLines = function () {
        map.linesLoaded = false;
        map.data.forEach(function (a) {
            var clazz = a.getProperty('class');
            if (clazz === 'Objects::Line') {
                map.data.remove(a);
            }
        });
    };

    map.clearFiders = function () {
        map.data.forEach(function (a) {
            if (a.getProperty('class') === 'Objects::FiderLine') {
                map.data.remove(a);
            }
        });
    };

    map.clear04Fiders = function () {
        map.data.forEach(function (a) {
            if (a.getProperty('class') === 'Objects::Fider04') {
                map.data.remove(a);
            }
        });
    };

    map.loadLines = function () {
        return new Promise(function (resolve) {
            var types = [];
            if (map.showLines && !map.linesLoaded) {
                types.push('line');
            }
            if (map.showFiders && map.zoom >= objectTypes.fider.zoom) {
                types.push('fider-line');
            }
            if (map.show04Fiders && map.zoom >= objectTypes.fider04.zoom) {
                types.push('fider04');
            }
            if (types.length) {
                $.get(api.getUrl('/api/lines'), {
                    type: types,
                    bounds: window.map.getBounds().toUrlValue()
                    //region: $("#visible-region").val()
                }).done(function (geojson) {
                    if (map.showLines)
                        map.linesLoaded = true;
                    map.data.addGeoJson(geojson);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    };

    map.updateStyle = function () {
        map.data.setStyle(styleFunction);
    };

    map.updateStyle();

    google.maps.event.addListener(map, 'zoom_changed', markerZoomer);
    google.maps.event.addListener(map, 'click', function () {
        $('#search-output').hide();
    });

    map.data.addListener('click', lineClickListener);
    map.data.addListener('mouseover', lineHoverListener);
    map.data.addListener('mouseout', lineHoverOverListener);

    markerZoomer();

    return map;
};

module.exports = {
    create: createMap
};
