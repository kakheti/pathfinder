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
  belongs_to :region
  belongs_to :substation, class_name: 'Objects::Substation'
  belongs_to :fider, class_name: 'Objects::Fider'

  search_in :name, :description, :fider, :substation => 'name'

  index({ name: 1 })
  index({ region_id: 1 })
  index({ substation_id: 1 })
  index({ fider_id: 1 })

  def picture; "/tps/#{self.picture_id}.jpg" end

  def self.by_name(name)
    Objects::Tp.where(name: name).first
  end

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
      obj.region = Region.get_by_name(Objects::Kml.get_property(descr, 'მუნიციპალიტეტი').to_ka(:all))
      obj.city = Objects::Kml.get_property(descr, 'ქალაქი/დაბა/საკრებულო ქალაქი/დაბა/საკრებულო')
      obj.street = Objects::Kml.get_property(descr, 'ქუჩის დასახელება')
      obj.village = Objects::Kml.get_property(descr, 'სოფელი')
      obj.name = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ნომერი')
      obj.tp_type = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ტიპი')
      obj.picture_id = Objects::Kml.get_property(descr, 'სურათის ნომერი')
      obj.power = Objects::Kml.get_property(descr, 'სიმძლავრე').to_f
      obj.stores = Objects::Kml.get_property(descr, 'შენობის სართულიანობა')
      obj.count_high_voltage = Objects::Kml.get_property(descr, 'მაღალი ძაბვის ამომრთველი').to_i
      obj.count_low_voltage = Objects::Kml.get_property(descr, 'დაბალი ძაბვის ამომრთველი').to_i
      obj.owner = Objects::Kml.get_property(descr, 'მესაკუთრე')
      obj.address_code = Objects::Kml.get_property(descr, 'საკადასტრო კოდი')
      address = Objects::Kml.get_property(descr, 'მთლიანი მისამართი')
      obj.address = address.to_ka(:all) if address
      fidername = Objects::Kml.get_property(descr, 'ფიდერი')
      obj.fider = Objects::Fider.by_name(fidername.to_ka(:all)) if fidername.present?
      substation_name = Objects::Kml.get_property(descr, 'ქვესადგური')
      obj.substation = Objects::Substation.by_name(substation_name.to_ka(:all)) if substation_name.present?
      linename = Objects::Kml.get_property(descr, 'ელექტრო გადამცემი ხაზი')
      obj.linename = linename.to_ka(:all) if linename.present?
      obj.description = Objects::Kml.get_property(descr, 'შენიშვნა')
      # end of description section
      coord=placemark.find('./kml:Point/kml:coordinates',kmlns).first.content
      obj.set_coordinate(coord)
      obj.save
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
