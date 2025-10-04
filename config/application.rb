require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Fastchange
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w(assets tasks))

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments/, which are processed later.

    # 🔧 ИСПРАВЛЕНИЕ БАГА: Московское время (UTC+3) везде
    config.time_zone = "Moscow"
    config.active_record.default_timezone = :local
    
    # Русская локализация по умолчанию
    config.i18n.default_locale = :ru
    config.i18n.available_locales = [:ru, :en]
    config.i18n.fallbacks = [:en]

    # Generators configuration
    config.generators do |g|
      g.test_framework :rspec,
        fixtures: false,
        view_specs: false,
        helper_specs: false,
        routing_specs: false,
        request_specs: true
      g.fixture_replacement :factory_bot, dir: "spec/factories"
    end

    # Active Job configuration
    # config.active_job.queue_adapter = :sidekiq # TODO: Раскомментировать с Sidekiq
    config.active_job.queue_adapter = :async # Временно используем async

    # Middleware configuration
    # config.middleware.use Rack::Attack # TODO: Добавить rack-attack gem позже для rate limiting

    # Don't generate system test files.
    config.generators.system_tests = nil
  end
end

