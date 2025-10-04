Devise.setup do |config|
  config.mailer_sender = 'noreply@fastchange.com'
  
  require 'devise/orm/active_record'
  
  # Используем phone вместо email для аутентификации
  config.authentication_keys = [:phone]
  config.case_insensitive_keys = [:phone]
  config.strip_whitespace_keys = [:phone]
  config.skip_session_storage = [:http_auth]
  config.stretches = Rails.env.test? ? 1 : 12
  config.reconfirmable = false
  config.expire_all_remember_me_on_sign_out = true
  config.password_length = 6..128
  config.reset_password_within = 6.hours
  config.sign_out_via = :delete
end

