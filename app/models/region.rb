# -*- encoding : utf-8 -*-
class Region
  include Mongoid::Document
  include Mongoid::Timestamps
  include Sys::Userstamps
  field :name, type: String
  field :description, type: String
  field :residential_count, type: Integer, default: 0
  field :comercial_count, type: Integer, default: 0
  field :usage_average, type: Float, default: 0
  has_many :lines, class_name: 'Objects::Line'
  has_many :towers, class_name: 'Objects::Tower'
  has_many :offices, class_name: 'Objects::Office'
  has_many :substations, class_name: 'Objects::Substation'
  has_many :tps, class_name: 'Objects::Tp'
  has_many :poles, class_name: 'Objects::Pole'
  has_many :fiders, class_name: 'Objects::Fider'
  has_many :pole04s, class_name: 'Objects::Pole04'
  has_many :fider04s, class_name: 'Objects::Fider04'
  has_many :direction04s, class_name: 'Objects::Direction04'
  has_and_belongs_to_many :users, class_name: 'Sys::User'
  validates :name, presence: {message: 'ჩაწერეთ სახელი'}

  index({name: 1})

  def self.get_by_name(name)
    return unless name.present?
    name = name.to_ka(:all)
    Region.where(name: name).first || Region.create(name: name)
  end

  def can_delete?
    lines.empty? and towers.empty? and offices.empty? and substations.empty?
  end

  def towers_limited
    self.towers.paginate(per_page: 50)
  end

  def poles_limited
    self.poles.paginate(per_page: 50)
  end

  def fiders_limited
    self.fiders.paginate(per_page: 50)
  end

  def to_s
    self.name
  end

  def make_summaries
    self.residential_count = self.tps.sum(:residential_count)
    self.comercial_count = self.tps.sum(:comercial_count)
    self.usage_average = self.tps.sum(:usage_average)
    self.save
  end
end
