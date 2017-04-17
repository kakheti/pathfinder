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

  index({name: 1})
  index({region_id: 1})

  def info
    "ქვესადგური: #{substation_name}"
  end

  def make_summaries
    self.residential_count = self.tps.sum(:residential_count)
    self.comercial_count = self.tps.sum(:comercial_count)
    self.usage_average = self.tps.sum(:usage_average)
    self.save
  end

  def length
    self.lines.sum(:length)
  end
end
