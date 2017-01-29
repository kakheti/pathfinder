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
    'fider-line' => Objects::FiderLine,
    'fider04' => Objects::Fider04,
    'pole04' => Objects::Pole04,
  }

  def self.to_square(bounds)
    bounds = bounds.split(',')
    lat1 = bounds[0]
    lng1 = bounds[1]
    lat2 = bounds[2]
    lng2 = bounds[3]
    x1 = (lat1.to_f * 100).floor
    y1 = (lng1.to_f * 100).floor
    x2 = (lat2.to_f * 100).ceil
    y2 = (lng2.to_f * 100).ceil
    key = "lat1:#{x1}:lng1:#{y1}:lat2:#{x2}:lng2:#{y2}"
    bounds[0] = x1 / 100.0
    bounds[1] = y1 / 100.0
    bounds[2] = x2 / 100.0
    bounds[3] = y2 / 100.0
    [key, bounds]
  end

  def self.to_jsonable(objects)
    objects.map do |object|
      if object.is_a? Hash
        object
      else
        type = @@object_types.invert[object.class]
        type = 'fider' if type == 'fider-line'

        region = {name: object.region_name, id: object.region_id.to_s} if object.respond_to?(:region) && !object.region_id.nil?

        object.name = "\##{object.number} #{object.name}" if type == 'substation'

        {
          id: object.id.to_s,
          lat: object.lat,
          lng: object.lng,
          name: object.try(:name),
          region: region,
          info: object.try(:info),
          type: type
        }
      end
    end
  end

  def self.search(params, geojson = false)
    # Types we are searching in
    types = (params['type'] || @@object_types.keys) & @@object_types.keys

    all_objects = []

    types.each do |type|
      # Key for caching
      key = nil
      # Only cache if searching within bounds (and not by name)
      if params['bounds'] && !params['name']
        square = self.to_square(params['bounds'])
        bounds = square[1]
        if geojson
          key = "geodata:#{square[0]}:#{type}:geojson"
        else
          key = "geodata:#{square[0]}:#{type}"
        end
        cached = $redis.get(key)
        data = JSON.parse(cached) rescue nil
        if data
          # Filter data by region if specified
          if params['region'].present?
            data.select! { |obj|
              obj['region'] && obj['region']['id'] == params['region']
            }
          end

          # Append to output if array
          if data.kind_of? Array
            all_objects.push(*data)
          else
            all_objects.push(data)
          end

          next
        end
      end

      # Find all objects of type
      objects = @@object_types[type].all

      # Geo Filtering (within bounds)
      if type == 'fider04' || type == 'fider-line' && params['bounds']
        # Find lines where any point is inside bounds
        objects = objects.where({points: {'$elemMatch' => within_bounds(bounds)}})
      elsif !%w(line substation office).include?(type) && params['bounds']
        # Find objects within bounds
        objects = objects.where(within_bounds(bounds))
      end

      # Caching to Redis
      unless key.nil?
        if geojson
          # Store lines as GeoJSON
          $redis.set(key, Api::LinesController.to_geojson(objects).to_json)
        else
          # Store objects as JSON representation
          $redis.set(key, Api::SearchController.to_jsonable(objects).to_json)
        end
        # Expire cache in a hour
        $redis.expire(key, 1.hour)
      end

      # Filter by region (not doing this in db to allow caching all objects regardless of region)
      if params['region'].present?
        objects.select! { |obj|
          obj.region_id && obj.region_id.to_s == params['region']
        }
      end

      # Append all objects to output
      all_objects.push(*objects)
    end

    return all_objects
  end

  def self.search_by_name(params)
    filters = params.select { |key, value|
      %w(region).include?(key) && value.length > 0
    }

    types = (params['type'] || @@object_types.keys) & @@object_types.keys

    all_objects = []

    types.each do |type|
      objects = @@object_types[type].all(filters).full_text_search(params['name'], match: :all).limit(10)
      all_objects.push(*objects)
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
