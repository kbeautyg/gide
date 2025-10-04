# Money gem configuration
MoneyRails.configure do |config|
  # Set default currency
  config.default_currency = :rub

  # Set default bank for currency exchange
  config.default_bank = Money::Bank::VariableExchange.new(Money::RatesStore::Memory.new)

  # Add exchange rates (will be updated from Rapira API)
  config.default_bank.add_rate('RUB', 'USD', 0.011) # Примерный курс, будет обновляться
  config.default_bank.add_rate('RUB', 'THB', 0.37)  # Примерный курс, будет обновляться
  config.default_bank.add_rate('USD', 'RUB', 91.50)
  config.default_bank.add_rate('THB', 'RUB', 2.70)

  # Register currency with proper formatting
  config.no_cents_if_whole = false
  config.rounding_mode = BigDecimal::ROUND_HALF_UP

  # Locale backend
  config.locale_backend = :i18n
end

