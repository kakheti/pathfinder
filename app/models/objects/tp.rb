# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Tp
  include Mongoid::Document
  include Objects::Coordinate
  include Objects::Kml

  field :kmlid, type: String
  field :name, type: String
  field :description, type: String
  field :picture_id, type: String
  field :power, type: Float
  field :owner, type: String
  field :fider, type: String
  field :address_code, type: String
  field :address, type: String
  belongs_to :region

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse ; root=doc.child
    kmlns="kml:#{KMLNS}"
    placemarks=doc.child.find '//kml:Placemark',kmlns
    placemarks.each do |placemark|
      id=placemark.attributes['id']
      obj=Objects::Tp.where(kmlid:id).first || Objects::Tp.create(kmlid:id)
      # name=placemark.find('./kml:name',kmlns).first.content
      # start description section
      descr=placemark.find('./kml:description',kmlns).first.content
      obj.name = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ნომერი')
      obj.picture_id = Objects::Kml.get_property(descr, 'სურათის ნომერი')
      obj.power = Objects::Kml.get_property(descr, 'სიმძლავრე').to_f
      obj.owner = Objects::Kml.get_property(descr, 'მესაკუთრე')
      obj.fider = Objects::Kml.get_property(descr, 'ფიდერი')
      obj.address_code = Objects::Kml.get_property(descr, 'საკადასტრო კოდი')
      obj.address = Objects::Kml.get_property(descr, 'მთლიანი მისამართი').to_ka(:all)
      obj.description = Objects::Kml.get_property(descr, 'შენიშვნა')
      obj.region=Region.get_by_name('დედოფლისწყარო') # TODO
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
