# -*- encoding : utf-8 -*-

$redis = Redis.new(url: 'redis://localhost/15', password: ENV['REDIS_SECRET'])
