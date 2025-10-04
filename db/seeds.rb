# Минимальные seeds

puts "🌱 Создаём пользователей..."

# Хелпер
def generate_email(phone)
  "#{phone.gsub(/\D/, '')}@fastchange.local"
end

# Админ
admin_phone = ENV['SUPER_ADMIN_PHONE'] || '+79177445182'
User.create!(
  email: generate_email(admin_phone),
  phone: admin_phone,
  full_name: 'Админ',
  password: 'password123',
  password_confirmation: 'password123',
  role: :admin,
  active: true
)

# Менеджер
User.create!(
  email: generate_email('+79111111111'),
  phone: '+79111111111',
  full_name: 'Менеджер 1',
  password: 'password123',
  password_confirmation: 'password123',
  role: :manager,
  active: true
)

# Клиент
User.create!(
  email: generate_email('+79999991000'),
  phone: '+79999991000',
  full_name: 'Клиент 1',
  password: 'password123',
  password_confirmation: 'password123',
  role: :client,
  active: true
)

puts "✅ Создано 3 пользователя"
puts "  Админ: #{admin_phone} / password123"
puts "  Менеджер: +79111111111 / password123"
puts "  Клиент: +79999991000 / password123"