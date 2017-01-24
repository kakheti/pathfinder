# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Fider
  include Mongoid::Document
  include Mongoid::Search
  include Mongoid::Timestamps
  include Objects::Coordinate
  include Objects::Kml

  field :_id, type: String

  field :name, type: String
  field :description, type: String
  field :residential_count, type: Float
  field :comercial_count, type: Float
  field :usage_average, type: Float
  field :substation_number, type: String
  field :linename, type: String
  field :region_name, type: String
  field :substation_name, type: String
  belongs_to :region
  belongs_to :substation, class_name: 'Objects::Substation'
  belongs_to :line, class_name: 'Objects::Line'
  has_many :lines, class_name: 'Objects::FiderLine'
  has_many :tps, class_name: 'Objects::Tp'
  has_many :poles, class_name: 'Objects::Pole'
  has_many :fider04s, class_name: 'Objects::Fider04'
  has_many :direction04s, class_name: 'Objects::Direction04'
  has_many :pole04s, class_name: 'Objects::Pole04'

  search_in :name, :linename, :substation_name

  index({ name: 1 })
  index({ region_id: 1 })

  def to_s; self.name end

  def info
    "ქვესადგური: #{substation_name}"
  end

  def make_summaries
    self.residential_count = self.tps.sum(:residential_count)
    self.comercial_count = self.tps.sum(:comercial_count)
    self.usage_average = self.tps.sum(:usage_average)
    self.save
  end

  def self.from_kml(xml)
    parser = XML::Parser.string xml
    doc = parser.parse
    kmlns = "kml:#{KMLNS}"
    placemarks = doc.child.find '//kml:Placemark',kmlns

    placemarks.each do |placemark|
      # FiderExtractionWorker.perform_async(placemark.to_s)
      FiderExtractionWorker.new.perform(placemark.to_s)
    end
  end

  def to_kml(xml)
    # extra = extra_data('დასახელება' => name,
    #   'მიმართულება' => direction,
    #   'შენიშვნა' => description,
    #   'მუნიციპალიტეტი' => region.to_s,
    #   'სიგრძე' => length
    # )
    # xml.Placemark(id: "ID_#{self.id.to_s}") do |xml|
    #   xml.name self.name
    #   xml.description "<p>#{self.name}, #{self.direction}</p> <!-- #{extra} -->"
    #   xml.MultiGeometry do |xml|
    #     xml.LineString do
    #       xml.extrude 0
    #       xml.altitudeMode 'clampedToGround'
    #       xml.coordinates ' ' + self.points.map{|p| [p.lng, p.lat, p.alt||0].join(',')}.join(' ')
    #     end
    #   end
    # end
  end

  def length; self.lines.sum(:length) end
end
