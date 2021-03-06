# -*- encoding : utf-8 -*-
class Objects::PhotosController < ApplicationController
  def index
    @title = 'დაუდასტურებელი ფოტოები'
    @photos = Objects::Photo.not_confirmed.asc(:_id)
  end

  def all
    @title = 'ყველა ფოტო'
    @photos = Objects::Photo.asc(:_id).paginate(page: params[:page], per_page: 30)
  end

  def confirm
    photo = Objects::Photo.find(params[:id])
    photo.confirmed = true ; photo.save
    redirect_to params[:return_url], notice: 'ფოტო დადასტურებულია!'
  end

  protected
  def nav
    @nav = super
    @nav['დაუდასტურებელი ფოტოები'] = objects_photos_url if 'all' == action_name
    @nav[@title] = nil
  end

  def login_required; true end
  def permission_required
    if ['generate_images'].include?(action_name) then not current_user.admin?
    elsif ['editor'].include?(action_name) then not current_user.editor
    else false end
  end
end
