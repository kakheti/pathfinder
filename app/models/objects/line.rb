# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Line
  include Mongoid::Document
  include Mongoid::Search
  include Objects::Kml
  include Objects::LengthProperty
  include Objects::Coordinate

  field :_id, type: String

  field :kmlid, type: String
  field :name, type: String
  field :direction, type: String
  field :description, type: String
  field :region_name, type: String
  belongs_to :region
  has_many :towers, class_name: 'Objects::Tower'
  embeds_many :points, class_name: 'Objects::LinePoint'

  search_in :name, :direction

  def to_s;
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

  def self.from_kml(xml)
    parser = XML::Parser.string xml
    doc = parser.parse
    kmlns = "kml:#{KMLNS}"
    placemarks = doc.child.find '//kml:Placemark', kmlns
    placemarks.each do |placemark|
      id = placemark.attributes['id']
      name = placemark.find('./kml:name', kmlns).first.content
      coords = placemark.find('./kml:MultiGeometry/kml:LineString/kml:coordinates', kmlns).first.content
      # description content
      descr = placemark.find('./kml:description', kmlns).first.content
      regname = Objects::Kml.get_property(descr, 'რეგიონი')
      direction = Objects::Kml.get_property(descr, 'მიმართულება')
      # end of description section

      region = Region.get_by_name(regname)
      line = Objects::Line.where(kmlid: id).first || Objects::Line.new(kmlid: id, _id: id)
      line.direction = direction
      line.region = region
      line.region_name = regname
      line.name = name.to_ka(:all) if name.present?
      line.save
      line.points.destroy_all
      coords = coords.split(' ')
      coords.each do |coord|
        point = line.points.new(line: line)
        point.set_coordinate(coord)
        point.save
      end
      line.set_coordinate(coords[coords.size/2])
      line.calc_length!
      line.save
      # rejoin relations
      Objects::Tower.rejoin_line(line)
    end
  end
end

class Objects::LinePoint
  include Mongoid::Document
  include Objects::Coordinate
  embedded_in :line, class_name: 'Objects::Line'
end
