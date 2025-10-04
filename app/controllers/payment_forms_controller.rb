class PaymentFormsController < ApplicationController
  def index
    @payment_forms = current_user.payment_forms.order(created_at: :desc)
  end

  def show
    @payment_form = PaymentForm.find(params[:id])
  end

  def new
    @payment_form = PaymentForm.new
  end

  def create
    @payment_form = current_user.payment_forms.build(payment_form_params)

    if @payment_form.save
      redirect_to @payment_form, notice: 'Платежная форма успешно создана'
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def payment_form_params
    params.require(:payment_form).permit(:name, :amount_rub, :target_currency, :max_uses, :expires_at, :description)
  end
end

