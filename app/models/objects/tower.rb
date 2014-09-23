# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Tower
  include Mongoid::Document
  include Objects::Coordinate
  include Objects::Kml

  field :kmlid, type: String
  field :name, type: String
  field :category, type: String
  field :description, type: String
  field :linename, type: String
  belongs_to :region

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse ; root=doc.child
    kmlns="kml:#{KMLNS}"
    placemarks=doc.child.find '//kml:Placemark',kmlns
    placemarks.each do |placemark|
      id=placemark.attributes['id']
      name=placemark.find('./kml:name',kmlns).first.content
      # description content
      descr=placemark.find('./kml:description',kmlns).first.content
      s1='<td>რაიონი</td>'
      s2='<td>ანძის ტიპი</td>'
      s3='<td>გადამცემი ხაზი</td>'
      idx1=descr.index(s1)+s1.length
      idx2=descr.index(s2)+s2.length
      idx3=descr.index(s3)+s3.length
      regname=descr[idx1..-1].match(/<td>([^<])*<\/td>/)[0][4..-6].strip
      category=descr[idx2..-1].match(/<td>([^<])*<\/td>/)[0][4..-6].strip
      linename=descr[idx3..-1].match(/<td>([^<])*<\/td>/)[0][4..-6].strip
      region=Region.get_by_name(regname)
      # end of description section
      coord=placemark.find('./kml:Point/kml:coordinates',kmlns).first.content
      obj=Objects::Tower.where(kmlid:id).first || Objects::Tower.create(kmlid:id)
      obj.name=name ; obj.region=region ; obj.set_coordinate(coord)
      obj.category=category ; obj.linename=linename
      obj.save
    end
  end

  def generate_images
    images = Dir.glob("#{Pathfinder::POLES_HOME}/#{self.linename.to_lat}/#{self.name}_*.jpg") if self.linename
    if images.present?
      images.each { |url|  generate_images_from_file(url, File.basename(url)) }
    end
  end

  def to_kml(xml)
    descr = "<p>#<strong>#{self.name}</strong>, #{self.linename}</p><p>#{self.description}</p>"
    extra = extra_data('ანძის #' => name,
      'ანძის ტიპი' => category,
      'შენიშვნა' => description,
      'გადამცემი ხაზი' => linename,
      'რაიონი' => region.to_s
    )
    xml.Placemark do
      xml.name self.name
      xml.description { xml.cdata! "#{ descr } <!-- #{ extra } -->" }
      xml.Point { xml.coordinates "#{self.lng},#{self.lat},#{self.alt||0}" }
    end
  end
end
