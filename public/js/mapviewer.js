(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var path=require('./path')
  , line=require('./line')
  , tower=require('./tower')
  , office=require('./office')
  , substation=require('./substation')
  , shortestpath=require('./shortestpath')
  , task = require('./task')
  ;

exports.path=path;
exports.line=line;
exports.tower=tower;
exports.office=office;
exports.substation=substation;
exports.shortestpath=shortestpath;
exports.task = task;
},{"./line":2,"./office":3,"./path":4,"./shortestpath":5,"./substation":6,"./task":7,"./tower":8}],2:[function(require,module,exports){
var utils=require('./utils')
  ;

var BASE_PATH='/api/lines';

var save=function(id,model,callback){
  utils.clearErrors(model);

  var path=model.path
    , name=model.name
    , direction=model.direction
    , description=model.description
    , region_id=model.region_id
    ;

  if(path.getLength()>1){
    if(!region_id){
      utils.addError(model,'region_id','აარჩიეთ რაიონი');
      return false;
    }
    var points=utils.pointsFromPath(path);
    var params={id:id, points:points, name:name, direction:direction, region_id:region_id, description:description};
    var url=BASE_PATH+(id ? '/edit' : '/new');
    $.post(url, params, function(data){
      if(callback){ callback(null,data); }
    }).fail(function(err){
      if(callback){ callback(err,null); }
    });
    return true;
  }
  return false;
};

exports.newLine=function(model,callback){ return save(null,model,callback); };
exports.editLine=function(id,model,callback){ return save(id,model,callback); };

exports.deleteLine=function(id,callback){
  $.post(BASE_PATH+'/delete',{id:id},function(data){
    if(callback){ callback(null,data); }
  }).fail(function(err){
    if(callback){ callback(err,null); }
  });
  return true;
};
},{"./utils":9}],3:[function(require,module,exports){
var utils=require('./utils')
  ;

var BASE_PATH='/api/offices';

var save=function(id,model,callback){
  utils.clearErrors(model);

  var name=model.name
    , region_id=model.region_id
    , lat=model.lat
    , lng=model.lng
    , address=model.address
    , description=model.description
    ;

  if(!name){
    utils.addError(model,'name',' ჩაწერეთ დასახელება');
    return false;
  } else if(!region_id){
    utils.addError(model,'region_id','აარჩიეთ რაიონი');
    return false;
  }

  var params={id:id, name:name, region_id:region_id, lat:lat, lng:lng, address:address, description:description};
  var url=BASE_PATH+(id ? '/edit' : '/new');
  $.post(url, params, function(data){
    if(callback){ callback(null,data); }
  }).fail(function(err){
    if(callback){ callback(err,null); }
  });

  return true;
};

exports.newOffice=function(model,callback){ return save(null,model,callback); };
exports.editOffice=function(id,model,callback){ return save(id,model,callback); };

exports.deleteOffice=function(id,callback){
  $.post(BASE_PATH+'/delete',{id:id},function(data){
    if(callback){ callback(null,data); }
  }).fail(function(err){
    if(callback){ callback(err,null); }
  });
  return true;
};
},{"./utils":9}],4:[function(require,module,exports){
var utils=require('./utils')
  ;

var BASE_PATH='/api/paths';

exports.newPath=function(model,callback){
  utils.clearErrors(model);

  var path=model.path
    , name=model.name
    , detail_id=model.detail_id
    , description=model.description
    , region_id=model.region_id
    ;

  if(path.getLength()>1){
    if(!detail_id){
      utils.addError(model,'detail_id','აარჩიეთ საფარის დეტალი');
      return false;
    }
    if(!region_id){
      utils.addError(model,'region_id','აარჩიეთ რაიონი');
      return false;
    }
    var points=utils.pointsFromPath(path);
    var params={points:points, detail_id:detail_id, name:name, description:description, region_id:region_id};
    $.post(BASE_PATH+'/new',params,function(data){
      if(callback){ callback(null, data); }
    }).fail(function(err){
      if(callback){ callback(err, null); }
    });
    return true;
  }
  return false;
};

exports.editPath=function(id,model,callback){
  utils.clearErrors(model);

  var path=model.path
    , name=model.name
    , detail_id=model.detail_id
    , description=model.description
    , region_id=model.region_id
    ;

  if(path.getLength()>1){
    if(!detail_id){
      utils.addError(model,'detail_id','აარჩიეთ საფარის დეტალი');
      return false;
    }
    if(!region_id){
      utils.addError(model,'region_id','აარჩიეთ რაიონი');
      return false;
    }
    var points=utils.pointsFromPath(path);
    var params={id:id, points:points, detail_id:detail_id, name:name, description:description, region_id:region_id};
    $.post(BASE_PATH+'/edit',params,function(data){
      if(callback){ callback(null, data); }
    }).fail(function(err){
      if(callback){ callback(err, null); }
    });
    return true;
  }
  return false;
};

exports.deletePath=function(id,callback){
  $.post(BASE_PATH+'/delete',{id:id},function(data){
    if(callback){ callback(null, data); }
  }).fail(function(err){
    if(callback){ callback(err, null); }
  });;
  return true;
};
},{"./utils":9}],5:[function(require,module,exports){
var BASE_PATH='/api/shortestpath';

exports.getShortestPath=function(features,callback){
  var ids=features.map(function(x){ return x.getProperty('class') +"/" + x.getId(); });

  $.get(BASE_PATH, {ids: ids}, function(data) {

    callback(null, data);

  }).fail(function(err){

    callback(err, null);

  });
};

},{}],6:[function(require,module,exports){
var utils=require('./utils')
  ;

var BASE_PATH='/api/substations';

var save=function(id,model,callback){
  utils.clearErrors(model);

  var name=model.name
    , region_id=model.region_id
    , lat=model.lat
    , lng=model.lng
    , description=model.description
    ;

  if(!name){
    utils.addError(model,'name',' ჩაწერეთ დასახელება');
    return false;
  } else if(!region_id){
    utils.addError(model,'region_id','აარჩიეთ რაიონი');
    return false;
  }

  var params={id:id, name:name, region_id:region_id, lat:lat, lng:lng, description:description};
  var url=BASE_PATH+(id ? '/edit' : '/new');
  $.post(url, params, function(data){
    if(callback){ callback(null,data); }
  }).fail(function(err){
    if(callback){ callback(err,null); }
  });

  return true;
};

exports.newSubstation=function(model,callback){ return save(null,model,callback); };
exports.editSubstation=function(id,model,callback){ return save(id,model,callback); };

exports.deleteSubstation=function(id,callback){
  $.post(BASE_PATH+'/delete',{id:id},function(data){
    if(callback){ callback(null,data); }
  }).fail(function(err){
    if(callback){ callback(err,null); }
  });
  return true;
};
},{"./utils":9}],7:[function(require,module,exports){
var utils=require('./utils')
  ;

var BASE_PATH='/api/tasks';

var save=function(model,callback){
  utils.clearErrors(model);

  var note=model.note
    , assignee_id=model.assignee_id
    , destinations=model.destinations
    , paths=model.paths
    ;

  if(!assignee_id){
    utils.addError(model,'region_id','აარჩიეთ შემსრულებელი');
    return false;
  }

  var params = { assignee_id: assignee_id, note: note, paths: paths, destinations: destinations };
  var url = BASE_PATH + '/new';
  $.post(url, params, function(data){ callback(null,data); }).fail(function(err){ callback(err,null); });

  return true;
};

exports.save=save;
},{"./utils":9}],8:[function(require,module,exports){
var utils=require('./utils')
  ;

var BASE_PATH='/api/towers';

var save=function(id,model,callback){
  utils.clearErrors(model);

  var name=model.name
    , region_id=model.region_id
    , lat=model.lat
    , lng=model.lng
    , category=model.category
    , description=model.description
    ;

  if(!region_id){
    utils.addError(model,'region_id','აარჩიეთ რაიონი');
    return false;
  }

  var params={id:id, name:name, region_id:region_id, lat:lat, lng:lng, category:category, description:description};
  var url=BASE_PATH+(id ? '/edit' : '/new');
  $.post(url, params, function(data){
    if(callback){ callback(null,data); }
  }).fail(function(err){
    if(callback){ callback(err,null); }
  });

  return true;
};

exports.newTower=function(model,callback){ return save(null,model,callback); };
exports.editTower=function(id,model,callback){ return save(id,model,callback); };

exports.deleteTower=function(id,callback){
  $.post(BASE_PATH+'/delete',{id:id},function(data){
    if(callback){ callback(null,data); }
  }).fail(function(err){
    if(callback){ callback(err,null); }
  });
  return true;
};
},{"./utils":9}],9:[function(require,module,exports){
/**
 * converts polyline into array of points
 */
exports.pointsFromPath=function(path){
  var points=[];
  path.forEach(function(element,index){
    points.push({
      lat:element.lat(),
      lng:element.lng(),
    });
  });
  return points;
};

/**
 * add model error
 */
exports.addError=function(model,field,message){
  if(!field){ field='_toplevel'; } // toplevel error
  if(!model.errors){ model.errors={}; }
  if(!model.errors[field]){ model.errors[field]=[]; }
  model.errors[field].push(message);
};

/**
 * clear model errors
 */
exports.clearErrors=function(model){
  model.errors={};
};
},{}],10:[function(require,module,exports){
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
},{"./api":1,"./pages":22,"./pages/geo":20,"./router":25,"./ui":31}],11:[function(require,module,exports){
var ui=require('../ui')
  , forms=require('./forms')
  , api=require('../api')
  , geo=require('./geo')
  ;

var self, canEdit
  , map, marker, path
  , layout, formLayout, uiInitialized=false
  , titleElement=ui.html.pageTitle('შეცვლა')
  ;

module.exports=function(){
  return {
    onEnter: function(){
      self=this;

      if (!uiInitialized){ initUI(self); }

      map=self.map;
      initMap();

      resetLayout();
      canEdit=true;
      getForm().loadModel(getId());

      return layout;
    },
    onExit: function() {
      geo.resetMap(map);
    },
  };
};

var getFeature=function(){ return self.params.feature; }
var isNewMode=function(){ return !getFeature(); };
var getForm=function(){ return  formLayout.selected(); };

var getType=function(){
  var feature=getFeature();
  if(feature){
    return geo.getType(feature);
  } else{
    return self.params.type;
  }
};

var getId=function(){
  var feature=getFeature();
  return feature&&feature.getId();
};

var resetLayout=function(){
  var type=getType();
  var prefix=isNewMode() ? 'ახალი: ' : 'შეცვლა: ';
  titleElement.setTitle(prefix+geo.typeName(type));
  formLayout.openType(type);
};

var initUI=function(self){
  var saveAction=function(){
    var form=getForm();
    form.clearErrors();

    var model=form.getModel();
    model.path=path.getPath();

    var callback=function(err,data){
      if(err){
        console.log(err);
      } else {
        path.setMap(null);
        map.loadData({id:data.id, type:getType()});
        self.openPage('root');
      }
    };

    var sent=false;
    if (geo.isLine(getType())){
      if(isNewMode()){ sent=api.line.newLine(model, callback); }
      else { sent=api.line.editLine(getId(), model, callback); }
    } else{
      if(isNewMode()){ sent=api.path.newPath(model, callback); }
      else { sent=api.path.editPath(getId(), model, callback); }
    }

    canEdit= !sent;
    if(!sent){ form.setModel(model); }
  };

  var cancelAction=function(){
    path.setMap(null);
    var feature=getFeature();
    if(feature){ map.data.add(feature); }
    self.openPage('root', {selectedFeature: getFeature()});
  };

  var form1=forms.path.form({save_action:saveAction, cancel_action:cancelAction});
  var form2=forms.line.form({save_action:saveAction, cancel_action:cancelAction});
  formLayout=ui.layout.card({children: [form1,form2]});
  formLayout.openType=function(type){
    if(geo.isPath(type)){
      formLayout.showAt(0);
    } else {
      formLayout.showAt(1);
    }
  };

  layout=ui.layout.vertical({children:[titleElement,formLayout]});
  uiInitialized=true;
};

var initMap=function(){
  if(!path) {
    path=new google.maps.Polyline({
      geodesic:true,
      strokeColor:'#0000FF',
      strokeOpacity:1.0,
      strokeWeight:1,
      editable:true,
    });
    marker = new google.maps.Marker({
      icon: {
        path:google.maps.SymbolPath.CIRCLE,
        fillOpacity:0,
        strokeOpacity:1,
        strokeColor:'#FF0000',
        strokeWeight:1,
        scale:10, //pixels
      }
    });
  }
  path.getPath().clear();
  path.setMap(map);

  var feature=getFeature();

  if(feature){
    geo.copyFeatureToPath(feature,path);
    map.data.remove(feature);
  }

  var extendPath=function(evt){
    if(canEdit){
      path.getPath().push(evt.latLng);
    }
  };

  google.maps.event.addListener(map, 'click', extendPath);
  google.maps.event.addListener(marker, 'click', extendPath);

  google.maps.event.addListener(path, 'dblclick', function(evt){
    if(canEdit){
      if(typeof evt.vertex==='number'){
        path.getPath().removeAt(evt.vertex);
      }
    }
  });

  if(geo.isPath(getType())){
    map.data.addListener('mouseover', function(evt) {
      if(canEdit){
        if(geo.isPath(evt.feature)){
          map.data.overrideStyle(evt.feature,{strokeWeight:10,strokeColor:'#00FF00'});
          marker.setMap(map);
        }
      }
    });

    map.data.addListener('mouseout', function(evt) {
      if(canEdit){
        if(geo.isPath(evt.feature)){
          map.data.revertStyle();
          marker.setMap(null);
        }
      }
    });

    map.data.addListener('mousemove', function(evt){
      if(canEdit){
        if(geo.isPath(evt.feature)){
          marker.setPosition(geo.closestFeaturePoint(evt.feature,evt.latLng));
        }
      }
    });
  }
};

},{"../api":1,"../ui":31,"./forms":13,"./geo":20}],12:[function(require,module,exports){
var ui=require('../ui')
  , forms=require('./forms')
  , api=require('../api')
  , geo=require('./geo')
  ;

var self, canEdit
  , map, marker
  , layout, formLayout, uiInitialized=false
  , titleElement=ui.html.pageTitle('შეცვლა')
  ;

module.exports=function(){
  return {
    onEnter: function(){
      self=this;

      if (!uiInitialized){ initUI(self); }

      map=self.map;
      initMap();

      resetLayout();
      canEdit=true;
      getForm().loadModel(getId());

      return layout;
    },
    onExit: function() {
      geo.resetMap(map);
    },
  };
};

var initUI=function(){
  var saveAction=function(){
    var form=getForm();
    form.clearErrors();

    var model=form.getModel()
      , position=marker.getPosition()
      ;

    model.lat=position.lat();
    model.lng=position.lng();

    var callback=function(err,data){
      if(err){
        console.log(err);
      } else {
        marker.setMap(null);
        map.loadData({id:data.id, type:getType()});
        self.openPage('root');
      }
    };

    var sent=false;
    if (geo.isTower(getType())){
      if(isNewMode()){ sent=api.tower.newTower(model, callback); }
      else { sent=api.tower.editTower(getId(), model, callback); }
    } else if(geo.isOffice(getType())){
      if(isNewMode()){ sent=api.office.newOffice(model, callback); }
      else { sent=api.office.editOffice(getId(), model, callback); }
    } else if(geo.isSubstation(getType())){
      if(isNewMode()){ sent=api.substation.newSubstation(model, callback); }
      else { sent=api.substation.editSubstation(getId(), model, callback); }
    }

    canEdit= !sent;
    if(!sent){ form.setModel(model); }
  };

  var cancelAction=function(){
    marker.setMap(null);
    var feature=getFeature();
    if(feature){ map.data.add(feature); }
    self.openPage('root',{selectedFeature: feature});
  };

  var form1=forms.tower.form({save_action:saveAction, cancel_action:cancelAction});
  var form2=forms.office.form({save_action:saveAction, cancel_action:cancelAction});
  var form3=forms.substation.form({save_action:saveAction, cancel_action:cancelAction});
  formLayout=ui.layout.card({children: [form1, form2, form3]});
  formLayout.openType=function(type){
    if(geo.isTower(type)){ formLayout.showAt(0); }
    else if(geo.isOffice(type)){ formLayout.showAt(1); }
    else if(geo.isSubstation(type)){ formLayout.showAt(2); }
  };

  layout=ui.layout.vertical({children:[titleElement,formLayout]});
  uiInitialized=true;
};

var resetLayout=function(){
  var type=getType();
  var prefix=isNewMode() ? 'ახალი: ' : 'შეცვლა: ';
  titleElement.setTitle(prefix+geo.typeName(type));
  formLayout.openType(type);
};

var initMap=function(){
  if(!marker){
    marker=new google.maps.Marker({
      draggable:true,
      animation: google.maps.Animation.DROP,
    });
  }
  marker.setMap(map);

  var feature=getFeature();

  if(feature){
    geo.copyFeatureToMarker(feature, marker);
    map.data.remove(feature);
  } else{
    marker.setPosition(map.getCenter());
  }
};

var getFeature=function(){ return self.params.feature; }
var isNewMode=function(){ return !getFeature(); };
var getForm=function(){ return  formLayout.selected(); };

var getType=function(){
  var feature=getFeature();
  if(feature){
    return geo.getType(feature);
  } else{
    return self.params.type;
  }
};

var getId=function(){
  var feature=getFeature();
  return feature&&feature.getId();
};

},{"../api":1,"../ui":31,"./forms":13,"./geo":20}],13:[function(require,module,exports){
var path=require('./path')
  , line=require('./line')
  , tower=require('./tower')
  , office=require('./office')
  , substation=require('./substation')
  , task=require('./task')
  ;

exports.path=path;
exports.line=line;
exports.tower=tower;
exports.office=office;
exports.substation=substation;
exports.task=task;
},{"./line":14,"./office":15,"./path":16,"./substation":17,"./task":18,"./tower":19}],14:[function(require,module,exports){
var ui=require('../../ui')
  ;

exports.form=function(opts){
  var save_f=opts.save_action;
  var cancel_f=opts.cancel_action;

  var saveAction={label: 'ხაზის შენახვა', icon:'save', type:'success', action: save_f};
  var cancelAction={label:'გაუმება', icon:'times-circle', action: cancel_f};

  var nameText=ui.form.textField('name', {label: 'სახელი'});
  var directionText=ui.form.textField('direction', {label: 'მიმართულება'});
  var regionsCombo=ui.form.comboField('region_id', {label: 'რაიონი', collection_url: '/regions.json', text_property: 'name'});
  var descriptionText=ui.form.textArea('description', {label: 'შენიშვნა'});

  var fields=[nameText,directionText,regionsCombo,descriptionText];
  var actions=[saveAction,cancelAction];

  var form=ui.form.create(fields,{actions: actions,load_url:'/api/lines/show.json'});
  return form;
};
},{"../../ui":31}],15:[function(require,module,exports){
var ui=require('../../ui')
  ;

exports.form=function(opts){
  var save_f=opts.save_action;
  var cancel_f=opts.cancel_action;

  var saveAction={label: 'ოფისის შენახვა', icon:'save', type:'success', action: save_f};
  var cancelAction={label:'გაუმება', icon:'times-circle', action: cancel_f};

  var nameText=ui.form.textField('name', {label: 'დასახელება'});
  var addressText=ui.form.textField('address', {label: 'მისამართი'});
  var regionsCombo=ui.form.comboField('region_id', {label: 'რაიონი', collection_url: '/regions.json', text_property: 'name'});
  var descriptionText=ui.form.textArea('description', {label: 'შენიშვნა'});

  var fields=[nameText, addressText, regionsCombo, descriptionText];
  var actions=[saveAction,cancelAction];

  var form=ui.form.create(fields,{actions: actions,load_url:'/api/offices/show.json'});
  return form;
};

},{"../../ui":31}],16:[function(require,module,exports){
var ui=require('../../ui')
  ;

exports.form=function(opts){
  var save_f=opts.save_action;
  var cancel_f=opts.cancel_action;

  var saveAction={label: 'გზის შენახვა', icon:'save', type:'success', action: save_f};
  var cancelAction={label:'გაუმება', icon:'times-circle', action: cancel_f};

  var typeCombo=ui.form.comboField('type_id', {label: 'გზის სახეობა', collection_url: '/objects/path/types.json', text_property: 'name'});
  var surfaceCombo=ui.form.comboField('surface_id', {label: 'გზის საფარი', collection_url: '/objects/path/surfaces.json', text_property: 'name', parent_combo: typeCombo, parent_key: 'type_id'});
  var detailsCombo=ui.form.comboField('detail_id', {label: 'საფარის დეტალები', collection_url: '/objects/path/details.json', text_property: 'name', parent_combo: surfaceCombo, parent_key: 'surface_id'});
  var nameText=ui.form.textField('name', {label: 'სახელი'});
  var descriptionText=ui.form.textArea('description', {label: 'შენიშვნა'});
  var regionsCombo=ui.form.comboField('region_id', {label: 'რაიონი', collection_url: '/regions.json', text_property: 'name'});

  var fields=[typeCombo, surfaceCombo, detailsCombo,nameText,descriptionText,regionsCombo];
  var actions=[saveAction,cancelAction];

  var form=ui.form.create(fields,{actions: actions, load_url:'/api/paths/show.json'});
  return form;
};
},{"../../ui":31}],17:[function(require,module,exports){
var ui=require('../../ui')
  ;

exports.form=function(opts){
  var save_f=opts.save_action;
  var cancel_f=opts.cancel_action;

  var saveAction={label: 'ქვესადგურის შენახვა', icon:'save', type:'success', action: save_f};
  var cancelAction={label:'გაუმება', icon:'times-circle', action: cancel_f};

  var nameText=ui.form.textField('name', {label: 'დასახელება'});
  var regionsCombo=ui.form.comboField('region_id', {label: 'რაიონი', collection_url: '/regions.json', text_property: 'name'});
  var descriptionText=ui.form.textArea('description', {label: 'შენიშვნა'});

  var fields=[nameText, regionsCombo, descriptionText];
  var actions=[saveAction,cancelAction];

  var form=ui.form.create(fields,{actions: actions,load_url:'/api/substations/show.json'});
  return form;
};

},{"../../ui":31}],18:[function(require,module,exports){
var ui=require('../../ui')
  ;

exports.form=function(opts){
  var save_f=opts.save_action;
  var cancel_f=opts.cancel_action;

  var saveAction = { label: 'დავალების შენახვა', icon:'save', type:'success', action: save_f };
  var cancelAction = { label:'გაუმება', icon:'times-circle', action: cancel_f };

  var assigneeCombo=ui.form.comboField('assignee_id', {label: 'შემსრულებელი', collection_url: '/api/users.json', text_property: 'username'});
  var noteText=ui.form.textArea('note', { label: 'შენიშვნა' });

  var fields = [assigneeCombo, noteText];
  var actions = [saveAction,cancelAction];

  var form = ui.form.create(fields, { actions: actions });
  return form;
};

},{"../../ui":31}],19:[function(require,module,exports){
var ui=require('../../ui')
  ;

exports.form=function(opts){
  var save_f=opts.save_action;
  var cancel_f=opts.cancel_action;

  var saveAction={label: 'ანძის შენახვა', icon:'save', type:'success', action: save_f};
  var cancelAction={label:'გაუმება', icon:'times-circle', action: cancel_f};

  var nameText=ui.form.textField('name', {label: 'სახელი'});
  var categoryText=ui.form.textField('category', {label: 'ტიპი'});
  var regionsCombo=ui.form.comboField('region_id', {label: 'რაიონი', collection_url: '/regions.json', text_property: 'name'});
  var descriptionText=ui.form.textArea('description', {label: 'შენიშვნა'});

  var fields=[nameText,categoryText,regionsCombo,descriptionText];
  var actions=[saveAction,cancelAction];

  var form=ui.form.create(fields,{actions: actions,load_url:'/api/towers/show.json'});
  return form;
};

},{"../../ui":31}],20:[function(require,module,exports){
exports.resetMap=function(map){
  // google.maps.event.clearInstanceListeners(map);
  google.maps.event.clearInstanceListeners(map.data);
  map.data.revertStyle();
};

exports.copyFeatureToPath=function(feature,path){
  var points=feature.getGeometry().getArray();
  path.getPath().clear();
  for(var i=0,l=points.length;i<l;i++){
    path.getPath().push(points[i]);
  }
};

exports.copyFeatureToMarker=function(feature,marker){
  var point=feature.getGeometry().get();
  marker.setPosition(new google.maps.LatLng(point.lat(), point.lng()));
};

// distances

exports.closestFeaturePoint=function(feature,point){
  var minDistance
    , minPoint
    ;
  var g=feature.getGeometry();
  var ary=g.getArray();
  for(var i=0,l=ary.length;i<l;i++){
    var p=ary[i];
    var x=new google.maps.LatLng(p.lat(),p.lng());
    var distance=google.maps.geometry.spherical.computeDistanceBetween(p,point);
    if(!minDistance || distance<minDistance){
      minDistance=distance;
      minPoint=p;
    }
  }
  return minPoint;
};

exports.calcFeatureDistance=function(map,feature){
  if(feature instanceof Array){
    var fullDistance=0;
    for(var p=0,q=feature.length;p<q;p++){
      fullDistance+=exports.calcFeatureDistance(map,feature[p]);
    }
    return fullDistance;
  }
  var g=feature.getGeometry()
    , dist=0
    , ary=g.getArray()
    , p0=ary[0]
    ;
  for(var i=0,l=ary.length;i<l;i++){
    var p=ary[i];
    dist+=google.maps.geometry.spherical.computeDistanceBetween(p0,p);
    p0=p;
  }
  return dist/1000;
};

// feature description

exports.TYPE_PATH='Objects::Path::Line';
exports.TYPE_LINE='Objects::Line';
exports.TYPE_TOWER='Objects::Tower';
exports.TYPE_OFFICE='Objects::Office';
exports.TYPE_SUBSTATION='Objects::Substation';

exports.getType=function(f){ return f.getProperty('class'); };

var typed=function(f, callback){
  var type;
  if(typeof f==='undefined'){ return f; }
  else if(typeof f==='string'){ type=f; }
  else{ type=exports.getType(f); }
  return callback(type);
};

exports.isLine=function(f){ return typed(f,function(type){ return exports.TYPE_LINE==type; }); }
exports.isPath=function(f){ return typed(f,function(type){ return exports.TYPE_PATH==type; }); }
exports.isLinelike=function(f){ return exports.isLine(f) || exports.isPath(f); }

exports.isTower=function(f){ return typed(f,function(type){ return exports.TYPE_TOWER==type; }); }
exports.isOffice=function(f){ return typed(f,function(type){ return exports.TYPE_OFFICE==type; }); }
exports.isSubstation=function(f){ return typed(f,function(type){ return exports.TYPE_SUBSTATION==type; }); }
exports.isPointlike=function(f){ return exports.isTower(f) || exports.isOffice(f) || exports.isSubstation(f); }

exports.typeName=function(f){
  return typed(f,function(type){
    if(exports.TYPE_LINE===type){ return 'გადამცემი ხაზი'; }
    else if(exports.TYPE_PATH==type){ return 'მარშრუტი'; }
    else if(exports.TYPE_TOWER==type){ return 'ანძა'; }
    else if(exports.TYPE_OFFICE==type){ return 'ოფისი'; }
    else if(exports.TYPE_SUBSTATION==type){ return 'ქვესადგური'; }
    return type;
  });
};

var property=function(name,value){
  return [
    '<p><strong>',name,'</strong>: ',
    (value||'<span class="text-muted">(ცარიელი)</span>'),
    '</p>'
  ].join('');
};

var lineDescription=function(map,f){
  return [
    property('დასახელება',f.getProperty('name')),
    property('მიმართულება',f.getProperty('direction')),
    property('სიგრძე','<code>'+exports.calcFeatureDistance(map,f).toFixed(3)+'</code> კმ'),
    property('რაიონი',f.getProperty('region')),
    property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

var pathDescription=function(map, f){
  var detail = f.getProperty('detail');
  var detailText = '';
  if (detail) { detailText = [detail.type, detail.surface, detail.detail].join(' > '); }
  return [
    property('დასახელება',f.getProperty('name')),
    property('გზის სახეობა', detailText),
    property('სიგრძე','<code>'+exports.calcFeatureDistance(map,f).toFixed(3)+'</code> კმ'),
    property('რაიონი',f.getProperty('region')),
    property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

var towerDescription=function(map,f){
  var point=f.getGeometry().get();
  return [
    property('ანძის#',f.getProperty('name')),
    property('ტიპი',f.getProperty('category')),
    property('რაიონი',f.getProperty('region')),
    property('ხაზი',f.getProperty('linename')),
    //property('განედი','<code>'+point.lat()+'</code>'),
    //property('გრძედი','<code>'+point.lng()+'</code>'),
    property('კოორდინატი', 'E: <code>' + f.getProperty('easting') + '</code>; N: <code>' + f.getProperty('northing') + '</code>'),
    property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

var officeDescription=function(map,f){
  var point=f.getGeometry().get();
  return [
    property('დასახელება',f.getProperty('name')),
    property('რაიონი',f.getProperty('region')),
    property('მისამართი',f.getProperty('address')),
    // property('განედი','<code>'+point.lat()+'</code>'),
    // property('გრძედი','<code>'+point.lng()+'</code>'),
    property('კოორდინატი', 'E: <code>' + f.getProperty('easting') + '</code>; N: <code>' + f.getProperty('northing') + '</code>'),
    property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

var substationDescription=function(map,f){
  var point=f.getGeometry().get();
  return [
    property('დასახელება',f.getProperty('name')),
    property('რაიონი',f.getProperty('region')),
    // property('განედი','<code>'+point.lat()+'</code>'),
    // property('გრძედი','<code>'+point.lng()+'</code>'),
    property('კოორდინატი', 'E: <code>' + f.getProperty('easting') + '</code>; N: <code>' + f.getProperty('northing') + '</code>'),
    property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

exports.featureDescription=function(map,f){
  var bodyDescription;

  //var texts=['<div class="panel panel-default">'];
  //texts.push('<div class="panel-heading"><h4 style="margin:0;padding:0;">',exports.typeName(f),'</h4></div>');
  if(exports.isLine(f)){ bodyDescription = lineDescription(map,f); }
  else if(exports.isPath(f)){ bodyDescription = pathDescription(map,f); }
  else if(exports.isTower(f)){ bodyDescription = towerDescription(map,f); }
  else if(exports.isOffice(f)){ bodyDescription = officeDescription(map,f); }
  else if(exports.isSubstation(f)){ bodyDescription = substationDescription(map,f); }
  //texts.push('<div class="panel-body">',bodyDescription,'</div>');
  //texts.push('</div>');
  var texts = ['<div><h4 class="page-header">',exports.typeName(f),'</h4>', bodyDescription,'</div>'];
  return texts.join('');
};

// short descriptions

var towerShortDescription=function(map,f){
  var point=f.getGeometry().get();
  return [
    '<p><img src="/icons/tower.png"/> <strong>ანძა#',f.getProperty('name'),'</strong> &mdash;<span class="text-muted">',f.getProperty('linename'),'</span></p>',
    '<p>',f.getProperty('region'),'</p>',
    // property('განედი','<code>'+point.lat()+'</code>'),
    // property('გრძედი','<code>'+point.lng()+'</code>'),
    // property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

var substationShortDescription=function(map,f){
  var point=f.getGeometry().get();
  return [
    '<p><img src="/icons/substation.png"/> <strong>ქვესადგური: ',f.getProperty('name'),'</strong></p>',
    '<p>',f.getProperty('region'),'</p>',
    // property('განედი','<code>'+point.lat()+'</code>'),
    // property('გრძედი','<code>'+point.lng()+'</code>'),
    // property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

var officeShortDescription=function(map,f){
  var point=f.getGeometry().get();
  return [
    '<p><img src="/icons/office.png"/> <strong>',f.getProperty('name'),'</strong> ',
    '<span class="text-muted">',f.getProperty('address'),'</span></p>',
    '<p>',f.getProperty('region'),'</p>',
    // property('მისამართი',f.getProperty('address')),
    // property('განედი','<code>'+point.lat()+'</code>'),
    // property('გრძედი','<code>'+point.lng()+'</code>'),
    // property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

var pathShortDescription=function(map,f){
  return [
    '<p><img src="/icons/path.png"/> <strong>მარშუტი: ',f.getProperty('name'),'</strong> <span class="text-muted">',f.getProperty('direction'),'</span></p>',
    '<p><code>',exports.calcFeatureDistance(map,f).toFixed(3),'</code>კმ &mdash; ', f.getProperty('region'),'</p>',
    // property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

var lineShortDescription=function(map,f){
  return [
    '<p><img src="/icons/line.png"/> <strong>ხაზი: ',f.getProperty('name'),'</strong></p>',
    '<p><code>',exports.calcFeatureDistance(map,f).toFixed(3),'</code>კმ &mdash; ', f.getProperty('region'),'</p>',
    // property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

exports.featureShortDescritpion=function(map,f){
  if(exports.isTower(f)){ return towerShortDescription(map,f); }
  else if(exports.isSubstation(f)){ return substationShortDescription(map,f); }
  else if(exports.isOffice(f)){ return officeShortDescription(map,f); }
  else if(exports.isPath(f)){ return pathShortDescription(map,f); }
  else if(exports.isLine(f)){ return lineShortDescription(map,f); }
  return '--';
};

// search support

exports.searchHit=function(f,words){
  for(var i=0,l=words.length;i<l;i++){
    var word=words[i];
    if(!searchSingleHit(f,word)){
      return false;
    }
  }
  return true;
};

var searchSingleHit=function(f,word){
  if(exports.isTower(f)){ return searchTowerHit(f, word); }
  else if(exports.isSubstation(f)){ return searchSubstationHit(f,word); }
  else if(exports.isOffice(f)){ return searchOfficeHit(f,word); }
  else if(exports.isLine(f)){ return searchLineHit(f,word); }
  else if(exports.isPath(f)){ return searchPathHit(f,word); }
  return false;
};

var searchTowerHit=function(f,word){
  var searchString=[
    'ანძა',
    f.getProperty('name'),
    f.getProperty('category'),
    f.getProperty('region'),
    f.getProperty('description'),
    f.getProperty('linename'),
  ].join(' ');
  return searchString.indexOf(word) != -1;
};

var searchSubstationHit=function(f,word){
  var searchString=[
    'ქვესადგური',
    f.getProperty('name'),
    f.getProperty('region'),
    f.getProperty('description'),
  ].join(' ');
  return searchString.indexOf(word) != -1;
};

var searchOfficeHit=function(f,word){
  var searchString=[
    'ოფისი',
    f.getProperty('name'),
    f.getProperty('region'),
    f.getProperty('description'),
    f.getProperty('address'),
  ].join(' ');
  return searchString.indexOf(word) != -1;
};

var searchLineHit=function(f,word){
  var searchString=[
    'ხაზი',
    f.getProperty('name'),
    f.getProperty('region'),
    f.getProperty('description'),
    f.getProperty('direction'),
  ].join(' ');
  return searchString.indexOf(word) != -1;
};

var searchPathHit=function(f,word){
  var searchString=[
    'მარშუტი',
    f.getProperty('name'),
    f.getProperty('region'),
    f.getProperty('description'),
  ].join(' ');
  return searchString.indexOf(word) != -1;
};

// image

exports.featureImages = function(f) {
  var images = f.getProperty('images');
  if(images) {
    var ary = [];
    var thumbnails = images.thumbnails;
    var larges = images.larges;
    for(var i = 0, l = thumbnails.length; i < l; i++) {
      ary.push( [
        '<a href="' + larges[i] + '" target="_blank">',
        '<img src="' + thumbnails[i] +'" class="img-thumbnail"/>',
        '</a>',
        ].join('') );
    }
    return ary.join(' ');
    // return images.thumbnails.map(function(x){
    //   return ['<img src="'+x+'" class="img-thumbnail"/>'];
    // }).join(' ');
  } else {
    return "";
  }
};
},{}],21:[function(require,module,exports){
var ui=require('../ui')
  , api=require('../api')
  , geo=require('./geo')
  ;

var MAIN=0    // main page
  , CONFIRM=1 // confirm page
  ;

var map, editMode, infowindow
  , uiInitialized=false, locked
  , layout, page1, page2, toolbar=ui.button.toolbar([])
  , featureInfo=ui.html.p('',{style:'margin:16px 0;'})
  , pathInfo=ui.html.el('div',{style: 'margin: 16px 0;'})
  , selectedFeature
  , secondaryToolbar=ui.button.toolbar([]), pathToolbar=ui.button.toolbar([]), taskToolbar=ui.button.toolbar([])
  , btnHome, btnSearch
  , btnNewPath, btnNewLine, btnNewTower, btnNewOffice, btnNewSubstation // new objects
  , btnDelete, btnEdit, btnAddToPath, btnNewTask, btnShortestPath
  , confirmTitle=ui.html.p('საჭიროა დასტური',{class: 'page-header', style: 'font-weight:bold; font-size: 1.2em;'})
  , confirmText=ui.html.p('დაადასტურეთ, რომ ნამდვილად გინდათ მონიშნული ობიექტის წაშლა?',{class: 'text-danger'})
  , toolbar2=ui.button.toolbar([])
  , pathPoints=[]
  ;

module.exports=function(){
  return {
    onEnter: function(){
      var self=this;
      locked=false;
      editMode = self.editMode;

      if (!uiInitialized){
        initUI(self);
        layout=ui.layout.card({children: [page1,page2]});
      }

      map=self.map;
      initMap();
      resetPathInfo();

      openPage(MAIN);

      if(self.params&&self.params.selectedFeature){
        changeSelection(self.params.selectedFeature);
      }

      return layout;
    },
    onExit: function() {
      if(selectedFeature){ changeSelection(selectedFeature); }
      geo.resetMap(map);
    },
  };
};

var initUI=function(self){
  initPage1(self);
  initPage2(self);
  uiInitialized=true;
};

var initPage1=function(self){
  // main toolbar actions
  btnHome=ui.button.actionButton('', function(){ window.location='/'; }, {icon:'home'});
  btnSearch=ui.button.actionButton('ძებნა', function(){ self.openPage('search'); }, {icon: 'search'});

  btnNewPath=ui.button.actionLink('მარშუტი', function(){
    if(!locked){ self.openPage('edit_path',{type:geo.TYPE_PATH}); }
  });
  btnNewLine=ui.button.actionLink('გადამცემი ხაზი', function(){
    if(!locked){ self.openPage('edit_path',{type:geo.TYPE_LINE}); }
  });
  btnNewTower=ui.button.actionLink('ანძა', function(){
    if(!locked){ self.openPage('edit_point',{type:geo.TYPE_TOWER}); }
  });
  btnNewOffice=ui.button.actionLink('ოფისი', function(){
    if(!locked){ self.openPage('edit_point',{type:geo.TYPE_OFFICE}); }
  });
  btnNewSubstation=ui.button.actionLink('ქვესადგური', function(){
    if(!locked){ self.openPage('edit_point',{type:geo.TYPE_SUBSTATION}); }
  });

  var buttons=[btnNewPath,btnNewLine,{divider:true},btnNewOffice,btnNewSubstation,btnNewTower];
  var newObjects=ui.button.dropdown('ახალი ობიექტი',buttons, {type:'success'});  

  toolbar.addButton(btnSearch);
  toolbar.addButton(btnHome);
  if(editMode){ toolbar.addButton(newObjects); }

  // secondary actions

  btnDelete=ui.button.actionButton('წაშლა', function(){
    if(!locked){ openPage(CONFIRM); }
  }, {icon: 'trash-o', type: 'danger'});

  btnEdit=ui.button.actionButton('შეცვლა', function(){
    if(!locked){
      if(geo.isPath(selectedFeature)||geo.isLine(selectedFeature)){
        self.openPage('edit_path',{feature: selectedFeature});
      } else if(geo.isTower(selectedFeature)||geo.isOffice(selectedFeature)||geo.isSubstation(selectedFeature)){
        self.openPage('edit_point',{feature: selectedFeature});
      }
    }
  }, {icon: 'pencil', type: 'warning'});

  btnAddToPath=ui.button.actionButton('წერტილის დამატება', function(){
    if (pathPoints.indexOf(selectedFeature) == -1) {
      pathPoints.push(selectedFeature);
      clearPaths();
      resetPathInfo();
      // if (pathPoints.length > 1) { getShortestPath(); }
    }
  }, {icon: 'plus'});

  btnShortestPath = ui.button.actionButton('გზის აგება', function() {
    if (pathPoints.length > 1 && !pathCalculationInProgress) {
      getShortestPath();
    }
  }, { icon: 'road' });

  btnNewTask=ui.button.actionButton('დავალების შექმნა', function() {
    // if(paths.length > 0) {
      self.openPage('task', {destinations: pathPoints, paths: paths});
    // }
  }, {icon: 'tasks', type: 'success'})

  // page1 layout

  var tabs = ui.html.el('div', {style: 'margin-top: 16px;'});
  tabs.innerHTML = ['<ul class="nav nav-tabs" role="tablist">',
    '<li class="active"><a href="#feature" role="tab" data-toggle="tab">ობიექტი</a></li>',
    '<li><a href="#path" role="tab" data-toggle="tab">დავალება</a></li>',
    '</ul>',
  ].join('');
  var tabContent = ui.html.el('div', {class: 'tab-content'});
  var t1 = ui.html.el(tabContent, 'div', {class: ['tab-pane','active'], id: 'feature'});
  t1.appendChild(featureInfo);
  t1.appendChild(secondaryToolbar);
  var t2 = ui.html.el(tabContent, 'div', {class: ['tab-pane'], id: 'path'});
  pathToolbar.style.marginTop="16px";
  t2.appendChild(taskToolbar);
  taskToolbar.style.marginBottom = taskToolbar.style.marginTop = '8px';
  t2.appendChild(pathInfo);
  t2.appendChild(pathToolbar);
  tabs.appendChild(tabContent);
 
  page1=ui.layout.vertical({ children: [ toolbar, tabs, ] });
};

var initPage2=function(self){
  var btnCancel=ui.button.actionButton('გაუქმება', function(){ openPage(MAIN); });
  var btnConfirm=ui.button.actionButton('ვადასტურებ', deleteSelectedFeature, {icon:'warning', type: 'danger'});

  toolbar2.addButton(btnConfirm);
  toolbar2.addButton(btnCancel);

  var titleElement=ui.html.pageTitle('საწყისი');
  page2=ui.layout.vertical({
    children: [
      titleElement,
      confirmTitle,
      confirmText,
      toolbar2
    ]
  });
};

var openPage=function(idx){ layout.showAt(idx); };

var resetFeatureInfo = function(){
  secondaryToolbar.clearButtons();
  pathToolbar.clearButtons();

  taskToolbar.appendChild(btnNewTask);

  if (!selectedFeature) {
    featureInfo.setHtml('მონიშნეთ ობიექტი რუკაზე მასზე ინფორმაციის მისაღებად.');
  } else {

    if(!infowindow) { infowindow = new google.maps.InfoWindow(); }

    var point;
    if (geo.isPointlike(selectedFeature)) {
      point = selectedFeature.getGeometry().get();
    } else {
      point = selectedFeature.getGeometry().getAt(Math.floor( selectedFeature.getGeometry().getLength() / 2 ));
    }
    infowindow.setContent(geo.featureDescription(map, selectedFeature));
    infowindow.setPosition(point);
    infowindow.open(map);

    featureInfo.setHtml(geo.featureDescription(map,selectedFeature) + geo.featureImages(selectedFeature));
    
    if(editMode) {
      secondaryToolbar.addButton(btnEdit);
      secondaryToolbar.addButton(btnDelete);
    }
    if(geo.isPointlike(selectedFeature) && !pathCalculationInProgress){
      pathToolbar.addButton(btnAddToPath);
    }
    if(!pathCalculationInProgress && pathPoints.length > 1) {
      pathToolbar.addButton(btnShortestPath);
    }
  }
  openPage(MAIN);
};

var initMap=function(){
  map.data.addListener('mouseover', function(evt) {
    var f=evt.feature;
    f.hovered=true;
    map.data.revertStyle(f);
  });
  map.data.addListener('mouseout', function(evt) {
    var f=evt.feature;
    f.hovered=false;
    map.data.revertStyle(f);
  });
  map.data.addListener('click', function(evt){
    changeSelection(evt.feature);
  });
};

var changeSelection=function(f) {
  if (f === selectedFeature) {
    f.selected = false;
    selectedFeature = null;
  } else {
    if (selectedFeature) {
      selectedFeature.selected = false;
      map.data.revertStyle(selectedFeature);
    }
    selectedFeature = f;
    f.selected = true;
  }
  map.data.revertStyle(f);
  resetFeatureInfo();
};

var deleteSelectedFeature=function(){
  if(!selectedFeature){ return; }

  var id=selectedFeature.getId();

  var callback=function(){
    map.data.remove(selectedFeature);
    selectedFeature=null;
    resetFeatureInfo();
    locked=false;
  };

  if(geo.isPath(selectedFeature)){ locked=api.path.deletePath(id,callback); }
  else if(geo.isLine(selectedFeature)){ locked=api.line.deleteLine(id,callback); }
  else if(geo.isTower(selectedFeature)){ locked=api.tower.deleteTower(id,callback); }
  else if(geo.isOffice(selectedFeature)){ locked=api.office.deleteOffice(id,callback); }
  else if(geo.isSubstation(selectedFeature)){ locked=api.substation.deleteSubstation(id,callback); }
};

var resetPathInfo=function(){
  pathInfo.innerText='';
  if(pathPoints.length > 0) {
    var titleEleemnt=ui.html.el('h4', {class: 'page-header'}, 'გზის პარამეტრები (' + pathPoints.length + ')');
    pathInfo.appendChild(titleEleemnt);
    var totalLength = 0;
    for(var i = 0, l = pathPoints.length; i < l; i++){
      var f = pathPoints[i];
      if(f) {
        // toolbar

        var tbar=ui.html.el('div',{class:['pull-right','btn-group']});
        pathInfo.appendChild(tbar);
        // move up action
        if(!pathCalculationInProgress) {
          if (i > 0) {
            var btnUp = ui.html.el('button',{class:['btn','btn-xs','btn-default'], 'data-id':f.getId()});
            btnUp.innerHTML = '<i class="fa fa-arrow-up"></i>';
            btnUp.onclick = movePathPointUp;
            tbar.appendChild(btnUp);
          }
        }
        // move down action
        if(!pathCalculationInProgress) {
          if (i != pathPoints.length-1) {
            var btnDown = ui.html.el('button',{class:['btn','btn-xs','btn-default'], 'data-id':f.getId()});
            btnDown.innerHTML = '<i class="fa fa-arrow-down"></i>';
            btnDown.onclick = movePathPointDown;
            tbar.appendChild(btnDown);
          }
        }
        // delete action
        if(!pathCalculationInProgress) {
          var btnDelete = ui.html.el('button',{class:['btn','btn-xs','btn-danger'], 'data-id':f.getId()});
          btnDelete.innerHTML = '<i class="fa fa-trash-o"></i>';
          btnDelete.onclick = deletePathPoint;
          tbar.appendChild(btnDelete);
        }

        // content

        var d1=ui.html.el('div',{class:'search-result','data-id':f.getId()});
        d1.innerHTML = geo.featureShortDescritpion(map, f);
        d1.onclick = pathPointSelected;
        pathInfo.appendChild(d1);
        if(pathPoints.length > 1 && paths[i]){
          var d2 = ui.html.el('div', {style: 'padding: 5px; background: #FFFFDD'});
          var length = paths[i].length;
          totalLength += length;
          d2.innerHTML = 'მონაკვეთი <strong>' + (i+1) + '</strong>: <code>' + length.toFixed(3) + '</code> კმ';
          pathInfo.appendChild(d2);
        }
      }
    }

    // footer: summary
    if (pathCalculationInProgress) {
      var waiting = ui.html.el('div', {style: 'padding: 5px; background: #FFDDDD'});
      waiting.innerHTML = '<i class="fa fa-circle-o-notch fa-spin"></i> გთხოვთ დაელოდოთ...';
      pathInfo.appendChild(waiting);
    } else if(pathPoints.length > 1 && paths.length > 0){
      var summary = ui.html.el('div', {style: 'padding: 5px; background: #DDFFDD'});
      summary.innerHTML = '<strong>მანძილი სულ</strong>: <code>' + totalLength.toFixed(3) + '</code> კმ';
      pathInfo.appendChild(summary);
    }
  } else {
    pathInfo.innerHTML = '<p class="text-muted">არც ერთი დანიშნულების წერიტილი არაა დამატებული.</p>';
  }

  resetFeatureInfo();
};

var paths=[];
var pathCalculationInProgress = false;

var clearPaths=function() {
  for(var i = 0, l = paths.length; i < l; i++) {
    var path = paths[i];
    path.getPath().clear();
    path.setMap(null);
  }
  paths = [];
};

var getShortestPath=function() {
  clearPaths();
  if(pathPoints.length > 1) {
    // show wait
    pathCalculationInProgress = true;
    resetPathInfo();

    api.shortestpath.getShortestPath(pathPoints, function(err, data) {
      if(data && typeof data === 'object') {
        for(var i=0, l=data.length; i < l; i++) {
          var points=data[i].points;
          var path = new google.maps.Polyline({ geodesic: true, strokeColor: '#00FF00', strokeOpacity: 0.75, strokeWeight: 10 });
          path.length=data[i].length;
          for(var j=0, k=points.length; j < k; j++){
            var point=points[j];
            path.getPath().push(new google.maps.LatLng(point.lat, point.lng));
          }
          path.setMap(map);
          paths.push(path);
        }
      } else if(err) {
        console.log(err);
      }
      pathCalculationInProgress = false;
      resetPathInfo();
    });
  }
};

var deletePathPoint=function() {
  var id=this.getAttribute('data-id');
  var indexToRemove=pathPoints.map(function(x){ return x.getId() }).indexOf(id);
  pathPoints.splice(indexToRemove,1);
  clearPaths();
  resetPathInfo();
};

var movePathPointUp=function(){ movePathPoint(this.getAttribute('data-id'), true); };
var movePathPointDown=function(){ movePathPoint(this.getAttribute('data-id'), false); };

var movePathPoint=function(id, up){
  var index=pathPoints.map(function(x){ return x.getId() }).indexOf(id);
  if(up && index==0){ return; }
  if(!up && index==pathPoints.length-1){ return; }
  if(up){
    var e1=pathPoints[index];
    var e2=pathPoints[index-1];
    pathPoints.splice(index-1,2,e1,e2);
  } else {
    var e1=pathPoints[index];
    var e2=pathPoints[index+1];
    pathPoints.splice(index,2,e2,e1)
  }
  resetPathInfo();
  getShortestPath();
};

var pathPointSelected=function(){
  var f = map.data.getFeatureById(this.getAttribute('data-id'));
  changeSelection(f);
};
},{"../api":1,"../ui":31,"./geo":20}],22:[function(require,module,exports){
var home=require('./home')
  , edit_path=require('./edit_path')
  , edit_point=require('./edit_point')
  , search=require('./search')
  , task=require('./task')
  ;

exports.home=home;
exports.edit_path=edit_path;
exports.edit_point=edit_point;
exports.search=search;
exports.task=task;
},{"./edit_path":11,"./edit_point":12,"./home":21,"./search":23,"./task":24}],23:[function(require,module,exports){
var ui=require('../ui')
  , api=require('../api')
  , geo=require('./geo')
  ;

var map
  , selectedFeature
  , filters
  , uiInitialized=false
  , layout
  , search
  , results
  , currText
  ;

module.exports=function(){
  return {
    onEnter: function(){
      var self=this;

      map=self.map;
      filters=self.filters;
      selectedFeature=null;

      if (!uiInitialized){
        initUI(self);
        displaySearchResults([]);
      }

      return layout;
    },
    onExit: function() {
      geo.resetMap(map);
    },
    onStart: function(){
      search.requestFocus();
    },
    filterChanged:function(){
      research();
    },
  };
};

var initUI=function(self){
  var toolbar=ui.button.toolbar();
  var btnBack=ui.button.actionButton('უკან', function(){
    self.openPage('root',{selectedFeature: selectedFeature});
  }, {icon: 'arrow-circle-left'});

  toolbar.addButton(btnBack);
  toolbar.style.marginBottom='8px';

  search=ui.form.textField('search',{placeholder: 'ჩაწერეთ საკვანძო სიტყვა', autofocus: true});
  search.getTextField().onkeyup=function(){
    searching(search.getValue());
  };

  results=ui.html.el('div',{style: 'position:absolute; top:90px; bottom: 0; left:0; right: 0; overflow: auto; background: #fafafa;'});

  layout=ui.layout.vertical({children: [toolbar,search, results]});
  uiInitialized=true;
};

var research=function(){ // search again!
  searching(currText);
};

var searching=function(text){
  currText=text;
  var selected=[];
  if(text){
    var words=text.split(' ');
    map.data.forEach(function(f){
      if(isVisible(f)&&geo.searchHit(f,words)){
        selected.push(f);
      }
    });
  }
  displaySearchResults(selected);
};

var displaySearchResults=function(features){
  if(features.length>0){
    results.innerText='';
    for(var i=0,l=features.length;i<l;i++){
      var f=features[i];
      var d=ui.html.el('div',{class:'search-result','data-id':f.getId()});
      d.innerHTML=geo.featureShortDescritpion(map,f);
      d.onclick=itemSelected;
      results.appendChild(d);
    }
  } else {
    results.innerHTML='<div style="padding:8px;">მონაცემი არაა</div>';
  }
};

var itemSelected=function(){
  var f=map.data.getFeatureById(this.getAttribute('data-id'));
  changeSelection(f);

  // change selection class
  var children=this.parentElement.children;
  for(var i=0,l=children.length;i<l;i++){
    var child=children[i];
    if(child==this){
      child.className='search-result selected';
    } else{
      child.className='search-result';
    }
  }
};

var changeSelection=function(f){
  if(f!=selectedFeature){
    if(selectedFeature){
      selectedFeature.selected=false;
      map.data.revertStyle(selectedFeature);
    }
    selectedFeature=f;
    f.selected=true;
  }
  map.data.revertStyle(f);
  resetFeatureView();
};

var resetFeatureView=function(){
  if(selectedFeature){
    var f=selectedFeature;
    
    if(geo.isOffice(f)||geo.isTower(f)||geo.isSubstation(f)){
      var point=f.getGeometry().get();
      map.setCenter(point);
      if(map.getZoom()<12){ map.setZoom(12); }
    } else {
      var points=f.getGeometry().getArray();
      var bounds = new google.maps.LatLngBounds ();
      for(var i=0,l=points.length;i<l;i++){
        bounds.extend(points[i]);
      }
      map.fitBounds(bounds);
    }
  }
};

var isVisible=function(f){
  if(filters.regionCombo.getValue()){
    var selectedRegion=filters.regionCombo.getText();
    if(f.getProperty('region') != selectedRegion){ return false; }
  }
  if (geo.isLine(f)){ if(!filters.chkLine.isChecked()){ return false; } }
  if (geo.isPath(f)){ if(!filters.chkPath.isChecked()){ return false; } }
  if (geo.isTower(f)){ if(!filters.chkTower.isChecked()){ return false; } }
  if (geo.isOffice(f)){ if(!filters.chkOffice.isChecked()){ return false; } }
  if (geo.isSubstation(f)){ if(!filters.chkSubstation.isChecked()){ return false; } }
  return true;
};
},{"../api":1,"../ui":31,"./geo":20}],24:[function(require,module,exports){
var ui=require('../ui')
  , forms=require('./forms')
  , api=require('../api')
  , geo=require('./geo')
  ;

var self, canEdit
  , map, marker
  , layout, formLayout, uiInitialized = false
  , titleElement = ui.html.pageTitle('ახალი დავალება')
  ;

module.exports=function(){
  return {
    onEnter: function(){
      self=this ; map=self.map ;
      if (!uiInitialized) { initUI(self); }
      return layout;
    },
  };
};

var initUI=function(){
  var saveAction=function(){
    form.clearErrors();

    var model=form.getModel();

    if (self.params.paths) {
      model.paths = self.params.paths.map(function(x) {
        return x.getPath().getArray().map(function(x) {
          return {lat: x.lat(), lng: x.lng()};
        });
      });
    }

    if (self.params.destinations) {
      model.destinations = self.params.destinations.map(function(x) {
        return {id: x.getId(), type: geo.getType(x)};
      });
    }

    var callback=function(err,data){
      if(err){
        console.log(err);
      } else {
        if (data.number) {
          alert("დავალება გაგზავნილია: #" + data.number);
          self.openPage('root');
        } else {
          console.log(data);
        }
      }
    };

    var sent=api.task.save(model, callback);
    if(!sent){ form.setModel(model); }
  };

  var cancelAction=function(){
    self.openPage('root');
  };

  var form = forms.task.form({ save_action:saveAction, cancel_action:cancelAction });

  layout=ui.layout.vertical({children: [titleElement, form] });
  uiInitialized=true;
};

},{"../api":1,"../ui":31,"./forms":13,"./geo":20}],25:[function(require,module,exports){
var map
  , sidebar
  , filters
  , currentPage
  , pages={}
  , editMode
  ;

exports.initApplication=function(opts){
  map = opts.map;
  filters = opts.filters;
  sidebar = opts.sidebar;
  editMode = opts.editMode;  
  return {
    addPage: addPage,
    openPage: openPage,
  };
};

exports.filterChanged=function(){
  if(currentPage&&currentPage.filterChanged){
    currentPage.filterChanged();
  }
};

var addPage=function(name,page){
  page.openPage=openPage;
  pages[name]=page;
};

var openPage=function(name,params){
  // exiting currently open page
  if(currentPage){
    if(currentPage.onPause){
      var resp=currentPage.onPause();
      if(resp===false){ return; }
    }
    if(currentPage.onExit){
      currentPage.onExit();
    }
    currentPage.params={};
  }

  // clear sidebar
  sidebar.innerText='';

  // opening new page
  currentPage=pages[name];

  currentPage.map = map;
  currentPage.filters = filters;

  if (currentPage) {
    currentPage.params = params;
    currentPage.editMode = editMode;
    if (currentPage.onEnter) {
      var pageLayout = currentPage.onEnter();
      sidebar.appendChild(pageLayout);
    }
    if (currentPage.onStart) { currentPage.onStart(); }
  }
};

},{}],26:[function(require,module,exports){
var html=require('./html')
  , utils=require('./utils')
  ;

var btnClassNames=function(opts){
  var classNames;
  opts=opts || {};
  if(opts.type===false){
    classNames=[]; // plain link!
  } else {
    opts.type=opts.type||'default';
    classNames=['btn','btn-sm','btn-'+opts.type]
  }
  return classNames;
};

var ensureClassName=function(el,className,classNamePresent){
  var currentClassNames=el.className.split(' ').filter(function(x){return x!=className;});
  if(classNamePresent){ currentClassNames.push(className); }
  el.className=currentClassNames.join(' ');
};

exports.actionButton=function(text,action_f,opts){
  var children = utils.isArray(text) ? text : [text];

  if(opts&&opts.icon){
    var icon=html.el('i',{class:'fa fa-'+opts.icon});
    children=[icon,' '].concat(children);
  }

  var el= html.el('a',{href:'#',class:btnClassNames(opts)},children);
  var enabled=opts&&opts.enabled;
  if(enabled!==false&&enabled!==true){ enabled=true; }
  el.onclick=function(){
    if(action_f && enabled){ action_f(); }
    return false;
  }
  el.setEnabled=function(val){ enabled=val;ensureClassName(el,'disabled',!enabled); };
  el.setWaiting=function(val){ el.setEnabled(!val);ensureClassName(el,'waiting',!enabled); };

  return el;
};

exports.actionLink=function(text,action_f,opts){
  opts=opts || {};
  opts.type=false; // disable button
  return this.actionButton(text,action_f,opts);
};

exports.buttonGroup=function(buttons){
  return html.el('div',{class:'btn-group'},buttons);
};

exports.toolbar=function(buttons){
  var toolbar=html.el('div',{class:'btn-toolbar'},buttons)
  toolbar.addButton=function(button){
    toolbar.appendChild(button);
  };
  toolbar.clearButtons=function(){
    toolbar.innerHTML='';
  };
  return toolbar;
};

exports.dropdown=function(text,buttons,opts){
  var classes=btnClassNames(opts).concat(['dropdown-toggle']);
  if(utils.isArray(text)){text=text.push(' ');} else{text=[text,' '];}
  text.push(html.el('span',{class:'caret'}));
  var btn=html.el('button',{class:classes,'data-toggle':'dropdown'},text);
  var dd=html.el('ul',{class:'dropdown-menu'},buttons.map(function(x){
    if(x.divider){ return html.el('li',{class:'divider'}); }
    return html.el('li',[x]);
  }));
  return html.el('div',{class:'btn-group'},[btn,dd]);
};
},{"./html":30,"./utils":33}],27:[function(require,module,exports){
var html=require('../html')
  ;

var standardField=function(label,callback){
  var fieldElement=html.el('div',{class: 'form-group'})
    , errorElement=html.el('div',{class: 'text-danger'})
    , innerFieldElement=callback()
    ;
  if (label){
    var labelElement=html.el('label',[label]);
    fieldElement.appendChild(labelElement);
  }
  fieldElement.appendChild(innerFieldElement);
  fieldElement.appendChild(errorElement);

  fieldElement.setError=function(text){
    errorElement.innerText=text;
  };
  fieldElement.clearError=function(){
    errorElement.innerText='';
  };

  return fieldElement;
};

var applyModelForSimpleField=function(field,model){
  model[field.getName()]=field.getValue();
};

var setModelForSimpleField=function(field,model){
  field.setValue(model[field.getName()]);
  if (model.errors&&model.errors[field.getName()]){
    field.setError(model.errors[field.getName()]);
  } else {
    field.clearError();
  }
};

exports.textField=function(name,opts){
  var _innerElement;

  var textField=standardField(opts&&opts.label, function(){
    var attributes={type:'text', class:'form-control'};
    if(opts&&opts.autofocus){ attributes.autofocus=true; }
    if(opts&&opts.placeholder){ attributes.placeholder=opts.placeholder; }
    _innerElement=html.el('input', attributes);
    return _innerElement;
  });

  textField.getName=function(){return name;}
  textField.getValue=function(){ return _innerElement.value; };
  textField.setValue=function(val){ _innerElement.value=(val||''); };
  textField.applyModel=function(model){ applyModelForSimpleField(textField,model); }
  textField.setModel=function(model){ setModelForSimpleField(textField,model); }
  textField.getTextField=function(){ return _innerElement; };
  textField.requestFocus=function(){ _innerElement.focus(); };

  return textField;
};

exports.comboField=function(name,opts){
  var _select
    , _change_listeners=[]
    , _collection
    , _parent_combo=opts&&opts.parent_combo
    , _parent_key=(opts&&opts.parent_key)||'parent_id'
    , _value
    ;

  // basic combo field

  var comboField=standardField(opts&&opts.label,function(){
    var attributes={class:'form-control'};
    if(opts&&opts.autofocus){ attributes.autofocus=true; }
    _select=html.el('select',attributes);
    return _select;
  });

  comboField.childCombos=[];
  comboField.getName=function(){ return name; }
  comboField.getValue=function(){
    return _select.value;
  };
  comboField.setValue=function(val){
    var selectedVal=val;
    if(!selectedVal){
      var x=currentCollection()[0];
      if(x){ selectedVal=getId(x); }
    }
    _select.value=selectedVal;
    _value=val;
  }
  comboField.applyModel=function(model){ applyModelForSimpleField(comboField,model); }
  comboField.setModel=function(model){ setModelForSimpleField(comboField,model); }
  comboField.getText=function(){ return _select.options[_select.selectedIndex].innerHTML; }

  // manage collections

  var getId=function(val){ return (opts&&opts.id_property ? val[opts.id_property] : val.id); };
  var getText=function(val){ return (opts&&opts.text_property ? val[opts.text_property] : val.text); }
  var currentCollection=function(){
    return _collection ? _collection.filter(function(x){
      if(!_parent_combo){ return true; }
      return x[_parent_key]==_parent_combo.getValue();
    }) : [];
  };

  comboField.setCollection=function(collection){
    _select.innerText='';
    _collection=collection;
    if(_collection){
      var filtered=currentCollection();
      if(opts.empty){
        html.el(_select,'option',{value: ""},opts.empty);
      }
      for(var i=0,l=filtered.length;i<l;i++){
        var val=filtered[i];
        html.el(_select,'option',{value: getId(val)},getText(val));
      }
      //comboField.redisplay();
    }
  };

  if(opts&&opts.collection){
    comboField.setCollection(opts.collection);
  } else if(opts&&opts.collection_url){
    $.get(opts.collection_url, function(data){
      comboField.setCollection(data);
    });
  }

  // register listeners

  comboField.addChangeListener=function(funct){
    _change_listeners.push(funct);
  };

  comboField.removeChangeListener=function(funct){
    // TODO: write remove listener code
  };

  comboField.onchange=function(evt){
    for(var i=0,l=_change_listeners.length;i<l;i++){
      _change_listeners[i](evt);
    }
  };

  // parent combo listener

  comboField.redisplay=function(){
    comboField.setCollection(_collection);
    comboField.setValue(_value);
    var childCombos=comboField.childCombos;
    for(var i=0,l=childCombos.length;i<l;i++){
      var combo=childCombos[i];
      combo.redisplay();
    }
  };

  if(_parent_combo){
    _parent_combo.childCombos.push(comboField);
    _parent_combo.addChangeListener(function(){
      comboField.redisplay();
    });
  }

  return comboField;
};

exports.textArea=function(name, opts){
  var _innerElement;

  var textarea=standardField(opts&&opts.label, function(){
    var rows=(opts&&opts.rows)||3;
    var attributes={class:'form-control',rows:rows};
    _innerElement=html.el('textarea', attributes);
    return _innerElement;
  });

  textarea.getName=function(){return name;}
  textarea.getValue=function(){ return _innerElement.value; };
  textarea.setValue=function(val){ _innerElement.value=(val||''); };
  textarea.applyModel=function(model){ applyModelForSimpleField(textarea,model); }
  textarea.setModel=function(model){ setModelForSimpleField(textarea,model); }

  return textarea;
};
},{"../html":30}],28:[function(require,module,exports){
var html=require('../html')
  , button=require('../button')
  ;

module.exports=function(fields,opts){
  var _model={}
    , _fields=fields||[]
    , _form=html.el('div',{class:'form'})
    , _toolbar=button.toolbar()
    ;

  // place fields

  for(var i=0, l=_fields.length; i<l; i++){
    var f=_fields[i];
    _form.appendChild(f);
  }

  // model fields

  _form.getModel=function(){
    for(var i=0, l=_fields.length; i<l; i++){
      _fields[i].applyModel(_model);
    }
    _model.errors={};
    return _model;
  }

  _form.setModel=function(model){
    for(var i=0, l=_fields.length; i<l; i++){
      var fld=_fields[i];
      fld.setModel(model);
      if(typeof fld.redisplay === 'function'){fld.redisplay();} // for parent combo fields
    }
    _model=model;
  };

  _form.clearErrors=function(){
    for(var i=0, l=_fields.length; i<l; i++){
      _fields[i].clearError();
    }
  };

  _form.loadModel=function(id){
    if(id&&opts&&opts.load_url){
      $.get([opts.load_url, '?id=', id].join(''), function(data){
        _form.setModel(data);
      });
    }
    _form.setModel({});
  };

  // actions

  _form.appendChild(_toolbar);
  var actions=opts&&opts.actions;
  if (actions){
    for(var i=0,l=actions.length;i<l;i++){
      var action=actions[i];
      var btn=button.actionButton(action.label,action.action,{icon:action.icon, type:action.type});
      _toolbar.addButton(btn);
    }
  }

  return _form;
};

},{"../button":26,"../html":30}],29:[function(require,module,exports){
var form=require('./form')
  , field=require('./field')
  ;

exports.create=form;
exports.textField=field.textField;
exports.comboField=field.comboField;
exports.textArea=field.textArea;

},{"./field":27,"./form":28}],30:[function(require,module,exports){
var utils=require('./utils');

var dashedToCamelized=function(name){
  var firstToUpper=function(x){return [x.substring(0,1).toUpperCase(),x.substring(1)].join('');};
  var parts=name.split('-');
  return [parts[0]].concat(parts.slice(1).map(firstToUpper)).join('');
};

var applyAttribute=function(element,attrName,attrValue){
  if('class'===attrName){

    // class => className
    if(utils.isArray(attrValue)){ element.className=attrValue.join(' '); }
    else{ element.className=attrValue; }
  }
  else if('style'===attrName && attrValue){

    // styles

    var styles=attrValue.split(';');

    for(var i=0,l=styles.length;i<l;i++) {
      var styleInfo=styles[i];
      if(styleInfo && styleInfo.length>0){
        var colonIndex=styleInfo.indexOf(':');
        var styleName=dashedToCamelized(styleInfo.substring(0,colonIndex)).trim();
        var styleValue=styleInfo.substring(colonIndex+1).trim();
        element.style[styleName]=styleValue;
      }
    }
  } else if('autofocus'===attrName && attrValue){ element.autofocus=true; }
  else{ element.setAttribute(attrName,attrValue); }
};

var createElement=function(tag,attrs,children){
  var element = document.createElement(tag);
  if(attrs){ for(attrName in attrs){ applyAttribute(element,attrName,attrs[attrName]); } }
  if(children){
    for(var i=0,l=children.length;i<l;i++){
      var child=children[i];
      if(typeof child==='string'){ element.appendChild(document.createTextNode(child)); }
      else if(utils.isElement(child)){ element.appendChild(child); }
    }
  }
  return element;
};

/**
 * ```
 * el([parent],tag,[attributes],[children])
 * ```
 *
 * `parent`:Element parent for this element
 * `tag`:String tag name
 * `attributes`:Object tag attributes
 * `children`:{Element|Array|String}
 */
exports.el=function(){
  var parent,tag,attrs,children;
  var curr_index=0;

  // first argument may be a parent
  if(utils.isElement(arguments[curr_index])){ parent=arguments[curr_index]; curr_index+=1; }

  // argument[curr_index] is mandatory 
  tag=arguments[curr_index]; curr_index+=1;
  if(typeof tag !== 'string'){ throw "Tag not defined"; }

  // getting attributes
  if(!utils.isArray(arguments[curr_index]) && typeof arguments[curr_index]==='object'){ attrs=arguments[curr_index]; curr_index+=1; }

  // getting children
  if(typeof arguments[curr_index]==='string' || utils.isElement(arguments[curr_index])){
    children=[ arguments[curr_index] ]; curr_index+=1;
  } else if(utils.isArray(arguments[curr_index])){
    children=arguments[curr_index]; curr_index+=1;
  }

  // create element
  var element=createElement(tag,attrs,children);

  // if parent is given, then append this element to parent
  if (element && parent){ parent.appendChild(element); }

  return element;
};

exports.pageTitle=function(title,tag){
  var el=exports.el(tag||'h3',{class:'page-header'},title);
  el.setTitle=function(title){ el.innerText=title; };
  return el;
};

exports.p=function(text,opts){
  var p=exports.el('p',opts||{},text);
  p.setText=function(text){ p.innerText=text; };
  p.setHtml=function(html){ p.innerHTML=html; }
  return p; 
};

},{"./utils":33}],31:[function(require,module,exports){
var button=require('./button')
  , layout=require('./layout')
  , html=require('./html')
  , form=require('./form')
  ;

exports.html=html;
exports.button=button;
exports.layout=layout;
exports.form=form;
},{"./button":26,"./form":29,"./html":30,"./layout":32}],32:[function(require,module,exports){
var html=require('./html')
 ;

/**
 * Vertical layout.
 */
exports.vertical=function(opts){
  var layout
    , childElements=[]
    ;

  if(opts&&opts.parent){ layout=html.el(opts.parent,'div',{class:'vertical-layout'}); }
  else { layout=html.el('div',{class:'vertical-layout'}); }

  var addToLayout=function(child){
    var childElement=html.el(layout,'div',[child]);
    childElements.push(childElement);
  };

  if(opts&&opts.children){
    var children=opts.children;
    for(var i=0, l=children.length; i<l; i++){
      addToLayout(children[i]);
    }
  }

  layout.add=addToLayout;

  return layout;
};

/**
 * Card layout.
 */
exports.card=function(opts){
  var layout
    , childElements=[]
    , selectedIndex
    ;

  if(opts&&opts.parent){ layout=html.el(opts.parent,'div',{class:'card-layout'}); }
  else{ layout=html.el('div',{class:'card-layout'}); }

  var addToLayout=function(child){
    childElements.push(child);
    if(!selectedIndex){ select(0); }
  };

  var select=function(idx){
    if(idx!==selectedIndex) {
      var oldElement=childElements[selectedIndex];
      if(oldElement){ layout.removeChild(oldElement); }
      var newElement=childElements[idx];
      layout.appendChild(newElement);
      selectedIndex=idx;
    }
  };

  var selected=function(){
    return childElements[selectedIndex];
  };

  if(opts&&opts.children){
    var children=opts.children;
    for(var i=0, l=children.length; i<l; i++){
      addToLayout(children[i]);
    }
  }

  layout.add=addToLayout;
  layout.showAt=select;
  layout.selected=selected;

  return layout;
};
},{"./html":30}],33:[function(require,module,exports){
exports.isArray=function(x){ return x && (x instanceof Array); };
exports.isElement=function(x){ return x && ((x instanceof Element) || (x instanceof Document)); }
exports.fieldValue=function(object,name){ return object&&object[name]; };
},{}],34:[function(require,module,exports){
var app=require('./app');
app.start({editMode: false});
},{"./app":10}]},{},[34])