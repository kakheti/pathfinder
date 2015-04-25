# -*- encoding : utf-8 -*-
class Api::SubstationsController < ApiController
  def index
    if params["bounds"] then
      bounds = params["bounds"].split(',')
      substations = Objects::Substation.within_box([bounds[0], bounds[1]], [bounds[2], bounds[3]])
    else
      substations = Objects::Substation.all
    end
    render json: (substations.map do |substation|
      { id: substation.id.to_s, lat: substation.lat, lng: substation.lng, name: substation.name }
    end)
  end

  def info
    @substation = Objects::Substation.find(params[:id])
    render layout: false
  end
end
