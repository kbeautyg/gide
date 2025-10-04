class Manager::PaymentLinksController < ApplicationController
  before_action :authenticate_user!
  before_action :ensure_manager!

  def index
    @payment_links = current_user.payment_links.order(created_at: :desc)
  end

  def new
    @payment_link = PaymentLink.new
    @rate = ExchangeRate.last
  end

  def create
    @payment_link = current_user.payment_links.build(payment_link_params)
    
    if @payment_link.save
      redirect_to manager_payment_links_path, notice: "Платежная ссылка создана: #{@payment_link.public_url}"
    else
      @rate = ExchangeRate.last
      render :new, status: :unprocessable_entity
    end
  end

  def show
    @payment_link = current_user.payment_links.find(params[:id])
  end

  private

  def ensure_manager!
    redirect_to root_path, alert: 'Доступ запрещен' unless current_user.manager?
  end

  def payment_link_params
    params.require(:payment_link).permit(:amount_from, :rate, :currency_from, :currency_to, :client_name, :client_phone, :note)
  end
end
