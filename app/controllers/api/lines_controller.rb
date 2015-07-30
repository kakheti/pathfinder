# -*- encoding : utf-8 -*-
class Api::LinesController < ApiController
  def index
    params["type"] = ["line"]

    lines = Api::SearchController.search(params)

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
            class: line.class.name,
            name: line.name,
            latLng: { lat: line.lat, lng: line.lng }
          }
        }
      end
    }
  end

  def fiders
    params["type"] = ["fider-line"]
    fiders = Api::SearchController.search(params)
    #fiders = fiders.map{|x| x.lines}.flatten

    render json: {
      type: 'FeatureCollection',
      features: fiders.map do |line|
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: line.points.map{|p| [p.lng,p.lat] }
          },
          id: line.id.to_s,
          properties: {
            class: line.class.name,
            name: line.fider.name,
            latLng: { lat: line.lat, lng: line.lng }
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
