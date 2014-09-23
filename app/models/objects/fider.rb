# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Fider
  include Mongoid::Document
  include Objects::Kml
  include Objects::LengthProperty

  field :name, type: String
  field :description, type: String
  belongs_to :region
  embeds_many :points, class_name: 'Objects::FiderPoint'

  def set_points(points)
    self.points.destroy_all
    points.each do |p|
      lat,lng=p[0],p[1]
      point=self.points.new(fider:self)
      point.lat=lat ; point.lng=lng
      point.save
    end
  end

  def self.by_name(name); Objects::Fider.where(name: name).first || Objects::Fider.create(name: name) end

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse ; root=doc.child
    kmlns="kml:#{KMLNS}"
    placemarks=doc.child.find '//kml:Placemark',kmlns
    fider = nil
    placemarks.each do |placemark|
      id = placemark.attributes['id']
      coords=placemark.find('./kml:MultiGeometry/kml:LineString/kml:coordinates',kmlns).first.content
      # description content
      descr=placemark.find('./kml:description',kmlns).first.content
      name = Objects::Kml.get_property(descr, 'ფიდერის დასახელება')
      region=Region.get_by_name('დედოფლისწყარო') # TODO
      # end of description section
      if fider.blank? or fider.name != name
        fider = Objects::Fider.by_name(name)
      end
      fider.region = region
      fider.save
      coords.split(' ').each do |coord|
        point = Objects::FiderPoint.new(fider: fider)
        point.set_coordinate(coord)
        point.save
      end
      fider.calc_length!
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
end

class Objects::FiderPoint
  include Mongoid::Document
  include Objects::Coordinate
  embedded_in :fider, class_name: 'Objects::Fider'
end
