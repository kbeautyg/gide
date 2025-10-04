Rails.application.routes.draw do
  # Devise для аутентификации (используем дефолтные контроллеры)
  devise_for :users

  # Главная страница
  root "dashboard#index"

  # Dashboard для разных ролей
  get 'dashboard', to: 'dashboard#index'

  # Manager namespace
  namespace :manager do
    get 'dashboard', to: 'dashboard#index'
    resources :payment_links, only: [:index, :new, :create, :show]
    resources :transactions, only: [:index, :show]
  end

  # Admin namespace (простой пока)
  namespace :admin do
    get 'dashboard', to: 'dashboard#index'
    resources :users, only: [:index, :show]
    resources :transactions, only: [:index, :show]
  end

  # Client namespace
  namespace :client do
    get 'dashboard', to: 'dashboard#index'
  end

  # Публичные платежные страницы
  get 'pay/:token', to: 'payments#show', as: :pay
  post 'pay/:token', to: 'payments#process', as: :process_payment
  get 'pay/:token/success', to: 'payments#success', as: :payment_success

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end