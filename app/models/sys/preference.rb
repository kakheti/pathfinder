# -*- encoding : utf-8 -*-
class Sys::Preference
  include Mongoid::Document
  field :name, type: String
  field :int_value, type: Integer

  def self.inc(name)
    pref=Sys::Preference.where(name: name).first
    if pref.blank?
      pref=Sys::Preference.new(name: name, int_value: 0); pref.save
    end
    pref.inc(:int_value => 1)
  end
end
