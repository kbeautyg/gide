class User < ApplicationRecord
  # Devise modules
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  # Роли (enum)
  enum role: {
    super_admin: 0,
    admin: 1,
    super_manager: 2,
    manager: 3,
    exchanger: 4,
    client: 5
  }

  # Иерархия (self-referencing association)
  belongs_to :parent, class_name: 'User', optional: true
  has_many :children, class_name: 'User', foreign_key: 'parent_id', dependent: :nullify

  # Баланс
  has_one :balance, dependent: :destroy
  after_create :create_balance!

  # Транзакции (как менеджер)
  has_many :managed_transactions, class_name: 'Transaction', foreign_key: 'manager_id', dependent: :destroy
  
  # Транзакции (как клиент)
  has_many :client_transactions, class_name: 'Transaction', foreign_key: 'client_id', dependent: :nullify

  # Платежные формы
  has_many :payment_forms, foreign_key: 'manager_id', dependent: :destroy

  # Заявки на вывод (как админ)
  has_many :withdrawal_requests, foreign_key: 'admin_id', dependent: :destroy

  # Заявки обменников
  has_many :exchanger_requests, foreign_key: 'exchanger_id', dependent: :destroy

  # Кошельки
  has_many :wallets, dependent: :destroy
  has_many :wallet_histories, dependent: :destroy

  # Экскурсии (как менеджер/гид)
  has_many :tours, foreign_key: 'manager_id', dependent: :destroy

  # Бронирования (как клиент)
  has_many :bookings, foreign_key: 'client_id', dependent: :destroy

  # Отзывы (как клиент)
  has_many :reviews, foreign_key: 'client_id', dependent: :destroy

  # Кэшбук-карта (только для клиентов)
  has_one :cashbook_card, foreign_key: 'client_id', dependent: :destroy

  # Валидации
  validates :phone, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true
  validates :role, presence: true
  validate :parent_role_validation

  # Скоупы
  scope :active, -> { where(active: true) }
  scope :by_role, ->(role) { where(role: role) }

  # Методы проверки ролей
  def super_admin?
    role == 'super_admin'
  end

  def admin?
    role == 'admin'
  end

  def super_manager?
    role == 'super_manager'
  end

  def manager?
    role == 'manager'
  end

  def exchanger?
    role == 'exchanger'
  end

  def client?
    role == 'client'
  end

  # Получить всех потомков в иерархии (рекурсивно)
  def all_descendants
    children + children.flat_map(&:all_descendants)
  end

  # Получить всех менеджеров в когорте
  def all_managers_in_cohort
    case role
    when 'super_admin'
      User.where(role: [:admin, :super_manager, :manager])
    when 'admin'
      all_descendants.select { |u| u.super_manager? || u.manager? }
    when 'super_manager'
      all_descendants.select { |u| u.manager? }
    else
      []
    end
  end

  # Проверка принадлежности к иерархии
  def in_hierarchy_of?(user)
    return true if self == user
    return false unless parent
    parent == user || parent.in_hierarchy_of?(user)
  end

  # Создать код приглашения
  def generate_invitation_code
    self.invitation_code = SecureRandom.hex(4).upcase
    save
  end

  # Полное имя или email
  def display_name
    full_name.presence || email
  end

  private

  def parent_role_validation
    return if parent.nil?
    
    case role
    when 'admin'
      errors.add(:parent, 'должен быть Супер-Админом') unless parent.super_admin?
    when 'super_manager'
      errors.add(:parent, 'должен быть Админом') unless parent.admin?
    when 'manager'
      errors.add(:parent, 'должен быть Админом или Супер-Менеджером') unless parent.admin? || parent.super_manager?
    end
  end

  def create_balance!
    Balance.create!(user: self) unless balance.present?
  end
end

