class Direction04ExtractionWorker
  include Sidekiq::Worker

  sidekiq_options retry: 2, backtrace: true


  def perform(placemark_xml)
    placemark = XML::Parser.string(placemark_xml).parse.child

    id = placemark.attributes['id']
    descr = placemark.find('description').first.content

    line = Objects::Fider04.where(kmlid: id).first || Objects::Fider04.create(kmlid: id)

    line.name = placemark.find('name').first.content
    line.start = Objects::Kml.get_property(descr, 'საწყისი ბოძი')
    line.end = Objects::Kml.get_property(descr, 'ბოძამდე')
    line.cable_type = Objects::Kml.get_property(descr, 'სადენის ტიპი').to_ka(:all)
    line.description = Objects::Kml.get_property(descr, 'შენიშვნა')
    line.sip = Objects::Kml.get_property(descr, 'SIP')
    line.owner = Objects::Kml.get_property(descr, 'მესაკუთრე')
    line.state = Objects::Kml.get_property(descr, 'სადენის მდგომარეობა')
    line.region = Region.get_by_name(Objects::Kml.get_property(descr, 'მუნიციპალიტეტი').to_ka(:all))
    line.region_name = line.region.name

    tr_num = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ნომერი')
    line.tp = Objects::Tp.by_name(tr_num)
    line.tp_name = line.tp.name if line.tp.present?

    line.substation = line.tp.substation if line.tp.present?
    line.fider = line.tp.fider if line.tp.present?
    line.substation_name = line.substation.name if line.substation.present?
    line.fider_name = line.fider.name if line.fider.present?

    dir_num = Objects::Kml.get_property(descr, 'მიმართულება')
    line.direction = Objects::Direction04.get_or_create(line.region, dir_num, line.tp, tr_num)

    coords = placemark.find('MultiGeometry/LineString/coordinates').first.content
    coords = coords.split(' ')
    coords.each do |coord|
      point = line.points.new(line: line)
      point.set_coordinate(coord)
      point.save
    end
    line.set_coordinate(coords[coords.size/2])
    line.calc_length!

    line.direction.calculate! unless line.direction.nil?

    line.save
  end

end
