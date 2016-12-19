class Pole04sTxtUploadWorker
  include Sidekiq::Worker

  def perform(file_path)
    txt = File.read(file_path)
    Objects::Pole04.from_csv(txt)
  end
end
