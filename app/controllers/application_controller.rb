# -*- encoding : utf-8 -*-
class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  def render(*args)
    self.nav
    if self.login_required and current_user.blank?
      #super 'layouts/login_required'
      redirect_to "/login", notice:"პროგრამაში სამუშაოდ საჭიროა ავტორიზაცია"
    elsif permission_required
      super 'layouts/permission_required'
    else
      super
    end
  end

  def current_user; @_curr_user ||= (Sys::User.find(session[:user_id]) rescue nil) if session[:user_id] end
  def search_params; params[:search] == 'clear' ? nil : params[:search] end
  helper_method :current_user

  protected
  def nav; @nav = {t('pages.site.index.title') => home_url} end

  def login_required; false end
  def permission_required; false end
end
