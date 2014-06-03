(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var path=require('./path')
  , line=require('./line')
  , tower=require('./tower')
  ;

exports.path=path;
exports.line=line;
exports.tower=tower;
},{"./line":2,"./path":3,"./tower":4}],2:[function(require,module,exports){
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
      utils.addError(model,'region_id','აარჩიეთ რეგიონი');
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
},{"./utils":5}],3:[function(require,module,exports){
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
      utils.addError(model,'region_id','აარჩიეთ რეგიონი');
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
      utils.addError(model,'region_id','აარჩიეთ რეგიონი');
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
},{"./utils":5}],4:[function(require,module,exports){
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
    utils.addError(model,'region_id','აარჩიეთ რეგიონი');
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
},{"./utils":5}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
var ui=require('./ui')
  , api=require('./api')
  , router=require('./router')
  , pages=require('./pages')
  , geo=require('./pages/geo')
  ;

var mapElement, sidebarElement, toolbarElement
  , defaultCenterLat, defaultCenterLng, defaultZoom
  , apikey, map
  , app
  ;

/**
 * Entry point for the application.
 */
exports.start=function(opts){
  sidebarElement=document.getElementById((opts&&opts.sidebarid)||'sidebar');
  toolbarElement=document.getElementById((opts&&opts.toolbarid)||'toolbar');
  mapElement=document.getElementById((opts&&opts.mapid)||'map');
  defaultCenterLat=(opts&&opts.centerLat)||42.3;
  defaultCenterLng=(opts&&opts.centerLat)||43.8;
  defaultZoom=(opts&&opts.startZoom)||7;
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
  initRouter();
};

var initMap=function(){
  var mapOptions = {
    zoom: defaultZoom,
    center: new google.maps.LatLng(defaultCenterLat,defaultCenterLng),
    mapTypeId: google.maps.MapTypeId.ROADMAP
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

  map.data.setStyle(function(f) {
    var name=f.getProperty('name')
      , isSelected=f.selected
      , isHovered=f.hovered
      ;
    if (geo.isLine(f)){
      var strokeColor, strokeWeight;
      if(isSelected){ strokeColor='#00AA00'; strokeWeight=5; }
      else if(isHovered){ strokeColor='#00FF00'; strokeWeight=10; }
      else{ strokeColor='#FF0000'; strokeWeight=1; }
      return {
        strokeColor: strokeColor,
        strokeWeight: strokeWeight,
        strokeOpacity: 0.5,
        title: name,
      };
    } else if (geo.isPath(f)) {
      var strokeColor, strokeWeight;
      if(isSelected){ strokeColor='#00AAAA'; strokeWeight=5; }
      else if(isHovered){ strokeColor='#00FFFF'; strokeWeight=10; }
      else{ strokeColor='#0000FF'; strokeWeight=2; }
      return {
        strokeColor: strokeColor,
        strokeWeight: strokeWeight,
        strokeOpacity: 0.5,
        title: name,
      };
    } else if (geo.isTower(f)){
      var icon;
      if(isSelected){ icon='/map/tower_selected.png'; }
      else if(isHovered){ icon='/map/tower_hovered.png'; }
      else{ icon='/map/tower.png'; }
      return {
        icon: icon,
        visible: true,
        clickable: true,
        title: name,
      };
    }
  });

  map.loadData();

  window.map=map;
};

// router

var initRouter=function(){
  app=router.initApplication({map:map,toolbar:toolbarElement,sidebar:sidebarElement});

  app.addPage('root', pages.home());
  app.addPage('edit_path', pages.edit_path());
  app.addPage('edit_point', pages.edit_point());

  app.openPage('root');
};

},{"./api":1,"./pages":17,"./pages/geo":15,"./router":18,"./ui":24}],7:[function(require,module,exports){
var app=require('./app');

app.start();
},{"./app":6}],8:[function(require,module,exports){
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

},{"../api":1,"../ui":24,"./forms":10,"./geo":15}],9:[function(require,module,exports){
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
    }

    canEdit= !sent;
    if(!sent){ form.setModel(model); }
  };

  var cancelAction=function(){
    marker.setMap(null);
    var feature=getFeature();
    if(feature){ map.data.add(feature); }
    self.openPage('root');
  };

  var form1=forms.tower.form({save_action:saveAction, cancel_action:cancelAction});
  var form2=forms.office.form({save_action:saveAction, cancel_action:cancelAction});
  formLayout=ui.layout.card({children: [form1, form2]});
  formLayout.openType=function(type){
    if(geo.isTower(type)){ formLayout.showAt(0); }
    else if(geo.isOffice(type)){ formLayout.showAt(1); }
    else if(geo.isOffice(type)){ formLayout.showAt(2); }
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

},{"../api":1,"../ui":24,"./forms":10,"./geo":15}],10:[function(require,module,exports){
var path=require('./path')
  , line=require('./line')
  , tower=require('./tower')
  , office=require('./office')
  ;

exports.path=path;
exports.line=line;
exports.tower=tower;
exports.office=office;
},{"./line":11,"./office":12,"./path":13,"./tower":14}],11:[function(require,module,exports){
var ui=require('../../ui')
  ;

exports.form=function(opts){
  var save_f=opts.save_action;
  var cancel_f=opts.cancel_action;

  var saveAction={label: 'ხაზის შენახვა', icon:'save', type:'success', action: save_f};
  var cancelAction={label:'გაუმება', icon:'times-circle', action: cancel_f};

  var nameText=ui.form.textField('name', {label: 'სახელი'});
  var directionText=ui.form.textField('direction', {label: 'მიმართულება'});
  var regionsCombo=ui.form.comboField('region_id', {label: 'რეგიონი', collection_url: '/regions.json', text_property: 'name'});
  var descriptionText=ui.form.textArea('description', {label: 'შენიშვნა'});

  var fields=[nameText,directionText,regionsCombo,descriptionText];
  var actions=[saveAction,cancelAction];

  var form=ui.form.create(fields,{actions: actions,load_url:'/api/lines/show.json'});
  return form;
};
},{"../../ui":24}],12:[function(require,module,exports){
var ui=require('../../ui')
  ;

exports.form=function(opts){
  var save_f=opts.save_action;
  var cancel_f=opts.cancel_action;

  var saveAction={label: 'ოფისის შენახვა', icon:'save', type:'success', action: save_f};
  var cancelAction={label:'გაუმება', icon:'times-circle', action: cancel_f};

  var nameText=ui.form.textField('name', {label: 'სახელი'});
  var addressText=ui.form.textField('address', {label: 'მისამართი'});
  var regionsCombo=ui.form.comboField('region_id', {label: 'რეგიონი', collection_url: '/regions.json', text_property: 'name'});
  var descriptionText=ui.form.textArea('description', {label: 'შენიშვნა'});

  var fields=[nameText, addressText, regionsCombo, descriptionText];
  var actions=[saveAction,cancelAction];

  var form=ui.form.create(fields,{actions: actions,load_url:'/api/offices/show.json'});
  return form;
};

},{"../../ui":24}],13:[function(require,module,exports){
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
  var regionsCombo=ui.form.comboField('region_id', {label: 'რეგიონი', collection_url: '/regions.json', text_property: 'name'});

  var fields=[typeCombo, surfaceCombo, detailsCombo,nameText,descriptionText,regionsCombo];
  var actions=[saveAction,cancelAction];

  var form=ui.form.create(fields,{actions: actions, load_url:'/api/paths/show.json'});
  return form;
};
},{"../../ui":24}],14:[function(require,module,exports){
var ui=require('../../ui')
  ;

exports.form=function(opts){
  var save_f=opts.save_action;
  var cancel_f=opts.cancel_action;

  var saveAction={label: 'ანძის შენახვა', icon:'save', type:'success', action: save_f};
  var cancelAction={label:'გაუმება', icon:'times-circle', action: cancel_f};

  var nameText=ui.form.textField('name', {label: 'სახელი'});
  var categoryText=ui.form.textField('category', {label: 'ტიპი'});
  var regionsCombo=ui.form.comboField('region_id', {label: 'რეგიონი', collection_url: '/regions.json', text_property: 'name'});
  var descriptionText=ui.form.textArea('description', {label: 'შენიშვნა'});

  var fields=[nameText,categoryText,regionsCombo,descriptionText];
  var actions=[saveAction,cancelAction];

  var form=ui.form.create(fields,{actions: actions,load_url:'/api/towers/show.json'});
  return form;
};

},{"../../ui":24}],15:[function(require,module,exports){
exports.resetMap=function(map){
  google.maps.event.clearInstanceListeners(map);
  google.maps.event.clearInstanceListeners(map.data);
  map.data.revertStyle();
};

exports.copyFeatureToPath=function(feature,path){
  var g=feature.getGeometry();
  var ary=g.getArray();
  path.getPath().clear();
  for(var i=0,l=ary.length;i<l;i++){
    var p=ary[i];
    var point=new google.maps.LatLng(p.lat(),p.lng());
    path.getPath().push(point);
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
exports.TYPE_SUBSTATION='Object::Substation';

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
exports.isTower=function(f){ return typed(f,function(type){ return exports.TYPE_TOWER==type; }); }
exports.isOffice=function(f){ return typed(f,function(type){ return exports.TYPE_OFFICE==type; }); }
exports.isSubstation=function(f){ return typed(f,function(type){ return exports.TYPE_SUBSTATION==type; }); }

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
    property('რეგიონი',f.getProperty('region')),
    property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

var towerDescription=function(map,f){
  var point=f.getGeometry().get();
  return [
    property('ანძის#',f.getProperty('name')),
    property('ტიპი',f.getProperty('category')),
    property('რეგიონი',f.getProperty('region')),
    property('განედი','<code>'+point.lat()+'</code>'),
    property('გრძედი','<code>'+point.lng()+'</code>'),
    property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

var officeDescription=function(map,f){
  var point=f.getGeometry().get();
  return [
    property('დასახელება',f.getProperty('name')),
    property('რეგიონი',f.getProperty('region')),
    property('მისამართი',f.getProperty('address')),
    property('განედი','<code>'+point.lat()+'</code>'),
    property('გრძედი','<code>'+point.lng()+'</code>'),
    property('შენიშვნა',f.getProperty('description')),
  ].join('');
};

exports.featureDescription=function(map,f){
  var bodyDescription;

  var texts=['<div class="panel panel-default">'];
  texts.push('<div class="panel-heading"><h4 style="margin:0;padding:0;">',exports.typeName(f),'</h4></div>');
  if(exports.isLine(f)){ bodyDescription=lineDescription(map,f); }
  else if(exports.isPath(f)){ bodyDescription=lineDescription(map,f); }
  else if(exports.isTower(f)){ bodyDescription=towerDescription(map,f); }
  else if(exports.isOffice(f)){ bodyDescription=officeDescription(map,f); }
  texts.push('<div class="panel-body">',bodyDescription,'</div>');
  texts.push('</div>');
  return texts.join('');
};

},{}],16:[function(require,module,exports){
var ui=require('../ui')
  , api=require('../api')
  , geo=require('./geo')
  ;

var MAIN=0    // main page
  , CONFIRM=1 // confirm page
  ;

var map
  , uiInitialized=false, locked
  , layout, page1, page2, toolbar=ui.button.toolbar([])
  , featureInfo=ui.html.p('',{style:'margin:16px 0;'})
  , selectedFeature
  , secondaryToolbar=ui.button.toolbar([])
  , btnNewPath, btnNewLine, btnNewTower // new objects
  , btnDelete, btnEdit // change objects
  , confirmTitle=ui.html.p('საჭიროა დასტური',{class: 'page-header', style: 'font-weight:bold; font-size: 1.2em;'})
  , confirmText=ui.html.p('დაადასტურეთ, რომ ნამდვილად გინდათ მონიშნული ობიექტის წაშლა?',{class: 'text-danger'})
  , toolbar2=ui.button.toolbar([])
  ;

module.exports=function(){
  return {
    onEnter: function(){
      var self=this;
      locked=false;

      if (!uiInitialized){
        initUI(self);
        layout=ui.layout.card({children: [page1,page2]});
      }

      map=self.map;
      initMap();
      resetFeatureInfo();

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
  btnNewPath=ui.button.actionLink('მარშუტი', function(){
    if(!locked){ self.openPage('edit_path',{type:geo.TYPE_PATH}); }
  });
  btnNewLine=ui.button.actionLink('გადამცემი ხაზი', function(){
    if(!locked){ self.openPage('edit_path',{type:geo.TYPE_LINE}); }
  });
  btnNewTower=ui.button.actionLink('ანძა', function(){
    if(!locked){ self.openPage('edit_point',{type:geo.TYPE_TOWER}); }
  });

  var buttons=[btnNewPath,btnNewLine,{divider:true},btnNewTower];
  var newObjects=ui.button.dropdown('ახალი ობიექტი',buttons, {type:'success'});  

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

  toolbar.addButton(newObjects);

  var titleElement=ui.html.pageTitle('საწყისი');
  page1=ui.layout.vertical({
    children: [
      titleElement,
      toolbar,
      featureInfo,
      secondaryToolbar,
    ]
  });
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

var resetFeatureInfo=function(){
  secondaryToolbar.clearButtons();
  if(!selectedFeature){
    featureInfo.setHtml('მონიშნეთ ობიექტი რუკაზე მასზე ინფორმაციის მისაღებად.');
  } else{
    featureInfo.setHtml(geo.featureDescription(map,selectedFeature));
    secondaryToolbar.addButton(btnEdit);
    secondaryToolbar.addButton(btnDelete);
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

var changeSelection=function(f){
  if(f==selectedFeature){
    f.selected=false;
    selectedFeature=null;
  } else {
    if(selectedFeature){
      selectedFeature.selected=false;
      map.data.revertStyle(selectedFeature);
    }
    selectedFeature=f;
    f.selected=true;
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
};

},{"../api":1,"../ui":24,"./geo":15}],17:[function(require,module,exports){
var home=require('./home')
  , edit_path=require('./edit_path')
  , edit_point=require('./edit_point')
  ;

exports.home=home;
exports.edit_path=edit_path;
exports.edit_point=edit_point;
},{"./edit_path":8,"./edit_point":9,"./home":16}],18:[function(require,module,exports){
var map
  , sidebar
  , toolbar
  , currentPage
  , pages={}
  ;

exports.initApplication=function(opts){
  map=opts.map;
  toolbar=opts.toolbar;
  sidebar=opts.sidebar;
  return {
    addPage: addPage,
    openPage: openPage,
  };
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

  currentPage.map=map;

  if(currentPage){
    currentPage.params=params;
    if(currentPage.onEnter){
      var pageLayout=currentPage.onEnter();
      sidebar.appendChild(pageLayout);
    }
    if(currentPage.onStart){
      currentPage.onStart();
    }
  }
};

},{}],19:[function(require,module,exports){
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
},{"./html":23,"./utils":26}],20:[function(require,module,exports){
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
    _innerElement=html.el('input', attributes);
    return _innerElement;
  });

  textField.getName=function(){return name;}
  textField.getValue=function(){ return _innerElement.value; };
  textField.setValue=function(val){ _innerElement.value=(val||''); };
  textField.applyModel=function(model){ applyModelForSimpleField(textField,model); }
  textField.setModel=function(model){ setModelForSimpleField(textField,model); }

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
},{"../html":23}],21:[function(require,module,exports){
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

},{"../button":19,"../html":23}],22:[function(require,module,exports){
var form=require('./form')
  , field=require('./field')
  ;

exports.create=form;
exports.textField=field.textField;
exports.comboField=field.comboField;
exports.textArea=field.textArea;
},{"./field":20,"./form":21}],23:[function(require,module,exports){
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

},{"./utils":26}],24:[function(require,module,exports){
var button=require('./button')
  , layout=require('./layout')
  , html=require('./html')
  , form=require('./form')
  ;

exports.html=html;
exports.button=button;
exports.layout=layout;
exports.form=form;
},{"./button":19,"./form":22,"./html":23,"./layout":25}],25:[function(require,module,exports){
var html=require('./html')
 ;

/**
 * Vertical layout.
 */
exports.vertical=function(opts){
  var layout
    , childElements=[]
    ;

  if(opts.parent){ layout=html.el(opts.parent,'div',{class:'vertical-layout'}); }
  else { layout=html.el('div',{class:'vertical-layout'}); }

  var addToLayout=function(child){
    var childElement=html.el(layout,'div',[child]);
    childElements.push(childElement);
  };

  if(opts.children){
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
},{"./html":23}],26:[function(require,module,exports){
exports.isArray=function(x){ return x && (x instanceof Array); };
exports.isElement=function(x){ return x && ((x instanceof Element) || (x instanceof Document)); }
exports.fieldValue=function(object,name){ return object&&object[name]; };
},{}]},{},[7])