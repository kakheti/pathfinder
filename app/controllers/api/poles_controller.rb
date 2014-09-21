# -*- encoding : utf-8 -*-
class Api::PolesController < ApiController
  def index
    poles = Objects::Pole.all
    render json: (poles.map do |pole|
      { id: pole.id.to_s, lat: pole.lat, lng: pole.lng }
    end)
  end

  def info
    @pole = Objects::Pole.find(params[:id])
    render layout: false
  end
end
