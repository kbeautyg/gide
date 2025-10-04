# FastChange 3.0 - MVP Seeds

puts "🌱 Заполняем базу данных..."

# Хелпер для генерации email из телефона
def generate_email(phone)
  "#{phone.gsub(/\D/, '')}@fastchange.local"
end

# 1. Создаем курс валют
puts "💱 Устанавливаем курсы..."
ExchangeRate.create!(
  rub_to_thb: 0.37,
  rub_to_usd: 0.011,
  thb_to_rub: 2.7,
  usd_to_rub: 91.0,
  active: true
)

# 2. Создаем Админа
puts "👑 Создаем Админа..."
admin_phone = ENV['SUPER_ADMIN_PHONE'] || '+79177445182'
admin = User.create!(
  email: generate_email(admin_phone),
  phone: admin_phone,
  full_name: 'Админ',
  password: 'password123',
  password_confirmation: 'password123',
  role: :admin,
  active: true
)
puts "✅ Админ создан: #{admin.phone}"

# 3. Создаем Менеджеров
puts "👔 Создаем менеджеров..."
managers = []
[
  { phone: '+79111111111', name: 'Менеджер 1' },
  { phone: '+79222222222', name: 'Менеджер 2' },
  { phone: '+79333333333', name: 'Менеджер 3' }
].each do |data|
  manager = User.create!(
    email: generate_email(data[:phone]),
    phone: data[:phone],
    full_name: data[:name],
    password: 'password123',
    password_confirmation: 'password123',
    role: :manager,
    active: true
  )
  Balance.create!(user: manager)
  managers << manager
end
puts "✅ Создано #{managers.count} менеджеров"

# 4. Создаем Клиентов
puts "👥 Создаем клиентов..."
3.times do |i|
  client_phone = "+7999999#{1000 + i}"
  client = User.create!(
    email: generate_email(client_phone),
    phone: client_phone,
    full_name: "Клиент #{i+1}",
    password: 'password123',
    password_confirmation: 'password123',
    role: :client,
    active: true
  )
  Balance.create!(user: client)
end
puts "✅ Создано 3 клиента"

# 5. Создаем тестовые платежные ссылки
puts "🔗 Создаем тестовые платежные ссылки..."
2.times do |i|
  PaymentLink.create!(
    manager: managers.first,
    amount_from: 10000 + (i * 5000),
    rate: 0.37,
    currency_from: :rub,
    currency_to: :thb,
    status: :active,
    note: "Тестовая ссылка #{i+1}"
  )
end
puts "✅ Создано 2 платежные ссылки"

# 6. Создаем тестовую транзакцию
puts "💰 Создаем тестовую транзакцию..."
Transaction.create!(
  manager: managers.first,
  amount_from: 10000,
  amount_to: 3700,
  rate: 0.37,
  currency_from: :rub,
  currency_to: :thb,
  status: :completed,
  client_name: "Тестовый клиент",
  client_phone: "+79999991234",
  commission_percent: 2.0,
  commission_amount: 200
)
puts "✅ Создана 1 транзакция"

puts "\n🎉 База данных заполнена!"
puts "\n📝 Тестовые пользователи:"
puts "  Админ: #{admin.phone} / password123"
puts "  Менеджер: +79111111111 / password123"
puts "  Клиент: +79999991000 / password123"