class Review < ApplicationRecord
  belongs_to :tour
  belongs_to :client, class_name: 'User'
  belongs_to :booking
  belongs_to :approved_by, class_name: 'User', optional: true

  # Валидации
  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :client_id, uniqueness: { scope: :tour_id, message: 'уже оставил отзыв на эту экскурсию' }

  # Callbacks
  after_create :update_tour_rating
  after_update :update_tour_rating, if: :saved_change_to_approved?
  after_destroy :update_tour_rating

  # Скоупы
  scope :approved, -> { where(approved: true) }
  scope :pending_approval, -> { where(approved: false) }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_rating, ->(rating) { where(rating: rating) }
  scope :with_comments, -> { where.not(comment: [nil, '']) }

  # Одобрить отзыв
  def approve!(admin)
    update!(
      approved: true,
      approved_at: Time.current,
      approved_by: admin
    )
  end

  # Ответ гида
  def respond!(guide, response_text)
    update!(
      guide_response: response_text,
      guide_responded_at: Time.current
    )
  end

  # Рейтинг в звездах (для UI)
  def stars
    '★' * rating + '☆' * (5 - rating)
  end

  private

  def update_tour_rating
    tour.update_rating!
  end
end

