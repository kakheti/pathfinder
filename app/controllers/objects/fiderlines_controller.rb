# -*- encoding : utf-8 -*-

class Objects::FiderlinesController < ApplicationController
  include Objects::Kml

  def show
    @title='6-10კვ ფიდერის ხაზი'
    @line = Objects::FiderLine.where({
      '_id' => BSON::ObjectId.from_string(params[:id])
    }).first
  end

  protected

  def login_required; true end
  def permission_required; not current_user.admin? end
end
