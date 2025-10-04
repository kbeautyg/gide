class ExchangeRate < ApplicationRecord
  belongs_to :created_by, class_name: 'User', optional: true
  belongs_to :scope_user, class_name: 'User', optional: true

  # Валидации
  validates :rub_to_usd, :rub_to_thb, :usd_to_rub, :thb_to_rub, 
            presence: true, 
            numericality: { greater_than: 0 }
  validates :source, inclusion: { in: %w[manual rapira_api] }

  # Скоупы
  scope :active, -> { where(active: true) }
  scope :global, -> { where(scope_user_id: nil) }
  scope :for_user, ->(user) { where(scope_user_id: user.id) }

  # Получить активный курс для пользователя
  def self.current_for_user(user)
    # Сначала ищем персональный курс, потом глобальный
    active.where(scope_user_id: [user.id, nil])
          .order('scope_user_id DESC NULLS LAST')
          .first
  end

  # Получить глобальный курс
  def self.global_rate
    active.global.order(created_at: :desc).first
  end

  # Конвертация
  def convert_rub_to_usd(amount_rub)
    (amount_rub * rub_to_usd).round(2)
  end

  def convert_rub_to_thb(amount_rub)
    (amount_rub * rub_to_thb).round(2)
  end

  def convert_usd_to_rub(amount_usd)
    (amount_usd * usd_to_rub).round(2)
  end

  def convert_thb_to_rub(amount_thb)
    (amount_thb * thb_to_rub).round(2)
  end
end

