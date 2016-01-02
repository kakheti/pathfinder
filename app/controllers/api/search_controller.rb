# -*- encoding : utf-8 -*-
class Api::SearchController < ApiController

  def self.search(params)
    object_types = {
      'line' => Objects::Line,
      'pole' => Objects::Pole,
      'substation' => Objects::Substation,
      'tower' => Objects::Tower,
      'tp' => Objects::Tp,
      'fider' => Objects::Fider,
      'office' => Objects::Office,
      'fider-line' => Objects::Fider,
      'fider04' => Objects::Fider04,
      'pole04' => Objects::Pole04,
    }

    filters = params.select { |key, value|
      %w(region_id).include?(key) && value.length > 0
    }

    types = object_types.keys
    types = params['type'] unless params['type'].nil?

    all_objects = []

    types.each do |type|
      unless object_types[type].nil?
        objects = object_types[type].all(filters)
        if type == 'fider-line' && params['bounds']
          objects = objects.where({lines: {'$elemMatch' => {points: {'$elemMatch' => within_bounds(params['bounds'])}}}})
          objects = objects.map { |obj| obj.lines }.flatten
        elsif type == 'fider04' && params['bounds']
          objects = objects.where({points: {'$elemMatch' => within_bounds(params['bounds'])}})
        elsif type != 'line' && params['bounds']
          objects = objects.where(within_bounds(params['bounds']))
        end
        objects = objects.full_text_search(params["name"], match: :all).limit(5) if params['name'] && params['name'].length > 0
        all_objects.concat objects
      end
    end

    return all_objects
  end

  def index
    object_types = {
      'line' => Objects::Line,
      'pole' => Objects::Pole,
      'substation' => Objects::Substation,
      'tower' => Objects::Tower,
      'tp' => Objects::Tp,
      'fider' => Objects::Fider,
      'office' => Objects::Office,
      'fider-line' => Objects::FiderLine,
      'fider04' => Objects::Fider04,
      'pole04' => Objects::Pole04
    }
    objects = Api::SearchController.search(params)

    render json: (objects.map do |object|
      type = object_types.invert[object.class]

      region = { name: object.region_name, id: object.region_id.to_s } if object.respond_to?(:region) && !object.region_id.nil?
      substation = { name: object.substation_name, id: object.substation_id.to_s } if object.respond_to?(:substation) && !object.substation_id.nil?
      line = { name: object.linename, id: object.line_id.to_s } if object.respond_to?(:line) && !object.line_id.nil?
      fider = { name: object.fider_name, id: object.fider_id.to_s } if object.respond_to?(:fider) && !object.fider_id.nil?
      tp = { name: object.tp_name, id: object.tp_id.to_s } if object.respond_to?(:tp) && !object.tp_id.nil?

      object.name = "\##{object.number} #{object.name}" if type == 'substation'

      {
        id: object.id.to_s,
        lat: object.lat,
        lng: object.lng,
        name: object.name,
        region: region,
        substation: substation,
        line: line,
        fider: fider,
        tp: tp,
        type: type }
    end)
  end
end
