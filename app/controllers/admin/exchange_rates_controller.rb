module Admin
  class ExchangeRatesController < ApplicationController
    before_action :ensure_super_admin

    def index
      @exchange_rates = ExchangeRate.order(created_at: :desc).page(params[:page])
      @current_rate = ExchangeRate.global_rate
    end

    def new
      @exchange_rate = ExchangeRate.new
    end

    def create
      @exchange_rate = ExchangeRate.new(exchange_rate_params)
      @exchange_rate.created_by = current_user

      if @exchange_rate.save
        redirect_to admin_exchange_rates_path, notice: 'Курс обновлен'
      else
        render :new, status: :unprocessable_entity
      end
    end

    def update_from_rapira
      # TODO: Implement Rapira API integration
      redirect_to admin_exchange_rates_path, notice: 'Курсы обновлены с Rapira API'
    end

    private

    def ensure_super_admin
      redirect_to root_path, alert: 'Только для супер-админа' unless current_user.super_admin?
    end

    def exchange_rate_params
      params.require(:exchange_rate).permit(:rub_to_usd, :rub_to_thb, :usd_to_rub, :thb_to_rub, :source)
    end
  end
end

