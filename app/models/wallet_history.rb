class WalletHistory < ApplicationRecord
  belongs_to :user
  belongs_to :changed_by, class_name: 'User', optional: true

  # Валидации
  validates :new_address, presence: true
  validates :action, inclusion: { in: %w[create update delete] }

  # Скоупы
  scope :recent, -> { order(created_at: :desc) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }
end

