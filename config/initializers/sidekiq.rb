Sidekiq.configure_server do |config|
  config.redis = { url: 'redis://localhost/2' }

  config.server_middleware do |chain|
    chain.remove Sidekiq::Middleware::Server::RetryJobs
  end
end

Sidekiq.configure_client do |config|
  config.redis = { url: 'redis://localhost/2' }
end

Sidekiq.default_worker_options = { retry: false }