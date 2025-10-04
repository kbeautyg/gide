class VolumeRate < ApplicationRecord
  belongs_to :created_by, class_name: 'User'
  belongs_to :scope_user, class_name: 'User', optional: true

  # Валидации
  validates :threshold_rub, presence: true, numericality: { greater_than: 0 }
  validates :rub_to_usd, :rub_to_thb, presence: true, numericality: { greater_than: 0 }

  # Скоупы
  scope :active, -> { where(active: true) }
  scope :global, -> { where(scope_user_id: nil) }
  scope :for_user, ->(user) { where(scope_user_id: user.id) }
  scope :ordered, -> { order(threshold_rub: :desc) }

  # Найти лучший объемный курс для суммы
  def self.best_rate_for_amount(amount_rub, user = nil)
    rates = active.ordered
    rates = rates.where(scope_user_id: [user&.id, nil]) if user
    
    rates.find { |rate| amount_rub >= rate.threshold_rub }
  end

  # Получить эффективный курс с учетом объема
  def self.effective_rate_for_amount(amount_rub, user = nil)
    volume_rate = best_rate_for_amount(amount_rub, user)
    return volume_rate if volume_rate
    
    # Если нет объемного курса, используем базовый
    ExchangeRate.current_for_user(user)
  end
end

