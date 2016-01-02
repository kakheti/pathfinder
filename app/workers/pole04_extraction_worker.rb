require 'xml'

class Pole04ExtractionWorker
  include Sidekiq::Worker

  sidekiq_options retry: 2, backtrace: true


  def perform(placemark_xml)
    placemark = XML::Parser.string(placemark_xml).parse.child

    id = placemark.attributes['id']
    obj = Objects::Pole04.where(kmlid: id).first || Objects::Pole04.create(kmlid: id)
    # start description section
    descr = placemark.find('description').first.content
    obj.name = Objects::Kml.get_property(descr, 'ბოძის id')
    obj.number = Objects::Kml.get_property(descr, 'ბოძის ნომერი')
    obj.height = Objects::Kml.get_property(descr, 'ბოძის სიმაღლე').to_f
    obj.pole_type = Objects::Kml.get_property(descr, 'ბოძის ტიპი', '').to_ka(:all)
    obj.ankeruli = Objects::Kml.get_property(descr, 'ანკერული', '').to_ka(:all)
    obj.oldness = Objects::Kml.get_property(descr, 'ხარისხრობრივი მდგომარეობა', '').to_ka(:all)
    obj.vertical_position = Objects::Kml.get_property(descr, 'ვერტიკალური მდგომარეობა', '').to_ka(:all)
    obj.owner = Objects::Kml.get_property(descr, 'მესაკუთრე', '').to_ka(:all)
    obj.lampioni = Objects::Kml.get_property(descr, 'ლამპიონის სამაგრი', '').to_ka(:all)
    obj.internet = Objects::Kml.get_property(descr, 'ინტერნეტი', '').to_ka(:all)
    obj.street_light = Objects::Kml.get_property(descr, 'გარე განათება', '').to_ka(:all)

    tpnumber = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ნომერი')
    obj.tp = Objects::Tp.by_name(tpnumber) if tpnumber.present?

    dir_num = Objects::Direction04.decode(Objects::Kml.get_property(descr, 'მიმართულება'))
    obj.direction = Objects::Direction04.get_or_create(dir_num, obj.tp)

    description = Objects::Kml.get_property(descr, 'Note_')
    obj.description = description.to_ka(:all) if description.present?

    obj.region = obj.tp.region if obj.tp.present?
    obj.substation = obj.tp.substation if obj.tp.present?
    obj.fider = obj.tp.fider if obj.tp.present?

    # end of description section
    coord = placemark.find('Point/coordinates').first.content
    obj.set_coordinate(coord)
    obj.save
  end

end
