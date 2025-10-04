class Manager::DashboardController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_manager!

  def index
    @payment_links = current_user.payment_links.order(created_at: :desc).limit(10)
    @transactions = current_user.managed_transactions.order(created_at: :desc).limit(10)
    @stats = {
      total_links: current_user.payment_links.count,
      active_links: current_user.payment_links.active_links.count,
      total_transactions: current_user.managed_transactions.count,
      completed_transactions: current_user.managed_transactions.where(status: :completed).count
    }
  end

  private

  def ensure_manager!
    redirect_to root_path, alert: 'Доступ запрещен' unless current_user.manager?
  end
end
