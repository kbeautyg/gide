class StatisticsController < ApplicationController
  def index
    @stats = calculate_statistics
  end

  private

  def calculate_statistics
    case current_user.role
    when 'super_admin'
      super_admin_statistics
    when 'admin'
      admin_statistics
    when 'manager'
      manager_statistics
    else
      {}
    end
  end

  def super_admin_statistics
    {
      total_users: User.count,
      total_transactions: Transaction.count,
      total_revenue: Transaction.completed.sum(:amount_rub),
      total_commission: Transaction.completed.sum(:commission_rub)
    }
  end

  def admin_statistics
    managers = current_user.all_managers_in_cohort
    {
      managers_count: managers.count,
      transactions_count: Transaction.where(manager: managers).count,
      revenue: Transaction.where(manager: managers).completed.sum(:amount_rub)
    }
  end

  def manager_statistics
    {
      transactions_count: current_user.managed_transactions.count,
      revenue: current_user.managed_transactions.completed.sum(:amount_rub),
      commission: current_user.managed_transactions.completed.sum(:commission_rub)
    }
  end
end

