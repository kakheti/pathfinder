Sidekiq.configure_server do |config|
  config.redis = { url: 'redis://localhost/2', password: ENV['REDIS_SECRET'] }
end

Sidekiq.configure_client do |config|
  config.redis = { url: 'redis://localhost/2', password: ENV['REDIS_SECRET'] }
end
