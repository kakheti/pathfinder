# -*- encoding : utf-8 -*-
class Api::FidersController < ApiController
  
  def info
    @line = Objects::Fider.where({ 'lines._id' => BSON::ObjectId.from_string(params[:id]) })[0]
    render layout: false
  end
end
