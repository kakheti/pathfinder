# -*- encoding : utf-8 -*-
class Api::SearchController < ApiController
  @@object_types = {
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

  def self.to_square(lat, lng)
    x = (lat.to_f * 100).round
    y = (lng.to_f * 100).round
    "lat:#{x}:lng:#{y}"
  end

  def self.to_jsonable(objects)
    objects.map do |object|
      unless object.is_a? Hash
        type = @@object_types.invert[object.class]

        region = {name: object.region_name, id: object.region_id.to_s} if object.respond_to?(:region) && !object.region_id.nil?
        substation = {name: object.substation_name, id: object.substation_id.to_s} if object.respond_to?(:substation) && !object.substation_id.nil?
        line = {name: object.linename, id: object.line_id.to_s} if object.respond_to?(:line) && !object.line_id.nil?
        fider = {name: object.fider_name, id: object.fider_id.to_s} if object.respond_to?(:fider_id) && !object.fider_id.nil?
        tp = {name: object.tp_name, id: object.tp_id.to_s} if object.respond_to?(:tp) && !object.tp_id.nil?

        object.name = "\##{object.number} #{object.name}" if type == 'substation'

        {
          id: object.id.to_s,
          lat: object.lat,
          lng: object.lng,
          name: object.try(:name),
          region: region,
          substation: substation,
          line: line,
          fider: fider,
          tp: tp,
          type: type}
      else
        object
      end
    end
  end

  def self.search(params, geojson = false)
    types = ( params['type'] || @@object_types.keys ) & @@object_types.keys

    all_objects = []

    types.each do |type|
      key = nil
      if params['bounds'] && !params['name']
        bounds_split = params['bounds'].split(',')
        square = self.to_square(bounds_split[0], bounds_split[1])
        if geojson
          key = "geodata:#{square}:#{type}:geojson"
        else
          key = "geodata:#{square}:#{type}"
        end
        cached = $redis.get(key)
        data = JSON.parse(cached) rescue nil
        if data
          if params['region_id']
            data.select! { |obj|
              obj['region'] && obj['region']['id'] == params['region_id']
            }
          end
          all_objects.concat(data)
          next
        end
      end

      objects = @@object_types[type].all
      if type == 'fider-line' && params['bounds']
        objects = objects.where({lines: {'$elemMatch' => {points: {'$elemMatch' => within_bounds(params['bounds'])}}}})
        objects = objects.map { |obj| obj.lines }.flatten
      elsif type == 'fider04' && params['bounds']
        objects = objects.where({points: {'$elemMatch' => within_bounds(params['bounds'])}})
      elsif type != 'line' && params['bounds']
        objects = objects.where(within_bounds(params['bounds']))
      end

      unless key.nil?
        if geojson
          $redis.set(key, Api::LinesController.to_geojson(objects).to_json)
        else
          $redis.set(key, Api::SearchController.to_jsonable(objects).to_json)
        end
        $redis.expire(key, 1.hour)
      end

      if params['region_id']
        objects.select! { |obj|
          obj.region_id && obj.region_id.to_s == params['region_id']
        }
      end

      all_objects.concat objects
    end

    return all_objects
  end

  def self.search_by_name(params)
    filters = params.select { |key, value|
      %w(region_id).include?(key) && value.length > 0
    }

    types = ( params['type'] || @@object_types.keys ) & @@object_types.keys

    all_objects = []

    types.each do |type|
      objects = @@object_types[type].all(filters).full_text_search(params['name'], match: :all).limit(10)
      all_objects.concat objects
    end

    return all_objects
  end

  def index
    objects = Api::SearchController.search(params)

    render json: (Api::SearchController.to_jsonable objects)
  end

  def by_name
    objects = Api::SearchController.search_by_name(params)

    render json: (Api::SearchController.to_jsonable objects)
  end

end
