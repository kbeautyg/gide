class Transaction < ApplicationRecord
  belongs_to :manager, class_name: 'User'
  belongs_to :client, class_name: 'User', optional: true
  belongs_to :payment_link, optional: true

  # Статусы
  enum status: { pending: 0, completed: 1, failed: 2 }, _prefix: true

  # Валюты
  enum currency_from: { rub: 0, thb: 1, usd: 2 }
  enum currency_to: { rub: 0, thb: 1, usd: 2 }

  # Валидации
  validates :amount_from, :amount_to, :rate, presence: true
  validates :amount_from, :amount_to, :rate, numericality: { greater_than: 0 }

  # Скоупы
  scope :recent, -> { order(created_at: :desc) }
  scope :completed_transactions, -> { where(status: :completed) }
  scope :by_manager, ->(manager_id) { where(manager_id: manager_id) }
end