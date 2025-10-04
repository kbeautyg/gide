class Wallet < ApplicationRecord
  belongs_to :user
  belongs_to :verified_by, class_name: 'User', optional: true

  # Валидации
  validates :address, presence: true
  validates :address, format: { 
    with: /\AT[A-Za-z1-9]{33}\z/, 
    message: 'неверный формат TRC20 адреса' 
  }
  validate :user_has_one_active_wallet

  # Callbacks
  after_create :log_wallet_creation
  before_update :log_wallet_change, if: :will_save_change_to_address?

  # Скоупы
  scope :active, -> { where(active: true) }
  scope :verified, -> { where(verified: true) }
  scope :by_user, ->(user_id) { where(user_id: user_id) }

  # Верифицировать кошелек
  def verify!(admin)
    update!(
      verified: true,
      verified_at: Time.current,
      verified_by: admin
    )
  end

  # Деактивировать
  def deactivate!
    update!(active: false)
  end

  private

  def user_has_one_active_wallet
    return unless active?
    
    existing = Wallet.active.where(user: user).where.not(id: id)
    errors.add(:base, 'У пользователя может быть только один активный кошелек') if existing.exists?
  end

  def log_wallet_creation
    WalletHistory.create!(
      user: user,
      old_address: nil,
      new_address: address,
      action: 'create',
      reason: 'Новый кошелек создан'
    )
  end

  def log_wallet_change
    WalletHistory.create!(
      user: user,
      old_address: address_was,
      new_address: address,
      action: 'update',
      reason: 'Адрес кошелька изменен'
    )
  end
end

