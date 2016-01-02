class Pole04sUploadWorker
  include Sidekiq::Worker

  sidekiq_options retry: false


  def perform(file)
    Zip::File.open file do |zip_file|
      zip_file.each do |entry|
        upload_kml(entry.get_input_stream) if 'kml'==entry.name[-3..-1]
      end
    end
  end

private

  def upload_kml(file)
    Objects::Pole04.delete_all
    kml = file.read
    Objects::Pole04.from_kml(kml)
  end

end
