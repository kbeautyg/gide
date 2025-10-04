class Rack::Attack
  # Throttle all requests by IP
  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip unless req.path.start_with?('/assets')
  end

  # Throttle POST requests to /users/sign_in
  throttle('logins/ip', limit: 5, period: 20.seconds) do |req|
    if req.path == '/users/sign_in' && req.post?
      req.ip
    end
  end

  # Throttle POST requests to /api/* by IP address
  throttle("api/ip", limit: 100, period: 1.minute) do |req|
    if req.path.start_with?('/api')
      req.ip
    end
  end

  # Block suspicious requests
  blocklist('bad_requests') do |req|
    # Block if path contains SQLi patterns
    Rack::Attack::Allow2Ban.filter(req.ip, maxretry: 3, findtime: 1.minute, bantime: 10.minutes) do
      req.path.include?('etc/passwd') || 
      req.path.include?('../') ||
      req.query_string.include?('UNION') ||
      req.query_string.include?('SELECT')
    end
  end
end

# Customize throttled response
Rack::Attack.throttled_responder = lambda do |request|
  match_data = request.env['rack.attack.match_data']
  now = match_data[:epoch_time]

  headers = {
    'RateLimit-Limit' => match_data[:limit].to_s,
    'RateLimit-Remaining' => '0',
    'RateLimit-Reset' => (now + (match_data[:period] - now % match_data[:period])).to_s
  }

  [ 429, headers, ["Слишком много запросов. Пожалуйста, повторите позже.\n"]]
end

