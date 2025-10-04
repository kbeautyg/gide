class DashboardController < ApplicationController
  before_action :authenticate_user!

  def index
    case current_user.role
    when 'admin'
      redirect_to admin_dashboard_path
    when 'manager'
      redirect_to manager_dashboard_path
    when 'client'
      redirect_to client_dashboard_path
    end
  end
end