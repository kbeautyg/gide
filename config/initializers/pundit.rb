# Pundit authorization configuration
module PunditHelper
  extend ActiveSupport::Concern

  included do
    include Pundit::Authorization
    
    rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized

    private

    def user_not_authorized
      flash[:alert] = "У вас нет прав для выполнения этого действия."
      redirect_to(request.referrer || root_path)
    end
  end
end

# Include Pundit in ApplicationController
ActiveSupport.on_load(:action_controller) do
  include PunditHelper
end

