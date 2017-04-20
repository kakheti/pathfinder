require 'digest/sha1'

class Direction04ExtractionWorker
  include Sidekiq::Worker

  def perform(placemark_xml)
    placemark = XML::Parser.string(placemark_xml).parse.child
    descr = placemark.find('description').first.content

    linestart = Objects::Kml.get_property(descr, 'საწყისი ბოძი') || ""
    lineend = Objects::Kml.get_property(descr, 'ბოძამდე') || ""
    region_name = Objects::Kml.get_property(descr, 'მუნიციპალიტეტი') || ""
    tr_num = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ნომერი') || ""
    dir_num = Objects::Kml.get_property(descr, 'მიმართულება') || ""

    id = Digest::SHA1.hexdigest(linestart + lineend + dir_num + tr_num + region_name)

    logger.info("Uploading Fider04 #{id}")

    line = Objects::Fider04.new(_id: id)

    line.start = Objects::Kml.get_property(descr, 'საწყისი ბოძი')
    line.end = Objects::Kml.get_property(descr, 'ბოძამდე')
    line.cable_type = Objects::Kml.get_property(descr, 'სადენის ტიპი').to_ka(:all)
    line.description = Objects::Kml.get_property(descr, 'შენიშვნა')
    line.sip = Objects::Kml.get_property(descr, 'SIP')
    line.owner = Objects::Kml.get_property(descr, 'მესაკუთრე')
    line.state = Objects::Kml.get_property(descr, 'სადენის მდგომარეობა')

    if region_name.blank?
      logger.error("No region name for Line04 #{id}")
      return
    end

    line.region = Region.get_by_name(region_name.to_ka(:all))
    line.region_name = line.region.name

    begin
      line.tp = Objects::Tp.find_by(name: tr_num, region: line.region)
    rescue
      logger.error("Invalid TP number #{tr_num} for Line04 #{id} in region #{line.region_name}")
      return
    end

    line.tp_name = tr_num

    line.substation = line.tp.substation
    line.fider = line.tp.fider
    line.substation_name = line.substation.name
    line.fider_name = line.fider.name

    line.direction = Objects::Direction04.decode(dir_num)
    line.name = line.direction
    line.direction04 = Objects::Direction04.get_or_create(line.region, dir_num, line.tp)

    coords = placemark.find('MultiGeometry/LineString/coordinates').first.content
    coords = coords.split(' ')
    coords.each do |coord|
      point = line.points.new(line: line)
      point.set_coordinate(coord)
      point.save
    end
    line.set_coordinate(coords[coords.size/2])
    line.calc_length!

    line.direction04.calculate! unless line.direction04.nil?

    line.save
  end

end
