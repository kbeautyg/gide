class ApplicationController < ActionController::Base
  include Pundit::Authorization
  
  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?

  # Pundit: обработка ошибок доступа
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

  # Локаль по умолчанию
  before_action :set_locale

  # Хелпер для текущего пользователя
  helper_method :current_user

  private

  def set_locale
    I18n.locale = :ru
  end

  def user_not_authorized
    flash[:alert] = "У вас нет прав для выполнения этого действия."
    redirect_to(request.referrer || root_path)
  end

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:phone, :full_name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:phone, :full_name])
  end

  # Редирект после входа в зависимости от роли
  def after_sign_in_path_for(resource)
    dashboard_path
  end
end

