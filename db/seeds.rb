# Seed данные для FastChange 3.0

puts "🌱 Начинаем заполнение базы данных..."

# Хелпер для генерации фейкового email из телефона
def generate_email(phone)
  "#{phone.gsub(/\D/, '')}@fastchange.local"
end

# Очистка (только для development!)
if Rails.env.development?
  puts "🧹 Очистка существующих данных..."
  [CashbookTransaction, CashbookCard, Review, Booking, TourAvailability, Tour,
   WalletHistory, Wallet, ExchangerRequest, WithdrawalRequest, PaymentForm,
   Transaction, VolumeRate, ExchangeRate, Balance, User].each(&:destroy_all)
end

# 1. Создаем Супер-Админа
puts "👑 Создаем Супер-Админа..."
super_admin_phone = ENV['SUPER_ADMIN_PHONE'] || '+79177445182'
super_admin = User.create!(
  email: "#{super_admin_phone.gsub(/\D/, '')}@fastchange.local",  # Генерим фейковый email
  phone: super_admin_phone,
  full_name: 'Супер Админ',
  password: 'password123',
  password_confirmation: 'password123',
  role: :super_admin,
  active: true
)
Balance.create!(user: super_admin)
puts "✅ Супер-Админ создан: #{super_admin.phone}"

# 2. Создаем базовые курсы
puts "💱 Устанавливаем базовые курсы..."
ExchangeRate.create!(
  rub_to_usd: 0.0109,
  rub_to_thb: 0.37,
  usd_to_rub: 91.50,
  thb_to_rub: 2.70,
  created_by: super_admin,
  source: 'manual',
  active: true
)

# 3. Создаем объемные курсы
puts "📊 Создаем объемные курсы..."
[
  { threshold: 100_000, usd_rate: 0.0110 },
  { threshold: 200_000, usd_rate: 0.0110 },
  { threshold: 500_000, usd_rate: 0.0109 }
].each do |rate_data|
  VolumeRate.create!(
    threshold_rub: rate_data[:threshold],
    rub_to_usd: rate_data[:usd_rate],
    rub_to_thb: 0.37,
    created_by: super_admin,
    active: true
  )
end

# 4. Создаем Админов
puts "👨‍💼 Создаем Админов..."
admin_farukh_phone = '+79111111111'
admin_farukh = User.create!(
  email: generate_email(admin_farukh_phone),
  phone: admin_farukh_phone,
  full_name: 'Farukh Kerimov',
  password: 'password123',
  password_confirmation: 'password123',
  role: :admin,
  parent: super_admin,
  active: true
)
Balance.create!(user: admin_farukh)

admin_kiril_phone = '+79222222222'
admin_kiril = User.create!(
  email: generate_email(admin_kiril_phone),
  phone: admin_kiril_phone,
  full_name: 'Kiril',
  password: 'password123',
  password_confirmation: 'password123',
  role: :admin,
  parent: super_admin,
  active: true
)
Balance.create!(user: admin_kiril)

puts "✅ Создано #{User.where(role: :admin).count} админов"

# 5. Создаем Супер-Менеджеров
puts "👔 Создаем Супер-Менеджеров..."
super_manager_phone = '+79333333333'
super_manager = User.create!(
  email: generate_email(super_manager_phone),
  phone: super_manager_phone,
  full_name: 'Супер Менеджер',
  password: 'password123',
  password_confirmation: 'password123',
  role: :super_manager,
  parent: admin_farukh,
  active: true
)
Balance.create!(user: super_manager)

# 6. Создаем Менеджеров (Гидов)
puts "🎭 Создаем Менеджеров/Гидов..."
managers_data = [
  { email: 'rubi@rubi.com', phone: '+79444444444', name: 'Rubi', parent: admin_farukh },
  { email: 'yoska@yoska.com', phone: '+79555555555', name: 'Yoska', parent: admin_farukh },
  { email: 'usama@usama.ru', phone: '+79666666666', name: 'Usama', parent: admin_farukh },
  { email: 'flower@nadi.com', phone: '+79777777777', name: 'Flower Nadi', parent: admin_farukh }
]

managers_data.each do |data|
  manager = User.create!(
    email: generate_email(data[:phone]),
    phone: data[:phone],
    full_name: data[:name],
    password: 'password123',
    password_confirmation: 'password123',
    role: :manager,
    parent: data[:parent],
    active: true
  )
  Balance.create!(user: manager)
end

puts "✅ Создано #{User.where(role: :manager).count} менеджеров"

# 7. Создаем Обменников
puts "💵 Создаем Обменников..."
exchanger_phone = '+79888888888'
exchanger = User.create!(
  email: generate_email(exchanger_phone),
  phone: exchanger_phone,
  full_name: 'Обменник 1',
  password: 'password123',
  password_confirmation: 'password123',
  role: :exchanger,
  active: true
)
Balance.create!(user: exchanger)

# 8. Создаем тестовых Клиентов
puts "👥 Создаем тестовых клиентов..."
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
  
  # Создаем кэшбук-карту для клиента
  CashbookCard.create!(
    client: client,
    card_number: "CB#{10000 + i}",
    balance: 5000.0,
    active: true
  )
end

puts "✅ Создано #{User.where(role: :client).count} клиентов"

# 9. Создаем тестовые экскурсии
puts "🎪 Создаем экскурсии..."
tours_data = [
  {
    title: 'Острова Пхи-Пхи на скоростной лодке',
    description: 'Незабываемая поездка на знаменитые острова Пхи-Пхи. Посещение бухты Майя Бэй, снорклинг в кристально чистой воде, обед на пляже.',
    price: 2500,
    duration_hours: 8,
    city: 'Phuket',
    category: 'Морские прогулки',
    max_participants: 15
  },
  {
    title: 'Обзорная экскурсия по Бангкоку',
    description: 'Посещение главных храмов столицы: Ват Пхо, Ват Арун, Большой дворец. Прогулка по каналам на лодке.',
    price: 1800,
    duration_hours: 6,
    city: 'Bangkok',
    category: 'Экскурсии',
    max_participants: 10
  },
  {
    title: 'Рафтинг и джунгли',
    description: 'Экстремальный сплав по горной реке, посещение слоновьего питомника, обед в джунглях.',
    price: 3200,
    duration_hours: 10,
    city: 'Phuket',
    category: 'Активный отдых',
    max_participants: 12
  }
]

managers = User.where(role: :manager).to_a
tours_data.each_with_index do |tour_data, index|
  tour = Tour.create!(
    manager: managers[index % managers.size],
    title: tour_data[:title],
    description: tour_data[:description],
    price: tour_data[:price],
    currency: 'THB',
    duration_hours: tour_data[:duration_hours],
    city: tour_data[:city],
    category: tour_data[:category],
    max_participants: tour_data[:max_participants],
    rating: rand(4.0..5.0).round(1),
    active: true,
    featured: index == 0
  )
  
  # Создаем доступность на ближайшие 30 дней
  30.times do |day|
    TourAvailability.create!(
      tour: tour,
      date: Date.today + day.days,
      available_slots: tour.max_participants,
      available: true
    )
  end
end

puts "✅ Создано #{Tour.count} экскурсий"

# 10. Создаем тестовые транзакции
puts "💳 Создаем тестовые транзакции..."
managers = User.where(role: :manager).to_a
clients = User.where(role: :client).to_a

10.times do
  Transaction.create!(
    manager: managers.sample,
    client: clients.sample,
    amount_rub: rand(5_000..50_000),
    target_currency: ['USD', 'THB'].sample,
    amount_foreign: rand(100..1000),
    exchange_rate: 91.50,
    commission_rub: rand(150..1500),
    commission_percentage: 3.0,
    status: :completed,
    payment_method: ['sbp', 'card', 'qr'].sample,
    created_at: rand(30.days.ago..Time.now)
  )
end

puts "✅ Создано #{Transaction.count} транзакций"

puts ""
puts "🎉 База данных успешно заполнена!"
puts ""
puts "📋 Статистика:"
puts "  Пользователей: #{User.count}"
puts "  - Супер-Админов: #{User.where(role: :super_admin).count}"
puts "  - Админов: #{User.where(role: :admin).count}"
puts "  - Супер-Менеджеров: #{User.where(role: :super_manager).count}"
puts "  - Менеджеров: #{User.where(role: :manager).count}"
puts "  - Обменников: #{User.where(role: :exchanger).count}"
puts "  - Клиентов: #{User.where(role: :client).count}"
puts ""
puts "  Экскурсий: #{Tour.count}"
puts "  Транзакций: #{Transaction.count}"
puts "  Кэшбук-карт: #{CashbookCard.count}"
puts ""
puts "🔑 Тестовые учетные данные:"
puts "  Супер-Админ: superadmin@fastchange.com / password123"
puts "  Админ: farukh_kerimov@mail.ru / password123"
puts "  Менеджер: rubi@rubi.com / password123"
puts "  Клиент: client1@example.com / password123"

