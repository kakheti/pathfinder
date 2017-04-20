# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Line
  include Mongoid::Document
  include Mongoid::Search
  include Objects::Kml
  include Objects::LengthProperty
  include Objects::Coordinate

  field :_id, type: String

  field :name, type: String
  field :direction, type: String
  field :description, type: String
  field :region_name, type: String
  belongs_to :region
  has_many :towers, class_name: 'Objects::Tower'
  embeds_many :points, class_name: 'Objects::LinePoint'

  search_in :name, :direction

  def to_s
    self.name
  end

  def set_points(points)
    self.points.destroy_all
    points.each do |p|
      lat, lng = p[0], p[1]

      point = self.points.new(line: self)
      point.lat = lat
      point.lng = lng
      point.save
    end
  end
end

class Objects::LinePoint
  include Mongoid::Document
  include Objects::Coordinate
  embedded_in :line, class_name: 'Objects::Line'
end
