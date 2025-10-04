class WithdrawalRequest < ApplicationRecord
  belongs_to :admin, class_name: 'User'
  belongs_to :processed_by, class_name: 'User', optional: true
  belongs_to :exchanger_request, optional: true

  # Статусы
  enum status: {
    pending: 0,
    approved: 1,
    in_progress: 2,
    completed: 3,
    rejected: 4
  }

  # Валидации
  validates :amount_rub, :amount_usd, :exchange_rate, presence: true
  validates :amount_rub, :amount_usd, numericality: { greater_than: 0 }
  validates :wallet_trc20, presence: true, format: { with: /\AT[A-Za-z1-9]{33}\z/, message: 'неверный формат TRC20' }

  # Callbacks
  before_validation :calculate_withdrawal, on: :create
  after_create :freeze_admin_balance
  after_update :handle_status_change, if: :saved_change_to_status?

  # Скоупы
  scope :recent, -> { order(created_at: :desc) }
  scope :by_status, ->(status) { where(status: status) }
  scope :pending_approval, -> { where(status: :pending) }

  # Одобрить заявку
  def approve!(super_admin)
    return false unless pending?
    
    update!(
      status: :approved,
      processed_by: super_admin,
      processed_at: Time.current
    )
  end

  # Отклонить заявку
  def reject!(super_admin, reason)
    return false unless pending?
    
    transaction do
      update!(
        status: :rejected,
        processed_by: super_admin,
        processed_at: Time.current,
        rejection_reason: reason
      )
      unfreeze_admin_balance
    end
  end

  # Отметить как выполненную
  def mark_completed!
    update!(status: :completed)
  end

  private

  def calculate_withdrawal
    return if amount_rub.blank?

    # Получаем курс Rapira + 0.2% комиссия обменника
    rapira_rate = ExchangeRate.global_rate&.usd_to_rub || 91.50
    self.exchange_rate = rapira_rate + (rapira_rate * 0.002) # +0.2%

    # Общая комиссия 3%
    self.commission_rub = (amount_rub * 0.03).round(2)
    self.service_commission_rub = (amount_rub * 0.028).round(2) # 2.8%
    self.exchanger_commission_rub = (amount_rub * 0.002).round(2) # 0.2%

    # Сумма к конвертации (за вычетом комиссии)
    amount_to_convert = amount_rub - commission_rub
    self.amount_usd = (amount_to_convert / exchange_rate).round(2)
  end

  def freeze_admin_balance
    admin.balance.freeze_rub(amount_rub)
  end

  def unfreeze_admin_balance
    admin.balance.unfreeze_rub(amount_rub)
  end

  def handle_status_change
    case status.to_sym
    when :rejected
      unfreeze_admin_balance
    when :completed
      admin.balance.deduct_frozen_rub(amount_rub)
    end
  end
end

