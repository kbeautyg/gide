Rails.application.routes.draw do
  # Devise
  devise_for :users

  # Главная
  root "dashboard#index"
  get 'dashboard', to: 'dashboard#index'

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end