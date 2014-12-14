# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Fider
  include Mongoid::Document
  include Mongoid::Timestamps
  include Objects::Kml

  field :name, type: String
  field :description, type: String
  belongs_to :region
  embeds_many :lines, class_name: 'Objects::FiderLine'

  def self.from_kml(xml)
    # parser=XML::Parser.string xml
    # doc=parser.parse ; root=doc.child
    # kmlns="kml:#{KMLNS}"
    # placemarks=doc.child.find '//kml:Placemark',kmlns
    # placemarks.each do |placemark|
    #   id = placemark.attributes['id']
    #   obj=Objects::Fider.where(kmlid:id).first || Objects::Fider.create(kmlid:id)
    #   coords=placemark.find('./kml:MultiGeometry/kml:LineString/kml:coordinates',kmlns).first.content
    #   # description content
    #   descr=placemark.find('./kml:description',kmlns).first.content
    #   obj.name = Objects::Kml.get_property(descr, 'ფიდერის დასახელება').to_ka(:all)
    #   obj.start = Objects::Kml.get_property(descr, 'საწყისი ბოძი')
    #   obj.end = Objects::Kml.get_property(descr, 'ბოძამდე')
    #   obj.region = Region.get_by_name(Objects::Kml.get_property(descr, 'მუნიციპალიტეტი').to_ka(:all))
    #   # end of description section
    #   obj.points.destroy_all
    #   coords.split(' ').each do |coord|
    #     point=obj.points.new(fider: obj)
    #     point.set_coordinate(coord)
    #     point.save
    #   end
    #   obj.calc_length!
    # end
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

class Objects::FiderLine
  include Mongoid::Document
  include Objects::Kml
  include Objects::LengthProperty

  field :kmlid, type: String
  field :description, type: String
  field :start, type: String
  field :end, type: String
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
