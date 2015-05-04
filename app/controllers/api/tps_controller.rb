# -*- encoding : utf-8 -*-
class Api::TpsController < ApiController
  def index
    if params["bounds"] then
      tps = Objects::Tp.where(within_bounds(params["bounds"]))
    else
      tps = Objects::Tp.all
    end
    render json: (tps.map do |tp|
      { id: tp.id.to_s, lat: tp.lat, lng: tp.lng, name: tp.name }
    end)
  end

  def info
    @tp = Objects::Tp.find(params[:id])
    render layout: false
  end
end
