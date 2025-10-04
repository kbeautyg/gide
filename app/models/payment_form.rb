class PaymentForm < ApplicationRecord
  belongs_to :manager, class_name: 'User'
  has_many :transactions, dependent: :nullify

  # Валидации
  validates :name, :amount_rub, :target_currency, presence: true
  validates :amount_rub, numericality: { greater_than: 0 }
  validates :target_currency, inclusion: { in: %w[USD THB] }
  validates :token, presence: true, uniqueness: true
  validates :max_uses, numericality: { greater_than: 0 }
  validate :uses_count_less_than_max

  # Callbacks
  before_validation :generate_token, on: :create
  before_validation :set_fixed_rate, if: -> { !use_current_rate? && fixed_rate.blank? }

  # Скоупы
  scope :active, -> { where(active: true, archived: false) }
  scope :by_manager, ->(manager_id) { where(manager_id: manager_id) }
  scope :not_expired, -> { where('expires_at IS NULL OR expires_at > ?', Time.current) }
  scope :available, -> { active.not_expired.where('uses_count < max_uses') }

  # URL для оплаты
  def payment_url
    "#{ENV['APP_BACKEND_URL']}/pay/#{token}"
  end

  # QR-код
  def qr_code_svg(size: 300)
    require 'rqrcode'
    qr = RQRCode::QRCode.new(payment_url)
    qr.as_svg(
      offset: 0,
      color: '000',
      shape_rendering: 'crispEdges',
      module_size: size / qr.modules.size
    )
  end

  # Проверка доступности
  def available?
    active? && !archived? && uses_count < max_uses && !expired?
  end

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  # Увеличить счетчик использований
  def increment_uses!
    increment!(:uses_count)
    deactivate_if_reached_limit
  end

  # Архивировать
  def archive!
    update!(archived: true, active: false)
  end

  # Статистика
  def total_revenue
    transactions.completed.sum(:amount_rub)
  end

  def total_commission
    transactions.completed.sum(:commission_rub)
  end

  private

  def generate_token
    self.token = SecureRandom.urlsafe_base64(16)
  end

  def set_fixed_rate
    rate = ExchangeRate.current_for_user(manager)
    self.fixed_rate = case target_currency
    when 'USD' then rate.rub_to_usd
    when 'THB' then rate.rub_to_thb
    end
  end

  def uses_count_less_than_max
    return if uses_count.nil? || max_uses.nil?
    errors.add(:uses_count, 'не может превышать максимум') if uses_count > max_uses
  end

  def deactivate_if_reached_limit
    update!(active: false) if uses_count >= max_uses
  end
end

