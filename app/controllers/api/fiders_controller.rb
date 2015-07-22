# -*- encoding : utf-8 -*-
class Api::FidersController < ApiController
  
  def info
    @line = Objects::Fider.where({
    	'lines._id' => BSON::ObjectId.from_string(params[:id])
    }).first().lines.find(params[:id])

    @fider = Objects::Fider.find(params[:id])

    render layout: false
  end
end
