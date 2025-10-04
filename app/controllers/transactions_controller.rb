class TransactionsController < ApplicationController
  def index
    @transactions = current_user.managed_transactions.recent.page(params[:page])
  end

  def show
    @transaction = Transaction.find(params[:id])
  end

  def new
    @transaction = Transaction.new
  end

  def create
    @transaction = Transaction.new(transaction_params)
    @transaction.manager = current_user

    if @transaction.save
      redirect_to @transaction, notice: 'Транзакция успешно создана'
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def transaction_params
    params.require(:transaction).permit(:amount_rub, :target_currency, :description)
  end
end

