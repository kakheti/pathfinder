require 'xml'
require 'digest/sha1'

class TpExtractionWorker
  include Sidekiq::Worker

  def perform(placemark_xml)
    placemark = XML::Parser.string(placemark_xml).parse.child
    descr = placemark.find('description').first.content

    region_name = Objects::Kml.get_property(descr, 'მუნიციპალიტეტი').to_ka(:all)
    substation_name = Objects::Kml.get_property(descr, 'ქვესადგური').to_ka(:all)
    name = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ნომერი')

    id = Digest::SHA1.hexdigest(name + substation_name + region_name)
    obj = Objects::Tp.where(id: id).first
    if obj
      logger.info("Updating existing TP #{id} #{region_name} #{substation_name} \##{name}")
    else
      logger.info("Uploading new TP #{id} #{region_name} #{substation_name} \##{name}")
      obj = Objects::Tp.new(kmlid: id, _id: id)
    end

    obj.region_name = region_name
    obj.name = name
    obj.substation_name = substation_name

    obj.region = Region.get_by_name(obj.region_name)
    return logger.error("Invalid region name #{obj.region_name} for object #{id}") unless obj.region
    obj.substation = Objects::Substation.where(name: obj.substation_name).first
    return logger.error("Invalid substation name #{obj.substation_name} for object #{id}") unless obj.substation
    obj.fider_name = Objects::Kml.get_property(descr, 'ფიდერი').to_ka(:all)
    return logger.error("No fider name for object #{id}") unless obj.fider_name
    obj.fider = Objects::Fider.where(name: obj.fider_name, substation: obj.substation, region: obj.region).first

    obj.city = Objects::Kml.get_property(descr, 'ქალაქი/დაბა/საკრებულო ქალაქი/დაბა/საკრებულო')
    obj.street = Objects::Kml.get_property(descr, 'ქუჩის დასახელება')
    obj.village = Objects::Kml.get_property(descr, 'სოფელი')
    obj.tp_type = Objects::Kml.get_property(descr, 'ტრანსფორმატორის ტიპი')
    obj.picture_id = Objects::Kml.get_property(descr, 'სურათის ნომერი')
    obj.power = Objects::Kml.get_property(descr, 'სიმძლავრე').to_f
    obj.stores = Objects::Kml.get_property(descr, 'შენობის სართულიანობა')
    obj.count_high_voltage = Objects::Kml.get_property(descr, 'მაღალი ძაბვის ამომრთველი').to_i
    obj.count_low_voltage = Objects::Kml.get_property(descr, 'დაბალი ძაბვის ამომრთველი').to_i
    obj.owner = { 'ked' => 'კედ', 'other' => 'სხვა' }[Objects::Kml.get_property(descr, 'მესაკუთრე')]
    obj.address_code = Objects::Kml.get_property(descr, 'საკადასტრო კოდი')
    address = Objects::Kml.get_property(descr, 'მთლიანი მისამართი')
    obj.address = address.to_ka(:all) if address
    obj.linename = Objects::Kml.get_property(descr, 'ელექტრო გადამცემი ხაზი').to_ka(:all)
    obj.description = Objects::Kml.get_property(descr, 'შენიშვნა')

    coord = placemark.find('Point/coordinates').first.content
    obj.set_coordinate(coord)
    obj.save
  end
end
