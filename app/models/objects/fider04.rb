# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Fider04
  include Mongoid::Document
  include Mongoid::Search
  include Mongoid::Timestamps
  include Objects::Coordinate
  include Objects::LengthProperty
  include Objects::Kml

  field :name, type: String
  field :description, type: String

  field :residential_count, type: Float
  field :comercial_count, type: Float
  field :usage_average, type: Float

  field :kmlid, type: String
  field :description, type: String
  field :start, type: String
  field :end, type: String
  field :direction, type: String
  field :cable_type, type: String
  field :sip, type: Integer
  field :owner, type: Integer
  field :state, type: String

  belongs_to :region
  belongs_to :substation, class_name: 'Objects::Substation'
  belongs_to :tp, class_name: 'Objects::Tp'
  belongs_to :direction, class_name: 'Objects::Direction04'

  embeds_many :points, class_name: 'Objects::Fider04Point'

  search_in :name, :description, :tp => :name

  index({name: 1})
  index({region_id: 1})

  def to_s;
    self.name
  end

  def self.by_name(name)
    ; Objects::Fider04.where(name: name).first || Objects::Fider04.create(name: name)
  end

  def make_summaries
    self.residential_count = self.tps.sum(:residential_count)
    self.comercial_count = self.tps.sum(:comercial_count)
    self.usage_average = self.tps.sum(:usage_average)
    self.save
  end

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse
    kmlns="kml:#{KMLNS}"
    placemarks = doc.child.find '//kml:Placemark', kmlns
    placemarks.each do |placemark|
      id = placemark.attributes['id']
      descr = placemark.find('./kml:description', kmlns).first.content

      line = Objects::Fider04.where(kmlid: id).first || Objects::Fider04.create(kmlid: id)

      line.name = placemark.find('./kml:name', kmlns).first.content
      line.start = Objects::Kml.get_property(descr, 'საწყისი ბოძი')
      line.end = Objects::Kml.get_property(descr, 'ბოძამდე')
      line.cable_type = Objects::Kml.get_property(descr, 'სადენის ტიპი').to_ka(:all)
      line.description = Objects::Kml.get_property(descr, 'შენიშვნა')
      line.sip = Objects::Kml.get_property(descr, 'SIP')
      line.owner = Objects::Kml.get_property(descr, 'მესაკუთრე')
      line.state = Objects::Kml.get_property(descr, 'სადენის მდგომარეობა')
      line.region = Region.get_by_name(Objects::Kml.get_property(descr, 'მუნიციპალიტეტი').to_ka(:all))

      tr_num = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ნომერი')
      line.tp = Objects::Tp.by_name(tr_num)

      line.substation = line.tp.substation if line.tp.present?

      dir_num = Objects::Direction04.decode(Objects::Kml.get_property(descr, 'მიმართულება'))
      line.direction = Objects::Direction04.get_or_create(dir_num, line.tp)

      coords = placemark.find('./kml:MultiGeometry/kml:LineString/kml:coordinates', kmlns).first.content
      coords = coords.split(' ')
      coords.each do |coord|
        point = line.points.new(line: line)
        point.set_coordinate(coord)
        point.save
      end
      line.set_coordinate(coords[coords.size/2])
      line.calc_length!
      line.save
    end
  end

  def set_points(points)
    self.points.destroy_all
    points.each do |p|
      lat, lng=p[0], p[1]
      point=self.points.new(line: self)
      point.lat=lat; point.lng=lng
      point.save
    end
  end
end

class Objects::Fider04Point
  include Mongoid::Document
  include Objects::Coordinate
  embedded_in :line, class_name: 'Objects::Fider04'
end
