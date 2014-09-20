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
