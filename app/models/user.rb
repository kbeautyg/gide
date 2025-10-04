class User < ApplicationRecord
  # Devise (БЕЗ email validation)
  devise :database_authenticatable, :registerable, :recoverable, :rememberable
  
  # Валидация телефона
  validates :phone, presence: true, uniqueness: true
  validates :password, presence: true, length: { minimum: 6 }, if: :password_required?
  
  # Роли
  enum role: { admin: 0, manager: 1, client: 2 }
  
  # Переопределяем методы Devise для phone
  def email_required?
    false
  end
  
  def email_changed?
    false
  end
  
  def will_save_change_to_email?
    false
  end
  
  private
  
  def password_required?
    !persisted? || !password.nil? || !password_confirmation.nil?
  end
end