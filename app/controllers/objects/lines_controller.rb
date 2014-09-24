# -*- encoding : utf-8 -*-
require 'zip'
require 'roo'

class Objects::LinesController < ApplicationController
  include Objects::Kml

  def index
    rel = Objects::Line ; @search = search_params
    if @search.present?
      rel = rel.where(name: @search[:name].mongonize) if @search[:name].present?
      rel = rel.where(region_id: @search[:region]) if @search[:region].present?
      rel = rel.where(kmlid: @search[:kmlid].mongonize) if @search[:kmlid].present?
      rel = rel.where(direction: @search[:direction].mongonize) if @search[:direction].present?
    end
    respond_to do |format|
      format.html { @title='ხაზები'; @lines = rel.asc(:kmlid).paginate(per_page:10, page: params[:page]) }
      format.xlsx { @lines = rel.asc(:kmlid) }
      format.kmz do
        @lines = rel
        kml = kml_document do |xml|
          xml.Document(id: 'lines') do
            @lines.each { |line| line.to_kml(xml) }
          end
        end
        send_data kml_to_kmz(kml), filename: 'lines.kmz'
      end
    end
  end

  def upload
    @title='ფაილის ატვირთვა'
    if request.post?
      f=params[:data].original_filename
      case File.extname(f).downcase
      when '.kmz' then upload_kmz(params[:data].tempfile)
      when '.kml' then upload_kml(params[:data].tempfile)
      when '.xlsx' then upload_xlsx(params[:data].tempfile)
      else raise 'არასწორი ფორმატი' end
      redirect_to objects_upload_lines_url(status: 'ok')
    end
  end

  def show
    @title='ხაზის თვისებები'
    @line=Objects::Line.find(params[:id])
  end

  protected
  def nav
    @nav=super
    @nav['ხაზები']=objects_lines_url
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
    kml = file.get_input_stream.read
    Objects::Line.from_kml(kml)
  end

  def upload_xlsx(file); XLSConverter.perform_async('Objects::Line', file.path.to_s) end
end
