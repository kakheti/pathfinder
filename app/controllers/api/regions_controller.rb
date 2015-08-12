# -*- encoding : utf-8 -*-
class Api::RegionsController < ApiController
  def index
    regions = Region.all
    render json: (regions.map do |region|
      { id: region.id.to_s, name: region.name }
    end)
  end
end
