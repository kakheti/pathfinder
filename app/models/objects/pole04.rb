# -*- encoding : utf-8 -*-
require 'xml'
require 'csv'

class Objects::Pole04
  include Mongoid::Document
  include Mongoid::Search
  include Objects::Coordinate
  include Objects::Kml

  field :_id, type: String

  field :poleid, type: String
  field :name, type: String
  field :number, type: String
  field :height, type: Float
  field :direction, type: String
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
  field :region_name, type: String
  field :substation_name, type: String
  field :fider_name, type: String
  field :tp_name, type: String

  belongs_to :region
  belongs_to :tp, class_name: 'Objects::Tp'
  belongs_to :fider, class_name: 'Objects::Fider'
  belongs_to :direction04, class_name: 'Objects::Direction04'
  belongs_to :substation, class_name: 'Objects::Substation'

  search_in :name, :direction_name, :fider, :tp_name

  index({region_name: 1, tp_name: 1, fider_id: 1, name: 1})

  def info
    "მიმართულება: #{direction}; ჯიხურის #: #{tp_name};"
  end

  def traverse_s
    str = []
    str.push "კაუჭისებრი #{traverse[1]}" unless traverse[1].nil?
    str.push "კუთხოვანა ერთმაგი #{traverse[2]}" unless traverse[2].nil?
    str.push "კუთხოვანა ორმაგი #{traverse[3]}" unless traverse[3].nil?
    str.push "სხვა #{traverse[4]}" unless traverse[4].nil?
    str.join(', ')
  end

  def isolators_s
    str = []
    str.push "ფაიფური პატარა #{isolators[1]}" unless isolators[1].nil?
    str.push "ფაიფური დიდი #{isolators[2]}" unless isolators[2].nil?
    str.push "შუშა პატარა #{isolators[3]}" unless isolators[3].nil?
    str.push "შუშა დიდი #{isolators[4]}" unless isolators[4].nil?
    str.push "სხვა #{isolators[5]}" unless isolators[5].nil?
    str.join(', ')
  end

  def counters_s
    str = []
    str.push "ერთიანი #{counters[1]}"  unless counters[1].nil?
    str.push "ორიანი #{counters[2]}"   unless counters[2].nil?
    str.push "სამიანი #{counters[3]}"  unless counters[3].nil?
    str.push "ოთხიანი #{counters[4]}"  unless counters[4].nil?
    str.push "ხუთიანი #{counters[5]}"  unless counters[5].nil?
    str.push "ექვსიანი #{counters[6]}" unless counters[6].nil?
    str.push "შვიდიანი #{counters[7]}" unless counters[7].nil?
    str.push "ათიანი #{counters[8]}"   unless counters[8].nil?
    str.push "ცხრიანი #{counters[9]}"  unless counters[9].nil?
    str.push "სხვა #{counters[10]}"    unless counters[10].nil?
    str.join(', ')
  end

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse
    kmlns="kml:#{KMLNS}"
    placemarks=doc.child.find '//kml:Placemark', kmlns
    placemarks.each do |placemark|
      Pole04ExtractionWorker.perform_async(placemark.to_s)
      #Pole04ExtractionWorker.new.perform(placemark.to_s)
    end
  end

  def self.from_csv(csv)
    CSV.parse(csv, :headers => true) do |row|
      id = row['Pole_id'].gsub(',', '')
      pole = Objects::Pole04.where(poleid: id).first

      next unless pole
      quantity = row['Quantity'].to_i

      traverse_type = row['Pole_T_type']
      isolator_type = row['Pole_i_type']
      counter_type = row['Pole_co_type']

      pole.traverse[traverse_type.to_i] = quantity if traverse_type
      pole.isolators[isolator_type.to_i] = quantity if isolator_type
      pole.counters[counter_type.to_i] = quantity if counter_type

      pole.save
    end
  end
end
