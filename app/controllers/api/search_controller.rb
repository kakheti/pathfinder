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
    x = ((lat.to_f - 41.21833)/10).round(2).to_s.gsub('.', '')
    y = ((lng.to_f - 43.761383)/10).round(2).to_s.gsub('.', '')
    "#{x}#{y}"
  end

  def self.to_jsonable(objects)
    objects.map do |object|
      unless object.is_a? Hash
        type = @@object_types.invert[object.class]

        region = { name: object.region_name, id: object.region_id.to_s } if object.respond_to?(:region) && !object.region_id.nil?
        substation = { name: object.substation_name, id: object.substation_id.to_s } if object.respond_to?(:substation) && !object.substation_id.nil?
        line = { name: object.linename, id: object.line_id.to_s } if object.respond_to?(:line) && !object.line_id.nil?
        fider = { name: object.fider_name, id: object.fider_id.to_s } if object.respond_to?(:fider_id) && !object.fider_id.nil?
        tp = { name: object.tp_name, id: object.tp_id.to_s } if object.respond_to?(:tp) && !object.tp_id.nil?

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
          type: type }
      else
        object
      end
    end
  end

  def self.search(params, geojson = false)
    filters = params.select { |key, value|
      %w(region_id).include?(key) && value.length > 0
    }

    types = @@object_types.keys
    types = params['type'] unless params['type'].nil?

    all_objects = []

    types.each do |type|
      unless @@object_types[type].nil?
        if params['bounds'] && !params['name']
          bounds_split = params['bounds'].split(',')
          square = self.to_square(bounds_split[0], bounds_split[1])
          cached = $redis.get(square+type)
          puts cached.inspect
          unless cached.nil?
            begin
              all_objects.concat JSON.parse(cached)
              break
            rescue
              $redis.del(square+type)
            end
          end
        end

        objects = @@object_types[type].all(filters)
        if type == 'fider-line' && params['bounds']
          objects = objects.where({lines: {'$elemMatch' => {points: {'$elemMatch' => within_bounds(params['bounds'])}}}})
          objects = objects.map { |obj| obj.lines }.flatten
        elsif type == 'fider04' && params['bounds']
          objects = objects.where({points: {'$elemMatch' => within_bounds(params['bounds'])}})
        elsif type != 'line' && params['bounds']
          objects = objects.where(within_bounds(params['bounds']))
        end
        objects = objects.full_text_search(params['name'], match: :all).limit(5) if params['name'] && params['name'].length > 0
        all_objects.concat objects

        if params['bounds'] && !params['name']
          bounds_split = params['bounds'].split(',')
          square = self.to_square(bounds_split[0], bounds_split[1])
          if geojson
            $redis.set(square+type, Api::LinesController.to_geojson(objects).to_json)
          else
            $redis.set(square+type, Api::SearchController.to_jsonable(objects).to_json)
          end
          $redis.expire(square+type, 3600)
        end
      end
    end

    return all_objects
  end

  def index
    objects = Api::SearchController.search(params)

    render json: (Api::SearchController.to_jsonable objects)
  end
end
