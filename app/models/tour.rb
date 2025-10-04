class Tour < ApplicationRecord
  belongs_to :manager, class_name: 'User'
  has_many :tour_availabilities, dependent: :destroy
  has_many :bookings, dependent: :destroy
  has_many :reviews, dependent: :destroy

  # Валидации
  validates :title, :description, :price, :duration_hours, :city, presence: true
  validates :price, numericality: { greater_than: 0 }
  validates :duration_hours, numericality: { greater_than: 0 }
  validates :rating, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 5 }

  # Callbacks
  after_create :create_initial_availability

  # Скоупы
  scope :active, -> { where(active: true) }
  scope :featured, -> { where(featured: true) }
  scope :by_city, ->(city) { where(city: city) }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_manager, ->(manager_id) { where(manager_id: manager_id) }
  scope :popular, -> { where('rating >= 4.0').order(bookings_count: :desc, rating: :desc) }

  # Поиск
  scope :search, ->(query) { 
    where('title ILIKE ? OR description ILIKE ?', "%#{query}%", "%#{query}%") 
  }

  # Фильтр по цене
  scope :price_between, ->(min, max) { where(price: min..max) }

  # Доступность на дату
  def available_on?(date)
    availability = tour_availabilities.find_by(date: date)
    return false unless availability
    
    availability.available && availability.available_slots > availability.booked_slots
  end

  # Получить доступные места на дату
  def available_slots_on(date)
    availability = tour_availabilities.find_by(date: date)
    return 0 unless availability&.available
    
    availability.available_slots - availability.booked_slots
  end

  # Забронировать места
  def book_slots!(date, count)
    availability = tour_availabilities.find_or_create_by(date: date) do |a|
      a.available_slots = max_participants
      a.available = true
    end

    return false if availability.available_slots - availability.booked_slots < count
    
    availability.increment!(:booked_slots, count)
    increment!(:bookings_count)
    true
  end

  # Освободить места (при отмене)
  def release_slots!(date, count)
    availability = tour_availabilities.find_by(date: date)
    return unless availability
    
    availability.decrement!(:booked_slots, [count, availability.booked_slots].min)
    decrement!(:bookings_count, 1)
  end

  # Обновить рейтинг
  def update_rating!
    avg_rating = reviews.approved.average(:rating)&.to_f || 0.0
    count = reviews.approved.count
    
    update!(rating: avg_rating.round(1), reviews_count: count)
  end

  # Инкремент просмотров
  def increment_views!
    increment!(:views_count)
  end

  # Главное фото или дефолтное
  def main_photo
    cover_photo.presence || photos.first || '/assets/tour_placeholder.jpg'
  end

  private

  def create_initial_availability
    # Создаем доступность на 30 дней вперед
    30.times do |i|
      tour_availabilities.create!(
        date: Date.today + i.days,
        available_slots: max_participants,
        available: true
      )
    end
  end
end

