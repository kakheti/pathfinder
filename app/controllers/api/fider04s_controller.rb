# -*- encoding : utf-8 -*-
class Api::Fiders04Controller < ApiController

  def info
    @fider = Objects::Fider.find(params[:id])

    render layout: false
  end
end
