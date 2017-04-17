class LinesUploadWorker
  include Sidekiq::Worker

  def perform(file, delete_old)
    if delete_old
      logger.info('Deleting Lines')
      Objects::Line.delete_all
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
    LineExtractionWorker.new.perform(kml)
  end

end
