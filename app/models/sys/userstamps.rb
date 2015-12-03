# -*- encoding : utf-8 -*-
module Sys::Userstamps
  def self.included(base)
    base.field :created_by, type: Moped::BSON::ObjectId
    base.field :updated_by, type: Moped::BSON::ObjectId
  end

  def creator
    (@creator||=Sys::User.find(self.created_by)) rescue nil
  end

  def updater
    (@updater||=Sys::User.find(self.updated_by)) rescue nil
  end
end
