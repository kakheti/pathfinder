# -*- encoding : utf-8 -*-
require 'xml'
require 'digest/sha1'

class Objects::Substation
  include Mongoid::Document
  include Mongoid::Search
  include Objects::Coordinate
  include Objects::Kml

  field :_id, type: String

  field :number, type: String
  field :name, type: String
  field :description, type: String
  field :residential_count, type: Integer, default: 0
  field :comercial_count, type: Integer, default: 0
  field :usage_average, type: Float, default: 0
  field :region_name, type: String
  belongs_to :region
  has_many :tps, class_name: 'Objects::Tp'
  has_many :poles, class_name: 'Objects::Pole'
  has_many :fiders, class_name: 'Objects::Fider'
  has_many :fider04s, class_name: 'Objects::Fider04'
  has_many :direction04s, class_name: 'Objects::Direction04'
  has_many :pole04s, class_name: 'Objects::Pole04'

  search_in :name, :number

  def to_s
    self.name
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
    placemarks=doc.child.find '//kml:Placemark', kmlns
    placemarks.each do |placemark|
      name = placemark.find('./kml:name', kmlns).first.content

      logger.info("Uploading Substation #{name}")

      # description content
      descr = placemark.find('./kml:description', kmlns).first.content
      regname = Objects::Kml.get_property(descr, 'მუნიციპალიტეტი').to_ka(:all)
      region = Region.get_by_name(regname)
      description = Objects::Kml.get_property(descr, 'მესაკუთრე')
      number = Objects::Kml.get_property(descr, 'ქვესადგურის ნომერი')
      # end of description section

      id = Digest::SHA1.hexdigest(regname + number + name)

      coord = placemark.find('./kml:Point/kml:coordinates', kmlns).first.content
      obj = Objects::Substation.where(_id: id).first || Objects::Substation.new(_id: id)
      obj.name = name.to_ka(:all)
      obj.region = region
      obj.region_name = regname
      obj.description = description.to_ka(:all) if description.present?
      obj.number = number
      obj.set_coordinate(coord)
      obj.save
    end
  end

  def to_kml(xml)
    descr = "<p><strong>#{self.name}</strong></p><p>#{self.description}</p>"
    extra = extra_data('დასახელება' => name,
                       'შენიშვნა' => description,
                       'რეგიონი' => region.to_s
    )
    xml.Placemark do
      xml.name self.name
      xml.description { xml.cdata! "#{ descr } <!-- #{ extra } -->" }
      xml.Point { xml.coordinates "#{self.lng},#{self.lat},#{self.alt||0}" }
    end
  end
end
