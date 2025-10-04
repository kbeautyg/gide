class Booking < ApplicationRecord
  belongs_to :tour
  belongs_to :client, class_name: 'User'
  belongs_to :payment_transaction, class_name: 'Transaction', foreign_key: 'transaction_id', optional: true
  has_many :reviews, dependent: :nullify

  # Статусы
  enum status: {
    pending: 0,
    confirmed: 1,
    cancelled: 2,
    completed: 3
  }

  enum payment_status: {
    pending: 0,
    paid: 1,
    refunded: 2
  }

  # Валидации
  validates :tour_date, :participants_count, :price_per_person, :total_price, presence: true
  validates :participants_count, numericality: { greater_than: 0 }
  validates :client_name, :client_phone, presence: true

  # Callbacks
  before_validation :set_prices, on: :create
  before_validation :generate_voucher, on: :create
  after_create :book_tour_slots
  after_update :handle_cancellation, if: :saved_change_to_status_to_cancelled?

  # Скоупы
  scope :recent, -> { order(created_at: :desc) }
  scope :by_status, ->(status) { where(status: status) }
  scope :by_tour, ->(tour_id) { where(tour_id: tour_id) }
  scope :by_client, ->(client_id) { where(client_id: client_id) }
  scope :upcoming, -> { where('tour_date >= ?', Date.today).order(tour_date: :asc) }
  scope :past, -> { where('tour_date < ?', Date.today).order(tour_date: :desc) }

  # Подтвердить бронирование
  def confirm!(manager)
    return false unless pending?
    
    update!(
      status: :confirmed,
      confirmed_at: Time.current
    )
  end

  # Отменить бронирование
  def cancel!(reason)
    return false if cancelled? || completed?
    
    transaction do
      update!(
        status: :cancelled,
        cancelled_at: Time.current,
        cancellation_reason: reason
      )

      # Возвращаем средства если оплачено
      refund_if_paid if paid?
    end
  end

  # Отметить как завершенное
  def mark_completed!
    return false unless confirmed?
    return false if tour_date > Date.today
    
    update!(status: :completed)
  end

  # Оплатить бронирование
  def mark_paid!(txn = nil)
    update!(
      payment_status: :paid,
      payment_transaction: txn
    )
  end

  # Можно ли оставить отзыв?
  def can_review?
    completed? && paid? && reviews.none?
  end

  private

  def set_prices
    self.price_per_person = tour.price
    self.total_price = price_per_person * participants_count
    self.currency = tour.currency
  end

  def generate_voucher
    self.voucher_code = "VC#{SecureRandom.hex(6).upcase}"
  end

  def book_tour_slots
    tour.book_slots!(tour_date, participants_count)
  end

  def handle_cancellation
    tour.release_slots!(tour_date, participants_count)
  end

  def refund_if_paid
    update!(payment_status: :refunded)
    
    # Возврат на кэшбук-карту если использовалась
    if paid_with_cashbook?
      card = client.cashbook_card
      card.balance += total_price
      card.save!
      
      CashbookTransaction.create!(
        cashbook_card: card,
        amount: total_price,
        transaction_type: :refund,
        description: "Возврат за отмененное бронирование #{voucher_code}",
        booking: self,
        balance_after: card.balance
      )
    end
  end
end

