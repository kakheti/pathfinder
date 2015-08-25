# -*- encoding : utf-8 -*-
require 'zip'

class Objects::Pole04sController < ApplicationController
  include Objects::Kml

  def index
    rel=Objects::Pole04.asc(:fider_id, :name)
    @search = search_params
    if @search.present?
      rel = rel.where(name: @search[:name].mongonize) if @search[:name].present?
      rel = rel.where(region_id: @search[:region]) if @search[:region].present?
      rel = rel.where(substation_id: @search[:substation]) if @search[:substation].present?
      rel = rel.where(fider_id: @search[:fider]) if @search[:fider].present?
    end

    respond_to do |format|
      format.html{ @title='0.4კვ ბოძები'; @poles=rel.paginate(per_page:10, page: params[:page]) }
      format.xlsx{ @poles=rel }
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
    @title='ფაილის ატვირთვა: 0.4კვ ბოძები'
    if request.post?
      f=params[:data].original_filename
      case File.extname(f).downcase
      when '.kmz' then upload_kmz(params[:data].tempfile)
      when '.kml' then upload_kml(params[:data].tempfile)
      when '.xlsx' then upload_xlsx(params[:data].tempfile)
      else raise 'არასწორი ფორმატი' end
      redirect_to objects_pole04s_url, notice: 'მონაცემები ატვირთულია'
    end
  end

  def show
    @title='0.4კვ ბოძი'
    @pole=Objects::Pole04.find(params[:id])
  end

  protected

  def nav
    @nav=super
    @nav['0.4კვ ბოძები']=objects_pole04s_url
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
    Objects::Pole04.delete_all
    kml = file.get_input_stream.read
    Objects::Pole04.from_kml(kml)
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