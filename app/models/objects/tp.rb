# -*- encoding : utf-8 -*-
class Objects::Tp
  include Mongoid::Document
  include Objects::Coordinate
  include Objects::Kml

  field :kmlid, type: String
  field :name, type: String
  field :description, type: String
  field :picture_id, type: String
  field :power, type: Float
  field :owner, type: String
  field :fider, type: String
  field :address_code, type: String
  field :address, type: String
  belongs_to :region

  def self.from_kml(xml)
    # parser=XML::Parser.string xml
    # doc=parser.parse ; root=doc.child
    # kmlns="kml:#{KMLNS}"
    # placemarks=doc.child.find '//kml:Placemark',kmlns
    # placemarks.each do |placemark|
    #   id=placemark.attributes['id']
    #   name=placemark.find('./kml:name',kmlns).first.content
    #   # description content
    #   descr=placemark.find('./kml:description',kmlns).first.content
    #   s1='<td>რაიონი</td>'
    #   s2='<td>მისამართი</td>'
    #   idx1=descr.index(s1)+s1.length
    #   idx2=descr.index(s2)+s2.length
    #   regname=descr[idx1..-1].match(/<td>([^<])*<\/td>/)[0][4..-6].strip
    #   address=descr[idx2..-1].match(/<td>([^<])*<\/td>/)[0][4..-6].strip
    #   region=Region.get_by_name(regname)
    #   # end of description section
    #   coord=placemark.find('./kml:Point/kml:coordinates',kmlns).first.content
    #   obj=Objects::Tp.where(kmlid:id).first || Objects::Tp.create(kmlid:id)
    #   obj.name=name
    #   obj.region=region
    #   obj.address=address
    #   obj.set_coordinate(coord)
    #   obj.save
    # end
  end

  def to_kml(xml)
    # descr = "<p><strong>#{self.region}</strong>, #{self.address}</p><p>#{self.description}</p>"
    # extra = extra_data( 'დასახელება' => name,
    #   'შენიშვნა' => description,
    #   'მისამართი' => address,
    #   'რაიონი' => region.to_s
    # )
    # xml.Placemark do
    #   xml.name self.name
    #   xml.description { xml.cdata! "#{ descr } <!-- #{ extra } -->" }
    #   xml.Point { xml.coordinates "#{self.lng},#{self.lat},#{self.alt||0}" }
    # end
  end
end
