source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.2.2"

# Rails
gem "rails", "~> 7.1.2"

# Database
gem "pg", "~> 1.5"

# Asset pipeline
gem "sprockets-rails"
gem "importmap-rails"
gem "turbo-rails"
gem "stimulus-rails"
gem "tailwindcss-rails"

# Server
gem "puma", "~> 6.0"

# Timezone
gem "tzinfo-data", platforms: %i[ mingw mswin x64_mingw jruby ]

# Reduce Boot times
gem "bootsnap", require: false

# Authentication & Authorization
gem "devise", "~> 4.9"
gem "pundit", "~> 2.3"

# Background Jobs
gem "sidekiq", "~> 7.2"
gem "redis", "~> 5.0"

# API & HTTP
gem "httparty", "~> 0.21"
# gem "telegram-bot-ruby", "~> 1.0" # TODO: Добавить позже (ПРИОРИТЕТ 4)

# QR Codes
gem "rqrcode", "~> 2.2"

# Pagination
gem "pagy", "~> 6.2"

# Components
gem "view_component", "~> 3.9"

# Money handling
gem "money-rails", "~> 1.15"

# Russian localization
gem "rails-i18n", "~> 7.0"

# Cron jobs
gem "whenever", require: false

group :development, :test do
  gem "debug", platforms: %i[ mri mingw x64_mingw ]
  gem "rspec-rails", "~> 6.1"
  gem "factory_bot_rails", "~> 6.4"
  gem "faker", "~> 3.2"
  gem "pry-rails"
  gem "dotenv-rails"
end

group :development do
  gem "web-console"
  gem "brakeman", require: false
  gem "bundler-audit", require: false
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
  gem "simplecov", require: false
end

