class DashboardController < ApplicationController
  def index
    @user = current_user
    
    case @user.role
    when 'super_admin'
      render :super_admin_dashboard
    when 'admin'
      render :admin_dashboard
    when 'super_manager'
      render :super_manager_dashboard
    when 'manager'
      render :manager_dashboard
    when 'exchanger'
      render :exchanger_dashboard
    when 'client'
      render :client_dashboard
    else
      render :default_dashboard
    end
  end

  private

  def dashboard_stats
    case current_user.role
    when 'super_admin'
      super_admin_stats
    when 'admin'
      admin_stats
    when 'manager'
      manager_stats
    else
      {}
    end
  end

  def super_admin_stats
    {
      total_balance: User.joins(:balance).sum('balances.balance_rub'),
      today_transactions: Transaction.today.completed.count,
      pending_withdrawals: WithdrawalRequest.pending.count,
      total_commission: Transaction.this_month.completed.sum(:commission_rub)
    }
  end

  def admin_stats
    managers = current_user.all_managers_in_cohort
    {
      balance: current_user.balance.balance_rub,
      today_transactions: Transaction.where(manager: managers).today.completed.count,
      pending_withdrawals: current_user.withdrawal_requests.pending.count,
      month_revenue: Transaction.where(manager: managers).this_month.completed.sum(:amount_rub)
    }
  end

  def manager_stats
    {
      balance: current_user.balance.balance_rub,
      today_transactions: current_user.managed_transactions.today.completed.count,
      active_forms: current_user.payment_forms.active.count,
      month_revenue: current_user.managed_transactions.this_month.completed.sum(:amount_rub)
    }
  end
end

