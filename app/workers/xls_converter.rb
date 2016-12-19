# -*- encoding : utf-8 -*-
class XLSConverter
  include Sidekiq::Worker

  def perform(type, path)
    sheet = Roo::Spreadsheet.open(path, extension: 'xlsx')
    case type
      when 'Objects::Line' then
        lines_converter(sheet)
      when 'Objects::Tower' then
        towers_converter(sheet)
    end
    Sys::Cache.clear_map_objects
  end

  private

  def lines_converter(sheet)
    (2..sheet.last_row).each do |row|
      id = sheet.cell('A', row); line = Objects::Line.find(id)
      name = sheet.cell('B', row); line.name = name
      direction = sheet.cell('C', row); line.direction = direction
      regionname = sheet.cell('D', row); line.region = Region.get_by_name(regionname)
      description = sheet.cell('F', row); line.description = description
      line.save
    end
  end

  def towers_converter(sheet)
    (2..sheet.last_row).each do |row|
      id = sheet.cell('A', row); tower = Objects::Tower.find(id)
      name = sheet.excelx_value('B', row).to_s; tower.name = name
      category=sheet.cell('C', row); tower.category = category
      regionname = sheet.cell('D', row).to_s; tower.region = Region.get_by_name(regionname)
      description=sheet.cell('E', row); tower.description = description
      tower.save
    end
  end
end
