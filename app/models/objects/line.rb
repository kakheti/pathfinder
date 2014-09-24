# -*- encoding : utf-8 -*-
require 'xml'

class Objects::Line
  include Mongoid::Document
  include Objects::Kml
  include Objects::LengthProperty

  field :kmlid, type: String
  field :name, type: String
  field :direction, type: String
  field :description, type: String
  belongs_to :region
  embeds_many :points, class_name: 'Objects::LinePoint'

  def set_points(points)
    self.points.destroy_all
    points.each do |p|
      lat,lng=p[0],p[1]
      point=self.points.new(line:self)
      point.lat=lat ; point.lng=lng
      point.save
    end
  end

  def self.from_kml(xml)
    parser=XML::Parser.string xml
    doc=parser.parse ; root=doc.child
    kmlns="kml:#{KMLNS}"
    placemarks=doc.child.find '//kml:Placemark',kmlns
    placemarks.each do |placemark|
      id=placemark.attributes['id']
      name=placemark.find('./kml:name',kmlns).first.content
      coords=placemark.find('./kml:MultiGeometry/kml:LineString/kml:coordinates',kmlns).first.content
      # description content
      descr=placemark.find('./kml:description',kmlns).first.content
      s1='<td>რეგიონი</td>'
      s2='<td>მიმართულება</td>'
      idx1=descr.index(s1)+s1.length
      idx2=descr.index(s2)+s2.length
      regname=descr[idx1..-1].match(/<td>([^<])*<\/td>/)[0][4..-6].strip
      direction=descr[idx2..-1].match(/<td>([^<])*<\/td>/)[0][4..-6].strip
      region=Region.where(name:regname).first
      region=Region.create(name:regname) if region.blank?
      # end of description section
      obj=Objects::Line.where(kmlid:id).first || Objects::Line.create(kmlid:id)
      obj.direction=direction ; obj.region=region ; obj.name=name; obj.save
      obj.points.destroy_all
      coords.split(' ').each do |coord|
        point=obj.points.new(line:obj)
        point.set_coordinate(coord)
        point.save
      end
      obj.calc_length!
    end
  end

  def to_kml(xml)
    extra = extra_data('დასახელება' => name,
      'მიმართულება' => direction,
      'შენიშვნა' => description,
      'რაიონი' => region.to_s,
      'სიგრძე' => length
    )
    xml.Placemark(id: "ID_#{self.id.to_s}") do |xml|
      xml.name self.name
      xml.description "<p>#{self.name}, #{self.direction}</p> <!-- #{extra} -->"
      xml.MultiGeometry do |xml|
        xml.LineString do
          xml.extrude 0
          xml.altitudeMode 'clampedToGround'
          xml.coordinates ' ' + self.points.map{|p| [p.lng, p.lat, p.alt||0].join(',')}.join(' ')
        end
      end
    end
  end
end

class Objects::LinePoint
  include Mongoid::Document
  include Objects::Coordinate
  embedded_in :line, class_name: 'Objects::Line'
end
