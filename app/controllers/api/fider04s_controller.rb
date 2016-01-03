# -*- encoding : utf-8 -*-
class Api::Fider04sController < ApiController

  def info
    @fider = Objects::Fider04.find(params[:id])

    render layout: false
  end
end
