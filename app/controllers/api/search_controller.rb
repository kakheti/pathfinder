# -*- encoding : utf-8 -*-
class Api::SearchController < ApiController
  def index
    filters = params.select { |key, value|
      %w(region_id).include?(key) && value.length > 0
    }

    type = params["type"].to_sym unless params["type"].nil?

    object_types = {
      line: Objects::Line,
      pole: Objects::Pole,
      substation: Objects::Substation,
      tower: Objects::Tower,
      tp: Objects::Tp,
      fider: Objects::Fider,
      office: Objects::Office
    }

    if !object_types[type].nil? then
      objects = object_types[type].all(filters)
      objects = objects.full_text_search(params["name"]) if params["name"] && params["name"].length > 0
      
      render json: (objects.map do |object|
      { id: object.id.to_s, lat: object.lat, lng: object.lng, name: object.name, type: params['type'] }
    end)
    else
      render json: []
    end
  end
end
