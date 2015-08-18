# -*- encoding : utf-8 -*-
class Api::Pole04sController < ApiController
  def index
    if params["bounds"] then
      poles = Objects::Pole04.where(self.within_bounds(params["bounds"]))
    else
      poles = Objects::Pole04.all
    end
    render json: (poles.map do |pole|
      { id: pole.id.to_s, lat: pole.lat, lng: pole.lng, name: pole.name }
    end)
  end

  def info
    @pole = Objects::Pole04.find(params[:id])
    render layout: false
  end
end
