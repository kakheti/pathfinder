# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Fider04
  include Mongoid::Document
  include Mongoid::Search
  include Mongoid::Timestamps
  include Objects::Coordinate
  include Objects::LengthProperty
  include Objects::Kml

  field :name, type: String
  field :description, type: String

  field :residential_count, type: Float
  field :comercial_count, type: Float
  field :usage_average, type: Float

  field :kmlid, type: String
  field :description, type: String
  field :start, type: String
  field :end, type: String
  field :direction, type: String
  field :cable_type, type: String
  field :sip, type: Integer
  field :owner, type: Integer
  field :state, type: String
  field :region_name, type: String
  field :substation_name, type: String
  field :fider_name, type: String
  field :tp_name, type: String

  belongs_to :region
  belongs_to :substation, class_name: 'Objects::Substation'
  belongs_to :tp, class_name: 'Objects::Tp'
  belongs_to :fider, class_name: 'Objects::Fider'
  belongs_to :direction, class_name: 'Objects::Direction04'

  embeds_many :points, class_name: 'Objects::Fider04Point'

  search_in :name, :tp_name, :direction

  index({name: 1})
  index({region_id: 1})

  def to_s
    self.name
  end

  def owner_s
    {
      1 => 'KED',
      2 => 'სხვა'
    }[owner]
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
    placemarks = doc.child.find '//kml:Placemark', kmlns
    placemarks.each do |placemark|
      #Direction04ExtractionWorker.perform_async(placemark.to_s)
      Direction04ExtractionWorker.new.perform(placemark.to_s)
    end
  end

  def set_points(points)
    self.points.destroy_all
    points.each do |p|
      lat, lng=p[0], p[1]
      point=self.points.new(line: self)
      point.lat=lat; point.lng=lng
      point.save
    end
  end
end

class Objects::Fider04Point
  include Mongoid::Document
  include Objects::Coordinate
  embedded_in :line, class_name: 'Objects::Fider04'
end
