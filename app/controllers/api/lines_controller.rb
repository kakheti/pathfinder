# -*- encoding : utf-8 -*-
class Api::LinesController < ApiController
  def index
    lines = Objects::Fider.all + Objects::Line.all
    render json: {
      type: 'FeatureCollection',
      features: lines.map do |line|
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: line.points.map{|p| [p.lng,p.lat] }
          },
          id: line.id.to_s,
          properties: {
            class: line.class.name
          }
        }
      end
    }
  end
end
