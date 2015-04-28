# -*- encoding : utf-8 -*-
class Api::SubstationsController < ApiController
  def index
    if params["bounds"] then
      bounds = params["bounds"].split(',')
      locs = [bounds[0].to_f, bounds[1].to_f], [bounds[2].to_f, bounds[3].to_f]
      substations = Objects::Substation.where(location: {'$within' => {'$box' => locs}})
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
