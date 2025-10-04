class PaymentsController < ApplicationController
  skip_before_action :authenticate_user!, only: [:show, :process]

  def show
    @payment_link = PaymentLink.find_by!(token: params[:token])
    
    if @payment_link.completed?
      render :already_paid
    elsif @payment_link.expired?
      render :expired
    end
  end

  def process
    @payment_link = PaymentLink.find_by!(token: params[:token])
    
    if @payment_link.completed?
      redirect_to pay_path(@payment_link.token), alert: 'Ссылка уже оплачена'
      return
    end

    # Создаем транзакцию
    transaction = Transaction.create!(
      manager: @payment_link.manager,
      payment_link: @payment_link,
      amount_from: @payment_link.amount_from,
      amount_to: @payment_link.amount_to,
      rate: @payment_link.rate,
      currency_from: @payment_link.currency_from,
      currency_to: @payment_link.currency_to,
      status: :completed,
      client_name: params[:client_name],
      client_phone: params[:client_phone]
    )

    # Отмечаем ссылку как оплаченную
    @payment_link.mark_paid!(transaction)

    redirect_to payment_success_path(@payment_link.token), notice: 'Оплата прошла успешно!'
  end

  def success
    @payment_link = PaymentLink.find_by!(token: params[:token])
  end
end
