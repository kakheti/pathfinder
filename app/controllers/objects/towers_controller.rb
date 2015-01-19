# -*- encoding : utf-8 -*-
require 'zip'

class Objects::TowersController < ApplicationController
  include Objects::Kml

  def index
    rel = Objects::Tower
    @search = search_params
    if @search.present?
      rel = rel.where(name: @search[:name].mongonize) if @search[:name].present?
      rel = rel.where(region_id: @search[:region]) if @search[:region].present?
      rel = rel.where(kmlid: @search[:kmlid].mongonize) if @search[:kmlid].present?
      rel = rel.where(line_id: @search[:line]) if @search[:line].present?
      # rel = rel.where(linename: @search[:linename].mongonize) if @search[:linename].present?
    end
    respond_to do |format|
      format.html { @title='ანძები' ; @towers=rel.asc(:name).paginate(per_page:10, page: params[:page]) }
      format.xlsx{ @towers= rel.asc(:name) }
      format.kmz do
        @towers=rel
        kml = kml_document do |xml|
          xml.Document(id: 'towers') do
            @towers.each { |tower| tower.to_kml(xml) }
          end
        end
        send_data kml_to_kmz(kml), filename: 'towers.kmz'
      end
    end
  end

  def upload
    @title='ფაილის ატვირთვა'
    if request.post?
      f = params[:data].original_filename
      case File.extname(f).downcase
      when '.kmz' then upload_kmz(params[:data].tempfile)
      when '.kml' then upload_kml(params[:data].tempfile)
      when '.xlsx' then upload_xlsx(params[:data].tempfile)
      else raise 'არასწორი ფორმატი' end
        redirect_to objects_upload_towers_url(status: 'ok')
    end
  end

  def upload_photo
    @title = 'გამოსახულების ატვირთვა'
    @tower = Objects::Tower.find(params[:id])
    if request.post?
      file = params[:data].tempfile
      filename = params[:data].original_filename
      @tower.generate_images_from_file(file.path, filename)
      redirect_to objects_tower_url(id: @tower.id), notice: 'გამოსახულედა დამატებულია'
    end
  end

  def delete_photo
    tower = Objects::Tower.find(params[:id])
    tower.destroy_image(params[:basename])
    redirect_to objects_tower_url(id: tower.id), notice: 'გამოსახულედა წაშლილია'
  end

  def show
    @title='ანძის თვისებები'
    @tower=Objects::Tower.find(params[:id])
  end

  protected
  def nav
    @nav=super
    @nav['ანძები']=objects_towers_url
    if @tower
      @nav[@tower.name] = objects_tower_url(id: @tower.id) unless ['show'].include?(action_name)
    end
    @nav[@title]=nil unless ['index'].include?(action_name)
  end

  def login_required; true end
  def permission_required; not current_user.admin? end

  private

  def upload_kmz(file)
    Zip::File.open file do |zip_file|
      zip_file.each do |entry|
        upload_kml(entry) if 'kml'==entry.name[-3..-1]
      end
    end
  end

  def upload_kml(file)
    Objects::Tower.delete_all
    kml = file.get_input_stream.read
    Objects::Tower.from_kml(kml)
  end

  def upload_xlsx(file); XLSConverter.perform_async('Objects::Tower', file.path.to_s) end
end
