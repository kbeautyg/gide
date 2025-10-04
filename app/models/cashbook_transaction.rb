class CashbookTransaction < ApplicationRecord
  belongs_to :cashbook_card
  belongs_to :booking, optional: true

  # Типы транзакций
  enum transaction_type: {
    top_up: 0,
    payment: 1,
    cashback: 2,
    refund: 3,
    adjustment: 4
  }

  # Валидации
  validates :amount, :balance_after, presence: true
  validates :amount, numericality: true

  # Скоупы
  scope :recent, -> { order(created_at: :desc) }
  scope :by_type, ->(type) { where(transaction_type: type) }
  scope :positive, -> { where('amount > 0') }
  scope :negative, -> { where('amount < 0') }

  # Форматирование суммы для UI
  def formatted_amount
    amount >= 0 ? "+#{amount}" : amount.to_s
  end

  # Описание типа на русском
  def type_label
    I18n.t("cashbook_transaction.type.#{transaction_type}")
  end
end

