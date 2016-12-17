# -*- encoding : utf-8 -*-
class Api::LinesController < ApiController
  def self.to_geojson(lines)
    {
      type: 'FeatureCollection',
      features: lines.map do |line|
        if line.is_a?(Hash)
          if line['type'] == 'FeatureCollection'
            line['features']
          else
            line
          end
        else
          name = line.class.name == 'Objects::FiderLine' ? line.fider.name : line.name
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: line.points.map { |p| [p.lng, p.lat] }
            },
            id: line.id.to_s,
            properties: {
              class: line.class.name,
              name: name,
              latLng: {lat: line.lat, lng: line.lng}
            }
          }
        end
      end.flatten
    }
  end

  def index
    lines = Api::SearchController.search(params, true)

    render json: Api::LinesController.to_geojson(lines)
  end

  def info
    @line = Objects::Line.find(params[:id])
    render layout: false
  end
end
