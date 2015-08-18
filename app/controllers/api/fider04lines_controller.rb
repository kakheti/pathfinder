# -*- encoding : utf-8 -*-
class Api::Fider04LinesController < ApiController

  def info
    @line = Objects::Fider04.where({
    	'lines._id' => BSON::ObjectId.from_string(params[:id])
    }).first().lines.find(params[:id])

    render layout: false
  end
end
