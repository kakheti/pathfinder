class FidersUploadWorker
  include Sidekiq::Worker
  include Objects::Kml

  def perform(file, delete_old)
    if delete_old
      logger.info('Deleting Fiders')
      Objects::Fider.delete_all
      logger.info('Deleting FiderLines')
      Objects::FiderLine.delete_all
    end

    Zip::File.open file do |zip_file|
      zip_file.each do |entry|
        upload_kml(entry) if 'kml'==entry.name[-3..-1]
      end
    end
  end

  private

  def upload_kml(file)
    kml = file.get_input_stream.read
    doc = XML::Parser.string(kml).parse
    kmlns = "kml:#{KMLNS}"
    placemarks = doc.child.find('//kml:Placemark', kmlns)

    placemarks.each do |placemark|
      FiderExtractionWorker.new.perform(placemark.to_s)
    end
  end

end
