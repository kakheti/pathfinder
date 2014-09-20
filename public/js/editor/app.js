var ui=require('./ui')
  , api=require('./api')
  , router=require('./router')
  , pages=require('./pages')
  , geo=require('./pages/geo')
  ;

var editMode;

var mapElement, sidebarElement, filterbarElement
  , defaultCenterLat, defaultCenterLng, defaultZoom
  , apikey, map, currentZoomLevel
  , app
  ;

var MIN_TOWER_ZOOM = 11;

/**
 * Entry point for the application.
 */
exports.start=function(opts){
  sidebarElement=document.getElementById((opts&&opts.sidebarid)||'sidebar');
  filterbarElement=document.getElementById((opts&&opts.toolbarid)||'filterbar');
  mapElement=document.getElementById((opts&&opts.mapid)||'map');
  defaultCenterLat=(opts&&opts.centerLat)||42.3;
  defaultCenterLng=(opts&&opts.centerLat)||43.8;
  defaultZoom=(opts&&opts.startZoom)||7;
  editMode = opts && opts.editMode;
  window.onload=loadingGoogleMapsAsyncronously;
};

var loadingGoogleMapsAsyncronously=function(){
  var host='https://maps.googleapis.com/maps/api/js';
  var script = document.createElement('script');
  script.type = 'text/javascript';
  var baseUrl=host+'?v=3.ex&sensor=false&callback=onGoogleMapLoaded&libraries=geometry';
  if (apikey){ script.src = baseUrl+'&key='+apikey; }
  else{ script.src = baseUrl; }
  document.body.appendChild(script);
  window.onGoogleMapLoaded=onGoogleMapLoaded;
};

var onGoogleMapLoaded=function(){
  initMap();
  initFilterbar();
  initRouter();
};

var styleFunction=function(f) {
  var name=f.getProperty('name')
    , isSelected=f.selected
    , isHovered=f.hovered
    , visible=true
    ;

  if(regionCombo.getValue()){
    var selectedRegion=regionCombo.getText();
    if(f.getProperty('region') != selectedRegion){
      visible=false;
    }
  }

  if (geo.isLine(f)){
    var strokeColor, strokeWeight;
    if(isSelected){ strokeColor='#AA0000'; strokeWeight=10; }
    else if(isHovered){ strokeColor='#FF5555'; strokeWeight=10; }
    else{ strokeColor='#FF0000'; strokeWeight=1; }
    return {
      strokeColor: strokeColor,
      strokeWeight: strokeWeight,
      strokeOpacity: 0.5,
      //title: name,
      visible: visible&&chkLine.isChecked(),
    };
  } else if (geo.isPath(f)) {
    var strokeColor, strokeWeight;
    if(isSelected){ strokeColor='#AA00AA'; strokeWeight=10; }
    else if(isHovered){ strokeColor='#FF55FF'; strokeWeight=10; }
    else{ strokeColor='#FF00FF'; strokeWeight=2; }
    return {
      strokeColor: strokeColor,
      strokeWeight: strokeWeight,
      strokeOpacity: 0.5,
      //title: name,
      visible: visible&&chkPath.isChecked(),
    };
  } else if (geo.isTower(f)){
    var icon;
    if(isSelected){ icon='/map/tower-selected.png'; }
    else if(isHovered){ icon='/map/tower-hovered.png'; }
    else{ icon='/map/tower.png'; }
    return {
      icon: icon,
      visible: true,
      clickable: true,
      title: name + ' (' + f.getProperty('linename') +')',
      visible: visible && chkTower.isChecked() && map.getZoom() > MIN_TOWER_ZOOM,
    };
  } else if (geo.isOffice(f)){
    var icon;
    if(isSelected){ icon='/map/office-selected.png'; }
    else if(isHovered){ icon='/map/office-hovered.png'; }
    else{ icon='/map/office.png'; }
    return {
      icon: icon,
      visible: true,
      clickable: true,
      title: name,
      visible: visible&&chkOffice.isChecked(),
    };
  } else if (geo.isSubstation(f)){
    var icon;
    if(isSelected){ icon='/map/substation-selected.png'; }
    else if(isHovered){ icon='/map/substation-hovered.png'; }
    else{ icon='/map/substation.png'; }
    return {
      icon: icon,
      visible: true,
      clickable: true,
      title: name,
      visible: visible&&chkSubstation.isChecked(),
    };
  }
};

var initMap=function(){
  var mapOptions = {
    zoom: defaultZoom,
    center: new google.maps.LatLng(defaultCenterLat,defaultCenterLng),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  };

  map=new google.maps.Map(mapElement, mapOptions);

  map.loadData=function(opts){
    var url='/api/objects.json?';
    var query=[];
    if(typeof opts==='object'){
      if(opts.id){ query.push('id='+opts.id); }
      if(opts.type){ query.push('type='+opts.type); }
    }
    map.data.loadGeoJson(url+query.join('&'));
  };

  map.data.setStyle(styleFunction);

  map.loadData();

  window.map=map;

  currentZoomLevel = map.getZoom();
  google.maps.event.addListener(map, 'zoom_changed', function() {
    var newZoomLevel = map.getZoom();
    if( (newZoomLevel > MIN_TOWER_ZOOM && currentZoomLevel <= MIN_TOWER_ZOOM) || (newZoomLevel <= MIN_TOWER_ZOOM && currentZoomLevel > MIN_TOWER_ZOOM) ) {
      map.data.setStyle(styleFunction);
    }
    currentZoomLevel = newZoomLevel;
  });
};


// router

var initRouter=function(){
  var filters={regionCombo:regionCombo, chkSubstation:chkSubstation, chkOffice:chkOffice, chkTower:chkTower, chkPath:chkPath, chkLine:chkLine};
  app=router.initApplication({map:map, filters:filters, sidebar:sidebarElement, editMode: editMode});

  app.addPage('root', pages.home());
  app.addPage('edit_path', pages.edit_path());
  app.addPage('edit_point', pages.edit_point());
  app.addPage('search', pages.search());
  app.addPage('task', pages.task());

  app.openPage('root');
};

// filterbar

var regionCombo
  , chkSubstation
  , chkOffice
  , chkTower
  , chkPath
  , chkLine
  ;

var initFilterbar=function(){
  var resetMapStyle=function(){
    map.data.setStyle(styleFunction);
    router.filterChanged();
  };

  regionCombo=ui.form.comboField('filter_region', {collection_url: '/regions.json', text_property: 'name', empty: '-- ყველა რაიონი --'});
  regionCombo.addChangeListener(resetMapStyle);

  chkOffice=filterCheckbox('ოფისი', { onchange: resetMapStyle, checked: true });
  chkSubstation=filterCheckbox('ქვესადგური', { onchange: resetMapStyle, checked: true });
  chkTower=filterCheckbox('ანძა', { onchange: resetMapStyle, checked: true });
  chkLine=filterCheckbox('გადამცემი ხაზი', { onchange: resetMapStyle, checked: true });
  chkPath=filterCheckbox('მარშუტი', { onchange: resetMapStyle, checked: false });

  var div1 = ui.html.el('div', [ chkOffice, chkSubstation, chkTower ]);
  var div2 = ui.html.el('div', [ chkLine, chkPath ]);

  filterbarElement.appendChild(regionCombo);
  filterbarElement.appendChild(div1);
  filterbarElement.appendChild(div2);
};

var filterCheckbox=function(label, opts){
  var attrs = { type: 'checkbox' };
  if(opts && opts.checked) { attrs.checked = true; }
  var input=ui.html.el('input', attrs);
  var field=ui.html.el('label', {style:'padding: 0 10px;'}, [input, ' '+label]);
  input.onchange = opts && opts.onchange;
  field.isChecked = function() { return input.checked; };
  return field;
};