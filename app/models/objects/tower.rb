# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Tower
  include Mongoid::Document
  include Mongoid::Search
  include Objects::Coordinate
  include Objects::Kml

  field :kmlid, type: String
  field :name, type: String
  field :category, type: String
  field :description, type: String
  belongs_to :region
  belongs_to :line, class_name: 'Objects::Line'
  field :linename, type: String

  search_in :name, :line, :linename

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse
    kmlns="kml:#{KMLNS}"
    placemarks=doc.child.find '//kml:Placemark', kmlns
    placemarks.each do |placemark|
      id=placemark.attributes['id']
      name=placemark.find('./kml:name', kmlns).first.content
      # description content
      descr=placemark.find('./kml:description', kmlns).first.content
      regname = Objects::Kml.get_property(descr, 'რეგიონი')
      category = Objects::Kml.get_property(descr, 'ანძის ტიპი')
      category = nil if category == '&lt;Null&gt;'
      linename = Objects::Kml.get_property(descr, 'გადამცემი ხაზი')
      # end of description section
      if 'კახეთი' == regname
        coord=placemark.find('./kml:Point/kml:coordinates', kmlns).first.content
        obj=Objects::Tower.where(kmlid: id).first || Objects::Tower.create(kmlid: id)
        obj.name = name
        obj.region = Region.get_by_name(regname)
        obj.set_coordinate(coord)
        obj.category = category
        obj.line = Objects::Line.by_name(linename)
        obj.linename = linename
        obj.save
      end
    end
  end

  def self.rejoin_line(line)
    Objects::Tower.where(linename: line.name).each do |tower|
      tower.line = line
      tower.save
    end
  end
end
