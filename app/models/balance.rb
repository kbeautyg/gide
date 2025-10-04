class Balance < ApplicationRecord
  belongs_to :user

  # Валидации
  validates :balance_rub, :balance_usd, :balance_thb, numericality: { greater_than_or_equal_to: 0 }
  validates :frozen_rub, :frozen_usd, numericality: { greater_than_or_equal_to: 0 }

  # Доступный баланс (не замороженный)
  def available_rub
    balance_rub - frozen_rub
  end

  def available_usd
    balance_usd - frozen_usd
  end

  # Пополнить баланс
  def add_rub(amount)
    increment!(:balance_rub, amount)
    increment!(:total_earned, amount)
  end

  def add_usd(amount)
    increment!(:balance_usd, amount)
  end

  def add_thb(amount)
    increment!(:balance_thb, amount)
  end

  # Списать баланс
  def deduct_rub(amount)
    return false if available_rub < amount
    decrement!(:balance_rub, amount)
    true
  end

  def deduct_usd(amount)
    return false if available_usd < amount
    decrement!(:balance_usd, amount)
    true
  end

  def deduct_thb(amount)
    return false if balance_thb < amount
    decrement!(:balance_thb, amount)
    true
  end

  # Заморозить средства
  def freeze_rub(amount)
    return false if available_rub < amount
    increment!(:frozen_rub, amount)
    true
  end

  def freeze_usd(amount)
    return false if available_usd < amount
    increment!(:frozen_usd, amount)
    true
  end

  # Разморозить средства
  def unfreeze_rub(amount)
    decrement!(:frozen_rub, [frozen_rub, amount].min)
  end

  def unfreeze_usd(amount)
    decrement!(:frozen_usd, [frozen_usd, amount].min)
  end

  # Перевести из замороженных в списанные
  def deduct_frozen_rub(amount)
    amount_to_deduct = [frozen_rub, amount].min
    decrement!(:frozen_rub, amount_to_deduct)
    decrement!(:balance_rub, amount_to_deduct)
    increment!(:total_withdrawn, amount_to_deduct)
    true
  end
end

