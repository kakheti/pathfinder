# -*- encoding : utf-8 -*-
require 'zip'

class Objects::OfficesController < ApplicationController
  include Objects::Kml

  def index
    rel = Objects::Office.asc(:kmlid)
    respond_to do |format|
      format.html{ @title = 'ოფისები'; @offices = rel.paginate(per_page:15, page: params[:page]) }
      format.xlsx{ @offices = rel }
      format.kmz do
        @offices = rel
        kml = kml_document do |xml|
          xml.Document(id: 'offices') do
            @offices.each { |office| office.to_kml(xml) }
          end
        end
        send_data kml_to_kmz(kml), filename: 'offices.kmz'
      end
    end
  end

  def upload
    @title = 'ფაილის ატვირთვა: ოფისები'
    if request.post?
      f = params[:data].original_filename
      case File.extname(f).downcase
      when '.kmz' then upload_kmz(params[:data].tempfile)
      when '.kml' then upload_kml(params[:data].tempfile)
      when '.xlsx' then upload_xlsx(params[:data].tempfile)
      else raise 'არასწორი ფორმატი' end
      redirect_to objects_offices_url, notice: 'მონაცემები ატვირთვა დაწყებულია. შეამოწმეთ მიმდინარე დავალებათა გვერდი.'
    end
  end

  def show
    @title='ოფისის თვისებები'
    @office=Objects::Office.find(params[:id])
  end

protected

  def nav
    @nav=super
    @nav['ოფისები']=objects_offices_url
    @nav[@title]=nil unless ['index'].include?(action_name)
  end


  def login_required; true end
  def permission_required; not current_user.admin? end


private


  def upload_kmz(file)
    OfficeUploadWorker.perform_async(file.path)
  end


  def upload_xlsx(file)
    sheet=Roo::Spreadsheet.open(file.path, extension: 'xlsx')
    (2..sheet.last_row).each do |row|
      id = sheet.cell('A',row) ; office = Objects::Office.find(id)
      name = sheet.cell('B',row) ; office.name = name
      regionname = sheet.cell('C',row).to_s ; region = Region.get_by_name(regionname) ; office.region = region
      address = sheet.cell('D',row) ; office.address = address
      description = sheet.cell('E',row) ; office.description = description
      office.save
    end
  end
end
