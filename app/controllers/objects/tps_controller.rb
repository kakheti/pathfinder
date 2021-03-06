# -*- encoding : utf-8 -*-
require 'zip'

class Objects::TpsController < ApplicationController
  include Objects::Kml

  def index
    rel=Objects::Tp.asc(:region_name, :substation_name, :fider_name, :name)
    @search = search_params
    if @search.present?
      rel = rel.where(name: @search[:name].mongonize) if @search[:name].present?
      rel = rel.where(owner: @search[:owner].mongonize) if @search[:owner].present?
      rel = rel.where(region_id: @search[:region]) if @search[:region].present?
      rel = rel.where(substation_id: @search[:substation]) if @search[:substation].present?
      rel = rel.where(fider_id: @search[:fider]) if @search[:fider].present?
    end
    respond_to do |format|
      format.html {
        @title = '6-10კვ სატრ. ჯიხურები'
        @tps = rel.paginate(per_page: 10, page: params[:page])
      }
      format.xlsx { @tps=rel }
      format.kmz do
        @tps=rel
        kml = kml_document do |xml|
          xml.Document(id: 'tps') do
            @tps.each { |tp| to.to_kml(xml) }
          end
        end
        send_data kml_to_kmz(kml), filename: 'tps.kmz'
      end
    end
  end

  def upload
    @title='ფაილის ატვირთვა: 6-10კვ სატრ. ჯიხურები'
    if request.post?
      f = params[:data].original_filename
      delete_old = params[:delete_old]
      case File.extname(f).downcase
        when '.kmz' then
          upload_kmz(params[:data].tempfile, delete_old)
        when '.kml' then
          upload_kml(params[:data].tempfile, delete_old)
        when '.xlsx' then
          uploadstat_xlsx(params[:data].tempfile)
        else
          raise 'არასწორი ფორმატი'
      end
      redirect_to objects_tps_url, notice: 'მონაცემების ატვირთვა დაწყებულია. შეამოწმეთ მიმდინარე დავალებათა გვერდი.'
    end
  end

  def show
    @title='6-10კვ სატრ. ჯიხური'
    @tp=Objects::Tp.find(params[:id])
  end

  protected
  def nav
    @nav=super
    @nav['6-10კვ სატრ. ჯიხურები'] = objects_tps_url
    @nav[@title]=nil unless ['index'].include?(action_name)
  end

  def login_required;
    true
  end

  def permission_required;
    not current_user.admin?
  end

  private

  def upload_kmz(file, delete_old)
    TpsUploadWorker.perform_async(file.path, delete_old)
  end

  def uploadstat_xlsx(file)
    sheet = Roo::Spreadsheet.open(file.path, extension: 'xlsx')
    (2..sheet.last_row).each do |row|
      tpname = sheet.cell('D', row)
      tp = Objects::Tp.where(name: tpname).first
      if tp
        tp.residential_count = sheet.cell('G', row).to_i rescue 0
        tp.comercial_count = sheet.cell('H', row).to_i rescue 0
        tp.usage_average = sheet.cell('I', row).to_f rescue 0
        tp.save
      end
    end
    Region.each { |region| region.make_summaries }
    Objects::Fider.each { |fider| fider.make_summaries }
    Objects::Substation.each { |fider| fider.make_summaries }
  end
end
