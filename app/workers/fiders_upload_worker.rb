class FidersUploadWorker
  include Sidekiq::Worker


  def perform(file)
    Zip::File.open file do |zip_file|
      zip_file.each do |entry|
        upload_kml(entry) if 'kml'==entry.name[-3..-1]
      end
    end
  end


private

  def upload_kml(file)
    Objects::Fider.delete_all
    kml = file.get_input_stream.read
    Objects::Fider.from_kml(kml)
  end

end
