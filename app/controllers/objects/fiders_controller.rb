# -*- encoding : utf-8 -*-
require 'zip'

class Objects::FidersController < ApplicationController
  include Objects::Kml

  def index
    rel = Objects::Fider.asc(:name)
    respond_to do |format|
      format.html{ @title='ფიდერები'; @fiders = rel.paginate(per_page:10, page: params[:page]) }
      format.xlsx{ @fiders=rel }
      format.kmz do
        @fiders=rel
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
    @title='ფაილის ატვირთვა: ფიდერები'
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
    @title='ფიდერი'
    @fider=Objects::Fider.find(params[:id])
  end

  def find
    @title = 'ფიდერი'
    @fider = Objects::Fider.where(name: params[:name]).first
    if @fider
      render action: 'show'
    else
      render text: "ფიდერი \"#{params[:name]}\" ვერ მოიძებნა"
    end
  end

  protected
  def nav
    @nav=super
    @nav['ფიდერები']=objects_fiders_url
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
    Objects::Fider.delete_all
    kml = file.get_input_stream.read
    Objects::Fider.from_kml(kml)
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
