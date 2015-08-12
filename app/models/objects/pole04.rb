# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Pole04
  include Mongoid::Document
  include Mongoid::Search
  include Objects::Coordinate
  include Objects::Kml

  field :kmlid, type: String
  field :name, type: String
  field :number, type: String
  field :height, type: Float
  field :pole_type, type: String
  field :description, type: String
  field :vertical_position, type: String
  field :oldness, type: String
  field :ankeruli, type: String
  field :lampioni, type: String
  field :owner, type: String
  field :internet, type: String
  field :street_light, type: String

  belongs_to :region
  belongs_to :fider, class_name: 'Objects::Fider04'
  belongs_to :tp, class_name: 'Objects::Tp'

  search_in :name, :description, :fider, :tp => 'name'

  index({ name: 1 })
  index({ region_id: 1 })
  index({ fider_id: 1 })

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse ; root=doc.child
    kmlns="kml:#{KMLNS}"
    placemarks=doc.child.find '//kml:Placemark',kmlns
    placemarks.each do |placemark|
      id = placemark.attributes['id']
      obj = Objects::Pole04.where(kmlid:id).first || Objects::Pole04.create(kmlid:id)
      # start description section
      descr = placemark.find('./kml:description',kmlns).first.content
      obj.name = Objects::Kml.get_property(descr, 'ბოძის იდენტიფიკატორი')
      obj.number = Objects::Kml.get_property(descr, 'ბოძის ნომერი')
      obj.height = Objects::Kml.get_property(descr, 'ბოძის სიმაღლე').to_f
      obj.pole_type = Objects::Kml.get_property(descr, 'ბოძის ტიპი').to_ka(:all)
      obj.ankeruli = Objects::Kml.get_property(descr, 'ანკერული').to_ka(:all)
      obj.oldness = Objects::Kml.get_property(descr, 'ხარისხრობრივი მდგომარეობა').to_ka(:all)
      obj.vertical_position = Objects::Kml.get_property(descr, 'ვერტიკალური მდგომარეობა').to_ka(:all)
      obj.owner = Objects::Kml.get_property(descr, 'მესაკუთრე').to_ka(:all)
      obj.lampioni = Objects::Kml.get_property(descr, 'ლამპიონის სამაგრი').to_ka(:all)
      obj.internet = Objects::Kml.get_property(descr, 'ინტერნეტი').to_ka(:all)
      obj.street_light = Objects::Kml.get_property(descr, 'გარე განათება').to_ka(:all)

      tpnumber = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ნომერი')
      obj.tp = Objects::Tp.by_name(tpnumber) if tpnumber.present?

      fidername = Objects::Kml.get_property(descr, 'ფიდერი')
      obj.fider = Objects::Fider04.by_name(fidername.to_ka(:all)) if fidername.present?

      description = Objects::Kml.get_property(descr, 'Note_')
      obj.description = description.to_ka(:all) if description.present?

      obj.region = obj.tp.region if obj.tp.present?

      # end of description section
      coord = placemark.find('./kml:Point/kml:coordinates',kmlns).first.content
      obj.set_coordinate(coord)
      obj.save
    end
  end
end
