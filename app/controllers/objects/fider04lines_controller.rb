# -*- encoding : utf-8 -*-
require 'zip'

class Objects::Fider04linesController < ApplicationController
  include Objects::Kml

  def show
    @title='0.4კვ ფიდერის ხაზი'
    @line = Objects::Fider04.where({
      'lines._id' => BSON::ObjectId.from_string(params[:id])
    }).first().lines.find(params[:id])
  end

  protected

  def login_required; true end
  def permission_required; not current_user.admin? end
end
