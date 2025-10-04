class PaymentLink < ApplicationRecord
  belongs_to :manager, class_name: 'User'
  has_many :transactions, dependent: :nullify

  # Статусы
  enum status: { active: 0, completed: 1, expired: 2 }

  # Валюты
  enum currency_from: { rub: 0, thb: 1, usd: 2 }
  enum currency_to: { rub: 0, thb: 1, usd: 2 }

  # Валидации
  validates :amount_from, :amount_to, :rate, presence: true
  validates :amount_from, :amount_to, :rate, numericality: { greater_than: 0 }
  validates :token, presence: true, uniqueness: true

  # Callbacks
  before_validation :generate_token, on: :create
  before_validation :calculate_amount_to, on: :create

  # Скоупы
  scope :active_links, -> { where(status: :active) }
  scope :by_manager, ->(manager_id) { where(manager_id: manager_id) }

  # Публичный URL
  def public_url
    "#{ENV['APP_URL'] || 'http://localhost:3000'}/pay/#{token}"
  end

  # Отметить как оплаченную
  def mark_paid!(transaction)
    update!(
      status: :completed,
      transaction: transaction,
      paid_at: Time.current
    )
  end

  private

  def generate_token
    self.token = SecureRandom.urlsafe_base64(12)
  end

  def calculate_amount_to
    self.amount_to = amount_from * rate if amount_from.present? && rate.present?
  end
end
