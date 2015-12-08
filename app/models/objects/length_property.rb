# -*- encoding : utf-8 -*-
module Objects::LengthProperty
  def self.included(base)
    base.field :length, type: Float
    base.before_save :on_before_lineable_save
  end

  def calc_length
    len=0; points=self.points.to_a
    (1..points.length-1).each do |idx|
      p1 = points[idx-1]; p2=points[idx]
      a1 = Geokit::LatLng.new(p1.lat, p1.lng)
      a2 = Geokit::LatLng.new(p2.lat, p2.lng)
      len += a1.distance_to(a2)
    end
    len
  end

  def calc_length!
    self.length = calc_length
    self.save
  end

  private
  def on_before_lineable_save
    self.length=self.calc_length
  end
end
