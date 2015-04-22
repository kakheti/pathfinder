# -*- encoding : utf-8 -*-
class Api::SearchController < ApiController
  def index
    filters = params.select { |key, value|
      %w(description switch traverse_type name).include? key
    }

    type = params["type"].to_sym

    object_types = {
      "line": Objects::Line,
      "pole": Objects::Pole,
      "substation": Objects::Substation,
      "tower": Objects::Tower,
      "tp": Objects::Tp
    }

    if !object_types[type].nil? then
      objects = object_types[type].all(filters)
      render json: objects
    else
      render json: []
    end
  end
end
