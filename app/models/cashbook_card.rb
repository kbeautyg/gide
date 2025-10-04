class CashbookCard < ApplicationRecord
  belongs_to :client, class_name: 'User'
  has_many :cashbook_transactions, dependent: :destroy

  # Валидации
  validates :card_number, presence: true, uniqueness: true
  validates :balance, :bonus_balance, numericality: { greater_than_or_equal_to: 0 }

  # Callbacks
  before_validation :generate_card_number, on: :create

  # Скоупы
  scope :active, -> { where(active: true, blocked: false) }

  # Пополнить карту
  def top_up!(amount, description = 'Пополнение баланса')
    transaction do
      self.balance += amount
      self.total_topped_up += amount
      save!

      cashbook_transactions.create!(
        amount: amount,
        transaction_type: :top_up,
        description: description,
        balance_after: balance
      )
    end
  end

  # Оплата с карты
  def pay!(amount, booking, description = 'Оплата экскурсии')
    return false if total_balance < amount
    
    transaction do
      amount_from_balance = [balance, amount].min
      amount_from_bonus = amount - amount_from_balance

      self.balance -= amount_from_balance
      self.bonus_balance -= amount_from_bonus
      self.total_spent += amount
      save!

      cashbook_transactions.create!(
        amount: -amount,
        transaction_type: :payment,
        description: description,
        booking: booking,
        balance_after: balance
      )
    end
  end

  # Начислить кэшбэк
  def add_cashback!(amount, description = 'Кэшбэк')
    transaction do
      self.bonus_balance += amount
      self.total_cashback_earned += amount
      save!

      cashbook_transactions.create!(
        amount: amount,
        transaction_type: :cashback,
        description: description,
        balance_after: balance
      )
    end
  end

  # Общий доступный баланс
  def total_balance
    balance + bonus_balance
  end

  # Заблокировать карту
  def block!(reason)
    update!(blocked: true, block_reason: reason)
  end

  # Разблокировать карту
  def unblock!
    update!(blocked: false, block_reason: nil)
  end

  private

  def generate_card_number
    self.card_number = "CB#{SecureRandom.random_number(10**10).to_s.rjust(10, '0')}"
  end
end

