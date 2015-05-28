# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Fider
  include Mongoid::Document
  include Mongoid::Search
  include Mongoid::Timestamps
  include Objects::Coordinate
  include Objects::Kml

  field :name, type: String
  field :description, type: String
  belongs_to :region
  embeds_many :lines, class_name: 'Objects::FiderLine'
  has_many :tps, class_name: 'Objects::Tp'
  has_many :poles, class_name: 'Objects::Pole'

  search_in :name, :description

  index({ name: 1 })
  index({ region_id: 1 })

  def to_s; self.name end
  def self.by_name(name); Objects::Fider.where(name: name).first || Objects::Fider.create(name: name) end

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse ; root=doc.child
    kmlns="kml:#{KMLNS}"
    placemarks=doc.child.find '//kml:Placemark',kmlns
    placemarks.each do |placemark|
      id = placemark.attributes['id']
      descr=placemark.find('./kml:description',kmlns).first.content
      name = Objects::Kml.get_property(descr, 'ფიდერი')
      fider = Objects::Fider.by_name(name.to_ka(:all)) if name
      # add line
      line = Objects::FiderLine.create(fider: fider)
      line.start = Objects::Kml.get_property(descr, 'საწყისი ბოძი')
      line.end = Objects::Kml.get_property(descr, 'ბოძამდე')
      line.cable_type = Objects::Kml.get_property(descr, 'სადენის ტიპი')
      line.cable_area = Objects::Kml.get_property(descr, 'სადენის კვეთი')
      line.underground = Objects::Kml.get_property(descr, 'მიწისქვეშა კაბელი')
      line.quro = Objects::Kml.get_property(descr, 'ქურო')
      line.description = Objects::Kml.get_property(descr, 'შენიშვნა')
      line.region = Region.get_by_name Objects::Kml.get_property(descr, 'მუნიციპალიტეტი')
      line.voltage = Objects::Kml.get_property(descr, 'ფიდერის ძაბვა')
      line.linename = Objects::Kml.get_property(descr, 'ელ, გადამცემი ხაზი')
      coords = placemark.find('./kml:MultiGeometry/kml:LineString/kml:coordinates',kmlns).first.content
      coords = coords.split(' ')
      coords.each do |coord|
        point = line.points.new(line: line)
        point.set_coordinate(coord)
        point.save
      end
      line.calc_length!
      line.save
      # XXX how to get fider's region?
      fider.set_coordinate(coords[coords.size/2])
      fider.region = line.region unless fider.region.present?
      fider.save
    end
  end

  def to_kml(xml)
    # extra = extra_data('დასახელება' => name,
    #   'მიმართულება' => direction,
    #   'შენიშვნა' => description,
    #   'რაიონი' => region.to_s,
    #   'სიგრძე' => length
    # )
    # xml.Placemark(id: "ID_#{self.id.to_s}") do |xml|
    #   xml.name self.name
    #   xml.description "<p>#{self.name}, #{self.direction}</p> <!-- #{extra} -->"
    #   xml.MultiGeometry do |xml|
    #     xml.LineString do
    #       xml.extrude 0
    #       xml.altitudeMode 'clampedToGround'
    #       xml.coordinates ' ' + self.points.map{|p| [p.lng, p.lat, p.alt||0].join(',')}.join(' ')
    #     end
    #   end
    # end
  end

  def length; self.lines.sum(:length) end
end

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
  belongs_to :region
  embedded_in :fider,  class_name: 'Objects::Fider'
  embeds_many :points, class_name: 'Objects::FiderPoint'
  
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
