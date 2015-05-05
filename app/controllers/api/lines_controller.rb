# -*- encoding : utf-8 -*-
class Api::LinesController < ApiController
  def index
    if params["bounds"] then
      lines = Objects::Line.where(within_bounds(params["bounds"])) #+ Objects::Fider.where(within_bounds(params["bounds"])).map{|x| x.lines}.flatten
    else
      lines = Objects::Line.all #+ Objects::Fider.all.map{|x| x.lines}.flatten
    end

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
