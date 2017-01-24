# -*- encoding : utf-8 -*-
class Api::FiderlinesController < ApiController
  
  def info
    @line = Objects::FiderLine.where({
    	'_id' => BSON::ObjectId.from_string(params[:id])
    }).first

    render layout: false
  end
end
