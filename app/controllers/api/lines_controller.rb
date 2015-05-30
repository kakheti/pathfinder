# -*- encoding : utf-8 -*-
class Api::LinesController < ApiController
  def index
    puts params
    if params["bounds"] then
      lines = Objects::Line.where(within_bounds(params["bounds"]))
      lines += Objects::Fider.where(within_bounds(params["bounds"])).map{|x| x.lines}.flatten if params["fiders"]
    else
      lines = Objects::Line.all
      lines += Objects::Fider.all.map{|x| x.lines}.flatten if params["fiders"]
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
  
  def info
    @line = Objects::Line.find(params[:id])
    render layout: false
  end
end
