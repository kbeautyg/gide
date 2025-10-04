# TODO: Раскомментировать когда добавим Sidekiq обратно (ПРИОРИТЕТ 2)

# require 'sidekiq'
#
# Sidekiq.configure_server do |config|
#   config.redis = { url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/1') }
# end
#
# Sidekiq.configure_client do |config|
#   config.redis = { url: ENV.fetch('REDIS_URL', 'redis://localhost:6379/1') }
# end
#
# # Sidekiq options
# Sidekiq.strict_args!(false)

