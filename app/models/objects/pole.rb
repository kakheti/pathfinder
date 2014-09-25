# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Pole
  include Mongoid::Document
  include Objects::Coordinate
  include Objects::Kml

  field :kmlid, type: String
  field :name, type: String
  field :description, type: String
  field :height, type: Float
  field :fider, type: String
  belongs_to :region

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse ; root=doc.child
    kmlns="kml:#{KMLNS}"
    placemarks=doc.child.find '//kml:Placemark',kmlns
    placemarks.each do |placemark|
      id=placemark.attributes['id']
      obj=Objects::Pole.where(kmlid:id).first || Objects::Pole.create(kmlid:id)
      # name=placemark.find('./kml:name',kmlns).first.content
      # start description section
      descr=placemark.find('./kml:description',kmlns).first.content
      obj.name = Objects::Kml.get_property(descr, 'ბოძის ნომერი')
      obj.height = Objects::Kml.get_property(descr, 'ბოძის სიმაღლე').to_f
      obj.fider = Objects::Kml.get_property(descr, 'ფიდერის დასახელება').to_ka(:all)
      # obj.description = Objects::Kml.get_property(descr, 'შენიშვნა')
      obj.region = Region.get_by_name(Objects::Kml.get_property(descr, 'მუნიციპალიტეტი').to_ka(:all))
      # end of description section
      coord=placemark.find('./kml:Point/kml:coordinates',kmlns).first.content
      obj.set_coordinate(coord)
      obj.save
    end
  end

  def to_kml(xml)
    # descr = "<p><strong>#{self.region}</strong>, #{self.address}</p><p>#{self.description}</p>"
    # extra = extra_data( 'დასახელება' => name,
    #   'შენიშვნა' => description,
    #   'მისამართი' => address,
    #   'რაიონი' => region.to_s
    # )
    # xml.Placemark do
    #   xml.name self.name
    #   xml.description { xml.cdata! "#{ descr } <!-- #{ extra } -->" }
    #   xml.Point { xml.coordinates "#{self.lng},#{self.lat},#{self.alt||0}" }
    # end
  end
end
