# -*- encoding : utf-8 -*-
require 'xml'
require 'digest/sha1'

class Objects::Office
  include Mongoid::Document
  include Mongoid::Search
  include Objects::Coordinate
  include Objects::Kml

  field :_id, type: String

  field :name, type: String
  field :description, type: String
  field :address, type: String
  field :region_name, type: String
  belongs_to :region

  search_in :name, :description

  def self.from_kml(xml)
    parser = XML::Parser.string xml
    doc = parser.parse
    kmlns = "kml:#{KMLNS}"
    placemarks = doc.child.find '//kml:Placemark', kmlns
    placemarks.each do |placemark|
      name = placemark.find('./kml:name', kmlns).first.content
      logger.info("Uploading Office #{name}")

      # description content
      descr = placemark.find('./kml:description', kmlns).first.content
      regname = Objects::Kml.get_property(descr, 'მუნიციპალიტეტი').to_ka(:all)
      address = Objects::Kml.get_property(descr, 'ოფისის მისამართები')
      description = Objects::Kml.get_property(descr, 'შენიშვნა')
      # end of description section

      id = Digest::SHA1.hexdigest(regname + name)

      region = Region.get_by_name(regname)
      coord = placemark.find('./kml:Point/kml:coordinates', kmlns).first.content
      obj = Objects::Office.where(_id: id).first || Objects::Office.new(_id: id)
      obj.name = name.to_ka(:all)
      obj.region = region
      obj.region_name = regname
      obj.address = address.to_ka(:all) if address.present?
      obj.description = description.to_ka(:all)
      obj.set_coordinate(coord)
      obj.save
    end
  end

  def to_kml(xml)
    descr = "<p><strong>#{self.region}</strong>, #{self.address}</p><p>#{self.description}</p>"
    extra = extra_data('დასახელება' => name,
                       'შენიშვნა' => description,
                       'მისამართი' => address,
                       'მუნიციპალიტეტი' => region.to_s
    )
    xml.Placemark do
      xml.name self.name
      xml.description { xml.cdata! "#{ descr } <!-- #{ extra } -->" }
      xml.Point { xml.coordinates "#{self.lng},#{self.lat},#{self.alt||0}" }
    end
  end
end
