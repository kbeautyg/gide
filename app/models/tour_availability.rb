class TourAvailability < ApplicationRecord
  belongs_to :tour

  # Валидации
  validates :date, presence: true, uniqueness: { scope: :tour_id }
  validates :available_slots, numericality: { greater_than_or_equal_to: 0 }
  validates :booked_slots, numericality: { greater_than_or_equal_to: 0 }
  validate :booked_not_exceeds_available

  # Скоупы
  scope :available, -> { where(available: true) }
  scope :future, -> { where('date >= ?', Date.today) }
  scope :for_date_range, ->(start_date, end_date) { where(date: start_date..end_date) }

  # Доступные места
  def remaining_slots
    available_slots - booked_slots
  end

  # Полностью забронировано?
  def fully_booked?
    booked_slots >= available_slots
  end

  # Цена на эту дату (специальная или базовая)
  def price
    special_price.presence || tour.price
  end

  private

  def booked_not_exceeds_available
    return if booked_slots.nil? || available_slots.nil?
    errors.add(:booked_slots, 'не может превышать доступные места') if booked_slots > available_slots
  end
end

