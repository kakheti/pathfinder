class OfficeUploadWorker
  include Sidekiq::Worker

  def perform(file, delete_old)
    if delete_old
      logger.info('Deleting Offices')
      Objects::Office.delete_all
    end
    Zip::File.open file do |zip_file|
      zip_file.each do |entry|
        upload_kml(entry) if 'kml' == entry.name[-3..-1]
      end
    end
  end

  private

  def upload_kml(entry)
    kml = entry.get_input_stream.read
    Objects::Office.from_kml(kml)
  end

end
