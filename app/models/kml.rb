require 'builder'
require 'zip'

module Kml
  def kml_document
    xml = Builder::XmlMarkup.new
    xml.instruct!
    xml.kml(
      'xmlns' => 'http://www.opengis.net/kml/2.2',
      'xmlns:gx' => 'http://www.google.com/kml/ext/2.2',
      'xmlns:xsi' => 'http://www.w3.org/2001/XMLSchema-instance',
      'xsi:schemaLocation' => 'http://www.opengis.net/kml/2.2 http://schemas.opengis.net/kml/2.2.0/ogckml22.xsd http://www.google.com/kml/ext/2.2 http://code.google.com/apis/kml/schema/kml22gx.xsd'
    ) do |xml|
      yield xml
    end
    xml.target!
  end

  def to_kmz
    temp_file = Tempfile.new('kmlfile')
    begin
      Zip::OutputStream.open(temp_file.path) do |zos|
        zos.put_next_entry 'doc.kml'
        zos.puts self.to_kml
      end
      return File.read(temp_file.path)
    ensure
      temp_file.close
      temp_file.unlink
    end
  end

  def extended_data(xml, hash)
    xml.ExtendedData do
      hash.each do |k,v|
        xml.Data('name' => k) do
          xml.value v.to_s
        end
      end
    end
  end
end