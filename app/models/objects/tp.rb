# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Tp
  include Mongoid::Document
  include Mongoid::Search
  include Objects::Coordinate
  include Objects::Kml

  field :kmlid, type: String
  field :name, type: String
  field :description, type: String
  field :city, type: String
  field :street, type: String
  field :village, type: String
  field :tp_type, type: String
  field :picture_id, type: String
  field :power, type: Float
  field :stores, type: String
  field :owner, type: String
  field :address_code, type: String
  field :address, type: String
  field :residential_count, type: Integer, default: 0
  field :comercial_count, type: Integer, default: 0
  field :usage_average, type: Float, default: 0
  field :count_high_voltage, type: Integer
  field :count_low_voltage, type: Integer
  field :linename, type: String
  field :region_name, type: String
  field :substation_name, type: String
  field :fider_name, type: String
  belongs_to :region
  belongs_to :substation, class_name: 'Objects::Substation'
  belongs_to :fider, class_name: 'Objects::Fider'
  has_many :fider04s, class_name: 'Objects::Fider04'
  has_many :direction04s, class_name: 'Objects::Direction04'
  has_many :pole04s, class_name: 'Objects::Pole04'

  search_in :name, :description, :fider, :substation => 'name'

  index({name: 1})
  index({region_id: 1})
  index({substation_id: 1})
  index({fider_id: 1})

  def picture;
    "/tps/#{self.picture_id}.jpg"
  end

  def self.by_name(name)
    Objects::Tp.where(name: name).first || Objects::Tp.create(name: name)
  end

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse
    kmlns="kml:#{KMLNS}"
    placemarks=doc.child.find '//kml:Placemark', kmlns
    placemarks.each do |placemark|
      # TpExtractionWorker.perform_async(placemark.to_s)
      TpExtractionWorker.new.perform(placemark.to_s)
    end
  end

  def tp_type_s
    {
      '1' => 'ცრპ',
      '2' => 'ტპ',
      '3' => 'გკტპ',
      '4' => 'კტპ'
    }[tp_type]
  end

  def count_high_voltage_s
    {
      '1' => 'ვმგ',
      '2' => 'ვმპ',
      '3' => 'მექანიკური'
    }[count_high_voltage]
  end

  def count_low_voltage_s
    {
      '1' => 'ვმგ',
      '2' => 'ვმპ',
      '3' => 'მექანიკური'
    }[count_low_voltage]
  end

  def to_kml(xml)
    # descr = "<p><strong>#{self.region}</strong>, #{self.address}</p><p>#{self.description}</p>"
    # extra = extra_data( 'დასახელება' => name,
    #   'შენიშვნა' => description,
    #   'მისამართი' => address,
    #   'მუნიციპალიტეტი' => region.to_s
    # )
    # xml.Placemark do
    #   xml.name self.name
    #   xml.description { xml.cdata! "#{ descr } <!-- #{ extra } -->" }
    #   xml.Point { xml.coordinates "#{self.lng},#{self.lat},#{self.alt||0}" }
    # end
  end
end
