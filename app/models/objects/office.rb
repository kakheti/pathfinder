# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Office
  include Mongoid::Document
  include Objects::Coordinate
  include Objects::Kml

  field :kmlid, type: String
  field :name, type: String
  field :description, type: String
  field :address, type: String
  belongs_to :region

  def self.from_kml(xml)
    parser = XML::Parser.string xml
    doc = parser.parse ; root=doc.child
    kmlns = "kml:#{KMLNS}"
    placemarks = doc.child.find '//kml:Placemark',kmlns
    placemarks.each do |placemark|
      id = placemark.attributes['id']
      name = placemark.find('./kml:name',kmlns).first.content
      # description content
      descr = placemark.find('./kml:description',kmlns).first.content
      # regname = Objects::Kml.get_property(descr, 'რაიონი') ----> ???
      regname = Objects::Kml.get_property(descr, 'რეგიონი')
      address = Objects::Kml.get_property(descr, 'მისამართი')
      # end of description section
      region = Region.get_by_name(regname)
      coord = placemark.find('./kml:Point/kml:coordinates',kmlns).first.content
      obj = Objects::Office.where(kmlid:id).first || Objects::Office.create(kmlid:id)
      obj.name = name
      obj.region = region
      obj.address = address
      obj.set_coordinate(coord)
      obj.save
    end
  end

  def to_kml(xml)
    descr = "<p><strong>#{self.region}</strong>, #{self.address}</p><p>#{self.description}</p>"
    extra = extra_data( 'დასახელება' => name,
      'შენიშვნა' => description,
      'მისამართი' => address,
      'რაიონი' => region.to_s
    )
    xml.Placemark do
      xml.name self.name
      xml.description { xml.cdata! "#{ descr } <!-- #{ extra } -->" }
      xml.Point { xml.coordinates "#{self.lng},#{self.lat},#{self.alt||0}" }
    end
  end
end
