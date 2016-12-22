# -*- encoding : utf-8 -*-
require 'xml'
require 'csv'
require 'digest/sha1'

class Objects::Direction04
  include Mongoid::Document
  include Mongoid::Search
  include Objects::Coordinate

  field :_id, type: String

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

  search_in :name, :fider_name, :tp_name

  index({number: 1})
  index({region_id: 1})

  def info
    "ჯიხურის #: #{tp_name};"
  end

  def calculate!
    length = 0

    fider04s.each do |fider04|
      length += fider04.calc_length
    end

    self.length = length
    self.save
  end

  def self.get_or_create(region, number, tp)
    number = decode(number)
    existing = self.where(region: region,
                          number: number,
                          tp: tp).first
    puts("Direction04 for region #{region} num #{number} tp #{tp.name} not found") unless existing
    return existing if existing
    id = Digest::SHA1.hexdigest(region.name + number + tp.name)
    self.create(_id: id,
                number: number,
                tp: tp,
                tp_name: tp.name,
                region: region,
                fider: tp.try(:fider),
                substation: tp.try(:substation))
  end

  def self.decode(number)
    %w(0 100 200 300 400 500 600 700 800 900)[number.to_i] || number
  end
end
