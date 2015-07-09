# -*- encoding : utf-8 -*-
class Admin::UsersController < ApplicationController
  def index
    @title=t('pages.admin_users.index.title')
    @users=Sys::User.desc(:_id).paginate(page:params[:page], per_page:10)
  end

  def show
    @title=t('models.sys_user._actions.user_properties')
    @user=Sys::User.find(params[:id])
  end

  def new
    @title=t('models.sys_user._actions.new_user')
    if request.post?
      @user=Sys::User.new(user_params)
      if @user.save(user: current_user)
        redirect_to admin_users_url, notice: t('pages.admin_users.new.user_created')
      end
    else
      @user=Sys::User.new
    end
  end

  def edit
    @title=t('models.sys_user._actions.edit_user')
    @user=Sys::User.find(params[:id])
    if request.post?
      if @user.update_attributes(user_params.merge(user: current_user))
        redirect_to admin_user_url(id:@user.id), notice: t('pages.admin_users.edit.user_updated')
      end
    end
  end

  def destroy
    user=Sys::User.find(params[:id])
    user.destroy
    redirect_to admin_users_url, notice: t('pages.admin_users.destroy.user_destroied')
  end

  def add_region
    @user = Sys::User.find(params[:id])
    @title = 'მუნიციპალიტეტის დამატება'
    if request.post?
      region = Region.find(params[:region_id])
      @user.regions << region unless @user.regions.include?(region)
      redirect_to admin_user_url(id: @user.id, tab: 'regions'), notice: 'მუნიციპალიტეტი დამატებულია'
    end
  end

  protected
  def nav
    @nav=super
    @nav[t('pages.admin_users.index.title')]=admin_users_url
    if @user
      @nav[@user.full_name]=admin_user_url(id:@user.id) unless @user.new_record?
      @nav[@title]=nil unless action_name=='show'
    end
  end

  def login_required; true end
  def permission_required; not current_user.admin? end

  private
  def user_params; params.require(:sys_user).permit(:username, :password, :first_name, :last_name, :mobile, :active, :admin, :editor, :all_regions) end
end
