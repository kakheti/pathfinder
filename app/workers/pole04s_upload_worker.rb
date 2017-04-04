class Pole04sUploadWorker
  include Sidekiq::Worker

  def perform(file, delete_old)
    if delete_old
      logger.info('Deleting Pole04s')
      Objects::Pole04.delete_all
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
    Objects::Pole04.from_kml(kml)
  end

end
