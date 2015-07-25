# -*- encoding : utf-8 -*-
class Api::FidersController < ApiController
  
  def info
    @fider = Objects::Fider.find(params[:id])

    render layout: false
  end
end
