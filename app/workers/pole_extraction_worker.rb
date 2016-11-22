class PoleExtractionWorker
  include Sidekiq::Worker

  sidekiq_options retry: 2

  def perform(placemark_xml)
    placemark = XML::Parser.string(placemark_xml).parse.child

    id = placemark.attributes['id']
    obj = Objects::Pole.where(kmlid: id).first || Objects::Pole.new(kmlid: id)
    # start description section
    descr = placemark.find('description').first.content
    obj.name = Objects::Kml.get_property(descr, 'ბოძის ნომერი')
    return logger.error("Missing name for object #{id}")  unless obj.name
    obj.number2 = Objects::Kml.get_property(descr, 'ბოძის პირობითი ნომერი')
    obj.height = Objects::Kml.get_property(descr, 'ბოძის სიმაღლე').to_f
    obj.pole_type = Objects::Kml.get_property(descr, 'ბოძის ტიპი')
    obj.traverse_type = Objects::Kml.get_property(descr, 'ტრავერსის ტიპი')
    obj.traverse_type2 = Objects::Kml.get_property(descr, 'ტრავერსის ტიპი 2')
    obj.isolation_type = Objects::Kml.get_property(descr, 'იზოლატორის ტიპი')
    obj.switch = Objects::Kml.get_property(descr, 'გამთიშველი').to_i
    obj.switch_type = Objects::Kml.get_property(descr, 'გამთიშველის ტიპი')
    obj.vertical_position = Objects::Kml.get_property(descr, 'ვერტიკალური მდგომარეობა')
    obj.oldness = Objects::Kml.get_property(descr, 'ცვეთის ხარისხი')
    obj.should_be_out = Objects::Kml.get_property(descr, 'გამოსატანია')
    obj.gps = Objects::Kml.get_property(descr, 'GPS')
    obj.region_name = Objects::Kml.get_property(descr, 'მუნიციპალიტეტი').to_ka(:all)
    obj.region = Region.get_by_name(obj.region_name)
    obj.substation_name = Objects::Kml.get_property(descr, 'ქვესადგური').to_ka(:all)
    obj.substation = Objects::Substation.where(name: obj.substation_name, region: obj.region).first
    return logger.error("Invalid substation name #{obj.substation_name} for object #{id}")  unless obj.substation
    obj.fider_name = Objects::Kml.get_property(descr, 'ფიდერი').to_ka(:all)
    return logger.error("Missing fider name for object #{id}")  unless obj.fider_name
    obj.fider = Objects::Fider.find_or_create(obj.fider_name, obj.substation.number, obj.region)
    linename = Objects::Kml.get_property(descr, 'ელ. გადამცემი ხაზი')
    obj.linename = linename.to_ka(:all) if linename.present?
    description = Objects::Kml.get_property(descr, 'შენიშვნა')
    obj.description = description.to_ka(:all) if description.present?
    # end of description section
    coord = placemark.find('Point/coordinates').first.content
    obj.set_coordinate(coord)
    obj.save
  end

end
