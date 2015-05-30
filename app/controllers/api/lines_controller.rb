# -*- encoding : utf-8 -*-
class Api::LinesController < ApiController
  def index
    params["type"] = ["line"]

    lines = Api::SearchController.search(params)

    if params["fiders"] then
      params["type"] = ["fider"]
      fiders = Api::SearchController.search(params)
      fiders = fiders.map{|x| x.lines}.flatten
      lines += fiders
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
