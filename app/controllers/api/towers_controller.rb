# -*- encoding : utf-8 -*-
class Api::TowersController < ApiController
  def index
    if params["bounds"] then
      towers = Objects::Tower.where(self.within_bounds(params["bounds"]))
    else
      towers = Objects::Tower.all
    end
    render json: (towers.map do |tower|
      { id: tower.id.to_s, lat: tower.lat, lng: tower.lng, name: tower.name }
    end)
  end

  def info
    @tower = Objects::Tower.find(params[:id])
    render layout: false
  end
end
