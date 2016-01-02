# -*- encoding : utf-8 -*-
require 'zip'

class Objects::FidersController < ApplicationController
  include Objects::Kml

  def index
    rel = Objects::Fider.asc(:name)
    @search = search_params
    if @search.present?
      rel = rel.where(name: @search[:name].mongonize) if @search[:name].present?
      rel = rel.where(linename: @search[:line].mongoize) if @search[:line].present?
      rel = rel.where(region_id: @search[:region]) if @search[:region].present?
      rel = rel.where(substation_id: @search[:substation]) if @search[:substation].present?
    end
    respond_to do |format|
      format.html{ @title = '6-10კვ ფიდერები'; @fiders = rel.paginate(per_page:10, page: params[:page]) }
      format.xlsx{ @fiders = rel }
      format.kmz do
        @fiders = rel
        kml = kml_document do |xml|
          xml.Document(id: 'fiders') do
            @fiders.each { |fider| to.to_kml(xml) }
          end
        end
        send_data kml_to_kmz(kml), filename: 'fiders.kmz'
      end
    end
  end

  def upload
    @title='ფაილის ატვირთვა: 6-10კვ ფიდერები'
    if request.post?
      f=params[:data].original_filename
      case File.extname(f).downcase
      when '.kmz' then upload_kmz(params[:data].tempfile)
      when '.kml' then upload_kml(params[:data].tempfile)
      when '.xlsx' then upload_xlsx(params[:data].tempfile)
      else raise 'არასწორი ფორმატი' end
      redirect_to objects_fiders_url, notice: 'მონაცემები ატვირთულია'
    end
  end

  def show
    @title='6-10კვ ფიდერის თვისებები'
    @fider=Objects::Fider.find(params[:id])
  end

  def find
    @title = '6-10კვ ფიდერი'
    @fider = Objects::Fider.where(name: params[:name]).first
    if @fider
      render action: 'show'
    else
      render text: "6-10კვ ფიდერი \"#{params[:name]}\" ვერ მოიძებნა"
    end
  end

  protected
  def nav
    @nav=super
    @nav['6-10კვ ფიდერები']=objects_fiders_url
    @nav[@title]=nil unless ['index'].include?(action_name)
  end

  def login_required; true end
  def permission_required; not current_user.admin? end

  private

  def upload_kmz(file)
    FidersUploadWorker.perform_async(file.path)    
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
