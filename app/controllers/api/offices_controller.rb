# -*- encoding : utf-8 -*-
class Api::OfficesController < ApiController
  def info
    @office = Objects::Office.find(params[:id])
    puts @office
    render layout: false
  end
end
