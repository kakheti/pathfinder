# -*- encoding : utf-8 -*-
require 'zip'

class Objects::FiderlinesController < ApplicationController
  include Objects::Kml

  def index
    rel = Objects::Fider.asc(:name)
    @search = search_params
    if @search.present?
      rel = rel.where(name: @search[:name].mongonize) if @search[:name].present?
      rel = rel.where(line_id: @search[:line]) if @search[:line].present?
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

  def show
    @title='ფიდერის თვისებები'
    @fider=Objects::Fider.find(params[:id])
  end

  def find
    @title = '6-10კვ ფიდერი'
    @fider = Objects::Fider.where({
      'lines._id' => BSON::ObjectId.from_string(params[:id])
    }).first().lines.find(params[:id])
    if @fider
      render action: 'show'
    else
      render text: "ფიდერი \"#{params[:id]}\" ვერ მოიძებნა"
    end
  end

  protected

  def login_required; true end
  def permission_required; not current_user.admin? end

  private

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
