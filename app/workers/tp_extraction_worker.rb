require 'xml'

class TpExtractionWorker
  include Sidekiq::Worker

  sidekiq_options retry: 2, backtrace: true

  def perform(placemark_xml)
    placemark = XML::Parser.string(placemark_xml).parse.child

    id=placemark.attributes['id']
    obj=Objects::Tp.where(kmlid: id).first || Objects::Tp.create(kmlid: id)
    # name=placemark.find('name').first.content
    # start description section
    descr=placemark.find('description').first.content
    obj.region = Region.get_by_name(Objects::Kml.get_property(descr, 'მუნიციპალიტეტი').to_ka(:all))
    obj.city = Objects::Kml.get_property(descr, 'ქალაქი/დაბა/საკრებულო ქალაქი/დაბა/საკრებულო')
    obj.street = Objects::Kml.get_property(descr, 'ქუჩის დასახელება')
    obj.village = Objects::Kml.get_property(descr, 'სოფელი')
    obj.name = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ნომერი')
    obj.tp_type = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ტიპი')
    obj.picture_id = Objects::Kml.get_property(descr, 'სურათის ნომერი')
    obj.power = Objects::Kml.get_property(descr, 'სიმძლავრე').to_f
    obj.stores = Objects::Kml.get_property(descr, 'შენობის სართულიანობა')
    obj.count_high_voltage = Objects::Kml.get_property(descr, 'მაღალი ძაბვის ამომრთველი').to_i
    obj.count_low_voltage = Objects::Kml.get_property(descr, 'დაბალი ძაბვის ამომრთველი').to_i
    obj.owner = Objects::Kml.get_property(descr, 'მესაკუთრე')
    obj.address_code = Objects::Kml.get_property(descr, 'საკადასტრო კოდი')
    address = Objects::Kml.get_property(descr, 'მთლიანი მისამართი')
    obj.address = address.to_ka(:all) if address
    fidername = Objects::Kml.get_property(descr, 'ფიდერი')
    obj.fider = Objects::Fider.by_name(fidername.to_ka(:all)) if fidername.present?
    substation_name = Objects::Kml.get_property(descr, 'ქვესადგური')
    obj.substation = Objects::Substation.by_name(substation_name.to_ka(:all)) if substation_name.present?
    linename = Objects::Kml.get_property(descr, 'ელექტრო გადამცემი ხაზი')
    obj.linename = linename.to_ka(:all) if linename.present?
    obj.description = Objects::Kml.get_property(descr, 'შენიშვნა')
    # end of description section
    coord=placemark.find('Point/coordinates').first.content
    obj.set_coordinate(coord)
    obj.save
  end

end
