# -*- encoding : utf-8 -*-

class Objects::FiderLine
  include Mongoid::Document
  include Objects::Kml
  include Objects::LengthProperty
  include Objects::Coordinate

  field :kmlid, type: String
  field :description, type: String
  field :start, type: String
  field :end, type: String
  field :cable_type, type: Integer
  field :cable_area, type: Integer
  field :underground, type: String
  field :quro, type: String
  field :substation_number, type: String
  field :voltage, type: String
  field :linename, type: String
  field :region_name, type: String
  belongs_to :region
  belongs_to :fider,  class_name: 'Objects::Fider'
  embeds_many :points, class_name: 'Objects::FiderPoint'

  def info
    "ქვესადგური: #{substation_number}"
  end

  def cable_type_s
    {
      1 => 'ალუმინი',
      2 => 'ალუმინ-ფოლადი',
      3 => 'რკინა',
      4 => 'არასტანდარტული რკინა',
      5 => 'ტროსი',
    }[cable_type]
  end

  def cable_area_s
    {
      1 => '16',
      2 => '25',
      3 => '35',
      4 => '50',
      5 => '70',
      6 => '95',
      7 => '120',
      8 => '150',
    }[cable_area]
  end

  def underground_s
    {
      1 => 'ზეთოვანი',
      2 => 'მშრალი',
    }[underground]
  end

  def quro_s
    {
      1 => 'კი',
      2 => 'არა'
    }[quro]
  end

  def set_points(points)
    self.points.destroy_all
    points.each do |p|
      lat,lng=p[0],p[1]
      point=self.points.new(line:self)
      point.lat=lat ; point.lng=lng
      point.save
    end
  end
end

class Objects::FiderPoint
  include Mongoid::Document
  include Objects::Coordinate
  embedded_in :line, class_name: 'Objects::FiderLine'
end
