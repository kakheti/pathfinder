# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Fider04
  include Mongoid::Document
  include Mongoid::Search
  include Mongoid::Timestamps
  include Objects::Coordinate
  include Objects::Kml

  field :name, type: String
  field :description, type: String
  field :residential_count, type: Float
  field :comercial_count, type: Float
  field :usage_average, type: Float
  field :substation_number, type: String
  field :linename, type: String
  belongs_to :region
  belongs_to :substation, class_name: 'Objects::Substation'
  belongs_to :line, class_name: 'Objects::Line'
  embeds_many :lines, class_name: 'Objects::FiderLine'
  has_many :tps, class_name: 'Objects::Tp'
  has_many :poles, class_name: 'Objects::Pole'

  search_in :name, :description, :poles, :substation => 'name'

  index({ name: 1 })
  index({ region_id: 1 })

  def to_s; self.name end
  def self.by_name(name); Objects::Fider04.where(name: name).first || Objects::Fider04.create(name: name) end

  def make_summaries
    self.residential_count = self.tps.sum(:residential_count)
    self.comercial_count = self.tps.sum(:comercial_count)
    self.usage_average = self.tps.sum(:usage_average)
    self.save
  end

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse ; root=doc.child
    kmlns="kml:#{KMLNS}"
    placemarks=doc.child.find '//kml:Placemark',kmlns
    placemarks.each do |placemark|
      id = placemark.attributes['id']
      descr=placemark.find('./kml:description',kmlns).first.content
      name = Objects::Kml.get_property(descr, 'ფიდერი')
      fider = Objects::Fider04.by_name(name.to_ka(:all)) if name
      # add line
      line = Objects::Fider04Line.create(fider: fider)
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
      line.substation_number = Objects::Kml.get_property(descr, 'ქვესადგურის ნომერი')
      coords = placemark.find('./kml:MultiGeometry/kml:LineString/kml:coordinates',kmlns).first.content
      coords = coords.split(' ')
      coords.each do |coord|
        point = line.points.new(line: line)
        point.set_coordinate(coord)
        point.save
      end
      line.set_coordinate(coords[coords.size/2])
      line.calc_length!
      line.save
      # XXX how to get fider's region?
      fider.linename = Objects::Kml.get_property(descr, 'ელ, გადამცემი ხაზი')
      fider.line = Objects::Line.by_name(fider.linename)
      fider.set_coordinate(coords[coords.size/2])
      fider.region = line.region unless fider.region.present?
      fider.substation_number = line.substation_number unless fider.substation_number.present?
      fider.substation = Objects::Substation.where({ number: fider.substation_number }).first
      fider.save
    end
  end

  def length; self.lines.sum(:length) end
end

class Objects::Fider04Line
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

class Objects::Fider04Point
  include Mongoid::Document
  include Objects::Coordinate
  embedded_in :line, class_name: 'Objects::Fider04Line'
end
