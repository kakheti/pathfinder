# -*- encoding : utf-8 -*-
class Api::FiderlinesController < ApiController
  
  def info
    @line = Objects::Fider.where({
    	'lines._id' => BSON::ObjectId.from_string(params[:id])
    }).first().lines.find(params[:id])

    render layout: false
  end
end
