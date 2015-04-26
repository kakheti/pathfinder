# -*- encoding : utf-8 -*-
class Api::SearchController < ApiController
  def index
    filters = params.select { |key, value|
      %w(description switch traverse_type name).include? key
    }

    type = params["type"].to_sym unless params["type"].nil?

    object_types = {
      "line": Objects::Line,
      "pole": Objects::Pole,
      "substation": Objects::Substation,
      "tower": Objects::Tower,
      "tp": Objects::Tp,
      "fider": Objects::Fider,
      "office": Objects::Office
    }

    if !object_types[type].nil? then
      objects = object_types[type].all(filters)
      objects += object_types[type].full_text_search(filters["name"]) if filters["name"]
      render json: objects
    else
      render json: []
    end
  end
end
