# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Pole
  include Mongoid::Document
  include Mongoid::Search
  include Objects::Coordinate
  include Objects::Kml

  field :kmlid, type: String
  field :name, type: String
  field :height, type: Float
  field :number2, type: String
  field :pole_type, type: String
  field :traverse_type, type: String
  field :traverse_type2, type: String
  field :isolation_type, type: String
  field :switch, type: Integer
  field :switch_type, type: String
  field :vertical_position, type: String
  field :oldness, type: String
  field :should_be_out, type: String
  field :gps, type: String
  field :description, type: String
  field :linename, type: String

  belongs_to :region
  belongs_to :fider, class_name: 'Objects::Fider'
  belongs_to :substation, class_name: 'Objects::Substation'

  search_in :name, :description, :fider, :substation => 'name'

  index({ name: 1 })
  index({ region_id: 1 })
  index({ fider_id: 1 })
  index({ substation_id: 1 })

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse ; root=doc.child
    kmlns="kml:#{KMLNS}"
    placemarks=doc.child.find '//kml:Placemark',kmlns
    placemarks.each do |placemark|
      id = placemark.attributes['id']
      obj = Objects::Pole.where(kmlid:id).first || Objects::Pole.create(kmlid:id)
      # start description section
      descr = placemark.find('./kml:description',kmlns).first.content
      obj.name = Objects::Kml.get_property(descr, 'ბოძის ნომერი')
      obj.number2 = Objects::Kml.get_property(descr, 'ბოძის პირობითი ნომერი')
      obj.height = Objects::Kml.get_property(descr, 'ბოძის სიმაღლე').to_f
      obj.pole_type = Objects::Kml.get_property(descr, 'ბოძის ტიპი')
      obj.traverse_type = Objects::Kml.get_property(descr, 'ტრავერსის ტიპი')
      obj.traverse_type2 = Objects::Kml.get_property(descr, 'ტრავერსის ტიპი 2')
      obj.isolation_type = Objects::Kml.get_property(descr, 'იზოლატორის ტიპი')
      obj.switch = Objects::Kml.get_property(descr, 'გამთიშველი').to_i
      obj.switch_type = Objects::Kml.get_property(descr, 'გამთიშველის ტიპი')
      obj.vertical_position = Objects::Kml.get_property(descr, 'ვერტიკალური მდგომარეობა')
      obj.oldness = Objects::Kml.get_property(descr, 'ცვეთის ხარისხი')
      obj.should_be_out = Objects::Kml.get_property(descr, 'გამოსატანია')
      obj.gps = Objects::Kml.get_property(descr, 'GPS')
      regname = Objects::Kml.get_property(descr, 'რაიონი')
      obj.region = Region.get_by_name(regname.to_ka(:all)) if regname.present?
      subname = Objects::Kml.get_property(descr, 'ქვესადგური')
      obj.substation = Objects::Substation.by_name(subname.to_ka(:all)) if subname.present?
      fidername = Objects::Kml.get_property(descr, 'ფიდერი')
      obj.fider = Objects::Fider.by_name(fidername.to_ka(:all)) if fidername.present?
      linename = Objects::Kml.get_property(descr, 'ელ. გადამცემი ხაზი')
      obj.linename = linename if linename.present?
      description = Objects::Kml.get_property(descr, 'შენიშვნა')
      obj.description = description.to_ka(:all) if description.present?
      # end of description section
      coord = placemark.find('./kml:Point/kml:coordinates',kmlns).first.content
      obj.set_coordinate(coord)
      obj.save
    end
  end

  def pole_type_s
    {
      '1' => 'ხე',
      '2' => 'რკინა-ბეტონი',
      '3' => 'რკინა',
      '4' => 'ხე, ბეტონის სამაგრით',
    }[pole_type]
  end

  def vertical_position_s
    {
      '1' => 'კარგი',
      '2' => 'გადახრილი',
      '3' => 'დაწვენილი',
      '4' => 'ავარიული',
    }[vertical_position]
  end

  def should_be_out_s
    {
      '1' => 'კი',
      '2' => 'არა',
    }[should_be_out]
  end

  def switch_s
    {
      1 => 'კი',
      2 => 'არა',
    }[switch]
  end

  def switch_type_s
    {
      '1' => 'რლნდ 10/100',
      '2' => 'რლნდ 10/250',
      '3' => 'რლნდ 10/400',
      '4' => 'რლნდ 6/100',
      '5' => 'რლნდ 6/250',
      '6' => 'რლნდ 6/400',
    }[switch_type]
  end

  def traverse_type_s
    {
      '1' => 'ორმაგი დამაგრების',
      '2' => 'ერთმაგი დამაგრების',
      '3' => 'ამაღლებული',
      '4' => 'კუთხური',
      '5' => 'შემოსაბრუნებელი',
      '6' => 'საკიდით',
    }[traverse_type]
  end

  def isolation_type_s
    {
      '1' => 'ფაიფური შფ10',
      '2' => 'მინის შს10',
      '3' => 'ფაიფურის შფ6',
      '4' => 'მინის შს6',
      '5' => 'საკიდი იზოლატორი',
    }[isolation_type]
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
