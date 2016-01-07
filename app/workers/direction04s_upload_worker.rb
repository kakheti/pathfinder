class Direction04sUploadWorker
  include Sidekiq::Worker

  sidekiq_options retry: 2


  def perform(file)
    Zip::File.open file do |zip_file|
      zip_file.each do |entry|
        upload_kml(entry.get_input_stream) if 'kml'==entry.name[-3..-1]
      end
    end
  end

private

  def upload_kml(file)
    Objects::Fider04.delete_all
    kml = file.read
    Objects::Fider04.from_kml(kml)
  end


end
