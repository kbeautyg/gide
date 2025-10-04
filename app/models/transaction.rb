class Transaction < ApplicationRecord
  belongs_to :manager, class_name: 'User'
  belongs_to :client, class_name: 'User', optional: true
  belongs_to :payment_form, optional: true

  # Статусы (🔧 ИСПРАВЛЕНИЕ БАГА)
  enum status: {
    pending: 0,
    processing: 1,
    completed: 2,
    declined: 3,
    failed: 4
  }

  # Валидации
  validates :amount_rub, :amount_foreign, :exchange_rate, presence: true
  validates :amount_rub, :amount_foreign, numericality: { greater_than: 0 }
  validates :target_currency, inclusion: { in: %w[USD THB] }

  # Callbacks
  before_validation :calculate_amounts, on: :create
  before_validation :generate_qr_token, on: :create, if: -> { qr_code_token.blank? }
  after_create :update_manager_balance, if: :completed?
  after_update :update_manager_balance, if: :saved_change_to_status?

  # Скоупы
  scope :recent, -> { order(created_at: :desc) }
  scope :by_manager, ->(manager_id) { where(manager_id: manager_id) }
  scope :by_status, ->(status) { where(status: status) }
  scope :today, -> { where('created_at >= ?', Time.zone.now.beginning_of_day) }
  scope :this_month, -> { where('created_at >= ?', Time.zone.now.beginning_of_month) }

  # Генерация QR-кода
  def generate_qr_token
    self.qr_code_token = SecureRandom.urlsafe_base64(32)
  end

  # URL для оплаты
  def payment_url
    "#{ENV['APP_BACKEND_URL']}/pay/#{qr_code_token}"
  end

  # Обработка успешной оплаты
  def mark_as_completed!
    update!(status: :completed)
    update_manager_balance
  end

  # Обработка отмены
  def mark_as_declined!(reason = nil)
    update!(
      status: :declined,
      metadata: metadata.merge(decline_reason: reason)
    )
  end

  private

  def calculate_amounts
    return if amount_rub.blank? || target_currency.blank?

    # Получаем эффективный курс (с учетом объемных)
    rate = VolumeRate.effective_rate_for_amount(amount_rub, manager)
    
    self.exchange_rate = case target_currency
    when 'USD' then rate.rub_to_usd
    when 'THB' then rate.rub_to_thb
    end

    self.amount_foreign = (amount_rub * exchange_rate).round(2)
    self.commission_rub = (amount_rub * (commission_percentage / 100.0)).round(2)
  end

  def update_manager_balance
    return unless completed? && saved_change_to_status?
    
    # Начисляем комиссию менеджеру (точнее, его админу)
    admin = find_manager_admin
    return unless admin

    admin.balance.add_rub(commission_rub)
  end

  def find_manager_admin
    current = manager
    while current.present?
      return current if current.admin?
      current = current.parent
    end
    nil
  end
end

