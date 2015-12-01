# -*- encoding : utf-8 -*-
require 'xml'
require 'csv'

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
  field :isolators, type: Array, default: []
  field :traverse, type: Array, default: []
  field :counters, type: Array, default: []

  belongs_to :region
  belongs_to :tp, class_name: 'Objects::Tp'

  search_in :name, :description, :fider, :tp => 'name'

  index({ name: 1 })
  index({ region_id: 1 })

  def traverse_s
    str = ""
    str += "კაუჭისებრი #{traverse[1]}, " if !traverse[1].nil?
    str += "კუთხოვანა ერთმაგი #{traverse[2]}, " if !traverse[2].nil?
    str += "კუთხოვანა ორმაგი #{traverse[3]}, " if !traverse[3].nil?
    str += "სხვა #{traverse[4]}" if !traverse[4].nil?
  end

  def isolators_s
    str = ""
    str += "ფაიფური პატარა #{isolators[1]}, " if !isolators[1].nil?
    str += "ფაიფური დიდი #{isolators[2]}, " if !isolators[2].nil?
    str += "შუშა პატარა #{isolators[3]}, " if !isolators[3].nil?
    str += "შუშა დიდი #{isolators[4]}, " if !isolators[4].nil?
    str += "სხვა #{isolators[5]}" if !isolators[5].nil?
  end

  def counters_s
    str = ""
    str += "ერთიანი #{counters[1]}, " if !counters[1].nil?
    str += "ორიანი #{counters[2]}, " if !counters[2].nil?
    str += "სამიანი #{counters[3]}, " if !counters[3].nil?
    str += "ოთხიანი #{counters[4]}, " if !counters[4].nil?
    str += "ხუთიანი #{counters[5]}" if !counters[5].nil?
  end

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
      obj.name = Objects::Kml.get_property(descr, 'ბოძის id')
      obj.number = Objects::Kml.get_property(descr, 'ბოძის ნომერი')
      obj.height = Objects::Kml.get_property(descr, 'ბოძის სიმაღლე').to_f
      obj.pole_type = Objects::Kml.get_property(descr, 'ბოძის ტიპი', '').to_ka(:all)
      obj.ankeruli = Objects::Kml.get_property(descr, 'ანკერული', '').to_ka(:all)
      obj.oldness = Objects::Kml.get_property(descr, 'ხარისხრობრივი მდგომარეობა', '').to_ka(:all)
      obj.vertical_position = Objects::Kml.get_property(descr, 'ვერტიკალური მდგომარეობა', '').to_ka(:all)
      obj.owner = Objects::Kml.get_property(descr, 'მესაკუთრე', '').to_ka(:all)
      obj.lampioni = Objects::Kml.get_property(descr, 'ლამპიონის სამაგრი', '').to_ka(:all)
      obj.internet = Objects::Kml.get_property(descr, 'ინტერნეტი', '').to_ka(:all)
      obj.street_light = Objects::Kml.get_property(descr, 'გარე განათება', '').to_ka(:all)

      tpnumber = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ნომერი')
      obj.tp = Objects::Tp.by_name(tpnumber) if tpnumber.present?

      description = Objects::Kml.get_property(descr, 'Note_')
      obj.description = description.to_ka(:all) if description.present?

      obj.region = obj.tp.region if obj.tp.present?

      # end of description section
      coord = placemark.find('./kml:Point/kml:coordinates',kmlns).first.content
      obj.set_coordinate(coord)
      obj.save
    end
  end

  def self.from_csv(csv)
    CSV.parse(csv, :headers => true) do |row|
      id = row['Pole_id'].gsub(',','')
      quantity = row['Quantity'].to_i

      pole = Objects::Pole04.where({ :name => id }).first

      if !pole.nil? then
        if !row['Pole_T_type'].nil? then
          traverse_type = row['Pole_T_type'].to_i
          puts "Traverse #{traverse_type} #{quantity}"
          pole.traverse[traverse_type] = quantity
        elsif !row['Pole_i_type'].nil? then
          isolator_type = row['Pole_i_type'].to_i
          puts "Isolator #{isolator_type} #{quantity}"
          pole.isolators[isolator_type] = quantity
        elsif !row['Pole_co_type'].nil? then
          counter_type = row['Pole_co_type'].to_i
          puts "Counter #{counter_type} #{quantity}"
          pole.counters[counter_type] = quantity
        end
        pole.save
      end
    end
  end
end
