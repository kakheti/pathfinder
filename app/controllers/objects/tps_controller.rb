# -*- encoding : utf-8 -*-
require 'zip'

class Objects::TpsController < ApplicationController
  include Objects::Kml

  def index
    rel=Objects::Tp.asc(:kmlid)
    @search = search_params
    if @search.present?
      rel = rel.where(name: @search[:name].mongonize) if @search[:name].present?
      rel = rel.where(owner: @search[:owner].mongonize) if @search[:owner].present?
      rel = rel.where(region_id: @search[:region]) if @search[:region].present?
    end
    respond_to do |format|
      format.html {
        @title = 'სატრანსფორმატორო ჯიხურები'
        @tps = rel.paginate(per_page:10, page: params[:page])
      }
      format.xlsx{ @tps=rel }
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
    @title='ფაილის ატვირთვა: სატრანსფორმატორო ჯიხურები'
    if request.post?
      f=params[:data].original_filename
      case File.extname(f).downcase
      when '.kmz' then upload_kmz(params[:data].tempfile)
      when '.kml' then upload_kml(params[:data].tempfile)
      when '.xlsx' then uploadstat_xlsx(params[:data].tempfile)
      else raise 'არასწორი ფორმატი' end
      redirect_to objects_tps_url, notice: 'მონაცემები ატვირთულია'
    end
  end

  def show
    @title='სატრანსფორმატორო ჯიხური'
    @tp=Objects::Tp.find(params[:id])
  end

  protected
  def nav
    @nav=super
    @nav['ჯიხურები']=objects_tps_url
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
    Objects::Tp.destroy_all
    kml = file.get_input_stream.read
    Objects::Tp.from_kml(kml)
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
