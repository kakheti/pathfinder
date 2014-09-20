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