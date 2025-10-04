class DashboardController < ApplicationController
  before_action :authenticate_user!

  def index
    # Просто показываем дашборд
  end
end