# -*- encoding : utf-8 -*-
class Api::SearchController < ApiController

  def self.search(params)
    object_types = {
      "line" => Objects::Line,
      "pole" => Objects::Pole,
      "substation" => Objects::Substation,
      "tower" => Objects::Tower,
      "tp" => Objects::Tp,
      "fider" => Objects::Fider,
      "office" => Objects::Office,
      "fider-line" => Objects::Fider
    }

    filters = params.select { |key, value|
      %w(region_id).include?(key) && value.length > 0
    }

    types = object_types.keys
    types = params["type"] unless params["type"].nil?

    all_objects = [];

    types.each do |type|
      if !object_types[type].nil? then
        objects = object_types[type].all(filters)
        if type == "fider-line" && params["bounds"] then
          objects = objects.where({lines: { "$elemMatch" => { points: { "$elemMatch" => within_bounds(params["bounds"])} }}})
          objects = objects.map { |obj| obj.lines }.flatten
        elsif params["bounds"]
          objects = objects.where(within_bounds(params["bounds"]))
        end
        objects = objects.full_text_search(params["name"]) if params["name"] && params["name"].length > 0
        all_objects.concat objects
      end
    end

    return all_objects
  end

  def index
    object_types = {
      "line" => Objects::Line,
      "pole" => Objects::Pole,
      "substation" => Objects::Substation,
      "tower" => Objects::Tower,
      "tp" => Objects::Tp,
      "fider" => Objects::Fider,
      "office" => Objects::Office,
      "fider-line" => Objects::FiderLine
    }
    objects = Api::SearchController.search(params)

    render json: (objects.map do |object|
      type = object_types.invert[object.class]

      { id: object.id.to_s, lat: object.lat, lng: object.lng, name: object.name, type: type }
    end)
  end
end
