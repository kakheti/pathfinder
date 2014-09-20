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