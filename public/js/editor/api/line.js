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