# -*- encoding : utf-8 -*-
require 'zip'

class Objects::PolesController < ApplicationController
  include Objects::Kml

  def index
    rel=Objects::Pole.asc(:region_name, :substation_name, :fider_name, :name)
    @search = search_params
    if @search.present?
      rel = rel.where(name: @search[:name].mongonize) if @search[:name].present?
      rel = rel.where(region_id: @search[:region]) if @search[:region].present?
      rel = rel.where(substation_id: @search[:substation]) if @search[:substation].present?
      rel = rel.where(fider_id: @search[:fider]) if @search[:fider].present?
    end

    respond_to do |format|
      format.html { @title='6-10კვ საყრდენები'; @poles=rel.paginate(per_page: 10, page: params[:page]) }
      format.xlsx { @poles=rel }
      format.kmz do
        @poles=rel
        kml = kml_document do |xml|
          xml.Document(id: 'poles') do
            @poles.each { |pole| to.to_kml(xml) }
          end
        end
        send_data kml_to_kmz(kml), filename: 'poles.kmz'
      end
    end
  end

  def upload
    @title='ფაილის ატვირთვა: 6-10კვ საყრდენები'
    if request.post?
      f=params[:data].original_filename
      delete_old = params[:delete_old]
      case File.extname(f).downcase
        when '.kmz' then
          upload_kmz(params[:data].tempfile, delete_old)
        when '.kml' then
          upload_kml(params[:data].tempfile, delete_old)
        when '.xlsx' then
          upload_xlsx(params[:data].tempfile)
        else
          raise 'არასწორი ფორმატი'
      end
      redirect_to objects_poles_url, notice: 'მონაცემების ატვირთვა დაწყებულია. შეამოწმეთ მიმდინარე დავალებათა გვერდი'
    end
  end

  def show
    @title='6-10კვ საყრდენი'
    @pole=Objects::Pole.find(params[:id])
  end

  protected
  def nav
    @nav=super
    @nav['6-10კვ საყრდენები']=objects_poles_url
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
    PolesUploadWorker.perform_async(file.path, delete_old)
  end

  def upload_xlsx(file)

    # TODO: change this!

    # sheet=Roo::Spreadsheet.open(file.path, extension: 'xlsx')
    # (2..sheet.last_row).each do |row|
    #   id = sheet.cell('A',row) ; office = Objects::Office.find(id)
    #   name = sheet.cell('B',row) ; office.name = name
    #   regionname = sheet.cell('C',row).to_s ; region = Region.get_by_name(regionname) ; office.region = region
    #   address = sheet.cell('D',row) ; office.address = address
    #   description = sheet.cell('E',row) ; office.description = description
    #   office.save
    # end
  end
end
