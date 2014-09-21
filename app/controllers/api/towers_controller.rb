# -*- encoding : utf-8 -*-
class Api::TowersController < ApiController
  def index
    towers = Objects::Tower.all
    render json: (towers.map do |tower|
      { id: tower.id.to_s, lat: tower.lat, lng: tower.lng }
    end)
  end

  def info
    @tower = Objects::Tower.find(params[:id])
    render layout: false
  end
end
