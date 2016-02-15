# -*- encoding : utf-8 -*-
require 'xml'
require 'csv'

class Objects::Direction04
  include Mongoid::Document
  include Mongoid::Search
  include Objects::Coordinate

  field :number, type: String
  field :length, type: Float

  field :region_name, type: String
  field :substation_name, type: String
  field :fider_name, type: String
  field :tp_name, type: String

  belongs_to :region
  belongs_to :tp, class_name: 'Objects::Tp'
  belongs_to :substation, class_name: 'Objects::Substation'
  belongs_to :fider, class_name: 'Objects::Fider'
  has_many :pole04s, class_name: 'Objects::Pole04'
  has_many :fider04s, class_name: 'Objects::Fider04'

  search_in :name, :description, :fider, :tp => 'name'

  index({number: 1})
  index({region_id: 1})

  def calculate!
    length = 0

    fider04s.each do |fider04|
      length += fider04.calc_length
    end

    self.length = length
    self.save
  end

  def self.get_or_create(region, number, tp, tp_name)
    existing = self.where(region_id: region.id,
                          number: number,
                          tp_name: tp_name).first
    return existing if existing
    self.create(number: number,
                tp: tp,
                tp_name: tp_name,
                region: region,
                fider:  tp.try(:fider),
                substation: tp.try(:substation))
  end
end
