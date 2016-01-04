require 'xml'

class FiderExtractionWorker
  include Sidekiq::Worker

  sidekiq_options retry: 2, backtrace: true


  def perform(placemark_xml)
    placemark = XML::Parser.string(placemark_xml).parse.child
    descr = placemark.find('description').first.content
    name  = Objects::Kml.get_property(descr, 'ფიდერი')
    fider = Objects::Fider.by_name(name.to_ka(:all)) if name
    line  = Objects::FiderLine.create(fider: fider)
    line.start = Objects::Kml.get_property(descr, 'საწყისი ბოძი')
    line.end = Objects::Kml.get_property(descr, 'ბოძამდე')
    line.cable_type = Objects::Kml.get_property(descr, 'სადენის ტიპი')
    line.cable_area = Objects::Kml.get_property(descr, 'სადენის კვეთი')
    line.underground = Objects::Kml.get_property(descr, 'მიწისქვეშა კაბელი')
    line.quro = Objects::Kml.get_property(descr, 'ქურო')
    line.description = Objects::Kml.get_property(descr, 'შენიშვნა')
    line.region = Region.get_by_name Objects::Kml.get_property(descr, 'მუნიციპალიტეტი')
    line.voltage = Objects::Kml.get_property(descr, 'ფიდერის ძაბვა')
    line.linename = Objects::Kml.get_property(descr, 'ელ, გადამცემი ხაზი')
    line.substation_number = Objects::Kml.get_property(descr, 'ქვესადგურის ნომერი')
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
    fider.linename = Objects::Kml.get_property(descr, 'ელ, გადამცემი ხაზი')
    fider.line = Objects::Line.by_name(fider.linename)
    fider.set_coordinate(coords[coords.size/2])
    fider.region = line.region unless fider.region.present?
    fider.region_name = fider.region.name if fider.region.present?
    fider.substation_number = line.substation_number unless fider.substation_number.present?
    fider.substation = Objects::Substation.where({ number: fider.substation_number }).first
    fider.substation_name = fider.substation.name if fider.substation.present?
    fider.save
  end

end
