class PoleExtractionWorker
  include Sidekiq::Worker

  sidekiq_options retry: 2, backtrace: true


  def perform(placemark_xml)
    placemark = XML::Parser.string(placemark_xml).parse.child

    id = placemark.attributes['id']
    obj = Objects::Pole.where(kmlid: id).first || Objects::Pole.create(kmlid: id)
    # start description section
    descr = placemark.find('description').first.content
    obj.name = Objects::Kml.get_property(descr, 'ბოძის ნომერი')
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
    regname = Objects::Kml.get_property(descr, 'მუნიციპალიტეტი')
    obj.region = Region.get_by_name(regname.to_ka(:all)) if regname.present?
    subname = Objects::Kml.get_property(descr, 'ქვესადგური')
    obj.substation = Objects::Substation.by_name(subname.to_ka(:all)) if subname.present?
    fidername = Objects::Kml.get_property(descr, 'ფიდერი')
    obj.fider = Objects::Fider.by_name(fidername.to_ka(:all)) if fidername.present?
    linename = Objects::Kml.get_property(descr, 'ელ. გადამცემი ხაზი')
    obj.linename = linename if linename.present?
    description = Objects::Kml.get_property(descr, 'შენიშვნა')
    obj.description = description.to_ka(:all) if description.present?
    # end of description section
    coord = placemark.find('Point/coordinates').first.content
    obj.set_coordinate(coord)
    obj.save
  end

end
