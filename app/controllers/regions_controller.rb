# -*- encoding : utf-8 -*-
class RegionsController < ApplicationController
  def index
    @title='მუნიციპალიტეტები'
    @regions=Region.asc(:name)
  end

  def new
    @title='ახალი მუნიციპალიტეტი'
    if request.post?
      @region=Region.new(region_params)
      if @region.save(user:current_user)
        redirect_to region_url(id:@region.id), notice: 'მუნიციპალიტეტი შექმნილია'
      end
    else
      @region=Region.new
    end
  end

  def edit
    @title='მუნიციპალიტეტის შეცვლა'
    @region=Region.find(params[:id])
    if request.post?
      if @region.update_attributes(region_params.merge({user:current_user}))
        redirect_to region_url(id:@region.id), notice: 'მუნიციპალიტეტი განახლებულია'
      end
    end
  end

  def show
    @region=Region.find(params[:id])
    @title=@region.name
  end

  def delete
    region=Region.find(params[:id])
    if region.can_delete?
      region.destroy
      redirect_to regions_url, notice: 'მუნიციპალიტეტი წაშლილია'
    else
      redirect_to region_url(id:region.id), notice: 'წაშლა დაუშვებელია: დაკავშირებული ობიექტები'
    end
  end

  protected
  def nav
    @nav=super
    @nav['მუნიციპალიტეტები']=regions_url
    if @region
      @nav[@region.name]=region_url(id:@region.id) if action_name=='edit'
      @nav[@title]=nil
    end
  end

  def login_required; true end
  def permission_required; not current_user.admin? end

  private
  def region_params; params.require(:region).permit(:name,:description) end
end
