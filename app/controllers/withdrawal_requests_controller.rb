class WithdrawalRequestsController < ApplicationController
  before_action :ensure_admin

  def index
    @withdrawal_requests = current_user.withdrawal_requests.order(created_at: :desc)
  end

  def show
    @withdrawal_request = current_user.withdrawal_requests.find(params[:id])
  end

  def new
    @withdrawal_request = WithdrawalRequest.new
  end

  def create
    @withdrawal_request = current_user.withdrawal_requests.build(withdrawal_request_params)

    if @withdrawal_request.save
      redirect_to @withdrawal_request, notice: 'Заявка на вывод создана'
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def ensure_admin
    redirect_to root_path, alert: 'Только для админов' unless current_user.admin?
  end

  def withdrawal_request_params
    params.require(:withdrawal_request).permit(:amount_rub, :wallet_trc20, :admin_notes)
  end
end

