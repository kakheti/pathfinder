class Direction04sUploadWorker
  include Sidekiq::Worker

  def perform(file, delete_old)
    if delete_old
      logger.info('Deleting Fider04s')
      Objects::Fider04.delete_all
      logger.info('Deleting Direction04s')
      Objects::Direction04.delete_all
    end

    Zip::File.open file do |zip_file|
      zip_file.each do |entry|
        upload_kml(entry.get_input_stream) if 'kml'==entry.name[-3..-1]
      end
    end
  end

  private

  def upload_kml(file)
    kml = file.read
    Objects::Fider04.from_kml(kml)
  end

end
