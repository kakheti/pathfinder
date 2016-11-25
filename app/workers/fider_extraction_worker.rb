require 'xml'

class FiderExtractionWorker
  include Sidekiq::Worker

  sidekiq_options retry: 2

  def perform(placemark_xml)
    placemark = XML::Parser.string(placemark_xml).parse.child
    descr = placemark.find('description').first.content
    name = Objects::Kml.get_property(descr, 'ფიდერი').to_ka(:all)
    substation_number = Objects::Kml.get_property(descr, 'ქვესადგურის ნომერი')
    region = Region.get_by_name(Objects::Kml.get_property(descr, 'მუნიციპალიტეტი'))

    fider = Objects::Fider.find_or_create(name, substation_number, region)

    line = Objects::FiderLine.new(fider: fider)
    line.start = Objects::Kml.get_property(descr, 'საწყისი ბოძი')
    line.end = Objects::Kml.get_property(descr, 'ბოძამდე')
    line.cable_type = Objects::Kml.get_property(descr, 'სადენის ტიპი')
    line.cable_area = Objects::Kml.get_property(descr, 'სადენის კვეთი')
    line.underground = Objects::Kml.get_property(descr, 'მიწისქვეშა კაბელი')
    line.quro = Objects::Kml.get_property(descr, 'ქურო')
    line.description = Objects::Kml.get_property(descr, 'შენიშვნა')
    line.region = region
    line.voltage = Objects::Kml.get_property(descr, 'ფიდერის ძაბვა')
    line.linename = Objects::Kml.get_property(descr, 'ელ, გადამცემი ხაზი').to_ka(:all)
    line.substation_number = substation_number

    coords = placemark.find('MultiGeometry/LineString/coordinates').first.content
    coords = coords.split(' ')
    coords.each do |coord|
      point = line.points.new(line: line)
      point.set_coordinate(coord)
      point.save
    end
    line.set_coordinate(coords[coords.size/2])
    line.calc_length!
    line.save
    fider.linename = line.linename
    fider.line = Objects::Line.where(name: fider.linename).first
    fider.set_coordinate(coords[coords.size/2])
    fider.region = line.region unless fider.region.present?
    fider.region_name = fider.region.name if fider.region.present?
    fider.substation_number = line.substation_number unless fider.substation_number.present?
    fider.substation = Objects::Substation.where(number: fider.substation_number).first
    fider.substation_name = fider.substation.name if fider.substation.present?
    fider.save
  end

end
