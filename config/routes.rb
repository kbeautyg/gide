Rails.application.routes.draw do
  # Devise для аутентификации (используем дефолтные контроллеры)
  devise_for :users

  # Главная страница
  root "dashboard#index"

  # Dashboard для разных ролей
  get 'dashboard', to: 'dashboard#index'

  # Административная панель (супер-админ)
  namespace :admin do
    resources :users do
      member do
        post :reassign_manager
        put :change_role
      end
    end
    resources :exchange_rates do
      collection do
        post :update_from_rapira
      end
    end
    resources :volume_rates
    resources :withdrawal_requests do
      member do
        put :approve
        put :reject
      end
    end
    resources :exchanger_requests do
      member do
        put :complete
        put :mark_paid
      end
    end
    resources :debts do
      member do
        post :repay
      end
    end
    get 'statistics', to: 'statistics#index'
  end

  # Транзакции обмена валют
  resources :transactions, only: [:index, :show, :new, :create] do
    collection do
      post :generate_qr
      get :payment_form
    end
    member do
      get :qr_code
      get :receipt
    end
  end

  # Статичные платежные формы
  resources :payment_forms do
    member do
      get :qr_code
      post :archive
      get :statistics
    end
    collection do
      get :my_forms
    end
  end

  # Публичный endpoint для оплаты через форму
  get 'pay/:token', to: 'payments#show', as: :public_payment
  post 'pay/:token', to: 'payments#process', as: :process_payment

  # Заявки на вывод (для админов)
  resources :withdrawal_requests, only: [:index, :show, :new, :create]

  # Кошельки TRC20
  resources :wallets, only: [:index, :show, :new, :create, :edit, :update] do
    member do
      get :history
    end
  end

  # Статистика для менеджеров
  get 'statistics', to: 'statistics#index'

  # === МАРКЕТПЛЕЙС ЭКСКУРСИЙ (ПРИОРИТЕТ 3) ===
  
  # Публичный каталог экскурсий
  get 'tours/catalog', to: 'tours#catalog', as: :tours_catalog
  
  # CRUD экскурсий (для менеджеров/гидов)
  resources :tours do
    member do
      get :calendar
      post :toggle_availability
    end
    resources :reviews, only: [:index, :show]
  end

  # Бронирования
  resources :bookings do
    member do
      put :confirm
      put :cancel
      get :voucher
    end
  end

  # Отзывы (клиенты)
  resources :reviews, only: [:create, :edit, :update, :destroy]

  # Кэшбук-карты (ПРИОРИТЕТ 4)
  resource :cashbook_card, only: [:show] do
    post :top_up
    get :transactions
  end

  # API endpoints для внешних интеграций
  namespace :api do
    namespace :v1 do
      resources :transactions, only: [:create, :show]
      post 'webhooks/payment', to: 'webhooks#payment'
      post 'webhooks/telegram', to: 'webhooks#telegram'
    end
  end

  # Sidekiq Web UI (только для супер-админа)
  # TODO: Раскомментировать когда добавим Sidekiq обратно
  # require 'sidekiq/web'
  # authenticate :user, ->(user) { user.super_admin? } do
  #   mount Sidekiq::Web => '/sidekiq'
  # end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end

