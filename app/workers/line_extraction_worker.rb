require 'xml'
require 'digest/sha1'

class LineExtractionWorker
  include Sidekiq::Worker

  def perform(placemark_xml)
    parser = XML::Parser.string(placemark_xml)
    doc = parser.parse
    kmlns = "kml:#{KMLNS}"
    placemarks = doc.child.find '//kml:Placemark', kmlns
    placemarks.each do |placemark|
      id = placemark.attributes['id']
      name = placemark.find('./kml:name', kmlns).first.content
      logger.info("Uploading Line #{id} #{name}")
      coords = placemark.find('./kml:MultiGeometry/kml:LineString/kml:coordinates', kmlns).first.content
      # description content
      descr = placemark.find('./kml:description', kmlns).first.content
      regname = Objects::Kml.get_property(descr, 'რეგიონი')
      direction = Objects::Kml.get_property(descr, 'მიმართულება')
      # end of description section

      region = Region.get_by_name(regname)
      line = Objects::Line.where(kmlid: id).first || Objects::Line.new(kmlid: id, _id: id)
      line.direction = direction
      line.region = region
      line.region_name = regname
      line.name = name.to_ka(:all) if name.present?
      line.save
      line.points.destroy_all
      coords = coords.split(' ')
      coords.each do |coord|
        point = line.points.new(line: line)
        point.set_coordinate(coord)
        point.save
      end
      line.set_coordinate(coords[coords.size/2])
      line.calc_length!
      line.save
      # rejoin relations
      Objects::Tower.rejoin_line(line)
    end
  end
end
