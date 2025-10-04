class ExchangerRequest < ApplicationRecord
  belongs_to :exchanger, class_name: 'User'
  belongs_to :created_by, class_name: 'User'
  has_many :withdrawal_requests, dependent: :nullify

  # Статусы
  enum status: {
    pending: 0,
    in_progress: 1,
    completed: 2
  }

  # Валидации
  validates :total_amount_rub, :total_amount_usd, presence: true
  validates :total_amount_rub, :total_amount_usd, numericality: { greater_than: 0 }

  # Скоупы
  scope :recent, -> { order(created_at: :desc) }
  scope :by_exchanger, ->(exchanger_id) { where(exchanger_id: exchanger_id) }
  scope :unpaid, -> { where('debt_remaining > 0') }

  # Создать общую заявку из нескольких withdrawal_requests
  def self.create_from_withdrawals(exchanger, withdrawal_ids, super_admin)
    withdrawals = WithdrawalRequest.where(id: withdrawal_ids, status: :approved)
    return nil if withdrawals.empty?

    total_rub = withdrawals.sum(:amount_rub)
    total_usd = withdrawals.sum(:amount_usd)

    transaction do
      request = create!(
        exchanger: exchanger,
        created_by: super_admin,
        total_amount_rub: total_rub,
        total_amount_usd: total_usd,
        requests_count: withdrawals.count,
        debt_remaining: total_rub
      )

      withdrawals.each do |wr|
        wr.update!(exchanger_request: request, status: :in_progress)
      end

      request
    end
  end

  # Отметить как выполненную обменником
  def mark_completed_by_exchanger!
    return false unless pending?
    
    transaction do
      update!(status: :completed, completed_at: Time.current)
      withdrawal_requests.each(&:mark_completed!)
      
      # Начисляем комиссию обменнику
      commission = withdrawal_requests.sum(:exchanger_commission_rub)
      exchanger.balance.add_rub(commission)
    end
  end

  # Погасить долг
  def repay_debt!(amount_rub, super_admin)
    return false if debt_remaining <= 0
    
    amount = [amount_rub, debt_remaining].min
    decrement!(:debt_remaining, amount)
    
    # Логируем погашение
    update!(notes: "#{notes}\n#{Time.current}: Погашено #{amount} RUB супер-админом #{super_admin.display_name}")
  end

  # Проверка, полностью ли погашен долг
  def fully_paid?
    debt_remaining <= 0
  end
end

